import { create } from 'zustand';
import { api } from '../lib/api';
import { StatsOverview, ActivityGroup, Achievement } from '../types/stats';

interface StatsState {
  overview: StatsOverview;
  activity: ActivityGroup[];
  achievements: Achievement[];
  isLoadingOverview: boolean;
  isLoadingActivity: boolean;
  isLoadingAchievements: boolean;
  fetchOverview: (token: string) => Promise<void>;
  fetchActivity: (token: string) => Promise<void>;
  fetchAchievements: (token: string) => Promise<void>;
}

const DEFAULT_OVERVIEW: StatsOverview = {
  streak: 0,
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winRate: 0,
  xp: 0,
};

export const useStatsStore = create<StatsState>((set) => ({
  overview: DEFAULT_OVERVIEW,
  activity: [],
  achievements: [],
  isLoadingOverview: false,
  isLoadingActivity: false,
  isLoadingAchievements: false,

  fetchOverview: async (token) => {
    set({ isLoadingOverview: true });
    try {
      const overview = await api.stats.getOverview(token);
      set({ overview, isLoadingOverview: false });
    } catch (e) {
      set({ isLoadingOverview: false });
      throw e;
    }
  },

  fetchActivity: async (token) => {
    set({ isLoadingActivity: true });
    try {
      const activity = await api.stats.getActivity(token);
      set({ activity, isLoadingActivity: false });
    } catch (e) {
      set({ isLoadingActivity: false });
      throw e;
    }
  },

  fetchAchievements: async (token) => {
    set({ isLoadingAchievements: true });
    try {
      const rawAchievements = await api.stats.getAchievements(token);
      const achievements: Achievement[] = rawAchievements.map((a) => ({
        ...a,
        category: a.category as 'milestone' | 'game' | 'special',
      }));
      set({ achievements, isLoadingAchievements: false });
    } catch (e) {
      set({ isLoadingAchievements: false });
      throw e;
    }
  },
}));
