export const FontFamily = {
  display: 'Urbanist_700Bold' as const,
  displayBold: 'Urbanist_800ExtraBold' as const,
  displaySemi: 'Urbanist_600SemiBold' as const,
  displayItalic: 'Urbanist_700Bold_Italic' as const,
  displaySemiItalic: 'Urbanist_600SemiBold_Italic' as const,

  ui: 'Urbanist_400Regular' as const,
  uiMedium: 'Urbanist_500Medium' as const,
  uiSemibold: 'Urbanist_600SemiBold' as const,
  uiBold: 'Urbanist_700Bold' as const,
};

export type FontFamilyName = keyof typeof FontFamily;
