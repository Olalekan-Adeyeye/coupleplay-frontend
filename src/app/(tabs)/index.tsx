import { CoupleAvatars } from "@/components/ui/couple-avatars";
import { HeaderButton } from "@/components/ui/header-button";
import { GAMES, GAME_IMAGES } from "@/data/games";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_SHADOW = {
  shadowColor: "#4A3B6B",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
} as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up?";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const couple = useCoupleStore((s) => s.couple);
  const fetchCouple = useCoupleStore((s) => s.fetchCouple);

  useEffect(() => {
    if (token) fetchCouple(token).catch(() => {});
  }, [token, fetchCouple]);

  const hasPartner = couple?.userBId != null;
  const isUserA = couple?.userAId === user?.id;
  const partnerGender = hasPartner
    ? isUserA
      ? couple?.userB?.gender
      : couple?.userA?.gender
    : null;
  const myName = user?.name?.split(" ")[0] ?? "You";
  const partnerName = hasPartner
    ? isUserA
      ? (couple?.userB?.name?.split(" ")[0] ?? "Partner")
      : (couple?.userA?.name?.split(" ")[0] ?? "Partner")
    : "";

  const daysTogether = couple?.createdAt
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(couple.createdAt).getTime()) / 86400000,
        ),
      )
    : 0;

  const handleGamePress = (gameId: string) => {
    if (!hasPartner) {
      router.push("/settings");
      return;
    }
    router.push(`/games/${gameId}`);
  };

  return (
    <View className="flex-1 bg-lavender">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full max-w-[460px] self-center gap-6 px-[22px] pt-[18px] pb-[116px]">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-ui-semibold text-[14px] text-ink-secondary">
                  {greeting()}
                </Text>
                <Text className="mt-0.5 font-display-bold text-[34px] leading-[40px] text-ink">
                  {user?.name?.split(" ")[0] ?? "Player"}
                </Text>
              </View>
              <HeaderButton
                icon="cog-outline"
                onPress={() => router.push("/settings")}
                accessibilityLabel="Settings"
              />
            </View>

            {/* Couple marquee */}
            <View
              className="relative items-center overflow-hidden rounded-3xl px-6 pt-6 pb-5"
              style={{
                backgroundColor: "#8A4BE0",
                shadowColor: "#8A4BE0",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 8,
              }}
            >
              <View className="absolute -right-10 -top-10 h-[160px] w-[160px] rounded-full bg-white/[0.12]" />
              <View className="absolute -bottom-12 -left-8 h-[140px] w-[140px] rounded-full bg-accent/20" />

              <CoupleAvatars
                hasPartner={hasPartner}
                userGender={user?.gender}
                partnerGender={partnerGender}
              />

              <Text className="mt-3 font-display-bold text-[17px] text-white">
                {hasPartner
                  ? `${myName} & ${partnerName}`
                  : "Waiting for your player 2"}
              </Text>
              <Text className="mt-1 font-ui-medium text-[13px] text-white/75">
                {hasPartner
                  ? `${daysTogether} ${daysTogether === 1 ? "day" : "days"} together`
                  : "Connect in settings to start your story"}
              </Text>

              {hasPartner && (
                <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5">
                  <MaterialCommunityIcons
                    name="fire"
                    size={14}
                    color="#FFD166"
                  />
                  <Text className="font-ui-semibold text-[12px] text-white">
                    Day streak · 1
                  </Text>
                </View>
              )}
            </View>

            {/* Games */}
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="font-display-bold text-[16px] text-ink">
                  Pick a game
                </Text>
                {hasPartner && (
                  <Pressable
                    onPress={() => router.push("/(tabs)/games")}
                    className="flex-row items-center gap-1 active:opacity-70"
                  >
                    <Text className="font-ui-semibold text-[14px] text-primary">
                      See all
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color="#8A4BE0"
                    />
                  </Pressable>
                )}
              </View>

              <View className="flex-row flex-wrap justify-between">
                {GAMES.map((g) => {
                  const hero = g.heroImage
                    ? GAME_IMAGES[g.heroImage]
                    : undefined;
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => handleGamePress(g.id)}
                      className="mb-3 w-[48.5%] items-center gap-2.5 rounded-3xl bg-white px-3 pt-4 pb-5 active:opacity-85"
                      style={({ pressed }) => [
                        CARD_SHADOW,
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                    >
                      <View
                        className="h-[76px] w-[76px] items-center justify-center rounded-2xl"
                        // style={{ backgroundColor: g.accent }}
                      >
                        {hero ? (
                          <Image
                            source={hero}
                            style={{ width: 52, height: 52 }}
                            contentFit="contain"
                          />
                        ) : g.iconName ? (
                          <MaterialCommunityIcons
                            name={g.iconName as any}
                            size={36}
                            color={g.tagColor}
                          />
                        ) : (
                          <Text className="text-[36px]">{g.emoji}</Text>
                        )}
                      </View>
                      <Text className="text-center font-display-bold text-[15px] text-ink">
                        {g.name}
                      </Text>
                      <View
                        className="rounded-full px-2.5 py-0.5"
                        style={{ backgroundColor: g.tagColor + "18" }}
                      >
                        <Text
                          className="font-ui-bold text-[10px]"
                          style={{ color: g.tagColor }}
                        >
                          {g.tag}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
