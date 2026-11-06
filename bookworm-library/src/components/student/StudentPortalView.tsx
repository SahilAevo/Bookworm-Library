import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { ClaymorphicShadows, ClaymorphicShadowsDark } from '@/constants/dashboard-theme';
import { attendanceService, AttendanceRecord } from '@/services/attendance-service';
import { LibraryTenant, DEFAULT_TENANT } from '@/constants/tenants';

interface StudentPortalViewProps {
  studentData?: {
    id: string;
    name: string;
    desk: string;
    shift: string;
    tenantId?: string;
  };
  currentTenant?: LibraryTenant;
  onLogout: () => void;
  onOpenExamSuite?: () => void;
}

export function StudentPortalView({
  studentData = {
    id: 'BW-2026-0014',
    name: 'Rohan Verma',
    desk: 'Desk D-01 (Exclusive)',
    shift: 'Morning Shift (06:00 AM - 02:00 PM)',
    tenantId: 'bookworm-main',
  },
  currentTenant = DEFAULT_TENANT,
  onLogout,
  onOpenExamSuite,
}: StudentPortalViewProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark, toggleTheme } = useThemeMode();
  const shadows = isDark ? ClaymorphicShadowsDark : ClaymorphicShadows;

  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  const activeTenantId = studentData.tenantId || currentTenant.id;

  // Scanner modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    action?: 'check_in' | 'check_out';
    record?: AttendanceRecord;
    errorType?: string;
  } | null>(null);

  // Student Attendance Records state
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>(() =>
    attendanceService.getStudentRecords(activeTenantId, studentData.id)
  );

  // Check if student currently has active check-in
  const activeCheckIn = useMemo(() => {
    return historyRecords.find(
      (r) => r.status === 'present' || (r.checkInTime && !r.checkOutTime)
    );
  }, [historyRecords]);

  const refreshHistory = () => {
    setHistoryRecords(attendanceService.getStudentRecords(activeTenantId, studentData.id));
  };

  // Perform Scan
  const handleExecuteScan = (payload: string) => {
    if (!payload.trim()) return;
    const result = attendanceService.registerScan(activeTenantId, studentData.id, payload);
    setScanResult({
      show: true,
      success: result.success,
      message: result.message,
      action: result.action,
      record: result.record,
      errorType: result.errorType,
    });
    refreshHistory();
  };

  // Quick 1-tap test scans (for testing static & dynamic tokens)
  const handleTestScanStatic = () => {
    const activeStatic = attendanceService.getActiveStaticQR(activeTenantId);
    if (!activeStatic) {
      handleExecuteScan('INVALID-CODE');
      return;
    }
    handleExecuteScan(activeStatic.token);
  };

  const handleTestScanDynamic = () => {
    const session = attendanceService.getDynamicSession(activeTenantId);
    handleExecuteScan(session.currentToken);
  };

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
              <View style={[styles.activePassPill, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                <Text style={[styles.activePassText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                  ACTIVE
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
              {studentData.name}
            </Text>
            <Text style={[styles.studentSubHeader, { color: colors.text.muted }]}>
              ID: <Text style={{ fontWeight: '700', color: colors.text.primary }}>{studentData.id}</Text> · {currentTenant.name} ({currentTenant.campus})
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
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
            onPress={onLogout}
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
                ? `CURRENTLY CHECKED IN (PUNCHED AT ${activeCheckIn.checkInTime})`
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
              ? 'Scan the entrance or kiosk QR code on your way out to log your check-out timestamp and study duration.'
              : 'Scan the static poster at the entrance or the dynamic reception tablet to log your check-in.'}
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
              onPress={activeCheckIn ? handleTestScanStatic : handleTestScanStatic}
              style={[
                styles.quickScanSecondaryBtn,
                { borderColor: isDark ? '#55B58D' : '#245C48' },
              ]}>
              <QrCode size={16} color={isDark ? '#55B58D' : '#245C48'} />
              <Text style={[styles.quickScanSecondaryBtnText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                1-Tap Instant Punch
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
          <Text style={[styles.qrHeroSub, { color: colors.text.muted }]}>Static & Dynamic Ready</Text>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 3. DIGITAL SEAT PASS CARD                                                 */}
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
              ALLOCATED STUDY SPACE
            </Text>
            <Text
              style={[
                styles.passDeskTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Desk D-01
            </Text>
            <View style={styles.categoryPillWrap}>
              <View style={[styles.goldTierBadge, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA', borderColor: '#B58A4A' }]}>
                <Text style={styles.goldTierText}>★ Exclusive Category</Text>
              </View>
              <Text style={[styles.passFloorText, { color: colors.text.muted }]}>
                Quiet Hall · First Floor · Window Facing
              </Text>
            </View>
          </View>

          {/* Student Pass Badge */}
          <View style={[styles.qrCodeContainer, { backgroundColor: isDark ? '#191F1A' : '#F5F1E8', borderColor: colors.surface.border }]}>
            <QrCode size={44} color={isDark ? '#EEE9DD' : '#245C48'} />
            <Text style={[styles.qrLabel, { color: colors.text.muted }]}>Digital Pass</Text>
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
                Morning (06:00 AM – 02:00 PM)
              </Text>
            </View>
          </View>

          <View style={styles.passDetailItem}>
            <CalendarCheck size={16} color="#55B58D" />
            <View>
              <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Pass Validity</Text>
              <Text style={[styles.detailItemValue, { color: colors.text.primary }]}>
                30 Nov 2026 (Active)
              </Text>
            </View>
          </View>

          <View style={styles.passDetailItem}>
            <Zap size={16} color="#B58A4A" />
            <View>
              <Text style={[styles.detailItemLabel, { color: colors.text.muted }]}>Desk Amenities</Text>
              <Text style={[styles.detailItemValue, { color: colors.text.primary }]}>
                Personal Lamp · Locker #01 · Wi-Fi
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
            92.8%
          </Text>
          <Text style={[styles.metricSubtitle, { color: colors.text.secondary }]}>
            {historyRecords.length} visits recorded this month
          </Text>

          <View style={[styles.punchLogBox, { backgroundColor: colors.surface.inset }]}>
            <CheckCircle2 size={13} color="#55B58D" />
            <Text style={[styles.punchLogText, { color: colors.text.secondary }]}>
              {activeCheckIn
                ? `In Today: ${activeCheckIn.checkInTime}`
                : 'Ready for today’s punch in'}
            </Text>
          </View>
        </View>

        {/* Card 2: Fee Status */}
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
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            ₹0 Due
          </Text>
          <Text style={[styles.metricSubtitle, { color: colors.text.secondary }]}>
            November subscription fully cleared
          </Text>

          <View style={[styles.punchLogBox, { backgroundColor: colors.surface.inset }]}>
            <CheckCircle2 size={13} color="#55B58D" />
            <Text style={[styles.punchLogText, { color: colors.text.secondary }]}>
              Paid ₹2,200 (UPI #UPI-992144)
            </Text>
          </View>
        </View>

        {/* Card 3: LibX Exam Suite */}
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
            <View style={[styles.smallIconCircle, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
              <Award size={15} color={isDark ? '#55B58D' : '#245C48'} />
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
            76.4%
          </Text>
          <Text style={[styles.metricSubtitle, { color: colors.text.secondary }]}>
            UPSC CSE Prelims Mock #4 completed
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenExamSuite}
            style={[styles.punchLogBox, { backgroundColor: colors.surface.inset }]}>
            <Sparkles size={13} color="#B58A4A" />
            <Text style={[styles.punchLogText, { color: colors.text.secondary }]}>
              Launch Test Simulator →
            </Text>
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
              Verified punch records for {studentData.name} ({studentData.id})
            </Text>
          </View>

          <View style={[styles.badgePillSmall, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
            <Text style={[styles.badgePillSmallText, { color: isDark ? '#55B58D' : '#245C48' }]}>
              {historyRecords.length} Total Visits Logged
            </Text>
          </View>
        </View>

        <View style={styles.historyList}>
          {historyRecords.map((item) => (
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
                  {item.date}
                </Text>
              </View>

              <View style={styles.historyTimesCol}>
                <Text style={[styles.historyCheckIn, { color: '#22C55E' }]}>
                  In: {item.checkInTime}
                </Text>
                <Text
                  style={[
                    styles.historyCheckOut,
                    { color: item.checkOutTime ? '#DC2626' : colors.text.muted },
                  ]}>
                  Out: {item.checkOutTime || 'Active'}
                </Text>
              </View>

              <View style={styles.historyDurationCol}>
                <Clock size={12} color={colors.text.muted} />
                <Text style={[styles.historyDurationText, { color: colors.text.secondary }]}>
                  {item.durationMinutes
                    ? `${Math.floor(item.durationMinutes / 60)}h ${item.durationMinutes % 60}m`
                    : 'In Session'}
                </Text>
              </View>

              <View
                style={[
                  styles.historyStatusPill,
                  {
                    backgroundColor:
                      item.status === 'present'
                        ? isDark
                          ? '#203A2D'
                          : '#E8EEE5'
                        : item.status === 'late'
                        ? isDark
                          ? '#2C2B1B'
                          : '#FEF8EA'
                        : isDark
                        ? '#243038'
                        : '#EDF3F7',
                  },
                ]}>
                <Text
                  style={[
                    styles.historyStatusPillText,
                    {
                      color:
                        item.status === 'present'
                          ? '#245C48'
                          : item.status === 'late'
                          ? '#B58A4A'
                          : '#475569',
                    },
                  ]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.portalFooter}>
        <Text style={[styles.portalFooterText, { color: colors.text.muted }]}>
          {currentTenant.name} Student Pass · Powered by LibX Multi-Tenant SaaS
        </Text>
      </View>

      {/* ========================================================================= */}
      {/* 6. MODAL: QR CODE SCANNER CAMERA INTERFACE                                */}
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

            {/* Simulated Live Viewfinder */}
            <View style={styles.viewfinderContainer}>
              <View style={styles.viewfinderFrame}>
                <View style={[styles.viewfinderCorner, styles.cornerTL]} />
                <View style={[styles.viewfinderCorner, styles.cornerTR]} />
                <View style={[styles.viewfinderCorner, styles.cornerBL]} />
                <View style={[styles.viewfinderCorner, styles.cornerBR]} />

                {/* Animated Laser Scanning Line */}
                <View style={styles.laserScanLine} />

                <Text style={styles.viewfinderPrompt}>
                  Align Library QR Code within the frame
                </Text>
              </View>
            </View>

            {/* Quick Testing Actions (Static & Dynamic QR) */}
            <View style={styles.scannerControlsGroup}>
              <Text style={[styles.scannerControlsLabel, { color: colors.text.muted }]}>
                Instant Terminal Punch (One-Click Verification)
              </Text>
              <View style={styles.testButtonsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleTestScanStatic}
                  style={[styles.testScanBtn, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                  <QrCode size={14} color="#245C48" />
                  <Text style={[styles.testScanBtnText, { color: '#245C48' }]}>
                    Scan Static Entrance QR
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleTestScanDynamic}
                  style={[styles.testScanBtn, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
                  <Clock size={14} color="#B58A4A" />
                  <Text style={[styles.testScanBtnText, { color: '#B58A4A' }]}>
                    Scan Dynamic Kiosk QR
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Manual Code Entry */}
              <View style={styles.manualEntryRow}>
                <TextInput
                  value={manualCodeInput}
                  onChangeText={setManualCodeInput}
                  placeholder="Or enter QR token code..."
                  placeholderTextColor={colors.text.muted}
                  style={[
                    styles.manualCodeInput,
                    {
                      color: colors.text.primary,
                      borderColor: colors.surface.border,
                      backgroundColor: isDark ? colors.surface.canvas : '#FAF8F5',
                    },
                  ]}
                />
                <TouchableOpacity
                  onPress={() => {
                    handleExecuteScan(manualCodeInput);
                    setManualCodeInput('');
                  }}
                  style={[styles.manualSubmitBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                  <Check size={14} color="#FFFFFF" />
                  <Text style={styles.manualSubmitBtnText}>Punch</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 7. MODAL: ATTENDANCE CONFIRMATION / ERROR POPUP                           */}
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
            {/* Top Icon Badge */}
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

            {/* Title & Message */}
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

            {/* Confirmation Metadata Receipt */}
            {scanResult?.success && scanResult.record && (
              <View
                style={[
                  styles.confirmationReceiptBox,
                  {
                    backgroundColor: isDark ? '#19221D' : '#F8FAF8',
                    borderColor: colors.surface.border,
                  },
                ]}>
                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.text.muted }]}>Student Name:</Text>
                  <Text style={[styles.receiptValue, { color: colors.text.primary }]}>
                    {studentData.name}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.text.muted }]}>Student ID:</Text>
                  <Text style={[styles.receiptValue, { color: colors.text.primary }]}>
                    {studentData.id}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.text.muted }]}>Library Campus:</Text>
                  <Text style={[styles.receiptValue, { color: colors.text.primary }]}>
                    {currentTenant.name} ({currentTenant.campus})
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.text.muted }]}>Date & Timestamp:</Text>
                  <Text style={[styles.receiptValue, { color: colors.text.primary }]}>
                    {scanResult.record.date} at {scanResult.action === 'check_out' ? scanResult.record.checkOutTime : scanResult.record.checkInTime}
                  </Text>
                </View>

                {scanResult.action === 'check_out' && scanResult.record.durationMinutes && (
                  <View style={styles.receiptRow}>
                    <Text style={[styles.receiptLabel, { color: colors.text.muted }]}>Visit Duration:</Text>
                    <Text style={[styles.receiptValue, { color: '#245C48', fontWeight: '800' }]}>
                      {Math.floor(scanResult.record.durationMinutes / 60)}h {scanResult.record.durationMinutes % 60}m
                    </Text>
                  </View>
                )}

                <View style={styles.receiptRow}>
                  <Text style={[styles.receiptLabel, { color: colors.text.muted }]}>Attendance Status:</Text>
                  <Text style={[styles.receiptValue, { color: '#16A34A', fontWeight: '700' }]}>
                    {scanResult.record.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setScanResult(null);
                setIsScannerOpen(false);
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    gap: 20,
    maxWidth: 1040,
    alignSelf: 'center',
    width: '100%',
  },
  scrollContainerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 16,
  },
  topBar: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  kickerText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  activePassPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePassText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  studentNameHeader: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  studentSubHeader: {
    fontSize: 12.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
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
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#C76B59',
  },
  scanHeroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  scanHeroLeft: {
    flex: 1,
    minWidth: 260,
    gap: 8,
  },
  scanStatusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scanStatusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
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
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  openScannerPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
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
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  quickScanSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scanHeroRightBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  qrHeroTag: {
    fontSize: 12,
    fontWeight: '700',
  },
  qrHeroSub: {
    fontSize: 11,
  },
  deskPassCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    gap: 16,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 14,
  },
  passTitleCol: {
    gap: 4,
  },
  passKicker: {
    fontSize: 10.5,
    fontWeight: '700',
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
    flexWrap: 'wrap',
    marginTop: 2,
  },
  goldTierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  goldTierText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B58A4A',
  },
  passFloorText: {
    fontSize: 12,
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  qrLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    borderTopWidth: 1,
  },
  passDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  passDetailItem: {
    flex: 1,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailItemLabel: {
    fontSize: 11,
  },
  detailItemValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  threeGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTag: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  smallIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBigNumber: {
    fontSize: 26,
    fontWeight: '800',
  },
  metricSubtitle: {
    fontSize: 12,
  },
  punchLogBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  punchLogText: {
    fontSize: 11,
  },
  noticeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    gap: 14,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  badgePillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  historyList: {
    gap: 8,
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexWrap: 'wrap',
    gap: 10,
  },
  historyDateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 110,
  },
  historyDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyTimesCol: {
    flexDirection: 'row',
    gap: 12,
    minWidth: 160,
  },
  historyCheckIn: {
    fontSize: 12,
    fontWeight: '700',
  },
  historyCheckOut: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyDurationCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 90,
  },
  historyDurationText: {
    fontSize: 12,
  },
  historyStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  historyStatusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  portalFooter: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  portalFooterText: {
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scannerDialogCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 30px rgba(0,0,0,0.25)' },
      default: { elevation: 10 },
    }),
  },
  scannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scannerHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  viewfinderContainer: {
    height: 220,
    backgroundColor: '#0F1A14',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  viewfinderFrame: {
    width: 170,
    height: 170,
    borderWidth: 1.5,
    borderColor: 'rgba(85, 181, 141, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  viewfinderCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: '#55B58D',
  },
  cornerTL: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3 },
  laserScanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOpacity: 0.8,
    shadowRadius: 6,
    position: 'absolute',
    top: '45%',
  },
  viewfinderPrompt: {
    color: '#E8EEE5',
    fontSize: 10.5,
    marginTop: 80,
    textAlign: 'center',
  },
  scannerControlsGroup: {
    gap: 10,
  },
  scannerControlsLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  testButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  testScanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  testScanBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  manualEntryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  manualCodeInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    outlineStyle: 'none' as any,
  },
  manualSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
  },
  manualSubmitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  resultDialogCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '0 10px 35px rgba(0,0,0,0.3)' },
      default: { elevation: 12 },
    }),
  },
  resultIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  confirmationReceiptBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 12,
  },
  receiptValue: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  resultDismissBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  resultDismissBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
