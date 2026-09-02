import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { getSocketBaseUrl } from '@/lib/env';
import { useCoupleStore } from '@/stores/coupleStore';

const SOCKET_URL = getSocketBaseUrl();

interface SocketState {
  socket: Socket | null;
  connected: boolean;
  connect: (userId: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connected: false,

  connect: (userId: string) => {
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
      socket.emit('authenticate', { userId });
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

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.off('couple:unlinked');
      socket.off('couple:linked');
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },
}));

export function useGameSocket() {
  const socket = useSocketStore((s) => s.socket);

  function createRoom(coupleId: string, gameType: string, totalRounds?: number) {
    socket?.emit('room:create', { coupleId, gameType, totalRounds });
  }

  function joinRoom(roomId: string) {
    socket?.emit('room:join', { roomId });
  }

  function leaveRoom(roomId: string) {
    socket?.emit('room:leave', { roomId });
  }

  function playerReady(roomId: string) {
    socket?.emit('player:ready', { roomId });
  }

  function sendAction(roomId: string, action: string, payload?: any) {
    socket?.emit('game:action', { roomId, action, payload });
  }

  function sendReaction(roomId: string, reaction: string) {
    socket?.emit('player:reaction', { roomId, reaction });
  }

  return {
    socket,
    createRoom,
    joinRoom,
    leaveRoom,
    playerReady,
    sendAction,
    sendReaction,
  };
}
