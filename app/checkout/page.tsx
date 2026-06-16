"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadTossPayments,
  ANONYMOUS,
} from "@tosspayments/tosspayments-sdk";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/types";

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function CheckoutPage() {
  const { items, totalPrice, totalCount } = useCart();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 확인 + 장바구니 비었으면 돌려보내기
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login?redirect=/checkout");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  async function handlePay() {
    if (items.length === 0) return;
    setPaying(true);
    setError(null);

    try {
      const orderName =
        items.length === 1
          ? items[0].name
          : `${items[0].name} 외 ${items.length - 1}건`;

      // 결제 후 서버가 검증할 수 있도록 주문 내용을 잠시 저장
      const pendingOrder = {
        orderName,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      };
      localStorage.setItem("luxurymall_pending_order", JSON.stringify(pendingOrder));

      const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      const tossPayments = await loadTossPayments(CLIENT_KEY);
      const payment = tossPayments.payment({ customerKey: ANONYMOUS });

      await payment.requestPayment({
        method: "CARD",
        amount: { value: totalPrice, currency: "KRW" },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
        card: {
          useEscrow: false,
          flowMode: "DEFAULT",
          useCardPoint: false,
          useAppCardOnly: false,
        },
      });
    } catch (e: unknown) {
      // 사용자가 결제창을 닫은 경우 등
      const msg = e instanceof Error ? e.message : "결제를 시작할 수 없어요.";
      setError(msg);
      setPaying(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center text-muted">
        확인 중…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <h1 className="font-serif text-2xl">장바구니가 비어 있어요</h1>
        <button
          onClick={() => router.push("/products")}
          className="mt-8 rounded-sm bg-accent px-8 py-3 text-sm tracking-luxe text-white"
        >
          쇼핑하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl">결제</h1>

      <div className="mt-10 rounded-sm border border-line bg-card p-8">
        <h2 className="font-serif text-xl">주문 상품</h2>
        <ul className="mt-5 divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between py-3 text-sm">
              <span>
                {item.name}{" "}
                <span className="text-muted">× {item.quantity}</span>
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-t border-line pt-5 text-base font-medium">
          <span>총 {totalCount}개 · 결제금액</span>
          <span className="text-accent">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      <button
        onClick={handlePay}
        disabled={paying}
        className="mt-8 w-full rounded-sm bg-accent px-8 py-5 text-sm tracking-luxe text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {paying ? "결제창을 여는 중…" : `${formatPrice(totalPrice)} 결제하기`}
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        토스페이먼츠 테스트 결제입니다. 실제 금액이 청구되지 않아요.
      </p>
    </div>
  );
}
