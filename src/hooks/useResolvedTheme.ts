import { useColorScheme as useRNColorScheme } from "react-native";
import { useThemeStore } from "@/stores/themeStore";

const DARK_PAPER = "#100E17";
const LIGHT_PAPER = "#FBFBFD";

export function useResolvedTheme() {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useRNColorScheme();

  const resolved = preference === "system" ? systemScheme : preference;
  return resolved === "light" ? "light" : "dark";
}

export function usePaperColor() {
  const resolved = useResolvedTheme();
  return resolved === "light" ? LIGHT_PAPER : DARK_PAPER;
}
