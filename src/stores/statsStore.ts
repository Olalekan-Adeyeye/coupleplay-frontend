import { create } from 'zustand';
import { api } from '../lib/api';
import { StatsOverview, ActivityGroup, Achievement } from '../types/stats';

interface StatsState {
  overview: StatsOverview;
  activity: ActivityGroup[];
  activityCursor: string | null;
  achievements: Achievement[];
  isLoadingOverview: boolean;
  isLoadingActivity: boolean;
  isLoadingMoreActivity: boolean;
  isLoadingAchievements: boolean;
  fetchOverview: (token: string) => Promise<void>;
  fetchActivity: (token: string) => Promise<void>;
  fetchMoreActivity: (token: string) => Promise<void>;
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

export const useStatsStore = create<StatsState>((set, get) => ({
  overview: DEFAULT_OVERVIEW,
  activity: [],
  activityCursor: null,
  achievements: [],
  isLoadingOverview: false,
  isLoadingActivity: false,
  isLoadingMoreActivity: false,
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
      const { groups, nextCursor } = await api.stats.getActivity(token);
      set({ activity: groups, activityCursor: nextCursor, isLoadingActivity: false });
    } catch (e) {
      set({ isLoadingActivity: false });
      throw e;
    }
  },

  fetchMoreActivity: async (token) => {
    const { activity, activityCursor, isLoadingMoreActivity } = get();
    if (!activityCursor || isLoadingMoreActivity) return;
    set({ isLoadingMoreActivity: true });
    try {
      const { groups, nextCursor } = await api.stats.getActivity(token, activityCursor);
      const merged = activity.map((g) => ({ ...g, items: [...g.items] }));
      for (const group of groups) {
        const target = merged.find((g) => g.day === group.day);
        if (target) target.items.push(...group.items);
        else merged.push({ ...group, items: [...group.items] });
      }
      set({
        activity: merged,
        activityCursor: nextCursor,
        isLoadingMoreActivity: false,
      });
    } catch (e) {
      set({ isLoadingMoreActivity: false });
      throw e;
    }
  },

  fetchAchievements: async (token) => {
    set({ isLoadingAchievements: true });
    try {
      const rawAchievements = await api.stats.getAchievements(token);
      const achievements: Achievement[] = rawAchievements.map((a) => ({
        ...a,
        category: a.category as 'milestone' | 'special',
      }));
      set({ achievements, isLoadingAchievements: false });
    } catch (e) {
      set({ isLoadingAchievements: false });
      throw e;
    }
  },
}));
