import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { getSocketBaseUrl } from "@/lib/env";
import { useCoupleStore } from "@/stores/coupleStore";

const SOCKET_URL = getSocketBaseUrl();

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  /** Reconnect token — set once, reused on reconnects. */
  authToken: string | null;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,
  authToken: null,

  connect: (token: string) => {
    const existing = get().socket;
    if (existing) {
      if (existing.connected && get().authToken === token) return;
      existing.removeAllListeners();
      existing.disconnect();
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      set({ connected: true });
      socket.emit("authenticate", { token });
    });

    socket.on("disconnect", () => {
      set({ connected: false });
    });

    // Server only sends ids — refresh the actual couple from the API.
    socket.on("couple:unlinked", () => {
      void useCoupleStore.getState().fetchCouple(token).catch(() => {});
    });

    socket.on("couple:linked", () => {
      void useCoupleStore.getState().fetchCouple(token).catch(() => {});
    });

    set({ socket, authToken: token });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      set({ socket: null, connected: false, authToken: null });
    }
  },
}));
