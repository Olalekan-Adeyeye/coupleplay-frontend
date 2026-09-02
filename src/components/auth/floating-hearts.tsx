import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const HEART_IMG = require("@/assets/images/icons/purple_heart.png");
const HEART_OUTLINE_IMG = require("@/assets/images/icons/heart.png");

type Heart = {
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  rotation: number;
  drift: number;
  duration: number;
  delay: number;
  opacity: number;
  outline?: boolean;
};

const HEARTS: Heart[] = [
  {
    left: "10%",
    top: "53%",
    size: 20,
    rotation: -14,
    drift: 14,
    duration: 3200,
    delay: 0,
    opacity: 0.5,
  },
  {
    left: "78%",
    top: "30%",
    size: 30,
    rotation: 18,
    drift: 18,
    duration: 3600,
    delay: 500,
    opacity: 0.9,
  },
  {
    left: "15%",
    top: "44%",
    size: 25,
    rotation: 22,
    drift: 16,
    duration: 3400,
    delay: 1200,
    opacity: 0.55,
  },
  {
    left: "80%",
    top: "48%",
    size: 40,
    rotation: -10,
    drift: 12,
    duration: 3000,
    delay: 1800,
    opacity: 0.75,
    outline: true,
  },
  {
    left: "12%",
    top: "48%",
    size: 18,
    rotation: 12,
    drift: 12,
    duration: 2800,
    delay: 900,
    opacity: 0.7,
    outline: true,
  },
  {
    left: "75%",
    top: "53%",
    size: 24,
    rotation: -18,
    drift: 14,
    duration: 3300,
    delay: 2200,
    opacity: 0.85,
  },
  {
    left: "75%",
    top: "37%",
    size: 28,
    rotation: 8,
    drift: 10,
    duration: 3000,
    delay: 700,
    opacity: 0.65,
  },
  {
    left: "86%",
    top: "43%",
    size: 18,
    rotation: 8,
    drift: 10,
    duration: 3000,
    delay: 700,
    opacity: 0.65,
    outline: true,
  },
];

function DriftingHeart({ heart }: { heart: Heart }) {
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(0);
  const rotate = useSharedValue(heart.rotation);
  const opacity = useSharedValue(reduceMotion ? heart.opacity : 0);

  useEffect(() => {
    if (reduceMotion) return;
    y.value = withDelay(
      heart.delay,
      withRepeat(
        withTiming(-heart.drift, {
          duration: heart.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
    rotate.value = withDelay(
      heart.delay,
      withRepeat(
        withTiming(-heart.rotation, {
          duration: heart.duration * 1.6,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      heart.delay,
      withSequence(
        withTiming(heart.opacity, {
          duration: 500,
          easing: Easing.out(Easing.quad),
        }),
      ),
    );
  }, [reduceMotion, heart, y, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rotate.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.heart,
        {
          left: heart.left,
          top: heart.top,
          width: heart.size,
          height: heart.size,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <Image
        source={heart.outline ? HEART_OUTLINE_IMG : HEART_IMG}
        style={styles.heartImg}
        contentFit="contain"
        tintColor={heart.outline ? "#B8A8F5" : undefined}
      />
    </Animated.View>
  );
}

export function FloatingHearts() {
  return (
    <View style={styles.container} pointerEvents="none">
      {HEARTS.map((heart, i) => (
        <DriftingHeart key={i} heart={heart} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    zIndex: 99999,
  },
  heart: {
    position: "absolute",
  },
  heartImg: {
    width: "100%",
    height: "100%",
  },
});
