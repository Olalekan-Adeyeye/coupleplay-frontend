import { GAME_IMAGES, getGame } from "@/data/games";
import { isGameImplemented } from "@/features/games/registry";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Match recap from a timeline row. Params-driven — no extra fetch. */
export default function RecapScreen() {
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    xp: string;
    time: string;
    gameType: string;
    icon: string;
    color: string;
    bg: string;
  }>();

  const game = getGame(params.gameType);
  const art = game?.heroImage ? GAME_IMAGES[game.heroImage] : undefined;
  const implemented = game ? isGameImplemented(game.id) : false;

  const handleRematch = () => {
    if (!game) return;
    if (implemented) router.push(`/games/${game.id}` as any);
    else router.push(`/games/soon?gameType=${game.id}` as any);
  };

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

          <View className="mt-6 items-center">
            <View
              className="h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-2xl"
              style={{ backgroundColor: game?.accent ?? "#EFEAFF" }}
            >
              {art ? (
                <Image
                  source={art}
                  style={{ width: 88, height: 88 }}
                  contentFit="contain"
                />
              ) : (
                <MaterialCommunityIcons
                  name={(params.icon ?? "gamepad-variant") as any}
                  size={52}
                  color={params.color ?? "#946BFF"}
                />
              )}
            </View>
            <Text className="mt-4 text-center font-display-bold text-[24px] leading-[30px] text-ink">
              {params.title ?? "Match recap"}
            </Text>
            <Text className="mt-1 font-ui-medium text-[13px] text-ink-tertiary">
              {params.time ?? ""}
            </Text>
          </View>

          <View className="mt-6 gap-2.5">
            <View className="flex-row items-center justify-between rounded-2xl border border-hairline bg-surface px-4 py-3.5">
              <View className="flex-row items-center gap-2.5">
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={19}
                  color="#F59E0B"
                />
                <Text className="font-ui-semibold text-[14px] text-ink">
                  XP earned
                </Text>
              </View>
              <Text className="font-display-bold text-[16px] text-primary">
                {params.xp ?? "—"}
              </Text>
            </View>
            {game && (
              <View className="flex-row items-center justify-between rounded-2xl border border-hairline bg-surface px-4 py-3.5">
                <View className="flex-row items-center gap-2.5">
                  <MaterialCommunityIcons
                    name="gamepad-variant"
                    size={19}
                    color="#946BFF"
                  />
                  <Text className="font-ui-semibold text-[14px] text-ink">
                    Game
                  </Text>
                </View>
                <Text className="font-ui-semibold text-[14px] text-ink-secondary">
                  {game.name}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-1" />

          <View className="gap-2.5">
            <Pressable
              onPress={handleRematch}
              className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 active:opacity-85"
            >
              <MaterialCommunityIcons
                name="restart"
                size={19}
                color="#FFFFFF"
              />
              <Text className="font-ui-bold text-[15px] text-white">
                {implemented ? "Rematch" : "View game"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace("/(tabs)/activity")}
              className="items-center py-2 active:opacity-70"
            >
              <Text className="font-ui-semibold text-[14px] text-ink-secondary">
                Back to Activity
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
