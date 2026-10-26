
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
