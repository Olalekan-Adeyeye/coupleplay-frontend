import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CARD_SHADOW } from "@/lib/shadows";

interface InterstitialOverlayProps {
  message: string;
  icon: string;
  iconColor: string;
  iconBg: string;
}

export function InterstitialOverlay({
  message,
  icon,
  iconColor,
  iconBg,
}: InterstitialOverlayProps) {
  return (
    <View className="absolute inset-0 z-10 items-center justify-center bg-paper/90">
      <View
        className="items-center gap-3 rounded-3xl bg-surface px-10 py-8"
        style={CARD_SHADOW}
      >
        <View
          className="h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: iconBg }}
        >
          <MaterialCommunityIcons name={icon as any} size={30} color={iconColor} />
        </View>
        <Text className="font-display-bold text-[20px] text-ink">
          {message}
        </Text>
      </View>
    </View>
  );
}
