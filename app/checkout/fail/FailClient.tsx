"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function FailClient() {
  const params = useSearchParams();
  const message = params.get("message");

  return (
    <div className="mx-auto max-w-md px-6 py-28 text-center">
      <h1 className="font-serif text-3xl">결제가 취소되었어요</h1>
      <p className="mt-4 text-sm text-muted">
        {message || "결제가 완료되지 않았습니다. 다시 시도해 주세요."}
      </p>
      <Link
        href="/cart"
        className="mt-10 inline-block rounded-sm bg-accent px-10 py-4 text-sm tracking-luxe text-white"
      >
        장바구니로 돌아가기
      </Link>
    </div>
  );
}
