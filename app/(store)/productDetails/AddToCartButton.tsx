// app/(store)/productDetails/AddToCartButton.tsx
"use client";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: { asset: { url: string } }[];
    slug?: { current: string };
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  return (
    <Button
      className="w-3/4 bg-[#1996a3] hover:bg-[#147a86] text-white"
      onClick={() =>
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image[0]?.asset?.url || "/images/placeholder.svg",
          quantity: 1,
          slug: product.slug,
        })
      }
    >
      Add to Cart
    </Button>
  );
}
