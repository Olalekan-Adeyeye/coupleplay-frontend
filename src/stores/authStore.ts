import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { avatarGender } from '../components/peeps/peeps';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string | null;
  gender: string | null;
  coupleId: string | null;
}

/**
 * The API has no gender field, so it always arrives null. Derive it from
 * the stored peep so any gender-based avatar display keeps working.
 */
function withGender<T extends { avatar?: string | null; gender?: string | null }>(user: T): T {
  if (user.gender) return user;
  const g = avatarGender(user.avatar ?? null);
  return g ? { ...user, gender: g } : user;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, name: string, password: string, avatar?: string) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await api.auth.login({ email, password });
          set({ user: withGender(user), token, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      register: async (email, username, name, password, avatar) => {
        set({ isLoading: true });
        try {
          const { user, token } = await api.auth.register({ email, username, name, password, avatar });
          set({ user: withGender(user), token, isAuthenticated: true, isLoading: false });
        } catch (e) {
          set({ isLoading: false });
          throw e;
        }
      },

      updateAvatar: async (avatar) => {
        const { token, user } = get();
        if (!token || !user) throw new Error('Not signed in.');
        const updated = await api.users.updateMe({ avatar }, token);
        const next = { ...user, avatar: updated.avatar ?? avatar };
        set({ user: withGender(next) });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setAuth: (user, token) => {
        set({ user: withGender(user), token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
