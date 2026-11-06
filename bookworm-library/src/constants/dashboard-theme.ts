import { Platform } from 'react-native';

// =============================================================================
// LIBX MULTI-TENANT DESIGN SYSTEM TOKENS
// Modern Organic SaaS + Minimalist UI + Soft Claymorphism + Forest Green & Warm Beige
// =============================================================================

// LIGHT MODE PALETTE (Exact LibX Specification)
export const LightThemeColors = {
  brand: {
    primary: '#245C48',       // Primary forest green
    primaryHover: '#1B4637',
    primaryButton: '#245C48',
    light: '#E8EEE5',         // Light sage tint
    border: '#DDD9CE',        // Warm subtle border
    glow: 'rgba(36, 92, 72, 0.08)',
    gold: '#B58A4A',          // Muted gold accent
    emerald: '#55A783',
  },
  surface: {
    canvas: '#F5F1E8',        // Main background (warm beige)
    sidebar: '#EDE7DB',       // Sidebar background (warm beige neutral)
    topNav: '#FFFEFA',        // Top navigation (ivory)
    card: '#FFFEFA',          // Main cards (ivory)
    cardAlt: '#EAE5D9',       // Secondary surfaces / elevated claymorphic
    inset: '#EFEAE0',         // Slightly inset surface for search & inputs
    border: '#DDD9CE',        // Borders
    borderSubtle: '#EAE5D9',
    hover: '#E5DFD2',
    activeNav: '#E2DBD0',     // Subtle active nav background
  },
  text: {
    primary: '#29352F',       // Main text (deep forest charcoal)
    secondary: '#788477',     // Secondary text
    muted: '#788477',         // Muted text
    faint: '#9EA89E',         // Subtle label text
    white: '#FFFFFF',
  },
  accent: {
    sage: '#A5B99E',          // Secondary sage
    lightSage: '#E8EEE5',     // Light sage
    forest: '#245C48',        // Primary forest green
    gold: '#B58A4A',          // Muted gold accent
    emerald: '#55A783',
    reservedBeige: '#D4C5B9',
  },
  seatStatus: {
    occupied: '#245C48',
    available: '#B8D2B6',
    reserved: '#D6A14A',
    unavailable: '#D6DCE3',
    blocked: '#C76B59',
  },
  success: {
    main: '#245C48',
    light: '#E8EEE5',
    border: '#A5B99E',
  },
  warning: {
    main: '#B58A4A',
    light: '#FBF6EE',
    border: '#E8D5B8',
  },
  danger: {
    main: '#C76B59',
    light: '#FAF0ED',
    border: '#E8BDB4',
  },
  info: {
    main: '#3A6B7E',
    light: '#EFF6F8',
    border: '#C5DDE4',
  },
};

// DARK MODE PALETTE (Exact LibX Specification)
export const DarkThemeColors = {
  brand: {
    primary: '#55A783',       // Emerald accent
    forest: '#245C48',        // Forest green
    primaryHover: '#66BC98',
    primaryButton: '#245C48', // Forest green button
    primaryButtonHover: '#2E735B',
    light: 'rgba(85, 167, 131, 0.15)',
    border: '#38443A',        // Borders
    glow: 'rgba(85, 167, 131, 0.16)',
    gold: '#C4A052',          // Muted gold
    emerald: '#55A783',
  },
  surface: {
    canvas: '#141815',        // Main background (charcoal-black foundation)
    sidebar: '#1B211C',       // Sidebar background
    topNav: '#1B211C',        // Top navigation
    card: '#222C24',          // Main content cards
    cardAlt: '#2D392F',       // Elevated surfaces
    inset: '#191F1A',         // Inset search bars & inputs
    border: '#38443A',        // Borders
    borderSubtle: '#263127',
    hover: '#2D392F',
    activeNav: '#273429',     // Subtle active nav
  },
  text: {
    primary: '#EEE9DD',       // Main text (warm off-white)
    secondary: '#A8ADA1',     // Secondary text
    muted: '#879187',         // Muted text
    faint: '#626C62',         // Subtle labels
    white: '#FFFFFF',
  },
  accent: {
    sage: '#A5B99E',          // Sage accent
    lightSage: 'rgba(165, 185, 158, 0.16)',
    forest: '#245C48',        // Forest green
    gold: '#C4A052',          // Muted gold
    emerald: '#55A783',       // Emerald accent
    reservedBeige: '#CBB8A6',
  },
  seatStatus: {
    occupied: '#245C48',
    available: '#B8D2B6',
    reserved: '#D6A14A',
    unavailable: '#D6DCE3',
    blocked: '#C76B59',
  },
  success: {
    main: '#55A783',
    light: 'rgba(85, 167, 131, 0.15)',
    border: '#38443A',
  },
  warning: {
    main: '#D49B4E',
    light: 'rgba(212, 155, 78, 0.15)',
    border: '#4D3D2B',
  },
  danger: {
    main: '#C76B59',
    light: 'rgba(199, 107, 89, 0.15)',
    border: '#542E28',
  },
  info: {
    main: '#5FA0B5',
    light: 'rgba(95, 160, 181, 0.15)',
    border: '#2C424C',
  },
};

// SOFT CLAYMORPHISM SHADOWS
export const ClaymorphicShadows = {
  card: {
    shadowColor: '#2B261E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHover: {
    shadowColor: '#2B261E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  button: {
    shadowColor: '#17362B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  modal: {
    shadowColor: '#1A1813',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  sm: {
    shadowColor: '#2B261E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#2B261E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: '#2B261E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  xl: {
    shadowColor: '#2B261E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const ClaymorphicShadowsDark = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.42,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 10,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const DashboardTheme = {
  colors: LightThemeColors,
  shadows: ClaymorphicShadows,
  typography: {
    serifHeading: {
      fontFamily: Platform.OS === 'web' ? '"DM Serif Display", Lora, Georgia, serif' : 'serif',
      fontWeight: '600' as const,
    },
    sans: {
      fontFamily: Platform.OS === 'web' ? 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : 'System',
    },
  },
};

export function getDashboardTheme(isDark?: boolean) {
  return {
    colors: isDark ? DarkThemeColors : LightThemeColors,
    shadows: isDark ? ClaymorphicShadowsDark : ClaymorphicShadows,
    typography: DashboardTheme.typography,
  };
}
