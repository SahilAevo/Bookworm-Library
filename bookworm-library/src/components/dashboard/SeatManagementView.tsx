import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  Armchair,
  Search,
  Sparkles,
  Crown,
  BookOpen,
  User,
  Phone,
  Calendar,
  CreditCard,
  X,
  Plus,
  Sliders,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Zap,
  Lock,
  Tag,
  Check,
  Maximize2,
  Minimize2,
  Filter,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  Radio,
  Activity,
  Wifi,
  Coffee,
  UserCheck,
  Bell,
  RefreshCw,
  Power,
  MapPin,
  AlertCircle,
  Lightbulb,
  History,
  Wrench,
  Edit3,
  UserPlus,
  Info,
  FileText,
  Users,
  LogOut,
} from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';
import {
  seatOccupancyService,
  SeatOccupancyItem,
  SeatOccupancyStatus,
  SeatOccupancyHistoryRecord,
  SeatOccupancyAuditLog,
} from '@/services/seat-occupancy-service';
import { SEED_STUDENTS } from '@/services/attendance-service';

export type SeatCategory = 'exclusive' | 'premium' | 'classic' | string;
export type ShiftType = 'morning' | 'evening' | 'night' | 'fullday' | string;
export type ShiftStatus = 'occupied' | 'available' | 'reserved' | 'unavailable' | 'blocked';

export interface CategoryRangeConfig {
  id: string;
  name: string;
  startNo: number;
  endNo: number;
  prefix: string;
  monthlyFee: number;
  isCustom?: boolean;
}

export interface ShiftCategoryConfig {
  id: string;
  name: string;
  timeRange: string;
  badge: string;
  monthlyFeeMultiplier: number;
  description?: string;
  isCustom?: boolean;
}

export const DEFAULT_SHIFT_CATEGORIES: ShiftCategoryConfig[] = [
  { id: 'morning', name: 'Morning Shift', timeRange: '06:00 AM – 02:00 PM', badge: 'M', monthlyFeeMultiplier: 1.0, description: 'Prime morning focus slot' },
  { id: 'evening', name: 'Evening Shift', timeRange: '02:00 PM – 10:00 PM', badge: 'E', monthlyFeeMultiplier: 1.0, description: 'Afternoon & evening study slot' },
  { id: 'night', name: 'Night Shift', timeRange: '10:00 PM – 06:00 AM', badge: 'N', monthlyFeeMultiplier: 0.75, description: 'Overnight slot for nocturnal aspirants' },
  { id: 'fullday', name: 'Full Day (24/7)', timeRange: '06:00 AM – 10:00 PM', badge: 'FD', monthlyFeeMultiplier: 1.6, description: 'Exclusive all-day continuous study pass' },
];

export interface ShiftStudent {
  name: string;
  studentId: string;
  phone: string;
  plan: string;
  startDate: string;
  endDate: string;
  paymentStatus: 'Paid' | 'Pending Due';
  fee: number;
}

export interface SeatItem {
  id: number;
  number: number;
  formattedLabel: string;
  category: SeatCategory;
  morningStudent?: ShiftStudent;
  eveningStudent?: ShiftStudent;
  nightStudent?: ShiftStudent;
  morningStatus: ShiftStatus;
  eveningStatus: ShiftStatus;
  nightStatus: ShiftStatus;
  hasPowerSocket: boolean;
  hasLocker: boolean;
}

// =========================================================================
// LIVE SEAT TRACKING & OCCUPANCY TYPES
// =========================================================================
export type LivePresenceStatus = 'occupied' | 'away' | 'vacant';

export interface LiveOccupant {
  name: string;
  studentId: string;
  phone: string;
  avatarColor: string;
  isCrossSeated: boolean;
  assignedDeskLabel?: string;
  assignedShift?: string;
  seatedSince: string;
  duration: string;
  verifiedVia: 'QR Scanner at Gate' | 'Biometric Turnstile' | 'Desk QR Audit' | 'Manual Desk Check';
  notes?: string;
}

export interface LiveTimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'checkin' | 'break' | 'return' | 'cross' | 'sensor' | 'admin';
}

export interface LiveSeatTrackingData {
  deskNumber: number;
  formattedLabel: string;
  presenceStatus: LivePresenceStatus;
  currentOccupant?: LiveOccupant;
  powerSocketState: 'active_drawing' | 'idle' | 'off';
  readingLightOn: boolean;
  activeWattage: string;
  lastActivityTime: string;
  wifiNode: string;
  timeline: LiveTimelineEvent[];
}

// Realistic student pool
const sampleStudentNames = [
  'Aarav Patel',
  'Priya Sharma',
  'Rohan Verma',
  'Sneha Kulkarni',
  'Vikram Mehta',
  'Ananya Iyer',
  'Kabir Das',
  'Neha Gupta',
  'Arjun Reddy',
  'Pooja Vishwakarma',
  'Aditya Singh',
  'Meera Nair',
  'Kunal Deshmukh',
  'Tanvi Joshi',
  'Devendra Rathore',
  'Simran Kaur',
];

// Status Colors defined by user:
// - Dark forest green (#245C48): Occupied
// - Light sage (#B8D2B6): Available
// - Muted amber (#D6A14A): Reserved
// - Cool grey (#D6DCE3): Unavailable
export const SHIFT_STATUS_COLORS: Record<ShiftStatus, { bg: string; text: string; label: string }> = {
  occupied: {
    bg: '#245C48',
    text: '#FFFFFF',
    label: 'Occupied',
  },
  available: {
    bg: '#B8D2B6',
    text: '#1C3E32',
    label: 'Available',
  },
  reserved: {
    bg: '#D6A14A',
    text: '#FFFFFF',
    label: 'Reserved',
  },
  unavailable: {
    bg: '#D6DCE3',
    text: '#4A5B52',
    label: 'Unavailable',
  },
  blocked: {
    bg: '#C76B59',
    text: '#FFFFFF',
    label: 'Blocked',
  },
};

// =========================================================================
// 5 OFFICIAL SEAT OCCUPANCY STATUS STYLES (Real-Time Physical Occupancy)
// =========================================================================
export const OCCUPANCY_STATUS_STYLES: Record<
  SeatOccupancyStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  occupied_assigned: {
    label: 'Occupied by Assigned Student',
    bg: '#E8EEE5',
    text: '#245C48',
    border: '#B8D2B6',
    dot: '#245C48',
  },
  occupied_another: {
    label: 'Occupied by Another Student',
    bg: '#FEF3C7',
    text: '#B45309',
    border: '#F59E0B',
    dot: '#D97706',
  },
  available: {
    label: 'Available',
    bg: '#F5F5ED',
    text: '#4A5B52',
    border: '#DDD9CE',
    dot: '#879187',
  },
  reserved: {
    label: 'Reserved',
    bg: '#FEF8EA',
    text: '#B58A4A',
    border: '#E8D4A8',
    dot: '#B58A4A',
  },
  maintenance: {
    label: 'Maintenance',
    bg: '#F1F4EE',
    text: '#628194',
    border: '#D6DCE3',
    dot: '#628194',
  },
};

// Generates realistic real-time desk tracking & cross-seating data
export function buildInitialLiveTrackingMap(seats: SeatItem[]): Record<number, LiveSeatTrackingData> {
  const map: Record<number, LiveSeatTrackingData> = {};

  seats.forEach((seat) => {
    const num = seat.number;

    // SCENARIO 1: CROSS-DESK OCCUPANCY (Desk Mismatch Alert!)
    // Student assigned to another desk is currently sitting here.
    // We intentionally seed desks where (num % 5 === 4) e.g., D-04, D-09, D-14, D-19, etc.
    if (num % 5 === 4) {
      const assignedDeskNum = ((num + 14) % 150) + 1;
      const assignedPadded = assignedDeskNum < 10 ? `0${assignedDeskNum}` : `${assignedDeskNum}`;
      const occupantName = sampleStudentNames[(num * 3) % sampleStudentNames.length];
      map[num] = {
        deskNumber: num,
        formattedLabel: seat.formattedLabel,
        presenceStatus: 'occupied',
        currentOccupant: {
          name: occupantName,
          studentId: `BW-${1020 + (num * 3) % 80}-M`,
          phone: `+91 98${(num * 145) % 90000 + 10000}`,
          avatarColor: '#D97706',
          isCrossSeated: true,
          assignedDeskLabel: `D-${assignedPadded}`,
          assignedShift: 'Morning Slot (06:00 AM – 02:00 PM)',
          seatedSince: '10:14 AM',
          duration: '2h 46m',
          verifiedVia: 'QR Scanner at Gate',
          notes: `Assigned to D-${assignedPadded}. Detected at ${seat.formattedLabel} during physical desk check.`,
        },
        powerSocketState: 'active_drawing',
        readingLightOn: true,
        activeWattage: '45W (MacBook Pro)',
        lastActivityTime: '2 mins ago',
        wifiNode: 'AP-Library-Floor1 (5 GHz)',
        timeline: [
          {
            id: 't1',
            time: '10:14 AM',
            title: 'Desk Presence Detected (Cross-Seat Flagged)',
            description: `Student sat at ${seat.formattedLabel}. Official assigned desk is D-${assignedPadded}.`,
            type: 'cross',
          },
          {
            id: 't2',
            time: '08:45 AM',
            title: 'Turnstile Gate Entry Verified',
            description: 'Scanned dynamic QR code at Main Library Gate 1.',
            type: 'checkin',
          },
          {
            id: 't3',
            time: '06:00 AM',
            title: 'Morning Shift Initialized',
            description: 'Desk lighting and power circuit activated.',
            type: 'admin',
          },
        ],
      };
      return;
    }

    // SCENARIO 2: TEMPORARILY AWAY ON BREAK (Tea / Lunch / Washroom)
    if (num % 6 === 0) {
      const occupantName = seat.morningStudent?.name || sampleStudentNames[num % sampleStudentNames.length];
      map[num] = {
        deskNumber: num,
        formattedLabel: seat.formattedLabel,
        presenceStatus: 'away',
        currentOccupant: {
          name: occupantName,
          studentId: seat.morningStudent?.studentId || `BW-${1000 + num}-M`,
          phone: seat.morningStudent?.phone || `+91 98${(num * 123) % 90000 + 10000}`,
          avatarColor: '#C4A052',
          isCrossSeated: false,
          assignedDeskLabel: seat.formattedLabel,
          assignedShift: 'Morning Slot',
          seatedSince: '07:30 AM',
          duration: '4h 45m (Away 14 mins)',
          verifiedVia: 'QR Scanner at Gate',
          notes: 'Stepped out for short tea break (14 mins elapsed).',
        },
        powerSocketState: 'idle',
        readingLightOn: false,
        activeWattage: '6W (Sleep Mode)',
        lastActivityTime: '14 mins ago',
        wifiNode: 'AP-Library-Floor1 (5 GHz)',
        timeline: [
          {
            id: 't1',
            time: '12:18 PM',
            title: 'Stepped Out on Break',
            description: 'Student tagged out for lunch/tea break. Grace timer running (30m max).',
            type: 'break',
          },
          {
            id: 't2',
            time: '07:30 AM',
            title: 'Checked in at Desk',
            description: 'Scanned QR pass at library entrance.',
            type: 'checkin',
          },
        ],
      };
      return;
    }

    // SCENARIO 3: PHYSICALLY OCCUPIED BY LEGITIMATE ASSIGNED STUDENT
    if (seat.morningStudent) {
      map[num] = {
        deskNumber: num,
        formattedLabel: seat.formattedLabel,
        presenceStatus: 'occupied',
        currentOccupant: {
          name: seat.morningStudent.name,
          studentId: seat.morningStudent.studentId,
          phone: seat.morningStudent.phone,
          avatarColor: '#245C48',
          isCrossSeated: false,
          assignedDeskLabel: seat.formattedLabel,
          assignedShift: 'Morning Slot',
          seatedSince: '08:15 AM',
          duration: '4h 00m',
          verifiedVia: 'QR Scanner at Gate',
        },
        powerSocketState: 'active_drawing',
        readingLightOn: true,
        activeWattage: '65W (Fast Charger)',
        lastActivityTime: 'Just now',
        wifiNode: 'AP-Library-Floor1 (5 GHz)',
        timeline: [
          {
            id: 't1',
            time: '08:15 AM',
            title: 'Verified Check-in',
            description: 'Scanned attendance QR code at library turnstile. Desk occupied.',
            type: 'checkin',
          },
          {
            id: 't2',
            time: '06:00 AM',
            title: 'Shift Commenced',
            description: 'Power grid energized.',
            type: 'admin',
          },
        ],
      };
      return;
    }

    // SCENARIO 4: VACANT (Available)
    map[num] = {
      deskNumber: num,
      formattedLabel: seat.formattedLabel,
      presenceStatus: 'vacant',
      powerSocketState: 'off',
      readingLightOn: false,
      activeWattage: '0W',
      lastActivityTime: 'Shift start (06:00 AM)',
      wifiNode: 'AP-Library-Floor1 (5 GHz)',
      timeline: [
        {
          id: 't1',
          time: '07:00 AM',
          title: 'Housekeeping Desk Inspection',
          description: 'Desk sanitized, stationery tray organized, ready for seating.',
          type: 'admin',
        },
      ],
    };
  });

  return map;
}

export function SeatManagementView({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const { colors, shadows, isDark } = useThemeMode();

  // 2. Category Range Configuration (Defaults: Exclusive 1-50, Premium 51-80, Classic 81-150)
  const [categoryRanges, setCategoryRanges] = useState<CategoryRangeConfig[]>([
    {
      id: 'exclusive',
      name: 'Exclusive',
      startNo: 1,
      endNo: 50,
      prefix: 'D-',
      monthlyFee: 2000,
    },
    {
      id: 'premium',
      name: 'Premium',
      startNo: 51,
      endNo: 80,
      prefix: 'D-',
      monthlyFee: 1400,
    },
    {
      id: 'classic',
      name: 'Classic',
      startNo: 81,
      endNo: 150,
      prefix: 'D-',
      monthlyFee: 800,
    },
  ]);

  // Draft state for Desk & Shift Customization Modal
  const [draftRanges, setDraftRanges] = useState<CategoryRangeConfig[]>(categoryRanges);
  const [setupTab, setSetupTab] = useState<'ranges' | 'shifts'>('ranges');
  const [shiftCategories, setShiftCategories] = useState<ShiftCategoryConfig[]>(DEFAULT_SHIFT_CATEGORIES);
  const [draftShifts, setDraftShifts] = useState<ShiftCategoryConfig[]>(shiftCategories);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  // Selected Seat for Details Modal / Panel
  const [selectedSeat, setSelectedSeat] = useState<SeatItem | null>(null);
  const [seatDetailTab, setSeatDetailTab] = useState<'two_students' | 'shifts' | 'history' | 'audit'>('two_students');
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Real-Time Seat Occupancy state loaded from seatOccupancyService
  const tenantId = 'bookworm-main';
  const [occupancyMap, setOccupancyMap] = useState<Record<number, SeatOccupancyItem>>(() =>
    seatOccupancyService.getAllSeats(tenantId)
  );

  // Status Filter for the 5 official statuses:
  // 'all' | 'occupied_assigned' | 'occupied_another' | 'available' | 'reserved' | 'maintenance'
  const [occupancyStatusFilter, setOccupancyStatusFilter] = useState<'all' | SeatOccupancyStatus>('all');

  // Quick Action Dialog States:
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [studentSearchText, setStudentSearchText] = useState('');
  const [adminNoteText, setAdminNoteText] = useState('');
  const [customStudentName, setCustomStudentName] = useState('');
  const [customStudentId, setCustomStudentId] = useState('');
  const [customStudentDept, setCustomStudentDept] = useState('Competitive Exam Prep');

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<'all' | SeatCategory>('all');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<'all' | ShiftType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'full' | 'partial' | 'vacant'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Generate All Desks dynamically based on configured category ranges
  const seatsList = useMemo<SeatItem[]>(() => {
    const list: SeatItem[] = [];

    categoryRanges.forEach((range) => {
      for (let num = range.startNo; num <= range.endNo; num++) {
        const paddedNo = num < 10 ? `0${num}` : `${num}`;
        const formattedLabel = `${range.prefix}${paddedNo}`;

        // Shift distribution:
        // Morning: ~75% occupied, 5% reserved, 20% available
        const hasMorning = (num * 3 + 1) % 10 > 2;
        const isMorningReserved = !hasMorning && (num % 11 === 0);

        // Evening: ~70% occupied, 5% reserved, 25% available
        const hasEvening = (num * 5 + 2) % 10 > 3;
        const isEveningReserved = !hasEvening && (num % 13 === 0);

        // Night: ~55% occupied, 5% reserved, 40% available
        const hasNight = (num * 7 + 4) % 10 > 5;
        const isNightReserved = !hasNight && (num % 17 === 0);

        const morningStudent: ShiftStudent | undefined = hasMorning
          ? {
              name: sampleStudentNames[(num * 2) % sampleStudentNames.length],
              studentId: `BW-${1000 + num}-M`,
              phone: `+91 98${(num * 123) % 90000 + 10000}`,
              plan: 'Morning Shift',
              startDate: '01 Nov 2026',
              endDate: '30 Nov 2026',
              paymentStatus: num % 5 === 0 ? 'Pending Due' : 'Paid',
              fee: range.monthlyFee,
            }
          : undefined;

        const eveningStudent: ShiftStudent | undefined = hasEvening
          ? {
              name: sampleStudentNames[(num * 3 + 1) % sampleStudentNames.length],
              studentId: `BW-${1000 + num}-E`,
              phone: `+91 97${(num * 345) % 90000 + 10000}`,
              plan: 'Evening Shift',
              startDate: '01 Nov 2026',
              endDate: '30 Nov 2026',
              paymentStatus: num % 6 === 0 ? 'Pending Due' : 'Paid',
              fee: range.monthlyFee,
            }
          : undefined;

        const nightStudent: ShiftStudent | undefined = hasNight
          ? {
              name: sampleStudentNames[(num * 4 + 2) % sampleStudentNames.length],
              studentId: `BW-${1000 + num}-N`,
              phone: `+91 99${(num * 678) % 90000 + 10000}`,
              plan: 'Night Shift',
              startDate: '01 Nov 2026',
              endDate: '30 Nov 2026',
              paymentStatus: num % 4 === 0 ? 'Pending Due' : 'Paid',
              fee: Math.round(range.monthlyFee * 0.75),
            }
          : undefined;

        const morningStatus: ShiftStatus = morningStudent
          ? 'occupied'
          : isMorningReserved
          ? 'reserved'
          : 'available';

        const eveningStatus: ShiftStatus = eveningStudent
          ? 'occupied'
          : isEveningReserved
          ? 'reserved'
          : 'available';

        const nightStatus: ShiftStatus = nightStudent
          ? 'occupied'
          : isNightReserved
          ? 'reserved'
          : 'available';

        list.push({
          id: num,
          number: num,
          formattedLabel,
          category: range.id,
          morningStudent,
          eveningStudent,
          nightStudent,
          morningStatus,
          eveningStatus,
          nightStatus,
          hasPowerSocket: range.id !== 'classic' || num % 2 === 0,
          hasLocker: range.id === 'exclusive' || (range.id === 'premium' && num % 2 === 1),
        });
      }
    });

    return list.sort((a, b) => a.number - b.number);
  }, [categoryRanges]);

  const totalSeats = seatsList.length;

  // Filtered seats based on Category, Shift Specifics, Occupancy Status, and Search query
  const filteredSeats = useMemo(() => {
    return seatsList.filter((seat) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && seat.category !== selectedCategory) {
        return false;
      }

      // 2. Specific Shift Availability Filter
      if (selectedShiftFilter === 'morning' && seat.morningStatus !== 'available') return false;
      if (selectedShiftFilter === 'evening' && seat.eveningStatus !== 'available') return false;
      if (selectedShiftFilter === 'night' && seat.nightStatus !== 'available') return false;

      // 3. Occupancy Status Filter: Fully Occupied, Partially Available, Completely Available
      const occupiedShifts =
        (seat.morningStatus === 'occupied' ? 1 : 0) +
        (seat.eveningStatus === 'occupied' ? 1 : 0) +
        (seat.nightStatus === 'occupied' ? 1 : 0);

      const isFull = occupiedShifts === 3;
      const isPartial = occupiedShifts > 0 && occupiedShifts < 3;
      const isVacant = occupiedShifts === 0;

      if (statusFilter === 'full' && !isFull) return false;
      if (statusFilter === 'partial' && !isPartial) return false;
      if (statusFilter === 'vacant' && !isVacant) return false;

      // 3. Occupancy Status Filter: 5 Official Statuses
      if (occupancyStatusFilter !== 'all') {
        const occ = occupancyMap[seat.number];
        if (!occ || occ.status !== occupancyStatusFilter) return false;
      }

      // 4. Search Filter (by seat number, assigned student, or current occupying student)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const occ = occupancyMap[seat.number];
        const matchesNo =
          seat.number.toString().includes(q) ||
          seat.formattedLabel.toLowerCase().includes(q);
        const matchesAssigned =
          seat.morningStudent?.name.toLowerCase().includes(q) ||
          seat.morningStudent?.studentId.toLowerCase().includes(q) ||
          occ?.assignedStudent?.name.toLowerCase().includes(q) ||
          occ?.assignedStudent?.studentId.toLowerCase().includes(q);
        const matchesOccupant =
          occ?.occupyingStudent?.name.toLowerCase().includes(q) ||
          occ?.occupyingStudent?.studentId.toLowerCase().includes(q);
        const matchesE =
          seat.eveningStudent?.name.toLowerCase().includes(q) ||
          seat.eveningStudent?.studentId.toLowerCase().includes(q);
        const matchesN =
          seat.nightStudent?.name.toLowerCase().includes(q) ||
          seat.nightStudent?.studentId.toLowerCase().includes(q);

        if (!matchesNo && !matchesAssigned && !matchesOccupant && !matchesE && !matchesN) return false;
      }

      return true;
    });
  }, [seatsList, selectedCategory, selectedShiftFilter, statusFilter, occupancyStatusFilter, searchQuery, occupancyMap]);

  const handleCategoryChange = (cat: 'all' | SeatCategory) => {
    setSelectedCategory(cat);
  };

  const handleStatusChange = (status: 'all' | 'full' | 'partial' | 'vacant') => {
    setStatusFilter(status);
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedShiftFilter('all');
    setStatusFilter('all');
    setOccupancyStatusFilter('all');
    setSearchQuery('');
  };

  const isFilterActive =
    selectedCategory !== 'all' ||
    selectedShiftFilter !== 'all' ||
    statusFilter !== 'all' ||
    occupancyStatusFilter !== 'all' ||
    searchQuery.trim() !== '';

  // Category counts and ranges summary
  const categoryStats = useMemo(() => {
    const exclusive = seatsList.filter((s) => s.category === 'exclusive');
    const premium = seatsList.filter((s) => s.category === 'premium');
    const classic = seatsList.filter((s) => s.category === 'classic');

    return {
      all: seatsList.length,
      exclusive: {
        total: exclusive.length,
        config: categoryRanges.find((r) => r.id === 'exclusive'),
      },
      premium: {
        total: premium.length,
        config: categoryRanges.find((r) => r.id === 'premium'),
      },
      classic: {
        total: classic.length,
        config: categoryRanges.find((r) => r.id === 'classic'),
      },
    };
  }, [seatsList, categoryRanges]);

  // Category Styling Tokens matching LibX Design System:
  // - Exclusive: warm ivory and muted gold (#B58A4A)
  // - Premium: light sage (#A5B99E)
  // - Classic: cool neutral grey (#788477 / #879187)
  const getCategoryStyles = (cat: SeatCategory) => {
    switch (cat) {
      case 'exclusive':
        return {
          label: 'Exclusive',
          icon: Crown,
          cardBg: isDark ? '#222C24' : '#FFFEFA',
          cardBorder: isDark ? '#38443A' : '#DDD9CE',
          accent: isDark ? '#C4A052' : '#B58A4A', // Muted gold
          accentBg: isDark ? 'rgba(196, 160, 82, 0.16)' : '#F7F2E6',
          badgeText: isDark ? '#E5C984' : '#B58A4A',
        };
      case 'premium':
        return {
          label: 'Premium',
          icon: Sparkles,
          cardBg: isDark ? '#222C24' : '#FFFEFA',
          cardBorder: isDark ? '#38443A' : '#DDD9CE',
          accent: isDark ? '#55A783' : '#245C48', // Forest / Emerald
          accentBg: isDark ? 'rgba(85, 167, 131, 0.16)' : '#E8EEE5',
          badgeText: isDark ? '#A5B99E' : '#245C48',
        };
      case 'classic':
        return {
          label: 'Classic',
          icon: BookOpen,
          cardBg: isDark ? '#222C24' : '#FFFEFA',
          cardBorder: isDark ? '#38443A' : '#DDD9CE',
          accent: isDark ? '#879187' : '#788477', // Cool neutral grey
          accentBg: isDark ? 'rgba(135, 145, 135, 0.16)' : '#EAE5D9',
          badgeText: isDark ? '#A8ADA1' : '#788477',
        };
      default: {
        const customName = typeof cat === 'string' ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Custom';
        return {
          label: customName,
          icon: Armchair,
          cardBg: isDark ? '#222C24' : '#FFFEFA',
          cardBorder: isDark ? '#38443A' : '#DDD9CE',
          accent: isDark ? '#55B58D' : '#287A5B',
          accentBg: isDark ? 'rgba(85, 181, 141, 0.16)' : '#E8F3EE',
          badgeText: isDark ? '#7FD1AC' : '#287A5B',
        };
      }
    }
  };

  // =========================================================================
  // REAL-TIME SEAT OCCUPANCY SERVICE INTEGRATION & STATS
  // =========================================================================
  const occupancyStats = useMemo(() => {
    const all = Object.values(occupancyMap);
    return {
      total: all.length,
      occupiedAssigned: all.filter((s) => s.status === 'occupied_assigned').length,
      occupiedAnother: all.filter((s) => s.status === 'occupied_another').length,
      available: all.filter((s) => s.status === 'available').length,
      reserved: all.filter((s) => s.status === 'reserved').length,
      maintenance: all.filter((s) => s.status === 'maintenance').length,
      crossSeatHotspots: seatOccupancyService.getCrossSeatAnalytics(tenantId),
    };
  }, [occupancyMap]);

  // Current selected seat occupancy, history and audit records
  const currentSeatOccupancy: SeatOccupancyItem | undefined = useMemo(() => {
    if (!selectedSeat) return undefined;
    return occupancyMap[selectedSeat.number] || seatOccupancyService.getSeat(tenantId, selectedSeat.number);
  }, [selectedSeat, occupancyMap]);

  const currentSeatHistory: SeatOccupancyHistoryRecord[] = useMemo(() => {
    if (!selectedSeat) return [];
    return seatOccupancyService.getHistory(tenantId, selectedSeat.number);
  }, [selectedSeat, occupancyMap]);

  const currentSeatAudit: SeatOccupancyAuditLog[] = useMemo(() => {
    if (!selectedSeat) return [];
    return seatOccupancyService.getAuditLogs(tenantId, selectedSeat.number);
  }, [selectedSeat, occupancyMap]);

  // -------------------------------------------------------------------------
  // ADMIN ACTION HANDLERS (ENFORCING BUSINESS RULES & MULTI-TENANT ISOLATION)
  // -------------------------------------------------------------------------
  const handleAssignOccupant = (
    student: { studentId: string; name: string; department?: string; phone?: string },
    notes?: string
  ) => {
    if (!selectedSeat) return;
    try {
      const res = seatOccupancyService.manuallyAssignOccupant(
        tenantId,
        selectedSeat.number,
        student,
        'Admin (Civil Lines)',
        notes
      );
      setOccupancyMap({ ...seatOccupancyService.getAllSeats(tenantId) });
      setIsAssignModalOpen(false);
      setStudentSearchText('');
      setAdminNoteText('');
      setCustomStudentName('');
      setCustomStudentId('');
      setActionToast({
        type: res.seat.isCrossOccupied ? 'alert' : 'success',
        message: res.message,
      });
    } catch (err: any) {
      setActionToast({ type: 'alert', message: err.message || 'Failed to assign occupant.' });
    }
  };

  const handleReleaseSeat = (reason: string = 'Desk vacated by admin') => {
    if (!selectedSeat) return;
    try {
      const res = seatOccupancyService.releaseSeat(
        tenantId,
        selectedSeat.number,
        'Admin (Civil Lines)',
        reason
      );
      setOccupancyMap({ ...seatOccupancyService.getAllSeats(tenantId) });
      setActionToast({
        type: 'success',
        message: res.message,
      });
    } catch (err: any) {
      setActionToast({ type: 'alert', message: err.message || 'Failed to release seat.' });
    }
  };

  const handleCorrectOccupant = (
    newStudent: { studentId: string; name: string; department?: string; phone?: string },
    notes?: string
  ) => {
    if (!selectedSeat) return;
    try {
      const res = seatOccupancyService.correctOccupancy(
        tenantId,
        selectedSeat.number,
        newStudent,
        'Admin (Civil Lines)',
        notes || 'Corrected record'
      );
      setOccupancyMap({ ...seatOccupancyService.getAllSeats(tenantId) });
      setIsCorrectModalOpen(false);
      setActionToast({
        type: 'info',
        message: res.message,
      });
    } catch (err: any) {
      setActionToast({ type: 'alert', message: err.message || 'Failed to correct record.' });
    }
  };

  const handleToggleMaintenance = (isMaint: boolean, reason?: string) => {
    if (!selectedSeat) return;
    try {
      seatOccupancyService.toggleMaintenance(
        tenantId,
        selectedSeat.number,
        isMaint,
        reason || 'Scheduled surface and electrical inspection',
        'Admin (Civil Lines)'
      );
      setOccupancyMap({ ...seatOccupancyService.getAllSeats(tenantId) });
      setIsMaintenanceModalOpen(false);
      setActionToast({
        type: isMaint ? 'info' : 'success',
        message: isMaint
          ? `Desk ${selectedSeat.formattedLabel} placed under maintenance.`
          : `Desk ${selectedSeat.formattedLabel} restored to service.`,
      });
    } catch (err: any) {
      setActionToast({ type: 'alert', message: err.message || 'Failed to update maintenance.' });
    }
  };

  const handleAlertStudentToMove = (occupantName: string, assignedDesk?: string) => {
    if (!selectedSeat) return;
    const targetDesk = assignedDesk || 'designated desk';
    setActionToast({
      type: 'alert',
      message: `📢 Immediate push notification sent to ${occupantName}: "Please return to your allocated desk ${targetDesk}."`,
    });
  };

  const handleAuthorizeSeatSwap = (seatNo: number) => {
    if (!selectedSeat) return;
    const current = occupancyMap[seatNo];
    if (!current || !current.occupyingStudent) return;

    try {
      // Authorize swap in service
      current.isCrossOccupied = false;
      current.status = 'occupied_assigned';
      current.statusLabel = 'Occupied by Assigned Student (Swap Authorized)';
      if (current.occupyingStudent) {
        current.occupyingStudent.notes = 'Temporary desk swap officially authorized by Admin for today.';
      }
      setOccupancyMap({ ...occupancyMap });
      setActionToast({
        type: 'success',
        message: `✓ Temporary desk swap approved for ${current.occupyingStudent.name} at ${current.deskLabel} for today.`,
      });
    } catch (err: any) {
      setActionToast({ type: 'alert', message: err.message || 'Failed to authorize swap.' });
    }
  };

  // Open Desk & Shift Configuration Modal
  const handleOpenCustomizeModal = () => {
    setDraftRanges(JSON.parse(JSON.stringify(categoryRanges)));
    setDraftShifts(JSON.parse(JSON.stringify(shiftCategories)));
    setSetupTab('ranges');
    setIsCustomizeModalOpen(true);
  };

  const handleSaveRanges = () => {
    setCategoryRanges(draftRanges);
    setShiftCategories(draftShifts);
    setIsCustomizeModalOpen(false);
  };

  return (
    <View style={styles.container}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER (Seamless Without Container Card)                     */}
      {/* ========================================================================= */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIconBox, { backgroundColor: colors.brand.light }]}>
            <Armchair size={22} color={colors.brand.primary} strokeWidth={2.2} />
          </View>
          <View>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Seat Management
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
              {totalSeats} seats configured
            </Text>
          </View>
        </View>

        {/* Right Action Controls */}
        <View style={styles.headerRight}>
          {/* Desk & Shift Configuration Settings */}
          <TouchableOpacity
            onPress={handleOpenCustomizeModal}
            style={[
              styles.configRangesBtn,
              {
                backgroundColor: isDark ? colors.surface.cardAlt : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}
            activeOpacity={0.8}>
            <Sliders size={14} color={colors.text.secondary} strokeWidth={2} />
            <Text style={[styles.configRangesBtnText, { color: colors.text.secondary }]}>
              Desk & Shift Setup
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 2. CATEGORY SUMMARY CARDS: REDESIGNED WITH WHITE BG & SUBTLE TINT HIGHLIGHT*/}
      {/* ========================================================================= */}
      <View style={[styles.categoryCardsGrid, isMobile && styles.categoryCardsGridMobile]}>
        {/* ALL DESKS CARD */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleCategoryChange('all')}
          style={[
            styles.categorySummaryCard,
            isMobile && styles.categorySummaryCardMobile,
            {
              backgroundColor: selectedCategory === 'all' ? (isDark ? '#203A2D' : '#E8EEE5') : (isDark ? colors.surface.card : '#FFFFFF'),
              borderColor: selectedCategory === 'all' ? (isDark ? '#55B58D' : '#245C48') : colors.surface.border,
            },
          ]}>
          <View style={styles.catCardHeader}>
            <View style={styles.catCardLabelGroup}>
              <View style={[styles.catIconSquare, { backgroundColor: isDark ? '#203A2D' : '#F1F4EE' }]}>
                <Armchair size={16} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.2} />
              </View>
              <Text style={[styles.catCardTitle, { color: colors.text.primary }]}>
                All Desks
              </Text>
            </View>
            <Text
              style={[
                styles.catCardCount,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              {categoryStats.all}
            </Text>
          </View>
          <View style={styles.catCardFooter}>
            <Text style={[styles.catCardRange, { color: colors.text.muted }]}>
              Desks 1 to {totalSeats}
            </Text>
            <Text style={[styles.catCardPricing, { color: colors.text.secondary }]}>
              Full Library View
            </Text>
          </View>
        </TouchableOpacity>

        {/* EXCLUSIVE CATEGORY CARD (Muted Gold Accent #C4A052) */}
        {categoryStats.exclusive.config && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleCategoryChange('exclusive')}
            style={[
              styles.categorySummaryCard,
              isMobile && styles.categorySummaryCardMobile,
              {
                backgroundColor: selectedCategory === 'exclusive' ? (isDark ? '#262217' : '#FAF6ED') : (isDark ? colors.surface.card : '#FFFFFF'),
                borderColor: selectedCategory === 'exclusive' ? '#C4A052' : colors.surface.border,
              },
            ]}>
            <View style={styles.catCardHeader}>
              <View style={styles.catCardLabelGroup}>
                <View style={[styles.catIconSquare, { backgroundColor: isDark ? '#332C1E' : '#F7F2E6' }]}>
                  <Crown size={16} color="#C4A052" strokeWidth={2.2} />
                </View>
                <Text style={[styles.catCardTitle, { color: colors.text.primary }]}>
                  {categoryStats.exclusive.config?.name || 'Exclusive'}
                </Text>
              </View>
              <Text
                style={[
                  styles.catCardCount,
                  {
                    color: colors.text.primary,
                    fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                  },
                ]}>
                {categoryStats.exclusive.total}
              </Text>
            </View>
            <View style={styles.catCardFooter}>
              <Text style={[styles.catCardRange, { color: colors.text.muted }]}>
                Desks {categoryStats.exclusive.config.startNo} to {categoryStats.exclusive.config.endNo}
              </Text>
              <Text style={[styles.catCardPricing, { color: '#C4A052' }]}>
                ₹{categoryStats.exclusive.config.monthlyFee.toLocaleString('en-IN')}/mo
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* PREMIUM CATEGORY CARD (Sage Green Accent #A5B9A2 / #245C48) */}
        {categoryStats.premium.config && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleCategoryChange('premium')}
            style={[
              styles.categorySummaryCard,
              isMobile && styles.categorySummaryCardMobile,
              {
                backgroundColor: selectedCategory === 'premium' ? (isDark ? '#203A2D' : '#EEF4ED') : (isDark ? colors.surface.card : '#FFFFFF'),
                borderColor: selectedCategory === 'premium' ? (isDark ? '#55B58D' : '#245C48') : colors.surface.border,
              },
            ]}>
            <View style={styles.catCardHeader}>
              <View style={styles.catCardLabelGroup}>
                <View style={[styles.catIconSquare, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                  <Sparkles size={16} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.2} />
                </View>
                <Text style={[styles.catCardTitle, { color: colors.text.primary }]}>
                  {categoryStats.premium.config?.name || 'Premium'}
                </Text>
              </View>
              <Text
                style={[
                  styles.catCardCount,
                  {
                    color: colors.text.primary,
                    fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                  },
                ]}>
                {categoryStats.premium.total}
              </Text>
            </View>
            <View style={styles.catCardFooter}>
              <Text style={[styles.catCardRange, { color: colors.text.muted }]}>
                Desks {categoryStats.premium.config.startNo} to {categoryStats.premium.config.endNo}
              </Text>
              <Text style={[styles.catCardPricing, { color: '#245C48' }]}>
                ₹{categoryStats.premium.config.monthlyFee.toLocaleString('en-IN')}/mo
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* CLASSIC CATEGORY CARD (Cool Grey-Blue Accent #628194) */}
        {categoryStats.classic.config && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleCategoryChange('classic')}
            style={[
              styles.categorySummaryCard,
              isMobile && styles.categorySummaryCardMobile,
              {
                backgroundColor: selectedCategory === 'classic' ? (isDark ? '#1B242B' : '#EDF3F7') : (isDark ? colors.surface.card : '#FFFFFF'),
                borderColor: selectedCategory === 'classic' ? '#628194' : colors.surface.border,
              },
            ]}>
            <View style={styles.catCardHeader}>
              <View style={styles.catCardLabelGroup}>
                <View style={[styles.catIconSquare, { backgroundColor: isDark ? '#243038' : '#E9F0F4' }]}>
                  <BookOpen size={16} color="#628194" strokeWidth={2.2} />
                </View>
                <Text style={[styles.catCardTitle, { color: colors.text.primary }]}>
                  {categoryStats.classic.config?.name || 'Classic'}
                </Text>
              </View>
              <Text
                style={[
                  styles.catCardCount,
                  {
                    color: colors.text.primary,
                    fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                  },
                ]}>
                {categoryStats.classic.total}
              </Text>
            </View>
            <View style={styles.catCardFooter}>
              <Text style={[styles.catCardRange, { color: colors.text.muted }]}>
                Desks {categoryStats.classic.config.startNo} to {categoryStats.classic.config.endNo}
              </Text>
              <Text style={[styles.catCardPricing, { color: '#628194' }]}>
                ₹{categoryStats.classic.config.monthlyFee.toLocaleString('en-IN')}/mo
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* CUSTOM CATEGORY CARDS (if any custom tiers added) */}
        {categoryRanges.filter(r => !['exclusive', 'premium', 'classic'].includes(r.id)).map((customRange) => {
          const totalInCat = seatsList.filter(s => s.category === customRange.id).length;
          const isSelected = selectedCategory === customRange.id;
          return (
            <TouchableOpacity
              key={customRange.id}
              activeOpacity={0.85}
              onPress={() => handleCategoryChange(customRange.id)}
              style={[
                styles.categorySummaryCard,
                isMobile && styles.categorySummaryCardMobile,
                {
                  backgroundColor: isSelected ? (isDark ? '#261F38' : '#F3EFFE') : (isDark ? colors.surface.card : '#FFFFFF'),
                  borderColor: isSelected ? '#8B5CF6' : colors.surface.border,
                },
              ]}>
              <View style={styles.catCardHeader}>
                <View style={styles.catCardLabelGroup}>
                  <View style={[styles.catIconSquare, { backgroundColor: isDark ? '#2E2248' : '#EDE8FC' }]}>
                    <Sparkles size={16} color="#8B5CF6" strokeWidth={2.2} />
                  </View>
                  <Text style={[styles.catCardTitle, { color: colors.text.primary }]}>
                    {customRange.name}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.catCardCount,
                    {
                      color: colors.text.primary,
                      fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                    },
                  ]}>
                  {totalInCat}
                </Text>
              </View>
              <View style={styles.catCardFooter}>
                <Text style={[styles.catCardRange, { color: colors.text.muted }]}>
                  Desks {customRange.startNo} to {customRange.endNo}
                </Text>
                <Text style={[styles.catCardPricing, { color: '#8B5CF6' }]}>
                  ₹{customRange.monthlyFee.toLocaleString('en-IN')}/mo
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>



      {/* ========================================================================= */}
      {/* 4. SEARCH & FILTER TOOLBAR (Claymorphic Segmented Design & Mobile Ready)  */}
      {/* ========================================================================= */}
      <View style={[styles.toolbarRow, isMobile && styles.toolbarRowMobile]}>
        {/* Compact Search Input on the Left */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
              width: isMobile ? '100%' : 220,
            },
          ]}>
          <Search size={14} color={colors.text.muted} strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
            }}
            placeholder="Search desk or name..."
            placeholderTextColor={colors.text.faint}
            style={[styles.searchInput, { color: colors.text.primary }]}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color={colors.text.muted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Responsive Wrapping Container for Filter Controls (No sliding/horizontal scroll) */}
        <View style={styles.filterControlsWrapper}>
          {/* Claymorphic Filter Track - 5 Official Real-Time Occupancy Statuses */}
          <View
            style={[
              styles.filterSegmentTrack,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#EBE7E0',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              },
            ]}>
            {[
              { id: 'all', label: 'All Desks', count: seatsList.length, dot: '#245C48' },
              { id: 'occupied_assigned', label: 'Occupied (Assigned)', count: occupancyStats.occupiedAssigned, dot: '#245C48' },
              { id: 'occupied_another', label: 'Occupied (Different Student)', count: occupancyStats.occupiedAnother, dot: '#D97706', isAlert: true },
              { id: 'available', label: 'Available', count: occupancyStats.available, dot: '#879187' },
              { id: 'reserved', label: 'Reserved', count: occupancyStats.reserved, dot: '#B58A4A' },
              { id: 'maintenance', label: 'Maintenance', count: occupancyStats.maintenance, dot: '#628194' },
            ].map((item) => {
              const isSelected = occupancyStatusFilter === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setOccupancyStatusFilter(item.id as any);
                  }}
                  style={[
                    styles.filterSegmentBtn,
                    isSelected && [
                      styles.filterSegmentBtnActive,
                      {
                        backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.05)',
                      },
                    ],
                  ]}>
                  {item.isAlert ? (
                    <AlertTriangle size={12} color="#D97706" strokeWidth={2.4} />
                  ) : (
                    <View style={[styles.activeDot, { backgroundColor: item.dot }]} />
                  )}
                  <Text
                    style={[
                      styles.filterSegmentText,
                      {
                        color: isSelected
                          ? (item.isAlert ? '#D97706' : colors.text.primary)
                          : colors.text.secondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}>
                    {item.label} ({item.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Clear Filters Button */}
          {isFilterActive && (
            <TouchableOpacity
              onPress={handleClearFilters}
              activeOpacity={0.8}
              style={[
                styles.clearFiltersBtn,
                {
                  backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                  borderColor: colors.surface.border,
                },
              ]}>
              <RotateCcw size={12} color={colors.text.muted} />
              <Text style={[styles.clearFiltersBtnText, { color: colors.text.muted }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}

          {/* Results Counter */}
          <View
            style={[
              styles.resultsCounter,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            <Text style={[styles.resultsCounterText, { color: colors.text.muted }]}>
              {filteredSeats.length}/{totalSeats}
            </Text>
          </View>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 5. SEAT CARDS GRID: CALM, SUBTLE CATEGORY TINTS WITH 3 SHIFT INDICATORS   */}
      {/* ========================================================================= */}
      <View style={styles.gridContainer}>
        {filteredSeats.length === 0 ? (
          <View
            style={[
              styles.emptyStateCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            <Armchair size={42} color={colors.text.faint} strokeWidth={1.5} />
            <Text style={[styles.emptyStateTitle, { color: colors.text.primary }]}>
              No matching desks found
            </Text>
            <Text style={[styles.emptyStateSub, { color: colors.text.muted }]}>
              Try adjusting your search query or reset the category & shift filters.
            </Text>
            <TouchableOpacity
              onPress={handleClearFilters}
              style={[styles.emptyStateResetBtn, { backgroundColor: '#245C48' }]}>
              <Text style={styles.emptyStateResetBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ULTRA-CLEAN SEAT BOXES: EXCLUSIVELY DISPLAYING THE SEAT NUMBER */
          <View style={styles.compactGrid}>
            {filteredSeats.map((seat) => {
              const catStyles = getCategoryStyles(seat.category);

              return (
                <TouchableOpacity
                  key={seat.number}
                  activeOpacity={0.75}
                  onPress={() => setSelectedSeat(seat)}
                  style={[
                    styles.seatCard,
                    {
                      backgroundColor: isDark ? colors.surface.card : catStyles.cardBg,
                      borderColor: catStyles.cardBorder,
                      borderWidth: 1,
                      width: isMobile ? '22%' : isTablet ? 72 : 76,
                      height: isMobile ? 52 : 56,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}>
                  {/* Seat Number Only */}
                  <Text
                    style={[
                      styles.seatNumberMainText,
                      {
                        color: colors.text.primary,
                        fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                      },
                    ]}>
                    {seat.formattedLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* ========================================================================= */}
      {/* 7. SEAT DETAILS SIDE PANEL / MODAL ON CLICK                               */}
      {/* ========================================================================= */}
      <Modal
        visible={!!selectedSeat}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSeat(null)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.dialogCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            {selectedSeat && (
              <>
                {/* Modal Header */}
                <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
                  <View style={styles.dialogHeaderLeft}>
                    <View style={[styles.dialogHeaderIconBox, { backgroundColor: colors.brand.light }]}>
                      <Armchair size={22} color={colors.brand.primary} strokeWidth={2.2} />
                    </View>
                    <View>
                      <View style={styles.dialogTitleRow}>
                        <Text
                          style={[
                            styles.dialogTitle,
                            {
                              color: colors.text.primary,
                              fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                            },
                          ]}>
                          Desk {selectedSeat.formattedLabel}
                        </Text>
                        <View
                          style={[
                            styles.dialogCatBadge,
                            { backgroundColor: getCategoryStyles(selectedSeat.category).accentBg },
                          ]}>
                          <Text
                            style={[
                              styles.dialogCatBadgeText,
                              { color: getCategoryStyles(selectedSeat.category).badgeText },
                            ]}>
                            {getCategoryStyles(selectedSeat.category).label} Tier
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                        Monthly Rate: ₹{categoryRanges.find((r) => r.id === selectedSeat.category)?.monthlyFee.toLocaleString('en-IN')} / month
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedSeat(null)}
                    style={[styles.closeModalBtn, { backgroundColor: isDark ? colors.surface.cardAlt : '#F1F4EE' }]}>
                    <X size={18} color={colors.text.muted} />
                  </TouchableOpacity>
                </View>

                {/* 4-Tab Navigation Bar */}
                <View
                  style={[
                    styles.detailModalTabBar,
                    {
                      borderBottomColor: colors.surface.border,
                      backgroundColor: isDark ? colors.surface.cardAlt : '#F7F7F1',
                    },
                  ]}>
                  {/* TAB 1: TWO-STUDENT OVERVIEW */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSeatDetailTab('two_students');
                      setActionToast(null);
                    }}
                    style={[
                      styles.detailModalTabBtn,
                      seatDetailTab === 'two_students' && [
                        styles.detailModalTabBtnActive,
                        {
                          backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                          borderColor: colors.surface.border,
                          borderBottomColor: isDark ? colors.surface.card : '#FFFFFF',
                        },
                      ],
                    ]}>
                    <Users
                      size={14}
                      color={seatDetailTab === 'two_students' ? colors.brand.primary : colors.text.muted}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.detailModalTabBtnText,
                        {
                          color: seatDetailTab === 'two_students' ? colors.brand.primary : colors.text.muted,
                          fontWeight: seatDetailTab === 'two_students' ? '700' : '500',
                        },
                      ]}>
                      Two-Student Status
                    </Text>
                  </TouchableOpacity>

                  {/* TAB 2: SHIFT ALLOCATIONS */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSeatDetailTab('shifts');
                      setActionToast(null);
                    }}
                    style={[
                      styles.detailModalTabBtn,
                      seatDetailTab === 'shifts' && [
                        styles.detailModalTabBtnActive,
                        {
                          backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                          borderColor: colors.surface.border,
                          borderBottomColor: isDark ? colors.surface.card : '#FFFFFF',
                        },
                      ],
                    ]}>
                    <Calendar
                      size={14}
                      color={seatDetailTab === 'shifts' ? colors.brand.primary : colors.text.muted}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.detailModalTabBtnText,
                        {
                          color: seatDetailTab === 'shifts' ? colors.brand.primary : colors.text.muted,
                          fontWeight: seatDetailTab === 'shifts' ? '700' : '500',
                        },
                      ]}>
                      Shift Allocation
                    </Text>
                  </TouchableOpacity>

                  {/* TAB 3: OCCUPANCY HISTORY */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSeatDetailTab('history');
                      setActionToast(null);
                    }}
                    style={[
                      styles.detailModalTabBtn,
                      seatDetailTab === 'history' && [
                        styles.detailModalTabBtnActive,
                        {
                          backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                          borderColor: colors.surface.border,
                          borderBottomColor: isDark ? colors.surface.card : '#FFFFFF',
                        },
                      ],
                    ]}>
                    <History
                      size={14}
                      color={seatDetailTab === 'history' ? colors.brand.primary : colors.text.muted}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.detailModalTabBtnText,
                        {
                          color: seatDetailTab === 'history' ? colors.brand.primary : colors.text.muted,
                          fontWeight: seatDetailTab === 'history' ? '700' : '500',
                        },
                      ]}>
                      History
                    </Text>
                  </TouchableOpacity>

                  {/* TAB 4: AUDIT TRAIL */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      setSeatDetailTab('audit');
                      setActionToast(null);
                    }}
                    style={[
                      styles.detailModalTabBtn,
                      seatDetailTab === 'audit' && [
                        styles.detailModalTabBtnActive,
                        {
                          backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                          borderColor: colors.surface.border,
                          borderBottomColor: isDark ? colors.surface.card : '#FFFFFF',
                        },
                      ],
                    ]}>
                    <FileText
                      size={14}
                      color={seatDetailTab === 'audit' ? colors.brand.primary : colors.text.muted}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.detailModalTabBtnText,
                        {
                          color: seatDetailTab === 'audit' ? colors.brand.primary : colors.text.muted,
                          fontWeight: seatDetailTab === 'audit' ? '700' : '500',
                        },
                      ]}>
                      Audit Trail
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* TAB 2: SHIFT ALLOCATIONS */}
                {seatDetailTab === 'shifts' && (
                  /* PAGE 1: 3 Shifts Status & Student Breakdown */
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dialogScrollContent}>
                    <Text style={[styles.dialogSectionHeading, { color: colors.text.muted }]}>
                      THREE-SHIFT ALLOCATION STATUS
                    </Text>

                    {/* SHIFT 1: MORNING */}
                    <View
                      style={[
                        styles.shiftDetailCard,
                        {
                          backgroundColor: isDark ? colors.surface.canvas : '#F7F7F1',
                          borderColor: colors.surface.border,
                        },
                      ]}>
                      <View style={styles.shiftDetailCardHeader}>
                        <View style={styles.shiftDetailTitleRow}>
                          <Sunrise size={16} color={colors.brand.primary} strokeWidth={2.2} />
                          <Text style={[styles.shiftDetailTitle, { color: colors.text.primary }]}>
                            Shift 1: Morning Slot (06:00 AM – 02:00 PM)
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.shiftStatusTag,
                            { backgroundColor: SHIFT_STATUS_COLORS[selectedSeat.morningStatus].bg },
                          ]}>
                          <Text
                            style={[
                              styles.shiftStatusTagText,
                              { color: SHIFT_STATUS_COLORS[selectedSeat.morningStatus].text },
                            ]}>
                            {SHIFT_STATUS_COLORS[selectedSeat.morningStatus].label}
                          </Text>
                        </View>
                      </View>

                      {selectedSeat.morningStudent ? (
                        <View
                          style={[
                            styles.studentEnrolledBox,
                            {
                              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                              borderColor: colors.surface.border,
                            },
                          ]}>
                          <View style={[styles.studentAvatar, { backgroundColor: '#245C48' }]}>
                            <Text style={styles.studentAvatarText}>
                              {selectedSeat.morningStudent.name.slice(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.studentDetailsCol}>
                            <Text style={[styles.studentNameHeader, { color: colors.text.primary }]}>
                              {selectedSeat.morningStudent.name}
                            </Text>
                            <Text style={[styles.studentIdRow, { color: colors.text.muted }]}>
                              ID: {selectedSeat.morningStudent.studentId} • {selectedSeat.morningStudent.phone}
                            </Text>
                            <Text style={[styles.validityDates, { color: colors.text.faint }]}>
                              Valid: {selectedSeat.morningStudent.startDate} to {selectedSeat.morningStudent.endDate}
                            </Text>
                          </View>
                          <View style={[styles.feePaymentTag, { backgroundColor: colors.brand.light }]}>
                            <Text style={[styles.feePaymentTagText, { color: colors.brand.primary }]}>
                              {selectedSeat.morningStudent.paymentStatus}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.vacantSlotRow}>
                          <Text style={[styles.vacantSlotPrompt, { color: colors.text.muted }]}>
                            Desk available for morning enrolment
                          </Text>
                          <TouchableOpacity style={[styles.assignStudentBtn, { backgroundColor: '#245C48' }]}>
                            <Plus size={13} color="#FFFFFF" strokeWidth={2.2} />
                            <Text style={styles.assignStudentBtnText}>Book Morning Shift</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>

                    {/* SHIFT 2: EVENING */}
                    <View
                      style={[
                        styles.shiftDetailCard,
                        {
                          backgroundColor: isDark ? colors.surface.canvas : '#F7F7F1',
                          borderColor: colors.surface.border,
                        },
                      ]}>
                      <View style={styles.shiftDetailCardHeader}>
                        <View style={styles.shiftDetailTitleRow}>
                          <Sunset size={16} color="#C4A052" strokeWidth={2.2} />
                          <Text style={[styles.shiftDetailTitle, { color: colors.text.primary }]}>
                            Shift 2: Evening Slot (02:00 PM – 10:00 PM)
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.shiftStatusTag,
                            { backgroundColor: SHIFT_STATUS_COLORS[selectedSeat.eveningStatus].bg },
                          ]}>
                          <Text
                            style={[
                              styles.shiftStatusTagText,
                              { color: SHIFT_STATUS_COLORS[selectedSeat.eveningStatus].text },
                            ]}>
                            {SHIFT_STATUS_COLORS[selectedSeat.eveningStatus].label}
                          </Text>
                        </View>
                      </View>

                      {selectedSeat.eveningStudent ? (
                        <View
                          style={[
                            styles.studentEnrolledBox,
                            {
                              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                              borderColor: colors.surface.border,
                            },
                          ]}>
                          <View style={[styles.studentAvatar, { backgroundColor: '#C4A052' }]}>
                            <Text style={styles.studentAvatarText}>
                              {selectedSeat.eveningStudent.name.slice(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.studentDetailsCol}>
                            <Text style={[styles.studentNameHeader, { color: colors.text.primary }]}>
                              {selectedSeat.eveningStudent.name}
                            </Text>
                            <Text style={[styles.studentIdRow, { color: colors.text.muted }]}>
                              ID: {selectedSeat.eveningStudent.studentId} • {selectedSeat.eveningStudent.phone}
                            </Text>
                            <Text style={[styles.validityDates, { color: colors.text.faint }]}>
                              Valid: {selectedSeat.eveningStudent.startDate} to {selectedSeat.eveningStudent.endDate}
                            </Text>
                          </View>
                          <View style={[styles.feePaymentTag, { backgroundColor: colors.brand.light }]}>
                            <Text style={[styles.feePaymentTagText, { color: colors.brand.primary }]}>
                              {selectedSeat.eveningStudent.paymentStatus}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.vacantSlotRow}>
                          <Text style={[styles.vacantSlotPrompt, { color: colors.text.muted }]}>
                            Desk available for evening shift enrolment
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* SHIFT 3: NIGHT */}
                    <View
                      style={[
                        styles.shiftDetailCard,
                        {
                          backgroundColor: isDark ? colors.surface.canvas : '#F7F7F1',
                          borderColor: colors.surface.border,
                        },
                      ]}>
                      <View style={styles.shiftDetailCardHeader}>
                        <View style={styles.shiftDetailTitleRow}>
                          <Moon size={16} color="#628194" strokeWidth={2.2} />
                          <Text style={[styles.shiftDetailTitle, { color: colors.text.primary }]}>
                            Shift 3: Night Slot (10:00 PM – 06:00 AM)
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.shiftStatusTag,
                            { backgroundColor: SHIFT_STATUS_COLORS[selectedSeat.nightStatus].bg },
                          ]}>
                          <Text
                            style={[
                              styles.shiftStatusTagText,
                              { color: SHIFT_STATUS_COLORS[selectedSeat.nightStatus].text },
                            ]}>
                            {SHIFT_STATUS_COLORS[selectedSeat.nightStatus].label}
                          </Text>
                        </View>
                      </View>

                      {selectedSeat.nightStudent ? (
                        <View
                          style={[
                            styles.studentEnrolledBox,
                            {
                              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                              borderColor: colors.surface.border,
                            },
                          ]}>
                          <View style={[styles.studentAvatar, { backgroundColor: '#628194' }]}>
                            <Text style={styles.studentAvatarText}>
                              {selectedSeat.nightStudent.name.slice(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <View style={styles.studentDetailsCol}>
                            <Text style={[styles.studentNameHeader, { color: colors.text.primary }]}>
                              {selectedSeat.nightStudent.name}
                            </Text>
                            <Text style={[styles.studentIdRow, { color: colors.text.muted }]}>
                              ID: {selectedSeat.nightStudent.studentId} • {selectedSeat.nightStudent.phone}
                            </Text>
                            <Text style={[styles.validityDates, { color: colors.text.faint }]}>
                              Valid: {selectedSeat.nightStudent.startDate} to {selectedSeat.nightStudent.endDate}
                            </Text>
                          </View>
                          <View style={[styles.feePaymentTag, { backgroundColor: colors.brand.light }]}>
                            <Text style={[styles.feePaymentTagText, { color: colors.brand.primary }]}>
                              {selectedSeat.nightStudent.paymentStatus}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.vacantSlotRow}>
                          <Text style={[styles.vacantSlotPrompt, { color: colors.text.muted }]}>
                            Desk available for night shift enrolment
                          </Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>
                )}

                {/* TAB 1: TWO-STUDENT OVERVIEW */}
                {seatDetailTab === 'two_students' && (() => {
                  const occ = occupancyMap[selectedSeat.number];
                  const assigned = occ?.assignedStudent;
                  const occupant = occ?.occupyingStudent;
                  const status = occ?.status || 'available';
                  const isAssignedPresent = status === 'occupied_assigned';
                  const isAnotherPresent = status === 'occupied_another';
                  const isVacant = status === 'available';
                  const isMaint = status === 'maintenance';

                  return (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dialogScrollContent}>
                      {/* Action Toast Feedback Banner */}
                      {actionToast && (
                        <View
                          style={[
                            styles.actionToastBox,
                            {
                              backgroundColor:
                                actionToast.type === 'alert'
                                  ? isDark ? '#3D2A14' : '#FEF3C7'
                                  : actionToast.type === 'info'
                                  ? isDark ? '#1F2E3B' : '#E0F2FE'
                                  : isDark ? '#1C3328' : '#ECFDF5',
                              borderColor:
                                actionToast.type === 'alert'
                                  ? '#F59E0B'
                                  : actionToast.type === 'info'
                                  ? '#38BDF8'
                                  : '#10B981',
                            },
                          ]}>
                          {actionToast.type === 'alert' ? (
                            <AlertTriangle size={15} color="#D97706" strokeWidth={2.2} />
                          ) : actionToast.type === 'info' ? (
                            <Clock size={15} color="#0284C7" strokeWidth={2.2} />
                          ) : (
                            <CheckCircle2 size={15} color="#059669" strokeWidth={2.2} />
                          )}
                          <Text
                            style={[
                              styles.actionToastText,
                              {
                                color:
                                  actionToast.type === 'alert'
                                    ? isDark ? '#FDE68A' : '#92400E'
                                    : actionToast.type === 'info'
                                    ? isDark ? '#BAE6FD' : '#075985'
                                    : isDark ? '#A7F3D0' : '#065F46',
                              },
                            ]}>
                            {actionToast.message}
                          </Text>
                        </View>
                      )}

                      {/* Scenario 2 & 4: Another student occupies the seat */}
                      {isAnotherPresent && (
                        <View style={styles.scenarioBannerAmber}>
                          <AlertTriangle size={18} color="#D97706" strokeWidth={2.4} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.scenarioBannerAmberTitle}>
                              ⚠️ SEAT OCCUPIED BY A DIFFERENT STUDENT
                            </Text>
                            <Text style={styles.scenarioBannerAmberSub}>
                              {assigned ? `Desk enrolled to ${assigned.name} is currently physically used by ${occupant?.name} (${occupant?.studentId}).` : `Unassigned desk is currently in use by ${occupant?.name}.`} Original enrolment record remains untouched.
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Scenario 1: Assigned student occupies their own seat */}
                      {isAssignedPresent && (
                        <View style={styles.scenarioBannerGreen}>
                          <CheckCircle2 size={18} color="#245C48" strokeWidth={2.4} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.scenarioBannerGreenTitle}>
                              🟢 ASSIGNED STUDENT PRESENT
                            </Text>
                            <Text style={styles.scenarioBannerGreenSub}>
                              Enrolled student {assigned?.name} is verified seated at their designated desk {selectedSeat.formattedLabel}.
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Scenario 3: Assigned student absent / Vacant */}
                      {isVacant && (
                        <View style={styles.scenarioBannerNeutral}>
                          <Info size={18} color="#879187" strokeWidth={2.2} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.scenarioBannerNeutralTitle}>
                              ⚪ DESK PHYSICALLY VACANT
                            </Text>
                            <Text style={styles.scenarioBannerNeutralSub}>
                              {assigned ? `Enrolled student ${assigned.name} is currently absent.` : 'No student assigned to this desk.'} Desk is physically available.
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Maintenance Banner */}
                      {isMaint && (
                        <View style={styles.scenarioBannerMaint}>
                          <Wrench size={18} color="#628194" strokeWidth={2.2} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.scenarioBannerMaintTitle}>
                              🛠️ UNDER MAINTENANCE
                            </Text>
                            <Text style={styles.scenarioBannerMaintSub}>
                              {occ?.maintenanceReason || 'Desk temporarily blocked for repair.'}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* TWO INDEPENDENT STUDENT DETAILS CARDS */}
                      <View style={[styles.twoStudentsContainer, isMobile && { flexDirection: 'column' }]}>
                        {/* CARD A: OFFICIALLY ASSIGNED STUDENT */}
                        <View
                          style={[
                            styles.studentDetailCardHalf,
                            {
                              backgroundColor: isDark ? colors.surface.canvas : '#FFFFFF',
                              borderColor: colors.surface.border,
                            },
                          ]}>
                          <View style={styles.cardHeaderSmall}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Users size={14} color="#245C48" strokeWidth={2.2} />
                              <Text style={[styles.cardHeaderSmallTitle, { color: colors.text.primary }]}>
                                A. ASSIGNED STUDENT
                              </Text>
                            </View>
                            <View style={[styles.microStatusBadge, { backgroundColor: assigned ? '#E8EEE5' : '#F1F4EE' }]}>
                              <Text style={[styles.microStatusBadgeText, { color: assigned ? '#245C48' : '#879187' }]}>
                                {assigned ? (assigned.assignmentStatus === 'active' ? 'Active Enrolment' : assigned.assignmentStatus) : 'Unassigned'}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.cardHeaderSmallSub, { color: colors.text.muted }]}>
                            Permanent / Shift Enrolment Record
                          </Text>

                          {assigned ? (
                            <View style={styles.studentCardBody}>
                              <View style={styles.studentBioRow}>
                                <View style={[styles.avatarCircleMed, { backgroundColor: assigned.avatarColor || '#245C48' }]}>
                                  <Text style={styles.avatarCircleMedText}>{assigned.name.slice(0, 2).toUpperCase()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.studentBioName, { color: colors.text.primary }]}>{assigned.name}</Text>
                                  <Text style={[styles.studentBioMeta, { color: colors.text.muted }]}>
                                    ID: {assigned.studentId} • {assigned.department || 'General Studies'}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.specDivider} />

                              <View style={styles.specFieldRow}>
                                <Text style={[styles.specFieldLabel, { color: colors.text.muted }]}>Enrolled Shift:</Text>
                                <Text style={[styles.specFieldValue, { color: colors.text.primary }]}>{assigned.shiftLabel}</Text>
                              </View>
                              <View style={styles.specFieldRow}>
                                <Text style={[styles.specFieldLabel, { color: colors.text.muted }]}>Enrollment Validity:</Text>
                                <Text style={[styles.specFieldValue, { color: colors.text.primary }]}>{assigned.validityDates}</Text>
                              </View>
                              <View style={styles.specFieldRow}>
                                <Text style={[styles.specFieldLabel, { color: colors.text.muted }]}>Contact Phone:</Text>
                                <Text style={[styles.specFieldValue, { color: colors.text.primary }]}>{assigned.phone || '—'}</Text>
                              </View>
                              <View style={styles.specFieldRow}>
                                <Text style={[styles.specFieldLabel, { color: colors.text.muted }]}>Fee Tier Plan:</Text>
                                <Text style={[styles.specFieldValue, { color: '#245C48', fontWeight: '700' }]}>₹{(assigned.monthlyFee || 2000).toLocaleString('en-IN')}/mo</Text>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.unassignedBox}>
                              <Armchair size={28} color={colors.text.faint} />
                              <Text style={[styles.unassignedBoxText, { color: colors.text.muted }]}>
                                No student is currently enrolled or assigned to this desk.
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* CARD B: CURRENTLY OCCUPYING STUDENT */}
                        <View
                          style={[
                            styles.studentDetailCardHalf,
                            {
                              backgroundColor: isDark ? colors.surface.canvas : '#FFFFFF',
                              borderColor: isAnotherPresent ? '#F59E0B' : colors.surface.border,
                            },
                          ]}>
                          <View style={styles.cardHeaderSmall}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Activity size={14} color={occupant ? (isAnotherPresent ? '#D97706' : '#245C48') : '#879187'} strokeWidth={2.2} />
                              <Text style={[styles.cardHeaderSmallTitle, { color: colors.text.primary }]}>
                                B. CURRENT OCCUPANT
                              </Text>
                            </View>
                            <View style={[styles.microStatusBadge, { backgroundColor: occupant ? (isAnotherPresent ? '#FEF3C7' : '#E8EEE5') : '#F1F4EE' }]}>
                              <Text style={[styles.microStatusBadgeText, { color: occupant ? (isAnotherPresent ? '#B45309' : '#245C48') : '#879187' }]}>
                                {occupant ? (isAnotherPresent ? '⚠️ Different Student' : 'Assigned Seated') : 'Vacant'}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.cardHeaderSmallSub, { color: colors.text.muted }]}>
                            Real-Time Physical Desk Presence
                          </Text>

                          {occupant ? (
                            <View style={styles.studentCardBody}>
                              <View style={styles.studentBioRow}>
                                <View style={[styles.avatarCircleMed, { backgroundColor: isAnotherPresent ? '#D97706' : '#245C48' }]}>
                                  <Text style={styles.avatarCircleMedText}>{occupant.name.slice(0, 2).toUpperCase()}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.studentBioName, { color: colors.text.primary }]}>{occupant.name}</Text>
                                  <Text style={[styles.studentBioMeta, { color: colors.text.muted }]}>
                                    ID: {occupant.studentId} • {occupant.department || 'General Studies'}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.specDivider} />

                              <View style={styles.specFieldRow}>
                                <Text style={[styles.specFieldLabel, { color: colors.text.muted }]}>Check-In Time:</Text>
                                <Text style={[styles.specFieldValue, { color: colors.text.primary }]}>{occupant.checkInTime}</Text>
                              </View>
                              <View style={styles.specFieldRow}>
                                <Text style={[styles.specFieldLabel, { color: colors.text.muted }]}>Occupancy Duration:</Text>
                                <Text style={[styles.specFieldValue, { color: '#245C48', fontWeight: '700' }]}>{occupant.durationFormatted}</Text>
                              </View>
                              <View style={styles.specFieldRow}>
                                <Text style={[styles.specFieldLabel, { color: colors.text.muted }]}>Registration Method:</Text>
                                <Text style={[styles.specFieldValue, { color: colors.text.primary }]}>
                                  {occupant.registrationMethod === 'seat_qr' ? 'Seat QR Scan' : occupant.registrationMethod === 'manual_admin' ? 'Manual Admin Console' : 'Gate Turnstile'}
                                </Text>
                              </View>
                              <View style={styles.specFieldRow}>
                                <Text style={[styles.specFieldLabel, { color: colors.text.muted }]}>Status / Notes:</Text>
                                <Text style={[styles.specFieldValue, { color: isAnotherPresent ? '#B45309' : colors.text.primary, flex: 1, textAlign: 'right' }]}>
                                  {occupant.notes || (isAnotherPresent ? 'Sitting at different seat' : 'Normal attendance')}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.unassignedBox}>
                              <View style={[styles.microStatusDot, { backgroundColor: '#879187', width: 10, height: 10 }]} />
                              <Text style={[styles.unassignedBoxText, { color: colors.text.muted }]}>
                                No student is currently seated at this desk.
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Admin Desk Controls */}
                      <View style={[styles.adminActionsCard, { backgroundColor: isDark ? colors.surface.cardAlt : '#FBFBF7', borderColor: colors.surface.border }]}>
                        <Text style={[styles.adminActionsTitle, { color: colors.text.secondary }]}>
                          ADMINISTRATOR DESK CONTROLS
                        </Text>
                        <View style={styles.adminActionButtonsRow}>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                              setStudentSearchText('');
                              setAdminNoteText('');
                              setIsAssignModalOpen(true);
                            }}
                            style={[styles.adminActionBtn, { backgroundColor: '#245C48' }]}>
                            <UserCheck size={14} color="#FFFFFF" strokeWidth={2.2} />
                            <Text style={styles.adminActionBtnTextWhite}>Manually Assign Occupant</Text>
                          </TouchableOpacity>

                          {occupant && (
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => handleReleaseSeat('Admin released occupant')}
                              style={[styles.adminActionBtnOutline, { borderColor: '#E53E3E' }]}>
                              <LogOut size={14} color="#E53E3E" strokeWidth={2.2} />
                              <Text style={[styles.adminActionBtnTextOutline, { color: '#E53E3E' }]}>Release / Vacate Desk</Text>
                            </TouchableOpacity>
                          )}

                          {occupant && (
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => {
                                setStudentSearchText('');
                                setAdminNoteText('');
                                setIsCorrectModalOpen(true);
                              }}
                              style={[styles.adminActionBtnOutline, { borderColor: colors.surface.border }]}>
                              <Edit3 size={14} color={colors.text.primary} strokeWidth={2.2} />
                              <Text style={[styles.adminActionBtnTextOutline, { color: colors.text.primary }]}>Correct Record</Text>
                            </TouchableOpacity>
                          )}

                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => setIsMaintenanceModalOpen(true)}
                            style={[styles.adminActionBtnOutline, { borderColor: isMaint ? '#628194' : colors.surface.border }]}>
                            <Wrench size={14} color={isMaint ? '#628194' : colors.text.secondary} strokeWidth={2.2} />
                            <Text style={[styles.adminActionBtnTextOutline, { color: isMaint ? '#628194' : colors.text.secondary }]}>
                              {isMaint ? 'End Maintenance' : 'Set Maintenance'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ScrollView>
                  );
                })()}

                {/* TAB 3: OCCUPANCY HISTORY */}
                {seatDetailTab === 'history' && (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dialogScrollContent}>
                    <Text style={[styles.dialogSectionHeading, { color: colors.text.muted }]}>
                      SEAT OCCUPANCY SESSION HISTORY
                    </Text>
                    {(() => {
                      const historyList = seatOccupancyService.getSeatHistory(tenantId, selectedSeat.number);
                      if (historyList.length === 0) {
                        return (
                          <View style={styles.emptyHistoryBox}>
                            <History size={32} color={colors.text.faint} />
                            <Text style={[styles.emptyHistoryText, { color: colors.text.muted }]}>
                              No past occupancy sessions recorded for Desk {selectedSeat.formattedLabel} yet.
                            </Text>
                          </View>
                        );
                      }
                      return (
                        <View style={styles.historyListContainer}>
                          {historyList.map((item) => (
                            <View
                              key={item.id}
                              style={[
                                styles.historyItemCard,
                                {
                                  backgroundColor: isDark ? colors.surface.canvas : '#FFFFFF',
                                  borderColor: item.wasCrossOccupied ? '#F59E0B' : colors.surface.border,
                                },
                              ]}>
                              <View style={styles.historyItemTop}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <View style={[styles.avatarCircleSmall, { backgroundColor: item.wasCrossOccupied ? '#D97706' : '#245C48' }]}>
                                    <Text style={styles.avatarCircleSmallText}>{item.occupyingStudentName.slice(0, 2).toUpperCase()}</Text>
                                  </View>
                                  <View>
                                    <Text style={[styles.historyStudentName, { color: colors.text.primary }]}>{item.occupyingStudentName}</Text>
                                    <Text style={[styles.historyStudentMeta, { color: colors.text.muted }]}>
                                      ID: {item.occupyingStudentId} • {item.department}
                                    </Text>
                                  </View>
                                </View>
                                {item.wasCrossOccupied ? (
                                  <View style={styles.mismatchHistoryBadge}>
                                    <AlertTriangle size={11} color="#B45309" strokeWidth={2.4} />
                                    <Text style={styles.mismatchHistoryBadgeText}>Different Student</Text>
                                  </View>
                                ) : (
                                  <View style={styles.normalHistoryBadge}>
                                    <CheckCircle2 size={11} color="#245C48" strokeWidth={2.4} />
                                    <Text style={styles.normalHistoryBadgeText}>Assigned Present</Text>
                                  </View>
                                )}
                              </View>

                              <View style={styles.specDivider} />

                              <View style={styles.historyStatsRow}>
                                <View style={styles.historyStatCol}>
                                  <Text style={[styles.historyStatLabel, { color: colors.text.muted }]}>Check-In</Text>
                                  <Text style={[styles.historyStatVal, { color: colors.text.primary }]}>{item.checkInTime}</Text>
                                </View>
                                <View style={styles.historyStatCol}>
                                  <Text style={[styles.historyStatLabel, { color: colors.text.muted }]}>Check-Out</Text>
                                  <Text style={[styles.historyStatVal, { color: colors.text.primary }]}>{item.checkOutTime}</Text>
                                </View>
                                <View style={styles.historyStatCol}>
                                  <Text style={[styles.historyStatLabel, { color: colors.text.muted }]}>Duration</Text>
                                  <Text style={[styles.historyStatVal, { color: '#245C48', fontWeight: '700' }]}>{item.durationFormatted}</Text>
                                </View>
                                <View style={styles.historyStatCol}>
                                  <Text style={[styles.historyStatLabel, { color: colors.text.muted }]}>Method</Text>
                                  <Text style={[styles.historyStatVal, { color: colors.text.secondary }]}>{item.registrationMethod}</Text>
                                </View>
                              </View>
                            </View>
                          ))}
                        </View>
                      );
                    })()}
                  </ScrollView>
                )}

                {/* TAB 4: AUDIT TRAIL */}
                {seatDetailTab === 'audit' && (
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dialogScrollContent}>
                    <Text style={[styles.dialogSectionHeading, { color: colors.text.muted }]}>
                      DESK AUDIT TRAIL & OVERRIDE LOG
                    </Text>
                    {(() => {
                      const auditList = seatOccupancyService.getSeatAuditLogs(tenantId, selectedSeat.number);
                      if (auditList.length === 0) {
                        return (
                          <View style={styles.emptyHistoryBox}>
                            <FileText size={32} color={colors.text.faint} />
                            <Text style={[styles.emptyHistoryText, { color: colors.text.muted }]}>
                              No administrative overrides or audit events logged for Desk {selectedSeat.formattedLabel}.
                            </Text>
                          </View>
                        );
                      }
                      return (
                        <View style={styles.auditListContainer}>
                          {auditList.map((log) => (
                            <View
                              key={log.id}
                              style={[
                                styles.auditItemCard,
                                {
                                  backgroundColor: isDark ? colors.surface.canvas : '#FFFFFF',
                                  borderColor: colors.surface.border,
                                },
                              ]}>
                              <View style={styles.auditItemHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                  <ShieldCheck size={14} color="#245C48" strokeWidth={2.2} />
                                  <Text style={[styles.auditActionLabel, { color: colors.text.primary }]}>{log.actionLabel}</Text>
                                </View>
                                <Text style={[styles.auditTimestamp, { color: colors.text.muted }]}>{log.timestamp}</Text>
                              </View>
                              <Text style={[styles.auditDetailsText, { color: colors.text.secondary }]}>{log.details}</Text>
                              <Text style={[styles.auditPerformedBy, { color: colors.text.faint }]}>Performed by: {log.performedBy}</Text>
                            </View>
                          ))}
                        </View>
                      );
                    })()}
                  </ScrollView>
                )}

                {/* Modal Footer */}
                <View style={[styles.dialogFooter, { borderTopColor: colors.surface.border }]}>
                  <TouchableOpacity
                    onPress={() => setSelectedSeat(null)}
                    style={[styles.dialogCloseDoneBtn, { backgroundColor: '#245C48' }]}>
                    <Text style={styles.dialogCloseDoneBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      {/* ========================================================================= */}
      {/* 7B. QUICK ACTION HELPER MODALS (ASSIGN, CORRECT, MAINTENANCE)              */}
      {/* ========================================================================= */}
      {/* 1. MANUALLY ASSIGN OCCUPANT MODAL */}
      <Modal
        visible={isAssignModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAssignModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.helperDialogCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF' }]}>
            <View style={[styles.helperDialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <UserCheck size={18} color="#245C48" strokeWidth={2.2} />
                <Text style={[styles.helperDialogTitle, { color: colors.text.primary }]}>
                  Assign Occupant to Desk {selectedSeat?.formattedLabel}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsAssignModalOpen(false)}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.helperDialogBody}>
              <Text style={[styles.helperInputLabel, { color: colors.text.secondary }]}>
                Select Enrolled Student (or Search):
              </Text>
              <TextInput
                value={studentSearchText}
                onChangeText={setStudentSearchText}
                placeholder="Search student name or ID..."
                placeholderTextColor={colors.text.muted}
                style={[styles.helperTextInput, { borderColor: colors.surface.border, color: colors.text.primary }]}
              />

              <ScrollView style={styles.helperStudentsList}>
                {SEED_STUDENTS.filter(s =>
                  !studentSearchText ||
                  s.name.toLowerCase().includes(studentSearchText.toLowerCase()) ||
                  s.id.toLowerCase().includes(studentSearchText.toLowerCase())
                ).slice(0, 5).map((stud) => (
                  <TouchableOpacity
                    key={stud.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      handleAssignOccupant({
                        studentId: stud.id,
                        name: stud.name,
                        department: stud.department,
                        phone: stud.phone,
                      }, adminNoteText);
                    }}
                    style={[styles.helperStudentOption, { borderColor: colors.surface.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.helperStudentName, { color: colors.text.primary }]}>{stud.name}</Text>
                      <Text style={[styles.helperStudentId, { color: colors.text.muted }]}>
                        {stud.id} • {stud.department || 'General'}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#245C48', fontWeight: '700' }}>Seat Here →</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.helperInputLabel, { color: colors.text.secondary, marginTop: 10 }]}>
                Administrator Notes (Optional):
              </Text>
              <TextInput
                value={adminNoteText}
                onChangeText={setAdminNoteText}
                placeholder="e.g. Swapped desk due to air conditioning preference"
                placeholderTextColor={colors.text.muted}
                style={[styles.helperTextInput, { borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>

            <View style={[styles.helperDialogFooter, { borderTopColor: colors.surface.border }]}>
              <TouchableOpacity
                onPress={() => setIsAssignModalOpen(false)}
                style={[styles.helperCancelBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.helperCancelBtnText, { color: colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. CORRECT OCCUPANCY RECORD MODAL */}
      <Modal
        visible={isCorrectModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCorrectModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.helperDialogCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF' }]}>
            <View style={[styles.helperDialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Edit3 size={18} color="#245C48" strokeWidth={2.2} />
                <Text style={[styles.helperDialogTitle, { color: colors.text.primary }]}>
                  Correct Occupancy Record • Desk {selectedSeat?.formattedLabel}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsCorrectModalOpen(false)}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.helperDialogBody}>
              <Text style={[styles.helperInputLabel, { color: colors.text.secondary }]}>
                Correct Student Name:
              </Text>
              <TextInput
                defaultValue={selectedSeat ? occupancyMap[selectedSeat.number]?.occupyingStudent?.name : ''}
                onChangeText={setStudentSearchText}
                placeholder="Student full name"
                placeholderTextColor={colors.text.muted}
                style={[styles.helperTextInput, { borderColor: colors.surface.border, color: colors.text.primary }]}
              />

              <Text style={[styles.helperInputLabel, { color: colors.text.secondary, marginTop: 10 }]}>
                Reason for Correction:
              </Text>
              <TextInput
                value={adminNoteText}
                onChangeText={setAdminNoteText}
                placeholder="e.g. Scanned wrong desk barcode by mistake"
                placeholderTextColor={colors.text.muted}
                style={[styles.helperTextInput, { borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>

            <View style={[styles.helperDialogFooter, { borderTopColor: colors.surface.border }]}>
              <TouchableOpacity
                onPress={() => setIsCorrectModalOpen(false)}
                style={[styles.helperCancelBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.helperCancelBtnText, { color: colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (studentSearchText.trim()) {
                    handleCorrectOccupant({
                      studentId: selectedSeat ? occupancyMap[selectedSeat.number]?.occupyingStudent?.studentId || 'BW-CORR' : 'BW-CORR',
                      name: studentSearchText.trim(),
                    }, adminNoteText);
                  }
                }}
                style={[styles.helperConfirmBtn, { backgroundColor: '#245C48' }]}>
                <Text style={styles.helperConfirmBtnText}>Save Correction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. MAINTENANCE TOGGLE MODAL */}
      <Modal
        visible={isMaintenanceModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMaintenanceModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.helperDialogCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF' }]}>
            <View style={[styles.helperDialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Wrench size={18} color="#628194" strokeWidth={2.2} />
                <Text style={[styles.helperDialogTitle, { color: colors.text.primary }]}>
                  Desk Maintenance • Desk {selectedSeat?.formattedLabel}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsMaintenanceModalOpen(false)}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.helperDialogBody}>
              <Text style={[styles.helperInputLabel, { color: colors.text.secondary }]}>
                Maintenance Reason / Issue Description:
              </Text>
              <TextInput
                value={adminNoteText}
                onChangeText={setAdminNoteText}
                placeholder="e.g. Power outlet broken, repairing chair"
                placeholderTextColor={colors.text.muted}
                style={[styles.helperTextInput, { borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>

            <View style={[styles.helperDialogFooter, { borderTopColor: colors.surface.border }]}>
              <TouchableOpacity
                onPress={() => setIsMaintenanceModalOpen(false)}
                style={[styles.helperCancelBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.helperCancelBtnText, { color: colors.text.secondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const currentlyMaint = selectedSeat ? occupancyMap[selectedSeat.number]?.status === 'maintenance' : false;
                  handleToggleMaintenance(!currentlyMaint, adminNoteText || 'Under maintenance');
                }}
                style={[styles.helperConfirmBtn, { backgroundColor: '#628194' }]}>
                <Text style={styles.helperConfirmBtnText}>
                  {selectedSeat && occupancyMap[selectedSeat.number]?.status === 'maintenance'
                    ? 'Clear Maintenance'
                    : 'Put Under Maintenance'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* ========================================================================= */}
      {/* 8. DESK & SHIFT CONFIGURATION MODAL                                       */}
      {/* ========================================================================= */}
      <Modal
        visible={isCustomizeModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCustomizeModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.dialogCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
                maxWidth: 680,
              },
            ]}>
            <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View style={styles.dialogHeaderLeft}>
                <View style={[styles.dialogHeaderIconBox, { backgroundColor: colors.brand.light }]}>
                  <Sliders size={20} color={colors.brand.primary} strokeWidth={2.2} />
                </View>
                <View>
                  <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>
                    Desk & Shift Configuration
                  </Text>
                  <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                    Configure desk prefixes, number boundaries, monthly rates, and study shifts
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsCustomizeModalOpen(false)}
                style={[styles.closeModalBtn, { backgroundColor: isDark ? colors.surface.cardAlt : '#F1F4EE' }]}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            {/* Sub-Tabs: 1. Desk Ranges & Prefixes, 2. Shift Categories */}
            <View style={[styles.setupTabBar, { borderBottomColor: colors.surface.border }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSetupTab('ranges')}
                style={[
                  styles.setupTabBtn,
                  setupTab === 'ranges' && [
                    styles.setupTabBtnActive,
                    { borderBottomColor: isDark ? colors.brand.primary : '#245C48' },
                  ],
                ]}>
                <Armchair
                  size={15}
                  color={setupTab === 'ranges' ? (isDark ? colors.brand.primary : '#245C48') : colors.text.muted}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.setupTabBtnText,
                    {
                      color: setupTab === 'ranges' ? (isDark ? colors.brand.primary : '#245C48') : colors.text.muted,
                      fontWeight: setupTab === 'ranges' ? '700' : '500',
                    },
                  ]}>
                  Desk Ranges & Prefixes ({draftRanges.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSetupTab('shifts')}
                style={[
                  styles.setupTabBtn,
                  setupTab === 'shifts' && [
                    styles.setupTabBtnActive,
                    { borderBottomColor: isDark ? colors.brand.primary : '#245C48' },
                  ],
                ]}>
                <Clock
                  size={15}
                  color={setupTab === 'shifts' ? (isDark ? colors.brand.primary : '#245C48') : colors.text.muted}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.setupTabBtnText,
                    {
                      color: setupTab === 'shifts' ? (isDark ? colors.brand.primary : '#245C48') : colors.text.muted,
                      fontWeight: setupTab === 'shifts' ? '700' : '500',
                    },
                  ]}>
                  Shift Categories ({draftShifts.length})
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              {setupTab === 'ranges' ? (
                <>
                  {draftRanges.map((range, idx) => (
                    <View
                      key={range.id}
                      style={[
                        styles.rangeEditCard,
                        {
                          backgroundColor: isDark ? colors.surface.canvas : '#F7F7F1',
                          borderColor: colors.surface.border,
                        },
                      ]}>
                      <View style={styles.rangeCardHeader}>
                        <View style={[styles.rangeTitleGroup, { flex: 1, marginRight: 8 }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <TextInput
                              value={range.name}
                              onChangeText={(txt) => {
                                const next = [...draftRanges];
                                next[idx].name = txt;
                                setDraftRanges(next);
                              }}
                              placeholder="Tier Name"
                              placeholderTextColor={colors.text.muted}
                              style={[
                                styles.rangeInput,
                                {
                                  backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                                  borderColor: colors.surface.border,
                                  color: colors.text.primary,
                                  fontWeight: '700',
                                  fontSize: 13,
                                  paddingVertical: 3,
                                  paddingHorizontal: 8,
                                  minWidth: 110,
                                },
                              ]}
                            />
                            <Text style={[styles.rangeCategoryLabel, { color: colors.text.muted, fontSize: 12 }]}>
                              Tier
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.rangePreviewBadge,
                              { backgroundColor: isDark ? 'rgba(85, 181, 141, 0.15)' : '#E8F3EE' },
                            ]}>
                            <Text
                              style={[
                                styles.rangePreviewBadgeText,
                                { color: isDark ? '#7FD1AC' : '#287A5B' },
                              ]}>
                              {range.prefix || ''}{range.startNo < 10 ? '0' : ''}{range.startNo} → {range.prefix || ''}{range.endNo} ({Math.max(0, range.endNo - range.startNo + 1)} desks)
                            </Text>
                          </View>
                        </View>

                        {draftRanges.length > 1 && (
                          <TouchableOpacity
                            onPress={() => {
                              const next = draftRanges.filter((_, i) => i !== idx);
                              setDraftRanges(next);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.deleteItemBtn}
                            accessibilityLabel="Delete desk category">
                            <Trash2 size={15} color="#D9534F" />
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.rangeInputsRow}>
                        {/* 1. Desk Prefix (e.g. D-, A-, CAB-, VIP-) */}
                        <View style={[styles.inputCol, { flex: 0.85, minWidth: 70 }]}>
                          <Text style={[styles.inputFieldLabel, { color: colors.text.muted }]}>Prefix</Text>
                          <TextInput
                            value={range.prefix}
                            onChangeText={(txt) => {
                              const next = [...draftRanges];
                              next[idx].prefix = txt;
                              setDraftRanges(next);
                            }}
                            placeholder="e.g. D-"
                            placeholderTextColor={colors.text.muted}
                            style={[
                              styles.rangeInput,
                              {
                                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                                borderColor: colors.surface.border,
                                color: colors.text.primary,
                                fontWeight: '700',
                              },
                            ]}
                          />
                        </View>

                        {/* 2. Start Desk Number */}
                        <View style={styles.inputCol}>
                          <Text style={[styles.inputFieldLabel, { color: colors.text.muted }]}>Start No.</Text>
                          <TextInput
                            value={range.startNo.toString()}
                            keyboardType="numeric"
                            onChangeText={(txt) => {
                              const val = parseInt(txt, 10) || 1;
                              const next = [...draftRanges];
                              next[idx].startNo = val;
                              setDraftRanges(next);
                            }}
                            style={[
                              styles.rangeInput,
                              {
                                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                                borderColor: colors.surface.border,
                                color: colors.text.primary,
                              },
                            ]}
                          />
                        </View>

                        {/* 3. End Desk Number */}
                        <View style={styles.inputCol}>
                          <Text style={[styles.inputFieldLabel, { color: colors.text.muted }]}>End No.</Text>
                          <TextInput
                            value={range.endNo.toString()}
                            keyboardType="numeric"
                            onChangeText={(txt) => {
                              const val = parseInt(txt, 10) || 1;
                              const next = [...draftRanges];
                              next[idx].endNo = val;
                              setDraftRanges(next);
                            }}
                            style={[
                              styles.rangeInput,
                              {
                                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                                borderColor: colors.surface.border,
                                color: colors.text.primary,
                              },
                            ]}
                          />
                        </View>

                        {/* 4. Monthly Fee */}
                        <View style={styles.inputCol}>
                          <Text style={[styles.inputFieldLabel, { color: colors.text.muted }]}>Fee (₹/mo)</Text>
                          <TextInput
                            value={range.monthlyFee.toString()}
                            keyboardType="numeric"
                            onChangeText={(txt) => {
                              const val = parseInt(txt, 10) || 0;
                              const next = [...draftRanges];
                              next[idx].monthlyFee = val;
                              setDraftRanges(next);
                            }}
                            style={[
                              styles.rangeInput,
                              {
                                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                                borderColor: colors.surface.border,
                                color: colors.text.primary,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  {/* Add More Desk Categories Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      const lastEnd = draftRanges.length > 0 ? draftRanges[draftRanges.length - 1].endNo : 0;
                      const nextTierNo = draftRanges.length + 1;
                      const newCat: CategoryRangeConfig = {
                        id: `custom_${Date.now()}`,
                        name: `Tier ${nextTierNo}`,
                        prefix: 'D-',
                        startNo: lastEnd + 1,
                        endNo: lastEnd + 25,
                        monthlyFee: 1100,
                        isCustom: true,
                      };
                      setDraftRanges([...draftRanges, newCat]);
                    }}
                    style={[
                      styles.addTierOrShiftBtn,
                      {
                        borderColor: isDark ? colors.surface.border : '#DDD9CE',
                        backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                      },
                    ]}>
                    <Plus size={16} color={isDark ? colors.brand.primary : '#245C48'} strokeWidth={2.4} />
                    <Text
                      style={[
                        styles.addTierOrShiftBtnText,
                        { color: isDark ? colors.brand.primary : '#245C48' },
                      ]}>
                      Add Desk Category Range
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {/* Shift Categories tab */}
                  <View
                    style={[
                      styles.tabTipBanner,
                      {
                        backgroundColor: isDark ? 'rgba(85, 181, 141, 0.08)' : '#EEF6F2',
                        borderColor: isDark ? colors.surface.border : 'rgba(85, 181, 141, 0.2)',
                      },
                    ]}>
                    <Clock size={16} color={isDark ? colors.brand.primary : '#245C48'} />
                    <Text style={[styles.tabTipBannerText, { color: colors.text.secondary }]}>
                      Configure library study shift timings, slot abbreviations, and add custom slots (e.g., Afternoon, Weekend, 24/7 Full Day).
                    </Text>
                  </View>

                  {draftShifts.map((shift, idx) => (
                    <View
                      key={shift.id}
                      style={[
                        styles.rangeEditCard,
                        {
                          backgroundColor: isDark ? colors.surface.canvas : '#F7F7F1',
                          borderColor: colors.surface.border,
                        },
                      ]}>
                      <View style={styles.rangeCardHeader}>
                        <View style={styles.shiftCardBadgeRow}>
                          <View
                            style={[
                              styles.shiftBadgeSquare,
                              { backgroundColor: isDark ? '#245C48' : '#287A5B' },
                            ]}>
                            <Text style={styles.shiftBadgeSquareText}>{shift.badge || 'S'}</Text>
                          </View>
                          <Text style={[styles.rangeCategoryLabel, { color: colors.text.primary }]}>
                            {shift.name}
                          </Text>
                        </View>

                        {draftShifts.length > 1 && (
                          <TouchableOpacity
                            onPress={() => {
                              const next = draftShifts.filter((_, i) => i !== idx);
                              setDraftShifts(next);
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            style={styles.deleteItemBtn}
                            accessibilityLabel="Delete shift category">
                            <Trash2 size={15} color="#D9534F" />
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.rangeInputsRow}>
                        {/* 1. Shift Name */}
                        <View style={[styles.inputCol, { flex: 1.2 }]}>
                          <Text style={[styles.inputFieldLabel, { color: colors.text.muted }]}>Shift Name</Text>
                          <TextInput
                            value={shift.name}
                            onChangeText={(txt) => {
                              const next = [...draftShifts];
                              next[idx].name = txt;
                              setDraftShifts(next);
                            }}
                            placeholder="e.g. Afternoon Slot"
                            placeholderTextColor={colors.text.muted}
                            style={[
                              styles.rangeInput,
                              {
                                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                                borderColor: colors.surface.border,
                                color: colors.text.primary,
                              },
                            ]}
                          />
                        </View>

                        {/* 2. Timing Range */}
                        <View style={[styles.inputCol, { flex: 1.5 }]}>
                          <Text style={[styles.inputFieldLabel, { color: colors.text.muted }]}>Hours / Time Slot</Text>
                          <TextInput
                            value={shift.timeRange}
                            onChangeText={(txt) => {
                              const next = [...draftShifts];
                              next[idx].timeRange = txt;
                              setDraftShifts(next);
                            }}
                            placeholder="e.g. 11:00 AM – 04:00 PM"
                            placeholderTextColor={colors.text.muted}
                            style={[
                              styles.rangeInput,
                              {
                                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                                borderColor: colors.surface.border,
                                color: colors.text.primary,
                              },
                            ]}
                          />
                        </View>

                        {/* 3. Slot Badge / Abbreviation */}
                        <View style={[styles.inputCol, { flex: 0.7, minWidth: 60 }]}>
                          <Text style={[styles.inputFieldLabel, { color: colors.text.muted }]}>Badge</Text>
                          <TextInput
                            value={shift.badge}
                            onChangeText={(txt) => {
                              const next = [...draftShifts];
                              next[idx].badge = txt.toUpperCase();
                              setDraftShifts(next);
                            }}
                            placeholder="e.g. AF"
                            placeholderTextColor={colors.text.muted}
                            maxLength={4}
                            style={[
                              styles.rangeInput,
                              {
                                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                                borderColor: colors.surface.border,
                                color: colors.text.primary,
                                fontWeight: '800',
                                textAlign: 'center',
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  ))}

                  {/* Add More Shift Categories Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      const nextIndex = draftShifts.length + 1;
                      const newShift: ShiftCategoryConfig = {
                        id: `shift_${Date.now()}`,
                        name: `Custom Shift ${nextIndex}`,
                        timeRange: '10:00 AM – 04:00 PM',
                        badge: `S${nextIndex}`,
                        monthlyFeeMultiplier: 0.85,
                        description: 'Custom library study shift',
                        isCustom: true,
                      };
                      setDraftShifts([...draftShifts, newShift]);
                    }}
                    style={[
                      styles.addTierOrShiftBtn,
                      {
                        borderColor: isDark ? colors.surface.border : '#DDD9CE',
                        backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                      },
                    ]}>
                    <Plus size={16} color={isDark ? colors.brand.primary : '#245C48'} strokeWidth={2.4} />
                    <Text
                      style={[
                        styles.addTierOrShiftBtnText,
                        { color: isDark ? colors.brand.primary : '#245C48' },
                      ]}>
                      Add Shift Category
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>

            <View style={[styles.dialogFooter, { borderTopColor: colors.surface.border }]}>
              <TouchableOpacity
                onPress={handleSaveRanges}
                style={[styles.dialogCloseDoneBtn, { backgroundColor: '#245C48' }]}>
                <Check size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.dialogCloseDoneBtnText}>Save Setup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
  },

  // 1. Top Header Row (Seamless without enclosing card)
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expandToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  expandToggleBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  configRangesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  configRangesBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },

  // 2. Category Summary Cards Row
  categoryCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  categoryCardsGridMobile: {
    gap: 10,
  },
  categorySummaryCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 94,
  },
  categorySummaryCardMobile: {
    width: '48%',
    flex: undefined,
    minWidth: 140,
    padding: 12,
    minHeight: 82,
  },
  catCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catCardLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  catIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  catCardCount: {
    fontSize: 22,
    fontWeight: '700',
  },
  catCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catCardRange: {
    fontSize: 11.5,
  },
  catCardPricing: {
    fontSize: 12,
    fontWeight: '700',
  },



  // 4. Toolbar & Claymorphic Segmented Filter Controls
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  toolbarRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  filterControlsWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterSegmentTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3.5,
    gap: 3,
    flexWrap: 'wrap',
  },
  filterSegmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 9,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    cursor: 'pointer' as any,
  },
  filterSegmentBtnActive: {
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
      },
    }),
  },
  filterSegmentText: {
    fontSize: 12,
    letterSpacing: -0.1,
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  filterDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 3,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    cursor: 'pointer' as any,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      } as any,
      default: {
        elevation: 1,
      },
    }),
  },
  clearFiltersBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  resultsCounter: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsCounterText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // 5. Grid Containers
  gridContainer: {
    width: '100%',
    gap: 16,
  },
  emptyStateCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateSub: {
    fontSize: 12.5,
    textAlign: 'center',
    maxWidth: 400,
  },
  emptyStateResetBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  emptyStateResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // COMPACT SEAT TILES (Ultra-clean minimal boxes displaying exclusively seat number)
  compactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  seatCard: {
    borderRadius: 9,
    borderWidth: 1,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer' as any,
  },
  seatNumberMainText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  expandedStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  // EXPANDED SEAT CARDS
  expandedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  expandedSeatCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  expandedCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  expandedSeatNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expandedSeatNumberText: {
    fontSize: 16,
    fontWeight: '800',
  },
  expandedCatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  expandedCatBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  expandedShiftsGroup: {
    gap: 0,
    marginVertical: 4,
  },
  expandedShiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 9,
    borderBottomWidth: 1,
  },
  expandedShiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 0,
  },
  shiftBadgeMini: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  shiftBadgeMiniText: {
    fontSize: 11,
    fontWeight: '800',
  },
  expandedShiftSlotLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  expandedStudentName: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  expandedVacantText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  expandedCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 2,
  },
  amenityIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewDetailsLink: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // 6. Pagination Bar
  paginationBar: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationInfo: {},
  paginationInfoText: {
    fontSize: 12,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageArrowBtnDisabled: {
    opacity: 0.4,
  },
  pageNumberBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewAllToggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 6,
  },
  viewAllToggleText: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // 7. Details Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(38, 52, 46, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '85%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
  },
  dialogHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dialogHeaderIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dialogCatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  dialogCatBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  dialogSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 6,
    borderRadius: 6,
  },

  // Modal Two-Page Tabs
  detailModalTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  detailModalTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: -1,
  },
  detailModalTabBtnActive: {
    borderBottomWidth: 1,
  },
  detailModalTabBtnText: {
    fontSize: 12.5,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabCrossAlertPill: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tabCrossAlertPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabLiveBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tabLiveBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // In-Modal Action Toast
  actionToastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionToastText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  // Live Presence Banner
  livePresenceBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  livePresenceTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  livePresenceStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  livePresenceDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  livePresenceStatusText: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  livePresenceSensorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  livePresenceSensorBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  livePresenceMetaText: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  // Cross-Seat Alert Card (Desk Mismatch)
  crossSeatAlertBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  crossSeatAlertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  crossSeatAlertIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 119, 6, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossSeatAlertTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  crossSeatAlertBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  crossSeatActionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 2,
  },
  crossSeatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  crossSeatActionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Live Occupant Profile Card
  liveOccupantCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  liveOccupantTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  studentAvatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarLargeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  liveOccupantInfoCol: {
    flex: 1,
    gap: 4,
  },
  liveOccupantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  liveOccupantName: {
    fontSize: 15,
    fontWeight: '700',
  },
  liveOccupantStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  liveOccupantStatusTagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  liveOccupantIdText: {
    fontSize: 11.5,
  },
  liveOccupantDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  liveDetailItem: {
    minWidth: 120,
    gap: 1,
  },
  liveDetailLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveDetailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  liveOccupantFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  liveOccupantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  liveOccupantBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Vacant Seat Actions Card
  vacantSeatActionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
  },
  vacantSeatIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  vacantSeatTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  vacantSeatSub: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 17,
  },
  vacantSeatBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 8,
  },
  quickSeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  quickSeatBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },

  // Hardware Diagnostics Grid
  hardwareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hardwareCard: {
    flex: 1,
    minWidth: 150,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  hardwareCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hardwareCardTitle: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  hardwareCardStatus: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  hardwareCardNote: {
    fontSize: 10,
  },

  // Desk Physical Activity Timeline
  timelineCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 26,
    marginVertical: 3,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  timelineItemTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineItemTime: {
    fontSize: 10.5,
  },
  timelineItemDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  noTimelineText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  dialogScrollContent: {
    padding: 18,
    gap: 14,
  },
  dialogSectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  shiftDetailCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  shiftDetailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shiftDetailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftDetailTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  shiftStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  shiftStatusTagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  studentEnrolledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  studentDetailsCol: {
    flex: 1,
    gap: 2,
  },
  studentNameHeader: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  studentIdRow: {
    fontSize: 11,
  },
  validityDates: {
    fontSize: 10.5,
  },
  feePaymentTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  feePaymentTagText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  vacantSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  vacantSlotPrompt: {
    fontSize: 12,
  },
  assignStudentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  assignStudentBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  dialogFooter: {
    padding: 14,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogFooterLiveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  livePulseDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#245C48',
  },
  dialogFooterLiveText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  dialogCloseDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dialogCloseDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Range Configuration Modal
  rangeEditCard: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  rangeCategoryLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  rangeInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputCol: {
    flex: 1,
    gap: 4,
  },
  inputFieldLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  rangeInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },

  // Setup Modal Tabs & Controls
  setupTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  setupTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  setupTabBtnActive: {
    borderBottomWidth: 2,
  },
  setupTabBtnText: {
    fontSize: 13,
  },
  rangeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  rangePreviewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  rangePreviewBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteItemBtn: {
    padding: 6,
    borderRadius: 6,
  },
  addTierOrShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addTierOrShiftBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  tabTipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 9,
    borderWidth: 1,
    marginBottom: 4,
  },
  tabTipBannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  shiftCardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shiftBadgeSquare: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBadgeSquareText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  // Real-Time Seat Occupancy & Two-Student Cards Styles
  expandedOccupancyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
    gap: 8,
  },
  expandedOccupancyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  expandedOccupancyText: {
    fontSize: 11.5,
    fontWeight: '600',
    flex: 1,
  },
  microStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  seatCardMicroIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mismatchAlertBadgeMini: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scenario Banners
  scenarioBannerAmber: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  scenarioBannerAmberTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.3,
  },
  scenarioBannerAmberSub: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 3,
    lineHeight: 16,
  },
  scenarioBannerGreen: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#E8EEE5',
    borderWidth: 1.5,
    borderColor: '#B8D2B6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  scenarioBannerGreenTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#245C48',
    letterSpacing: 0.3,
  },
  scenarioBannerGreenSub: {
    fontSize: 12,
    color: '#366352',
    marginTop: 3,
    lineHeight: 16,
  },
  scenarioBannerNeutral: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F5F5ED',
    borderWidth: 1,
    borderColor: '#DDD9CE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  scenarioBannerNeutralTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4A5B52',
    letterSpacing: 0.3,
  },
  scenarioBannerNeutralSub: {
    fontSize: 12,
    color: '#718077',
    marginTop: 3,
    lineHeight: 16,
  },
  scenarioBannerMaint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F1F4EE',
    borderWidth: 1,
    borderColor: '#D6DCE3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  scenarioBannerMaintTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#628194',
    letterSpacing: 0.3,
  },
  scenarioBannerMaintSub: {
    fontSize: 12,
    color: '#4F6877',
    marginTop: 3,
    lineHeight: 16,
  },

  // Two-Students Container
  twoStudentsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  studentDetailCardHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderSmallTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardHeaderSmallSub: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  microStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  microStatusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  studentCardBody: {
    gap: 8,
  },
  studentBioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircleMed: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleMedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  studentBioName: {
    fontSize: 14,
    fontWeight: '700',
  },
  studentBioMeta: {
    fontSize: 11.5,
    marginTop: 1,
  },
  specDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: 4,
  },
  specFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  specFieldLabel: {
    fontSize: 11.5,
  },
  specFieldValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  unassignedBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  unassignedBoxText: {
    fontSize: 12,
    textAlign: 'center',
  },

  // Admin Actions Card
  adminActionsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  adminActionsTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  adminActionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adminActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adminActionBtnTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  adminActionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  adminActionBtnTextOutline: {
    fontSize: 12,
    fontWeight: '600',
  },

  // History Tab Styles
  emptyHistoryBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyHistoryText: {
    fontSize: 13,
    textAlign: 'center',
  },
  historyListContainer: {
    gap: 10,
  },
  historyItemCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  historyItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircleSmallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  historyStudentName: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyStudentMeta: {
    fontSize: 11,
  },
  mismatchHistoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mismatchHistoryBadgeText: {
    color: '#B45309',
    fontSize: 10.5,
    fontWeight: '700',
  },
  normalHistoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8EEE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  normalHistoryBadgeText: {
    color: '#245C48',
    fontSize: 10.5,
    fontWeight: '700',
  },
  historyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  historyStatCol: {
    gap: 2,
  },
  historyStatLabel: {
    fontSize: 10.5,
  },
  historyStatVal: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Audit Tab Styles
  auditListContainer: {
    gap: 8,
  },
  auditItemCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  auditItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  auditActionLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  auditTimestamp: {
    fontSize: 11,
  },
  auditDetailsText: {
    fontSize: 12,
    lineHeight: 16,
  },
  auditPerformedBy: {
    fontSize: 11,
  },

  // Helper Modals Styles
  helperDialogCard: {
    width: '92%',
    maxWidth: 440,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  helperDialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  helperDialogTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  helperDialogBody: {
    padding: 16,
    gap: 6,
  },
  helperInputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  helperTextInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  helperStudentsList: {
    maxHeight: 180,
    marginTop: 6,
  },
  helperStudentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  helperStudentName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  helperStudentId: {
    fontSize: 11,
  },
  helperDialogFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  helperCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  helperCancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  helperConfirmBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  helperConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

});
