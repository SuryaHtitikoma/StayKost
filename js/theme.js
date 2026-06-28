/* ============================================================
   STAYKOST — theme.js  (fixed)

   BUG SEBELUMNYA:
   applyTheme() dipanggil langsung di <head> saat DOM belum ada.
   document.documentElement.setAttribute() → OK (selalu ada).
   swapLogo() & updateToggleButton() → NULL, gagal diam-diam.
   Keduanya tidak pernah dipanggil ulang setelah DOM siap.

   FIX:
   Pisah menjadi dua fungsi bertanggung jawab berbeda:
   ┌─ applyThemeAttr()  → hanya set data-theme, jalan SEGERA
   │                      di <head> sebelum body render
   │                      → mencegah Flash of Wrong Theme (FOWT)
   └─ applyThemeDom()   → update logo, favicon, tombol
                          hanya dipanggil setelah DOMContentLoaded
   ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "staykost-theme";
  var DARK = "dark";
  var LIGHT = "light";

  var ASSETS = {
    favicon: {
      light: "favicon.ico",
      dark: "favicon-dark.ico",
    },
    logo: {
      light: "assets/images/logo.png",
      dark: "assets/images/logo-dark.png",
    },
  };

  /* ── Helper: tema aktif ──────────────────────────────────── */
  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? DARK
      : LIGHT;
  }

  function getActiveTheme() {
    return localStorage.getItem(STORAGE_KEY) || getSystemTheme();
  }

  /* ── STEP 1 — Segera (aman di <head>) ───────────────────── */
  /* Hanya set attribute di <html>. Tidak menyentuh DOM lain. */
  function applyThemeAttr(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  /* ── STEP 2 — Setelah DOM siap ──────────────────────────── */
  /* Logo, favicon, ikon tombol — semua butuh elemen <body>.  */
  function applyThemeDom(theme) {
    swapFavicon(theme);
    swapLogo(theme);
    updateToggleButton(theme);
  }

  /* ── Favicon swap ────────────────────────────────────────── */
  function swapFavicon(theme) {
    var el = document.getElementById("favicon-link");
    if (!el) return;
    var newHref = ASSETS.favicon[theme] || ASSETS.favicon.light;
    if (el.getAttribute("href") !== newHref) {
      el.setAttribute("href", newHref);
    }
  }

  /* ── Logo swap ───────────────────────────────────────────── */
  function swapLogo(theme) {
    var img = document.getElementById("navbar-logo-img");
    if (!img) return;
    var newSrc = ASSETS.logo[theme] || ASSETS.logo.light;
    if (img.getAttribute("src") !== newSrc) {
      img.setAttribute("src", newSrc);
    }
  }

  /* ── Toggle button: ikon + aria-label ───────────────────── */
  function updateToggleButton(theme) {
    var btn = document.getElementById("theme-toggle");
    var icon = document.getElementById("theme-toggle-icon");
    if (!btn || !icon) return;

    var isDark = theme === DARK;

    /* Dark mode aktif → tampilkan ikon MATAHARI (untuk switch ke light) */
    /* Light mode aktif → tampilkan ikon BULAN   (untuk switch ke dark)  */
    icon.className = isDark ? "ti ti-sun" : "ti ti-moon";

    btn.setAttribute(
      "aria-label",
      isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap",
    );
    btn.setAttribute("title", isDark ? "Mode Terang" : "Mode Gelap");
  }

  /* ── Toggle handler (dipanggil saat klik tombol) ────────── */
  /* DOM sudah pasti siap saat user bisa klik tombol.          */
  function toggleTheme() {
    var current =
      document.documentElement.getAttribute("data-theme") || getActiveTheme();
    var next = current === DARK ? LIGHT : DARK;

    localStorage.setItem(STORAGE_KEY, next);
    applyThemeAttr(next);
    applyThemeDom(next); /* DOM ready — aman */
  }

  /* ── Bind tombol ─────────────────────────────────────────── */
  function bindToggle() {
    var btn = document.getElementById("theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  /* ── Reactive: ikuti perubahan sistem ───────────────────── */
  /* Hanya aktif jika user BELUM pernah manual toggle.         */
  function listenSystemChange() {
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", function (e) {
      if (localStorage.getItem(STORAGE_KEY))
        return; /* ada pilihan manual → abaikan */
      var newTheme = e.matches ? DARK : LIGHT;
      applyThemeAttr(newTheme);
      applyThemeDom(newTheme); /* DOM sudah ready */
    });
  }

  /* ══════════════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════════════ */

  /* Langkah 1 — SEGERA: set data-theme sebelum browser render body
     → tidak ada flash of wrong theme                               */
  applyThemeAttr(getActiveTheme());

  /* Langkah 2 — SETELAH DOM: update logo, favicon, tombol         */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyThemeDom(
        getActiveTheme(),
      ); /* ← Fix utama: dipanggil setelah DOM siap */
      bindToggle();
      listenSystemChange();
    });
  } else {
    /* readyState sudah 'interactive' atau 'complete' */
    applyThemeDom(getActiveTheme());
    bindToggle();
    listenSystemChange();
  }
})();
