import { supabase } from '@/lib/supabase';

export interface StudentPortalProfile {
  id: string; // public.students.id UUID
  auth_user_id: string; // auth.users.id UUID
  student_id: string; // e.g. "BW-2026-0014"
  full_name: string;
  email?: string | null;
  phone: string;
  parent_phone?: string | null;
  address?: string | null;
  status: 'active' | 'inactive' | 'suspended';
  application_status: 'pending_review' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  admission_date?: string | null;
  library_id: string;
  library: {
    id: string;
    name: string;
    code: string;
    username: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    seating_mode: 'general' | 'full_shift_reserved';
    config: any;
    is_active: boolean;
  };
}

export interface StudentSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  start_date: string | null;
  end_date: string | null;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: 'active' | 'pending_payment' | 'expired' | 'cancelled' | 'pending_approval' | 'rejected';
  shift_name?: string;
  is_full_shift?: boolean;
}

export interface StudentSeatInfo {
  has_seat: boolean;
  seating_mode: 'general' | 'full_shift_reserved';
  seat_number?: string;
  row_label?: string;
  category?: string;
  shift_name?: string;
  allocated_from?: string;
  allocated_to?: string;
  allocation_status?: string;
}

export interface StudentAttendanceRecord {
  id: string;
  check_in_at: string;
  check_out_at: string | null;
  check_out_method: string | null;
  status: 'currently_inside' | 'completed' | 'admin_closed' | 'corrected';
  seat_id?: string | null;
  duration_minutes?: number;
  date_display: string;
  check_in_display: string;
  check_out_display: string;
  duration_display: string;
}

export interface StudentAttendanceStats {
  total_visits: number;
  active_days_this_month: number;
  current_visit: StudentAttendanceRecord | null;
  attendance_rate_display: string;
}

export interface StudentPaymentRecord {
  id: string;
  receipt_number: string | null;
  amount: number;
  payment_method: string;
  payment_type: string;
  transaction_ref?: string | null;
  payment_date: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  remarks?: string | null;
  date_display: string;
}

export interface StudentPaymentSummary {
  total_paid: number;
  outstanding_dues: number;
  latest_receipt?: string;
  latest_payment_date?: string;
}

export interface LibraryEntitlements {
  has_assess: boolean;
  has_qr_attendance: boolean;
  seating_mode: 'general' | 'full_shift_reserved';
  raw_config: any;
}

class StudentPortalService {
  /**
   * Fetch authenticated student's full profile record from public.students and public.libraries
   */
  async getStudentProfile(authUserId: string): Promise<StudentPortalProfile | null> {
    try {
      // 1. Fetch student record by auth_user_id (matches RLS: auth_user_id = auth.uid())
      const { data: student, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (studentError) {
        console.error('Error fetching student profile:', studentError.message);
        return null;
      }

      if (!student) {
        return null;
      }

      // 2. Fetch associated library details (matches RLS: user library lookup)
      const { data: library, error: libError } = await supabase
        .from('libraries')
        .select('id, name, code, username, address, phone, email, seating_mode, config, is_active')
        .eq('id', student.library_id)
        .maybeSingle();

      if (libError) {
        console.warn('Could not fetch library details for student:', libError.message);
      }

      return {
        id: student.id,
        auth_user_id: student.auth_user_id,
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        phone: student.phone,
        parent_phone: student.parent_phone,
        address: student.address,
        status: student.status,
        application_status: student.application_status,
        rejection_reason: student.rejection_reason,
        admission_date: student.admission_date,
        library_id: student.library_id,
        library: {
          id: library?.id || student.library_id,
          name: library?.name || 'Bookworm Library',
          code: library?.code || 'BW-MAIN',
          username: library?.username || 'bookworm',
          address: library?.address || 'Main Branch',
          phone: library?.phone || '+91 98765 43210',
          email: library?.email || 'admin@bookwormlibrary.com',
          seating_mode: (library?.seating_mode as any) || 'general',
          config: library?.config || {},
          is_active: library?.is_active ?? true,
        },
      };
    } catch (err) {
      console.error('Unexpected error fetching student profile:', err);
      return null;
    }
  }

  /**
   * Fetch active membership subscription for this student
   */
  async getActiveSubscription(studentDbId: string): Promise<StudentSubscription | null> {
    try {
      // Attempt join with membership_plans if accessible under RLS
      const { data, error } = await supabase
        .from('membership_subscriptions')
        .select(`
          id,
          plan_id,
          start_date,
          end_date,
          total_amount,
          discount_amount,
          paid_amount,
          status,
          membership_plans (
            id,
            name,
            base_price,
            shift_id,
            shifts (
              id,
              name,
              is_full_shift
            )
          )
        `)
        .eq('student_id', studentDbId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        // If join fails due to RLS on membership_plans, fallback to direct query without joins
        console.warn('Direct subscription join error, falling back:', error.message);
        const { data: fallbackData } = await supabase
          .from('membership_subscriptions')
          .select('id, plan_id, start_date, end_date, total_amount, paid_amount, status')
          .eq('student_id', studentDbId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!fallbackData) return null;

        const total = Number(fallbackData.total_amount) || 0;
        const paid = Number(fallbackData.paid_amount) || 0;

        return {
          id: fallbackData.id,
          plan_id: fallbackData.plan_id,
          plan_name: 'Monthly Study Pass',
          start_date: fallbackData.start_date,
          end_date: fallbackData.end_date,
          total_amount: total,
          paid_amount: paid,
          due_amount: Math.max(0, total - paid),
          status: fallbackData.status,
          shift_name: 'Standard Shift',
          is_full_shift: false,
        };
      }

      if (!data) return null;

      const plan: any = data.membership_plans;
      const shift: any = plan?.shifts;
      const total = Number(data.total_amount) || 0;
      const paid = Number(data.paid_amount) || 0;

      return {
        id: data.id,
        plan_id: data.plan_id,
        plan_name: plan?.name || 'Standard Monthly Pass',
        start_date: data.start_date,
        end_date: data.end_date,
        total_amount: total,
        paid_amount: paid,
        due_amount: Math.max(0, total - paid),
        status: data.status,
        shift_name: shift?.name || 'Full Day Shift',
        is_full_shift: Boolean(shift?.is_full_shift),
      };
    } catch (err) {
      console.error('Error fetching subscription:', err);
      return null;
    }
  }

  /**
   * Fetch permanent seat allocation.
   * If seating_mode is 'general', returns has_seat: false as general seating does not have permanent assignments.
   */
  async getSeatInformation(
    studentDbId: string,
    seatingMode: 'general' | 'full_shift_reserved'
  ): Promise<StudentSeatInfo> {
    if (seatingMode === 'general') {
      return {
        has_seat: false,
        seating_mode: 'general',
      };
    }

    try {
      const { data, error } = await supabase
        .from('seat_allocations')
        .select(`
          id,
          seat_id,
          shift_id,
          allocated_from,
          allocated_to,
          status,
          seats (
            id,
            seat_number,
            row_label,
            has_power_socket,
            has_locker
          ),
          shifts (
            id,
            name,
            is_full_shift
          )
        `)
        .eq('student_id', studentDbId)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !data) {
        // Fallback without joins if RLS limits seats table
        const { data: fallbackData } = await supabase
          .from('seat_allocations')
          .select('id, seat_id, allocated_from, allocated_to, status')
          .eq('student_id', studentDbId)
          .eq('status', 'active')
          .maybeSingle();

        if (!fallbackData) {
          return {
            has_seat: false,
            seating_mode: 'full_shift_reserved',
          };
        }

        return {
          has_seat: true,
          seating_mode: 'full_shift_reserved',
          seat_number: 'Desk Assigned',
          allocated_from: fallbackData.allocated_from,
          allocated_to: fallbackData.allocated_to,
          allocation_status: fallbackData.status,
        };
      }

      const seat: any = data.seats;
      const shift: any = data.shifts;

      return {
        has_seat: true,
        seating_mode: 'full_shift_reserved',
        seat_number: seat?.seat_number || 'Desk Assigned',
        row_label: seat?.row_label || 'Main Hall',
        shift_name: shift?.name || 'Full Day Shift',
        allocated_from: data.allocated_from,
        allocated_to: data.allocated_to,
        allocation_status: data.status,
      };
    } catch (err) {
      console.error('Error fetching seat info:', err);
      return {
        has_seat: false,
        seating_mode: seatingMode,
      };
    }
  }

  /**
   * Fetch attendance history and compute real metrics
   */
  async getAttendanceHistory(
    studentDbId: string,
    limit: number = 30
  ): Promise<{ records: StudentAttendanceRecord[]; stats: StudentAttendanceStats }> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentDbId)
        .order('check_in_at', { ascending: false })
        .limit(limit);

      if (error || !data) {
        console.warn('Could not load attendance:', error?.message);
        return {
          records: [],
          stats: {
            total_visits: 0,
            active_days_this_month: 0,
            current_visit: null,
            attendance_rate_display: '0.0%',
          },
        };
      }

      let currentVisit: StudentAttendanceRecord | null = null;
      const uniqueDays = new Set<string>();

      const records: StudentAttendanceRecord[] = data.map((row: any) => {
        const checkIn = new Date(row.check_in_at);
        const checkOut = row.check_out_at ? new Date(row.check_out_at) : null;

        let durationMins = 0;
        if (checkOut) {
          durationMins = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 60000));
        } else {
          durationMins = Math.max(1, Math.round((Date.now() - checkIn.getTime()) / 60000));
        }

        const dateDisplay = checkIn.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });

        // Add to active days set
        const dayKey = `${checkIn.getFullYear()}-${checkIn.getMonth()}-${checkIn.getDate()}`;
        uniqueDays.add(dayKey);

        const checkInDisplay = checkIn.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        const checkOutDisplay = checkOut
          ? checkOut.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'In Progress';

        const durationDisplay = this.formatDuration(durationMins);

        const item: StudentAttendanceRecord = {
          id: row.id,
          check_in_at: row.check_in_at,
          check_out_at: row.check_out_at,
          check_out_method: row.check_out_method,
          status: row.status,
          seat_id: row.seat_id,
          duration_minutes: durationMins,
          date_display: dateDisplay,
          check_in_display: checkInDisplay,
          check_out_display: checkOutDisplay,
          duration_display: durationDisplay,
        };

        if (!row.check_out_at && row.status === 'currently_inside' && !currentVisit) {
          currentVisit = item;
        }

        return item;
      });

      // Calculate attendance rate: active days in current month / elapsed days in month
      const today = new Date();
      const dayOfMonth = Math.max(1, today.getDate());
      const activeDays = uniqueDays.size;
      const rate = Math.min(100, Math.round((activeDays / dayOfMonth) * 1000) / 10);

      return {
        records,
        stats: {
          total_visits: records.length,
          active_days_this_month: activeDays,
          current_visit: currentVisit,
          attendance_rate_display: records.length > 0 ? `${rate}%` : '0%',
        },
      };
    } catch (err) {
      console.error('Error in getAttendanceHistory:', err);
      return {
        records: [],
        stats: {
          total_visits: 0,
          active_days_this_month: 0,
          current_visit: null,
          attendance_rate_display: '0%',
        },
      };
    }
  }

  /**
   * Fetch payment transactions and compute dues
   */
  async getPaymentHistory(
    studentDbId: string,
    subscriptionDueAmount: number = 0
  ): Promise<{ payments: StudentPaymentRecord[]; summary: StudentPaymentSummary }> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentDbId)
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn('Could not load payments:', error?.message);
        return {
          payments: [],
          summary: {
            total_paid: 0,
            outstanding_dues: subscriptionDueAmount,
          },
        };
      }

      let totalPaid = 0;
      let latestReceipt: string | undefined;
      let latestDate: string | undefined;

      const payments: StudentPaymentRecord[] = data.map((p: any, idx: number) => {
        const amt = Number(p.amount) || 0;
        if (p.status === 'completed') {
          totalPaid += amt;
        }

        const pDate = p.payment_date || p.created_at;
        const dateDisplay = pDate
          ? new Date(pDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : 'Pending';

        if (idx === 0) {
          latestReceipt = p.receipt_number || p.transaction_ref || undefined;
          latestDate = dateDisplay;
        }

        return {
          id: p.id,
          receipt_number: p.receipt_number,
          amount: amt,
          payment_method: p.payment_method,
          payment_type: p.payment_type,
          transaction_ref: p.transaction_ref,
          payment_date: p.payment_date,
          status: p.status,
          remarks: p.remarks,
          date_display: dateDisplay,
        };
      });

      return {
        payments,
        summary: {
          total_paid: totalPaid,
          outstanding_dues: subscriptionDueAmount,
          latest_receipt: latestReceipt,
          latest_payment_date: latestDate,
        },
      };
    } catch (err) {
      console.error('Error fetching payments:', err);
      return {
        payments: [],
        summary: {
          total_paid: 0,
          outstanding_dues: subscriptionDueAmount,
        },
      };
    }
  }

  /**
   * Verify library-specific premium feature entitlements (LibX Assess, etc.)
   * Evaluated from the library's trusted config JSONB column.
   */
  checkLibraryEntitlements(libraryConfig: any, seatingMode: string): LibraryEntitlements {
    const config = libraryConfig || {};
    const features = config.features || {};
    const modules = Array.isArray(config.modules) ? config.modules : [];

    // Assess is enabled if config.features.assess is true OR 'assess' is in config.modules
    const hasAssess = Boolean(
      features.assess === true ||
      features.libx_assess === true ||
      features.exam_suite === true ||
      modules.includes('assess') ||
      modules.includes('libx_assess')
    );

    const hasQrAttendance = Boolean(
      features.qr_attendance !== false
    );

    return {
      has_assess: hasAssess,
      has_qr_attendance: hasQrAttendance,
      seating_mode: (seatingMode as any) || 'general',
      raw_config: config,
    };
  }

  /**
   * Helper to format minutes into human readable duration
   */
  formatDuration(minutes?: number): string {
    if (!minutes || minutes <= 0) return '0m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  }
}

export const studentPortalService = new StudentPortalService();

