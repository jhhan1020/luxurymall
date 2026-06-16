import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductImage from "@/components/ProductImage";
import AddToCartButton from "@/components/AddToCartButton";
import { CATEGORY_LABELS, formatPrice, type Product } from "@/lib/types";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const product = data as Product;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/products" className="text-sm text-muted hover:text-accent">
        ← 컬렉션으로
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* 사진 */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-card">
          <ProductImage src={product.image_url} alt={product.name} priority />
        </div>

        {/* 정보 */}
        <div className="flex flex-col justify-center">
          <p className="text-xs tracking-luxe text-accent">
            {product.brand} · {CATEGORY_LABELS[product.category]}
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight">
            {product.name}
          </h1>
          <p className="mt-5 text-2xl text-foreground/90">
            {formatPrice(product.price)}
          </p>

          <p className="mt-8 leading-relaxed text-foreground/80">
            {product.description}
          </p>

          <div className="mt-10">
            <AddToCartButton product={product} />
          </div>

          <ul className="mt-10 space-y-2 border-t border-line pt-8 text-sm text-muted">
            <li>· 장인이 완성한 정품 보증</li>
            <li>· 주문 확인 후 2~5 영업일 이내 발송</li>
            <li>· 수령 후 7일 이내 반품/교환 가능</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
