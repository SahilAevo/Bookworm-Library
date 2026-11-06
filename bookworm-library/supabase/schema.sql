-- ==============================================================================
-- BOOKWORM LIB - SUPABASE POSTGRESQL INITIAL SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clean Tables (if needed during reset)
-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS payments CASCADE;
-- DROP TABLE IF EXISTS seat_allocations CASCADE;
-- DROP TABLE IF EXISTS membership_subscriptions CASCADE;
-- DROP TABLE IF EXISTS membership_plans CASCADE;
-- DROP TABLE IF EXISTS seats CASCADE;
-- DROP TABLE IF EXISTS shifts CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;
-- DROP TABLE IF EXISTS libraries CASCADE;

-- ------------------------------------------------------------------------------
-- 3. Libraries (Multi-tenant foundation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.libraries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    config JSONB DEFAULT '{"currency": "INR", "currency_symbol": "₹", "tax_percentage": 0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. User Profiles (Extends auth.users with library_id and roles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    library_id UUID REFERENCES public.libraries(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff', 'student')),
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Shifts (Morning, Evening, Full Day, 24 Hours)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. Seats (Physical Desks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    row_label TEXT,
    has_power_socket BOOLEAN DEFAULT TRUE,
    has_locker BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_seat_per_library UNIQUE (library_id, seat_number)
);

-- ------------------------------------------------------------------------------
-- 7. Membership Plans
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
    duration_in_days INTEGER NOT NULL CHECK (duration_in_days > 0),
    base_price NUMERIC(10, 2) NOT NULL CHECK (base_price >= 0),
    security_deposit NUMERIC(10, 2) DEFAULT 0 CHECK (security_deposit >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. Students
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS student_id_seq START WITH 1001;

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    parent_phone TEXT,
    address TEXT,
    photo_url TEXT,
    id_proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    admission_date DATE DEFAULT CURRENT_DATE,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_id_per_library UNIQUE (library_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 9. Membership Subscriptions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.membership_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    paid_amount NUMERIC(10, 2) DEFAULT 0 CHECK (paid_amount >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- ------------------------------------------------------------------------------
-- 10. Seat Allocations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seat_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    seat_id UUID NOT NULL REFERENCES public.seats(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.membership_subscriptions(id) ON DELETE SET NULL,
    allocated_from DATE NOT NULL,
    allocated_to DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'swapped', 'vacated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_allocation_dates CHECK (allocated_to >= allocated_from)
);

-- ------------------------------------------------------------------------------
-- 11. Payments & Receipts
-- ------------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS receipt_no_seq START WITH 5001;

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.membership_subscriptions(id) ON DELETE SET NULL,
    receipt_number TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer')),
    transaction_ref TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    collected_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded', 'failed')),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_receipt_per_library UNIQUE (library_id, receipt_number)
);

-- ------------------------------------------------------------------------------
-- 12. Attendance Records
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    library_id UUID NOT NULL REFERENCES public.libraries(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMPTZ DEFAULT NOW(),
    check_out TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day')),
    verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_student_daily_attendance UNIQUE (library_id, student_id, log_date)
);

-- ==============================================================================
-- 13. INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_students_library_status ON public.students(library_id, status);
CREATE INDEX IF NOT EXISTS idx_students_phone ON public.students(phone);
CREATE INDEX IF NOT EXISTS idx_subscriptions_student ON public.membership_subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON public.membership_subscriptions(end_date);
CREATE INDEX IF NOT EXISTS idx_allocations_active ON public.seat_allocations(seat_id, shift_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(library_id, log_date);

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
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

-- Helper function: get user library and role
CREATE OR REPLACE FUNCTION public.get_auth_user_metadata()
RETURNS TABLE (library_id UUID, role TEXT) AS $$
  SELECT u.library_id, u.role
  FROM public.users u
  WHERE u.id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Staff/Admin general policies (Read & Write everything within their library)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('shifts', 'seats', 'membership_plans', 'students', 'membership_subscriptions', 'seat_allocations', 'payments', 'attendance')
    LOOP
        EXECUTE format('
            CREATE POLICY "Staff and admin manage all in library" ON public.%I
            FOR ALL
            USING (
                library_id IN (SELECT library_id FROM public.get_auth_user_metadata() WHERE role IN (''super_admin'', ''admin'', ''staff''))
            );
        ', t);
    END LOOP;
END;
$$;

-- Student personal read-only policies
CREATE POLICY "Students view their own profile" ON public.students
FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Students view their own subscriptions" ON public.membership_subscriptions
FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Students view their own allocations" ON public.seat_allocations
FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Students view their own payments" ON public.payments
FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Students view their own attendance" ON public.attendance
FOR SELECT USING (student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid()));

-- ==============================================================================
-- 15. SEED DATA (Default Uncle's Library, Shifts, Sample Desks & Plans)
-- ==============================================================================
INSERT INTO public.libraries (id, name, code, address, phone, email)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Bookworm Library - Main Branch',
    'BW-MAIN',
    'Main Commercial Road, Library Block',
    '+91 98765 43210',
    'admin@bookwormlibrary.com'
) ON CONFLICT (code) DO NOTHING;

-- Default Shifts
INSERT INTO public.shifts (library_id, name, start_time, end_time) VALUES
('a0000000-0000-0000-0000-000000000001', 'Morning Shift', '07:00:00', '14:00:00'),
('a0000000-0000-0000-0000-000000000001', 'Evening Shift', '14:00:00', '21:00:00'),
('a0000000-0000-0000-0000-000000000001', 'Full Day Shift', '07:00:00', '21:00:00'),
('a0000000-0000-0000-0000-000000000001', '24 Hours Shift', '00:00:00', '23:59:59')
ON CONFLICT DO NOTHING;

-- Seed Sample Desks (Desk 1 to 30 across 3 rows)
INSERT INTO public.seats (library_id, seat_number, row_label, has_power_socket, has_locker)
SELECT 
    'a0000000-0000-0000-0000-000000000001',
    'D-' || LPAD(i::text, 2, '0'),
    CASE 
        WHEN i <= 10 THEN 'Row A'
        WHEN i <= 20 THEN 'Row B'
        ELSE 'Row C'
    END,
    TRUE,
    CASE WHEN i % 3 = 0 THEN TRUE ELSE FALSE END
FROM generate_series(1, 30) AS i
ON CONFLICT DO NOTHING;

-- Default Membership Plans
INSERT INTO public.membership_plans (library_id, name, shift_id, duration_in_days, base_price, security_deposit)
SELECT 
    'a0000000-0000-0000-0000-000000000001',
    'Monthly - ' || s.name,
    s.id,
    30,
    CASE 
        WHEN s.name = 'Morning Shift' THEN 800.00
        WHEN s.name = 'Evening Shift' THEN 800.00
        WHEN s.name = 'Full Day Shift' THEN 1400.00
        ELSE 1800.00
    END,
    200.00
FROM public.shifts s
WHERE s.library_id = 'a0000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

