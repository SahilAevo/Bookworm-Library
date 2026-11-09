import { supabase } from '@/lib/supabase';

export interface AttendanceRecord {
  id: string; studentId: string; studentName: string; department: string; deskNo: string;
  shift: string; date: string; checkInTime: string; checkOutTime?: string;
  durationMinutes?: number; status: 'present' | 'checked_out' | 'late' | 'excused' | 'admin_closed';
  method: 'static_qr' | 'dynamic_qr'; qrCodeId: string;
}
export interface AttendanceSeat { id: string; seat_number: string; status: 'available' | 'assigned' }
export interface StudentAttendanceContext {
  eligible: boolean; message?: string; student_id?: string; library_id: string;
  seating_mode: 'general' | 'full_shift_reserved'; requires_seat: boolean;
  is_full_shift: boolean; active_visit: null | { id: string; check_in_at: string; seat_id: string | null };
  seats: AttendanceSeat[];
}
export interface QRToken { id: string; token: string; expires_at: string }
const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });

const prettyTime = (value?: string | null) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;
const asError = (error: any) => {
  const msg = String(error?.message || 'Attendance request failed.');
  const map: Record<string, string> = {
    qr_invalid_or_expired: 'This library QR is invalid, revoked, or expired.', qr_wrong_library: 'This QR belongs to another library.',
    student_inactive: 'Your student account is inactive or awaiting approval.', membership_inactive: 'An active membership is required to record attendance.',
    student_profile_missing: 'Your signed-in account is not linked to a student profile.', seat_required: 'Choose an available seat to check in.',
    assigned_seat_required: 'Full-shift members must use their permanently assigned seat.', seat_reserved: 'That seat is reserved for a full-shift member.',
    seat_unavailable: 'That seat is unavailable. Refresh the seat list and try again.', attendance_conflict: 'Attendance changed at the same time. Refresh your status and try again.',
    staff_access_required: 'Only authorized library staff can perform this action.', active_attendance_not_found: 'This attendance session is no longer active.',
    library_inactive: 'This library is currently unavailable.', assigned_seat_unavailable: 'Your assigned seat is currently occupied.',
  };
  for (const [key, value] of Object.entries(map)) if (msg.includes(key)) return new Error(value);
  return new Error(msg.replace(/^.*(?:P0001|raise exception).*?:\s*/i, '') || 'Attendance request failed.');
};
const unwrap = <T,>(result: { data: T | null; error: any }): T => { if (result.error) throw asError(result.error); return result.data as T; };

export const attendanceService = {
  async getStudentContext(): Promise<StudentAttendanceContext> {
    return unwrap(await supabase.rpc('attendance_student_context')) as StudentAttendanceContext;
  },
  async scan(token: string, seatId?: string) {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) throw new Error('Sign in to record attendance.');
    const result = await supabase.rpc('attendance_scan', {
      p_token: token.trim(), p_request_id: uuid(), p_seat_id: seatId || null,
    });
    return unwrap(result) as { action: 'check_in' | 'check_out'; attendance_id: string; check_in_at: string; check_out_at?: string; seat_id?: string | null };
  },
  async issueQR(validityHours = 24): Promise<QRToken> {
    return unwrap(await supabase.rpc('attendance_issue_qr', { p_validity_hours: validityHours })) as QRToken;
  },
  async revokeQR() { return unwrap(await supabase.rpc('attendance_revoke_qr')) as boolean; },
  async getRecords(libraryId: string, date?: string): Promise<AttendanceRecord[]> {
    let q = supabase.from('attendance').select('id,student_id,check_in_at,check_out_at,status,students!inner(student_id,full_name),seats(seat_number)').eq('library_id', libraryId).order('check_in_at', { ascending: false });
    if (date) { const start = `${date}T00:00:00`; const end = `${date}T23:59:59.999`; q = q.gte('check_in_at', start).lte('check_in_at', end); }
    const data = unwrap(await q);
    return (data as any[]).map((r) => ({ id: r.id, studentId: r.students.student_id, studentName: r.students.full_name, department: '', deskNo: r.seats?.seat_number || '—', shift: '', date: r.check_in_at.slice(0,10), checkInTime: prettyTime(r.check_in_at) || '', checkOutTime: prettyTime(r.check_out_at), durationMinutes: r.check_out_at ? Math.max(0, Math.floor((new Date(r.check_out_at).getTime()-new Date(r.check_in_at).getTime())/60000)) : undefined, status: r.status === 'currently_inside' ? 'present' : r.status === 'admin_closed' ? 'admin_closed' : 'checked_out', method: 'static_qr', qrCodeId: 'library-qr' }));
  },
  async closeVisit(id: string, reason: string) { return unwrap(await supabase.rpc('attendance_admin_close', { p_attendance_id:id, p_reason:reason })) as boolean; },
};
