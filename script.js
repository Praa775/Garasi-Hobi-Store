const $ = (q) => document.querySelector(q);
const money = (n) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(n);

let cart = [];
let activeCategory = "all";

const grid = $("#productGrid");
const empty = $("#emptyState");
const search = $("#searchInput");
const category = $("#categorySelect");
const categoryStrip = $("#categoryStrip");

function init() {
  $("#year").textContent = new Date().getFullYear();
  $("#productStat").textContent = PRODUCTS.length;
  $("#waAdmin").href = `https://wa.me/${SHOP_CONFIG.whatsapp}?text=${encodeURIComponent(SHOP_CONFIG.whatsappMessage)}`;

  const cats = [...new Set(PRODUCTS.map(p => p.category).filter(Boolean))];
  cats.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    category.appendChild(option);
  });

  renderCategoryStrip(["all", ...cats]);
  renderProducts();
  updateCart();
}

function renderCategoryStrip(cats) {
  categoryStrip.innerHTML = cats.map(cat => `
    <button class="category-chip ${cat === "all" ? "active" : ""}" data-cat="${escapeAttr(cat)}">
      ${cat === "all" ? "Semua" : escapeHTML(cat)}
    </button>
  `).join("");

  categoryStrip.querySelectorAll(".category-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.cat;
      category.value = activeCategory;
      categoryStrip.querySelectorAll(".category-chip").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      renderProducts();
    });
  });
}

function filteredProducts() {
  const q = search.value.trim().toLowerCase();
  return PRODUCTS.filter(p => {
    const categoryMatch = activeCategory === "all" || p.category === activeCategory;
    const searchMatch = !q || `${p.name} ${p.category} ${p.description || ""}`.toLowerCase().includes(q);
    return categoryMatch && searchMatch;
  });
}

function renderProducts() {
  const products = filteredProducts();
  empty.hidden = products.length !== 0;

  grid.innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}"
             loading="lazy" onerror="this.classList.add('broken'); this.nextElementSibling.hidden=false;">
        <div class="image-fallback" hidden><i class="fa-solid fa-image"></i><span>Foto belum tersedia</span></div>
        <span class="product-category">${escapeHTML(p.category)}</span>
        <button class="heart-btn" data-id="${p.id}" aria-label="Tambah ke daftar">
          <i class="fa-regular fa-heart"></i>
        </button>
      </div>
      <div class="product-info">
        <div class="product-title-row">
          <h3>${escapeHTML(p.name)}</h3>
          <strong>${money(p.price)}</strong>
        </div>
        <p>${escapeHTML(p.description || "Produk pilihan dari Garasi Hobi Store.")}</p>
        <div class="product-actions">
          <button class="add-btn" data-id="${p.id}"><i class="fa-solid fa-plus"></i> Tambah</button>
          <a class="detail-btn" href="${safeLink(p.link)}" target="_blank" rel="noopener">
            Detail <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => addToCart(Number(btn.dataset.id)));
  });
  grid.querySelectorAll(".heart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("liked");
      btn.innerHTML = btn.classList.contains("liked")
        ? '<i class="fa-solid fa-heart"></i>'
        : '<i class="fa-regular fa-heart"></i>';
    });
  });
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(x => x.id === id);
  existing ? existing.qty++ : cart.push({ ...product, qty: 1 });
  updateCart();
  showToast(`${product.name} ditambahkan`);
}

function updateCart() {
  $("#cartCount").textContent = cart.reduce((sum, x) => sum + x.qty, 0);
  $("#cartItems").innerHTML = cart.length ? cart.map(item => `
    <div class="cart-item">
      <img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.name)}" onerror="this.style.visibility='hidden'">
      <div class="cart-item-main">
        <strong>${escapeHTML(item.name)}</strong>
        <span>${money(item.price)} × ${item.qty}</span>
        <div class="qty">
          <button data-action="minus" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
          <b>${item.qty}</b>
          <button data-action="plus" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
          <button class="remove" data-action="remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join("") : `
    <div class="cart-empty">
      <i class="fa-solid fa-bag-shopping"></i>
      <h4>Keranjang masih kosong</h4>
      <p>Tambahkan produk yang kamu suka.</p>
    </div>
  `;

  $("#cartTotal").textContent = money(cart.reduce((sum, x) => sum + x.price * x.qty, 0));

  $("#cartItems").querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const item = cart.find(x => x.id === id);
      if (!item) return;
      if (btn.dataset.action === "plus") item.qty++;
      if (btn.dataset.action === "minus") item.qty > 1 ? item.qty-- : cart = cart.filter(x => x.id !== id);
      if (btn.dataset.action === "remove") cart = cart.filter(x => x.id !== id);
      updateCart();
    });
  });
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("drawer-open");
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("drawer-open");
}

$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#drawerBackdrop").addEventListener("click", closeCart);

$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return showToast("Keranjang masih kosong");
  const lines = cart.map(x => `- ${x.name} x${x.qty} = ${money(x.price * x.qty)}`);
  const total = cart.reduce((sum, x) => sum + x.price * x.qty, 0);
  const text = `Halo Admin Garasi Hobi Store, saya ingin order:%0A%0A${encodeURIComponent(lines.join("\n"))}%0A%0ATotal: ${encodeURIComponent(money(total))}`;
  window.open(`https://wa.me/${SHOP_CONFIG.whatsapp}?text=${text}`, "_blank");
});

search.addEventListener("input", renderProducts);
category.addEventListener("change", () => {
  activeCategory = category.value;
  categoryStrip.querySelectorAll(".category-chip").forEach(x => x.classList.toggle("active", x.dataset.cat === activeCategory));
  renderProducts();
});

function showToast(text) {
  const toast = $("#toast");
  toast.querySelector("span").textContent = text;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}
function escapeHTML(v = "") {
  return String(v).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[c]));
}
function escapeAttr(v = "") { return escapeHTML(v); }
function safeLink(v = "#") {
  return /^(https?:\/\/|#|mailto:|tel:)/i.test(v) ? v : "#";
}
init();
