import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Receipt, AlertCircle, Clock, ChevronRight } from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

export interface FeeReminderItem {
  id: string;
  studentName: string;
  studentId: string;
  seatNumber: string;
  shift: string;
  amountDue: number;
  dueDate: string;
  status: 'overdue' | 'due_soon';
}

const sampleReminders: FeeReminderItem[] = [
  {
    id: '1',
    studentName: 'Aman Deep Sharma',
    studentId: 'BW-1024',
    seatNumber: 'Desk D-08',
    shift: 'Full Day',
    amountDue: 1400,
    dueDate: 'Overdue by 3 days',
    status: 'overdue',
  },
  {
    id: '2',
    studentName: 'Sneha Kulkarni',
    studentId: 'BW-1049',
    seatNumber: 'Desk D-19',
    shift: 'Morning Shift',
    amountDue: 800,
    dueDate: 'Due Tomorrow',
    status: 'due_soon',
  },
  {
    id: '3',
    studentName: 'Mohammed Zaid',
    studentId: 'BW-1082',
    seatNumber: 'Desk D-24',
    shift: 'Evening Shift',
    amountDue: 800,
    dueDate: 'Overdue by 1 day',
    status: 'overdue',
  },
  {
    id: '4',
    studentName: 'Pooja Vishwakarma',
    studentId: 'BW-1090',
    seatNumber: 'Desk D-11',
    shift: 'Full Day',
    amountDue: 1400,
    dueDate: 'Due in 3 days',
    status: 'due_soon',
  },
];

export function FeeReminders({ onViewAll }: { onViewAll?: () => void }) {
  const { colors, shadows, isDark } = useThemeMode();

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
          <Receipt size={17} color={colors.brand.primary} strokeWidth={2} />
          <View style={styles.titleGroup}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
              Pending Fee Reminders
            </Text>
            <View style={[styles.badge, { backgroundColor: colors.brand.light }]}>
              <Text style={[styles.badgeText, { color: colors.brand.primary }]}>
                4 Pending
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={onViewAll}
          style={styles.viewAllBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.viewAllText, { color: colors.brand.primary }]}>
            View All
          </Text>
          <ChevronRight size={14} color={colors.brand.primary} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { color: colors.text.muted }]}>
        Students with pending renewals or upcoming payment deadlines
      </Text>

      {/* List */}
      <View style={styles.list}>
        {sampleReminders.map((item) => {
          const isOverdue = item.status === 'overdue';
          const initials = item.studentName
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('');

          return (
            <View
              key={item.id}
              style={[
                styles.cardItem,
                {
                  backgroundColor: colors.surface.cardAlt,
                  borderColor: colors.surface.border,
                },
              ]}>
              {/* Left: Avatar & Info */}
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: colors.brand.light },
                  ]}>
                  <Text style={[styles.avatarText, { color: colors.brand.primary }]}>
                    {initials}
                  </Text>
                </View>

                <View style={styles.infoCol}>
                  <Text
                    style={[styles.studentName, { color: colors.text.primary }]}
                    numberOfLines={1}>
                    {item.studentName}
                  </Text>
                  <Text style={[styles.metaRow, { color: colors.text.muted }]}>
                    {item.seatNumber} • {item.shift}
                  </Text>
                </View>
              </View>

              {/* Right: Amount & Status Badge */}
              <View style={styles.itemRight}>
                <Text style={[styles.amountText, { color: colors.text.primary }]}>
                  ₹{item.amountDue.toLocaleString('en-IN')}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    isOverdue
                      ? { backgroundColor: colors.danger.light }
                      : { backgroundColor: colors.warning.light },
                  ]}>
                  {isOverdue ? (
                    <AlertCircle size={10} color={colors.danger.main} strokeWidth={2.4} />
                  ) : (
                    <Clock size={10} color={colors.warning.main} strokeWidth={2.4} />
                  )}
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isOverdue
                        ? { color: colors.danger.main }
                        : { color: colors.warning.main },
                    ]}>
                    {item.dueDate}
                  </Text>
                </View>
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
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  list: {
    gap: 8,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
  },
  studentName: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  metaRow: {
    fontSize: 11,
    marginTop: 1,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
