"use client";

import { useEffect } from "react";
import type { Shipping } from "@/lib/types";

// 다음(카카오) 우편번호 서비스 타입
declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string }) => void;
      }) => { open: () => void };
    };
  }
}

const POSTCODE_SRC =
  "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export default function ShippingForm({
  value,
  onChange,
}: {
  value: Shipping;
  onChange: (next: Shipping) => void;
}) {
  // 우편번호 검색 스크립트 로드
  useEffect(() => {
    if (document.querySelector(`script[src="${POSTCODE_SRC}"]`)) return;
    const script = document.createElement("script");
    script.src = POSTCODE_SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  function set<K extends keyof Shipping>(key: K, v: string) {
    onChange({ ...value, [key]: v });
  }

  function openPostcode() {
    if (!window.daum?.Postcode) {
      alert("주소 검색을 불러오는 중이에요. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        onChange({
          ...value,
          postalCode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
        });
        // 상세주소 입력으로 자연스럽게 이동
        document.getElementById("addressDetail")?.focus();
      },
    }).open();
  }

  const inputClass =
    "w-full rounded-sm border border-line bg-card px-4 py-3 text-sm outline-none focus:border-accent";

  return (
    <div className="rounded-sm border border-line bg-card p-8">
      <h2 className="font-serif text-xl">배송지 정보</h2>

      <div className="mt-5 space-y-4">
        {/* 받는 분 */}
        <div>
          <label className="block text-sm text-muted">받는 분</label>
          <input
            className={`mt-2 ${inputClass}`}
            value={value.recipientName}
            onChange={(e) => set("recipientName", e.target.value)}
            placeholder="이름을 입력해 주세요"
          />
        </div>

        {/* 연락처 */}
        <div>
          <label className="block text-sm text-muted">연락처</label>
          <input
            className={`mt-2 ${inputClass}`}
            value={value.phone}
            onChange={(e) => set("phone", e.target.value.replace(/[^0-9-]/g, ""))}
            placeholder="010-1234-5678"
            inputMode="tel"
          />
        </div>

        {/* 우편번호 + 검색 */}
        <div>
          <label className="block text-sm text-muted">우편번호</label>
          <div className="mt-2 flex gap-2">
            <input
              className={`${inputClass} flex-1`}
              value={value.postalCode}
              readOnly
              placeholder="주소 찾기를 눌러주세요"
            />
            <button
              type="button"
              onClick={openPostcode}
              className="shrink-0 rounded-sm border border-foreground px-5 text-sm tracking-luxe transition hover:bg-foreground hover:text-background"
            >
              주소 찾기
            </button>
          </div>
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-sm text-muted">주소</label>
          <input
            className={`mt-2 ${inputClass}`}
            value={value.address}
            readOnly
            placeholder="주소 찾기로 자동 입력돼요"
          />
        </div>

        {/* 상세주소 */}
        <div>
          <label className="block text-sm text-muted">상세주소</label>
          <input
            id="addressDetail"
            className={`mt-2 ${inputClass}`}
            value={value.addressDetail}
            onChange={(e) => set("addressDetail", e.target.value)}
            placeholder="동·호수 등 나머지 주소"
          />
        </div>

        {/* 배송 메모 (선택) */}
        <div>
          <label className="block text-sm text-muted">배송 메모 (선택)</label>
          <input
            className={`mt-2 ${inputClass}`}
            value={value.memo}
            onChange={(e) => set("memo", e.target.value)}
            placeholder="예) 부재 시 문 앞에 놓아주세요"
          />
        </div>
      </div>
    </div>
  );
}
