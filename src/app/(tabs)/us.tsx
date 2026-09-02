import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useStatsStore } from "@/stores/statsStore";
import { CoupleAvatars } from "@/components/ui/couple-avatars";
import { HeaderButton } from "@/components/ui/header-button";
import { Achievement } from "@/types/stats";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <View
      className="w-[110px] items-center rounded-2xl py-4 px-2"
      style={{
        backgroundColor: achievement.unlocked ? "#FFFFFF" : "#F5F3FF",
        opacity: achievement.unlocked ? 1 : 0.6,
      }}
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: achievement.unlocked
            ? achievement.color + "20"
            : "#E5E7EB",
        }}
      >
        <MaterialCommunityIcons
          name={achievement.icon as any}
          size={28}
          color={achievement.unlocked ? achievement.color : "#9CA3AF"}
        />
      </View>
      <Text
        className="mt-2 font-ui-bold text-[13px] text-center"
        style={{ color: achievement.unlocked ? "#201A33" : "#6B7280" }}
      >
        {achievement.name}
      </Text>
      {!achievement.unlocked && achievement.progress > 0 && (
        <View className="mt-1.5 w-full">
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <View
              className="h-full rounded-full"
              style={{
                width: `${achievement.progress}%`,
                backgroundColor: achievement.color,
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}

export default function UsScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);
  const fetchCouple = useCoupleStore((s) => s.fetchCouple);
  const overview = useStatsStore((s) => s.overview);
  const achievements = useStatsStore((s) => s.achievements);
  const fetchOverview = useStatsStore((s) => s.fetchOverview);
  const fetchAchievements = useStatsStore((s) => s.fetchAchievements);

  useEffect(() => {
    if (token) {
      fetchCouple(token).catch(() => {});
      fetchOverview(token).catch(() => {});
      fetchAchievements(token).catch(() => {});
    }
  }, [token, fetchCouple, fetchOverview, fetchAchievements]);

  const hasPartner = couple?.userBId != null;
  const isUserA = couple?.userAId === user?.id;
  const partnerGender = hasPartner ? (isUserA ? couple?.userB?.gender : couple?.userA?.gender) : null;

  const daysTogether = couple?.createdAt
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(couple.createdAt).getTime()) / 86400000,
        ),
      )
    : 0;

  const togetherSince = couple?.createdAt
    ? new Date(couple.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const highlights = [
    {
      label: "Day streak",
      value: overview.streak,
      icon: "fire",
      color: "#F59E0B",
    },
    {
      label: "Games",
      value: overview.totalGames,
      icon: "gamepad-variant",
      color: "#8A4BE0",
    },
    {
      label: "Won",
      value: overview.wins,
      icon: "trophy-outline",
      color: "#22C55E",
    },
    {
      label: "XP",
      value: overview.xp,
      icon: "lightning-bolt",
      color: "#F59E0B",
    },
  ];

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  return (
    <View className="flex-1 bg-lavender">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full max-w-[460px] self-center gap-5 px-[22px] pt-[18px] pb-[116px]">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-display-bold text-[24px] leading-[40px] text-ink">
                  Us
                </Text>
                <Text className="font-ui-medium text-[14px] text-ink-secondary">
                  Your space
                </Text>
              </View>
              <HeaderButton
                icon="cog-outline"
                onPress={() => router.push("/settings")}
                accessibilityLabel="Settings"
              />
            </View>

            {/* Couple card */}
            <View>
              <View
                className="relative items-center overflow-hidden rounded-3xl px-6 py-8"
                style={{
                  backgroundColor: "#8A4BE0",
                  shadowColor: "#8A4BE0",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 18,
                  elevation: 8,
                }}
              >
                {/* Decorative blobs */}
                <View className="absolute -left-8 -top-8 h-[160px] w-[160px] rounded-full bg-white/[0.12]" />
                <View className="absolute -bottom-10 -right-6 h-[140px] w-[140px] rounded-full bg-accent/25" />
                <View className="absolute right-10 top-4 h-2 w-2 rounded-full bg-white/25" />
                <View className="absolute bottom-8 left-12 h-1.5 w-1.5 rounded-full bg-white/20" />

                {/* Avatars */}
                <CoupleAvatars
                  hasPartner={hasPartner}
                  userGender={user?.gender}
                  partnerGender={partnerGender}
                />

                {/* Text */}
                <View className="mt-4 items-center gap-1">
                  {hasPartner ? (
                    <View className="items-center gap-1">
                      <Text className="font-ui text-[17px] text-white">
                        Together since
                      </Text>
                      <Text className="font-display-semi text-[20px] text-white">
                        {togetherSince}
                      </Text>
                      <View className="mt-4 flex-row items-center gap-3 rounded-[15px] bg-primary-light px-5 py-2">
                        <View className="items-center">
                          <MaterialCommunityIcons
                            name="calendar"
                            size={25}
                            color="white"
                          />
                        </View>
                        <View>
                          <Text className="font-ui text-[15px] tracking-wide text-white">
                            Our story
                          </Text>
                          <Text className="font-ui-medium text-[13px] text-white/80">
                            {daysTogether} {daysTogether === 1 ? "day" : "days"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text className="font-display-bold text-[17px] text-white">
                        Waiting for your player 2
                      </Text>
                      <Text className="font-ui-medium text-[13px] text-white/75">
                        Connect below to start your story
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>

            {/* Highlights */}
            <View className="gap-3">
              <Text className="font-display-bold text-[16px] text-ink">
                Our highlights
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {highlights.map((h) => (
                  <View key={h.label}>
                    <View className="w-[105px] items-center gap-2 rounded-2xl bg-white py-4">
                      <MaterialCommunityIcons
                        name={h.icon as any}
                        size={40}
                        color={h.color}
                      />
                      <Text className="font-display-bold text-[20px] text-ink">
                        {h.value}
                      </Text>
                      <Text className="font-ui-medium text-[11px] text-ink">
                        {h.label}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <View className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Text className="font-display-bold text-[16px] text-ink">
                    Achievements
                  </Text>
                  <View className="rounded-full bg-primary/10 px-2 py-0.5">
                    <Text className="font-ui-bold text-[11px] text-primary">
                      {unlockedAchievements.length}/{achievements.length}
                    </Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10 }}
                >
                  {unlockedAchievements.map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <View className="gap-3">
                <Text className="font-display-bold text-[16px] text-ink">
                  {unlockedAchievements.length > 0
                    ? "Almost there"
                    : "Achievements"}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10 }}
                >
                  {lockedAchievements.map((a) => (
                    <AchievementCard key={a.id} achievement={a} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
