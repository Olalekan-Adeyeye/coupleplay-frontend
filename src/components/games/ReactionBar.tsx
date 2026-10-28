import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { REACTIONS } from "@/lib/constants";
import { usePalette } from "@/hooks/usePalette";
import type { IncomingReaction } from "@/hooks/useGameReactions";

interface ReactionBarProps {
  incomingReaction: IncomingReaction | null;
  rejectMsg: string | null;
  onReaction: (reaction: string) => void;
  partnerName?: string;
  size?: "sm" | "md";
}

const LIFT_MS = 1300;
const PARTICLES = 4;
const CARD_SHADOW = {
  shadowColor: "#4A3B6B",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 8,
};

function ReactionButton({
  emoji,
  size,
  onPick,
}: {
  emoji: string;
  size: "sm" | "md";
  onPick: () => void;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          scale.value = withSequence(
            withTiming(1.3, { duration: 90 }),
            withSpring(1, { damping: 12 }),
          );
          onPick();
        }}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={`Send ${emoji} reaction`}
        className={`items-center justify-center rounded-full ${size === "sm" ? "h-10 w-10" : "h-11 w-11"}`}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <Text className={size === "sm" ? "text-title-sm" : "text-title-lg"}>
          {emoji}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function ReactionParticle({
  emoji,
  seq,
  index,
}: {
  emoji: string;
  seq: number;
  index: number;
}) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const drift = (((index * 53 + seq * 31) % 9) - 4) * 6;
    const rise = 76 + ((index * 37 + seq * 17) % 5) * 9;

    x.value = withDelay(index * 70, withTiming(drift, { duration: LIFT_MS, easing: Easing.inOut(Easing.quad) }));
    y.value = withDelay(index * 70, withTiming(-rise, { duration: LIFT_MS, easing: Easing.out(Easing.quad) }));
    opacity.value = withDelay(
      index * 70,
      withSequence(
        withTiming(1, { duration: 90 }),
        withDelay(LIFT_MS - index * 70 - 280, withTiming(0, { duration: 280 })),
      ),
    );
  }, [seq, index]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <Animated.View
      style={[style, { position: "absolute", bottom: 0, left: "50%", marginLeft: -13 }]}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
    </Animated.View>
  );
}

export function ReactionBar({
  incomingReaction,
  rejectMsg,
  onReaction,
  partnerName,
  size = "md",
}: ReactionBarProps) {
  const palette = usePalette();
  return (
    <View className="items-center">
      <View
        className="absolute inset-x-0 bottom-full mb-0.5 z-10 items-center"
        style={{ pointerEvents: "none" }}
      >
        {rejectMsg && (
          <Animated.View
            entering={ZoomIn.springify().damping(16)}
            exiting={FadeOut.duration(220)}
            className="rounded-full bg-error-soft px-4 py-2"
          >
            <Text className="font-ui-semibold text-caption text-error-bright">
              {rejectMsg}
            </Text>
          </Animated.View>
        )}

        {incomingReaction && (
          <View
            key={`trail-${incomingReaction.seq}`}
            className="absolute inset-x-0 bottom-3"
          >
            {Array.from({ length: PARTICLES }).map((_, i) => (
              <ReactionParticle
                key={i}
                emoji={incomingReaction.emoji}
                seq={incomingReaction.seq}
                index={i}
              />
            ))}
          </View>
        )}

        {incomingReaction && (
          <Animated.View
            key={`bubble-${incomingReaction.seq}`}
            entering={ZoomIn.springify().damping(13)}
            exiting={FadeOut.duration(220)}
            className="flex-row items-center gap-1.5 rounded-full py-1.5 pl-2.5 pr-3.5"
            style={[CARD_SHADOW, { backgroundColor: palette.surface }]}
          >
            <Text className="text-title-lg">{incomingReaction.emoji}</Text>
            <Text className="font-ui-bold text-caption text-ink">
              {incomingReaction.mine ? "You" : (partnerName ?? "Partner")}
            </Text>
          </Animated.View>
        )}
      </View>

      <View
        className="flex-row items-center gap-1 rounded-full border border-hairline bg-surface px-1.5 py-1"
        style={CARD_SHADOW}
      >
        {REACTIONS.map((r) => (
          <ReactionButton
            key={r}
            emoji={r}
            size={size}
            onPick={() => onReaction(r)}
          />
        ))}
      </View>
    </View>
  );
}
