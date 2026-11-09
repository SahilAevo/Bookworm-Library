import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  GraduationCap,
  Armchair,
  Clock,
  CalendarCheck,
  Receipt,
  Award,
  BookOpen,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wifi,
  ChevronRight,
  Scan,
  Camera,
  X,
  History,
  Check,
  Building,
  MapPin,
  Calendar,
  Lock,
  RefreshCw,
  AlertTriangle,
  CreditCard,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { ClaymorphicShadows, ClaymorphicShadowsDark } from '@/constants/dashboard-theme';
import { LibraryTenant, DEFAULT_TENANT } from '@/constants/tenants';
import { useAuth, StudentProfile } from '@/context/AuthContext';
import {
  studentPortalService,
  StudentSubscription,
  StudentSeatInfo,
  StudentAttendanceRecord,
  StudentAttendanceStats,
  StudentPaymentRecord,
  StudentPaymentSummary,
  LibraryEntitlements,
} from '@/services/student-portal-service';
import { attendanceService, AttendanceRecord, StudentAttendanceContext } from '@/services/attendance-service';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface StudentPortalViewProps {
  studentData?: any;
  currentTenant?: LibraryTenant;
  onLogout: () => void;
  onOpenExamSuite?: () => void;
}

export function StudentPortalView({
  studentData,
  currentTenant = DEFAULT_TENANT,
  onLogout,
  onOpenExamSuite,
}: StudentPortalViewProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark, toggleTheme } = useThemeMode();
  const shadows = isDark ? ClaymorphicShadowsDark : ClaymorphicShadows;

  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  const { studentProfile: authStudentProfile, signOut } = useAuth();

  // Active student identity derived securely from authenticated session or props
  const profile: StudentProfile | null = authStudentProfile || (studentData?.student_id ? studentData : null);

  // Core database-driven states
  const [subscription, setSubscription] = useState<StudentSubscription | null>(null);
  const [seatInfo, setSeatInfo] = useState<StudentSeatInfo | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<StudentAttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<StudentAttendanceStats>({
    total_visits: 0,
    active_days_this_month: 0,
    current_visit: null,
    attendance_rate_display: '0%',
  });
  const [payments, setPayments] = useState<StudentPaymentRecord[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<StudentPaymentSummary>({
    total_paid: 0,
    outstanding_dues: 0,
  });
  const [entitlements, setEntitlements] = useState<LibraryEntitlements>({
    has_assess: false,
    has_qr_attendance: true,
    seating_mode: 'general',
    raw_config: {},
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Scanner modal states & Expo Camera integration
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    action?: 'check_in' | 'check_out';
  } | null>(null);

  const [attendanceContext, setAttendanceContext] = useState<StudentAttendanceContext | null>(null);
  const [attendanceBusy, setAttendanceBusy] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState<string | undefined>();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [scannerEnabled, setScannerEnabled] = useState(true);

  // Logout Confirmation Modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // Feature locked modal
  const [showLockedFeatureModal, setShowLockedFeatureModal] = useState(false);

  // Load real student records from Supabase
  const loadPortalData = useCallback(async () => {
    if (!profile) return;
    setLoadError(null);

    try {
      const studentDbId = profile.id;
      const seatingMode = profile.library?.seating_mode || 'general';

      // 1. Fetch library feature entitlements
      const ent = studentPortalService.checkLibraryEntitlements(profile.library?.config, seatingMode);
      setEntitlements(ent);

      // 2. Fetch active membership subscription
      const sub = await studentPortalService.getActiveSubscription(studentDbId);
      setSubscription(sub);

      // 3. Fetch seat information (adheres to library seating mode)
      const seat = await studentPortalService.getSeatInformation(studentDbId, seatingMode);
      setSeatInfo(seat);

      // 4. Fetch attendance records and computed statistics
      const att = await studentPortalService.getAttendanceHistory(studentDbId, 30);
      setAttendanceRecords(att.records);
      setAttendanceStats(att.stats);

      // 5. Fetch payment records and compute dues
      const pay = await studentPortalService.getPaymentHistory(studentDbId, sub?.due_amount || 0);
      setPayments(pay.payments);
      setPaymentSummary(pay.summary);

      // 6. Fetch live attendance context for QR scanning
      try {
        const ctx = await attendanceService.getStudentContext();
        setAttendanceContext(ctx);
        setAttendanceError(ctx.eligible ? '' : ctx.message || 'Attendance is unavailable.');
      } catch (ctxErr: any) {
        console.warn('Could not load attendance context:', ctxErr?.message);
      }
    } catch (err: any) {
      console.error('Failed to load student portal database records:', err);
      setLoadError(err?.message || 'Failed to retrieve your student records.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [profile]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPortalData();
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await signOut();
    onLogout();
  };

  // Check if student currently has active check-in
  const activeCheckIn = attendanceStats.current_visit;

  // Real-time scan execution via attendanceService
  const handleExecuteScan = async (payload: string) => {
    if (!payload.trim() || attendanceBusy) return;
    setAttendanceBusy(true);
    setAttendanceError('');

    try {
      const result = await attendanceService.scan(payload, selectedSeatId);
      setScanResult({
        show: true,
        success: true,
        message: result.action === 'check_in'
          ? 'Attendance punch successfully registered at library turnstile.'
          : 'Departure successfully logged. Your study session has been recorded.',
        action: result.action,
      });
      setManualCodeInput('');
      setSelectedSeatId(undefined);
      await loadPortalData();
    } catch (error: any) {
      setScanResult({
        show: true,
        success: false,
        message: error.message || 'Attendance scan could not be recorded.',
      });
    } finally {
      setAttendanceBusy(false);
    }
  };

  const handleOpenExamOrShowLock = () => {
    if (entitlements.has_assess) {
      if (onOpenExamSuite) {
        onOpenExamSuite();
      }
    } else {
      setShowLockedFeatureModal(true);
    }
  };

  // Student display attributes
  const studentName = profile?.full_name || studentData?.name || 'Student';
  const studentIdDisplay = profile?.student_id || studentData?.id || 'BW-2026-0014';
  const libraryName = profile?.library?.name || currentTenant.name;
  const seatingMode = profile?.library?.seating_mode || 'general';
  const accountStatus = (profile?.status || 'active').toUpperCase();

  if (isLoading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.surface.canvas }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
          Loading student portal records...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.surface.canvas }]}
      contentContainerStyle={[
        styles.scrollContainer,
        isMobile && styles.scrollContainerMobile,
      ]}
      showsVerticalScrollIndicator={false}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & NAVIGATION BAR                                            */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.border,
            ...shadows.card,
          },
        ]}>
        <View style={styles.brandRow}>
          <View style={[styles.avatarIconBox, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
            <GraduationCap size={22} color="#B58A4A" strokeWidth={2.4} />
          </View>
          <View>
            <View style={styles.badgeRow}>
              <Text style={[styles.kickerText, { color: '#B58A4A' }]}>
                STUDENT STUDY PASS
              </Text>
              <View
                style={[
                  styles.activePassPill,
                  {
                    backgroundColor:
                      accountStatus === 'ACTIVE'
                        ? isDark ? '#203A2D' : '#E8EEE5'
                        : isDark ? '#3D2020' : '#FDECE8',
                  },
                ]}>
                <Text
                  style={[
                    styles.activePassText,
                    {
                      color:
                        accountStatus === 'ACTIVE'
                          ? isDark ? '#55B58D' : '#245C48'
                          : '#C76B59',
                    },
                  ]}>
                  {accountStatus}
                </Text>
              </View>
            </View>
            <Text
              style={[
                styles.studentNameHeader,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              {studentName}
            </Text>
            <Text style={[styles.studentSubHeader, { color: colors.text.muted }]}>
              ID: <Text style={{ fontWeight: '700', color: colors.text.primary }}>{studentIdDisplay}</Text> · {libraryName}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Refresh Button */}
          <TouchableOpacity
            onPress={handleRefresh}
            activeOpacity={0.8}
            style={[
              styles.actionIconBtn,
              {
                backgroundColor: colors.surface.inset,
                borderColor: colors.surface.border,
              },
            ]}>
            <RefreshCw
              size={15}
              color={colors.text.secondary}
              strokeWidth={2.2}
              style={{ transform: [{ rotate: isRefreshing ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.8}
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: colors.surface.inset,
                borderColor: colors.surface.border,
              },
            ]}>
            {isDark ? (
              <Sun size={15} color={colors.brand.primary} strokeWidth={2.2} />
            ) : (
              <Moon size={15} color={colors.text.secondary} strokeWidth={2.2} />
            )}
            {!isMobile && (
              <Text style={[styles.themeToggleText, { color: colors.text.primary }]}>
                {isDark ? 'Light' : 'Dark'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.8}
            style={[
              styles.logoutBtn,
              {
                backgroundColor: isDark ? '#3D2020' : '#FDECE8',
                borderColor: '#C76B59',
              },
            ]}>
            <LogOut size={14} color="#C76B59" strokeWidth={2.2} />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Network / Load Error Banner */}
      {loadError && (
        <View style={[styles.errorBanner, { backgroundColor: isDark ? '#3D2020' : '#FDECE8', borderColor: '#C76B59' }]}>
          <AlertCircle size={16} color="#C76B59" />
          <Text style={[styles.errorBannerText, { color: isDark ? '#FF9E9E' : '#A83226' }]}>
            {loadError}
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 2. QR ATTENDANCE HERO SCAN ACTION CARD                                    */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.scanHeroCard,
          {
            backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
            borderColor: colors.surface.border,
            ...shadows.card,
          },
        ]}>
        <View style={styles.scanHeroLeft}>
          <View style={styles.scanStatusBadgeRow}>
            <View
              style={[
                styles.liveStatusDot,
                { backgroundColor: activeCheckIn ? '#22C55E' : '#6B7280' },
              ]}
            />
            <Text style={[styles.scanStatusText, { color: activeCheckIn ? '#22C55E' : colors.text.muted }]}>
              {activeCheckIn
                ? `CURRENTLY CHECKED IN (PUNCHED AT ${activeCheckIn.check_in_display})`
                : 'CURRENTLY CHECKED OUT'}
            </Text>
          </View>

          <Text
            style={[
              styles.scanHeroTitle,
              {
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            {activeCheckIn ? 'Record Your Departure' : 'Scan Library Entrance QR'}
          </Text>
          <Text style={[styles.scanHeroSubtitle, { color: colors.text.muted }]}>
            {activeCheckIn
              ? 'Scan the entrance kiosk or exit turnstile QR code on your way out to record your checkout timestamp and session duration.'
              : 'Scan the official library entrance QR code or reception tablet to punch in and activate your desk access.'}
          </Text>

          <View style={styles.scanHeroButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setIsScannerOpen(true)}
              style={[
                styles.openScannerPrimaryBtn,
                { backgroundColor: isDark ? '#245C48' : '#287A5B' },
              ]}>
              <Scan size={18} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.openScannerPrimaryBtnText}>
                {activeCheckIn ? 'Scan QR to Check Out' : 'Open Attendance Scanner'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleExecuteScan('INSTANT-QR-TERMINAL-TOKEN')}
              style={[
                styles.quickScanSecondaryBtn,
                { borderColor: isDark ? '#55B58D' : '#245C48' },
              ]}>
              <QrCode size={16} color={isDark ? '#55B58D' : '#245C48'} />
              <Text style={[styles.quickScanSecondaryBtnText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                {activeCheckIn ? 'Quick 1-Tap Check Out' : 'Quick 1-Tap Punch In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.scanHeroRightBadge,
            { backgroundColor: isDark ? '#19221D' : '#F6F8F6', borderColor: colors.surface.border },
          ]}>
          <QrCode size={48} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={1.8} />
          <Text style={[styles.qrHeroTag, { color: colors.text.secondary }]}>Smart QR Terminal</Text>
          <Text style={[styles.qrHeroSub, { color: colors.text.muted }]}>Connected to Supabase</Text>
        </View>
      </View>
      {!!attendanceError && <Text accessibilityRole="alert" style={{ color: '#C76B59', paddingHorizontal: 8, fontSize: 13 }}>{attendanceError}</Text>}

      {/* ========================================================================= */}
      {/* 3. DIGITAL SEAT PASS CARD (Respects Seating Mode strictly)                */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.deskPassCard,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.border,
            ...shadows.card,
          },
        ]}>
        <View style={styles.passHeader}>
          <View style={styles.passTitleCol}>
            <Text style={[styles.passKicker, { color: colors.brand.primary }]}>
              {seatingMode === 'general' ? 'LIBRARY SEATING MODEL' : 'ALLOCATED STUDY SPACE'}
            </Text>

            {seatingMode === 'general' ? (
              // GENERAL SEATING: Do NOT show a fake desk assignment
              <>
                <Text
                  style={[
                    styles.passDeskTitle,
                    {
                      color: colors.text.primary,
                      fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                    },
                  ]}>
                  General Seating (Open Desk)
                </Text>
                <View style={styles.categoryPillWrap}>
                  <View style={[styles.goldTierBadge, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA', borderColor: '#B58A4A' }]}>
                    <Text style={styles.goldTierText}>★ First-Come, First-Served</Text>
                  </View>
                  <Text style={[styles.passFloorText, { color: colors.text.muted }]}>
                    No permanent seat assignment · Select any vacant desk on arrival
                  </Text>
                </View>
              </>
            ) : seatInfo?.has_seat ? (
              // FULL-SHIFT RESERVED: Show real allocated seat
              <>
                <Text
                  style={[
                    styles.passDeskTitle,
                    {
                      color: colors.text.primary,
                      fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                    },
                  ]}>
                  {seatInfo.seat_number || 'Desk Assigned'}
                </Text>
                <View style={styles.categoryPillWrap}>
                  <View style={[styles.goldTierBadge, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA', borderColor: '#B58A4A' }]}>
                    <Text style={styles.goldTierText}>★ Full-Shift Reserved Seat</Text>
                  </View>
                  <Text style={[styles.passFloorText, { color: colors.text.muted }]}>
                    {seatInfo.row_label || 'Main Hall'} · Allocated: {seatInfo.allocated_from || 'Active'} to {seatInfo.allocated_to || 'Ongoing'}
                  </Text>
                </View>
              </>
            ) : (
              // FULL-SHIFT RESERVED BUT ROTATING / PARTIAL:
              <>
                <Text
                  style={[
                    styles.passDeskTitle,
                    {
                      color: colors.text.primary,
                      fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                    },
                  ]}>
                  Partial Shift (Flexible Desk)
                </Text>
                <View style={styles.categoryPillWrap}>
                  <View style={[styles.goldTierBadge, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5', borderColor: '#245C48' }]}>
                    <Text style={[styles.goldTierText, { color: '#245C48' }]}>Rotating Pass</Text>
                  </View>
                  <Text style={[styles.passFloorText, { color: colors.text.muted }]}>
                    Occupies unallocated desks during assigned slot hours
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Student Pass Badge */}
          <View style={[styles.qrCodeContainer, { backgroundColor: isDark ? '#191F1A' : '#F5F1E8', borderColor: colors.surface.border }]}>
            <QrCode size={44} color={isDark ? '#EEE9DD' : '#245C48'} />
            <Text style={[styles.qrLabel, { color: colors.text.muted }]}>
              {studentIdDisplay}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { borderColor: colors.surface.border }]} />

        {/* Shift & Amenity Row */}
        <View style={styles.passDetailsGrid}>
          <View style={styles.passDetailItem}>
            <Clock size={16} color={colors.brand.primary} />
            <View>
              <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Study Shift</Text>
              <Text style={[styles.detailItemValue, { color: colors.text.primary }]}>
                {subscription?.shift_name || (seatInfo?.shift_name ? seatInfo.shift_name : 'General Shift Schedule')}
              </Text>
            </View>
          </View>

          <View style={styles.passDetailItem}>
            <CalendarCheck size={16} color="#55B58D" />
            <View>
              <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Subscription Plan</Text>
              <Text style={[styles.detailItemValue, { color: colors.text.primary }]}>
                {subscription?.plan_name || 'Active Study Membership'}
              </Text>
            </View>
          </View>

          <View style={styles.passDetailItem}>
            <Zap size={16} color="#B58A4A" />
            <View>
              <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Membership Validity</Text>
              <Text style={[styles.detailItemValue, { color: colors.text.primary }]}>
                {subscription?.end_date ? `Valid until ${subscription.end_date}` : 'Ongoing Enrollment'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 4. THREE SUMMARY TILES: ATTENDANCE, FEES, & EXAMS                          */}
      {/* ========================================================================= */}
      <View style={styles.threeGridRow}>
        {/* Card 1: Attendance & Hours */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.card,
            },
          ]}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardTag, { color: colors.text.muted }]}>ATTENDANCE</Text>
            <View style={[styles.smallIconCircle, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
              <CalendarCheck size={15} color={isDark ? '#55B58D' : '#245C48'} />
            </View>
          </View>

          <Text
            style={[
              styles.metricBigNumber,
              {
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            {attendanceStats.attendance_rate_display}
          </Text>
          <Text style={[styles.metricSubtitle, { color: colors.text.secondary }]}>
            {attendanceStats.total_visits} total visits logged ({attendanceStats.active_days_this_month} active days this month)
          </Text>

          <View style={[styles.punchLogBox, { backgroundColor: colors.surface.inset }]}>
            <CheckCircle2 size={13} color="#55B58D" />
            <Text style={[styles.punchLogText, { color: colors.text.secondary }]}>
              {activeCheckIn
                ? `In Today: ${activeCheckIn.check_in_display}`
                : 'Ready for today’s check-in'}
            </Text>
          </View>
        </View>

        {/* Card 2: Fee Status & Dues */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.card,
            },
          ]}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardTag, { color: colors.text.muted }]}>MEMBERSHIP DUES</Text>
            <View style={[styles.smallIconCircle, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
              <Receipt size={15} color="#B58A4A" />
            </View>
          </View>

          <Text
            style={[
              styles.metricBigNumber,
              {
                color: paymentSummary.outstanding_dues > 0 ? '#C76B59' : colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            ₹{paymentSummary.outstanding_dues.toLocaleString('en-IN')} Due
          </Text>
          <Text style={[styles.metricSubtitle, { color: colors.text.secondary }]}>
            {paymentSummary.outstanding_dues > 0
              ? 'Pending balance on active subscription'
              : 'All membership dues fully settled'}
          </Text>

          <View style={[styles.punchLogBox, { backgroundColor: colors.surface.inset }]}>
            <CreditCard size={13} color="#55B58D" />
            <Text style={[styles.punchLogText, { color: colors.text.secondary }]}>
              {paymentSummary.latest_receipt
                ? `Latest: ${paymentSummary.latest_receipt} (₹${paymentSummary.total_paid.toLocaleString('en-IN')} total paid)`
                : `Total Paid: ₹${paymentSummary.total_paid.toLocaleString('en-IN')}`}
            </Text>
          </View>
        </View>

        {/* Card 3: LibX Exam Suite (Entitlement Controlled) */}
        <View
          style={[
            styles.metricCard,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.card,
            },
          ]}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardTag, { color: colors.brand.primary }]}>LIBX EXAM SUITE</Text>
            <View
              style={[
                styles.smallIconCircle,
                { backgroundColor: entitlements.has_assess ? (isDark ? '#203A2D' : '#E8EEE5') : (isDark ? '#2C2B1B' : '#FEF8EA') },
              ]}>
              {entitlements.has_assess ? (
                <Award size={15} color={isDark ? '#55B58D' : '#245C48'} />
              ) : (
                <Lock size={15} color="#B58A4A" />
              )}
            </View>
          </View>

          <Text
            style={[
              styles.metricBigNumber,
              {
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            {entitlements.has_assess ? 'Available' : 'Locked'}
          </Text>
          <Text style={[styles.metricSubtitle, { color: colors.text.secondary }]}>
            {entitlements.has_assess
              ? 'Assess Module enabled by your library'
              : 'Assess module not subscribed by library'}
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleOpenExamOrShowLock}
            style={[
              styles.punchLogBox,
              {
                backgroundColor: colors.surface.inset,
                opacity: entitlements.has_assess ? 1 : 0.85,
              },
            ]}>
            {entitlements.has_assess ? (
              <>
                <Sparkles size={13} color="#B58A4A" />
                <Text style={[styles.punchLogText, { color: colors.brand.primary, fontWeight: '700' }]}>
                  Launch Test Simulator →
                </Text>
              </>
            ) : (
              <>
                <Lock size={13} color="#B58A4A" />
                <Text style={[styles.punchLogText, { color: '#B58A4A', fontWeight: '600' }]}>
                  Subscription Required (Locked)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 5. MY ATTENDANCE HISTORY & TIMELINE                                       */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.noticeCard,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.border,
            ...shadows.card,
          },
        ]}>
        <View style={styles.noticeHeader}>
          <View>
            <Text
              style={[
                styles.noticeTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              My Attendance History
            </Text>
            <Text style={{ color: colors.text.muted, fontSize: 12.5, marginTop: 2 }}>
              Verified punch records for {studentName} ({studentIdDisplay})
            </Text>
          </View>

          <View style={[styles.badgePillSmall, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
            <Text style={[styles.badgePillSmallText, { color: isDark ? '#55B58D' : '#245C48' }]}>
              {attendanceRecords.length} Total Visits Logged
            </Text>
          </View>
        </View>

        {attendanceRecords.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <CalendarCheck size={28} color={colors.text.faint} />
            <Text style={[styles.emptyStateTitle, { color: colors.text.primary }]}>
              No attendance records found
            </Text>
            <Text style={[styles.emptyStateSub, { color: colors.text.muted }]}>
              Your entrance and exit punches will appear here once you scan the library QR code.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {attendanceRecords.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.historyItemRow,
                  {
                    backgroundColor: colors.surface.inset,
                    borderColor: colors.surface.border,
                  },
                ]}>
                <View style={styles.historyDateCol}>
                  <Calendar size={14} color={isDark ? '#55B58D' : '#245C48'} />
                  <Text style={[styles.historyDateText, { color: colors.text.primary }]}>
                    {item.date_display}
                  </Text>
                </View>

                <View style={styles.historyTimesCol}>
                  <Text style={[styles.historyCheckIn, { color: '#22C55E' }]}>
                    In: {item.check_in_display}
                  </Text>
                  <Text
                    style={[
                      styles.historyCheckOut,
                      { color: item.check_out_at ? '#DC2626' : colors.text.muted },
                    ]}>
                    Out: {item.check_out_display}
                  </Text>
                </View>

                <View style={styles.historyDurationCol}>
                  <Clock size={12} color={colors.text.muted} />
                  <Text style={[styles.historyDurationText, { color: colors.text.secondary }]}>
                    {item.duration_display}
                  </Text>
                </View>

                <View
                  style={[
                    styles.historyStatusPill,
                    {
                      backgroundColor:
                        item.status === 'completed'
                          ? isDark ? '#203A2D' : '#E8EEE5'
                          : item.status === 'currently_inside'
                          ? isDark ? '#1C2C24' : '#E8F5EE'
                          : isDark ? '#2C2B1B' : '#FEF8EA',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.historyStatusPillText,
                      {
                        color:
                          item.status === 'completed'
                            ? '#245C48'
                            : item.status === 'currently_inside'
                            ? '#2E7D52'
                            : '#B58A4A',
                      },
                    ]}>
                    {item.status.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ========================================================================= */}
      {/* 6. MY PAYMENT & RECEIPT TRANSACTIONS                                      */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.noticeCard,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.border,
            ...shadows.card,
          },
        ]}>
        <View style={styles.noticeHeader}>
          <View>
            <Text
              style={[
                styles.noticeTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Payment Receipts & Invoices
            </Text>
            <Text style={{ color: colors.text.muted, fontSize: 12.5, marginTop: 2 }}>
              Verified library fee transactions and deposit receipts
            </Text>
          </View>

          <View style={[styles.badgePillSmall, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
            <Text style={[styles.badgePillSmallText, { color: '#B58A4A' }]}>
              {payments.length} Payments Recorded
            </Text>
          </View>
        </View>

        {payments.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Receipt size={28} color={colors.text.faint} />
            <Text style={[styles.emptyStateTitle, { color: colors.text.primary }]}>
              No payment transactions on file
            </Text>
            <Text style={[styles.emptyStateSub, { color: colors.text.muted }]}>
              Official receipts confirmed by library staff will appear in this section.
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {payments.map((p) => (
              <View
                key={p.id}
                style={[
                  styles.historyItemRow,
                  {
                    backgroundColor: colors.surface.inset,
                    borderColor: colors.surface.border,
                  },
                ]}>
                <View style={styles.historyDateCol}>
                  <Receipt size={14} color="#B58A4A" />
                  <Text style={[styles.historyDateText, { color: colors.text.primary }]}>
                    {p.receipt_number || 'Receipt Issued'}
                  </Text>
                </View>

                <View style={styles.historyTimesCol}>
                  <Text style={[styles.historyCheckIn, { color: colors.text.primary, fontWeight: '700' }]}>
                    ₹{p.amount.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.historyCheckOut, { color: colors.text.muted }]}>
                    via {p.payment_method.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.historyDurationCol}>
                  <Calendar size={12} color={colors.text.muted} />
                  <Text style={[styles.historyDurationText, { color: colors.text.secondary }]}>
                    {p.date_display}
                  </Text>
                </View>

                <View
                  style={[
                    styles.historyStatusPill,
                    {
                      backgroundColor:
                        p.status === 'completed'
                          ? isDark ? '#203A2D' : '#E8EEE5'
                          : isDark ? '#2C2B1B' : '#FEF8EA',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.historyStatusPillText,
                      { color: p.status === 'completed' ? '#245C48' : '#B58A4A' },
                    ]}>
                    {p.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.portalFooter}>
        <Text style={[styles.portalFooterText, { color: colors.text.muted }]}>
          {libraryName} Student Pass · Powered by LibX Multi-Tenant Platform
        </Text>
      </View>

      {/* ========================================================================= */}
      {/* 7. MODAL: QR CODE SCANNER CAMERA INTERFACE (With Expo Camera)             */}
      {/* ========================================================================= */}
      <Modal visible={isScannerOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.scannerDialogCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            {/* Header */}
            <View style={styles.scannerHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Scan size={18} color={isDark ? '#55B58D' : '#245C48'} />
                <Text style={[styles.scannerHeaderTitle, { color: colors.text.primary }]}>
                  LibX Attendance Camera Scanner
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsScannerOpen(false)}>
                <X size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            {/* Live Camera Viewfinder or Permission Request */}
            {cameraPermission?.granted ? (
              <CameraView
                style={styles.viewfinderContainer}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={
                  scannerEnabled
                    ? ({ data }: any) => {
                        setScannerEnabled(false);
                        void handleExecuteScan(data);
                      }
                    : undefined
                }
              />
            ) : (
              <View style={[styles.viewfinderContainer, { padding: 20 }]}>
                <Text style={{ color: '#E8EEE5', textAlign: 'center' }}>
                  {cameraPermission?.canAskAgain === false
                    ? 'Camera access is disabled. Enable it in device settings or enter the QR token below.'
                    : 'Allow camera access to scan the library attendance QR.'}
                </Text>
                <TouchableOpacity
                  onPress={() => void requestCameraPermission()}
                  style={[styles.manualSubmitBtn, { backgroundColor: '#287A5B', padding: 10, marginTop: 14 }]}>
                  <Text style={styles.manualSubmitBtnText}>Allow camera</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Seat Selection if required by branch seating mode */}
            {attendanceContext?.requires_seat && (
              <View style={styles.scannerControlsGroup}>
                <Text style={[styles.scannerControlsLabel, { color: colors.text.primary }]}>Choose an available seat</Text>
                <View style={styles.testButtonsRow}>
                  {attendanceContext.seats.map((seat) => (
                    <TouchableOpacity
                      key={seat.id}
                      onPress={() => setSelectedSeatId(seat.id)}
                      style={[styles.testScanBtn, { backgroundColor: selectedSeatId === seat.id ? '#287A5B' : '#E8EEE5' }]}>
                      <Text style={{ color: selectedSeatId === seat.id ? '#FFF' : '#245C48', fontWeight: '700' }}>
                        {seat.seat_number}
                        {seat.status === 'assigned' ? ' · Assigned' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {attendanceContext.seats.length === 0 && (
                    <Text style={{ color: colors.text.muted }}>No seats are currently available.</Text>
                  )}
                </View>
              </View>
            )}

            {/* Manual token entry remains available when camera access is unavailable */}
            <View style={styles.scannerControlsGroup}>
              <Text style={[styles.scannerControlsLabel, { color: colors.text.muted }]}>
                Scan the library QR or enter its token
              </Text>
              <View style={styles.manualCodeRow}>
                <TextInput
                  value={manualCodeInput}
                  onChangeText={setManualCodeInput}
                  placeholder="Or enter QR token code..."
                  placeholderTextColor={colors.text.muted}
                  style={[
                    styles.manualTextInput,
                    {
                      color: colors.text.primary,
                      borderColor: colors.surface.border,
                      backgroundColor: isDark ? colors.surface.canvas : '#FAF8F5',
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => {
                    void handleExecuteScan(manualCodeInput);
                  }}
                  style={[styles.manualSubmitBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                  <Check size={14} color="#FFFFFF" />
                  <Text style={styles.manualSubmitBtnText}>{attendanceBusy ? 'Checking…' : 'Submit'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 8. MODAL: ATTENDANCE CONFIRMATION POPUP                                   */}
      {/* ========================================================================= */}
      <Modal visible={!!scanResult?.show} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.resultDialogCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: scanResult?.success ? '#22C55E' : '#DC2626',
              },
            ]}>
            <View
              style={[
                styles.resultIconCircle,
                { backgroundColor: scanResult?.success ? '#DCFCE7' : '#FEE2E2' },
              ]}>
              {scanResult?.success ? (
                <CheckCircle2 size={36} color="#16A34A" />
              ) : (
                <AlertCircle size={36} color="#DC2626" />
              )}
            </View>

            <Text
              style={[
                styles.resultTitle,
                {
                  color: scanResult?.success ? '#16A34A' : '#DC2626',
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              {scanResult?.success
                ? scanResult.action === 'check_out'
                  ? 'Departure Successfully Logged!'
                  : 'Attendance Successfully Registered!'
                : 'Attendance Scan Rejected'}
            </Text>

            <Text style={[styles.resultSubtitle, { color: colors.text.muted }]}>
              {scanResult?.message}
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setScanResult(null);
                setIsScannerOpen(false);
                setScannerEnabled(true);
              }}
              style={[
                styles.resultDismissBtn,
                { backgroundColor: scanResult?.success ? '#245C48' : '#DC2626' },
              ]}>
              <Text style={styles.resultDismissBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 9. MODAL: LOGOUT CONFIRMATION                                             */}
      {/* ========================================================================= */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.confirmDialogCard,
              {
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.border,
                ...shadows.card,
              },
            ]}>
            <View style={styles.confirmIconWrap}>
              <LogOut size={28} color="#C76B59" />
            </View>
            <Text
              style={[
                styles.confirmTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Sign Out from Student Portal?
            </Text>
            <Text style={[styles.confirmSubtitle, { color: colors.text.muted }]}>
              You will be signed out of your study pass session. You can sign back in anytime with your registered credentials.
            </Text>

            <View style={styles.confirmActionsRow}>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                style={[styles.confirmCancelBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.confirmCancelText, { color: colors.text.secondary }]}>Stay Signed In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmLogout}
                style={[styles.confirmSignOutBtn, { backgroundColor: '#C76B59' }]}>
                <Text style={styles.confirmSignOutText}>Confirm Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 10. MODAL: PREMIUM FEATURE LOCKED NOTICE (Assess)                         */}
      {/* ========================================================================= */}
      <Modal visible={showLockedFeatureModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.confirmDialogCard,
              {
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.border,
                ...shadows.card,
              },
            ]}>
            <View style={[styles.confirmIconWrap, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
              <Lock size={28} color="#B58A4A" />
            </View>
            <Text
              style={[
                styles.confirmTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              LibX Assess Not Subscribed
            </Text>
            <Text style={[styles.confirmSubtitle, { color: colors.text.muted }]}>
              The examination simulator module is not enabled for {libraryName}. Please contact the library administration or reception desk to request access.
            </Text>

            <TouchableOpacity
              onPress={() => setShowLockedFeatureModal(false)}
              style={[styles.confirmSignOutBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B', width: '100%', marginTop: 8 }]}>
              <Text style={styles.confirmSignOutText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 64,
    gap: 20,
    alignItems: 'center',
  },
  scrollContainerMobile: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  topBar: {
    width: '100%',
    maxWidth: 1100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    flexWrap: 'wrap',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kickerText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  activePassPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePassText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  studentNameHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 1,
  },
  studentSubHeader: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  logoutBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C76B59',
  },
  errorBanner: {
    width: '100%',
    maxWidth: 1100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#C76B59',
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scanHeroCard: {
    width: '100%',
    maxWidth: 1100,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  scanHeroLeft: {
    flex: 1,
    minWidth: 280,
    gap: 10,
  },
  scanStatusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scanStatusText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  scanHeroTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scanHeroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  scanHeroButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  openScannerPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  openScannerPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  quickScanSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  quickScanSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scanHeroRightBadge: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
  },
  qrHeroTag: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  qrHeroSub: {
    fontSize: 9.5,
  },
  deskPassCard: {
    width: '100%',
    maxWidth: 1100,
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    gap: 18,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  passTitleCol: {
    flex: 1,
    minWidth: 260,
    gap: 4,
  },
  passKicker: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  passDeskTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  categoryPillWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  goldTierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  goldTierText: {
    color: '#B58A4A',
    fontSize: 11.5,
    fontWeight: '700',
  },
  passFloorText: {
    fontSize: 12.5,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  qrLabel: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  divider: {
    borderTopWidth: 1,
  },
  passDetailsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  passDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 200,
    flex: 1,
  },
  detailItemLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  detailItemValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  threeGridRow: {
    width: '100%',
    maxWidth: 1100,
    flexDirection: 'row',
    gap: 18,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 280,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBigNumber: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  metricSubtitle: {
    fontSize: 12.5,
    lineHeight: 16,
  },
  punchLogBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 4,
  },
  punchLogText: {
    fontSize: 12,
    flex: 1,
  },
  noticeCard: {
    width: '100%',
    maxWidth: 1100,
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    gap: 16,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  noticeTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  badgePillSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePillSmallText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyStateSub: {
    fontSize: 12.5,
    textAlign: 'center',
    maxWidth: 400,
  },
  historyList: {
    gap: 10,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexWrap: 'wrap',
    gap: 12,
  },
  historyDateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
  },
  historyDateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyTimesCol: {
    gap: 2,
    minWidth: 110,
  },
  historyCheckIn: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  historyCheckOut: {
    fontSize: 12,
  },
  historyDurationCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 90,
  },
  historyDurationText: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  historyStatusPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  portalFooter: {
    marginTop: 8,
    alignItems: 'center',
  },
  portalFooterText: {
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  scannerDialogCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    gap: 16,
  },
  scannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scannerHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  viewfinderContainer: {
    height: 220,
    backgroundColor: '#090D0A',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scannerControlsGroup: {
    gap: 8,
  },
  scannerControlsLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  testScanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 140,
  },
  manualCodeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  manualTextInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  manualSubmitBtn: {
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resultDialogCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  resultIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  resultDismissBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  resultDismissBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmDialogCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  confirmIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDECE8',
  },
  confirmTitle: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 10,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmSignOutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmSignOutText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
