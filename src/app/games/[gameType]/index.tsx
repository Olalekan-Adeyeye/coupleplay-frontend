import { GAME_IMAGES, getGame } from "@/data/games";
import { isGameImplemented } from "@/features/games/registry";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useRoomStore } from "@/stores/roomStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const hasPartner = couple?.userBId != null;

  const refreshActiveRoom = useCallback(async () => {
    const coupleId = couple?.id;
    if (!token || !coupleId) {
      setActiveRoom(null);
      return;
    }
    try {
      const room = await api.rooms.getActive(coupleId, token, gameType);
      if (!room) {
        setActiveRoom(null);
        return;
      }
      const full = await api.rooms.get(room.id, token);
      setActiveRoom(full);
    } catch {
      setActiveRoom(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, couple]);

  useFocusEffect(
    useCallback(() => {
      refreshActiveRoom().catch(() => {});
    }, [refreshActiveRoom]),
  );

  const heroImage = game?.heroImage ? GAME_IMAGES[game.heroImage] : undefined;
  const canJoin =
    activeRoom != null &&
    !activeRoom.players?.some((p: any) => p.userId === user?.id);

  const handleStart = async () => {
    if (!game || loading) return;
    if (!hasPartner) {
      router.push("/settings");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const active = await api.rooms.getActive(couple.id, token!, game.id);
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
      setError(e.message ?? "Could not start the game. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const implemented = game ? isGameImplemented(game.id) : true;

  useEffect(() => {
    if (game && !implemented) {
      router.replace(`/games/soon?gameType=${game.id}` as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [implemented]);

  if (!game || !implemented) return null;

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[10px]">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Back"
                className="h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface active:opacity-70"
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={24}
                  color="#F4F1FA"
                />
              </Pressable>
              <Pressable
                onPress={() => setBookmarked((b) => !b)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={
                  bookmarked ? "Remove bookmark" : "Bookmark game"
                }
                className="h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface active:opacity-70"
              >
                <MaterialCommunityIcons
                  name={bookmarked ? "bookmark" : "bookmark-outline"}
                  size={21}
                  color={bookmarked ? "#946BFF" : "#B3A8C9"}
                />
              </Pressable>
            </View>

            <View className="mt-5 items-center">
              <View
                className="h-[168px] w-[168px] items-center justify-center overflow-hidden rounded-2xl"
                // style={{ backgroundColor: game.accent }}
              >
                {heroImage ? (
                  <Image
                    source={heroImage}
                    style={{ width: 128, height: 128 }}
                    contentFit="contain"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={(game.iconName ?? "gamepad-variant") as any}
                    size={72}
                    color={game.tagColor}
                  />
                )}
              </View>
              <View
                className="mt-4 rounded-full px-3 py-1"
                style={{ backgroundColor: game.tagColor + "1F" }}
              >
                <Text
                  className="font-ui-bold text-[11px] tracking-[1px]"
                  style={{ color: game.tagColor }}
                >
                  {game.popular
                    ? `POPULAR · ${game.tag.toUpperCase()}`
                    : game.tag.toUpperCase()}
                </Text>
              </View>
              <Text className="mt-2.5 text-center font-display-bold text-[30px] leading-[36px] text-ink">
                {game.name}
              </Text>
              <Text className="mt-2 max-w-[330px] text-center font-ui-medium text-[14.5px] leading-[21px] text-ink-secondary">
                {game.desc}
              </Text>
            </View>

            <View className="mt-5 flex-row justify-center gap-2">
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
                  className="flex-row items-center gap-1.5 rounded-full border border-hairline bg-surface px-3.5 py-2.5"
                >
                  <MaterialCommunityIcons
                    name={m.icon}
                    size={15}
                    color="#946BFF"
                  />
                  <Text className="font-ui-semibold text-[12.5px] text-ink">
                    {m.label}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-7 gap-2.5">
              <Text className="font-display-bold text-[19px] text-ink">
                How to play
              </Text>
              {game.steps.map((step, i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-3.5 rounded-2xl border border-hairline bg-surface px-4 py-3.5"
                >
                  <Text className="font-display-bold text-[13px] text-ink-tertiary">
                    0{i + 1}
                  </Text>
                  <View
                    className="h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: step.iconColor + "1F" }}
                  >
                    <MaterialCommunityIcons
                      name={step.icon as any}
                      size={21}
                      color={step.iconColor}
                    />
                  </View>
                  <Text className="flex-1 font-ui-medium text-[13.5px] leading-[19px] text-ink">
                    {step.title}
                  </Text>
                </View>
              ))}
            </View>
            <View className="h-6" />
          </View>
        </ScrollView>

        <View className="border-t border-hairline bg-paper px-[22px] pb-6 pt-4">
          <View className="mx-auto w-full max-w-[460px] gap-2.5">
            {canJoin && (
              <View className="flex-row items-center gap-2 rounded-xl bg-primary-soft px-4 py-3">
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color="#946BFF"
                />
                <Text className="flex-1 font-ui-semibold text-[13px]">
                  Your partner already opened a table — hop in!
                </Text>
              </View>
            )}
            {!hasPartner && (
              <Text className="text-center font-ui-medium text-[13px] text-ink-secondary">
                Link your partner first — every game needs two players.
              </Text>
            )}
            {error && (
              <Text className="text-center font-ui-medium text-[13px] text-error-bright">
                {error}
              </Text>
            )}
            <Pressable
              onPress={handleStart}
              disabled={loading}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 active:opacity-85"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <MaterialCommunityIcons
                name={canJoin ? "login" : hasPartner ? "play" : "account-plus"}
                size={20}
                color="#FFFFFF"
              />
              <Text className="font-ui-bold text-[15.5px] text-white">
                {loading
                  ? canJoin
                    ? "Joining…"
                    : "Creating table…"
                  : canJoin
                    ? "Join Game"
                    : hasPartner
                      ? "Start Game"
                      : "Invite Partner"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
