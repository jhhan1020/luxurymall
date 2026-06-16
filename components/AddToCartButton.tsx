"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        onClick={handleAdd}
        className="flex-1 rounded-sm border border-foreground bg-transparent px-8 py-4 text-sm tracking-luxe text-foreground transition hover:bg-foreground hover:text-background"
      >
        {added ? "장바구니에 담았어요 ✓" : "장바구니 담기"}
      </button>
      <button
        onClick={() => {
          addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
          });
          router.push("/cart");
        }}
        className="flex-1 rounded-sm bg-accent px-8 py-4 text-sm tracking-luxe text-white transition hover:opacity-90"
      >
        바로 구매
      </button>
    </div>
  );
}
