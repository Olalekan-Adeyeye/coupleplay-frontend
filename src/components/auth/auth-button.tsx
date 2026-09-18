import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { GestureResponderEvent } from "react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type AuthButtonProps = {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost" | "white";
  backgroundColor?: string;
  textColor?: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  showArrow?: boolean;
};

/**
 * Apple-premium CTA — primary tinted.
 * - 56h pill, tactile spring, generous air.
 * - Primary: solid #946BFF, white text, purple soft shadow — brand CTA.
 * - Outline: hairline primary glass (primary 9% + 1px primary/28), ink text.
 * - Keeps iOS pill language but in brand purple, not system white.
 */
export function AuthButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  backgroundColor,
  textColor,
  icon,
  showArrow,
}: AuthButtonProps) {
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
    opacity: 1 - pressed.value * 0.06,
  }));

  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isWhite = variant === "white";

  // Brand mapping — primary everywhere the eye should land
  const bg = (() => {
    if (backgroundColor) return backgroundColor;
    if (isPrimary) return "#946BFF";
    if (isWhite) return "#FFFFFF";
    if (isOutline) return "rgba(148,107,255,0.09)";
    return "transparent";
  })();

  const fg = (() => {
    if (textColor) return textColor;
    if (isPrimary) return "#FFFFFF";
    if (isWhite) return "#100E17";
    if (isOutline) return "#F4F1FA";
    return "#F4F1FA";
  })();

  const borderColor = (() => {
    if (isOutline) return "rgba(148,107,255,0.32)";
    if (isWhite) return "transparent";
    return "transparent";
  })();

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withSpring(1, { damping: 18, stiffness: 420 });
        }}
        onPressOut={() => {
          pressed.value = withSpring(0, { damping: 18, stiffness: 420 });
        }}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[
          {
            backgroundColor: bg,
            borderColor,
            borderWidth: isOutline ? 1 : 0,
            opacity: disabled || loading ? 0.55 : 1,
            height: 56,
            borderRadius: 9999,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={fg} size="small" />
        ) : (
          <View
            className="flex-row items-center justify-center"
            style={{ gap: 10 }}
          >
            {icon && (
              <MaterialCommunityIcons name={icon} size={18} color={fg} />
            )}
            <Text
              style={{
                color: fg,
                fontFamily: "NunitoSans_700Bold",
                fontSize: 14.5,
                letterSpacing: isPrimary || isWhite ? 0.7 : 0.6,
                fontWeight: "700",
                textAlign: "center",
                includeFontPadding: false as any,
              }}
            >
              {title}
            </Text>
            {showArrow && (
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isPrimary
                    ? "rgba(255,255,255,0.18)"
                    : isWhite
                      ? "rgba(16,14,23,0.08)"
                      : "rgba(148,107,255,0.16)",
                  marginLeft: 2,
                }}
              >
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={14}
                  color={fg}
                />
              </View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
