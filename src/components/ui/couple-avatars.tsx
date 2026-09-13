import { PeepPair } from "@/components/peeps/PeepPair";
import { peepsOfGender, resolvePeepId, type PeepId } from "@/components/peeps/peeps";

type CoupleAvatarsProps = {
  hasPartner: boolean;
  /** Legacy gender strings — mapped deterministically to a Peep. Prefer peep props. */
  userGender?: string | null;
  partnerGender?: string | null;
  myPeep?: string | PeepId | null;
  theirPeep?: string | PeepId | null;
  mySeed?: string | null;
  theirSeed?: string | null;
  myName?: string;
  theirName?: string;
  size?: number;
};

function peepForGender(gender: string | null | undefined, seed: string): PeepId {
  const g = gender === "female" ? "female" : "male";
  const list = peepsOfGender(g);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return list[hash % list.length].id;
}

/**
 * Couple mark — STRICTLY Open Peeps via PeepPair.
 * Backwards-compatible props: legacy gender strings resolve to a
 * deterministic Peep of that gender. New code should pass peep ids.
 */
export function CoupleAvatars({
  hasPartner,
  userGender,
  partnerGender,
  myPeep,
  theirPeep,
  mySeed,
  theirSeed,
  myName,
  theirName,
  size = 72,
}: CoupleAvatarsProps) {
  const mine = myPeep ?? (userGender ? peepForGender(userGender, mySeed ?? myName ?? "me") : resolvePeepId(null, mySeed ?? myName));
  const theirs = hasPartner
    ? (theirPeep ?? (partnerGender ? peepForGender(partnerGender, theirSeed ?? theirName ?? "partner") : resolvePeepId(null, theirSeed ?? theirName)))
    : null;

  return (
    <PeepPair
      mine={mine}
      theirs={theirs}
      mySeed={mySeed}
      theirSeed={theirSeed}
      myName={myName}
      theirName={theirName}
      size={size}
    />
  );
}
