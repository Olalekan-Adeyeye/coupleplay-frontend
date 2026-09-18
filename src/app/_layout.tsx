import "../../global.css";

import { SplashOverlay } from "@/components/splash/splash-overlay";
import { ThemeProvider } from "@/components/ThemeProvider";
import { usePaperColor } from "@/hooks/useResolvedTheme";
import { useSocketStore } from "@/hooks/useSocket";
import { useAuthStore } from "@/stores/authStore";
import {
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_600SemiBold_Italic,
  Urbanist_700Bold,
  Urbanist_700Bold_Italic,
  Urbanist_800ExtraBold,
} from "@expo-google-fonts/urbanist";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { api } from "@/lib/api";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const connect = useSocketStore((s) => s.connect);
  const [splashDone, setSplashDone] = useState(false);
  const [rehydrated, setRehydrated] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
    Urbanist_800ExtraBold,
    Urbanist_700Bold_Italic,
    Urbanist_600SemiBold_Italic,
  });

  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setRehydrated(true);
    });
    useAuthStore.persist.rehydrate();
    return unsub;
  }, []);

  useEffect(() => {
    if (!rehydrated) return;
    const { token, isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated && token) {
      api.auth.getProfile(token).catch(() => {
        useAuthStore.getState().logout();
      });
    }
  }, [rehydrated]);

  useEffect(() => {
    if (!fontsReady) return;
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 60);
    return () => clearTimeout(timer);
  }, [fontsReady]);

  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (isAuthenticated && token) {
      connect(token);
    }
  }, [isAuthenticated, token, connect]);

  const handleSplashFinish = useCallback(() => {
    SplashScreen.hideAsync();
    setSplashDone(true);
  }, []);

  const paper = usePaperColor();

  if (!fontsReady || !rehydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: paper }}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: paper } }}>
          {isAuthenticated ? (
            <Stack.Screen name="(tabs)" />
          ) : (
            <Stack.Screen name="(auth)" />
          )}
        </Stack>
        {!splashDone && <SplashOverlay onFinish={handleSplashFinish} />}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
