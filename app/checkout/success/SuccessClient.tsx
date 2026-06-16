"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/types";

export default function SuccessClient() {
  const params = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(0);
  const done = useRef(false); // 중복 호출 방지

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amountStr = params.get("amount");

    if (!paymentKey || !orderId || !amountStr) {
      setStatus("error");
      setMessage("결제 정보가 없어요.");
      return;
    }

    const pending = localStorage.getItem("luxurymall_pending_order");
    const parsed = pending
      ? JSON.parse(pending)
      : { orderName: "", items: [], shipping: null };

    fetch("/api/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amountStr),
        orderName: parsed.orderName,
        items: parsed.items,
        shipping: parsed.shipping,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("ok");
          setAmount(data.amount);
          localStorage.removeItem("luxurymall_pending_order");
          clearCart();
        } else {
          setStatus("error");
          setMessage(data.message || "결제 승인에 실패했어요.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("서버와 통신에 실패했어요.");
      });
  }, [params, clearCart]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center text-muted">
        결제를 확인하고 있어요…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center">
        <h1 className="font-serif text-3xl">결제를 완료하지 못했어요</h1>
        <p className="mt-4 text-sm text-muted">{message}</p>
        <Link
          href="/cart"
          className="mt-10 inline-block rounded-sm bg-accent px-10 py-4 text-sm tracking-luxe text-white"
        >
          장바구니로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-28 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-white">
        ✓
      </div>
      <h1 className="mt-8 font-serif text-3xl">주문이 완료되었어요</h1>
      <p className="mt-4 text-muted">
        결제 금액 <span className="text-accent">{formatPrice(amount)}</span>
      </p>
      <p className="mt-1 text-sm text-muted">
        MAISON LUXE를 찾아주셔서 감사합니다.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/orders"
          className="rounded-sm bg-foreground px-8 py-4 text-sm tracking-luxe text-background hover:bg-accent"
        >
          주문내역 보기
        </Link>
        <Link
          href="/products"
          className="rounded-sm border border-line px-8 py-4 text-sm tracking-luxe text-muted hover:text-accent"
        >
          쇼핑 계속하기
        </Link>
      </div>
    </div>
  );
}
