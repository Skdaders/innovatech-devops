const apiBase =
  (typeof import.meta.env.VITE_API_URL === "string" &&
    import.meta.env.VITE_API_URL.trim()) ||
  "/api";

const appEl = document.querySelector("#app");

function normalizeBase(url) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const API = normalizeBase(apiBase);

appEl.innerHTML = `
  <main style="font-family:system-ui; margin: 2rem;">
    <h1>Ventas + Despachos</h1>
    <p style="margin-top:-0.25rem;">
      API: <code>${API}</code>
    </p>

    <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items:start;">
      <section style="margin: 1.5rem 0;">
        <h2>Productos para la venta</h2>
        <div id="products" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 12px;"></div>
      </section>

      <aside style="margin: 1.5rem 0; border:1px solid #ddd; border-radius:12px; padding: 12px; background:#fff; position:sticky; top: 16px;">
        <h2 style="margin-top:0;">Carrito (una venta)</h2>
        <div id="cart" style="display:flex; flex-direction:column; gap:10px;"></div>
        <div style="display:flex; justify-content:space-between; margin-top: 10px; padding-top: 10px; border-top:1px solid #eee;">
          <strong>Total</strong>
          <strong id="cartTotal">$0</strong>
        </div>
        <div style="display:flex; gap: 8px; margin-top: 10px;">
          <button id="cartClear" style="flex:1; padding:8px 10px; border-radius:10px; border:1px solid #aaa; background:#fff; cursor:pointer;">
            Vaciar
          </button>
          <button id="cartCheckout" style="flex:1; padding:8px 10px; border-radius:10px; border:1px solid #333; background:#111; color:#fff; cursor:pointer;">
            Agendar venta
          </button>
        </div>
        <div id="cartMsg" style="margin-top:10px; color:#555; font-size: 0.95rem;"></div>
      </aside>
    </div>

    <section>
      <h2>Ventas realizadas</h2>
      <div id="status" style="margin: 0.25rem 0; color: #555;"></div>
      <div id="sales" style="margin-top: 12px; overflow:auto;"></div>
    </section>
  </main>
`;

const productsEl = document.getElementById("products");
const salesEl = document.getElementById("sales");
const statusEl = document.getElementById("status");
const cartEl = document.getElementById("cart");
const cartTotalEl = document.getElementById("cartTotal");
const cartClearBtn = document.getElementById("cartClear");
const cartCheckoutBtn = document.getElementById("cartCheckout");
const cartMsgEl = document.getElementById("cartMsg");

function moneyFromCents(cents) {
  const value = Number(cents) / 100;
  return value.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
  });
}

async function apiFetch(path, options = {}) {
  const url = `${API}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let details = "";
    try {
      const data = await res.json();
      details = data?.error ? `: ${data.error}` : "";
    } catch (_) {}
    throw new Error(`HTTP ${res.status}${details}`);
  }

  return res.json();
}

let productsById = new Map();
let cart = new Map(); // productId -> quantity

function setCartMessage(msg) {
  cartMsgEl.textContent = msg || "";
}

function cartItemsArray() {
  return Array.from(cart.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

function cartTotalCents() {
  let total = 0;
  for (const [productId, quantity] of cart.entries()) {
    const p = productsById.get(productId);
    if (!p) continue;
    total += Number(p.price_cents) * Number(quantity);
  }
  return total;
}

function renderCart() {
  const items = cartItemsArray()
    .map(({ productId, quantity }) => {
      const p = productsById.get(productId);
      if (!p) return null;
      const lineTotal = Number(p.price_cents) * Number(quantity);
      return { ...p, productId, quantity, lineTotal };
    })
    .filter(Boolean);

  if (items.length === 0) {
    cartEl.innerHTML = `<div style="color:#666;">Carrito vacío. Agrega productos para crear una venta con múltiples items.</div>`;
  } else {
    cartEl.innerHTML = items
      .map(
        (it) => `
        <div style="border:1px solid #eee; border-radius:10px; padding:10px;">
          <div style="display:flex; justify-content:space-between; gap:8px;">
            <div style="font-weight:600;">${it.name}</div>
            <button data-cart-remove="${it.id}" title="Quitar" style="border:1px solid #ddd; background:#fff; cursor:pointer; border-radius:8px; width:32px; height:32px;">✕</button>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:6px; color:#333;">
            <div>${moneyFromCents(it.price_cents)} c/u</div>
            <div><strong>${moneyFromCents(it.lineTotal)}</strong></div>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:8px;">
            <label style="color:#555;">Cant.</label>
            <input data-cart-qty="${it.id}" type="number" min="1" step="1" value="${it.quantity}"
              style="width:90px; padding:6px 8px; border:1px solid #ddd; border-radius:8px;" />
          </div>
        </div>
      `
      )
      .join("");
  }

  cartTotalEl.textContent = moneyFromCents(cartTotalCents());

  cartEl.querySelectorAll("button[data-cart-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const productId = Number(btn.dataset.cartRemove);
      cart.delete(productId);
      setCartMessage("");
      renderCart();
    });
  });

  cartEl.querySelectorAll("input[data-cart-qty]").forEach((input) => {
    input.addEventListener("change", () => {
      const productId = Number(input.dataset.cartQty);
      const quantity = Number(input.value);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        input.value = String(cart.get(productId) || 1);
        return;
      }
      cart.set(productId, quantity);
      setCartMessage("");
      renderCart();
    });
  });
}

async function loadProducts() {
  statusEl.textContent = "Cargando productos...";
  const data = await apiFetch("/products");
  const products = data.products || [];

  if (products.length === 0) {
    productsEl.innerHTML = `<p>No hay productos cargados.</p>`;
    return;
  }

  productsById = new Map(products.map((p) => [Number(p.id), p]));

  productsEl.innerHTML = products
    .map(
      (p) => `
        <div style="border:1px solid #ddd; border-radius:10px; padding:12px; background:#fff;">
          <div style="font-weight:600; margin-bottom:6px;">${p.name}</div>
          <div style="color:#333; margin-bottom:10px;">${moneyFromCents(p.price_cents)}</div>
          <button 
            style="padding:8px 10px; border-radius:8px; border:1px solid #333; background:#111; color:#fff; cursor:pointer;"
            data-product-id="${p.id}"
          >
            Agregar al carrito
          </button>
        </div>
      `
    )
    .join("");

  productsEl.querySelectorAll("button[data-product-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = Number(btn.dataset.productId);
      const currentQty = cart.get(productId) || 0;
      cart.set(productId, currentQty + 1);
      setCartMessage("Agregado al carrito.");
      renderCart();
    });
  });

  renderCart();
}

let salesLoading = false;
async function loadSales() {
  if (salesLoading) return;
  salesLoading = true;
  try {
    statusEl.textContent = "Cargando ventas...";
    const data = await apiFetch("/sales");
    const sales = data.sales || [];

    if (sales.length === 0) {
      salesEl.innerHTML = `<p>No hay ventas aún.</p>`;
      statusEl.textContent = "";
      return;
    }

    const listItems = (items) => {
      if (!Array.isArray(items) || items.length === 0) return "-";
      return items
        .map((it) => `${it.product_name} x${it.quantity}`)
        .join(", ");
    };

    salesEl.innerHTML = `
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left; border-bottom:1px solid #eee; padding:8px;">ID</th>
            <th style="text-align:left; border-bottom:1px solid #eee; padding:8px;">Items</th>
            <th style="text-align:left; border-bottom:1px solid #eee; padding:8px;">Total</th>
            <th style="text-align:left; border-bottom:1px solid #eee; padding:8px;">Estado venta</th>
            <th style="text-align:left; border-bottom:1px solid #eee; padding:8px;">Estado despacho</th>
            <th style="text-align:left; border-bottom:1px solid #eee; padding:8px;">Creada</th>
          </tr>
        </thead>
        <tbody>
          ${sales
            .map((s) => {
              const created = s.created_at
                ? new Date(s.created_at).toLocaleString("es-CL")
                : "";
              return `
                <tr>
                  <td style="border-bottom:1px solid #f2f2f2; padding:8px;">${s.id}</td>
                  <td style="border-bottom:1px solid #f2f2f2; padding:8px;">${listItems(
                    s.items
                  )}</td>
                  <td style="border-bottom:1px solid #f2f2f2; padding:8px;">${moneyFromCents(
                    s.total_cents
                  )}</td>
                  <td style="border-bottom:1px solid #f2f2f2; padding:8px;">${s.sale_status}</td>
                  <td style="border-bottom:1px solid #f2f2f2; padding:8px;">${s.dispatch_status || "-"}</td>
                  <td style="border-bottom:1px solid #f2f2f2; padding:8px;">${created}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `;
    statusEl.textContent = "";
  } finally {
    salesLoading = false;
  }
}

cartClearBtn.addEventListener("click", () => {
  cart.clear();
  setCartMessage("Carrito vaciado.");
  renderCart();
});

cartCheckoutBtn.addEventListener("click", async () => {
  const items = cartItemsArray();
  if (items.length === 0) {
    setCartMessage("Agrega productos al carrito primero.");
    return;
  }

  statusEl.textContent = "Agendando venta (múltiples productos) y generando despacho...";
  setCartMessage("");
  cartCheckoutBtn.disabled = true;
  cartClearBtn.disabled = true;
  cartCheckoutBtn.textContent = "Procesando...";

  try {
    await apiFetch("/sales", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
    cart.clear();
    renderCart();
    await loadSales();
    setCartMessage("Venta agendada OK.");
  } catch (err) {
    console.error(err);
    setCartMessage(`Error: ${err.message}`);
  } finally {
    cartCheckoutBtn.disabled = false;
    cartClearBtn.disabled = false;
    cartCheckoutBtn.textContent = "Agendar venta";
    statusEl.textContent = "";
  }
});

async function main() {
  try {
    await Promise.all([loadProducts(), loadSales()]);
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error cargando datos: ${err.message}`;
  }

  // Si otra persona genera ventas, las vemos acá (sin recargar la página).
  setInterval(loadSales, 5000);
}

main();
