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
} from 'react-native';
import { Image } from 'expo-image';
import {
  Camera,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  Check,
  X,
  ShieldCheck,
  Zap,
  Wifi,
  Wind,
  Image as ImageIcon,
  Edit3,
} from 'lucide-react-native';
import { DashboardTheme } from '@/constants/dashboard-theme';
import { useThemeMode } from '@/context/ThemeContext';

// Curated high-resolution library interior aesthetic photos
const PRESET_LIBRARY_PHOTOS = [
  {
    id: 'modern-hall',
    title: 'Modern Minimalist Hall',
    sub: 'Spacious desks, warm ambient lighting',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'wooden-desks',
    title: 'Warm Wood & Quiet Study',
    sub: 'Individual desk dividers & reading lamps',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'executive-cubicles',
    title: 'Executive Cubicles & Cabins',
    sub: 'Private study pods with ergonomic chairs',
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'serene-library',
    title: 'Serene Study Lounge',
    sub: 'Premium self-study reading room',
    url: 'https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=1400&q=80',
  },
];

interface LibraryShowcaseHeroProps {
  onAddStudent: () => void;
}

export function LibraryShowcaseHero({ onAddStudent }: LibraryShowcaseHeroProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const { colors, shadows } = useThemeMode();

  // Active Library Photo and Profile Details
  const [libraryPhotoUrl, setLibraryPhotoUrl] = useState<string>(PRESET_LIBRARY_PHOTOS[0].url);
  const [libraryName, setLibraryName] = useState('Bookworm Study Library & Reading Hall');
  const [libraryLocation, setLibraryLocation] = useState('Civil Lines, Central Square • Main Campus');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Custom photo URL input draft
  const [customPhotoInput, setCustomPhotoInput] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('modern-hall');

  const handleApplyPhoto = (url: string, presetId?: string) => {
    if (url.trim()) {
      setLibraryPhotoUrl(url.trim());
      if (presetId) setSelectedPresetId(presetId);
      setIsPhotoModalOpen(false);
    }
  };

  return (
    <View style={[styles.heroWrapper, shadows.md]}>
      {/* Background Hero Image with Deep Luxury Gradient Overlay */}
      <Image
        source={{ uri: libraryPhotoUrl }}
        style={styles.heroBackground}
        contentFit="cover"
        transition={600}
      />
      <View style={styles.gradientOverlay} />

      {/* Hero Foreground Content */}
      <View style={styles.contentContainer}>
        {/* Top Badges Row */}
        <View style={styles.topBadgesRow}>
          <View style={styles.statusPill}>
            <View style={styles.liveGreenDot} />
            <Text style={styles.statusPillText}>OPEN 24/7 • 3 SHIFTS RUNNING</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsPhotoModalOpen(true)}
            style={styles.changePhotoBtn}>
            <Camera size={14} color="#FFFFFF" strokeWidth={2.2} />
            <Text style={styles.changePhotoBtnText}>
              {isMobile ? 'Change Photo' : '📸 Change Library Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Library Title & Address */}
        <View style={styles.titleSection}>
          <Text style={styles.libraryTitle}>{libraryName}</Text>
          <View style={styles.locationRow}>
            <MapPin size={15} color="#94A3B8" strokeWidth={2} />
            <Text style={styles.locationText}>{libraryLocation}</Text>
          </View>
        </View>

        {/* Feature Badges & Key Metrics */}
        <View style={styles.featuresStrip}>
          <View style={styles.featurePill}>
            <Wind size={13} color="#38BDF8" strokeWidth={2.2} />
            <Text style={styles.featurePillText}>100% Air Conditioned</Text>
          </View>
          <View style={styles.featurePill}>
            <Wifi size={13} color="#A78BFA" strokeWidth={2.2} />
            <Text style={styles.featurePillText}>Fiber Wi-Fi</Text>
          </View>
          <View style={styles.featurePill}>
            <Zap size={13} color="#FBBF24" strokeWidth={2.2} />
            <Text style={styles.featurePillText}>Power at every desk</Text>
          </View>
          <View style={styles.featurePill}>
            <ShieldCheck size={13} color="#34D399" strokeWidth={2.2} />
            <Text style={styles.featurePillText}>CCTV & Biometric Entry</Text>
          </View>
        </View>

        {/* Bottom Banner Row: Quick Stats & Primary Action */}
        <View style={styles.bottomRow}>
          <View style={styles.quickStatsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statChipNumber}>150</Text>
              <Text style={styles.statChipLabel}>Total Desks</Text>
            </View>
            <View style={styles.statChipDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statChipNumber}>128</Text>
              <Text style={styles.statChipLabel}>Enrolled Students</Text>
            </View>
            <View style={styles.statChipDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statChipNumber}>86</Text>
              <Text style={styles.statChipLabel}>Checked In Today</Text>
            </View>
          </View>

          {/* "+ Add Student" Primary Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onAddStudent}
            style={[styles.primaryAddBtn, shadows.md]}>
            <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
            <Text style={styles.primaryAddBtnText}>+ Add Student</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMIZE / ADD PHOTO & PROFILE OF THE LIBRARY                     */}
      {/* ========================================================================= */}
      <Modal
        visible={isPhotoModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.dialogCard, shadows.lg, { backgroundColor: colors.surface.card }]}>
            {/* Modal Header */}
            <View style={[styles.dialogHeader, { borderBottomColor: colors.surface.border }]}>
              <View style={styles.dialogHeaderLeft}>
                <View style={[styles.dialogIconBox, { backgroundColor: colors.brand.light }]}>
                  <ImageIcon size={22} color={colors.brand.primary} strokeWidth={2.3} />
                </View>
                <View>
                  <Text style={[styles.dialogTitle, { color: colors.text.primary }]}>Library Photos & Branding</Text>
                  <Text style={[styles.dialogSubtitle, { color: colors.text.muted }]}>
                    Showcase your physical library interior & customize hero image
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsPhotoModalOpen(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surface.cardAlt }]}>
                <X size={18} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            {/* Presets Grid */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.dialogScroll}>
              <Text style={[styles.sectionHeading, { color: colors.text.faint }]}>CHOOSE AESTHETIC INTERIOR PRESET</Text>

              <View style={styles.presetsGrid}>
                {PRESET_LIBRARY_PHOTOS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;

                  return (
                    <TouchableOpacity
                      key={preset.id}
                      activeOpacity={0.8}
                      onPress={() => handleApplyPhoto(preset.url, preset.id)}
                      style={[
                        styles.presetCard,
                        { backgroundColor: colors.surface.canvas, borderColor: isSelected ? colors.brand.primary : colors.surface.border },
                      ]}>
                      <Image
                        source={{ uri: preset.url }}
                        style={styles.presetImage}
                        contentFit="cover"
                      />
                      {isSelected && (
                        <View style={[styles.selectedCheckBadge, { backgroundColor: colors.brand.primary }]}>
                          <Check size={14} color="#FFFFFF" strokeWidth={3} />
                        </View>
                      )}
                      <View style={styles.presetCardContent}>
                        <Text style={[styles.presetCardTitle, { color: colors.text.primary }]}>{preset.title}</Text>
                        <Text style={[styles.presetCardSub, { color: colors.text.muted }]}>{preset.sub}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Image URL Option */}
              <View style={styles.customUrlSection}>
                <Text style={[styles.sectionHeading, { color: colors.text.faint }]}>OR PROVIDE CUSTOM IMAGE URL</Text>
                <View style={styles.customUrlInputRow}>
                  <TextInput
                    value={customPhotoInput}
                    onChangeText={setCustomPhotoInput}
                    placeholder="Paste image URL (https://...)"
                    placeholderTextColor={colors.text.faint}
                    style={[styles.customUrlInput, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                  <TouchableOpacity
                    onPress={() => handleApplyPhoto(customPhotoInput)}
                    style={[styles.applyUrlBtn, { backgroundColor: colors.brand.primary }]}>
                    <Text style={styles.applyUrlBtnText}>Apply Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Library Name & Location Settings */}
              <View style={styles.infoEditSection}>
                <Text style={[styles.sectionHeading, { color: colors.text.faint }]}>LIBRARY DETAILS</Text>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Library Name</Text>
                  <TextInput
                    value={libraryName}
                    onChangeText={setLibraryName}
                    style={[styles.textInputRegular, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Address / Location</Text>
                  <TextInput
                    value={libraryLocation}
                    onChangeText={setLibraryLocation}
                    style={[styles.textInputRegular, { backgroundColor: colors.surface.canvas, borderColor: colors.surface.border, color: colors.text.primary }]}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={[styles.dialogFooter, { borderTopColor: colors.surface.border }]}>
              <TouchableOpacity
                onPress={() => setIsPhotoModalOpen(false)}
                style={[styles.dialogDoneBtn, { backgroundColor: colors.brand.primary }]}>
                <Text style={styles.dialogDoneBtnText}>Save & Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { colors } = DashboardTheme;

const styles = StyleSheet.create({
  heroWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
    minHeight: 280,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 2,
    padding: 24,
    justifyContent: 'space-between',
    minHeight: 280,
    gap: 18,
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  changePhotoBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  titleSection: {
    gap: 6,
  },
  libraryTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 34,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  featuresStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  featurePillText: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 16,
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statChip: {
    gap: 2,
  },
  statChipNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  statChipLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  statChipDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  primaryAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryAddBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  // -------------------------------------------------------------
  // MODAL STYLING
  // -------------------------------------------------------------
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 680,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.surface.border,
    paddingBottom: 16,
  },
  dialogHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dialogIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
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
  dialogScroll: {
    gap: 16,
    paddingVertical: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.faint,
    letterSpacing: 1.1,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    width: '48%',
    minWidth: 260,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.canvas,
    position: 'relative',
  },
  presetCardActive: {
    borderColor: colors.brand.primary,
  },
  presetImage: {
    width: '100%',
    height: 100,
  },
  selectedCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  presetCardContent: {
    padding: 10,
    gap: 2,
  },
  presetCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  presetCardSub: {
    fontSize: 11,
    color: colors.text.muted,
  },
  customUrlSection: {
    gap: 8,
  },
  customUrlInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  customUrlInput: {
    flex: 1,
    height: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.canvas,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.text.primary,
  },
  applyUrlBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 16,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyUrlBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  infoEditSection: {
    gap: 10,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  textInputRegular: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.surface.border,
    backgroundColor: colors.surface.canvas,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dialogFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.surface.border,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  dialogDoneBtn: {
    backgroundColor: colors.brand.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },
  dialogDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

