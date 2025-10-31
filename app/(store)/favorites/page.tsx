"use client";

import { DragEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CartItem, useCart } from "@/context/CartContext";
import { FavoriteItem, useFavorites } from "@/context/favorites-context";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { cn } from "@/lib/utils";

export default function FavoritesPage() {
  const { favorites, clearFavorites, getTotalFavorites, reorderFavorites } = useFavorites();
  const { addToCart } = useCart();

  const totalFavorites = getTotalFavorites();
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleAddToCart = (favorite: FavoriteItem) => {
    const cartItem: CartItem = {
      id: favorite.id,
      name: favorite.name,
      price: favorite.price,
      image: favorite.image,
      quantity: 1,
      slug: favorite.slug ? { current: favorite.slug } : undefined,
    };

    addToCart(cartItem);
  };

  const handleDragStart = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    setDraggingIndex(index);
    setDragOverIndex(null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  };

  const handleDragOver = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (index: number) => () => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (index: number) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const fromIndexString = event.dataTransfer.getData("text/plain");
    const fromIndex =
      draggingIndex !== null
        ? draggingIndex
        : fromIndexString
          ? Number.parseInt(fromIndexString, 10)
          : Number.NaN;

    setDraggingIndex(null);
    setDragOverIndex(null);

    if (Number.isNaN(fromIndex)) return;
    if (fromIndex === index) return;

    reorderFavorites(fromIndex, index);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  if (favorites.length === 0) {
    return (
      <div className="w-full max-w-[1200px] mx-auto py-12 px-4 sm:px-6 flex flex-col items-center text-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Список улюбленого порожній
        </h1>
        <p className="text-gray-600 max-w-xl">
          Додайте товари, які вам сподобались, щоб мати швидкий доступ до них у будь-який момент.
        </p>
        <Button asChild className="bg-[#1996A3] hover:bg-[#147A86] text-white px-6 py-3 rounded-lg">
          <Link href="/products">Перейти до каталогу</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto py-6 px-4 sm:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
          Улюблене
          <span className="ml-3 text-[#1996A3] text-xl sm:text-2xl font-semibold">
            {totalFavorites}
          </span>
        </h1>
        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            onClick={clearFavorites}
            className="border-[#1996A3] text-[#1996A3] hover:bg-[#1996A3] hover:text-white"
          >
            Очистити улюблене
          </Button>
          <Button asChild className="bg-[#1996A3] hover:bg-[#147A86] text-white">
            <Link href="/basket">Перейти до кошика</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites.map((favorite, index) => {
          const isAvailable = favorite.isAvailable !== false;
          const availabilityColor = isAvailable ? "bg-green-500" : "bg-red-500";

          return (
            <div
              key={favorite.id}
              draggable
              onDragStart={handleDragStart(index)}
              onDragOver={handleDragOver(index)}
              onDragLeave={handleDragLeave(index)}
              onDrop={handleDrop(index)}
              onDragEnd={handleDragEnd}
              aria-grabbed={draggingIndex === index}
              className={cn(
                "flex h-full cursor-move flex-col justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-lg",
                dragOverIndex === index && "border-dashed border-[#1996A3] bg-[#f0fbfd]",
                draggingIndex === index && "opacity-70"
              )}
            >
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-gray-50">
                  <Link href={favorite.slug ? `/productDetails/${favorite.slug}` : "#"}>
                    <Image
                      src={favorite.image || "/images/placeholder.svg"}
                      alt={favorite.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  </Link>
                  <FavoriteButton
                    item={favorite}
                    size="sm"
                    className="absolute right-3 top-3 shadow-md"
                  />
                </div>
                <div className="mt-3 flex flex-col gap-1.5">
                  <Link
                    href={favorite.slug ? `/productDetails/${favorite.slug}` : "#"}
                    className="text-base font-semibold text-[#1996A3] hover:text-[#147A86] transition"
                  >
                    {favorite.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("inline-flex h-2.5 w-2.5 rounded-full", availabilityColor)}
                      aria-label={isAvailable ? "В наявності" : "Немає в наявності"}
                    />
                    <p className="text-lg font-medium text-gray-900">₴{favorite.price}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2.5">
                <Button
                  onClick={() => handleAddToCart(favorite)}
                  className="flex-1 bg-[#4FA7B9] hover:bg-[#1996A3] text-white"
                >
                  Додати в кошик
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


