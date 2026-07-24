import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
  type AddressInput,
} from "@/lib/api/addresses";

export function useAddresses() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["addresses"],
    queryFn: () => listAddresses(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useCreateAddress() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => createAddress(input, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useUpdateAddress() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<AddressInput> }) =>
      updateAddress(id, input, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAddress(id, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["addresses"] }),
  });
}
