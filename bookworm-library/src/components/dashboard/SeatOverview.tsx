import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ArrowUpRight } from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

export interface SeatOverviewProps {
  onManageSeats?: () => void;
  onSelectCategory?: (category: string) => void;
}

export function SeatOverview({ onManageSeats, onSelectCategory }: SeatOverviewProps) {
  const { colors, shadows, isDark } = useThemeMode();

  const totalSeats = 180;
  const occupiedSeats = 142;
  const availableSeats = 32;
  const reservedSeats = 6;

  const occupiedPct = (occupiedSeats / totalSeats) * 100;
  const availablePct = (availableSeats / totalSeats) * 100;
  const reservedPct = (reservedSeats / totalSeats) * 100;

  // 3 Seat Categories shown in reference image
  const categories = [
    { id: 'quiet-hall', name: 'Quiet hall', free: 10, total: 80 },
    { id: 'focus-room', name: 'Focus room', free: 10, total: 60 },
    { id: 'window-room', name: 'Window room', free: 12, total: 40 },
  ];

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
      {/* 1. Header: "Seat availability" & "Manage seats ↗" */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text.primary }]}>
          Seat availability
        </Text>
        <TouchableOpacity
          onPress={onManageSeats}
          activeOpacity={0.7}
          style={styles.manageBtn}>
          <Text style={[styles.manageBtnText, { color: colors.brand.primary }]}>
            Manage seats
          </Text>
          <ArrowUpRight size={14} color={colors.brand.primary} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 2. Sub-Header: Big Number "32 seats ready for a focused day" */}
      <View style={styles.subHeaderRow}>
        <Text
          style={[
            styles.bigStatNumber,
            {
              color: colors.text.primary,
              fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
            },
          ]}>
          {availableSeats}
        </Text>
        <Text style={[styles.bigStatLabel, { color: colors.text.muted }]}>
          seats ready for a focused day
        </Text>
      </View>

      {/* 3. Horizontal Segmented Progress Bar */}
      <View style={[styles.segmentedProgressBar, { backgroundColor: colors.surface.cardAlt }]}>
        {/* Occupied Segment */}
        <View
          style={[
            styles.barSegment,
            {
              width: `${occupiedPct}%`,
              backgroundColor: colors.brand.primary,
              borderTopLeftRadius: 6,
              borderBottomLeftRadius: 6,
            },
          ]}
        />
        {/* Available Segment */}
        <View
          style={[
            styles.barSegment,
            {
              width: `${availablePct}%`,
              backgroundColor: colors.accent.sage,
            },
          ]}
        />
        {/* Reserved Segment */}
        <View
          style={[
            styles.barSegment,
            {
              width: `${reservedPct}%`,
              backgroundColor: colors.accent.reservedBeige,
              borderTopRightRadius: 6,
              borderBottomRightRadius: 6,
            },
          ]}
        />
      </View>

      {/* 4. Legend Row: Occupied, Available, Reserved */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.brand.primary }]} />
          <Text style={[styles.legendText, { color: colors.text.muted }]}>
            {occupiedSeats} occupied
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent.sage }]} />
          <Text style={[styles.legendText, { color: colors.text.muted }]}>
            {availableSeats} available
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent.reservedBeige }]} />
          <Text style={[styles.legendText, { color: colors.text.muted }]}>
            {reservedSeats} reserved
          </Text>
        </View>
      </View>

      {/* 5. Clickable Seat Categories List */}
      <View style={styles.categoriesList}>
        {categories.map((cat, index) => (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.7}
            onPress={() => {
              if (onSelectCategory) {
                onSelectCategory(cat.name);
              } else if (onManageSeats) {
                onManageSeats();
              }
            }}
            style={[
              styles.categoryRow,
              index !== categories.length - 1 && {
                borderBottomWidth: 1,
                borderBottomColor: colors.surface.borderSubtle,
              },
            ]}>
            <Text style={[styles.categoryName, { color: colors.text.primary }]}>
              {cat.name}
            </Text>
            <Text style={[styles.categoryFreeText, { color: colors.text.muted }]}>
              {cat.free} of {cat.total} free
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    justifyContent: 'space-between',
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
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  manageBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 6,
    marginBottom: 16,
  },
  bigStatNumber: {
    fontSize: 30,
    fontWeight: '700',
  },
  bigStatLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
  segmentedProgressBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  barSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 20,
    marginBottom: 18,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 11.5,
    fontWeight: '400',
  },
  categoriesList: {
    gap: 2,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
  },
  categoryFreeText: {
    fontSize: 12,
    fontWeight: '400',
  },
});
