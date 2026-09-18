import { vars, useColorScheme } from "nativewind";
import { StatusBar } from "expo-status-bar";
import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import { useThemeStore } from "@/stores/themeStore";

const lightOverrides = vars({
  "--color-paper": "250 20% 99%",
  "--color-surface": "250 15% 97%",
  "--color-surface-soft": "250 12% 95%",
  "--color-hairline": "250 10% 90%",
  "--color-surface-border": "250 10% 90%",
  "--color-ink": "252 20% 12%",
  "--color-ink-secondary": "252 12% 35%",
  "--color-ink-tertiary": "252 10% 55%",
  "--color-primary": "252 66% 58%",
  "--color-primary-soft": "252 100% 96%",
  "--color-accent": "330 100% 65%",
  "--color-accent-soft": "330 100% 96%",
  "--color-error-soft": "350 80% 96%",
  "--color-error-bright": "0 84% 60%",
  "--color-success": "142 71% 40%",
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setColorScheme, colorScheme } = useColorScheme();
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    if (preference === "system") {
      setColorScheme("system");
    } else {
      setColorScheme(preference);
    }
  }, [preference, setColorScheme]);

  const resolved =
    preference === "system"
      ? colorScheme === "light"
        ? "light"
        : "dark"
      : preference === "light"
        ? "light"
        : "dark";

  return (
    <View
      style={resolved === "light" ? lightOverrides : undefined}
      className="flex-1 bg-paper"
    >
      <StatusBar style={resolved === "light" ? "dark" : "light"} />
      {children}
    </View>
  );
}
