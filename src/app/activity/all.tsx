import {
  ActivityRow,
  ActivitySkeletonRow,
  flattenActivityGroups,
} from "@/components/activity/activity-row";
import { usePalette } from "@/hooks/usePalette";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/authStore";
import { useStatsStore } from "@/stores/statsStore";

export default function AllActivityScreen() {
  const token = useAuthStore((s) => s.token);
  const activity = useStatsStore((s) => s.activity);
  const activityCursor = useStatsStore((s) => s.activityCursor);
  const isLoading = useStatsStore((s) => s.isLoadingActivity);
  const isLoadingMore = useStatsStore((s) => s.isLoadingMoreActivity);
  const fetchActivity = useStatsStore((s) => s.fetchActivity);
  const fetchMoreActivity = useStatsStore((s) => s.fetchMoreActivity);
  const palette = usePalette();

  useFocusEffect(
    useCallback(() => {
      if (token) fetchActivity(token).catch(() => {});
    }, [token, fetchActivity]),
  );

  const entries = useMemo(() => flattenActivityGroups(activity), [activity]);

  const renderItem = useCallback(({ item }: { item: (typeof entries)[number] }) => {
    if (item.kind === "header") {
      return (
        <Text className="mb-1.5 mt-3 font-ui-bold text-label tracking-[1.5px] text-ink-tertiary">
          {item.day.toUpperCase()}
        </Text>
      );
    }
    return <ActivityRow item={item.item} />;
  }, []);

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="mx-auto w-full max-w-[460px] flex-1 px-[22px] pt-[10px]">
          <View className="flex-row items-center gap-3 pb-4">
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
                color={palette.ink}
              />
            </Pressable>
            <Text className="font-display-bold text-title-sm text-ink">
              All activity
            </Text>
          </View>

          {isLoading && activity.length === 0 ? (
            <View className="gap-2.5">
              <ActivitySkeletonRow />
              <ActivitySkeletonRow />
              <ActivitySkeletonRow />
            </View>
          ) : activity.length === 0 ? (
            <Text className="mt-10 text-center font-ui-medium text-body text-ink-tertiary">
              Nothing here yet.
            </Text>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(entry) => entry.key}
              renderItem={renderItem}
              onEndReached={() => token && fetchMoreActivity(token).catch(() => {})}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}
              ListFooterComponent={
                isLoadingMore ? (
                  <ActivityIndicator
                    style={{ marginTop: 16 }}
                    color={palette.primary}
                  />
                ) : !activityCursor ? (
                  <Text className="mt-4 text-center font-ui-medium text-caption text-ink-tertiary">
                    You're all caught up.
                  </Text>
                ) : undefined
              }
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
