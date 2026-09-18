import { useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { Socket } from "socket.io-client";
import { useRoomStore } from "@/stores/roomStore";

export function useGameAbandoned(
  socket: Socket | null,
  roomId: string | undefined,
  partnerName: string,
  opts?: { clearRoom?: boolean },
) {
  useEffect(() => {
    if (!socket || !roomId) return;
    const onAbandoned = (d: any) => {
      if (d.roomId !== roomId) return;
      if (opts?.clearRoom) {
        useRoomStore.getState().setRoom(null);
      }
      Alert.alert(
        `${partnerName} left`,
        "The game room was closed. Back to games?",
        [{ text: "OK", onPress: () => router.replace("/(tabs)/games") }],
      );
    };
    socket.on("game:abandoned", onAbandoned);
    return () => {
      socket.off("game:abandoned", onAbandoned);
    };
  }, [socket, roomId, partnerName, opts?.clearRoom]);
}
