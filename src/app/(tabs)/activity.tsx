import { PeepScene } from "@/components/peeps/PeepScene";
import { PageHeader, SectionTitle, TabScreen } from "@/components/tab-screen";
import { HeaderButton } from "@/components/ui/header-button";
import { ActivityItem } from "@/types/stats";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
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
      <Text className="font-display-bold text-[22px] text-ink">{value}</Text>
      <Text className="font-ui-medium text-[12px] text-ink-secondary">
        {label}
      </Text>
    </View>
  );
}

function SkeletonRow() {
  return (
    <View className="flex-row items-center gap-3.5 rounded-2xl border border-hairline bg-surface px-4 py-3.5">
      <View className="h-11 w-11 rounded-xl bg-paper" />
      <View className="flex-1 gap-2">
        <View className="h-3.5 w-2/3 rounded-full bg-paper" />
        <View className="h-3 w-1/3 rounded-full bg-paper" />
      </View>
      <View className="h-3.5 w-12 rounded-full bg-paper" />
    </View>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <Pressable
      onPress={() =>
        router.push(
          {
            pathname: "/activity/recap",
            params: {
              id: item.id,
              title: item.title,
              xp: item.xp,
              time: item.time,
              gameType: item.gameType,
              icon: item.icon,
              color: item.color,
              bg: item.bg,
            },
          } as any,
        )
      }
      accessibilityLabel={`${item.title}. View recap.`}
      className="flex-row items-center gap-3.5 rounded-2xl border border-hairline bg-surface px-4 py-3.5 active:opacity-85"
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.98 : 1 }],
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
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color="#A79DBE"
      />
    </Pressable>
  );
}

const CAREER: {
  key: "totalGames" | "wins" | "losses" | "draws" | "winRate" | "streak";
  label: string;
  icon: string;
  color: string;
  suffix?: string;
}[] = [
  { key: "totalGames", label: "Played", icon: "gamepad-variant", color: "#946BFF" },
  { key: "wins", label: "Won", icon: "trophy-outline", color: "#22C55E" },
  { key: "losses", label: "Lost", icon: "close-circle-outline", color: "#EF4444" },
  { key: "draws", label: "Draws", icon: "handshake", color: "#F59E0B" },
  { key: "winRate", label: "Win rate", icon: "chart-line", color: "#8C78FF", suffix: "%" },
  { key: "streak", label: "Best streak", icon: "fire", color: "#F59E0B" },
];

export default function ActivityScreen() {
  const token = useAuthStore((s) => s.token);
  const overview = useStatsStore((s) => s.overview);
  const activity = useStatsStore((s) => s.activity);
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
        <Text className="mb-3 px-1 font-ui-bold text-[11px] tracking-[1.5px] text-ink-tertiary">
          THIS WEEK
        </Text>
        <View className="flex-row items-center">
          <HeroStat
            value={overview.streak}
            label="Day streak"
            icon="fire"
            tint="#F59E0B18"
            color="#F59E0B"
          />
          <View className="h-16 w-px bg-hairline" />
          <HeroStat
            value={overview.totalGames}
            label="Games played"
            icon="gamepad-variant"
            tint="#946BFF18"
            color="#946BFF"
          />
          <View className="h-16 w-px bg-hairline" />
          <HeroStat
            value={overview.xp}
            label="XP earned"
            icon="lightning-bolt"
            tint="#FF5C8A18"
            color="#FF5C8A"
          />
        </View>
      </View>

      {isLoadingActivity ? (
        <View className="gap-2.5">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </View>
      ) : activity.length === 0 ? (
        <View className="items-center rounded-2xl border border-hairline bg-surface px-6 py-8">
          <PeepScene layout="single" size={72} />
          <Text className="mt-3 font-display-bold text-[17px] text-ink">
            No battles yet
          </Text>
          <Text className="mt-1 text-center font-ui-medium text-[13px] leading-[18px] text-ink-secondary">
            Your match history will live here once you start playing.
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/games")}
            className="mt-4 rounded-xl bg-primary px-6 py-3 active:opacity-85"
          >
            <Text className="font-ui-bold text-[14px] text-white">
              Start a game
            </Text>
          </Pressable>
        </View>
      ) : (
        activity.map((group, groupIndex) => (
          <View className="gap-2.5" key={`${group.day}-${groupIndex}`}>
            <Text className="font-ui-bold text-[11px] tracking-[1.5px] text-ink-tertiary">
              {group.day.toUpperCase()}
            </Text>
            {group.items.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </View>
        ))
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
                  ? { borderBottomWidth: 1, borderBottomColor: "#2B2539" }
                  : undefined
              }
            >
              <MaterialCommunityIcons
                name={c.icon as any}
                size={24}
                color={c.color}
              />
              <Text className="font-display-bold text-[17px] text-ink">
                {overview[c.key]}
                {c.suffix ?? ""}
              </Text>
              <Text className="font-ui-medium text-[11px] text-ink-tertiary">
                {c.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TabScreen>
  );
}
