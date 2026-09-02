import { getApiBaseUrl } from './env';

const API_BASE = getApiBaseUrl();

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? 'Request failed');
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (null as any);
}

export const api = {
  auth: {
    register: (data: { email: string; username: string; name: string; password: string; gender?: string }) =>
      request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: data }),

    login: (data: { email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: data }),

    getProfile: (token: string) =>
      request<any>('/auth/profile', { token }),

    verify: (email: string, code: string) =>
      request<{ verified: boolean }>('/auth/verify', { method: 'POST', body: { email, code } }),
  },

  couples: {
    getMyCouple: (token: string) =>
      request<any>('/couples/me', { token }),

    generateInvite: (token: string) =>
      request<any>('/couples/invite', { method: 'POST', token }),

    joinByCode: (code: string, token: string) =>
      request<any>(`/couples/join/${code}`, { method: 'POST', token }),

    unlink: (token: string) =>
      request<any>('/couples/unlink', { method: 'DELETE', token }),
  },

  rooms: {
    create: (data: { coupleId: string; gameType: string; totalRounds?: number }, token: string) =>
      request<any>('/rooms', { method: 'POST', body: data, token }),

    getActive: (coupleId: string, token: string) =>
      request<any>(`/rooms/active/${coupleId}`, { token }),

    get: (id: string, token: string) =>
      request<any>(`/rooms/${id}`, { token }),

    join: (id: string, token: string) =>
      request<any>(`/rooms/${id}/join`, { method: 'POST', token }),

    ready: (id: string, token: string) =>
      request<any>(`/rooms/${id}/ready`, { method: 'POST', token }),
  },

  games: {
    list: () => request<any[]>('/games'),
    get: (id: string) => request<any>(`/games/${id}`),
  },

  stats: {
    getOverview: (token: string) =>
      request<{
        streak: number;
        totalGames: number;
        wins: number;
        losses: number;
        draws: number;
        winRate: number;
        xp: number;
      }>('/stats/overview', { token }),

    getActivity: (token: string) =>
      request<
        {
          day: string;
          items: {
            id: string;
            title: string;
            xp: string;
            time: string;
            icon: string;
            color: string;
            bg: string;
            gameType: string;
          }[];
        }[]
      >('/stats/activity', { token }),

    getAchievements: (token: string) =>
      request<
        {
          id: string;
          name: string;
          description: string;
          icon: string;
          color: string;
          unlocked: boolean;
          unlockedAt: string | null;
          progress: number;
          category: string;
        }[]
      >('/stats/achievements', { token }),
  },

  users: {
    deleteAccount: (token: string) =>
      request<any>('/users/me', { method: 'DELETE', token }),
  },
};
