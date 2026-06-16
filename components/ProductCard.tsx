import Link from "next/link";
import ProductImage from "./ProductImage";
import { CATEGORY_LABELS, formatPrice, type Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-card">
        <ProductImage src={product.image_url} alt={product.name} />
        <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-[10px] tracking-luxe text-muted">
          {CATEGORY_LABELS[product.category]}
        </span>
      </div>
      <div className="mt-4 px-1">
        <p className="text-[11px] tracking-luxe text-muted">{product.brand}</p>
        <h3 className="mt-1 font-serif text-lg text-foreground group-hover:text-accent">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-foreground/80">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
