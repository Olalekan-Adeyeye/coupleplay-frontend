import { AuthButton } from "@/components/auth/auth-button";
import { LoginBottomSheet } from "@/components/auth/login-bottom-sheet";
import { SignupBottomSheet } from "@/components/auth/signup-bottom-sheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);

  const openLogin = useCallback(() => {
    setLoginVisible(true);
  }, []);

  const openSignup = useCallback(() => {
    setSignupVisible(true);
  }, []);

  return (
    <View className="flex-1 overflow-hidden bg-[#C9B4F4]">
      <StatusBar style="dark" />

      <View className="absolute inset-0 bg-[#C9B4F4]" />

      <View
        className="absolute -right-[130px] -top-[170px] h-[430px] w-[430px] rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.28)" }}
      />
      <View
        className="absolute -left-[180px] top-[180px] h-[380px] w-[380px] rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
      />
      <View
        className="absolute -bottom-[200px] -right-[100px] h-[450px] w-[450px] rounded-full"
        style={{ backgroundColor: "rgba(91,55,151,0.16)" }}
      />

      <Text
        className="absolute left-[28px] top-[125px] text-[20px]"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        ✦
      </Text>
      <Text
        className="absolute right-[32px] top-[105px] text-[13px]"
        style={{ color: "rgba(255,255,255,0.7)" }}
      >
        ✦
      </Text>
      <Text
        className="absolute left-[45px] top-[430px] text-[11px]"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        ✦
      </Text>
      <Text
        className="absolute right-[27px] top-[320px] text-[20px]"
        style={{
          color: "rgba(255,255,255,0.5)",
          transform: [{ rotate: "12deg" }],
        }}
      >
        ♡
      </Text>
      <View
        className="absolute left-[34px] top-[245px] h-2 w-2 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
      />
      <View
        className="absolute right-[52px] top-[400px] h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
      />

      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="flex-1 px-6 justify-between">
          <View className="mt-32 items-center justify-center">
            <Image
              source={require("@/assets/images/splash/splash-logo.png")}
              style={{ width: 280, height: 180 }}
              contentFit="contain"
            />
            <View className="mt-3 flex-row items-center gap-1">
              <Text className="font-ui-semibold text-black/60">
                Play together.
              </Text>
              <Image
                source={require("@/assets/images/icons/red_heart_no_bg.png")}
                style={{ width: 25, height: 25 }}
                contentFit="contain"
                tintColor={"purple"}
              />
              <Text className="font-ui-semibold text-black/60">
                Grow closer.
              </Text>
            </View>
          </View>

          <View className="mb-8 gap-3">
            <AuthButton
              title="LOG IN"
              onPress={openLogin}
              icon="account"
              showArrow
            />
            <AuthButton
              title="CREATE NEW ACCOUNT"
              variant="white"
              onPress={openSignup}
              textColor="#8A4BE0"
              icon="account-plus"
              showArrow
            />

            <View className="flex-row items-center gap-3 mt-4 justify-center">
              <View className="h-px bg-gray-300 w-[120px]" />
              <Text className="font-ui-medium text-[13px] text-white">or</Text>
              <View className="h-px bg-gray-300 w-[120px]" />
            </View>

            <Pressable
              onPress={() => {}}
              className="flex-row items-center justify-center gap-2 py-3"
            >
              <MaterialCommunityIcons
                name="gamepad"
                size={20}
                color="#8A4BE0"
              />
              <Text className="font-ui-semibold text-[14px] text-[#8A4BE0]">
                Continue as guest
              </Text>
            </Pressable>

            <View className="mt-16 flex-row items-center justify-center">
              <Text className="text-[10px] text-gray-600 font-ui-medium">
                TWO PLAYERS
              </Text>
              <Text
                className="mx-2 text-[10px]"
                style={{ color: "rgba(70,50,90,0.3)" }}
              >
                •
              </Text>
              <Text className="text-[10px] text-gray-600 font-ui-medium">
                ONE CONNECTION
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <LoginBottomSheet
        visible={loginVisible}
        onClose={() => setLoginVisible(false)}
        onSwitchToSignup={openSignup}
      />

      <SignupBottomSheet
        visible={signupVisible}
        onClose={() => setSignupVisible(false)}
        onSwitchToLogin={openLogin}
      />
    </View>
  );
}
