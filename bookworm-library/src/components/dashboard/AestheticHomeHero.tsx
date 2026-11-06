import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Wifi,
  Wind,
  Zap,
  ShieldCheck,
  BookOpen,
  Camera,
  Check,
  X,
  Send,
  Bell,
  Star,
  Users,
  Armchair,
  Settings,
  ChevronDown,
  Layers,
  CheckCircle2,
} from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

// Curated high-resolution study library interior photos
const LIBRARY_PHOTO_PRESETS = [
  {
    id: 'warm-wood',
    title: 'Warm Wooden Desks & Lamps',
    sub: 'Individual reading lights, private study partitions',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'modern-sanctuary',
    title: 'Modern Minimalist Hall',
    sub: 'Spacious desks, serene quiet focus room',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'executive-cubicles',
    title: 'Executive Cubicles & Cabins',
    sub: 'Private study pods with ergonomic chairs',
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'book-aisles',
    title: 'Classic Study Aisle',
    sub: 'High shelves, ambient cozy golden lighting',
    url: 'https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=1600&q=80',
  },
];

// Student avatar previews for social proof stack
const STUDENT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
];

interface AestheticHomeHeroProps {
  onNavigateToSeats?: () => void;
  onAddStudent?: () => void;
}

export function AestheticHomeHero({ onNavigateToSeats, onAddStudent }: AestheticHomeHeroProps) {
  const { width } = useWindowDimensions();
  const { colors, shadows, isDark } = useThemeMode();

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  // State for library presentation
  const [heroImage, setHeroImage] = useState<string>(LIBRARY_PHOTO_PRESETS[0].url);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('warm-wood');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [libraryName, setLibraryName] = useState<string>('Bookworm Library');
  const [tagline, setTagline] = useState<string>('Quiet Spaces That Drive Top Results');
  const [locationName, setLocationName] = useState<string>('Civil Lines, Central Square • Open 24/7');

  // "Let's Connect with Update Features" Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'broadcast' | 'features' | 'profile' | 'shifts'>('broadcast');

  // Interactive Form States
  const [broadcastTitle, setBroadcastTitle] = useState('Extended Hours for Exam Preparation');
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Attention all aspirants: From this Monday, the Night Shift (Shift 3) will have dedicated silent AC zones and complimentary coffee for UPSC & CA prelims prep!'
  );
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  // Active Features Toggles
  const [featuresList, setFeaturesList] = useState([
    { id: 'wifi', label: '1 Gbps Ultra Fiber Wi-Fi', active: true, icon: Wifi },
    { id: 'ac', label: '100% Inverter Silent AC', active: true, icon: Wind },
    { id: 'power', label: 'Dedicated Socket & USB at Every Desk', active: true, icon: Zap },
    { id: 'cctv', label: '24/7 CCTV & Biometric Turnstile', active: true, icon: ShieldCheck },
  ]);

  const toggleFeature = (id: string) => {
    setFeaturesList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f))
    );
  };

  const handleSendBroadcast = () => {
    setBroadcastStatus('Sending announcement to 128 enrolled students via WhatsApp & SMS...');
    setTimeout(() => {
      setBroadcastStatus('✅ Announcement successfully delivered to 128 students!');
      setTimeout(() => setBroadcastStatus(null), 3000);
    }, 900);
  };

  const handleSelectPreset = (preset: typeof LIBRARY_PHOTO_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setHeroImage(preset.url);
  };

  const handleApplyCustomUrl = () => {
    if (customImageUrl.trim()) {
      setHeroImage(customImageUrl.trim());
      setSelectedPresetId('custom');
      setCustomImageUrl('');
    }
  };

  return (
    <View style={styles.outerContainer}>
      {/* ========================================================================= */}
      {/* 1. FLOATING PILL TOP NAVBAR (Inspired directly by the RESUMX pill header) */}
      {/* ========================================================================= */}
      <View style={styles.floatingNavWrapper}>
        <View style={styles.floatingNavPill}>
          {/* Brand Logo Pill */}
          <View style={styles.brandBadgePill}>
            <View style={styles.brandLogoDot} />
            <Text style={styles.brandLogoText}>BOOKWORM LIB</Text>
          </View>

          {/* Center Navigation Links (Hidden on mobile for sleek spacing) */}
          {!isMobile && (
            <View style={styles.navLinksRow}>
              <TouchableOpacity activeOpacity={0.7} style={styles.navLinkItem}>
                <Text style={styles.navLinkActiveText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.navLinkItem}
                onPress={onNavigateToSeats}>
                <Text style={styles.navLinkText}>Seat Matrix</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Shifts</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Amenities</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} style={styles.navLinkItem}>
                <Text style={styles.navLinkText}>Plans</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.navLinkItem}
                onPress={() => setIsUpdateModalOpen(true)}>
                <View style={styles.navDropdownRow}>
                  <Text style={styles.navLinkText}>Updates</Text>
                  <ChevronDown size={13} color="#94A3B8" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Right White Pill CTA Button ("Let's Connect" in reference image) */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setIsUpdateModalOpen(true)}
            style={styles.navRightPillBtn}>
            <Text style={styles.navRightPillBtnText}>Let's Connect</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION: Charcoal Canvas with Warm Radiant Orange Gradient Glow   */}
      {/* ========================================================================= */}
      <View style={[styles.heroCardContainer, shadows.lg]}>
        {/* Radiant Orange Glow Overlay in Background */}
        <View style={styles.ambientGlowOrange} pointerEvents="none" />
        <View style={styles.ambientGlowBottomSweep} pointerEvents="none" />

        <View style={[styles.heroContentRow, isMobile && styles.heroContentStacked]}>
          {/* ------------------------------------------------------------- */}
          {/* LEFT COLUMN: Punchy Typography, CTAs, Social Proof Stack     */}
          {/* ------------------------------------------------------------- */}
          <View style={[styles.leftColumn, isMobile && styles.leftColumnFull]}>
            {/* Top Eyebrow Tag */}
            <View style={styles.eyebrowTagRow}>
              <Text style={styles.eyebrowTagText}>
                {locationName}
              </Text>
            </View>

            {/* Huge Headline: "Quiet Spaces That Drive Real Results" */}
            <Text style={[styles.heroMainHeading, isMobile && styles.heroMainHeadingMobile]}>
              Quiet Spaces That{'\n'}
              <Text style={styles.heroHeadingHighlight}>Drive Top Results</Text>
            </Text>

            {/* Subtitle */}
            <Text style={styles.heroSubText}>
              A high-focus self-study sanctuary built for civil services, medical, and professional aspirants.
              Ergonomic cubicles, guaranteed pin-drop silence, and 24/7 dedicated amenities.
            </Text>

            {/* Button & Live Status Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsUpdateModalOpen(true)}
                style={styles.primaryOrangeBtn}>
                <Text style={styles.primaryOrangeBtnText}>Let's Connect</Text>
                <ArrowRight size={17} color="#FFFFFF" strokeWidth={2.4} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onNavigateToSeats}
                style={styles.availableDesksPill}>
                <View style={styles.pulsingGreenDot} />
                <Text style={styles.availableDesksText}>14 Desks Vacant Today</Text>
              </TouchableOpacity>
            </View>

            {/* Social Proof: Overlapping Student Avatars + Star Rating */}
            <View style={styles.socialProofContainer}>
              <View style={styles.avatarStack}>
                {STUDENT_AVATARS.map((uri, index) => (
                  <Image
                    key={index}
                    source={{ uri }}
                    style={[
                      styles.avatarCircle,
                      { marginLeft: index === 0 ? 0 : -10 },
                    ]}
                    contentFit="cover"
                  />
                ))}
              </View>
              <View style={styles.socialProofTextGroup}>
                <Text style={styles.socialProofTitle}>Loved by 128+ aspirants</Text>
                <View style={styles.starRatingRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={13} color="#F59E0B" fill="#F59E0B" />
                  ))}
                  <Text style={styles.ratingNumber}>4.9/5 Library Rating</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT COLUMN: Aesthetic Physical Library Showcase Mockup      */}
          {/* ------------------------------------------------------------- */}
          <View style={[styles.rightColumn, isMobile && styles.rightColumnFull]}>
            <View style={styles.mockupFrame}>
              {/* Library Photo with soft inner border */}
              <Image
                source={{ uri: heroImage }}
                style={styles.mockupImage}
                contentFit="cover"
                transition={500}
              />
              <View style={styles.mockupImageShade} />

              {/* Floating Badge 1 (Top Left Overlap): Desk Assignment Inspector */}
              <View style={styles.floatingDeskCard}>
                <View style={styles.floatingDeskCardHeader}>
                  <View style={styles.deskTag}>
                    <Text style={styles.deskTagText}>DESK D-14</Text>
                  </View>
                  <View style={styles.deskStatusLive}>
                    <View style={styles.liveTinyDot} />
                    <Text style={styles.deskStatusLiveText}>ASSIGNED</Text>
                  </View>
                </View>
                <Text style={styles.floatingStudentName}>Rahul Sharma</Text>
                <Text style={styles.floatingShiftDetails}>Shift 2: Evening (2:00 PM – 10:00 PM)</Text>
              </View>

              {/* Floating Badge 2 (Interactive Floating 3D Badge like the Figma badge in reference) */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setIsUpdateModalOpen(true)}
                style={styles.floatingAppBadge}>
                <BookOpen size={24} color="#FFFFFF" strokeWidth={2.4} />
              </TouchableOpacity>

              {/* Floating Badge 3 (Bottom Right): Change Photo Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setActiveTab('profile');
                  setIsUpdateModalOpen(true);
                }}
                style={styles.floatingPhotoTrigger}>
                <Camera size={14} color="#FFFFFF" strokeWidth={2.2} />
                <Text style={styles.floatingPhotoTriggerText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* 3. BOTTOM CARDS ROW: 3 Modular Showcase Cards (Matching Reference Photo)  */}
        {/* ========================================================================= */}
        <View style={[styles.bottomCardsGrid, isMobile && styles.bottomCardsGridMobile]}>
          {/* Card 1: 3 Daily Shifts */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              setActiveTab('shifts');
              setIsUpdateModalOpen(true);
            }}
            style={styles.featureCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                <Clock size={18} color="#F97316" strokeWidth={2.2} />
              </View>
              <Text style={styles.cardHeaderCategory}>FLEXIBLE TIMINGS</Text>
            </View>
            <Text style={styles.cardTitle}>3 Daily Study Shifts</Text>
            <Text style={styles.cardDesc}>
              Morning (6 AM - 2 PM), Evening (2 PM - 10 PM), and Night Owl (10 PM - 6 AM). Switch shifts as exams approach.
            </Text>
            <View style={styles.cardFooterStats}>
              <Text style={styles.cardFooterStatsText}>86 Active Students In Shift 1</Text>
            </View>
          </TouchableOpacity>

          {/* Card 2: 3-Tier Seating Matrix */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onNavigateToSeats}
            style={styles.featureCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Armchair size={18} color="#38BDF8" strokeWidth={2.2} />
              </View>
              <Text style={styles.cardHeaderCategory}>CUSTOM SEAT RANGE</Text>
            </View>
            <Text style={styles.cardTitle}>1 to 150 Desk Matrix</Text>
            <Text style={styles.cardDesc}>
              Divided into Exclusive Cabins, Premium Desks, and Classic Study Pods with individual charging ports.
            </Text>
            <View style={styles.cardFooterStats}>
              <Text style={styles.cardFooterStatsText}>14 Desks Available • ₹900 - ₹1,500/mo</Text>
            </View>
          </TouchableOpacity>

          {/* Card 3: Smart Amenities & Rules */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              setActiveTab('features');
              setIsUpdateModalOpen(true);
            }}
            style={styles.featureCard}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <ShieldCheck size={18} color="#10B981" strokeWidth={2.2} />
              </View>
              <Text style={styles.cardHeaderCategory}>QUIET ZONE ASSURANCE</Text>
            </View>
            <Text style={styles.cardTitle}>High-Speed Amenities</Text>
            <Text style={styles.cardDesc}>
              Dual-band fiber Wi-Fi, 100% Inverter AC backup, biometric turnstiles, RO water, and strict whisper rules.
            </Text>
            <View style={styles.cardFooterStats}>
              <Text style={styles.cardFooterStatsText}>Tap to Update Amenities →</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 4. MODAL: "LET'S CONNECT WITH UPDATE FEATURES" (Interactive Admin Hub)    */}
      {/* ========================================================================= */}
      <Modal
        visible={isUpdateModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsUpdateModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.dialogCard, shadows.lg, { backgroundColor: isDark ? '#111827' : '#FFFFFF' }]}>
            {/* Modal Header */}
            <View style={[styles.dialogHeader, { borderBottomColor: isDark ? '#1F2937' : '#E2E8F0' }]}>
              <View style={styles.dialogHeaderLeft}>
                <View style={styles.dialogHeaderIconBox}>
                  <Sparkles size={20} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <View>
                  <Text style={[styles.dialogTitle, { color: isDark ? '#F9FAFB' : '#0F172A' }]}>
                    Let's Connect & Update
                  </Text>
                  <Text style={[styles.dialogSubtitle, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                    Broadcast announcements, update interior photos & library features
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsUpdateModalOpen(false)}
                style={[styles.closeModalBtn, { backgroundColor: isDark ? '#1F2937' : '#F1F5F9' }]}>
                <X size={18} color={isDark ? '#D1D5DB' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Modal Tabs Bar */}
            <View style={[styles.modalTabsBar, { borderBottomColor: isDark ? '#1F2937' : '#E2E8F0' }]}>
              <TouchableOpacity
                onPress={() => setActiveTab('broadcast')}
                style={[styles.tabButton, activeTab === 'broadcast' && styles.tabButtonActive]}>
                <Bell size={15} color={activeTab === 'broadcast' ? '#F97316' : '#94A3B8'} />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'broadcast' && styles.tabButtonTextActive,
                  ]}>
                  Broadcast Notice
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('features')}
                style={[styles.tabButton, activeTab === 'features' && styles.tabButtonActive]}>
                <Zap size={15} color={activeTab === 'features' ? '#F97316' : '#94A3B8'} />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'features' && styles.tabButtonTextActive,
                  ]}>
                  Library Amenities
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('profile')}
                style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}>
                <Camera size={15} color={activeTab === 'profile' ? '#F97316' : '#94A3B8'} />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'profile' && styles.tabButtonTextActive,
                  ]}>
                  Interior Photo & Info
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('shifts')}
                style={[styles.tabButton, activeTab === 'shifts' && styles.tabButtonActive]}>
                <Clock size={15} color={activeTab === 'shifts' ? '#F97316' : '#94A3B8'} />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === 'shifts' && styles.tabButtonTextActive,
                  ]}>
                  Shifts & Fees
                </Text>
              </TouchableOpacity>
            </View>

            {/* Modal Tab Content Viewport */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dialogScrollContent}>
              {/* TAB 1: BROADCAST ANNOUNCEMENT */}
              {activeTab === 'broadcast' && (
                <View style={styles.tabSection}>
                  <Text style={[styles.tabSectionHeading, { color: isDark ? '#E5E7EB' : '#1E293B' }]}>
                    Send Instant Notice to 128 Enrolled Students
                  </Text>
                  <Text style={[styles.tabSectionSub, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                    Delivers immediate notifications via WhatsApp message and SMS gateway.
                  </Text>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#334155' }]}>
                      Notice Subject
                    </Text>
                    <TextInput
                      value={broadcastTitle}
                      onChangeText={setBroadcastTitle}
                      style={[
                        styles.inputField,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                          borderColor: isDark ? '#374151' : '#CBD5E1',
                          color: isDark ? '#FFFFFF' : '#0F172A',
                        },
                      ]}
                      placeholder="e.g., Extended study hours for UPSC Mains"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#334155' }]}>
                      Message Text
                    </Text>
                    <TextInput
                      value={broadcastMessage}
                      onChangeText={setBroadcastMessage}
                      multiline
                      numberOfLines={4}
                      style={[
                        styles.textAreaField,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                          borderColor: isDark ? '#374151' : '#CBD5E1',
                          color: isDark ? '#FFFFFF' : '#0F172A',
                        },
                      ]}
                      placeholder="Type announcement here..."
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  {broadcastStatus && (
                    <View style={styles.broadcastStatusBox}>
                      <Text style={styles.broadcastStatusText}>{broadcastStatus}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSendBroadcast}
                    style={styles.sendBroadcastBtn}>
                    <Send size={16} color="#FFFFFF" strokeWidth={2.4} />
                    <Text style={styles.sendBroadcastBtnText}>Send Notice Now</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* TAB 2: LIBRARY AMENITIES TOGGLES */}
              {activeTab === 'features' && (
                <View style={styles.tabSection}>
                  <Text style={[styles.tabSectionHeading, { color: isDark ? '#E5E7EB' : '#1E293B' }]}>
                    Active Library Features & Amenities
                  </Text>
                  <Text style={[styles.tabSectionSub, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                    Toggle what is shown to students and website visitors in real-time.
                  </Text>

                  <View style={styles.featuresListGrid}>
                    {featuresList.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.8}
                          onPress={() => toggleFeature(item.id)}
                          style={[
                            styles.featureToggleCard,
                            {
                              backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                              borderColor: item.active ? '#F97316' : (isDark ? '#374151' : '#E2E8F0'),
                            },
                          ]}>
                          <View style={styles.featureToggleLeft}>
                            <View
                              style={[
                                styles.featureIconCircle,
                                { backgroundColor: item.active ? 'rgba(249, 115, 22, 0.2)' : 'rgba(148, 163, 184, 0.2)' },
                              ]}>
                              <IconComp
                                size={18}
                                color={item.active ? '#F97316' : '#94A3B8'}
                                strokeWidth={2.2}
                              />
                            </View>
                            <Text
                              style={[
                                styles.featureToggleText,
                                { color: isDark ? '#F9FAFB' : '#0F172A' },
                              ]}>
                              {item.label}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.toggleCheckbox,
                              { backgroundColor: item.active ? '#F97316' : 'transparent', borderColor: item.active ? '#F97316' : '#94A3B8' },
                            ]}>
                            {item.active && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* TAB 3: PHOTO PRESETS & LIBRARY INFO */}
              {activeTab === 'profile' && (
                <View style={styles.tabSection}>
                  <Text style={[styles.tabSectionHeading, { color: isDark ? '#E5E7EB' : '#1E293B' }]}>
                    Choose Aesthetic Physical Library Photo
                  </Text>
                  <Text style={[styles.tabSectionSub, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                    Select a high-resolution interior preset or enter your custom library photo URL.
                  </Text>

                  <View style={styles.photoPresetsGrid}>
                    {LIBRARY_PHOTO_PRESETS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;
                      return (
                        <TouchableOpacity
                          key={preset.id}
                          activeOpacity={0.8}
                          onPress={() => handleSelectPreset(preset)}
                          style={[
                            styles.presetPhotoCard,
                            {
                              borderColor: isSelected ? '#F97316' : (isDark ? '#374151' : '#E2E8F0'),
                              backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                            },
                          ]}>
                          <Image source={{ uri: preset.url }} style={styles.presetImagePreview} contentFit="cover" />
                          {isSelected && (
                            <View style={styles.presetSelectedBadge}>
                              <Check size={13} color="#FFFFFF" strokeWidth={3} />
                            </View>
                          )}
                          <View style={styles.presetInfoPad}>
                            <Text style={[styles.presetTitleText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                              {preset.title}
                            </Text>
                            <Text style={[styles.presetSubText, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                              {preset.sub}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#334155' }]}>
                      Or Custom Image URL
                    </Text>
                    <View style={styles.customUrlRow}>
                      <TextInput
                        value={customImageUrl}
                        onChangeText={setCustomImageUrl}
                        placeholder="https://example.com/library-interior.jpg"
                        placeholderTextColor="#94A3B8"
                        style={[
                          styles.inputField,
                          {
                            flex: 1,
                            backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                            borderColor: isDark ? '#374151' : '#CBD5E1',
                            color: isDark ? '#FFFFFF' : '#0F172A',
                          },
                        ]}
                      />
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleApplyCustomUrl}
                        style={styles.applyUrlBtn}>
                        <Text style={styles.applyUrlBtnText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#334155' }]}>
                      Library Name
                    </Text>
                    <TextInput
                      value={libraryName}
                      onChangeText={setLibraryName}
                      style={[
                        styles.inputField,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                          borderColor: isDark ? '#374151' : '#CBD5E1',
                          color: isDark ? '#FFFFFF' : '#0F172A',
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#D1D5DB' : '#334155' }]}>
                      Location & Working Hours
                    </Text>
                    <TextInput
                      value={locationName}
                      onChangeText={setLocationName}
                      style={[
                        styles.inputField,
                        {
                          backgroundColor: isDark ? '#1F2937' : '#F8FAFC',
                          borderColor: isDark ? '#374151' : '#CBD5E1',
                          color: isDark ? '#FFFFFF' : '#0F172A',
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* TAB 4: SHIFTS & FEES */}
              {activeTab === 'shifts' && (
                <View style={styles.tabSection}>
                  <Text style={[styles.tabSectionHeading, { color: isDark ? '#E5E7EB' : '#1E293B' }]}>
                    Active Shift Hours & Pricing
                  </Text>
                  <Text style={[styles.tabSectionSub, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                    Manage library operational slots and monthly pricing tiers.
                  </Text>

                  <View style={styles.shiftsGrid}>
                    <View style={[styles.shiftCard, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}>
                      <Text style={styles.shiftCardTag}>SHIFT 1 • MORNING</Text>
                      <Text style={[styles.shiftCardTime, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                        06:00 AM – 02:00 PM
                      </Text>
                      <Text style={[styles.shiftCardFee, { color: '#F97316' }]}>₹900 / month</Text>
                      <Text style={[styles.shiftCardOccupancy, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                        48 of 50 seats booked
                      </Text>
                    </View>

                    <View style={[styles.shiftCard, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}>
                      <Text style={styles.shiftCardTag}>SHIFT 2 • EVENING</Text>
                      <Text style={[styles.shiftCardTime, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                        02:00 PM – 10:00 PM
                      </Text>
                      <Text style={[styles.shiftCardFee, { color: '#F97316' }]}>₹900 / month</Text>
                      <Text style={[styles.shiftCardOccupancy, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                        46 of 50 seats booked
                      </Text>
                    </View>

                    <View style={[styles.shiftCard, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}>
                      <Text style={styles.shiftCardTag}>SHIFT 3 • NIGHT OWL</Text>
                      <Text style={[styles.shiftCardTime, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                        10:00 PM – 06:00 AM
                      </Text>
                      <Text style={[styles.shiftCardFee, { color: '#F97316' }]}>₹1,000 / month</Text>
                      <Text style={[styles.shiftCardOccupancy, { color: isDark ? '#9CA3AF' : '#64748B' }]}>
                        34 of 50 seats booked
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Modal Bottom Action Bar */}
            <View style={[styles.dialogFooter, { borderTopColor: isDark ? '#1F2937' : '#E2E8F0' }]}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsUpdateModalOpen(false)}
                style={styles.doneModalBtn}>
                <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.doneModalBtnText}>Save & Apply Live</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    gap: 16,
  },

  // -------------------------------------------------------------
  // 1. FLOATING NAVBAR PILL (Matching the top RESUMX pill header)
  // -------------------------------------------------------------
  floatingNavWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 4,
  },
  floatingNavPill: {
    width: '100%',
    maxWidth: 1200,
    height: 58,
    borderRadius: 9999,
    backgroundColor: '#0F1420',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  brandBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  brandLogoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F97316',
  },
  brandLogoText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  navLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navLinkItem: {
    paddingVertical: 4,
  },
  navLinkActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  navLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
  },
  navDropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navRightPillBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 9999,
  },
  navRightPillBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0F17',
    letterSpacing: -0.2,
  },

  // -------------------------------------------------------------
  // 2. HERO CARD CONTAINER: Deep Charcoal + Radiant Orange Glow
  // -------------------------------------------------------------
  heroCardContainer: {
    position: 'relative',
    backgroundColor: '#090D15',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    padding: 32,
    gap: 36,
  },

  // Radiant Orange Ambient Lighting Sweeps
  ambientGlowOrange: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(234, 88, 12, 0.14)',
  },
  ambientGlowBottomSweep: {
    position: 'absolute',
    bottom: -150,
    left: '10%',
    width: '80%',
    height: 340,
    borderRadius: 180,
    backgroundColor: 'rgba(249, 115, 22, 0.18)',
  },

  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 36,
  },
  heroContentStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 28,
  },

  // Left Column
  leftColumn: {
    flex: 1.1,
    gap: 18,
  },
  leftColumnFull: {
    width: '100%',
  },
  eyebrowTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyebrowTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
  heroMainHeading: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.2,
    lineHeight: 54,
  },
  heroMainHeadingMobile: {
    fontSize: 34,
    lineHeight: 40,
  },
  heroHeadingHighlight: {
    color: '#FFFFFF',
  },
  heroSubText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#94A3B8',
    maxWidth: 540,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 4,
  },
  primaryOrangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  primaryOrangeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  availableDesksPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  pulsingGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  availableDesksText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F1F5F9',
  },

  // Social Proof Stack
  socialProofContainer: {
    flexDirection: 'column',
    gap: 6,
    marginTop: 6,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: '#090D15',
  },
  socialProofTextGroup: {
    gap: 3,
  },
  socialProofTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
    marginLeft: 4,
  },

  // Right Column (Mockup Image & Floating Badges)
  rightColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightColumnFull: {
    width: '100%',
  },
  mockupFrame: {
    width: '100%',
    maxWidth: 500,
    height: 360,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#0F172A',
  },
  mockupImage: {
    width: '100%',
    height: '100%',
  },
  mockupImageShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 21, 0.25)',
  },

  // Floating Desk Badge (Upper Left)
  floatingDeskCard: {
    position: 'absolute',
    top: 18,
    left: 18,
    backgroundColor: 'rgba(15, 20, 32, 0.88)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    gap: 4,
  },
  floatingDeskCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  deskTag: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deskTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deskStatusLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liveTinyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  deskStatusLiveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
  },
  floatingStudentName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingShiftDetails: {
    fontSize: 10,
    color: '#94A3B8',
  },

  // Floating 3D Badge (Center/Right like Figma icon in reference)
  floatingAppBadge: {
    position: 'absolute',
    top: '38%',
    right: 22,
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },

  // Floating Photo Trigger
  floatingPhotoTrigger: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingPhotoTriggerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // -------------------------------------------------------------
  // 3. BOTTOM CARDS ROW: 3 Modular Cards
  // -------------------------------------------------------------
  bottomCardsGrid: {
    flexDirection: 'row',
    gap: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 24,
  },
  bottomCardsGridMobile: {
    flexDirection: 'column',
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 18,
    color: '#94A3B8',
  },
  cardFooterStats: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  cardFooterStatsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F97316',
  },

  // -------------------------------------------------------------
  // 4. MODAL DIALOG STYLES
  // -------------------------------------------------------------
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '88%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  dialogHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dialogHeaderIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  dialogSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 8,
    borderRadius: 10,
  },
  modalTabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#F97316',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#F97316',
    fontWeight: '700',
  },
  dialogScrollContent: {
    padding: 20,
    gap: 18,
  },
  tabSection: {
    gap: 14,
  },
  tabSectionHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  tabSectionSub: {
    fontSize: 12,
    lineHeight: 18,
  },
  formGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputField: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  textAreaField: {
    height: 96,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  sendBroadcastBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  sendBroadcastBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  broadcastStatusBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 8,
    padding: 10,
  },
  broadcastStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },

  // Amenities list
  featuresListGrid: {
    gap: 10,
  },
  featureToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  featureToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Photo presets
  photoPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetPhotoCard: {
    width: '48%',
    minWidth: 240,
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  presetImagePreview: {
    width: '100%',
    height: 100,
  },
  presetSelectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  presetInfoPad: {
    padding: 10,
    gap: 2,
  },
  presetTitleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  presetSubText: {
    fontSize: 11,
  },
  customUrlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  applyUrlBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyUrlBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  // Shifts Grid
  shiftsGrid: {
    gap: 10,
  },
  shiftCard: {
    padding: 14,
    borderRadius: 12,
    gap: 4,
  },
  shiftCardTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.1,
  },
  shiftCardTime: {
    fontSize: 14,
    fontWeight: '800',
  },
  shiftCardFee: {
    fontSize: 13,
    fontWeight: '700',
  },
  shiftCardOccupancy: {
    fontSize: 11,
    marginTop: 2,
  },

  // Modal Footer
  dialogFooter: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  doneModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  doneModalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

