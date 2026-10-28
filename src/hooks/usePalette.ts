import { useRNResolvedTheme } from "./usePaletteResolver";

export function usePalette() {  const isLight = useRNResolvedTheme() === "light";
  return {
    paper: isLight ? "#FBFBFD" : "#100E17",
    surface: isLight ? "#FFFFFF" : "#1B1826",
    surfaceSoft: isLight ? "#F0ECF5" : "#252132",
    hairline: isLight ? "#D4D0DE" : "#2B2539",
    ink: isLight ? "#1A1528" : "#F4F1FA",
    inkSecondary: isLight ? "#5B5470" : "#B3A8C9",
    inkTertiary: isLight ? "#8A82A5" : "#A79DBE",
    primary: isLight ? "#7C54E8" : "#946BFF",
    primarySoft: isLight ? "#F1ECFF" : "#EFEAFF",
    chip: isLight ? "#D4D0DE" : "#2B2539",
    chipSoft: isLight ? "#F0ECF5" : "#1B1826",

    // Semantic accents. rose is partner identity only — never generic UI.
    rose: "#FF5C8A",
    amber: "#F59E0B",
    amberDark: "#B45309",
    emerald: "#22C55E",
  };
}
