"use client";

import { Heart } from "lucide-react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { useAddFavorite, useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";

export function FavoriteButton({ productId, className }: { productId: string; className?: string }) {
  const locale = useLocale();
  const { status } = useSession();
  const { data: favorites } = useFavorites(locale);
  const addFavorite = useAddFavorite(locale);
  const removeFavorite = useRemoveFavorite(locale);

  if (status !== "authenticated") {
    return null;
  }

  const isFavorite = favorites?.some((favorite) => favorite.id === productId) ?? false;

  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (isFavorite) {
      removeFavorite.mutate(productId);
    } else {
      addFavorite.mutate(productId);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="favorite"
      className={`flex items-center justify-center rounded-full bg-white/90 p-2 text-ink shadow-sm transition hover:scale-105 ${className ?? ""}`}
    >
      <Heart className="h-4 w-4" fill={isFavorite ? "#D4AF37" : "none"} strokeWidth={1.75} />
    </button>
  );
}
