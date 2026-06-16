import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Inquiry } from "@/lib/types";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/support/inquiries");

  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const inquiries = (data ?? []) as Inquiry[];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/support" className="text-sm text-muted hover:text-accent">
            ← 고객지원
          </Link>
          <h1 className="mt-4 font-serif text-4xl">1:1 문의</h1>
        </div>
        <Link
          href="/support/inquiries/new"
          className="rounded-sm bg-accent px-6 py-3 text-sm tracking-luxe text-white hover:opacity-90"
        >
          문의 작성
        </Link>
      </div>

      {inquiries.length === 0 ? (
        <p className="mt-20 text-center text-muted">
          아직 작성한 문의가 없어요.
        </p>
      ) : (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {inquiries.map((q) => (
            <li key={q.id}>
              <Link
                href={`/support/inquiries/${q.id}`}
                className="flex items-center justify-between gap-4 py-5 transition hover:text-accent"
              >
                <div>
                  <p className="text-xs text-muted">{q.category}</p>
                  <p className="mt-1 font-medium">{q.title}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                    q.status === "ANSWERED"
                      ? "bg-accent/10 text-accent"
                      : "bg-line text-muted"
                  }`}
                >
                  {q.status === "ANSWERED" ? "답변완료" : "대기중"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
