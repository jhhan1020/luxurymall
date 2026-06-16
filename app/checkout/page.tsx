"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadTossPayments,
  ANONYMOUS,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";
import { useCart, type CartItem } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/types";

const CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!;

export default function CheckoutPage() {
  const { items, totalPrice, totalCount } = useCart();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false); // 로그인 확인 완료
  const [widgetReady, setWidgetReady] = useState(false); // 결제 위젯 렌더 완료
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const initedRef = useRef(false);
  // 위젯에 띄운 금액과 동일한 주문 내용을 결제 시 사용하기 위한 스냅샷
  const snapshotRef = useRef<{ items: CartItem[]; amount: number } | null>(null);

  // 1) 장바구니 로딩 대기
  useEffect(() => setMounted(true), []);

  // 2) 로그인 확인
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

  // 3) 결제 위젯 띄우기 (로그인 확인 + 장바구니 준비되면 1회)
  useEffect(() => {
    if (!mounted || !ready || initedRef.current) return;
    if (items.length === 0 || totalPrice <= 0) return;
    initedRef.current = true;

    snapshotRef.current = { items: [...items], amount: totalPrice };

    (async () => {
      try {
        const tossPayments = await loadTossPayments(CLIENT_KEY);
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        widgetsRef.current = widgets;

        await widgets.setAmount({ currency: "KRW", value: totalPrice });
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);
        setWidgetReady(true);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "결제 위젯을 불러오지 못했어요.";
        setError(msg);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, ready, items, totalPrice]);

  async function handlePay() {
    const widgets = widgetsRef.current;
    const snapshot = snapshotRef.current;
    if (!widgets || !snapshot) return;

    setPaying(true);
    setError(null);

    try {
      const snapItems = snapshot.items;
      const orderName =
        snapItems.length === 1
          ? snapItems[0].name
          : `${snapItems[0].name} 외 ${snapItems.length - 1}건`;

      // 결제 후 서버가 금액을 검증할 수 있도록 주문 내용을 잠시 저장
      localStorage.setItem(
        "luxurymall_pending_order",
        JSON.stringify({
          orderName,
          items: snapItems.map((i) => ({ id: i.id, quantity: i.quantity })),
        })
      );

      const orderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (e: unknown) {
      // 사용자가 결제를 취소했거나 실패한 경우
      const msg = e instanceof Error ? e.message : "결제를 진행할 수 없어요.";
      setError(msg);
      setPaying(false);
    }
  }

  if (!ready || !mounted) {
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

      {/* 주문 요약 */}
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

      {/* 토스 결제수단 위젯 */}
      <div id="payment-method" className="mt-8" />
      {/* 토스 약관 동의 위젯 */}
      <div id="agreement" className="mt-2" />

      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      <button
        onClick={handlePay}
        disabled={paying || !widgetReady}
        className="mt-8 w-full rounded-sm bg-accent px-8 py-5 text-sm tracking-luxe text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {!widgetReady
          ? "결제 수단을 불러오는 중…"
          : paying
          ? "결제 진행 중…"
          : `${formatPrice(totalPrice)} 결제하기`}
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        토스페이먼츠 테스트 결제입니다. 실제 금액이 청구되지 않아요.
      </p>
    </div>
  );
}
