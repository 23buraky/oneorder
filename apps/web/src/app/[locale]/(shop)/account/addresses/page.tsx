"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress } from "@/hooks/use-addresses";
import { AddressForm } from "@/components/account/address-form";
import { ApiError } from "@/lib/api/base";
import type { AddressInput } from "@/lib/api/addresses";

export default function AccountAddressesPage() {
  const t = useTranslations("account.addresses");
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (values: AddressInput) => {
    setError(null);
    try {
      await createAddress.mutateAsync(values);
      setShowNewForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    }
  };

  const handleUpdate = async (id: string, values: AddressInput) => {
    setError(null);
    try {
      await updateAddress.mutateAsync({ id, input: values });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("genericError"));
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-ink">{t("title")}</h1>

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      {addresses && addresses.length === 0 && !showNewForm && (
        <p className="mb-4 text-sm text-zinc-500">{t("empty")}</p>
      )}

      <div className="space-y-3">
        {addresses?.map((address) =>
          editingId === address.id ? (
            <AddressForm
              key={address.id}
              initial={address}
              isSubmitting={updateAddress.isPending}
              onSubmit={(values) => handleUpdate(address.id, values)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={address.id} className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                  {address.label}
                  {address.isDefault && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase text-gold-dark">
                      {t("default")}
                    </span>
                  )}
                </p>
                <p className="text-sm text-zinc-500">
                  {address.street} {address.houseNumber}
                  {address.box ? `/${address.box}` : ""}, {address.postalCode} {address.city}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label={t("edit")}
                  onClick={() => setEditingId(address.id)}
                  className="text-zinc-400 hover:text-ink"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label={t("delete")}
                  onClick={() => deleteAddress.mutate(address.id)}
                  className="text-zinc-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ),
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {showNewForm ? (
        <div className="mt-4">
          <AddressForm isSubmitting={createAddress.isPending} onSubmit={handleCreate} onCancel={() => setShowNewForm(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="mt-4 rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-zinc-50"
        >
          {t("addNew")}
        </button>
      )}
    </div>
  );
}
