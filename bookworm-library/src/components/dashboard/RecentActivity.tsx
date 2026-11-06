import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Activity,
  UserPlus,
  Receipt,
  CalendarCheck,
  Armchair,
  Megaphone,
} from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

export interface ActivityItem {
  id: string;
  type: 'registration' | 'payment' | 'attendance' | 'seat' | 'notice';
  title: string;
  description: string;
  timeAgo: string;
}

const sampleActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'registration',
    title: 'New Student Registered',
    description: 'Aarav Patel enrolled for Full Day Shift (Desk D-14)',
    timeAgo: '10 mins ago',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Fee Payment Received',
    description: '₹1,400 received via UPI (Ref: UPI-98421) from Priya Sharma',
    timeAgo: '25 mins ago',
  },
  {
    id: '3',
    type: 'attendance',
    title: 'Student Attendance Marked',
    description: 'Vikram Mehta checked in for Evening Shift (Desk D-09)',
    timeAgo: '42 mins ago',
  },
  {
    id: '4',
    type: 'seat',
    title: 'Seat Allocation Updated',
    description: 'Desk D-22 assigned to Rohan Verma until Nov 30, 2026',
    timeAgo: '2 hours ago',
  },
  {
    id: '5',
    type: 'notice',
    title: 'Library Notice Published',
    description: '"Extended Sunday Reading Hours: 7 AM to 11 PM"',
    timeAgo: '4 hours ago',
  },
];

export function RecentActivity() {
  const { colors, shadows, isDark } = useThemeMode();

  const getActivityConfig = (type: ActivityItem['type']) => {
    switch (type) {
      case 'registration':
        return {
          icon: UserPlus,
          bg: colors.brand.light,
          color: colors.brand.primary,
        };
      case 'payment':
        return {
          icon: Receipt,
          bg: colors.brand.light,
          color: colors.brand.primary,
        };
      case 'attendance':
        return {
          icon: CalendarCheck,
          bg: colors.brand.light,
          color: colors.brand.primary,
        };
      case 'seat':
        return {
          icon: Armchair,
          bg: colors.surface.cardAlt,
          color: colors.text.secondary,
        };
      case 'notice':
        return {
          icon: Megaphone,
          bg: colors.surface.cardAlt,
          color: colors.text.muted,
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        shadows.card,
        {
          backgroundColor: colors.surface.card,
          borderColor: colors.surface.border,
        },
      ]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Activity size={17} color={colors.brand.primary} strokeWidth={2} />
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Recent Activity
          </Text>
        </View>
        <Text style={[styles.liveBadge, { color: colors.brand.primary }]}>
          ● Live Feed
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.text.muted }]}>
        Real-time audit log of library transactions and attendance events
      </Text>

      {/* Activity Timeline List */}
      <View style={styles.list}>
        {sampleActivities.map((act, index) => {
          const config = getActivityConfig(act.type);
          const Icon = config.icon;
          const isLast = index === sampleActivities.length - 1;

          return (
            <View key={act.id} style={styles.itemRow}>
              {/* Timeline Column */}
              <View style={styles.timelineCol}>
                <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
                  <Icon size={13} color={config.color} strokeWidth={2.2} />
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.timelineLine,
                      { backgroundColor: colors.surface.borderSubtle },
                    ]}
                  />
                )}
              </View>

              {/* Content Column */}
              <View style={styles.contentCol}>
                <View style={styles.contentHeader}>
                  <Text style={[styles.itemTitle, { color: colors.text.primary }]}>
                    {act.title}
                  </Text>
                  <Text style={[styles.timeAgo, { color: colors.text.muted }]}>
                    {act.timeAgo}
                  </Text>
                </View>
                <Text style={[styles.itemDesc, { color: colors.text.secondary }]}>
                  {act.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  liveBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  list: {
    gap: 0,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineCol: {
    alignItems: 'center',
    width: 26,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  timelineLine: {
    width: 1.5,
    flex: 1,
    marginVertical: 4,
  },
  contentCol: {
    flex: 1,
    paddingBottom: 14,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  timeAgo: {
    fontSize: 11,
  },
  itemDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
