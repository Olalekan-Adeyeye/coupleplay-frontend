import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

type AuthScreenProps = {
  /** Micro caps label above the title, e.g. "WELCOME BACK". */
  eyebrow: string;
  title: string;
  subtitle: string;
  step?: { current: number; total: number };
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Flat full-page auth shell. Paper background edge-to-edge (square, no
 * radius), back chevron, editorial title block, keyboard-aware scroll.
 * Never presented as a sheet or rounded card.
 */
export function AuthScreen({
  eyebrow,
  title,
  subtitle,
  step,
  onBack,
  children,
  footer,
}: AuthScreenProps) {
  const resolved = useResolvedTheme();
  const isLight = resolved === "light";
  const chevronColor = isLight ? "#1A1528" : "#F4F1FA";

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-row items-center px-5 pt-2">
            <Pressable
              onPress={onBack ?? (() => router.back())}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              className="h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface active:opacity-70"
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={24}
                color={chevronColor}
              />
            </Pressable>
            <View className="flex-1" />
            {step && (
              <Text className="font-ui-bold text-[11px] tracking-[1.5px] text-ink-tertiary">
                0{step.current} / 0{step.total}
              </Text>
            )}
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="mt-6 font-ui-bold text-[11px] tracking-[1.5px] text-primary">
              {eyebrow}
            </Text>
            <Text className="mt-2 font-display-bold text-[30px] leading-[36px] text-ink">
              {title}
            </Text>
            <Text className="mt-2 font-ui-medium text-[15px] leading-[22px] text-ink-secondary">
              {subtitle}
            </Text>

            {step && (
              <View className="mt-5 h-[3px] flex-row gap-1.5">
                {Array.from({ length: step.total }).map((_, i) => (
                  <View
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      backgroundColor:
                        i < step.current ? "#946BFF" : isLight ? "#E0DCE8" : "#2B2539",
                    }}
                  />
                ))}
              </View>
            )}

            <View className="mt-7 gap-3.5">{children}</View>
            <View className="flex-1" />
          </ScrollView>

          {footer && (
            <View className="border-t border-hairline bg-paper px-6 pb-2 pt-4">
              {footer}
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View className="w-full rounded-xl border border-[#F3C2CC] bg-[#FDEAEE] px-4 py-2.5">
      <Text className="font-ui-medium text-[13px] leading-[18px] text-[#DC2626]">
        {message}
      </Text>
    </View>
  );
}

export function AuthSwitch({
  prompt,
  action,
  onPress,
}: {
  prompt: string;
  action: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-center gap-1 py-3 active:opacity-70"
    >
      <Text className="font-ui-medium text-[14px] text-ink-secondary">
        {prompt}
      </Text>
      <Text className="font-ui-semibold text-[14px] text-primary">{action}</Text>
    </Pressable>
  );
}
