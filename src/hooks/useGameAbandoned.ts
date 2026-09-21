import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Socket } from "socket.io-client";
import { useRoomStore } from "@/stores/roomStore";

type AbandonedResult = {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
};

/**
 * Listens for the `game:abandoned` socket event and returns modal props
 * that the consumer renders as `<InfoModal {...abandoned} />`.
 */
export function useGameAbandoned(
  socket: Socket | null,
  roomId: string | undefined,
  partnerName: string,
  opts?: { clearRoom?: boolean },
): AbandonedResult {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!socket || !roomId) return;
    const onAbandoned = (d: any) => {
      if (d.roomId !== roomId) return;
      if (opts?.clearRoom) {
        useRoomStore.getState().setRoom(null);
      }
      setVisible(true);
    };
    socket.on("game:abandoned", onAbandoned);
    return () => {
      socket.off("game:abandoned", onAbandoned);
    };
  }, [socket, roomId, partnerName, opts?.clearRoom]);

  const onDismiss = useCallback(() => {
    setVisible(false);
    router.replace("/(tabs)/games");
  }, []);

  return {
    visible,
    title: `${partnerName} left`,
    message: "The game room was closed. Back to games?",
    onDismiss,
  };
}
