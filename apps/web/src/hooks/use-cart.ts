import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
  type AddCartItemInput,
  type CartView,
} from "@/lib/api/cart";

const cartKey = (locale: string) => ["cart", locale];

export function useCart(locale: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: cartKey(locale),
    queryFn: () => getCart(locale, session?.accessToken),
  });
}

export function useAddCartItem(locale: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: (input: AddCartItemInput) => addCartItem(input, locale, session?.accessToken),
    onSuccess: (cart) => queryClient.setQueryData<CartView>(cartKey(locale), cart),
  });
}

export function useUpdateCartItemQuantity(locale: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateCartItemQuantity(itemId, quantity, locale, session?.accessToken),
    onSuccess: (cart) => queryClient.setQueryData<CartView>(cartKey(locale), cart),
  });
}

export function useRemoveCartItem(locale: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId, locale, session?.accessToken),
    onSuccess: (cart) => queryClient.setQueryData<CartView>(cartKey(locale), cart),
  });
}

export function useClearCart(locale: string) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  return useMutation({
    mutationFn: () => clearCart(locale, session?.accessToken),
    onSuccess: (cart) => queryClient.setQueryData<CartView>(cartKey(locale), cart),
  });
}
