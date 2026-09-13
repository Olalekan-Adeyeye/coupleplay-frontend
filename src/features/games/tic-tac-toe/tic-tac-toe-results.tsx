import { Avatar } from "@/components/ui/avatar";
import { usePartnerName } from "@/hooks/usePartnerName";
import { useSocketStore } from "@/hooks/useSocket";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useRoomStore } from "@/stores/roomStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_SHADOW = {
  shadowColor: "#4A3B6B",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
} as const;

const BUTTON_SHADOW = {
  shadowColor: "#946BFF",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
} as const;

export default function TicTacToeResultsScreen() {
  const { winnerId, scores, totalRounds, roundsWon, roomId } = useLocalSearchParams<{
    winnerId?: string;
    scores?: string;
    totalRounds?: string;
    roundsWon?: string;
    roomId?: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const couple = useCoupleStore((s) => s.couple);
  const setRoom = useRoomStore((s) => s.setRoom);
  const socket = useSocketStore((s) => s.socket);
  const partnerName = usePartnerName();
  const [rematching, setRematching] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);

  const parsed: Record<string, number> = scores ? JSON.parse(scores) : {};
  const myScore = parsed[user?.id ?? ""] ?? 0;
  const partnerScore = Object.entries(parsed).find(([id]) => id !== user?.id)?.[1] ?? 0;
  const rounds = Number(totalRounds ?? 3);

  let won: Record<string, number> | null = null;
  try {
    won = roundsWon ? JSON.parse(roundsWon) : null;
  } catch {
    won = null;
  }
  const myRoundsWon = won ? (won[user?.id ?? ""] ?? 0) : null;
  const partnerRoundsWon = won
    ? (Object.entries(won).find(([id]) => id !== user?.id)?.[1] ?? 0)
    : null;

  const iWon = winnerId === user?.id;
  const isDraw = !winnerId;

  const handleLeave = () => {
    if (roomId) socket?.emit("room:leave", { roomId });
    router.replace("/(tabs)/games");
  };

  const handleRematch = async () => {
    if (!token || !couple?.id || rematching) return;
    setRematchError(null);
    setRematching(true);
    try {
      const room = await api.rooms.create(
        { coupleId: couple.id, gameType: "TIC_TAC_TOE", totalRounds: rounds },
        token,
      );
      setRoom(room);
      router.replace(`/games/TIC_TAC_TOE/waiting?roomId=${room.id}` as any);
    } catch (e: any) {
      setRematchError(e.message ?? "Could not start a rematch.");
      setRematching(false);
    }
  };

  // Partner left the room — it's destroyed. Exit to games.
  useEffect(() => {
    if (!socket) return;
    const onAbandoned = (d: any) => {
      if (d.roomId !== roomId) return;
      Alert.alert(
        `${partnerName} left`,
        "The game room was closed. Back to games?",
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

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
          {/* Top bar */}
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={handleLeave}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Back to games"
              className="h-11 w-11 items-center justify-center rounded-full bg-surface active:opacity-80"
              style={CARD_SHADOW}
            >
              <MaterialCommunityIcons
                name="chevron-left"
                size={26}
                color="#F4F1FA"
              />
            </Pressable>
            <View className="h-11 w-11" />
          </View>

          {/* Trophy */}
          <View className="mt-6 items-center gap-3">
            <View className="relative h-24 w-24 items-center justify-center rounded-full bg-primary-soft">
              <MaterialCommunityIcons
                name={isDraw ? "handshake" : "trophy"}
                size={46}
                color={isDraw ? "#946BFF" : "#B45309"}
              />
              <MaterialCommunityIcons
                name="star-four-points"
                size={18}
                color="#B8A8F5"
                style={{ position: "absolute", top: -6, right: -4 }}
              />
            </View>
            <Text className="font-display-bold text-[28px] text-ink">
              {isDraw ? "It's a draw!" : iWon ? "You won!" : `${partnerName} won!`}
            </Text>
            <Text className="font-ui-medium text-[14px] text-ink-secondary">
              {isDraw
                ? "A worthy tie."
                : iWon
                  ? "Victory tastes sweet."
                  : "So close! Try again next time."}
            </Text>
          </View>

          {/* Score card */}
          <View className="mt-6 flex-row items-center justify-center gap-3">
            <View className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 py-6" style={CARD_SHADOW}>
              <Avatar avatar={user?.avatar} name={user?.name} size={56} />
              <Text className="font-display-bold text-[14px] text-ink" numberOfLines={1}>
                You
              </Text>
              <Text className="font-display-bold text-[32px] text-primary">{myScore}</Text>
            </View>

            <Text className="font-display-bold text-[16px] text-ink-tertiary">VS</Text>

            <View className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 py-6" style={CARD_SHADOW}>
              <Avatar name={partnerName} size={56} />
              <Text className="font-display-bold text-[14px] text-ink" numberOfLines={1}>
                {partnerName}
              </Text>
              <Text className="font-display-bold text-[32px] text-accent">{partnerScore}</Text>
            </View>
          </View>

          {/* Round info */}
          <View className="mt-4 flex-row items-center justify-center gap-2.5">
            <MaterialCommunityIcons name="flag-checkered" size={16} color="#946BFF" />
            <Text className="font-ui-semibold text-[13px] text-ink-secondary">
              Best of {rounds} rounds
            </Text>
          </View>

          {/* Stats */}
          {(myRoundsWon != null || partnerRoundsWon != null) && (
            <View className="mt-4 gap-0 rounded-3xl bg-surface px-5 py-4" style={CARD_SHADOW}>
              <View className="flex-row items-center py-2.5">
                <Text className="w-14 font-display-bold text-[17px] text-primary">
                  {myScore}
                </Text>
                <Text className="flex-1 text-center font-ui-medium text-[14px] text-ink">
                  Points
                </Text>
                <Text className="w-14 text-right font-display-bold text-[17px] text-accent">
                  {partnerScore}
                </Text>
              </View>
              {myRoundsWon != null && partnerRoundsWon != null && (
                <>
                  <View className="my-2 h-px bg-surface-border" />
                  <View className="flex-row items-center py-2.5">
                    <Text className="w-14 font-display-bold text-[17px] text-primary">
                      {myRoundsWon}
                    </Text>
                    <Text className="flex-1 text-center font-ui-medium text-[14px] text-ink">
                      Rounds won
                    </Text>
                    <Text className="w-14 text-right font-display-bold text-[17px] text-accent">
                      {partnerRoundsWon}
                    </Text>
                  </View>
                </>
              )}
              <View className="my-2 h-px bg-surface-border" />
              <View className="flex-row items-center py-2.5">
                <Text className="w-14 font-display-bold text-[17px] text-primary">
                  {rounds}
                </Text>
                <Text className="flex-1 text-center font-ui-medium text-[14px] text-ink">
                  Total rounds
                </Text>
                <Text className="w-14 text-right font-display-bold text-[17px] text-accent">
                  {rounds}
                </Text>
              </View>
            </View>
          )}

          {/* Actions */}
          <View className="mt-auto gap-2.5 pb-4">
            <Pressable
              onPress={handleRematch}
              disabled={rematching}
              className="flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 active:opacity-85"
              style={[BUTTON_SHADOW, { opacity: rematching ? 0.6 : 1 }]}
            >
              <MaterialCommunityIcons name="restart" size={20} color="#FFFFFF" />
              <Text className="font-ui-bold text-[15px] text-white">
                {rematching ? "Setting up…" : "Rematch"}
              </Text>
            </Pressable>
            {rematchError && (
              <Text className="text-center font-ui-medium text-[13px] text-error-bright">
                {rematchError}
              </Text>
            )}
            <Pressable
              onPress={handleLeave}
              className="flex-row items-center justify-center gap-2 rounded-full border border-hairline bg-surface py-4 active:opacity-85"
            >
              <MaterialCommunityIcons
                name="gamepad-variant"
                size={20}
                color="#B3A8C9"
              />
              <Text className="font-ui-bold text-[15px] text-ink-secondary">
                Back to Games
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
