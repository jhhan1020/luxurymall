"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import ProductImage from "@/components/ProductImage";
import { formatPrice } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalCount, totalPrice } =
    useCart();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  // 새로고침 직후 localStorage 로딩 깜빡임 방지
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  async function handleCheckout() {
    setChecking(true);
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      // 로그인 안 했으면 로그인 페이지로 (돌아올 주소 기억)
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout");
  }

  // 빈 장바구니
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-28 text-center">
        <h1 className="font-serif text-3xl">장바구니가 비어 있어요</h1>
        <p className="mt-4 text-muted">
          마음에 드는 명품을 담아보세요.
        </p>
        <Link
          href="/products"
          className="mt-10 inline-block rounded-sm bg-accent px-10 py-4 text-sm tracking-luxe text-white transition hover:opacity-90"
        >
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-end justify-between">
        <h1 className="font-serif text-4xl">장바구니</h1>
        <button
          onClick={clearCart}
          className="text-sm text-muted hover:text-accent"
        >
          전체 비우기
        </button>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* 상품 목록 */}
        <ul className="lg:col-span-2 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="flex gap-5 py-6">
              <Link
                href={`/products/${item.id}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden rounded-sm bg-card"
              >
                <ProductImage src={item.image_url} alt={item.name} />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <Link
                    href={`/products/${item.id}`}
                    className="font-serif text-lg hover:text-accent"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-sm text-muted hover:text-accent"
                    aria-label="삭제"
                  >
                    삭제
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  {/* 수량 조절 */}
                  <div className="flex items-center rounded-sm border border-line">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1.5 text-muted hover:text-accent"
                      aria-label="수량 줄이기"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3 py-1.5 text-muted hover:text-accent"
                      aria-label="수량 늘리기"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* 결제 요약 */}
        <aside className="h-fit rounded-sm border border-line bg-card p-8">
          <h2 className="font-serif text-xl">주문 요약</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">상품 수량</dt>
              <dd>{totalCount}개</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">배송비</dt>
              <dd>무료</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-medium">
              <dt>총 결제금액</dt>
              <dd className="text-accent">{formatPrice(totalPrice)}</dd>
            </div>
          </dl>
          <button
            onClick={handleCheckout}
            disabled={checking}
            className="mt-8 w-full rounded-sm bg-accent px-8 py-4 text-sm tracking-luxe text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {checking ? "확인 중…" : "결제하기"}
          </button>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-muted hover:text-accent"
          >
            쇼핑 계속하기
          </Link>
        </aside>
      </div>
    </div>
  );
}
