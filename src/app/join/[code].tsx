import { AuthButton } from "@/components/auth/auth-button";
import { AuthError } from "@/components/auth/auth-screen";
import { PeepScene } from "@/components/peeps/PeepScene";
import { useInviteAction } from "@/hooks/useInviteAction";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

/**
 * Deep-link landing: coupleplay://join/CODE.
 * Joins immediately once signed in; otherwise asks for login first and
 * resumes the join as soon as a session exists.
 */
export default function JoinPage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const token = useAuthStore((s) => s.token);
  const join = useInviteAction().join;
  const fetchCouple = useCoupleStore((s) => s.fetchCouple);
  const [status, setStatus] = useState<"joining" | "error">("joining");
  const [error, setError] = useState<string | null>(null);
  const attemptedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token || !code || status !== "joining") return;
    if (attemptedForToken.current === token) return;
    attemptedForToken.current = token;

    void (async () => {
      try {
        await join(code);
        await fetchCouple(token);
        router.replace("/(tabs)/us" as any);
      } catch (e: any) {
        setError(e?.message ?? "Could not join with this code.");
        setStatus("error");
      }
    })();
  }, [token, code, status, join, fetchCouple]);

  const targetCode = (code ?? "").toUpperCase();

  return (
    <View className="flex-1 bg-paper">
      <View className="flex-1 items-center justify-center px-7">
        <PeepScene layout="single" size={96} />
        <Text className="mt-6 text-center font-display-bold text-title-lg leading-[32px] text-ink">
          Join with code{"\n"}
          <Text className="text-primary">{targetCode || "····"}</Text>
        </Text>
        <Text className="mt-2 text-center font-ui-medium text-body-lg leading-[22px] text-ink-secondary">
          {token
            ? status === "joining"
              ? "Linking you up…"
              : ""
            : "You need to be signed in first."}
        </Text>
        <View className="mt-8 w-full gap-2.5">
          {!token ? (
            <AuthButton
              title="LOG IN TO JOIN"
              onPress={() => router.push("/(auth)/login" as any)}
              showArrow
            />
          ) : status === "error" ? (
            <>
              <AuthError message={error} />
              <AuthButton
                title="GO TO THE APP"
                variant="ghost"
                onPress={() => router.replace("/(tabs)" as any)}
              />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}
