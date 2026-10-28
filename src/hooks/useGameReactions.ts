import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export interface IncomingReaction {
  emoji: string;
  mine: boolean;
  /** Increments per event so the UI can replay animations on repeats. */
  seq: number;
}

export function useGameReactions(
  socket: Socket | null,
  roomId: string | undefined,
  userId: string | undefined,
) {
  const [incomingReaction, setIncomingReaction] = useState<IncomingReaction | null>(null);
  const [rejectMsg, setRejectMsg] = useState<string | null>(null);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (!socket) return;
    const onReaction = (d: { userId: string; reaction: string }) => {
      setIncomingReaction({
        emoji: d.reaction,
        mine: d.userId === userId,
        seq: ++seq.current,
      });
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      reactionTimer.current = setTimeout(() => setIncomingReaction(null), 1900);
    };
    const onReject = (d: { reason?: string }) => {
      setRejectMsg(d.reason ?? "Move rejected");
      if (rejectTimer.current) clearTimeout(rejectTimer.current);
      rejectTimer.current = setTimeout(() => setRejectMsg(null), 2000);
    };
    socket.on("player:reaction", onReaction);
    socket.on("game:reject", onReject);
    return () => {
      socket.off("player:reaction", onReaction);
      socket.off("game:reject", onReject);
    };
  }, [socket, userId]);

  useEffect(() => {
    return () => {
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      if (rejectTimer.current) clearTimeout(rejectTimer.current);
    };
  }, []);

  const sendReaction = (roomId: string, reaction: string) => {
    socket?.emit("player:reaction", { roomId, reaction });
  };

  return { incomingReaction, rejectMsg, sendReaction };
}
