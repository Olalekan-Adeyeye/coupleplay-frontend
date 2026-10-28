import { View, Text } from "react-native";
import { PeepScene } from "@/components/peeps/PeepScene";
import type { PeepId } from "@/components/peeps/peeps";

interface InterstitialOverlayProps {
  message: string;
  peep?: string | PeepId | null;
}

export function InterstitialOverlay({ message, peep }: InterstitialOverlayProps) {
  return (
    <View className="absolute inset-0 z-10 items-center justify-center bg-black/45">
      <View className="items-center gap-4 rounded-3xl border border-hairline bg-surface px-10 py-8">
        <PeepScene layout="single" peeps={[peep ?? null]} size={64} />
        <Text className="text-center font-display-bold text-title-sm text-ink">
          {message}
        </Text>
      </View>
    </View>
  );
}
