import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Megaphone, AlertCircle, Calendar, Sparkles } from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

export interface NoticeItem {
  id: string;
  type: 'alert' | 'event' | 'maintenance';
  title: string;
  time: string;
  desc: string;
}

const notices: NoticeItem[] = [
  {
    id: '1',
    type: 'alert',
    title: '8 Memberships Due For Renewal',
    time: 'Due within 48 hours',
    desc: 'Automated WhatsApp reminder sent to students in Quiet Hall.',
  },
  {
    id: '2',
    type: 'event',
    title: 'Extended Exam Study Hours',
    time: 'Active this week',
    desc: 'Night Owl shift extended to 6:30 AM for CA & UPSC aspirants.',
  },
  {
    id: '3',
    type: 'maintenance',
    title: 'Fiber Wi-Fi Router Maintenance',
    time: 'Tonight 11:30 PM',
    desc: 'Seamless switchover to backup Airtel 1 Gbps fiber line.',
  },
];

export function ImportantNotificationsCard() {
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
          <Megaphone size={16} color={colors.brand.primary} strokeWidth={2} />
          <Text style={[styles.title, { color: colors.text.primary }]}>
            Important Notices
          </Text>
        </View>
        <Text style={[styles.activeCount, { color: colors.text.muted }]}>
          3 Active
        </Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.text.muted }]}>
        Membership renewals, library rules & operational broadcasts
      </Text>

      {/* Notices List */}
      <View style={styles.list}>
        {notices.map((n) => (
          <View
            key={n.id}
            style={[
              styles.noticeCard,
              {
                backgroundColor: colors.surface.cardAlt,
                borderColor: colors.surface.border,
              },
            ]}>
            <View style={styles.noticeHeader}>
              <Text style={[styles.noticeTitle, { color: colors.text.primary }]}>
                {n.title}
              </Text>
              <Text style={[styles.noticeTime, { color: colors.text.muted }]}>
                {n.time}
              </Text>
            </View>
            <Text style={[styles.noticeDesc, { color: colors.text.secondary }]}>
              {n.desc}
            </Text>
          </View>
        ))}
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
  activeCount: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 14,
  },
  list: {
    gap: 10,
  },
  noticeCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  noticeTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  noticeTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  noticeDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
