import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { checkout, getOrder, listMyOrders, type CheckoutInput } from "@/lib/api/orders";
import { validateCoupon } from "@/lib/api/coupons";

export function useCheckout(locale: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: (input: CheckoutInput) => checkout(input, locale, session?.accessToken),
    onSuccess: () => {
      // The cart is emptied server-side as part of a successful checkout.
      queryClient.setQueryData(["cart", locale], undefined);
      queryClient.invalidateQueries({ queryKey: ["cart", locale] });
    },
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) => validateCoupon(code, subtotal),
  });
}

export function useOrder(orderNumber: string, guestEmail?: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["orders", orderNumber, guestEmail],
    queryFn: () => getOrder(orderNumber, guestEmail, session?.accessToken),
    enabled: Boolean(orderNumber),
    retry: false,
  });
}

export function useMyOrders() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["orders", "mine"],
    queryFn: () => listMyOrders(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}
