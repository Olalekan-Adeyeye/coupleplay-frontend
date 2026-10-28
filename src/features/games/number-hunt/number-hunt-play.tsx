import { useEffect, useRef, useState } from "react";
import { View, Pressable, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/avatar";
import { ReactionBar } from "@/components/games/ReactionBar";
import { LeaveGameButton } from "@/components/games/LeaveGameButton";
import { InterstitialOverlay } from "@/components/games/InterstitialOverlay";
import { usePalette } from "@/hooks/usePalette";
import { useGameRoom } from "@/hooks/useGameRoom";
import { useGameReactions } from "@/hooks/useGameReactions";
import { ConfirmModal, InfoModal } from "@/components/ui/ConfirmModal";
import { HoneycombGrid } from "./honeycomb-grid";

interface NumberHuntState {
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
  grid: number[];
  currentCall: number | null;
  callIndex: number;
  totalCalls: number;
  callDeadline: number | null;
  firstTapped: Record<string, { number: number; tappedAt: number } | null>;
  roundRaceScores: Record<string, number>;
}

export default function NumberHuntPlayScreen() {
  const palette = usePalette();
  const {
    roomId,
    socket,
    user,
    partnerName,
    state,
    revealState,
    interstitial,
    abandoned,
    askLeave,
    leaveConfirmProps,
    cancelLeave,
  } = useGameRoom<NumberHuntState>("NUMBER_HUNT", {
    roundEndMessage: ({ won, draw, partnerName: name }) =>
      draw ? "Round drawn!" : won ? "You won the round!" : `${name} won the round!`,
  });

  const [secondsLeft, setSecondsLeft] = useState(0);
  const { incomingReaction, rejectMsg, sendReaction } = useGameReactions(socket, roomId, user?.id);

  // Timer countdown — the timeout emit is guarded so it fires once per call.
  const timeoutSent = useRef(false);
  useEffect(() => {
    timeoutSent.current = false;
  }, [state?.roundNumber, state?.callIndex]);

  useEffect(() => {
    if (!state || state.status !== "active" || !state.callDeadline) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((state.callDeadline! - Date.now()) / 1000),
      );
      setSecondsLeft(remaining);
      if (remaining <= 0 && !timeoutSent.current) {
        timeoutSent.current = true;
        socket?.emit("game:timeout", { roomId });
      }
    };

    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [state?.callDeadline, state?.status, socket, roomId]);

  const myTapped = state?.firstTapped?.[user?.id ?? ""] != null;

  const displayState = revealState ?? state;

  const handleTap = (num: number) => {
    if (!state || state.status !== "active") return;
    if (secondsLeft <= 0) return;
    if (myTapped) return;

    socket?.emit("game:action", {
      roomId,
      action: "tap",
      payload: {
        number: num,
        callIndex: state.callIndex,
        roundNumber: state.roundNumber,
      },
    });
  };

  const myScore = state?.scores[user?.id ?? ""] ?? 0;
  const partnerScore = state
    ? (Object.entries(state.scores).find(([id]) => id !== user?.id)?.[1] ?? 0)
    : 0;

  // Flash feedback whenever a call resolves: compare score snapshots on
  // every new call, but stay silent across round changes.
  const [flash, setFlash] = useState<string | null>(null);
  const prevScoresRef = useRef<Record<string, number> | null>(null);
  const prevRoundRef = useRef<number | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const scores = state?.scores;
    if (!scores) return;
    const prev = prevScoresRef.current;
    const prevRound = prevRoundRef.current;
    prevScoresRef.current = scores;
    prevRoundRef.current = state?.roundNumber ?? 1;
    if (!prev || state?.roundNumber !== prevRound) return;

    let message: string | null = null;
    if ((scores[user?.id ?? ""] ?? 0) > (prev[user?.id ?? ""] ?? 0)) {
      message = "You got it! +1";
    } else if (Object.entries(scores).some(([id, v]) => id !== user?.id && (v ?? 0) > (prev[id] ?? 0))) {
      message = `${partnerName} got it!`;
    } else if (
      (scores[user?.id ?? ""] ?? 0) < (prev[user?.id ?? ""] ?? 0) ||
      Object.entries(scores).some(([id, v]) => id !== user?.id && (v ?? 0) < (prev[id] ?? 0))
    ) {
      message = "Missed!";
    }
    if (!message) return;

    setFlash(message);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1200);
  }, [state?.callIndex, state?.scores, user?.id, partnerName]);

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11" />
            <View
              className="flex-row items-center gap-2 rounded-full bg-surface px-4 py-2 border border-hairline"
            >
              <MaterialCommunityIcons name="hexagon" size={16} color={palette.primary} />
              <Text className="font-ui-bold text-body-sm text-ink">
                Round {state?.roundNumber ?? 1} of {state?.totalRounds ?? 5}
              </Text>
            </View>
            {state?.callDeadline != null ? (
              <View
                className="rounded-full px-3.5 py-2"
                style={{
                  backgroundColor: secondsLeft <= 5 ? "#FDEAEE" : "#FEF3C7",
                }}
              >
                <Text
                  className="font-ui-bold text-body-sm"
                  style={{ color: secondsLeft <= 5 ? "#E53E6B" : "#D97706" }}
                >
                  00:{String(Math.max(secondsLeft, 0)).padStart(2, "0")}
                </Text>
              </View>
            ) : (
              <View className="h-11 w-11" />
            )}
          </View>

          <View className="mt-3 flex-row items-center justify-center gap-3">
            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-3 py-2.5 border border-hairline"
            >
              <Avatar avatar={user?.avatar} name={user?.name} size={36} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-caption text-ink"
                  numberOfLines={1}
                >
                  You
                </Text>
                <Text className="font-ui-medium text-label text-ink-tertiary">
                  {myScore} pts
                </Text>
              </View>
            </View>

            <Text className="font-display-bold text-body-sm text-ink-tertiary">
              VS
            </Text>

            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-3 py-2.5 border border-hairline"
            >
              <Avatar name={partnerName} size={36} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-caption text-ink"
                  numberOfLines={1}
                >
                  {partnerName}
                </Text>
                <Text className="font-ui-medium text-label text-ink-tertiary">
                  {partnerScore} pts
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, gap: 8, paddingBottom: 8 }}
          >
            <View className="flex-row items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#F59E0B1F]">
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={20}
                  color="#F59E0B"
                />
              </View>
              <View className="flex-1">
                <Text className="font-display-bold text-body-sm text-ink">
                  Tap the called number first!
                </Text>
                <Text className="font-ui-medium text-caption text-ink-secondary">
                  Correct tap +1 point · wrong tap −1 · fastest finger wins.
                </Text>
              </View>
            </View>

            {state?.currentCall != null && (
              <View
                className="items-center gap-2 rounded-3xl bg-surface px-5 py-4 border border-hairline"
              >
                <Text className="font-ui-medium text-caption text-ink-tertiary">
                  Find & tap this number
                </Text>
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#F59E0B1F]">
                  <Text className="font-display-bold text-score text-[#F59E0B]">
                    {state.currentCall}
                  </Text>
                </View>
                <Text className="font-ui-medium text-caption text-ink-tertiary">
                  Call {state.callIndex + 1} of {state.totalCalls}
                </Text>
              </View>
            )}

            {flash && (
              <View className="items-center rounded-2xl bg-surface px-4 py-3 border border-hairline">
                <Text className="font-ui-bold text-body text-ink">
                  {flash}
                </Text>
              </View>
            )}

            {myTapped && state?.currentCall != null && !flash && (
              <View
                className="items-center rounded-2xl bg-surface px-4 py-3 border border-hairline"
              >
                <Text className="font-ui-bold text-body text-ink">
                  Waiting for {partnerName}...
                </Text>
              </View>
            )}

            {displayState && (
              <HoneycombGrid
                numbers={displayState.grid}
                onCellPress={
                  state?.status === "active" ? handleTap : undefined
                }
                disabled={state?.status !== "active"}
              />
            )}
          </ScrollView>

          <View className="flex-row items-center justify-center gap-3 pb-1 pt-1">
            <ReactionBar
              incomingReaction={incomingReaction}
              rejectMsg={rejectMsg}
              onReaction={(r) => sendReaction(roomId!, r)}
              partnerName={partnerName}
              size="sm"
            />
          </View>
          <LeaveGameButton onPress={askLeave} />
        </View>
      </SafeAreaView>

      {interstitial && (
        <InterstitialOverlay
          message={interstitial}
          peep={user?.avatar}
        />
      )}
      <ConfirmModal {...leaveConfirmProps} onCancel={cancelLeave} />
      <InfoModal {...abandoned} />
    </View>
  );
}
