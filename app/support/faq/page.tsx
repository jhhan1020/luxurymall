import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Faq } from "@/lib/types";

export default async function FaqPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .order("sort_order", { ascending: true });

  const faqs = (data ?? []) as Faq[];

  // 카테고리별로 묶기
  const groups = new Map<string, Faq[]>();
  for (const f of faqs) {
    const arr = groups.get(f.category) ?? [];
    arr.push(f);
    groups.set(f.category, arr);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/support" className="text-sm text-muted hover:text-accent">
        ← 고객지원
      </Link>
      <h1 className="mt-6 font-serif text-4xl">자주 묻는 질문</h1>

      <div className="mt-12 space-y-12">
        {[...groups.entries()].map(([category, list]) => (
          <section key={category}>
            <h2 className="mb-4 text-sm tracking-luxe text-accent">
              {category}
            </h2>
            <div className="divide-y divide-line border-y border-line">
              {list.map((faq) => (
                <details key={faq.id} className="group py-5">
                  <summary className="flex items-center justify-between text-foreground">
                    <span className="pr-4 font-medium">Q. {faq.question}</span>
                    <span className="text-accent transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 leading-relaxed text-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 rounded-sm border border-line bg-card p-8 text-center">
        <p className="text-sm text-muted">원하는 답변을 찾지 못하셨나요?</p>
        <Link
          href="/support/inquiries/new"
          className="mt-4 inline-block rounded-sm bg-accent px-8 py-3 text-sm tracking-luxe text-white"
        >
          1:1 문의하기
        </Link>
      </div>
    </div>
  );
}
