import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  GraduationCap,
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sun,
  Moon,
  Sparkles,
  LogIn,
  KeyRound,
  Mail,
  X,
  CheckCircle2,
  ShieldAlert,
  Clock,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { ClaymorphicShadows, ClaymorphicShadowsDark } from '@/constants/dashboard-theme';
import { LibraryTenant, DEFAULT_TENANT } from '@/constants/tenants';
import { useAuth } from '@/context/AuthContext';

interface StudentLoginViewProps {
  tenant?: LibraryTenant;
  onBackToOptions: () => void;
  onLoginSuccess: (studentData?: any) => void;
}

export function StudentLoginView({
  tenant = DEFAULT_TENANT,
  onBackToOptions,
  onLoginSuccess,
}: StudentLoginViewProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark, toggleTheme } = useThemeMode();
  const shadows = isDark ? ClaymorphicShadowsDark : ClaymorphicShadows;
  const isMobile = width < 768;

  const { signInStudent, resetPasswordForEmail } = useAuth();

  // Form states
  const [identifier, setIdentifier] = useState('rohan.student.bw2026@gmail.com');
  const [password, setPassword] = useState('Student@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  // Forgot password modal states
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    setErrorType(null);

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier) {
      setErrorMessage('Please enter your Student ID or registered email.');
      return;
    }
    if (!cleanPassword) {
      setErrorMessage('Please enter your student password.');
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signInStudent(cleanIdentifier, cleanPassword);

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please try again.');
        setErrorType(result.errorType || null);
      } else {
        onLoginSuccess(result.student);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setIdentifier('rohan.student.bw2026@gmail.com');
    setPassword('Student@2026');
    setErrorMessage(null);
    setErrorType(null);
  };

  const handleOpenForgotModal = () => {
    setResetEmail(identifier.includes('@') ? identifier.trim() : '');
    setResetSuccessMessage(null);
    setResetErrorMessage(null);
    setIsForgotModalVisible(true);
  };

  const handleSendPasswordReset = async () => {
    setResetErrorMessage(null);
    setResetSuccessMessage(null);

    const cleanEmail = resetEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setResetErrorMessage('Please enter a valid registered email address.');
      return;
    }

    setIsResetLoading(true);
    try {
      const res = await resetPasswordForEmail(cleanEmail);
      if (res.success) {
        setResetSuccessMessage(
          'Password reset instructions have been dispatched to your email. Please check your inbox and spam folder.'
        );
      } else {
        setResetErrorMessage(res.error || 'Failed to request password reset.');
      }
    } catch (err: any) {
      setResetErrorMessage(err?.message || 'Failed to dispatch password reset.');
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.surface.canvas }]}
      contentContainerStyle={[
        styles.scrollContainer,
        isMobile && styles.scrollContainerMobile,
      ]}
      showsVerticalScrollIndicator={false}>
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION WITH BACK BUTTON & THEME TOGGLE                         */}
      {/* ========================================================================= */}
      <View style={styles.topNavRow}>
        <TouchableOpacity
          onPress={onBackToOptions}
          activeOpacity={0.75}
          style={[
            styles.backBtn,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.sm,
            },
          ]}>
          <ArrowLeft size={16} color={colors.text.primary} strokeWidth={2.2} />
          <Text style={[styles.backBtnText, { color: colors.text.primary }]}>
            Back
          </Text>
        </TouchableOpacity>

        {/* Single Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.8}
          style={[
            styles.themeToggleBtn,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.sm,
            },
          ]}>
          {isDark ? (
            <>
              <Sun size={15} color={colors.brand.primary} strokeWidth={2.2} />
              <Text style={[styles.themeToggleText, { color: colors.text.primary }]}>Light</Text>
            </>
          ) : (
            <>
              <Moon size={15} color={colors.text.secondary} strokeWidth={2.2} />
              <Text style={[styles.themeToggleText, { color: colors.text.primary }]}>Dark</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* 2. STUDENT LOGIN MAIN CARD                                                */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.loginCard,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.border,
            ...shadows.card,
          },
        ]}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
            <GraduationCap size={26} color="#B58A4A" strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.titleText,
                {
                  color: colors.text.primary,
                  fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                },
              ]}>
              Student Login
            </Text>
            <Text style={[styles.subText, { color: colors.text.muted }]}>
              Sign in to access {tenant.name} study pass & portal
            </Text>
          </View>
        </View>

        {/* Quick Demo Pill */}
        <TouchableOpacity
          onPress={handleQuickDemo}
          activeOpacity={0.8}
          style={[
            styles.demoBanner,
            {
              backgroundColor: isDark ? '#262217' : '#FCF6EC',
              borderColor: '#B58A4A',
            },
          ]}>
          <View style={styles.demoBannerLeft}>
            <Sparkles size={14} color="#B58A4A" />
            <Text style={[styles.demoBannerText, { color: colors.text.primary }]}>
              Demo Account: <Text style={{ fontWeight: '700' }}>rohan.student.bw2026@gmail.com</Text>
            </Text>
          </View>
          <Text style={[styles.demoBannerAction, { color: '#B58A4A' }]}>
            Auto Fill →
          </Text>
        </TouchableOpacity>

        {/* Error Notification Banners with categorized styling */}
        {errorMessage && (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor:
                  errorType === 'pending_review'
                    ? isDark ? '#2B281B' : '#FEF8EA'
                    : isDark ? '#3D2020' : '#FDECE8',
                borderColor: errorType === 'pending_review' ? '#B58A4A' : '#C76B59',
              },
            ]}>
            {errorType === 'pending_review' ? (
              <Clock size={16} color="#B58A4A" />
            ) : errorType === 'membership_inactive' || errorType === 'membership_suspended' ? (
              <ShieldAlert size={16} color="#C76B59" />
            ) : (
              <AlertCircle size={16} color="#C76B59" />
            )}
            <Text
              style={[
                styles.errorText,
                {
                  color:
                    errorType === 'pending_review'
                      ? isDark ? '#F4D389' : '#8A5D18'
                      : isDark ? '#FF9E9E' : '#A83226',
                },
              ]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formGroup}>
          {/* Student ID / Registered Email */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
              Student Email or ID
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: colors.surface.inset,
                  borderColor: colors.surface.border,
                },
              ]}>
              <User size={16} color={colors.text.muted} />
              <TextInput
                value={identifier}
                onChangeText={(val) => {
                  setIdentifier(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="e.g. rohan@gmail.com or BW-2026-0014"
                placeholderTextColor={colors.text.faint}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.inputField, { color: colors.text.primary }]}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
              Password
            </Text>
            <View
              style={[
                styles.inputBox,
                {
                  backgroundColor: colors.surface.inset,
                  borderColor: colors.surface.border,
                },
              ]}>
              <Lock size={16} color={colors.text.muted} />
              <TextInput
                value={password}
                onChangeText={(val) => {
                  setPassword(val);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter your password"
                placeholderTextColor={colors.text.faint}
                secureTextEntry={!showPassword}
                onSubmitEditing={handleLogin}
                style={[styles.inputField, { color: colors.text.primary }]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                {showPassword ? (
                  <EyeOff size={16} color={colors.text.muted} />
                ) : (
                  <Eye size={16} color={colors.text.muted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Options Row: Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: rememberMe ? '#245C48' : 'transparent',
                    borderColor: rememberMe ? '#245C48' : colors.surface.border,
                  },
                ]}>
                {rememberMe && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.text.secondary }]}>
                Remember credentials
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleOpenForgotModal}>
              <Text style={[styles.forgotText, { color: colors.brand.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
            style={[
              styles.submitBtn,
              {
                backgroundColor: isDark ? '#245C48' : '#287A5B',
                opacity: isLoading ? 0.75 : 1,
              },
            ]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <LogIn size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.submitBtnText}>Sign In to Student Portal</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer info note */}
        <View style={[styles.cardFooter, { borderTopColor: colors.surface.border }]}>
          <Text style={[styles.footerText, { color: colors.text.muted }]}>
            Need a new library admission or password reset?
          </Text>
          <TouchableOpacity
            onPress={onBackToOptions}
            activeOpacity={0.7}
            style={styles.switchLinkBtn}>
            <Text style={[styles.switchLinkText, { color: colors.brand.primary }]}>
              Contact Reception Desk →
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 3. MODAL: REAL PASSWORD RESET FLOW                                        */}
      {/* ========================================================================= */}
      <Modal visible={isForgotModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.resetDialogCard,
              {
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.border,
                ...shadows.card,
              },
            ]}>
            {/* Header */}
            <View style={styles.resetHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.resetIconWrap, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA' }]}>
                  <KeyRound size={20} color="#B58A4A" strokeWidth={2.2} />
                </View>
                <View>
                  <Text
                    style={[
                      styles.resetTitle,
                      {
                        color: colors.text.primary,
                        fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                      },
                    ]}>
                    Reset Student Password
                  </Text>
                  <Text style={[styles.resetSubtitle, { color: colors.text.muted }]}>
                    Receive password recovery instructions
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsForgotModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            {/* Success Banner */}
            {resetSuccessMessage && (
              <View style={[styles.successBox, { backgroundColor: isDark ? '#1C2C24' : '#E8F5EE', borderColor: '#2E7D52' }]}>
                <CheckCircle2 size={16} color="#2E7D52" />
                <Text style={[styles.successText, { color: isDark ? '#6BD69E' : '#1D623F' }]}>
                  {resetSuccessMessage}
                </Text>
              </View>
            )}

            {/* Error Banner */}
            {resetErrorMessage && (
              <View style={[styles.errorBox, { backgroundColor: isDark ? '#3D2020' : '#FDECE8', borderColor: '#C76B59' }]}>
                <AlertCircle size={16} color="#C76B59" />
                <Text style={[styles.errorText, { color: isDark ? '#FF9E9E' : '#A83226' }]}>
                  {resetErrorMessage}
                </Text>
              </View>
            )}

            {/* Input Form */}
            {!resetSuccessMessage ? (
              <View style={{ gap: 14, marginTop: 12 }}>
                <Text style={{ fontSize: 13, color: colors.text.secondary, lineHeight: 18 }}>
                  Enter the email address registered with your student admission profile. We will dispatch a secure reset link.
                </Text>

                <View
                  style={[
                    styles.inputBox,
                    {
                      backgroundColor: colors.surface.inset,
                      borderColor: colors.surface.border,
                    },
                  ]}>
                  <Mail size={16} color={colors.text.muted} />
                  <TextInput
                    value={resetEmail}
                    onChangeText={(val) => {
                      setResetEmail(val);
                      if (resetErrorMessage) setResetErrorMessage(null);
                    }}
                    placeholder="student@example.com"
                    placeholderTextColor={colors.text.faint}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.inputField, { color: colors.text.primary }]}
                  />
                </View>

                <View style={styles.dialogActionsRow}>
                  <TouchableOpacity
                    onPress={() => setIsForgotModalVisible(false)}
                    style={[styles.dialogCancelBtn, { borderColor: colors.surface.border }]}>
                    <Text style={[styles.dialogCancelText, { color: colors.text.secondary }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSendPasswordReset}
                    disabled={isResetLoading}
                    style={[
                      styles.dialogSubmitBtn,
                      {
                        backgroundColor: isDark ? '#245C48' : '#287A5B',
                        opacity: isResetLoading ? 0.75 : 1,
                      },
                    ]}>
                    {isResetLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.dialogSubmitText}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 16 }}>
                <TouchableOpacity
                  onPress={() => setIsForgotModalVisible(false)}
                  style={[styles.dialogSubmitBtn, { backgroundColor: isDark ? '#245C48' : '#287A5B', width: '100%' }]}>
                  <Text style={styles.dialogSubmitText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  scrollContainerMobile: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topNavRow: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  loginCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 18,
    borderWidth: 1,
    padding: 26,
    gap: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subText: {
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 16,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  demoBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  demoBannerText: {
    fontSize: 12,
  },
  demoBannerAction: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
  },
  successText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
  formGroup: {
    gap: 16,
  },
  fieldItem: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputField: {
    flex: 1,
    fontSize: 13.5,
    outlineStyle: 'none' as any,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 12.5,
  },
  forgotText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cardFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 12,
  },
  switchLinkBtn: {
    paddingVertical: 2,
  },
  switchLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  resetDialogCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 18,
    borderWidth: 1,
    padding: 24,
    gap: 12,
  },
  resetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  resetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  dialogActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  dialogCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  dialogCancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dialogSubmitBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
