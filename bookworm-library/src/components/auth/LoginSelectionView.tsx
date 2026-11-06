import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import {
  BookOpen,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Sun,
  Moon,
  Building2,
  CheckCircle2,
  Sparkles,
  Lock,
  Layers,
  Users,
  Award,
  KeyRound,
  Compass,
  Repeat,
  HelpCircle,
  Phone,
  Mail,
  X,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { ClaymorphicShadows, ClaymorphicShadowsDark } from '@/constants/dashboard-theme';
import { LibraryTenant, LIBRARY_TENANTS, DEFAULT_TENANT } from '@/constants/tenants';

interface LoginSelectionViewProps {
  currentTenant?: LibraryTenant;
  onTenantChange?: (tenant: LibraryTenant) => void;
  onSelectAdmin: (tenant: LibraryTenant) => void;
  onSelectStudent: (tenant: LibraryTenant) => void;
}

export function LoginSelectionView({
  currentTenant = DEFAULT_TENANT,
  onTenantChange,
  onSelectAdmin,
  onSelectStudent,
}: LoginSelectionViewProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark, toggleTheme } = useThemeMode();
  const shadows = isDark ? ClaymorphicShadowsDark : ClaymorphicShadows;

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const [activeTenant, setActiveTenant] = useState<LibraryTenant>(currentTenant);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Hover states for web interactivity
  const [hoveredCard, setHoveredCard] = useState<'admin' | 'student' | null>(null);

  const handleSelectTenant = (tenant: LibraryTenant) => {
    setActiveTenant(tenant);
    onTenantChange?.(tenant);
    setIsSwitchModalOpen(false);
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
      {/* 1. TOP ACCESS BAR WITH BRAND, POWERED BY & THEME TOGGLE                   */}
      {/* ========================================================================= */}
      <View style={styles.topBar}>
        <View style={styles.platformBadge}>
          <View style={[styles.platformDot, { backgroundColor: colors.brand.primary }]} />
          <Text style={[styles.platformBadgeText, { color: colors.text.secondary }]}>
            LIBX PLATFORM
          </Text>
          <View style={[styles.poweredDivider, { backgroundColor: colors.surface.border }]} />
          <Text style={[styles.poweredByText, { color: colors.text.muted }]}>
            Multi-Tenant SaaS
          </Text>
        </View>

        {/* Single Theme Toggle Button */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={[
            styles.themeToggleBtn,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.sm,
            },
          ]}
          accessibilityLabel="Toggle Theme">
          {isDark ? (
            <>
              <Sun size={15} color={colors.brand.primary} strokeWidth={2.2} />
              <Text style={[styles.themeToggleText, { color: colors.text.primary }]}>Light</Text>
            </>
          ) : (
            <>
              <Moon size={15} color={colors.text.secondary} strokeWidth={2.2} />
              <Text style={[styles.themeToggleText, { color: colors.text.primary }]}>Dark</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* 2. DYNAMIC LIBRARY IDENTITY CARD & HERO BRANDING                          */}
      {/* ========================================================================= */}
      <View style={styles.heroSection}>
        {/* Active Library Tenant Card */}
        <View
          style={[
            styles.tenantIdentityCard,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.card,
            },
          ]}>
          <View style={[styles.tenantIconBox, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
            <BookOpen size={24} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.4} />
          </View>

          <View style={styles.tenantInfoCol}>
            <View style={styles.tenantTitleRow}>
              <Text
                style={[
                  styles.tenantBrandLibX,
                  {
                    color: colors.text.primary,
                    fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                  },
                ]}>
                {activeTenant.name}
              </Text>
              <View
                style={[
                  styles.tenantPill,
                  {
                    backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA',
                    borderColor: '#B58A4A',
                  },
                ]}>
                <Text style={styles.tenantPillText}>{activeTenant.code}</Text>
              </View>
            </View>
            <Text style={[styles.tenantCampusText, { color: colors.text.muted }]}>
              {activeTenant.campus} · {activeTenant.city}
            </Text>
          </View>

          {/* Switch Library Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsSwitchModalOpen(true)}
            style={[
              styles.switchLibraryBtn,
              {
                backgroundColor: colors.surface.inset,
                borderColor: colors.surface.border,
              },
            ]}>
            <Repeat size={13} color={colors.brand.primary} />
            <Text style={[styles.switchLibraryBtnText, { color: colors.brand.primary }]}>
              Switch Library
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subtle Supporting Line */}
        <View style={[styles.supportingPill, { backgroundColor: isDark ? '#1C261F' : '#E8EEE5' }]}>
          <Sparkles size={13} color={isDark ? '#55B58D' : '#245C48'} />
          <Text style={[styles.supportingPillText, { color: isDark ? '#55B58D' : '#245C48' }]}>
            One library. Two dedicated experiences.
          </Text>
        </View>

        {/* Main Heading */}
        <Text
          style={[
            styles.heroHeading,
            {
              color: colors.text.primary,
              fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              fontSize: isMobile ? 30 : 40,
            },
          ]}>
          Welcome to LibX Portal
        </Text>

        {/* Subtitle */}
        <Text style={[styles.heroSubtitle, { color: colors.text.secondary }]}>
          Choose your portal to access your library workspace.
        </Text>
      </View>

      {/* ========================================================================= */}
      {/* 3. TWO-WAY LOGIN SELECTION CARDS (BALANCED GRID)                           */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.selectionGrid,
          !isDesktop && !isTablet && styles.selectionGridMobile,
        ]}>
        {/* ===================================================================== */}
        {/* OPTION 1: ADMIN & STAFF CARD                                          */}
        {/* ===================================================================== */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => onSelectAdmin(activeTenant)}
          {...({
            onMouseEnter: () => setHoveredCard('admin'),
            onMouseLeave: () => setHoveredCard(null),
          } as any)}
          style={[
            styles.selectionCard,
            {
              backgroundColor: colors.surface.card,
              borderColor:
                hoveredCard === 'admin'
                  ? colors.brand.primary
                  : colors.surface.border,
              transform: hoveredCard === 'admin' ? [{ translateY: -3 }] : [{ translateY: 0 }],
              ...shadows.card,
            },
          ]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
              <ShieldCheck size={26} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.2} />
            </View>
            <View style={[styles.roleTag, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
              <Text style={[styles.roleTagText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                ADMIN & STAFF
              </Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Admin & Staff Login
            </Text>
            <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
              Manage your library operations, members, staff and services.
            </Text>

            {/* Features (Dynamically reflecting tenant entitlements) */}
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color="#55B58D" strokeWidth={2.2} />
                <Text style={[styles.featureText, { color: colors.text.primary }]}>
                  Library and desk management
                </Text>
              </View>

              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color="#55B58D" strokeWidth={2.2} />
                <Text style={[styles.featureText, { color: colors.text.primary }]}>
                  Staff management and attendance
                </Text>
              </View>

              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color="#55B58D" strokeWidth={2.2} />
                <Text style={[styles.featureText, { color: colors.text.primary }]}>
                  Fee collection and membership tracking
                </Text>
              </View>

              {activeTenant.features.examSuite ? (
                <View style={styles.featureItem}>
                  <CheckCircle2 size={16} color="#55B58D" strokeWidth={2.2} />
                  <View style={styles.featureWithBadge}>
                    <Text style={[styles.featureText, { color: colors.text.primary }]}>
                      LibX Exam Suite administration
                    </Text>
                    <View style={[styles.planBadge, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                      <Text style={[styles.planBadgeText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                        PRO
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={[styles.featureItem, { opacity: 0.7 }]}>
                  <Lock size={15} color={colors.text.muted} strokeWidth={2} />
                  <Text style={[styles.featureText, { color: colors.text.muted }]}>
                    Exam Suite (Standard plan)
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action CTA Button */}
          <View
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.brand.primary,
                ...shadows.button,
              },
            ]}>
            <Text style={styles.actionBtnText}>Continue to Admin Login</Text>
            <ArrowRight
              size={16}
              color="#FFFFFF"
              strokeWidth={2.2}
              style={{
                transform: hoveredCard === 'admin' ? [{ translateX: 3 }] : [{ translateX: 0 }],
              }}
            />
          </View>
        </TouchableOpacity>

        {/* ===================================================================== */}
        {/* OPTION 2: STUDENT STUDY PORTAL CARD                                   */}
        {/* ===================================================================== */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => onSelectStudent(activeTenant)}
          {...({
            onMouseEnter: () => setHoveredCard('student'),
            onMouseLeave: () => setHoveredCard(null),
          } as any)}
          style={[
            styles.selectionCard,
            {
              backgroundColor: colors.surface.card,
              borderColor:
                hoveredCard === 'student'
                  ? '#B58A4A'
                  : colors.surface.border,
              transform: hoveredCard === 'student' ? [{ translateY: -3 }] : [{ translateY: 0 }],
              ...shadows.card,
            },
          ]}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
              <GraduationCap size={26} color="#B58A4A" strokeWidth={2.2} />
            </View>
            <View style={[styles.roleTag, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
              <Text style={[styles.roleTagText, { color: '#B58A4A' }]}>
                STUDENT & MEMBER
              </Text>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Student Study Portal
            </Text>
            <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
              Access your personal library account and learning services.
            </Text>

            {/* Features (Dynamically reflecting tenant entitlements) */}
            <View style={styles.featureList}>
              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color="#B58A4A" strokeWidth={2.2} />
                <Text style={[styles.featureText, { color: colors.text.primary }]}>
                  Digital seat pass and study schedules
                </Text>
              </View>

              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color="#B58A4A" strokeWidth={2.2} />
                <Text style={[styles.featureText, { color: colors.text.primary }]}>
                  Personal attendance records
                </Text>
              </View>

              <View style={styles.featureItem}>
                <CheckCircle2 size={16} color="#B58A4A" strokeWidth={2.2} />
                <Text style={[styles.featureText, { color: colors.text.primary }]}>
                  Membership and payment information
                </Text>
              </View>

              {activeTenant.features.examSuite ? (
                <View style={styles.featureItem}>
                  <CheckCircle2 size={16} color="#B58A4A" strokeWidth={2.2} />
                  <View style={styles.featureWithBadge}>
                    <Text style={[styles.featureText, { color: colors.text.primary }]}>
                      Online mock tests and practice resources
                    </Text>
                    <View style={[styles.planBadge, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
                      <Text style={[styles.planBadgeText, { color: '#B58A4A' }]}>
                        INCLUDED
                      </Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={[styles.featureItem, { opacity: 0.7 }]}>
                  <CheckCircle2 size={16} color="#B58A4A" strokeWidth={2.2} />
                  <Text style={[styles.featureText, { color: colors.text.secondary }]}>
                    Standard study desk access & silent hours
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Action CTA Button */}
          <View
            style={[
              styles.actionBtn,
              {
                backgroundColor: isDark ? '#203A2D' : '#245C48',
                borderColor: isDark ? '#55B58D' : '#245C48',
                borderWidth: 1,
                ...shadows.button,
              },
            ]}>
            <Text style={styles.actionBtnText}>Continue to Student Login</Text>
            <ArrowRight
              size={16}
              color="#FFFFFF"
              strokeWidth={2.2}
              style={{
                transform: hoveredCard === 'student' ? [{ translateX: 3 }] : [{ translateX: 0 }],
              }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* 4. COMPACT HELP AND SUPPORT FOOTER                                        */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.supportCard,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.border,
            ...shadows.sm,
          },
        ]}>
        <View style={styles.supportItem}>
          <Text style={[styles.supportTextMuted, { color: colors.text.muted }]}>
            New to this library?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => setIsHelpModalOpen(true)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
            <Text style={[styles.supportLink, { color: colors.brand.primary }]}>
              Contact your library administrator.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.supportDot, { backgroundColor: colors.surface.border }]} />

        <View style={styles.supportItem}>
          <Text style={[styles.supportTextMuted, { color: colors.text.muted }]}>
            Having trouble signing in?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => setIsHelpModalOpen(true)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
            <Text style={[styles.supportLink, { color: colors.brand.primary }]}>
              Get login assistance.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.supportDot, { backgroundColor: colors.surface.border }]} />

        <View style={styles.supportItem}>
          <Text style={[styles.supportTextMuted, { color: colors.text.muted }]}>
            Accessing the wrong library?{' '}
          </Text>
          <TouchableOpacity
            onPress={() => setIsSwitchModalOpen(true)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
            <Text style={[styles.supportLink, { color: '#B58A4A' }]}>
              Switch Library.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LibX Platform Bottom Stamp */}
      <Text style={[styles.platformStamp, { color: colors.text.muted }]}>
        Powered by LibX SaaS Multi-Tenant Platform • All connections 256-bit SSL encrypted
      </Text>

      {/* ========================================================================= */}
      {/* 5. SWITCH LIBRARY MODAL                                                   */}
      {/* ========================================================================= */}
      <Modal
        visible={isSwitchModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsSwitchModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.switchDialog,
              {
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.border,
                ...shadows.card,
              },
            ]}>
            <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View>
                <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>
                  Select Library Tenant
                </Text>
                <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                  Choose the registered library branch you belong to
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsSwitchModalOpen(false)}
                style={[styles.closeModalBtn, { backgroundColor: colors.surface.inset }]}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.tenantsList}>
              {LIBRARY_TENANTS.map((tenant) => {
                const isSelected = activeTenant.id === tenant.id;
                return (
                  <TouchableOpacity
                    key={tenant.id}
                    activeOpacity={0.8}
                    onPress={() => handleSelectTenant(tenant)}
                    style={[
                      styles.tenantOptionCard,
                      {
                        backgroundColor: isSelected
                          ? isDark ? '#203A2D' : '#E8EEE5'
                          : colors.surface.inset,
                        borderColor: isSelected
                          ? isDark ? '#55B58D' : '#245C48'
                          : colors.surface.border,
                      },
                    ]}>
                    <View style={styles.tenantOptionLeft}>
                      <View
                        style={[
                          styles.tenantOptionIcon,
                          {
                            backgroundColor: isSelected
                              ? (isDark ? '#55B58D' : '#245C48')
                              : colors.surface.card,
                          },
                        ]}>
                        <Building2
                          size={18}
                          color={isSelected ? '#FFFFFF' : colors.text.secondary}
                        />
                      </View>
                      <View>
                        <View style={styles.tenantOptionNameRow}>
                          <Text style={[styles.tenantOptionName, { color: colors.text.primary }]}>
                            {tenant.name}
                          </Text>
                          <View
                            style={[
                              styles.planTagPill,
                              {
                                backgroundColor:
                                  tenant.plan === 'pro'
                                    ? isDark ? '#203A2D' : '#E8EEE5'
                                    : isDark ? '#2C2B1B' : '#FEF8EA',
                              },
                            ]}>
                            <Text
                              style={[
                                styles.planTagPillText,
                                {
                                  color: tenant.plan === 'pro' ? (isDark ? '#55B58D' : '#245C48') : '#B58A4A',
                                },
                              ]}>
                              {tenant.plan.toUpperCase()} TIER
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.tenantOptionCampus, { color: colors.text.muted }]}>
                          {tenant.campus} · {tenant.city} ({tenant.code})
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={[styles.selectedCheck, { backgroundColor: colors.brand.primary }]}>
                        <Check size={14} color="#FFFFFF" strokeWidth={2.4} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. HELP & SUPPORT MODAL                                                   */}
      {/* ========================================================================= */}
      <Modal
        visible={isHelpModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsHelpModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.switchDialog,
              {
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.border,
                ...shadows.card,
              },
            ]}>
            <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View>
                <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>
                  Library Support & Assistance
                </Text>
                <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                  {activeTenant.name} Reception & Help Desk
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsHelpModalOpen(false)}
                style={[styles.closeModalBtn, { backgroundColor: colors.surface.inset }]}>
                <X size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.helpBody}>
              <View style={[styles.helpContactBox, { backgroundColor: colors.surface.inset, borderColor: colors.surface.border }]}>
                <Phone size={18} color={colors.brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpContactLabel, { color: colors.text.muted }]}>Front Desk Phone</Text>
                  <Text style={[styles.helpContactValue, { color: colors.text.primary }]}>{activeTenant.supportPhone}</Text>
                </View>
              </View>

              <View style={[styles.helpContactBox, { backgroundColor: colors.surface.inset, borderColor: colors.surface.border }]}>
                <Mail size={18} color={colors.brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.helpContactLabel, { color: colors.text.muted }]}>Library Email</Text>
                  <Text style={[styles.helpContactValue, { color: colors.text.primary }]}>{activeTenant.supportEmail}</Text>
                </View>
              </View>

              <Text style={[styles.helpFooterNote, { color: colors.text.muted }]}>
                Operating Hours: 06:00 AM – 11:00 PM • Morning, Evening, and Night Shifts
              </Text>
            </View>
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
    paddingHorizontal: 32,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  scrollContainerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  // 1. Top Bar
  topBar: {
    width: '100%',
    maxWidth: 980,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  platformBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  poweredDivider: {
    width: 1,
    height: 12,
  },
  poweredByText: {
    fontSize: 11,
    fontWeight: '500',
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // 2. Hero Section
  heroSection: {
    width: '100%',
    maxWidth: 980,
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 30,
  },
  tenantIdentityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tenantIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantInfoCol: {
    gap: 2,
  },
  tenantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tenantBrandLibX: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  tenantPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  tenantPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B58A4A',
  },
  tenantCampusText: {
    fontSize: 12,
  },
  switchLibraryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 'auto',
  },
  switchLibraryBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  supportingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  supportingPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  heroHeading: {
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 580,
    lineHeight: 22,
  },

  // 3. Selection Grid
  selectionGrid: {
    width: '100%',
    maxWidth: 980,
    flexDirection: 'row',
    gap: 24,
    marginBottom: 28,
  },
  selectionGridMobile: {
    flexDirection: 'column',
    gap: 18,
  },
  selectionCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 26,
    justifyContent: 'space-between',
    minHeight: 390,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 23,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 20,
  },
  featureList: {
    gap: 12,
    marginBottom: 26,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  featureWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  planBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // 4. Compact Support Section
  supportCard: {
    width: '100%',
    maxWidth: 980,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportTextMuted: {
    fontSize: 12.5,
  },
  supportLink: {
    fontSize: 12.5,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  supportDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  platformStamp: {
    fontSize: 11.5,
    textAlign: 'center',
  },

  // 5. Modal Dialogs
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 21, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  switchDialog: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dialogSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantsList: {
    padding: 18,
    gap: 12,
  },
  tenantOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  tenantOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tenantOptionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenantOptionNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tenantOptionName: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  planTagPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planTagPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  tenantOptionCampus: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpBody: {
    padding: 20,
    gap: 12,
  },
  helpContactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  helpContactLabel: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  helpContactValue: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
  },
  helpFooterNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
