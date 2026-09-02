import { create } from 'zustand';

export type Reaction = '❤️' | '😂' | '😭' | '😈' | '🔥' | '😳';

interface ReactionsState {
  incomingReaction: { userId: string; reaction: Reaction } | null;
  setIncomingReaction: (data: { userId: string; reaction: Reaction } | null) => void;
}

export const useReactionsStore = create<ReactionsState>((set) => ({
  incomingReaction: null,
  setIncomingReaction: (data) => set({ incomingReaction: data }),
}));
