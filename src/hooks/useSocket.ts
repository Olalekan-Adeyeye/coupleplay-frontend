import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { getSocketBaseUrl } from '@/lib/env';
import { useCoupleStore } from '@/stores/coupleStore';

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
    if (existing?.connected) return;

    if (existing) {
      existing.removeAllListeners();
      existing.disconnect();
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      set({ connected: true });
      socket.emit('authenticate', { token });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('couple:unlinked', () => {
      useCoupleStore.getState().setCouple(null as any);
    });

    socket.on('couple:linked', (couple) => {
      useCoupleStore.getState().setCouple(couple);
    });

    set({ socket, authToken: token });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.off('couple:unlinked');
      socket.off('couple:linked');
      socket.disconnect();
      set({ socket: null, connected: false, authToken: null });
    }
  },
}));
