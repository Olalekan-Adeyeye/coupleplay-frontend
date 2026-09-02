import { create } from 'zustand';
import { api } from '../lib/api';

interface Couple {
  id: string;
  userAId: string;
  userBId: string | null;
  inviteCode: string | null;
  createdAt: string;
  userA: any;
  userB: any;
}

interface CoupleState {
  couple: Couple | null;
  isLoading: boolean;
  fetchCouple: (token: string) => Promise<void>;
  generateInvite: (token: string) => Promise<Couple>;
  joinByCode: (code: string, token: string) => Promise<Couple>;
  unlink: (token: string) => Promise<void>;
  setCouple: (couple: Couple | null) => void;
}

export const useCoupleStore = create<CoupleState>((set) => ({
  couple: null,
  isLoading: false,

  fetchCouple: async (token) => {
    set({ isLoading: true });
    try {
      const couple = await api.couples.getMyCouple(token);
      set({ couple, isLoading: false });
    } catch {
      set({ couple: null, isLoading: false });
    }
  },

  generateInvite: async (token) => {
    const couple = await api.couples.generateInvite(token);
    set({ couple });
    return couple;
  },

  joinByCode: async (code, token) => {
    const couple = await api.couples.joinByCode(code, token);
    set({ couple });
    return couple;
  },

  unlink: async (token) => {
    await api.couples.unlink(token);
    set({ couple: null });
  },

  setCouple: (couple) => set({ couple }),
}));
