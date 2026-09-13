import { GAME_IMAGES, getGame } from "@/data/games";
import { useInviteAction } from "@/hooks/useInviteAction";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const KEY = "coupleplay:notify-games";

async function readNotified(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * Placeholder for games without play screens yet. Never loads the wrong
 * game — art, rules preview, notify-me bell and invite CTA instead.
 */
export default function SoonScreen() {
  const { gameType } = useLocalSearchParams<{ gameType: string }>();
  const game = getGame(gameType);
  const invite = useInviteAction();
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    readNotified().then((ids) => {
      if (gameType && ids.includes(gameType)) setNotified(true);
    });
  }, [gameType]);

  const toggleNotify = async () => {
    if (!gameType) return;
    const ids = await readNotified();
    const next = notified
      ? ids.filter((id) => id !== gameType)
      : [...ids, gameType];
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    setNotified(!notified);
  };

  if (!game) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8">
        <Text className="font-display-bold text-[20px] text-ink">
          Unknown game
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/games")}
          className="mt-4 rounded-xl bg-primary px-6 py-3.5 active:opacity-85"
        >
          <Text className="font-ui-bold text-[14px] text-white">
            Back to Games
          </Text>
        </Pressable>
      </View>
    );
  }

  const art = game.heroImage ? GAME_IMAGES[game.heroImage] : undefined;

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="w-full max-w-[460px] flex-1 self-center px-[22px] pt-[10px] pb-6">
          <View className="flex-row items-center">
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
          </View>

          <View className="flex-1 items-center justify-center">
            <View
              className="h-[160px] w-[160px] items-center justify-center overflow-hidden rounded-2xl"
              style={{ backgroundColor: game.accent }}
            >
              {art ? (
                <Image
                  source={art}
                  style={{ width: 120, height: 120 }}
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
              className="mt-5 rounded-full px-3 py-1"
              style={{ backgroundColor: game.tagColor + "18" }}
            >
              <Text
                className="font-ui-bold text-[11px] tracking-[1px]"
                style={{ color: game.tagColor }}
              >
                {game.tag.toUpperCase()} · COMING SOON
              </Text>
            </View>
            <Text className="mt-3 font-display-bold text-[28px] text-ink">
              {game.name}
            </Text>
            <Text className="mt-2 max-w-[320px] text-center font-ui-medium text-[14.5px] leading-[21px] text-ink-secondary">
              {game.desc}
            </Text>
            <Text className="mt-2 font-ui-medium text-[12.5px] text-ink-tertiary">
              {game.players} · {game.duration} · {game.rounds} rounds
            </Text>
          </View>

          <View className="gap-2.5">
            <Pressable
              onPress={toggleNotify}
              accessibilityRole="switch"
              accessibilityState={{ checked: notified }}
              className="flex-row items-center justify-center gap-2 rounded-2xl py-4 active:opacity-85"
              style={{ backgroundColor: notified ? "#EFEAFF" : "#946BFF" }}
            >
              <MaterialCommunityIcons
                name={notified ? "bell-check" : "bell-outline"}
                size={19}
                color={notified ? "#946BFF" : "#FFFFFF"}
              />
              <Text
                className="font-ui-bold text-[15px]"
                style={{ color: notified ? "#946BFF" : "#FFFFFF" }}
              >
                {notified ? "We'll ping you at launch" : "Notify me at launch"}
              </Text>
            </Pressable>
            <Pressable
              onPress={invite.share}
              disabled={invite.busy}
              className="flex-row items-center justify-center gap-2 rounded-2xl border-[1.5px] border-primary py-4 active:opacity-85"
              style={{ opacity: invite.busy ? 0.7 : 1 }}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={18}
                color="#946BFF"
              />
              <Text className="font-ui-bold text-[15px] text-primary">
                Invite player 2 meanwhile
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
