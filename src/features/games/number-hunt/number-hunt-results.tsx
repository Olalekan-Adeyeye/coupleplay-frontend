import { View, Text, Pressable, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/avatar";
import { usePartnerName } from "@/hooks/usePartnerName";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useRoomStore } from "@/stores/roomStore";
import { useSocketStore } from "@/hooks/useSocket";
import { useEffect, useState } from "react";

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

export default function NumberHuntResultsScreen() {
  const { winnerId, scores, totalRounds, roundsWon, roomId } =
    useLocalSearchParams<{
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
  const partnerScore =
    Object.entries(parsed).find(([id]) => id !== user?.id)?.[1] ?? 0;
  const rounds = Number(totalRounds ?? 5);

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
    useRoomStore.getState().setRoom(null);
    router.replace("/(tabs)/games");
  };

  const handleRematch = async () => {
    if (!token || !couple?.id || rematching) return;
    setRematchError(null);
    setRematching(true);
    try {
      if (roomId) socket?.emit("room:leave", { roomId });
      useRoomStore.getState().setRoom(null);
      const room = await api.rooms.create(
        { coupleId: couple.id, gameType: "NUMBER_HUNT", totalRounds: rounds },
        token,
      );
      setRoom(room);
      router.replace(`/games/NUMBER_HUNT/waiting?roomId=${room.id}` as any);
    } catch (e: any) {
      setRematchError(e.message ?? "Could not start a rematch.");
      setRematching(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    const onAbandoned = (d: any) => {
      if (d.roomId !== roomId) return;
      Alert.alert(
        `${partnerName} left`,
        "The game room was closed. Back to games?",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/games") }],
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
          {/* Trophy */}
          <View className="mt-6 items-center gap-3">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-violet-100">
              <MaterialCommunityIcons
                name={isDraw ? "handshake" : iWon ? "trophy" : "hexagon"}
                size={46}
                color={isDraw ? "#946BFF" : iWon ? "#B45309" : "#8B5CF6"}
              />
            </View>
            <Text className="font-display-bold text-[28px] text-ink">
              {isDraw
                ? "It's a draw!"
                : iWon
                  ? "You won!"
                  : `${partnerName} won!`}
            </Text>
            <Text className="font-ui-medium text-[14px] text-ink-secondary">
              {isDraw
                ? "Neck and neck!"
                : iWon
                  ? "Sharp eyes win the game!"
                  : "So close! Try again?"}
            </Text>
          </View>

          {/* Score card */}
          <View className="mt-6 flex-row items-center justify-center gap-3">
            <View
              className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 py-6"
              style={CARD_SHADOW}
            >
              <Avatar avatar={user?.avatar} name={user?.name} size={56} />
              <Text
                className="font-display-bold text-[14px] text-ink"
                numberOfLines={1}
              >
                You
              </Text>
              <Text className="font-display-bold text-[32px] text-[#8B5CF6]">
                {myScore}
              </Text>
            </View>

            <Text className="font-display-bold text-[16px] text-ink-tertiary">
              VS
            </Text>

            <View
              className="flex-1 items-center gap-2 rounded-3xl bg-surface px-3 py-6"
              style={CARD_SHADOW}
            >
              <Avatar name={partnerName} size={56} />
              <Text
                className="font-display-bold text-[14px] text-ink"
                numberOfLines={1}
              >
                {partnerName}
              </Text>
              <Text className="font-display-bold text-[32px] text-[#F59E0B]">
                {partnerScore}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View
            className="mt-4 gap-0 rounded-3xl bg-surface px-5 py-4"
            style={CARD_SHADOW}
          >
            <StatRow
              label="Points"
              mine={String(myScore)}
              theirs={String(partnerScore)}
            />
            {myRoundsWon != null && partnerRoundsWon != null && (
              <>
                <View className="my-2 h-px bg-surface-border" />
                <StatRow
                  label="Rounds won"
                  mine={String(myRoundsWon)}
                  theirs={String(partnerRoundsWon)}
                />
              </>
            )}
            <View className="my-2 h-px bg-surface-border" />
            <StatRow
              label="Total rounds"
              mine={String(rounds)}
              theirs={String(rounds)}
            />
          </View>

          {/* Action */}
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

function StatRow({
  label,
  mine,
  theirs,
}: {
  label: string;
  mine: string;
  theirs: string;
}) {
  return (
    <View className="flex-row items-center py-2.5">
      <Text className="w-14 font-display-bold text-[17px] text-[#8B5CF6]">
        {mine}
      </Text>
      <Text className="flex-1 text-center font-ui-medium text-[14px] text-ink">
        {label}
      </Text>
      <Text className="w-14 text-right font-display-bold text-[17px] text-[#F59E0B]">
        {theirs}
      </Text>
    </View>
  );
}
