import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { changePassword, getProfile, updateProfile, type UpdateProfileInput } from "@/lib/api/users";

export function useProfile() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useUpdateProfile() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input, session!.accessToken),
    onSuccess: (profile) => queryClient.setQueryData(["profile"], profile),
  });
}

export function useChangePassword() {
  const { data: session } = useSession();
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      changePassword(input, session!.accessToken),
  });
}
