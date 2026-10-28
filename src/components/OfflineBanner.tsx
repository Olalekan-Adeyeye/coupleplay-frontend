import { NetInfoState, addEventListener, fetch } from "@react-native-community/netinfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

/**
 * Floating notice while the device is offline. Sockets and API calls fail
 * silently otherwise, so the user still gets feedback.
 */
export function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let mounted = true;
    void fetch().then((state: NetInfoState) => {
      if (mounted) setOffline(state.isConnected === false);
    });
    const unsub = addEventListener((state) => {
      setOffline(state.isConnected === false);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  if (!offline) return null;

  return (
    <View
      className="absolute inset-x-0 z-50 bg-neutral-900/95 px-4 pb-3 pt-2"
      style={{ top: insets.top }}
    >
      <Text className="text-center font-ui-medium text-body-sm leading-[18px] text-white">
        No internet connection — reconnecting as soon as you're back online.
      </Text>
    </View>
  );
}
