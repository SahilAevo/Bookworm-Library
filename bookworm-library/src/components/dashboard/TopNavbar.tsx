import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import {
  Search,
  Bell,
  Menu,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

interface TopNavbarProps {
  currentRoute?: string;
  onOpenMobileMenu?: () => void;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onNotificationPress?: () => void;
  onLogout?: () => void;
}

export function TopNavbar({
  currentRoute = 'overview',
  onOpenMobileMenu,
  searchQuery = '',
  onSearchChange,
  onNotificationPress,
  onLogout,
}: TopNavbarProps) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  const { colors, isDark, toggleTheme } = useThemeMode();

  const routeTitles: Record<string, string> = {
    overview: 'Overview',
    students: 'Students',
    attendance: 'Attendance',
    seats: 'Seat Management',
    fees: 'Fees & Payments',
    notices: 'Notices',
    reports: 'Reports',
    'exam-suite': 'LibX Exam Suite',
    settings: 'Settings',
    help: 'Help & Support',
  };
  const activeTitle = routeTitles[currentRoute] || 'Overview';

  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: colors.surface.topNav,
          borderBottomColor: colors.surface.border,
          paddingHorizontal: isMobile ? 12 : 24,
          height: isMobile ? 54 : 58,
        },
      ]}>
      {/* Left: Mobile hamburger (on mobile) & Multi-Tenant Breadcrumb */}
      <View style={styles.leftSection}>
        {!isDesktop && (
          <TouchableOpacity
            onPress={onOpenMobileMenu}
            style={[styles.menuButton, { backgroundColor: colors.surface.cardAlt }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Open navigation menu">
            <Menu size={18} color={colors.text.primary} strokeWidth={2.2} />
          </TouchableOpacity>
        )}

        {/* Multi-tenant breadcrumb: LibX / Bookworm Library / Active Title */}
        <View style={styles.breadcrumbRow}>
          {!isMobile && (
            <>
              <Text style={[styles.breadcrumbMuted, { color: colors.brand.primary, fontWeight: '700' }]}>
                LibX
              </Text>
              <Text style={[styles.breadcrumbDivider, { color: colors.text.faint }]}>
                /
              </Text>
              <Text style={[styles.breadcrumbMuted, { color: colors.text.muted }]}>
                Bookworm Library
              </Text>
              <Text style={[styles.breadcrumbDivider, { color: colors.text.faint }]}>
                /
              </Text>
            </>
          )}
          <Text
            style={[
              styles.breadcrumbActive,
              { color: colors.text.primary, fontSize: isMobile ? 13.5 : 13 },
            ]}
            numberOfLines={1}>
            {activeTitle}
          </Text>
        </View>
      </View>

      {/* Right: Global Search, Theme Toggle & Notifications */}
      <View style={styles.rightSection}>
        {/* Claymorphic Inset Search Bar */}
        <View
          style={[
            styles.searchWrapper,
            {
              backgroundColor: colors.surface.inset,
              borderColor: colors.surface.border,
            },
            isMobile && styles.searchWrapperMobile,
          ]}>
          <Search size={14} color={colors.text.muted} strokeWidth={2} />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder={isMobile ? 'Search...' : 'Search students, seats, exams...'}
            placeholderTextColor={colors.text.faint}
            style={[styles.searchInput, { color: colors.text.primary }]}
          />
          {!isMobile && (
            <View style={[styles.shortcutBadge, { backgroundColor: colors.surface.card, borderColor: colors.surface.border }]}>
              <Text style={[styles.shortcutText, { color: colors.text.muted }]}>⌘ K</Text>
            </View>
          )}
        </View>

        {/* ========================================================================= */}
        {/* SINGLE THEME TOGGLE BUTTON: DYNAMIC LIGHT / DARK MODE TOGGLE              */}
        {/* ========================================================================= */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={[
            styles.themeToggleBtn,
            isMobile && styles.themeToggleBtnMobile,
            {
              backgroundColor: colors.surface.cardAlt,
              borderColor: colors.surface.border,
            },
          ]}
          accessibilityLabel={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          {isDark ? (
            <>
              <Sun size={15} color={colors.brand.primary} strokeWidth={2.2} />
              {!isMobile && (
                <Text style={[styles.themeToggleText, { color: colors.text.primary }]}>
                  Light
                </Text>
              )}
            </>
          ) : (
            <>
              <Moon size={15} color={colors.text.secondary} strokeWidth={2.2} />
              {!isMobile && (
                <Text style={[styles.themeToggleText, { color: colors.text.primary }]}>
                  Dark
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>

        {/* Clean Notification Bell Icon with subtle dot */}
        <TouchableOpacity
          onPress={onNotificationPress}
          style={[styles.iconButton, isMobile && styles.iconButtonMobile, { borderColor: 'transparent' }]}
          activeOpacity={0.7}
          accessibilityLabel="Notifications">
          <Bell size={17} color={colors.text.secondary} strokeWidth={1.9} />
          <View style={[styles.notificationDot, { backgroundColor: colors.brand.primary }]} />
        </TouchableOpacity>

        {/* Optional Switch Portal / Sign Out button */}
        {onLogout && (
          <TouchableOpacity
            onPress={onLogout}
            style={[styles.iconButton, isMobile && styles.iconButtonMobile, { borderColor: 'transparent' }]}
            activeOpacity={0.7}
            accessibilityLabel="Switch Portal / Sign Out">
            <LogOut size={16} color={colors.text.muted} strokeWidth={1.9} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 58,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbMuted: {
    fontSize: 13,
    fontWeight: '400',
  },
  breadcrumbDivider: {
    fontSize: 13,
  },
  breadcrumbActive: {
    fontSize: 13,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 38,
    width: 260,
    borderWidth: 1,
    gap: 8,
  },
  searchWrapperMobile: {
    width: 105,
    height: 34,
    paddingHorizontal: 8,
    gap: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  shortcutBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  shortcutText: {
    fontSize: 10,
    fontWeight: '600',
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeToggleBtnMobile: {
    width: 34,
    height: 34,
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconButtonMobile: {
    width: 34,
    height: 34,
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
