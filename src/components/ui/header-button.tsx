import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";

const HEADER_BUTTON_SHADOW = {
  shadowColor: "#4A3B6B",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
} as const;

type HeaderButtonProps = {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
};

export function HeaderButton({ icon, onPress, accessibilityLabel }: HeaderButtonProps) {
  const resolved = useResolvedTheme();
  const isLight = resolved === "light";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-12 w-12 items-center justify-center rounded-2xl bg-surface active:opacity-80"
      style={HEADER_BUTTON_SHADOW}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color={isLight ? "#1A1528" : "#F4F1FA"}
      />
    </Pressable>
  );
}
