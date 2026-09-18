import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import {
  AuthError,
  AuthScreen,
  AuthSwitch,
} from "@/components/auth/auth-screen";
import { PeepPicker } from "@/components/peeps/PeepPicker";
import type { PeepId } from "@/components/peeps/peeps";
import { useSocketStore } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, View } from "react-native";

const ICON_USER = require("@/assets/images/icons/user.png");
const ICON_MAIL = require("@/assets/images/icons/mail.png");
const ICON_LOCK = require("@/assets/images/icons/lock.png");

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [peep, setPeep] = useState<PeepId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const connect = useSocketStore((s) => s.connect);

  const handleContinue = () => {
    if (!name.trim() || !email.trim() || !username.trim() || !password) {
      setError("Please fill in every field to continue.");
      return;
    }
    if (password.length < 6) {
      setError("Your password needs at least 6 characters.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleRegister = async () => {
    if (!peep) {
      setError("Pick your Peep avatar to finish.");
      return;
    }
    setError(null);
    try {
      await register(
        email.trim(),
        username.trim(),
        name.trim(),
        password,
        peep,
      );
      const user = useAuthStore.getState().user;
      const tok = useAuthStore.getState().token;
      if (user && tok) {
        connect(tok);
        // New accounts never have a partner yet — link up first.
        router.replace("/setup" as any);
      }
    } catch (e: any) {
      setError(e.message ?? "We couldn't create your account. Try again.");
    }
  };

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />
      <AuthScreen
        eyebrow={step === 1 ? "CREATE ACCOUNT" : "CHOOSE YOUR PEEP"}
        title={step === 1 ? "Set up your account" : "Which one is you?"}
        subtitle={
          step === 1
            ? "Thirty seconds now, game night forever."
            : "Ten fixed Peeps. Pick the one that feels like you — it sets your look everywhere."
        }
        step={{ current: step, total: 2 }}
        onBack={() =>
          step === 2 ? setStep(1) : router.replace("/(auth)" as any)
        }
        footer={
          <View>
            {step === 1 ? (
              <AuthButton title="CONTINUE" onPress={handleContinue} showArrow />
            ) : (
              <AuthButton
                title="CREATE ACCOUNT"
                loading={isLoading}
                disabled={isLoading}
                onPress={handleRegister}
                showArrow
              />
            )}
            <AuthSwitch
              prompt="Already have an account?"
              action="Log in"
              onPress={() => router.replace("/(auth)/login" as any)}
            />
          </View>
        }
      >
        {step === 1 ? (
          <>
            <AuthInput
              label="Full name"
              icon={ICON_USER}
              placeholder="Adaeze Obi"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
            />
            <AuthInput
              label="Username"
              icon={ICON_USER}
              placeholder="adaeze"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                setError(null);
              }}
              autoCapitalize="none"
              autoComplete="username"
              returnKeyType="next"
            />
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
              placeholder="6+ characters"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              secureTextEntry
              secureToggle
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </>
        ) : (
          <PeepPicker
            value={peep}
            onChange={(id) => {
              setPeep(id);
              setError(null);
            }}
            cellSize={80}
          />
        )}
        <AuthError message={error} />
        {step === 2 && (
          <Text className="font-ui-medium text-[12px] leading-[17px] text-ink-tertiary">
            Five male Peeps, five female Peeps — your pick is your look on every
            table, lobby and scoreboard.
          </Text>
        )}
      </AuthScreen>
    </View>
  );
}
