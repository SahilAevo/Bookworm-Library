import { LibraryTenant, DEFAULT_TENANT } from '@/constants/tenants';

export type AttendanceMode = 'static' | 'dynamic';
export type AttendancePolicy = 'once_per_day' | 'once_per_session' | 'every_visit';
export type AttendanceRecordStatus = 'present' | 'checked_out' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  department: string;
  deskNo: string;
  shift: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM AM/PM
  checkOutTime?: string; // HH:MM AM/PM
  durationMinutes?: number;
  status: AttendanceRecordStatus;
  method: 'static_qr' | 'dynamic_qr';
  qrCodeId: string;
  verifiedLocation?: boolean;
}

export interface StaticQRCodeConfig {
  id: string;
  tenantId: string;
  token: string;
  label: string;
  createdAt: string;
  validUntil: string;
  validityDays: number;
  status: 'active' | 'expired' | 'revoked';
  downloadCount: number;
  lastScannedAt?: string;
  locationTag?: string;
}

export interface DynamicQRSession {
  sessionId: string;
  tenantId: string;
  title: string;
  status: 'active' | 'paused' | 'stopped';
  refreshIntervalSeconds: number; // e.g. 15, 30, 60
  currentToken: string;
  tokenExpiresAt: number; // epoch ms
  startedAt: string;
  totalScans: number;
}

export interface TenantAttendanceSettings {
  tenantId: string;
  preferredMode: AttendanceMode;
  policy: AttendancePolicy;
  trackEntryExit: boolean;
  enforceShiftTimings: boolean;
  lateThresholdMinutes: number;
  openingTime: string;
  closingTime: string;
  allowWifiVerification: boolean;
  wifiSSID?: string;
  allowLocationVerification: boolean;
  dynamicRefreshInterval: number;
}

// Initial default attendance settings per tenant
export const DEFAULT_ATTENDANCE_SETTINGS: Record<string, TenantAttendanceSettings> = {
  'bookworm-main': {
    tenantId: 'bookworm-main',
    preferredMode: 'static',
    policy: 'every_visit',
    trackEntryExit: true,
    enforceShiftTimings: true,
    lateThresholdMinutes: 20,
    openingTime: '06:00 AM',
    closingTime: '10:00 PM',
    allowWifiVerification: true,
    wifiSSID: 'Bookworm-Student-5G',
    allowLocationVerification: false,
    dynamicRefreshInterval: 30,
  },
  'apex-study': {
    tenantId: 'apex-study',
    preferredMode: 'dynamic',
    policy: 'once_per_day',
    trackEntryExit: false,
    enforceShiftTimings: false,
    lateThresholdMinutes: 30,
    openingTime: '07:00 AM',
    closingTime: '09:00 PM',
    allowWifiVerification: false,
    allowLocationVerification: false,
    dynamicRefreshInterval: 20,
  },
  'scholars-den': {
    tenantId: 'scholars-den',
    preferredMode: 'dynamic',
    policy: 'every_visit',
    trackEntryExit: true,
    enforceShiftTimings: true,
    lateThresholdMinutes: 15,
    openingTime: '06:00 AM',
    closingTime: '11:00 PM',
    allowWifiVerification: true,
    wifiSSID: 'ScholarsDen-Secure',
    allowLocationVerification: true,
    dynamicRefreshInterval: 15,
  },
};

// Seed student database for tenant verification
export interface RegisteredStudent {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  deskNo: string;
  shift: string;
  activePass: boolean;
}

export const SEED_STUDENTS: RegisteredStudent[] = [
  { id: 'BW-2026-0014', tenantId: 'bookworm-main', name: 'Rohan Verma', email: 'rohan.v@gmail.com', phone: '+91 98214 55102', department: 'UPSC Civil Services', deskNo: 'D-01', shift: 'Morning Shift', activePass: true },
  { id: 'BW-2026-0021', tenantId: 'bookworm-main', name: 'Aarav Patel', email: 'aarav.p@yahoo.com', phone: '+91 98112 34491', department: 'Engineering / GATE', deskNo: 'D-02', shift: 'Morning Shift', activePass: true },
  { id: 'BW-2026-0035', tenantId: 'bookworm-main', name: 'Priya Sharma', email: 'priya.sharma@outlook.com', phone: '+91 98334 11209', department: 'Medical / NEET-PG', deskNo: 'D-03', shift: 'Morning Shift', activePass: true },
  { id: 'BW-2026-0042', tenantId: 'bookworm-main', name: 'Aman Deep Sharma', email: 'aman.deep@gmail.com', phone: '+91 98450 67123', department: 'Judiciary / Law', deskNo: 'D-08', shift: 'Full Day (24/7)', activePass: true },
  { id: 'BW-2026-0056', tenantId: 'bookworm-main', name: 'Sneha Kulkarni', email: 'sneha.k@gmail.com', phone: '+91 99201 88342', department: 'CA / Commerce', deskNo: 'D-14', shift: 'Evening Shift', activePass: true },
  { id: 'BW-2026-0063', tenantId: 'bookworm-main', name: 'Ananya Deshmukh', email: 'ananya.d@gmail.com', phone: '+91 98765 43210', department: 'Humanities & Research', deskNo: 'D-18', shift: 'Full Day (24/7)', activePass: true },
  { id: 'BW-2026-0077', tenantId: 'bookworm-main', name: 'Vikramaditya Rao', email: 'vikram.rao@gmail.com', phone: '+91 97654 32109', department: 'UPSC Civil Services', deskNo: 'D-22', shift: 'Evening Shift', activePass: true },
  { id: 'BW-2026-0084', tenantId: 'bookworm-main', name: 'Devendra Meena', email: 'dev.meena@gmail.com', phone: '+91 96543 21098', department: 'Engineering / GATE', deskNo: 'D-25', shift: 'Morning Shift', activePass: true },
  // Apex Study Hub students
  { id: 'APX-2026-0011', tenantId: 'apex-study', name: 'Kavita Chawla', email: 'kavita.c@gmail.com', phone: '+91 98111 22334', department: 'Medical / NEET-UG', deskNo: 'A-04', shift: 'Morning Shift', activePass: true },
  { id: 'APX-2026-0022', tenantId: 'apex-study', name: 'Sameer Khan', email: 'sameer.k@gmail.com', phone: '+91 98222 33445', department: 'Chartered Accountancy', deskNo: 'A-12', shift: 'Evening Shift', activePass: true },
  // Scholar's Den students
  { id: 'SD-2026-0005', tenantId: 'scholars-den', name: 'Arjun Nambiar', email: 'arjun.n@gmail.com', phone: '+91 99333 44556', department: 'Data Science & AI', deskNo: 'SD-01', shift: 'Full Day (24/7)', activePass: true },
];

// Helper to generate today's date formatted
const getTodayFormatted = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Seed initial attendance records
export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att-101',
    tenantId: 'bookworm-main',
    studentId: 'BW-2026-0014',
    studentName: 'Rohan Verma',
    department: 'UPSC Civil Services',
    deskNo: 'D-01',
    shift: 'Morning Shift',
    date: getTodayFormatted(),
    checkInTime: '06:05 AM',
    checkOutTime: undefined, // Currently inside
    status: 'present',
    method: 'static_qr',
    qrCodeId: 'qr-bw-static-01',
  },
  {
    id: 'att-102',
    tenantId: 'bookworm-main',
    studentId: 'BW-2026-0021',
    studentName: 'Aarav Patel',
    department: 'Engineering / GATE',
    deskNo: 'D-02',
    shift: 'Morning Shift',
    date: getTodayFormatted(),
    checkInTime: '06:14 AM',
    checkOutTime: '01:45 PM',
    durationMinutes: 451,
    status: 'checked_out',
    method: 'static_qr',
    qrCodeId: 'qr-bw-static-01',
  },
  {
    id: 'att-103',
    tenantId: 'bookworm-main',
    studentId: 'BW-2026-0035',
    studentName: 'Priya Sharma',
    department: 'Medical / NEET-PG',
    deskNo: 'D-03',
    shift: 'Morning Shift',
    date: getTodayFormatted(),
    checkInTime: '06:30 AM',
    checkOutTime: undefined,
    status: 'present',
    method: 'static_qr',
    qrCodeId: 'qr-bw-static-01',
  },
  {
    id: 'att-104',
    tenantId: 'bookworm-main',
    studentId: 'BW-2026-0042',
    studentName: 'Aman Deep Sharma',
    department: 'Judiciary / Law',
    deskNo: 'D-08',
    shift: 'Full Day (24/7)',
    date: getTodayFormatted(),
    checkInTime: '07:05 AM',
    checkOutTime: undefined,
    status: 'present',
    method: 'dynamic_qr',
    qrCodeId: 'dyn-session-bw-01',
  },
  {
    id: 'att-105',
    tenantId: 'bookworm-main',
    studentId: 'BW-2026-0056',
    studentName: 'Sneha Kulkarni',
    department: 'CA / Commerce',
    deskNo: 'D-14',
    shift: 'Evening Shift',
    date: getTodayFormatted(),
    checkInTime: '02:15 PM',
    checkOutTime: '06:30 PM',
    durationMinutes: 255,
    status: 'checked_out',
    method: 'static_qr',
    qrCodeId: 'qr-bw-static-01',
  },
  {
    id: 'att-106',
    tenantId: 'bookworm-main',
    studentId: 'BW-2026-0063',
    studentName: 'Ananya Deshmukh',
    department: 'Humanities & Research',
    deskNo: 'D-18',
    shift: 'Full Day (24/7)',
    date: getTodayFormatted(),
    checkInTime: '06:45 AM',
    checkOutTime: undefined,
    status: 'present',
    method: 'static_qr',
    qrCodeId: 'qr-bw-static-01',
  },
  {
    id: 'att-107',
    tenantId: 'bookworm-main',
    studentId: 'BW-2026-0077',
    studentName: 'Vikramaditya Rao',
    department: 'UPSC Civil Services',
    deskNo: 'D-22',
    shift: 'Evening Shift',
    date: getTodayFormatted(),
    checkInTime: '03:10 PM',
    checkOutTime: undefined,
    status: 'late',
    method: 'dynamic_qr',
    qrCodeId: 'dyn-session-bw-01',
  },
  {
    id: 'att-108',
    tenantId: 'bookworm-main',
    studentId: 'BW-2026-0084',
    studentName: 'Devendra Meena',
    department: 'Engineering / GATE',
    deskNo: 'D-25',
    shift: 'Morning Shift',
    date: getTodayFormatted(),
    checkInTime: '06:10 AM',
    checkOutTime: '02:00 PM',
    durationMinutes: 470,
    status: 'checked_out',
    method: 'static_qr',
    qrCodeId: 'qr-bw-static-01',
  },
];

// In-Memory Multi-Tenant Store & Management Class
class AttendanceService {
  private records: AttendanceRecord[] = [...INITIAL_ATTENDANCE_RECORDS];
  private settings: Record<string, TenantAttendanceSettings> = { ...DEFAULT_ATTENDANCE_SETTINGS };

  // Static QR Codes repository
  private staticQRs: Record<string, StaticQRCodeConfig[]> = {
    'bookworm-main': [
      {
        id: 'qr-bw-static-01',
        tenantId: 'bookworm-main',
        token: 'LIBX-SECURE-STATIC-BW-MAIN-2026-A1F9',
        label: 'Main Gate & Study Entrance Pass',
        createdAt: '2026-11-01',
        validUntil: '2026-11-30',
        validityDays: 30,
        status: 'active',
        downloadCount: 4,
        lastScannedAt: 'Today, 03:10 PM',
        locationTag: 'Main Door Entrance Poster',
      },
      {
        id: 'qr-bw-static-old',
        tenantId: 'bookworm-main',
        token: 'LIBX-SECURE-STATIC-BW-OCT-9981',
        label: 'October Ground Floor Entrance (Archived)',
        createdAt: '2026-10-01',
        validUntil: '2026-10-31',
        validityDays: 30,
        status: 'expired',
        downloadCount: 2,
        lastScannedAt: '31 Oct 2026, 09:45 PM',
        locationTag: 'Archived Entrance',
      },
    ],
    'apex-study': [
      {
        id: 'qr-apx-static-01',
        tenantId: 'apex-study',
        token: 'LIBX-SECURE-STATIC-APX-DELHI-4421',
        label: 'Apex Reception Standee QR',
        createdAt: '2026-11-01',
        validUntil: '2026-11-15',
        validityDays: 15,
        status: 'active',
        downloadCount: 1,
        lastScannedAt: 'Today, 09:12 AM',
        locationTag: 'Reception Desk',
      },
    ],
    'scholars-den': [
      {
        id: 'qr-sd-static-01',
        tenantId: 'scholars-den',
        token: 'LIBX-SECURE-STATIC-SCHOLAR-BLR-8812',
        label: 'Front Turnstile Scanner QR',
        createdAt: '2026-11-01',
        validUntil: '2026-11-30',
        validityDays: 30,
        status: 'active',
        downloadCount: 3,
        lastScannedAt: 'Today, 08:30 AM',
        locationTag: 'Turnstile A',
      },
    ],
  };

  // Dynamic QR Sessions
  private dynamicSessions: Record<string, DynamicQRSession> = {
    'bookworm-main': {
      sessionId: 'dyn-session-bw-01',
      tenantId: 'bookworm-main',
      title: 'Morning Focus & Kiosk Live Session',
      status: 'active',
      refreshIntervalSeconds: 30,
      currentToken: 'LIBX-DYN-BW-9921-' + Math.floor(Date.now() / 30000),
      tokenExpiresAt: Date.now() + 30000,
      startedAt: '06:00 AM',
      totalScans: 28,
    },
    'apex-study': {
      sessionId: 'dyn-session-apx-01',
      tenantId: 'apex-study',
      title: 'Entrance Tablet Dynamic Mode',
      status: 'active',
      refreshIntervalSeconds: 20,
      currentToken: 'LIBX-DYN-APX-3312-' + Math.floor(Date.now() / 20000),
      tokenExpiresAt: Date.now() + 20000,
      startedAt: '07:00 AM',
      totalScans: 14,
    },
    'scholars-den': {
      sessionId: 'dyn-session-sd-01',
      tenantId: 'scholars-den',
      title: 'Kiosk Security Dynamic Session',
      status: 'active',
      refreshIntervalSeconds: 15,
      currentToken: 'LIBX-DYN-SD-8811-' + Math.floor(Date.now() / 15000),
      tokenExpiresAt: Date.now() + 15000,
      startedAt: '06:30 AM',
      totalScans: 39,
    },
  };

  // ---------------------------------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------------------------------
  getSettings(tenantId: string): TenantAttendanceSettings {
    if (!this.settings[tenantId]) {
      this.settings[tenantId] = {
        tenantId,
        preferredMode: 'static',
        policy: 'every_visit',
        trackEntryExit: true,
        enforceShiftTimings: true,
        lateThresholdMinutes: 20,
        openingTime: '06:00 AM',
        closingTime: '10:00 PM',
        allowWifiVerification: true,
        allowLocationVerification: false,
        dynamicRefreshInterval: 30,
      };
    }
    return { ...this.settings[tenantId] };
  }

  updateSettings(tenantId: string, update: Partial<TenantAttendanceSettings>): TenantAttendanceSettings {
    const current = this.getSettings(tenantId);
    this.settings[tenantId] = { ...current, ...update };
    return { ...this.settings[tenantId] };
  }

  // ---------------------------------------------------------------------------
  // STATIC QR CODES
  // ---------------------------------------------------------------------------
  getStaticQRCodes(tenantId: string): StaticQRCodeConfig[] {
    return this.staticQRs[tenantId] || [];
  }

  getActiveStaticQR(tenantId: string): StaticQRCodeConfig | undefined {
    return (this.staticQRs[tenantId] || []).find((q) => q.status === 'active');
  }

  generateStaticQR(
    tenantId: string,
    label: string,
    validityDays: number,
    locationTag: string = 'Entrance Standee'
  ): StaticQRCodeConfig {
    const list = this.staticQRs[tenantId] || [];
    // Mark previous active static QRs as revoked or archived
    const updated = list.map((q) => (q.status === 'active' ? { ...q, status: 'revoked' as const } : q));

    const now = new Date();
    const expiry = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
    const y = expiry.getFullYear();
    const m = String(expiry.getMonth() + 1).padStart(2, '0');
    const d = String(expiry.getDate()).padStart(2, '0');
    const validUntil = `${y}-${m}-${d}`;

    const randomSecret = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newQR: StaticQRCodeConfig = {
      id: `qr-${tenantId}-${Date.now()}`,
      tenantId,
      token: `LIBX-SECURE-STATIC-${tenantId.toUpperCase()}-${validityDays}D-${randomSecret}`,
      label,
      createdAt: getTodayFormatted(),
      validUntil,
      validityDays,
      status: 'active',
      downloadCount: 0,
      locationTag,
    };

    this.staticQRs[tenantId] = [newQR, ...updated];
    return newQR;
  }

  extendStaticQRValidity(tenantId: string, qrId: string, additionalDays: number): boolean {
    const list = this.staticQRs[tenantId] || [];
    const target = list.find((q) => q.id === qrId);
    if (!target) return false;

    const currentExpiry = new Date(target.validUntil);
    const newExpiry = new Date(currentExpiry.getTime() + additionalDays * 24 * 60 * 60 * 1000);
    const y = newExpiry.getFullYear();
    const m = String(newExpiry.getMonth() + 1).padStart(2, '0');
    const d = String(newExpiry.getDate()).padStart(2, '0');

    target.validUntil = `${y}-${m}-${d}`;
    target.validityDays += additionalDays;
    if (target.status === 'expired') target.status = 'active';

    return true;
  }

  revokeStaticQR(tenantId: string, qrId: string): boolean {
    const list = this.staticQRs[tenantId] || [];
    const target = list.find((q) => q.id === qrId);
    if (!target) return false;
    target.status = 'revoked';
    return true;
  }

  // ---------------------------------------------------------------------------
  // DYNAMIC QR SESSIONS
  // ---------------------------------------------------------------------------
  getDynamicSession(tenantId: string): DynamicQRSession {
    let session = this.dynamicSessions[tenantId];
    if (!session) {
      session = {
        sessionId: `dyn-session-${tenantId}`,
        tenantId,
        title: 'Entrance Tablet Live Session',
        status: 'active',
        refreshIntervalSeconds: 30,
        currentToken: `LIBX-DYN-${tenantId.toUpperCase()}-${Math.floor(Date.now() / 30000)}`,
        tokenExpiresAt: Date.now() + 30000,
        startedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        totalScans: 0,
      };
      this.dynamicSessions[tenantId] = session;
    }

    // Check if token expired and auto-refresh if session is active
    if (session.status === 'active' && Date.now() >= session.tokenExpiresAt) {
      const intervalMs = session.refreshIntervalSeconds * 1000;
      const bucket = Math.floor(Date.now() / intervalMs);
      const secretNonce = Math.random().toString(36).substring(2, 6).toUpperCase();
      session.currentToken = `LIBX-DYN-${tenantId.toUpperCase()}-${bucket}-${secretNonce}`;
      session.tokenExpiresAt = Date.now() + intervalMs;
    }

    return { ...session };
  }

  startDynamicSession(tenantId: string, refreshInterval?: number): DynamicQRSession {
    const session = this.getDynamicSession(tenantId);
    const interval = refreshInterval || session.refreshIntervalSeconds || 30;
    session.status = 'active';
    session.refreshIntervalSeconds = interval;
    session.tokenExpiresAt = Date.now() + interval * 1000;
    session.currentToken = `LIBX-DYN-${tenantId.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    return { ...session };
  }

  pauseDynamicSession(tenantId: string): DynamicQRSession {
    const session = this.getDynamicSession(tenantId);
    session.status = 'paused';
    return { ...session };
  }

  stopDynamicSession(tenantId: string): DynamicQRSession {
    const session = this.getDynamicSession(tenantId);
    session.status = 'stopped';
    return { ...session };
  }

  // ---------------------------------------------------------------------------
  // ATTENDANCE SCAN VALIDATION & REGISTRATION ENGINE
  // ---------------------------------------------------------------------------
  registerScan(
    tenantId: string,
    studentId: string,
    rawScannedPayload: string
  ): {
    success: boolean;
    message: string;
    action?: 'check_in' | 'check_out';
    record?: AttendanceRecord;
    errorType?: 'invalid_qr' | 'expired_qr' | 'revoked_qr' | 'session_inactive' | 'student_unauthorized' | 'policy_violation' | 'already_checked_out';
  } {
    const cleanPayload = rawScannedPayload.trim();
    const settings = this.getSettings(tenantId);

    // 1. Authenticate Student & Tenant Membership
    const student = SEED_STUDENTS.find((s) => s.id === studentId);
    if (!student) {
      return {
        success: false,
        message: `Student ID "${studentId}" is not registered in the system.`,
        errorType: 'student_unauthorized',
      };
    }

    if (student.tenantId !== tenantId) {
      return {
        success: false,
        message: `Student ${student.name} (${student.id}) is enrolled in another library. Access to this library is not authorized.`,
        errorType: 'student_unauthorized',
      };
    }

    if (!student.activePass) {
      return {
        success: false,
        message: `Student membership pass is expired or inactive. Please contact the librarian.`,
        errorType: 'student_unauthorized',
      };
    }

    // 2. Validate QR Code Payload (Static vs Dynamic)
    let validatedMethod: 'static_qr' | 'dynamic_qr' = 'static_qr';
    let validatedQRId = '';

    // Check Static QR
    const staticList = this.getStaticQRCodes(tenantId);
    const matchingStatic = staticList.find((q) => q.token === cleanPayload);

    if (matchingStatic) {
      if (matchingStatic.status === 'revoked') {
        return {
          success: false,
          message: 'This Static QR Code has been revoked by the library administrator. Please ask for the updated code.',
          errorType: 'revoked_qr',
        };
      }
      const expiryDate = new Date(matchingStatic.validUntil + 'T23:59:59');
      if (Date.now() > expiryDate.getTime()) {
        matchingStatic.status = 'expired';
        return {
          success: false,
          message: `This Static QR Code expired on ${matchingStatic.validUntil}. The administrator needs to extend or regenerate it.`,
          errorType: 'expired_qr',
        };
      }
      validatedMethod = 'static_qr';
      validatedQRId = matchingStatic.id;
      matchingStatic.lastScannedAt = 'Just now';
    } else {
      // Check Dynamic QR
      const dynamicSession = this.getDynamicSession(tenantId);
      if (dynamicSession.currentToken === cleanPayload) {
        if (dynamicSession.status !== 'active') {
          return {
            success: false,
            message: `The live dynamic attendance session is currently ${dynamicSession.status.toUpperCase()}.`,
            errorType: 'session_inactive',
          };
        }
        if (Date.now() > dynamicSession.tokenExpiresAt + 4000) {
          // 4s grace for network latency
          return {
            success: false,
            message: 'This dynamic QR code token has expired. Please scan the current refreshed code on the screen.',
            errorType: 'expired_qr',
          };
        }
        validatedMethod = 'dynamic_qr';
        validatedQRId = dynamicSession.sessionId;
        dynamicSession.totalScans += 1;
      } else {
        return {
          success: false,
          message: 'Invalid QR Code. This code does not belong to an active LibX attendance terminal for this library.',
          errorType: 'invalid_qr',
        };
      }
    }

    // 3. Apply Attendance Policies (Once Per Day, Once Per Session, Every Visit)
    const today = getTodayFormatted();
    const studentTodayRecords = this.records.filter(
      (r) => r.tenantId === tenantId && r.studentId === studentId && r.date === today
    );

    const currentTimeString = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Check if student is currently inside (has an active check-in with no check-out)
    const activeVisit = studentTodayRecords.find((r) => r.status === 'present' || !r.checkOutTime);

    if (settings.trackEntryExit && activeVisit) {
      // Student is already inside -> This scan is a CHECK-OUT!
      // Calculate duration
      const [inH, inM] = activeVisit.checkInTime.split(/:| /);
      const isPM = activeVisit.checkInTime.includes('PM');
      let checkInHours = parseInt(inH, 10);
      if (isPM && checkInHours !== 12) checkInHours += 12;
      if (!isPM && checkInHours === 12) checkInHours = 0;
      const checkInMinutesTotal = checkInHours * 60 + parseInt(inM, 10);

      const now = new Date();
      const nowMinutesTotal = now.getHours() * 60 + now.getMinutes();
      const diffMinutes = Math.max(1, nowMinutesTotal - checkInMinutesTotal);

      activeVisit.checkOutTime = currentTimeString;
      activeVisit.durationMinutes = diffMinutes;
      activeVisit.status = 'checked_out';

      return {
        success: true,
        action: 'check_out',
        message: `Check-out recorded successfully! Visit duration: ${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}m.`,
        record: { ...activeVisit },
      };
    }

    // It's a new check-in scan. Check Policy rules:
    if (settings.policy === 'once_per_day' && studentTodayRecords.length > 0) {
      return {
        success: false,
        message: `Attendance policy is set to "Once Per Day". Attendance was already recorded today at ${studentTodayRecords[0].checkInTime}.`,
        errorType: 'policy_violation',
      };
    }

    if (settings.policy === 'once_per_session' && studentTodayRecords.length > 0) {
      const lastRecord = studentTodayRecords[studentTodayRecords.length - 1];
      if (lastRecord.qrCodeId === validatedQRId) {
        return {
          success: false,
          message: `Attendance policy is set to "Once Per Session". You already registered for this session at ${lastRecord.checkInTime}.`,
          errorType: 'policy_violation',
        };
      }
    }

    // Determine status (Present vs Late based on threshold)
    const isLate = Math.random() < 0.15; // 15% sample late threshold simulated
    const recordStatus: AttendanceRecordStatus = isLate ? 'late' : 'present';

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenantId,
      studentId: student.id,
      studentName: student.name,
      department: student.department,
      deskNo: student.deskNo,
      shift: student.shift,
      date: today,
      checkInTime: currentTimeString,
      checkOutTime: undefined,
      status: recordStatus,
      method: validatedMethod,
      qrCodeId: validatedQRId,
      verifiedLocation: settings.allowLocationVerification,
    };

    this.records = [newRecord, ...this.records];

    return {
      success: true,
      action: 'check_in',
      message: 'Attendance Successfully Registered!',
      record: newRecord,
    };
  }

  // ---------------------------------------------------------------------------
  // RECORDS RETRIEVAL & QUERYING
  // ---------------------------------------------------------------------------
  getRecords(tenantId: string): AttendanceRecord[] {
    return this.records.filter((r) => r.tenantId === tenantId);
  }

  getStudentRecords(tenantId: string, studentId: string): AttendanceRecord[] {
    return this.records.filter((r) => r.tenantId === tenantId && r.studentId === studentId);
  }

  getOverviewStats(tenantId: string) {
    const tenantRecords = this.getRecords(tenantId);
    const today = getTodayFormatted();
    const todayRecords = tenantRecords.filter((r) => r.date === today);

    // Total registered students for this tenant
    const registeredCount = SEED_STUDENTS.filter((s) => s.tenantId === tenantId).length || 50;

    // Currently inside: status is present or checked_in with no checkOutTime
    const currentlyInside = todayRecords.filter((r) => r.status === 'present' || (r.checkInTime && !r.checkOutTime)).length;

    // Unique students visited today
    const uniqueStudentsToday = new Set(todayRecords.map((r) => r.studentId)).size;

    // Monthly attendance count
    const monthlyTotal = tenantRecords.length * 4 + 48; // Scaled for realistic monthly SaaS volume

    // Average daily attendance
    const avgDaily = Math.round(monthlyTotal / 26);

    return {
      totalRegisteredStudents: registeredCount,
      todayVisits: todayRecords.length,
      currentlyInside,
      uniqueVisitorsToday: uniqueStudentsToday,
      averageDailyAttendance: avgDaily,
      totalAttendanceMonth: monthlyTotal,
      peakHours: '10:00 AM – 01:00 PM',
    };
  }

  getAnalytics(tenantId: string) {
    const records = this.getRecords(tenantId);
    // Department breakdown
    const deptCounts: Record<string, number> = {};
    records.forEach((r) => {
      deptCounts[r.department] = (deptCounts[r.department] || 0) + 1;
    });

    const total = records.length || 1;
    const departmentBreakdown = Object.entries(deptCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100),
    })).sort((a, b) => b.count - a.count);

    // Hourly distribution (6 AM to 10 PM)
    const hourlyVisits = [
      { hour: '06 AM', count: 18 },
      { hour: '07 AM', count: 32 },
      { hour: '08 AM', count: 48 },
      { hour: '09 AM', count: 72 },
      { hour: '10 AM', count: 96 }, // Peak
      { hour: '11 AM', count: 110 }, // Peak
      { hour: '12 PM', count: 105 },
      { hour: '01 PM', count: 88 },
      { hour: '02 PM', count: 64 },
      { hour: '03 PM', count: 52 },
      { hour: '04 PM', count: 68 },
      { hour: '05 PM', count: 82 },
      { hour: '06 PM', count: 74 },
      { hour: '07 PM', count: 58 },
      { hour: '08 PM', count: 42 },
      { hour: '09 PM', count: 26 },
    ];

    // Weekly summary
    const weeklyData = [
      { day: 'Mon', visits: 178, avgDurationHrs: 5.8 },
      { day: 'Tue', visits: 168, avgDurationHrs: 6.2 },
      { day: 'Wed', visits: 186, avgDurationHrs: 6.4, isToday: true },
      { day: 'Thu', visits: 154, avgDurationHrs: 5.6 },
      { day: 'Fri', visits: 162, avgDurationHrs: 5.9 },
      { day: 'Sat', visits: 172, avgDurationHrs: 6.8 },
      { day: 'Sun', visits: 140, avgDurationHrs: 5.2 },
    ];

    // Top visitors
    const visitorFreq: Record<string, { student: RegisteredStudent; visits: number; totalHours: number }> = {};
    SEED_STUDENTS.filter((s) => s.tenantId === tenantId).forEach((s) => {
      visitorFreq[s.id] = { student: s, visits: 24 + (s.id.length % 5), totalHours: 138 + (s.id.length * 8) };
    });

    const topVisitors = Object.values(visitorFreq)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    return {
      departmentBreakdown,
      hourlyVisits,
      weeklyData,
      topVisitors,
      lowAttendancePeriods: 'Sundays (04:00 PM – 07:00 PM) & Early Morning Mondays',
    };
  }
}

export const attendanceService = new AttendanceService();

