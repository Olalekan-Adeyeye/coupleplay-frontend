import { PeepPicker } from "@/components/peeps/PeepPicker";
import type { PeepId } from "@/components/peeps/peeps";
import { useAuthStore } from "@/stores/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Update your Peep. Persists via PATCH /users/me. */
export default function ChangePeepScreen() {
  const user = useAuthStore((s) => s.user);
  const updateAvatar = useAuthStore((s) => s.updateAvatar);
  const [peep, setPeep] = useState<PeepId | null>(
    (user?.avatar as PeepId | null) ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!peep) {
      setError("Pick a Peep first.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateAvatar(peep);
      setSaved(true);
      setTimeout(() => router.back(), 600);
    } catch (e: any) {
      setError(e.message ?? "Could not save your Peep. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="flex-row items-center px-5 pt-2">
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="h-11 w-11 items-center justify-center rounded-full border border-hairline bg-surface active:opacity-70"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={24}
              color="#F4F1FA"
            />
          </Pressable>
        </View>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mt-6 font-ui-bold text-[11px] tracking-[1.5px] text-primary">
            YOUR LOOK
          </Text>
          <Text className="mt-2 font-display-bold text-[30px] leading-[36px] text-ink">
            Change your Peep
          </Text>
          <Text className="mt-2 font-ui-medium text-[15px] leading-[22px] text-ink-secondary">
            This is how you show up on every table, lobby and leaderboard.
          </Text>
          <View className="mt-7">
            <PeepPicker
              value={peep}
              onChange={(id) => {
                setPeep(id);
                setError(null);
                setSaved(false);
              }}
              cellSize={80}
            />
          </View>
          {error && (
            <Text className="mt-4 font-ui-medium text-[13px] text-error-bright">
              {error}
            </Text>
          )}
          <View className="flex-1" />
        </ScrollView>
        <View className="border-t border-hairline bg-paper px-6 pb-2 pt-4">
          <Pressable
            onPress={handleSave}
            disabled={saving || !peep}
            className="items-center rounded-2xl bg-primary py-4 active:opacity-85"
            style={{ opacity: saving || !peep ? 0.6 : 1 }}
          >
            <Text className="font-ui-bold text-[15px] text-white">
              {saving ? "Saving…" : saved ? "Saved!" : "SAVE PEEP"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
