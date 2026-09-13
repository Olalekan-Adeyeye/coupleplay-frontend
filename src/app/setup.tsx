import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import { PeepPair } from "@/components/peeps/PeepPair";
import { useInviteAction } from "@/hooks/useInviteAction";
import { useSocketStore } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ICON_CODE = require("@/assets/images/icons/mail.png");

/** First-run partner linking for new accounts. Flat dark, real share/copy. */
export default function SetupScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);
  const fetchCouple = useCoupleStore((s) => s.fetchCouple);
  const socket = useSocketStore((s) => s.socket);
  const connect = useSocketStore((s) => s.connect);
  const invite = useInviteAction();

  const [tab, setTab] = useState<"invite" | "enter">("invite");
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token) fetchCouple(token).catch(() => {});
  }, [token, fetchCouple]);

  // Realtime: partner just linked — auto-transition to "team" screen
  useEffect(() => {
    if (!socket) return;
    const onLinked = (couple: any) => {
      if (couple?.userAId === user?.id || couple?.userBId === user?.id) {
        fetchCouple(token!).catch(() => {});
      }
    };
    socket.on("couple:linked", onLinked);
    return () => {
      socket.off("couple:linked", onLinked);
    };
  }, [socket, token, user?.id, fetchCouple]);

  const connected = couple?.userBId != null;

  const handleJoin = async () => {
    setJoinError(null);
    setBusy(true);
    try {
      await invite.join(joinInput);
      await fetchCouple(token!);
      setJoinInput("");
    } catch (e: any) {
      setJoinError(e.message ?? "Could not join. Check the code.");
    } finally {
      setBusy(false);
    }
  };

  const handleFinish = () => {
    if (token) connect(token);
    router.replace("/(tabs)" as any);
  };

  if (connected) {
    const partner =
      couple?.userAId === user?.id ? couple?.userB : couple?.userA;
    return (
      <View className="flex-1 bg-paper">
        <StatusBar style="light" />
        <SafeAreaView edges={["top", "bottom"]} className="flex-1">
          <View className="flex-1 items-center justify-center px-7">
            <PeepPair
              mine={user?.avatar}
              theirs={partner?.avatar}
              mySeed={user?.id}
              theirSeed={partner?.id}
              myName={user?.name ?? undefined}
              theirName={partner?.name ?? undefined}
              size={84}
            />
            <Text className="mt-6 text-center font-display-bold text-[28px] leading-[34px] text-ink">
              You&apos;re officially a{"\n"}
              <Text className="text-primary">team!</Text>
            </Text>
            <Text className="mt-2 text-center font-ui-medium text-[15px] leading-[22px] text-ink-secondary">
              Start playing, competing and making{"\n"}memories together.
            </Text>
            <View className="mt-8 w-full gap-2.5">
              <AuthButton title="START OUR FIRST GAME" onPress={handleFinish} showArrow />
              <AuthButton
                title="Explore the app first"
                variant="ghost"
                onPress={handleFinish}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-2 items-center">
            <PeepPair
              mine={user?.avatar}
              theirs={null}
              mySeed={user?.id}
              myName={user?.name ?? undefined}
              size={76}
            />
            <Text className="mt-5 font-ui-bold text-[11px] tracking-[1.5px] text-primary">
              LINK YOUR PARTNER
            </Text>
            <Text className="mt-2 text-center font-display-bold text-[30px] leading-[36px] text-ink">
              One code links{"\n"}your story
            </Text>
            <Text className="mt-2 text-center font-ui-medium text-[15px] leading-[22px] text-ink-secondary">
              Share a code or enter theirs — it takes seconds.
            </Text>
          </View>

          <View className="mt-6 flex-row rounded-xl border border-hairline bg-surface p-1">
            {(["invite", "enter"] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === t }}
                className="flex-1 rounded-lg py-2.5 active:opacity-80"
                style={{
                  backgroundColor: tab === t ? "#946BFF" : "transparent",
                }}
              >
                <Text
                  className="text-center font-ui-semibold text-[13.5px]"
                  style={{ color: tab === t ? "#FFFFFF" : "#B3A8C9" }}
                >
                  {t === "invite" ? "Share code" : "Enter code"}
                </Text>
              </Pressable>
            ))}
          </View>

          {tab === "invite" ? (
            <View className="mt-4 items-center gap-3 rounded-2xl border border-hairline bg-surface p-5">
              <Text className="font-ui-bold text-[11px] tracking-[1.5px] text-ink-tertiary">
                YOUR INVITE CODE
              </Text>
              <Text className="font-display-bold text-[36px] tracking-[5px] text-primary">
                {invite.code ?? "···"}
              </Text>
              <View className="w-full flex-row gap-2.5">
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
                    Share
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
                    {invite.copied ? "Copied!" : "Copy"}
                  </Text>
                </Pressable>
              </View>
              {invite.error && (
                <Text className="font-ui-medium text-[12.5px] text-error-bright">
                  {invite.error}
                </Text>
              )}
            </View>
          ) : (
            <View className="mt-4 gap-3 rounded-2xl border border-hairline bg-surface p-5">
              <AuthInput
                label="Partner's code"
                icon={ICON_CODE}
                value={joinInput}
                onChangeText={(t) => {
                  setJoinInput(t);
                  setJoinError(null);
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={8}
                placeholder="e.g. 7K4P9X2Q"
                returnKeyType="done"
                onSubmitEditing={handleJoin}
              />
              {joinError && (
                <Text className="font-ui-medium text-[13px] text-error-bright">
                  {joinError}
                </Text>
              )}
              <AuthButton
                title="LINK UP"
                loading={busy}
                disabled={busy || joinInput.trim().length < 4}
                onPress={handleJoin}
                showArrow
              />
            </View>
          )}

          <Pressable
            onPress={handleFinish}
            className="mt-4 items-center py-2 active:opacity-70"
          >
            <Text className="font-ui-semibold text-[14px] text-ink-secondary">
              I&apos;ll do this later
            </Text>
          </Pressable>
          <View className="flex-1" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
