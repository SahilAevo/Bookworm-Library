import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Platform,
  useWindowDimensions,
  Modal,
} from 'react-native';
import {
  CalendarCheck,
  QrCode,
  Users,
  Clock,
  BarChart3,
  Settings,
  Download,
  Printer,
  RefreshCw,
  Plus,
  Play,
  Pause,
  Square,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  FileSpreadsheet,
  FileText,
  Building2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Wifi,
  Sparkles,
  LogOut,
  Calendar,
  X,
  RotateCcw,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { LibraryTenant } from '@/constants/tenants';
import {
  attendanceService,
  AttendanceRecord,
  AttendanceMode,
  AttendancePolicy,
  StaticQRCodeConfig,
  DynamicQRSession,
  TenantAttendanceSettings,
} from '@/services/attendance-service';
import { LibXQRCode } from '@/components/common/LibXQRCode';

interface AttendanceManagementViewProps {
  currentTenant: LibraryTenant;
  onBackToDashboard?: () => void;
  onOpenStudentScanner?: () => void;
}

type TabKey = 'overview' | 'qr-management' | 'records' | 'analytics' | 'settings';

export function AttendanceManagementView({
  currentTenant,
  onBackToDashboard,
  onOpenStudentScanner,
}: AttendanceManagementViewProps) {
  const { colors, isDark } = useThemeMode();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [qrModeSubTab, setQrModeSubTab] = useState<'static' | 'dynamic'>('static');

  // Tenant data states
  const [settings, setSettings] = useState<TenantAttendanceSettings>(() =>
    attendanceService.getSettings(currentTenant.id)
  );
  const [staticQRs, setStaticQRs] = useState<StaticQRCodeConfig[]>(() =>
    attendanceService.getStaticQRCodes(currentTenant.id)
  );
  const [dynamicSession, setDynamicSession] = useState<DynamicQRSession>(() =>
    attendanceService.getDynamicSession(currentTenant.id)
  );
  const [records, setRecords] = useState<AttendanceRecord[]>(() =>
    attendanceService.getRecords(currentTenant.id)
  );

  // Dynamic QR live countdown
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(30);
  const [isFullScreenKiosk, setIsFullScreenKiosk] = useState(false);

  // Modals
  const [showGenerateStaticModal, setShowGenerateStaticModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendQrId, setExtendQrId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState('15');
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<AttendanceRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generation inputs
  const [newQrLabel, setNewQrLabel] = useState('Main Reading Hall Entrance');
  const [newQrDays, setNewQrDays] = useState('30');
  const [newQrLocation, setNewQrLocation] = useState('Entrance Standee Poster');

  // Search & Record Filters
  const [recordSearch, setRecordSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'checked_out' | 'late'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'static_qr' | 'dynamic_qr'>('all');

  // Analytics timeframe
  const [analyticsView, setAnalyticsView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Sync when tenant changes
  useEffect(() => {
    setSettings(attendanceService.getSettings(currentTenant.id));
    setStaticQRs(attendanceService.getStaticQRCodes(currentTenant.id));
    setDynamicSession(attendanceService.getDynamicSession(currentTenant.id));
    setRecords(attendanceService.getRecords(currentTenant.id));
  }, [currentTenant.id]);

  // Dynamic QR auto-refresh ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const activeSession = attendanceService.getDynamicSession(currentTenant.id);
      setDynamicSession(activeSession);
      const remainingMs = Math.max(0, activeSession.tokenExpiresAt - Date.now());
      setTimeLeftSeconds(Math.ceil(remainingMs / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentTenant.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Computed Overview stats
  const overviewStats = useMemo(() => {
    return attendanceService.getOverviewStats(currentTenant.id);
  }, [currentTenant.id, records]);

  // Computed Analytics
  const analyticsData = useMemo(() => {
    return attendanceService.getAnalytics(currentTenant.id);
  }, [currentTenant.id, records]);

  // Active Static QR
  const activeStaticQR = useMemo(() => {
    return staticQRs.find((q) => q.status === 'active') || staticQRs[0];
  }, [staticQRs]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (departmentFilter !== 'all' && rec.department !== departmentFilter) return false;
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (methodFilter !== 'all' && rec.method !== methodFilter) return false;
      if (recordSearch.trim()) {
        const q = recordSearch.toLowerCase().trim();
        const matchesName = rec.studentName.toLowerCase().includes(q);
        const matchesId = rec.studentId.toLowerCase().includes(q);
        const matchesDesk = rec.deskNo.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesDesk) return false;
      }
      return true;
    });
  }, [records, departmentFilter, statusFilter, methodFilter, recordSearch]);

  // Handlers
  const handleGenerateStaticQR = () => {
    const days = parseInt(newQrDays, 10) || 30;
    const generated = attendanceService.generateStaticQR(currentTenant.id, newQrLabel, days, newQrLocation);
    setStaticQRs(attendanceService.getStaticQRCodes(currentTenant.id));
    setShowGenerateStaticModal(false);
    showToast(`✅ New Static QR Code generated (Valid for ${days} days)`);
  };

  const handleRevokeStaticQR = (id: string) => {
    attendanceService.revokeStaticQR(currentTenant.id, id);
    setStaticQRs(attendanceService.getStaticQRCodes(currentTenant.id));
    showToast('⚠️ QR Code has been revoked and is immediately invalid.');
  };

  const handleExtendValidity = () => {
    if (!extendQrId) return;
    const days = parseInt(extendDays, 10) || 15;
    attendanceService.extendStaticQRValidity(currentTenant.id, extendQrId, days);
    setStaticQRs(attendanceService.getStaticQRCodes(currentTenant.id));
    setShowExtendModal(false);
    showToast(`✅ Validity extended by ${days} days without changing the QR code.`);
  };

  const handleToggleDynamicSession = (action: 'start' | 'pause' | 'stop') => {
    if (action === 'start') {
      const s = attendanceService.startDynamicSession(currentTenant.id, settings.dynamicRefreshInterval);
      setDynamicSession(s);
      showToast('▶️ Live dynamic attendance session started.');
    } else if (action === 'pause') {
      const s = attendanceService.pauseDynamicSession(currentTenant.id);
      setDynamicSession(s);
      showToast('⏸️ Dynamic attendance session paused.');
    } else {
      const s = attendanceService.stopDynamicSession(currentTenant.id);
      setDynamicSession(s);
      showToast('⏹️ Dynamic attendance session stopped.');
    }
  };

  const handleManualCheckOut = (recordId: string) => {
    const rec = records.find((r) => r.id === recordId);
    if (!rec) return;
    const updated = attendanceService.registerScan(currentTenant.id, rec.studentId, activeStaticQR?.token || '');
    setRecords(attendanceService.getRecords(currentTenant.id));
    showToast(`🚪 ${rec.studentName} checked out successfully.`);
  };

  const handleSaveSettings = (update: Partial<TenantAttendanceSettings>) => {
    const updated = attendanceService.updateSettings(currentTenant.id, update);
    setSettings(updated);
    showToast('✅ Attendance settings updated successfully.');
  };

  const handleExportCSV = () => {
    const headers = 'Student ID,Name,Department,Desk,Shift,Date,Check-In,Check-Out,Duration (Mins),Status,Method\n';
    const rows = filteredRecords
      .map(
        (r) =>
          `"${r.studentId}","${r.studentName}","${r.department}","${r.deskNo}","${r.shift}","${r.date}","${r.checkInTime}","${r.checkOutTime || '--'}","${r.durationMinutes || '--'}","${r.status}","${r.method}"`
      )
      .join('\n');
    const csvContent = headers + rows;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `LibX_Attendance_${currentTenant.code}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📥 Attendance CSV exported successfully.');
    } else {
      showToast('Attendance report exported to downloads.');
    }
  };

  return (
    <View style={styles.container}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BREADCRUMB BANNER                                         */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
            borderColor: colors.surface.border,
          },
        ]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTitleGroup}>
            <View style={styles.headerBadgeRow}>
              <View style={[styles.headerIconCircle, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                <CalendarCheck size={20} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.4} />
              </View>
              <Text style={[styles.kickerText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                LIBX SMART ACCESS · QR ATTENDANCE SYSTEM
              </Text>
              <View
                style={[
                  styles.modeIndicatorBadge,
                  {
                    backgroundColor:
                      settings.preferredMode === 'static'
                        ? isDark
                          ? '#2C2B1B'
                          : '#FEF8EA'
                        : isDark
                        ? '#203A2D'
                        : '#E8EEE5',
                  },
                ]}>
                <Text
                  style={[
                    styles.modeIndicatorText,
                    { color: settings.preferredMode === 'static' ? '#B58A4A' : '#245C48' },
                  ]}>
                  {settings.preferredMode === 'static' ? '📌 STATIC QR MODE' : '⚡ DYNAMIC QR MODE'}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Attendance Management
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
              {currentTenant.name} ({currentTenant.campus}) · Multi-mode QR access, live visits & analytics
            </Text>
          </View>

          {/* Quick Header Actions */}
          <View style={styles.headerActionsGroup}>
            {onOpenStudentScanner && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onOpenStudentScanner}
                style={[styles.scannerLaunchBtn, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5', borderColor: '#245C48' }]}>
                <QrCode size={15} color={isDark ? '#55B58D' : '#245C48'} />
                <Text style={[styles.scannerLaunchBtnText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                  Student Scanner Preview
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowPrintModal(true)}
              style={[styles.printActionBtn, { borderColor: colors.surface.border }]}>
              <Printer size={15} color={colors.text.secondary} />
              <Text style={[styles.printActionBtnText, { color: colors.text.secondary }]}>Print Standee</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Sub-Tabs */}
        <View style={[styles.navTabsRow, { borderTopColor: colors.surface.border }]}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'qr-management', label: 'QR Code Management', icon: QrCode, badge: settings.preferredMode.toUpperCase() },
            { id: 'records', label: 'Attendance Records', icon: CalendarCheck, count: records.length },
            { id: 'analytics', label: 'Attendance Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Attendance Settings', icon: Settings },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComp = tab.icon;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.id as TabKey)}
                style={[
                  styles.navTabBtn,
                  isActive && [
                    styles.navTabBtnActive,
                    { borderBottomColor: isDark ? '#55B58D' : '#245C48' },
                  ],
                ]}>
                <IconComp
                  size={15}
                  color={isActive ? (isDark ? '#55B58D' : '#245C48') : colors.text.muted}
                />
                <Text
                  style={[
                    styles.navTabBtnText,
                    {
                      color: isActive ? (isDark ? '#55B58D' : '#245C48') : colors.text.secondary,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}>
                  {tab.label}
                </Text>
                {tab.count !== undefined && (
                  <View style={[styles.tabBadge, { backgroundColor: isDark ? '#2C3530' : '#EAE6DC' }]}>
                    <Text style={[styles.tabBadgeText, { color: colors.text.secondary }]}>{tab.count}</Text>
                  </View>
                )}
                {tab.badge && (
                  <View
                    style={[
                      styles.tabPillBadge,
                      { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' },
                    ]}>
                    <Text style={[styles.tabPillBadgeText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                      {tab.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Toast Alert Notification */}
      {toastMessage && (
        <View style={[styles.toastContainer, { backgroundColor: isDark ? '#203A2D' : '#1A3326' }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB 1: OVERVIEW DASHBOARD                                              */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <View style={styles.tabContentSection}>
          {/* 6 Key Stat Cards */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
              <View style={styles.statCardTop}>
                <Text style={[styles.statLabel, { color: colors.text.muted }]}>REGISTERED STUDENTS</Text>
                <View style={[styles.statIconBox, { backgroundColor: isDark ? '#212D26' : '#EFF4F0' }]}>
                  <Users size={16} color={isDark ? '#55B58D' : '#245C48'} />
                </View>
              </View>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {overviewStats.totalRegisteredStudents}
              </Text>
              <Text style={[styles.statHelper, { color: colors.text.secondary }]}>
                Active desk membership holders
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
              <View style={styles.statCardTop}>
                <Text style={[styles.statLabel, { color: colors.text.muted }]}>VISITS TODAY</Text>
                <View style={[styles.statIconBox, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
                  <CalendarCheck size={16} color="#B58A4A" />
                </View>
              </View>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {overviewStats.todayVisits}
              </Text>
              <Text style={[styles.statHelper, { color: colors.text.secondary }]}>
                {overviewStats.uniqueVisitorsToday} unique visitors logged
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
              <View style={styles.statCardTop}>
                <Text style={[styles.statLabel, { color: colors.text.muted }]}>CURRENTLY INSIDE</Text>
                <View style={[styles.livePulseDot, { backgroundColor: '#22C55E' }]} />
              </View>
              <Text style={[styles.statValue, { color: '#22C55E' }]}>
                {overviewStats.currentlyInside}
              </Text>
              <Text style={[styles.statHelper, { color: colors.text.secondary }]}>
                Live active check-in sessions
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
              <View style={styles.statCardTop}>
                <Text style={[styles.statLabel, { color: colors.text.muted }]}>AVG DAILY ATTENDANCE</Text>
                <View style={[styles.statIconBox, { backgroundColor: isDark ? '#212D26' : '#EFF4F0' }]}>
                  <TrendingUp size={16} color={isDark ? '#55B58D' : '#245C48'} />
                </View>
              </View>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {overviewStats.averageDailyAttendance}
              </Text>
              <Text style={[styles.statHelper, { color: colors.text.secondary }]}>
                Per business day average
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
              <View style={styles.statCardTop}>
                <Text style={[styles.statLabel, { color: colors.text.muted }]}>MONTHLY ATTENDANCE</Text>
                <View style={[styles.statIconBox, { backgroundColor: isDark ? '#212D26' : '#EFF4F0' }]}>
                  <Calendar size={16} color={isDark ? '#55B58D' : '#245C48'} />
                </View>
              </View>
              <Text style={[styles.statValue, { color: colors.text.primary }]}>
                {overviewStats.totalAttendanceMonth}
              </Text>
              <Text style={[styles.statHelper, { color: colors.text.secondary }]}>
                Total visits this calendar month
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
              <View style={styles.statCardTop}>
                <Text style={[styles.statLabel, { color: colors.text.muted }]}>PEAK VISITING HOURS</Text>
                <View style={[styles.statIconBox, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
                  <Clock size={16} color="#B58A4A" />
                </View>
              </View>
              <Text style={[styles.statValueCompact, { color: colors.text.primary }]}>
                {overviewStats.peakHours}
              </Text>
              <Text style={[styles.statHelper, { color: colors.text.secondary }]}>
                Highest desk occupancy interval
              </Text>
            </View>
          </View>

          {/* Quick QR Terminal Overview Banner */}
          <View
            style={[
              styles.terminalHeroCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            <View style={styles.terminalHeroLeft}>
              <View style={styles.terminalBadgeRow}>
                <Text style={[styles.terminalTag, { color: isDark ? '#55B58D' : '#245C48' }]}>
                  TERMINAL ACTIVE MODE: {settings.preferredMode.toUpperCase()} QR
                </Text>
                <View style={styles.activeDotGreen} />
              </View>

              <Text style={[styles.terminalTitle, { color: colors.text.primary }]}>
                {settings.preferredMode === 'static'
                  ? 'Static QR Code is Currently Live at Library Entrance'
                  : 'Live Dynamic Token Generator Active for Entrance Tablet'}
              </Text>

              <Text style={[styles.terminalDesc, { color: colors.text.muted }]}>
                {settings.preferredMode === 'static'
                  ? `Active Code: "${activeStaticQR?.label || 'Entrance Pass'}" · Valid until ${activeStaticQR?.validUntil || 'End of Month'}. Students scan this code to register check-in and check-out.`
                  : `Dynamic session "${dynamicSession.title}" refreshes every ${dynamicSession.refreshIntervalSeconds}s. Scanned ${dynamicSession.totalScans} times today.`}
              </Text>

              <View style={styles.terminalActionsRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('qr-management')}
                  style={[styles.primaryBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                  <QrCode size={15} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Manage QR Terminal</Text>
                </TouchableOpacity>

                {settings.preferredMode === 'dynamic' && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setIsFullScreenKiosk(true)}
                    style={[styles.secondaryOutlineBtn, { borderColor: colors.surface.border }]}>
                    <Maximize2 size={14} color={colors.text.secondary} />
                    <Text style={[styles.secondaryOutlineBtnText, { color: colors.text.secondary }]}>
                      Fullscreen Kiosk Mode
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('settings')}
                  style={[styles.secondaryOutlineBtn, { borderColor: colors.surface.border }]}>
                  <Settings size={14} color={colors.text.secondary} />
                  <Text style={[styles.secondaryOutlineBtnText, { color: colors.text.secondary }]}>
                    Policy & Settings
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Side QR Preview Card */}
            <View style={[styles.terminalHeroRight, { backgroundColor: isDark ? '#19221D' : '#F6F8F6', borderColor: colors.surface.border }]}>
              <LibXQRCode
                value={
                  settings.preferredMode === 'static'
                    ? activeStaticQR?.token || 'LIBX-STATIC-FALLBACK'
                    : dynamicSession.currentToken
                }
                size={130}
                color="#1A3326"
                backgroundColor="#FFFFFF"
              />
              <Text style={[styles.terminalQrCaption, { color: colors.text.muted }]}>
                {settings.preferredMode === 'static'
                  ? `Static Entrance Pass (${activeStaticQR?.validityDays || 30} Days Validity)`
                  : `Dynamic Refresh in ${timeLeftSeconds}s`}
              </Text>
            </View>
          </View>

          {/* Currently Checked-in Students Quick List */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            <View style={styles.sectionCardHeader}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.sectionCardTitle, { color: colors.text.primary }]}>
                    Students Currently Inside Library
                  </Text>
                  <View style={[styles.activePillSmall, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                    <Text style={[styles.activePillSmallText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                      {records.filter((r) => r.status === 'present' || !r.checkOutTime).length} Active
                    </Text>
                  </View>
                </View>
                <Text style={[styles.sectionCardDesc, { color: colors.text.muted }]}>
                  Students who have checked in today and haven’t logged a check-out yet.
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setActiveTab('records')}
                style={[styles.secondaryOutlineBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.secondaryOutlineBtnText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                  View All Records →
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.liveStudentsGrid}>
              {records
                .filter((r) => r.status === 'present' || !r.checkOutTime)
                .slice(0, 6)
                .map((rec) => (
                  <View
                    key={rec.id}
                    style={[
                      styles.liveStudentCard,
                      {
                        backgroundColor: isDark ? colors.surface.canvas : '#FAF8F5',
                        borderColor: colors.surface.border,
                      },
                    ]}>
                    <View style={styles.liveStudentTop}>
                      <View>
                        <Text style={[styles.liveStudentName, { color: colors.text.primary }]}>
                          {rec.studentName}
                        </Text>
                        <Text style={[styles.liveStudentSub, { color: colors.text.muted }]}>
                          {rec.studentId} · Desk {rec.deskNo}
                        </Text>
                      </View>
                      <View style={[styles.shiftTagSmall, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
                        <Text style={[styles.shiftTagSmallText, { color: '#B58A4A' }]}>{rec.shift.replace(' Shift', '')}</Text>
                      </View>
                    </View>

                    <View style={styles.liveStudentBottom}>
                      <View style={styles.punchTimeItem}>
                        <Clock size={12} color="#22C55E" />
                        <Text style={[styles.punchTimeText, { color: colors.text.secondary }]}>
                          In: {rec.checkInTime}
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleManualCheckOut(rec.id)}
                        style={[styles.checkoutBtn, { backgroundColor: isDark ? '#382626' : '#FEECEB' }]}>
                        <LogOut size={12} color="#DC2626" />
                        <Text style={styles.checkoutBtnText}>Check Out</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2: QR CODE MANAGEMENT (MODE A: STATIC & MODE B: DYNAMIC)          */}
      {/* ========================================================================= */}
      {activeTab === 'qr-management' && (
        <View style={styles.tabContentSection}>
          {/* Mode Switcher Pills */}
          <View
            style={[
              styles.qrModeSwitchRow,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setQrModeSubTab('static')}
              style={[
                styles.qrModeTabBtn,
                qrModeSubTab === 'static' && [
                  styles.qrModeTabBtnActive,
                  { backgroundColor: isDark ? '#245C48' : '#287A5B' },
                ],
              ]}>
              <Printer size={16} color={qrModeSubTab === 'static' ? '#FFFFFF' : colors.text.secondary} />
              <View>
                <Text
                  style={[
                    styles.qrModeTabTitle,
                    { color: qrModeSubTab === 'static' ? '#FFFFFF' : colors.text.primary },
                  ]}>
                  Mode A: Static QR Code
                </Text>
                <Text
                  style={[
                    styles.qrModeTabSubtitle,
                    { color: qrModeSubTab === 'static' ? '#E8EEE5' : colors.text.muted },
                  ]}>
                  Generate once, print standee, place at entrance
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setQrModeSubTab('dynamic')}
              style={[
                styles.qrModeTabBtn,
                qrModeSubTab === 'dynamic' && [
                  styles.qrModeTabBtnActive,
                  { backgroundColor: isDark ? '#245C48' : '#287A5B' },
                ],
              ]}>
              <RefreshCw size={16} color={qrModeSubTab === 'dynamic' ? '#FFFFFF' : colors.text.secondary} />
              <View>
                <Text
                  style={[
                    styles.qrModeTabTitle,
                    { color: qrModeSubTab === 'dynamic' ? '#FFFFFF' : colors.text.primary },
                  ]}>
                  Mode B: Dynamic QR Code
                </Text>
                <Text
                  style={[
                    styles.qrModeTabSubtitle,
                    { color: qrModeSubTab === 'dynamic' ? '#E8EEE5' : colors.text.muted },
                  ]}>
                  Auto-refreshing tokens for entrance tablet/screen
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* SUB-TAB A: STATIC QR MANAGEMENT */}
          {qrModeSubTab === 'static' && (
            <View style={{ gap: 16 }}>
              {/* Active Standee Display Card */}
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                    borderColor: colors.surface.border,
                  },
                ]}>
                <View style={styles.sectionCardHeader}>
                  <View>
                    <Text style={[styles.sectionCardTitle, { color: colors.text.primary }]}>
                      Active Library Entrance QR Pass
                    </Text>
                    <Text style={[styles.sectionCardDesc, { color: colors.text.muted }]}>
                      This static QR code works continuously until its expiration date. No daily regeneration needed.
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setShowGenerateStaticModal(true)}
                      style={[styles.primaryBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                      <Plus size={15} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Generate New Static QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setShowPrintModal(true)}
                      style={[styles.secondaryOutlineBtn, { borderColor: colors.surface.border }]}>
                      <Printer size={15} color={colors.text.secondary} />
                      <Text style={[styles.secondaryOutlineBtnText, { color: colors.text.secondary }]}>
                        Printable Poster Preview
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {activeStaticQR ? (
                  <View style={styles.staticHeroLayout}>
                    {/* Left: High-Res QR Component */}
                    <View style={[styles.staticQrBox, { backgroundColor: isDark ? '#19221D' : '#F6F8F6', borderColor: colors.surface.border }]}>
                      <LibXQRCode
                        value={activeStaticQR.token}
                        size={180}
                        color="#1A3326"
                        backgroundColor="#FFFFFF"
                      />
                      <Text style={[styles.qrTokenText, { color: colors.text.muted }]}>
                        {activeStaticQR.token}
                      </Text>
                    </View>

                    {/* Right: Metadata, Validity & Quick Controls */}
                    <View style={styles.staticMetaCol}>
                      <View style={styles.statusRow}>
                        <View
                          style={[
                            styles.badgePill,
                            {
                              backgroundColor:
                                activeStaticQR.status === 'active'
                                  ? isDark
                                    ? '#203A2D'
                                    : '#E8EEE5'
                                  : isDark
                                  ? '#3D2020'
                                  : '#FDECE8',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.badgePillText,
                              {
                                color:
                                  activeStaticQR.status === 'active'
                                    ? isDark
                                      ? '#55B58D'
                                      : '#245C48'
                                    : '#DC2626',
                              },
                            ]}>
                            ● {activeStaticQR.status.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={[styles.qrLocationText, { color: colors.text.muted }]}>
                          📍 {activeStaticQR.locationTag || 'Main Entrance'}
                        </Text>
                      </View>

                      <Text style={[styles.staticQrLabelText, { color: colors.text.primary }]}>
                        {activeStaticQR.label}
                      </Text>

                      {/* Dates Grid */}
                      <View style={styles.datesGrid}>
                        <View style={styles.dateCol}>
                          <Text style={[styles.dateColLabel, { color: colors.text.muted }]}>Activation Date</Text>
                          <Text style={[styles.dateColValue, { color: colors.text.primary }]}>
                            {activeStaticQR.createdAt}
                          </Text>
                        </View>

                        <View style={styles.dateCol}>
                          <Text style={[styles.dateColLabel, { color: colors.text.muted }]}>Expiration Date</Text>
                          <Text style={[styles.dateColValue, { color: colors.text.primary }]}>
                            {activeStaticQR.validUntil}
                          </Text>
                        </View>

                        <View style={styles.dateCol}>
                          <Text style={[styles.dateColLabel, { color: colors.text.muted }]}>Validity Period</Text>
                          <Text style={[styles.dateColValue, { color: colors.text.primary }]}>
                            {activeStaticQR.validityDays} Days Total
                          </Text>
                        </View>

                        <View style={styles.dateCol}>
                          <Text style={[styles.dateColLabel, { color: colors.text.muted }]}>Total Downloads</Text>
                          <Text style={[styles.dateColValue, { color: colors.text.primary }]}>
                            {activeStaticQR.downloadCount} Prints
                          </Text>
                        </View>
                      </View>

                      {/* Action buttons */}
                      <View style={styles.staticActionButtonsRow}>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => {
                            setExtendQrId(activeStaticQR.id);
                            setShowExtendModal(true);
                          }}
                          style={[styles.actionChipBtn, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA', borderColor: '#B58A4A' }]}>
                          <Clock size={14} color="#B58A4A" />
                          <Text style={[styles.actionChipBtnText, { color: '#B58A4A' }]}>
                            Extend Validity Without Changing QR
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => handleRevokeStaticQR(activeStaticQR.id)}
                          style={[styles.actionChipBtn, { backgroundColor: isDark ? '#382626' : '#FEECEB', borderColor: '#DC2626' }]}>
                          <X size={14} color="#DC2626" />
                          <Text style={[styles.actionChipBtnText, { color: '#DC2626' }]}>
                            Revoke This QR Code
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={{ color: colors.text.muted, padding: 20 }}>No active static QR code found.</Text>
                )}
              </View>

              {/* History of Previously Generated Static QR Codes */}
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                    borderColor: colors.surface.border,
                  },
                ]}>
                <Text style={[styles.sectionCardTitle, { color: colors.text.primary, marginBottom: 4 }]}>
                  Static QR Generation & Revocation History
                </Text>
                <Text style={[styles.sectionCardDesc, { color: colors.text.muted, marginBottom: 12 }]}>
                  Audit trail of all static credentials generated for this branch.
                </Text>

                <View style={styles.tableWrapper}>
                  <View style={[styles.tableHeaderRow, { backgroundColor: isDark ? '#1F2923' : '#F4F2EC' }]}>
                    <Text style={[styles.thCell, { flex: 2, color: colors.text.muted }]}>LABEL & LOCATION</Text>
                    <Text style={[styles.thCell, { flex: 1.5, color: colors.text.muted }]}>STATUS</Text>
                    <Text style={[styles.thCell, { flex: 1.5, color: colors.text.muted }]}>CREATED</Text>
                    <Text style={[styles.thCell, { flex: 1.5, color: colors.text.muted }]}>VALID UNTIL</Text>
                    <Text style={[styles.thCell, { flex: 2, color: colors.text.muted }]}>ACTIONS</Text>
                  </View>

                  {staticQRs.map((item) => (
                    <View key={item.id} style={[styles.tableDataRow, { borderColor: colors.surface.border }]}>
                      <View style={{ flex: 2 }}>
                        <Text style={[styles.tdBold, { color: colors.text.primary }]}>{item.label}</Text>
                        <Text style={[styles.tdMuted, { color: colors.text.muted }]}>{item.locationTag}</Text>
                      </View>

                      <View style={{ flex: 1.5 }}>
                        <View
                          style={[
                            styles.badgePillSmall,
                            {
                              backgroundColor:
                                item.status === 'active'
                                  ? isDark
                                    ? '#203A2D'
                                    : '#E8EEE5'
                                  : item.status === 'expired'
                                  ? isDark
                                    ? '#2C2B1B'
                                    : '#FEF8EA'
                                  : isDark
                                  ? '#3D2020'
                                  : '#FDECE8',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.badgePillSmallText,
                              {
                                color:
                                  item.status === 'active'
                                    ? '#245C48'
                                    : item.status === 'expired'
                                    ? '#B58A4A'
                                    : '#DC2626',
                              },
                            ]}>
                            {item.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.tdRegular, { flex: 1.5, color: colors.text.secondary }]}>
                        {item.createdAt}
                      </Text>

                      <Text style={[styles.tdRegular, { flex: 1.5, color: colors.text.secondary }]}>
                        {item.validUntil}
                      </Text>

                      <View style={{ flex: 2, flexDirection: 'row', gap: 6 }}>
                        {item.status === 'active' && (
                          <TouchableOpacity
                            onPress={() => handleRevokeStaticQR(item.id)}
                            style={[styles.tinyActionBtn, { borderColor: '#DC2626' }]}>
                            <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '600' }}>Revoke</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => {
                            setExtendQrId(item.id);
                            setShowExtendModal(true);
                          }}
                          style={[styles.tinyActionBtn, { borderColor: colors.surface.border }]}>
                          <Text style={{ fontSize: 11, color: colors.text.secondary, fontWeight: '600' }}>
                            Extend
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* SUB-TAB B: DYNAMIC QR MANAGEMENT */}
          {qrModeSubTab === 'dynamic' && (
            <View style={{ gap: 16 }}>
              {/* Dynamic Session Console */}
              <View
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                    borderColor: colors.surface.border,
                  },
                ]}>
                <View style={styles.sectionCardHeader}>
                  <View>
                    <Text style={[styles.sectionCardTitle, { color: colors.text.primary }]}>
                      Dynamic Attendance Session Terminal
                    </Text>
                    <Text style={[styles.sectionCardDesc, { color: colors.text.muted }]}>
                      Generates rolling cryptographic tokens refreshed every {dynamicSession.refreshIntervalSeconds} seconds. Stale tokens are rejected immediately.
                    </Text>
                  </View>

                  {/* Session Control Buttons */}
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    {dynamicSession.status === 'active' ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleToggleDynamicSession('pause')}
                        style={[styles.controlBtn, { backgroundColor: '#F59E0B' }]}>
                        <Pause size={14} color="#FFFFFF" />
                        <Text style={styles.controlBtnText}>Pause Session</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => handleToggleDynamicSession('start')}
                        style={[styles.controlBtn, { backgroundColor: '#22C55E' }]}>
                        <Play size={14} color="#FFFFFF" />
                        <Text style={styles.controlBtnText}>Start Session</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleToggleDynamicSession('stop')}
                      style={[styles.controlBtn, { backgroundColor: '#DC2626' }]}>
                      <Square size={14} color="#FFFFFF" />
                      <Text style={styles.controlBtnText}>Stop</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setIsFullScreenKiosk(true)}
                      style={[styles.primaryBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                      <Maximize2 size={14} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Launch Kiosk</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Dynamic Session Body */}
                <View style={styles.dynamicSessionLayout}>
                  {/* Left: Dynamic QR with Countdown Overlay */}
                  <View style={[styles.dynamicQrCenterBox, { backgroundColor: isDark ? '#19221D' : '#F6F8F6', borderColor: colors.surface.border }]}>
                    <LibXQRCode
                      value={dynamicSession.currentToken}
                      size={200}
                      color="#1A3326"
                      backgroundColor="#FFFFFF"
                    />

                    {/* Circular / Pill Countdown Indicator */}
                    <View style={styles.countdownPillRow}>
                      <RefreshCw size={14} color="#245C48" />
                      <Text style={styles.countdownPillText}>
                        Refreshes in: <Text style={{ fontWeight: '800', color: '#245C48' }}>{timeLeftSeconds}s</Text>
                      </Text>
                    </View>

                    <Text style={[styles.tokenNonceText, { color: colors.text.muted }]}>
                      Token: {dynamicSession.currentToken}
                    </Text>
                  </View>

                  {/* Right: Session Telemetry & Configurations */}
                  <View style={styles.dynamicTelemetryCol}>
                    <View style={styles.sessionStatusBanner}>
                      <Text style={styles.sessionStatusLabel}>SESSION STATUS</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View
                          style={[
                            styles.livePulseDot,
                            {
                              backgroundColor:
                                dynamicSession.status === 'active'
                                  ? '#22C55E'
                                  : dynamicSession.status === 'paused'
                                  ? '#F59E0B'
                                  : '#DC2626',
                            },
                          ]}
                        />
                        <Text style={[styles.sessionStatusValue, { color: colors.text.primary }]}>
                          {dynamicSession.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.telemetryGrid}>
                      <View style={[styles.telemetryCard, { borderColor: colors.surface.border }]}>
                        <Text style={[styles.telemetryCardLabel, { color: colors.text.muted }]}>STARTED AT</Text>
                        <Text style={[styles.telemetryCardVal, { color: colors.text.primary }]}>
                          {dynamicSession.startedAt}
                        </Text>
                      </View>

                      <View style={[styles.telemetryCard, { borderColor: colors.surface.border }]}>
                        <Text style={[styles.telemetryCardLabel, { color: colors.text.muted }]}>TODAY’S SCANS</Text>
                        <Text style={[styles.telemetryCardVal, { color: colors.text.primary }]}>
                          {dynamicSession.totalScans}
                        </Text>
                      </View>

                      <View style={[styles.telemetryCard, { borderColor: colors.surface.border }]}>
                        <Text style={[styles.telemetryCardLabel, { color: colors.text.muted }]}>REFRESH RATE</Text>
                        <Text style={[styles.telemetryCardVal, { color: colors.text.primary }]}>
                          {dynamicSession.refreshIntervalSeconds}s
                        </Text>
                      </View>

                      <View style={[styles.telemetryCard, { borderColor: colors.surface.border }]}>
                        <Text style={[styles.telemetryCardLabel, { color: colors.text.muted }]}>FRAUD RISK</Text>
                        <Text style={[styles.telemetryCardVal, { color: '#22C55E' }]}>ZERO (Time-gated)</Text>
                      </View>
                    </View>

                    {/* Refresh Interval Selector */}
                    <View style={styles.intervalConfigGroup}>
                      <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
                        Configurable Token Refresh Interval
                      </Text>
                      <View style={styles.intervalChipsRow}>
                        {[15, 20, 30, 45, 60].map((sec) => (
                          <TouchableOpacity
                            key={sec}
                            onPress={() => {
                              handleSaveSettings({ dynamicRefreshInterval: sec });
                              attendanceService.startDynamicSession(currentTenant.id, sec);
                              setDynamicSession(attendanceService.getDynamicSession(currentTenant.id));
                            }}
                            style={[
                              styles.intervalChip,
                              dynamicSession.refreshIntervalSeconds === sec
                                ? { backgroundColor: '#245C48', borderColor: '#245C48' }
                                : { borderColor: colors.surface.border },
                            ]}>
                            <Text
                              style={[
                                styles.intervalChipText,
                                {
                                  color:
                                    dynamicSession.refreshIntervalSeconds === sec
                                      ? '#FFFFFF'
                                      : colors.text.secondary,
                                },
                              ]}>
                              {sec} Seconds
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 3: ATTENDANCE RECORDS TABLE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'records' && (
        <View style={styles.tabContentSection}>
          {/* Filter & Search Toolbar */}
          <View
            style={[
              styles.recordsToolbar,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            {/* Search Input */}
            <View style={[styles.searchBox, { borderColor: colors.surface.border }]}>
              <Search size={14} color={colors.text.muted} />
              <TextInput
                value={recordSearch}
                onChangeText={setRecordSearch}
                placeholder="Search student name, ID or desk..."
                placeholderTextColor={colors.text.muted}
                style={[styles.searchInput, { color: colors.text.primary }]}
              />
              {recordSearch ? (
                <TouchableOpacity onPress={() => setRecordSearch('')}>
                  <X size={14} color={colors.text.muted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Department Filter */}
            <View style={styles.filterPillsRow}>
              {['all', 'UPSC Civil Services', 'Engineering / GATE', 'Medical / NEET-PG', 'CA / Commerce'].map(
                (dept) => (
                  <TouchableOpacity
                    key={dept}
                    onPress={() => setDepartmentFilter(dept)}
                    style={[
                      styles.filterChip,
                      departmentFilter === dept
                        ? { backgroundColor: isDark ? '#245C48' : '#287A5B', borderColor: '#245C48' }
                        : { borderColor: colors.surface.border },
                    ]}>
                    <Text
                      style={[
                        styles.filterChipText,
                        { color: departmentFilter === dept ? '#FFFFFF' : colors.text.secondary },
                      ]}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Export CSV / Print Button */}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleExportCSV}
                style={[styles.secondaryOutlineBtn, { borderColor: colors.surface.border }]}>
                <FileSpreadsheet size={15} color="#245C48" />
                <Text style={[styles.secondaryOutlineBtnText, { color: '#245C48' }]}>Export CSV</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Records Table */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
                padding: 0,
              },
            ]}>
            <View style={styles.tableWrapper}>
              <View style={[styles.tableHeaderRow, { backgroundColor: isDark ? '#1F2923' : '#F4F2EC' }]}>
                <Text style={[styles.thCell, { flex: 2, color: colors.text.muted }]}>STUDENT NAME & ID</Text>
                <Text style={[styles.thCell, { flex: 1.5, color: colors.text.muted }]}>DEPARTMENT & DESK</Text>
                <Text style={[styles.thCell, { flex: 1.2, color: colors.text.muted }]}>DATE</Text>
                <Text style={[styles.thCell, { flex: 1.2, color: colors.text.muted }]}>CHECK-IN</Text>
                <Text style={[styles.thCell, { flex: 1.2, color: colors.text.muted }]}>CHECK-OUT</Text>
                <Text style={[styles.thCell, { flex: 1.2, color: colors.text.muted }]}>DURATION</Text>
                <Text style={[styles.thCell, { flex: 1.2, color: colors.text.muted }]}>STATUS</Text>
                <Text style={[styles.thCell, { flex: 1.2, color: colors.text.muted }]}>METHOD</Text>
              </View>

              {filteredRecords.length > 0 ? (
                filteredRecords.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => setSelectedStudentForHistory(item)}
                    style={[styles.tableDataRow, { borderColor: colors.surface.border }]}>
                    <View style={{ flex: 2 }}>
                      <Text style={[styles.tdBold, { color: colors.text.primary }]}>{item.studentName}</Text>
                      <Text style={[styles.tdMuted, { color: colors.text.muted }]}>{item.studentId}</Text>
                    </View>

                    <View style={{ flex: 1.5 }}>
                      <Text style={[styles.tdRegular, { color: colors.text.primary }]}>{item.department}</Text>
                      <Text style={[styles.tdMuted, { color: '#B58A4A', fontWeight: '600' }]}>Desk {item.deskNo}</Text>
                    </View>

                    <Text style={[styles.tdRegular, { flex: 1.2, color: colors.text.secondary }]}>
                      {item.date}
                    </Text>

                    <Text style={[styles.tdRegular, { flex: 1.2, color: '#22C55E', fontWeight: '600' }]}>
                      {item.checkInTime}
                    </Text>

                    <Text style={[styles.tdRegular, { flex: 1.2, color: item.checkOutTime ? '#DC2626' : colors.text.muted, fontWeight: item.checkOutTime ? '600' : '400' }]}>
                      {item.checkOutTime || '--'}
                    </Text>

                    <Text style={[styles.tdRegular, { flex: 1.2, color: colors.text.secondary }]}>
                      {item.durationMinutes ? `${Math.floor(item.durationMinutes / 60)}h ${item.durationMinutes % 60}m` : 'In Progress'}
                    </Text>

                    <View style={{ flex: 1.2 }}>
                      <View
                        style={[
                          styles.badgePillSmall,
                          {
                            backgroundColor:
                              item.status === 'present'
                                ? isDark
                                  ? '#203A2D'
                                  : '#E8EEE5'
                                : item.status === 'late'
                                ? isDark
                                  ? '#3D2D1B'
                                  : '#FEF3C7'
                                : isDark
                                ? '#243038'
                                : '#EDF3F7',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.badgePillSmallText,
                            {
                              color:
                                item.status === 'present'
                                  ? '#245C48'
                                  : item.status === 'late'
                                  ? '#B45309'
                                  : '#475569',
                            },
                          ]}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flex: 1.2 }}>
                      <Text style={[styles.methodTagText, { color: colors.text.muted }]}>
                        {item.method === 'static_qr' ? '📌 Static QR' : '⚡ Dynamic QR'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={{ padding: 30, alignItems: 'center' }}>
                  <Text style={{ color: colors.text.muted }}>No attendance records matching your search filters.</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 4: ATTENDANCE ANALYTICS                                            */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <View style={styles.tabContentSection}>
          {/* Timeframe selector header */}
          <View style={[styles.sectionCardHeader, { marginBottom: 12 }]}>
            <View>
              <Text style={[styles.sectionCardTitle, { color: colors.text.primary }]}>
                Attendance Trends & Operational Visualizations
              </Text>
              <Text style={[styles.sectionCardDesc, { color: colors.text.muted }]}>
                Deep insights into visitor distribution, rush hours, and branch utilization.
              </Text>
            </View>

            <View style={styles.timeframeToggleRow}>
              {(['daily', 'weekly', 'monthly'] as const).map((view) => (
                <TouchableOpacity
                  key={view}
                  onPress={() => setAnalyticsView(view)}
                  style={[
                    styles.timeframeBtn,
                    analyticsView === view && { backgroundColor: isDark ? '#245C48' : '#287A5B' },
                  ]}>
                  <Text
                    style={[
                      styles.timeframeBtnText,
                      { color: analyticsView === view ? '#FFFFFF' : colors.text.secondary },
                    ]}>
                    {view.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Two-Column Analytics Layout */}
          <View style={styles.analyticsTwoCol}>
            {/* Peak Visiting Hours Bar Graph */}
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                  borderColor: colors.surface.border,
                },
              ]}>
              <Text style={[styles.chartCardTitle, { color: colors.text.primary }]}>
                Hourly Visitor Density (06:00 AM – 10:00 PM)
              </Text>
              <Text style={[styles.chartCardSubtitle, { color: colors.text.muted }]}>
                Peak occupancy occurs between 10:00 AM and 01:00 PM with over 100+ simultaneous readers.
              </Text>

              <View style={styles.hourlyBarContainer}>
                {analyticsData.hourlyVisits.map((item) => {
                  const maxCount = 110;
                  const barHeight = Math.max(8, (item.count / maxCount) * 110);
                  const isPeak = item.count >= 96;
                  return (
                    <View key={item.hour} style={styles.barCol}>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              height: barHeight,
                              backgroundColor: isPeak ? '#B58A4A' : isDark ? '#55B58D' : '#245C48',
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.text.muted }]}>{item.hour}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Department Breakdown */}
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                  borderColor: colors.surface.border,
                },
              ]}>
              <Text style={[styles.chartCardTitle, { color: colors.text.primary }]}>
                Department-Wise Attendance Share
              </Text>
              <Text style={[styles.chartCardSubtitle, { color: colors.text.muted }]}>
                Proportion of study hours clocked by student academic departments.
              </Text>

              <View style={styles.deptProgressList}>
                {analyticsData.departmentBreakdown.map((dept) => (
                  <View key={dept.name} style={styles.deptProgressItem}>
                    <View style={styles.deptLabelRow}>
                      <Text style={[styles.deptNameText, { color: colors.text.primary }]}>{dept.name}</Text>
                      <Text style={[styles.deptCountText, { color: colors.text.secondary }]}>
                        {dept.count} visits ({dept.percentage}%)
                      </Text>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: isDark ? '#2C3530' : '#EBE8DE' }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${dept.percentage}%`,
                            backgroundColor: isDark ? '#55B58D' : '#245C48',
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Frequent Visitors & Low Attendance Insights */}
          <View style={styles.analyticsTwoCol}>
            {/* Frequent Library Readers */}
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                  borderColor: colors.surface.border,
                },
              ]}>
              <Text style={[styles.chartCardTitle, { color: colors.text.primary }]}>
                Most Frequent Library Visitors (This Month)
              </Text>

              <View style={{ gap: 8, marginTop: 10 }}>
                {analyticsData.topVisitors.map((v, i) => (
                  <View key={v.student.id} style={[styles.topVisitorRow, { borderColor: colors.surface.border }]}>
                    <View style={styles.visitorRankBadge}>
                      <Text style={styles.visitorRankText}>#{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.visitorName, { color: colors.text.primary }]}>{v.student.name}</Text>
                      <Text style={[styles.visitorSub, { color: colors.text.muted }]}>
                        {v.student.id} · {v.student.department}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.visitorVisits, { color: isDark ? '#55B58D' : '#245C48' }]}>
                        {v.visits} Days Attended
                      </Text>
                      <Text style={[styles.visitorHours, { color: colors.text.muted }]}>
                        {v.totalHours} Study Hours
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Low Attendance Notice & Operational Recommendations */}
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                  borderColor: colors.surface.border,
                },
              ]}>
              <Text style={[styles.chartCardTitle, { color: colors.text.primary }]}>
                Low-Attendance Period Intelligence
              </Text>
              <Text style={[styles.chartCardSubtitle, { color: colors.text.muted }]}>
                Periods where seat vacancy is higher than 60%.
              </Text>

              <View style={[styles.insightAlertCard, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA', borderColor: '#B58A4A' }]}>
                <Clock size={18} color="#B58A4A" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.insightAlertTitle, { color: '#B58A4A' }]}>Identified Low Interval:</Text>
                  <Text style={[styles.insightAlertDesc, { color: colors.text.primary }]}>
                    {analyticsData.lowAttendancePeriods}
                  </Text>
                  <Text style={[styles.insightTipText, { color: colors.text.secondary }]}>
                    Tip: Offer Sunday Day-Pass discounts or schedule mock tests during this window to optimize facility usage.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 5: ATTENDANCE RULES & SETTINGS                                     */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <View style={styles.tabContentSection}>
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            <Text style={[styles.sectionCardTitle, { color: colors.text.primary }]}>
              Attendance Terminal Rules & Verification Policy
            </Text>
            <Text style={[styles.sectionCardDesc, { color: colors.text.muted }]}>
              Configure how repeated scans are processed, enforce shift windows, and select your preferred operational mode.
            </Text>

            {/* 1. Preferred QR Mode Selector */}
            <View style={styles.settingsFormGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Preferred Attendance Mode</Text>
              <View style={styles.policyChoicesRow}>
                {[
                  {
                    key: 'static',
                    title: 'Mode A: Static QR Code',
                    desc: 'Generate once, print standee, place at main entrance.',
                  },
                  {
                    key: 'dynamic',
                    title: 'Mode B: Dynamic QR Code',
                    desc: 'Auto-refreshing QR on tablet/screen for enhanced anti-spoof security.',
                  },
                ].map((modeChoice) => (
                  <TouchableOpacity
                    key={modeChoice.key}
                    onPress={() => handleSaveSettings({ preferredMode: modeChoice.key as AttendanceMode })}
                    style={[
                      styles.policyChoiceCard,
                      settings.preferredMode === modeChoice.key
                        ? { borderColor: isDark ? '#55B58D' : '#245C48', backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }
                        : { borderColor: colors.surface.border },
                    ]}>
                    <Text
                      style={[
                        styles.policyChoiceTitle,
                        {
                          color:
                            settings.preferredMode === modeChoice.key
                              ? isDark
                                ? '#55B58D'
                                : '#245C48'
                              : colors.text.primary,
                        },
                      ]}>
                      {modeChoice.title}
                    </Text>
                    <Text style={[styles.policyChoiceDesc, { color: colors.text.muted }]}>
                      {modeChoice.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 2. Three Attendance Policies */}
            <View style={styles.settingsFormGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Scan Processing Policy</Text>
              <View style={styles.policyChoicesRow}>
                {[
                  {
                    key: 'once_per_day',
                    title: 'Policy 1: Once Per Day',
                    desc: 'Only the first scan of the day counts. Additional scans on the same date are rejected.',
                  },
                  {
                    key: 'once_per_session',
                    title: 'Policy 2: Once Per Session',
                    desc: 'Allows multiple scans per day across different study shifts, but rejects duplicate punches in the same session.',
                  },
                  {
                    key: 'every_visit',
                    title: 'Policy 3: Every Visit (Check-In & Check-Out)',
                    desc: 'First scan marks entry; second scan marks exit. Computes exact time spent in the library.',
                  },
                ].map((pChoice) => (
                  <TouchableOpacity
                    key={pChoice.key}
                    onPress={() => handleSaveSettings({ policy: pChoice.key as AttendancePolicy })}
                    style={[
                      styles.policyChoiceCard,
                      settings.policy === pChoice.key
                        ? { borderColor: isDark ? '#55B58D' : '#245C48', backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }
                        : { borderColor: colors.surface.border },
                    ]}>
                    <Text
                      style={[
                        styles.policyChoiceTitle,
                        {
                          color:
                            settings.policy === pChoice.key
                              ? isDark
                                ? '#55B58D'
                                : '#245C48'
                              : colors.text.primary,
                        },
                      ]}>
                      {pChoice.title}
                    </Text>
                    <Text style={[styles.policyChoiceDesc, { color: colors.text.muted }]}>
                      {pChoice.desc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 3. Toggles: Entry/Exit, Shift enforcement, Wi-Fi */}
            <View style={styles.togglesList}>
              <View style={[styles.toggleRow, { borderColor: colors.surface.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>
                    Track Entry and Exit (Duration Calculation)
                  </Text>
                  <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                    When enabled, alternating scans toggle between check-in and check-out to calculate total study hours.
                  </Text>
                </View>
                <Switch
                  value={settings.trackEntryExit}
                  onValueChange={(val) => handleSaveSettings({ trackEntryExit: val })}
                  trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, { borderColor: colors.surface.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>
                    Enforce Shift Timing Strictness
                  </Text>
                  <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                    Flags students arriving more than {settings.lateThresholdMinutes} minutes after shift opening as "Late".
                  </Text>
                </View>
                <Switch
                  value={settings.enforceShiftTimings}
                  onValueChange={(val) => handleSaveSettings({ enforceShiftTimings: val })}
                  trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.toggleRow, { borderColor: colors.surface.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>
                    Library Wi-Fi Presence Verification
                  </Text>
                  <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                    Requires student device to be connected to "{settings.wifiSSID || 'Library-Wi-Fi'}" to accept scan.
                  </Text>
                </View>
                <Switch
                  value={settings.allowWifiVerification}
                  onValueChange={(val) => handleSaveSettings({ allowWifiVerification: val })}
                  trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 7. MODALS: GENERATE STATIC QR, PRINT PREVIEW, EXTEND VALIDITY             */}
      {/* ========================================================================= */}

      {/* Modal A: Generate Static QR */}
      <Modal visible={showGenerateStaticModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.dialogCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>Generate Static Entrance QR</Text>
              <TouchableOpacity onPress={() => setShowGenerateStaticModal(false)}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12, marginTop: 12 }}>
              <View>
                <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>QR Label / Description</Text>
                <TextInput
                  value={newQrLabel}
                  onChangeText={setNewQrLabel}
                  style={[styles.textInput, { color: colors.text.primary, borderColor: colors.surface.border }]}
                />
              </View>

              <View>
                <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Location / Placement Tag</Text>
                <TextInput
                  value={newQrLocation}
                  onChangeText={setNewQrLocation}
                  style={[styles.textInput, { color: colors.text.primary, borderColor: colors.surface.border }]}
                />
              </View>

              <View>
                <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Validity Period</Text>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  {['1', '7', '15', '30', '60'].map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setNewQrDays(d)}
                      style={[
                        styles.intervalChip,
                        newQrDays === d
                          ? { backgroundColor: '#245C48', borderColor: '#245C48' }
                          : { borderColor: colors.surface.border },
                      ]}>
                      <Text style={[styles.intervalChipText, { color: newQrDays === d ? '#FFFFFF' : colors.text.secondary }]}>
                        {d} Days
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.dialogActionsRow}>
              <TouchableOpacity
                onPress={() => setShowGenerateStaticModal(false)}
                style={[styles.secondaryOutlineBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.secondaryOutlineBtnText, { color: colors.text.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGenerateStaticQR}
                style={[styles.primaryBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                <Text style={styles.primaryBtnText}>Generate & Activate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal B: Extend Validity */}
      <Modal visible={showExtendModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.dialogCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>Extend QR Code Validity</Text>
              <TouchableOpacity onPress={() => setShowExtendModal(false)}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.text.muted, fontSize: 13, marginTop: 8 }}>
              Extending validity preserves the same physical QR code and token so you don't need to reprint posters.
            </Text>

            <View style={{ gap: 8, marginTop: 14 }}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Add Additional Days</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['7', '15', '30', '60'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setExtendDays(d)}
                    style={[
                      styles.intervalChip,
                      extendDays === d
                        ? { backgroundColor: '#245C48', borderColor: '#245C48' }
                        : { borderColor: colors.surface.border },
                    ]}>
                    <Text style={[styles.intervalChipText, { color: extendDays === d ? '#FFFFFF' : colors.text.secondary }]}>
                      +{d} Days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.dialogActionsRow}>
              <TouchableOpacity
                onPress={() => setShowExtendModal(false)}
                style={[styles.secondaryOutlineBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.secondaryOutlineBtnText, { color: colors.text.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleExtendValidity}
                style={[styles.primaryBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
                <Text style={styles.primaryBtnText}>Confirm Extension</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal C: Printable Standee Poster Preview */}
      <Modal visible={showPrintModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.printPosterCard, { backgroundColor: '#FFFFFF' }]}>
            <View style={styles.posterHeader}>
              <View style={styles.posterLogoBadge}>
                <Building2 size={24} color="#245C48" />
              </View>
              <Text style={styles.posterLibraryName}>{currentTenant.name}</Text>
              <Text style={styles.posterCampusName}>{currentTenant.campus} · Official Attendance Terminal</Text>
            </View>

            <View style={styles.posterQrBox}>
              <LibXQRCode
                value={activeStaticQR?.token || 'LIBX-STATIC-PRINT'}
                size={220}
                color="#1A3326"
                backgroundColor="#FFFFFF"
              />
              <Text style={styles.posterScanTitle}>SCAN TO MARK ATTENDANCE</Text>
              <Text style={styles.posterScanSubtitle}>
                Open the LibX Student Portal on your mobile phone and scan this code upon entry and exit.
              </Text>
            </View>

            <View style={styles.posterFooter}>
              <Text style={styles.posterFooterText}>
                Active Validity: {activeStaticQR?.createdAt} to {activeStaticQR?.validUntil} · {currentTenant.code}
              </Text>
              <Text style={styles.posterPoweredBy}>Powered by LibX SaaS Attendance Engine</Text>
            </View>

            <View style={styles.posterActionsRow}>
              <TouchableOpacity
                onPress={() => setShowPrintModal(false)}
                style={[styles.secondaryOutlineBtn, { borderColor: '#D1D5DB' }]}>
                <Text style={{ color: '#4B5563', fontWeight: '600' }}>Close Preview</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS === 'web') window.print();
                  else showToast('Printing poster...');
                }}
                style={[styles.primaryBtn, { backgroundColor: '#245C48' }]}>
                <Printer size={15} color="#FFFFFF" />
                <Text style={styles.primaryBtnText}>Print / Save as PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Kiosk Mode */}
      <Modal visible={isFullScreenKiosk} animationType="slide">
        <View style={[styles.kioskScreen, { backgroundColor: '#0F1A14' }]}>
          <View style={styles.kioskHeader}>
            <View>
              <Text style={styles.kioskTenantTitle}>{currentTenant.name}</Text>
              <Text style={styles.kioskTenantSubtitle}>Smart Entrance Kiosk · Dynamic QR Terminal</Text>
            </View>

            <TouchableOpacity
              onPress={() => setIsFullScreenKiosk(false)}
              style={styles.kioskCloseBtn}>
              <Minimize2 size={18} color="#FFFFFF" />
              <Text style={styles.kioskCloseBtnText}>Exit Kiosk</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.kioskCenterContent}>
            <View style={styles.kioskQrCard}>
              <LibXQRCode
                value={dynamicSession.currentToken}
                size={280}
                color="#0F1A14"
                backgroundColor="#FFFFFF"
              />

              <View style={styles.kioskCountdownPill}>
                <RefreshCw size={16} color="#245C48" />
                <Text style={styles.kioskCountdownText}>
                  Refreshes in <Text style={{ fontWeight: '800' }}>{timeLeftSeconds}s</Text>
                </Text>
              </View>

              <Text style={styles.kioskInstructionText}>
                Scan with your LibX Student Portal to record Entry / Exit
              </Text>
            </View>
          </View>

          <View style={styles.kioskFooter}>
            <Text style={styles.kioskFooterText}>
              Anti-Spoofing Active · Token #{dynamicSession.currentToken.slice(-6)} · LibX Security
            </Text>
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
  headerCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerTopRow: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 14,
  },
  headerTitleGroup: {
    gap: 4,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickerText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modeIndicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeIndicatorText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
  },
  headerActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  scannerLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  scannerLaunchBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  printActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  printActionBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  navTabsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: 14,
    overflow: 'scroll',
    flexWrap: 'wrap',
  },
  navTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navTabBtnActive: {
    borderBottomWidth: 2,
  },
  navTabBtnText: {
    fontSize: 13,
  },
  tabBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  tabPillBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tabPillBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  toastContainer: {
    position: 'absolute',
    top: 14,
    right: 20,
    zIndex: 9999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(0,0,0,0.18)' },
      default: { elevation: 6 },
    }),
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tabContentSection: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  statCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statValueCompact: {
    fontSize: 17,
    fontWeight: '800',
  },
  statHelper: {
    fontSize: 11.5,
  },
  livePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  terminalHeroCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  terminalHeroLeft: {
    flex: 1,
    minWidth: 260,
    gap: 8,
  },
  terminalBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  terminalTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  activeDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  terminalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  terminalDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  terminalActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  secondaryOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryOutlineBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  terminalHeroRight: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  terminalQrCaption: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCardDesc: {
    fontSize: 12.5,
    marginTop: 2,
  },
  activePillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  liveStudentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  liveStudentCard: {
    flex: 1,
    minWidth: 220,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  liveStudentTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  liveStudentName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  liveStudentSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  shiftTagSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  shiftTagSmallText: {
    fontSize: 10,
    fontWeight: '700',
  },
  liveStudentBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 8,
  },
  punchTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  punchTimeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  checkoutBtnText: {
    fontSize: 11,
    color: '#DC2626',
    fontWeight: '700',
  },
  qrModeSwitchRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  qrModeTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  qrModeTabBtnActive: {},
  qrModeTabTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  qrModeTabSubtitle: {
    fontSize: 11.5,
  },
  staticHeroLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'center',
  },
  staticQrBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  qrTokenText: {
    fontSize: 10.5,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
    letterSpacing: 0.4,
  },
  staticMetaCol: {
    flex: 1,
    minWidth: 260,
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  qrLocationText: {
    fontSize: 12,
  },
  staticQrLabelText: {
    fontSize: 18,
    fontWeight: '700',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  dateCol: {
    gap: 2,
    minWidth: 100,
  },
  dateColLabel: {
    fontSize: 11,
  },
  dateColValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  staticActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 6,
  },
  actionChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
  },
  actionChipBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tableWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  tdBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  tdRegular: {
    fontSize: 12.5,
  },
  tdMuted: {
    fontSize: 11.5,
  },
  badgePillSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  badgePillSmallText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tinyActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    borderWidth: 1,
  },
  dynamicSessionLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    alignItems: 'center',
  },
  dynamicQrCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  countdownPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8EEE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countdownPillText: {
    fontSize: 12,
    color: '#245C48',
  },
  tokenNonceText: {
    fontSize: 10.5,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  dynamicTelemetryCol: {
    flex: 1,
    minWidth: 260,
    gap: 14,
  },
  sessionStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingBottom: 8,
  },
  sessionStatusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.6,
  },
  sessionStatusValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  telemetryCard: {
    flex: 1,
    minWidth: 110,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  telemetryCardLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  telemetryCardVal: {
    fontSize: 14,
    fontWeight: '800',
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  controlBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  intervalConfigGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  intervalChipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  intervalChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  intervalChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordsToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flexWrap: 'wrap',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 220,
  },
  searchInput: {
    fontSize: 13,
    flex: 1,
    outlineStyle: 'none' as any,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  methodTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  analyticsTwoCol: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  chartCard: {
    flex: 1,
    minWidth: 300,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    gap: 8,
  },
  chartCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartCardSubtitle: {
    fontSize: 12,
  },
  timeframeToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 3,
  },
  timeframeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  timeframeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  hourlyBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 16,
  },
  barCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  barTrack: {
    height: 110,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: 14,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  deptProgressList: {
    gap: 12,
    marginTop: 8,
  },
  deptProgressItem: {
    gap: 4,
  },
  deptLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deptNameText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  deptCountText: {
    fontSize: 11.5,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  topVisitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  visitorRankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8EEE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitorRankText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#245C48',
  },
  visitorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  visitorSub: {
    fontSize: 11.5,
  },
  visitorVisits: {
    fontSize: 12,
    fontWeight: '700',
  },
  visitorHours: {
    fontSize: 11,
  },
  insightAlertCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginTop: 8,
  },
  insightAlertTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  insightAlertDesc: {
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 2,
  },
  insightTipText: {
    fontSize: 11.5,
    marginTop: 4,
    lineHeight: 16,
  },
  settingsFormGroup: {
    gap: 8,
  },
  policyChoicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  policyChoiceCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 14,
    gap: 6,
  },
  policyChoiceTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  policyChoiceDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  togglesList: {
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 14,
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 11.5,
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  dialogActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  printPosterCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    ...Platform.select({
      web: { boxShadow: '0 8px 30px rgba(0,0,0,0.2)' },
      default: { elevation: 10 },
    }),
  },
  posterHeader: {
    alignItems: 'center',
    gap: 4,
  },
  posterLogoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8EEE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  posterLibraryName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A3326',
    textAlign: 'center',
  },
  posterCampusName: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
  },
  posterQrBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    gap: 10,
  },
  posterScanTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A3326',
    letterSpacing: 0.6,
  },
  posterScanSubtitle: {
    fontSize: 11.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  posterFooter: {
    alignItems: 'center',
    gap: 2,
  },
  posterFooterText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  posterPoweredBy: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  posterActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'center',
    marginTop: 6,
  },
  kioskScreen: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  kioskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kioskTenantTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kioskTenantSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  kioskCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  kioskCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  kioskCenterContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  kioskQrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    maxWidth: 420,
  },
  kioskCountdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8EEE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  kioskCountdownText: {
    color: '#245C48',
    fontSize: 15,
    fontWeight: '600',
  },
  kioskInstructionText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  kioskFooter: {
    alignItems: 'center',
  },
  kioskFooterText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

