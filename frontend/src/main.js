const apiBase =
  (typeof import.meta.env.VITE_API_URL === "string" &&
    import.meta.env.VITE_API_URL.trim()) ||
  "/api";

const API = apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;

const appEl = document.querySelector("#app");

appEl.innerHTML = `
  <div class="app">
    <header class="header">
      <div class="header-inner">
        <span class="logo">Tienda Innovatech moderna</span>
        <button type="button" class="btn-header" id="btnAddProduct">+ Agregar producto</button>
        <button type="button" class="btn-cart" id="btnOpenCart">
          Carrito <span class="badge" id="cartCount">0</span>
        </button>
      </div>
    </header>

    <main class="main">
      <section class="catalog">
        <h2 class="section-title">Productos</h2>
        <div id="products" class="product-grid"></div>
      </section>

      <section class="orders">
        <h2 class="section-title">Compras realizadas</h2>
        <p id="status" class="status"></p>
        <div id="sales"></div>
      </section>
    </main>

    <aside class="cart-panel hidden" id="cartPanel">
      <div class="cart-panel-head">
        <h3>Tu carrito</h3>
        <button type="button" class="btn-close" id="btnCloseCart">×</button>
      </div>
      <div id="cartItems" class="cart-items"></div>
      <div class="cart-footer">
        <div class="cart-total-row">
          <span>Total</span>
          <strong id="cartTotal">$0</strong>
        </div>
        <button type="button" class="btn-pay" id="btnPay" disabled>Ir a pagar</button>
      </div>
    </aside>
    <div class="overlay hidden" id="overlay"></div>

    <dialog id="modalAddProduct" class="modal">
      <form id="formAddProduct" class="modal-form">
        <h3>Agregar producto</h3>
        <label>Nombre<input name="name" required maxlength="120" /></label>
        <label>Precio (CLP)<input name="price" type="number" min="1" required /></label>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="btnCancelAdd">Cancelar</button>
          <button type="submit" class="btn-primary">Guardar</button>
        </div>
      </form>
    </dialog>

    <dialog id="modalCheckout" class="modal">
      <form id="formCheckout" class="modal-form">
        <h3>¿Dónde llega tu pedido?</h3>
        <p class="modal-hint">Elige una comuna o punto de entrega.</p>
        <div id="deliveryOptions" class="delivery-list"></div>
        <div class="modal-actions">
          <button type="button" class="btn-secondary" id="btnCancelPay">Volver</button>
          <button type="submit" class="btn-primary" id="btnConfirmPay">Confirmar pago</button>
        </div>
      </form>
    </dialog>
  </div>
`;

const style = document.createElement("style");
style.textContent = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: linear-gradient(165deg, #ede7f6 0%, #d1c4e9 40%, #b39ddb 100%);
    background-attachment: fixed;
    font-family: system-ui, sans-serif;
    color: #333;
  }
  .app { min-height: 100vh; }
  .header { background:rgb(0, 255, 8); border-bottom: 1px solidrgb(27, 230, 0); position: sticky; top: 0; z-index: 10; }
  .header-inner { max-width: 1100px; margin: 0 auto; padding: 12px 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .logo { font-weight: 800; font-size: 1.35rem; color: #333; }
  .btn-header { margin-left: auto; padding: 8px 14px; border: 1px solid #3483fa; background: #fff; color: #3483fa; border-radius: 6px; cursor: pointer; font-weight: 600; }
  .btn-header:hover { background: #f0f7ff; }
  .btn-cart { padding: 8px 14px; border: none; background: #3483fa; color: #fff; border-radius: 6px; cursor: pointer; font-weight: 600; }
  .btn-cart:hover { background: #2968c8; }
  .badge { background: #fff; color: #3483fa; border-radius: 10px; padding: 2px 8px; margin-left: 4px; font-size: 0.85rem; }
  .main { max-width: 1100px; margin: 0 auto; padding: 20px 16px 48px; }
  .section-title { font-size: 1.1rem; margin: 0 0 14px; }
  .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
  .card { background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.08); display: flex; flex-direction: column; }
  .card-img { height: 140px; background: linear-gradient(135deg, #f5f5f5, #e8e8e8); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
  .card-body { padding: 12px; flex: 1; display: flex; flex-direction: column; }
  .card-title { font-size: 0.95rem; margin: 0 0 8px; line-height: 1.3; }
  .card-price { font-size: 1.35rem; font-weight: 400; color: #333; margin-bottom: 10px; }
  .card-price small { font-size: 0.75rem; }
  .btn-add { width: 100%; padding: 10px; border: none; background: #3483fa; color: #fff; border-radius: 6px; cursor: pointer; font-weight: 600; margin-top: auto; }
  .btn-add:hover { background: #2968c8; }
  .orders { margin-top: 36px; }
  .status { color: #666; font-size: 0.9rem; min-height: 1.2em; }
  .sales-table { width: 100%; background: #fff; border-radius: 8px; border-collapse: collapse; font-size: 0.9rem; }
  .sales-table th, .sales-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
  .sales-table th { background: #fafafa; }
  .cart-panel { position: fixed; top: 0; right: 0; width: min(380px, 100%); height: 100%; background: #fff; z-index: 30; box-shadow: -4px 0 20px rgba(0,0,0,.12); display: flex; flex-direction: column; }
  .cart-panel.hidden { display: none; }
  .cart-panel-head { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #eee; }
  .cart-panel-head h3 { margin: 0; }
  .btn-close { border: none; background: none; font-size: 1.5rem; cursor: pointer; color: #666; }
  .cart-items { flex: 1; overflow: auto; padding: 12px 16px; }
  .cart-line { border-bottom: 1px solid #f0f0f0; padding: 10px 0; }
  .cart-line-name { font-weight: 600; font-size: 0.9rem; }
  .cart-line-meta { display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.85rem; color: #666; }
  .cart-empty { color: #888; text-align: center; padding: 24px; }
  .cart-footer { border-top: 1px solid #eee; padding: 16px; }
  .cart-total-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 1.1rem; }
  .btn-pay { width: 100%; padding: 12px; border: none; background: #00a650; color: #fff; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 1rem; }
  .btn-pay:disabled { background: #ccc; cursor: not-allowed; }
  .btn-pay:not(:disabled):hover { background: #008f45; }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 20; }
  .overlay.hidden { display: none; }
  .modal { border: none; border-radius: 10px; padding: 0; max-width: 420px; width: calc(100% - 32px); box-shadow: 0 8px 32px rgba(0,0,0,.2); }
  .modal::backdrop { background: rgba(0,0,0,.4); }
  .modal-form { padding: 20px; }
  .modal-form h3 { margin: 0 0 12px; }
  .modal-hint { margin: 0 0 14px; color: #666; font-size: 0.9rem; }
  .modal-form label { display: block; margin-bottom: 12px; font-size: 0.9rem; font-weight: 600; }
  .modal-form input { display: block; width: 100%; margin-top: 6px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; font-weight: 400; }
  .modal-actions { display: flex; gap: 10px; margin-top: 16px; }
  .btn-primary, .btn-secondary { flex: 1; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; border: none; }
  .btn-primary { background: #3483fa; color: #fff; }
  .btn-secondary { background: #eee; color: #333; }
  .delivery-list { display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow: auto; }
  .delivery-option { display: flex; align-items: flex-start; gap: 10px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
  .delivery-option:has(input:checked) { border-color: #3483fa; background: #f0f7ff; }
  .delivery-option input { margin-top: 3px; }
  .delivery-name { font-weight: 600; }
  .delivery-meta { font-size: 0.85rem; color: #666; }
`;
document.head.appendChild(style);

const productsEl = document.getElementById("products");
const salesEl = document.getElementById("sales");
const statusEl = document.getElementById("status");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const btnPay = document.getElementById("btnPay");
const modalAddProduct = document.getElementById("modalAddProduct");
const modalCheckout = document.getElementById("modalCheckout");
const deliveryOptionsEl = document.getElementById("deliveryOptions");

let productsById = new Map();
let cart = new Map();
let deliveryLocations = [];

function formatPrice(amount) {
  return Number(amount).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });
}

function productEmoji(name) {
  const n = String(name).toLowerCase();
  if (n.includes("notebook") || n.includes("laptop")) return "💻";
  if (n.includes("mouse")) return "🖱️";
  if (n.includes("teclado")) return "⌨️";
  if (n.includes("monitor")) return "🖥️";
  return "📦";
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

function cartCount() {
  let n = 0;
  for (const q of cart.values()) n += q;
  return n;
}

function cartTotalCents() {
  let total = 0;
  for (const [productId, quantity] of cart.entries()) {
    const p = productsById.get(productId);
    if (p) total += Number(p.price_cents) * quantity;
  }
  return total;
}

function openCart() {
  cartPanel.classList.remove("hidden");
  overlay.classList.remove("hidden");
}

function closeCart() {
  cartPanel.classList.add("hidden");
  overlay.classList.add("hidden");
}

function renderCart() {
  const count = cartCount();
  cartCountEl.textContent = String(count);
  btnPay.disabled = count === 0;
  cartTotalEl.textContent = formatPrice(cartTotalCents());

  if (count === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Tu carrito está vacío</p>`;
    return;
  }

  cartItemsEl.innerHTML = Array.from(cart.entries())
    .map(([productId, quantity]) => {
      const p = productsById.get(productId);
      if (!p) return "";
      const line = Number(p.price_cents) * quantity;
      return `
        <div class="cart-line">
          <div class="cart-line-name">${p.name}</div>
          <div class="cart-line-meta">
            <span>${quantity} u. · ${formatPrice(line)}</span>
            <button type="button" data-remove="${productId}" style="border:none;background:none;color:#3483fa;cursor:pointer;">Quitar</button>
          </div>
        </div>
      `;
    })
    .join("");

  cartItemsEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cart.delete(Number(btn.dataset.remove));
      renderCart();
    });
  });
}

function renderProducts(products) {
  productsById = new Map(products.map((p) => [Number(p.id), p]));

  if (products.length === 0) {
    productsEl.innerHTML = `<p>No hay productos. Usa "Agregar producto".</p>`;
    return;
  }

  productsEl.innerHTML = products
    .map(
      (p) => `
      <article class="card">
        <div class="card-img">${productEmoji(p.name)}</div>
        <div class="card-body">
          <h3 class="card-title">${p.name}</h3>
          <p class="card-price">${formatPrice(p.price_cents)}</p>
          <button type="button" class="btn-add" data-add="${p.id}">Agregar al carrito</button>
        </div>
      </article>
    `
    )
    .join("");

  productsEl.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.add);
      cart.set(id, (cart.get(id) || 0) + 1);
      renderCart();
      openCart();
    });
  });
}

async function loadProducts() {
  const data = await apiFetch("/products");
  renderProducts(data.products || []);
}

async function loadDeliveryLocations() {
  const data = await apiFetch("/delivery-locations");
  deliveryLocations = data.locations || [];
}

function renderDeliveryOptions() {
  deliveryOptionsEl.innerHTML = deliveryLocations
    .map(
      (loc, i) => `
      <label class="delivery-option">
        <input type="radio" name="delivery" value="${loc.id}" ${i === 0 ? "checked" : ""} required />
        <div>
          <div class="delivery-name">${loc.name}</div>
          <div class="delivery-meta">${loc.region || ""} · llega en ${loc.delivery_days || 3} días</div>
        </div>
      </label>
    `
    )
    .join("");
}

function formatSaleItems(items) {
  if (!Array.isArray(items) || items.length === 0) return "-";
  return items.map((it) => `${it.product_name} x${it.quantity}`).join(", ");
}

async function loadSales() {
  const data = await apiFetch("/sales");
  const sales = data.sales || [];

  if (sales.length === 0) {
    salesEl.innerHTML = `<p style="color:#666;">Aún no hay compras.</p>`;
    return;
  }

  salesEl.innerHTML = `
    <table class="sales-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Productos</th>
          <th>Total</th>
          <th>Entrega</th>
          <th>Despacho</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        ${sales
          .map((s) => {
            const fecha = s.created_at
              ? new Date(s.created_at).toLocaleString("es-CL")
              : "";
            return `
              <tr>
                <td>${s.id}</td>
                <td>${formatSaleItems(s.items)}</td>
                <td>${formatPrice(s.total_cents)}</td>
                <td>${s.delivery_name || "-"}</td>
                <td>${s.dispatch_status || "-"}</td>
                <td>${fecha}</td>
              </tr>
            `;
          })
          .join("")}
      </tbody>
    </table>
  `;
}

document.getElementById("btnOpenCart").addEventListener("click", openCart);
document.getElementById("btnCloseCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.getElementById("btnAddProduct").addEventListener("click", () => {
  modalAddProduct.showModal();
});

document.getElementById("btnCancelAdd").addEventListener("click", () => {
  modalAddProduct.close();
});

document.getElementById("formAddProduct").addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = String(fd.get("name") || "").trim();
  const price = Number(fd.get("price"));
  if (!name || !Number.isFinite(price) || price <= 0) return;

  statusEl.textContent = "Guardando producto...";
  try {
    await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify({ name, price_cents: Math.round(price) }),
    });
    e.target.reset();
    modalAddProduct.close();
    await loadProducts();
    statusEl.textContent = "Producto agregado.";
  } catch (err) {
    alert(err.message);
    statusEl.textContent = "";
  }
});

document.getElementById("btnPay").addEventListener("click", async () => {
  if (cartCount() === 0) return;
  if (deliveryLocations.length === 0) await loadDeliveryLocations();
  renderDeliveryOptions();
  modalCheckout.showModal();
});

document.getElementById("btnCancelPay").addEventListener("click", () => {
  modalCheckout.close();
});

document.getElementById("formCheckout").addEventListener("submit", async (e) => {
  e.preventDefault();
  const selected = e.target.querySelector('input[name="delivery"]:checked');
  if (!selected) return;

  const items = Array.from(cart.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  const btn = document.getElementById("btnConfirmPay");
  btn.disabled = true;
  btn.textContent = "Procesando...";
  statusEl.textContent = "Registrando compra y despacho...";

  try {
    await apiFetch("/sales", {
      method: "POST",
      body: JSON.stringify({
        items,
        deliveryLocationId: Number(selected.value),
      }),
    });
    cart.clear();
    renderCart();
    closeCart();
    modalCheckout.close();
    await loadSales();
    statusEl.textContent = "Compra registrada en la base de datos.";
  } catch (err) {
    alert(err.message);
    statusEl.textContent = "";
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirmar pago";
  }
});

async function main() {
  try {
    statusEl.textContent = "Cargando...";
    await Promise.all([loadProducts(), loadDeliveryLocations(), loadSales()]);
    statusEl.textContent = "";
    renderCart();
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
  }
  setInterval(loadSales, 8000);
}

main();
