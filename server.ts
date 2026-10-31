
import express from "express";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import cors from "cors";
const app = express();
const PORT = 3001;

app.use(cors({
  origin: "http://localhost:8080",
}));

app.use(express.json());

// Create the data folder if it doesn't exist.
mkdirSync("data", { recursive: true });

// Open the database file.
const db = new Database("data/morning99.db");
db.pragma("foreign_keys = ON");
// Create a table if it doesn't exist yet.
db.exec(`
  CREATE TABLE IF NOT EXISTS test_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    table_number INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    qty INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
`);


app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/orders", (_req, res) => {
  const orders = db
    .prepare("SELECT * FROM orders ORDER BY timestamp DESC")
    .all() as {
      id: string;
      table_number: number;
      subtotal: number;
      tax: number;
      total: number;
      status: string;
      timestamp: string;
    }[];

  const getItems = db.prepare(`
    SELECT menu_item_id, name, price, qty
    FROM order_items
    WHERE order_id = ?
  `);

  const result = orders.map((order) => {
    const items = getItems.all(order.id) as {
      menu_item_id: string;
      name: string;
      price: number;
      qty: number;
    }[];

    return {
      id: order.id,
      table: order.table_number,
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      status: order.status,
      timestamp: order.timestamp,
      items: items.map((item) => ({
        id: item.menu_item_id || item.name,
        name: item.name,
        price: item.price,
        qty: item.qty,
      })),
    };
  });

  res.json(result);
});

app.post("/api/orders", (req, res) => {
  const order = req.body;

  if (
    !order.id ||
    !order.table ||
    !Array.isArray(order.items) ||
    order.items.length === 0
  ) {
    return res.status(400).json({
      error: "Invalid order data.",
    });
  }

  const saveOrder = db.transaction(() => {
    db.prepare(`
      INSERT INTO orders (
        id, table_number, subtotal, tax, total, status, timestamp
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      order.id,
      order.table,
      order.subtotal,
      order.tax,
      order.total,
      order.status,
      order.timestamp
    );

    const insertItem = db.prepare(`
      INSERT INTO order_items (
        order_id, menu_item_id, name, price, qty
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const item of order.items) {
      insertItem.run(
        order.id,
        item.id,
        item.name,
        item.price,
        item.qty
      );
    }
  });

  try {
    saveOrder();

    res.status(201).json({
      message: "Order saved successfully.",
      id: order.id,
    });
  } catch (error) {
    console.error("Failed to save order:", error);

    res.status(500).json({
      error: "Failed to save order.",
    });
  }
});

app.patch("/api/orders/:id/status", (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

const allowedStatuses = [
  "Pending",
  "Preparing",
  "Ready",
  "Completed",
];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      error: "Invalid order status.",
    });
  }

  const result = db
    .prepare("UPDATE orders SET status = ? WHERE id = ?")
    .run(status, orderId);

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Order not found.",
    });
  }

  res.json({
    message: "Order status updated successfully.",
    id: orderId,
    status,
  });
});

app.delete("/api/orders/completed", (req, res) => {
  try {
    const deleteCompletedOrders = db.transaction(() => {
      // First, delete items belonging to completed orders.
      db.prepare(`
        DELETE FROM order_items
        WHERE order_id IN (
          SELECT id FROM orders WHERE status = ?
        )
      `).run("Completed");

      // Then, delete the completed orders.
      const result = db.prepare(`
        DELETE FROM orders WHERE status = ?
      `).run("Completed");

      return result.changes;
    });

    const deletedCount = deleteCompletedOrders();

    res.json({
      message: "Completed orders deleted successfully.",
      deletedCount,
    });
  } catch (error) {
    console.error("Could not delete completed orders:", error);

    res.status(500).json({
      error: "Could not delete completed orders.",
    });
  }
});


app.post("/api/test", (req, res) => {
  const message = req.body.message;

  if (typeof message !== "string" || message.trim() === "") {
    return res.status(400).json({ error: "A message is required." });
  }

  const result = db
    .prepare("INSERT INTO test_records (message) VALUES (?)")
    .run(message);

  res.status(201).json({
    id: result.lastInsertRowid,
    message,
  });
});

app.get("/api/test", (_req, res) => {
  const records = db
    .prepare("SELECT * FROM test_records ORDER BY id DESC")
    .all();

  res.json(records);
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
