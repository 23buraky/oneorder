import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { addFavorite, listFavorites, removeFavorite } from "@/lib/api/favorites";

export function useFavorites(locale: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["favorites", locale],
    queryFn: () => listFavorites(locale, session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useAddFavorite(locale: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => addFavorite(productId, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", locale] }),
  });
}

export function useRemoveFavorite(locale: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeFavorite(productId, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites", locale] }),
  });
}
