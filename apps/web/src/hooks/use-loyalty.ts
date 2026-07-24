import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getLoyaltyTransactions, getMyLoyalty } from "@/lib/api/loyalty";

export function useLoyalty() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["loyalty"],
    queryFn: () => getMyLoyalty(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useLoyaltyTransactions() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["loyalty", "transactions"],
    queryFn: () => getLoyaltyTransactions(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}
