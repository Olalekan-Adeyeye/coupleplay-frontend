import { usePalette } from "@/hooks/usePalette";
import { ActivityGroup, ActivityItem } from "@/types/stats";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function ActivitySkeletonRow() {
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

export function ActivityRow({ item }: { item: ActivityItem }) {
  const palette = usePalette();
  const iconName = item.icon in MaterialCommunityIcons.glyphMap ? item.icon : "gamepad-variant";
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
          name={iconName as any}
          size={20}
          color={item.color}
        />
      </View>
      <View className="flex-1">
        <Text className="font-ui-semibold text-body text-ink">
          {item.title}
        </Text>
        <Text className="mt-0.5 font-ui-medium text-caption text-ink-tertiary">
          {item.time}
        </Text>
      </View>
      <Text className="font-display-bold text-body text-primary">
        {item.xp}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color={palette.inkTertiary}
      />
    </Pressable>
  );
}

export function ActivityList({ groups }: { groups: ActivityGroup[] }) {
  return (
    <>
      {groups.map((group, groupIndex) => (
        <View className="gap-2.5" key={`${group.day}-${groupIndex}`}>
          <Text className="font-ui-bold text-label tracking-[1.5px] text-ink-tertiary">
            {group.day.toUpperCase()}
          </Text>
          {group.items.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </View>
      ))}
    </>
  );
}

export type ActivityListEntry =
  | { kind: "header"; key: string; day: string }
  | { kind: "row"; key: string; item: ActivityItem };

export function flattenActivityGroups(
  groups: ActivityGroup[],
): ActivityListEntry[] {
  return groups.flatMap((group) => [
    { kind: "header" as const, key: `header-${group.day}`, day: group.day },
    ...group.items.map((item) => ({
      kind: "row" as const,
      key: item.id,
      item,
    })),
  ]);
}
