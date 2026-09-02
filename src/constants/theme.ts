import { Platform } from 'react-native';
import { FontFamily } from './fonts';

// CouplePlay brand palette — light only.

export const Colors = {
  primary: "#8A4BE0",
  primaryLight: "#8C78FF",
  primaryDark: "#482AC4",
  primarySoft: "#EFEAFF",
  accent: "#FF69B4",
  accentSoft: "#FFE4F1",

  background: "#FFFFFF",
  backgroundAlt: "#F7F6FF",
  surface: "#FFFFFF",
  surfaceBorder: "#EDEAF7",

  text: "#201A33",
  textSecondary: "#7A748C",
  textTertiary: "#B0A9C2",

  success: "#22C55E",
  error: "#DC2626",
  errorSoft: "#FDEAEE",
  shadow: "#4A3B6B",

  blobBlush: "#EFEAFF",
  blobLavender: "#E4DEFF",
  blobPeach: "#FFF1E4",
  blobRose: "#FFE4F1",
  speckA: "#B8A8F5",
  speckB: "#F5C79E",
  speckC: "#F0A7C9",
} as const;

export type ThemeColors = { readonly [K in keyof typeof Colors]: string };
export type ThemeColor = keyof typeof Colors;

export const TypeScale = {
  hero: { fontSize: 34, lineHeight: 42, fontWeight: '800' as const, letterSpacing: -0.8, fontFamily: FontFamily.display },
  h1: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.4, fontFamily: FontFamily.display },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const, fontFamily: FontFamily.display },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const, fontFamily: FontFamily.display },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '500' as const, fontFamily: FontFamily.uiMedium },
  bodySmall: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const, fontFamily: FontFamily.uiMedium },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, fontFamily: FontFamily.uiMedium },
  label: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 1.2, fontFamily: FontFamily.uiBold },
};

export const Fonts = Platform.select({
  ios: { display: 'system-ui', body: 'system-ui', mono: 'ui-monospace' },
  default: { display: 'sans-serif', body: 'sans-serif', mono: 'monospace' },
});

export const Space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const Radius = { sm: 8, md: 14, lg: 20, xl: 28, full: 9999 };

export const ShadowColor = '#4A3B6B';

// Canonical elevation levels. Use these everywhere.
// xs: icon buttons · sm: small cards/list items · md: main cards
// lg: hero cards · brand: purple feature cards · btn: primary buttons
export const Shadows = {
  xs: { shadowColor: ShadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  sm: { shadowColor: ShadowColor, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: ShadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  lg: { shadowColor: ShadowColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  brand: { shadowColor: '#8A4BE0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6 },
  btn: { shadowColor: '#8A4BE0', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
} as const;

export const MaxContentWidth = 500;

export const Spacing = Space;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
