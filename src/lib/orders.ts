import b1 from "@/assets/menu/b1.jpg";
import b2 from "@/assets/menu/b2.jpg";
import b3 from "@/assets/menu/b3.jpg";
import b4 from "@/assets/menu/b4.jpg";
import c1 from "@/assets/menu/c1.jpg";
import c2 from "@/assets/menu/c2.jpg";
import c3 from "@/assets/menu/c3.jpg";
import c4 from "@/assets/menu/c4.jpg";
import s1 from "@/assets/menu/s1.jpg";
import s2 from "@/assets/menu/s2.jpg";
import d1 from "@/assets/menu/d1.jpg";
import d2 from "@/assets/menu/d2.jpg";

export type Category = "Breakfast" | "Coffee & Drinks" | "Specials" | "Desserts";
export type MenuItem = { id: string; name: string; price: number; category: Category; desc: string; img: string };
export type OrderLine = { id: string; name: string; price: number; qty: number };
export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed";
export type Order = {
  id: string;
  table: number;
  items: OrderLine[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  timestamp: string;
};

export const ORDERS_KEY = "morning99_orders";
export const TAX_RATE = 0.08;
export const CATEGORIES: Category[] = ["Breakfast", "Coffee & Drinks", "Specials", "Desserts"];

const IMG = { b1, b2, b3, b4, c1, c2, c3, c4, s1, s2, d1, d2 };

export const MENU: MenuItem[] = [
  { id: "b1", name: "99 Morning Set", price: 8.5, category: "Breakfast", desc: "Eggs, toast, sausage & hash brown", img: IMG.b1 },
  { id: "b2", name: "Avocado Toast", price: 6.5, category: "Breakfast", desc: "Sourdough, smashed avo, chili flakes", img: IMG.b2 },
  { id: "b3", name: "Fluffy Pancakes", price: 7.0, category: "Breakfast", desc: "Maple syrup & whipped butter", img: IMG.b3 },
  { id: "b4", name: "Mohinga Bowl", price: 5.5, category: "Breakfast", desc: "Fish noodle soup, crispy fritters", img: IMG.b4 },
  { id: "c1", name: "Signature Iced Latte", price: 4.0, category: "Coffee & Drinks", desc: "Double shot, house syrup", img: IMG.c1 },
  { id: "c2", name: "Hot Americano", price: 3.0, category: "Coffee & Drinks", desc: "Freshly pulled espresso", img: IMG.c2 },
  { id: "c3", name: "Burmese Milk Tea", price: 2.5, category: "Coffee & Drinks", desc: "Strong, sweet & creamy", img: IMG.c3 },
  { id: "c4", name: "Fresh Orange Juice", price: 3.5, category: "Coffee & Drinks", desc: "Squeezed to order", img: IMG.c4 },
  { id: "s1", name: "Sunrise Benedict", price: 9.5, category: "Specials", desc: "Poached eggs, hollandaise, ham", img: IMG.s1 },
  { id: "s2", name: "Golden Shakshuka", price: 8.0, category: "Specials", desc: "Baked eggs in spiced tomato", img: IMG.s2 },
  { id: "d1", name: "Honey Butter Croissant", price: 3.5, category: "Desserts", desc: "Flaky, warm, glazed", img: IMG.d1 },
  { id: "d2", name: "Mango Sticky Rice", price: 4.5, category: "Desserts", desc: "Coconut cream drizzle", img: IMG.d2 },
];

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function computeTotals(items: OrderLine[]) {
  const subtotal = round2(items.reduce((s, i) => s + i.price * i.qty, 0));
  const tax = round2(subtotal * TAX_RATE);
  return { subtotal, tax, total: round2(subtotal + tax) };
}

export function loadOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new Event("morning99:orders"));
}

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const transitions: Record<OrderStatus, OrderStatus | null> = {
    Pending: "Preparing",
    Preparing: "Ready",
    Ready: "Completed",
    Completed: null,
  };

  return transitions[status];
}