import "../../global.css";

import { SplashOverlay } from "@/components/splash/splash-overlay";
import { useSocketStore } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_600SemiBold_Italic,
  NunitoSans_700Bold,
  NunitoSans_700Bold_Italic,
  NunitoSans_800ExtraBold,
} from "@expo-google-fonts/nunito-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const connect = useSocketStore((s) => s.connect);
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
    NunitoSans_800ExtraBold,
    NunitoSans_700Bold_Italic,
    NunitoSans_600SemiBold_Italic,
  });

  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (!fontsReady) return;
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 60);
    return () => clearTimeout(timer);
  }, [fontsReady]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connect(user.id);
    }
  }, [isAuthenticated, user?.id, connect]);

  const handleSplashFinish = useCallback(() => {
    SplashScreen.hideAsync();
    setSplashDone(true);
  }, []);

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <Stack screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="(tabs)" />
          ) : (
            <Stack.Screen name="(auth)" />
          )}
        </Stack>
        {!splashDone && <SplashOverlay onFinish={handleSplashFinish} />}
      </View>
    </GestureHandlerRootView>
  );
}
