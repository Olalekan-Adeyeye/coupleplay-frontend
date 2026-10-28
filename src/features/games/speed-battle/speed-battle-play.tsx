import { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/avatar";
import { ReactionBar } from "@/components/games/ReactionBar";
import { LeaveGameButton } from "@/components/games/LeaveGameButton";
import { InterstitialOverlay } from "@/components/games/InterstitialOverlay";
import { useGameRoom } from "@/hooks/useGameRoom";
import { useGameReactions } from "@/hooks/useGameReactions";
import { ConfirmModal, InfoModal } from "@/components/ui/ConfirmModal";
import { usePalette } from "@/hooks/usePalette";

interface Question {
  id: string;
  question: string;
  options: { text: string; emoji: string }[];
  correctIndex?: number;
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
  } = useGameRoom<SpeedBattleState>("SPEED_BATTLE", {
    roundEndMessage: ({ won, draw, partnerName: name }) =>
      draw ? "No one scored!" : won ? "You scored!" : `${name} scored!`,
    onNewRound: () => setSelected(null),
  });

  const [selected, setSelected] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const { incomingReaction, rejectMsg, sendReaction } = useGameReactions(socket, roomId, user?.id);

  const displayState = revealState ?? state;
  const question =
    displayState?.questions[displayState?.currentQuestionIndex ?? 0] ?? null;
  const myAnswer = displayState?.answers[user?.id ?? ""] ?? null;
  const partnerAnswer = displayState?.answers[
    Object.keys(displayState?.answers ?? {}).find((k) => k !== user?.id) ?? ""
  ] ?? null;

  // Timer countdown — the timeout emit is guarded so it fires once per question.
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

  const myScore = state?.scores[user?.id ?? ""] ?? 0;
  const partnerScore = state
    ? (Object.entries(state.scores).find(([id]) => id !== user?.id)?.[1] ?? 0)
    : 0;
  // Partner taps are hidden until the round-end reveal.
  const showReveal = revealState != null;

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11" />
            <View
              className="flex-row items-center gap-2 rounded-full bg-surface px-4 py-2 border border-hairline"
            >
              <Text className="font-ui-bold text-body-sm text-ink">
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
                className="font-ui-bold text-body-sm"
                style={{ color: secondsLeft <= 5 ? "#E53E6B" : "#D97706" }}
              >
                00:{String(Math.max(secondsLeft, 0)).padStart(2, "0")}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-center gap-3">
            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-4 py-3 border border-hairline"
            >
              <Avatar avatar={user?.avatar} name={user?.name} size={40} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-body-sm text-ink"
                  numberOfLines={1}
                >
                  You
                </Text>
                <Text className="font-ui-medium text-label text-ink-tertiary">
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
                    className="font-ui-bold text-label"
                    style={{ color: myAnswer.correct ? "#16A34A" : "#DC2626" }}
                  >
                    {myAnswer.correct ? "✓" : "✗"}
                  </Text>
                </View>
              )}
            </View>

            <Text className="font-display-bold text-body-sm text-ink-tertiary">
              VS
            </Text>

            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-surface px-4 py-3 border border-hairline"
            >
              <Avatar name={partnerName} size={40} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-body-sm text-ink"
                  numberOfLines={1}
                >
                  {partnerName}
                </Text>
                <Text className="font-ui-medium text-label text-ink-tertiary">
                  {partnerScore} pts
                </Text>
              </View>
              {partnerAnswer && (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor: revealState
                      ? partnerAnswer.correct
                        ? "#DCFCE7"
                        : "#FEE2E2"
                      : palette.primarySoft,
                  }}
                >
                  <Text
                    className="font-ui-bold text-label"
                    style={{
                      color: revealState
                        ? partnerAnswer.correct
                          ? "#16A34A"
                          : "#DC2626"
                        : palette.primary,
                    }}
                  >
                    {revealState ? (partnerAnswer.correct ? "✓" : "✗") : "…"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 16, gap: 12, paddingBottom: 8 }}
          >
            <View
              className="items-center gap-3 rounded-3xl bg-surface px-6 py-6 border border-hairline"
            >
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-[#F59E0B1F]">
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={22}
                  color="#F59E0B"
                />
              </View>
              <Text className="text-center font-display-bold text-title-sm leading-[27px] text-ink">
                {question?.question ?? "Loading..."}
              </Text>
            </View>

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
                  <Text className="text-title-sm">{opt.emoji}</Text>
                  <Text
                    className={`flex-1 font-ui-semibold text-body-lg ${textColor}`}
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

            {myAnswer && !showReveal && (
              <View
                className="items-center gap-3 rounded-3xl bg-surface px-6 py-6 border border-hairline"
              >
                <View className="h-14 w-14 items-center justify-center rounded-full bg-[#F59E0B1F]">
                  <MaterialCommunityIcons
                    name="timer-sand"
                    size={28}
                    color="#F59E0B"
                  />
                </View>
                <Text className="font-display-bold text-title-xs text-ink">
                  Answer locked in!
                </Text>
                <Text className="text-center font-ui-medium text-body-sm text-ink-secondary">
                  Waiting for {partnerName}...
                </Text>
              </View>
            )}

            {showReveal && (
              <View
                className="items-center gap-3 rounded-3xl bg-surface px-6 py-6 border border-hairline"
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
                <Text className="font-display-bold text-title-xs text-ink">
                  {myAnswer?.correct
                    ? state?.firstCorrectId === user?.id
                      ? "First to answer! +3 pts"
                      : "Correct! +1 pt"
                    : "Wrong answer!"}
                </Text>
              </View>
            )}
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
