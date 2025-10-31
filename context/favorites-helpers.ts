export interface FavoriteItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug?: string;
  isAvailable?: boolean;
}

export function parseFavorites(rawValue: string | null): FavoriteItem[] {
  if (!rawValue) return [];

  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item: unknown): item is FavoriteItem => {
      if (typeof item !== "object" || item === null) return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.price === "number" &&
        typeof candidate.image === "string" &&
        (typeof candidate.slug === "string" || typeof candidate.slug === "undefined") &&
        (typeof candidate.isAvailable === "boolean" || typeof candidate.isAvailable === "undefined")
      );
    });
  } catch (error) {
    console.error("Error parsing favorites from localStorage", error);
    return [];
  }
}

export function toggleFavoriteEntry(
  favorites: FavoriteItem[],
  item: FavoriteItem,
): FavoriteItem[] {
  const exists = favorites.some((favoriteItem) => favoriteItem.id === item.id);
  if (exists) {
    return favorites.filter((favoriteItem) => favoriteItem.id !== item.id);
  }
  return [...favorites, item];
}

export function reorderFavoritesArray(
  favorites: FavoriteItem[],
  startIndex: number,
  endIndex: number,
) {
  if (
    startIndex === endIndex ||
    startIndex < 0 ||
    endIndex < 0 ||
    startIndex >= favorites.length ||
    endIndex >= favorites.length
  ) {
    return favorites;
  }

  const updated = [...favorites];
  const [movedItem] = updated.splice(startIndex, 1);
  updated.splice(endIndex, 0, movedItem);
  return updated;
}

export function isStorageWritable(storage: Storage) {
  try {
    const testKey = "__favorites_ls_test__";
    storage.setItem(testKey, "ok");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    console.error("Favorites localStorage not available", error);
    return false;
  }
}

export function persistFavorites(
  storage: Pick<Storage, "setItem">,
  favorites: FavoriteItem[],
) {
  storage.setItem("favorites", JSON.stringify(favorites));
}


