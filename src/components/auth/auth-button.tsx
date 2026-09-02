import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { GestureResponderEvent } from "react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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
    transform: [{ scale: 1 - pressed.value * 0.03 }],
  }));

  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isWhite = variant === "white";

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          pressed.value = 1;
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={{
          backgroundColor:
            backgroundColor ??
            (isPrimary ? "#8A4BE0" : isWhite ? "#FFFFFF" : "transparent"),
          borderColor: isOutline
            ? (textColor ?? "#8A4BE0")
            : isWhite
              ? "transparent"
              : "transparent",
          borderWidth: isOutline || isWhite ? 1.5 : 0,
          opacity: disabled || loading ? 0.5 : 1,
          shadowColor: isPrimary ? "#5C2D91" : "#8A4BE0",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 3,
        }}
        className="h-14 items-center justify-center rounded-full"
      >
        {loading ? (
          <ActivityIndicator
            color={textColor ?? (isPrimary || isWhite ? "#FFFFFF" : "#8A4BE0")}
            size="small"
          />
        ) : (
          <View className="flex-row items-center justify-center gap-4">
            {icon && (
              <MaterialCommunityIcons
                name={icon}
                size={20}
                color={
                  textColor ?? (isPrimary || isWhite ? "#FFFFFF" : "#8A4BE0")
                }
              />
            )}
            <Text
              className="font-ui-semibold text-[14px] tracking-[0.2px]"
              style={{
                color:
                  textColor ??
                  (isPrimary || isWhite
                    ? "#FFFFFF"
                    : isOutline
                      ? "#8A4BE0"
                      : "#7A748C"),
              }}
            >
              {title}
            </Text>
            {showArrow && (
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={
                  textColor ?? (isPrimary || isWhite ? "#FFFFFF" : "#8A4BE0")
                }
              />
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
