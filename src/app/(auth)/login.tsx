import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import { AuthError, AuthScreen, AuthSwitch } from "@/components/auth/auth-screen";
import { PeepScene } from "@/components/peeps/PeepScene";
import { useSocketStore } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const ICON_MAIL = require("@/assets/images/icons/mail.png");
const ICON_LOCK = require("@/assets/images/icons/lock.png");

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const connect = useSocketStore((s) => s.connect);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in your email and password.");
      return;
    }
    setError(null);
    try {
      await login(email.trim(), password);
      const user = useAuthStore.getState().user;
      const tok = useAuthStore.getState().token;
      if (user && tok) {
        connect(tok);
        router.replace("/(tabs)" as any);
      }
    } catch (e: any) {
      setError(e.message ?? "We couldn't sign you in. Try again.");
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <AuthScreen
        eyebrow="WELCOME BACK"
        title="Log in to play together"
        subtitle="Your table, your rival, your story — right where you left it."
        onBack={() => router.replace("/(auth)" as any)}
        footer={
          <View>
            <AuthButton
              title="LOG IN"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleLogin}
              showArrow
            />
            <AuthSwitch
              prompt="Don't have an account?"
              action="Create one"
              onPress={() => router.replace("/(auth)/signup" as any)}
            />
          </View>
        }
      >
        <View className="items-start">
          <PeepScene layout="duo" size={64} />
        </View>
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
          returnKeyType="next"
        />
        <AuthInput
          label="Password"
          icon={ICON_LOCK}
          placeholder="Your password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            setError(null);
          }}
          secureTextEntry
          secureToggle
          autoCapitalize="none"
          autoComplete="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <Pressable
          onPress={() => router.push("/(auth)/forgot" as any)}
          className="self-end"
          hitSlop={8}
        >
          <Text className="font-ui-semibold text-[13px] text-primary">
            Forgot password?
          </Text>
        </Pressable>
        <AuthError message={error} />
      </AuthScreen>
    </View>
  );
}
