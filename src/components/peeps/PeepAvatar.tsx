import { PeepTints } from "@/constants/theme";
import { Image } from "expo-image";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { isPeepId, peepPresetOf, resolvePeepId, type PeepId } from "./peeps";

type PeepAvatarProps = {
  /** Stored avatar value or PeepId. Any legacy value resolves deterministically. */
  peep?: string | PeepId | null;
  /** Stable seed used when `peep` is null (e.g. user id). */
  seed?: string | null;
  name?: string;
  size?: number;
  /** Flat solid tint behind the bust. Defaults to deterministic cycle. */
  tint?: string;
  /** 2px ring color. Defaults to white (for use on tinted/colored surfaces). */
  ring?: string;
  /** Mirror horizontally so the peep faces the opposite direction. */
  mirror?: boolean;
};

/**
 * The ONLY avatar component. Open Peeps bust on a flat solid tint disc.
 * Replaces Avatar initials fallback + home_guy/home_girl gender branches.
 */
export function PeepAvatar({
  peep,
  seed,
  name,
  size = 48,
  tint,
  ring = "#FFFFFF",
  mirror,
}: PeepAvatarProps) {
  const peepId = isPeepId(peep) ? peep : resolvePeepId(peep, seed ?? name);
  const preset = peepPresetOf(peepId);

  const disc = useMemo(() => {
    if (tint) return tint;
    let hash = 0;
    for (let i = 0; i < peepId.length; i++)
      hash = (hash * 31 + peepId.charCodeAt(i)) >>> 0;
    return PeepTints[hash % PeepTints.length];
  }, [tint, peepId]);

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name ? `${name} avatar` : `${preset.label} avatar`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: disc,
        borderWidth: 2,
        borderColor: ring,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Image
        source={preset.source}
        style={{
          width: size * 1.04,
          height: size * 1.04,
          transform: mirror ? [{ scaleX: -1 }] : undefined,
        }}
        contentFit="cover"
      />
    </View>
  );
}

export function PeepInitialsFallback({
  name,
  size = 48,
}: {
  name?: string;
  size?: number;
}) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#946BFF",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{ color: "#FFFFFF", fontWeight: "700", fontSize: size * 0.36 }}
      >
        {initials}
      </Text>
    </View>
  );
}
