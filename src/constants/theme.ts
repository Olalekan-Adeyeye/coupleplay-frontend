import { Platform } from 'react-native';
import { FontFamily } from './fonts';

// CouplePlay brand palette — dark only.

export const Colors = {
  primary: "#946BFF",
  primaryLight: "#8C78FF",
  primaryDark: "#482AC4",
  primarySoft: "#EFEAFF",
  accent: "#FF69B4",
  accentSoft: "#FFE4F1",

  // Partner side (P2 scores, partner avatar ring). Never use for generic UI.
  rose: "#FF5C8A",

  // Deep plum for ink trays (game board) and display text on dark.
  plumDeep: "#2A1B4E",

  // Dark canvas + surfaces. Backgrounds are always square full-bleed.
  paper: "#100E17",
  hairline: "#2B2539",

  background: "#100E17",
  backgroundAlt: "#1B1826",
  surface: "#1B1826",
  surfaceSoft: "#252132",
  surfaceBorder: "#2B2539",

  text: "#F4F1FA",
  textSecondary: "#B3A8C9",
  textTertiary: "#7E7396",

  success: "#22C55E",
  error: "#DC2626",
  errorBright: "#F87171",
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

// Flat solid tints behind Open Peeps busts. Solids only — never gradients.
// Cycled deterministically so every surface feels calm, never rainbow.
export const PeepTints = ["#FFE4F1", "#EFEAFF", "#FFF1E4", "#E4DEFF"] as const;

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
export const Radius = { sm: 8, md: 12, card: 14, lg: 20, xl: 28, full: 9999 };

export const ShadowColor = '#4A3B6B';

// Canonical elevation levels. Use these everywhere.
// xs: icon buttons · sm: small cards/list items · md: main cards
// lg: hero cards · brand: purple feature cards · btn: primary buttons
export const Shadows = {
  xs: { shadowColor: ShadowColor, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  sm: { shadowColor: ShadowColor, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: ShadowColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 },
  lg: { shadowColor: ShadowColor, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  brand: { shadowColor: '#946BFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6 },
  btn: { shadowColor: '#946BFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
} as const;

export const MaxContentWidth = 500;

export const Spacing = Space;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
