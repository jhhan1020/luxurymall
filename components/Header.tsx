"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/products?category=bag", label: "가방" },
  { href: "/products?category=wallet", label: "지갑" },
  { href: "/products?category=accessory", label: "액세서리" },
  { href: "/support", label: "고객지원" },
];

export default function Header() {
  const { totalCount } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* 로고 */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-serif text-2xl font-semibold tracking-luxe">
            MAISON
          </span>
          <span className="text-[10px] tracking-luxe text-accent">LUXE</span>
        </Link>

        {/* 가운데 메뉴 */}
        <nav className="hidden gap-8 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/80 transition hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 오른쪽: 로그인 / 장바구니 */}
        <div className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              <Link
                href="/orders"
                className="hidden text-foreground/80 hover:text-accent sm:inline"
              >
                주문내역
              </Link>
              <button
                onClick={handleLogout}
                className="text-foreground/80 hover:text-accent"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/login" className="text-foreground/80 hover:text-accent">
              로그인
            </Link>
          )}

          {/* 장바구니 아이콘 + 개수 배지 */}
          <Link href="/cart" className="relative" aria-label="장바구니">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-foreground"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {totalCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
