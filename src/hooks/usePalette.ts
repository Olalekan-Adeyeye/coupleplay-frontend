import { useResolvedTheme } from "./useResolvedTheme";

/**
 * Mode-resolved hex values for places where a color prop can't go through
 * NativeWind classes (vector icons, style objects, canvas fills).
 */
export function usePalette() {
  const isLight = useResolvedTheme() === "light";
  return {
    primary: isLight ? "#7C54E8" : "#946BFF",
    primarySoft: isLight ? "#F1ECFF" : "#EFEAFF",
    ink: isLight ? "#1A1528" : "#F4F1FA",
    inkSecondary: isLight ? "#5B5470" : "#B3A8C9",
    inkTertiary: isLight ? "#8A82A5" : "#A79DBE",
    chip: isLight ? "#D4D0DE" : "#2B2539",
    chipSoft: isLight ? "#F0ECF5" : "#1B1826",
  };
}
