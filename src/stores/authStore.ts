import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { avatarGender } from '../components/peeps/peeps';
import { api } from '../lib/api';

const TOKEN_KEY = 'auth.token';

async function saveToken(token: string | null) {
  if (Platform.OS === 'web') return;
  try {
    if (token === null) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } else {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
  } catch {
    // SecureStore can be unavailable on simulators without passcode —
    // the session simply won't survive restart in that case.
  }
}

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
  /** Reads the secure token store — run once at startup before routing. */
  hydrateToken: () => Promise<boolean>;
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

      hydrateToken: async () => {
        if (Platform.OS === 'web') return false;
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!token) return false;
        set({ token });
        return true;
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await api.auth.login({ email, password });
          await saveToken(token);
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
          await saveToken(token);
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
        void saveToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      setAuth: (user, token) => {
        void saveToken(token);
        set({ user: withGender(user), token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
