import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type BottomSheetModalWrapperProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: (string | number)[];
};

export function BottomSheetModalWrapper({
  visible,
  onClose,
  children,
}: BottomSheetModalWrapperProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(0);
  const isOpen = useRef(false);

  useEffect(() => {
    if (visible && !isOpen.current) {
      isOpen.current = true;
      sheetTranslateY.value = 0;
      translateY.value = withTiming(0, { duration: 320 });
      backdropOpacity.value = withTiming(1, { duration: 320 });
    } else if (!visible && isOpen.current) {
      isOpen.current = false;
      sheetTranslateY.value = 0;
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 280 });
      backdropOpacity.value = withTiming(0, { duration: 280 });
    }
  }, [visible]);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e: KeyboardEvent) => {
        sheetTranslateY.value = withTiming(-e.endCoordinates.height, {
          duration: Platform.OS === "ios" ? 0.25 : 0,
        });
      },
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        sheetTranslateY.value = withTiming(0, { duration: 0.25 });
      },
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + sheetTranslateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(backdropOpacity.value, [0, 1], [0, 0.4]),
  }));

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
            style={styles.closeButton}
            hitSlop={8}
          >
            <MaterialCommunityIcons name="close" size={20} color="#7A748C" />
          </Pressable>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F3FA",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});
