import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-card">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <p className="font-serif text-xl font-semibold tracking-luxe">
              MAISON LUXE
            </p>
            <p className="mt-3 max-w-xs text-sm text-muted">
              장인이 한 땀 한 땀 완성한 명품 핸드백, 지갑, 액세서리.
              시간이 지나도 변치 않는 가치를 전합니다.
            </p>
          </div>

          <div className="flex gap-14 text-sm">
            <div className="flex flex-col gap-2">
              <span className="mb-1 font-medium tracking-luxe text-foreground">
                SHOP
              </span>
              <Link href="/products?category=bag" className="text-muted hover:text-accent">
                가방
              </Link>
              <Link href="/products?category=wallet" className="text-muted hover:text-accent">
                지갑
              </Link>
              <Link href="/products?category=accessory" className="text-muted hover:text-accent">
                액세서리
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="mb-1 font-medium tracking-luxe text-foreground">
                SUPPORT
              </span>
              <Link href="/support/faq" className="text-muted hover:text-accent">
                자주 묻는 질문
              </Link>
              <Link href="/support/inquiries" className="text-muted hover:text-accent">
                1:1 문의
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-12 text-xs text-muted">
          © 2026 MAISON LUXE. 개발 연습용 데모 사이트입니다. 실제 결제는 발생하지 않습니다.
        </p>
      </div>
    </footer>
  );
}
