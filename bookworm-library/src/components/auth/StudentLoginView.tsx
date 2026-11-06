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
} from 'react-native';
import {
  GraduationCap,
  BookOpen,
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
  Info,
  LogIn,
  KeyRound,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { ClaymorphicShadows, ClaymorphicShadowsDark } from '@/constants/dashboard-theme';
import { LibraryTenant, DEFAULT_TENANT } from '@/constants/tenants';

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

  // Form states
  const [studentId, setStudentId] = useState(`${tenant.studentIdPrefix}-0014`);
  const [password, setPassword] = useState('Student@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = () => {
    setErrorMessage(null);
    if (!studentId.trim()) {
      setErrorMessage('Please enter your Student ID or registered email.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your student password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        id: studentId,
        name: 'Rohan Verma',
        desk: 'Desk D-01 (Exclusive)',
        shift: 'Morning Shift (06:00 AM - 02:00 PM)',
      });
    }, 550);
  };

  const handleQuickDemo = () => {
    setStudentId('BW-2026-0014');
    setPassword('Student@2026');
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        id: 'BW-2026-0014',
        name: 'Rohan Verma',
        desk: 'Desk D-01 (Exclusive)',
        shift: 'Morning Shift (06:00 AM - 02:00 PM)',
      });
    }, 450);
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
          <View>
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
              Sign in to access {tenant.name} desk pass
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
              Demo: <Text style={{ fontWeight: '700' }}>Rohan Verma</Text>
            </Text>
          </View>
          <Text style={[styles.demoBannerAction, { color: '#B58A4A' }]}>
            Auto Fill →
          </Text>
        </TouchableOpacity>

        {/* Error Notification */}
        {errorMessage && (
          <View style={[styles.errorBox, { backgroundColor: isDark ? '#3D2020' : '#FDECE8', borderColor: '#C76B59' }]}>
            <AlertCircle size={16} color="#C76B59" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Forgot Password Notice */}
        {showForgotModal && (
          <View style={[styles.infoBox, { backgroundColor: isDark ? '#2C2B1B' : '#FEF8EA', borderColor: '#B58A4A' }]}>
            <AlertCircle size={16} color="#B58A4A" />
            <Text style={[styles.infoText, { color: colors.text.primary }]}>
              Contact the reception desk to reset your password.
            </Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.formGroup}>
          {/* Student ID / Registered Email */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.text.secondary }]}>
              Student ID or Email
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
                value={studentId}
                onChangeText={setStudentId}
                placeholder="e.g. BW-2026-0014"
                placeholderTextColor={colors.text.faint}
                autoCapitalize="none"
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
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.text.faint}
                secureTextEntry={!showPassword}
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

          {/* Options Row */}
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
                Remember me
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowForgotModal(!showForgotModal)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.forgotText, { color: colors.brand.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isLoading}
          onPress={handleLogin}
          style={[
            styles.submitBtn,
            {
              backgroundColor: isDark ? '#203A2D' : '#245C48',
              borderColor: isDark ? '#55B58D' : '#245C48',
              borderWidth: 1,
              ...shadows.button,
            },
          ]}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Sign In</Text>
              <LogIn size={16} color="#FFFFFF" strokeWidth={2.2} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  scrollContainerMobile: {
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  topNavRow: {
    width: '100%',
    maxWidth: 520,
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
    borderRadius: 8,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loginCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 18,
    borderWidth: 1,
    padding: 28,
    gap: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  kickerText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  studentPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  studentPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#B58A4A',
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subText: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  libraryNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  libraryNoticeText: {
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  demoBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoBannerText: {
    fontSize: 12.5,
  },
  demoBannerAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    color: '#C76B59',
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
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
    fontSize: 12.5,
  },
  switchLinkBtn: {
    paddingVertical: 2,
  },
  switchLinkText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});

