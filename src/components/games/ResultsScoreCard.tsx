import { View, Text } from "react-native";
import { Avatar } from "@/components/ui/avatar";

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
  partnerColor = "text-rose",
}: ResultsScoreCardProps) {
  return (
    <View className="mt-6 flex-row items-center justify-center gap-3">
      <View className="flex-1 items-center gap-2 rounded-2xl border border-hairline bg-surface px-3 py-6">
        <Avatar avatar={myAvatar} name={myName} size={56} />
        <Text
          className="font-display-bold text-body text-ink"
          numberOfLines={1}
        >
          You
        </Text>
        <Text className={`font-display-bold text-score ${myColor}`}>
          {myScore}
        </Text>
      </View>

      <Text className="font-display-bold text-title-xs text-ink-tertiary">
        VS
      </Text>

      <View className="flex-1 items-center gap-2 rounded-2xl border border-hairline bg-surface px-3 py-6">
        <Avatar name={partnerName} size={56} />
        <Text
          className="font-display-bold text-body text-ink"
          numberOfLines={1}
        >
          {partnerName}
        </Text>
        <Text className={`font-display-bold text-score ${partnerColor}`}>
          {partnerScore}
        </Text>
      </View>
    </View>
  );
}
