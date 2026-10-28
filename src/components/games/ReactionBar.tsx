import { Pressable, Text, View } from "react-native";
import { REACTIONS } from "@/lib/constants";

interface ReactionBarProps {
  incomingReaction: string | null;
  rejectMsg: string | null;
  onReaction: (reaction: string) => void;
  size?: "sm" | "md";
}

export function ReactionBar({
  incomingReaction,
  rejectMsg,
  onReaction,
  size = "md",
}: ReactionBarProps) {
  const btnSize = size === "sm" ? "h-10 w-10" : "h-11 w-11";
  const emojiSize = size === "sm" ? "text-title-sm" : "text-title-lg";

  return (
    <>
      {incomingReaction && (
        <View className="absolute -top-12 rounded-full bg-accent-soft px-4 py-2">
          <Text className="text-title-sm">{incomingReaction}</Text>
        </View>
      )}
      {rejectMsg && (
        <View className="absolute -top-12 rounded-full bg-error-soft px-4 py-2">
          <Text className="font-ui-semibold text-body-sm text-error-bright">
            {rejectMsg}
          </Text>
        </View>
      )}
      {REACTIONS.map((r) => (
        <Pressable
          key={r}
          onPress={() => onReaction(r)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Send reaction ${r}`}
          className={`${btnSize} items-center justify-center rounded-full active:opacity-70`}
        >
          <Text className={emojiSize}>{r}</Text>
        </Pressable>
      ))}
    </>
  );
}
