import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { PeepAvatar } from "./PeepAvatar";
import type { PeepId } from "./peeps";

type PeepPairProps = {
  mine?: string | PeepId | null;
  theirs?: string | PeepId | null;
  mySeed?: string | null;
  theirSeed?: string | null;
  myName?: string;
  theirName?: string;
  size?: number;
};

/**
 * Couple mark: two overlapping Peep discs joined by a heart dot.
 * Replaces CoupleAvatars (home_guy/home_girl/home_love PNGs).
 * When single, the second disc is a dashed invite placeholder.
 */
export function PeepPair({
  mine,
  theirs,
  mySeed,
  theirSeed,
  myName,
  theirName,
  size = 64,
}: PeepPairProps) {
  const hasPartner = theirs != null && theirs !== "";
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <PeepAvatar peep={mine} seed={mySeed ?? myName} name={myName} size={size} />
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: "#FF5C8A",
          borderWidth: 2,
          borderColor: "#FFFFFF",
          marginHorizontal: -8,
          marginTop: size * 0.35,
          zIndex: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name="heart" size={13} color="#FFFFFF" />
      </View>
      {hasPartner ? (
        <PeepAvatar
          peep={theirs}
          seed={theirSeed ?? theirName}
          name={theirName}
          size={size}
          ring="#FFFFFF"
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderStyle: "dashed",
            borderColor: "rgba(32,26,51,0.25)",
            backgroundColor: "rgba(255,255,255,0.6)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="account-plus"
            size={size * 0.36}
            color="#946BFF"
          />
        </View>
      )}
    </View>
  );
}
