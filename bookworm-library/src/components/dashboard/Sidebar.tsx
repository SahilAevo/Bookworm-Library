import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Modal,
  useWindowDimensions,
} from 'react-native';
import {
  LayoutGrid,
  Users,
  CalendarCheck,
  Armchair,
  Receipt,
  Megaphone,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  BookOpen,
  PanelLeftClose,
  X,
  Award,
  Layers,
} from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

interface SidebarProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onLogout?: () => void;
}

export const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'seats', label: 'Seat Management', icon: Armchair },
  { id: 'fees', label: 'Fees & Payments', icon: Receipt },
  { id: 'notices', label: 'Notices', icon: Megaphone },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'exam-suite', label: 'LibX Exam Suite', icon: Award, badge: 'PRO' },
];

export const bottomNavItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];

export function SidebarContent({
  currentRoute = 'overview',
  onNavigate,
  onClose,
  onLogout,
}: {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
  onClose?: () => void;
  onLogout?: () => void;
}) {
  const { colors, isDark } = useThemeMode();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface.sidebar }]}>
      {/* 1. Multi-Tenant Brand Header: LibX Parent Platform + Bookworm Library */}
      <View style={styles.brandHeader}>
        <View style={styles.brandLogoRow}>
          <View
            style={[
              styles.logoBadge,
              {
                backgroundColor: isDark ? '#245C48' : colors.brand.primary,
                borderColor: colors.surface.border,
              },
            ]}>
            <BookOpen size={18} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <View style={styles.brandTitleCol}>
            <View style={styles.platformBadgeRow}>
              <Text
                style={[
                  styles.platformBadgeText,
                  { color: isDark ? colors.brand.primary : colors.brand.primary },
                ]}>
                LIBX SAAS PLATFORM
              </Text>
            </View>
            <Text
              style={[
                styles.brandTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Bookworm Library
            </Text>
            <Text style={[styles.brandSubtitle, { color: colors.text.muted }]}>
              Civil Lines Campus · Multi-tenant
            </Text>
          </View>
        </View>

        {onClose && (
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.closeBtn, { backgroundColor: isDark ? colors.surface.cardAlt : colors.surface.inset }]}>
            <X size={17} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Workspace Category Header with Collapse Icon */}
      <View style={styles.workspaceHeaderRow}>
        <Text style={[styles.workspaceHeaderText, { color: colors.text.muted }]}>
          WORKSPACE
        </Text>
        <TouchableOpacity style={styles.collapseIconBtn} activeOpacity={0.7}>
          <PanelLeftClose size={15} color={colors.text.muted} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {/* 3. Navigation Links List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navScrollList}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.id;
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => {
                onNavigate?.(item.id);
                if (onClose) onClose();
              }}
              style={[
                styles.navItem,
                isActive && [
                  styles.navItemActive,
                  {
                    backgroundColor: colors.surface.activeNav,
                    borderColor: isDark ? colors.surface.border : 'rgba(221, 217, 206, 0.7)',
                  },
                ],
              ]}>
              {/* Active indicator bar on the left */}
              {isActive && (
                <View
                  style={[
                    styles.activeIndicatorBar,
                    { backgroundColor: isDark ? colors.brand.primary : colors.brand.primary },
                  ]}
                />
              )}

              <View style={styles.navItemContent}>
                <Icon
                  size={18}
                  color={isActive ? (isDark ? colors.brand.primary : colors.brand.primary) : colors.text.muted}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                <Text
                  style={[
                    styles.navItemLabel,
                    {
                      color: isActive
                        ? (isDark ? colors.brand.primary : colors.brand.primary)
                        : (isDark ? colors.text.secondary : colors.text.secondary),
                    },
                    isActive && { fontWeight: '700' },
                  ]}>
                  {item.label}
                </Text>
              </View>

              {item.badge && (
                <View
                  style={[
                    styles.proBadge,
                    {
                      backgroundColor: isDark ? 'rgba(196, 160, 82, 0.16)' : '#F7F2E6',
                      borderColor: isDark ? '#C4A052' : colors.brand.gold,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.proBadgeText,
                      { color: isDark ? '#E5C984' : colors.brand.gold },
                    ]}>
                    {item.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={[styles.menuDivider, { backgroundColor: colors.surface.border }]} />

        {bottomNavItems.map((item) => {
          const isActive = currentRoute === item.id;
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.75}
              onPress={() => {
                onNavigate?.(item.id);
                if (onClose) onClose();
              }}
              style={[
                styles.navItem,
                isActive && [
                  styles.navItemActive,
                  {
                    backgroundColor: colors.surface.activeNav,
                    borderColor: isDark ? colors.surface.border : 'rgba(221, 217, 206, 0.7)',
                  },
                ],
              ]}>
              {isActive && (
                <View
                  style={[
                    styles.activeIndicatorBar,
                    { backgroundColor: isDark ? colors.brand.primary : colors.brand.primary },
                  ]}
                />
              )}

              <View style={styles.navItemContent}>
                <Icon
                  size={18}
                  color={isActive ? (isDark ? colors.brand.primary : colors.brand.primary) : colors.text.muted}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
                <Text
                  style={[
                    styles.navItemLabel,
                    {
                      color: isActive
                        ? (isDark ? colors.brand.primary : colors.brand.primary)
                        : (isDark ? colors.text.secondary : colors.text.secondary),
                    },
                    isActive && { fontWeight: '700' },
                  ]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 4. Multi-Tenant Admin Profile Footer */}
      <View style={[styles.profileFooter, { borderTopColor: colors.surface.border }]}>
        <View style={styles.profileRow}>
          <View
            style={[
              styles.avatarContainer,
              {
                backgroundColor: isDark ? '#245C48' : colors.brand.primary,
                borderColor: isDark ? colors.surface.border : 'rgba(221, 217, 206, 0.5)',
                borderWidth: 1,
              },
            ]}>
            <Text style={styles.avatarText}>RS</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text.primary }]} numberOfLines={1}>
              Rajesh Sharma
            </Text>
            <Text style={[styles.profileRole, { color: colors.text.muted }]} numberOfLines={1}>
              Bookworm Library Admin
            </Text>
          </View>
          <TouchableOpacity
            onPress={onLogout}
            style={styles.logoutBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Log out">
            <LogOut size={16} color={colors.text.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function Sidebar({
  currentRoute = 'overview',
  onNavigate,
  isMobileOpen = false,
  onMobileClose,
  onLogout,
}: SidebarProps) {
  const { colors } = useThemeMode();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // On Mobile / Tablet, the sidebar is NEVER persistent in flex layout.
  // It only renders as a mobile drawer overlay when isMobileOpen is true.
  if (!isDesktop) {
    if (!isMobileOpen) {
      return null;
    }

    return (
      <Modal
        visible={isMobileOpen}
        animationType="fade"
        transparent
        onRequestClose={onMobileClose}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={onMobileClose}
          />
          <View
            style={[
              styles.mobileDrawerWrapper,
              { backgroundColor: colors.surface.sidebar },
            ]}>
            <SidebarContent
              currentRoute={currentRoute}
              onNavigate={(route) => {
                onNavigate?.(route);
                onMobileClose?.();
              }}
              onClose={onMobileClose}
              onLogout={onLogout}
            />
          </View>
        </View>
      </Modal>
    );
  }

  // Desktop persistent sidebar
  return (
    <View
      style={[
        styles.desktopContainer,
        {
          backgroundColor: colors.surface.sidebar,
          borderRightColor: colors.surface.border,
        },
      ]}>
      <SidebarContent
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    width: 250,
    borderRightWidth: 1,
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flexDirection: 'row',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  mobileDrawerWrapper: {
    width: 280,
    maxWidth: '85%',
    height: '100%',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
  },
  brandLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleCol: {
    gap: 1,
  },
  platformBadgeRow: {
    marginBottom: 1,
  },
  platformBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  workspaceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 4,
  },
  workspaceHeaderText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  collapseIconBtn: {
    padding: 4,
  },
  navScrollList: {
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9.5,
    paddingHorizontal: 12,
    borderRadius: 9,
    position: 'relative',
    overflow: 'hidden',
  },
  navItemActive: {
    borderWidth: 1,
    shadowColor: '#2B261E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  proBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 6,
    bottom: 6,
    width: 3.5,
    borderRadius: 2,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 4,
  },
  navItemLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 8,
  },
  sidebarThemeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    marginHorizontal: 4,
  },
  sidebarThemeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarThemeLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  modeIndicatorChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeIndicatorChipText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  profileFooter: {
    padding: 16,
    borderTopWidth: 1,
    backgroundColor: 'transparent',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
  },
  profileRole: {
    fontSize: 11,
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 6,
  },
});
