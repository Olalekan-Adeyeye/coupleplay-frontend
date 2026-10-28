import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import type { Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/authStore";
import { useRoomStore } from "@/stores/roomStore";
import { usePartnerName } from "@/hooks/usePartnerName";
import { useSocketStore } from "@/hooks/useSocket";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { useGameAbandoned } from "@/hooks/useGameAbandoned";

export type RoundEndMessage = (outcome: {
  won: boolean;
  draw: boolean;
  partnerName: string;
}) => string;

interface UseGameRoomOptions<T> {
  roundEndMessage: RoundEndMessage;
  /** Called when a broadcast carries a new round number. */
  onNewRound?: () => void;
}

interface GameFinishedPayload {
  roomId: string;
  results: {
    winnerId: string | null;
    scores: Record<string, number>;
    roundsWon?: Record<string, number>;
    totalRounds: number;
  };
}

interface RoundEndPayload<T> {
  roomId: string;
  winnerId: string | null;
  reveal: T | null;
}

const INTERSTITIAL_MS = 1800;

/**
 * Shared plumbing for play screens: socket listeners, round-end interstitial,
 * results navigation, leave confirmation (button + back gesture), and
 * unmount cleanup. Screens keep only their game-specific UI and actions.
 */
export function useGameRoom<
  T extends { roomId: string; roundNumber: number },
>(gameType: string, options: UseGameRoomOptions<T>) {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const socket = useSocketStore((s) => s.socket);
  const user = useAuthStore((s) => s.user);
  const partnerName = usePartnerName();
  const navigation = useNavigation();
  const leaveConfirm = useConfirmModal();
  const abandoned = useGameAbandoned(socket, roomId, partnerName);

  const [state, setState] = useState<T | null>(null);
  const [revealState, setRevealState] = useState<T | null>(null);
  const [interstitial, setInterstitial] = useState<string | null>(null);

  const lastRound = useRef<number | null>(null);
  const roundEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leftRef = useRef(false);
  const pendingActionRef = useRef<any>(null);
  // Callbacks live in refs so the socket listeners never need resubscribing.
  const roundEndMessageRef = useRef(options.roundEndMessage);
  roundEndMessageRef.current = options.roundEndMessage;
  const onNewRoundRef = useRef(options.onNewRound);
  onNewRoundRef.current = options.onNewRound;

  useEffect(() => {
    if (!socket) return;

    const onState = (s: T) => {
      if (s.roomId !== roomId) return;
      setState(s);
      if (lastRound.current !== s.roundNumber) {
        lastRound.current = s.roundNumber;
        setRevealState(null);
        onNewRoundRef.current?.();
      }
    };

    const onRoundEnd = (d: RoundEndPayload<T>) => {
      if (d.roomId !== roomId) return;
      const userId = useAuthStore.getState().user?.id;
      setRevealState(d.reveal ?? null);
      setInterstitial(
        roundEndMessageRef.current({
          won: d.winnerId === userId,
          draw: d.winnerId == null,
          partnerName,
        }),
      );
      if (roundEndTimer.current) clearTimeout(roundEndTimer.current);
      roundEndTimer.current = setTimeout(() => {
        setInterstitial(null);
        setRevealState(null);
      }, INTERSTITIAL_MS);
    };

    const onFinished = (d: GameFinishedPayload) => {
      if (d.roomId !== roomId) return;
      leftRef.current = true;
      const results = d.results;
      router.replace(
        `/games/${gameType}/results?winnerId=${results.winnerId ?? ""}&scores=${encodeURIComponent(JSON.stringify(results.scores))}&roundsWon=${encodeURIComponent(JSON.stringify(results.roundsWon ?? {}))}&totalRounds=${results.totalRounds}&roomId=${roomId}` as any,
      );
    };

    socket.on("game:state", onState);
    socket.on("game:round_end", onRoundEnd);
    socket.on("game:finished", onFinished);
    socket.emit("room:join", { roomId });
    socket.emit("game:sync", { roomId });

    return () => {
      socket.off("game:state", onState);
      socket.off("game:round_end", onRoundEnd);
      socket.off("game:finished", onFinished);
    };
  }, [socket, roomId, partnerName, gameType]);

  const doLeave = (action?: any) => {
    leftRef.current = true;
    socket?.emit("room:leave", { roomId });
    useRoomStore.getState().setRoom(null);
    if (action) {
      navigation.dispatch(action);
    } else {
      router.replace("/(tabs)/games");
    }
  };

  const askLeave = () => {
    leaveConfirm.confirm({
      title: "Leave game?",
      message: "The game room will be closed for both of you.",
      confirmLabel: "Leave",
      variant: "danger",
      onConfirm: () => doLeave(),
    });
  };

  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove" as any, (e: any) => {
      if (leftRef.current) return;
      if (e.data.action.type !== "POP") return;
      e.preventDefault();
      pendingActionRef.current = e.data.action;
      leaveConfirm.confirm({
        title: "Leave game?",
        message: "The game room will be closed for both of you.",
        confirmLabel: "Leave",
        variant: "danger",
        onConfirm: () => doLeave(pendingActionRef.current),
      });
    });
    return () => unsub();
  }, [navigation, roomId]);

  useEffect(() => {
    return () => {
      if (roundEndTimer.current) clearTimeout(roundEndTimer.current);
      if (!leftRef.current && roomId) {
        socket?.emit("room:leave", { roomId });
        useRoomStore.getState().setRoom(null);
      }
    };
  }, [roomId, socket]);

  return {
    roomId,
    socket,
    user,
    partnerName,
    state,
    revealState,
    interstitial,
    abandoned,
    askLeave,
    leaveConfirmProps: leaveConfirm.props,
    cancelLeave: leaveConfirm.cancel,
  };
}
