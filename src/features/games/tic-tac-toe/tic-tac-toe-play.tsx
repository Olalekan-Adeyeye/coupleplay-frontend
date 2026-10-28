import { Avatar } from "@/components/ui/avatar";
import { ReactionBar } from "@/components/games/ReactionBar";
import { LeaveGameButton } from "@/components/games/LeaveGameButton";
import { InterstitialOverlay } from "@/components/games/InterstitialOverlay";
import { useGameRoom } from "@/hooks/useGameRoom";
import { useGameReactions } from "@/hooks/useGameReactions";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ConfirmModal, InfoModal } from "@/components/ui/ConfirmModal";
import { usePalette } from "@/hooks/usePalette";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Mark = "X" | "O";

interface TicTacToeState {
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
  board: (Mark | null)[][];
  marks: Record<string, Mark>;
  lastMove: { row: number; col: number } | null;
}

export default function TicTacToePlayScreen() {
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
  } = useGameRoom<TicTacToeState>("TIC_TAC_TOE", {
    roundEndMessage: ({ won, draw, partnerName: name }) =>
      draw ? "Round draw!" : won ? "You won the round!" : `${name} won the round`,
  });
  const { incomingReaction, rejectMsg, sendReaction } = useGameReactions(socket, roomId, user?.id);

  const place = (row: number, col: number) => {
    if (!state || state.status !== "active") return;
    if (state.turnUserId !== user?.id) return;
    if (state.board[row][col] !== null) return;
    socket?.emit("game:action", {
      roomId,
      action: "place",
      payload: { row, col },
    });
  };

  const myMark = state ? (state.marks[user?.id ?? ""] ?? "X") : "X";
  const myTurn = state?.turnUserId === user?.id;
  const myScore = state ? (state.scores[user?.id ?? ""] ?? 0) : 0;
  const partnerScore = state
    ? (Object.entries(state.scores).find(([id]) => id !== user?.id)?.[1] ?? 0)
    : 0;

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11" />
            <View
              className="flex-row items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2"
            >
              <MaterialCommunityIcons name="grid" size={16} color={palette.primary} />
              <Text className="font-ui-bold text-body-sm text-ink">
                Round {state?.roundNumber ?? 1} of {state?.totalRounds ?? 3}
              </Text>
            </View>
            <View className="h-11 w-11" />
          </View>

          <View className="mt-4 flex-row items-center justify-center gap-3">
            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface px-4 py-3"
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
                  {myMark === "X" ? "X marks" : "O marks"}
                </Text>
              </View>
              <Text className="font-display-bold text-title-sm text-primary">
                {myScore}
              </Text>
            </View>

            <Text className="font-display-bold text-body-sm text-ink-tertiary">
              VS
            </Text>

            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl border border-hairline bg-surface px-4 py-3"
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
                  {myMark === "X" ? "O marks" : "X marks"}
                </Text>
              </View>
              <Text className="font-display-bold text-title-sm text-accent">
                {partnerScore}
              </Text>
            </View>
          </View>

          <View className="mt-4 items-center">
            {state && (
              <TurnBanner
                myTurn={!!myTurn}
                partnerName={partnerName}
                status={state.status}
              />
            )}
          </View>

          <View className="mt-5 items-center">
            <View
              className="rounded-[28px] border border-hairline bg-surface-soft p-1.5"
            >
              {[0, 1, 2].map((row) => (
                <View key={row} className="flex-row">
                  {[0, 1, 2].map((col) => {
                    const mark = state?.board[row][col] ?? null;
                    const isLast =
                      state?.lastMove?.row === row &&
                      state?.lastMove?.col === col;
                    return (
                      <Pressable
                        key={col}
                        onPress={() => place(row, col)}
                        disabled={
                          !myTurn || mark !== null || state?.status !== "active"
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Cell row ${row + 1}, column ${col + 1}${mark ? `, taken by ${mark}` : ", empty"}`}
                        accessibilityState={{
                          disabled:
                            !myTurn || mark !== null || state?.status !== "active",
                        }}
                        className="m-[3px] h-[96px] w-[96px] items-center justify-center rounded-[22px] active:opacity-85"
                        style={{
                          backgroundColor: isLast
                            ? `${palette.primary}26`
                            : palette.surface,
                        }}
                      >
                        {mark && (
                          <Text
                            className="font-display-bold text-[52px]"
                            style={{
                              color: mark === "X" ? palette.primary : palette.rose,
                            }}
                          >
                            {mark}
                          </Text>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {interstitial && (
            <InterstitialOverlay
              message={interstitial}
              peep={user?.avatar}
            />
          )}

          <View className="mt-auto flex-row items-center justify-center gap-4 pb-2">
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
      <ConfirmModal {...leaveConfirmProps} onCancel={cancelLeave} />
      <InfoModal {...abandoned} />
    </View>
  );
}

function TurnBanner({
  myTurn,
  partnerName,
  status,
}: {
  myTurn: boolean;
  partnerName: string;
  status: string;
}) {
  const palette = usePalette();
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (status !== "active") return null;

  return (
    <Animated.View style={[style]} className="rounded-full px-5 py-2.5">
      <View
        className="rounded-full px-5 py-2.5"
        style={{
          backgroundColor: myTurn ? palette.primary : palette.surface,
          borderWidth: myTurn ? 0 : 1,
          borderColor: palette.hairline,
        }}
      >
        <Text
          className="font-ui-bold text-body"
          style={{ color: myTurn ? "#FFFFFF" : palette.inkSecondary }}
        >
          {myTurn ? "Your turn!" : `Waiting for ${partnerName}...`}
        </Text>
      </View>
    </Animated.View>
  );
}
