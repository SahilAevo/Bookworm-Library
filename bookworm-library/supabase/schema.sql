
-- =============================================================================
-- LIBX - MULTI-TENANT LIBRARY MANAGEMENT PLATFORM
-- Supabase PostgreSQL schema
--
-- Intended for a FRESH database.
-- Do not run over an existing production database without a migration plan.
--
-- Core decisions:
-- 1. Tenant-based library isolation.
-- 2. General seating OR full-shift-reserved seating.
-- 3. Staff-assisted and student self-enrollment.
-- 4. Admin approval followed by payment confirmation.
-- 5. Multiple attendance visits per student per day.
-- 6. One static QR token per library, reusable for check-in/check-out.
-- 7. Admin-only closure of missed checkouts.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- 2. LIBRARIES
-- -----------------------------------------------------------------------------

CREATE TABLE public.libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,

    address TEXT,
    phone TEXT,
    email TEXT,

    -- general:
    -- No seat selection during attendance.
    --
    -- full_shift_reserved:
    -- Full-shift seats are reserved.
    -- Partial-shift students select unallocated vacant seats.
    seating_mode TEXT NOT NULL DEFAULT 'general'
        CHECK (seating_mode IN ('general', 'full_shift_reserved')),

    config JSONB NOT NULL DEFAULT
        '{"currency":"INR","currency_symbol":"₹","tax_percentage":0}'::jsonb,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. USER PROFILES
-- Supabase Auth remains responsible for password storage and authentication.
-- Never store passwords in this table.
-- -----------------------------------------------------------------------------

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE,

    full_name TEXT NOT NULL,

    role TEXT NOT NULL
        CHECK (role IN ('super_admin', 'admin', 'staff', 'student')),

    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id)
);

-- -----------------------------------------------------------------------------
-- 4. SHIFTS
-- -----------------------------------------------------------------------------

CREATE TABLE public.shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Used to identify full-shift plans.
    is_full_shift BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id),
    UNIQUE (library_id, name)
);

-- -----------------------------------------------------------------------------
-- 5. SEATS
-- -----------------------------------------------------------------------------

CREATE TABLE public.seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    seat_number TEXT NOT NULL,
    row_label TEXT,

    has_power_socket BOOLEAN NOT NULL DEFAULT TRUE,
    has_locker BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id),
    UNIQUE (library_id, seat_number)
);

-- -----------------------------------------------------------------------------
-- 6. MEMBERSHIP PLANS
-- -----------------------------------------------------------------------------

CREATE TABLE public.membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    shift_id UUID,

    duration_in_days INTEGER NOT NULL
        CHECK (duration_in_days > 0),

    base_price NUMERIC(10,2) NOT NULL
        CHECK (base_price >= 0),

    security_deposit NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (security_deposit >= 0),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id),

    CONSTRAINT membership_plan_shift_fk
        FOREIGN KEY (library_id, shift_id)
        REFERENCES public.shifts(library_id, id)
        ON DELETE RESTRICT
);

-- -----------------------------------------------------------------------------
-- 7. STUDENTS
--
-- Both staff-assisted and self-enrolled students use this same table.
--
-- application_status:
-- pending_review / approved / rejected
--
-- status:
-- active / inactive / suspended
--
-- auth_user_id connects the student to Supabase Auth.
-- Contact email is optional; it is not the same as the login identifier.
-- -----------------------------------------------------------------------------

CREATE SEQUENCE public.student_id_seq START WITH 1001;

CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    student_id TEXT NOT NULL,

    full_name TEXT NOT NULL,

    email TEXT,
    phone TEXT NOT NULL,
    parent_phone TEXT,

    address TEXT,
    photo_url TEXT,
    id_proof_url TEXT,

    enrollment_source TEXT NOT NULL DEFAULT 'staff_assisted'
        CHECK (enrollment_source IN ('staff_assisted', 'self_enrolled')),

    application_status TEXT NOT NULL DEFAULT 'approved'
        CHECK (application_status IN ('pending_review', 'approved', 'rejected')),

    rejection_reason TEXT,

    reviewed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'inactive', 'suspended')),

    admission_date DATE DEFAULT CURRENT_DATE,

    -- Linked after the student account is provisioned in Supabase Auth.
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id),
    UNIQUE (library_id, student_id)
);

-- -----------------------------------------------------------------------------
-- 8. MEMBERSHIP SUBSCRIPTIONS
--
-- Approval and payment are separate stages.
-- A membership must not become active before payment confirmation.
-- -----------------------------------------------------------------------------

CREATE TABLE public.membership_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL,
    plan_id UUID NOT NULL,

    start_date DATE,
    end_date DATE,

    total_amount NUMERIC(10,2) NOT NULL
        CHECK (total_amount >= 0),

    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (discount_amount >= 0),

    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (paid_amount >= 0),

    status TEXT NOT NULL DEFAULT 'pending_payment'
        CHECK (
            status IN (
                'pending_approval',
                'pending_payment',
                'active',
                'expired',
                'cancelled',
                'rejected'
            )
        ),

    approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id),

    CONSTRAINT subscription_student_fk
        FOREIGN KEY (library_id, student_id)
        REFERENCES public.students(library_id, id)
        ON DELETE CASCADE,

    CONSTRAINT subscription_plan_fk
        FOREIGN KEY (library_id, plan_id)
        REFERENCES public.membership_plans(library_id, id)
        ON DELETE RESTRICT,

    CONSTRAINT check_subscription_dates
        CHECK (
            start_date IS NULL
            OR end_date IS NULL
            OR end_date >= start_date
        ),

    CONSTRAINT check_subscription_paid_amount
        CHECK (paid_amount <= total_amount)
);

-- -----------------------------------------------------------------------------
-- 9. SEAT ALLOCATIONS
--
-- These are permanent/contractual seat assignments.
-- They are NOT the same as the seat a student temporarily occupies.
--
-- Full-shift students receive permanent allocations.
-- Partial-shift students do not receive permanent allocations under the
-- full_shift_reserved seating model.
-- -----------------------------------------------------------------------------

CREATE TABLE public.seat_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL,
    seat_id UUID NOT NULL,
    shift_id UUID NOT NULL,

    subscription_id UUID,

    allocated_from DATE NOT NULL,
    allocated_to DATE NOT NULL,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'swapped', 'vacated')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id),

    CONSTRAINT allocation_student_fk
        FOREIGN KEY (library_id, student_id)
        REFERENCES public.students(library_id, id)
        ON DELETE CASCADE,

    CONSTRAINT allocation_seat_fk
        FOREIGN KEY (library_id, seat_id)
        REFERENCES public.seats(library_id, id)
        ON DELETE RESTRICT,

    CONSTRAINT allocation_shift_fk
        FOREIGN KEY (library_id, shift_id)
        REFERENCES public.shifts(library_id, id)
        ON DELETE RESTRICT,

    CONSTRAINT allocation_subscription_fk
        FOREIGN KEY (library_id, subscription_id)
        REFERENCES public.membership_subscriptions(library_id, id)
        ON DELETE SET NULL,

    CONSTRAINT check_allocation_dates
        CHECK (allocated_to >= allocated_from)
);

-- Only one current active allocation per seat.
CREATE UNIQUE INDEX idx_one_active_allocation_per_seat
ON public.seat_allocations(seat_id)
WHERE status = 'active';

-- Only one current active permanent seat allocation per student.
CREATE UNIQUE INDEX idx_one_active_allocation_per_student
ON public.seat_allocations(student_id)
WHERE status = 'active';

-- -----------------------------------------------------------------------------
-- 10. PAYMENTS
--
-- Manual payments are confirmed by authorized library staff/admin.
-- Online payments must be verified by a trusted server-side gateway webhook.
-- Never trust a client-side "payment successful" message.
-- -----------------------------------------------------------------------------

CREATE SEQUENCE public.receipt_no_seq START WITH 5001;

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL,
    subscription_id UUID,

    receipt_number TEXT,

    amount NUMERIC(10,2) NOT NULL
        CHECK (amount > 0),

    payment_method TEXT NOT NULL
        CHECK (
            payment_method IN (
                'cash',
                'upi',
                'card',
                'bank_transfer',
                'online_gateway'
            )
        ),

    payment_type TEXT NOT NULL DEFAULT 'manual'
        CHECK (payment_type IN ('manual', 'online')),

    transaction_ref TEXT,

    gateway_order_id TEXT,
    gateway_payment_id TEXT,
    gateway_webhook_event_id TEXT,

    payment_date TIMESTAMPTZ,

    collected_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    confirmed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    confirmed_at TIMESTAMPTZ,

    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            status IN ('pending', 'completed', 'failed', 'refunded')
        ),

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id),
    UNIQUE (library_id, receipt_number),
    UNIQUE (gateway_webhook_event_id),

    CONSTRAINT payment_student_fk
        FOREIGN KEY (library_id, student_id)
        REFERENCES public.students(library_id, id)
        ON DELETE CASCADE,

    CONSTRAINT payment_subscription_fk
        FOREIGN KEY (library_id, subscription_id)
        REFERENCES public.membership_subscriptions(library_id, id)
        ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- 11. ATTENDANCE
--
-- One row = one visit.
-- A student can have multiple visits on the same date.
--
-- status:
-- currently_inside / completed / admin_closed / corrected
--
-- seat_id is the seat actually occupied during this visit.
-- It is separate from permanent seat_allocations.
-- -----------------------------------------------------------------------------

CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    student_id UUID NOT NULL,
    seat_id UUID,

    check_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    check_out_at TIMESTAMPTZ,

    check_out_method TEXT
        CHECK (check_out_method IN ('student_scan', 'admin')),

    status TEXT NOT NULL DEFAULT 'currently_inside'
        CHECK (
            status IN (
                'currently_inside',
                'completed',
                'admin_closed',
                'corrected'
            )
        ),

    closed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    closure_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (library_id, id),

    CONSTRAINT attendance_student_fk
        FOREIGN KEY (library_id, student_id)
        REFERENCES public.students(library_id, id)
        ON DELETE CASCADE,

    CONSTRAINT attendance_seat_fk
        FOREIGN KEY (library_id, seat_id)
        REFERENCES public.seats(library_id, id)
        ON DELETE RESTRICT,

    CONSTRAINT check_attendance_checkout
        CHECK (
            (status = 'currently_inside' AND check_out_at IS NULL)
            OR
            (status <> 'currently_inside' AND check_out_at IS NOT NULL)
        ),

    CONSTRAINT check_attendance_checkout_method
        CHECK (
            (status = 'currently_inside' AND check_out_method IS NULL)
            OR
            (status IN ('completed', 'corrected') AND check_out_method = 'student_scan')
            OR
            (status = 'admin_closed' AND check_out_method = 'admin')
        )
);

-- A student cannot have two open visits at the same time.
CREATE UNIQUE INDEX idx_one_open_visit_per_student
ON public.attendance(student_id)
WHERE check_out_at IS NULL;

-- A physical seat cannot be occupied by two students at the same time.
-- General seating libraries can leave attendance.seat_id NULL.
CREATE UNIQUE INDEX idx_one_current_occupant_per_seat
ON public.attendance(seat_id)
WHERE check_out_at IS NULL AND seat_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 12. ATTENDANCE QR TOKENS
--
-- Store only the token hash, never the raw QR token.
-- Generate random tokens on a trusted server/Edge Function.
-- Same QR token is used for check-in and check-out.
-- -----------------------------------------------------------------------------

CREATE TABLE public.attendance_qr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    revoked_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    revoked_at TIMESTAMPTZ,

    UNIQUE (library_id, id)
);

-- One active QR token per library.
CREATE UNIQUE INDEX idx_one_active_qr_per_library
ON public.attendance_qr_tokens(library_id)
WHERE is_active = TRUE AND revoked_at IS NULL;

-- -----------------------------------------------------------------------------
-- 13. ATTENDANCE AUDIT LOGS
--
-- Preserve the history of admin closures and corrections.
-- Do not silently rewrite attendance history.
-- -----------------------------------------------------------------------------

CREATE TABLE public.attendance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    library_id UUID NOT NULL REFERENCES public.libraries(id)
        ON DELETE CASCADE,

    attendance_id UUID NOT NULL,

    action TEXT NOT NULL
        CHECK (
            action IN (
                'admin_close',
                'attendance_correction',
                'seat_correction'
            )
        ),

    performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,

    reason TEXT NOT NULL,

    old_values JSONB,
    new_values JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT attendance_audit_visit_fk
        FOREIGN KEY (library_id, attendance_id)
        REFERENCES public.attendance(library_id, id)
        ON DELETE CASCADE
);

-- =============================================================================
-- 14. INDEXES
-- =============================================================================

CREATE INDEX idx_users_library_role
ON public.users(library_id, role);

CREATE INDEX idx_shifts_library
ON public.shifts(library_id);

CREATE INDEX idx_seats_library_active
ON public.seats(library_id, is_active);

CREATE INDEX idx_plans_library_active
ON public.membership_plans(library_id, is_active);

CREATE INDEX idx_students_library_status
ON public.students(library_id, status);

CREATE INDEX idx_students_application
ON public.students(library_id, application_status);

CREATE INDEX idx_students_phone
ON public.students(phone);

CREATE INDEX idx_students_auth_user
ON public.students(auth_user_id);

CREATE INDEX idx_subscriptions_student
ON public.membership_subscriptions(library_id, student_id);

CREATE INDEX idx_subscriptions_end_date
ON public.membership_subscriptions(library_id, end_date);

CREATE INDEX idx_subscriptions_status
ON public.membership_subscriptions(library_id, status);

CREATE INDEX idx_allocations_student
ON public.seat_allocations(library_id, student_id);

CREATE INDEX idx_allocations_seat_shift
ON public.seat_allocations(library_id, seat_id, shift_id, status);

CREATE INDEX idx_payments_student
ON public.payments(library_id, student_id);

CREATE INDEX idx_payments_subscription
ON public.payments(library_id, subscription_id);

CREATE INDEX idx_attendance_library_checkin
ON public.attendance(library_id, check_in_at DESC);

CREATE INDEX idx_attendance_student_history
ON public.attendance(library_id, student_id, check_in_at DESC);

CREATE INDEX idx_qr_library
ON public.attendance_qr_tokens(library_id);

CREATE INDEX idx_attendance_audit_visit
ON public.attendance_audit_logs(library_id, attendance_id);

-- =============================================================================
-- 15. AUTHENTICATION / RLS HELPER FUNCTIONS
-- =============================================================================

-- SECURITY DEFINER is used to read the current user's profile without
-- causing recursive RLS checks on public.users.
-- The fixed search_path is important for security.

CREATE OR REPLACE FUNCTION public.get_auth_user_metadata()
RETURNS TABLE (library_id UUID, role TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT u.library_id, u.role
    FROM public.users AS u
    WHERE u.id = (SELECT auth.uid())
      AND u.is_active = TRUE
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_student_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT s.id
    FROM public.students AS s
    WHERE s.auth_user_id = (SELECT auth.uid())
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_auth_user_metadata() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_auth_student_id() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_auth_user_metadata() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_student_id() TO authenticated;

-- =============================================================================
-- 16. ENABLE RLS
-- =============================================================================

ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seat_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 17. LIBRARY AND USER POLICIES
-- =============================================================================

CREATE POLICY "Users can view their own library"
ON public.libraries
FOR SELECT TO authenticated
USING (
    id IN (
        SELECT library_id
        FROM public.get_auth_user_metadata()
        WHERE library_id IS NOT NULL
    )
);

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

-- User creation, role changes and account provisioning must be performed
-- through a trusted backend/Edge Function using the service role.
-- Do not allow clients to assign themselves admin or staff roles.

-- =============================================================================
-- 18. TENANT STAFF POLICIES
-- Admin and staff can manage tenant operational data.
-- Student permissions are added separately below.
-- =============================================================================

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'shifts',
        'seats',
        'membership_plans',
        'students',
        'membership_subscriptions',
        'seat_allocations',
        'payments',
        'attendance',
        'attendance_qr_tokens',
        'attendance_audit_logs'
    ]
    LOOP
        EXECUTE format(
            'CREATE POLICY %I ON public.%I
             FOR ALL TO authenticated
             USING (
                 library_id IN (
                     SELECT library_id
                     FROM public.get_auth_user_metadata()
                     WHERE role IN (''admin'', ''staff'')
                       AND library_id IS NOT NULL
                 )
             )
             WITH CHECK (
                 library_id IN (
                     SELECT library_id
                     FROM public.get_auth_user_metadata()
                     WHERE role IN (''admin'', ''staff'')
                       AND library_id IS NOT NULL
                 )
             )',
            'Tenant staff manage ' || t,
            t
        );
    END LOOP;
END;
$$;

-- =============================================================================
-- 19. STUDENT READ POLICIES
-- Students can read only their own records.
-- No direct student INSERT/UPDATE/DELETE access is granted here.
-- =============================================================================

CREATE POLICY "Students view own student record"
ON public.students
FOR SELECT TO authenticated
USING (auth_user_id = (SELECT auth.uid()));

CREATE POLICY "Students view own subscriptions"
ON public.membership_subscriptions
FOR SELECT TO authenticated
USING (student_id = (SELECT public.get_auth_student_id()));

CREATE POLICY "Students view own allocations"
ON public.seat_allocations
FOR SELECT TO authenticated
USING (student_id = (SELECT public.get_auth_student_id()));

CREATE POLICY "Students view own payments"
ON public.payments
FOR SELECT TO authenticated
USING (student_id = (SELECT public.get_auth_student_id()));

CREATE POLICY "Students view own attendance"
ON public.attendance
FOR SELECT TO authenticated
USING (student_id = (SELECT public.get_auth_student_id()));

-- =============================================================================
-- 20. SEQUENCES
-- =============================================================================

GRANT USAGE, SELECT ON SEQUENCE public.student_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.receipt_no_seq TO service_role;

-- =============================================================================
-- 21. UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'libraries',
        'users',
        'shifts',
        'seats',
        'membership_plans',
        'students',
        'membership_subscriptions',
        'seat_allocations',
        'payments',
        'attendance'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER set_updated_at
             BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
            t
        );
    END LOOP;
END;
$$;

-- =============================================================================
-- 22. DEFAULT BOOKWORM LIBRARY SEED DATA
-- =============================================================================

INSERT INTO public.libraries (
    id,
    name,
    code,
    username,
    address,
    phone,
    email,
    seating_mode
)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Bookworm Library - Main Branch',
    'BW-MAIN',
    'bookworm',
    'Main Commercial Road, Library Block',
    '+91 98765 43210',
    'admin@bookwormlibrary.com',
    'general'
)
ON CONFLICT (code) DO NOTHING;

-- Default shifts
INSERT INTO public.shifts (
    library_id,
    name,
    start_time,
    end_time,
    is_full_shift
)
VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Morning Shift',
    '07:00:00',
    '14:00:00',
    FALSE
),
(
    'a0000000-0000-0000-0000-000000000001',
    'Evening Shift',
    '14:00:00',
    '21:00:00',
    FALSE
),
(
    'a0000000-0000-0000-0000-000000000001',
    'Full Day Shift',
    '07:00:00',
    '21:00:00',
    TRUE
),
(
    'a0000000-0000-0000-0000-000000000001',
    '24 Hours Shift',
    '00:00:00',
    '23:59:59',
    TRUE
)
ON CONFLICT (library_id, name) DO NOTHING;

-- Sample seats: D-01 to D-30
INSERT INTO public.seats (
    library_id,
    seat_number,
    row_label,
    has_power_socket,
    has_locker
)
SELECT
    'a0000000-0000-0000-0000-000000000001',
    'D-' || LPAD(i::TEXT, 2, '0'),
    CASE
        WHEN i <= 10 THEN 'Row A'
        WHEN i <= 20 THEN 'Row B'
        ELSE 'Row C'
    END,
    TRUE,
    (i % 3 = 0)
FROM generate_series(1, 30) AS i
ON CONFLICT (library_id, seat_number) DO NOTHING;

-- Default membership plans
INSERT INTO public.membership_plans (
    library_id,
    name,
    shift_id,
    duration_in_days,
    base_price,
    security_deposit
)
SELECT
    'a0000000-0000-0000-0000-000000000001',
    'Monthly - ' || s.name,
    s.id,
    30,
    CASE
        WHEN s.name IN ('Morning Shift', 'Evening Shift') THEN 800.00
        WHEN s.name = 'Full Day Shift' THEN 1400.00
        ELSE 1800.00
    END,
    200.00
FROM public.shifts AS s
WHERE s.library_id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- =============================================================================
-- END OF LIBX INITIAL SCHEMA
-- =============================================================================
