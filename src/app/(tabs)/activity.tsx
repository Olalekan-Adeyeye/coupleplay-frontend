import { PeepScene } from "@/components/peeps/PeepScene";
import {
  ActivityList,
  ActivitySkeletonRow,
} from "@/components/activity/activity-row";
import { PageHeader, SectionTitle, TabScreen } from "@/components/tab-screen";
import { HeaderButton } from "@/components/ui/header-button";
import { usePalette } from "@/hooks/usePalette";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, router } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { useStatsStore } from "@/stores/statsStore";

function HeroStat({
  value,
  label,
  icon,
  tint,
  color,
}: {
  value: string | number;
  label: string;
  icon: string;
  tint: string;
  color: string;
}) {
  return (
    <View className="flex-1 items-center gap-1.5 py-1">
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: tint }}
      >
        <MaterialCommunityIcons name={icon as any} size={22} color={color} />
      </View>
      <Text className="font-display-bold text-title-lg text-ink">{value}</Text>
      <Text className="font-ui-medium text-caption text-ink-secondary">
        {label}
      </Text>
    </View>
  );
}

const CAREER: {
  key: "totalGames" | "wins" | "losses" | "draws" | "winRate" | "streak";
  label: string;
  icon: string;
  color: string;
  suffix?: string;
}[] = [
  {
    key: "totalGames",
    label: "Played",
    icon: "gamepad-variant",
    color: "#946BFF",
  },
  { key: "wins", label: "Won", icon: "trophy-outline", color: "#22C55E" },
  {
    key: "losses",
    label: "Lost",
    icon: "close-circle-outline",
    color: "#EF4444",
  },
  { key: "draws", label: "Draws", icon: "handshake", color: "#F59E0B" },
  {
    key: "winRate",
    label: "Win rate",
    icon: "chart-line",
    color: "#8C78FF",
    suffix: "%",
  },
  { key: "streak", label: "Day streak", icon: "fire", color: "#F59E0B" },
];

const PREVIEW_ITEM_COUNT = 6;

export default function ActivityScreen() {
  const token = useAuthStore((s) => s.token);
  const overview = useStatsStore((s) => s.overview);
  const activity = useStatsStore((s) => s.activity);
  const isLoadingActivity = useStatsStore((s) => s.isLoadingActivity);
  const fetchOverview = useStatsStore((s) => s.fetchOverview);
  const fetchActivity = useStatsStore((s) => s.fetchActivity);
  const palette = usePalette();

  const previewGroups = useMemo(() => {
    let remaining = PREVIEW_ITEM_COUNT;
    const sliced: typeof activity = [];
    for (const group of activity) {
      if (remaining <= 0) break;
      const items = group.items.slice(0, remaining);
      sliced.push({ day: group.day, items });
      remaining -= items.length;
    }
    return sliced;
  }, [activity]);
  const previewCount = previewGroups.reduce(
    (sum, g) => sum + g.items.length,
    0,
  );
  const totalItems = activity.reduce((sum, g) => sum + g.items.length, 0);
  const hasMore = totalItems > previewCount;

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchOverview(token).catch(() => {});
        fetchActivity(token).catch(() => {});
      }
    }, [token, fetchOverview, fetchActivity]),
  );

  return (
    <TabScreen>
      <PageHeader
        title="Activity"
        subtitle="Your gaming history"
        right={
          <HeaderButton
            icon="refresh"
            onPress={() => {
              if (token) {
                fetchOverview(token).catch(() => {});
                fetchActivity(token).catch(() => {});
              }
            }}
            accessibilityLabel="Refresh activity"
          />
        }
      />

      <View className="rounded-2xl border border-hairline bg-surface px-4 py-5">
        <Text className="mb-3 px-1 font-ui-bold text-label tracking-[1.5px] text-ink-tertiary">
          THIS WEEK
        </Text>
        <View className="flex-row items-center">
          <HeroStat
            value={overview.streak}
            label="Day streak"
            icon="fire"
            tint={`${palette.amber}18`}
            color={palette.amber}
          />
          <View className="h-16 w-px bg-hairline" />
          <HeroStat
            value={overview.totalGames}
            label="Games played"
            icon="gamepad-variant"
            tint={`${palette.primary}18`}
            color={palette.primary}
          />
          <View className="h-16 w-px bg-hairline" />
          <HeroStat
            value={overview.xp}
            label="XP earned"
            icon="lightning-bolt"
            tint={`${palette.primary}18`}
            color={palette.primary}
          />
        </View>
      </View>

      {isLoadingActivity ? (
        <View className="gap-2.5">
          <ActivitySkeletonRow />
          <ActivitySkeletonRow />
          <ActivitySkeletonRow />
        </View>
      ) : activity.length === 0 ? (
        <View className="items-center rounded-2xl border border-hairline bg-surface px-6 py-8">
          <PeepScene layout="single" size={72} />
          <Text className="mt-3 font-display-bold text-title-xs text-ink">
            No battles yet
          </Text>
          <Text className="mt-1 text-center font-ui-medium text-body-sm leading-[18px] text-ink-secondary">
            Your match history will live here once you start playing.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/games")}
            className="mt-4 rounded-xl bg-primary px-6 py-3 active:opacity-85"
          >
            <Text className="font-ui-bold text-body text-white">
              Start a game
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-2.5">
          <ActivityList groups={previewGroups} />
          {hasMore && (
            <Pressable
              onPress={() => router.push("/activity/all")}
              accessibilityLabel="Show all activity"
              className="flex-row items-center gap-3.5 rounded-2xl border border-hairline bg-surface px-4 py-3.5 active:opacity-85"
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${palette.primary}18` }}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={20}
                  color={palette.primary}
                />
              </View>
              <Text className="flex-1 font-ui-semibold text-body text-ink">
                Show all activity
              </Text>
              <Text className="font-ui-medium text-caption text-ink-tertiary">
                {overview.totalGames > 0 ? overview.totalGames : totalItems}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={palette.inkTertiary}
              />
            </Pressable>
          )}
        </View>
      )}

      <View className="gap-3">
        <SectionTitle title="Career" />
        <View className="flex-row flex-wrap rounded-2xl border border-hairline bg-surface">
          {CAREER.map((c, i) => (
            <View
              key={c.key}
              className="w-[33.33%] items-center gap-1.5 py-4"
              style={
                i < CAREER.length - 3
                  ? {
                      borderBottomWidth: 0.5,
                      borderBottomColor: palette.hairline,
                    }
                  : undefined
              }
            >
              <MaterialCommunityIcons
                name={c.icon as any}
                size={24}
                color={c.key === "totalGames" ? palette.primary : c.color}
              />
              <Text className="font-display-bold text-title-xs text-ink">
                {overview[c.key]}
                {c.suffix ?? ""}
              </Text>
              <Text className="font-ui-medium text-label text-ink-tertiary">
                {c.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TabScreen>
  );
}
