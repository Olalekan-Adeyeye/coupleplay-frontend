export const FontFamily = {
  display: 'NunitoSans_700Bold' as const,
  displayBold: 'NunitoSans_800ExtraBold' as const,
  displaySemi: 'NunitoSans_600SemiBold' as const,
  displayItalic: 'NunitoSans_700Bold_Italic' as const,
  displaySemiItalic: 'NunitoSans_600SemiBold_Italic' as const,

  ui: 'NunitoSans_400Regular' as const,
  uiMedium: 'NunitoSans_500Medium' as const,
  uiSemibold: 'NunitoSans_600SemiBold' as const,
  uiBold: 'NunitoSans_700Bold' as const,
};

export type FontFamilyName = keyof typeof FontFamily;
