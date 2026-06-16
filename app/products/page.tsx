import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_LABELS, type Category, type Product } from "@/lib/types";

const TABS: { key: Category | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "bag", label: "가방" },
  { key: "wallet", label: "지갑" },
  { key: "accessory", label: "액세서리" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active: Category | "all" = (["bag", "wallet", "accessory"] as const).includes(
    category as Category
  )
    ? (category as Category)
    : "all";

  const supabase = await createClient();
  let query = supabase.from("products").select("*").order("price", { ascending: false });
  if (active !== "all") {
    query = query.eq("category", active);
  }
  const { data } = await query;
  const products = (data ?? []) as Product[];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="text-center">
        <p className="text-xs tracking-luxe text-accent">COLLECTION</p>
        <h1 className="mt-3 font-serif text-4xl">
          {active === "all" ? "전체 컬렉션" : CATEGORY_LABELS[active as Category]}
        </h1>
      </header>

      {/* 카테고리 탭 */}
      <nav className="mt-10 flex justify-center gap-2">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          const href =
            tab.key === "all" ? "/products" : `/products?category=${tab.key}`;
          return (
            <Link
              key={tab.key}
              href={href}
              className={`rounded-full px-5 py-2 text-sm transition ${
                isActive
                  ? "bg-foreground text-background"
                  : "border border-line text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {/* 상품 그리드 */}
      {products.length === 0 ? (
        <p className="mt-20 text-center text-muted">상품이 없습니다.</p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
