export interface StatsOverview {
  streak: number;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  xp: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  xp: string;
  time: string;
  icon: string;
  color: string;
  bg: string;
  gameType: string;
}

export interface ActivityGroup {
  day: string;
  items: ActivityItem[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  category: 'milestone' | 'game' | 'special';
}
