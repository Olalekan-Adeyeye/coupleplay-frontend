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
  const emojiSize = size === "sm" ? "text-[20px]" : "text-[22px]";

  return (
    <>
      {incomingReaction && (
        <View className="absolute -top-12 rounded-full bg-accent-soft px-4 py-2">
          <Text className="text-[20px]">{incomingReaction}</Text>
        </View>
      )}
      {rejectMsg && (
        <View className="absolute -top-12 rounded-full bg-red-500/20 px-4 py-2">
          <Text className="font-ui-semibold text-[13px] text-red-400">
            {rejectMsg}
          </Text>
        </View>
      )}
      {REACTIONS.map((r) => (
        <Pressable
          key={r}
          onPress={() => onReaction(r)}
          hitSlop={8}
          className={`${btnSize} items-center justify-center rounded-full active:opacity-70`}
        >
          <Text className={emojiSize}>{r}</Text>
        </Pressable>
      ))}
    </>
  );
}
