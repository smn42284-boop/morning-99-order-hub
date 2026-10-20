import { describe, it, expect } from "vitest";
import { computeTotals, nextStatus } from "@/lib/orders";

describe("orders", () => {
  it("computes 8% tax on subtotal", () => {
    expect(computeTotals([{ id: "a", name: "x", price: 8.5, qty: 2 }])).toEqual({ subtotal: 17, tax: 1.36, total: 18.36 });
  });
  it("moves Pending -> Preparing -> Ready", () => {
    expect(nextStatus("Pending")).toBe("Preparing");
    expect(nextStatus("Preparing")).toBe("Ready");
    expect(nextStatus("Ready")).toBeNull();
  });
});
