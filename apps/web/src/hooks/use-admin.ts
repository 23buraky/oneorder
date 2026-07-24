import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getDashboardStats, listAdminOrders, updateOrderStatus } from "@/lib/api/admin";

export function useDashboardStats() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => getDashboardStats(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useAdminOrders(params: { status?: string; type?: string; page?: number; pageSize?: number }) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: () => listAdminOrders(params, session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useUpdateOrderStatus() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderNumber, status, note }: { orderNumber: string; status: string; note?: string }) =>
      updateOrderStatus(orderNumber, status, session!.accessToken, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
