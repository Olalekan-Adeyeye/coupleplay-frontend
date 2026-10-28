import { getApiBaseUrl } from './env';

const API_BASE = getApiBaseUrl();

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Called when the API rejects an auth token, so the app can force logout. */
type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  onUnauthorized = handler;
}

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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Network request failed. Check your connection.', 0);
  }

  if (!res.ok) {
    if (res.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(error.message ?? 'Request failed', res.status);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (null as any);
}

export const api = {
  auth: {
    register: (data: { email: string; username: string; name: string; password: string; avatar?: string }) =>
      request<{ user: any; token: string }>('/auth/register', { method: 'POST', body: data }),

    login: (data: { email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: data }),

    getProfile: (token: string) =>
      request<any>('/auth/profile', { token }),

    requestPasswordReset: (email: string) =>
      request<{ ok: boolean }>('/auth/password-reset', { method: 'POST', body: { email } }),
  },

  couples: {
    getMyCouple: (token: string) =>
      request<any>('/couples/me', { token }),

    generateInvite: (token: string) =>
      request<any>('/couples/invite', { method: 'POST', token }),

    joinByCode: (code: string, token: string) =>
      request<any>(`/couples/join/${encodeURIComponent(code)}`, { method: 'POST', token }),

    unlink: (token: string) =>
      request<any>('/couples/unlink', { method: 'DELETE', token }),
  },

  rooms: {
    create: (data: { coupleId: string; gameType: string; totalRounds?: number }, token: string) =>
      request<any>('/rooms', { method: 'POST', body: data, token }),

    getActive: (token: string, gameType?: string) => {
      const qs = gameType ? `?gameType=${encodeURIComponent(gameType)}` : '';
      return request<any>(`/rooms/active${qs}`, { token });
    },

    get: (id: string, token: string) =>
      request<any>(`/rooms/${id}`, { token }),

    join: (id: string, token: string) =>
      request<any>(`/rooms/${id}/join`, { method: 'POST', token }),
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

    getActivity: (token: string, cursor?: string) =>
      request<{
        groups: {
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
        }[];
        nextCursor: string | null;
      }>(`/stats/activity${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`, {
        token,
      }),

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

    updateMe: (data: { avatar: string }, token: string) =>
      request<any>('/users/me', { method: 'PATCH', body: data, token }),
  },
};
