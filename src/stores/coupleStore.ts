import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError } from '../lib/api';
import { avatarGender } from '../components/peeps/peeps';
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

/** Fill in missing gender from each user's peep so avatar display works. */
function withGenders(couple: any) {
  if (!couple) return couple;
  for (const key of ['userA', 'userB'] as const) {
    const u = couple[key];
    if (u && !u.gender) {
      const g = avatarGender(u.avatar ?? null);
      if (g) couple = { ...couple, [key]: { ...u, gender: g } };
    }
  }
  return couple;
}

interface CoupleState {
  couple: Couple | null;
  /** True once a fetch has settled this session, so screens can stop
   * mistaking "loading" for "no partner" and flash the invite UI. */
  loaded: boolean;
  isLoading: boolean;
  fetchCouple: (token: string) => Promise<void>;
  generateInvite: (token: string) => Promise<Couple>;
  joinByCode: (code: string, token: string) => Promise<Couple>;
  unlink: (token: string) => Promise<void>;
  setCouple: (couple: Couple | null) => void;
  reset: () => void;
}

export const useCoupleStore = create<CoupleState>()(
  persist(
    (set) => ({
      couple: null,
      loaded: false,
      isLoading: false,

      fetchCouple: async (token) => {
        set({ isLoading: true });
        try {
          const couple = await api.couples.getMyCouple(token);
          set({ couple: withGenders(couple), isLoading: false, loaded: true });
        } catch (e: any) {
          // 404 means no couple yet — that's expected
          if (e instanceof ApiError && e.status === 404) {
            set({ couple: null, isLoading: false, loaded: true });
          } else {
            set({ isLoading: false });
            throw e;
          }
        }
      },

      generateInvite: async (token) => {
        const couple = await api.couples.generateInvite(token);
        set({ couple: withGenders(couple), loaded: true });
        return couple;
      },

      joinByCode: async (code, token) => {
        const couple = await api.couples.joinByCode(code, token);
        set({ couple: withGenders(couple), loaded: true });
        return couple;
      },

      unlink: async (token) => {
        await api.couples.unlink(token);
        set({ couple: null, loaded: true });
      },

      setCouple: (couple) => set({ couple }),

      reset: () =>
        set({ couple: null, loaded: false, isLoading: false }),
    }),
    {
      name: 'couple-snapshot',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ couple: state.couple }) as unknown as CoupleState,
    },
  ),
);
