"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CATEGORIES = ["주문/결제", "배송", "반품/교환", "상품", "기타"];

export default function NewInquiryPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login?redirect=/support/inquiries/new");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login?redirect=/support/inquiries/new");
      return;
    }

    const { error } = await supabase.from("inquiries").insert({
      user_id: user.id,
      category,
      title,
      content,
    });

    if (error) {
      setError("문의 저장에 실패했어요. 다시 시도해 주세요.");
      setLoading(false);
      return;
    }
    router.push("/support/inquiries");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-md px-6 py-28 text-center text-muted">
        확인 중…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/support/inquiries"
        className="text-sm text-muted hover:text-accent"
      >
        ← 문의 목록
      </Link>
      <h1 className="mt-6 font-serif text-4xl">문의 작성</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label className="block text-sm text-muted">문의 유형</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-sm border border-line bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-muted">제목</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="문의 제목을 입력해 주세요"
            className="mt-2 w-full rounded-sm border border-line bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-muted">문의 내용</label>
          <textarea
            required
            rows={7}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="문의하실 내용을 자세히 적어주세요"
            className="mt-2 w-full resize-none rounded-sm border border-line bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-accent px-8 py-4 text-sm tracking-luxe text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "등록 중…" : "문의 등록"}
        </button>
      </form>
    </div>
  );
}
