import {
  FavoriteItem,
  isStorageWritable,
  parseFavorites,
  persistFavorites,
  toggleFavoriteEntry,
  reorderFavoritesArray,
} from "../../context/favorites-helpers";

const VALID_FAVORITES_JSON = JSON.stringify([
  {
    id: "fav-1",
    name: "Product 1",
    price: 1200,
    image: "/images/placeholder.svg",
    slug: "product-1",
    isAvailable: true,
  },
  {
    id: "fav-2",
    name: "Product 2",
    price: 999,
    image: "/images/placeholder.svg",
    isAvailable: false,
  },
]);

class MockStorage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

describe("favorites helpers", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {
      // suppress parse errors during tests
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("parses valid favorites and filters malformed entries", () => {
    const mixedJson = JSON.stringify([
      {
        id: "valid",
        name: "Valid",
        price: 10,
        image: "img.png",
        isAvailable: true,
      },
      { id: 12, name: null },
      "string-value",
    ]);

    const parsed = parseFavorites(mixedJson);

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ id: "valid", name: "Valid" });
  });

  it("returns empty array when JSON is invalid", () => {
    const parsed = parseFavorites("{invalid json}");
    expect(parsed).toEqual([]);
  });

  it("toggles entries idempotently", () => {
    const favorite: FavoriteItem = {
      id: "sample",
      name: "Sample",
      price: 100,
      image: "img.png",
      isAvailable: true,
    };

    const added = toggleFavoriteEntry([], favorite);
    expect(added).toHaveLength(1);

    const removed = toggleFavoriteEntry(added, favorite);
    expect(removed).toHaveLength(0);
  });

  it("reorders favorites by index", () => {
    const favorites = parseFavorites(VALID_FAVORITES_JSON);
    const reordered = reorderFavoritesArray(favorites, 0, 1);
    expect(reordered[0].id).toBe("fav-2");
    expect(reordered[1].id).toBe("fav-1");

    const unchanged = reorderFavoritesArray(favorites, 0, favorites.length);
    expect(unchanged).toBe(favorites);
  });

  it("persists favorites via storage", () => {
    const storage = new MockStorage();
    const favorites = parseFavorites(VALID_FAVORITES_JSON);

    persistFavorites(storage as unknown as Storage, favorites);

    const stored = storage.getItem("favorites");
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string)).toEqual(favorites);
  });

  it("validates storage write availability", () => {
    const writable = new MockStorage();
    const faulty = {
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => undefined,
    } as unknown as Storage;

    expect(isStorageWritable(writable as unknown as Storage)).toBe(true);
    expect(isStorageWritable(faulty)).toBe(false);
  });
});


