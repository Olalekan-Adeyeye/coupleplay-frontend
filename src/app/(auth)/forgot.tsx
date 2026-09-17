import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthError, AuthScreen, AuthSwitch } from "@/components/auth/auth-screen";
import { PeepScene } from "@/components/peeps/PeepScene";
import { api } from "@/lib/api";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, View } from "react-native";

const ICON_MAIL = require("@/assets/images/icons/mail.png");

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter the email address you signed up with.");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await api.auth.requestPasswordReset(trimmed);
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />
      <AuthScreen
        eyebrow="RESET PASSWORD"
        title={sent ? "Check your inbox" : "Forgot your password?"}
        subtitle={
          sent
            ? `If ${email.trim()} has a CouplePlay account, a reset link is on its way.`
            : "Enter your account email and we'll send you a reset link."
        }
        onBack={() => router.back()}
        footer={
          sent ? (
            <View>
              <AuthButton
                title="BACK TO LOG IN"
                onPress={() => router.replace("/(auth)/login" as any)}
                showArrow
              />
            </View>
          ) : (
            <View>
              <AuthButton
                title="SEND RESET LINK"
                loading={sending}
                disabled={sending}
                onPress={handleSend}
                showArrow
              />
              <AuthSwitch
                prompt="Remembered it?"
                action="Log in"
                onPress={() => router.replace("/(auth)/login" as any)}
              />
            </View>
          )
        }
      >
        <View className="items-start">
          <PeepScene layout="single" size={72} />
        </View>
        {sent ? (
          <View className="rounded-xl border border-hairline bg-surface px-4 py-3.5">
            <Text className="font-ui-medium text-[13.5px] leading-[19px] text-ink-secondary">
              Nothing arrived? Check spam, wait a minute, then try again — the
              link expires after an hour.
            </Text>
          </View>
        ) : (
          <>
            <AuthInput
              label="Email address"
              icon={ICON_MAIL}
              placeholder="you@example.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="done"
              onSubmitEditing={handleSend}
            />
            <AuthError message={error} />
          </>
        )}
      </AuthScreen>
    </View>
  );
}
