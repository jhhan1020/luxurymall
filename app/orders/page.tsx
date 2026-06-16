import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, type Order, type OrderItem } from "@/lib/types";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: allItems } = await supabase.from("order_items").select("*");

  const orderList = (orders ?? []) as Order[];
  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const it of (allItems ?? []) as OrderItem[]) {
    const arr = itemsByOrder.get(it.order_id) ?? [];
    arr.push(it);
    itemsByOrder.set(it.order_id, arr);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl">주문 내역</h1>

      {orderList.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-muted">아직 주문 내역이 없어요.</p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-sm bg-accent px-8 py-3 text-sm tracking-luxe text-white"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-6">
          {orderList.map((order) => {
            const items = itemsByOrder.get(order.id) ?? [];
            return (
              <li
                key={order.id}
                className="rounded-sm border border-line bg-card p-6"
              >
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div>
                    <p className="font-serif text-lg">{order.order_name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {new Date(order.created_at).toLocaleDateString("ko-KR")} ·
                      주문번호 {order.order_id}
                    </p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                    결제완료
                  </span>
                </div>

                <ul className="mt-4 space-y-2 text-sm">
                  {items.map((it) => (
                    <li key={it.id} className="flex justify-between text-muted">
                      <span>
                        {it.name} × {it.quantity}
                      </span>
                      <span>{formatPrice(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-between border-t border-line pt-4 text-sm font-medium">
                  <span>총 결제금액</span>
                  <span className="text-accent">{formatPrice(order.amount)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
