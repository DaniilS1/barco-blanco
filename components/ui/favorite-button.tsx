"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";

import { FavoriteItem, useFavorites } from "@/context/favorites-context";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  item: FavoriteItem;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
}

const SIZE_STYLES: Record<NonNullable<FavoriteButtonProps["size"]>, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
};

const LABELED_STYLE =
  "h-11 px-6 py-2 text-base font-semibold rounded-lg gap-2 border border-[#1996A3]";

export function FavoriteButton({
  item,
  className,
  size = "md",
  showLabel = false,
  label = "",
}: FavoriteButtonProps) {
  const {
    toggleFavorite,
    isFavorite,
    isFavoritesLoaded,
    isLocalStorageAvailable,
  } = useFavorites();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = useMemo(() => {
    if (!isFavoritesLoaded) return false;
    return isFavorite(item.id);
  }, [isFavorite, isFavoritesLoaded, item.id]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isLocalStorageAvailable) return;

    toggleFavorite(item);
  };

  const ariaLabel = isActive ? "Видалити з улюбленого" : "Додати до улюбленого";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center justify-center rounded-full border border-[#1996A3] bg-white/80 text-[#1996A3] backdrop-blur transition hover:bg-[#1996A3] hover:text-white",
        showLabel ? LABELED_STYLE : SIZE_STYLES[size],
        isActive && "bg-[#1996A3] text-white",
        !isClient && "pointer-events-none opacity-0",
        className,
      )}
      aria-pressed={isActive}
      aria-label={label || ariaLabel}
      title={label || ariaLabel}
      disabled={!isLocalStorageAvailable}
    >
      <Heart
        aria-hidden="true"
        className="h-5 w-5 transition group-hover:scale-110"
        strokeWidth={1.8}
        fill={isActive ? "currentColor" : "none"}
      />
      {showLabel && (
        <span className="text-base font-medium">
          {label || (isActive ? "В улюбленому" : "В улюблене")}
        </span>
      )}
    </button>
  );
}


