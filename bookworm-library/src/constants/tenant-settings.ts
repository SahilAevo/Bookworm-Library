import { LibraryTenant, LIBRARY_TENANTS } from './tenants';

export interface ShiftConfig {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
  badge?: string;
}

export interface SeatCategoryConfig {
  id: string;
  name: string;
  startNo: number;
  endNo: number;
  monthlyFee: number;
  weeklyFee: number;
  dailyFee: number;
  color: string;
  amenities: string[];
}

export interface TenantSettings {
  tenantId: string;
  // A. Profile
  profile: {
    name: string;
    tagline: string;
    description: string;
    type: 'Private Study Hall' | 'Academic & Coaching Library' | 'Public Reading Lounge' | 'Institutional Library' | 'Co-working Hybrid';
    campus: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    email: string;
    phone: string;
    adminName: string;
    adminRole: string;
    regNumber: string;
    website: string;
    instagram: string;
    whatsapp: string;
  };
  // B. Operations
  operations: {
    openTime: string;
    closeTime: string;
    maxDailyHours: number;
    workingDays: string[];
    weeklyOff: string;
    holidays: Array<{ id: string; name: string; date: string }>;
    shifts: ShiftConfig[];
    breakDurationMinutes: number;
    gracePeriodMinutes: number;
  };
  // C. Seats
  seats: {
    totalDesks: number;
    namingPrefix: string;
    categories: SeatCategoryConfig[];
    zones: Array<{ id: string; name: string; capacity: number }>;
  };
  // D. Membership
  membership: {
    registrationFee: number;
    securityDeposit: number;
    plans: Array<{ id: string; name: string; days: number; discountPercent: number; enabled: boolean }>;
    advanceRenewalDays: number;
    expiryGraceDays: number;
    allowSeatChange: boolean;
    requireGovtId: boolean;
    refundPolicy: string;
  };
  // E. Payments
  payments: {
    methods: {
      cash: boolean;
      upi: boolean;
      card: boolean;
      bankTransfer: boolean;
    };
    receiptPrefix: string;
    autoReceipts: boolean;
    enableGst: boolean;
    gstNumber: string;
    lateFeePerDay: number;
    graceDays: number;
    dueDayOfMonth: number;
    remindersBeforeDue: number;
  };
  // F. Attendance
  attendance: {
    primaryMethod: 'qr' | 'manual' | 'biometric' | 'mobile';
    trackEntryExit: boolean;
    enforceShiftTimings: boolean;
    lateArrivalThresholdMins: number;
    autoFlagAbsentDays: number;
    notifyParentsOnCheckin: boolean;
    allowLibrarianEdit: boolean;
  };
  // G. Notifications
  notifications: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    triggers: {
      paymentReminder: boolean;
      membershipExpiry: boolean;
      seatConfirmation: boolean;
      attendanceAlert: boolean;
      announcements: boolean;
    };
    customTemplate: string;
  };
  // H. Portal
  portal: {
    welcomeMessage: string;
    primaryColor: string;
    accentColor: string;
    showPricingToStudents: boolean;
    allowOnlineBooking: boolean;
    modules: {
      seatPass: boolean;
      attendanceHistory: boolean;
      paymentReceipts: boolean;
      notices: boolean;
      examSuite: boolean;
    };
  };
  // I. Modules & Entitlements
  modules: {
    seatManagement: boolean;
    studentManagement: boolean;
    attendanceManagement: boolean;
    feeCollection: boolean;
    notices: boolean;
    reports: boolean;
    examSuite: boolean; // SaaS Entitlement gated
    biometricHardware: boolean;
    whatsappBot: boolean;
    multiBranchHub: boolean;
  };
  // J. Staff
  staff: Array<{
    id: string;
    name: string;
    email: string;
    role: 'Super Administrator' | 'Head Librarian' | 'Receptionist' | 'Accountant';
    status: 'Active' | 'On Leave';
    lastActive: string;
  }>;
  // K. Security
  security: {
    twoFactorAuth: boolean;
    sessionTimeoutMinutes: number;
    dataRetentionYears: number;
    autoCloudBackup: boolean;
    lastBackupTime: string;
  };
  // L. Integrations
  integrations: {
    razorpay: { status: 'connected' | 'disconnected'; keyId: string };
    whatsappCloud: { status: 'connected' | 'disconnected'; phoneId: string };
    twilioSms: { status: 'connected' | 'disconnected'; senderId: string };
    biometricDevice: { status: 'connected' | 'disconnected'; deviceIp: string };
    apiKey: string;
  };
}

// Default Seed Settings for each Library Tenant
export const DEFAULT_TENANT_SETTINGS: Record<string, TenantSettings> = {
  'bookworm-main': {
    tenantId: 'bookworm-main',
    profile: {
      name: 'Bookworm Library',
      tagline: 'Quiet Excellence · Modern Study Pods & Reserved Desks',
      description: 'Premier air-conditioned study hall with high-speed optical fiber, ergonomic desks, and dedicated mock examination zones.',
      type: 'Private Study Hall',
      campus: 'Civil Lines Campus',
      address: 'Plot 42, Kings Way, Near Metro Pillar 114, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302006',
      email: 'support@bookwormlib.com',
      phone: '+91 98231 44512',
      adminName: 'Rajesh Sharma',
      adminRole: 'Head Administrator & Operations Lead',
      regNumber: 'LIBX-RJ-2024-8891',
      website: 'https://bookwormlib.com',
      instagram: '@bookworm_library_jaipur',
      whatsapp: '+91 98231 44512',
    },
    operations: {
      openTime: '06:00 AM',
      closeTime: '10:00 PM',
      maxDailyHours: 16,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weeklyOff: 'None (Open 7 Days)',
      holidays: [
        { id: 'h1', name: 'Republic Day', date: '26 Jan 2026' },
        { id: 'h2', name: 'Independence Day', date: '15 Aug 2026' },
        { id: 'h3', name: 'Diwali Eve', date: '01 Nov 2026' },
      ],
      shifts: [
        { id: 'morning', label: 'Morning Shift', time: '06:00 AM – 02:00 PM', enabled: true },
        { id: 'evening', label: 'Evening Shift', time: '02:00 PM – 10:00 PM', enabled: true },
        { id: 'night', label: 'Night Shift', time: '10:00 PM – 06:00 AM', enabled: true },
        { id: 'fullDay', label: 'Full Day 24/7', time: '06:00 AM – 10:00 PM', enabled: true },
      ],
      breakDurationMinutes: 45,
      gracePeriodMinutes: 15,
    },
    seats: {
      totalDesks: 150,
      namingPrefix: 'D-',
      categories: [
        {
          id: 'exclusive',
          name: 'Exclusive',
          startNo: 1,
          endNo: 50,
          monthlyFee: 2000,
          weeklyFee: 600,
          dailyFee: 120,
          color: '#C4A052',
          amenities: ['Individual Power Socket', 'Private Key Locker', 'Adjustable Ergonomic Chair', 'Reading LED Lamp'],
        },
        {
          id: 'premium',
          name: 'Premium',
          startNo: 51,
          endNo: 80,
          monthlyFee: 1400,
          weeklyFee: 450,
          dailyFee: 90,
          color: '#245C48',
          amenities: ['Power Socket', 'Ergonomic Mesh Chair', 'High-Speed 5G Wi-Fi'],
        },
        {
          id: 'classic',
          name: 'Classic',
          startNo: 81,
          endNo: 150,
          monthlyFee: 800,
          weeklyFee: 250,
          dailyFee: 50,
          color: '#628194',
          amenities: ['Shared Charging Station', 'Standard Study Pod', 'Wi-Fi Access'],
        },
      ],
      zones: [
        { id: 'z1', name: 'Silent Hall Ground Floor', capacity: 80 },
        { id: 'z2', name: 'Executive First Floor Wing', capacity: 50 },
        { id: 'z3', name: 'Discussion & Mock Pods', capacity: 20 },
      ],
    },
    membership: {
      registrationFee: 250,
      securityDeposit: 500,
      plans: [
        { id: 'p1', name: 'Monthly Membership', days: 30, discountPercent: 0, enabled: true },
        { id: 'p2', name: 'Quarterly Pack (3 Months)', days: 90, discountPercent: 5, enabled: true },
        { id: 'p3', name: 'Half-Yearly Pass (6 Months)', days: 180, discountPercent: 10, enabled: true },
        { id: 'p4', name: 'Annual Scholar Membership', days: 365, discountPercent: 20, enabled: true },
      ],
      advanceRenewalDays: 7,
      expiryGraceDays: 3,
      allowSeatChange: true,
      requireGovtId: true,
      refundPolicy: 'Refundable within 3 days of enrollment with pro-rata deduction. No refund after 7 days.',
    },
    payments: {
      methods: {
        cash: true,
        upi: true,
        card: true,
        bankTransfer: true,
      },
      receiptPrefix: 'BW-REC-2026-',
      autoReceipts: true,
      enableGst: false,
      gstNumber: '08AAAAA0000A1Z5',
      lateFeePerDay: 50,
      graceDays: 3,
      dueDayOfMonth: 1,
      remindersBeforeDue: 3,
    },
    attendance: {
      primaryMethod: 'qr',
      trackEntryExit: true,
      enforceShiftTimings: true,
      lateArrivalThresholdMins: 20,
      autoFlagAbsentDays: 3,
      notifyParentsOnCheckin: false,
      allowLibrarianEdit: true,
    },
    notifications: {
      smsEnabled: true,
      emailEnabled: true,
      whatsappEnabled: true,
      triggers: {
        paymentReminder: true,
        membershipExpiry: true,
        seatConfirmation: true,
        attendanceAlert: false,
        announcements: true,
      },
      customTemplate: 'Dear {student_name}, your membership at {library_name} for Desk {desk_no} is due on {due_date}. Please pay ₹{amount} to keep your seat reserved.',
    },
    portal: {
      welcomeMessage: 'Welcome to Bookworm Library Student Portal · Your Quiet Study Workspace',
      primaryColor: '#245C48',
      accentColor: '#C4A052',
      showPricingToStudents: true,
      allowOnlineBooking: true,
      modules: {
        seatPass: true,
        attendanceHistory: true,
        paymentReceipts: true,
        notices: true,
        examSuite: true,
      },
    },
    modules: {
      seatManagement: true,
      studentManagement: true,
      attendanceManagement: true,
      feeCollection: true,
      notices: true,
      reports: true,
      examSuite: true, // Pro plan includes Exam Suite
      biometricHardware: false,
      whatsappBot: true,
      multiBranchHub: false,
    },
    staff: [
      { id: 'st1', name: 'Rajesh Sharma', email: 'rajesh@bookwormlib.com', role: 'Super Administrator', status: 'Active', lastActive: 'Online now' },
      { id: 'st2', name: 'Pooja Mathur', email: 'pooja.m@bookwormlib.com', role: 'Head Librarian', status: 'Active', lastActive: '15 mins ago' },
      { id: 'st3', name: 'Vikram Choudhary', email: 'vikram.c@bookwormlib.com', role: 'Receptionist', status: 'Active', lastActive: '1 hour ago' },
      { id: 'st4', name: 'Sunita Jain', email: 'accounts@bookwormlib.com', role: 'Accountant', status: 'Active', lastActive: 'Yesterday' },
    ],
    security: {
      twoFactorAuth: true,
      sessionTimeoutMinutes: 120,
      dataRetentionYears: 3,
      autoCloudBackup: true,
      lastBackupTime: 'Today at 02:30 AM',
    },
    integrations: {
      razorpay: { status: 'connected', keyId: 'rzp_live_bookworm_9981' },
      whatsappCloud: { status: 'connected', phoneId: '919823144512' },
      twilioSms: { status: 'connected', senderId: 'BKWRM' },
      biometricDevice: { status: 'connected', deviceIp: '192.168.1.140:4370' },
      apiKey: 'libx_live_sec_88493019283019a',
    },
  },

  'apex-study': {
    tenantId: 'apex-study',
    profile: {
      name: 'Apex Study Hub',
      tagline: 'North Campus Competitive Exam Reading Space',
      description: 'Dedicated round-the-clock coaching and study zone catering to UPSC, SSC and Judicial Aspirants near North Delhi University campus.',
      type: 'Academic & Coaching Library',
      campus: 'North University Campus',
      address: '24 Mall Road, Near GTB Nagar Metro Station, North Campus',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110009',
      email: 'desk@apexstudyhub.com',
      phone: '+91 98112 77091',
      adminName: 'Harish Malik',
      adminRole: 'Director & Admin',
      regNumber: 'LIBX-DL-2023-4102',
      website: 'https://apexstudyhub.com',
      instagram: '@apex_study_hub',
      whatsapp: '+91 98112 77091',
    },
    operations: {
      openTime: '05:30 AM',
      closeTime: '11:00 PM',
      maxDailyHours: 17,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weeklyOff: 'None',
      holidays: [
        { id: 'h1', name: 'Republic Day', date: '26 Jan 2026' },
        { id: 'h2', name: 'Gandhi Jayanti', date: '02 Oct 2026' },
      ],
      shifts: [
        { id: 'morning', label: 'Morning Slot', time: '05:30 AM – 01:30 PM', enabled: true },
        { id: 'evening', label: 'Evening Slot', time: '01:30 PM – 09:30 PM', enabled: true },
        { id: 'night', label: 'Night Slot', time: '09:30 PM – 05:30 AM', enabled: true },
        { id: 'fullDay', label: 'Full Day 24/7', time: '05:30 AM – 11:00 PM', enabled: true },
      ],
      breakDurationMinutes: 60,
      gracePeriodMinutes: 20,
    },
    seats: {
      totalDesks: 110,
      namingPrefix: 'APX-',
      categories: [
        {
          id: 'exclusive',
          name: 'Silent Cabin',
          startNo: 1,
          endNo: 30,
          monthlyFee: 2400,
          weeklyFee: 700,
          dailyFee: 140,
          color: '#C4A052',
          amenities: ['Independent Soundproofing', 'Private Locker', 'Personal Light'],
        },
        {
          id: 'premium',
          name: 'Study Pod',
          startNo: 31,
          endNo: 70,
          monthlyFee: 1600,
          weeklyFee: 500,
          dailyFee: 100,
          color: '#245C48',
          amenities: ['Power Socket', 'Ergonomic Seat', 'Fast Wi-Fi'],
        },
        {
          id: 'classic',
          name: 'General Desk',
          startNo: 71,
          endNo: 110,
          monthlyFee: 950,
          weeklyFee: 300,
          dailyFee: 60,
          color: '#628194',
          amenities: ['Shared Plug', 'Comfortable Seat'],
        },
      ],
      zones: [
        { id: 'z1', name: 'UPSC Aspirants Zone', capacity: 60 },
        { id: 'z2', name: 'Judiciary Section', capacity: 50 },
      ],
    },
    membership: {
      registrationFee: 300,
      securityDeposit: 600,
      plans: [
        { id: 'p1', name: 'Monthly Standard', days: 30, discountPercent: 0, enabled: true },
        { id: 'p2', name: 'Quarterly Package', days: 90, discountPercent: 8, enabled: true },
      ],
      advanceRenewalDays: 5,
      expiryGraceDays: 2,
      allowSeatChange: false,
      requireGovtId: true,
      refundPolicy: 'Non-refundable once allocated.',
    },
    payments: {
      methods: { cash: true, upi: true, card: false, bankTransfer: true },
      receiptPrefix: 'APX-2026-',
      autoReceipts: true,
      enableGst: false,
      gstNumber: '',
      lateFeePerDay: 40,
      graceDays: 2,
      dueDayOfMonth: 5,
      remindersBeforeDue: 2,
    },
    attendance: {
      primaryMethod: 'manual',
      trackEntryExit: false,
      enforceShiftTimings: true,
      lateArrivalThresholdMins: 30,
      autoFlagAbsentDays: 5,
      notifyParentsOnCheckin: false,
      allowLibrarianEdit: true,
    },
    notifications: {
      smsEnabled: false,
      emailEnabled: true,
      whatsappEnabled: true,
      triggers: {
        paymentReminder: true,
        membershipExpiry: true,
        seatConfirmation: true,
        attendanceAlert: false,
        announcements: true,
      },
      customTemplate: 'Hi {student_name}, your desk at Apex Study Hub expires on {due_date}. Please renew.',
    },
    portal: {
      welcomeMessage: 'Welcome to Apex Study Hub Student Portal',
      primaryColor: '#1B3B2B',
      accentColor: '#D1A254',
      showPricingToStudents: true,
      allowOnlineBooking: false,
      modules: {
        seatPass: true,
        attendanceHistory: true,
        paymentReceipts: true,
        notices: true,
        examSuite: false, // Standard tier: Exam Suite disabled
      },
    },
    modules: {
      seatManagement: true,
      studentManagement: true,
      attendanceManagement: true,
      feeCollection: true,
      notices: true,
      reports: true,
      examSuite: false, // Standard plan entitlement: NOT INCLUDED
      biometricHardware: false,
      whatsappBot: false,
      multiBranchHub: false,
    },
    staff: [
      { id: 'st1', name: 'Harish Malik', email: 'harish@apexstudyhub.com', role: 'Super Administrator', status: 'Active', lastActive: 'Online now' },
      { id: 'st2', name: 'Naveen Kumar', email: 'naveen@apexstudyhub.com', role: 'Receptionist', status: 'Active', lastActive: '3 hours ago' },
    ],
    security: {
      twoFactorAuth: false,
      sessionTimeoutMinutes: 60,
      dataRetentionYears: 1,
      autoCloudBackup: true,
      lastBackupTime: 'Yesterday at 11:00 PM',
    },
    integrations: {
      razorpay: { status: 'disconnected', keyId: '' },
      whatsappCloud: { status: 'connected', phoneId: '919811277091' },
      twilioSms: { status: 'disconnected', senderId: '' },
      biometricDevice: { status: 'disconnected', deviceIp: '' },
      apiKey: 'libx_live_sec_apex990142',
    },
  },

  'scholars-den': {
    tenantId: 'scholars-den',
    profile: {
      name: "The Scholar's Den",
      tagline: 'Elite Academic Residency & Tech-Integrated Library',
      description: 'Fully automated enterprise campus with biometric turnstiles, private executive study cubicles, and integrated LibX Exam Suite.',
      type: 'Co-working Hybrid',
      campus: 'South Extension Centre',
      address: '88 Koramangala 4th Block, 100 Feet Road',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560034',
      email: 'admin@scholarsden.in',
      phone: '+91 99201 33481',
      adminName: 'Dr. Aruna V.',
      adminRole: 'Managing Trustee',
      regNumber: 'LIBX-KA-2022-0941',
      website: 'https://scholarsden.in',
      instagram: '@scholars_den_blr',
      whatsapp: '+91 99201 33481',
    },
    operations: {
      openTime: '06:00 AM',
      closeTime: '11:59 PM',
      maxDailyHours: 18,
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      weeklyOff: 'None',
      holidays: [{ id: 'h1', name: 'Kannada Rajyotsava', date: '01 Nov 2026' }],
      shifts: [
        { id: 'morning', label: 'Early Shift', time: '06:00 AM – 02:00 PM', enabled: true },
        { id: 'evening', label: 'Mid Shift', time: '02:00 PM – 10:00 PM', enabled: true },
        { id: 'night', label: 'Night Owl Slot', time: '10:00 PM – 06:00 AM', enabled: true },
        { id: 'fullDay', label: '24/7 Access', time: '06:00 AM – 11:59 PM', enabled: true },
      ],
      breakDurationMinutes: 50,
      gracePeriodMinutes: 10,
    },
    seats: {
      totalDesks: 200,
      namingPrefix: 'SD-',
      categories: [
        {
          id: 'exclusive',
          name: 'Executive Cubicle',
          startNo: 1,
          endNo: 60,
          monthlyFee: 3200,
          weeklyFee: 900,
          dailyFee: 180,
          color: '#C4A052',
          amenities: ['Dedicated AC Vents', 'Biometric Lock', 'Motorized Desk'],
        },
        {
          id: 'premium',
          name: 'Scholar Pod',
          startNo: 61,
          endNo: 140,
          monthlyFee: 2100,
          weeklyFee: 600,
          dailyFee: 120,
          color: '#245C48',
          amenities: ['Dual Monitors Port', 'High-Speed LAN'],
        },
        {
          id: 'classic',
          name: 'Reading Station',
          startNo: 141,
          endNo: 200,
          monthlyFee: 1200,
          weeklyFee: 350,
          dailyFee: 70,
          color: '#628194',
          amenities: ['Ergonomic Chair', 'Reading Light'],
        },
      ],
      zones: [
        { id: 'z1', name: 'Quiet Floor A', capacity: 100 },
        { id: 'z2', name: 'Quiet Floor B', capacity: 100 },
      ],
    },
    membership: {
      registrationFee: 500,
      securityDeposit: 1000,
      plans: [
        { id: 'p1', name: 'Monthly', days: 30, discountPercent: 0, enabled: true },
        { id: 'p2', name: 'Quarterly', days: 90, discountPercent: 10, enabled: true },
        { id: 'p3', name: 'Annual VIP', days: 365, discountPercent: 25, enabled: true },
      ],
      advanceRenewalDays: 10,
      expiryGraceDays: 5,
      allowSeatChange: true,
      requireGovtId: true,
      refundPolicy: 'Full refund within 48 hours. 50% refund after 10 days.',
    },
    payments: {
      methods: { cash: false, upi: true, card: true, bankTransfer: true },
      receiptPrefix: 'SD-INV-',
      autoReceipts: true,
      enableGst: true,
      gstNumber: '29AAAAA1111A1Z8',
      lateFeePerDay: 75,
      graceDays: 5,
      dueDayOfMonth: 1,
      remindersBeforeDue: 5,
    },
    attendance: {
      primaryMethod: 'biometric',
      trackEntryExit: true,
      enforceShiftTimings: true,
      lateArrivalThresholdMins: 15,
      autoFlagAbsentDays: 2,
      notifyParentsOnCheckin: true,
      allowLibrarianEdit: false,
    },
    notifications: {
      smsEnabled: true,
      emailEnabled: true,
      whatsappEnabled: true,
      triggers: {
        paymentReminder: true,
        membershipExpiry: true,
        seatConfirmation: true,
        attendanceAlert: true,
        announcements: true,
      },
      customTemplate: "Greetings {student_name}, your pass for {library_name} #{desk_no} is awaiting renewal for {due_date}.",
    },
    portal: {
      welcomeMessage: "The Scholar's Den Digital Portal · High Performance Academic Sanctuary",
      primaryColor: '#1E3A8A',
      accentColor: '#D97706',
      showPricingToStudents: true,
      allowOnlineBooking: true,
      modules: {
        seatPass: true,
        attendanceHistory: true,
        paymentReceipts: true,
        notices: true,
        examSuite: true,
      },
    },
    modules: {
      seatManagement: true,
      studentManagement: true,
      attendanceManagement: true,
      feeCollection: true,
      notices: true,
      reports: true,
      examSuite: true,
      biometricHardware: true,
      whatsappBot: true,
      multiBranchHub: true,
    },
    staff: [
      { id: 'st1', name: 'Dr. Aruna V.', email: 'aruna@scholarsden.in', role: 'Super Administrator', status: 'Active', lastActive: 'Online now' },
      { id: 'st2', name: 'Karthik Rao', email: 'karthik@scholarsden.in', role: 'Head Librarian', status: 'Active', lastActive: '5 mins ago' },
    ],
    security: {
      twoFactorAuth: true,
      sessionTimeoutMinutes: 180,
      dataRetentionYears: 5,
      autoCloudBackup: true,
      lastBackupTime: 'Today at 04:00 AM',
    },
    integrations: {
      razorpay: { status: 'connected', keyId: 'rzp_live_scholars_8820' },
      whatsappCloud: { status: 'connected', phoneId: '919920133481' },
      twilioSms: { status: 'connected', senderId: 'SCHLR' },
      biometricDevice: { status: 'connected', deviceIp: '10.0.4.12:5005' },
      apiKey: 'libx_live_sec_scholars_enterprise_99',
    },
  },
};

