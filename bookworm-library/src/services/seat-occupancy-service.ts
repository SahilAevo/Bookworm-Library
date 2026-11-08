import { supabase } from '@/lib/supabase';

export type SeatOccupancyStatus = 'available' | 'occupied_assigned' | 'occupied_another' | 'reserved' | 'maintenance';
export interface AssignedStudentInfo { studentId: string; name: string; department: string; phone: string; shift: string; shiftLabel?: string; validityStart: string; validityEnd: string; validityDates?: string; planName: string; monthlyFee?: number; status: 'Assigned' | 'Enrolled' | 'Reserved' | 'Expired'; assignmentStatus?: string; avatarColor?: string }
export interface OccupyingStudentInfo { studentId: string; name: string; department: string; phone: string; checkInTime: string; checkInDate: string; checkInEpoch: number; durationMinutes: number; durationFormatted: string; registrationMethod: 'seat_qr' | 'manual_admin' | 'kiosk_checkin' | 'attendance_sync'; verifiedGate: string; notes?: string }
export interface SeatOccupancyItem { seatId: string; allocationId?: string; seatNumber: number; deskLabel: string; tenantId: string; status: SeatOccupancyStatus; statusLabel: string; assignedStudent?: AssignedStudentInfo; occupyingStudent?: OccupyingStudentInfo; isCrossOccupied: boolean; maintenanceReason?: string; powerSocketDrawing: boolean; readingLightOn: boolean; lastUpdated: string }
export interface SeatOccupancyHistoryRecord { id: string; seatNumber: number; deskLabel: string; tenantId: string; date: string; assignedStudentName: string; assignedStudentId?: string; occupyingStudentName: string; occupyingStudentId: string; department: string; checkInTime: string; checkOutTime: string; durationFormatted: string; registrationMethod: string; wasCrossOccupied: boolean; notes?: string }
export interface SeatOccupancyAuditLog { id: string; seatNumber: number; deskLabel: string; tenantId: string; action: 'manual_assign' | 'manual_release' | 'correct_record' | 'toggle_maintenance' | 'seat_qr_checkin'; actionLabel: string; performedBy: string; timestamp: string; details: string }
export interface SeatStudentOption { id: string; student_id: string; full_name: string; phone: string; status: string; shift_id: string | null; shift_name: string | null; is_full_shift: boolean; plan_name: string; subscription_id: string | null; start_date: string | null; end_date: string | null }
export interface SeatDashboardData { mode: 'general' | 'full_shift_reserved'; seats: SeatOccupancyItem[]; history: SeatOccupancyHistoryRecord[]; audit: SeatOccupancyAuditLog[]; students: SeatStudentOption[] }

const fail = (error: { message: string; code?: string } | null): void => { if (error) throw new Error(error.code === '23505' ? 'This seat or student already has an active allocation or occupancy.' : error.message); };
const clock = (value: string | null) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const date = (value: string | null) => value ? new Date(value).toLocaleDateString() : '';
const duration = (start: string, end?: string | null) => { const n = Math.max(0, Math.floor((new Date(end || Date.now()).getTime() - new Date(start).getTime()) / 60000)); return `${Math.floor(n / 60)}h ${n % 60}m`; };

class SeatOccupancyService {
  async getDashboard(libraryId: string): Promise<SeatDashboardData> {
    const [lib, seatsRes, allocationsRes, attendanceRes, shiftsRes, studentsRes, plansRes, subsRes, auditRes] = await Promise.all([
      supabase.from('libraries').select('seating_mode').eq('id', libraryId).single(),
      supabase.from('seats').select('id, seat_number, row_label, has_power_socket, has_locker').eq('library_id', libraryId).eq('is_active', true).order('seat_number'),
      supabase.from('seat_allocations').select('id, seat_id, student_id, shift_id, subscription_id, allocated_from, allocated_to, status, students!inner(id,student_id,full_name,phone), shifts!inner(id,name,is_full_shift)').eq('library_id', libraryId).eq('status', 'active'),
      supabase.from('attendance').select('id, seat_id, student_id, check_in_at, check_out_at, status, students!inner(id,student_id,full_name,phone)').eq('library_id', libraryId).order('check_in_at', { ascending: false }),
      supabase.from('shifts').select('id,name,is_full_shift').eq('library_id', libraryId).eq('is_active', true),
      supabase.from('students').select('id,student_id,full_name,phone,status').eq('library_id', libraryId).eq('status', 'active').eq('application_status', 'approved').order('full_name'),
      supabase.from('membership_plans').select('id,name,shift_id').eq('library_id', libraryId),
      supabase.from('membership_subscriptions').select('student_id,plan_id,start_date,end_date,status').eq('library_id', libraryId).eq('status', 'active'),
      supabase.from('attendance_audit_logs').select('id,attendance_id,action,reason,created_at,performed_by,attendance!inner(seat_id,seats!inner(seat_number, row_label))').eq('library_id', libraryId).order('created_at', { ascending: false }).limit(200),
    ]);
    [lib.error,seatsRes.error,allocationsRes.error,attendanceRes.error,shiftsRes.error,studentsRes.error,plansRes.error,subsRes.error,auditRes.error].forEach(fail);
    const allocations = allocationsRes.data || [], visits = attendanceRes.data || [];
    const activeVisits = visits.filter((v: any) => !v.check_out_at);
    const shiftById = new Map((shiftsRes.data || []).map((x: any) => [x.id, x]));
    const planById = new Map((plansRes.data || []).map((x: any) => [x.id, x]));
    const subscriptionByStudent = new Map((subsRes.data || []).map((x: any) => [x.student_id, x]));
    const seats: SeatOccupancyItem[] = (seatsRes.data || []).map((seat: any) => {
      const allocation: any = allocations.find((a: any) => a.seat_id === seat.id);
      const visit: any = activeVisits.find((v: any) => v.seat_id === seat.id);
      const assigned = allocation?.students;
      const occupying = visit?.students;
      const shift: any = allocation && shiftById.get(allocation.shift_id);
      const plan: any = allocation?.subscription_id && planById.get((subscriptionByStudent.get(allocation.student_id) as any)?.plan_id);
      return {
        seatId: seat.id, allocationId: allocation?.id, seatNumber: Number.parseInt(seat.seat_number.replace(/\D/g, ''), 10) || 0, deskLabel: seat.seat_number, tenantId: libraryId,
        status: visit ? (allocation?.student_id === visit.student_id ? 'occupied_assigned' : 'occupied_another') : allocation ? 'reserved' : 'available',
        statusLabel: visit ? 'Occupied' : allocation ? 'Reserved for full shift' : 'Available',
        assignedStudent: assigned ? { studentId: assigned.student_id, name: assigned.full_name, department: '', phone: assigned.phone || '', shift: shift?.name || '', shiftLabel: shift?.name || '', validityStart: allocation.allocated_from, validityEnd: allocation.allocated_to, validityDates: `${allocation.allocated_from} – ${allocation.allocated_to}`, planName: plan?.name || 'Active plan', status: 'Assigned', assignmentStatus: allocation.status } : undefined,
        occupyingStudent: occupying ? { studentId: occupying.student_id, name: occupying.full_name, department: '', phone: occupying.phone || '', checkInTime: clock(visit.check_in_at), checkInDate: date(visit.check_in_at), checkInEpoch: new Date(visit.check_in_at).getTime(), durationMinutes: Math.floor((Date.now() - new Date(visit.check_in_at).getTime()) / 60000), durationFormatted: duration(visit.check_in_at), registrationMethod: 'attendance_sync', verifiedGate: 'Attendance', notes: '' } : undefined,
        isCrossOccupied: Boolean(visit && allocation && allocation.student_id !== visit.student_id), powerSocketDrawing: Boolean(seat.has_power_socket && visit), readingLightOn: Boolean(seat.has_power_socket && visit), lastUpdated: visit ? clock(visit.check_in_at) : '',
      };
    });
    const histories: SeatOccupancyHistoryRecord[] = visits.filter((v: any) => v.check_out_at && v.seat_id).map((v: any) => {
      const seat: any = (seatsRes.data || []).find((s: any) => s.id === v.seat_id);
      const alloc: any = allocations.find((a: any) => a.seat_id === v.seat_id && a.student_id === v.student_id);
      return { id: v.id, seatNumber: seat ? Number.parseInt(seat.seat_number.replace(/\D/g, ''), 10) || 0 : 0, deskLabel: seat?.seat_number || '', tenantId: libraryId, date: date(v.check_in_at), assignedStudentName: alloc?.students?.full_name || 'Unassigned', assignedStudentId: alloc?.students?.student_id, occupyingStudentName: v.students.full_name, occupyingStudentId: v.students.student_id, department: '', checkInTime: clock(v.check_in_at), checkOutTime: clock(v.check_out_at), durationFormatted: duration(v.check_in_at,v.check_out_at), registrationMethod: 'Attendance', wasCrossOccupied: Boolean(alloc && alloc.student_id !== v.student_id) };
    });
    const audit: SeatOccupancyAuditLog[] = (auditRes.data || []).map((a: any) => { const seat = a.attendance?.seats; return { id: a.id, seatNumber: Number.parseInt(seat?.seat_number?.replace(/\D/g, ''), 10) || 0, deskLabel: seat?.seat_number || '', tenantId: libraryId, action: a.action === 'seat_correction' ? 'correct_record' : 'manual_release', actionLabel: a.action, performedBy: a.performed_by || 'Staff', timestamp: new Date(a.created_at).toLocaleString(), details: a.reason }; });
    const students: SeatStudentOption[] = (studentsRes.data || []).map((s: any) => { const sub: any = subscriptionByStudent.get(s.id); const plan: any = sub && planById.get(sub.plan_id); const shift: any = plan && shiftById.get(plan.shift_id); return { ...s, shift_id: shift?.id || null, shift_name: shift?.name || null, is_full_shift: Boolean(shift?.is_full_shift), plan_name: plan?.name || '', subscription_id: sub?.id || null, start_date: sub?.start_date || null, end_date: sub?.end_date || null }; });
    return { mode: lib.data!.seating_mode, seats, history: histories, audit, students };
  }

  async assignSeat(libraryId: string, seatId: string, studentId: string, shiftId: string, fullShift: boolean, startDate: string, endDate: string, subscriptionId?: string | null) {
    if (!fullShift) throw new Error('Permanent seat allocations are reserved for full-shift students.');
    const { error } = await supabase.from('seat_allocations').insert({ library_id: libraryId, seat_id: seatId, student_id: studentId, shift_id: shiftId, subscription_id: subscriptionId || null, allocated_from: startDate, allocated_to: endDate, status: 'active' });
    fail(error);
  }
  async vacateAllocation(libraryId: string, allocationId: string) {
    const { data, error } = await supabase.from('seat_allocations').update({ status: 'vacated' }).eq('library_id', libraryId).eq('id', allocationId).eq('status', 'active').select('id').maybeSingle();
    fail(error); if (!data) throw new Error('Active permanent seat allocation was not found.');
  }
  async occupySeat(libraryId: string, seatId: string, studentId: string, mode: 'general' | 'full_shift_reserved', fullShift: boolean) {
    if (mode === 'general') { const { error } = await supabase.from('attendance').insert({ library_id: libraryId, student_id: studentId, seat_id: null }); fail(error); return; }
    if (fullShift) { const { data, error } = await supabase.from('seat_allocations').select('id').eq('library_id', libraryId).eq('seat_id', seatId).eq('student_id', studentId).eq('status', 'active').maybeSingle(); fail(error); if (!data) throw new Error('Full-shift students must occupy their permanently allocated seat.'); }
    else { const { data, error } = await supabase.from('seat_allocations').select('id').eq('library_id', libraryId).eq('seat_id', seatId).eq('status', 'active').maybeSingle(); fail(error); if (data) throw new Error('This seat is reserved for a full-shift student, including while they are absent.'); }
    const { error } = await supabase.from('attendance').insert({ library_id: libraryId, student_id: studentId, seat_id: seatId }); fail(error);
  }
  async releaseSeat(libraryId: string, seatId: string, actorId: string, reason: string) {
    const { data, error } = await supabase.from('attendance').update({ check_out_at: new Date().toISOString(), check_out_method: 'admin', status: 'admin_closed', closed_by: actorId, closure_reason: reason }).eq('library_id', libraryId).eq('seat_id', seatId).is('check_out_at', null).select('id').maybeSingle();
    fail(error); if (!data) throw new Error('No current occupant was found for this seat.');
    const { error: auditError } = await supabase.from('attendance_audit_logs').insert({ library_id: libraryId, attendance_id: data.id, action: 'admin_close', performed_by: actorId, reason });
    fail(auditError);
  }
}

export const seatOccupancyService = new SeatOccupancyService();
