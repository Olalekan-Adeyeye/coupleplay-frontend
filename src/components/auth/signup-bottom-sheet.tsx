import { AuthButton } from "@/components/auth/auth-button";
import { AuthInput } from "@/components/auth/auth-input";
import { BottomSheetModalWrapper } from "@/components/ui/bottom-sheet-modal";
import { useSocketStore } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const ICON_USER = require("@/assets/images/icons/user.png");
const ICON_MAIL = require("@/assets/images/icons/mail.png");
const ICON_LOCK = require("@/assets/images/icons/lock.png");
const HOME_GUY = require("@/assets/images/home_guy.png");
const HOME_GIRL = require("@/assets/images/home_girl.png");

type SignupBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
};

export function SignupBottomSheet({
  visible,
  onClose,
  onSwitchToLogin,
}: SignupBottomSheetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [error, setError] = useState<string | null>(null);
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const connect = useSocketStore((s) => s.connect);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !username.trim() || !password) {
      setError("Please fill in every field.");
      return;
    }
    if (password.length < 6) {
      setError("Your password needs at least 6 characters.");
      return;
    }
    setError(null);
    try {
      await register(
        email.trim(),
        username.trim(),
        name.trim(),
        password,
        gender,
      );
      const user = useAuthStore.getState().user;
      if (user) {
        connect(user.id);
        onClose();
        router.replace("/(tabs)" as any);
      }
    } catch (e: any) {
      setError(e.message ?? "We couldn't create your account. Try again.");
    }
  };

  return (
    <BottomSheetModalWrapper visible={visible} onClose={onClose}>
      <View className="px-6 pt-2 pb-4">
        <View className="items-center mb-4">
          <Image
            source={require("@/assets/images/register_header.png")}
            style={{ width: 110, height: 110 }}
            contentFit="contain"
          />
        </View>

        <Text className="text-center font-ui-bold text-2xl text-[#201A33] mb-1">
          Create Account
        </Text>
        <Text className="text-center font-ui-medium text-sm text-[#7A748C] mb-5">
          Let's set up your CouplePlay account
        </Text>

        <View className="gap-3">
          <AuthInput
            icon={ICON_USER}
            placeholder="Full name"
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
            icon={ICON_USER}
            placeholder="Username"
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setError(null);
            }}
            autoCapitalize="none"
            autoComplete="username"
            returnKeyType="next"
          />

          <View className="flex-row gap-3">
            <GenderOption
              label="Male"
              image={HOME_GUY}
              selected={gender === "male"}
              onPress={() => {
                setGender("male");
                setError(null);
              }}
            />
            <GenderOption
              label="Female"
              image={HOME_GIRL}
              selected={gender === "female"}
              onPress={() => {
                setGender("female");
                setError(null);
              }}
            />
          </View>

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
            autoComplete="new-password"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />

          {error && (
            <View className="w-full rounded-2xl bg-[#FDEAEE] px-4 py-2.5">
              <Text className="font-ui-medium text-[13px] leading-[18px] text-[#DC2626]">
                {error}
              </Text>
            </View>
          )}

          <View className="mt-2">
            <AuthButton
              title="CREATE ACCOUNT"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleRegister}
              showArrow
            />
          </View>

          <Pressable
            onPress={() => {
              onClose();
              onSwitchToLogin?.();
            }}
            className="mt-2 flex-row items-center justify-center gap-1 py-1"
          >
            <Text className="font-ui-medium text-[14px] text-[#7A748C]">
              Already have an account?
            </Text>
            <Text className="font-ui-semibold text-[14px] text-[#8A4BE0]">
              Log In
            </Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetModalWrapper>
  );
}

function GenderOption({
  label,
  image,
  selected,
  onPress,
}: {
  label: string;
  image: any;
  selected: boolean;
  onPress: () => void;
}) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, { duration: 300 });
  }, [selected]);

  const containerStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(progress.value ? "#F3EEFF" : "#F5F5F5", {
      duration: 300,
    }),
    borderColor: withTiming(progress.value ? "#8A4BE0" : "#E0E0E0", {
      duration: 300,
    }),
  }));

  const imageBgStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(progress.value ? "#8A4BE0" : "#EBEBEB", {
      duration: 300,
    }),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: withTiming(progress.value ? "#8A4BE0" : "#7A748C", {
      duration: 300,
    }),
  }));

  return (
    <Pressable onPress={onPress} className="flex-1" hitSlop={4}>
      <Animated.View
        style={containerStyle}
        className="flex-row items-center rounded-full border-[1.5px] py-2 px-2 gap-3 justify-center"
      >
        <Animated.View style={imageBgStyle} className="rounded-full p-1.5">
          <Image
            source={image}
            style={{ width: 28, height: 28 }}
            contentFit="contain"
          />
        </Animated.View>
        <Animated.Text
          style={textStyle}
          className="font-ui-semibold text-[15px]"
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
