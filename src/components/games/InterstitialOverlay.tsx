import { View, Text } from "react-native";
import { CARD_SHADOW } from "@/lib/shadows";
import { PeepScene } from "@/components/peeps/PeepScene";
import type { PeepId } from "@/components/peeps/peeps";

interface InterstitialOverlayProps {
  message: string;
  peep?: string | PeepId | null;
}

export function InterstitialOverlay({ message, peep }: InterstitialOverlayProps) {
  return (
    <View className="absolute inset-0 z-10 items-center justify-center bg-paper/90">
      <View
        className="items-center gap-3 rounded-3xl bg-surface px-10 py-8"
        style={CARD_SHADOW}
      >
        <PeepScene layout="single" peeps={[peep ?? null]} size={56} />
        <Text className="font-display-bold text-title-sm text-ink">
          {message}
        </Text>
      </View>
    </View>
  );
}
