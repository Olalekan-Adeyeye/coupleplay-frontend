import { GAME_IMAGES, getGame } from "@/data/games";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useRoomStore } from "@/stores/roomStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, ImageBackground } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GameDetailScreen() {
  const { gameType } = useLocalSearchParams<{ gameType: string }>();
  const game = getGame(gameType);
  const token = useAuthStore((s) => s.token);
  const couple = useCoupleStore((s) => s.couple);
  const setRoom = useRoomStore((s) => s.setRoom);
  const user = useAuthStore((s) => s.user);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const hasPartner = couple?.userBId != null;

  useEffect(() => {
    if (!token || !couple?.id) return;
    (async () => {
      try {
        const room = await api.rooms.getActive(couple.id, token);
        if (!room) {
          setActiveRoom(null);
          return;
        }
        const full = await api.rooms.get(room.id, token);
        setActiveRoom(full);
      } catch {
        setActiveRoom(null);
      }
    })();
  }, [token, couple?.id]);

  const heroImage = game?.heroImage ? GAME_IMAGES[game.heroImage] : undefined;
  const canJoin =
    activeRoom != null &&
    !activeRoom.players?.some((p: any) => p.userId === user?.id);

  const handleStart = async () => {
    if (!game) return;
    if (!hasPartner) {
      router.push("/settings");
      return;
    }
    setLoading(true);
    try {
      const active = await api.rooms.getActive(couple.id, token!);
      if (active) {
        await api.rooms.join(active.id, token!);
        setRoom(active);
        const activeType = active.gameType || game.id;
        router.push(`/games/${activeType}/waiting?roomId=${active.id}` as any);
        return;
      }

      const room = await api.rooms.create(
        { coupleId: couple.id, gameType: game.id, totalRounds: game.rounds },
        token!,
      );
      setRoom(room);
      router.push(`/games/${game.id}/waiting?roomId=${room.id}` as any);
    } catch (e: any) {
      alert(e.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!game) return null;

  return (
    <View className="flex-1 bg-primary/50">
      <StatusBar style="light" />
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full max-w-[460px] flex-1 self-center gap-6">
            {/* Top bar */}
            <ImageBackground
              source={require("@/assets/images/game_details_hero.png")}
            >
              <View className="py-8 px-[22px]">
                <View className="flex-row items-center justify-between">
                  <Pressable
                    onPress={() => router.back()}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    className="h-11 w-11 items-center justify-center rounded-full bg-white active:opacity-80"
                    style={{
                      shadowColor: "#4A3B6B",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="chevron-left"
                      size={26}
                      color="#201A33"
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => setBookmarked((b) => !b)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={
                      bookmarked ? "Remove bookmark" : "Bookmark game"
                    }
                    className="h-11 w-11 items-center justify-center rounded-full bg-white active:opacity-80"
                    style={{
                      shadowColor: "#4A3B6B",
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={bookmarked ? "bookmark" : "bookmark-outline"}
                      size={22}
                      color={bookmarked ? "#8A4BE0" : "#201A33"}
                    />
                  </Pressable>
                </View>

                {/* Hero */}
                <View className="items-center py-8 pb-20">
                  {heroImage ? (
                    <Image
                      source={heroImage}
                      style={{ width: 220, height: 220 }}
                      contentFit="contain"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={game.iconName as any}
                      size={220}
                      color={game.tagColor}
                    />
                  )}
                </View>
              </View>
            </ImageBackground>

            {/* Meta row */}
            <View className="flex-1 bg-lavender px-[22px] py-8 rounded-t-[32px] -mt-16">
              <View className="items-center">
                <View className="mt-5 items-center gap-2.5">
                  <Text className="font-display-bold text-[30px] leading-[36px] text-primary">
                    {game.name}
                  </Text>
                  {game.popular && (
                    <View className="rounded-full bg-accent-soft px-3 py-1">
                      <Text className="font-ui-bold text-[11px] text-accent">
                        {game.tag}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="mt-2 max-w-[330px] text-center font-ui-medium text-[14.5px] leading-[21px] text-ink">
                  {game.desc}
                </Text>
              </View>
              <View className="flex-row justify-center gap-2.5 mt-4">
                {[
                  { icon: "account-group" as const, label: game.players },
                  { icon: "clock-outline" as const, label: game.duration },
                  {
                    icon: "flag-outline" as const,
                    label: `${game.rounds} Rounds`,
                  },
                ].map((m) => (
                  <View
                    key={m.icon}
                    className="flex-row items-center gap-1.5 rounded-full bg-white px-3.5 py-3 border border-gray-200"
                  >
                    <MaterialCommunityIcons
                      name={m.icon}
                      size={15}
                      color="#8A4BE0"
                    />
                    <Text className="font-ui-semibold text-[12.5px] text-ink">
                      {m.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* How to play */}
              <View className="mt-4">
                <Text className="font-display-bold text-[19px] text-ink">
                  How to play
                </Text>
                <View className="flex-row gap-3">
                  {game.steps.map((step, i) => (
                    <View key={i} className="flex-1 items-center gap-3 p-4">
                      <View
                        className="h-16 w-16 items-center justify-center rounded-full"
                        style={{ backgroundColor: step.iconColor + "1A" }}
                      >
                        <MaterialCommunityIcons
                          name={step.icon as any}
                          size={30}
                          color={step.iconColor}
                        />
                      </View>
                      <Text className="text-center font-ui-semibold text-[12px] leading-[17px] text-ink">
                        {step.title}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View className="mt-4 gap-3">
                <Pressable
                  onPress={handleStart}
                  disabled={loading || !hasPartner}
                  className="flex-row items-center justify-center gap-2 rounded-full bg-primary py-4 active:opacity-70"
                  style={({ pressed }) => ({
                    opacity: pressed || loading || !hasPartner ? 0.7 : 1,
                    shadowColor: "#8A4BE0",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 14,
                    elevation: 6,
                  })}
                >
                  <MaterialCommunityIcons
                    name={canJoin ? "login" : "play"}
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text className="font-ui-bold text-[16.5px] text-white">
                    {loading
                      ? canJoin
                        ? "Joining..."
                        : "Creating room..."
                      : canJoin
                        ? "Join Game"
                        : "Start Game"}
                  </Text>
                </Pressable>
                {canJoin && (
                  <View className="flex-row items-center gap-2 rounded-2xl bg-primary-soft px-4 py-3">
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={18}
                      color="#8A4BE0"
                    />
                    <Text className="flex-1 font-ui-medium text-[13px] text-primary">
                      Your partner already created a game room — hop in!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
