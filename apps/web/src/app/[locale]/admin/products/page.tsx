"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import { useCategoryTree } from "@/hooks/use-categories";
import { useAdminProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-admin-products";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api/base";
import type { ProductListItem } from "@/lib/api/products";

interface FormValues {
  categoryId: string;
  sku: string;
  basePrice: number;
  name: string;
  slug: string;
  description: string;
}

function flatCategoryOptions(nodes: { id: string; name: string; children: unknown[] }[], depth = 0): { id: string; label: string }[] {
  return nodes.flatMap((node) => [
    { id: node.id, label: `${"—".repeat(depth)} ${node.name}` },
    ...flatCategoryOptions(node.children as typeof nodes, depth + 1),
  ]);
}

export default function AdminProductsPage() {
  const locale = useLocale();
  const { data: categories } = useCategoryTree(locale);
  const { data: products, isLoading } = useAdminProducts(locale);
  const createProduct = useCreateProduct(locale);
  const updateProduct = useUpdateProduct(locale);
  const deleteProduct = useDeleteProduct(locale);

  const [editing, setEditing] = useState<ProductListItem | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>();

  const startEdit = (product: ProductListItem) => {
    setEditing(product);
    setShowNew(false);
    reset({
      sku: product.sku,
      basePrice: product.basePrice,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
    });
  };

  const startNew = () => {
    setShowNew(true);
    setEditing(null);
    reset({ categoryId: categories?.[0]?.id ?? "", sku: "", basePrice: 0, name: "", slug: "", description: "" });
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      if (editing) {
        await updateProduct.mutateAsync({
          id: editing.id,
          input: {
            sku: values.sku,
            basePrice: Number(values.basePrice),
            translations: [{ locale: "NL", name: values.name, slug: values.slug, description: values.description || undefined }],
          },
        });
        setEditing(null);
      } else {
        await createProduct.mutateAsync({
          categoryId: values.categoryId,
          sku: values.sku,
          basePrice: Number(values.basePrice),
          translations: [{ locale: "NL", name: values.name, slug: values.slug, description: values.description || undefined }],
        });
        setShowNew(false);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Opslaan mislukt.");
    }
  };

  const categoryOptions = categories ? flatCategoryOptions(categories) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Producten</h1>
        <button
          type="button"
          onClick={startNew}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Nieuw product
        </button>
      </div>

      <p className="mb-4 text-xs text-zinc-400">
        Varianten, extra&apos;s, ingrediënten en allergenen worden beheerd via het menu-importscript, niet via dit
        formulier.
      </p>

      {(showNew || editing) && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 max-w-lg space-y-3 rounded-xl border border-zinc-200 bg-white p-4" noValidate>
          {showNew && (
            <select
              {...register("categoryId")}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            >
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="SKU"
              {...register("sku")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Prijs (€)"
              {...register("basePrice")}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          <input
            placeholder="Naam"
            {...register("name")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <input
            placeholder="Slug"
            {...register("slug")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <textarea
            placeholder="Omschrijving"
            {...register("description")}
            rows={2}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
              Opslaan
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNew(false);
                setEditing(null);
              }}
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
            <th className="px-4 py-2">SKU</th>
            <th className="px-4 py-2">Naam</th>
            <th className="px-4 py-2">Prijs</th>
            <th className="px-4 py-2">Actief</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {products?.items.map((product) => (
            <tr key={product.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-2 text-zinc-500">{product.sku}</td>
              <td className="px-4 py-2 text-ink">{product.name}</td>
              <td className="px-4 py-2 text-ink">{formatPrice(product.basePrice)}</td>
              <td className="px-4 py-2">{product.isActive ? "Ja" : "Nee"}</td>
              <td className="px-4 py-2 text-right">
                <button type="button" onClick={() => startEdit(product)} className="mr-3 text-zinc-400 hover:text-ink">
                  <Pencil className="inline h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteProduct.mutate(product.id)}
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
