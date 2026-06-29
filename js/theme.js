/* ============================================================
   STAYKOST — theme.js  (Enhanced)

   FEATURES:
   - No Flash of Wrong Theme (FOWT)
   - Smooth transitions with CSS
   - System preference detection
   - User preference persistence
   - Accessibility announcements
   - Logo & favicon swapping
   - Keyboard shortcut support (Alt+T)
   - Reactive to system theme changes

   ARCHITECTURE:
   ┌─ applyThemeAttr()  → ASAP in <head>, set data-theme
   │                      (prevent FOWT)
   └─ applyThemeDom()   → After DOM ready, update UI elements
   ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "staykost-theme";
  var DARK = "dark";
  var LIGHT = "light";
  var TRANSITION_CLASS = "theme-transitioning";

  var ASSETS = {
    favicon: {
      light: "assets/images/favicon.ico",
      dark: "assets/images/favicon-dark.ico",
    },
    logo: {
      light: "assets/images/logo.png",
      dark: "assets/images/logo-dark.png",
    },
  };

  /* ── Helper: Get system theme preference ──────────────────── */
  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? DARK
      : LIGHT;
  }

  /* ── Helper: Get currently active theme ──────────────────── */
  function getActiveTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    return stored || getSystemTheme();
  }

  /* ── Helper: Get next theme ──────────────────────────────── */
  function getNextTheme() {
    var current =
      document.documentElement.getAttribute("data-theme") || getActiveTheme();
    return current === DARK ? LIGHT : DARK;
  }

  /* ── STEP 1 — IMMEDIATE (safe in <head>) ─────────────────── */
  /* Only set attribute on <html>. No DOM manipulation. */
  function applyThemeAttr(theme) {
    if (document.documentElement.getAttribute("data-theme") === theme) {
      return; /* No change needed */
    }
    document.documentElement.setAttribute("data-theme", theme);
  }

  /* ── STEP 2 — AFTER DOM READY ─────────────────────────────── */
  /* Update logo, favicon, button icon. */
  function applyThemeDom(theme) {
    swapFavicon(theme);
    swapLogo(theme);
    updateToggleButton(theme);
    announceThemeChange(theme);
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

  /* ── Update toggle button: icon + aria-label ───────────────── */
  function updateToggleButton(theme) {
    var btn = document.getElementById("theme-toggle");
    var icon = document.getElementById("theme-toggle-icon");
    if (!btn || !icon) return;

    var isDark = theme === DARK;

    /* Dark mode → show SUN icon (to switch to light) */
    /* Light mode → show MOON icon (to switch to dark) */
    icon.className = isDark ? "ti ti-sun" : "ti ti-moon";

    var label = isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap";
    var title = isDark ? "Mode Terang" : "Mode Gelap";

    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", title);
  }

  /* ── Accessibility announcement ──────────────────────────── */
  function announceThemeChange(theme) {
    var message =
      theme === DARK ? "Mode gelap diaktifkan" : "Mode terang diaktifkan";

    /* Create or reuse live region for announcements */
    var liveRegion = document.getElementById("theme-announce");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "theme-announce";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.style.position = "absolute";
      liveRegion.style.left = "-9999px";
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
  }

  /* ── Toggle theme handler ────────────────────────────────── */
  function toggleTheme() {
    var next = getNextTheme();
    setTheme(next);
  }

  /* ── Set theme with transition class ────────────────────────── */
  function setTheme(theme) {
    /* Save preference */
    localStorage.setItem(STORAGE_KEY, theme);

    /* Apply theme */
    applyThemeAttr(theme);
    applyThemeDom(theme);

    /* Optional: Add transition class for special effects */
    if (document.body.classList) {
      document.body.classList.add(TRANSITION_CLASS);
      setTimeout(function () {
        document.body.classList.remove(TRANSITION_CLASS);
      }, 300);
    }
  }

  /* ── Bind toggle button click ─────────────────────────────── */
  function bindToggle() {
    var btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", toggleTheme);
    }
  }

  /* ── Keyboard shortcut: Alt+T to toggle theme ────────────────── */
  function bindKeyboardShortcut() {
    document.addEventListener("keydown", function (e) {
      /* Alt+T */
      if (e.altKey && e.key === "t") {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  /* ── Listen for system theme changes ────────────────────────── */
  /* Only active if user hasn't manually set a preference. */
  function listenSystemChange() {
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener("change", function (e) {
      /* User has manual preference → ignore system change */
      if (localStorage.getItem(STORAGE_KEY)) return;

      var newTheme = e.matches ? DARK : LIGHT;
      applyThemeAttr(newTheme);
      applyThemeDom(newTheme);
    });
  }

  /* ══════════════════════════════════════════════════════════
     INITIALIZATION
     ══════════════════════════════════════════════════════════ */

  /* Step 1 — IMMEDIATELY: Set data-theme before body renders
     → Prevent Flash of Wrong Theme (FOWT) */
  applyThemeAttr(getActiveTheme());

  /* Step 2 — AFTER DOM READY: Update UI, bind events */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyThemeDom(getActiveTheme());
      bindToggle();
      bindKeyboardShortcut();
      listenSystemChange();
    });
  } else {
    /* DOM already ready (e.g., script loaded late) */
    applyThemeDom(getActiveTheme());
    bindToggle();
    bindKeyboardShortcut();
    listenSystemChange();
  }

  /* ── Export for external use (optional) ──────────────────── */
  if (window && !window.StayKostTheme) {
    window.StayKostTheme = {
      toggle: toggleTheme,
      set: setTheme,
      get: getActiveTheme,
      getNext: getNextTheme,
      DARK: DARK,
      LIGHT: LIGHT,
    };
  }
})();
