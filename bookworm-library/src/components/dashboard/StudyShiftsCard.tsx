import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Clock, Sun, Sunset, Moon } from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

export interface StudyShiftInfo {
  id: string;
  name: string;
  timeSlot: string;
  icon: typeof Sun;
  enrolled: number;
  capacity: number;
  isCurrent: boolean;
}

const shifts: StudyShiftInfo[] = [
  {
    id: 'morning',
    name: 'Morning Shift',
    timeSlot: '06:00 AM – 02:00 PM',
    icon: Sun,
    enrolled: 48,
    capacity: 50,
    isCurrent: true,
  },
  {
    id: 'evening',
    name: 'Evening Shift',
    timeSlot: '02:00 PM – 10:00 PM',
    icon: Sunset,
    enrolled: 44,
    capacity: 50,
    isCurrent: false,
  },
  {
    id: 'night',
    name: 'Night Owl Shift',
    timeSlot: '10:00 PM – 06:00 AM',
    icon: Moon,
    enrolled: 36,
    capacity: 50,
    isCurrent: false,
  },
];

export function StudyShiftsCard() {
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
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Clock size={16} color={colors.brand.primary} strokeWidth={2} />
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Today's Study Shifts
          </Text>
        </View>
        <View style={[styles.liveBadge, { backgroundColor: colors.brand.light }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.brand.primary }]} />
          <Text style={[styles.liveText, { color: colors.brand.primary }]}>
            Shift 1 Active
          </Text>
        </View>
      </View>

      <Text style={[styles.subtitle, { color: colors.text.muted }]}>
        Daily operational slots, active occupancy & physical capacity
      </Text>

      {/* Shifts List */}
      <View style={styles.shiftsList}>
        {shifts.map((shift) => {
          const Icon = shift.icon;
          const pct = Math.round((shift.enrolled / shift.capacity) * 100);

          return (
            <View
              key={shift.id}
              style={[
                styles.shiftItem,
                {
                  backgroundColor: colors.surface.cardAlt,
                  borderColor: shift.isCurrent ? colors.brand.primary : colors.surface.border,
                  borderWidth: shift.isCurrent ? 1.5 : 1,
                },
              ]}>
              <View style={styles.shiftLeft}>
                <View
                  style={[
                    styles.shiftIconBox,
                    {
                      backgroundColor: shift.isCurrent ? colors.brand.light : (isDark ? colors.surface.border : '#E8EEE5'),
                    },
                  ]}>
                  <Icon
                    size={17}
                    color={shift.isCurrent ? colors.brand.primary : colors.text.muted}
                    strokeWidth={2}
                  />
                </View>

                <View style={styles.shiftDetails}>
                  <View style={styles.shiftTitleRow}>
                    <Text style={[styles.shiftName, { color: colors.text.primary }]}>
                      {shift.name}
                    </Text>
                    {shift.isCurrent && (
                      <View style={[styles.currentPill, { backgroundColor: colors.brand.primary }]}>
                        <Text style={styles.currentPillText}>NOW</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.shiftTime, { color: colors.text.muted }]}>
                    {shift.timeSlot}
                  </Text>
                </View>
              </View>

              <View style={styles.shiftRight}>
                <Text style={[styles.enrolledCount, { color: colors.text.primary }]}>
                  {shift.enrolled} / {shift.capacity}
                </Text>
                <Text style={[styles.occupancyPct, { color: colors.brand.primary }]}>
                  {pct}% booked
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  shiftsList: {
    gap: 10,
  },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
  },
  shiftLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shiftIconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftDetails: {
    gap: 2,
  },
  shiftTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftName: {
    fontSize: 13,
    fontWeight: '600',
  },
  currentPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  currentPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  shiftTime: {
    fontSize: 11,
  },
  shiftRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  enrolledCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  occupancyPct: {
    fontSize: 11,
    fontWeight: '600',
  },
});
