import { create } from 'zustand';
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

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, name: string, password: string, gender?: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await api.auth.login({ email, password });
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  register: async (email, username, name, password, gender) => {
    set({ isLoading: true });
    try {
      const { user, token } = await api.auth.register({ email, username, name, password, gender });
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  },

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
  },
}));
