import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { createCoupon, deleteCoupon, listCoupons, updateCoupon, type CouponInput } from "@/lib/api/coupons";

export function useAdminCoupons() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: () => listCoupons(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useCreateCoupon() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CouponInput) => createCoupon(input, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });
}

export function useUpdateCoupon() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CouponInput> }) =>
      updateCoupon(id, input, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });
}

export function useDeleteCoupon() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCoupon(id, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });
}
