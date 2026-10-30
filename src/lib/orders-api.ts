
import type { Order } from "./orders";

const API_URL = "http://localhost:3001/api";

export async function fetchOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/orders`);

  if (!response.ok) {
    throw new Error("Failed to fetch orders.");
  }

  return response.json();
}

export async function createOrder(order: Order): Promise<void> {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error("Failed to create order.");
  }
}
export async function updateOrderStatus(
  id: string,
  status: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/orders/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update order status.");
  }
}
