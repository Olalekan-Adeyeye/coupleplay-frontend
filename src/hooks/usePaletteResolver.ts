import { useColorScheme as useRNColorScheme } from "react-native";
import { useThemeStore } from "@/stores/themeStore";

export function useRNResolvedTheme() {
  const preference = useThemeStore((s) => s.preference);
  const systemScheme = useRNColorScheme();
  const resolved = preference === "system" ? systemScheme : preference;
  return resolved === "light" ? "light" : "dark";
}
