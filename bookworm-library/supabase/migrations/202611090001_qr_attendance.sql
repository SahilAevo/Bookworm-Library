-- Trusted QR attendance operations. Apply after schema.sql.
-- The UUID token is a random bearer secret; only its SHA-256 hash is persisted.
ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS check_in_request_id UUID,
  ADD COLUMN IF NOT EXISTS check_out_request_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS attendance_checkin_request_uidx
  ON public.attendance(check_in_request_id) WHERE check_in_request_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS attendance_checkout_request_uidx
  ON public.attendance(check_out_request_id) WHERE check_out_request_id IS NOT NULL;

ALTER TABLE public.attendance_audit_logs DROP CONSTRAINT IF EXISTS attendance_audit_logs_action_check;
ALTER TABLE public.attendance_audit_logs ADD CONSTRAINT attendance_audit_logs_action_check
  CHECK (action IN ('admin_close','attendance_correction','seat_correction','student_check_in','student_check_out'));

CREATE OR REPLACE FUNCTION public.attendance_student_context()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE s public.students%ROWTYPE; lib public.libraries%ROWTYPE; visit public.attendance%ROWTYPE;
  shift_id UUID; full_shift BOOLEAN := FALSE; seats JSONB := '[]'::jsonb;
BEGIN
  SELECT * INTO s FROM public.students WHERE auth_user_id = auth.uid() LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'student_profile_missing'; END IF;
  SELECT * INTO lib FROM public.libraries WHERE id=s.library_id AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'library_inactive'; END IF;
  SELECT sh.id, sh.is_full_shift INTO shift_id, full_shift
    FROM public.membership_subscriptions ms JOIN public.membership_plans mp ON mp.library_id=ms.library_id AND mp.id=ms.plan_id
    LEFT JOIN public.shifts sh ON sh.library_id=mp.library_id AND sh.id=mp.shift_id
    WHERE ms.library_id=s.library_id AND ms.student_id=s.id AND ms.status='active'
      AND (ms.start_date IS NULL OR ms.start_date <= CURRENT_DATE)
      AND (ms.end_date IS NULL OR ms.end_date >= CURRENT_DATE)
    ORDER BY ms.end_date DESC NULLS LAST LIMIT 1;
  IF s.status <> 'active' OR s.application_status <> 'approved' OR NOT EXISTS (
    SELECT 1 FROM public.membership_subscriptions ms WHERE ms.library_id=s.library_id AND ms.student_id=s.id AND ms.status='active'
      AND (ms.start_date IS NULL OR ms.start_date<=CURRENT_DATE) AND (ms.end_date IS NULL OR ms.end_date>=CURRENT_DATE)
  ) THEN
    RETURN jsonb_build_object('eligible',false,'message','An active approved membership is required.','library_id',s.library_id,'seating_mode',lib.seating_mode);
  END IF;
  SELECT * INTO visit FROM public.attendance WHERE library_id=s.library_id AND student_id=s.id AND check_out_at IS NULL LIMIT 1;
  IF lib.seating_mode='full_shift_reserved' AND visit.id IS NULL THEN
    IF full_shift THEN
      SELECT jsonb_build_array(jsonb_build_object('id',se.id,'seat_number',se.seat_number,'status','assigned')) INTO seats
      FROM public.seats se JOIN public.seat_allocations sa ON sa.library_id=se.library_id AND sa.seat_id=se.id
      WHERE se.library_id=s.library_id AND sa.student_id=s.id AND sa.status='active'
        AND CURRENT_DATE BETWEEN sa.allocated_from AND sa.allocated_to AND se.is_active
        AND NOT EXISTS (SELECT 1 FROM public.attendance a WHERE a.seat_id=se.id AND a.check_out_at IS NULL);
      seats := COALESCE(seats,'[]'::jsonb);
      IF seats='[]'::jsonb THEN RAISE EXCEPTION 'assigned_seat_unavailable'; END IF;
    ELSE
      SELECT COALESCE(jsonb_agg(jsonb_build_object('id',se.id,'seat_number',se.seat_number,'status','available') ORDER BY se.seat_number),'[]'::jsonb)
      INTO seats FROM public.seats se WHERE se.library_id=s.library_id AND se.is_active
        AND NOT EXISTS (SELECT 1 FROM public.seat_allocations sa WHERE sa.library_id=se.library_id AND sa.seat_id=se.id AND sa.status='active' AND CURRENT_DATE BETWEEN sa.allocated_from AND sa.allocated_to)
        AND NOT EXISTS (SELECT 1 FROM public.attendance a WHERE a.seat_id=se.id AND a.check_out_at IS NULL);
    END IF;
  END IF;
  RETURN jsonb_build_object('eligible',true,'student_id',s.id,'library_id',s.library_id,'seating_mode',lib.seating_mode,
    'active_visit',CASE WHEN visit.id IS NULL THEN NULL ELSE jsonb_build_object('id',visit.id,'check_in_at',visit.check_in_at,'seat_id',visit.seat_id) END,
    'requires_seat',lib.seating_mode='full_shift_reserved' AND visit.id IS NULL,'is_full_shift',full_shift,'seats',seats);
END; $$;

CREATE OR REPLACE FUNCTION public.attendance_scan(p_token UUID, p_request_id UUID, p_seat_id UUID DEFAULT NULL)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE s public.students%ROWTYPE; lib public.libraries%ROWTYPE; qr public.attendance_qr_tokens%ROWTYPE;
  visit public.attendance%ROWTYPE; allocation public.seat_allocations%ROWTYPE; sh_full BOOLEAN := FALSE; rid UUID;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  IF p_request_id IS NULL OR p_token IS NULL THEN RAISE EXCEPTION 'invalid_request'; END IF;
  SELECT * INTO s FROM public.students WHERE auth_user_id=auth.uid() LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'student_profile_missing'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(s.id::text,0));
  SELECT * INTO qr FROM public.attendance_qr_tokens WHERE token_hash=encode(extensions.digest(p_token::text,'sha256'),'hex')
    AND is_active AND revoked_at IS NULL AND expires_at > now() FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'qr_invalid_or_expired'; END IF;
  IF qr.library_id <> s.library_id THEN RAISE EXCEPTION 'qr_wrong_library'; END IF;
  IF EXISTS (SELECT 1 FROM public.attendance WHERE check_out_request_id=p_request_id) THEN
    SELECT id INTO rid FROM public.attendance WHERE check_out_request_id=p_request_id;
    RETURN jsonb_build_object('action','check_out','attendance_id',rid,'replayed',true);
  END IF;
  IF EXISTS (SELECT 1 FROM public.attendance WHERE check_in_request_id=p_request_id) THEN
    SELECT id INTO rid FROM public.attendance WHERE check_in_request_id=p_request_id;
    RETURN jsonb_build_object('action','check_in','attendance_id',rid,'replayed',true);
  END IF;
  SELECT * INTO lib FROM public.libraries WHERE id=s.library_id AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'library_inactive'; END IF;
  SELECT * INTO visit FROM public.attendance WHERE student_id=s.id AND library_id=s.library_id AND check_out_at IS NULL FOR UPDATE;
  IF FOUND THEN
    UPDATE public.attendance SET check_out_at=now(),check_out_method='student_scan',status='completed',check_out_request_id=p_request_id
      WHERE id=visit.id RETURNING * INTO visit;
    INSERT INTO public.attendance_audit_logs(library_id,attendance_id,action,performed_by,reason,new_values)
      VALUES(s.library_id,visit.id,'student_check_out',auth.uid(),'Student QR checkout',jsonb_build_object('check_out_at',visit.check_out_at));
    RETURN jsonb_build_object('action','check_out','attendance_id',visit.id,'check_in_at',visit.check_in_at,'check_out_at',visit.check_out_at,'seat_id',visit.seat_id);
  END IF;
  IF s.status <> 'active' OR s.application_status <> 'approved' THEN RAISE EXCEPTION 'student_inactive'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.membership_subscriptions ms WHERE ms.library_id=s.library_id AND ms.student_id=s.id AND ms.status='active'
    AND (ms.start_date IS NULL OR ms.start_date<=CURRENT_DATE) AND (ms.end_date IS NULL OR ms.end_date>=CURRENT_DATE)) THEN RAISE EXCEPTION 'membership_inactive'; END IF;
  IF lib.seating_mode='general' THEN
    IF p_seat_id IS NOT NULL THEN RAISE EXCEPTION 'seat_not_required'; END IF;
  ELSE
    SELECT sh.is_full_shift INTO sh_full FROM public.membership_subscriptions ms JOIN public.membership_plans mp ON mp.library_id=ms.library_id AND mp.id=ms.plan_id
      JOIN public.shifts sh ON sh.library_id=mp.library_id AND sh.id=mp.shift_id WHERE ms.library_id=s.library_id AND ms.student_id=s.id AND ms.status='active'
      AND (ms.start_date IS NULL OR ms.start_date<=CURRENT_DATE) AND (ms.end_date IS NULL OR ms.end_date>=CURRENT_DATE) LIMIT 1;
    IF p_seat_id IS NULL THEN RAISE EXCEPTION 'seat_required'; END IF;
    IF sh_full THEN
      SELECT * INTO allocation FROM public.seat_allocations WHERE library_id=s.library_id AND student_id=s.id AND seat_id=p_seat_id AND status='active'
        AND CURRENT_DATE BETWEEN allocated_from AND allocated_to;
      IF NOT FOUND THEN RAISE EXCEPTION 'assigned_seat_required'; END IF;
    ELSE
      IF EXISTS (SELECT 1 FROM public.seat_allocations WHERE library_id=s.library_id AND seat_id=p_seat_id AND status='active' AND CURRENT_DATE BETWEEN allocated_from AND allocated_to) THEN RAISE EXCEPTION 'seat_reserved'; END IF;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM public.seats WHERE id=p_seat_id AND library_id=s.library_id AND is_active) THEN RAISE EXCEPTION 'seat_unavailable'; END IF;
  END IF;
  INSERT INTO public.attendance(library_id,student_id,seat_id,check_in_request_id) VALUES(s.library_id,s.id,p_seat_id,p_request_id) RETURNING * INTO visit;
  INSERT INTO public.attendance_audit_logs(library_id,attendance_id,action,performed_by,reason,new_values)
    VALUES(s.library_id,visit.id,'student_check_in',auth.uid(),'Student QR check-in',jsonb_build_object('check_in_at',visit.check_in_at,'seat_id',visit.seat_id));
  RETURN jsonb_build_object('action','check_in','attendance_id',visit.id,'check_in_at',visit.check_in_at,'seat_id',visit.seat_id);
EXCEPTION WHEN unique_violation THEN RAISE EXCEPTION 'attendance_conflict';
END; $$;

CREATE OR REPLACE FUNCTION public.attendance_issue_qr(p_validity_hours INTEGER DEFAULT 24)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE lib_id UUID; token_id UUID; expiry TIMESTAMPTZ;
BEGIN
  SELECT library_id INTO lib_id FROM public.users WHERE id=auth.uid() AND role='admin' AND is_active;
  IF lib_id IS NULL THEN RAISE EXCEPTION 'staff_access_required'; END IF;
  IF p_validity_hours < 1 OR p_validity_hours > 168 THEN RAISE EXCEPTION 'validity_must_be_1_to_168_hours'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(lib_id::text,1));
  SELECT id,expires_at INTO token_id,expiry FROM public.attendance_qr_tokens
    WHERE library_id=lib_id AND is_active AND revoked_at IS NULL AND expires_at>now() LIMIT 1;
  IF FOUND THEN RETURN jsonb_build_object('token',token_id,'expires_at',expiry,'id',token_id); END IF;
  UPDATE public.attendance_qr_tokens SET is_active=FALSE,revoked_at=now(),revoked_by=auth.uid() WHERE library_id=lib_id AND is_active AND revoked_at IS NULL;
  token_id := gen_random_uuid(); expiry := now() + make_interval(hours=>p_validity_hours);
  INSERT INTO public.attendance_qr_tokens(id,library_id,token_hash,expires_at,created_by)
    VALUES(token_id,lib_id,encode(extensions.digest(token_id::text,'sha256'),'hex'),expiry,auth.uid());
  RETURN jsonb_build_object('token',token_id,'expires_at',expiry,'id',token_id);
END; $$;

CREATE OR REPLACE FUNCTION public.attendance_revoke_qr()
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE lib_id UUID;
BEGIN
  SELECT library_id INTO lib_id FROM public.users WHERE id=auth.uid() AND role='admin' AND is_active;
  IF lib_id IS NULL THEN RAISE EXCEPTION 'staff_access_required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(lib_id::text,1));
  UPDATE public.attendance_qr_tokens SET is_active=FALSE,revoked_at=now(),revoked_by=auth.uid() WHERE library_id=lib_id AND is_active AND revoked_at IS NULL;
  RETURN FOUND;
END; $$;

CREATE OR REPLACE FUNCTION public.attendance_admin_close(p_attendance_id UUID,p_reason TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE lib_id UUID; visit public.attendance%ROWTYPE;
BEGIN
  SELECT library_id INTO lib_id FROM public.users WHERE id=auth.uid() AND role='admin' AND is_active;
  IF lib_id IS NULL THEN RAISE EXCEPTION 'staff_access_required'; END IF;
  IF length(trim(COALESCE(p_reason,''))) < 4 THEN RAISE EXCEPTION 'correction_reason_required'; END IF;
  UPDATE public.attendance SET check_out_at=now(),check_out_method='admin',status='admin_closed',closed_by=auth.uid(),closure_reason=trim(p_reason)
    WHERE id=p_attendance_id AND library_id=lib_id AND check_out_at IS NULL RETURNING * INTO visit;
  IF NOT FOUND THEN RAISE EXCEPTION 'active_attendance_not_found'; END IF;
  INSERT INTO public.attendance_audit_logs(library_id,attendance_id,action,performed_by,reason,old_values,new_values)
    VALUES(lib_id,visit.id,'admin_close',auth.uid(),trim(p_reason),jsonb_build_object('status','currently_inside','check_out_at',NULL),jsonb_build_object('status',visit.status,'check_out_at',visit.check_out_at));
  RETURN TRUE;
END; $$;

REVOKE ALL ON FUNCTION public.attendance_student_context() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.attendance_scan(UUID,UUID,UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.attendance_issue_qr(INTEGER) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.attendance_revoke_qr() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.attendance_admin_close(UUID,TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.attendance_student_context() TO authenticated;
GRANT EXECUTE ON FUNCTION public.attendance_scan(UUID,UUID,UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.attendance_issue_qr(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.attendance_revoke_qr() TO authenticated;
GRANT EXECUTE ON FUNCTION public.attendance_admin_close(UUID,TEXT) TO authenticated;
