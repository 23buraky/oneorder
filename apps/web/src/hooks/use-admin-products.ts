import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createProduct,
  deleteProduct,
  listAllProductsForAdmin,
  updateProduct,
  type AdminProductInput,
} from "@/lib/api/products";

export function useAdminProducts(locale: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["admin", "products", locale],
    queryFn: () => listAllProductsForAdmin(locale),
    enabled: Boolean(session?.accessToken),
  });
}

export function useCreateProduct(locale: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminProductInput) => createProduct(input, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products", locale] }),
  });
}

export function useUpdateProduct(locale: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AdminProductInput> }) =>
      updateProduct(id, input, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products", locale] }),
  });
}

export function useDeleteProduct(locale: string) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products", locale] }),
  });
}
