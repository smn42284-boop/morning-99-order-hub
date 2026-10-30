import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, ChefHat, ClipboardList, Trash2, Sun, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  CATEGORIES, MENU, computeTotals, loadOrders, saveOrders, nextStatus,
  type Category, type OrderLine, type Order, type OrderStatus,
} from "@/lib/orders";
import { cn } from "@/lib/utils";
import {
  createOrder,
  fetchOrders,
  updateOrderStatus,
} from "@/lib/orders-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Morning 99 — Staff Ordering & Kitchen Display" },
      { name: "description", content: "Take table orders and track them in the kitchen at Morning 99." },
      { property: "og:title", content: "Morning 99 — Staff App" },
      { property: "og:description", content: "Waiter ordering and kitchen display for Morning 99." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Mode = "waiter" | "kitchen";
const money = (n: number) => `$${n.toFixed(2)}`;

function usePersisted<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch {}
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(v)); }, [key, v, ready]);
  return [v, setV] as const;
}


function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        const latestOrders = await fetchOrders();

        if (active) {
          setOrders(latestOrders);
        }
      } catch (error) {
        console.error("Could not load orders:", error);
      }
    };

    sync();

    return () => {
      active = false;
    };
  }, []);

  return [orders, setOrders] as const;
}


function App() {
  const [mode, setMode] = usePersisted<Mode>("morning99_mode", "waiter");
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-warm">
              <Sun className="h-5 w-5" />
            </div>
            <h1 className="font-display text-lg leading-tight sm:text-xl">
              Morning 99 <span className="text-muted-foreground">— {mode === "waiter" ? "New Order" : "Kitchen Display System"}</span>
            </h1>
          </div>
          <div className="flex rounded-full bg-muted p-1">
            {([["waiter", ClipboardList, "Waiter"], ["kitchen", ChefHat, "Kitchen"]] as const).map(([m, Icon, label]) => (
              <button key={m} onClick={() => setMode(m)}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
                  mode === m ? "bg-primary text-primary-foreground shadow-warm" : "text-muted-foreground")}>
                <Icon className="h-4 w-4" /><span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      {mode === "waiter" ? <WaiterMode /> : <KitchenMode />}
    </div>
  );
}

function WaiterMode() {
  const [table, setTable] = usePersisted<number | null>("morning99_table", null);
  const [cat, setCat] = usePersisted<Category>("morning99_category", "Breakfast");
  const [cart, setCart] = usePersisted<OrderLine[]>("morning99_cart", []);
  const totals = useMemo(() => computeTotals(cart), [cart]);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  const add = (id: string) => {
    const m = MENU.find((x) => x.id === id)!;
    setCart((c) => c.some((l) => l.id === id)
      ? c.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
      : [...c, { id, name: m.name, price: m.price, qty: 1 }]);
  };
  const change = (id: string, d: number) =>
    setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0));

  const submit = async() => {
    if (!table) { toast.error("Please select a table first"); return; }
    if (!cart.length) { toast.error("Add at least one item"); return; }
    const order: Order = { id: crypto.randomUUID(), table, items: cart, ...totals, status: "Pending", timestamp: new Date().toISOString() };
    try {
  await createOrder(order);
  setCart([]);
  setTable(null);

  toast.success(`Order for Table ${table} sent to kitchen`, {
    description: `${count} items · ${money(totals.total)}`,
  });
} catch (error) {
  console.error("Could not save order:", error);
  toast.error("Could not send order to kitchen. Please try again.");
}
    toast.success(`Order for Table ${table} sent to kitchen`, { description: `${count} items · ${money(totals.total)}` });
    setCart([]); setTable(null);
  };

  const summary = (
    <OrderSummary cart={cart} table={table} totals={totals} onChange={change} onSubmit={submit} />
  );

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-5 pb-28 lg:grid-cols-[1fr_340px] lg:pb-6">
      <div className="space-y-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Select table</h2>
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setTable(n)}
                className={cn("aspect-square rounded-xl border text-lg font-semibold transition active:scale-95",
                  table === n ? "border-primary bg-primary text-primary-foreground shadow-warm" : "bg-card hover:border-primary/60")}>
                {n}
              </button>
            ))}
          </div>
        </section>
        <section>
          <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={cn("whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                  cat === c ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground")}>
                {c}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {MENU.filter((m) => m.category === cat).map((m) => {
              const inCart = cart.find((l) => l.id === m.id)?.qty;
              return (
                <div key={m.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft">
                  <img src={m.img} alt={m.name} loading="lazy" width={800} height={600} className="h-36 w-full object-cover" />
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-lg leading-snug">{m.name}</h3>
                      <span className="font-semibold text-primary-deep">{money(m.price)}</span>
                    </div>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{m.desc}</p>
                    <Button className="mt-4 w-full" onClick={() => add(m.id)}>
                      <Plus className="h-4 w-4" /> Add to Order {inCart ? <Badge variant="secondary" className="ml-1">{inCart}</Badge> : null}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-2xl border bg-card p-5 shadow-soft">{summary}</div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 p-3 backdrop-blur lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="w-full justify-between">
              <span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> View order ({count})</span>
              <span>{money(totals.total)}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
            <SheetHeader><SheetTitle className="sr-only">Order summary</SheetTitle></SheetHeader>
            {summary}
          </SheetContent>
        </Sheet>
      </div>
    </main>
  );
}


function OrderSummary({ cart, table, totals, onChange, onSubmit }: {
  cart: OrderLine[]; table: number | null; totals: ReturnType<typeof computeTotals>;
  onChange: (id: string, d: number) => void; onSubmit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">Order summary</h2>
        <Badge variant={table ? "default" : "outline"}>{table ? `Table ${table}` : "No table"}</Badge>
      </div>
      {cart.length === 0 ? (
        <p className="rounded-xl bg-muted py-8 text-center text-sm text-muted-foreground">No items yet</p>
      ) : (
        <ul className="divide-y">
          {cart.map((l) => (
            <li key={l.id} className="flex items-center gap-3 py-2.5">
              <div className="flex-1">
                <p className="text-sm font-medium">{l.name}</p>
                <p className="text-xs text-muted-foreground">{money(l.price * l.qty)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => onChange(l.id, -1)}><Minus className="h-3 w-3" /></Button>
                <span className="w-5 text-center font-semibold">{l.qty}</span>
                <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={() => onChange(l.id, 1)}><Plus className="h-3 w-3" /></Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-1.5 border-t pt-3 text-sm">
        <Row label="Subtotal" value={money(totals.subtotal)} />
        <Row label="Tax (8%)" value={money(totals.tax)} />
        <div className="flex justify-between pt-1 text-lg font-semibold"><span>Total</span><span>{money(totals.total)}</span></div>
      </div>
      <Button size="lg" className="w-full" onClick={onSubmit}><ChefHat className="h-4 w-4" /> Submit Order to Kitchen</Button>
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-muted-foreground"><span>{label}</span><span>{value}</span></div>
);

const COLUMNS: { status: OrderStatus; tone: string }[] = [
  { status: "Pending", tone: "bg-status-pending" },
  { status: "Preparing", tone: "bg-status-preparing" },
  { status: "Ready", tone: "bg-status-ready" },
];


function KitchenMode() {
  const [orders, setOrders] = useOrders();

  const advance = async (id: string, currentStatus: OrderStatus) => {
    const newStatus = nextStatus(currentStatus);

    if (!newStatus) return;

    try {
      await updateOrderStatus(id, newStatus);

const latestOrders = await fetchOrders();
setOrders(latestOrders);

toast.success(`Order updated to ${newStatus}`);
    } catch (error) {
      console.error("Could not update order:", error);
      toast.error("Could not update order status.");
    }
  };

  const clear = () => {
    toast("Clear function needs backend support");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {orders.length} active order{orders.length === 1 ? "" : "s"}
        </p>
        <Button variant="outline" onClick={clear}>
          <Trash2 className="h-4 w-4" /> Clear Completed Orders
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map(({ status, tone }) => {
          const list = orders
            .filter((o) => o.status === status)
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

          return (
            <section key={status} className="rounded-2xl bg-muted/60 p-3">
              <h2 className="mb-3 flex items-center gap-2 px-1 font-semibold">
                <span className={cn("h-2.5 w-2.5 rounded-full", tone)} />
                {status}
                <Badge variant="secondary" className="ml-auto">
                  {list.length}
                </Badge>
              </h2>

              <div className="space-y-3">
                {list.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nothing here
                  </p>
                )}

                {list.map((o) => (
                  <article
                    key={o.id}
                    className="rounded-xl border bg-card p-4 shadow-soft"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl">
                        Table {o.table}
                      </h3>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(o.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <ul className="my-3 space-y-1 text-sm">
                      {o.items.map((i) => (
                        <li key={i.id} className="flex gap-2">
                          <span className="font-semibold text-primary-deep">
                            {i.qty}×
                          </span>
                          {i.name}
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline">{o.status}</Badge>

                      {o.status === "Pending" && (
                        <Button
                          size="sm"
                          onClick={() => advance(o.id, o.status)}
                        >
                          Start Preparing
                        </Button>
                      )}

                      {o.status === "Preparing" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => advance(o.id, o.status)}
                        >
                          Mark Ready
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
