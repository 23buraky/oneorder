"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { useCreateEmployee, useDeleteEmployee, useEmployees, useUpdateEmployee } from "@/hooks/use-employees";
import { ApiError } from "@/lib/api/base";
import type { CreateEmployeeInput } from "@/lib/api/employees";

const ROLES = ["KITCHEN", "CASHIER", "MANAGER"];

export default function AdminEmployeesPage() {
  const { data: employees, isLoading } = useEmployees();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<CreateEmployeeInput>({ defaultValues: { role: "KITCHEN" } });

  const onSubmit = async (values: CreateEmployeeInput) => {
    setError(null);
    try {
      await createEmployee.mutateAsync(values);
      setShowNew(false);
      reset();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Aanmaken mislukt.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Medewerkers</h1>
        <button
          type="button"
          onClick={() => setShowNew((v) => !v)}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Nieuwe medewerker
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 max-w-lg space-y-3 rounded-xl border border-zinc-200 bg-white p-4" noValidate>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Voornaam"
              {...register("firstName")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <input
              placeholder="Achternaam"
              {...register("lastName")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          <input
            type="email"
            placeholder="E-mailadres"
            {...register("email")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              {...register("role")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <input
              placeholder="PIN (4-6 cijfers)"
              {...register("pin")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
              Aanmaken
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-zinc-50"
            >
              Annuleren
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      <table className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2">Naam</th>
            <th className="px-4 py-2">E-mail</th>
            <th className="px-4 py-2">Rol</th>
            <th className="px-4 py-2">Actief</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {employees?.map((employee) => (
            <tr key={employee.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-2 text-ink">
                {employee.firstName} {employee.lastName}
              </td>
              <td className="px-4 py-2 text-zinc-500">{employee.email}</td>
              <td className="px-4 py-2 text-zinc-600">{employee.role}</td>
              <td className="px-4 py-2">
                <button
                  type="button"
                  onClick={() => updateEmployee.mutate({ id: employee.id, input: { isActive: !employee.isActive } })}
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    employee.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {employee.isActive ? "Actief" : "Inactief"}
                </button>
              </td>
              <td className="px-4 py-2 text-right">
                <button
                  type="button"
                  onClick={() => deleteEmployee.mutate(employee.id)}
                  className="text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="inline h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
