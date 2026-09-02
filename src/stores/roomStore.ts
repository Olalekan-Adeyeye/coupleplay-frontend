import { create } from 'zustand';

interface GamePlayer {
  id: string;
  roomId: string;
  userId: string;
  score: number;
  ready: boolean;
  connected: boolean;
}

interface GameRoom {
  id: string;
  coupleId: string;
  gameType: string;
  status: string;
  currentRound: number;
  totalRounds: number;
  players: GamePlayer[];
}

interface RoomState {
  room: GameRoom | null;
  partnerReady: boolean;
  partnerConnected: boolean;
  setRoom: (room: GameRoom | null) => void;
  setPartnerReady: (ready: boolean) => void;
  setPartnerConnected: (connected: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  partnerReady: false,
  partnerConnected: false,

  setRoom: (room) => set({ room }),
  setPartnerReady: (ready) => set({ partnerReady: ready }),
  setPartnerConnected: (connected) => set({ partnerConnected: connected }),
}));
