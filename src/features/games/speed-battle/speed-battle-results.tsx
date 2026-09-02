import { View, Text, Pressable, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Avatar } from "@/components/ui/avatar";
import { usePartnerName } from "@/hooks/usePartnerName";
import { useAuthStore } from "@/stores/authStore";
import { useSocketStore } from "@/hooks/useSocket";
import { useEffect } from "react";

const CARD_SHADOW = {
  shadowColor: "#4A3B6B",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
} as const;

const BUTTON_SHADOW = {
  shadowColor: "#8A4BE0",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
} as const;

export default function SpeedBattleResultsScreen() {
  const { winnerId, scores, totalRounds, roomId } = useLocalSearchParams<{
    winnerId?: string;
    scores?: string;
    totalRounds?: string;
    roomId?: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const socket = useSocketStore((s) => s.socket);
  const partnerName = usePartnerName();

  const parsed: Record<string, number> = scores ? JSON.parse(scores) : {};
  const myScore = parsed[user?.id ?? ""] ?? 0;
  const partnerScore =
    Object.entries(parsed).find(([id]) => id !== user?.id)?.[1] ?? 0;
  const rounds = Number(totalRounds ?? 5);

  const iWon = winnerId === user?.id;
  const isDraw = !winnerId;

  const handleLeave = () => {
    if (roomId) socket?.emit("room:leave", { roomId });
    router.replace("/(tabs)/games");
  };

  // Partner left
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
    <View className="flex-1 bg-lavender">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[14px] pb-[24px]">
          {/* Trophy */}
          <View className="mt-6 items-center gap-3">
            <View className="relative h-24 w-24 items-center justify-center rounded-full bg-amber-100">
              <Text className="text-[52px]">
                {isDraw ? "🤝" : iWon ? "🏆" : "⚡"}
              </Text>
            </View>
            <Text className="font-display-bold text-[28px] text-ink">
              {isDraw
                ? "It's a draw!"
                : iWon
                  ? "You won! ⚡"
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
          <View className="mt-6 flex-row items-center justify-center gap-3">
            <View
              className="flex-1 items-center gap-2 rounded-3xl bg-white px-3 py-6"
              style={CARD_SHADOW}
            >
              <Avatar name={user?.name} size={56} />
              <Text
                className="font-display-bold text-[14px] text-ink"
                numberOfLines={1}
              >
                You
              </Text>
              <Text className="font-display-bold text-[32px] text-primary">
                {myScore}
              </Text>
            </View>

            <Text className="font-display-bold text-[16px] text-ink-tertiary">
              VS
            </Text>

            <View
              className="flex-1 items-center gap-2 rounded-3xl bg-white px-3 py-6"
              style={CARD_SHADOW}
            >
              <Avatar name={partnerName} size={56} />
              <Text
                className="font-display-bold text-[14px] text-ink"
                numberOfLines={1}
              >
                {partnerName}
              </Text>
              <Text className="font-display-bold text-[32px] text-accent">
                {partnerScore}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View
            className="mt-4 gap-0 rounded-3xl bg-white px-5 py-4"
            style={CARD_SHADOW}
          >
            <StatRow
              label="Rounds won"
              mine={String(iWon ? Math.ceil(rounds / 2) : Math.floor(rounds / 2))}
              theirs={String(iWon ? Math.floor(rounds / 2) : Math.ceil(rounds / 2))}
            />
            <View className="my-2 h-px bg-surface-border" />
            <StatRow
              label="Total rounds"
              mine={String(rounds)}
              theirs={String(rounds)}
            />
          </View>

          {/* Action */}
          <View className="mt-auto gap-4 pb-4">
            <Pressable
              onPress={handleLeave}
              className="flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 active:opacity-85"
              style={BUTTON_SHADOW}
            >
              <Text className="font-ui-bold text-[15px] text-white">
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
      <Text className="w-14 font-display-bold text-[17px] text-primary">
        {mine}
      </Text>
      <Text className="flex-1 text-center font-ui-medium text-[14px] text-ink">
        {label}
      </Text>
      <Text className="w-14 text-right font-display-bold text-[17px] text-accent">
        {theirs}
      </Text>
    </View>
  );
}
