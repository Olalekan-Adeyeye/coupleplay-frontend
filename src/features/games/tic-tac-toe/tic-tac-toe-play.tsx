import { Avatar } from "@/components/ui/avatar";
import { usePartnerName } from "@/hooks/usePartnerName";
import { useSocketStore } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
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

const REACTIONS = ["❤️", "😂", "😭", "😈", "🔥"];

const CARD_SHADOW = {
  shadowColor: "#4A3B6B",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
} as const;

export default function TicTacToePlayScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const user = useAuthStore((s) => s.user);
  const socket = useSocketStore((s) => s.socket);
  const partnerName = usePartnerName();

  const [state, setState] = useState<TicTacToeState | null>(null);
  const [interstitial, setInterstitial] = useState<string | null>(null);
  const [incomingReaction, setIncomingReaction] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;
    const onState = (s: TicTacToeState) => {
      if (s.roomId !== roomId) return;
      setState(s);
    };
    const onRoundEnd = (d: any) => {
      if (d.roomId !== roomId) return;
      const won = d.winnerId === user?.id;
      setInterstitial(
        d.winnerId == null
          ? "Round draw!"
          : won
            ? "You won the round! 🎉"
            : `${partnerName} won the round`,
      );
      setTimeout(() => setInterstitial(null), 1800);
    };
    const onFinished = (d: any) => {
      if (d.roomId !== roomId) return;
      const results = d.results;
      router.replace(
        `/games/TIC_TAC_TOE/results?winnerId=${results.winnerId ?? ""}&scores=${JSON.stringify(results.scores)}&totalRounds=${results.totalRounds}&roomId=${roomId}` as any,
      );
    };
    const onReaction = (d: any) => {
      if (d.userId !== user?.id) {
        setIncomingReaction(d.reaction);
        setTimeout(() => setIncomingReaction(null), 1800);
      }
    };
    socket.on("game:state", onState);
    socket.on("game:round_end", onRoundEnd);
    socket.on("game:finished", onFinished);
    socket.on("player:reaction", onReaction);
    // Ask the server for current state in case we missed the initial broadcast.
    socket.emit("game:sync", { roomId });
    return () => {
      socket.off("game:state", onState);
      socket.off("game:round_end", onRoundEnd);
      socket.off("game:finished", onFinished);
      socket.off("player:reaction", onReaction);
    };
  }, [socket, roomId, user?.id, partnerName]);

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

  const handleReaction = (r: string) => {
    socket?.emit("player:reaction", { roomId, reaction: r });
  };

  // Partner left the room — it's destroyed. Exit to games.
  useEffect(() => {
    if (!socket) return;
    const onAbandoned = (d: any) => {
      if (d.roomId !== roomId) return;
      Alert.alert(
        `${partnerName} left the game`,
        "The room was closed. Back to games?",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)/games"),
          },
        ],
      );
    };
    socket.on("game:abandoned", onAbandoned);
    return () => {
      socket.off("game:abandoned", onAbandoned);
    };
  }, [socket, roomId, partnerName]);

  const handleLeave = () => {
    Alert.alert(
      "Leave game?",
      "The game room will be closed for both of you.",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: () => {
            socket?.emit("room:leave", { roomId });
            router.replace("/(tabs)/games");
          },
        },
      ],
    );
  };

  const myMark = state ? (state.marks[user?.id ?? ""] ?? "X") : "X";
  const myTurn = state?.turnUserId === user?.id;
  const myScore = state ? (state.scores[user?.id ?? ""] ?? 0) : 0;
  const partnerScore = state
    ? (Object.entries(state.scores).find(([id]) => id !== user?.id)?.[1] ?? 0)
    : 0;

  return (
    <View className="flex-1 bg-lavender">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
          {/* Top bar */}
          <View className="flex-row items-center justify-between">
            <View className="h-11 w-11" />
            <View
              className="flex-row items-center gap-2 rounded-full bg-white px-4 py-2"
              style={CARD_SHADOW}
            >
              <MaterialCommunityIcons name="grid" size={16} color="#8A4BE0" />
              <Text className="font-ui-bold text-[13px] text-ink">
                Round {state?.roundNumber ?? 1} of {state?.totalRounds ?? 3}
              </Text>
            </View>
            <View className="h-11 w-11" />
          </View>

          {/* Players + score */}
          <View className="mt-4 flex-row items-center justify-center gap-3">
            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-white px-4 py-3"
              style={CARD_SHADOW}
            >
              <Avatar name={user?.name} size={40} />
              <View className="flex-1">
                <Text
                  className="font-display-bold text-[13px] text-ink"
                  numberOfLines={1}
                >
                  You
                </Text>
                <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                  {myMark === "X" ? "X marks" : "O marks"}
                </Text>
              </View>
              <Text className="font-display-bold text-[20px] text-primary">
                {myScore}
              </Text>
            </View>

            <Text className="font-display-bold text-[13px] text-ink-tertiary">
              VS
            </Text>

            <View
              className="flex-1 flex-row items-center gap-2.5 rounded-2xl bg-white px-4 py-3"
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
                  {myMark === "X" ? "O marks" : "X marks"}
                </Text>
              </View>
              <Text className="font-display-bold text-[20px] text-accent">
                {partnerScore}
              </Text>
            </View>
          </View>

          {/* Turn banner */}
          <View className="mt-4 items-center">
            {state && (
              <TurnBanner
                myTurn={!!myTurn}
                partnerName={partnerName}
                status={state.status}
              />
            )}
          </View>

          {/* Board */}
          <View className="mt-5 items-center">
            <View
              className="rounded-[28px] bg-primary p-1.5"
              style={CARD_SHADOW}
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
                        className="m-[3px] h-[96px] w-[96px] items-center justify-center rounded-[22px] active:opacity-85"
                        style={{
                          backgroundColor: isLast ? "#EFEAFF" : "#FFFFFF",
                        }}
                      >
                        {mark && (
                          <Text
                            className="font-display-bold text-[52px]"
                            style={{
                              color: mark === "X" ? "#8A4BE0" : "#FF69B4",
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

          {/* Interstitial */}
          {interstitial && (
            <View className="absolute inset-0 z-10 items-center justify-center bg-lavender/90">
              <View
                className="items-center gap-3 rounded-3xl bg-white px-10 py-8"
                style={CARD_SHADOW}
              >
                <Text className="text-[40px]">
                  {interstitial.includes("draw")
                    ? "🤝"
                    : interstitial.includes("You")
                      ? "🏆"
                      : "💪"}
                </Text>
                <Text className="font-display-bold text-[20px] text-ink">
                  {interstitial}
                </Text>
              </View>
            </View>
          )}

          {/* Reactions */}
          <View className="mt-auto flex-row items-center justify-center gap-4 pb-2">
            {incomingReaction && (
              <View className="absolute -top-12 rounded-full bg-accent-soft px-4 py-2">
                <Text className="text-[20px]">{incomingReaction}</Text>
              </View>
            )}
            {REACTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => handleReaction(r)}
                hitSlop={8}
                className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
              >
                <Text className="text-[22px]">{r}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={handleLeave}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Leave game"
            className="items-center py-1 active:opacity-70"
          >
            <Text className="font-ui-semibold text-[14px] text-red-500">
              Leave Game
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
          backgroundColor: myTurn ? "#8A4BE0" : "#FFFFFF",
          borderWidth: myTurn ? 0 : 1,
          borderColor: "#EDEAF7",
        }}
      >
        <Text
          className="font-ui-bold text-[14px]"
          style={{ color: myTurn ? "#FFFFFF" : "#7A748C" }}
        >
          {myTurn ? "Your turn!" : `Waiting for ${partnerName}...`}
        </Text>
      </View>
    </Animated.View>
  );
}
