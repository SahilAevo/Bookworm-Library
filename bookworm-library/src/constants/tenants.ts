export interface LibraryTenant {
  id: string;
  name: string;
  campus: string;
  code: string;
  city: string;
  plan: 'standard' | 'pro' | 'enterprise';
  features: {
    deskManagement: boolean;
    staffAttendance: boolean;
    feeCollection: boolean;
    examSuite: boolean;
  };
  adminEmail: string;
  studentIdPrefix: string;
  supportPhone: string;
  supportEmail: string;
}

export const LIBRARY_TENANTS: LibraryTenant[] = [
  {
    id: 'bookworm-main',
    name: 'Bookworm Library',
    campus: 'Civil Lines Campus',
    code: 'BW-MAIN',
    city: 'Jaipur',
    plan: 'pro',
    features: {
      deskManagement: true,
      staffAttendance: true,
      feeCollection: true,
      examSuite: true,
    },
    adminEmail: 'admin@bookwormlib.com',
    studentIdPrefix: 'BW-2026',
    supportPhone: '+91 98231 44512',
    supportEmail: 'support@bookwormlib.com',
  },
  {
    id: 'apex-study',
    name: 'Apex Study Hub',
    campus: 'North University Campus',
    code: 'APEX-01',
    city: 'Delhi',
    plan: 'standard',
    features: {
      deskManagement: true,
      staffAttendance: true,
      feeCollection: true,
      examSuite: false, // Standard tier: Exam Suite not included
    },
    adminEmail: 'desk@apexstudyhub.com',
    studentIdPrefix: 'APX-2026',
    supportPhone: '+91 98112 77091',
    supportEmail: 'contact@apexstudyhub.com',
  },
  {
    id: 'scholars-den',
    name: "The Scholar's Den",
    campus: 'South Extension Centre',
    code: 'SCHOLAR-SE',
    city: 'Bangalore',
    plan: 'enterprise',
    features: {
      deskManagement: true,
      staffAttendance: true,
      feeCollection: true,
      examSuite: true,
    },
    adminEmail: 'admin@scholarsden.in',
    studentIdPrefix: 'SD-2026',
    supportPhone: '+91 99201 33481',
    supportEmail: 'help@scholarsden.in',
  },
];

export const DEFAULT_TENANT = LIBRARY_TENANTS[0];

