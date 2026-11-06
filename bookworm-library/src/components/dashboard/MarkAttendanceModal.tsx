import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Search, Check, Scan, LogIn, LogOut, CheckCircle2 } from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

interface StudentAttendanceRecord {
  id: string;
  name: string;
  deskNo: string;
  shift: string;
  status: 'in' | 'out';
  checkInTime?: string;
}

const initialStudents: StudentAttendanceRecord[] = [
  { id: 'BW-1021', name: 'Aarav Patel', deskNo: 'D-01', shift: 'Morning Shift', status: 'in', checkInTime: '06:15 AM' },
  { id: 'BW-1022', name: 'Priya Sharma', deskNo: 'D-02', shift: 'Morning Shift', status: 'in', checkInTime: '06:30 AM' },
  { id: 'BW-1023', name: 'Rohan Verma', deskNo: 'D-03', shift: 'Morning Shift', status: 'out' },
  { id: 'BW-1024', name: 'Aman Deep Sharma', deskNo: 'D-08', shift: 'Full Day', status: 'in', checkInTime: '07:05 AM' },
  { id: 'BW-1025', name: 'Sneha Kulkarni', deskNo: 'D-14', shift: 'Evening Shift', status: 'out' },
  { id: 'BW-1026', name: 'Rahul Sharma', deskNo: 'D-15', shift: 'Evening Shift', status: 'out' },
  { id: 'BW-1027', name: 'Ananya Deshmukh', deskNo: 'D-18', shift: 'Full Day', status: 'in', checkInTime: '06:50 AM' },
];

interface MarkAttendanceModalProps {
  visible: boolean;
  onClose: () => void;
  onAttendanceUpdated?: (todayTotal: number) => void;
  onOpenFullAttendanceHub?: () => void;
}

export function MarkAttendanceModal({
  visible,
  onClose,
  onAttendanceUpdated,
  onOpenFullAttendanceHub,
}: MarkAttendanceModalProps) {
  const [studentsList, setStudentsList] = useState<StudentAttendanceRecord[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { colors, isDark } = useThemeMode();

  const toggleStatus = (id: string) => {
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus: 'in' | 'out' = s.status === 'in' ? 'out' : 'in';
          const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
          const updated = {
            ...s,
            status: newStatus,
            checkInTime: newStatus === 'in' ? time : undefined,
          };
          setToastMessage(
            newStatus === 'in'
              ? `✅ ${s.name} checked in at ${time}`
              : `🚪 ${s.name} checked out`
          );
          setTimeout(() => setToastMessage(null), 2500);
          return updated;
        }
        return s;
      })
    );
  };

  const filteredStudents = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.deskNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: isDark ? colors.surface.card : '#FFFFFF',
              borderColor: colors.surface.border,
            },
          ]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.surface.border }]}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.iconBox, { backgroundColor: colors.brand.light }]}>
                <Scan size={18} color={colors.brand.primary} strokeWidth={2.2} />
              </View>
              <View>
                <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>
                  Mark Student Attendance
                </Text>
                <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                  Instant check-in & check-out for today's shifts
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surface.cardAlt }]}>
              <X size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          {/* QR Terminal Hub Shortcut */}
          {onOpenFullAttendanceHub && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                onClose();
                onOpenFullAttendanceHub();
              }}
              style={{
                marginHorizontal: 20,
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
                backgroundColor: isDark ? '#203A2D' : '#E8EEE5',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#55B58D' : '#245C48' }}>
                ⚡ Launch Complete QR Attendance Terminal & Analytics Hub →
              </Text>
            </TouchableOpacity>
          )}

          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: isDark ? colors.surface.canvas : '#F7F7F1',
                  borderColor: colors.surface.border,
                },
              ]}>
              <Search size={15} color={colors.text.muted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search student by name, desk (e.g. D-01) or ID..."
                placeholderTextColor={colors.text.faint}
                style={[styles.searchInput, { color: colors.text.primary }]}
              />
            </View>
          </View>

          {/* Toast Notice */}
          {toastMessage && (
            <View style={[styles.toastNotice, { backgroundColor: colors.brand.light, borderColor: colors.brand.border }]}>
              <Text style={[styles.toastNoticeText, { color: colors.brand.primary }]}>
                {toastMessage}
              </Text>
            </View>
          )}

          {/* Student List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}>
            {filteredStudents.map((s) => {
              const isIn = s.status === 'in';
              return (
                <View
                  key={s.id}
                  style={[
                    styles.studentRow,
                    {
                      backgroundColor: isDark ? colors.surface.canvas : '#FFFFFF',
                      borderColor: colors.surface.border,
                    },
                  ]}>
                  <View style={styles.studentInfo}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.studentName, { color: colors.text.primary }]}>
                        {s.name}
                      </Text>
                      <View style={[styles.deskBadge, { backgroundColor: colors.brand.light }]}>
                        <Text style={[styles.deskBadgeText, { color: colors.brand.primary }]}>
                          {s.deskNo}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.studentMeta, { color: colors.text.muted }]}>
                      {s.id} • {s.shift} {isIn && s.checkInTime ? `• In at ${s.checkInTime}` : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleStatus(s.id)}
                    style={[
                      styles.toggleBtn,
                      isIn
                        ? { backgroundColor: '#245C48' }
                        : { backgroundColor: colors.surface.cardAlt, borderWidth: 1, borderColor: colors.surface.border },
                    ]}>
                    {isIn ? (
                      <>
                        <Check size={14} color="#FFFFFF" strokeWidth={2.4} />
                        <Text style={styles.toggleBtnTextIn}>Checked In</Text>
                      </>
                    ) : (
                      <>
                        <LogIn size={14} color={colors.text.secondary} strokeWidth={2} />
                        <Text style={[styles.toggleBtnTextOut, { color: colors.text.secondary }]}>
                          Mark In
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.surface.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.doneBtn, { backgroundColor: '#245C48' }]}>
              <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(38, 52, 46, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '82%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dialogSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
  },
  searchBarContainer: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  toastNotice: {
    marginHorizontal: 18,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  toastNoticeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollList: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    gap: 8,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  studentInfo: {
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  deskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deskBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  studentMeta: {
    fontSize: 11,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  toggleBtnTextIn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleBtnTextOut: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
