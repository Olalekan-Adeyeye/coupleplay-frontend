import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";

export function usePartner() {
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);

  if (couple?.userBId == null) return null;
  return couple.userAId === user?.id ? couple.userB : couple.userA;
}
