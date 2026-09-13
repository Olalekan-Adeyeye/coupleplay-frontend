import { PeepScene } from "@/components/peeps/PeepScene";
import { PageHeader, SectionTitle, TabScreen } from "@/components/tab-screen";
import { CoupleAvatars } from "@/components/ui/couple-avatars";
import { HeaderButton } from "@/components/ui/header-button";
import { useInviteAction } from "@/hooks/useInviteAction";
import { Achievement } from "@/types/stats";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useStatsStore } from "@/stores/statsStore";

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const unlocked = achievement.unlocked;
  return (
    <View
      className="w-[128px] items-center rounded-2xl border border-hairline bg-surface py-4 px-2.5"
    >
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: unlocked ? achievement.color + "1F" : "#F4F1EC",
        }}
      >
        <MaterialCommunityIcons
          name={achievement.icon as any}
          size={27}
          color={unlocked ? achievement.color : "#A79DBE"}
        />
      </View>
      <Text className="mt-2 text-center font-ui-bold text-[13px] text-ink">
        {achievement.name}
      </Text>
      {!unlocked && (
        <Text className="mt-0.5 text-center font-ui-medium text-[11px] leading-[15px] text-ink-tertiary">
          {achievement.progress > 0
            ? `${achievement.progress}% there`
            : "Locked — keep playing"}
        </Text>
      )}
      {!unlocked && achievement.progress > 0 && (
        <View className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper">
          <View
            className="h-full rounded-full"
            style={{
              width: `${achievement.progress}%`,
              backgroundColor: achievement.color,
            }}
          />
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
  const invite = useInviteAction();

  useEffect(() => {
    if (token) {
      fetchCouple(token).catch(() => {});
      fetchOverview(token).catch(() => {});
      fetchAchievements(token).catch(() => {});
    }
  }, [token, fetchCouple, fetchOverview, fetchAchievements]);

  const hasPartner = couple?.userBId != null;
  const isUserA = couple?.userAId === user?.id;
  const partner = hasPartner
    ? isUserA
      ? couple?.userB
      : couple?.userA
    : null;

  const myName = user?.name?.split(" ")[0] ?? "You";
  const partnerName = partner?.name?.split(" ")[0] ?? "Partner";

  const daysTogether = useMemo(() => {
    if (!couple?.createdAt) return 0;
    return Math.max(
      1,
      Math.floor((Date.now() - new Date(couple.createdAt).getTime()) / 86400000),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couple]);

  const togetherSince = couple?.createdAt
    ? new Date(couple.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const highlights = [
    { label: "Day streak", value: overview.streak, icon: "fire", color: "#F59E0B" },
    { label: "Games", value: overview.totalGames, icon: "gamepad-variant", color: "#946BFF" },
    { label: "Won", value: overview.wins, icon: "trophy-outline", color: "#22C55E" },
    { label: "XP", value: overview.xp, icon: "lightning-bolt", color: "#FF5C8A" },
  ];

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  return (
    <TabScreen>
      <PageHeader
        title="Us"
        subtitle={hasPartner ? `${myName} & ${partnerName}` : "Your space"}
        right={
          <HeaderButton
            icon="cog-outline"
            onPress={() => router.push("/settings")}
            accessibilityLabel="Settings"
          />
        }
      />

      <View className="items-center rounded-2xl border border-hairline bg-surface px-6 py-7">
        <CoupleAvatars
          hasPartner={hasPartner}
          myPeep={user?.avatar}
          theirPeep={partner?.avatar}
          myName={user?.name ?? undefined}
          theirName={partner?.name ?? undefined}
          size={72}
        />
        {hasPartner ? (
          <View className="mt-4 items-center">
            <Text className="font-ui-medium text-[13px] text-ink-secondary">
              Together since {togetherSince}
            </Text>
            <Text className="mt-1 font-display-bold text-[26px] text-ink">
              {daysTogether} {daysTogether === 1 ? "day" : "days"}
            </Text>
            <Pressable
              onPress={() => router.push("/change-peep" as any)}
              className="mt-3 flex-row items-center gap-1.5 rounded-full bg-paper px-4 py-2 active:opacity-70"
            >
              <MaterialCommunityIcons
                name="account-edit-outline"
                size={15}
                color="#946BFF"
              />
              <Text className="font-ui-semibold text-[13px] text-primary">
                Edit our look
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="mt-4 items-center">
            <Text className="font-display-bold text-[18px] text-ink">
              Waiting for player 2
            </Text>
            <Text className="mt-1 text-center font-ui-medium text-[13px] leading-[18px] text-ink-secondary">
              Share your code and your story starts the moment they join.
            </Text>
            <View className="mt-4 w-full flex-row gap-2.5">
              <Pressable
                onPress={invite.share}
                disabled={invite.busy}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3 active:opacity-85"
                style={{ opacity: invite.busy ? 0.7 : 1 }}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={16}
                  color="#FFFFFF"
                />
                <Text className="font-ui-bold text-[13.5px] text-white">
                  Share invite
                </Text>
              </Pressable>
              <Pressable
                onPress={invite.copy}
                disabled={invite.busy}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary py-3 active:opacity-85"
                style={{ opacity: invite.busy ? 0.7 : 1 }}
              >
                <MaterialCommunityIcons
                  name="content-copy"
                  size={16}
                  color="#946BFF"
                />
                <Text className="font-ui-bold text-[13.5px] text-primary">
                  {invite.copied ? "Copied!" : invite.code ?? "Get code"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <View className="gap-3">
        <SectionTitle title="Highlights" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10 }}
        >
          {highlights.map((h) => (
            <View
              key={h.label}
              className="w-[118px] items-center gap-1.5 rounded-2xl border border-hairline bg-surface py-4"
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: h.color + "18" }}
              >
                <MaterialCommunityIcons
                  name={h.icon as any}
                  size={24}
                  color={h.color}
                />
              </View>
              <Text className="font-display-bold text-[19px] text-ink">
                {h.value}
              </Text>
              <Text className="font-ui-medium text-[11px] text-ink-secondary">
                {h.label}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {achievements.length === 0 ? (
        <View className="items-center rounded-2xl border border-hairline bg-surface px-6 py-7">
          <PeepScene layout="single" size={64} />
          <Text className="mt-3 font-display-bold text-[16px] text-ink">
            Trophies live here
          </Text>
          <Text className="mt-1 text-center font-ui-medium text-[13px] text-ink-secondary">
            Play matches to unlock achievements together.
          </Text>
        </View>
      ) : (
        <>
          {unlockedAchievements.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <SectionTitle title="Achievements" />
                <View className="rounded-full bg-primary-soft px-2 py-0.5">
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
          {lockedAchievements.length > 0 && (
            <View className="gap-3">
              <SectionTitle
                title={unlockedAchievements.length > 0 ? "Almost there" : "Achievements"}
              />
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
        </>
      )}
    </TabScreen>
  );
}
