import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  TextInput,
  Modal,
} from 'react-native';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  BarChart3,
  Search,
  Filter,
  Play,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Users,
  Layers,
  FileText,
  Check,
  AlertCircle,
  X,
  RotateCcw,
} from 'lucide-react-native';
import { useThemeMode } from '@/context/ThemeContext';
import { ClaymorphicShadows, ClaymorphicShadowsDark } from '@/constants/dashboard-theme';

// Mock Test Definition
interface MockTest {
  id: string;
  title: string;
  category: string;
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  negativeMarking: string;
  enrolledStudents: number;
  status: 'active' | 'upcoming' | 'completed';
  difficulty: 'Beginner' | 'Moderate' | 'Advanced';
}

// Question Definition for Timed Exam
interface ExamQuestion {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SAMPLE_TESTS: MockTest[] = [
  {
    id: 'test-1',
    title: 'UPSC CSE Prelims: General Studies Paper I Full Mock #4',
    category: 'Civil Services (UPSC)',
    totalQuestions: 100,
    durationMinutes: 120,
    totalMarks: 200,
    negativeMarking: '-0.66 marks',
    enrolledStudents: 64,
    status: 'active',
    difficulty: 'Advanced',
  },
  {
    id: 'test-2',
    title: 'CA Foundation: Principles of Accounting & Business Law',
    category: 'Chartered Accountancy',
    totalQuestions: 75,
    durationMinutes: 90,
    totalMarks: 150,
    negativeMarking: '-0.25 marks',
    enrolledStudents: 42,
    status: 'active',
    difficulty: 'Moderate',
  },
  {
    id: 'test-3',
    title: 'Banking PO: Quantitative Aptitude & Data Interpretation Speed Test',
    category: 'Banking / IBPS',
    totalQuestions: 35,
    durationMinutes: 30,
    totalMarks: 70,
    negativeMarking: '-0.25 marks',
    enrolledStudents: 88,
    status: 'active',
    difficulty: 'Moderate',
  },
  {
    id: 'test-4',
    title: 'SSC CGL Tier 1: General Intelligence & Reasoning Comprehensive',
    category: 'Staff Selection (SSC)',
    totalQuestions: 50,
    durationMinutes: 45,
    totalMarks: 100,
    negativeMarking: '-0.50 marks',
    enrolledStudents: 53,
    status: 'active',
    difficulty: 'Beginner',
  },
  {
    id: 'test-5',
    title: 'NEET UG 2026: Physics Mechanics & Thermodynamics Rapid Drill',
    category: 'Medical Entrance',
    totalQuestions: 45,
    durationMinutes: 60,
    totalMarks: 180,
    negativeMarking: '-1 mark',
    enrolledStudents: 31,
    status: 'upcoming',
    difficulty: 'Advanced',
  },
];

const SAMPLE_EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    subject: 'Indian Polity & Governance',
    question: 'Under which Article of the Constitution of India is the Annual Financial Statement (Budget) presented before Parliament?',
    options: ['Article 110', 'Article 112', 'Article 114', 'Article 280'],
    correctIndex: 1,
    explanation: 'Article 112 of the Constitution of India deals with the Annual Financial Statement.',
  },
  {
    id: 2,
    subject: 'Macroeconomics',
    question: 'Which of the following monetary policy instruments is primarily used by the RBI to absorb overnight excess liquidity from commercial banks?',
    options: ['Repo Rate', 'Reverse Repo / SDF Rate', 'Marginal Standing Facility', 'Cash Reserve Ratio'],
    correctIndex: 1,
    explanation: 'The Standing Deposit Facility (SDF) and Reverse Repo are used to absorb surplus liquidity.',
  },
  {
    id: 3,
    subject: 'Quantitative Aptitude',
    question: 'A train 180 meters long is traveling at a speed of 72 km/h. How many seconds will it take to pass an electric pole completely?',
    options: ['7 seconds', '8 seconds', '9 seconds', '10 seconds'],
    correctIndex: 2,
    explanation: 'Speed in m/s = 72 * (5/18) = 20 m/s. Time = Distance / Speed = 180 / 20 = 9 seconds.',
  },
  {
    id: 4,
    subject: 'Logical Reasoning',
    question: 'In a code language, if "KNOWLEDGE" is written as "LPQZMRFHF", what will "STUDENT" be written as with the same shift pattern?',
    options: ['TUVEFOU', 'TUVFFOU', 'TUVFEPU', 'TTUEFOU'],
    correctIndex: 0,
    explanation: 'Each letter is shifted forward by +1 position in alphabetical sequence.',
  },
  {
    id: 5,
    subject: 'Modern Indian History',
    question: 'Who was the Governor-General of India when the Permanent Settlement of Bengal was introduced in 1793?',
    options: ['Lord Warren Hastings', 'Lord Cornwallis', 'Lord Wellesley', 'Lord William Bentinck'],
    correctIndex: 1,
    explanation: 'Lord Cornwallis introduced the Permanent Settlement in Bengal in 1793.',
  },
];

export function LibXExamSuiteView({ onBackToDashboard }: { onBackToDashboard?: () => void }) {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useThemeMode();
  const shadows = isDark ? ClaymorphicShadowsDark : ClaymorphicShadows;

  const isDesktop = width >= 1024;
  const isMobile = width < 768;

  // Plan entitlement state: true = Pro Plan (Included), false = Standard Plan (Locked)
  const [isProEntitled, setIsProEntitled] = useState(true);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'tests' | 'bank' | 'simulator' | 'analytics'>('tests');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Interactive Timed Exam Modal State
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins test
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Countdown timer for simulator
  useEffect(() => {
    let timer: any;
    if (isExamModalOpen && !examSubmitted && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isExamModalOpen, examSubmitted, secondsRemaining]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    let correct = 0;
    SAMPLE_EXAM_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    return {
      correct,
      total: SAMPLE_EXAM_QUESTIONS.length,
      percentage: Math.round((correct / SAMPLE_EXAM_QUESTIONS.length) * 100),
    };
  };

  return (
    <View style={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <View style={[styles.toastContainer, { backgroundColor: isDark ? '#203A2D' : '#245C48' }]}>
          <Sparkles size={16} color="#55B58D" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & TENANT SUBSCRIPTION PLAN CONTROLLER                       */}
      {/* ========================================================================= */}
      <View
        style={[
          styles.headerCard,
          {
            backgroundColor: colors.surface.card,
            borderColor: colors.surface.border,
            ...shadows.card,
          },
        ]}>
        <View style={styles.headerInfo}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.headerIconContainer, { backgroundColor: isDark ? '#245C48' : '#E8EEE5' }]}>
              <GraduationCap size={24} color={isDark ? '#55B58D' : '#245C48'} strokeWidth={2.2} />
            </View>
            <View>
              <View style={styles.platformBadgeRow}>
                <Text style={[styles.platformKicker, { color: colors.brand.primary }]}>
                  LIBX PLATFORM · SAAS SUITE
                </Text>
                <View
                  style={[
                    styles.tierPill,
                    {
                      backgroundColor: isProEntitled
                        ? isDark ? '#203A2D' : '#E8EEE5'
                        : isDark ? '#3D2820' : '#FDECE8',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.tierPillText,
                      { color: isProEntitled ? (isDark ? '#55B58D' : '#245C48') : '#C76B59' },
                    ]}>
                    {isProEntitled ? 'PRO TIER ACTIVE' : 'STANDARD PLAN (LOCKED)'}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.headerTitle,
                  {
                    color: colors.text.primary,
                    fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                    fontSize: isMobile ? 22 : 28,
                  },
                ]}>
                LibX Exam & Test Prep Suite
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.text.muted }]}>
                Tenant: <Text style={{ fontWeight: '600', color: colors.text.primary }}>Bookworm Library (Main Campus)</Text> · In-house computer-based testing, questions bank, and student performance tracking.
              </Text>
            </View>
          </View>
        </View>

        {/* Demo Switcher for Plan Entitlement */}
        <View style={[styles.planSwitchContainer, { backgroundColor: colors.surface.inset, borderColor: colors.surface.border }]}>
          <Text style={[styles.planSwitchLabel, { color: colors.text.muted }]}>
            Simulate Library Plan:
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setIsProEntitled(!isProEntitled);
              showToast(
                !isProEntitled
                  ? 'Unlocked: Bookworm Library is now on Pro Plan with Exam Suite enabled!'
                  : 'Switched to Standard Tier: Viewing upgrade locked experience.'
              );
            }}
            style={[
              styles.planSwitchButton,
              {
                backgroundColor: isProEntitled ? (isDark ? '#55B58D' : '#245C48') : colors.surface.card,
              },
            ]}>
            {isProEntitled ? (
              <Unlock size={14} color="#FFFFFF" strokeWidth={2.2} />
            ) : (
              <Lock size={14} color={colors.text.secondary} strokeWidth={2.2} />
            )}
            <Text
              style={[
                styles.planSwitchBtnText,
                { color: isProEntitled ? '#FFFFFF' : colors.text.primary },
              ]}>
              {isProEntitled ? 'Pro Entitled (Active)' : 'Standard (Locked Preview)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 2. LOCKED STATE UI (When Library Subscription does not include Exam Suite)*/}
      {/* ========================================================================= */}
      {!isProEntitled ? (
        <View
          style={[
            styles.lockedCard,
            {
              backgroundColor: colors.surface.card,
              borderColor: colors.surface.border,
              ...shadows.card,
            },
          ]}>
          <View style={[styles.lockedIconWrapper, { backgroundColor: isDark ? '#2C2317' : '#FCF6EC' }]}>
            <Lock size={36} color="#B58A4A" strokeWidth={2.2} />
          </View>

          <Text
            style={[
              styles.lockedHeading,
              {
                color: colors.text.primary,
                fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
              },
            ]}>
            Exam Suite is a LibX Pro Feature
          </Text>

          <Text style={[styles.lockedDesc, { color: colors.text.secondary }]}>
            Bookworm Library is currently on the <Text style={{ fontWeight: '700' }}>Standard Library Tier</Text>.
            The LibX Exam Suite provides your enrolled students with full mock tests, live timed exam practice, 15,000+ topic-wise questions bank, and automated scoring reports.
          </Text>

          {/* Value Highlights Grid */}
          <View style={styles.lockedFeaturesRow}>
            {[
              {
                title: '15,000+ Curated Question Bank',
                desc: 'Comprehensive coverage for UPSC, CA, Banking, SSC, and NEET.',
              },
              {
                title: 'Boost Library Seat Retention',
                desc: 'Students studying for competitive exams stay 3.5 months longer on average.',
              },
              {
                title: 'Timed Exam Simulator',
                desc: 'Real exam environment with instant scoring and detailed answer keys.',
              },
              {
                title: 'Batch & Shift Test Assignments',
                desc: 'Schedule weekly Sunday mock tests for your morning & evening shift members.',
              },
            ].map((feature, i) => (
              <View
                key={i}
                style={[
                  styles.lockedFeatureItem,
                  {
                    backgroundColor: colors.surface.inset,
                    borderColor: colors.surface.border,
                  },
                ]}>
                <CheckCircle2 size={18} color="#55B58D" strokeWidth={2.2} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.lockedFeatureTitle, { color: colors.text.primary }]}>
                    {feature.title}
                  </Text>
                  <Text style={[styles.lockedFeatureDesc, { color: colors.text.muted }]}>
                    {feature.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Pricing & CTA */}
          <View style={[styles.lockedActionBox, { backgroundColor: isDark ? '#1C261F' : '#E8EEE5', borderColor: colors.surface.border }]}>
            <View>
              <Text style={[styles.pricingKicker, { color: colors.brand.primary }]}>
                EXCLUSIVE TENANT ADD-ON
              </Text>
              <Text style={[styles.pricingAmount, { color: colors.text.primary }]}>
                ₹1,499<Text style={styles.pricingPeriod}> / month per library branch</Text>
              </Text>
              <Text style={[styles.pricingGuarantee, { color: colors.text.muted }]}>
                Unlimited mock tests · Unlimited students · No per-seat surcharge
              </Text>
            </View>

            <View style={styles.lockedCtaGroup}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setIsProEntitled(true);
                  showToast('🎉 LibX Pro Plan activated! Enjoy the full Exam Suite.');
                }}
                style={[styles.upgradeBtn, { backgroundColor: colors.brand.primary }]}>
                <Sparkles size={16} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.upgradeBtnText}>Upgrade Bookworm Library to Pro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setIsProEntitled(true);
                  setActiveTab('simulator');
                  setIsExamModalOpen(true);
                }}
                style={[styles.tryDemoBtn, { borderColor: colors.surface.border, backgroundColor: colors.surface.card }]}>
                <Play size={15} color={colors.text.primary} strokeWidth={2} />
                <Text style={[styles.tryDemoBtnText, { color: colors.text.primary }]}>
                  Test-Drive Simulator Demo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* ========================================================================= */
        /* 3. UNLOCKED PRO EXPERIENCE (Full interactive module)                      */
        /* ========================================================================= */
        <>
          {/* Quick Stats Metrics */}
          <View style={styles.statsRow}>
            {[
              {
                label: 'Total Mock Tests Taken',
                val: '1,842',
                change: '+24% this month',
                icon: FileText,
                color: '#245C48',
              },
              {
                label: 'Question Bank Size',
                val: '15,200+',
                change: 'Updated 2 days ago',
                icon: BookOpen,
                color: '#B58A4A',
              },
              {
                label: 'Avg. Library Score',
                val: '76.4%',
                change: '+5.2% vs national',
                icon: Award,
                color: '#55B58D',
              },
              {
                label: 'Active Test Takers Now',
                val: '38 Students',
                change: 'In Quiet & Focus Halls',
                icon: Users,
                color: '#3B82F6',
              },
            ].map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <View
                  key={i}
                  style={[
                    styles.metricCard,
                    {
                      backgroundColor: colors.surface.card,
                      borderColor: colors.surface.border,
                      ...shadows.card,
                    },
                  ]}>
                  <View style={styles.metricTop}>
                    <Text style={[styles.metricLabel, { color: colors.text.muted }]}>
                      {stat.label}
                    </Text>
                    <View style={[styles.metricIconWrap, { backgroundColor: isDark ? colors.surface.inset : '#F5F1E8' }]}>
                      <IconComp size={16} color={stat.color} strokeWidth={2.2} />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.metricValue,
                      {
                        color: colors.text.primary,
                        fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                      },
                    ]}>
                    {stat.val}
                  </Text>
                  <Text style={[styles.metricChange, { color: colors.text.secondary }]}>
                    {stat.change}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Sub Navigation Bar */}
          <View
            style={[
              styles.navTabsBar,
              {
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.border,
                ...shadows.card,
              },
            ]}>
            <View style={styles.navTabsGroup}>
              {[
                { id: 'tests', label: 'Mock Test Series', icon: Layers },
                { id: 'bank', label: 'Question Bank (15k+)', icon: BookOpen },
                { id: 'simulator', label: 'Live Exam Simulator', icon: Play },
                { id: 'analytics', label: 'Student Performance', icon: BarChart3 },
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                const IconC = tab.icon;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id as any)}
                    style={[
                      styles.tabBtn,
                      isSelected && {
                        backgroundColor: isDark ? '#203A2D' : '#E8EEE5',
                        borderColor: isDark ? '#55B58D' : '#245C48',
                      },
                    ]}>
                    <IconC
                      size={15}
                      color={isSelected ? (isDark ? '#55B58D' : '#245C48') : colors.text.secondary}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.tabBtnText,
                        {
                          color: isSelected ? (isDark ? '#55B58D' : '#245C48') : colors.text.secondary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setCurrentQuestionIdx(0);
                setSelectedAnswers({});
                setMarkedForReview({});
                setSecondsRemaining(900);
                setExamSubmitted(false);
                setIsExamModalOpen(true);
              }}
              style={[styles.launchExamCta, { backgroundColor: colors.brand.primary }]}>
              <Play size={14} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.launchExamCtaText}>Start Timed Test Now</Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: MOCK TEST SERIES */}
          {activeTab === 'tests' && (
            <View style={styles.tabContentArea}>
              {/* Filter & Search Bar */}
              <View
                style={[
                  styles.filterRow,
                  {
                    backgroundColor: colors.surface.card,
                    borderColor: colors.surface.border,
                    ...shadows.card,
                  },
                ]}>
                <View
                  style={[
                    styles.searchInputBox,
                    {
                      backgroundColor: colors.surface.inset,
                      borderColor: colors.surface.border,
                    },
                  ]}>
                  <Search size={15} color={colors.text.muted} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search test by name or category (UPSC, CA, Banking)..."
                    placeholderTextColor={colors.text.faint}
                    style={[styles.searchInputText, { color: colors.text.primary }]}
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <X size={14} color={colors.text.muted} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* Category Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPills}>
                  {['All', 'Civil Services', 'Chartered Accountancy', 'Banking', 'Staff Selection'].map((cat) => {
                    const isSelected = selectedCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setSelectedCategory(cat)}
                        style={[
                          styles.catPill,
                          {
                            backgroundColor: isSelected
                              ? isDark ? '#203A2D' : '#E8EEE5'
                              : colors.surface.inset,
                            borderColor: isSelected
                              ? isDark ? '#55B58D' : '#245C48'
                              : colors.surface.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.catPillText,
                            {
                              color: isSelected
                                ? isDark ? '#55B58D' : '#245C48'
                                : colors.text.secondary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Mock Test Cards Grid */}
              <View style={styles.testsGrid}>
                {SAMPLE_TESTS.map((test) => (
                  <View
                    key={test.id}
                    style={[
                      styles.testCard,
                      {
                        backgroundColor: colors.surface.card,
                        borderColor: colors.surface.border,
                        ...shadows.card,
                      },
                    ]}>
                    <View style={styles.testCardHeader}>
                      <View style={styles.testBadgeRow}>
                        <View
                          style={[
                            styles.testCategoryBadge,
                            { backgroundColor: isDark ? colors.surface.inset : '#F5F1E8' },
                          ]}>
                          <Text style={[styles.testCategoryText, { color: colors.brand.primary }]}>
                            {test.category}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.difficultyBadge,
                            {
                              backgroundColor:
                                test.difficulty === 'Advanced'
                                  ? isDark ? '#3D2020' : '#FDECE8'
                                  : isDark ? '#2C2B1B' : '#FEF8EA',
                            },
                          ]}>
                          <Text
                            style={[
                              styles.difficultyText,
                              {
                                color:
                                  test.difficulty === 'Advanced' ? '#C76B59' : '#B58A4A',
                              },
                            ]}>
                            {test.difficulty}
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.testCardTitle,
                          {
                            color: colors.text.primary,
                            fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                          },
                        ]}>
                        {test.title}
                      </Text>
                    </View>

                    <View style={[styles.testMetricsDivider, { borderColor: colors.surface.border }]} />

                    <View style={styles.testDetailsRow}>
                      <View style={styles.testDetailItem}>
                        <Clock size={13} color={colors.text.muted} />
                        <Text style={[styles.testDetailLabel, { color: colors.text.secondary }]}>
                          {test.durationMinutes} mins
                        </Text>
                      </View>
                      <View style={styles.testDetailItem}>
                        <FileText size={13} color={colors.text.muted} />
                        <Text style={[styles.testDetailLabel, { color: colors.text.secondary }]}>
                          {test.totalQuestions} questions
                        </Text>
                      </View>
                      <View style={styles.testDetailItem}>
                        <Award size={13} color={colors.text.muted} />
                        <Text style={[styles.testDetailLabel, { color: colors.text.secondary }]}>
                          {test.totalMarks} marks ({test.negativeMarking})
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.testCardFooter, { backgroundColor: colors.surface.inset }]}>
                      <View style={styles.enrolledInfo}>
                        <Users size={13} color={colors.text.muted} />
                        <Text style={[styles.enrolledText, { color: colors.text.muted }]}>
                          <Text style={{ fontWeight: '700', color: colors.text.primary }}>{test.enrolledStudents}</Text> library students enrolled
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          setCurrentQuestionIdx(0);
                          setSelectedAnswers({});
                          setMarkedForReview({});
                          setSecondsRemaining(test.durationMinutes * 60);
                          setExamSubmitted(false);
                          setIsExamModalOpen(true);
                        }}
                        style={[styles.startTestBtn, { backgroundColor: colors.brand.primary }]}>
                        <Play size={13} color="#FFFFFF" strokeWidth={2.4} />
                        <Text style={styles.startTestBtnText}>Launch Test</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: QUESTION BANK */}
          {activeTab === 'bank' && (
            <View
              style={[
                styles.contentPlaceholderCard,
                {
                  backgroundColor: colors.surface.card,
                  borderColor: colors.surface.border,
                  ...shadows.card,
                },
              ]}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                <BookOpen size={28} color={isDark ? '#55B58D' : '#245C48'} />
              </View>
              <Text
                style={[
                  styles.placeholderHeading,
                  {
                    color: colors.text.primary,
                    fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                  },
                ]}>
                LibX Central Question Repository
              </Text>
              <Text style={[styles.placeholderSubtitle, { color: colors.text.secondary }]}>
                15,200+ vetted multiple-choice questions categorized across 18 competitive exam domains with detailed explanations, NCERT references, and historical weightage.
              </Text>

              <View style={styles.bankSubjectsGrid}>
                {[
                  { name: 'Indian Polity & Constitution', count: '2,450 questions', tag: 'High Weightage' },
                  { name: 'Quantitative Aptitude & DI', count: '3,800 questions', tag: 'Formula Sheets Inc.' },
                  { name: 'Modern Indian & World History', count: '1,920 questions', tag: 'Chronological' },
                  { name: 'Logical & Analytical Reasoning', count: '2,650 questions', tag: 'Speed Drills' },
                  { name: 'General Science & Environment', count: '2,180 questions', tag: 'NCERT aligned' },
                  { name: 'Macroeconomics & Public Finance', count: '2,200 questions', tag: 'Current Trends' },
                ].map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.bankSubjectCard,
                      {
                        backgroundColor: colors.surface.inset,
                        borderColor: colors.surface.border,
                      },
                    ]}>
                    <View style={styles.bankSubjectHeader}>
                      <Text style={[styles.bankSubjectName, { color: colors.text.primary }]}>
                        {item.name}
                      </Text>
                      <View style={[styles.bankTag, { backgroundColor: isDark ? '#245C48' : '#245C48' }]}>
                        <Text style={styles.bankTagText}>{item.tag}</Text>
                      </View>
                    </View>
                    <Text style={[styles.bankSubjectCount, { color: colors.text.muted }]}>
                      {item.count}
                    </Text>
                    <TouchableOpacity
                      onPress={() => showToast(`Opened ${item.name} practice set`)}
                      style={styles.practiceSubBtn}>
                      <Text style={[styles.practiceSubText, { color: colors.brand.primary }]}>
                        Practice Questions →
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: SIMULATOR TRIGGER */}
          {activeTab === 'simulator' && (
            <View
              style={[
                styles.contentPlaceholderCard,
                {
                  backgroundColor: colors.surface.card,
                  borderColor: colors.surface.border,
                  ...shadows.card,
                },
              ]}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                <Play size={28} color={isDark ? '#55B58D' : '#245C48'} />
              </View>
              <Text
                style={[
                  styles.placeholderHeading,
                  {
                    color: colors.text.primary,
                    fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                  },
                ]}>
                LibX Interactive Test Simulator
              </Text>
              <Text style={[styles.placeholderSubtitle, { color: colors.text.secondary }]}>
                Experience the exact Computer Based Test (CBT) environment provided to Bookworm Library students with real-time question timers, response marking, and immediate score breakdowns.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setCurrentQuestionIdx(0);
                  setSelectedAnswers({});
                  setMarkedForReview({});
                  setSecondsRemaining(900);
                  setExamSubmitted(false);
                  setIsExamModalOpen(true);
                }}
                style={[styles.startSimulatorBtn, { backgroundColor: colors.brand.primary }]}>
                <Play size={18} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.startSimulatorBtnText}>Launch Test Simulator Modal</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 4: ANALYTICS & LEADERBOARD */}
          {activeTab === 'analytics' && (
            <View
              style={[
                styles.contentPlaceholderCard,
                {
                  backgroundColor: colors.surface.card,
                  borderColor: colors.surface.border,
                  ...shadows.card,
                },
              ]}>
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                <BarChart3 size={28} color={isDark ? '#55B58D' : '#245C48'} />
              </View>
              <Text
                style={[
                  styles.placeholderHeading,
                  {
                    color: colors.text.primary,
                    fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                  },
                ]}>
                Student Performance & Rankings
              </Text>
              <Text style={[styles.placeholderSubtitle, { color: colors.text.secondary }]}>
                Track how Bookworm Library students rank in weekly national mock examinations.
              </Text>

              <View style={styles.leaderboardContainer}>
                {[
                  { rank: '#1', name: 'Rohan Verma', desk: 'Desk D-14', score: '94.5%', tests: 18, exam: 'UPSC CSE' },
                  { rank: '#2', name: 'Ananya Sharma', desk: 'Desk D-02', score: '92.0%', tests: 22, exam: 'CA Final' },
                  { rank: '#3', name: 'Vikram Malhotra', desk: 'Desk D-28', score: '89.5%', tests: 15, exam: 'Bank PO' },
                  { rank: '#4', name: 'Pooja Iyer', desk: 'Desk D-41', score: '88.0%', tests: 14, exam: 'SSC CGL' },
                ].map((item, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.leaderboardRow,
                      {
                        backgroundColor: colors.surface.inset,
                        borderColor: colors.surface.border,
                      },
                    ]}>
                    <Text style={[styles.rankText, { color: colors.brand.primary }]}>{item.rank}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.studentLeaderName, { color: colors.text.primary }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.studentLeaderDesk, { color: colors.text.muted }]}>
                        {item.desk} · {item.exam}
                      </Text>
                    </View>
                    <View style={styles.studentLeaderScoreBox}>
                      <Text style={[styles.studentLeaderScore, { color: colors.text.primary }]}>
                        {item.score}
                      </Text>
                      <Text style={[styles.studentLeaderTests, { color: colors.text.muted }]}>
                        {item.tests} tests
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE TIMED EXAM SIMULATOR MODAL                                 */}
      {/* ========================================================================= */}
      <Modal
        visible={isExamModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsExamModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.examDialog,
              {
                backgroundColor: colors.surface.card,
                borderColor: colors.surface.border,
                ...shadows.card,
              },
            ]}>
            {/* Exam Modal Top Header */}
            <View style={[styles.examHeader, { borderBottomColor: colors.surface.border }]}>
              <View style={styles.examHeaderLeft}>
                <Text style={[styles.examHeaderTitle, { color: colors.text.primary }]}>
                  LibX Live CBT Exam Simulator
                </Text>
                <Text style={[styles.examHeaderSubtitle, { color: colors.text.muted }]}>
                  General Studies & Analytical Reasoning Speed Assessment
                </Text>
              </View>

              <View style={styles.examHeaderRight}>
                {/* Timer Badge */}
                <View
                  style={[
                    styles.timerBadge,
                    {
                      backgroundColor:
                        secondsRemaining < 120
                          ? isDark ? '#3D2020' : '#FDECE8'
                          : isDark ? '#1C261F' : '#E8EEE5',
                    },
                  ]}>
                  <Clock
                    size={14}
                    color={secondsRemaining < 120 ? '#C76B59' : colors.brand.primary}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.timerText,
                      {
                        color: secondsRemaining < 120 ? '#C76B59' : colors.brand.primary,
                      },
                    ]}>
                    Time Left: {formatTimer(secondsRemaining)}
                  </Text>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setIsExamModalOpen(false)}
                  style={[styles.closeModalBtn, { backgroundColor: colors.surface.inset }]}>
                  <X size={18} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Exam Body */}
            {!examSubmitted ? (
              <View style={styles.examModalBody}>
                {/* Question Info Bar */}
                <View style={styles.questionStatusBar}>
                  <Text style={[styles.questionNumberText, { color: colors.brand.primary }]}>
                    Question {currentQuestionIdx + 1} of {SAMPLE_EXAM_QUESTIONS.length}
                  </Text>
                  <Text style={[styles.subjectTag, { color: colors.text.muted }]}>
                    {SAMPLE_EXAM_QUESTIONS[currentQuestionIdx].subject}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setMarkedForReview((prev) => ({
                        ...prev,
                        [currentQuestionIdx]: !prev[currentQuestionIdx],
                      }));
                    }}
                    style={[
                      styles.reviewToggleBtn,
                      markedForReview[currentQuestionIdx] && {
                        backgroundColor: isDark ? '#3D2820' : '#FEF3C7',
                        borderColor: '#B58A4A',
                      },
                    ]}>
                    <Text
                      style={[
                        styles.reviewToggleText,
                        { color: markedForReview[currentQuestionIdx] ? '#B58A4A' : colors.text.secondary },
                      ]}>
                      {markedForReview[currentQuestionIdx] ? '★ Marked for Review' : '☆ Mark for Review'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Question Text */}
                <Text style={[styles.questionText, { color: colors.text.primary }]}>
                  {SAMPLE_EXAM_QUESTIONS[currentQuestionIdx].question}
                </Text>

                {/* Radio Options */}
                <View style={styles.optionsList}>
                  {SAMPLE_EXAM_QUESTIONS[currentQuestionIdx].options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                    return (
                      <TouchableOpacity
                        key={optIdx}
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [currentQuestionIdx]: optIdx,
                          }));
                        }}
                        style={[
                          styles.optionCard,
                          {
                            backgroundColor: isSelected
                              ? isDark ? '#203A2D' : '#EEF4ED'
                              : colors.surface.inset,
                            borderColor: isSelected
                              ? isDark ? '#55B58D' : '#245C48'
                              : colors.surface.border,
                          },
                        ]}>
                        <View
                          style={[
                            styles.radioCircle,
                            {
                              borderColor: isSelected
                                ? isDark ? '#55B58D' : '#245C48'
                                : colors.text.muted,
                              backgroundColor: isSelected
                                ? isDark ? '#55B58D' : '#245C48'
                                : 'transparent',
                            },
                          ]}>
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>
                        <Text
                          style={[
                            styles.optionLabelText,
                            {
                              color: isSelected ? colors.text.primary : colors.text.secondary,
                              fontWeight: isSelected ? '600' : '400',
                            },
                          ]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Question Navigator Palette & Action Footer */}
                <View style={[styles.examFooter, { borderTopColor: colors.surface.border }]}>
                  {/* Palette dots */}
                  <View style={styles.paletteDotsRow}>
                    {SAMPLE_EXAM_QUESTIONS.map((_, dotIdx) => {
                      const isAnswered = selectedAnswers[dotIdx] !== undefined;
                      const isCurrent = currentQuestionIdx === dotIdx;
                      return (
                        <TouchableOpacity
                          key={dotIdx}
                          onPress={() => setCurrentQuestionIdx(dotIdx)}
                          style={[
                            styles.paletteDot,
                            {
                              backgroundColor: isCurrent
                                ? (isDark ? '#55B58D' : '#245C48')
                                : isAnswered
                                ? (isDark ? '#203A2D' : '#A5B99E')
                                : colors.surface.inset,
                              borderColor: isCurrent ? colors.text.primary : colors.surface.border,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.paletteDotText,
                              {
                                color: isCurrent || isAnswered ? '#FFFFFF' : colors.text.secondary,
                              },
                            ]}>
                            {dotIdx + 1}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Navigation Buttons */}
                  <View style={styles.modalActionButtons}>
                    <TouchableOpacity
                      disabled={currentQuestionIdx === 0}
                      onPress={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                      style={[
                        styles.navBtn,
                        { borderColor: colors.surface.border, opacity: currentQuestionIdx === 0 ? 0.4 : 1 },
                      ]}>
                      <Text style={[styles.navBtnText, { color: colors.text.primary }]}>Previous</Text>
                    </TouchableOpacity>

                    {currentQuestionIdx < SAMPLE_EXAM_QUESTIONS.length - 1 ? (
                      <TouchableOpacity
                        onPress={() => setCurrentQuestionIdx((p) => p + 1)}
                        style={[styles.nextBtn, { backgroundColor: colors.brand.primary }]}>
                        <Text style={styles.nextBtnText}>Next Question</Text>
                        <ChevronRight size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => setExamSubmitted(true)}
                        style={[styles.submitExamBtn, { backgroundColor: '#55B58D' }]}>
                        <Check size={14} color="#FFFFFF" strokeWidth={2.4} />
                        <Text style={styles.submitExamBtnText}>Submit & Grade</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              /* Exam Result View */
              <View style={styles.examResultBody}>
                <View style={[styles.resultIconWrap, { backgroundColor: isDark ? '#203A2D' : '#E8EEE5' }]}>
                  <Award size={40} color={isDark ? '#55B58D' : '#245C48'} />
                </View>

                <Text
                  style={[
                    styles.resultTitle,
                    {
                      color: colors.text.primary,
                      fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
                    },
                  ]}>
                  Test Completed & Graded!
                </Text>

                <Text style={[styles.resultScore, { color: colors.brand.primary }]}>
                  Score: {calculateScore().correct} / {calculateScore().total} ({calculateScore().percentage}%)
                </Text>

                <Text style={[styles.resultSubtitle, { color: colors.text.secondary }]}>
                  Great work! Your score has been logged to the Bookworm Library candidate analytics board.
                </Text>

                <View style={styles.answersReviewList}>
                  {SAMPLE_EXAM_QUESTIONS.map((q, qIndex) => {
                    const isCorrect = selectedAnswers[qIndex] === q.correctIndex;
                    return (
                      <View
                        key={qIndex}
                        style={[
                          styles.reviewQuestionItem,
                          {
                            backgroundColor: colors.surface.inset,
                            borderColor: colors.surface.border,
                          },
                        ]}>
                        <View style={styles.reviewQuestionHeader}>
                          <Text style={[styles.reviewQIndex, { color: colors.text.primary }]}>
                            Q{qIndex + 1}. {q.question}
                          </Text>
                          <View
                            style={[
                              styles.resultTagBadge,
                              { backgroundColor: isCorrect ? '#E8EEE5' : '#FDECE8' },
                            ]}>
                            <Text
                              style={[
                                styles.resultTagBadgeText,
                                { color: isCorrect ? '#245C48' : '#C76B59' },
                              ]}>
                              {isCorrect ? 'Correct (+2)' : 'Incorrect (0)'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.explanationText, { color: colors.text.muted }]}>
                          ✓ Correct answer: <Text style={{ color: colors.text.primary, fontWeight: '600' }}>{q.options[q.correctIndex]}</Text>
                          {'\n'}{q.explanation}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setIsExamModalOpen(false);
                    setExamSubmitted(false);
                  }}
                  style={[styles.closeResultBtn, { backgroundColor: colors.brand.primary }]}>
                  <Text style={styles.closeResultBtnText}>Close Test Simulator</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 40,
  },
  toastContainer: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // 1. Header Card
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerInfo: {
    flex: 1,
    minWidth: 280,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  platformKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  planSwitchContainer: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  planSwitchLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  planSwitchBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },

  // 2. Locked State Card
  lockedCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  lockedIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockedHeading: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  lockedDesc: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 640,
    marginBottom: 28,
  },
  lockedFeaturesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
    marginBottom: 28,
  },
  lockedFeatureItem: {
    flex: 1,
    minWidth: 260,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  lockedFeatureTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  lockedFeatureDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  lockedActionBox: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  pricingKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  pricingAmount: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 4,
  },
  pricingPeriod: {
    fontSize: 13,
    fontWeight: '400',
  },
  pricingGuarantee: {
    fontSize: 12,
  },
  lockedCtaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  tryDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tryDemoBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // 3. Unlocked Metrics Row
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 11.5,
    fontWeight: '500',
  },

  // Sub Navigation Bar
  navTabsBar: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  navTabsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabBtnText: {
    fontSize: 13,
  },
  launchExamCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  launchExamCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Mock Tests Content Area
  tabContentArea: {
    gap: 16,
  },
  filterRow: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  searchInputBox: {
    flex: 1,
    minWidth: 260,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInputText: {
    flex: 1,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  categoryPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  testCard: {
    width: '100%',
    maxWidth: 580,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  testCardHeader: {
    padding: 20,
    gap: 8,
  },
  testBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  testCategoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  testCategoryText: {
    fontSize: 11,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  testCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  testMetricsDivider: {
    borderTopWidth: 1,
  },
  testDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  testDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  testDetailLabel: {
    fontSize: 12,
  },
  testCardFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  enrolledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  enrolledText: {
    fontSize: 12,
  },
  startTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startTestBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Placeholder & Extra Tabs
  contentPlaceholderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 28,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  placeholderHeading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 13.5,
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 20,
    marginBottom: 24,
  },
  bankSubjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
  },
  bankSubjectCard: {
    flex: 1,
    minWidth: 260,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  bankSubjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankSubjectName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  bankTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bankTagText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  bankSubjectCount: {
    fontSize: 12,
  },
  practiceSubBtn: {
    marginTop: 6,
  },
  practiceSubText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startSimulatorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
  },
  startSimulatorBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  leaderboardContainer: {
    width: '100%',
    maxWidth: 640,
    gap: 10,
  },
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '800',
    width: 32,
  },
  studentLeaderName: {
    fontSize: 14,
    fontWeight: '700',
  },
  studentLeaderDesk: {
    fontSize: 12,
    marginTop: 1,
  },
  studentLeaderScoreBox: {
    alignItems: 'flex-end',
  },
  studentLeaderScore: {
    fontSize: 16,
    fontWeight: '800',
  },
  studentLeaderTests: {
    fontSize: 11,
  },

  // Modal Dialog Styling
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 21, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  examDialog: {
    width: '100%',
    maxWidth: 820,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
  },
  examHeaderLeft: {
    gap: 2,
  },
  examHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  examHeaderSubtitle: {
    fontSize: 12,
  },
  examHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timerText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  closeModalBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examModalBody: {
    padding: 24,
    gap: 18,
  },
  questionStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  questionNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subjectTag: {
    fontSize: 12,
    fontWeight: '500',
  },
  reviewToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reviewToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16.5,
    lineHeight: 24,
    fontWeight: '600',
    marginTop: 4,
  },
  optionsList: {
    gap: 10,
    marginTop: 6,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  optionLabelText: {
    fontSize: 14,
    flex: 1,
  },
  examFooter: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 14,
  },
  paletteDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paletteDot: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteDotText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  submitExamBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  submitExamBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  examResultBody: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  resultIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  resultScore: {
    fontSize: 20,
    fontWeight: '800',
  },
  resultSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 480,
  },
  answersReviewList: {
    width: '100%',
    gap: 10,
    marginTop: 10,
    maxHeight: 280,
  },
  reviewQuestionItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  reviewQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewQIndex: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  resultTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  resultTagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 16,
  },
  closeResultBtn: {
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeResultBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
