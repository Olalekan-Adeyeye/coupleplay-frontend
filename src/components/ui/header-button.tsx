import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

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
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="h-12 w-12 items-center justify-center rounded-2xl bg-white active:opacity-80"
      style={HEADER_BUTTON_SHADOW}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={22}
        color="#201A33"
      />
    </Pressable>
  );
}
