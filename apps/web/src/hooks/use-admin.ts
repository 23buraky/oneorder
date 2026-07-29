import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  getDashboardStats,
  getRestaurantForceClosed,
  listAdminOrders,
  setRestaurantForceClosed,
  updateOrderStatus,
  type DashboardPeriod,
} from "@/lib/api/admin";

export function useDashboardStats(params: { period: DashboardPeriod; from?: string; to?: string }) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["admin", "dashboard", params],
    queryFn: () => getDashboardStats(session!.accessToken, params),
    enabled: Boolean(session?.accessToken) && (params.period !== "CUSTOM" || Boolean(params.from && params.to)),
  });
}

export function useRestaurantForceClosed() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["admin", "restaurant-force-closed"],
    queryFn: () => getRestaurantForceClosed(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useSetRestaurantForceClosed() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (forceClosed: boolean) => setRestaurantForceClosed(forceClosed, session!.accessToken),
    onSuccess: (result) => {
      queryClient.setQueryData(["admin", "restaurant-force-closed"], result);
    },
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
