import { PeepScene } from "@/components/peeps/PeepScene";
import { SectionTitle, TabScreen } from "@/components/tab-screen";
import { CoupleAvatars } from "@/components/ui/couple-avatars";
import { HeaderButton } from "@/components/ui/header-button";
import { GAMES, GAME_IMAGES } from "@/data/games";
import { isGameImplemented } from "@/features/games/registry";
import { useInviteAction } from "@/hooks/useInviteAction";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useStatsStore } from "@/stores/statsStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

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
  const overview = useStatsStore((s) => s.overview);
  const fetchOverview = useStatsStore((s) => s.fetchOverview);
  const invite = useInviteAction();

  useEffect(() => {
    if (token) {
      fetchCouple(token).catch(() => {});
      fetchOverview(token).catch(() => {});
    }
  }, [token, fetchCouple, fetchOverview]);

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

  const handleGamePress = (gameId: string) => {
    if (!hasPartner) {
      router.push("/settings");
      return;
    }
    if (!isGameImplemented(gameId)) {
      router.push(`/games/soon?gameType=${gameId}` as any);
      return;
    }
    router.push(`/games/${gameId}`);
  };

  return (
    <TabScreen>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-ui-semibold text-[14px] text-ink-secondary">
            {greeting()}, {myName}
          </Text>
          <Text className="mt-0.5 font-display-bold text-[28px] leading-[34px] text-ink">
            Game night?
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          {overview.streak > 0 && (
            <Pressable
              onPress={() => router.push("/(tabs)/activity")}
              accessibilityLabel={`${overview.streak} day streak. View activity.`}
              className="flex-row items-center gap-1 rounded-full border border-hairline bg-surface px-3 py-2 active:opacity-70"
            >
              <MaterialCommunityIcons name="fire" size={16} color="#F59E0B" />
              <Text className="font-ui-bold text-[13px] text-ink">
                {overview.streak}
              </Text>
            </Pressable>
          )}
          <HeaderButton
            icon="cog-outline"
            onPress={() => router.push("/settings")}
            accessibilityLabel="Settings"
          />
        </View>
      </View>

      <View className="items-center rounded-2xl border border-hairline bg-surface px-6 pt-6 pb-5">
        <CoupleAvatars
          hasPartner={hasPartner}
          myPeep={user?.avatar}
          theirPeep={partner?.avatar}
          myName={user?.name ?? undefined}
          theirName={partner?.name ?? undefined}
        />
        <Text className="mt-3 font-display-bold text-[17px] text-ink">
          {hasPartner ? `${myName} & ${partnerName}` : "You + Player 2"}
        </Text>
        <Text className="mt-1 font-ui-medium text-[13px] text-ink-secondary">
          {hasPartner
            ? `${daysTogether} ${daysTogether === 1 ? "day" : "days"} together`
            : "Your story starts with an invite"}
        </Text>
        {hasPartner && overview.streak > 0 && (
          <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-paper px-4 py-1.5">
            <MaterialCommunityIcons name="fire" size={14} color="#F59E0B" />
            <Text className="font-ui-semibold text-[12px] text-ink">
              {overview.streak}-day streak
            </Text>
          </View>
        )}
      </View>

      {!hasPartner && (
        <View className="items-center rounded-2xl border border-hairline bg-surface px-6 py-5">
          <PeepScene layout="duo" size={64} />
          <Text className="mt-3 font-display-bold text-[16px] text-ink">
            Invite your player 2
          </Text>
          <Text className="mt-1 text-center font-ui-medium text-[13px] leading-[18px] text-ink-secondary">
            Share a code and link your story before game night.
          </Text>
          <View className="mt-4 w-full flex-row gap-2.5">
            <Pressable
              onPress={invite.share}
              disabled={invite.busy}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 active:opacity-85"
              style={{ opacity: invite.busy ? 0.7 : 1 }}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={17}
                color="#FFFFFF"
              />
              <Text className="font-ui-bold text-[14px] text-white">
                Share invite
              </Text>
            </Pressable>
            <Pressable
              onPress={invite.copy}
              disabled={invite.busy}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border-[1.5px] border-primary py-3.5 active:opacity-85"
              style={{ opacity: invite.busy ? 0.7 : 1 }}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={17}
                color="#946BFF"
              />
              <Text className="font-ui-bold text-[14px] text-primary">
                {invite.copied ? "Copied!" : invite.code ?? "Get code"}
              </Text>
            </Pressable>
          </View>
          {invite.error && (
            <Text className="mt-2 font-ui-medium text-[12.5px] text-error-bright">
              {invite.error}
            </Text>
          )}
        </View>
      )}

      <View className="gap-3">
        <SectionTitle
          title="Pick a game"
          action={
            <Pressable
              onPress={() => router.push("/(tabs)/games")}
              className="flex-row items-center gap-0.5 active:opacity-70"
            >
              <Text className="font-ui-semibold text-[14px] text-primary">
                See all
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={16}
                color="#946BFF"
              />
            </Pressable>
          }
        />
        <View className="flex-row flex-wrap justify-between">
          {GAMES.slice(0, 4).map((g) => {
            const implemented = isGameImplemented(g.id);
            const hero = g.heroImage ? GAME_IMAGES[g.heroImage] : undefined;
            return (
              <Pressable
                key={g.id}
                onPress={() => handleGamePress(g.id)}
                className="mb-3 w-[48.5%] items-center gap-2 rounded-2xl border border-hairline bg-surface px-3 pt-4 pb-4 active:opacity-85"
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
              >
                <View
                  className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-xl"
                  style={{ backgroundColor: g.accent }}
                >
                  {hero ? (
                    <Image
                      source={hero}
                      style={{ width: 56, height: 56 }}
                      contentFit="contain"
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name={(g.iconName ?? "gamepad-variant") as any}
                      size={32}
                      color={g.tagColor}
                    />
                  )}
                  {!implemented && (
                    <View className="absolute bottom-1 rounded-full bg-black/70 px-2 py-0.5">
                      <Text className="font-ui-bold text-[9px] tracking-[0.8px] text-white">
                        SOON
                      </Text>
                    </View>
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

    </TabScreen>
  );
}
