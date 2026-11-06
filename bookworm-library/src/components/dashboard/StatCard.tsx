import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

export interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp = true,
}: StatCardProps) {
  const { colors, shadows, isDark } = useThemeMode();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View
      style={[
        styles.card,
        shadows.card,
        {
          backgroundColor: colors.surface.card,
          borderColor: colors.surface.border,
          padding: isMobile ? 14 : 20,
          minHeight: isMobile ? 108 : 126,
        },
      ]}>
      {/* Top Header: Label & Line Icon with subtle Claymorphic circle */}
      <View style={styles.cardHeader}>
        <Text style={[styles.label, { color: colors.text.secondary, fontSize: isMobile ? 12 : 13 }]} numberOfLines={1}>
          {label}
        </Text>
        <View style={[styles.iconBox, { backgroundColor: isDark ? colors.surface.cardAlt : colors.surface.inset }]}>
          <Icon size={isMobile ? 15 : 17} color={colors.brand.primary} strokeWidth={2} />
        </View>
      </View>

      {/* Main Metric Value (Large & Elegant Editorial Serif) */}
      <View style={styles.valueRow}>
        <Text
          style={[
            styles.value,
            {
              color: colors.text.primary,
              fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              fontSize: isMobile ? (value.length > 7 ? 20 : 23) : 30,
            },
          ]}
          numberOfLines={1}>
          {value}
        </Text>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: isDark ? 'rgba(85, 167, 131, 0.16)' : colors.brand.light }]}>
            <Text style={[styles.trendText, { color: isDark ? colors.brand.primary : colors.brand.primary }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>

      {/* Subtitle / Contextual Note */}
      <Text style={[styles.subtitle, { color: colors.text.muted, fontSize: isMobile ? 11 : 12 }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 4,
  },
  value: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
});
