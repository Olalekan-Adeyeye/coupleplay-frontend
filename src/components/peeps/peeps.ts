/**
 * Open Peeps preset registry — STRICTLY Open Peeps, nothing else.
 *
 * Source: @dicebear/open-peeps (remix of Open Peeps by Pablo Stanley, CC0 1.0).
 * Vendored at assets/peeps/busts/*.png via scripts/generate-peeps.mjs.
 * Fixed set: 5 male (peep-m-01…05) + 5 female (peep-f-01…05).
 *
 * People are rendered ONLY through this registry. Do not add other
 * avatar/illustration sources (no home_guy/home_girl, no header PNGs,
 * no emoji faces, no AI-generated busts).
 */

export type PeepGender = "male" | "female";

export type PeepId =
  | "peep-m-01"
  | "peep-m-02"
  | "peep-m-03"
  | "peep-m-04"
  | "peep-m-05"
  | "peep-f-01"
  | "peep-f-02"
  | "peep-f-03"
  | "peep-f-04"
  | "peep-f-05";

export type PeepPreset = {
  id: PeepId;
  gender: PeepGender;
  /** Short picker label. Never shown as a heading — micro label only. */
  label: string;
  source: number;
};

export const PEEP_PRESETS: readonly PeepPreset[] = [
  { id: "peep-m-01", gender: "male", label: "Beard · Short", source: require("@/assets/peeps/busts/peep-m-01.png") },
  { id: "peep-m-02", gender: "male", label: "Goatee · Crop", source: require("@/assets/peeps/busts/peep-m-02.png") },
  { id: "peep-m-03", gender: "male", label: "Moustache · Flattop", source: require("@/assets/peeps/busts/peep-m-03.png") },
  { id: "peep-m-04", gender: "male", label: "Beard · Shaved", source: require("@/assets/peeps/busts/peep-m-04.png") },
  { id: "peep-m-05", gender: "male", label: "Chin · Pomp", source: require("@/assets/peeps/busts/peep-m-05.png") },
  { id: "peep-f-01", gender: "female", label: "Long", source: require("@/assets/peeps/busts/peep-f-01.png") },
  { id: "peep-f-02", gender: "female", label: "Buns", source: require("@/assets/peeps/busts/peep-f-02.png") },
  { id: "peep-f-03", gender: "female", label: "Bangs · Bob", source: require("@/assets/peeps/busts/peep-f-03.png") },
  { id: "peep-f-04", gender: "female", label: "Hijab", source: require("@/assets/peeps/busts/peep-f-04.png") },
  { id: "peep-f-05", gender: "female", label: "Top bun", source: require("@/assets/peeps/busts/peep-f-05.png") },
] as const;

const BY_ID: Record<PeepId, PeepPreset> = Object.fromEntries(
  PEEP_PRESETS.map((p) => [p.id, p]),
) as Record<PeepId, PeepPreset>;

export const PEEP_IDS = PEEP_PRESETS.map((p) => p.id);

export function isPeepId(value: unknown): value is PeepId {
  return typeof value === "string" && value in BY_ID;
}

/** Gender is derived from the peep — never stored/branched separately. */
export function genderOfPeepId(id: PeepId): PeepGender {
  return BY_ID[id].gender;
}

/**
 * Frontend gender for avatar display. Resolves a stored avatar value to
 * 'male' | 'female', or null when unknown. Use this instead of a server
 * gender field (the API has none — gender lives in the peep).
 */
export function avatarGender(
  avatar: string | null | undefined,
): PeepGender | null {
  return isPeepId(avatar) ? genderOfPeepId(avatar) : null;
}

export function peepPresetOf(id: PeepId): PeepPreset {
  return BY_ID[id];
}

export function peepsOfGender(gender: PeepGender): readonly PeepPreset[] {
  return PEEP_PRESETS.filter((p) => p.gender === gender);
}

/**
 * Deterministic fallback for legacy accounts whose avatar is null or a
 * non-peep value. Stable per user id, evenly spread across all 10.
 */
export function defaultPeepForSeed(seed: string | null | undefined): PeepId {
  if (seed && isPeepId(seed)) return seed;
  let hash = 0;
  const s = seed ?? "coupleplay";
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return PEEP_IDS[hash % PEEP_IDS.length];
}

/** Resolve any stored avatar value to a valid PeepId (backwards compatible). */
export function resolvePeepId(
  avatar: string | null | undefined,
  fallbackSeed?: string | null,
): PeepId {
  if (isPeepId(avatar)) return avatar;
  return defaultPeepForSeed(fallbackSeed ?? avatar);
}
