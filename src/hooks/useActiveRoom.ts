import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useCallback, useEffect, useState } from "react";

export type ActiveRoom = {
  id: string;
  gameType: string;
  status: string;
  players?: { userId: string; ready: boolean }[];
} | null;

/**
 * The couple's currently live room, if any. Used for the Home rejoin
 * banner and the Games tab badge. Null when none or on error.
 */
export function useActiveRoom() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);
  const [room, setRoom] = useState<ActiveRoom>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const coupleId = couple?.id;
    if (!token || !coupleId) {
      setRoom(null);
      return;
    }
    setLoading(true);
    try {
      const active = await api.rooms.getActive(coupleId, token);
      if (!active) {
        setRoom(null);
        return;
      }
      const full = await api.rooms.get(active.id, token);
      setRoom(full);
    } catch {
      setRoom(null);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, couple]);

  useEffect(() => {
    // Fetch-on-mount by design: single network refresh, not a render cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().catch(() => {});
  }, [refresh]);

  const involvesMe =
    room?.players?.some((p) => p.userId === user?.id) ?? false;

  return { room, loading, refresh, involvesMe };
}
