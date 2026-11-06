import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { ArrowUpRight, ChevronDown, CheckCircle2 } from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

export interface DailyAttendanceItem {
  day: string;
  count: number;
  inCount: number;
  outCount: number;
  isToday?: boolean;
}

const weeklyData: DailyAttendanceItem[] = [
  { day: 'Thu', count: 142, inCount: 110, outCount: 32 },
  { day: 'Fri', count: 164, inCount: 128, outCount: 36 },
  { day: 'Sat', count: 158, inCount: 122, outCount: 36 },
  { day: 'Sun', count: 138, inCount: 104, outCount: 34 },
  { day: 'Mon', count: 178, inCount: 136, outCount: 42 },
  { day: 'Tue', count: 168, inCount: 130, outCount: 38 },
  { day: 'Wed', count: 186, inCount: 142, outCount: 44, isToday: true },
];

export function AttendanceChart({ onViewReport }: { onViewReport?: () => void }) {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(6); // Default Wed (today)
  const [timeRange, setTimeRange] = useState<string>('Last 7 days');
  const [isRangeOpen, setIsRangeOpen] = useState(false);

  const { colors, shadows, isDark } = useThemeMode();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const maxVal = 200;
  const activeDay = weeklyData[activeDayIndex];

  return (
    <View
      style={[
        styles.container,
        shadows.card,
        {
          backgroundColor: colors.surface.card,
          borderColor: colors.surface.border,
          padding: isMobile ? 14 : 22,
        },
      ]}>
      {/* 1. Header: "Daily attendance" & "View report ↗" */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Daily attendance</Text>
        <TouchableOpacity
          onPress={onViewReport}
          activeOpacity={0.7}
          style={styles.viewReportBtn}>
          <Text style={[styles.viewReportText, { color: colors.brand.primary }]}>View report</Text>
          <ArrowUpRight size={14} color={colors.brand.primary} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 2. Subheader: Big Metric Value & Date Range Dropdown */}
      <View style={styles.subHeaderRow}>
        <View style={styles.bigStatRow}>
          <Text
            style={[
              styles.bigStatNumber,
              {
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            {activeDay.count}
          </Text>
          <Text style={[styles.bigStatLabel, { color: colors.text.muted }]}>
            {activeDay.isToday ? 'check-ins today' : `check-ins on ${activeDay.day}`}
          </Text>
        </View>

        {/* Date Filter Dropdown */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsRangeOpen(!isRangeOpen)}
          style={[styles.dateRangePill, { backgroundColor: colors.surface.cardAlt, borderColor: colors.surface.border }]}>
          <Text style={[styles.dateRangeText, { color: colors.text.secondary }]}>{timeRange}</Text>
          <ChevronDown size={14} color={colors.text.muted} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Options */}
      {isRangeOpen && (
        <View style={[styles.dropdownMenu, { backgroundColor: colors.surface.card, borderColor: colors.surface.border }]}>
          {['Last 7 days', 'Last 14 days', 'This Month'].map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => {
                setTimeRange(range);
                setIsRangeOpen(false);
              }}
              style={styles.dropdownOption}>
              <Text
                style={[
                  styles.dropdownOptionText,
                  { color: timeRange === range ? colors.brand.primary : colors.text.secondary },
                ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 3. Selected Day Summary Strip */}
      <View style={[styles.selectedDayStrip, { backgroundColor: colors.surface.cardAlt, borderColor: colors.surface.borderSubtle }]}>
        <View style={styles.stripLeft}>
          <CheckCircle2 size={13} color={colors.brand.primary} strokeWidth={2.2} />
          <Text style={[styles.stripDayLabel, { color: colors.brand.primary }]}>
            {activeDay.day}{activeDay.isToday ? ' (Today)' : ''}:
          </Text>
          <Text style={[styles.stripDetailText, { color: colors.text.secondary }]}>
            <Text style={[styles.stripBold, { color: colors.text.primary }]}>{activeDay.count} total</Text> • {activeDay.inCount} inside • {activeDay.outCount} checked out
          </Text>
        </View>
        <Text style={[styles.stripHint, { color: colors.text.muted }]}>Tap bar to inspect</Text>
      </View>

      {/* 4. Bar Chart Area with Precision-Aligned Y-Axis */}
      <View style={styles.chartWrapper}>
        {/* Y-Axis Label Column (200, 100, 0) */}
        <View style={styles.yAxisCol}>
          <Text style={[styles.axisLabel, { color: isDark ? '#829087' : colors.text.muted }]}>200</Text>
          <Text style={[styles.axisLabel, { color: isDark ? '#829087' : colors.text.muted }]}>100</Text>
          <Text style={[styles.axisLabel, { color: isDark ? '#829087' : colors.text.muted }]}>0</Text>
        </View>

        {/* Chart Canvas with Gridlines & Columns */}
        <View style={styles.chartCanvas}>
          {/* Subtle Horizontal Guide Lines with crisp visibility */}
          <View style={[styles.gridLine, styles.gridLineTop, { backgroundColor: isDark ? '#354139' : colors.surface.borderSubtle }]} />
          <View style={[styles.gridLine, styles.gridLineMid, { backgroundColor: isDark ? '#354139' : colors.surface.borderSubtle }]} />
          <View style={[styles.gridLine, styles.gridLineBase, { backgroundColor: isDark ? '#354139' : colors.surface.borderSubtle }]} />

          {/* 7 Bars */}
          <View style={styles.barsContainer}>
            {weeklyData.map((item, index) => {
              const isSelected = activeDayIndex === index;
              const barHeightPct = Math.min(100, (item.count / maxVal) * 100);
              // Sage-green for previous attendance days, Emerald green for current day
              const barColor = item.isToday
                ? (isDark ? '#55B58D' : colors.brand.primary)
                : (isDark ? '#A5B9A2' : colors.accent.sage);

              return (
                <TouchableOpacity
                  key={item.day}
                  activeOpacity={0.8}
                  onPress={() => setActiveDayIndex(index)}
                  style={styles.barCol}>
                  {/* Dark elevated tooltip with subtle border */}
                  {isSelected && (
                    <View
                      style={[
                        styles.activeBarPill,
                        {
                          backgroundColor: isDark ? '#29372E' : '#26342E',
                          borderColor: isDark ? '#354139' : 'transparent',
                          borderWidth: isDark ? 1 : 0,
                        },
                      ]}>
                      <Text style={[styles.activeBarPillText, { color: isDark ? '#E8EEE9' : '#FFFFFF' }]}>
                        {item.count}
                      </Text>
                    </View>
                  )}

                  {/* The Bar Track & Fill */}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${barHeightPct}%`,
                          backgroundColor: barColor,
                          opacity: item.isToday ? 1 : (isDark ? 0.8 : 0.85),
                        },
                      ]}
                    />
                  </View>

                  {/* Day Label below the baseline */}
                  <View style={styles.dayLabelContainer}>
                    <Text
                      style={[
                        styles.dayLabelText,
                        { color: item.isToday ? (isDark ? '#55B58D' : colors.brand.primary) : (isDark ? '#829087' : colors.text.muted) },
                        item.isToday && styles.todayLabelText,
                        isSelected && { color: isDark ? '#55B58D' : colors.brand.primary, fontWeight: '700' },
                      ]}>
                      {item.day}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  viewReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewReportText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  bigStatRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  bigStatNumber: {
    fontSize: 30,
    fontWeight: '700',
  },
  bigStatLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  dateRangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateRangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 76,
    right: 22,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 20,
    minWidth: 120,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedDayStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  stripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  stripDayLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  stripDetailText: {
    fontSize: 11.5,
  },
  stripBold: {
    fontWeight: '700',
  },
  stripHint: {
    fontSize: 10.5,
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 165,
    alignItems: 'stretch',
  },
  yAxisCol: {
    width: 28,
    height: 140,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingRight: 6,
  },
  axisLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  chartCanvas: {
    flex: 1,
    height: 165,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  gridLineTop: {
    top: 6,
  },
  gridLineMid: {
    top: 73,
  },
  gridLineBase: {
    top: 140,
  },
  barsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 165,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: 165,
    position: 'relative',
  },
  activeBarPill: {
    position: 'absolute',
    top: -12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  activeBarPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  barTrack: {
    width: 28,
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  dayLabelContainer: {
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayLabelText: {
    fontSize: 12,
    fontWeight: '500',
  },
  todayLabelText: {
    fontWeight: '700',
  },
});
