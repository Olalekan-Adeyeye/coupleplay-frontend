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
  setRoom: (room: GameRoom | null) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
}));
