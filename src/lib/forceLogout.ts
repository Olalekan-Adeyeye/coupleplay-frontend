import { useAuthStore } from "@/stores/authStore";
import { useSocketStore } from "@/hooks/useSocket";
import { useCoupleStore } from "@/stores/coupleStore";

/**
 * Session reset on invalid auth (401) or an unresolvable local session.
 * Clears auth + realtime session so the app drops back to the login flow.
 */
export function handleForceLogout() {
  useAuthStore.getState().logout();
  useSocketStore.getState().disconnect();
  useCoupleStore.getState().setCouple(null);
}
