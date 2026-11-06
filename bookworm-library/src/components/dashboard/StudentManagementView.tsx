import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  useWindowDimensions,
} from 'react-native';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Armchair,
  Clock,
  Calendar,
  CreditCard,
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowLeft,
  Crown,
  Sparkles,
  BookOpen,
  Eye,
  X,
  MessageSquare,
  FileText,
  ExternalLink,
  LayoutGrid,
  List,
  RotateCcw,
  Check,
  ChevronRight,
  Shield,
  Smartphone,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';

export type StudentCategory = 'exclusive' | 'premium' | 'classic';
export type StudentShift = 'morning' | 'evening' | 'night' | 'fullday';
export type RenewalStatus = 'active' | 'due-soon' | 'overdue';

export interface SentNotification {
  id: string;
  date: string;
  title: string;
  message: string;
  channel: 'Portal' | 'WhatsApp / SMS' | 'Email';
  priority: 'normal' | 'high' | 'urgent';
}

export interface EnrolledStudent {
  id: string;
  name: string;
  avatarText: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  seatNumber: string;
  seatCategory: StudentCategory;
  shift: StudentShift;
  shiftTiming: string;
  enrollmentDate: string;
  renewalDate: string;
  amountPaid: number;
  paymentMode: string;
  renewalStatus: RenewalStatus;
  guardianName?: string;
  guardianPhone?: string;
  attendanceRate: string;
  targetExam?: string;
  notes?: string;
  notificationsSent: SentNotification[];
}

const INITIAL_STUDENTS: EnrolledStudent[] = [
  {
    id: 'BW-2026-0014',
    name: 'Rohan Verma',
    avatarText: 'RV',
    phone: '+91 98231 44512',
    email: 'rohan.verma@gmail.com',
    address: '24 Civil Lines, Near High Court Square',
    city: 'Prayagraj',
    pincode: '211001',
    seatNumber: 'D-01',
    seatCategory: 'exclusive',
    shift: 'morning',
    shiftTiming: '06:00 AM – 02:00 PM',
    enrollmentDate: '01 Aug 2026',
    renewalDate: '30 Nov 2026',
    amountPaid: 2000,
    paymentMode: 'UPI (GPay)',
    renewalStatus: 'active',
    guardianName: 'Suresh Verma',
    guardianPhone: '+91 94150 11234',
    attendanceRate: '94%',
    targetExam: 'UPSC Civil Services 2027',
    notes: 'Requested power strip maintenance for laptop.',
    notificationsSent: [
      {
        id: 'notif-1',
        date: '01 Nov 2026',
        title: 'Monthly Receipt Generated',
        message: 'Your payment of ₹2,000 for Desk D-01 (Morning Shift) has been verified.',
        channel: 'Portal',
        priority: 'normal',
      },
    ],
  },
  {
    id: 'BW-2026-0019',
    name: 'Ananya Sharma',
    avatarText: 'AS',
    phone: '+91 98112 55901',
    email: 'ananya.sharma99@outlook.com',
    address: '14-B George Town, Opposite Anand Bhawan',
    city: 'Prayagraj',
    pincode: '211002',
    seatNumber: 'D-02',
    seatCategory: 'exclusive',
    shift: 'evening',
    shiftTiming: '02:00 PM – 10:00 PM',
    enrollmentDate: '15 Sep 2026',
    renewalDate: '14 Nov 2026',
    amountPaid: 2000,
    paymentMode: 'Net Banking',
    renewalStatus: 'due-soon',
    guardianName: 'Dr. R.K. Sharma',
    guardianPhone: '+91 98390 44321',
    attendanceRate: '91%',
    targetExam: 'UPPSC Combined State 2026',
    notes: 'Prefers quiet corner desk near AC unit.',
    notificationsSent: [],
  },
  {
    id: 'BW-2026-0027',
    name: 'Vikram Malhotra',
    avatarText: 'VM',
    phone: '+91 97188 33124',
    email: 'v.malhotra.law@gmail.com',
    address: '88 Tagore Town, Lane 4',
    city: 'Prayagraj',
    pincode: '211002',
    seatNumber: 'D-03',
    seatCategory: 'exclusive',
    shift: 'fullday',
    shiftTiming: '06:00 AM – 10:00 PM (24/7 Access)',
    enrollmentDate: '10 Jul 2026',
    renewalDate: '09 Nov 2026',
    amountPaid: 3200,
    paymentMode: 'Cash',
    renewalStatus: 'due-soon',
    guardianName: 'Devinder Malhotra',
    guardianPhone: '+91 99350 88712',
    attendanceRate: '96%',
    targetExam: 'Judicial Services Exam 2026',
    notes: 'Continuous study pass holder with personal locker.',
    notificationsSent: [],
  },
  {
    id: 'BW-2026-0033',
    name: 'Pooja Iyer',
    avatarText: 'PI',
    phone: '+91 99201 88471',
    email: 'pooja.iyer.ca@gmail.com',
    address: '52/1 Ashok Nagar, Near Medical Crossing',
    city: 'Prayagraj',
    pincode: '211001',
    seatNumber: 'D-51',
    seatCategory: 'premium',
    shift: 'morning',
    shiftTiming: '06:00 AM – 02:00 PM',
    enrollmentDate: '01 Sep 2026',
    renewalDate: '30 Nov 2026',
    amountPaid: 1400,
    paymentMode: 'UPI (PhonePe)',
    renewalStatus: 'active',
    guardianName: 'K. Iyer',
    guardianPhone: '+91 94155 99011',
    attendanceRate: '88%',
    targetExam: 'CA Final Nov Attempt',
    notes: 'Regular morning attendee.',
    notificationsSent: [],
  },
  {
    id: 'BW-2026-0041',
    name: 'Kunal Deshmukh',
    avatarText: 'KD',
    phone: '+91 96541 22910',
    email: 'kunal.deshmukh@yahoo.com',
    address: '102 Katra Road, Near Old University Gate',
    city: 'Prayagraj',
    pincode: '211002',
    seatNumber: 'D-52',
    seatCategory: 'premium',
    shift: 'evening',
    shiftTiming: '02:00 PM – 10:00 PM',
    enrollmentDate: '05 Oct 2026',
    renewalDate: '04 Nov 2026',
    amountPaid: 1400,
    paymentMode: 'UPI (Paytm)',
    renewalStatus: 'overdue',
    guardianName: 'Anil Deshmukh',
    guardianPhone: '+91 98380 12111',
    attendanceRate: '82%',
    targetExam: 'SSC CGL Tier II',
    notes: 'Payment overdue by 2 days.',
    notificationsSent: [],
  },
  {
    id: 'BW-2026-0048',
    name: 'Sneha Patel',
    avatarText: 'SP',
    phone: '+91 98765 43210',
    email: 'sneha.patel.upsc@gmail.com',
    address: '44 Rajendra Nagar, Near Lucas Hospital',
    city: 'Prayagraj',
    pincode: '211003',
    seatNumber: 'D-55',
    seatCategory: 'premium',
    shift: 'night',
    shiftTiming: '10:00 PM – 06:00 AM',
    enrollmentDate: '20 Sep 2026',
    renewalDate: '19 Nov 2026',
    amountPaid: 1050,
    paymentMode: 'Net Banking',
    renewalStatus: 'active',
    guardianName: 'Bhupendra Patel',
    guardianPhone: '+91 94152 77890',
    attendanceRate: '95%',
    targetExam: 'NEET PG 2027',
    notes: 'Nocturnal shift student.',
    notificationsSent: [],
  },
  {
    id: 'BW-2026-0052',
    name: 'Aditya Vikram Singh',
    avatarText: 'AS',
    phone: '+91 91234 56789',
    email: 'aditya.singh.eng@gmail.com',
    address: '12 University Road, Colonelganj',
    city: 'Prayagraj',
    pincode: '211002',
    seatNumber: 'D-81',
    seatCategory: 'classic',
    shift: 'morning',
    shiftTiming: '06:00 AM – 02:00 PM',
    enrollmentDate: '01 Oct 2026',
    renewalDate: '31 Oct 2026',
    amountPaid: 800,
    paymentMode: 'Cash',
    renewalStatus: 'overdue',
    guardianName: 'Mahendra Singh',
    guardianPhone: '+91 94500 33441',
    attendanceRate: '79%',
    targetExam: 'GATE Mechanical 2027',
    notes: 'Requested fee extension till 8th Nov.',
    notificationsSent: [],
  },
  {
    id: 'BW-2026-0059',
    name: 'Meera Nambiar',
    avatarText: 'MN',
    phone: '+91 93456 78901',
    email: 'meera.nambiar@gmail.com',
    address: '77 Kutchery Road, Behind District Court',
    city: 'Prayagraj',
    pincode: '211001',
    seatNumber: 'D-85',
    seatCategory: 'classic',
    shift: 'evening',
    shiftTiming: '02:00 PM – 10:00 PM',
    enrollmentDate: '12 Aug 2026',
    renewalDate: '11 Dec 2026',
    amountPaid: 800,
    paymentMode: 'UPI (GPay)',
    renewalStatus: 'active',
    guardianName: 'G. Nambiar',
    guardianPhone: '+91 94151 55667',
    attendanceRate: '93%',
    targetExam: 'IBPS PO 2026',
    notes: 'Semi-annual membership holder.',
    notificationsSent: [],
  },
  {
    id: 'BW-2026-0064',
    name: 'Harsh Vardhan',
    avatarText: 'HV',
    phone: '+91 98888 12345',
    email: 'harsh.vardhan98@gmail.com',
    address: '93 Mumfordganj, Near Water Tank',
    city: 'Prayagraj',
    pincode: '211002',
    seatNumber: 'D-90',
    seatCategory: 'classic',
    shift: 'night',
    shiftTiming: '10:00 PM – 06:00 AM',
    enrollmentDate: '01 Oct 2026',
    renewalDate: '31 Oct 2026',
    amountPaid: 600,
    paymentMode: 'UPI (PhonePe)',
    renewalStatus: 'overdue',
    guardianName: 'V.K. Srivastava',
    guardianPhone: '+91 98399 88123',
    attendanceRate: '86%',
    targetExam: 'State RO / ARO Exam',
    notes: 'Locker assignment pending.',
    notificationsSent: [],
  },
  {
    id: 'BW-2026-0071',
    name: 'Deepika Rastogi',
    avatarText: 'DR',
    phone: '+91 97777 65432',
    email: 'deepika.rastogi@gmail.com',
    address: '31 Stanley Road, Near Beli Hospital',
    city: 'Prayagraj',
    pincode: '211002',
    seatNumber: 'D-05',
    seatCategory: 'exclusive',
    shift: 'morning',
    shiftTiming: '06:00 AM – 02:00 PM',
    enrollmentDate: '15 Sep 2026',
    renewalDate: '14 Nov 2026',
    amountPaid: 2000,
    paymentMode: 'Credit Card',
    renewalStatus: 'due-soon',
    guardianName: 'Sanjay Rastogi',
    guardianPhone: '+91 99190 22334',
    attendanceRate: '98%',
    targetExam: 'UPSC CSE Optional Focus',
    notes: 'Highest attendance student in batch.',
    notificationsSent: [],
  },
];

interface StudentManagementViewProps {
  onBackToDashboard?: () => void;
  onOpenAddStudent?: () => void;
}

export function StudentManagementView({
  onBackToDashboard,
  onOpenAddStudent,
}: StudentManagementViewProps) {
  const { colors, isDark } = useThemeMode();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // State
  const [studentsList, setStudentsList] = useState<EnrolledStudent[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | StudentCategory>('all');
  const [selectedShift, setSelectedShift] = useState<'all' | StudentShift>('all');
  const [selectedRenewalStatus, setSelectedRenewalStatus] = useState<'all' | RenewalStatus>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal States
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<EnrolledStudent | null>(null);
  const [notifyTargetStudent, setNotifyTargetStudent] = useState<EnrolledStudent | null>(null);

  // Notification Composer Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifChannel, setNotifChannel] = useState<'Portal' | 'WhatsApp / SMS' | 'Email'>('WhatsApp / SMS');
  const [notifPriority, setNotifPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [notifSuccessBanner, setNotifSuccessBanner] = useState<string | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    const total = studentsList.length;
    const active = studentsList.filter((s) => s.renewalStatus === 'active').length;
    const dueSoon = studentsList.filter((s) => s.renewalStatus === 'due-soon').length;
    const overdue = studentsList.filter((s) => s.renewalStatus === 'overdue').length;
    const monthlyRev = studentsList.reduce((acc, curr) => acc + curr.amountPaid, 0);

    return { total, active, dueSoon, overdue, monthlyRev };
  }, [studentsList]);

  // Filtered list
  const filteredStudents = useMemo(() => {
    return studentsList.filter((student) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesId = student.id.toLowerCase().includes(q);
        const matchesPhone = student.phone.includes(q);
        const matchesEmail = student.email.toLowerCase().includes(q);
        const matchesDesk = student.seatNumber.toLowerCase().includes(q);
        const matchesAddress = student.address.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesPhone && !matchesEmail && !matchesDesk && !matchesAddress) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && student.seatCategory !== selectedCategory) {
        return false;
      }

      // Shift filter
      if (selectedShift !== 'all' && student.shift !== selectedShift) {
        return false;
      }

      // Renewal status filter
      if (selectedRenewalStatus !== 'all' && student.renewalStatus !== selectedRenewalStatus) {
        return false;
      }

      return true;
    });
  }, [studentsList, searchQuery, selectedCategory, selectedShift, selectedRenewalStatus]);

  // Handle open notify modal with auto-template
  const handleOpenNotify = (student: EnrolledStudent, templateType?: 'renewal' | 'general' | 'timing') => {
    setNotifyTargetStudent(student);
    setNotifSuccessBanner(null);

    if (templateType === 'renewal' || student.renewalStatus !== 'active') {
      setNotifTitle(`Desk ${student.seatNumber} Membership Renewal Reminder`);
      setNotifMessage(
        `Dear ${student.name}, your study membership for Desk ${student.seatNumber} (${student.shiftTiming}) is due for renewal on ${student.renewalDate}. Monthly fee: ₹${student.amountPaid.toLocaleString('en-IN')}. Please visit library reception or renew online to continue your reserved slot.`
      );
      setNotifChannel('WhatsApp / SMS');
      setNotifPriority('high');
    } else if (templateType === 'timing') {
      setNotifTitle(`Schedule Notice: ${student.seatNumber} (${student.shift.toUpperCase()} Shift)`);
      setNotifMessage(
        `Hello ${student.name}, this is an operational notice regarding your ${student.shiftTiming} slot at Bookworm Library. Please ensure to check-in using your Student ID ${student.id} at the entrance.`
      );
      setNotifChannel('Portal');
      setNotifPriority('normal');
    } else {
      setNotifTitle(`Notice for ${student.name} · Bookworm Library`);
      setNotifMessage(
        `Dear ${student.name}, we have an important announcement regarding library services and desk allocation for Desk ${student.seatNumber}.`
      );
      setNotifChannel('WhatsApp / SMS');
      setNotifPriority('normal');
    }
  };

  // Handle sending notification
  const handleSendNotification = () => {
    if (!notifyTargetStudent || !notifTitle.trim() || !notifMessage.trim()) return;

    const newNotif: SentNotification = {
      id: `notif-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      channel: notifChannel,
      priority: notifPriority,
    };

    // Update student's notification history
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === notifyTargetStudent.id) {
          return {
            ...s,
            notificationsSent: [newNotif, ...s.notificationsSent],
          };
        }
        return s;
      })
    );

    setNotifSuccessBanner(
      `Notification dispatched successfully to ${notifyTargetStudent.name} via ${notifChannel}!`
    );

    setTimeout(() => {
      setNotifyTargetStudent(null);
      setNotifSuccessBanner(null);
    }, 1400);
  };

  // Category badge styling helper
  const getCatStyle = (category: StudentCategory) => {
    switch (category) {
      case 'exclusive':
        return {
          label: 'Exclusive Tier',
          bg: isDark ? 'rgba(196, 160, 82, 0.16)' : '#FBF7EE',
          border: isDark ? '#C4A052' : '#E8D6B0',
          text: isDark ? '#E5C984' : '#B58A4A',
          icon: Crown,
        };
      case 'premium':
        return {
          label: 'Premium Tier',
          bg: isDark ? 'rgba(85, 181, 141, 0.16)' : '#EEF6F2',
          border: isDark ? '#55B58D' : '#C7E4D6',
          text: isDark ? '#7FD1AC' : '#245C48',
          icon: Sparkles,
        };
      case 'classic':
      default:
        return {
          label: 'Classic Tier',
          bg: isDark ? 'rgba(135, 145, 135, 0.16)' : '#F3F4F3',
          border: isDark ? '#788477' : '#D1D5D1',
          text: isDark ? '#A8ADA1' : '#647063',
          icon: BookOpen,
        };
    }
  };

  // Renewal badge styling helper
  const getRenewalBadge = (status: RenewalStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active Plan',
          bg: isDark ? 'rgba(85, 181, 141, 0.15)' : '#E8F5EE',
          text: isDark ? '#7FD1AC' : '#245C48',
          border: isDark ? '#55B58D' : '#A3D9C0',
        };
      case 'due-soon':
        return {
          label: 'Due in 7 Days',
          bg: isDark ? 'rgba(196, 160, 82, 0.16)' : '#FFF9E8',
          text: isDark ? '#E5C984' : '#B58A4A',
          border: isDark ? '#C4A052' : '#F2DDA4',
        };
      case 'overdue':
        return {
          label: 'Renewal Overdue',
          bg: isDark ? 'rgba(217, 83, 79, 0.16)' : '#FEECEC',
          text: isDark ? '#E57373' : '#D9534F',
          border: isDark ? '#D9534F' : '#F5B7B1',
        };
    }
  };

  return (
    <View style={styles.container}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER (Admin Student Directory)                             */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
            borderColor: colors.surface.border,
          },
        ]}>
        <View style={styles.headerLeft}>
          {onBackToDashboard && (
            <TouchableOpacity
              onPress={onBackToDashboard}
              style={[styles.backBtn, { borderColor: colors.surface.border }]}
              activeOpacity={0.7}
              accessibilityLabel="Back to Overview">
              <ArrowLeft size={16} color={colors.text.primary} />
            </TouchableOpacity>
          )}

          <View
            style={[
              styles.headerIconCircle,
              { backgroundColor: isDark ? '#245C48' : '#287A5B' },
            ]}>
            <Users size={22} color="#FFFFFF" strokeWidth={2.2} />
          </View>

          <View>
            <View style={styles.headerKickerRow}>
              <Text style={[styles.headerKicker, { color: isDark ? colors.brand.primary : '#245C48' }]}>
                ADMIN WORKSPACE · STUDENT ROSTER
              </Text>
            </View>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Enrolled Students Directory
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
              Complete profile records, desk allocations, payment statuses, and direct student communication
            </Text>
          </View>
        </View>

        {/* Right Header Action */}
        <View style={[styles.headerRight, isMobile && { width: '100%', marginTop: 8 }]}>
          {onOpenAddStudent && (
            <TouchableOpacity
              onPress={onOpenAddStudent}
              style={[
                styles.primaryActionBtn,
                { backgroundColor: isDark ? '#245C48' : '#287A5B' },
              ]}
              activeOpacity={0.85}>
              <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.primaryActionBtnText}>Enroll New Student</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 2. STATS KPI METRICS ROW                                                  */}
      {/* ========================================================================= */}
      <View style={styles.metricsRow}>
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
            },
          ]}>
          <View style={styles.metricCardHeader}>
            <Text style={[styles.metricLabel, { color: colors.text.muted }]}>TOTAL ENROLLED</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: isDark ? 'rgba(85, 181, 141, 0.12)' : '#E8F3EE' }]}>
              <Users size={15} color={isDark ? colors.brand.primary : '#287A5B'} />
            </View>
          </View>
          <Text
            style={[
              styles.metricValue,
              {
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            {stats.total}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.text.secondary }]}>
            Active library memberships
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
            },
          ]}>
          <View style={styles.metricCardHeader}>
            <Text style={[styles.metricLabel, { color: colors.text.muted }]}>ACTIVE PASSES</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: isDark ? 'rgba(85, 181, 141, 0.12)' : '#E8F3EE' }]}>
              <CheckCircle2 size={15} color={isDark ? '#55B58D' : '#245C48'} />
            </View>
          </View>
          <Text
            style={[
              styles.metricValue,
              {
                color: isDark ? '#7FD1AC' : '#245C48',
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            {stats.active}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.text.secondary }]}>
            Paid & verified status
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
            },
          ]}>
          <View style={styles.metricCardHeader}>
            <Text style={[styles.metricLabel, { color: colors.text.muted }]}>RENEWAL DUE</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: isDark ? 'rgba(196, 160, 82, 0.14)' : '#FFF6E0' }]}>
              <Clock size={15} color={isDark ? '#E5C984' : '#B58A4A'} />
            </View>
          </View>
          <Text
            style={[
              styles.metricValue,
              {
                color: isDark ? '#E5C984' : '#B58A4A',
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            {stats.dueSoon + stats.overdue}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.text.secondary }]}>
            {stats.dueSoon} in 7 days · {stats.overdue} overdue
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
            },
          ]}>
          <View style={styles.metricCardHeader}>
            <Text style={[styles.metricLabel, { color: colors.text.muted }]}>MONTHLY COLLECTIONS</Text>
            <View style={[styles.metricIconWrap, { backgroundColor: isDark ? 'rgba(85, 181, 141, 0.12)' : '#E8F3EE' }]}>
              <CreditCard size={15} color={isDark ? colors.brand.primary : '#287A5B'} />
            </View>
          </View>
          <Text
            style={[
              styles.metricValue,
              {
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            ₹{stats.monthlyRev.toLocaleString('en-IN')}
          </Text>
          <Text style={[styles.metricSubtext, { color: colors.text.secondary }]}>
            Monthly recurring dues
          </Text>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 3. SEARCH & ADVANCED FILTER TOOLBAR                                       */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.toolbarCard,
          {
            backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
            borderColor: colors.surface.border,
          },
        ]}>
        {/* Search Bar with clear icon */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                borderColor: colors.surface.border,
              },
            ]}>
            <Search size={16} color={colors.text.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by student name, phone, email, desk no. (e.g. D-01) or address..."
              placeholderTextColor={colors.text.muted}
              style={[styles.searchInput, { color: colors.text.primary }]}
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={15} color={colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* View Toggle (Cards vs Table) */}
          <View style={[styles.viewToggleGroup, { borderColor: colors.surface.border }]}>
            <TouchableOpacity
              onPress={() => setViewMode('cards')}
              style={[
                styles.viewToggleBtn,
                viewMode === 'cards' && { backgroundColor: isDark ? '#245C48' : '#287A5B' },
              ]}>
              <LayoutGrid size={15} color={viewMode === 'cards' ? '#FFFFFF' : colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('table')}
              style={[
                styles.viewToggleBtn,
                viewMode === 'table' && { backgroundColor: isDark ? '#245C48' : '#287A5B' },
              ]}>
              <List size={15} color={viewMode === 'table' ? '#FFFFFF' : colors.text.muted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Pills Row */}
        <View style={styles.filterPillsRow}>
          {/* Category Filter */}
          <View style={styles.filterButtonGroup}>
            <Text style={[styles.filterGroupHeading, { color: colors.text.muted }]}>TIER:</Text>
            {[
              { id: 'all', label: 'All Tiers' },
              { id: 'exclusive', label: 'Exclusive' },
              { id: 'premium', label: 'Premium' },
              { id: 'classic', label: 'Classic' },
            ].map((item) => {
              const isSelected = selectedCategory === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedCategory(item.id as any)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : (isDark ? colors.surface.canvas : '#F8F8F5'),
                      borderColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : colors.surface.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? '#FFFFFF' : colors.text.secondary },
                      isSelected && { fontWeight: '700' },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Shift Filter */}
          <View style={styles.filterButtonGroup}>
            <Text style={[styles.filterGroupHeading, { color: colors.text.muted }]}>SHIFT:</Text>
            {[
              { id: 'all', label: 'All Shifts' },
              { id: 'morning', label: 'Morning' },
              { id: 'evening', label: 'Evening' },
              { id: 'night', label: 'Night' },
              { id: 'fullday', label: 'Full Day' },
            ].map((item) => {
              const isSelected = selectedShift === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedShift(item.id as any)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : (isDark ? colors.surface.canvas : '#F8F8F5'),
                      borderColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : colors.surface.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? '#FFFFFF' : colors.text.secondary },
                      isSelected && { fontWeight: '700' },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Renewal Status Filter */}
          <View style={styles.filterButtonGroup}>
            <Text style={[styles.filterGroupHeading, { color: colors.text.muted }]}>RENEWAL:</Text>
            {[
              { id: 'all', label: 'All Status' },
              { id: 'active', label: 'Active' },
              { id: 'due-soon', label: 'Due Soon' },
              { id: 'overdue', label: 'Overdue' },
            ].map((item) => {
              const isSelected = selectedRenewalStatus === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedRenewalStatus(item.id as any)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : (isDark ? colors.surface.canvas : '#F8F8F5'),
                      borderColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : colors.surface.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.filterPillText,
                      { color: isSelected ? '#FFFFFF' : colors.text.secondary },
                      isSelected && { fontWeight: '700' },
                    ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 4. STUDENT RECORDS DIRECTORY                                              */}
      {/* ========================================================================= */}
      {filteredStudents.length === 0 ? (
        <View
          style={[
            styles.emptyStateCard,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
            },
          ]}>
          <Users size={40} color={colors.text.muted} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>No Enrolled Students Found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text.muted }]}>
            No students match your filter criteria or search query.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedShift('all');
              setSelectedRenewalStatus('all');
            }}
            style={[styles.resetFiltersBtn, { backgroundColor: '#245C48' }]}>
            <RotateCcw size={14} color="#FFFFFF" />
            <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === 'cards' ? (
        /* CARDS GRID VIEW */
        <View style={styles.cardsGrid}>
          {filteredStudents.map((student) => {
            const catStyle = getCatStyle(student.seatCategory);
            const renewalBadge = getRenewalBadge(student.renewalStatus);
            const TierIcon = catStyle.icon;

            return (
              <View
                key={student.id}
                style={[
                  styles.studentCard,
                  {
                    backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                    borderColor: colors.surface.border,
                    width: isMobile ? '100%' : isTablet ? '48.5%' : '32%',
                  },
                ]}>
                {/* Card Top: Avatar, Name, ID, Tier badge */}
                <View style={styles.cardHeader}>
                  <View style={styles.studentAvatarRow}>
                    <View
                      style={[
                        styles.studentAvatarBox,
                        { backgroundColor: isDark ? '#245C48' : '#287A5B' },
                      ]}>
                      <Text style={styles.studentAvatarText}>{student.avatarText}</Text>
                    </View>
                    <View style={styles.nameIdCol}>
                      <Text style={[styles.studentCardName, { color: colors.text.primary }]} numberOfLines={1}>
                        {student.name}
                      </Text>
                      <Text style={[styles.studentIdLabel, { color: colors.text.muted }]}>
                        {student.id}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.tierBadge,
                      { backgroundColor: catStyle.bg, borderColor: catStyle.border },
                    ]}>
                    <TierIcon size={11} color={catStyle.text} />
                    <Text style={[styles.tierBadgeText, { color: catStyle.text }]}>
                      {catStyle.label}
                    </Text>
                  </View>
                </View>

                {/* Primary Allocation: Desk & Shift */}
                <View
                  style={[
                    styles.allocationBanner,
                    {
                      backgroundColor: isDark ? colors.surface.canvas : '#F8FAF8',
                      borderColor: colors.surface.border,
                    },
                  ]}>
                  <View style={styles.allocCol}>
                    <View style={styles.allocRowItem}>
                      <Armchair size={13} color={isDark ? colors.brand.primary : '#287A5B'} />
                      <Text style={[styles.allocValue, { color: colors.text.primary }]}>
                        Desk {student.seatNumber}
                      </Text>
                    </View>
                    <Text style={[styles.allocSub, { color: colors.text.muted }]}>
                      Allocated Seat
                    </Text>
                  </View>

                  <View style={[styles.allocDivider, { backgroundColor: colors.surface.border }]} />

                  <View style={styles.allocCol}>
                    <View style={styles.allocRowItem}>
                      <Clock size={13} color={isDark ? colors.brand.primary : '#287A5B'} />
                      <Text style={[styles.allocValue, { color: colors.text.primary }]} numberOfLines={1}>
                        {student.shiftTiming.split(' (')[0]}
                      </Text>
                    </View>
                    <Text style={[styles.allocSub, { color: colors.text.muted }]}>
                      {student.shift.toUpperCase()} Shift
                    </Text>
                  </View>
                </View>

                {/* Key Student Details List */}
                <View style={styles.detailsListGroup}>
                  {/* Contact / Phone */}
                  <View style={styles.detailItemRow}>
                    <View style={styles.detailItemLabelCol}>
                      <Phone size={13} color={colors.text.muted} />
                      <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Contact:</Text>
                    </View>
                    <Text style={[styles.detailItemValue, { color: colors.text.primary }]}>
                      {student.phone}
                    </Text>
                  </View>

                  {/* Email ID */}
                  <View style={styles.detailItemRow}>
                    <View style={styles.detailItemLabelCol}>
                      <Mail size={13} color={colors.text.muted} />
                      <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Email ID:</Text>
                    </View>
                    <Text style={[styles.detailItemValue, { color: colors.text.primary }]} numberOfLines={1}>
                      {student.email}
                    </Text>
                  </View>

                  {/* Address */}
                  <View style={styles.detailItemRow}>
                    <View style={styles.detailItemLabelCol}>
                      <MapPin size={13} color={colors.text.muted} />
                      <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Address:</Text>
                    </View>
                    <Text style={[styles.detailItemValue, { color: colors.text.secondary }]} numberOfLines={2}>
                      {student.address}, {student.city}
                    </Text>
                  </View>

                  {/* Enrollment Date */}
                  <View style={styles.detailItemRow}>
                    <View style={styles.detailItemLabelCol}>
                      <Calendar size={13} color={colors.text.muted} />
                      <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Enrolled:</Text>
                    </View>
                    <Text style={[styles.detailItemValue, { color: colors.text.primary }]}>
                      {student.enrollmentDate}
                    </Text>
                  </View>

                  {/* Amount Paid & Monthly Fee */}
                  <View style={styles.detailItemRow}>
                    <View style={styles.detailItemLabelCol}>
                      <CreditCard size={13} color={colors.text.muted} />
                      <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Amount Pays:</Text>
                    </View>
                    <Text style={[styles.detailItemValueStrong, { color: isDark ? '#7FD1AC' : '#245C48' }]}>
                      ₹{student.amountPaid.toLocaleString('en-IN')} / mo
                    </Text>
                  </View>

                  {/* Renewal Date & Status */}
                  <View style={styles.detailItemRow}>
                    <View style={styles.detailItemLabelCol}>
                      <Clock size={13} color={colors.text.muted} />
                      <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Renewal Date:</Text>
                    </View>
                    <View style={styles.renewalBadgeRow}>
                      <Text style={[styles.detailItemValue, { color: colors.text.primary }]}>
                        {student.renewalDate}
                      </Text>
                      <View
                        style={[
                          styles.renewalStatusTag,
                          {
                            backgroundColor: renewalBadge.bg,
                            borderColor: renewalBadge.border,
                          },
                        ]}>
                        <Text style={[styles.renewalStatusTagText, { color: renewalBadge.text }]}>
                          {renewalBadge.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Card Action Footer */}
                <View style={[styles.cardFooter, { borderTopColor: colors.surface.border }]}>
                  {/* Notify Button: Explicit option to notify this particular student */}
                  <TouchableOpacity
                    onPress={() => handleOpenNotify(student, student.renewalStatus === 'active' ? 'general' : 'renewal')}
                    style={[
                      styles.notifyStudentBtn,
                      {
                        backgroundColor: student.renewalStatus === 'overdue'
                          ? (isDark ? '#3D2020' : '#FDE8E8')
                          : (isDark ? 'rgba(85, 181, 141, 0.12)' : '#E8F5EE'),
                        borderColor: student.renewalStatus === 'overdue'
                          ? (isDark ? '#E57373' : '#F5B7B1')
                          : (isDark ? '#55B58D' : '#C4E7D5'),
                      },
                    ]}
                    activeOpacity={0.8}>
                    <Bell
                      size={13}
                      color={student.renewalStatus === 'overdue' ? '#D9534F' : (isDark ? '#7FD1AC' : '#245C48')}
                    />
                    <Text
                      style={[
                        styles.notifyStudentBtnText,
                        {
                          color: student.renewalStatus === 'overdue'
                            ? '#D9534F'
                            : (isDark ? '#7FD1AC' : '#245C48'),
                        },
                      ]}>
                      Notify Student
                    </Text>
                  </TouchableOpacity>

                  {/* View Profile Button */}
                  <TouchableOpacity
                    onPress={() => setSelectedStudentForProfile(student)}
                    style={[
                      styles.viewProfileBtn,
                      {
                        backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                        borderColor: colors.surface.border,
                      },
                    ]}
                    activeOpacity={0.8}>
                    <Eye size={13} color={colors.text.secondary} />
                    <Text style={[styles.viewProfileBtnText, { color: colors.text.secondary }]}>
                      Full Profile
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        /* TABLE VIEW (Compact desktop roster) */
        <View
          style={[
            styles.tableWrapper,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
            },
          ]}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={{ minWidth: 980 }}>
              {/* Table Header */}
              <View style={[styles.tableHeaderRow, { borderBottomColor: colors.surface.border }]}>
                <Text style={[styles.thText, { width: 180, color: colors.text.muted }]}>STUDENT NAME & ID</Text>
                <Text style={[styles.thText, { width: 130, color: colors.text.muted }]}>CONTACT (PHONE)</Text>
                <Text style={[styles.thText, { width: 170, color: colors.text.muted }]}>EMAIL ID</Text>
                <Text style={[styles.thText, { width: 180, color: colors.text.muted }]}>ADDRESS</Text>
                <Text style={[styles.thText, { width: 110, color: colors.text.muted }]}>SEAT / TIER</Text>
                <Text style={[styles.thText, { width: 110, color: colors.text.muted }]}>SHIFT</Text>
                <Text style={[styles.thText, { width: 110, color: colors.text.muted }]}>AMOUNT</Text>
                <Text style={[styles.thText, { width: 130, color: colors.text.muted }]}>RENEWAL DATE</Text>
                <Text style={[styles.thText, { width: 150, color: colors.text.muted, textAlign: 'center' }]}>ACTIONS</Text>
              </View>

              {/* Table Rows */}
              {filteredStudents.map((student) => {
                const renewalBadge = getRenewalBadge(student.renewalStatus);
                const catStyle = getCatStyle(student.seatCategory);

                return (
                  <View
                    key={student.id}
                    style={[styles.tableBodyRow, { borderBottomColor: colors.surface.border }]}>
                    {/* 1. Name & ID */}
                    <View style={{ width: 180 }}>
                      <Text style={[styles.tdPrimaryText, { color: colors.text.primary }]} numberOfLines={1}>
                        {student.name}
                      </Text>
                      <Text style={[styles.tdSecondaryText, { color: colors.text.muted }]}>
                        {student.id}
                      </Text>
                    </View>

                    {/* 2. Contact Phone */}
                    <View style={{ width: 130 }}>
                      <Text style={[styles.tdText, { color: colors.text.primary }]}>
                        {student.phone}
                      </Text>
                    </View>

                    {/* 3. Email ID */}
                    <View style={{ width: 170 }}>
                      <Text style={[styles.tdText, { color: colors.text.secondary }]} numberOfLines={1}>
                        {student.email}
                      </Text>
                    </View>

                    {/* 4. Address */}
                    <View style={{ width: 180 }}>
                      <Text style={[styles.tdSecondaryText, { color: colors.text.secondary }]} numberOfLines={2}>
                        {student.address}, {student.city}
                      </Text>
                    </View>

                    {/* 5. Seat & Tier */}
                    <View style={{ width: 110 }}>
                      <Text style={[styles.tdPrimaryText, { color: isDark ? colors.brand.primary : '#287A5B' }]}>
                        Desk {student.seatNumber}
                      </Text>
                      <Text style={[styles.tdSecondaryText, { color: catStyle.text }]}>
                        {catStyle.label.replace(' Tier', '')}
                      </Text>
                    </View>

                    {/* 6. Shift */}
                    <View style={{ width: 110 }}>
                      <Text style={[styles.tdText, { color: colors.text.primary }]}>
                        {student.shift.toUpperCase()}
                      </Text>
                      <Text style={[styles.tdSecondaryText, { color: colors.text.muted }]}>
                        {student.shiftTiming.split(' ')[0]}
                      </Text>
                    </View>

                    {/* 7. Amount */}
                    <View style={{ width: 110 }}>
                      <Text style={[styles.tdPrimaryText, { color: isDark ? '#7FD1AC' : '#245C48', fontWeight: '700' }]}>
                        ₹{student.amountPaid.toLocaleString('en-IN')}
                      </Text>
                      <Text style={[styles.tdSecondaryText, { color: colors.text.muted }]}>
                        per month
                      </Text>
                    </View>

                    {/* 8. Renewal Date */}
                    <View style={{ width: 130 }}>
                      <Text style={[styles.tdText, { color: colors.text.primary }]}>
                        {student.renewalDate}
                      </Text>
                      <View
                        style={[
                          styles.renewalStatusTag,
                          {
                            backgroundColor: renewalBadge.bg,
                            borderColor: renewalBadge.border,
                            alignSelf: 'flex-start',
                          },
                        ]}>
                        <Text style={[styles.renewalStatusTagText, { color: renewalBadge.text }]}>
                          {renewalBadge.label}
                        </Text>
                      </View>
                    </View>

                    {/* 9. Actions (Notify & Profile) */}
                    <View style={{ width: 150, flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
                      <TouchableOpacity
                        onPress={() => handleOpenNotify(student, student.renewalStatus === 'active' ? 'general' : 'renewal')}
                        style={[
                          styles.tableActionIconBtn,
                          {
                            backgroundColor: student.renewalStatus === 'overdue'
                              ? (isDark ? '#3D2020' : '#FDE8E8')
                              : (isDark ? '#245C48' : '#287A5B'),
                          },
                        ]}
                        accessibilityLabel="Notify Student">
                        <Bell size={13} color="#FFFFFF" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setSelectedStudentForProfile(student)}
                        style={[
                          styles.tableActionTextBtn,
                          {
                            backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                            borderColor: colors.surface.border,
                          },
                        ]}>
                        <Eye size={12} color={colors.text.secondary} />
                        <Text style={[styles.tableActionTextBtnLabel, { color: colors.text.secondary }]}>
                          Details
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 5. DIRECT STUDENT NOTIFICATION MODAL                                      */}
      {/* ========================================================================= */}
      <Modal
        visible={notifyTargetStudent !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setNotifyTargetStudent(null)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.dialogCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
                maxWidth: 580,
              },
            ]}>
            {/* Modal Header */}
            <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View style={styles.dialogHeaderLeft}>
                <View
                  style={[
                    styles.dialogIconCircle,
                    { backgroundColor: isDark ? '#245C48' : '#287A5B' },
                  ]}>
                  <Bell size={18} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <View>
                  <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>
                    Notify {notifyTargetStudent?.name}
                  </Text>
                  <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                    Desk {notifyTargetStudent?.seatNumber} · {notifyTargetStudent?.phone}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setNotifyTargetStudent(null)}
                style={[styles.closeModalBtn, { backgroundColor: isDark ? colors.surface.cardAlt : '#F1F4EE' }]}>
                <X size={17} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            {/* Notification Success Feedback Banner */}
            {notifSuccessBanner && (
              <View style={styles.successNotificationBanner}>
                <CheckCircle2 size={16} color="#FFFFFF" />
                <Text style={styles.successNotificationBannerText}>{notifSuccessBanner}</Text>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.dialogScrollContent}>
              {/* Quick Template Buttons */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>
                  QUICK NOTIFICATION TEMPLATES:
                </Text>
                <View style={styles.templatePillsRow}>
                  <TouchableOpacity
                    onPress={() => notifyTargetStudent && handleOpenNotify(notifyTargetStudent, 'renewal')}
                    style={[styles.templatePill, { borderColor: colors.surface.border }]}>
                    <Text style={[styles.templatePillText, { color: isDark ? '#E5C984' : '#B58A4A' }]}>
                      🔔 Renewal Due
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => notifyTargetStudent && handleOpenNotify(notifyTargetStudent, 'timing')}
                    style={[styles.templatePill, { borderColor: colors.surface.border }]}>
                    <Text style={[styles.templatePillText, { color: isDark ? colors.brand.primary : '#287A5B' }]}>
                      ⏰ Shift Notice
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => notifyTargetStudent && handleOpenNotify(notifyTargetStudent, 'general')}
                    style={[styles.templatePill, { borderColor: colors.surface.border }]}>
                    <Text style={[styles.templatePillText, { color: colors.text.secondary }]}>
                      📢 Announcement
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Delivery Channel Selector */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>
                  DISPATCH CHANNEL:
                </Text>
                <View style={styles.channelRow}>
                  {[
                    { id: 'WhatsApp / SMS', label: 'WhatsApp & SMS', icon: Smartphone },
                    { id: 'Portal', label: 'Student Portal App', icon: Bell },
                    { id: 'Email', label: 'Registered Email', icon: Mail },
                  ].map((ch) => {
                    const isSelected = notifChannel === ch.id;
                    const Icon = ch.icon;
                    return (
                      <TouchableOpacity
                        key={ch.id}
                        onPress={() => setNotifChannel(ch.id as any)}
                        style={[
                          styles.channelBtn,
                          {
                            backgroundColor: isSelected
                              ? (isDark ? '#245C48' : '#287A5B')
                              : (isDark ? colors.surface.canvas : '#F8F8F5'),
                            borderColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : colors.surface.border,
                          },
                        ]}>
                        <Icon size={14} color={isSelected ? '#FFFFFF' : colors.text.secondary} />
                        <Text
                          style={[
                            styles.channelBtnText,
                            { color: isSelected ? '#FFFFFF' : colors.text.secondary },
                            isSelected && { fontWeight: '700' },
                          ]}>
                          {ch.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Notification Title */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>
                  MESSAGE SUBJECT / TITLE:
                </Text>
                <TextInput
                  value={notifTitle}
                  onChangeText={setNotifTitle}
                  placeholder="Enter notification subject..."
                  placeholderTextColor={colors.text.muted}
                  style={[
                    styles.textInputRegular,
                    {
                      backgroundColor: isDark ? colors.surface.canvas : '#FFFFFF',
                      borderColor: colors.surface.border,
                      color: colors.text.primary,
                    },
                  ]}
                />
              </View>

              {/* Custom Message Body */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>
                  CUSTOM NOTIFICATION MESSAGE:
                </Text>
                <TextInput
                  value={notifMessage}
                  onChangeText={setNotifMessage}
                  placeholder="Type message for student..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.textAreaRegular,
                    {
                      backgroundColor: isDark ? colors.surface.canvas : '#FFFFFF',
                      borderColor: colors.surface.border,
                      color: colors.text.primary,
                    },
                  ]}
                />
              </View>

              {/* Priority Radio Buttons */}
              <View style={styles.formGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>
                  PRIORITY LEVEL:
                </Text>
                <View style={styles.priorityRow}>
                  {[
                    { id: 'normal', label: 'Normal' },
                    { id: 'high', label: 'High Priority' },
                    { id: 'urgent', label: 'Urgent Alert' },
                  ].map((p) => {
                    const isSelected = notifPriority === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setNotifPriority(p.id as any)}
                        style={[
                          styles.priorityPill,
                          {
                            backgroundColor: isSelected
                              ? (isDark ? '#245C48' : '#287A5B')
                              : (isDark ? colors.surface.canvas : '#F8F8F5'),
                            borderColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : colors.surface.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.priorityPillText,
                            { color: isSelected ? '#FFFFFF' : colors.text.secondary },
                            isSelected && { fontWeight: '700' },
                          ]}>
                          {p.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Notification History for this student */}
              {notifyTargetStudent && notifyTargetStudent.notificationsSent.length > 0 && (
                <View style={styles.historyGroup}>
                  <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>
                    RECENT NOTIFICATION LOG ({notifyTargetStudent.notificationsSent.length}):
                  </Text>
                  {notifyTargetStudent.notificationsSent.map((item) => (
                    <View
                      key={item.id}
                      style={[
                        styles.historyItemBox,
                        {
                          backgroundColor: isDark ? colors.surface.canvas : '#F8F8F5',
                          borderColor: colors.surface.border,
                        },
                      ]}>
                      <View style={styles.historyItemTop}>
                        <Text style={[styles.historyItemTitle, { color: colors.text.primary }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.historyItemDate, { color: colors.text.muted }]}>
                          {item.date} · {item.channel}
                        </Text>
                      </View>
                      <Text style={[styles.historyItemMsg, { color: colors.text.secondary }]} numberOfLines={2}>
                        {item.message}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Modal Actions */}
            <View style={[styles.dialogFooter, { borderTopColor: colors.surface.border }]}>
              <TouchableOpacity
                onPress={() => setNotifyTargetStudent(null)}
                style={[styles.dialogCancelBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.dialogCancelBtnText, { color: colors.text.secondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSendNotification}
                disabled={!notifTitle.trim() || !notifMessage.trim()}
                style={[
                  styles.sendNotifBtn,
                  {
                    backgroundColor: isDark ? '#245C48' : '#287A5B',
                    opacity: notifTitle.trim() && notifMessage.trim() ? 1 : 0.6,
                  },
                ]}>
                <Send size={15} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.sendNotifBtnText}>Send Notification</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. FULL STUDENT PROFILE DETAILS MODAL                                     */}
      {/* ========================================================================= */}
      <Modal
        visible={selectedStudentForProfile !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedStudentForProfile(null)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.dialogCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
                maxWidth: 620,
              },
            ]}>
            {selectedStudentForProfile && (
              <>
                <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
                  <View style={styles.dialogHeaderLeft}>
                    <View
                      style={[
                        styles.dialogAvatarLarge,
                        { backgroundColor: isDark ? '#245C48' : '#287A5B' },
                      ]}>
                      <Text style={styles.dialogAvatarLargeText}>
                        {selectedStudentForProfile.avatarText}
                      </Text>
                    </View>
                    <View>
                      <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>
                        {selectedStudentForProfile.name}
                      </Text>
                      <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                        Student ID: {selectedStudentForProfile.id} · Member since {selectedStudentForProfile.enrollmentDate}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedStudentForProfile(null)}
                    style={[styles.closeModalBtn, { backgroundColor: isDark ? colors.surface.cardAlt : '#F1F4EE' }]}>
                    <X size={17} color={colors.text.muted} />
                  </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.dialogScrollContent}>
                  {/* Allocation Banner */}
                  <View
                    style={[
                      styles.profileAllocBox,
                      {
                        backgroundColor: isDark ? colors.surface.canvas : '#F8FAF8',
                        borderColor: colors.surface.border,
                      },
                    ]}>
                    <View style={styles.profileAllocCol}>
                      <Text style={[styles.profileAllocLabel, { color: colors.text.muted }]}>SEAT ALLOCATION</Text>
                      <Text style={[styles.profileAllocVal, { color: isDark ? colors.brand.primary : '#287A5B' }]}>
                        Desk {selectedStudentForProfile.seatNumber} ({getCatStyle(selectedStudentForProfile.seatCategory).label})
                      </Text>
                    </View>
                    <View style={[styles.profileAllocDivider, { backgroundColor: colors.surface.border }]} />
                    <View style={styles.profileAllocCol}>
                      <Text style={[styles.profileAllocLabel, { color: colors.text.muted }]}>STUDY SHIFT</Text>
                      <Text style={[styles.profileAllocVal, { color: colors.text.primary }]}>
                        {selectedStudentForProfile.shiftTiming}
                      </Text>
                    </View>
                  </View>

                  {/* Contact & Personal Information */}
                  <View style={styles.profileSection}>
                    <Text style={[styles.profileSectionHeading, { color: colors.text.muted }]}>
                      CONTACT & ADDRESS DETAILS
                    </Text>
                    <View style={[styles.profileInfoGrid, { borderColor: colors.surface.border }]}>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Phone Number</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.primary }]}>
                          {selectedStudentForProfile.phone}
                        </Text>
                      </View>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Email Address</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.primary }]}>
                          {selectedStudentForProfile.email}
                        </Text>
                      </View>
                      <View style={[styles.profileGridItem, { width: '100%' }]}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Permanent Address</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.primary }]}>
                          {selectedStudentForProfile.address}, {selectedStudentForProfile.city} – {selectedStudentForProfile.pincode}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Financial & Membership Information */}
                  <View style={styles.profileSection}>
                    <Text style={[styles.profileSectionHeading, { color: colors.text.muted }]}>
                      MEMBERSHIP & FEE COLLECTION
                    </Text>
                    <View style={[styles.profileInfoGrid, { borderColor: colors.surface.border }]}>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Monthly Fee Amount</Text>
                        <Text style={[styles.profileGridVal, { color: isDark ? '#7FD1AC' : '#245C48', fontWeight: '800' }]}>
                          ₹{selectedStudentForProfile.amountPaid.toLocaleString('en-IN')} / month
                        </Text>
                      </View>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Payment Mode</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.primary }]}>
                          {selectedStudentForProfile.paymentMode}
                        </Text>
                      </View>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Enrolled Since</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.primary }]}>
                          {selectedStudentForProfile.enrollmentDate}
                        </Text>
                      </View>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Next Renewal Date</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.primary }]}>
                          {selectedStudentForProfile.renewalDate}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Guardian & Target Exam */}
                  <View style={styles.profileSection}>
                    <Text style={[styles.profileSectionHeading, { color: colors.text.muted }]}>
                      ADDITIONAL ACADEMIC METRICS
                    </Text>
                    <View style={[styles.profileInfoGrid, { borderColor: colors.surface.border }]}>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Target Competitive Exam</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.primary }]}>
                          {selectedStudentForProfile.targetExam || 'General Competitive Prep'}
                        </Text>
                      </View>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Attendance Rate</Text>
                        <Text style={[styles.profileGridVal, { color: isDark ? '#7FD1AC' : '#287A5B', fontWeight: '700' }]}>
                          {selectedStudentForProfile.attendanceRate}
                        </Text>
                      </View>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Guardian / Parent</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.primary }]}>
                          {selectedStudentForProfile.guardianName || 'N/A'} ({selectedStudentForProfile.guardianPhone || 'N/A'})
                        </Text>
                      </View>
                      <View style={styles.profileGridItem}>
                        <Text style={[styles.profileGridLabel, { color: colors.text.muted }]}>Admin Notes</Text>
                        <Text style={[styles.profileGridVal, { color: colors.text.secondary }]}>
                          {selectedStudentForProfile.notes || 'No special notes recorded.'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ScrollView>

                <View style={[styles.dialogFooter, { borderTopColor: colors.surface.border }]}>
                  <TouchableOpacity
                    onPress={() => {
                      const stu = selectedStudentForProfile;
                      setSelectedStudentForProfile(null);
                      handleOpenNotify(stu, stu.renewalStatus === 'active' ? 'general' : 'renewal');
                    }}
                    style={[styles.sendNotifBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                    <Bell size={15} color="#FFFFFF" />
                    <Text style={styles.sendNotifBtnText}>Send Notification to Student</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 40,
  },

  // 1. Top Header Banner
  headerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    minWidth: 280,
  },
  backBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerKickerRow: {
    marginBottom: 2,
  },
  headerKicker: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
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
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // 2. Metrics Row
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  metricIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 2,
  },
  metricSubtext: {
    fontSize: 11.5,
  },

  // 3. Search & Filter Toolbar
  toolbarCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 42,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  viewToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    alignItems: 'center',
  },
  filterButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterGroupHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 11.5,
  },

  // 4. Cards Grid
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    alignItems: 'flex-start',
  },
  studentCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  studentAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  studentAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  nameIdCol: {
    flex: 1,
    gap: 1,
  },
  studentCardName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  studentIdLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  tierBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Allocation Banner (Desk + Shift)
  allocationBanner: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  allocCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  allocRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  allocValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  allocSub: {
    fontSize: 10,
    fontWeight: '500',
  },
  allocDivider: {
    width: 1,
    height: 28,
  },

  // Details List
  detailsListGroup: {
    gap: 8,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailItemLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 105,
    flexShrink: 0,
  },
  detailItemLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  detailItemValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  detailItemValueStrong: {
    fontSize: 12.5,
    fontWeight: '800',
    textAlign: 'right',
  },
  renewalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'flex-end',
    flex: 1,
  },
  renewalStatusTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  renewalStatusTagText: {
    fontSize: 9.5,
    fontWeight: '700',
  },

  // Card Footer Actions
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 2,
  },
  notifyStudentBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  notifyStudentBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  viewProfileBtn: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  viewProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Table View
  tableWrapper: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  thText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tdText: {
    fontSize: 12,
  },
  tdPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tdSecondaryText: {
    fontSize: 11,
    marginTop: 1,
  },
  tableActionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableActionTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  tableActionTextBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty State
  emptyStateCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  resetFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Modals (Notification & Profile)
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    maxHeight: '90%',
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
    flex: 1,
  },
  dialogIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogAvatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogAvatarLargeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  dialogTitle: {
    fontSize: 17,
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
  dialogScrollContent: {
    padding: 18,
    gap: 14,
  },
  dialogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  dialogCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  dialogCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  sendNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  sendNotifBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  successNotificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#287A5B',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  successNotificationBannerText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },

  // Notification Form Controls
  formGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  templatePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templatePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  templatePillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  channelRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  channelBtnText: {
    fontSize: 12,
  },
  textInputRegular: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  textAreaRegular: {
    minHeight: 80,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  priorityPillText: {
    fontSize: 11.5,
  },
  historyGroup: {
    gap: 8,
    marginTop: 6,
  },
  historyItemBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 3,
  },
  historyItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyItemTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyItemDate: {
    fontSize: 10.5,
  },
  historyItemMsg: {
    fontSize: 11.5,
  },

  // Profile Details Modal
  profileAllocBox: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  profileAllocCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  profileAllocLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  profileAllocVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  profileAllocDivider: {
    width: 1,
    height: 32,
  },
  profileSection: {
    gap: 8,
  },
  profileSectionHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  profileInfoGrid: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  profileGridItem: {
    width: '47%',
    gap: 2,
  },
  profileGridLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  profileGridVal: {
    fontSize: 12.5,
    fontWeight: '600',
  },
});

