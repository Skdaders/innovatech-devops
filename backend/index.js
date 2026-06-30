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

    CREATE TABLE IF NOT EXISTS delivery_locations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL DEFAULT '',
      delivery_days INTEGER NOT NULL DEFAULT 3 CHECK (delivery_days > 0)
    );

    CREATE TABLE IF NOT EXISTS sale_orders (
      id SERIAL PRIMARY KEY,
      scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'programada',
      delivery_location_id INTEGER REFERENCES delivery_locations(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL REFERENCES sale_orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      quantity INTEGER NOT NULL CHECK (quantity > 0)
    );

    CREATE TABLE IF NOT EXISTS sale_dispatches (
      id SERIAL PRIMARY KEY,
      sale_id INTEGER NOT NULL UNIQUE REFERENCES sale_orders(id) ON DELETE CASCADE,
      dispatched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'generado',
      notes TEXT
    );
  `);

  await pool.query(`
    ALTER TABLE sale_orders
    ADD COLUMN IF NOT EXISTS delivery_location_id INTEGER REFERENCES delivery_locations(id)
  `);

  const { rows: locCount } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM delivery_locations"
  );
  if (locCount[0].count === 0) {
    await pool.query(`
      INSERT INTO delivery_locations (name, region, delivery_days) VALUES
        ('Santiago Centro', 'Región Metropolitana', 2),
        ('Providencia', 'Región Metropolitana', 2),
        ('Maipú', 'Región Metropolitana', 3),
        ('La Florida', 'Región Metropolitana', 3),
        ('Valparaíso', 'Valparaíso', 4),
        ('Viña del Mar', 'Valparaíso', 4),
        ('Concepción', 'Biobío', 5)
    `);
  }

  const { rows: prodCount } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM products"
  );
  if (prodCount[0].count === 0) {
    await pool.query(`
      INSERT INTO products (name, price_cents) VALUES
        ('Notebook 14"', 399990),
        ('Mouse inalámbrico', 12990),
        ('Teclado mecánico', 45990),
        ('Monitor 24"', 89990)
    `);
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

app.post("/products", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const priceCents = Number(req.body?.price_cents);

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (!Number.isInteger(priceCents) || priceCents <= 0) {
    return res.status(400).json({
      error: "price_cents debe ser un entero mayor a 0",
    });
  }

  const { rows } = await pool.query(
    `
      INSERT INTO products (name, price_cents)
      VALUES ($1, $2)
      RETURNING id, name, price_cents
    `,
    [name, priceCents]
  );
  res.status(201).json({ product: rows[0] });
});

app.get("/delivery-locations", async (_req, res) => {
  const { rows } = await pool.query(
    `
      SELECT id, name, region, delivery_days
      FROM delivery_locations
      ORDER BY region, name
    `
  );
  res.json({ locations: rows });
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
      dl.name AS delivery_name,
      dl.region AS delivery_region,
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
    LEFT JOIN delivery_locations dl ON dl.id = so.delivery_location_id
    GROUP BY so.id, sd.status, sd.dispatched_at, dl.name, dl.region
    ORDER BY so.created_at DESC, so.id DESC
  `);
  res.json({ sales: rows });
});

app.post("/sales", async (req, res) => {
  let items = req.body?.items;
  const deliveryLocationId = Number(req.body?.deliveryLocationId);

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

  if (!Number.isInteger(deliveryLocationId) || deliveryLocationId <= 0) {
    return res.status(400).json({
      error: "deliveryLocationId es obligatorio",
    });
  }

  const normalized = new Map();
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const locCheck = await client.query(
      "SELECT id, name, region FROM delivery_locations WHERE id = $1",
      [deliveryLocationId]
    );
    if (locCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Lugar de entrega no existe" });
    }
    const location = locCheck.rows[0];

    const productIds = normalizedItems.map((i) => i.productId);
    const { rows: productRows } = await client.query(
      "SELECT id FROM products WHERE id = ANY($1::int[])",
      [productIds]
    );
    const foundIds = new Set(productRows.map((r) => r.id));
    if (productIds.some((id) => !foundIds.has(id))) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Producto no existe" });
    }

    const saleResult = await client.query(
      `
        INSERT INTO sale_orders (status, delivery_location_id)
        VALUES ('pagada', $1)
        RETURNING id, scheduled_at, status, created_at, delivery_location_id
      `,
      [deliveryLocationId]
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

    const dispatchNote = `Entrega: ${location.name} (${location.region})`;
    await client.query(
      `
        INSERT INTO sale_dispatches (sale_id, status, notes)
        VALUES ($1, 'generado', $2)
      `,
      [saleId, dispatchNote]
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
        dl.name AS delivery_name,
        dl.region AS delivery_region,
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
      LEFT JOIN delivery_locations dl ON dl.id = so.delivery_location_id
      WHERE so.id = $1
      GROUP BY so.id, sd.status, sd.dispatched_at, dl.name, dl.region
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
