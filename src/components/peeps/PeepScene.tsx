import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";
import { PeepAvatar } from "./PeepAvatar";
import { PEEP_PRESETS, type PeepId } from "./peeps";

type PeepSceneProps = {
  /** Single hero peep, or a duo. Strictly busts — no other illustration. */
  layout?: "single" | "duo" | "versus";
  peeps?: (string | PeepId | null)[];
  seeds?: (string | null)[];
  size?: number;
};

/**
 * Spot illustration composed STRICTLY from Open Peeps busts.
 * Used for welcome, empty states, invite, results. Flat, no blobs, no emoji.
 */
export function PeepScene({ layout = "duo", peeps = [], seeds = [], size = 96 }: PeepSceneProps) {
  const fallback = PEEP_PRESETS.map((p) => p.id);
  const a = peeps[0] ?? fallback[0];
  const b = peeps[1] ?? fallback[6];

  if (layout === "single") {
    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <PeepAvatar peep={a} seed={seeds[0]} size={size * 1.4} />
      </View>
    );
  }

  if (layout === "versus") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
        <PeepAvatar peep={a} seed={seeds[0]} size={size} />
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#F4F1FA",
            marginHorizontal: -10,
            zIndex: 10,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#FFFFFF",
          }}
        >
          <MaterialCommunityIcons name="sword-cross" size={18} color="#100E17" />
        </View>
        <PeepAvatar peep={b} seed={seeds[1]} size={size} ring="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "center" }}>
      <View style={{ marginRight: -14, marginBottom: 6 }}>
        <PeepAvatar peep={a} seed={seeds[0]} size={size} />
      </View>
      <View style={{ zIndex: 1 }}>
        <PeepAvatar peep={b} seed={seeds[1]} size={size * 1.18} />
      </View>
    </View>
  );
}
