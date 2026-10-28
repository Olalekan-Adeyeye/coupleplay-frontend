import { usePartner } from "@/hooks/usePartner";

export function usePartnerName(): string {
  const partner = usePartner();
  return partner?.name?.split(" ")[0] ?? "Partner";
}
