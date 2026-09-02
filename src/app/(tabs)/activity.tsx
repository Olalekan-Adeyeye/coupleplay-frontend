import { useAuthStore } from "@/stores/authStore";
import { useStatsStore } from "@/stores/statsStore";
import { HeaderButton } from "@/components/ui/header-button";
import { ActivityItem } from "@/types/stats";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

const STAT_COLORS = {
  streak: "#F59E0B",
  games: "#8A4BE0",
  perfect: "#FF69B4",
  wins: "#22C55E",
  losses: "#EF4444",
  draws: "#F59E0B",
  rate: "#8C78FF",
  xp: "#F59E0B",
};

function StatCard({
  value,
  label,
  icon,
  color,
}: {
  value: string | number;
  label: string;
  icon: string;
  color: string;
}) {
  return (
    <View className="flex-1 items-center gap-1.5">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: color + "18" }}
      >
        <MaterialCommunityIcons name={icon as any} size={30} color={color} />
      </View>
      <Text className="font-display-bold text-[25px] text-white">{value}</Text>
      <Text className="font-ui-medium text-[14px] text-white/70">{label}</Text>
    </View>
  );
}

function ActivityListItem({ item }: { item: ActivityItem }) {
  return (
    <Pressable
      className="flex-row items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 active:opacity-85"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
        ...CARD_SHADOW,
      })}
    >
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: item.bg }}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={20}
          color={item.color}
        />
      </View>

      <View className="flex-1">
        <Text className="font-ui-semibold text-[14.5px] text-ink">
          {item.title}
        </Text>
        <Text className="mt-0.5 font-ui-medium text-[12px] text-ink-tertiary">
          {item.time}
        </Text>
      </View>

      <Text className="font-display-bold text-[14px] text-primary">
        {item.xp}
      </Text>
    </Pressable>
  );
}

export default function ActivityScreen() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const overview = useStatsStore((s) => s.overview);
  const activity = useStatsStore((s) => s.activity);
  const isLoadingOverview = useStatsStore((s) => s.isLoadingOverview);
  const isLoadingActivity = useStatsStore((s) => s.isLoadingActivity);
  const fetchOverview = useStatsStore((s) => s.fetchOverview);
  const fetchActivity = useStatsStore((s) => s.fetchActivity);

  useEffect(() => {
    if (token) {
      fetchOverview(token).catch(() => {});
      fetchActivity(token).catch(() => {});
    }
  }, [token, fetchOverview, fetchActivity]);

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
                  Activity
                </Text>
                <Text className="font-ui-medium text-[14px] text-ink-secondary">
                  Your gaming history
                </Text>
              </View>
              <HeaderButton
                icon="calendar-heart"
                onPress={() => {}}
                accessibilityLabel="Calendar"
              />
            </View>

            {/* Hero Stats */}
            <View
              className="relative overflow-hidden rounded-3xl px-5 py-6"
              style={{
                backgroundColor: "#8A4BE0",
                shadowColor: "#8A4BE0",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 18,
                elevation: 8,
              }}
            >
              <View className="absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full bg-white/[0.08]" />
              <View className="absolute -bottom-10 -left-6 h-[100px] w-[100px] rounded-full bg-white/[0.06]" />

              <View className="flex-row items-center">
                <StatCard
                  value={overview.streak}
                  label="Day streak"
                  icon="fire"
                  color={"white"}
                />
                <View className="mx-2 h-16 w-px bg-white/20" />
                <StatCard
                  value={overview.totalGames}
                  label="Games played"
                  icon="gamepad-variant"
                  color={"white"}
                />
                <View className="mx-2 h-16 w-px bg-white/20" />
                <StatCard
                  value={overview.xp}
                  label="XP earned"
                  icon="lightning-bolt"
                  color={"white"}
                />
              </View>
            </View>

            {/* Activity Timeline */}
            {isLoadingActivity ? (
              <View className="items-center py-8">
                <MaterialCommunityIcons
                  name="loading"
                  size={32}
                  color="#8A4BE0"
                />
              </View>
            ) : activity.length === 0 ? (
              <View className="items-center gap-3 rounded-3xl bg-white px-6 py-10">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-lavender">
                  <MaterialCommunityIcons
                    name="gamepad-variant-outline"
                    size={32}
                    color="#8A4BE0"
                  />
                </View>
                <Text className="font-display-bold text-[16px] text-ink">
                  No games yet
                </Text>
                <Text className="font-ui-medium text-[13px] text-center text-ink-secondary">
                  Start playing to see your activity here
                </Text>
              </View>
            ) : (
              activity.map((group, groupIndex) => (
                <View className="gap-3" key={groupIndex}>
                  <Text className="font-ui-bold text-[16px] tracking-wider text-ink">
                    {group.day}
                  </Text>
                  <View className="gap-2.5">
                    {group.items.map((item) => (
                      <ActivityListItem key={item.id} item={item} />
                    ))}
                  </View>
                </View>
              ))
            )}

            {/* Weekly Stats */}
            <View className="gap-3">
              <Text className="font-display-bold text-[16px] text-ink">
                Career stats
              </Text>
              <View className="flex-row flex-wrap rounded-2xl bg-white">
                <View className="w-[33.33%] items-center gap-2 py-4">
                  <MaterialCommunityIcons
                    name="gamepad-variant"
                    size={28}
                    color={STAT_COLORS.games}
                  />
                  <Text className="font-display-bold text-[18px] text-ink">
                    {overview.totalGames}
                  </Text>
                  <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                    Played
                  </Text>
                </View>
                <View className="w-[33.33%] items-center gap-2 py-4">
                  <MaterialCommunityIcons
                    name="trophy-outline"
                    size={28}
                    color={STAT_COLORS.wins}
                  />
                  <Text className="font-display-bold text-[18px] text-ink">
                    {overview.wins}
                  </Text>
                  <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                    Won
                  </Text>
                </View>
                <View className="w-[33.33%] items-center gap-2 py-4">
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={28}
                    color={STAT_COLORS.losses}
                  />
                  <Text className="font-display-bold text-[18px] text-ink">
                    {overview.losses}
                  </Text>
                  <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                    Lost
                  </Text>
                </View>
                <View className="w-[33.33%] items-center gap-2 py-4">
                  <MaterialCommunityIcons
                    name="handshake"
                    size={28}
                    color={STAT_COLORS.draws}
                  />
                  <Text className="font-display-bold text-[18px] text-ink">
                    {overview.draws}
                  </Text>
                  <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                    Draws
                  </Text>
                </View>
                <View className="w-[33.33%] items-center gap-2 py-4">
                  <MaterialCommunityIcons
                    name="chart-line"
                    size={28}
                    color={STAT_COLORS.rate}
                  />
                  <Text className="font-display-bold text-[18px] text-ink">
                    {overview.winRate}%
                  </Text>
                  <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                    Win rate
                  </Text>
                </View>
                <View className="w-[33.33%] items-center gap-2 py-4">
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={28}
                    color={STAT_COLORS.xp}
                  />
                  <Text className="font-display-bold text-[18px] text-ink">
                    {overview.xp}
                  </Text>
                  <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                    XP
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
