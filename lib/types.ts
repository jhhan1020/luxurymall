// 데이터베이스 자료형 (사람이 읽기 쉽게 정의)

export type Category = "bag" | "wallet" | "accessory";

export const CATEGORY_LABELS: Record<Category, string> = {
  bag: "가방",
  wallet: "지갑",
  accessory: "액세서리",
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type Faq = {
  id: string;
  category: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type Inquiry = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  status: "PENDING" | "ANSWERED";
  answer: string | null;
  created_at: string;
  answered_at: string | null;
};

export type Order = {
  id: string;
  user_id: string;
  order_id: string;
  order_name: string;
  amount: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price: number;
  quantity: number;
};

// 가격을 "₩1,850,000" 형태로 표시
export function formatPrice(won: number): string {
  return "₩" + won.toLocaleString("ko-KR");
}
