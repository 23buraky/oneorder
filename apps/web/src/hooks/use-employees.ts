import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "@/lib/api/employees";

export function useEmployees() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: ["admin", "employees"],
    queryFn: () => listEmployees(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });
}

export function useCreateEmployee() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => createEmployee(input, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "employees"] }),
  });
}

export function useUpdateEmployee() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmployeeInput }) =>
      updateEmployee(id, input, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "employees"] }),
  });
}

export function useDeleteEmployee() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id, session!.accessToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "employees"] }),
  });
}
