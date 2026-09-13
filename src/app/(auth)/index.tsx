import { AuthButton } from "@/components/auth/auth-button";
import { PeepScene } from "@/components/peeps/PeepScene";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";

const LOGO = require("@/assets/images/splash/splash-logo.png");

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="light" />

      {/* Depth — primary-tinted orbs. Flat, no mesh. */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -140,
          left: "50%",
          marginLeft: -260,
          width: 520,
          height: 520,
          borderRadius: 260,
          backgroundColor: "#946BFF",
          opacity: 0.09,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -120,
          right: -80,
          width: 380,
          height: 380,
          borderRadius: 190,
          backgroundColor: "#946BFF",
          opacity: 0.06,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 320,
          left: -90,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: "#946BFF",
          opacity: 0.03,
        }}
      />

      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <View className="flex-1 px-6">
          {/* Brand mark — your real logo, centered. No fabricated heart. */}
          <View className="items-center pt-3">
            <Image
              source={LOGO}
              style={{ width: 172, height: 68 }}
              contentFit="contain"
              contentPosition="center"
              priority="high"
              cachePolicy="memory-disk"
              accessibilityLabel="CouplePlay"
            />
          </View>

          {/* Hero — centered, generous air. */}
          <View className="flex-1 items-center justify-center px-1">
            <View
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.18,
                shadowRadius: 24,
                elevation: 8,
              }}
            >
              <PeepScene layout="duo" size={112} />
            </View>

            <Text
              style={{
                marginTop: 16,
                fontFamily: "NunitoSans_800ExtraBold",
                fontSize: 38,
                lineHeight: 40,
                letterSpacing: -1.1,
                color: "#F4F1FA",
                textAlign: "center",
              }}
            >
              Play together.{"\n"}Grow closer.
            </Text>

            <Text
              style={{
                marginTop: 12,
                maxWidth: 314,
                fontFamily: "NunitoSans_400Regular",
                fontSize: 15.5,
                lineHeight: 23,
                color: "#B3A8C9",
                textAlign: "center",
              }}
            >
              Quick versus games with the person who matters. Win the round,
              keep the streak, settle the rivalry.
            </Text>
          </View>

          {/* CTAs — primary solid + primary glass, Apple pill language. */}
          <View style={{ gap: 12, paddingBottom: 4 }}>
            <AuthButton
              title="LOG IN"
              onPress={() => router.push("/(auth)/login" as any)}
              showArrow
            />
            <AuthButton
              title="CREATE NEW ACCOUNT"
              variant="outline"
              onPress={() => router.push("/(auth)/signup" as any)}
              showArrow
            />
            <Text
              style={{
                marginTop: 2,
                fontFamily: "NunitoSans_500Medium",
                fontSize: 12,
                lineHeight: 16,
                color: "#7E7396",
                textAlign: "center",
              }}
            >
              By continuing you agree to our Terms · Privacy Policy
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
