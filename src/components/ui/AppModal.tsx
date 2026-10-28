import { useEffect, type ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Modal as RNModal } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

type AppModalProps = {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
  /** Dismiss on backdrop press. Default true. */
  dismissible?: boolean;
};

/**
 * Thin wrapper around React Native Modal that adds:
 *  - Semi-transparent backdrop (press to dismiss)
 *  - Slide-up card animation via Reanimated
 *  - Theme-aware surface background
 */
export function AppModal({
  visible,
  onClose,
  children,
  dismissible = true,
}: AppModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissible ? onClose : undefined}
    >
      {visible && <Backdrop onPress={dismissible ? onClose : undefined} />}
      <Animated.View
        entering={SlideInDown.springify().damping(28).stiffness(260)}
        exiting={SlideOutDown.duration(200)}
        className="absolute inset-0 items-center justify-center px-4"
        style={{ maxHeight: "85%" }}
        pointerEvents={visible ? "auto" : "none"}
      >
        <View className="w-full max-w-[340px] overflow-hidden rounded-3xl border border-hairline bg-surface">
          {children}
        </View>
      </Animated.View>
    </RNModal>
  );
}

function Backdrop({ onPress }: { onPress?: () => void }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(220)}
      exiting={FadeOut.duration(180)}
      style={[{ flex: 1 }, style]}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }}
        onPress={onPress}
      />
    </Animated.View>
  );
}
