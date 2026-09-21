import { PeepAvatar } from "@/components/peeps/PeepAvatar";
import { CoupleAvatars } from "@/components/ui/couple-avatars";
import { ConfirmModal, InfoModal } from "@/components/ui/ConfirmModal";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { useInviteAction } from "@/hooks/useInviteAction";
import { useSocketStore } from "@/hooks/useSocket";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useThemeStore, type ThemePreference } from "@/stores/themeStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="font-ui-bold text-[11px] tracking-[1.5px] text-ink-tertiary">
      {children}
    </Text>
  );
}

function Row({
  icon,
  iconTint,
  iconColor,
  title,
  subtitle,
  onPress,
  danger,
  right,
}: {
  icon: string;
  iconTint: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5 active:opacity-80"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconTint }}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={iconColor}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`font-ui-semibold text-[14.5px] ${danger ? "text-error-bright" : "text-ink"}`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="mt-0.5 font-ui-medium text-[12.5px] text-ink-secondary">
            {subtitle}
          </Text>
        )}
      </View>
      {right ?? (onPress && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={19}
          color="#A79DBE"
        />
      ))}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);
  const fetchCouple = useCoupleStore((s) => s.fetchCouple);
  const unlink = useCoupleStore((s) => s.unlink);
  const disconnect = useSocketStore((s) => s.disconnect);
  const socket = useSocketStore((s) => s.socket);
  const invite = useInviteAction();
  const [tab, setTab] = useState<"invite" | "enter">("invite");
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const themePreference = useThemeStore((s) => s.preference);
  const setThemePreference = useThemeStore((s) => s.setPreference);
  const unlinkConfirm = useConfirmModal();
  const deleteConfirm = useConfirmModal();
  const errorModal = useConfirmModal();

  useEffect(() => {
    if (token) fetchCouple(token).catch(() => {});
  }, [token, fetchCouple]);

  // Realtime unlink: partner removed us — clear couple immediately
  useEffect(() => {
    if (!socket) return;
    const onUnlinked = () => {
      fetchCouple(token!).catch(() => {});
    };
    socket.on("couple:unlinked", onUnlinked);
    return () => {
      socket.off("couple:unlinked", onUnlinked);
    };
  }, [socket, token, fetchCouple]);

  // Realtime link: partner just linked — update couple immediately
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

  const hasPartner = couple?.userBId != null;
  const isUserA = couple?.userAId === user?.id;
  const partner = hasPartner
    ? isUserA
      ? couple?.userB
      : couple?.userA
    : null;

  const handleJoin = async () => {
    setJoinError(null);
    setBusy(true);
    try {
      await invite.join(joinInput);
      await fetchCouple(token!);
      setJoinInput("");
      router.replace("/(tabs)/us" as any);
    } catch (e: any) {
      setJoinError(e.message ?? "Could not join. Check the code.");
    } finally {
      setBusy(false);
    }
  };

  const handleUnlink = () => {
    unlinkConfirm.confirm({
      title: "Unlink partner?",
      message: "You'll keep your account and stats, but your shared story ends here.",
      confirmLabel: "Unlink",
      variant: "danger",
      onConfirm: async () => {
        try {
          await unlink(token!);
          socket?.emit("couples:unlink");
        } catch (e: any) {
          errorModal.confirm({
            title: "Error",
            message: e.message,
            confirmLabel: "OK",
            variant: "error",
            onConfirm: () => {},
          });
        }
      },
    });
  };

  const handleLogout = () => {
    disconnect();
    useAuthStore.getState().logout();
    router.replace("/(auth)/login");
  };

  const handleDeleteAccount = () => {
    deleteConfirm.confirm({
      title: "Delete account?",
      message: "This permanently removes your account and stats. There's no undo.",
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          socket?.emit("couples:unlink");
          await new Promise((r) => setTimeout(r, 300));
          await api.users.deleteAccount(token!);
          disconnect();
          useAuthStore.getState().logout();
          router.replace("/(auth)");
        } catch (e: any) {
          errorModal.confirm({
            title: "Error",
            message: e.message,
            confirmLabel: "OK",
            variant: "error",
            onConfirm: () => {},
          });
        }
      },
    });
  };

  return (
    <View className="flex-1 bg-paper">
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="w-full max-w-[460px] self-center gap-6 px-[22px] pt-[14px] pb-[40px]">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Back"
                className="h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface active:opacity-70"
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={26}
                  color="#F4F1FA"
                />
              </Pressable>
              <Text className="font-display-bold text-[22px] text-ink">
                Settings
              </Text>
              <View className="h-11 w-11" />
            </View>

            <View className="gap-2.5">
              <SectionLabel>YOU</SectionLabel>
              <View className="flex-row items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5">
                <PeepAvatar
                  peep={user?.avatar}
                  seed={user?.id}
                  name={user?.name ?? undefined}
                  size={52}
                />
                <View className="flex-1">
                  <Text className="font-display-bold text-[16px] text-ink">
                    {user?.name ?? "Player"}
                  </Text>
                  <Text className="font-ui-medium text-[12.5px] text-ink-secondary">
                    @{user?.username ?? "—"}
                  </Text>
                </View>
              </View>
              <Row
                icon="account-edit-outline"
                iconTint="#EFEAFF"
                iconColor="#946BFF"
                title="Change your Peep"
                subtitle="Your avatar everywhere"
                onPress={() => router.push("/change-peep" as any)}
              />
            </View>

            <View className="gap-2.5">
              <SectionLabel>
                {hasPartner ? "YOUR PARTNER" : "LINK YOUR PARTNER"}
              </SectionLabel>
              {hasPartner ? (
                <>
                  <View className="items-center rounded-2xl border border-hairline bg-surface px-6 py-6">
                    <CoupleAvatars
                      hasPartner
                      myPeep={user?.avatar}
                      theirPeep={partner?.avatar}
                      myName={user?.name ?? undefined}
                      theirName={partner?.name ?? undefined}
                    />
                    <Text className="mt-3 font-ui-semibold text-[14px] text-ink">
                      {user?.name?.split(" ")[0]} &{" "}
                      {partner?.name?.split(" ")[0]}
                    </Text>
                    <Text className="mt-0.5 font-ui-medium text-[12.5px] text-ink-secondary">
                      Together since{" "}
                      {couple?.createdAt
                        ? new Date(couple.createdAt).toLocaleDateString()
                        : "—"}
                    </Text>
                  </View>
                  <Row
                    icon="link-variant-off"
                    iconTint="#FDEAEE"
                    iconColor="#DC2626"
                    title="Unlink partner"
                    subtitle="Keep your account and stats"
                    onPress={handleUnlink}
                  />
                </>
              ) : (
                <>
                  <View className="flex-row rounded-xl border border-hairline bg-surface p-1">
                    {(["invite", "enter"] as const).map((t) => (
                      <Pressable
                        key={t}
                        onPress={() => setTab(t)}
                        className="flex-1 rounded-lg py-2.5 active:opacity-80"
                        style={{
                          backgroundColor:
                            tab === t ? "#946BFF" : "transparent",
                        }}
                      >
                        <Text
                          className="text-center font-ui-semibold text-[13.5px]"
                          style={{
                            color: tab === t ? "#FFFFFF" : "#B3A8C9",
                          }}
                        >
                          {t === "invite" ? "Share code" : "Enter code"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>

                  {tab === "invite" ? (
                    <View className="items-center gap-3 rounded-2xl border border-hairline bg-surface p-5">
                      <Text className="font-ui-bold text-[11px] tracking-[1.5px] text-ink-tertiary">
                        YOUR INVITE CODE
                      </Text>
                      <Text className="font-display-bold text-[34px] tracking-[4px] text-primary">
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
                    <View className="gap-3 rounded-2xl border border-hairline bg-surface p-5">
                      <TextInput
                        value={joinInput}
                        onChangeText={(t) => {
                          setJoinInput(t);
                          setJoinError(null);
                        }}
                        placeholder="ENTER CODE"
                        placeholderTextColor="#A79DBE"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={8}
                        className="w-full rounded-xl border border-hairline bg-paper px-4 py-3.5 text-center font-ui-bold text-[17px] tracking-[3px] text-ink"
                      />
                      {joinError && (
                        <Text className="text-center font-ui-medium text-[12.5px] text-error-bright">
                          {joinError}
                        </Text>
                      )}
                      <Pressable
                        onPress={handleJoin}
                        disabled={busy || joinInput.trim().length < 4}
                        className="items-center rounded-xl bg-primary py-3.5 active:opacity-85"
                        style={{
                          opacity:
                            busy || joinInput.trim().length < 4 ? 0.5 : 1,
                        }}
                      >
                        <Text className="font-ui-bold text-[14.5px] text-white">
                          {busy ? "Linking…" : "Link up"}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </>
              )}
            </View>

            <View className="gap-2.5">
              <SectionLabel>APPEARANCE</SectionLabel>
              {(["system", "dark", "light"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setThemePreference(t)}
                  className="flex-row items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3.5 active:opacity-80"
                >
                  <MaterialCommunityIcons
                    name={
                      t === "system"
                        ? "cellphone"
                        : t === "dark"
                          ? "moon-waning-crescent"
                          : "white-balance-sunny"
                    }
                    size={20}
                    color={themePreference === t ? "#946BFF" : "#B3A8C9"}
                  />
                  <Text
                    className="flex-1 font-ui-semibold text-[14.5px] capitalize"
                    style={{ color: themePreference === t ? "#F4F1FA" : "#B3A8C9" }}
                  >
                    {t === "system" ? "System default" : t === "dark" ? "Dark" : "Light"}
                  </Text>
                  <View
                    className="h-5 w-5 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: themePreference === t ? "#946BFF" : "#7E7396",
                    }}
                  >
                    {themePreference === t && (
                      <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                  </View>
                </Pressable>
              ))}
            </View>

            <View className="gap-2.5">
              <SectionLabel>ACCOUNT</SectionLabel>
              <Row
                icon="logout"
                iconTint="#F4F1EC"
                iconColor="#000000"
                title="Log out"
                onPress={handleLogout}
              />
              <Row
                icon="delete-outline"
                iconTint="transparent"
                iconColor="#F87171"
                title="Delete account"
                subtitle="Permanent — no undo"
                onPress={handleDeleteAccount}
                danger
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <ConfirmModal {...unlinkConfirm.props} onCancel={unlinkConfirm.cancel} />
      <ConfirmModal {...deleteConfirm.props} onCancel={deleteConfirm.cancel} />
      <ConfirmModal {...errorModal.props} onCancel={errorModal.cancel} />
    </View>
  );
}
