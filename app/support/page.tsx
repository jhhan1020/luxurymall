import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <header className="text-center">
        <p className="text-xs tracking-luxe text-accent">CUSTOMER CARE</p>
        <h1 className="mt-3 font-serif text-4xl">고객지원</h1>
        <p className="mt-4 text-muted">
          무엇을 도와드릴까요? 궁금한 점을 빠르게 해결해 드립니다.
        </p>
      </header>

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/support/faq"
          className="group rounded-sm border border-line bg-card p-10 transition hover:border-accent"
        >
          <h2 className="font-serif text-2xl group-hover:text-accent">
            자주 묻는 질문
          </h2>
          <p className="mt-3 text-sm text-muted">
            주문, 배송, 반품, 회원에 대한 답변을 모았어요.
          </p>
          <span className="mt-6 inline-block text-sm text-accent">
            FAQ 보기 →
          </span>
        </Link>

        <Link
          href="/support/inquiries"
          className="group rounded-sm border border-line bg-card p-10 transition hover:border-accent"
        >
          <h2 className="font-serif text-2xl group-hover:text-accent">
            1:1 문의
          </h2>
          <p className="mt-3 text-sm text-muted">
            궁금한 점을 직접 남기시면 빠르게 답변해 드려요.
          </p>
          <span className="mt-6 inline-block text-sm text-accent">
            문의하기 →
          </span>
        </Link>
      </div>
    </div>
  );
}
