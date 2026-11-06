import { RegisteredStudent, SEED_STUDENTS } from './attendance-service';

export type SeatOccupancyStatus =
  | 'available'
  | 'occupied_assigned'
  | 'occupied_another'
  | 'reserved'
  | 'maintenance';

export interface AssignedStudentInfo {
  studentId: string;
  name: string;
  department: string;
  phone: string;
  shift: string;
  shiftLabel?: string;
  validityStart: string;
  validityEnd: string;
  validityDates?: string;
  planName: string;
  monthlyFee?: number;
  status: 'Assigned' | 'Enrolled' | 'Reserved' | 'Expired';
  assignmentStatus?: string;
  avatarColor?: string;
}

export interface OccupyingStudentInfo {
  studentId: string;
  name: string;
  department: string;
  phone: string;
  checkInTime: string; // e.g. "09:14 AM"
  checkInDate: string; // e.g. "06 Nov 2026"
  checkInEpoch: number;
  durationMinutes: number;
  durationFormatted: string; // e.g. "2h 45m"
  registrationMethod: 'seat_qr' | 'manual_admin' | 'kiosk_checkin' | 'attendance_sync';
  verifiedGate: string;
  notes?: string;
}

export interface SeatOccupancyItem {
  seatNumber: number;
  deskLabel: string;
  tenantId: string;
  status: SeatOccupancyStatus;
  statusLabel: string;
  assignedStudent?: AssignedStudentInfo;
  occupyingStudent?: OccupyingStudentInfo;
  isCrossOccupied: boolean; // Scenario 2 or 4
  maintenanceReason?: string;
  powerSocketDrawing: boolean;
  readingLightOn: boolean;
  lastUpdated: string;
}

export interface SeatOccupancyHistoryRecord {
  id: string;
  seatNumber: number;
  deskLabel: string;
  tenantId: string;
  date: string;
  assignedStudentName: string;
  assignedStudentId?: string;
  occupyingStudentName: string;
  occupyingStudentId: string;
  department: string;
  checkInTime: string;
  checkOutTime: string;
  durationFormatted: string;
  registrationMethod: string;
  wasCrossOccupied: boolean;
  notes?: string;
}

export interface SeatOccupancyAuditLog {
  id: string;
  seatNumber: number;
  deskLabel: string;
  tenantId: string;
  action: 'manual_assign' | 'manual_release' | 'correct_record' | 'toggle_maintenance' | 'seat_qr_checkin';
  actionLabel: string;
  performedBy: string; // e.g. "Admin (Civil Lines)"
  timestamp: string;
  details: string;
}

// Format duration from epoch to now
export function formatDuration(startEpoch: number, endEpoch?: number): string {
  const diffMs = Math.max(0, (endEpoch || Date.now()) - startEpoch);
  const totalMins = Math.floor(diffMs / (1000 * 60));
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

// Format current time
export function getFormattedTime(): string {
  const d = new Date();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

// Format current date
export function getFormattedDate(): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

class SeatOccupancyService {
  private occupancyStore: Record<string, Record<number, SeatOccupancyItem>> = {};
  private historyStore: Record<string, SeatOccupancyHistoryRecord[]> = {};
  private auditStore: Record<string, SeatOccupancyAuditLog[]> = {};

  constructor() {
    this.initializeTenantSeeds('bookworm-main');
    this.initializeTenantSeeds('apex-study');
    this.initializeTenantSeeds('scholars-den');
  }

  // Pre-seed realistic multi-tenant data supporting all 4 core scenarios
  private initializeTenantSeeds(tenantId: string) {
    if (!this.occupancyStore[tenantId]) {
      this.occupancyStore[tenantId] = {};
    }
    if (!this.historyStore[tenantId]) {
      this.historyStore[tenantId] = [];
    }
    if (!this.auditStore[tenantId]) {
      this.auditStore[tenantId] = [];
    }

    const now = Date.now();
    const studentsPool = SEED_STUDENTS.filter((s) => s.tenantId === tenantId);
    const pool = studentsPool.length > 0 ? studentsPool : SEED_STUDENTS;

    // We seed 150 desks per tenant
    for (let num = 1; num <= 150; num++) {
      const padded = num < 10 ? `0${num}` : `${num}`;
      const deskLabel = `D-${padded}`;

      // Assign student for ~75% of desks
      let assignedStudent: AssignedStudentInfo | undefined;
      const hasAssignment = (num * 3 + 1) % 10 > 2;

      if (hasAssignment) {
        const studentIndex = (num * 2) % pool.length;
        const student = pool[studentIndex];
        assignedStudent = {
          studentId: student.id,
          name: student.name,
          department: student.department || 'General Studies',
          phone: student.phone || '+91 98765 43210',
          shift: num % 3 === 0 ? 'Full Day (24/7)' : num % 2 === 0 ? 'Evening Shift' : 'Morning Shift',
          validityStart: '01 Nov 2026',
          validityEnd: '30 Nov 2026',
          planName: num <= 50 ? 'Exclusive Reserve' : num <= 80 ? 'Premium Focus' : 'Classic Study',
          status: 'Enrolled',
        };
      }

      // -----------------------------------------------------------------------
      // SCENARIO 1: Assigned Student Occupies Their Own Seat
      // e.g. Desk 1, 3, 7, 13, 21...
      // -----------------------------------------------------------------------
      if (assignedStudent && (num % 5 === 1 || num % 5 === 3)) {
        const checkInEpoch = now - (num * 17 * 60 * 1000 + 45 * 60 * 1000);
        this.occupancyStore[tenantId][num] = {
          seatNumber: num,
          deskLabel,
          tenantId,
          status: 'occupied_assigned',
          statusLabel: 'Occupied by Assigned Student',
          assignedStudent,
          occupyingStudent: {
            studentId: assignedStudent.studentId,
            name: assignedStudent.name,
            department: assignedStudent.department,
            phone: assignedStudent.phone,
            checkInTime: '08:15 AM',
            checkInDate: getFormattedDate(),
            checkInEpoch,
            durationMinutes: Math.floor((now - checkInEpoch) / 60000),
            durationFormatted: formatDuration(checkInEpoch, now),
            registrationMethod: 'seat_qr',
            verifiedGate: 'Gate 1 Turnstile QR',
            notes: 'Verified scan at desk QR stand.',
          },
          isCrossOccupied: false,
          powerSocketDrawing: true,
          readingLightOn: true,
          lastUpdated: 'Just now',
        };
        continue;
      }

      // -----------------------------------------------------------------------
      // SCENARIO 2: Another Student Occupies the Seat (Cross-Seat Mismatch!)
      // Assigned: Rahul, Occupying: Amit
      // e.g. Desk 4, 9, 14, 19, 24...
      // -----------------------------------------------------------------------
      if (num % 5 === 4) {
        const otherStudentIndex = (num * 3 + 2) % pool.length;
        const otherStudent = pool[otherStudentIndex];
        const checkInEpoch = now - (num * 12 * 60 * 1000 + 30 * 60 * 1000);

        this.occupancyStore[tenantId][num] = {
          seatNumber: num,
          deskLabel,
          tenantId,
          status: 'occupied_another',
          statusLabel: 'Occupied by Another Student',
          assignedStudent, // Original enrolled student is fully preserved!
          occupyingStudent: {
            studentId: otherStudent.id,
            name: otherStudent.name,
            department: otherStudent.department,
            phone: otherStudent.phone,
            checkInTime: '10:14 AM',
            checkInDate: getFormattedDate(),
            checkInEpoch,
            durationMinutes: Math.floor((now - checkInEpoch) / 60000),
            durationFormatted: formatDuration(checkInEpoch, now),
            registrationMethod: 'seat_qr',
            verifiedGate: 'Main Library Gate 1',
            notes: assignedStudent
              ? `Officially assigned to ${assignedStudent.name}, but ${otherStudent.name} is seated here.`
              : `Unassigned seat occupied by ${otherStudent.name}.`,
          },
          isCrossOccupied: true,
          powerSocketDrawing: true,
          readingLightOn: true,
          lastUpdated: '2 mins ago',
        };
        continue;
      }

      // -----------------------------------------------------------------------
      // SCENARIO 3: Assigned Student is Absent (Vacant)
      // Assigned: Rahul, Occupying: Nobody
      // e.g. Desk 2, 8, 12, 18, 22...
      // -----------------------------------------------------------------------
      if (assignedStudent && (num % 5 === 2 || num % 5 === 0)) {
        this.occupancyStore[tenantId][num] = {
          seatNumber: num,
          deskLabel,
          tenantId,
          status: 'available',
          statusLabel: 'Available (Assigned Student Absent)',
          assignedStudent, // Rahul's enrolment remains visible!
          occupyingStudent: undefined,
          isCrossOccupied: false,
          powerSocketDrawing: false,
          readingLightOn: false,
          lastUpdated: '06:00 AM',
        };
        continue;
      }

      // Maintenance or Reserved desks
      if (num === 50 || num === 100) {
        this.occupancyStore[tenantId][num] = {
          seatNumber: num,
          deskLabel,
          tenantId,
          status: 'maintenance',
          statusLabel: 'Maintenance / Blocked',
          assignedStudent: undefined,
          occupyingStudent: undefined,
          isCrossOccupied: false,
          maintenanceReason: 'Electrical socket inspection & desk surface repainting',
          powerSocketDrawing: false,
          readingLightOn: false,
          lastUpdated: '08:00 AM',
        };
        continue;
      }

      // Default Available Desk
      this.occupancyStore[tenantId][num] = {
        seatNumber: num,
        deskLabel,
        tenantId,
        status: 'available',
        statusLabel: 'Available',
        assignedStudent: undefined,
        occupyingStudent: undefined,
        isCrossOccupied: false,
        powerSocketDrawing: false,
        readingLightOn: false,
        lastUpdated: '06:00 AM',
      };
    }

    // Seed historical occupancy sessions
    this.historyStore[tenantId] = [
      {
        id: 'hist-1',
        seatNumber: 4,
        deskLabel: 'D-04',
        tenantId,
        date: getFormattedDate(),
        assignedStudentName: 'Rohan Verma',
        assignedStudentId: 'BW-2026-0014',
        occupyingStudentName: 'Aarav Patel',
        occupyingStudentId: 'BW-2026-0021',
        department: 'Engineering / GATE',
        checkInTime: '06:15 AM',
        checkOutTime: '09:45 AM',
        durationFormatted: '3h 30m',
        registrationMethod: 'Seat QR Code Stand',
        wasCrossOccupied: true,
        notes: 'Temporary occupancy while assigned desk D-02 was undergoing repair.',
      },
      {
        id: 'hist-2',
        seatNumber: 1,
        deskLabel: 'D-01',
        tenantId,
        date: getFormattedDate(),
        assignedStudentName: 'Rohan Verma',
        assignedStudentId: 'BW-2026-0014',
        occupyingStudentName: 'Rohan Verma',
        occupyingStudentId: 'BW-2026-0014',
        department: 'UPSC Civil Services',
        checkInTime: '06:00 AM',
        checkOutTime: '08:00 AM',
        durationFormatted: '2h 00m',
        registrationMethod: 'Seat QR Code Stand',
        wasCrossOccupied: false,
      },
      {
        id: 'hist-3',
        seatNumber: 14,
        deskLabel: 'D-14',
        tenantId,
        date: '05 Nov 2026',
        assignedStudentName: 'Sneha Kulkarni',
        assignedStudentId: 'BW-2026-0056',
        occupyingStudentName: 'Kunal Deshmukh',
        occupyingStudentId: 'BW-2026-0099',
        department: 'CA / Commerce',
        checkInTime: '02:00 PM',
        checkOutTime: '06:30 PM',
        durationFormatted: '4h 30m',
        registrationMethod: 'Admin Manual Check-in',
        wasCrossOccupied: true,
        notes: 'Assigned student permitted peer to use seat for evening mock test.',
      },
    ];

    // Seed audit logs
    this.auditStore[tenantId] = [
      {
        id: 'audit-1',
        seatNumber: 4,
        deskLabel: 'D-04',
        tenantId,
        action: 'seat_qr_checkin',
        actionLabel: 'Student QR Scan',
        performedBy: 'Aarav Patel (STU-BW-0021)',
        timestamp: '10:14 AM, Today',
        details: 'Scanned desk stand QR. Flagged as cross-occupancy (assigned to Rohan Verma).',
      },
      {
        id: 'audit-2',
        seatNumber: 14,
        deskLabel: 'D-14',
        tenantId,
        action: 'manual_assign',
        actionLabel: 'Manual Admin Assignment',
        performedBy: 'Admin (Civil Lines Branch)',
        timestamp: '02:00 PM, Yesterday',
        details: 'Manually authorized Kunal Deshmukh to sit at D-14 for mock test session.',
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // 1. READ METHODS
  // ---------------------------------------------------------------------------
  public getSeat(tenantId: string, seatNumber: number): SeatOccupancyItem | undefined {
    this.ensureTenant(tenantId);
    return this.occupancyStore[tenantId]?.[seatNumber];
  }

  public getAllSeats(tenantId: string): Record<number, SeatOccupancyItem> {
    this.ensureTenant(tenantId);
    return this.occupancyStore[tenantId] || {};
  }

  public getHistory(tenantId: string, seatNumber?: number): SeatOccupancyHistoryRecord[] {
    this.ensureTenant(tenantId);
    const list = this.historyStore[tenantId] || [];
    if (seatNumber) {
      return list.filter((item) => item.seatNumber === seatNumber);
    }
    return list;
  }

  public getAuditLogs(tenantId: string, seatNumber?: number): SeatOccupancyAuditLog[] {
    this.ensureTenant(tenantId);
    const list = this.auditStore[tenantId] || [];
    if (seatNumber) {
      return list.filter((item) => item.seatNumber === seatNumber);
    }
    return list;
  }

  public getSeatHistory(tenantId: string, seatNumber: number): SeatOccupancyHistoryRecord[] {
    return this.getHistory(tenantId, seatNumber);
  }

  public getSeatAuditLogs(tenantId: string, seatNumber: number): SeatOccupancyAuditLog[] {
    return this.getAuditLogs(tenantId, seatNumber);
  }

  // Analytics on frequently cross-occupied seats
  public getCrossSeatAnalytics(tenantId: string) {
    this.ensureTenant(tenantId);
    const history = this.historyStore[tenantId] || [];
    const counts: Record<number, number> = {};

    history.forEach((h) => {
      if (h.wasCrossOccupied) {
        counts[h.seatNumber] = (counts[h.seatNumber] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([seatNo, count]) => ({
        seatNumber: Number(seatNo),
        deskLabel: `D-${Number(seatNo) < 10 ? '0' : ''}${seatNo}`,
        mismatchCount: count,
      }))
      .sort((a, b) => b.mismatchCount - a.mismatchCount);
  }

  // ---------------------------------------------------------------------------
  // 2. MUTATION & ACTION METHODS (ENFORCING BUSINESS RULES)
  // ---------------------------------------------------------------------------

  /**
   * Manually assign an occupant to a seat.
   * Business Rules:
   * 1. If this student is currently occupying another seat in this library, release it first!
   * 2. If seat is already occupied by someone else, end their session and archive to history.
   * 3. Do NOT overwrite assigned student info.
   * 4. Record in audit log.
   */
  public manuallyAssignOccupant(
    tenantId: string,
    seatNumber: number,
    student: { studentId: string; name: string; department?: string; phone?: string },
    performedBy: string = 'Admin',
    notes?: string
  ): { success: boolean; message: string; seat: SeatOccupancyItem } {
    this.ensureTenant(tenantId);
    const seats = this.occupancyStore[tenantId];
    const targetSeat = seats[seatNumber];
    if (!targetSeat) {
      throw new Error(`Desk ${seatNumber} not found.`);
    }

    // Rule 1: Prevent one student from occupying multiple seats simultaneously
    for (const [sNoStr, sItem] of Object.entries(seats)) {
      const sNo = Number(sNoStr);
      if (sNo !== seatNumber && sItem.occupyingStudent?.studentId === student.studentId) {
        // Automatically release old seat
        this.releaseSeat(
          tenantId,
          sNo,
          performedBy,
          `Auto-released: Student moved to Desk ${targetSeat.deskLabel}`
        );
      }
    }

    // Rule 2: If target seat was already occupied, end previous session
    if (targetSeat.occupyingStudent) {
      this.archiveToHistory(tenantId, targetSeat, 'New occupant assigned by admin');
    }

    const now = Date.now();
    const isAssignedSame = targetSeat.assignedStudent?.studentId === student.studentId;
    const isCross = !isAssignedSame;

    const occupyingStudent: OccupyingStudentInfo = {
      studentId: student.studentId,
      name: student.name,
      department: student.department || 'General Library',
      phone: student.phone || '+91 98765 43210',
      checkInTime: getFormattedTime(),
      checkInDate: getFormattedDate(),
      checkInEpoch: now,
      durationMinutes: 0,
      durationFormatted: 'Just now',
      registrationMethod: 'manual_admin',
      verifiedGate: 'Admin Console Desk Allocation',
      notes: notes || (isCross ? 'Assigned by admin to non-allocated seat.' : 'Admin confirmed check-in.'),
    };

    targetSeat.occupyingStudent = occupyingStudent;
    targetSeat.isCrossOccupied = isCross;
    targetSeat.status = isCross ? 'occupied_another' : 'occupied_assigned';
    targetSeat.statusLabel = isCross ? 'Occupied by Another Student' : 'Occupied by Assigned Student';
    targetSeat.powerSocketDrawing = true;
    targetSeat.readingLightOn = true;
    targetSeat.lastUpdated = 'Just now';

    // Log Audit
    this.addAuditLog(tenantId, {
      seatNumber,
      deskLabel: targetSeat.deskLabel,
      action: 'manual_assign',
      actionLabel: 'Manual Seat Assignment',
      performedBy,
      details: `${student.name} (${student.studentId}) assigned as current occupant.${isCross ? ' Flagged as cross-occupancy.' : ''}`,
    });

    return {
      success: true,
      message: `Occupancy registered: ${student.name} is now seated at ${targetSeat.deskLabel}.`,
      seat: targetSeat,
    };
  }

  /**
   * Release seat manually (Check-out / Vacate).
   * Business Rules:
   * 1. Preserves historical session record with duration and timestamps.
   * 2. Preserves assigned student information.
   * 3. Sets seat status to Available (or Reserved if assigned student has reserved pass).
   * 4. Logs audit entry.
   */
  public releaseSeat(
    tenantId: string,
    seatNumber: number,
    performedBy: string = 'Admin',
    reason: string = 'Desk vacated'
  ): { success: boolean; message: string; seat: SeatOccupancyItem } {
    this.ensureTenant(tenantId);
    const targetSeat = this.occupancyStore[tenantId]?.[seatNumber];
    if (!targetSeat) {
      throw new Error(`Desk ${seatNumber} not found.`);
    }

    if (targetSeat.occupyingStudent) {
      this.archiveToHistory(tenantId, targetSeat, reason);
    }

    const previousOccupantName = targetSeat.occupyingStudent?.name || 'Occupant';
    targetSeat.occupyingStudent = undefined;
    targetSeat.isCrossOccupied = false;
    targetSeat.status = 'available';
    targetSeat.statusLabel = targetSeat.assignedStudent ? 'Available (Assigned Student Absent)' : 'Available';
    targetSeat.powerSocketDrawing = false;
    targetSeat.readingLightOn = false;
    targetSeat.lastUpdated = 'Just now';

    // Log Audit
    this.addAuditLog(tenantId, {
      seatNumber,
      deskLabel: targetSeat.deskLabel,
      action: 'manual_release',
      actionLabel: 'Desk Released',
      performedBy,
      details: `${previousOccupantName} checked out from ${targetSeat.deskLabel}. Reason: ${reason}.`,
    });

    return {
      success: true,
      message: `${targetSeat.deskLabel} is now vacant. Session archived to history.`,
      seat: targetSeat,
    };
  }

  /**
   * Correct an incorrect occupancy record (Quick Swap or Identity Correction)
   */
  public correctOccupancy(
    tenantId: string,
    seatNumber: number,
    newStudent: { studentId: string; name: string; department?: string; phone?: string },
    performedBy: string = 'Admin',
    notes: string = 'Identity corrected by admin'
  ): { success: boolean; message: string; seat: SeatOccupancyItem } {
    this.ensureTenant(tenantId);
    const targetSeat = this.occupancyStore[tenantId]?.[seatNumber];
    if (!targetSeat) throw new Error(`Desk ${seatNumber} not found.`);

    const oldName = targetSeat.occupyingStudent?.name || 'Previous';
    const isAssignedSame = targetSeat.assignedStudent?.studentId === newStudent.studentId;
    const isCross = !isAssignedSame;

    if (targetSeat.occupyingStudent) {
      targetSeat.occupyingStudent.studentId = newStudent.studentId;
      targetSeat.occupyingStudent.name = newStudent.name;
      targetSeat.occupyingStudent.department = newStudent.department || targetSeat.occupyingStudent.department;
      targetSeat.occupyingStudent.phone = newStudent.phone || targetSeat.occupyingStudent.phone;
      targetSeat.occupyingStudent.notes = notes;
    } else {
      return this.manuallyAssignOccupant(tenantId, seatNumber, newStudent, performedBy, notes);
    }

    targetSeat.isCrossOccupied = isCross;
    targetSeat.status = isCross ? 'occupied_another' : 'occupied_assigned';
    targetSeat.statusLabel = isCross ? 'Occupied by Another Student' : 'Occupied by Assigned Student';
    targetSeat.lastUpdated = 'Just now';

    this.addAuditLog(tenantId, {
      seatNumber,
      deskLabel: targetSeat.deskLabel,
      action: 'correct_record',
      actionLabel: 'Occupancy Record Corrected',
      performedBy,
      details: `Replaced occupant record from ${oldName} to ${newStudent.name}.`,
    });

    return {
      success: true,
      message: `Record corrected for ${targetSeat.deskLabel}: ${newStudent.name} is verified occupant.`,
      seat: targetSeat,
    };
  }

  /**
   * Toggle maintenance status on desk
   */
  public toggleMaintenance(
    tenantId: string,
    seatNumber: number,
    isMaintenance: boolean,
    reason: string = 'Scheduled cleaning / electrical maintenance',
    performedBy: string = 'Admin'
  ) {
    this.ensureTenant(tenantId);
    const targetSeat = this.occupancyStore[tenantId]?.[seatNumber];
    if (!targetSeat) return;

    if (isMaintenance && targetSeat.occupyingStudent) {
      this.releaseSeat(tenantId, seatNumber, performedBy, 'Desk placed under maintenance');
    }

    targetSeat.status = isMaintenance ? 'maintenance' : 'available';
    targetSeat.statusLabel = isMaintenance ? 'Maintenance / Blocked' : 'Available';
    targetSeat.maintenanceReason = isMaintenance ? reason : undefined;
    targetSeat.lastUpdated = 'Just now';

    this.addAuditLog(tenantId, {
      seatNumber,
      deskLabel: targetSeat.deskLabel,
      action: 'toggle_maintenance',
      actionLabel: isMaintenance ? 'Set to Maintenance' : 'Cleared Maintenance',
      performedBy,
      details: isMaintenance ? `Desk blocked: ${reason}` : 'Desk restored to active pool.',
    });
  }

  /**
   * Register seat occupancy via QR code scan (Student or Kiosk scan)
   */
  public registerSeatQRScan(
    tenantId: string,
    seatNumber: number,
    student: { id: string; name: string; department?: string; phone?: string }
  ): { success: boolean; message: string; seat: SeatOccupancyItem } {
    return this.manuallyAssignOccupant(
      tenantId,
      seatNumber,
      {
        studentId: student.id,
        name: student.name,
        department: student.department,
        phone: student.phone,
      },
      `${student.name} (QR Scanner)`,
      'Scanned physical seat stand QR code.'
    );
  }

  // ---------------------------------------------------------------------------
  // 3. PRIVATE HELPERS
  // ---------------------------------------------------------------------------
  private archiveToHistory(tenantId: string, seat: SeatOccupancyItem, reason: string) {
    if (!seat.occupyingStudent) return;
    const now = Date.now();
    const durationFormatted = formatDuration(seat.occupyingStudent.checkInEpoch, now);

    const record: SeatOccupancyHistoryRecord = {
      id: `hist_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      seatNumber: seat.seatNumber,
      deskLabel: seat.deskLabel,
      tenantId,
      date: seat.occupyingStudent.checkInDate || getFormattedDate(),
      assignedStudentName: seat.assignedStudent?.name || 'Unassigned',
      assignedStudentId: seat.assignedStudent?.studentId,
      occupyingStudentName: seat.occupyingStudent.name,
      occupyingStudentId: seat.occupyingStudent.studentId,
      department: seat.occupyingStudent.department,
      checkInTime: seat.occupyingStudent.checkInTime,
      checkOutTime: getFormattedTime(),
      durationFormatted,
      registrationMethod:
        seat.occupyingStudent.registrationMethod === 'seat_qr'
          ? 'Seat QR Code Stand'
          : 'Manual Admin Assignment',
      wasCrossOccupied: seat.isCrossOccupied,
      notes: reason,
    };

    if (!this.historyStore[tenantId]) {
      this.historyStore[tenantId] = [];
    }
    this.historyStore[tenantId].unshift(record);
  }

  private addAuditLog(
    tenantId: string,
    log: Omit<SeatOccupancyAuditLog, 'id' | 'timestamp' | 'tenantId'>
  ) {
    if (!this.auditStore[tenantId]) {
      this.auditStore[tenantId] = [];
    }
    const fullLog: SeatOccupancyAuditLog = {
      tenantId,
      ...log,
      id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: `${getFormattedTime()}, ${getFormattedDate()}`,
    };
    this.auditStore[tenantId].unshift(fullLog);
  }

  private ensureTenant(tenantId: string) {
    if (!this.occupancyStore[tenantId]) {
      this.initializeTenantSeeds(tenantId);
    }
  }
}

export const seatOccupancyService = new SeatOccupancyService();

