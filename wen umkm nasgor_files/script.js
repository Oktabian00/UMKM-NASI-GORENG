/* =========================================================
   NASI GORENG PAK BIAN - script.js
   JavaScript murni (tanpa framework, tanpa database)
   ========================================================= */

/* ---------- 1. PENGATURAN (ubah sesuai kebutuhan) ---------- */
// Nomor WhatsApp penerima pesanan. Format: kode negara 62 tanpa 0 / tanda +
const NOMOR_WA = "6283872485353";

// Foto cadangan jika gambar tidak bisa dimuat
const GAMBAR_CADANGAN = "🍛";

/* ---------- 2. DATA PRODUK ---------- */
const produk = [
  {
    id: 1,
    nama: "Nasi Goreng Original",
    deskripsi: "Nasi goreng klasik dengan bumbu rahasia Pak Bian, gurih dan harum khas wajan api besar.",
    harga: 12000,
    label: "Klasik",
    gambar: "nasigoreng original.jfif",
    emoji: "🍚"
  },
  {
    id: 2,
    nama: "Nasi Goreng Pedas",
    deskripsi: "Nasi goreng gurih ditemani rasa pedas dari cabai pilihan.",
    harga: 15000,
    label: "Favorit",
    gambar: "nasigoreng pedas.jfif",
    emoji: "🍳"
  },
  {
    id: 3,
    nama: "Nasi Goreng Ayam",
    deskripsi: "Dilengkapi potongan ayam suwir yang empuk dan bumbu meresap sempurna.",
    harga: 18000,
    label: "Terlaris",
    gambar: "nasigoreng ayam.jfif",
    emoji: "🍗"
  },
  {
    id: 4,
    nama: "Nasi Goreng Sosis",
    deskripsi: "Nasi goreng dengan irisan sosis sapi gurih, cocok untuk semua usia termasuk si kecil.",
    harga: 17000,
    label: "Anak Suka",
    gambar: "nasigoreng sosis.jfif",
    emoji: "🌭"
  },
  {
    id: 5,
    nama: "Nasi Goreng Spesial",
    deskripsi: "Komplit! Telur, ayam, sosis, bakso, dan kerupuk dalam satu piring puas.",
    harga: 22000,
    label: "Spesial",
    gambar: "nasigoreng special.jfif",
    emoji: "🌶️"
  },
  {
    id: 6,
    nama: "Nasi Goreng Seafood",
    deskripsi: "Isian udang dan cumi segar berpadu bumbu pedas gurih khas pesisir.",
    harga: 25000,
    label: "Premium",
    gambar: "nasigoreng seafood.jfif",
    emoji: "🦐"
  }
];

/* ---------- 3. STATE KERANJANG ---------- */
// Bentuk data: [{ id: 1, jumlah: 2 }, ...]
let keranjang = [];

/* ---------- 4. ELEMEN DOM ---------- */
const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const menuGrid = document.getElementById("menuGrid");

const cartEl = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const openCartBtn = document.getElementById("openCart");
const closeCartBtn = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCart");
const customerNameEl = document.getElementById("customerName");
const toastEl = document.getElementById("toast");

/* ---------- 5. FUNGSI BANTUAN ---------- */

// Mengubah angka menjadi format rupiah, contoh: 15000 -> "Rp15.000"
function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}

// Mencari data produk berdasarkan id
function cariProduk(id) {
  return produk.find(function (p) {
    return p.id === id;
  });
}

// Menampilkan notifikasi kecil di bawah layar
let toastTimer;
function tampilToast(pesan) {
  toastEl.textContent = pesan;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastEl.classList.remove("show");
  }, 2200);
}

// Jika gambar gagal dimuat, ganti dengan emoji cadangan
function pasangGambarCadangan(img, emoji) {
  img.addEventListener("error", function () {
    const pengganti = document.createElement("div");
    pengganti.className = "img-fallback";
    pengganti.textContent = emoji || GAMBAR_CADANGAN;
    pengganti.setAttribute("role", "img");
    pengganti.setAttribute("aria-label", img.alt || "Gambar makanan");
    img.replaceWith(pengganti);
  });
}

/* ---------- 6. TAMPILKAN KARTU MENU ---------- */
function tampilkanMenu() {
  menuGrid.innerHTML = "";

  produk.forEach(function (item) {
    const card = document.createElement("article");
    card.className = "card reveal";

    card.innerHTML =
      '<div class="card-img">' +
        '<img src="' + item.gambar + '" alt="' + item.nama + '" loading="lazy">' +
        '<span class="card-label">' + item.label + "</span>" +
      "</div>" +
      '<div class="card-body">' +
        "<h3>" + item.nama + "</h3>" +
        "<p>" + item.deskripsi + "</p>" +
        '<div class="card-bottom">' +
          '<span class="price">' + formatRupiah(item.harga) + "</span>" +
          '<button class="add-btn" data-id="' + item.id + '">+ Keranjang</button>' +
        "</div>" +
      "</div>";

    pasangGambarCadangan(card.querySelector("img"), item.emoji);
    menuGrid.appendChild(card);
  });
}

/* ---------- 7. LOGIKA KERANJANG ---------- */

// Tambah produk ke keranjang
function tambahKeKeranjang(id) {
  const ada = keranjang.find(function (k) {
    return k.id === id;
  });

  if (ada) {
    ada.jumlah += 1;
  } else {
    keranjang.push({ id: id, jumlah: 1 });
  }

  renderKeranjang();
  tampilToast("✅ " + cariProduk(id).nama + " ditambahkan");

  // Animasi kecil pada ikon keranjang
  openCartBtn.classList.remove("bump");
  void openCartBtn.offsetWidth; // memicu ulang animasi
  openCartBtn.classList.add("bump");
}

// Ubah jumlah (+1 atau -1). Jika jumlah jadi 0, produk dihapus.
function ubahJumlah(id, perubahan) {
  const item = keranjang.find(function (k) {
    return k.id === id;
  });
  if (!item) return;

  item.jumlah += perubahan;

  if (item.jumlah <= 0) {
    hapusDariKeranjang(id);
    return;
  }
  renderKeranjang();
}

// Hapus satu produk dari keranjang
function hapusDariKeranjang(id) {
  keranjang = keranjang.filter(function (k) {
    return k.id !== id;
  });
  renderKeranjang();
}

// Kosongkan seluruh keranjang
function kosongkanKeranjang() {
  keranjang = [];
  renderKeranjang();
}

// Hitung total harga dan total jumlah item
function hitungTotal() {
  let totalHarga = 0;
  let totalItem = 0;

  keranjang.forEach(function (k) {
    totalHarga += cariProduk(k.id).harga * k.jumlah;
    totalItem += k.jumlah;
  });

  return { totalHarga: totalHarga, totalItem: totalItem };
}

// Gambar ulang isi keranjang di layar
function renderKeranjang() {
  cartItemsEl.innerHTML = "";

  if (keranjang.length === 0) {
    cartItemsEl.innerHTML =
      '<div class="cart-empty"><span>🍽️</span>Keranjang masih kosong.<br>Yuk pilih nasi goreng favoritmu!</div>';
  } else {
    keranjang.forEach(function (k) {
      const p = cariProduk(k.id);
      const baris = document.createElement("div");
      baris.className = "cart-item";

      baris.innerHTML =
        '<img src="' + p.gambar + '" alt="' + p.nama + '">' +
        "<div>" +
          "<h4>" + p.nama + "</h4>" +
          '<div class="item-price">' + formatRupiah(p.harga * k.jumlah) + "</div>" +
          '<div class="qty">' +
            '<button data-aksi="kurang" data-id="' + p.id + '" aria-label="Kurangi">−</button>' +
            "<span>" + k.jumlah + "</span>" +
            '<button data-aksi="tambah" data-id="' + p.id + '" aria-label="Tambah">+</button>' +
          "</div>" +
        "</div>" +
        '<button class="remove-btn" data-aksi="hapus" data-id="' + p.id + '" aria-label="Hapus ' + p.nama + '">🗑️</button>';

      // Jika foto gagal dimuat, tampilkan emoji
      const img = baris.querySelector("img");
      img.addEventListener("error", function () {
        const pengganti = document.createElement("div");
        pengganti.className = "thumb-fallback";
        pengganti.textContent = p.emoji;
        img.replaceWith(pengganti);
      });

      cartItemsEl.appendChild(baris);
    });
  }

  const total = hitungTotal();
  cartCountEl.textContent = total.totalItem;
  cartTotalEl.textContent = formatRupiah(total.totalHarga);
}

/* ---------- 8. BUKA / TUTUP KERANJANG ---------- */
function bukaKeranjang() {
  cartEl.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function tutupKeranjang() {
  cartEl.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

/* ---------- 9. CHECKOUT VIA WHATSAPP ---------- */
function checkoutWhatsApp() {
  if (keranjang.length === 0) {
    tampilToast("⚠️ Keranjang masih kosong");
    return;
  }

  const nama = customerNameEl.value.trim();
  let pesan = "Halo Nasi Goreng Pak Bian, saya ingin memesan:\n\n";

  keranjang.forEach(function (k, index) {
    const p = cariProduk(k.id);
    pesan +=
      (index + 1) + ". " + p.nama + " x" + k.jumlah +
      " = " + formatRupiah(p.harga * k.jumlah) + "\n";
  });

  pesan += "\nTotal: " + formatRupiah(hitungTotal().totalHarga);
  if (nama) {
    pesan += "\nAtas nama: " + nama;
  }
  pesan += "\n\nTerima kasih!";

  const url = "https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(pesan);
  window.open(url, "_blank");
}

/* ---------- 10. NAVBAR & MENU HP ---------- */
function aturNavbar() {
  // Navbar menjadi hitam pekat setelah di-scroll
  window.addEventListener("scroll", function () {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
    tandaiMenuAktif();
  });

  // Tombol hamburger (HP)
  hamburger.addEventListener("click", function () {
    hamburger.classList.toggle("open");
    navMenu.classList.toggle("open");
  });

  // Tutup menu HP setelah link diklik
  navMenu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      hamburger.classList.remove("open");
      navMenu.classList.remove("open");
    });
  });
}

// Tandai link menu sesuai bagian yang sedang dilihat
function tandaiMenuAktif() {
  const bagian = document.querySelectorAll("main section[id]");
  let aktif = "beranda";

  bagian.forEach(function (sec) {
    if (window.scrollY >= sec.offsetTop - 120) {
      aktif = sec.id;
    }
  });

  document.querySelectorAll(".nav-link").forEach(function (link) {
    link.classList.toggle("active", link.getAttribute("href") === "#" + aktif);
  });
}

/* ---------- 11. ANIMASI MUNCUL SAAT SCROLL ---------- */
function aturAnimasiScroll() {
  const target = document.querySelectorAll(
    ".reveal, .section-head, .about-image, .about-text, .contact-info, .contact-form, .feature"
  );

  // Jika browser sangat lama dan tidak mendukung, tampilkan semuanya
  if (!("IntersectionObserver" in window)) {
    target.forEach(function (el) {
      el.classList.add("visible");
    });
    return;
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  target.forEach(function (el) {
    el.classList.add("reveal");
    observer.observe(el);
  });
}

/* ---------- 12. FORMULIR KONTAK ---------- */
function aturFormKontak() {
  const form = document.getElementById("contactForm");
  const inputNama = document.getElementById("nama");
  const inputHp = document.getElementById("noHp");
  const inputPesan = document.getElementById("pesan");
  const errNama = document.getElementById("errNama");
  const errHp = document.getElementById("errHp");
  const errPesan = document.getElementById("errPesan");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let valid = true;
    errNama.textContent = "";
    errHp.textContent = "";
    errPesan.textContent = "";

    if (inputNama.value.trim().length < 3) {
      errNama.textContent = "Nama minimal 3 huruf.";
      valid = false;
    }

    // Nomor HP Indonesia: 08xx / 62xx / +62xx, panjang 9-14 digit
    const hp = inputHp.value.replace(/[\s-]/g, "");
    if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(hp)) {
      errHp.textContent = "Masukkan nomor HP yang valid, contoh 081234567890.";
      valid = false;
    }

    if (inputPesan.value.trim().length < 5) {
      errPesan.textContent = "Pesan minimal 5 karakter.";
      valid = false;
    }

    if (!valid) return;

    const teks =
      "Halo Pak Bian, saya " + inputNama.value.trim() +
      " (" + inputHp.value.trim() + ").\n\n" + inputPesan.value.trim();

    window.open("https://wa.me/" + NOMOR_WA + "?text=" + encodeURIComponent(teks), "_blank");
    form.reset();
    tampilToast("✅ Pesan siap dikirim lewat WhatsApp");
  });
}

/* ---------- 13. GAMBAR STATIS (hero & tentang) ---------- */
function aturGambarStatis() {
  document.querySelectorAll("img[data-emoji]").forEach(function (img) {
    pasangGambarCadangan(img, img.dataset.emoji);
  });
}

/* ---------- 14. EVENT LISTENER UTAMA ---------- */
function aturEvent() {
  // Tombol "+ Keranjang" di kartu menu (event delegation)
  menuGrid.addEventListener("click", function (e) {
    const tombol = e.target.closest(".add-btn");
    if (tombol) {
      tambahKeKeranjang(Number(tombol.dataset.id));
    }
  });

  // Tombol + / - / hapus di dalam keranjang (event delegation)
  cartItemsEl.addEventListener("click", function (e) {
    const tombol = e.target.closest("button[data-aksi]");
    if (!tombol) return;

    const id = Number(tombol.dataset.id);
    const aksi = tombol.dataset.aksi;

    if (aksi === "tambah") ubahJumlah(id, 1);
    if (aksi === "kurang") ubahJumlah(id, -1);
    if (aksi === "hapus") hapusDariKeranjang(id);
  });

  openCartBtn.addEventListener("click", bukaKeranjang);
  closeCartBtn.addEventListener("click", tutupKeranjang);
  overlay.addEventListener("click", tutupKeranjang);
  checkoutBtn.addEventListener("click", checkoutWhatsApp);
  clearCartBtn.addEventListener("click", function () {
    if (keranjang.length === 0) return;
    kosongkanKeranjang();
    tampilToast("🗑️ Keranjang dikosongkan");
  });

  // Tutup keranjang dengan tombol Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") tutupKeranjang();
  });
}

/* ---------- 15. MULAI APLIKASI ---------- */
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("year").textContent = new Date().getFullYear();

  tampilkanMenu();
  renderKeranjang();
  aturNavbar();
  aturEvent();
  aturFormKontak();
  aturGambarStatis();
  aturAnimasiScroll();
  tandaiMenuAktif();
});
