import { View, Text } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { CARD_SHADOW } from "@/lib/shadows";

interface ResultsScoreCardProps {
  myName: string;
  myAvatar?: string | null;
  myScore: number;
  myColor?: string;
  partnerName: string;
  partnerScore: number;
  partnerColor?: string;
}

export function ResultsScoreCard({
  myName,
  myAvatar,
  myScore,
  myColor = "text-primary",
  partnerName,
  partnerScore,
  partnerColor = "text-accent",
}: ResultsScoreCardProps) {
  return (
    <View className="mt-6 flex-row items-center justify-center gap-3">
      <View
        className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 py-6"
        style={CARD_SHADOW}
      >
        <Avatar avatar={myAvatar} name={myName} size={56} />
        <Text
          className="font-display-bold text-[14px] text-ink"
          numberOfLines={1}
        >
          You
        </Text>
        <Text className={`font-display-bold text-[32px] ${myColor}`}>
          {myScore}
        </Text>
      </View>

      <Text className="font-display-bold text-[16px] text-ink-tertiary">
        VS
      </Text>

      <View
        className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 py-6"
        style={CARD_SHADOW}
      >
        <Avatar name={partnerName} size={56} />
        <Text
          className="font-display-bold text-[14px] text-ink"
          numberOfLines={1}
        >
          {partnerName}
        </Text>
        <Text className={`font-display-bold text-[32px] ${partnerColor}`}>
          {partnerScore}
        </Text>
      </View>
    </View>
  );
}
