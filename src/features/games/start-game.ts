import { api } from "@/lib/api";
import { router } from "expo-router";

/**
 * One-tap entry: join the partner's active room if one exists,
 * otherwise create a new room, then land in the waiting room.
 */
export async function startGameFlow(
  gameId: string,
  coupleId: string,
  token: string,
  totalRounds?: number,
) {
  const active = await api.rooms.getActive(coupleId, token);
  if (active) {
    await api.rooms.join(active.id, token);
    const activeType = active.gameType || gameId;
    router.push(`/games/${activeType}/waiting?roomId=${active.id}` as any);
    return;
  }

  const room = await api.rooms.create(
    { coupleId, gameType: gameId, totalRounds },
    token,
  );
  router.push(`/games/${gameId}/waiting?roomId=${room.id}` as any);
}
