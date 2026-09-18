import { useEffect, useRef, useState, useCallback } from "react";
import { View, Pressable, Text, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/avatar";
import { ReactionBar } from "@/components/games/ReactionBar";
import { LeaveGameButton } from "@/components/games/LeaveGameButton";
import { InterstitialOverlay } from "@/components/games/InterstitialOverlay";
import { usePartnerName } from "@/hooks/usePartnerName";
import { useGameAbandoned } from "@/hooks/useGameAbandoned";
import { useGameReactions } from "@/hooks/useGameReactions";
import { useAuthStore } from "@/stores/authStore";
import { useSocketStore } from "@/hooks/useSocket";
import { useRoomStore } from "@/stores/roomStore";
import { CARD_SHADOW } from "@/lib/shadows";
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
  mode: "hunt" | "race";
  grid: number[];
  targetNumbers: number[];
  finderId: string | null;
  pickerId: string | null;
  foundByPlayer: Record<string, number[]>;
  currentTargetIndex: number;
  totalTargets: number;
  roundDeadline: number | null;
  currentCall: number | null;
  callIndex: number;
  totalCalls: number;
  callDeadline: number | null;
  firstTapped: Record<string, { number: number; tappedAt: number } | null>;
}

export default function NumberHuntPlayScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const user = useAuthStore((s) => s.user);
  const socket = useSocketStore((s) => s.socket);
  const partnerName = usePartnerName();

  const [state, setState] = useState<NumberHuntState | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const { incomingReaction, rejectMsg, sendReaction } = useGameReactions(socket, roomId, user?.id);
  const [interstitial, setInterstitial] = useState<string | null>(null);
  const lastRound = useRef<number | null>(null);
  const leftRef = useRef(false);
  const navigation = useNavigation();

  const isPicker = state?.pickerId === user?.id;
  const isFinder = state?.finderId === user?.id;
  const myFound = state?.foundByPlayer[user?.id ?? ""] ?? [];
  const partnerFound = state
    ? state.foundByPlayer[
        Object.keys(state.foundByPlayer).find((k) => k !== user?.id) ?? ""
      ] ?? []
    : [];

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onState = (s: NumberHuntState) => {
      if (s.roomId !== roomId) return;
      setState(s);
      if (lastRound.current !== s.roundNumber) {
        lastRound.current = s.roundNumber;
        setSelectedTargets([]);
      }
    };
    const onRoundEnd = (d: any) => {
      if (d.roomId !== roomId) return;
      const won = d.winnerId === user?.id;
      const draw = d.winnerId == null;
      setInterstitial(
        draw
          ? "Round drawn!"
          : won
            ? "You won the round!"
            : `${partnerName} won the round!`,
      );
      setTimeout(() => setInterstitial(null), 1800);
    };
    const onFinished = (d: any) => {
      if (d.roomId !== roomId) return;
      const results = d.results;
      router.replace(
        `/games/NUMBER_HUNT/results?winnerId=${results.winnerId ?? ""}&scores=${JSON.stringify(results.scores)}&totalRounds=${results.totalRounds}&roundsWon=${encodeURIComponent(JSON.stringify(results.roundsWon ?? {}))}&roomId=${roomId}` as any,
      );
    };
    socket.on("game:state", onState);
    socket.on("game:round_end", onRoundEnd);
    socket.on("game:finished", onFinished);
    socket.emit("game:sync", { roomId });
    return () => {
      socket.off("game:state", onState);
      socket.off("game:round_end", onRoundEnd);
      socket.off("game:finished", onFinished);
    };
  }, [socket, roomId, user?.id, partnerName]);

  useGameAbandoned(socket, roomId, partnerName);

  // Timer countdown
  const timeoutSent = useRef(false);
  useEffect(() => {
    timeoutSent.current = false;
  }, [state?.roundNumber, state?.callIndex]);

  useEffect(() => {
    if (!state || state.status !== "active") return;

    const deadline =
      state.mode === "hunt" ? state.roundDeadline : state.callDeadline;
    if (!deadline) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
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
  }, [state?.roundDeadline, state?.callDeadline, state?.callIndex, state?.status, socket, roomId]);

  const handleFound = useCallback(
    (num: number) => {
      if (!state || state.status !== "active") return;
      if (state.mode !== "hunt") return;
      if (!isFinder) return;
      if (secondsLeft <= 0) return;
      if (myFound.includes(num)) return;

      socket?.emit("game:action", {
        roomId,
        action: "found",
        payload: { number: num },
      });
    },
    [state, isFinder, secondsLeft, myFound, socket, roomId],
  );

  const handleTap = useCallback(
    (num: number) => {
      if (!state || state.status !== "active") return;
      if (state.mode !== "race") return;
      if (secondsLeft <= 0) return;
      if (state.firstTapped?.[user?.id ?? ""] != null) return;

      socket?.emit("game:action", {
        roomId,
        action: "tap",
        payload: { number: num },
      });
    },
    [state, secondsLeft, user?.id, socket, roomId],
  );

  const handleSelectTarget = (num: number) => {
    if (!isPicker) return;
    if (state?.targetNumbers && state.targetNumbers.length > 0) return;
    setSelectedTargets((prev) => {
      if (prev.includes(num)) return prev.filter((n) => n !== num);
      if (prev.length >= 5) return prev;
      return [...prev, num];
    });
  };

  const handleConfirmTargets = () => {
    if (selectedTargets.length < 1) return;
    socket?.emit("game:action", {
      roomId,
      action: "select_targets",
      payload: { numbers: selectedTargets },
    });
  };

  const handleSelectMode = (mode: "hunt" | "race") => {
    socket?.emit("game:action", {
      roomId,
      action: "select_mode",
      payload: { mode },
    });
  };

  useGameAbandoned(socket, roomId, partnerName);

  const handleLeave = () => {
    Alert.alert("Leave game?", "The game room will be closed for both of you.", [
      { text: "Stay", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: () => {
          leftRef.current = true;
          socket?.emit("room:leave", { roomId });
          useRoomStore.getState().setRoom(null);
          router.replace("/(tabs)/games");
        },
      },
    ]);
  };

  // Intercept Android back button
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove" as any, (e: any) => {
      e.preventDefault();
      if (leftRef.current) return;
      Alert.alert("Leave game?", "The game room will be closed for both of you.", [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            leftRef.current = true;
            socket?.emit("room:leave", { roomId });
            useRoomStore.getState().setRoom(null);
            navigation.dispatch(e.data.action);
          },
        },
      ]);
    });
    return () => unsub();
  }, [navigation, socket, roomId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (!leftRef.current && roomId) {
        socket?.emit("room:leave", { roomId });
        useRoomStore.getState().setRoom(null);
      }
    };
  }, [roomId, socket]);

  const myScore = state?.scores[user?.id ?? ""] ?? 0;
  const partnerScore = state
    ? (Object.entries(state.scores).find(([id]) => id !== user?.id)?.[1] ?? 0)
    : 0;

  // Hunt mode: waiting for picker to select targets
  const waitingForTargets =
    state?.mode === "hunt" &&
    isFinder &&
    state?.targetNumbers.length === 0;

  // Hunt mode: picker selecting targets
  const selectingTargets =
    state?.mode === "hunt" &&
    isPicker &&
    state?.targetNumbers.length === 0;

  // Grid press handler depends on mode
  const handleGridPress =
    state?.mode === "hunt" ? (isFinder ? handleFound : handleSelectTarget) : handleTap;

  // Grid found numbers for visual feedback
  const gridFoundNumbers =
    state?.mode === "hunt"
      ? isFinder
        ? myFound
        : partnerFound
      : [];

  // Grid target numbers to show (only after round ends or if picker wants to see)
  const gridTargetNumbers =
    state?.mode === "hunt" && state.roundWinnerId != null
      ? state.targetNumbers
      : [];

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[16px] pt-[14px] pb-[24px]">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11" />
            <View
              className="flex-row items-center gap-2 rounded-full bg-surface px-4 py-2"
              style={CARD_SHADOW}
            >
              <Text className="font-ui-bold text-[13px] text-ink">
                Round {state?.roundNumber ?? 1} of {state?.totalRounds ?? 5}
              </Text>
            </View>
            <View
              className="rounded-full px-3.5 py-2"
              style={{
                backgroundColor: secondsLeft <= 5 ? "#FDEAEE" : "#EDE9FE",
              }}
            >
              <Text
                className="font-ui-bold text-[13px]"
                style={{ color: secondsLeft <= 5 ? "#E53E6B" : "#8B5CF6" }}
              >
                00:{String(Math.max(secondsLeft, 0)).padStart(2, "0")}
              </Text>
            </View>
          </View>

          {/* Mode badge */}
          {state?.mode && (
            <View className="mt-3 items-center">
              <View
                className="rounded-full px-4 py-1.5"
                style={{
                  backgroundColor:
                    state.mode === "hunt" ? "#8B5CF61F" : "#F59E0B1F",
                }}
              >
                <Text
                  className="font-ui-bold text-[12px]"
                  style={{
                    color: state.mode === "hunt" ? "#8B5CF6" : "#F59E0B",
                  }}
                >
                  {state.mode === "hunt" ? "🎯 HUNT MODE" : "⚡ RACE MODE"}
                </Text>
              </View>
            </View>
          )}

          {/* Players + score */}
          <View className="mt-3 flex-row items-center justify-center gap-3">
            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-3 py-2.5"
              style={CARD_SHADOW}
            >
              <Avatar avatar={user?.avatar} name={user?.name} size={36} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-[12px] text-ink"
                  numberOfLines={1}
                >
                  You
                </Text>
                <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                  {myScore} pts
                </Text>
              </View>
              {isPicker && state?.mode === "hunt" && (
                <View className="rounded-full bg-[#8B5CF61F] px-2 py-0.5">
                  <Text className="font-ui-bold text-[10px] text-[#8B5CF6]">
                    PICKER
                  </Text>
                </View>
              )}
              {isFinder && state?.mode === "hunt" && (
                <View className="rounded-full bg-[#F59E0B1F] px-2 py-0.5">
                  <Text className="font-ui-bold text-[10px] text-[#F59E0B]">
                    FINDER
                  </Text>
                </View>
              )}
            </View>

            <Text className="font-display-bold text-[13px] text-ink-tertiary">
              VS
            </Text>

            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-3 py-2.5"
              style={CARD_SHADOW}
            >
              <Avatar name={partnerName} size={36} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-[12px] text-ink"
                  numberOfLines={1}
                >
                  {partnerName}
                </Text>
                <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                  {partnerScore} pts
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 12, gap: 8, paddingBottom: 8 }}
          >
            {/* Hunt mode: target selection UI */}
            {selectingTargets && (
              <View
                className="items-center gap-3 rounded-3xl bg-surface px-5 py-4"
                style={CARD_SHADOW}
              >
                <Text className="font-display-bold text-[16px] text-ink">
                  Pick {state?.totalTargets ?? 5} target numbers
                </Text>
                <Text className="text-center font-ui-medium text-[12px] text-ink-secondary">
                  Tap numbers on the grid. Your partner must find them!
                </Text>
                <Text className="font-ui-bold text-[13px] text-[#8B5CF6]">
                  {selectedTargets.length} / {state?.totalTargets ?? 5} selected
                </Text>
                <Pressable
                  onPress={handleConfirmTargets}
                  disabled={selectedTargets.length < 1}
                  className="rounded-2xl px-8 py-3 active:opacity-80"
                  style={{
                    backgroundColor:
                      selectedTargets.length >= 1 ? "#8B5CF6" : "#2D2945",
                  }}
                >
                  <Text
                    className="font-ui-bold text-[14px]"
                    style={{
                      color:
                        selectedTargets.length >= 1 ? "#FFFFFF" : "#6B6480",
                    }}
                  >
                    CONFIRM TARGETS
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Hunt mode: finder waiting */}
            {waitingForTargets && (
              <View
                className="items-center gap-3 rounded-3xl bg-surface px-5 py-4"
                style={CARD_SHADOW}
              >
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF61F]">
                  <MaterialCommunityIcons
                    name="crosshairs"
                    size={24}
                    color="#8B5CF6"
                  />
                </View>
                <Text className="font-display-bold text-[16px] text-ink">
                  Waiting for targets...
                </Text>
                <Text className="text-center font-ui-medium text-[12px] text-ink-secondary">
                  {partnerName} is picking numbers for you to find.
                </Text>
              </View>
            )}

            {/* Race mode: current call display */}
            {state?.mode === "race" && state.currentCall != null && (
              <View
                className="items-center gap-2 rounded-3xl bg-surface px-5 py-4"
                style={CARD_SHADOW}
              >
                <Text className="font-ui-medium text-[12px] text-ink-tertiary">
                  Find & tap this number
                </Text>
                <View className="h-16 w-16 items-center justify-center rounded-2xl bg-[#F59E0B1F]">
                  <Text className="font-display-bold text-[32px] text-[#F59E0B]">
                    {state.currentCall}
                  </Text>
                </View>
                <Text className="font-ui-medium text-[12px] text-ink-tertiary">
                  {state.callIndex + 1} / {state.totalCalls}
                </Text>
              </View>
            )}

            {/* Hunt mode: found count */}
            {state?.mode === "hunt" &&
              state.targetNumbers.length > 0 &&
              isFinder && (
                <View
                  className="items-center rounded-2xl bg-surface px-4 py-3"
                  style={CARD_SHADOW}
                >
                  <Text className="font-ui-bold text-[14px] text-ink">
                    Found: {myFound.length} / {state.targetNumbers.length}
                  </Text>
                </View>
              )}

            {/* Race mode: tapped indicator */}
            {state?.mode === "race" &&
              state.firstTapped?.[user?.id ?? ""] != null && (
                <View
                  className="items-center rounded-2xl bg-surface px-4 py-3"
                  style={CARD_SHADOW}
                >
                  <Text className="font-ui-bold text-[14px] text-ink">
                    Waiting for {partnerName}...
                  </Text>
                </View>
              )}

            {/* Honeycomb Grid */}
            {state && (
              <HoneycombGrid
                numbers={state.grid}
                onCellPress={
                  state.status === "active" ? handleGridPress : undefined
                }
                foundNumbers={gridFoundNumbers}
                targetNumbers={gridTargetNumbers}
                highlightNumber={
                  state.mode === "race" ? state.currentCall : null
                }
                disabled={state.status !== "active"}
                showAllTargets={
                  state.roundWinnerId != null && state.mode === "hunt"
                }
              />
            )}
          </ScrollView>

          {/* Reactions + leave */}
          <View className="flex-row items-center justify-center gap-3 pb-1 pt-1">
            <ReactionBar
              incomingReaction={incomingReaction}
              rejectMsg={rejectMsg}
              onReaction={(r) => sendReaction(roomId!, r)}
              size="sm"
            />
          </View>
          <LeaveGameButton onPress={handleLeave} />
        </View>
      </SafeAreaView>

      {/* Mode selection overlay */}
      {state?.mode === null && (
        <View className="absolute inset-0 z-20 items-center justify-center bg-paper/95">
          <View
            className="items-center gap-5 rounded-3xl bg-surface px-8 py-8"
            style={CARD_SHADOW}
          >
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#8B5CF61F]">
              <MaterialCommunityIcons name="gamepad-variant" size={30} color="#8B5CF6" />
            </View>
            <Text className="font-display-bold text-[22px] text-ink">
              Choose Your Mode
            </Text>
            <Text className="text-center font-ui-medium text-[13px] text-ink-secondary">
              Both players play the same mode for all 5 rounds.
            </Text>
            <View className="w-full gap-3">
              <Pressable
                onPress={() => handleSelectMode("hunt")}
                className="flex-row items-center gap-4 rounded-2xl border-[1.5px] border-[#8B5CF6] bg-[#8B5CF61F] px-5 py-4 active:opacity-80"
              >
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]">
                  <MaterialCommunityIcons name="crosshairs" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-display-bold text-[16px] text-ink">
                    🎯 Hunt
                  </Text>
                  <Text className="font-ui-medium text-[12px] text-ink-secondary">
                    Pick targets for your partner to find on the grid.
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => handleSelectMode("race")}
                className="flex-row items-center gap-4 rounded-2xl border-[1.5px] border-[#F59E0B] bg-[#F59E0B1F] px-5 py-4 active:opacity-80"
              >
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-[#F59E0B]">
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="font-display-bold text-[16px] text-ink">
                    ⚡ Race
                  </Text>
                  <Text className="font-ui-medium text-[12px] text-ink-secondary">
                    Race to tap the called number first.
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* Interstitial overlay */}
      {interstitial && (
        <InterstitialOverlay
          message={interstitial}
          icon={interstitial.includes("won") ? "trophy" : "handshake"}
          iconColor={interstitial.includes("won") ? "#10B981" : "#8B5CF6"}
          iconBg={interstitial.includes("won") ? "#10B9811F" : "#8B5CF61F"}
        />
      )}
    </View>
  );
}
