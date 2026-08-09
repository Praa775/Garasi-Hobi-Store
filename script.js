const $ = (selector) =>
  document.querySelector(selector);


const formatRupiah = (number) => {

  return new Intl.NumberFormat("id-ID", {

    style: "currency",

    currency: "IDR",

    maximumFractionDigits: 0

  }).format(number);

};


let cart = [];

let activeCategory = "all";


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/[&<>"']/g, char => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[char]));

}


function init() {

  $("#year").textContent =
    new Date().getFullYear();


  $("#productCount").textContent =
    PRODUCTS.length;


  const whatsappMessage =
    "Halo Admin Garasi Hobi Store, saya ingin bertanya tentang produk.";


  const whatsappURL =
    `https://wa.me/${SHOP_CONFIG.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;


  $("#whatsappButton").href =
    whatsappURL;


  $("#tiktokLink").href =
    SHOP_CONFIG.tiktok;


  $("#instagramLink").href =
    SHOP_CONFIG.instagram;


  const categories = [
    ...new Set(
      PRODUCTS.map(product => product.category)
    )
  ];


  categories.forEach(category => {

    $("#categorySelect").insertAdjacentHTML(
      "beforeend",
      `
      <option value="${escapeHTML(category)}">
        ${escapeHTML(category)}
      </option>
      `
    );

  });


  renderCategories();

  renderProducts();

  updateCart();

}


function renderCategories() {

  const categories = [
    "all",
    ...new Set(
      PRODUCTS.map(product => product.category)
    )
  ];


  $("#categories").innerHTML =
    categories.map(category => `

      <button
        class="${category === activeCategory ? "active" : ""}"
        data-category="${escapeHTML(category)}">

        ${
          category === "all"
            ? "Semua"
            : escapeHTML(category)
        }

      </button>

    `).join("");


  document
    .querySelectorAll("#categories button")
    .forEach(button => {

      button.onclick = () => {

        activeCategory =
          button.dataset.category;

        $("#categorySelect").value =
          activeCategory;

        renderCategories();

        renderProducts();

      };

    });

}


function renderProducts() {

  const keyword =
    $("#searchInput")
      .value
      .toLowerCase()
      .trim();


  const products =
    PRODUCTS.filter(product => {

      const categoryMatch =
        activeCategory === "all" ||
        product.category === activeCategory;


      const searchMatch =
        !keyword ||
        `${product.name}
        ${product.category}
        ${product.description}`
          .toLowerCase()
          .includes(keyword);


      return categoryMatch && searchMatch;

    });


  $("#empty").hidden =
    products.length !== 0;


  $("#productGrid").innerHTML =
    products.map(product => `

      <article class="product-card">

        <div class="product-image">

          <img
            src="${escapeHTML(product.image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy">

          <span>
            ${escapeHTML(product.category)}
          </span>

          <button class="heart">

            <i class="fa-regular fa-heart"></i>

          </button>

        </div>


        <div class="product-info">

          <h3>
            ${escapeHTML(product.name)}
          </h3>

          <strong>
            ${formatRupiah(product.price)}
          </strong>

          <p>
            ${escapeHTML(product.description)}
          </p>


          <div class="product-buttons">

            <button
              class="add"
              data-id="${product.id}">

              <i class="fa-solid fa-plus"></i>

              Tambah

            </button>


            <a
              href="${/^https?:\/\//i.test(product.link)
                ? escapeHTML(product.link)
                : "#"}"
              target="_blank">

              Detail

              <i class="fa-solid fa-arrow-up-right-from-square"></i>

            </a>

          </div>

        </div>

      </article>

    `).join("");


  document
    .querySelectorAll(".add")
    .forEach(button => {

      button.onclick = () => {

        addToCart(
          Number(button.dataset.id)
        );

      };

    });


  document
    .querySelectorAll(".heart")
    .forEach(button => {

      button.onclick = () => {

        button.classList.toggle("liked");


        button.innerHTML =
          button.classList.contains("liked")

            ? '<i class="fa-solid fa-heart"></i>'

            : '<i class="fa-regular fa-heart"></i>';

      };

    });

}


function addToCart(id) {

  const product =
    PRODUCTS.find(product =>
      product.id === id);


  if (!product) return;


  const existing =
    cart.find(item =>
      item.id === id);


  if (existing) {

    existing.quantity++;

  } else {

    cart.push({

      ...product,

      quantity: 1

    });

  }


  updateCart();

  showToast(
    `${product.name} ditambahkan`
  );

}


function updateCart() {

  const count =
    cart.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );


  $("#cartCount").textContent =
    count;


  if (!cart.length) {

    $("#cartItems").innerHTML = `

      <div class="empty-cart">

        <i class="fa-solid fa-bag-shopping"></i>

        <h4>
          Keranjang kosong
        </h4>

        <p>
          Tambahkan produk yang kamu suka.
        </p>

      </div>

    `;

  } else {

    $("#cartItems").innerHTML =
      cart.map(item => `

        <div class="cart-item">

          <img
            src="${escapeHTML(item.image)}"
            alt="${escapeHTML(item.name)}">

          <div>

            <strong>
              ${escapeHTML(item.name)}
            </strong>

            <small>
              ${formatRupiah(item.price)}
            </small>


            <div class="quantity">

              <button
                data-action="minus"
                data-id="${item.id}">

                <i class="fa-solid fa-minus"></i>

              </button>


              <b>
                ${item.quantity}
              </b>


              <button
                data-action="plus"
                data-id="${item.id}">

                <i class="fa-solid fa-plus"></i>

              </button>


              <button
                class="delete"
                data-action="delete"
                data-id="${item.id}">

                <i class="fa-solid fa-trash"></i>

              </button>

            </div>

          </div>

        </div>

      `).join("");

  }


  const total =
    cart.reduce(
      (sum, item) =>
        sum +
        item.price *
        item.quantity,
      0
    );


  $("#cartTotal").textContent =
    formatRupiah(total);


  document
    .querySelectorAll("[data-action]")
    .forEach(button => {

      button.onclick = () => {

        const id =
          Number(button.dataset.id);


        const item =
          cart.find(
            product =>
              product.id === id
          );


        if (!item) return;


        if (
          button.dataset.action ===
          "plus"
        ) {

          item.quantity++;

        }


        if (
          button.dataset.action ===
          "minus"
        ) {

          item.quantity--;

          if (item.quantity <= 0) {

            cart =
              cart.filter(
                product =>
                  product.id !== id
              );

          }

        }


        if (
          button.dataset.action ===
          "delete"
        ) {

          cart =
            cart.filter(
              product =>
                product.id !== id
            );

        }


        updateCart();

      };

    });

}


function openCart() {

  $("#cartOverlay")
    .classList
    .add("open");

}


function closeCart() {

  $("#cartOverlay")
    .classList
    .remove("open");

}


$("#cartButton")
  .onclick = openCart;


$("#closeCart")
  .onclick = closeCart;


$("#cartBackdrop")
  .onclick = closeCart;


$("#searchInput")
  .oninput = renderProducts;


$("#categorySelect")
  .onchange = event => {

    activeCategory =
      event.target.value;

    renderCategories();

    renderProducts();

  };


$("#checkoutButton")
  .onclick = () => {

    if (!cart.length) {

      showToast(
        "Keranjang masih kosong"
      );

      return;

    }


    const list =
      cart.map(item =>
        `- ${item.name} x${item.quantity} = ${formatRupiah(item.price * item.quantity)}`
      ).join("\n");


    const total =
      cart.reduce(
        (sum, item) =>
          sum +
          item.price *
          item.quantity,
        0
      );


    const message =
      `Halo Admin Garasi Hobi Store, saya ingin order:

${list}

Total: ${formatRupiah(total)}`;


    window.open(
      `https://wa.me/${SHOP_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

};


function showToast(message) {

  const toast =
    $("#toast");


  toast.querySelector("span")
    .textContent = message;


  toast.classList.add("show");


  clearTimeout(
    window.toastTimer
  );


  window.toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 1800);

}


init();