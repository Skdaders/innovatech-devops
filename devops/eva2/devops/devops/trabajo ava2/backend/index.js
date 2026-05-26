const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0)
    );

    -- Encabezado de la venta (puede incluir múltiples productos en sale_items)
    CREATE TABLE IF NOT EXISTS sale_orders (
      id SERIAL PRIMARY KEY,
      scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'programada',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Items de la venta (un renglón por producto)
    CREATE TABLE IF NOT EXISTS sale_items (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL REFERENCES sale_orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      quantity INTEGER NOT NULL CHECK (quantity > 0)
    );

    -- 1 despacho por venta (sale_order)
    CREATE TABLE IF NOT EXISTS sale_dispatches (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL UNIQUE REFERENCES sale_orders(id) ON DELETE CASCADE,
      dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'generado',
      notes TEXT
    );
  `);

  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM products"
  );
  if (rows[0].count === 0) {
    await pool.query(
      `
      INSERT INTO products (name, price_cents) VALUES
        ('Producto Demo A', 9900),
        ('Producto Demo B', 14900),
        ('Producto Demo C', 19900),
        ('Producto Demo D', 25900)
      `
    );
  }
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/products", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT id, name, price_cents FROM products ORDER BY id ASC"
  );
  res.json({ products: rows });
});

app.get("/sales", async (_req, res) => {
  const { rows } = await pool.query(`
    SELECT
      so.id,
      so.scheduled_at,
      so.status AS sale_status,
      sd.status AS dispatch_status,
      sd.dispatched_at,
      so.created_at,
      SUM(p.price_cents * si.quantity) AS total_cents,
      json_agg(
        json_build_object(
          'product_id', si.product_id,
          'product_name', p.name,
          'quantity', si.quantity,
          'unit_price_cents', p.price_cents,
          'total_cents', (p.price_cents * si.quantity)
        )
        ORDER BY si.id
      ) AS items
    FROM sale_orders so
    JOIN sale_items si ON si.sale_id = so.id
    JOIN products p ON p.id = si.product_id
    LEFT JOIN sale_dispatches sd ON sd.sale_id = so.id
    GROUP BY so.id, sd.status, sd.dispatched_at
    ORDER BY so.created_at DESC, so.id DESC
  `);
  res.json({ sales: rows });
});

app.post("/sales", async (req, res) => {
  // Soporta formato nuevo: { items: [{productId, quantity}, ...] }
  // y mantiene compatibilidad con el formato anterior:
  // { productId, quantity }
  let items = req.body?.items;
  if (!Array.isArray(items)) {
    const productId = Number(req.body?.productId);
    const quantity = Number(req.body?.quantity);
    if (
      Number.isInteger(productId) &&
      productId > 0 &&
      Number.isInteger(quantity) &&
      quantity > 0
    ) {
      items = [{ productId, quantity }];
    }
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: "Debes enviar items: [{ productId, quantity }, ...]",
    });
  }

  // Normaliza: suma cantidades por producto (por si el cliente manda duplicados)
  const normalized = new Map(); // productId -> quantity
  for (const item of items) {
    const productId = Number(item?.productId);
    const quantity = Number(item?.quantity);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res
        .status(400)
        .json({ error: "Cada productId debe ser un entero mayor a 0" });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Cada quantity debe ser un entero mayor a 0" });
    }

    normalized.set(productId, (normalized.get(productId) || 0) + quantity);
  }

  const normalizedItems = Array.from(normalized.entries()).map(
    ([productId, quantity]) => ({ productId, quantity })
  );
  if (normalizedItems.length === 0) {
    return res
      .status(400)
      .json({ error: "No hay items válidos para la venta" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const productIds = normalizedItems.map((i) => i.productId);
    const { rows: productRows } = await client.query(
      "SELECT id FROM products WHERE id = ANY($1::int[])",
      [productIds]
    );
    const foundIds = new Set(productRows.map((r) => r.id));
    const missing = productIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Producto no existe" });
    }

    const saleResult = await client.query(
      `
        INSERT INTO sale_orders (status)
        VALUES ('programada')
        RETURNING id, scheduled_at, status, created_at
      `,
      []
    );
    const saleId = saleResult.rows[0].id;

    for (const it of normalizedItems) {
      await client.query(
        `
          INSERT INTO sale_items (sale_id, product_id, quantity)
          VALUES ($1, $2, $3)
        `,
        [saleId, it.productId, it.quantity]
      );
    }

    // En el momento de agendar: generamos el despacho para esa venta
    await client.query(
      `
        INSERT INTO sale_dispatches (sale_id, status)
        VALUES ($1, 'generado')
      `,
      [saleId]
    );

    await client.query("COMMIT");

    const { rows } = await pool.query(
      `
      SELECT
        so.id,
        so.scheduled_at,
        so.status AS sale_status,
        sd.status AS dispatch_status,
        sd.dispatched_at,
        so.created_at,
        SUM(p.price_cents * si.quantity) AS total_cents,
        json_agg(
          json_build_object(
            'product_id', si.product_id,
            'product_name', p.name,
            'quantity', si.quantity,
            'unit_price_cents', p.price_cents,
            'total_cents', (p.price_cents * si.quantity)
          )
          ORDER BY si.id
        ) AS items
      FROM sale_orders so
      JOIN sale_items si ON si.sale_id = so.id
      JOIN products p ON p.id = si.product_id
      LEFT JOIN sale_dispatches sd ON sd.sale_id = so.id
      WHERE so.id = $1
      GROUP BY so.id, sd.status, sd.dispatched_at
      `,
      [saleId]
    );

    res.status(201).json({ sale: rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /sales error:", err);
    res.status(500).json({ error: "Error creando la venta" });
  } finally {
    client.release();
  }
});

initDb()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`listening on ${port}`);
    });
  })
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });
