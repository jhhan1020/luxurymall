"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError("이메일 또는 비밀번호를 확인해 주세요.");
        setLoading(false);
        return;
      }
      router.push(redirect);
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        // 바로 로그인됨
        router.push(redirect);
        router.refresh();
      } else {
        // 이메일 인증이 켜져 있는 경우
        setInfo("가입이 완료되었어요! 로그인 페이지에서 로그인해 주세요.");
        setLoading(false);
      }
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-center font-serif text-4xl">
        {isLogin ? "로그인" : "회원가입"}
      </h1>
      <p className="mt-3 text-center text-sm text-muted">
        MAISON LUXE의 명품을 만나보세요.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="block text-sm text-muted">이메일</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-sm border border-line bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-sm text-muted">
            비밀번호 {!isLogin && "(6자 이상)"}
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-2 w-full rounded-sm border border-line bg-card px-4 py-3 text-sm outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-accent">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-sm bg-foreground px-8 py-4 text-sm tracking-luxe text-background transition hover:bg-accent disabled:opacity-50"
        >
          {loading ? "처리 중…" : isLogin ? "로그인" : "가입하기"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "아직 회원이 아니신가요? " : "이미 회원이신가요? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="text-accent hover:underline"
        >
          {isLogin ? "회원가입" : "로그인"}
        </Link>
      </p>
    </div>
  );
}
