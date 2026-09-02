import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, type ThemeColors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AuthPalette = ThemeColors;

export const AUTH_LIGHT: AuthPalette = Colors;

export function useAuthColors(): AuthPalette {
  return useTheme();
}

type Speck = {
  left: `${number}%`;
  size: number;
  travel: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
};

function makeSpecks(c: AuthPalette): Speck[] {
  return [
    { left: '8%', size: 7, travel: 120, duration: 11000, delay: 0, opacity: 0.4, color: c.speckA },
    { left: '18%', size: 5, travel: 160, duration: 14000, delay: 3200, opacity: 0.35, color: c.speckC },
    { left: '31%', size: 9, travel: 100, duration: 12500, delay: 1800, opacity: 0.3, color: c.speckB },
    { left: '58%', size: 6, travel: 140, duration: 15500, delay: 4200, opacity: 0.35, color: c.speckA },
    { left: '74%', size: 8, travel: 110, duration: 13000, delay: 1000, opacity: 0.3, color: c.speckB },
    { left: '88%', size: 5, travel: 150, duration: 16000, delay: 5600, opacity: 0.35, color: c.speckC },
  ];
}

function DriftingSpeck({ speck }: { speck: Speck }) {
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(0);
  const opacity = useSharedValue(reduceMotion ? speck.opacity * 0.6 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    y.value = withDelay(
      speck.delay,
      withRepeat(withTiming(-speck.travel, { duration: speck.duration, easing: Easing.linear }), -1, true),
    );
    opacity.value = withDelay(
      speck.delay,
      withRepeat(
        withSequence(
          withTiming(speck.opacity, { duration: speck.duration * 0.4, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: speck.duration * 0.6, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      ),
    );
  }, [reduceMotion, speck, y, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.speck,
        {
          left: speck.left,
          width: speck.size,
          height: speck.size,
          borderRadius: speck.size / 2,
          backgroundColor: speck.color,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    />
  );
}

export function AuthBackground() {
  const c = useAuthColors();

  return (
    <View style={[styles.fill, { backgroundColor: c.background }]} pointerEvents="none">
      <View style={[styles.blob, styles.blobBlush, { backgroundColor: c.blobBlush }]} />
      <View style={[styles.blob, styles.blobLavender, { backgroundColor: c.blobLavender }]} />
      <View style={[styles.blob, styles.blobPeach, { backgroundColor: c.blobPeach }]} />
      <View style={[styles.blob, styles.blobRose, { backgroundColor: c.blobRose }]} />
      {makeSpecks(c).map((speck, i) => (
        <DriftingSpeck key={i} speck={speck} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
  },
  blobBlush: {
    top: -130,
    left: -100,
    width: 360,
    height: 320,
    borderRadius: 180,
  },
  blobLavender: {
    top: 150,
    right: -90,
    width: 270,
    height: 270,
    borderRadius: 135,
  },
  blobPeach: {
    bottom: -120,
    left: -90,
    width: 310,
    height: 280,
    borderRadius: 155,
  },
  blobRose: {
    bottom: 60,
    right: -60,
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  speck: {
    position: 'absolute',
    bottom: 140,
  },
});