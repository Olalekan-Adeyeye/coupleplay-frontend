import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export function useGameReactions(
  socket: Socket | null,
  roomId: string | undefined,
  userId: string | undefined,
) {
  const [incomingReaction, setIncomingReaction] = useState<string | null>(null);
  const [rejectMsg, setRejectMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;
    const onReaction = (d: any) => {
      if (d.userId !== userId) {
        setIncomingReaction(d.reaction);
        setTimeout(() => setIncomingReaction(null), 1800);
      }
    };
    const onReject = (d: any) => {
      setRejectMsg(d.reason ?? "Move rejected");
      setTimeout(() => setRejectMsg(null), 2000);
    };
    socket.on("player:reaction", onReaction);
    socket.on("game:reject", onReject);
    return () => {
      socket.off("player:reaction", onReaction);
      socket.off("game:reject", onReject);
    };
  }, [socket, userId]);

  const sendReaction = (roomId: string, reaction: string) => {
    socket?.emit("player:reaction", { roomId, reaction });
  };

  return { incomingReaction, rejectMsg, sendReaction };
}
