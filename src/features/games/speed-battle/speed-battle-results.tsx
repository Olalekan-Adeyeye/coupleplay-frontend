import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Avatar } from "@/components/ui/avatar";
import { StatRow } from "@/components/games/StatRow";
import { ResultsScoreCard } from "@/components/games/ResultsScoreCard";
import { usePartnerName } from "@/hooks/usePartnerName";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useRoomStore } from "@/stores/roomStore";
import { useSocketStore } from "@/hooks/useSocket";
import { useGameAbandoned } from "@/hooks/useGameAbandoned";
import { CARD_SHADOW, BUTTON_SHADOW } from "@/lib/shadows";
import { useEffect, useState } from "react";

export default function SpeedBattleResultsScreen() {
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

  // Real per-player rounds won when the server reported them.
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
        { coupleId: couple.id, gameType: "SPEED_BATTLE", totalRounds: rounds },
        token,
      );
      setRoom(room);
      router.replace(`/games/SPEED_BATTLE/waiting?roomId=${room.id}` as any);
    } catch (e: any) {
      setRematchError(e.message ?? "Could not start a rematch.");
      setRematching(false);
    }
  };

  useGameAbandoned(socket, roomId, partnerName);

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
          {/* Trophy */}
          <View className="mt-6 items-center gap-3">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-amber-100">
              <MaterialCommunityIcons
                name={isDraw ? "handshake" : iWon ? "trophy" : "lightning-bolt"}
                size={46}
                color={isDraw ? "#946BFF" : iWon ? "#B45309" : "#F59E0B"}
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
                  ? "Fastest finger wins!"
                  : "So close! Try again?"}
            </Text>
          </View>

          {/* Score card */}
          <ResultsScoreCard
            myName={user?.name ?? "You"}
            myAvatar={user?.avatar}
            myScore={myScore}
            partnerName={partnerName}
            partnerScore={partnerScore}
          />

          {/* Stats — real values only */}
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
