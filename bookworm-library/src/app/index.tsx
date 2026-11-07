import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  CalendarCheck,
  Armchair,
  Plus,
  Scan,
} from 'lucide-react-native';

import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopNavbar } from '@/components/dashboard/TopNavbar';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { SeatOverview } from '@/components/dashboard/SeatOverview';
import { StudyShiftsCard } from '@/components/dashboard/StudyShiftsCard';
import { FeeReminders } from '@/components/dashboard/FeeReminders';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { ImportantNotificationsCard } from '@/components/dashboard/ImportantNotificationsCard';
import { AddStudentModal } from '@/components/dashboard/AddStudentModal';
import { MarkAttendanceModal } from '@/components/dashboard/MarkAttendanceModal';
import { SeatManagementView } from '@/components/dashboard/SeatManagementView';
import { StudentManagementView } from '@/components/dashboard/StudentManagementView';
import { AttendanceManagementView } from '@/components/dashboard/AttendanceManagementView';
import { LibXExamSuiteView } from '@/components/dashboard/LibXExamSuiteView';
import { LibrarySettingsView } from '@/components/dashboard/LibrarySettingsView';
import { LibXModularSectionView } from '@/components/dashboard/LibXModularSectionView';
import { LoginSelectionView } from '@/components/auth/LoginSelectionView';
import { AdminLoginView } from '@/components/auth/AdminLoginView';
import { StudentLoginView } from '@/components/auth/StudentLoginView';
import { StudentPortalView } from '@/components/student/StudentPortalView';
import { LibraryTenant, DEFAULT_TENANT } from '@/constants/tenants';

type AuthScreen = 'selection' | 'admin-login' | 'student-login' | 'admin-dashboard' | 'student-dashboard';

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('selection');
  const [currentTenant, setCurrentTenant] = useState<LibraryTenant>(DEFAULT_TENANT);
  const [loggedInStudent, setLoggedInStudent] = useState({
    id: 'BW-2026-0014',
    name: 'Rohan Verma',
    desk: 'Desk D-01 (Exclusive)',
    shift: 'Morning Shift (06:00 AM - 02:00 PM)',
  });
  const [currentRoute, setCurrentRoute] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isMarkAttendanceOpen, setIsMarkAttendanceOpen] = useState(false);

  const { colors, isDark } = useThemeMode();

  // Responsive Breakpoints
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  // Format dynamic date matching reference: "OVERVIEW · WEDNESDAY, 4 NOV 2026"
  const formattedDate = new Date()
    .toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();

  if (authScreen === 'selection') {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.surface.canvas }]}
        edges={['top', 'left', 'right', 'bottom']}>
        <LoginSelectionView
          currentTenant={currentTenant}
          onTenantChange={(t) => setCurrentTenant(t)}
          onSelectAdmin={(t) => {
            setCurrentTenant(t);
            setAuthScreen('admin-login');
          }}
          onSelectStudent={(t) => {
            setCurrentTenant(t);
            setAuthScreen('student-login');
          }}
        />
      </SafeAreaView>
    );
  }

  if (authScreen === 'admin-login') {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.surface.canvas }]}
        edges={['top', 'left', 'right', 'bottom']}>
        <AdminLoginView
          tenant={currentTenant}
          onBackToOptions={() => setAuthScreen('selection')}
          onLoginSuccess={() => setAuthScreen('admin-dashboard')}
        />
      </SafeAreaView>
    );
  }

  if (authScreen === 'student-login') {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.surface.canvas }]}
        edges={['top', 'left', 'right', 'bottom']}>
        <StudentLoginView
          tenant={currentTenant}
          onBackToOptions={() => setAuthScreen('selection')}
          onLoginSuccess={(data) => {
            if (data) setLoggedInStudent(data);
            setAuthScreen('student-dashboard');
          }}
        />
      </SafeAreaView>
    );
  }

  if (authScreen === 'student-dashboard') {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.surface.canvas }]}
        edges={['top', 'left', 'right', 'bottom']}>
        <StudentPortalView
          studentData={loggedInStudent}
          currentTenant={currentTenant}
          onLogout={() => setAuthScreen('selection')}
          onOpenExamSuite={() => {
            setAuthScreen('admin-dashboard');
            setCurrentRoute('exam-suite');
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.surface.canvas }]}
      edges={['top', 'left', 'right']}>
      <View style={[styles.appContainer, { backgroundColor: colors.surface.canvas, flexDirection: isDesktop ? 'row' : 'column' }]}>
        {/* Sidebar: Persistent on Desktop, Modal Drawer on Mobile/Tablet */}
        {isDesktop ? (
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={(route) => setCurrentRoute(route)}
            onLogout={() => setAuthScreen('selection')}
          />
        ) : (
          <Sidebar
            currentRoute={currentRoute}
            onNavigate={(route) => {
              setCurrentRoute(route);
              setIsMobileMenuOpen(false);
            }}
            isMobileOpen={isMobileMenuOpen}
            onMobileClose={() => setIsMobileMenuOpen(false)}
            onLogout={() => setAuthScreen('selection')}
          />
        )}

        {/* Main Content Area */}
        <View style={[styles.mainContentArea, { backgroundColor: colors.surface.canvas }]}>
          {/* Top Navigation Bar with Search & Theme Toggle */}
          <TopNavbar
            currentRoute={currentRoute}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onNotificationPress={() => {}}
            onLogout={() => setAuthScreen('selection')}
          />

          {/* Scrollable Dashboard Viewport */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContainer,
              isMobile && styles.scrollContainerMobile,
            ]}>
            {currentRoute === 'seats' ? (
              <SeatManagementView onBackToDashboard={() => setCurrentRoute('overview')} />
            ) : currentRoute === 'students' ? (
              <StudentManagementView
                onBackToDashboard={() => setCurrentRoute('overview')}
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
              />
            ) : currentRoute === 'attendance' ? (
              <AttendanceManagementView
                currentTenant={currentTenant}
                onBackToDashboard={() => setCurrentRoute('overview')}
                onOpenStudentScanner={() => {
                  setAuthScreen('student-dashboard');
                }}
              />
            ) : currentRoute === 'exam-suite' ? (
              <LibXExamSuiteView onBackToDashboard={() => setCurrentRoute('overview')} />
            ) : currentRoute === 'settings' ? (
              <LibrarySettingsView
                currentTenant={currentTenant}
                onTenantChange={(t) => setCurrentTenant(t)}
                onBackToDashboard={() => setCurrentRoute('overview')}
                onNavigateToSeats={() => setCurrentRoute('seats')}
              />
            ) : currentRoute !== 'overview' ? (
              <LibXModularSectionView
                route={currentRoute}
                onBackToDashboard={() => setCurrentRoute('overview')}
                onOpenAddStudent={() => setIsAddStudentOpen(true)}
                onOpenMarkAttendance={() => setIsMarkAttendanceOpen(true)}
              />
            ) : (
              <>
                {/* ========================================================================= */}
                {/* 1. WELCOME SECTION                                                        */}
                {/* ========================================================================= */}
                <View style={styles.welcomeSection}>
                  <View style={styles.welcomeTextGroup}>
                    {/* Small uppercase kicker */}
                    <Text style={[styles.dateKicker, { color: colors.text.muted }]}>
                      OVERVIEW · {formattedDate}
                    </Text>

                    {/* Large Serif Welcome Heading */}
                    <Text
                      style={[
                        styles.welcomeHeading,
                        {
                          color: colors.text.primary,
                          fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                          fontSize: isMobile ? 26 : 34,
                        },
                      ]}>
                      Good morning, Rajesh.
                    </Text>

                    {/* Clean Subtitle */}
                    <Text style={[styles.welcomeSubtitle, { color: colors.text.muted, fontSize: isMobile ? 12.5 : 13.5 }]}>
                      A clear view of your library. More room to focus.
                    </Text>
                  </View>

                  {/* Two Action Buttons (Outline/Secondary + Solid Emerald/Primary) */}
                  <View style={[styles.actionButtonGroup, isMobile && styles.actionButtonGroupMobile]}>
                    {/* Secondary button: Mark Attendance */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsMarkAttendanceOpen(true)}
                      style={[
                        styles.outlineActionBtn,
                        isMobile && styles.actionBtnMobile,
                        {
                          backgroundColor: isDark ? colors.surface.cardAlt : colors.surface.card,
                          borderColor: colors.surface.border,
                        },
                      ]}>
                      <Scan size={16} color={isDark ? colors.brand.primary : colors.text.primary} strokeWidth={2} />
                      <Text style={[styles.outlineActionBtnText, { color: colors.text.primary }]}>
                        Mark attendance
                      </Text>
                    </TouchableOpacity>

                    {/* Solid Primary button: Add Student */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setIsAddStudentOpen(true)}
                      style={[
                        styles.primaryActionBtn,
                        isMobile && styles.actionBtnMobile,
                        { backgroundColor: isDark ? '#245C48' : colors.brand.primary },
                      ]}>
                      <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
                      <Text style={styles.primaryActionBtnText}>Add student</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ========================================================================= */}
                {/* 2. THREE KEY OVERVIEW STATISTICS CARDS                                    */}
                {/* ========================================================================= */}
                <View
                  style={[
                    styles.statsGrid,
                    isDesktop && styles.statsGridDesktop,
                    isTablet && styles.statsGridTablet,
                    isMobile && styles.statsGridMobile,
                  ]}>
                  {/* Card 1: Active students */}
                  <View style={[styles.statCardWrapper, isMobile && styles.statCardWrapperMobile]}>
                    <StatCard
                      label="Active students"
                      value="248"
                      subtitle="+12 enrolled this month"
                      icon={Users}
                    />
                  </View>

                  {/* Card 2: Attendance today */}
                  <View style={[styles.statCardWrapper, isMobile && styles.statCardWrapperMobile]}>
                    <StatCard
                      label="Attendance today"
                      value="186"
                      subtitle="142 in · 44 checked out"
                      icon={CalendarCheck}
                    />
                  </View>

                  {/* Card 3: Seats available */}
                  <View style={[styles.statCardWrapper, isMobile && styles.statCardWrapperMobile]}>
                    <StatCard
                      label="Seats available"
                      value="32"
                      subtitle="of 180 seats · 6 reserved"
                      icon={Armchair}
                    />
                  </View>
                </View>

                {/* ========================================================================= */}
                {/* 3. TWO-COLUMN ANALYTICS (Daily Attendance & Seat Availability)            */}
                {/* ========================================================================= */}
                <View
                  style={[
                    styles.splitGrid,
                    !isDesktop && styles.splitGridStacked,
                  ]}>
                  {/* Left: Daily Attendance */}
                  <View style={styles.splitGridCol}>
                    <AttendanceChart onViewReport={() => setCurrentRoute('attendance')} />
                  </View>

                  {/* Right: Seat Availability */}
                  <View style={styles.splitGridCol}>
                    <SeatOverview onManageSeats={() => setCurrentRoute('seats')} />
                  </View>
                </View>

                {/* ========================================================================= */}
                {/* 4. TODAY'S SHIFTS & PENDING FEE REMINDERS                                 */}
                {/* ========================================================================= */}
                <View
                  style={[
                    styles.splitGrid,
                    !isDesktop && styles.splitGridStacked,
                  ]}>
                  <View style={styles.splitGridCol}>
                    <StudyShiftsCard />
                  </View>

                  <View style={styles.splitGridCol}>
                    <FeeReminders onViewAll={() => setCurrentRoute('fees')} />
                  </View>
                </View>

                {/* ========================================================================= */}
                {/* 5. RECENT ACTIVITY FEED & IMPORTANT NOTICES                               */}
                {/* ========================================================================= */}
                <View
                  style={[
                    styles.splitGrid,
                    !isDesktop && styles.splitGridStacked,
                  ]}>
                  <View style={styles.splitGridCol}>
                    <RecentActivity />
                  </View>

                  <View style={styles.splitGridCol}>
                    <ImportantNotificationsCard />
                  </View>
                </View>
              </>
            )}

            {/* Bottom Footer Information */}
            <View style={styles.footerNote}>
              <Text style={[styles.footerNoteText, { color: colors.text.muted }]}>
                Bookworm Library Management System • Civil Lines Campus
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Interactive Add Student Modal */}
      <AddStudentModal
        visible={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      {/* Interactive Mark Attendance Modal */}
      <MarkAttendanceModal
        visible={isMarkAttendanceOpen}
        onClose={() => setIsMarkAttendanceOpen(false)}
        onOpenFullAttendanceHub={() => setCurrentRoute('attendance')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appContainer: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  mainContentArea: {
    flex: 1,
    flexDirection: 'column',
  },
  scrollContainer: {
    padding: 28,
    paddingBottom: 56,
    gap: 22,
    maxWidth: 1600,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContainerMobile: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // 1. Welcome Section
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 4,
  },
  welcomeTextGroup: {
    gap: 4,
  },
  dateKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  welcomeHeading: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  welcomeSubtitle: {
    fontSize: 13.5,
    fontWeight: '400',
    marginTop: 2,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  actionButtonGroupMobile: {
    width: '100%',
    alignSelf: 'stretch',
  },
  actionBtnMobile: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  outlineActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  outlineActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // 2. Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    width: '100%',
  },
  statsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 18,
  },
  statsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 14,
  },
  statsGridMobile: {
    flexDirection: 'column',
    gap: 12,
  },
  statCardWrapper: {
    flex: 1,
    minWidth: 0,
  },
  statCardWrapperMobile: {
    width: '100%',
    flex: undefined,
    minWidth: 0,
  },

  // 3. Two-Column Split Grids
  splitGrid: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'stretch',
  },
  splitGridStacked: {
    flexDirection: 'column',
  },
  splitGridCol: {
    flex: 1,
  },

  // Footer Note
  footerNote: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  footerNoteText: {
    fontSize: 11.5,
    fontWeight: '400',
  },
});
