import { useState } from "react";
import type { ImageSourcePropType, TextInputProps } from "react-native";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { usePalette } from "@/hooks/usePalette";

const EYE_ON = require("@/assets/images/icons/eye.png");
const EYE_OFF = require("@/assets/images/icons/eye-off.png");

type AuthInputProps = TextInputProps & {
  label?: string;
  icon?: ImageSourcePropType;
  secureToggle?: boolean;
};

export function AuthInput({
  label,
  icon,
  secureToggle,
  onFocus,
  onBlur,
  style,
  secureTextEntry,
  ...rest
}: AuthInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const focusProgress = useSharedValue(0);
  const palette = usePalette();

  const containerStyle = useAnimatedStyle(() => ({
    borderColor:
      focusProgress.value > 0 ? palette.primary : palette.chip,
    backgroundColor: palette.surface,
  }));

  const iconTint = focused ? palette.primary : palette.inkTertiary;
  const textColor = palette.ink;
  const placeholderColor = palette.inkTertiary;

  return (
    <View className="w-full gap-1.5">
      {label ? (
        <Text className="pl-1 font-ui-semibold text-[13.5px] tracking-[0.2px] text-ink-secondary">
          {label}
        </Text>
      ) : null}
      <Animated.View
        className="relative flex-row items-center rounded-xl border-[1.5px] overflow-hidden"
        style={containerStyle}
      >
        {icon && (
          <View className="pl-5">
            <Image
              source={icon}
              style={{ width: 20, height: 20, tintColor: iconTint }}
            />
          </View>
        )}
        <TextInput
          className="flex-1 py-[14px] font-ui text-body-lg"
          style={[
            { color: textColor },
            icon ? { paddingLeft: 12 } : { paddingLeft: 16 },
            secureToggle ? { paddingRight: 12 } : { paddingRight: 16 },
            style,
          ]}
          placeholderTextColor={placeholderColor}
          selectionColor={palette.primary}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            focusProgress.value = withTiming(1, { duration: 180 });
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            focusProgress.value = withTiming(0, { duration: 180 });
            onBlur?.(e);
          }}
          {...rest}
        />
        {secureToggle && (
          <View className="pr-3.5">
            <Pressable
              className="h-9 w-9 items-center justify-center rounded-xl"
              onPress={() => setHidden((h) => !h)}
              accessibilityRole="button"
              accessibilityLabel={hidden ? "Show password" : "Hide password"}
              hitSlop={6}
            >
              {({ pressed }) => (
                <Image
                  source={hidden ? EYE_OFF : EYE_ON}
                  style={{
                    width: 20,
                    height: 20,
                    tintColor: focused ? palette.primary : placeholderColor,
                    opacity: pressed ? 0.5 : 1,
                  }}
                />
              )}
            </Pressable>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
