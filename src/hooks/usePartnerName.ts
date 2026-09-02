import { useAuthStore } from "@/stores/authStore";
import { useCoupleStore } from "@/stores/coupleStore";

export function usePartnerName(): string {
  const user = useAuthStore((s) => s.user);
  const couple = useCoupleStore((s) => s.couple);

  if (couple?.userBId != null) {
    const partner =
      couple.userAId === user?.id ? couple.userB : couple.userA;
    return partner?.name?.split(" ")[0] ?? "Partner";
  }
  return "Partner";
}
