import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export function useGameReactions(
  socket: Socket | null,
  roomId: string | undefined,
  userId: string | undefined,
) {
  const [incomingReaction, setIncomingReaction] = useState<string | null>(null);
  const [rejectMsg, setRejectMsg] = useState<string | null>(null);
  const reactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!socket) return;
    const onReaction = (d: any) => {
      if (d.userId === userId) return;
      setIncomingReaction(d.reaction);
      if (reactionTimer.current) clearTimeout(reactionTimer.current);
      reactionTimer.current = setTimeout(() => setIncomingReaction(null), 1800);
    };
    const onReject = (d: any) => {
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
