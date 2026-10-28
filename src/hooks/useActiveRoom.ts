import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";
import { useSocketStore } from "@/hooks/useSocket";
import { useCallback, useEffect, useState } from "react";

export type ActiveRoom = {
  id: string;
  gameType: string;
  status: string;
  players?: { userId: string; ready: boolean }[];
} | null;

const ROOM_LIFECYCLE_EVENTS = [
  "room:created",
  "room:player_joined",
  "room:player_left",
  "game:start",
  "game:finished",
  "game:abandoned",
] as const;

/**
 * The couple's currently live room, if any. Used for the Home rejoin
 * banner and the Games tab badge. Null when none or on error.
 */
export function useActiveRoom() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);
  const socket = useSocketStore((s) => s.socket);
  const [room, setRoom] = useState<ActiveRoom>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setRoom(null);
      return;
    }
    setLoading(true);
    try {
      const active = await api.rooms.getActive(token);
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
  }, [token]);

  useEffect(() => {
    // Fetch-on-mount by design: single network refresh, not a render cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().catch(() => {});
  }, [refresh]);

  // Keep the badge honest: room lifecycle events re-sync it in realtime.
  useEffect(() => {
    if (!socket) return;
    const handler = () => void refresh().catch(() => {});
    for (const event of ROOM_LIFECYCLE_EVENTS) {
      socket.on(event, handler);
    }
    return () => {
      for (const event of ROOM_LIFECYCLE_EVENTS) {
        socket.off(event, handler);
      }
    };
  }, [socket, refresh]);

  const involvesMe =
    room?.players?.some((p) => p.userId === user?.id) ?? false;

  return { room, loading, refresh, involvesMe };
}
