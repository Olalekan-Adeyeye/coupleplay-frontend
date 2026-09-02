import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const HOME_BOY = require("@/assets/images/home_guy.png");
const HOME_GIRL = require("@/assets/images/home_girl.png");
const RED_HEART = require("@/assets/images/home_love.png");

function PulsingHeart() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 650 }),
        withTiming(1, { duration: 650 }),
      ),
      -1,
      false,
    );
  }, [scale]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[{ marginHorizontal: -12, marginTop: 16, zIndex: 10 }, heartStyle]}
    >
      <Image
        source={RED_HEART}
        style={{ width: 36, height: 36 }}
        contentFit="contain"
      />
    </Animated.View>
  );
}

type CoupleAvatarsProps = {
  hasPartner: boolean;
  userGender?: string | null;
  partnerGender?: string | null;
  size?: number;
};

export function CoupleAvatars({ hasPartner, userGender, partnerGender, size = 72 }: CoupleAvatarsProps) {
  const selfAvatar = userGender === "female" ? HOME_GIRL : HOME_BOY;
  const partnerAvatar = partnerGender === "female" ? HOME_GIRL : HOME_BOY;

  return (
    <View className="flex-row items-center">
      <View
        className="overflow-hidden rounded-full border-2 border-white bg-white"
        style={{ height: size, width: size }}
      >
        <Image
          source={selfAvatar}
          style={{ height: size, width: size }}
          contentFit="cover"
        />
      </View>

      <PulsingHeart />

      {hasPartner ? (
        <View
          className="overflow-hidden rounded-full border-2 border-white bg-white"
          style={{ height: size, width: size }}
        >
          <Image
            source={partnerAvatar}
            style={{
              height: size,
              width: size,
              transform: [{ scale: 1.15 }],
            }}
            contentFit="cover"
          />
        </View>
      ) : (
        <View
          className="items-center justify-center rounded-full border-2 border-dashed border-white/60"
          style={{ height: size, width: size }}
        >
          <MaterialCommunityIcons
            name="account-plus"
            size={size * 0.39}
            color="#FFFFFF"
          />
        </View>
      )}
    </View>
  );
}
