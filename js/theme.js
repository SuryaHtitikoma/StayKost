/* ============================================================
   STAYKOST — theme.js
   Dark / Light mode:
   1. Detect system preference (prefers-color-scheme)
   2. Override with user's saved choice (localStorage)
   3. Apply [data-theme] to <html>
   4. Toggle via button
   5. Swap favicon + logo on switch
   ============================================================ */

(function () {
  "use strict";

  const STORAGE_KEY = "staykost-theme";
  const ATTR = "data-theme";
  const DARK = "dark";
  const LIGHT = "light";

  // ── Asset paths ────────────────────────────────────────────
  const ASSETS = {
    favicon: {
      light: "assets/images/favicon.ico",
      dark: "assets/images/favicon-dark.ico",
    },
    logo: {
      light: "assets/images/logo.png",
      dark: "assets/images/logo-dark.png",
    },
  };

  // ── Detect system preference ───────────────────────────────
  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? DARK
      : LIGHT;
  }

  // ── Get saved or system theme ──────────────────────────────
  function getActiveTheme() {
    return localStorage.getItem(STORAGE_KEY) || getSystemTheme();
  }

  // ── Apply theme to <html> ──────────────────────────────────
  function applyTheme(theme) {
    document.documentElement.setAttribute(ATTR, theme);
    swapFavicon(theme);
    swapLogo(theme);
    updateToggleButton(theme);
  }

  // ── Swap favicon ───────────────────────────────────────────
  function swapFavicon(theme) {
    // Handle <link rel="icon">
    const faviconEl = document.querySelector('link[rel="icon"]');
    if (faviconEl) {
      faviconEl.href = ASSETS.favicon[theme] || ASSETS.favicon.light;
    }
  }

  // ── Swap logo img ──────────────────────────────────────────
  function swapLogo(theme) {
    const logoImg = document.getElementById("navbar-logo-img");
    if (!logoImg) return;
    const newSrc = ASSETS.logo[theme] || ASSETS.logo.light;
    // Only update if changed (avoids flash)
    if (logoImg.getAttribute("src") !== newSrc) {
      logoImg.setAttribute("src", newSrc);
      logoImg.setAttribute(
        "alt",
        theme === DARK ? "StayKost logo dark" : "StayKost logo",
      );
    }
  }

  // ── Update toggle button icon & aria-label ─────────────────
  function updateToggleButton(theme) {
    const btn = document.getElementById("theme-toggle");
    const icon = document.getElementById("theme-toggle-icon");
    if (!btn || !icon) return;

    const isDark = theme === DARK;
    icon.className = isDark ? "ti ti-sun" : "ti ti-moon";
    btn.setAttribute(
      "aria-label",
      isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap",
    );
    btn.setAttribute("title", isDark ? "Mode Terang" : "Mode Gelap");
  }

  // ── Toggle between dark and light ─────────────────────────
  function toggleTheme() {
    const current =
      document.documentElement.getAttribute(ATTR) || getActiveTheme();
    const next = current === DARK ? LIGHT : DARK;
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // ── Bind toggle button ─────────────────────────────────────
  function bindToggle() {
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
  }

  // ── Listen to system preference change ────────────────────
  // Only applies if user has not manually overridden
  function listenSystemChange() {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", function (e) {
      // Only auto-switch if no manual preference saved
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  }

  // ── INIT ───────────────────────────────────────────────────
  // Apply theme ASAP (before DOMContentLoaded) to prevent flash
  applyTheme(getActiveTheme());

  // Bind button and system listener after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      bindToggle();
      listenSystemChange();
    });
  } else {
    bindToggle();
    listenSystemChange();
  }
})();
