import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import { BottomSheetModalWrapper } from "@/components/ui/bottom-sheet-modal";
import { useSocketStore } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const ICON_MAIL = require("@/assets/images/icons/mail.png");
const ICON_LOCK = require("@/assets/images/icons/lock.png");

type LoginBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
};

export function LoginBottomSheet({
  visible,
  onClose,
  onSwitchToSignup,
}: LoginBottomSheetProps) {
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
      if (user) {
        connect(user.id);
        onClose();
        router.replace("/(tabs)" as any);
      }
    } catch (e: any) {
      setError(e.message ?? "We couldn't sign you in. Try again.");
    }
  };

  return (
    <BottomSheetModalWrapper visible={visible} onClose={onClose}>
      <View className="px-6 pt-2 pb-4">
        <View className="items-center mb-5">
          <Image
            source={require("@/assets/images/login_header.png")}
            style={{ width: 110, height: 110 }}
            contentFit="contain"
          />
        </View>

        <Text className="text-center font-ui-bold text-2xl text-[#201A33] mb-1">
          Welcome back
        </Text>
        <Text className="text-center font-ui-medium text-sm text-[#7A748C] mb-5">
          Sign in to continue playing together
        </Text>

        <View className="gap-3">
          <AuthInput
            icon={ICON_MAIL}
            placeholder="Email address"
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
            icon={ICON_LOCK}
            placeholder="Password"
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

          <Pressable onPress={() => {}} className="self-end" hitSlop={8}>
            <Text className="font-ui-medium text-[13px] text-[#8A4BE0]">
              Forgot password?
            </Text>
          </Pressable>

          {error && (
            <View className="w-full rounded-2xl bg-[#FDEAEE] px-4 py-2.5">
              <Text className="font-ui-medium text-[13px] leading-[18px] text-[#DC2626]">
                {error}
              </Text>
            </View>
          )}

          <View className="mt-2">
            <AuthButton
              title="LOG IN"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleLogin}
              showArrow
            />
          </View>

          <Pressable
            onPress={() => {
              onClose();
              onSwitchToSignup?.();
            }}
            className="mt-2 flex-row items-center justify-center gap-1 py-1"
          >
            <Text className="font-ui-medium text-[14px] text-[#7A748C]">
              Don't have an account?
            </Text>
            <Text className="font-ui-semibold text-[14px] text-[#8A4BE0]">
              Sign up
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetModalWrapper>
  );
}
