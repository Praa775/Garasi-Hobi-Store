# Garasi Hobi Store

Static storefront siap upload ke GitHub Pages.

## Struktur
- `index.html` — halaman utama
- `style.css` — desain premium blue/dark
- `script.js` — fitur pencarian, kategori, keranjang, checkout WhatsApp
- `shop.js` — **semua data produk dan konfigurasi toko**

## Cara menambah produk
Buka `shop.js`, lalu tambahkan object baru ke `PRODUCTS`:

```js
{
  id: 4,
  name: "Nama Produk",
  category: "Kategori",
  price: 150000,
  image: "https://files.catbox.moe/foto.jpg",
  link: "https://link-produk-kamu.com",
  description: "Deskripsi singkat produk."
}
```

`image` bisa memakai URL Catbox agar file gambar tidak perlu disimpan di repository.

## Ganti WhatsApp admin
Di bagian `SHOP_CONFIG` pada `shop.js`:

```js
whatsapp: "6281234567890"
```

Gunakan format internasional tanpa tanda `+`.

## Deploy ke GitHub Pages
1. Buat repository baru di GitHub.
2. Upload `index.html`, `style.css`, `script.js`, dan `shop.js`.
3. Masuk `Settings` → `Pages`.
4. Pilih branch utama sebagai source.
5. Simpan dan buka URL GitHub Pages yang diberikan.

Tidak membutuhkan Node.js atau database karena toko ini berjalan sebagai static website.
