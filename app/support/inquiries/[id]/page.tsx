import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Inquiry } from "@/lib/types";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/support/inquiries");

  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const q = data as Inquiry;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link
        href="/support/inquiries"
        className="text-sm text-muted hover:text-accent"
      >
        ← 문의 목록
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="text-xs tracking-luxe text-accent">{q.category}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs ${
            q.status === "ANSWERED"
              ? "bg-accent/10 text-accent"
              : "bg-line text-muted"
          }`}
        >
          {q.status === "ANSWERED" ? "답변완료" : "대기중"}
        </span>
      </div>

      <h1 className="mt-4 font-serif text-3xl">{q.title}</h1>
      <p className="mt-2 text-xs text-muted">
        {new Date(q.created_at).toLocaleString("ko-KR")}
      </p>

      {/* 내 질문 */}
      <div className="mt-8 rounded-sm border border-line bg-card p-6">
        <p className="text-xs tracking-luxe text-muted">문의 내용</p>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">{q.content}</p>
      </div>

      {/* 답변 */}
      <div className="mt-6 rounded-sm border border-accent/30 bg-accent/5 p-6">
        <p className="text-xs tracking-luxe text-accent">MAISON LUXE 답변</p>
        {q.answer ? (
          <p className="mt-3 whitespace-pre-wrap leading-relaxed">{q.answer}</p>
        ) : (
          <p className="mt-3 text-sm text-muted">
            답변을 준비하고 있어요. 조금만 기다려 주세요.
          </p>
        )}
      </div>
    </div>
  );
}
