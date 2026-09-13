import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TAB_BAR_CLEARANCE = 108;

/**
 * Shared tab shell. Paper canvas full-bleed (square, no radius),
 * centered max-width column, clearance for the floating dock.
 */
export function TabScreen({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View
            className="w-full max-w-[460px] self-center gap-5 px-[22px] pt-[18px]"
            style={{ paddingBottom: TAB_BAR_CLEARANCE }}
          >
            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-1">
        <Text className="font-display-bold text-[24px] leading-[30px] text-ink">
          {title}
        </Text>
        <Text className="mt-0.5 font-ui-medium text-[14px] text-ink-secondary">
          {subtitle}
        </Text>
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-display-bold text-[19px] text-ink">{title}</Text>
      {action}
    </View>
  );
}
