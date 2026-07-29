"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { Pencil, Trash2 } from "lucide-react";
import { useCategoryTree } from "@/hooks/use-categories";
import { useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/use-admin-categories";
import { ApiError } from "@/lib/api/base";
import type { CategoryNode } from "@/lib/api/categories";
import { ImageUpload } from "@/components/admin/image-upload";

interface FormValues {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
}

function flatten(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)]);
}

export default function AdminCategoriesPage() {
  const locale = useLocale();
  const { data: categories, isLoading } = useCategoryTree(locale);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormValues>();

  const startEdit = (category: CategoryNode) => {
    setEditingId(category.id);
    setShowNew(false);
    reset({ slug: category.slug, name: category.name, description: category.description ?? "", imageUrl: category.imageUrl ?? "" });
  };

  const startNew = () => {
    setShowNew(true);
    setEditingId(null);
    reset({ slug: "", name: "", description: "", imageUrl: "" });
  };

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      if (editingId) {
        await updateCategory.mutateAsync({
          id: editingId,
          input: {
            slug: values.slug,
            imageUrl: values.imageUrl || undefined,
            translations: [{ locale: "NL", name: values.name, description: values.description || undefined }],
          },
        });
        setEditingId(null);
      } else {
        await createCategory.mutateAsync({
          slug: values.slug,
          imageUrl: values.imageUrl || undefined,
          translations: [{ locale: "NL", name: values.name, description: values.description || undefined }],
        });
        setShowNew(false);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Opslaan mislukt.");
    }
  };

  const flatCategories = categories ? flatten(categories) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-ink">Categorieën</h1>
        <button
          type="button"
          onClick={startNew}
          className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Nieuwe categorie
        </button>
      </div>

      {isLoading && <p className="text-sm text-zinc-500">...</p>}

      {(showNew || editingId) && (
        <form onSubmit={handleSubmit(onSubmit)} className="mb-6 max-w-md space-y-3 rounded-xl border border-zinc-200 bg-white p-4" noValidate>
          <ImageUpload value={watch("imageUrl")} onChange={(url) => setValue("imageUrl", url)} />
          <input
            placeholder="Slug (bv. pizzas)"
            {...register("slug")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <input
            placeholder="Naam"
            {...register("name")}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-gold"
          />
          <textarea
            placeholder="Omschrijving (optioneel)"
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
                setEditingId(null);
              }}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-zinc-50"
            >
              Annuleren
            </button>
          </div>
        </form>
      )}

      <table className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-white text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-2" />
            <th className="px-4 py-2">Naam</th>
            <th className="px-4 py-2">Slug</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {flatCategories.map((category) => (
            <tr key={category.id} className="border-b border-zinc-100 last:border-0">
              <td className="px-4 py-2">
                {category.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of an arbitrary uploaded URL
                  <img src={category.imageUrl} alt="" className="h-8 w-8 rounded object-cover" />
                ) : null}
              </td>
              <td className="px-4 py-2 text-ink">{category.name}</td>
              <td className="px-4 py-2 text-zinc-500">{category.slug}</td>
              <td className="px-4 py-2 text-right">
                <button type="button" onClick={() => startEdit(category)} className="mr-3 text-zinc-400 hover:text-ink">
                  <Pencil className="inline h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteCategory.mutate(category.id)}
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
