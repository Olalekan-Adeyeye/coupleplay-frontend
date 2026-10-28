import { memo, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Avatar } from "@/components/ui/avatar";
import { ReactionBar } from "@/components/games/ReactionBar";
import { LeaveGameButton } from "@/components/games/LeaveGameButton";
import { InterstitialOverlay } from "@/components/games/InterstitialOverlay";
import { useGameRoom } from "@/hooks/useGameRoom";
import { useGameReactions } from "@/hooks/useGameReactions";
import { ConfirmModal, InfoModal } from "@/components/ui/ConfirmModal";
import { usePalette } from "@/hooks/usePalette";
import { CARD_SHADOW } from "@/lib/shadows";

interface MemoryMatchCard {
  symbol: number;
  flippedBy: string | null;
  matchedBy: string | null;
}

interface MemoryMatchState {
  roomId: string;
  gameType: string;
  status: "active" | "finished";
  roundNumber: number;
  totalRounds: number;
  scores: Record<string, number>;
  roundsWon: Record<string, number>;
  turnUserId: string | null;
  roundWinnerId: string | null;
  winnerId: string | null;
  cards: MemoryMatchCard[];
  flippedThisTurn: number[];
  memorizeDeadline: number | null;
  revealDeadline: number | null;
  turnDeadline: number | null;
  roundPairs: Record<string, number>;
  lastMove: { indexes: [number, number]; matched: boolean; playerId: string } | null;
}

const CARD_SYMBOLS = [
  "❤️", "🌹", "🧸", "🍫", "🍿", "🎬", "☕", "🌙", "⭐", "🎈", "🎁", "💌",
];

const GRID_COLUMNS = 4;
const GRID_GAP = 8;

type BannerTone = "memorize" | "mine" | "theirs" | "";
type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

export default function MemoryMatchPlayScreen() {
  const palette = usePalette();
  const {
    roomId,
    socket,
    user,
    partnerName,
    state,
    interstitial,
    abandoned,
    askLeave,
    leaveConfirmProps,
    cancelLeave,
  } = useGameRoom<MemoryMatchState>("MEMORY_MATCH", {
    roundEndMessage: ({ won, draw, partnerName: name }) =>
      draw ? "Round drawn!" : won ? "You won the round!" : `${name} won the round!`,
  });

  const [secondsLeft, setSecondsLeft] = useState(0);
  const { incomingReaction, rejectMsg, sendReaction } = useGameReactions(socket, roomId, user?.id);

  const memorizing = state?.memorizeDeadline != null;
  const revealing = state?.revealDeadline != null;
  const myTurn = state?.turnUserId === user?.id && !memorizing && !revealing;

  const clockDeadline =
    state?.status === "active"
      ? (state.memorizeDeadline ?? state.revealDeadline ?? state.turnDeadline)
      : null;

  const timeoutSent = useRef(false);
  useEffect(() => {
    timeoutSent.current = false;
  }, [state?.roundNumber, clockDeadline]);

  useEffect(() => {
    if (!state || state.status !== "active" || !clockDeadline) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((clockDeadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !timeoutSent.current) {
        timeoutSent.current = true;
        socket?.emit("game:timeout", { roomId });
      }
    };

    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [clockDeadline, state?.status, socket, roomId]);

  const flip = (index: number) => {
    if (!state || state.status !== "active") return;
    if (memorizing || revealing) return;
    if (!myTurn) return;
    if (state.flippedThisTurn.includes(index)) return;
    if (state.flippedThisTurn.length >= 2) return;
    const card = state.cards[index];
    if (card.matchedBy || card.flippedBy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    socket?.emit("game:action", {
      roomId,
      action: "flip",
      payload: { cardIndex: index },
    });
  };

  const { width: windowWidth } = useWindowDimensions();
  const boardWidth = Math.min(windowWidth, 460) - 44 - 20;
  const cardSize = Math.floor((boardWidth - (GRID_COLUMNS - 1) * GRID_GAP) / GRID_COLUMNS);

  const myPairs = state?.roundPairs?.[user?.id ?? ""] ?? 0;
  const partnerPairs = state
    ? (Object.entries(state.roundPairs ?? {}).find(([id]) => id !== user?.id)?.[1] ?? 0)
    : 0;

  const pairMatchers = useMemo(() => {
    const matchers: (string | null)[] = new Array(CARD_SYMBOLS.length).fill(null);
    state?.cards.forEach((card) => {
      if (card.matchedBy && matchers[card.symbol] == null) {
        matchers[card.symbol] = card.matchedBy;
      }
    });
    return matchers;
  }, [state?.cards]);

  const bannerTone: BannerTone = memorizing
    ? "memorize"
    : revealing
      ? ""
      : myTurn
        ? "mine"
        : state
          ? "theirs"
          : "";
  const bannerText = memorizing
    ? "Memorize the cards!"
    : revealing
      ? "No match..."
      : !state
        ? ""
        : myTurn
          ? "Your turn — find a pair!"
          : `Waiting for ${partnerName}...`;

  const lastMove = state?.lastMove ?? null;
  useEffect(() => {
    if (lastMove?.matched && lastMove.playerId === user?.id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [lastMove, user?.id]);

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11" />
            <View className="flex-row items-center gap-2 rounded-full bg-surface px-4 py-2 border border-hairline">
              <MaterialCommunityIcons name="brain" size={16} color={palette.primary} />
              <Text className="font-ui-bold text-body-sm text-ink">
                Round {state?.roundNumber ?? 1} of {state?.totalRounds ?? 3}
              </Text>
            </View>
            <View
              className="rounded-full px-3.5 py-2"
              style={{
                backgroundColor: secondsLeft <= 5 ? "#FDEAEE" : "#FEF3C7",
              }}
            >
              <Text
                className="font-ui-bold text-body-sm"
                style={{ color: secondsLeft <= 5 ? "#E53E6B" : "#B45309" }}
              >
                00:{String(Math.max(secondsLeft, 0)).padStart(2, "0")}
              </Text>
            </View>
          </View>

          <View className="mt-3 flex-row items-center justify-center gap-2.5">
            <PlayerChip
              name="You"
              avatar={user?.avatar}
              pairs={myPairs}
              accent={palette.primary}
              active={myTurn && !revealing}
            />
            <Text className="font-display-bold text-body-sm text-ink-tertiary">VS</Text>
            <PlayerChip
              name={partnerName}
              avatar={undefined}
              partnerName={partnerName}
              pairs={partnerPairs}
              accent={palette.rose}
              active={!myTurn && !!state && !memorizing && !revealing}
            />
          </View>

          <View className="mt-3 items-center gap-2">
            {state && bannerText && (
              <TurnBanner text={bannerText} tone={bannerTone} />
            )}
            {state && <MatchDots matchers={pairMatchers} myId={user?.id} />}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 14, paddingBottom: 8 }}
          >
            <View
              className="self-center rounded-[24px] p-[10px]"
              style={[
                {
                  backgroundColor: palette.surfaceSoft,
                  borderWidth: 1,
                  borderColor: memorizing ? "#F59E0B" : palette.hairline,
                },
                CARD_SHADOW,
              ]}
            >
              <View className="flex-row flex-wrap" style={{ gap: GRID_GAP }}>
                {state?.cards.map((card, index) => (
                  <MemoryCard
                    key={index}
                    index={index}
                    symbol={card.symbol}
                    faceUp={memorizing || card.flippedBy !== null || card.matchedBy !== null}
                    matched={card.matchedBy !== null}
                    disabled={!myTurn}
                    onPress={flip}
                    size={cardSize}
                    dealSeed={state.roundNumber}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          <View className="flex-row items-center justify-center gap-3 pb-2 pt-2">
            <ReactionBar
              incomingReaction={incomingReaction}
              rejectMsg={rejectMsg}
              onReaction={(r) => sendReaction(roomId!, r)}
              partnerName={partnerName}
            />
          </View>
          <LeaveGameButton onPress={askLeave} />
        </View>
      </SafeAreaView>

      {interstitial && <InterstitialOverlay message={interstitial} peep={user?.avatar} />}
      <ConfirmModal {...leaveConfirmProps} onCancel={cancelLeave} />
      <InfoModal {...abandoned} />
    </View>
  );
}

function PlayerChip({
  name,
  avatar,
  partnerName,
  pairs,
  accent,
  active,
}: {
  name: string;
  avatar?: string | null;
  partnerName?: string;
  pairs: number;
  accent: string;
  active: boolean;
}) {
  const palette = usePalette();
  return (
    <View
      className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-3 py-2.5 border"
      style={{
        borderColor: active ? accent : palette.hairline,
        shadowColor: "#4A3B6B",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: active ? 0.14 : 0.06,
        shadowRadius: 6,
        elevation: active ? 3 : 1,
      }}
    >
      {partnerName ? (
        <Avatar name={partnerName} size={36} />
      ) : (
        <Avatar avatar={avatar} name={name} size={36} />
      )}
      <View className="flex-1">
        <Text className="font-display-bold text-caption text-ink" numberOfLines={1}>
          {name}
        </Text>
        <Text className="font-ui-medium text-label text-ink-tertiary">{pairs} pairs</Text>
      </View>
      <View
        className="h-6 min-w-[26px] items-center justify-center rounded-full px-1.5"
        style={{ backgroundColor: `${accent}1A` }}
      >
        <Text className="font-display-bold text-caption" style={{ color: accent }}>
          {pairs}
        </Text>
      </View>
    </View>
  );
}

function TurnBanner({ text, tone }: { text: string; tone: BannerTone }) {
  const palette = usePalette();
  const styles: Record<
    BannerTone,
    { bg: string; label: string; icon: IconName | null; iconColor: string }
  > = {
    memorize: { bg: "#FEF3C7", label: "#B45309", icon: "eye", iconColor: "#B45309" },
    mine: { bg: palette.primary, label: "#FFFFFF", icon: "cards-heart", iconColor: "#FFFFFF" },
    theirs: { bg: palette.surface, label: palette.inkSecondary, icon: "timer-sand", iconColor: palette.inkTertiary },
    "": { bg: palette.surface, label: palette.inkSecondary, icon: null, iconColor: palette.inkTertiary },
  };
  const s = styles[tone];

  return (
    <View
      className="flex-row items-center gap-2 rounded-full px-5 py-2.5"
      style={{
        backgroundColor: s.bg,
        borderWidth: tone === "theirs" || tone === "" ? 1 : 0,
        borderColor: palette.hairline,
        shadowColor: "#4A3B6B",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: tone === "mine" ? 0.2 : 0,
        shadowRadius: 8,
        elevation: tone === "mine" ? 3 : 0,
      }}
    >
      {tone === "theirs" && <PulsingDot color={palette.rose} />}
      {s.icon && (
        <MaterialCommunityIcons name={s.icon} size={16} color={s.iconColor} />
      )}
      <Text className="font-ui-bold text-body" style={{ color: s.label }}>
        {text}
      </Text>
    </View>
  );
}

function PulsingDot({ color }: { color: string }) {
  const pulse = useSharedValue(0.35);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [pulse]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));
  return (
    <Animated.View
      style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }, dotStyle]}
    />
  );
}

function MatchDots({ matchers, myId }: { matchers: (string | null)[]; myId?: string }) {
  const palette = usePalette();
  return (
    <View
      className="flex-row flex-wrap items-center justify-center gap-[5px] rounded-full px-3 py-1.5 bg-surface-soft border border-hairline"
    >
      {matchers.map((matcher, i) => (
        <View
          key={i}
          className="h-[9px] w-[9px] rounded-full"
          style={{
            backgroundColor:
              matcher == null
                ? palette.hairline
                : matcher === myId
                  ? palette.primary
                  : palette.rose,
          }}
        />
      ))}
    </View>
  );
}

const MemoryCard = memo(function MemoryCard({
  index,
  symbol,
  faceUp,
  matched,
  disabled,
  onPress,
  size,
  dealSeed,
}: {
  index: number;
  symbol: number;
  faceUp: boolean;
  matched: boolean;
  disabled: boolean;
  onPress: (index: number) => void;
  size: number;
  dealSeed: number;
}) {
  const palette = usePalette();
  const spin = useSharedValue(faceUp ? 1 : 0);
  const entrance = useSharedValue(0);
  const pop = useSharedValue(1);

  useEffect(() => {
    spin.value = withTiming(faceUp ? 1 : 0, {
      duration: 340,
      easing: Easing.bezier(0.3, 0, 0.2, 1),
    });
  }, [faceUp, spin]);

  useEffect(() => {
    entrance.value = 0;
    entrance.value = withDelay(index * 26, withSpring(1, { damping: 16, stiffness: 160 }));
  }, [dealSeed, entrance, index]);

  useEffect(() => {
    if (!matched) return;
    pop.value = withSequence(
      withTiming(1.18, { duration: 150, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 220, easing: Easing.inOut(Easing.quad) }),
    );
  }, [matched, pop]);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: entrance.value,
    transform: [{ scale: entrance.value * pop.value }, { translateY: (1 - entrance.value) * 20 }],
  }));
  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${spin.value * 180}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${spin.value * 180 - 180}deg` }],
  }));

  const label = symbol >= 0 ? (CARD_SYMBOLS[symbol] ?? "❓") : "❓";

  return (
    <Animated.View style={wrapperStyle}>
      <Pressable
        onPress={() => onPress(index)}
        disabled={disabled || faceUp}
        accessibilityRole="button"
        accessibilityLabel={faceUp ? `Card showing ${label}` : "Face-down card"}
        accessibilityState={{ disabled }}
        className="items-center justify-center active:opacity-90"
        style={{
          width: size,
          height: size,
          transform: [{ perspective: 900 }],
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: size * 0.22,
              backgroundColor: palette.primary,
              shadowColor: "#3A2A6B",
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 3,
            },
            backStyle,
          ]}
        >
          <View
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              right: 5,
              bottom: 5,
              borderRadius: size * 0.16,
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.28)",
            }}
          />
          <View
            style={{
              width: size * 0.5,
              height: size * 0.5,
              borderRadius: size * 0.25,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="heart-multiple"
              size={size * 0.3}
              color="#FFFFFF"
            />
          </View>
          {[
            { top: 7, left: 7 },
            { top: 7, right: 7 },
            { bottom: 7, left: 7 },
            { bottom: 7, right: 7 },
          ].map((pos, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                ...pos,
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: "rgba(255,255,255,0.45)",
              }}
            />
          ))}
        </Animated.View>

        <Animated.View
          style={[
            {
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: size * 0.22,
              borderWidth: 1.5,
              borderColor: matched ? palette.emerald : palette.hairline,
              backgroundColor: matched ? `${palette.emerald}1F` : palette.surface,
              opacity: matched ? 0.85 : 1,
            },
            faceStyle,
          ]}
        >
          <Text style={{ fontSize: size * 0.44 }}>{label}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});
