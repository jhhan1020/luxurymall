import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 결제 최종 승인 + 주문 저장 (서버에서만 시크릿키 사용)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount, orderName, items, shipping } = body as {
      paymentKey: string;
      orderId: string;
      amount: number;
      orderName: string;
      items: { id: string; quantity: number }[];
      shipping?: {
        recipientName?: string;
        phone?: string;
        postalCode?: string;
        address?: string;
        addressDetail?: string;
        memo?: string;
      };
    };

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { message: "결제 정보가 올바르지 않아요." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1) 로그인한 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { message: "로그인이 필요해요." },
        { status: 401 }
      );
    }

    // 2) 서버에서 실제 상품 가격을 다시 계산해 위변조 방지
    const ids = (items ?? []).map((i) => i.id);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", ids);

    const productMap = new Map(
      (products ?? []).map((p) => [p.id, p])
    );
    let realTotal = 0;
    const orderItemsToSave = [];
    for (const it of items ?? []) {
      const p = productMap.get(it.id);
      if (!p) {
        return NextResponse.json(
          { message: "존재하지 않는 상품이 포함되어 있어요." },
          { status: 400 }
        );
      }
      realTotal += p.price * it.quantity;
      orderItemsToSave.push({
        product_id: p.id,
        name: p.name,
        price: p.price,
        quantity: it.quantity,
      });
    }

    if (realTotal !== amount) {
      return NextResponse.json(
        { message: "결제 금액이 일치하지 않아요." },
        { status: 400 }
      );
    }

    // 3) 토스페이먼츠에 최종 승인 요청
    const secretKey = process.env.TOSS_SECRET_KEY!;
    const auth = Buffer.from(`${secretKey}:`).toString("base64");

    const tossRes = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      }
    );

    const payment = await tossRes.json();

    if (!tossRes.ok || payment.status !== "DONE") {
      return NextResponse.json(
        { message: payment.message || "결제 승인에 실패했어요." },
        { status: 400 }
      );
    }

    // 4) 주문 저장
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_id: orderId,
        order_name: orderName,
        amount,
        status: "DONE",
        recipient_name: shipping?.recipientName ?? null,
        phone: shipping?.phone ?? null,
        postal_code: shipping?.postalCode ?? null,
        address: shipping?.address ?? null,
        address_detail: shipping?.addressDetail ?? null,
        memo: shipping?.memo ?? null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { message: "주문 저장에 실패했어요." },
        { status: 500 }
      );
    }

    await supabase.from("order_items").insert(
      orderItemsToSave.map((oi) => ({ ...oi, order_id: order.id }))
    );

    return NextResponse.json({ success: true, orderName, amount });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "알 수 없는 오류";
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
