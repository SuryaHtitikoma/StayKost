/* ============================================================
   STAYKOST — stayassist.js
   Manages tab switching in the StayAssist section.
   Supports: click, keyboard (arrow keys + Enter/Space), touch swipe
   Follows ARIA tab pattern for accessibility.
   ============================================================ */

(function () {
  "use strict";

  const tabs = document.querySelectorAll(".sa-tab");
  const panels = document.querySelectorAll(".sa-panel");

  if (!tabs.length || !panels.length) return;

  // ── SWITCH TAB ────────────────────────────────────────────
  function switchTab(targetTab) {
    // Deactivate all tabs
    tabs.forEach(function (tab) {
      tab.classList.remove("active");
      tab.setAttribute("aria-selected", "false");
      tab.setAttribute("tabindex", "-1");
    });

    // Hide all panels
    panels.forEach(function (panel) {
      panel.classList.remove("active");
    });

    // Activate clicked tab
    targetTab.classList.add("active");
    targetTab.setAttribute("aria-selected", "true");
    targetTab.setAttribute("tabindex", "0");

    // Show corresponding panel
    const panelId = "panel-" + targetTab.dataset.panel;
    const panel = document.getElementById(panelId);
    if (panel) {
      panel.classList.add("active");
    }
  }

  // ── CLICK HANDLER ─────────────────────────────────────────
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchTab(this);
    });
  });

  // ── KEYBOARD NAVIGATION (Arrow keys) ──────────────────────
  // ARIA tabs pattern: Left/Right arrows move focus & activate
  tabs.forEach(function (tab, index) {
    tab.addEventListener("keydown", function (e) {
      let newIndex;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          newIndex = (index + 1) % tabs.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          newIndex = (index - 1 + tabs.length) % tabs.length;
          break;
        case "Home":
          newIndex = 0;
          break;
        case "End":
          newIndex = tabs.length - 1;
          break;
        default:
          return; // Don't prevent default for other keys
      }

      e.preventDefault();
      switchTab(tabs[newIndex]);
      tabs[newIndex].focus();
    });
  });

  // ── TOUCH SWIPE (for mobile) ───────────────────────────────
  const panelContainer = document.querySelector(".sa-panels");
  if (!panelContainer) return;

  let touchStartX = 0;
  let touchStartY = 0;

  panelContainer.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true },
  );

  panelContainer.addEventListener(
    "touchend",
    function (e) {
      const dx = e.changedTouches[0].screenX - touchStartX;
      const dy = e.changedTouches[0].screenY - touchStartY;

      // Only trigger if horizontal swipe > 50px and more horizontal than vertical
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

      // Find current active tab index
      let currentIndex = 0;
      tabs.forEach(function (tab, i) {
        if (tab.classList.contains("active")) {
          currentIndex = i;
        }
      });

      let newIndex;
      if (dx < 0) {
        // Swipe left → next tab
        newIndex = (currentIndex + 1) % tabs.length;
      } else {
        // Swipe right → previous tab
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      }

      switchTab(tabs[newIndex]);
    },
    { passive: true },
  );

  // ── AUTO-PLAY (optional: cycle tabs every 5s on idle) ─────
  let autoPlayTimer;
  const AUTO_INTERVAL = 5000; // 5 seconds

  function startAutoPlay() {
    autoPlayTimer = setInterval(function () {
      let currentIndex = 0;
      tabs.forEach(function (tab, i) {
        if (tab.classList.contains("active")) currentIndex = i;
      });
      const nextIndex = (currentIndex + 1) % tabs.length;
      switchTab(tabs[nextIndex]);
    }, AUTO_INTERVAL);
  }

  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
  }

  // Pause autoplay on user interaction
  tabs.forEach(function (tab) {
    tab.addEventListener("click", stopAutoPlay);
    tab.addEventListener("keydown", stopAutoPlay);
  });

  panelContainer.addEventListener("touchend", stopAutoPlay, { passive: true });

  // Start autoplay only if section is in viewport and reduced motion not preferred
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!prefersReducedMotion) {
    const stayassistSection = document.getElementById("stayassist");
    if (stayassistSection && "IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              startAutoPlay();
            } else {
              stopAutoPlay();
            }
          });
        },
        { threshold: 0.3 },
      );

      sectionObserver.observe(stayassistSection);
    }
  }

  // ── INIT: Set first tab as focusable ──────────────────────
  tabs.forEach(function (tab, i) {
    tab.setAttribute("tabindex", i === 0 ? "0" : "-1");
  });
})();
