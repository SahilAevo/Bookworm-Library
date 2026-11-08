import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, UserPlus, Check, Armchair, Clock, Phone, User, Mail, AlertCircle } from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { studentService } from '@/services/student-service';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
}

export function AddStudentModal({ visible, onClose, onSubmit }: AddStudentModalProps) {
  const { adminProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedShift, setSelectedShift] = useState('Full Day');
  const [assignedSeat, setAssignedSeat] = useState('D-15');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const { colors, shadows, isDark } = useThemeMode();

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setSelectedShift('Full Day');
    setAssignedSeat('D-15');
    setPaymentMode('UPI');
    setErrorMessage(null);
    setSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setErrorMessage(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter student full name (minimum 2 characters).');
      return;
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    const libraryId = adminProfile?.library_id;
    if (!libraryId) {
      setErrorMessage('Active administrator session or library ID not found.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await studentService.addStudent(libraryId, {
        fullName: trimmedName,
        phone: trimmedPhone,
        email: email.trim() || undefined,
        shift: selectedShift,
        seatNumber: assignedSeat.trim().toUpperCase() || 'D-15',
        paymentMode,
        amountPaid: selectedShift.includes('Full') ? 2800 : 2000,
      });

      if (!result.success || !result.data) {
        setErrorMessage(result.error || 'Failed to enroll student.');
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
      onSubmit?.(result.data);
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        <View style={[styles.dialog, shadows.lg, { backgroundColor: colors.surface.card, borderColor: colors.surface.border, borderWidth: 1 }]}>
          {/* Header */}
          <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
            <View style={styles.dialogHeaderLeft}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(85, 181, 141, 0.14)' : colors.brand.light }]}>
                <UserPlus size={18} color={isDark ? '#55B58D' : colors.brand.primary} strokeWidth={2.2} />
              </View>
              <View>
                <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>New Student Registration</Text>
                <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>Enroll student & allocate seat</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleClose} style={[styles.closeBtn, { backgroundColor: colors.surface.cardAlt }]}>
              <X size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successState}>
              <View style={[styles.successCheck, { backgroundColor: isDark ? '#318968' : colors.success.main }]}>
                <Check size={28} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={[styles.successTitle, { color: colors.text.primary }]}>Student Enrolled Successfully!</Text>
              <Text style={[styles.successSub, { color: colors.text.muted }]}>
                Desk {assignedSeat} reserved for {fullName || 'Student'} ({selectedShift}).
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
              {/* Error Message */}
              {errorMessage && (
                <View style={[styles.errorBox, { backgroundColor: isDark ? '#3D2020' : '#FDECE8', borderColor: '#C76B59' }]}>
                  <AlertCircle size={16} color="#C76B59" />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Full Name *</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border }]}>
                  <User size={16} color={colors.text.muted} />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Rahul Sharma"
                    placeholderTextColor={colors.text.faint}
                    editable={!isSubmitting}
                    style={[styles.textInput, { color: colors.text.primary }]}
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>WhatsApp / Mobile Number *</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border }]}>
                  <Phone size={16} color={colors.text.muted} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={colors.text.faint}
                    keyboardType="phone-pad"
                    editable={!isSubmitting}
                    style={[styles.textInput, { color: colors.text.primary }]}
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email Address (Optional)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border }]}>
                  <Mail size={16} color={colors.text.muted} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="student@example.com"
                    placeholderTextColor={colors.text.faint}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSubmitting}
                    style={[styles.textInput, { color: colors.text.primary }]}
                  />
                </View>
              </View>

              {/* Shift Selection */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Select Shift</Text>
                <View style={styles.shiftPills}>
                  {['Morning (7am-2pm)', 'Evening (2pm-9pm)', 'Full Day'].map((shift) => {
                    const isSelected = selectedShift === shift || (selectedShift === 'Full Day' && shift === 'Full Day');
                    return (
                      <TouchableOpacity
                        key={shift}
                        disabled={isSubmitting}
                        onPress={() => setSelectedShift(shift)}
                        style={[
                          styles.shiftPill,
                          {
                            backgroundColor: isSelected ? (isDark ? '#203A2D' : colors.brand.light) : colors.surface.canvas,
                            borderColor: isSelected ? (isDark ? '#55B58D' : colors.brand.primary) : colors.surface.border,
                          },
                        ]}>
                        <Clock size={12} color={isSelected ? (isDark ? '#55B58D' : colors.brand.primary) : colors.text.muted} />
                        <Text
                          style={[
                            styles.shiftPillText,
                            { color: isSelected ? (isDark ? '#55B58D' : colors.brand.primary) : colors.text.secondary },
                            isSelected && { fontWeight: '700' },
                          ]}>
                          {shift}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Seat Allocation & Payment Row */}
              <View style={styles.twoCol}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Assign Desk</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border }]}>
                    <Armchair size={16} color={isDark ? '#55B58D' : colors.brand.primary} />
                    <TextInput
                      value={assignedSeat}
                      onChangeText={setAssignedSeat}
                      placeholder="e.g. D-15"
                      placeholderTextColor={colors.text.faint}
                      editable={!isSubmitting}
                      style={[styles.textInput, { color: colors.text.primary }]}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Payment Method</Text>
                  <View style={[styles.paymentToggle, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border }]}>
                    {['UPI', 'Cash'].map((m) => (
                      <TouchableOpacity
                        key={m}
                        disabled={isSubmitting}
                        onPress={() => setPaymentMode(m)}
                        style={[styles.paymentPill, paymentMode === m && { backgroundColor: isDark ? '#245C48' : colors.brand.primary }]}>
                        <Text style={[styles.paymentText, { color: paymentMode === m ? '#FFFFFF' : colors.text.muted }]}>
                          {m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity disabled={isSubmitting} onPress={handleClose} style={[styles.cancelBtn, isDark && { backgroundColor: colors.surface.cardAlt, borderWidth: 1, borderColor: colors.surface.border }]}>
                  <Text style={[styles.cancelBtnText, { color: colors.text.muted }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={isSubmitting}
                  onPress={handleSave}
                  style={[styles.saveBtn, { backgroundColor: isDark ? '#245C48' : colors.brand.primary, opacity: isSubmitting ? 0.7 : 1 }]}>
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <UserPlus size={16} color="#FFFFFF" strokeWidth={2.4} />
                      <Text style={styles.saveBtnText}>Register & Assign Seat</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const { colors } = DashboardTheme;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.surface.card,
    borderRadius: 16,
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
  },
  dialogHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  dialogSubtitle: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.surface.cardAlt,
  },
  form: {
    padding: 20,
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.border,
    borderRadius: 9,
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: colors.surface.canvas,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    outlineStyle: 'none' as any,
  },
  shiftPills: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  shiftPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.canvas,
  },
  shiftPillActive: {
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.light,
  },
  shiftPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  shiftPillTextActive: {
    color: colors.brand.primary,
    fontWeight: '600',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surface.canvas,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface.border,
    height: 42,
    padding: 3,
  },
  paymentPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  paymentPillActive: {
    backgroundColor: colors.brand.primary,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
  },
  paymentTextActive: {
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.muted,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  successState: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  successCheck: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.success.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  successSub: {
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  errorText: {
    color: '#C76B59',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
});

