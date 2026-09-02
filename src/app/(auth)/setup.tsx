import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import { CoupleAvatars } from "@/components/ui/couple-avatars";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useSocketStore } from "@/hooks/useSocket";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ICON_CODE = require("@/assets/images/icons/mail.png");

export default function SetupScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);
  const fetchCouple = useCoupleStore((s) => s.fetchCouple);
  const generateInvite = useCoupleStore((s) => s.generateInvite);
  const joinByCode = useCoupleStore((s) => s.joinByCode);
  const connect = useSocketStore((s) => s.connect);

  const [tab, setTab] = useState<"invite" | "enter">("invite");
  const [code, setCode] = useState("");
  const [joinInput, setJoinInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (token) fetchCouple(token).catch(() => {});
  }, [token, fetchCouple]);

  const displayCode = couple && !code ? (couple.inviteCode ?? "") : code;
  const connected = couple?.userBId != null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const cpl = await generateInvite(token!);
      setCode(cpl.inviteCode ?? "");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (joinInput.trim().length < 4) {
      Alert.alert("Hmm", "Enter the full code from your partner.");
      return;
    }
    setLoading(true);
    try {
      await joinByCode(joinInput.trim().toUpperCase(), token!);
      await fetchCouple(token!);
      setJoined(true);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (user) connect(user.id);
    router.replace("/(tabs)" as any);
  };

  if (joined || connected) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <SafeAreaView edges={["top", "bottom"]} className="flex-1">
          <View className="flex-1 items-center justify-center px-7">
            <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
              <MaterialCommunityIcons name="handshake" size={40} color="#8A4BE0" />
            </View>

            <Text className="mt-6 text-center font-display text-[28px] leading-[36px] text-ink">
              You&apos;re officially a{"\n"}
              <Text className="text-primary">team!</Text>
            </Text>
            <Text className="mt-2 text-center font-ui-medium text-[15px] leading-[22px] text-ink-secondary">
              Start playing, competing and making{"\n"}memories together.
            </Text>

            {couple && (
              <View className="mt-6 w-full items-center gap-2 rounded-3xl bg-primary-soft px-5 py-5">
                <Text className="font-display text-[17px] text-ink">
                  {couple.userA?.name?.split(" ")[0] ?? "You"} &{" "}
                  {couple.userB?.name?.split(" ")[0] ?? "Partner"}
                </Text>
                <Text className="font-ui-medium text-[13px] text-ink-secondary">
                  Connected on{" "}
                  {couple
                    ? new Date(couple.createdAt).toLocaleDateString()
                    : "today"}
                </Text>
              </View>
            )}

            <View className="mt-8 w-full gap-3">
              <AuthButton title="Start Our First Game" onPress={handleFinish} />
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
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View className="w-full max-w-[460px] self-center">
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              className="h-10 w-10 items-center justify-center active:opacity-60"
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color="#7A748C" />
            </Pressable>
          </View>

          <View className="mt-2 w-full max-w-[460px] items-center self-center px-5">
            <View className="mb-4">
              <CoupleAvatars
                hasPartner={false}
                userGender={user?.gender}
                size={80}
              />
            </View>

            <Text className="text-center font-display text-[28px] leading-[36px] text-ink">
              Link your{" "}
              <Text className="text-primary">partner</Text>
            </Text>
            <Text className="mt-2 text-center font-ui-medium text-[15px] leading-[22px] text-ink-secondary">
              Add your partner to start playing together.
            </Text>

            <View className="mt-7 w-full gap-3.5">
              <View className="w-full flex-row rounded-full bg-background-alt p-1">
                <Pressable
                  onPress={() => setTab("invite")}
                  accessibilityRole="button"
                  className="flex-1 items-center rounded-full py-2.5"
                  style={{ backgroundColor: tab === "invite" ? "#8A4BE0" : "transparent" }}
                >
                  <Text
                    className="font-ui-semibold text-[14px]"
                    style={{ color: tab === "invite" ? "#FFFFFF" : "#7A748C" }}
                  >
                    Create Code
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setTab("enter")}
                  accessibilityRole="button"
                  className="flex-1 items-center rounded-full py-2.5"
                  style={{ backgroundColor: tab === "enter" ? "#8A4BE0" : "transparent" }}
                >
                  <Text
                    className="font-ui-semibold text-[14px]"
                    style={{ color: tab === "enter" ? "#FFFFFF" : "#7A748C" }}
                  >
                    Join with Code
                  </Text>
                </Pressable>
              </View>

              {tab === "invite" ? (
                <>
                  <View className="w-full items-center rounded-3xl border-2 border-dashed border-primary px-5 py-6">
                    {displayCode ? (
                      <Text className="font-ui-bold text-[30px] tracking-[6px] text-primary">
                        {displayCode}
                      </Text>
                    ) : (
                      <Text className="font-ui-bold text-[30px] tracking-[6px] text-ink-tertiary">
                        -----
                      </Text>
                    )}
                  </View>
                  <Text className="text-center font-ui-medium text-[13px] leading-[19px] text-ink-secondary">
                    Ask your partner to enter this code{"\n"}on their app to connect.
                  </Text>
                  <AuthButton
                    title={displayCode ? "Share Invite" : "Generate Invite Code"}
                    loading={loading}
                    disabled={loading}
                    onPress={displayCode ? () => {} : handleGenerate}
                  />
                  {displayCode && (
                    <AuthButton
                      title="Copy Code"
                      variant="outline"
                      onPress={() => {
                        if (displayCode) Alert.alert("Code copied", displayCode);
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  <AuthInput
                    label="Partner's code"
                    icon={ICON_CODE}
                    value={joinInput}
                    onChangeText={setJoinInput}
                    autoCapitalize="characters"
                    maxLength={8}
                    placeholder="e.g. 7K4P9"
                  />
                  <AuthButton
                    title="Join"
                    loading={loading}
                    disabled={loading || joinInput.trim().length < 4}
                    onPress={handleJoin}
                  />
                </>
              )}

              <AuthButton
                title="I'll do this later"
                variant="ghost"
                onPress={handleFinish}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
