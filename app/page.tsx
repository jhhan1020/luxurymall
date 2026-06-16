import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { ShaderAnimation } from "@/components/ui/shader-lines";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(6);

  const featured = (products ?? []) as Product[];

  return (
    <>
      {/* 히어로 — Three.js 셰이더 애니메이션 배경 */}
      <section className="relative flex h-[88vh] items-center justify-center overflow-hidden bg-black">
        {/* 움직이는 빛의 선 애니메이션 */}
        <ShaderAnimation />
        {/* 가독성을 위한 살짝의 어둠막 */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
        <div className="pointer-events-none relative z-10 max-w-2xl px-6 text-center text-white">
          <p className="text-xs tracking-luxe">MAISON LUXE · SINCE 2026</p>
          <h1 className="mt-6 font-serif text-5xl font-medium leading-tight md:text-7xl">
            장인의 손끝에서
            <br />
            완성되는 명품
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm text-white/80">
            한 점 한 점 손바느질로 빚어낸 핸드백과 액세서리.
            시간이 지나도 변치 않는 가치를 입어보세요.
          </p>
          <Link
            href="/products"
            className="pointer-events-auto mt-10 inline-block rounded-sm border border-white px-10 py-4 text-sm tracking-luxe transition hover:bg-white hover:text-foreground"
          >
            컬렉션 보기
          </Link>
        </div>
      </section>

      {/* 카테고리 바로가기 */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { key: "bag", label: "가방", desc: "시그니처 핸드백" },
            { key: "wallet", label: "지갑", desc: "데일리 레더 굿즈" },
            { key: "accessory", label: "액세서리", desc: "스타일의 마침표" },
          ].map((c) => (
            <Link
              key={c.key}
              href={`/products?category=${c.key}`}
              className="group rounded-sm border border-line bg-card px-8 py-12 text-center transition hover:border-accent"
            >
              <p className="font-serif text-2xl text-foreground group-hover:text-accent">
                {c.label}
              </p>
              <p className="mt-2 text-sm text-muted">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 신상품 */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs tracking-luxe text-accent">NEW ARRIVALS</p>
            <h2 className="mt-2 font-serif text-3xl">신상품</h2>
          </div>
          <Link href="/products" className="text-sm text-muted hover:text-accent">
            전체 보기 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
