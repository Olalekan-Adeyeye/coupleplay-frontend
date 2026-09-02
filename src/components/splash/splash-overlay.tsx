import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect } from "react";
import type { DimensionValue } from "react-native";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SPLASH_EMBLEM = require("@/assets/images/splash/splash-logo.png");

const LOGO_DELAY = 150;
const TITLE_DELAY = 400;
const TAGLINE_DELAY = 550;
const ICONS_DELAY = 600;
const HOLD_MS = 500;
const EXIT_MS = 600;

type FloatingIconSpec = {
  left: DimensionValue;
  top: DimensionValue;
  icon: string;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  drift: number;
};

const FLOAT_ICONS: FloatingIconSpec[] = [
  {
    left: "10%",
    top: "12%",
    icon: "gamepad-variant",
    size: 20,
    opacity: 0.15,
    duration: 3400,
    delay: 0,
    drift: 14,
  },
  {
    left: "82%",
    top: "8%",
    icon: "trophy",
    size: 18,
    opacity: 0.15,
    duration: 3800,
    delay: 500,
    drift: 12,
  },
  {
    left: "5%",
    top: "48%",
    icon: "star-four-points",
    size: 16,
    opacity: 0.12,
    duration: 3200,
    delay: 900,
    drift: 16,
  },
  {
    left: "88%",
    top: "42%",
    icon: "dice-5",
    size: 18,
    opacity: 0.15,
    duration: 3600,
    delay: 300,
    drift: 14,
  },
  {
    left: "72%",
    top: "70%",
    icon: "puzzle-heart",
    size: 16,
    opacity: 0.12,
    duration: 4000,
    delay: 1100,
    drift: 12,
  },
  {
    left: "15%",
    top: "76%",
    icon: "cards",
    size: 15,
    opacity: 0.12,
    duration: 3500,
    delay: 700,
    drift: 10,
  },
];

type GlowOrbSpec = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  size: number;
  color: string;
};

const GLOW_ORBS: GlowOrbSpec[] = [
  { top: -120, right: -100, size: 360, color: "rgba(138,75,224,0.3)" },
  { bottom: -140, left: -110, size: 380, color: "rgba(255,105,180,0.15)" },
];

type SplashOverlayProps = {
  onFinish: () => void;
};

function FloatingIcon({ spec }: { spec: FloatingIconSpec }) {
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(0);
  const opacity = useSharedValue(reduceMotion ? spec.opacity : 0);

  useEffect(() => {
    if (reduceMotion) return;
    y.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(-spec.drift, {
            duration: spec.duration / 2,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: spec.duration / 2,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      spec.delay,
      withTiming(spec.opacity, { duration: 400 }),
    );
  }, [reduceMotion, spec, y, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.floatingIcon,
        { left: spec.left, top: spec.top },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      <MaterialCommunityIcons
        name={spec.icon as any}
        size={spec.size}
        color="#FFFFFF"
      />
    </Animated.View>
  );
}

function GlowOrb({ orb }: { orb: GlowOrbSpec }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(reduceMotion ? 0.8 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withTiming(0.8, { duration: 600 });
    scale.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 2400,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [reduceMotion, scale, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const position: any = {};
  if (orb.top !== undefined) position.top = orb.top;
  if (orb.bottom !== undefined) position.bottom = orb.bottom;
  if (orb.left !== undefined) position.left = orb.left;
  if (orb.right !== undefined) position.right = orb.right;

  return (
    <Animated.View
      style={[
        styles.glowOrb,
        {
          width: orb.size,
          height: orb.size,
          borderRadius: orb.size / 2,
          backgroundColor: orb.color,
        },
        position,
        style,
      ]}
      pointerEvents="none"
    />
  );
}

export function SplashOverlay({ onFinish }: SplashOverlayProps) {
  const reduceMotion = useReducedMotion();

  const bgOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const logoY = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(12);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(10);

  useEffect(() => {
    if (reduceMotion) {
      bgOpacity.value = 1;
      logoScale.value = 1;
      logoOpacity.value = 1;
      glowScale.value = 1;
      titleOpacity.value = 1;
      titleY.value = 0;
      taglineOpacity.value = 1;
      taglineY.value = 0;
      const t = setTimeout(onFinish, 300);
      return () => clearTimeout(t);
    }

    bgOpacity.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });

    logoScale.value = withDelay(
      LOGO_DELAY,
      withSpring(1, { damping: 12, stiffness: 100, mass: 1 }),
    );
    logoOpacity.value = withDelay(LOGO_DELAY, withTiming(1, { duration: 200 }));

    glowScale.value = withDelay(
      LOGO_DELAY,
      withSpring(1, { damping: 14, stiffness: 80 }),
    );

    logoY.value = withDelay(
      LOGO_DELAY + 600,
      withRepeat(
        withSequence(
          withTiming(-4, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );

    titleOpacity.value = withDelay(
      TITLE_DELAY,
      withTiming(1, { duration: 300 }),
    );
    titleY.value = withDelay(
      TITLE_DELAY,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }),
    );

    taglineOpacity.value = withDelay(
      TAGLINE_DELAY,
      withTiming(1, { duration: 300 }),
    );
    taglineY.value = withDelay(
      TAGLINE_DELAY,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }),
    );

    const totalDuration = LOGO_DELAY + 600 + HOLD_MS;

    const exitTimer = setTimeout(() => {
      bgOpacity.value = withTiming(0, { duration: EXIT_MS });
      logoOpacity.value = withTiming(0, { duration: EXIT_MS * 0.6 });
      glowScale.value = withTiming(0.8, { duration: EXIT_MS * 0.6 });
      titleOpacity.value = withTiming(0, { duration: EXIT_MS * 0.6 });
      taglineOpacity.value = withTiming(0, { duration: EXIT_MS * 0.6 });
    }, totalDuration);

    const doneTimer = setTimeout(onFinish, totalDuration + EXIT_MS + 50);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, onFinish]);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: logoY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: logoOpacity.value * 0.2,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  return (
    <View style={styles.fill} pointerEvents="none">
      <Animated.View style={[styles.bgWrap, bgStyle]}>
        <View style={styles.bgBase} />
        {GLOW_ORBS.map((orb, i) => (
          <GlowOrb key={i} orb={orb} />
        ))}
        {FLOAT_ICONS.map((spec, i) => (
          <FloatingIcon key={i} spec={spec} />
        ))}
      </Animated.View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.logoGlow, glowStyle]} />
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Image
              source={SPLASH_EMBLEM}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bgWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgBase: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#8A4BE0",
  },
  glowOrb: {
    position: "absolute",
  },
  floatingIcon: {
    position: "absolute",
  },
  content: {
    alignItems: "center",
    gap: 16,
    zIndex: 1,
  },
  logoContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  logoGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(138,75,224,0.4)",
  },
  logoWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textShadowColor: "rgba(74,59,107,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    lineHeight: 22,
  },
});
