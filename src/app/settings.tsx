import { CoupleAvatars } from "@/components/ui/couple-avatars";
import { useSocketStore } from "@/hooks/useSocket";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_SHADOW = {
  shadowColor: "#4A3B6B",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
} as const;

export default function SettingsScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);
  const fetchCouple = useCoupleStore((s) => s.fetchCouple);
  const generateInvite = useCoupleStore((s) => s.generateInvite);
  const joinByCode = useCoupleStore((s) => s.joinByCode);
  const unlink = useCoupleStore((s) => s.unlink);
  const disconnect = useSocketStore((s) => s.disconnect);
  const [tab, setTab] = useState<"invite" | "enter">("invite");
  const [joinInput, setJoinInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inviteCode = couple?.inviteCode ?? "";

  useEffect(() => {
    if (token) fetchCouple(token).catch(() => {});
  }, [token, fetchCouple]);

  const hasPartner = couple?.userBId != null;
  const isUserA = couple?.userAId === user?.id;
  const partnerGender = hasPartner ? (isUserA ? couple?.userB?.gender : couple?.userA?.gender) : null;

  const genInvite = async () => {
    setBusy(true);
    try {
      const cpl = await generateInvite(token!);
      Alert.alert("Your Invite Code", cpl.inviteCode ?? "");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleJoin = async () => {
    setBusy(true);
    try {
      await joinByCode(joinInput.trim().toUpperCase(), token!);
      await fetchCouple(token!);
      Alert.alert("You're a team! ❤️", "You two are officially linked.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = () => {
    Alert.alert(
      "Unlink Partner",
      "Are you sure you want to unlink from your partner? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlink",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await unlink(token!);
              Alert.alert(
                "Unlinked",
                "You have been unlinked from your partner.",
              );
            } catch (e: any) {
              Alert.alert("Error", e.message);
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    disconnect();
    useAuthStore.getState().logout();
    router.replace("/(auth)");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This will permanently remove all your data and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await api.users.deleteAccount(token!);
              disconnect();
              useAuthStore.getState().logout();
              router.replace("/(auth)");
            } catch (e: any) {
              Alert.alert("Error", e.message);
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-lavender">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full max-w-[460px] self-center gap-6 px-[22px] pt-[14px] pb-[40px]">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Back"
                className="h-11 w-11 items-center justify-center rounded-full bg-white active:opacity-80"
                style={CARD_SHADOW}
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={26}
                  color="#201A33"
                />
              </Pressable>
              <Text className="font-display-bold text-[24px] leading-[30px] text-ink">
                Settings
              </Text>
              <View className="h-11 w-11" />
            </View>

            {/* Partner connect */}
            {hasPartner ? (
              <View className="gap-3">
                <Text className="font-display-bold text-[16px] text-ink">
                  Your partner
                </Text>
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
                  <View className="absolute -left-8 -top-8 h-[140px] w-[140px] rounded-full bg-white/[0.12]" />
                  <View className="absolute -bottom-10 -right-6 h-[120px] w-[120px] rounded-full bg-accent/25" />
                  <View className="absolute right-10 top-5 h-2 w-2 rounded-full bg-white/25" />
                  <View className="absolute bottom-8 left-12 h-1.5 w-1.5 rounded-full bg-white/20" />

                  <CoupleAvatars
                    hasPartner={hasPartner}
                    userGender={user?.gender}
                    partnerGender={partnerGender}
                  />

                  <Text className="mt-4 font-display-bold text-[15px] text-white">
                    Together since{" "}
                    {new Date(couple!.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {/* Unlink button */}
                <Pressable
                  onPress={handleUnlink}
                  disabled={busy}
                  className="flex-row items-center justify-center gap-2 rounded-full border border-red-300 bg-white py-3.5 active:opacity-80"
                  style={{
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <MaterialCommunityIcons
                    name="link-variant-off"
                    size={18}
                    color="#DC2626"
                  />
                  <Text className="font-ui-bold text-[14px] text-red-500">
                    Unlink Partner
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="gap-3">
                {/* Empty state hero */}
                <View
                  className="relative items-center overflow-hidden rounded-3xl px-6 py-7"
                  style={{
                    backgroundColor: "#8A4BE0",
                    shadowColor: "#8A4BE0",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 18,
                    elevation: 8,
                  }}
                >
                  <View className="absolute -left-8 -top-8 h-[140px] w-[140px] rounded-full bg-white/[0.12]" />
                  <View className="absolute -bottom-10 -right-6 h-[120px] w-[120px] rounded-full bg-accent/25" />
                  <View className="absolute right-10 top-5 h-2 w-2 rounded-full bg-white/25" />

                  <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
                    <MaterialCommunityIcons
                      name="heart-outline"
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text className="mt-3 font-display-bold text-[19px] text-white">
                    Link with your partner
                  </Text>
                  <Text className="mt-1 text-center font-ui-medium text-[13.5px] leading-[19px] text-white/75">
                    Invite your player 2 or enter their code to start your story
                    together
                  </Text>
                </View>

                {/* Segmented control */}
                <View className="flex-row rounded-full bg-primary-soft p-1.5">
                  <Pressable
                    onPress={() => setTab("invite")}
                    className="flex-1 rounded-full py-2.5"
                    style={{
                      backgroundColor:
                        tab === "invite" ? "#8A4BE0" : "transparent",
                    }}
                  >
                    <Text
                      className="text-center font-ui-semibold text-[14px]"
                      style={{
                        color: tab === "invite" ? "white" : "#7A748C",
                      }}
                    >
                      Invite
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setTab("enter")}
                    className="flex-1 rounded-full py-2.5"
                    style={{
                      backgroundColor:
                        tab === "enter" ? "#8A4BE0" : "transparent",
                    }}
                  >
                    <Text
                      className="text-center font-ui-semibold text-[14px]"
                      style={{
                        color: tab === "enter" ? "white" : "#7A748C",
                      }}
                    >
                      Enter code
                    </Text>
                  </Pressable>
                </View>

                {tab === "invite" ? (
                  <View
                    className="items-center gap-4 rounded-3xl bg-white p-6"
                    style={CARD_SHADOW}
                  >
                    <View className="w-full items-center rounded-2xl border-2 border-dashed border-primary py-5">
                      <Text className="font-ui-bold text-[32px] tracking-widest text-primary">
                        {inviteCode || "-----"}
                      </Text>
                    </View>
                    <Text className="text-center font-ui-medium text-[13px] leading-[18px] text-ink-secondary">
                      Ask your partner to enter this code on their app.
                    </Text>
                    <Pressable
                      onPress={genInvite}
                      disabled={busy}
                      className="w-full items-center rounded-full bg-primary py-4 active:opacity-85"
                      style={{
                        opacity: busy ? 0.7 : 1,
                        shadowColor: "#8A4BE0",
                        shadowOffset: { width: 0, height: 5 },
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        elevation: 4,
                      }}
                    >
                      <Text className="font-ui-bold text-[15px] text-white">
                        {inviteCode
                          ? "Regenerate Code"
                          : "Generate Invite Code"}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View
                    className="items-center gap-4 rounded-3xl bg-white p-6"
                    style={CARD_SHADOW}
                  >
                    <TextInput
                      value={joinInput}
                      onChangeText={setJoinInput}
                      placeholder="ENTER CODE"
                      placeholderTextColor="#B0A9C2"
                      autoCapitalize="characters"
                      maxLength={8}
                      className="w-full rounded-2xl border border-surface-border bg-lavender px-4 py-4 text-center font-ui-bold text-[16px] tracking-widest text-ink"
                    />
                    <Text className="text-center font-ui-medium text-[13px] leading-[18px] text-ink-secondary">
                      Enter the code your partner shared with you.
                    </Text>
                    <Pressable
                      onPress={handleJoin}
                      disabled={busy || joinInput.trim().length < 4}
                      className="w-full items-center rounded-full bg-primary py-4 active:opacity-85"
                      style={{
                        opacity: busy || joinInput.trim().length < 4 ? 0.6 : 1,
                        shadowColor: "#8A4BE0",
                        shadowOffset: { width: 0, height: 5 },
                        shadowOpacity: 0.25,
                        shadowRadius: 10,
                        elevation: 4,
                      }}
                    >
                      <Text className="font-ui-bold text-[15px] text-white">
                        {busy ? "Joining..." : "Join"}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Logout */}
          <View className="px-[22px]">
            <Pressable
              onPress={handleLogout}
              className="mt-1 flex-row items-center justify-center gap-2 rounded-full bg-error-soft py-4 active:opacity-80"
            >
              <MaterialCommunityIcons name="logout" size={18} color="#DC2626" />
              <Text className="font-ui-bold text-[15px] text-red-500">
                Log Out
              </Text>
            </Pressable>
          </View>

          {/* Delete Account */}
          <View className="px-[22px]">
            <Pressable
              onPress={handleDeleteAccount}
              disabled={busy}
              className="mt-3 flex-row items-center justify-center gap-2 rounded-full border border-red-300 py-4 active:opacity-80"
              style={{ opacity: busy ? 0.6 : 1 }}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={18}
                color="#DC2626"
              />
              <Text className="font-ui-bold text-[15px] text-red-500">
                Delete Account
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
