import { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, Text, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
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
import { CARD_SHADOW, BUTTON_SHADOW } from "@/lib/shadows";

interface Question {
  id: string;
  question: string;
  options: { text: string; emoji: string }[];
  correctIndex: number;
}

interface SpeedBattleState {
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
  currentQuestionIndex: number;
  questions: Question[];
  answers: Record<
    string,
    { optionIndex: number; correct: boolean; answeredAt: number } | null
  >;
  questionDeadline: number | null;
  firstCorrectId: string | null;
  secondCorrectId: string | null;
}

export default function SpeedBattlePlayScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const user = useAuthStore((s) => s.user);
  const socket = useSocketStore((s) => s.socket);
  const partnerName = usePartnerName();

  const [state, setState] = useState<SpeedBattleState | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const { incomingReaction, rejectMsg, sendReaction } = useGameReactions(socket, roomId, user?.id);
  const [interstitial, setInterstitial] = useState<string | null>(null);
  const lastRound = useRef<number | null>(null);
  const leftRef = useRef(false);
  const navigation = useNavigation();

  const question = state?.questions[state?.currentQuestionIndex ?? 0] ?? null;
  const myAnswer = state?.answers[user?.id ?? ""] ?? null;
  const partnerAnswer = state?.answers[
    Object.keys(state?.answers ?? {}).find((k) => k !== user?.id) ?? ""
  ] ?? null;

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const onState = (s: SpeedBattleState) => {
      if (s.roomId !== roomId) return;
      setState(s);
      // New question arrived — clear the local pick inside the event
      // handler (not an effect) to avoid render cascades.
      if (lastRound.current !== s.roundNumber) {
        lastRound.current = s.roundNumber;
        setSelected(null);
      }
    };
    const onRoundEnd = (d: any) => {
      if (d.roomId !== roomId) return;
      const won = d.winnerId === user?.id;
      const draw = d.winnerId == null;
      setInterstitial(
        draw
          ? "No one scored!"
          : won
            ? "You scored!"
            : `${partnerName} scored!`,
      );
      setTimeout(() => setInterstitial(null), 1800);
    };
    const onFinished = (d: any) => {
      if (d.roomId !== roomId) return;
      const results = d.results;
      router.replace(
        `/games/SPEED_BATTLE/results?winnerId=${results.winnerId ?? ""}&scores=${JSON.stringify(results.scores)}&totalRounds=${results.totalRounds}&roundsWon=${encodeURIComponent(JSON.stringify(results.roundsWon ?? {}))}&roomId=${roomId}` as any,
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

  // Timer countdown. Timeout emits ONCE per question (guarded ref) —
  // never a stream of emits while the clock sits at zero.
  const timeoutSent = useRef(false);
  useEffect(() => {
    timeoutSent.current = false;
  }, [state?.roundNumber, state?.currentQuestionIndex]);

  useEffect(() => {
    if (!state || state.status !== "active" || !state.questionDeadline) return;
    if (myAnswer) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((state.questionDeadline! - Date.now()) / 1000),
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
  }, [state?.questionDeadline, state?.status, myAnswer, socket, roomId]);

  const handleAnswer = (index: number) => {
    if (myAnswer) return;
    if (!state || state.status !== "active") return;
    if (secondsLeft <= 0) return;
    setSelected(index);
    socket?.emit("game:action", {
      roomId,
      action: "answer",
      payload: { optionIndex: index },
    });
  };

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
  const showReveal = myAnswer != null && (partnerAnswer != null || secondsLeft <= 0);

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
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
                backgroundColor: secondsLeft <= 5 ? "#FDEAEE" : "#FEF3C7",
              }}
            >
              <Text
                className="font-ui-bold text-[13px]"
                style={{ color: secondsLeft <= 5 ? "#E53E6B" : "#D97706" }}
              >
                00:{String(Math.max(secondsLeft, 0)).padStart(2, "0")}
              </Text>
            </View>
          </View>

          {/* Players + score */}
          <View className="mt-4 flex-row items-center justify-center gap-3">
            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-4 py-3"
              style={CARD_SHADOW}
            >
              <Avatar avatar={user?.avatar} name={user?.name} size={40} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-[13px] text-ink"
                  numberOfLines={1}
                >
                  You
                </Text>
                <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                  {myScore} pts
                </Text>
              </View>
              {myAnswer && (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor: myAnswer.correct ? "#DCFCE7" : "#FEE2E2",
                  }}
                >
                  <Text
                    className="font-ui-bold text-[11px]"
                    style={{ color: myAnswer.correct ? "#16A34A" : "#DC2626" }}
                  >
                    {myAnswer.correct ? "✓" : "✗"}
                  </Text>
                </View>
              )}
            </View>

            <Text className="font-display-bold text-[13px] text-ink-tertiary">
              VS
            </Text>

            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-4 py-3"
              style={CARD_SHADOW}
            >
              <Avatar name={partnerName} size={40} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-[13px] text-ink"
                  numberOfLines={1}
                >
                  {partnerName}
                </Text>
                <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                  {partnerScore} pts
                </Text>
              </View>
              {partnerAnswer && (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor: partnerAnswer.correct
                      ? "#DCFCE7"
                      : "#FEE2E2",
                  }}
                >
                  <Text
                    className="font-ui-bold text-[11px]"
                    style={{
                      color: partnerAnswer.correct ? "#16A34A" : "#DC2626",
                    }}
                  >
                    {partnerAnswer.correct ? "✓" : "✗"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Question + options */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, gap: 12, paddingBottom: 8 }}
          >
            {/* Question card */}
            <View
              className="items-center gap-3 rounded-3xl bg-surface px-6 py-6"
              style={CARD_SHADOW}
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F59E0B1F]">
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={22}
                  color="#F59E0B"
                />
              </View>
              <Text className="text-center font-display-bold text-[19px] leading-[27px] text-ink">
                {question?.question ?? "Loading..."}
              </Text>
            </View>

            {/* Options */}
            {question?.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrectAnswer = showReveal && i === question.correctIndex;
              const isMyWrong = showReveal && isSelected && !myAnswer?.correct;

              let bg = "bg-surface";
              let border = "border-surface-border";
              let textColor = "text-ink";

              if (!showReveal && !myAnswer) {
                if (isSelected) {
                  bg = "bg-amber-500";
                  border = "border-amber-500";
                  textColor = "text-white";
                }
              } else if (showReveal) {
                if (isCorrectAnswer) {
                  bg = "bg-emerald-50";
                  border = "border-emerald-400";
                  textColor = "text-emerald-800";
                } else if (isMyWrong) {
                  bg = "bg-red-50";
                  border = "border-red-300";
                  textColor = "text-red-700";
                }
              } else {
                // waiting for partner
                if (isSelected) {
                  bg = "bg-primary";
                  border = "border-primary";
                  textColor = "text-white";
                }
              }

              return (
                <Pressable
                  key={i}
                  onPress={() => handleAnswer(i)}
                  disabled={!!myAnswer || secondsLeft <= 0}
                  className={`flex-row items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 ${bg} ${border} active:opacity-80`}
                >
                  <Text className="text-[20px]">{opt.emoji}</Text>
                  <Text
                    className={`flex-1 font-ui-semibold text-[15px] ${textColor}`}
                  >
                    {opt.text}
                  </Text>
                  {showReveal && isCorrectAnswer && (
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-[#16A34A1F]">
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color="#16A34A"
                      />
                    </View>
                  )}
                  {showReveal && isMyWrong && (
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-[#DC26261F]">
                      <MaterialCommunityIcons
                        name="close"
                        size={16}
                        color="#F87171"
                      />
                    </View>
                  )}
                </Pressable>
              );
            })}

            {/* Waiting / result card */}
            {myAnswer && !showReveal && (
              <View
                className="items-center gap-3 rounded-3xl bg-surface px-6 py-6"
                style={CARD_SHADOW}
              >
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F59E0B1F]">
                  <MaterialCommunityIcons
                    name="timer-sand"
                    size={28}
                    color="#F59E0B"
                  />
                </View>
                <Text className="font-display-bold text-[18px] text-ink">
                  Answer locked in!
                </Text>
                <Text className="text-center font-ui-medium text-[13px] text-ink-secondary">
                  Waiting for {partnerName}...
                </Text>
              </View>
            )}

            {showReveal && (
              <View
                className="items-center gap-3 rounded-3xl bg-surface px-6 py-6"
                style={CARD_SHADOW}
              >
                <View
                  className="h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: myAnswer?.correct
                      ? "#16A34A1F"
                      : "#DC26261F",
                  }}
                >
                  <MaterialCommunityIcons
                    name={myAnswer?.correct ? "target" : "emoticon-sad-outline"}
                    size={28}
                    color={myAnswer?.correct ? "#16A34A" : "#F87171"}
                  />
                </View>
                <Text className="font-display-bold text-[18px] text-ink">
                  {myAnswer?.correct
                    ? state?.firstCorrectId === user?.id
                      ? "First to answer! +3 pts"
                      : "Correct! +1 pt"
                    : "Wrong answer!"}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Reactions + leave */}
          <View className="flex-row items-center justify-center gap-3 pb-2 pt-2">
            <ReactionBar
              incomingReaction={incomingReaction}
              rejectMsg={rejectMsg}
              onReaction={(r) => sendReaction(roomId!, r)}
            />
          </View>
          <LeaveGameButton onPress={handleLeave} />
        </View>
      </SafeAreaView>

      {/* Interstitial overlay */}
      {interstitial && (
        <InterstitialOverlay
          message={interstitial}
          icon={interstitial.includes("scored") ? "lightning-bolt" : "handshake"}
          iconColor={interstitial.includes("scored") ? "#F59E0B" : "#946BFF"}
          iconBg={interstitial.includes("scored") ? "#F59E0B1F" : "#946BFF1F"}
        />
      )}
    </View>
  );
}
