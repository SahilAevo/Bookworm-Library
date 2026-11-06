import React, { useState, useMemo, useEffect } from 'react';
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
  Building2,
  Clock,
  Armchair,
  FileText,
  CreditCard,
  CalendarCheck,
  Bell,
  Smartphone,
  Layers,
  Users,
  Lock,
  PlugZap,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Search,
  Sparkles,
  QrCode,
  ShieldCheck,
  Crown,
  KeyRound,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sliders,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  MessageSquare,
  Globe,
  Phone,
  Mail,
  MapPin,
  Laptop,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { LibraryTenant, LIBRARY_TENANTS } from '@/constants/tenants';
import {
  TenantSettings,
  DEFAULT_TENANT_SETTINGS,
  ShiftConfig,
  SeatCategoryConfig,
} from '@/constants/tenant-settings';

interface LibrarySettingsViewProps {
  currentTenant: LibraryTenant;
  onTenantChange?: (tenant: LibraryTenant) => void;
  onBackToDashboard?: () => void;
  onNavigateToSeats?: () => void;
}

type SettingsSectionId =
  | 'profile'
  | 'operations'
  | 'seats'
  | 'membership'
  | 'payments'
  | 'attendance'
  | 'notifications'
  | 'portal'
  | 'modules'
  | 'staff'
  | 'security'
  | 'integrations';

interface NavItem {
  id: SettingsSectionId;
  label: string;
  sublabel: string;
  icon: any;
  badge?: string;
}

const SETTINGS_NAV_ITEMS: NavItem[] = [
  { id: 'profile', label: 'Library Profile', sublabel: 'Identity, campus & contacts', icon: Building2 },
  { id: 'operations', label: 'Library Operations', sublabel: 'Hours, shifts & holidays', icon: Clock },
  { id: 'seats', label: 'Desk & Seat Setup', sublabel: 'Categories, pricing & zones', icon: Armchair },
  { id: 'membership', label: 'Membership & Policies', sublabel: 'Durations, deposits & rules', icon: FileText },
  { id: 'payments', label: 'Fees & Payment Settings', sublabel: 'Gateways, receipts & taxes', icon: CreditCard },
  { id: 'attendance', label: 'Attendance & Access', sublabel: 'QR, biometrics & tracking', icon: CalendarCheck },
  { id: 'notifications', label: 'Notifications & Alerts', sublabel: 'WhatsApp, SMS & templates', icon: Bell },
  { id: 'portal', label: 'Student Portal', sublabel: 'Branding, colors & sections', icon: Smartphone },
  { id: 'modules', label: 'LibX Features & Modules', sublabel: 'SaaS add-ons & entitlements', icon: Layers, badge: 'SaaS' },
  { id: 'staff', label: 'Staff & Roles', sublabel: 'Access permissions & team', icon: Users },
  { id: 'security', label: 'Security & Data', sublabel: '2FA, backups & data export', icon: Lock },
  { id: 'integrations', label: 'Integrations & API', sublabel: 'Payment, SMS & webhooks', icon: PlugZap },
];

export function LibrarySettingsView({
  currentTenant,
  onTenantChange,
  onBackToDashboard,
  onNavigateToSeats,
}: LibrarySettingsViewProps) {
  const { colors, isDark } = useThemeMode();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Active section
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'detail'>('list');

  // Per-tenant isolated state store
  const [tenantStores, setTenantStores] = useState<Record<string, TenantSettings>>(DEFAULT_TENANT_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<TenantSettings>(() => {
    return JSON.parse(JSON.stringify(DEFAULT_TENANT_SETTINGS[currentTenant.id] || DEFAULT_TENANT_SETTINGS['bookworm-main']));
  });

  // Track unsaved modifications
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeModuleName, setUpgradeModuleName] = useState('');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  // Sync draft settings when active tenant changes
  useEffect(() => {
    const existing = tenantStores[currentTenant.id] || DEFAULT_TENANT_SETTINGS[currentTenant.id] || DEFAULT_TENANT_SETTINGS['bookworm-main'];
    setDraftSettings(JSON.parse(JSON.stringify(existing)));
    setHasUnsavedChanges(false);
  }, [currentTenant.id]);

  // Mark changes
  const updateSettings = <K extends keyof TenantSettings>(section: K, update: Partial<TenantSettings[K]>) => {
    setDraftSettings((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        ...update,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Save changes for this specific tenant
  const handleSaveChanges = () => {
    setTenantStores((prev) => ({
      ...prev,
      [currentTenant.id]: JSON.parse(JSON.stringify(draftSettings)),
    }));
    setHasUnsavedChanges(false);
    showToast(`Settings saved successfully for ${draftSettings.profile.name}`);
  };

  // Discard changes
  const handleDiscardChanges = () => {
    const existing = tenantStores[currentTenant.id] || DEFAULT_TENANT_SETTINGS[currentTenant.id];
    setDraftSettings(JSON.parse(JSON.stringify(existing)));
    setHasUnsavedChanges(false);
    showToast('Changes reverted to saved configuration');
  };

  // Reset to default
  const handleResetToDefault = () => {
    const defaults = DEFAULT_TENANT_SETTINGS[currentTenant.id] || DEFAULT_TENANT_SETTINGS['bookworm-main'];
    setDraftSettings(JSON.parse(JSON.stringify(defaults)));
    setHasUnsavedChanges(true);
    showToast('Reset to default library configuration');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Completion calculation
  const completionPercentage = useMemo(() => {
    let score = 0;
    if (draftSettings.profile.name && draftSettings.profile.phone && draftSettings.profile.email) score += 20;
    if (draftSettings.operations.openTime && draftSettings.operations.shifts.some((s) => s.enabled)) score += 20;
    if (draftSettings.seats.totalDesks > 0 && draftSettings.seats.categories.length > 0) score += 20;
    if (draftSettings.payments.methods.upi || draftSettings.payments.methods.cash) score += 20;
    if (draftSettings.portal.welcomeMessage) score += 20;
    return score;
  }, [draftSettings]);

  // Filtered navigation
  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return SETTINGS_NAV_ITEMS;
    const q = searchQuery.toLowerCase();
    return SETTINGS_NAV_ITEMS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.sublabel.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      {/* ========================================================================= */}
      {/* 1. TOP HEADER BANNER: ENTERPRISE SETTINGS CENTRE                          */}
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
          {/* Title & Tenant Info */}
          <View style={styles.headerTitleGroup}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.headerIconBox, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                <Building2 size={22} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.2} />
              </View>
              <View>
                <View style={styles.tenantBadgeRow}>
                  <Text style={[styles.tenantKicker, { color: isDark ? '#55B58D' : '#245C48' }]}>
                    LIBX MULTI-TENANT SAAS · TENANT SETTINGS
                  </Text>
                  <View
                    style={[
                      styles.planBadge,
                      {
                        backgroundColor: currentTenant.plan === 'enterprise' ? '#EDE9FE' : currentTenant.plan === 'pro' ? '#FEF3C7' : '#E0F2FE',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.planBadgeText,
                        {
                          color: currentTenant.plan === 'enterprise' ? '#6D28D9' : currentTenant.plan === 'pro' ? '#92400E' : '#0369A1',
                        },
                      ]}>
                      {currentTenant.plan.toUpperCase()} TIER
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
                  Library Settings
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
                  Configure {draftSettings.profile.name}’s identity, operations, policies and digital experience.
                </Text>
              </View>
            </View>
          </View>

          {/* Right Controls: Tenant Switcher, Completion Indicator, Save & Cancel */}
          <View style={[styles.headerControlsGroup, isMobile && styles.headerControlsGroupMobile]}>
            {/* Active Tenant Switcher Dropdown / Pills */}
            <View style={[styles.tenantSwitcherBox, { borderColor: colors.surface.border }]}>
              <Text style={[styles.tenantSwitcherLabel, { color: colors.text.muted }]}>Active Tenant:</Text>
              <View style={styles.tenantOptionsRow}>
                {LIBRARY_TENANTS.map((t) => {
                  const isSelected = t.id === currentTenant.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      activeOpacity={0.8}
                      onPress={() => onTenantChange && onTenantChange(t)}
                      style={[
                        styles.tenantOptionPill,
                        {
                          backgroundColor: isSelected ? (isDark ? '#245C48' : '#287A5B') : 'transparent',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.tenantOptionPillText,
                          {
                            color: isSelected ? '#FFFFFF' : colors.text.secondary,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}>
                        {t.name.replace(' Library', '').replace("The ", '')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Completion Pill */}
            <View style={[styles.completionPill, { backgroundColor: isDark ? '#1C2922' : '#F1F7F4', borderColor: isDark ? '#287A5B' : '#C7DEC7' }]}>
              <CheckCircle2 size={13} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.4} />
              <Text style={[styles.completionPillText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                {completionPercentage}% Configured
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              {hasUnsavedChanges && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleDiscardChanges}
                  style={[styles.discardBtn, { borderColor: colors.surface.border }]}>
                  <RotateCcw size={13} color={colors.text.secondary} />
                  <Text style={[styles.discardBtnText, { color: colors.text.secondary }]}>Discard</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveChanges}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: hasUnsavedChanges ? (isDark ? '#318968' : '#245C48') : (isDark ? '#2D3A32' : '#E2EBE5'),
                  },
                ]}>
                <Save size={14} color={hasUnsavedChanges ? '#FFFFFF' : (isDark ? '#6E8578' : '#5C7467')} strokeWidth={2.2} />
                <Text
                  style={[
                    styles.saveBtnText,
                    {
                      color: hasUnsavedChanges ? '#FFFFFF' : (isDark ? '#6E8578' : '#5C7467'),
                      fontWeight: '700',
                    },
                  ]}>
                  {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Global Settings Search Bar */}
        <View style={styles.searchRow}>
          <View
            style={[
              styles.searchField,
              {
                backgroundColor: isDark ? colors.surface.canvas : '#F8F6F1',
                borderColor: colors.surface.border,
              },
            ]}>
            <Search size={14} color={colors.text.muted} strokeWidth={2} />
            <TextInput
              value={searchQuery}
              onChangeText={(val) => {
                setSearchQuery(val);
                if (val.trim() && isMobile) {
                  setMobileViewMode('list');
                }
              }}
              placeholder="Search setting (e.g. shifts, pricing, QR attendance, gateway, logo)..."
              placeholderTextColor={colors.text.faint}
              style={[styles.searchInput, { color: colors.text.primary }]}
            />
          </View>

          <TouchableOpacity
            onPress={handleResetToDefault}
            style={[styles.resetBtn, { borderColor: colors.surface.border }]}>
            <RotateCcw size={12} color={colors.text.muted} />
            <Text style={[styles.resetBtnText, { color: colors.text.muted }]}>Reset to Tenant Defaults</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 2. TWO-LEVEL SETTINGS NAVIGATION + ACTIVE PANEL                           */}
      {/* ========================================================================= */}
      {isMobile ? (
        mobileViewMode === 'list' ? (
          /* MOBILE VIEW: VERTICAL LIST FORMAT OF ALL SETTINGS CATEGORIES */
          <View
            style={[
              styles.mobileCategoriesListContainer,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            <View style={[styles.mobileListHeaderRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
              <View>
                <Text style={[styles.mobileListHeading, { color: colors.text.primary }]}>
                  Settings Categories
                </Text>
                <Text style={[styles.mobileListSubtitle, { color: colors.text.muted }]}>
                  Tap any category to open and configure its settings
                </Text>
              </View>
              <View style={[styles.mobileCategoryCountBadge, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                <Text style={[styles.mobileCategoryCountText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                  {filteredNavItems.length} Categories
                </Text>
              </View>
            </View>

            <View style={styles.mobileCategoriesVerticalList}>
              {filteredNavItems.map((item) => {
                const isSelected = activeSection === item.id;
                const IconComp = item.icon;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.78}
                    onPress={() => {
                      setActiveSection(item.id);
                      setMobileViewMode('detail');
                    }}
                    style={[
                      styles.mobileCategoryCard,
                      {
                        backgroundColor: isDark ? colors.surface.canvas : '#FAF9F6',
                        borderColor: isSelected
                          ? (isDark ? '#55B58D' : '#245C48')
                          : (isDark ? 'rgba(255,255,255,0.08)' : '#EAE6DC'),
                      },
                    ]}>
                    <View style={styles.mobileCategoryCardLeft}>
                      <View
                        style={[
                          styles.mobileCategoryIconBox,
                          {
                            backgroundColor: isSelected
                              ? (isDark ? '#245C48' : '#287A5B')
                              : (isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF'),
                            borderColor: colors.surface.border,
                          },
                        ]}>
                        <IconComp
                          size={18}
                          color={isSelected ? '#FFFFFF' : (isDark ? '#55B58D' : '#245C48')}
                          strokeWidth={2.2}
                        />
                      </View>

                      <View style={styles.mobileCategoryTextCol}>
                        <View style={styles.mobileCategoryTitleRow}>
                          <Text style={[styles.mobileCategoryTitle, { color: colors.text.primary }]}>
                            {item.label}
                          </Text>
                          {item.badge && (
                            <View style={styles.navItemBadge}>
                              <Text style={styles.navItemBadgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.mobileCategoryDesc, { color: colors.text.muted }]} numberOfLines={2}>
                          {item.sublabel}
                        </Text>
                      </View>
                    </View>

                    <ChevronRight size={18} color={colors.text.muted} strokeWidth={2} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          /* MOBILE VIEW: ACTIVE CATEGORY SETTINGS DETAIL */
          <View style={styles.mobileDetailContainer}>
            {/* Top Navigation Bar: Back to Categories Button & Current Category Info */}
            <View
              style={[
                styles.mobileDetailNavBar,
                {
                  backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                  borderColor: colors.surface.border,
                },
              ]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMobileViewMode('list')}
                style={[
                  styles.mobileBackBtn,
                  {
                    backgroundColor: isDark ? '#203A2D' : '#E8EEE5',
                  },
                ]}>
                <ArrowLeft size={16} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.4} />
                <Text style={[styles.mobileBackBtnText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                  All Categories
                </Text>
              </TouchableOpacity>

              <View style={styles.mobileActiveCategoryRow}>
                {(() => {
                  const currentItem = SETTINGS_NAV_ITEMS.find((it) => it.id === activeSection) || SETTINGS_NAV_ITEMS[0];
                  const ActiveIcon = currentItem.icon;
                  return (
                    <>
                      <ActiveIcon size={16} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.2} />
                      <Text style={[styles.mobileActiveCategoryTitle, { color: colors.text.primary }]} numberOfLines={1}>
                        {currentItem.label}
                      </Text>
                      {currentItem.badge && (
                        <View style={styles.navItemBadge}>
                          <Text style={styles.navItemBadgeText}>{currentItem.badge}</Text>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            </View>

            {/* Render Active Settings Panel */}
            <View style={styles.settingsContentPanel}>
              {activeSection === 'profile' && renderProfilePanel()}
              {activeSection === 'operations' && renderOperationsPanel()}
              {activeSection === 'seats' && renderSeatsPanel()}
              {activeSection === 'membership' && renderMembershipPanel()}
              {activeSection === 'payments' && renderPaymentsPanel()}
              {activeSection === 'attendance' && renderAttendancePanel()}
              {activeSection === 'notifications' && renderNotificationsPanel()}
              {activeSection === 'portal' && renderPortalPanel()}
              {activeSection === 'modules' && renderModulesPanel()}
              {activeSection === 'staff' && renderStaffPanel()}
              {activeSection === 'security' && renderSecurityPanel()}
              {activeSection === 'integrations' && renderIntegrationsPanel()}
            </View>

            {/* Bottom Return to List Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMobileViewMode('list')}
              style={[
                styles.mobileBottomBackBtn,
                {
                  backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                  borderColor: colors.surface.border,
                },
              ]}>
              <ArrowLeft size={15} color={colors.text.secondary} strokeWidth={2.2} />
              <Text style={[styles.mobileBottomBackBtnText, { color: colors.text.secondary }]}>
                Back to All Settings Categories
              </Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        /* DESKTOP / TABLET TWO-COLUMN LAYOUT */
        <View style={styles.settingsBodyRow}>
          {/* LEFT NAVIGATION PANEL (Sidebar) */}
          <View
            style={[
              styles.settingsNavPanel,
              {
                backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                borderColor: colors.surface.border,
              },
            ]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.navScrollVertical}>
              {filteredNavItems.map((item) => {
                const isSelected = activeSection === item.id;
                const IconComp = item.icon;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => setActiveSection(item.id)}
                    style={[
                      styles.navItemBtn,
                      isSelected && [
                        styles.navItemBtnActive,
                        {
                          backgroundColor: isDark ? '#203A2D' : '#F1F7F4',
                          borderColor: isDark ? '#55B58D' : '#245C48',
                        },
                      ],
                    ]}>
                    <View
                      style={[
                        styles.navItemIconBox,
                        {
                          backgroundColor: isSelected
                            ? (isDark ? '#245C48' : '#287A5B')
                            : (isDark ? 'rgba(255,255,255,0.05)' : '#F5F2EB'),
                        },
                      ]}>
                      <IconComp
                        size={15}
                        color={isSelected ? '#FFFFFF' : colors.text.muted}
                        strokeWidth={isSelected ? 2.2 : 1.8}
                      />
                    </View>

                    <View style={styles.navItemTextGroup}>
                      <View style={styles.navItemTitleRow}>
                        <Text
                          style={[
                            styles.navItemTitle,
                            {
                              color: isSelected ? (isDark ? '#55B58D' : '#245C48') : colors.text.primary,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                          numberOfLines={1}>
                          {item.label}
                        </Text>
                        {item.badge && (
                          <View style={styles.navItemBadge}>
                            <Text style={styles.navItemBadgeText}>{item.badge}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.navItemSublabel, { color: colors.text.muted }]} numberOfLines={1}>
                        {item.sublabel}
                      </Text>
                    </View>

                    {isSelected && (
                      <ChevronRight size={14} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.4} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* RIGHT ACTIVE SETTINGS PANEL */}
          <View style={styles.settingsContentPanel}>
            {activeSection === 'profile' && renderProfilePanel()}
            {activeSection === 'operations' && renderOperationsPanel()}
            {activeSection === 'seats' && renderSeatsPanel()}
            {activeSection === 'membership' && renderMembershipPanel()}
            {activeSection === 'payments' && renderPaymentsPanel()}
            {activeSection === 'attendance' && renderAttendancePanel()}
            {activeSection === 'notifications' && renderNotificationsPanel()}
            {activeSection === 'portal' && renderPortalPanel()}
            {activeSection === 'modules' && renderModulesPanel()}
            {activeSection === 'staff' && renderStaffPanel()}
            {activeSection === 'security' && renderSecurityPanel()}
            {activeSection === 'integrations' && renderIntegrationsPanel()}
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 3. UPGRADE PLAN MODAL FOR PREMIUM ENTITLEMENTS                            */}
      {/* ========================================================================= */}
      <Modal visible={showUpgradeModal} transparent animationType="fade" onRequestClose={() => setShowUpgradeModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.upgradeCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
            <View style={styles.upgradeHeader}>
              <View style={[styles.upgradeIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Crown size={24} color="#B45309" strokeWidth={2.4} />
              </View>
              <Text
                style={[
                  styles.upgradeTitle,
                  { color: colors.text.primary, fontFamily: Platform.OS === 'web' ? '"DM Serif Display", serif' : 'serif' },
                ]}>
                Upgrade to LibX Pro
              </Text>
              <Text style={[styles.upgradeSubtitle, { color: colors.text.muted }]}>
                {upgradeModuleName} is an enterprise-grade add-on for libraries requiring automated competitive mock tests,
                hardware integrations, and AI services.
              </Text>
            </View>

            <View style={styles.upgradeFeaturesList}>
              <View style={styles.upgradeFeatureItem}>
                <Check size={14} color="#15803D" strokeWidth={2.5} />
                <Text style={[styles.upgradeFeatureText, { color: colors.text.secondary }]}>
                  Unlimited online student practice tests & rank cards
                </Text>
              </View>
              <View style={styles.upgradeFeatureItem}>
                <Check size={14} color="#15803D" strokeWidth={2.5} />
                <Text style={[styles.upgradeFeatureText, { color: colors.text.secondary }]}>
                  Multi-branch student seat roaming & single sign-on
                </Text>
              </View>
              <View style={styles.upgradeFeatureItem}>
                <Check size={14} color="#15803D" strokeWidth={2.5} />
                <Text style={[styles.upgradeFeatureText, { color: colors.text.secondary }]}>
                  Automated biometric hardware bridge & WhatsApp bot
                </Text>
              </View>
            </View>

            <View style={styles.upgradeActionRow}>
              <TouchableOpacity
                onPress={() => setShowUpgradeModal(false)}
                style={[styles.upgradeCancelBtn, { borderColor: colors.surface.border }]}>
                <Text style={[styles.upgradeCancelBtnText, { color: colors.text.secondary }]}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowUpgradeModal(false);
                  showToast('Enterprise plan upgrade inquiry sent to LibX team');
                }}
                style={styles.upgradeConfirmBtn}>
                <Text style={styles.upgradeConfirmBtnText}>Contact LibX Sales →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Success Toast */}
      {toastMessage && (
        <View style={[styles.toastContainer, { backgroundColor: isDark ? '#1C2922' : '#245C48' }]}>
          <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );

  // =========================================================================
  // SUB-PANEL RENDERERS
  // =========================================================================

  // A. LIBRARY PROFILE
  function renderProfilePanel() {
    const prof = draftSettings.profile;

    return (
      <View style={styles.panelSectionGroup}>
        {/* Card 1: Identity & Description */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Library Identity & Type</Text>
              <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
                Branding information displayed on receipts, student pass, and official LibX portal directory.
              </Text>
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Library Official Name</Text>
              <TextInput
                value={prof.name}
                onChangeText={(text) => updateSettings('profile', { name: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>

            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Campus / Branch Subtitle</Text>
              <TextInput
                value={prof.campus}
                onChangeText={(text) => updateSettings('profile', { campus: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Library Catchphrase / Tagline</Text>
            <TextInput
              value={prof.tagline}
              onChangeText={(text) => updateSettings('profile', { tagline: text })}
              style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Library Overview & Facilities Description</Text>
            <TextInput
              value={prof.description}
              multiline
              numberOfLines={3}
              onChangeText={(text) => updateSettings('profile', { description: text })}
              style={[styles.textAreaInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
            />
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Library Operating Classification</Text>
              <View style={styles.pillSelectorRow}>
                {(['Private Study Hall', 'Academic & Coaching Library', 'Public Reading Lounge', 'Co-working Hybrid'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => updateSettings('profile', { type: t })}
                    style={[
                      styles.choicePill,
                      {
                        backgroundColor: prof.type === t ? (isDark ? '#245C48' : '#287A5B') : (isDark ? colors.surface.canvas : '#FAF8F3'),
                        borderColor: prof.type === t ? (isDark ? '#55B58D' : '#245C48') : colors.surface.border,
                      },
                    ]}>
                    <Text style={[styles.choicePillText, { color: prof.type === t ? '#FFFFFF' : colors.text.secondary }]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Government / Society Registration No.</Text>
              <TextInput
                value={prof.regNumber}
                onChangeText={(text) => updateSettings('profile', { regNumber: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>
        </View>

        {/* Card 2: Contact & Location */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Physical Address & Helpdesk Contact</Text>
          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Street Address</Text>
            <TextInput
              value={prof.address}
              onChangeText={(text) => updateSettings('profile', { address: text })}
              style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
            />
          </View>

          <View style={styles.formGridThree}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>City</Text>
              <TextInput
                value={prof.city}
                onChangeText={(text) => updateSettings('profile', { city: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>State</Text>
              <TextInput
                value={prof.state}
                onChangeText={(text) => updateSettings('profile', { state: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Postal Code</Text>
              <TextInput
                value={prof.postalCode}
                onChangeText={(text) => updateSettings('profile', { postalCode: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Support Email Address</Text>
              <TextInput
                value={prof.email}
                onChangeText={(text) => updateSettings('profile', { email: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Helpdesk Phone Number</Text>
              <TextInput
                value={prof.phone}
                onChangeText={(text) => updateSettings('profile', { phone: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>
        </View>

        {/* Card 3: Live Student-Facing Identity Card Preview */}
        <View style={[styles.previewContainerCard, { backgroundColor: isDark ? '#1C2520' : '#F6F3EC', borderColor: colors.surface.border }]}>
          <View style={styles.previewCardHeader}>
            <Sparkles size={14} color={isDark ? '#55B58D' : '#245C48'} />
            <Text style={[styles.previewCardTitle, { color: isDark ? '#55B58D' : '#245C48' }]}>
              Live Student-Facing Identity Preview
            </Text>
          </View>

          <View style={[styles.previewMockPass, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
            <View style={styles.previewPassTop}>
              <View style={[styles.previewLogoCircle, { backgroundColor: '#245C48' }]}>
                <Building2 size={16} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.previewLibraryName, { color: colors.text.primary }]}>{prof.name}</Text>
                <Text style={[styles.previewCampusName, { color: colors.text.muted }]}>
                  {prof.campus} · {prof.type}
                </Text>
              </View>
              <View style={styles.previewVerifiedBadge}>
                <Text style={styles.previewVerifiedText}>LibX Verified</Text>
              </View>
            </View>
            <Text style={[styles.previewTagline, { color: colors.text.secondary }]}>“{prof.tagline}”</Text>
            <View style={styles.previewFooterRow}>
              <Text style={[styles.previewContactInfo, { color: colors.text.muted }]}>📞 {prof.phone}</Text>
              <Text style={[styles.previewContactInfo, { color: colors.text.muted }]}>📍 {prof.city}, {prof.state}</Text>
              <Text style={[styles.previewContactInfo, { color: colors.text.muted }]}>✉️ {prof.email}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // B. LIBRARY OPERATIONS
  function renderOperationsPanel() {
    const ops = draftSettings.operations;

    return (
      <View style={styles.panelSectionGroup}>
        {/* Working Hours & Shifts */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Daily Operating Schedule & Working Days</Text>
          <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
            Configure library door opening and closing times, grace period, and active study shifts.
          </Text>

          <View style={styles.formGridThree}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Opening Time</Text>
              <TextInput
                value={ops.openTime}
                onChangeText={(text) => updateSettings('operations', { openTime: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Closing Time</Text>
              <TextInput
                value={ops.closeTime}
                onChangeText={(text) => updateSettings('operations', { closeTime: text })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Max Daily Operating Hours</Text>
              <TextInput
                value={String(ops.maxDailyHours)}
                keyboardType="numeric"
                onChangeText={(text) => updateSettings('operations', { maxDailyHours: Number(text) || 16 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>

          {/* Working Days Chips */}
          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Operational Days of the Week</Text>
            <View style={styles.daysChipsRow}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const isActive = ops.workingDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => {
                      const updated = isActive
                        ? ops.workingDays.filter((d) => d !== day)
                        : [...ops.workingDays, day];
                      updateSettings('operations', { workingDays: updated });
                    }}
                    style={[
                      styles.dayChip,
                      {
                        backgroundColor: isActive ? (isDark ? '#245C48' : '#287A5B') : (isDark ? colors.surface.canvas : '#FAF8F3'),
                        borderColor: isActive ? (isDark ? '#55B58D' : '#245C48') : colors.surface.border,
                      },
                    ]}>
                    <Text style={[styles.dayChipText, { color: isActive ? '#FFFFFF' : colors.text.secondary }]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Shift Matrix Config */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 12 }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.subheading, { color: colors.text.primary, marginTop: 0 }]}>
                Shift Matrix Configuration ({ops.shifts.length})
              </Text>
              <Text style={[styles.cardDesc, { color: colors.text.muted, marginBottom: 0 }]}>
                Customize operating shifts: rename shift labels, change timings, toggle active state, or add and delete shifts.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const nextNo = ops.shifts.length + 1;
                const newShift: ShiftConfig = {
                  id: `shift-${Date.now()}`,
                  label: `Shift ${nextNo}`,
                  time: '02:00 PM – 06:00 PM',
                  enabled: true,
                  badge: `S${nextNo}`,
                };
                updateSettings('operations', {
                  shifts: [...ops.shifts, newShift],
                });
              }}
              style={[
                styles.addShiftBtn,
                {
                  backgroundColor: isDark ? '#245C48' : '#E8F3EE',
                  borderColor: isDark ? '#55B58D' : '#287A5B',
                },
              ]}>
              <Plus size={14} color={isDark ? '#7FD1AC' : '#287A5B'} strokeWidth={2.4} />
              <Text style={[styles.addShiftBtnText, { color: isDark ? '#7FD1AC' : '#287A5B' }]}>
                Add Shift
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shiftsGrid}>
            {ops.shifts.map((shift, idx) => (
              <View
                key={shift.id}
                style={[
                  styles.shiftConfigCard,
                  {
                    backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3',
                    borderColor: shift.enabled ? (isDark ? '#55B58D' : '#245C48') : colors.surface.border,
                  },
                ]}>
                <View style={styles.shiftHeaderRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.fieldLabelSmall, { color: colors.text.muted }]}>Shift Name</Text>
                    <TextInput
                      value={shift.label}
                      onChangeText={(val) => {
                        const updated = [...ops.shifts];
                        updated[idx] = { ...updated[idx], label: val };
                        updateSettings('operations', { shifts: updated });
                      }}
                      placeholder="Shift Name"
                      placeholderTextColor={colors.text.muted}
                      style={[
                        styles.shiftNameInput,
                        {
                          color: colors.text.primary,
                          borderColor: colors.surface.border,
                          backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                        },
                      ]}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Switch
                      value={shift.enabled}
                      onValueChange={(val) => {
                        const updated = [...ops.shifts];
                        updated[idx] = { ...updated[idx], enabled: val };
                        updateSettings('operations', { shifts: updated });
                      }}
                      trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                      thumbColor="#FFFFFF"
                    />
                    <TouchableOpacity
                      disabled={ops.shifts.length <= 1}
                      onPress={() => {
                        if (ops.shifts.length <= 1) return;
                        const updated = ops.shifts.filter((_, i) => i !== idx);
                        updateSettings('operations', { shifts: updated });
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[
                        styles.deleteShiftBtn,
                        { opacity: ops.shifts.length <= 1 ? 0.3 : 1 },
                      ]}>
                      <Trash2 size={15} color="#D9534F" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ marginTop: 8 }}>
                  <Text style={[styles.fieldLabelSmall, { color: colors.text.muted }]}>Shift Hours / Timing</Text>
                  <TextInput
                    value={shift.time}
                    onChangeText={(val) => {
                      const updated = [...ops.shifts];
                      updated[idx] = { ...updated[idx], time: val };
                      updateSettings('operations', { shifts: updated });
                    }}
                    placeholder="e.g. 06:00 AM – 02:00 PM"
                    placeholderTextColor={colors.text.muted}
                    style={[
                      styles.shiftTimeInput,
                      {
                        color: colors.text.secondary,
                        borderColor: colors.surface.border,
                        backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Break and Grace Period */}
          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Official Break Allowance (Minutes)</Text>
              <TextInput
                value={String(ops.breakDurationMinutes)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('operations', { breakDurationMinutes: Number(val) || 45 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Late Arrival Grace Period (Minutes)</Text>
              <TextInput
                value={String(ops.gracePeriodMinutes)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('operations', { gracePeriodMinutes: Number(val) || 15 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>
        </View>

        {/* Special Holiday Calendar */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Upcoming Declared Holidays</Text>
              <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
                Days on which seats are not marked absent and doors remain closed or on restricted access.
              </Text>
            </View>
          </View>

          <View style={styles.holidaysList}>
            {ops.holidays.map((h) => (
              <View key={h.id} style={[styles.holidayRow, { borderColor: colors.surface.border }]}>
                <View style={styles.holidayInfo}>
                  <Calendar size={14} color={isDark ? '#55B58D' : '#245C48'} />
                  <Text style={[styles.holidayName, { color: colors.text.primary }]}>{h.name}</Text>
                </View>
                <Text style={[styles.holidayDate, { color: colors.text.muted }]}>{h.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // C. DESK & SEAT CONFIGURATION
  function renderSeatsPanel() {
    const seatConfig = draftSettings.seats;

    return (
      <View style={styles.panelSectionGroup}>
        {/* Desk Capacity & Naming Prefix */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Desk Capacity & Naming Structure</Text>
              <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
                Total physical study desks available in this branch and their standardized numbering format.
              </Text>
            </View>
            {onNavigateToSeats && (
              <TouchableOpacity
                onPress={onNavigateToSeats}
                style={[styles.secondaryActionBtn, { borderColor: colors.surface.border }]}>
                <Armchair size={13} color={isDark ? '#55B58D' : '#245C48'} />
                <Text style={[styles.secondaryActionBtnText, { color: isDark ? '#55B58D' : '#245C48' }]}>
                  Open Seat Management →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Total Physical Desks</Text>
              <TextInput
                value={String(seatConfig.totalDesks)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('seats', { totalDesks: Number(val) || 150 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Desk Prefix (e.g. D-, A-, CAB-)</Text>
              <TextInput
                value={seatConfig.namingPrefix}
                onChangeText={(val) => updateSettings('seats', { namingPrefix: val })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>

          {/* Seat Layout Proportion Preview */}
          <Text style={[styles.subheading, { color: colors.text.primary, marginTop: 14 }]}>
            Desk Category Distribution Preview
          </Text>
          <View style={styles.categoryProportionBar}>
            {seatConfig.categories.map((cat) => {
              const count = cat.endNo - cat.startNo + 1;
              const pct = (count / seatConfig.totalDesks) * 100;
              return (
                <View
                  key={cat.id}
                  style={[
                    styles.proportionSegment,
                    { width: `${pct}%`, backgroundColor: cat.color },
                  ]}>
                  <Text style={styles.proportionText} numberOfLines={1}>
                    {cat.name} ({count})
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Category Tiers & Pricing Table */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Category Pricing & Amenities Matrix</Text>
              <Text style={[styles.cardDesc, { color: colors.text.muted, marginBottom: 0 }]}>
                Customize tier names, desk allocation ranges, pricing, and visual color swatches. Add or remove tiers as needed.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const PRESET_COLORS = ['#C4A052', '#245C48', '#628194', '#D97706', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981'];
                const nextStart = seatConfig.categories.length > 0
                  ? Math.max(...seatConfig.categories.map((c) => c.endNo)) + 1
                  : 1;
                const nextEnd = nextStart + 29;
                const color = PRESET_COLORS[seatConfig.categories.length % PRESET_COLORS.length];
                const newCat: SeatCategoryConfig = {
                  id: `cat-${Date.now()}`,
                  name: `Tier ${seatConfig.categories.length + 1}`,
                  startNo: nextStart,
                  endNo: nextEnd,
                  monthlyFee: 1200,
                  weeklyFee: 400,
                  dailyFee: 90,
                  color: color,
                  amenities: ['Power Socket', 'Reading Light', 'Ergonomic Chair'],
                };
                updateSettings('seats', {
                  categories: [...seatConfig.categories, newCat],
                  totalDesks: Math.max(seatConfig.totalDesks, nextEnd),
                });
              }}
              style={[
                styles.addShiftBtn,
                {
                  backgroundColor: isDark ? '#245C48' : '#E8F3EE',
                  borderColor: isDark ? '#55B58D' : '#287A5B',
                },
              ]}>
              <Plus size={14} color={isDark ? '#7FD1AC' : '#287A5B'} strokeWidth={2.4} />
              <Text style={[styles.addShiftBtnText, { color: isDark ? '#7FD1AC' : '#287A5B' }]}>
                Add Category Tier
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesTable}>
            {seatConfig.categories.map((cat, idx) => {
              const PRESET_COLORS = ['#C4A052', '#245C48', '#628194', '#D97706', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981'];
              return (
                <View key={cat.id} style={[styles.categoryConfigRow, { borderColor: colors.surface.border }]}>
                  {/* Top Bar: Tier Name Input, Range Info, Swatches, Delete */}
                  <View style={styles.categoryRowTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, flex: 1 }}>
                      <View style={[styles.categoryColorDot, { backgroundColor: cat.color }]} />

                      {/* Editable Tier Name */}
                      <View style={{ minWidth: 150 }}>
                        <Text style={[styles.fieldLabelSmall, { color: colors.text.muted }]}>Tier / Category Name</Text>
                        <TextInput
                          value={cat.name}
                          onChangeText={(val) => {
                            const updated = [...seatConfig.categories];
                            updated[idx] = { ...updated[idx], name: val };
                            updateSettings('seats', { categories: updated });
                          }}
                          placeholder="e.g. Exclusive, Premium, VIP"
                          placeholderTextColor={colors.text.muted}
                          style={[
                            styles.tierNameInput,
                            {
                              color: colors.text.primary,
                              borderColor: colors.surface.border,
                              backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3',
                            },
                          ]}
                        />
                      </View>

                      {/* Desk Range: Start and End */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View>
                          <Text style={[styles.fieldLabelSmall, { color: colors.text.muted }]}>From</Text>
                          <TextInput
                            value={String(cat.startNo)}
                            keyboardType="numeric"
                            onChangeText={(val) => {
                              const updated = [...seatConfig.categories];
                              updated[idx] = { ...updated[idx], startNo: parseInt(val, 10) || 1 };
                              updateSettings('seats', { categories: updated });
                            }}
                            style={[
                              styles.tierRangeInput,
                              {
                                color: colors.text.primary,
                                borderColor: colors.surface.border,
                                backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3',
                              },
                            ]}
                          />
                        </View>
                        <Text style={{ color: colors.text.muted, marginTop: 16 }}>→</Text>
                        <View>
                          <Text style={[styles.fieldLabelSmall, { color: colors.text.muted }]}>To</Text>
                          <TextInput
                            value={String(cat.endNo)}
                            keyboardType="numeric"
                            onChangeText={(val) => {
                              const updated = [...seatConfig.categories];
                              updated[idx] = { ...updated[idx], endNo: parseInt(val, 10) || 1 };
                              updateSettings('seats', { categories: updated });
                            }}
                            style={[
                              styles.tierRangeInput,
                              {
                                color: colors.text.primary,
                                borderColor: colors.surface.border,
                                backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3',
                              },
                            ]}
                          />
                        </View>
                        <View style={{ marginTop: 16 }}>
                          <Text style={[styles.categoryRangeText, { color: colors.text.muted }]}>
                            ({Math.max(0, cat.endNo - cat.startNo + 1)} desks)
                          </Text>
                        </View>
                      </View>

                      {/* Color Palette Selector */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14 }}>
                        {PRESET_COLORS.map((swatch) => (
                          <TouchableOpacity
                            key={swatch}
                            onPress={() => {
                              const updated = [...seatConfig.categories];
                              updated[idx] = { ...updated[idx], color: swatch };
                              updateSettings('seats', { categories: updated });
                            }}
                            style={[
                              styles.tierColorSwatch,
                              { backgroundColor: swatch },
                              cat.color === swatch && styles.tierColorSwatchSelected,
                            ]}
                          />
                        ))}
                      </View>
                    </View>

                    {/* Delete Category Button */}
                    <TouchableOpacity
                      disabled={seatConfig.categories.length <= 1}
                      onPress={() => {
                        if (seatConfig.categories.length <= 1) return;
                        const updated = seatConfig.categories.filter((_, i) => i !== idx);
                        updateSettings('seats', { categories: updated });
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={[
                        styles.deleteShiftBtn,
                        { opacity: seatConfig.categories.length <= 1 ? 0.3 : 1 },
                      ]}>
                      <Trash2 size={16} color="#D9534F" />
                    </TouchableOpacity>
                  </View>

                  {/* Pricing Inputs */}
                  <View style={styles.formGridThree}>
                    <View style={styles.inputCol}>
                      <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>Monthly (₹)</Text>
                      <TextInput
                        value={String(cat.monthlyFee)}
                        keyboardType="numeric"
                        onChangeText={(val) => {
                          const updated = [...seatConfig.categories];
                          updated[idx] = { ...updated[idx], monthlyFee: Number(val) || 0 };
                          updateSettings('seats', { categories: updated });
                        }}
                        style={[styles.textInputCompact, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
                      />
                    </View>
                    <View style={styles.inputCol}>
                      <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>Weekly (₹)</Text>
                      <TextInput
                        value={String(cat.weeklyFee)}
                        keyboardType="numeric"
                        onChangeText={(val) => {
                          const updated = [...seatConfig.categories];
                          updated[idx] = { ...updated[idx], weeklyFee: Number(val) || 0 };
                          updateSettings('seats', { categories: updated });
                        }}
                        style={[styles.textInputCompact, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
                      />
                    </View>
                    <View style={styles.inputCol}>
                      <Text style={[styles.fieldLabel, { color: colors.text.muted }]}>Daily Pass (₹)</Text>
                      <TextInput
                        value={String(cat.dailyFee)}
                        keyboardType="numeric"
                        onChangeText={(val) => {
                          const updated = [...seatConfig.categories];
                          updated[idx] = { ...updated[idx], dailyFee: Number(val) || 0 };
                          updateSettings('seats', { categories: updated });
                        }}
                        style={[styles.textInputCompact, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
                      />
                    </View>
                  </View>

                  {/* Amenities pills */}
                  <View style={styles.amenitiesWrap}>
                    {cat.amenities.map((am) => (
                      <View key={am} style={[styles.amenityPill, { backgroundColor: isDark ? '#212D26' : '#EFF4F0' }]}>
                        <Text style={[styles.amenityText, { color: isDark ? '#55B58D' : '#245C48' }]}>✓ {am}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  // D. MEMBERSHIP & STUDENT POLICIES
  function renderMembershipPanel() {
    const mem = draftSettings.membership;

    return (
      <View style={styles.panelSectionGroup}>
        {/* Membership Plans List */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Membership Plans & Duration Packages</Text>
          <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
            Enable duration plans available for student subscription and renewal discounts.
          </Text>

          <View style={styles.plansList}>
            {mem.plans.map((p, idx) => (
              <View key={p.id} style={[styles.planCardRow, { borderColor: colors.surface.border }]}>
                <View style={styles.planInfo}>
                  <Text style={[styles.planName, { color: colors.text.primary }]}>{p.name}</Text>
                  <Text style={[styles.planDuration, { color: colors.text.muted }]}>
                    {p.days} Days Validity · {p.discountPercent}% Renewal Incentive
                  </Text>
                </View>
                <Switch
                  value={p.enabled}
                  onValueChange={(val) => {
                    const updated = [...mem.plans];
                    updated[idx].enabled = val;
                    updateSettings('membership', { plans: updated });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Fees, Deposits & Booking Rules */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Enrollment Fees & Policy Rules</Text>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>One-Time Admission / Registration Fee (₹)</Text>
              <TextInput
                value={String(mem.registrationFee)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('membership', { registrationFee: Number(val) || 0 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Refundable Security Deposit (₹)</Text>
              <TextInput
                value={String(mem.securityDeposit)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('membership', { securityDeposit: Number(val) || 0 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Advance Renewal Window (Days Before Expiry)</Text>
              <TextInput
                value={String(mem.advanceRenewalDays)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('membership', { advanceRenewalDays: Number(val) || 7 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Grace Period Before Seat Deallocation (Days)</Text>
              <TextInput
                value={String(mem.expiryGraceDays)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('membership', { expiryGraceDays: Number(val) || 3 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>Allow Student Self-Service Desk Changes</Text>
              <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                Enables students to request a different desk tier or available seat once per subscription cycle.
              </Text>
            </View>
            <Switch
              value={mem.allowSeatChange}
              onValueChange={(val) => updateSettings('membership', { allowSeatChange: val })}
              trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>Require Mandatory Government ID Verification</Text>
              <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                Aadhaar card, Student College ID, or PAN card upload required before seat activation.
              </Text>
            </View>
            <Switch
              value={mem.requireGovtId}
              onValueChange={(val) => updateSettings('membership', { requireGovtId: val })}
              trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Official Cancellation & Refund Policy Text</Text>
            <TextInput
              value={mem.refundPolicy}
              multiline
              numberOfLines={2}
              onChangeText={(val) => updateSettings('membership', { refundPolicy: val })}
              style={[styles.textAreaInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
            />
          </View>
        </View>
      </View>
    );
  }

  // E. FEES & PAYMENT SETTINGS
  function renderPaymentsPanel() {
    const pay = draftSettings.payments;

    return (
      <View style={styles.panelSectionGroup}>
        {/* Payment Methods */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Accepted Payment Methods</Text>
          <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
            Toggle which collection channels are accepted at the front desk and student study portal.
          </Text>

          <View style={styles.methodsGrid}>
            {[
              { id: 'upi', label: 'UPI QR & Virtual Payment Address (VPA)', active: pay.methods.upi },
              { id: 'cash', label: 'Cash Collection at Front Desk', active: pay.methods.cash },
              { id: 'card', label: 'Debit & Credit Cards / POS Terminal', active: pay.methods.card },
              { id: 'bankTransfer', label: 'Direct Bank Transfer / IMPS / NEFT', active: pay.methods.bankTransfer },
            ].map((m) => (
              <View key={m.id} style={[styles.methodItemRow, { borderColor: colors.surface.border }]}>
                <Text style={[styles.methodItemLabel, { color: colors.text.primary }]}>{m.label}</Text>
                <Switch
                  value={m.active}
                  onValueChange={(val) => {
                    updateSettings('payments', {
                      methods: { ...pay.methods, [m.id]: val },
                    });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Invoicing, Receipts & Penalties */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Invoicing, Receipts & Late Penalties</Text>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Digital Receipt Serial Prefix</Text>
              <TextInput
                value={pay.receiptPrefix}
                onChangeText={(val) => updateSettings('payments', { receiptPrefix: val })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Late Payment Penalty (₹ / day)</Text>
              <TextInput
                value={String(pay.lateFeePerDay)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('payments', { lateFeePerDay: Number(val) || 0 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Payment Due Day of the Month</Text>
              <TextInput
                value={String(pay.dueDayOfMonth)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('payments', { dueDayOfMonth: Number(val) || 1 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Send Auto Payment Reminders (Days Prior)</Text>
              <TextInput
                value={String(pay.remindersBeforeDue)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('payments', { remindersBeforeDue: Number(val) || 3 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // F. ATTENDANCE & ACCESS CONTROL
  function renderAttendancePanel() {
    const att = draftSettings.attendance;

    return (
      <View style={styles.panelSectionGroup}>
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Primary Attendance Verification Mode</Text>
          <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
            Select the primary physical check-in technology deployed at this library branch.
          </Text>

          <View style={styles.choiceCardsGrid}>
            {[
              { id: 'qr', title: 'Dynamic Desk / Gate QR Scan', desc: 'Students scan QR pass via LibX Study Portal camera.', icon: QrCode },
              { id: 'biometric', title: 'Biometric Turnstile Scanner', desc: 'Optical fingerprint scanner at entrance gate.', icon: ShieldCheck },
              { id: 'manual', title: 'Front Desk Manual Roster', desc: 'Receptionist logs student arrival from dashboard.', icon: Users },
              { id: 'mobile', title: 'Geofenced Mobile App Check-in', desc: 'Allows check-in within 50m of branch GPS coordinates.', icon: Smartphone },
            ].map((method) => {
              const isSelected = att.primaryMethod === method.id;
              const IconM = method.icon;
              return (
                <TouchableOpacity
                  key={method.id}
                  activeOpacity={0.85}
                  onPress={() => updateSettings('attendance', { primaryMethod: method.id as any })}
                  style={[
                    styles.choiceCard,
                    {
                      backgroundColor: isSelected ? (isDark ? '#203A2D' : '#F1F7F4') : (isDark ? colors.surface.canvas : '#FAF8F3'),
                      borderColor: isSelected ? (isDark ? '#55B58D' : '#245C48') : colors.surface.border,
                    },
                  ]}>
                  <View style={[styles.choiceCardIcon, { backgroundColor: isSelected ? '#245C48' : '#E2DFD6' }]}>
                    <IconM size={18} color={isSelected ? '#FFFFFF' : '#4B5563'} />
                  </View>
                  <Text style={[styles.choiceCardTitle, { color: colors.text.primary }]}>{method.title}</Text>
                  <Text style={[styles.choiceCardDesc, { color: colors.text.muted }]}>{method.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tracking Policies */}
          <Text style={[styles.subheading, { color: colors.text.primary, marginTop: 18 }]}>
            Enforcement & Access Policies
          </Text>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>Log Both Entry and Exit Timestamps</Text>
              <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                Enforces check-out scan when students leave study halls to calculate exact study time hours.
              </Text>
            </View>
            <Switch
              value={att.trackEntryExit}
              onValueChange={(val) => updateSettings('attendance', { trackEntryExit: val })}
              trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>Enforce Strict Shift Timing Compliance</Text>
              <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                Blocks seat entry if student scans in before shift begins or overstays allotted shift window.
              </Text>
            </View>
            <Switch
              value={att.enforceShiftTimings}
              onValueChange={(val) => updateSettings('attendance', { enforceShiftTimings: val })}
              trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>Allow Staff & Librarians to Modify Past Attendance</Text>
              <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                When disabled, only Super Administrator accounts can correct historical attendance logs.
              </Text>
            </View>
            <Switch
              value={att.allowLibrarianEdit}
              onValueChange={(val) => updateSettings('attendance', { allowLibrarianEdit: val })}
              trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>
    );
  }

  // G. NOTIFICATIONS & COMMUNICATION
  function renderNotificationsPanel() {
    const notif = draftSettings.notifications;

    return (
      <View style={styles.panelSectionGroup}>
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Delivery Channels & Automated Triggers</Text>
          <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
            Enable multi-channel broadcast alerts sent to enrolled students and emergency contacts.
          </Text>

          <View style={styles.formGridThree}>
            <View style={[styles.channelCard, { borderColor: colors.surface.border }]}>
              <Text style={[styles.channelTitle, { color: colors.text.primary }]}>WhatsApp Cloud API</Text>
              <Switch
                value={notif.whatsappEnabled}
                onValueChange={(val) => updateSettings('notifications', { whatsappEnabled: val })}
                trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.channelCard, { borderColor: colors.surface.border }]}>
              <Text style={[styles.channelTitle, { color: colors.text.primary }]}>Transactional SMS</Text>
              <Switch
                value={notif.smsEnabled}
                onValueChange={(val) => updateSettings('notifications', { smsEnabled: val })}
                trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={[styles.channelCard, { borderColor: colors.surface.border }]}>
              <Text style={[styles.channelTitle, { color: colors.text.primary }]}>Official Email Alerts</Text>
              <Switch
                value={notif.emailEnabled}
                onValueChange={(val) => updateSettings('notifications', { emailEnabled: val })}
                trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Trigger Toggles */}
          <Text style={[styles.subheading, { color: colors.text.primary, marginTop: 14 }]}>
            Automated Alert Triggers
          </Text>

          <View style={styles.methodsGrid}>
            {[
              { id: 'paymentReminder', label: 'Monthly Payment & Due Date Reminders', active: notif.triggers.paymentReminder },
              { id: 'membershipExpiry', label: 'Seat Expiry & Advance Renewal Notice', active: notif.triggers.membershipExpiry },
              { id: 'seatConfirmation', label: 'Seat Allocation & Desk Pass Issue Confirmation', active: notif.triggers.seatConfirmation },
              { id: 'attendanceAlert', label: 'Daily Gate Check-in & Departure Alert', active: notif.triggers.attendanceAlert },
              { id: 'announcements', label: 'Urgent Branch Notices & Holiday Broadcasts', active: notif.triggers.announcements },
            ].map((trig) => (
              <View key={trig.id} style={[styles.methodItemRow, { borderColor: colors.surface.border }]}>
                <Text style={[styles.methodItemLabel, { color: colors.text.primary }]}>{trig.label}</Text>
                <Switch
                  value={trig.active}
                  onValueChange={(val) => {
                    updateSettings('notifications', {
                      triggers: { ...notif.triggers, [trig.id]: val },
                    });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>

          {/* Custom Template Editor */}
          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Renewal Reminder Template (Supports Dynamic Placeholders)</Text>
            <TextInput
              value={notif.customTemplate}
              multiline
              numberOfLines={3}
              onChangeText={(val) => updateSettings('notifications', { customTemplate: val })}
              style={[styles.textAreaInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
            />
            <Text style={[styles.helperTag, { color: colors.text.faint }]}>
              Supported tags: {'{student_name}'}, {'{library_name}'}, {'{desk_no}'}, {'{due_date}'}, {'{amount}'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // H. STUDENT PORTAL CUSTOMIZATION
  function renderPortalPanel() {
    const port = draftSettings.portal;

    return (
      <View style={styles.panelSectionGroup}>
        {/* Customization Form */}
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Student Portal Branding & Visible Modules</Text>
          <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
            Customize the digital study workspace experience experienced by students when they log in to this library.
          </Text>

          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Student Portal Welcome Banner Text</Text>
            <TextInput
              value={port.welcomeMessage}
              onChangeText={(val) => updateSettings('portal', { welcomeMessage: val })}
              style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
            />
          </View>

          {/* Color Swatches */}
          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Primary Library Brand Color Accent</Text>
            <View style={styles.colorSwatchesRow}>
              {['#245C48', '#1B3B2B', '#2E5A88', '#8A5826', '#3E4957'].map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => updateSettings('portal', { primaryColor: c })}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    port.primaryColor === c && styles.colorSwatchActive,
                  ]}>
                  {port.primaryColor === c && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Student Visible Tabs */}
          <Text style={[styles.subheading, { color: colors.text.primary, marginTop: 14 }]}>
            Student Dashboard Sections
          </Text>

          <View style={styles.methodsGrid}>
            {[
              { id: 'seatPass', label: 'Digital Seat Pass & Shift Schedule Card', active: port.modules.seatPass },
              { id: 'attendanceHistory', label: 'Personal Attendance History & Calendar', active: port.modules.attendanceHistory },
              { id: 'paymentReceipts', label: 'Membership Receipts & Invoices Download', active: port.modules.paymentReceipts },
              { id: 'notices', label: 'Noticeboard & Announcements Tab', active: port.modules.notices },
              { id: 'examSuite', label: 'Online Mock Test Series & Practice Resources', active: port.modules.examSuite },
            ].map((mod) => (
              <View key={mod.id} style={[styles.methodItemRow, { borderColor: colors.surface.border }]}>
                <Text style={[styles.methodItemLabel, { color: colors.text.primary }]}>{mod.label}</Text>
                <Switch
                  value={mod.active}
                  onValueChange={(val) => {
                    updateSettings('portal', {
                      modules: { ...port.modules, [mod.id]: val },
                    });
                  }}
                  trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Live Student Portal Mobile Preview */}
        <View style={[styles.previewContainerCard, { backgroundColor: isDark ? '#1C2520' : '#F6F3EC', borderColor: colors.surface.border }]}>
          <View style={styles.previewCardHeader}>
            <Smartphone size={15} color={isDark ? '#55B58D' : '#245C48'} />
            <Text style={[styles.previewCardTitle, { color: isDark ? '#55B58D' : '#245C48' }]}>
              Live Realistic Student Mobile Preview
            </Text>
          </View>

          <View style={styles.mobileFrame}>
            <View style={[styles.mobileStatusBar, { backgroundColor: port.primaryColor }]}>
              <Text style={styles.mobileTimeText}>09:41</Text>
              <Text style={styles.mobileTimeText}>5G · 100%</Text>
            </View>

            <View style={[styles.mobileHeader, { backgroundColor: port.primaryColor }]}>
              <Text style={styles.mobileHeaderText}>{draftSettings.profile.name}</Text>
              <Text style={styles.mobileSubText}>{port.welcomeMessage}</Text>
            </View>

            <View style={styles.mobileBody}>
              {port.modules.seatPass && (
                <View style={styles.mockSeatPassCard}>
                  <View style={styles.mockPassBadge}>
                    <Text style={styles.mockPassBadgeText}>Active Pass</Text>
                  </View>
                  <Text style={styles.mockSeatNumber}>Desk D-01 (Exclusive Tier)</Text>
                  <Text style={styles.mockShift}>Morning (06:00 AM – 02:00 PM)</Text>
                </View>
              )}

              <View style={styles.mockModulesRow}>
                {port.modules.attendanceHistory && (
                  <View style={styles.mockModuleChip}>
                    <Text style={styles.mockModuleText}>Attendance (94%)</Text>
                  </View>
                )}
                {port.modules.paymentReceipts && (
                  <View style={styles.mockModuleChip}>
                    <Text style={styles.mockModuleText}>Receipts</Text>
                  </View>
                )}
                {port.modules.notices && (
                  <View style={styles.mockModuleChip}>
                    <Text style={styles.mockModuleText}>Notices (2)</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // I. LIBX FEATURES & MODULES (Multi-Tenant Entitlements Engine)
  function renderModulesPanel() {
    const mods = draftSettings.modules;
    const isProOrEnterprise = currentTenant.plan === 'pro' || currentTenant.plan === 'enterprise';

    return (
      <View style={styles.panelSectionGroup}>
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Multi-Tenant SaaS Feature Entitlements</Text>
              <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
                Active modules for tenant #{currentTenant.code}. Premium add-ons require corresponding subscription entitlement.
              </Text>
            </View>
          </View>

          <View style={styles.modulesGrid}>
            {[
              { id: 'seatManagement', title: 'Seat & Desk Management', plan: 'standard', desc: 'Category matrix, shift allocations, and desk visual map.', active: mods.seatManagement },
              { id: 'studentManagement', title: 'Student Roster & Profiles', plan: 'standard', desc: 'Enrollment details, contact records, and identity passes.', active: mods.studentManagement },
              { id: 'attendanceManagement', title: 'Attendance Logging Engine', plan: 'standard', desc: 'QR code, manual check-in, and monthly attendance charts.', active: mods.attendanceManagement },
              { id: 'feeCollection', title: 'Fee Collection & Invoicing', plan: 'standard', desc: 'Due date tracking, receipts, and revenue records.', active: mods.feeCollection },
              { id: 'notices', title: 'Broadcast Noticeboard', plan: 'standard', desc: 'Push notices and announcements to enrolled students.', active: mods.notices },
              { id: 'reports', title: 'Analytics & Revenue Reports', plan: 'standard', desc: 'Shift utilization, collection reports, and churn metrics.', active: mods.reports },
              {
                id: 'examSuite',
                title: 'LibX Exam Suite™',
                plan: 'pro',
                desc: 'Digital mock tests, timed practice exams, and automated AI rank scoring.',
                active: mods.examSuite,
                gated: !isProOrEnterprise,
              },
              {
                id: 'biometricHardware',
                title: 'Biometric Turnstile Hardware Bridge',
                plan: 'enterprise',
                desc: 'Direct optical sensor sync for automatic door release and turnstile gates.',
                active: mods.biometricHardware,
                gated: currentTenant.plan !== 'enterprise',
              },
              {
                id: 'whatsappBot',
                title: 'WhatsApp Automation Bot',
                plan: 'pro',
                desc: 'Instant auto-replies for fee dues, seat receipts, and check-in queries.',
                active: mods.whatsappBot,
                gated: !isProOrEnterprise,
              },
            ].map((mod) => (
              <View
                key={mod.id}
                style={[
                  styles.moduleCard,
                  {
                    backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3',
                    borderColor: mod.gated ? '#FCD34D' : colors.surface.border,
                  },
                ]}>
                <View style={styles.moduleCardTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.moduleBadgeRow}>
                      <Text style={[styles.moduleTitle, { color: colors.text.primary }]}>{mod.title}</Text>
                      {mod.plan !== 'standard' && (
                        <View style={[styles.modPlanBadge, { backgroundColor: mod.plan === 'enterprise' ? '#EDE9FE' : '#FEF3C7' }]}>
                          <Text style={[styles.modPlanBadgeText, { color: mod.plan === 'enterprise' ? '#6D28D9' : '#B45309' }]}>
                            {mod.plan.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.moduleDesc, { color: colors.text.muted }]}>{mod.desc}</Text>
                  </View>

                  {mod.gated ? (
                    <TouchableOpacity
                      onPress={() => {
                        setUpgradeModuleName(mod.title);
                        setShowUpgradeModal(true);
                      }}
                      style={styles.upgradeModuleBtn}>
                      <Lock size={12} color="#B45309" />
                      <Text style={styles.upgradeModuleBtnText}>Upgrade</Text>
                    </TouchableOpacity>
                  ) : (
                    <Switch
                      value={mod.active}
                      onValueChange={(val) => {
                        updateSettings('modules', { [mod.id]: val });
                      }}
                      trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // J. STAFF & ROLE MANAGEMENT
  function renderStaffPanel() {
    const staffList = draftSettings.staff;

    return (
      <View style={styles.panelSectionGroup}>
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Library Staff & Role-Based Access Control (RBAC)</Text>
              <Text style={[styles.cardDesc, { color: colors.text.muted }]}>
                Manage librarian and accountant credentials with granular operational access boundaries.
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => showToast('Staff invitation sent to new member')}
              style={[styles.primarySmallBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B' }]}>
              <Plus size={13} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.primarySmallBtnText}>Add Staff Member</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.staffTable}>
            {staffList.map((st) => (
              <View key={st.id} style={[styles.staffRow, { borderColor: colors.surface.border }]}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffAvatarText}>{st.name.charAt(0)}</Text>
                </View>
                <View style={styles.staffInfoCol}>
                  <Text style={[styles.staffName, { color: colors.text.primary }]}>{st.name}</Text>
                  <Text style={[styles.staffEmail, { color: colors.text.muted }]}>{st.email}</Text>
                </View>
                <View style={[styles.roleBadge, { backgroundColor: isDark ? '#203A2D' : '#EFF4F0' }]}>
                  <Text style={[styles.roleBadgeText, { color: isDark ? '#55B58D' : '#245C48' }]}>{st.role}</Text>
                </View>
                <Text style={[styles.staffActiveTime, { color: colors.text.faint }]}>{st.lastActive}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // K. SECURITY & DATA MANAGEMENT
  function renderSecurityPanel() {
    const sec = draftSettings.security;

    return (
      <View style={styles.panelSectionGroup}>
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Authentication Security & Data Safeguards</Text>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>Enforce Two-Factor Authentication (2FA)</Text>
              <Text style={[styles.toggleDesc, { color: colors.text.muted }]}>
                Requires OTP confirmation via phone or authenticator app for staff logins.
              </Text>
            </View>
            <Switch
              value={sec.twoFactorAuth}
              onValueChange={(val) => updateSettings('security', { twoFactorAuth: val })}
              trackColor={{ false: '#D1D5DB', true: '#287A5B' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.formGrid}>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Inactivity Session Timeout (Minutes)</Text>
              <TextInput
                value={String(sec.sessionTimeoutMinutes)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('security', { sessionTimeoutMinutes: Number(val) || 60 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
            <View style={styles.inputCol}>
              <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Student Record Retention Policy (Years)</Text>
              <TextInput
                value={String(sec.dataRetentionYears)}
                keyboardType="numeric"
                onChangeText={(val) => updateSettings('security', { dataRetentionYears: Number(val) || 3 })}
                style={[styles.textInput, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border, color: colors.text.primary }]}
              />
            </View>
          </View>

          {/* Data Export */}
          <Text style={[styles.subheading, { color: colors.text.primary, marginTop: 14 }]}>
            Tenant Data Archive & Backups
          </Text>

          <View style={styles.formGridThree}>
            <TouchableOpacity
              onPress={() => showToast('Student Database CSV download initialized')}
              style={[styles.exportCard, { borderColor: colors.surface.border }]}>
              <Download size={14} color={isDark ? '#55B58D' : '#245C48'} />
              <Text style={[styles.exportCardTitle, { color: colors.text.primary }]}>Export Students (CSV)</Text>
              <Text style={[styles.exportCardDesc, { color: colors.text.muted }]}>All active & alumni records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast('Attendance Log Archive download initialized')}
              style={[styles.exportCard, { borderColor: colors.surface.border }]}>
              <Download size={14} color={isDark ? '#55B58D' : '#245C48'} />
              <Text style={[styles.exportCardTitle, { color: colors.text.primary }]}>Export Attendance (CSV)</Text>
              <Text style={[styles.exportCardDesc, { color: colors.text.muted }]}>Date-wise scan records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => showToast('Financial Ledger JSON export generated')}
              style={[styles.exportCard, { borderColor: colors.surface.border }]}>
              <Download size={14} color={isDark ? '#55B58D' : '#245C48'} />
              <Text style={[styles.exportCardTitle, { color: colors.text.primary }]}>Financial Ledger (JSON)</Text>
              <Text style={[styles.exportCardDesc, { color: colors.text.muted }]}>Invoices & fee payments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // L. INTEGRATIONS & APIS
  function renderIntegrationsPanel() {
    const integ = draftSettings.integrations;

    return (
      <View style={styles.panelSectionGroup}>
        <View style={[styles.contentCard, { backgroundColor: isDark ? colors.surface.card : '#FFFFFF', borderColor: colors.surface.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Third-Party Services & Gateway Connections</Text>

          <View style={styles.integrationsList}>
            {[
              {
                id: 'razorpay',
                name: 'Razorpay Payment Gateway',
                desc: 'Enables online UPI, credit/debit card, and net banking fee receipts.',
                status: integ.razorpay.status,
                identifier: integ.razorpay.keyId || 'Not connected',
              },
              {
                id: 'whatsappCloud',
                name: 'WhatsApp Cloud API Gateway',
                desc: 'Broadcasts instant admission cards, payment confirmations and alerts.',
                status: integ.whatsappCloud.status,
                identifier: integ.whatsappCloud.phoneId || 'Not connected',
              },
              {
                id: 'twilioSms',
                name: 'Twilio / MSG91 SMS Gateway',
                desc: 'Transactional SMS fallback for OTP verification and fee reminders.',
                status: integ.twilioSms.status,
                identifier: integ.twilioSms.senderId || 'Not configured',
              },
              {
                id: 'biometricDevice',
                name: 'ESSL / ZKTeco Biometric Gateway',
                desc: 'Direct TCP/IP LAN bridge for optical fingerprint and face attendance turnstiles.',
                status: integ.biometricDevice.status,
                identifier: integ.biometricDevice.deviceIp || 'Offline',
              },
            ].map((srv) => (
              <View key={srv.id} style={[styles.integrationCardRow, { borderColor: colors.surface.border }]}>
                <View style={{ flex: 1 }}>
                  <View style={styles.integTitleRow}>
                    <Text style={[styles.integName, { color: colors.text.primary }]}>{srv.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: srv.status === 'connected' ? '#DCFCE7' : '#F3F4F6',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.statusBadgeText,
                          {
                            color: srv.status === 'connected' ? '#15803D' : '#6B7280',
                          },
                        ]}>
                        {srv.status === 'connected' ? 'Connected' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.integDesc, { color: colors.text.muted }]}>{srv.desc}</Text>
                  <Text style={[styles.integId, { color: colors.text.faint }]}>ID / Endpoint: {srv.identifier}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => showToast(`Configuring ${srv.name}`)}
                  style={[styles.integActionBtn, { borderColor: colors.surface.border }]}>
                  <Text style={[styles.integActionBtnText, { color: colors.text.secondary }]}>Configure</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* API Key Box */}
          <View style={styles.formRow}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>Tenant API Secret Key (For External Webhooks)</Text>
            <View style={[styles.apiKeyRow, { backgroundColor: isDark ? colors.surface.canvas : '#FAF8F3', borderColor: colors.surface.border }]}>
              <Text style={[styles.apiKeyText, { color: colors.text.primary }]}>
                {apiKeyVisible ? integ.apiKey : '••••••••••••••••••••••••••••••••••••••••'}
              </Text>
              <View style={styles.keyActions}>
                <TouchableOpacity onPress={() => setApiKeyVisible(!apiKeyVisible)} style={styles.keyActionBtn}>
                  {apiKeyVisible ? <EyeOff size={14} color={colors.text.muted} /> : <Eye size={14} color={colors.text.muted} />}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setCopiedKey(true);
                    showToast('API Key copied to clipboard');
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  style={styles.keyActionBtn}>
                  {copiedKey ? <Check size={14} color="#15803D" /> : <Copy size={14} color={colors.text.muted} />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

// =========================================================================
// STYLES
// =========================================================================
const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
    paddingBottom: 40,
  },

  // 1. Header
  headerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    gap: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerTitleGroup: {
    flex: 1,
    minWidth: 280,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tenantBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tenantKicker: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  planBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  headerControlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerControlsGroupMobile: {
    width: '100%',
    justifyContent: 'space-between',
  },
  tenantSwitcherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 6,
  },
  tenantSwitcherLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  tenantOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tenantOptionPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tenantOptionPillText: {
    fontSize: 11.5,
  },
  completionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  completionPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  discardBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 12.5,
  },

  // Search Row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  searchField: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // 2. Settings Body Layout
  settingsBodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  settingsBodyRowMobile: {
    flexDirection: 'column',
  },
  settingsNavPanel: {
    width: 280,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
  },
  settingsNavPanelMobile: {
    width: '100%',
    padding: 6,
  },
  navScrollVertical: {
    gap: 4,
  },
  navScrollHorizontal: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  navItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemBtnMobile: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navItemBtnActive: {
    borderWidth: 1,
  },
  navItemIconBox: {
    width: 30,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemTextGroup: {
    flex: 1,
  },
  navItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  navItemTitle: {
    fontSize: 13,
  },
  navItemSublabel: {
    fontSize: 11,
    marginTop: 1,
  },
  navItemBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  navItemBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },

  // Mobile Category List Styles
  mobileCategoriesListContainer: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  mobileListHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 10,
    flexWrap: 'wrap',
  },
  mobileListHeading: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  mobileListSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  mobileCategoryCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mobileCategoryCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mobileCategoriesVerticalList: {
    gap: 10,
  },
  mobileCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  mobileCategoryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  mobileCategoryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileCategoryTextCol: {
    flex: 1,
    gap: 2,
  },
  mobileCategoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  mobileCategoryTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  mobileCategoryDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  // Mobile Detail Navigation Bar
  mobileDetailContainer: {
    width: '100%',
    gap: 14,
  },
  mobileDetailNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    flexWrap: 'wrap',
  },
  mobileBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  mobileBackBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  mobileActiveCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  mobileActiveCategoryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  mobileBottomBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  mobileBottomBackBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },

  // Content Panel
  settingsContentPanel: {
    flex: 1,
    minWidth: 0,
  },
  panelSectionGroup: {
    gap: 16,
  },
  contentCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12.5,
    marginTop: 2,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Form Fields
  formRow: {
    gap: 6,
  },
  formGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  formGridThree: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  inputCol: {
    flex: 1,
    minWidth: 180,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  textInputCompact: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12.5,
    outlineStyle: 'none' as any,
  },
  textAreaInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    outlineStyle: 'none' as any,
    minHeight: 68,
  },
  helperTag: {
    fontSize: 11,
    marginTop: 2,
  },

  // Choice Pills
  pillSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  choicePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  choicePillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 6,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleDesc: {
    fontSize: 11.5,
    marginTop: 2,
  },

  // Operations
  daysChipsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shiftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shiftConfigCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  addShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
  },
  addShiftBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteShiftBtn: {
    padding: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftNameInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 13,
    fontWeight: '600',
  },
  fieldLabelSmall: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tierNameInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 140,
  },
  tierRangeInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  tierColorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tierColorSwatchSelected: {
    borderColor: '#245C48',
    transform: [{ scale: 1.2 }],
  },
  shiftHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shiftCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  shiftTimeInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
  },
  holidaysList: {
    gap: 6,
  },
  holidayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  holidayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holidayName: {
    fontSize: 13,
    fontWeight: '600',
  },
  holidayDate: {
    fontSize: 12,
  },

  // Seats
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryProportionBar: {
    height: 28,
    borderRadius: 7,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  proportionSegment: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  proportionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoriesTable: {
    gap: 12,
  },
  categoryConfigRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  categoryRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryNameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoryRangeText: {
    fontSize: 12,
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  amenityText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Membership & Payments
  plansList: {
    gap: 8,
  },
  planCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 9,
    borderWidth: 1,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  planDuration: {
    fontSize: 12,
    marginTop: 2,
  },
  methodsGrid: {
    gap: 8,
  },
  methodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  methodItemLabel: {
    fontSize: 13,
  },

  // Attendance
  choiceCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choiceCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  choiceCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  choiceCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  choiceCardDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  // Notifications
  channelCard: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderRadius: 9,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  channelTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },

  // Student Portal Live Preview
  colorSwatchesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  previewContainerCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  previewMockPass: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  previewPassTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLibraryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  previewCampusName: {
    fontSize: 11.5,
  },
  previewVerifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  previewVerifiedText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803D',
  },
  previewTagline: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  previewFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  previewContactInfo: {
    fontSize: 11,
  },

  // Realistic Mobile Phone Frame
  mobileFrame: {
    width: 300,
    alignSelf: 'center',
    borderRadius: 24,
    borderWidth: 6,
    borderColor: '#2D3748',
    backgroundColor: '#FAF8F3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  mobileStatusBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mobileTimeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '600',
  },
  mobileHeader: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 2,
  },
  mobileHeaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  mobileSubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  mobileBody: {
    padding: 12,
    gap: 10,
  },
  mockSeatPassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  mockPassBadge: {
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mockPassBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#15803D',
  },
  mockSeatNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  mockShift: {
    fontSize: 10,
    color: '#64748B',
  },
  mockModulesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  mockModuleChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mockModuleText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '500',
  },

  // Modules Grid
  modulesGrid: {
    gap: 10,
  },
  moduleCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  moduleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  moduleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  modPlanBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  modPlanBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  moduleDesc: {
    fontSize: 12,
  },
  upgradeModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  upgradeModuleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },

  // Staff Table
  primarySmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 7,
  },
  primarySmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  staffTable: {
    gap: 8,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 9,
    borderWidth: 1,
    gap: 12,
  },
  staffAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#245C48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffAvatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  staffInfoCol: {
    flex: 1,
  },
  staffName: {
    fontSize: 13,
    fontWeight: '600',
  },
  staffEmail: {
    fontSize: 11.5,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  staffActiveTime: {
    fontSize: 11,
  },

  // Security Export
  exportCard: {
    flex: 1,
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 9,
    padding: 12,
    gap: 4,
  },
  exportCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  exportCardDesc: {
    fontSize: 11,
  },

  // Integrations List
  integrationsList: {
    gap: 10,
  },
  integrationCardRow: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  integTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  integName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  integDesc: {
    fontSize: 12,
  },
  integId: {
    fontSize: 11,
    marginTop: 2,
  },
  integActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
  },
  integActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  apiKeyText: {
    fontSize: 12.5,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'serif',
  },
  keyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyActionBtn: {
    padding: 4,
  },

  // Upgrade Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  upgradeCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 18,
  },
  upgradeHeader: {
    alignItems: 'center',
    gap: 8,
    textAlign: 'center',
  },
  upgradeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  upgradeSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  upgradeFeaturesList: {
    gap: 8,
    paddingVertical: 6,
  },
  upgradeFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upgradeFeatureText: {
    fontSize: 12.5,
  },
  upgradeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  upgradeCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  upgradeCancelBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  upgradeConfirmBtn: {
    backgroundColor: '#245C48',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeConfirmBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Floating Toast
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 9999,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

