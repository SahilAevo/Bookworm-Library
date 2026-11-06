import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  Users,
  CalendarCheck,
  Receipt,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Download,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  Send,
  Building,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { ClaymorphicShadows, ClaymorphicShadowsDark } from '@/constants/dashboard-theme';

interface ModularSectionProps {
  route: string;
  onBackToDashboard: () => void;
  onOpenAddStudent?: () => void;
  onOpenMarkAttendance?: () => void;
}

export function LibXModularSectionView({
  route,
  onBackToDashboard,
  onOpenAddStudent,
  onOpenMarkAttendance,
}: ModularSectionProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useThemeMode();
  const shadows = isDark ? ClaymorphicShadowsDark : ClaymorphicShadows;
  const isMobile = width < 768;

  const [searchFilter, setSearchFilter] = useState('');

  // Config mapping for each route
  const getSectionConfig = () => {
    switch (route) {
      case 'students':
        return {
          title: 'Student Directory',
          subtitle: 'Manage 248 enrolled members, allocated desks, shifts and contact information.',
          icon: Users,
          kicker: 'MEMBER MANAGEMENT',
          primaryActionText: 'Add New Student',
          onPrimaryAction: onOpenAddStudent,
        };
      case 'attendance':
        return {
          title: 'Daily Attendance & Shifts',
          subtitle: 'Live check-in and check-out logs across Morning, Evening, and Night shifts.',
          icon: CalendarCheck,
          kicker: 'ATTENDANCE TRACKING',
          primaryActionText: 'Mark Check-in',
          onPrimaryAction: onOpenMarkAttendance,
        };
      case 'fees':
        return {
          title: 'Fees & Subscription Payments',
          subtitle: 'Track monthly seat dues, payment collections, receipts and outstanding balances.',
          icon: Receipt,
          kicker: 'BILLING & REVENUE',
          primaryActionText: 'Record Payment',
          onPrimaryAction: () => {},
        };
      case 'notices':
        return {
          title: 'Library Notices & Broadcasts',
          subtitle: 'Send announcements, SMS alerts, and holiday notifications to all library students.',
          icon: Bell,
          kicker: 'STUDENT COMMUNICATION',
          primaryActionText: 'Create Notice',
          onPrimaryAction: () => {},
        };
      case 'reports':
        return {
          title: 'Analytics & Revenue Reports',
          subtitle: 'Detailed breakdown of seat occupancy, revenue collections, and shift utilization.',
          icon: BarChart3,
          kicker: 'INTELLIGENCE & REPORTS',
          primaryActionText: 'Export Monthly PDF',
          onPrimaryAction: () => {},
        };
      case 'settings':
        return {
          title: 'Branch & Platform Settings',
          subtitle: 'Configure Bookworm Library branch preferences, shift hours, and pricing tiers.',
          icon: Settings,
          kicker: 'TENANT PREFERENCES',
          primaryActionText: 'Save Changes',
          onPrimaryAction: () => {},
        };
      default:
        return {
          title: 'Help & Knowledge Base',
          subtitle: 'LibX platform tutorials, user guides, and direct support assistance.',
          icon: HelpCircle,
          kicker: 'ASSISTANCE',
          primaryActionText: 'Contact Support',
          onPrimaryAction: () => {},
        };
    }
  };

  const config = getSectionConfig();
  const IconC = config.icon;

  return (
    <View style={styles.container}>
      {/* Header Card */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.border,
            ...shadows.card,
          },
        ]}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconWrap, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
            <IconC size={24} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.2} />
          </View>
          <View>
            <Text style={[styles.kickerText, { color: colors.brand.primary }]}>
              LIBX · {config.kicker}
            </Text>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              {config.title}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
              {config.subtitle}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={config.onPrimaryAction}
          style={[styles.primaryActionBtn, { backgroundColor: colors.brand.primary }]}>
          <Plus size={16} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.primaryActionBtnText}>{config.primaryActionText}</Text>
        </TouchableOpacity>
      </View>

      {/* Content for Students Route */}
      {route === 'students' && (
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.card,
            },
          ]}>
          {/* Search bar */}
          <View style={[styles.searchBox, { backgroundColor: colors.surface.inset, borderColor: colors.surface.border }]}>
            <Search size={15} color={colors.text.muted} />
            <TextInput
              value={searchFilter}
              onChangeText={setSearchFilter}
              placeholder="Search student by name, phone or desk..."
              placeholderTextColor={colors.text.faint}
              style={[styles.searchInput, { color: colors.text.primary }]}
            />
          </View>

          {/* Student Table */}
          <View style={styles.table}>
            <View style={[styles.tableHeader, { borderBottomColor: colors.surface.border }]}>
              <Text style={[styles.thText, { flex: 2, color: colors.text.muted }]}>STUDENT NAME</Text>
              <Text style={[styles.thText, { flex: 1.2, color: colors.text.muted }]}>DESK / TIER</Text>
              <Text style={[styles.thText, { flex: 1.2, color: colors.text.muted }]}>SHIFT</Text>
              <Text style={[styles.thText, { flex: 1.2, color: colors.text.muted }]}>FEES STATUS</Text>
              <Text style={[styles.thText, { flex: 1.2, color: colors.text.muted }]}>CONTACT</Text>
            </View>

            {[
              { name: 'Rohan Verma', desk: 'D-01 (Exclusive)', shift: 'Morning (6-2)', fees: 'Paid', phone: '+91 98231 44512' },
              { name: 'Ananya Sharma', desk: 'D-02 (Exclusive)', shift: 'Evening (2-10)', fees: 'Paid', phone: '+91 98112 55901' },
              { name: 'Vikram Malhotra', desk: 'D-15 (Premium)', shift: 'Night (10-6)', fees: 'Due Nov 10', phone: '+91 97188 33124' },
              { name: 'Pooja Iyer', desk: 'D-22 (Premium)', shift: 'Full Day (24h)', fees: 'Paid', phone: '+91 99201 88471' },
              { name: 'Kunal Deshmukh', desk: 'D-45 (Classic)', shift: 'Morning (6-2)', fees: 'Due in 2 days', phone: '+91 96541 22910' },
            ].map((stu, i) => (
              <View key={i} style={[styles.tableRow, { borderBottomColor: colors.surface.border }]}>
                <View style={{ flex: 2 }}>
                  <Text style={[styles.tdPrimary, { color: colors.text.primary }]}>{stu.name}</Text>
                  <Text style={[styles.tdMuted, { color: colors.text.muted }]}>Joined Oct 2026</Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.tdText, { color: colors.text.primary }]}>{stu.desk}</Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.tdText, { color: colors.text.primary }]}>{stu.shift}</Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <View
                    style={[
                      styles.feeBadge,
                      {
                        backgroundColor: stu.fees === 'Paid' ? (isDark ? '#203A2D' : '#E8EEE5') : (isDark ? '#3D2B1A' : '#FEF3C7'),
                      },
                    ]}>
                    <Text
                      style={[
                        styles.feeBadgeText,
                        { color: stu.fees === 'Paid' ? (isDark ? '#55B58D' : '#245C48') : '#B58A4A' },
                      ]}>
                      {stu.fees}
                    </Text>
                  </View>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={[styles.tdMuted, { color: colors.text.secondary }]}>{stu.phone}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Content for Fees Route */}
      {route === 'fees' && (
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.card,
            },
          ]}>
          <View style={styles.statsRow}>
            <View style={[styles.feeStatBox, { backgroundColor: colors.surface.inset, borderColor: colors.surface.border }]}>
              <Text style={[styles.feeStatLabel, { color: colors.text.muted }]}>Collected This Month</Text>
              <Text style={[styles.feeStatVal, { color: colors.brand.primary }]}>₹3,42,000</Text>
              <Text style={[styles.feeStatSub, { color: colors.text.secondary }]}>90.5% of target</Text>
            </View>
            <View style={[styles.feeStatBox, { backgroundColor: colors.surface.inset, borderColor: colors.surface.border }]}>
              <Text style={[styles.feeStatLabel, { color: colors.text.muted }]}>Pending Dues</Text>
              <Text style={[styles.feeStatVal, { color: '#C76B59' }]}>₹32,500</Text>
              <Text style={[styles.feeStatSub, { color: colors.text.secondary }]}>14 students remaining</Text>
            </View>
            <View style={[styles.feeStatBox, { backgroundColor: colors.surface.inset, borderColor: colors.surface.border }]}>
              <Text style={[styles.feeStatLabel, { color: colors.text.muted }]}>Auto-Reminders Sent</Text>
              <Text style={[styles.feeStatVal, { color: '#B58A4A' }]}>42</Text>
              <Text style={[styles.feeStatSub, { color: colors.text.secondary }]}>WhatsApp & SMS</Text>
            </View>
          </View>
        </View>
      )}

      {/* Content for other routes */}
      {route !== 'students' && route !== 'fees' && (
        <View
          style={[
            styles.cardContainer,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              padding: 32,
              alignItems: 'center',
              ...shadows.card,
            },
          ]}>
          <View style={[styles.iconWrapBig, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
            <IconC size={32} color={isDark ? '#55B58D' : '#245C48'} />
          </View>
          <Text
            style={[
              styles.sectionTitleBig,
              {
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            {config.title}
          </Text>
          <Text style={[styles.sectionDescBig, { color: colors.text.secondary }]}>
            {config.subtitle} This module is integrated into the LibX platform with automated data synchronization.
          </Text>
          <TouchableOpacity
            onPress={onBackToDashboard}
            style={[styles.backOverviewBtn, { backgroundColor: colors.surface.inset, borderColor: colors.surface.border }]}>
            <ArrowRight size={14} color={colors.text.primary} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={[styles.backOverviewBtnText, { color: colors.text.primary }]}>
              Return to Overview Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    flex: 1,
    minWidth: 260,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickerText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  cardContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    gap: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  thText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  tdPrimary: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  tdMuted: {
    fontSize: 12,
    marginTop: 2,
  },
  tdText: {
    fontSize: 13,
  },
  feeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  feeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  feeStatBox: {
    flex: 1,
    minWidth: 200,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 4,
  },
  feeStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  feeStatVal: {
    fontSize: 24,
    fontWeight: '800',
  },
  feeStatSub: {
    fontSize: 12,
  },
  iconWrapBig: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sectionTitleBig: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescBig: {
    fontSize: 13.5,
    maxWidth: 500,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  backOverviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  backOverviewBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
