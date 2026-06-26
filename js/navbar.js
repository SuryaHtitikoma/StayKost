/* ============================================================
   STAYKOST — navbar.js
   Handles: sticky scroll effect, hamburger toggle, active links,
            mobile menu close on link click & outside tap
   ============================================================ */

(function () {
  "use strict";

  const navbar = document.getElementById("navbar");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("main section[id]");

  // ── 1. STICKY / SCROLL EFFECT ──────────────────────────────
  function handleScroll() {
    if (window.scrollY > 20) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    updateActiveLink();
  }

  window.addEventListener("scroll", handleScroll, { passive: true });

  // ── 2. HAMBURGER TOGGLE ────────────────────────────────────
  function openMenu() {
    hamburger.classList.add("is-open");
    mobileMenu.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent bg scroll
  }

  function closeMenu() {
    hamburger.classList.remove("is-open");
    mobileMenu.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function toggleMenu() {
    const isOpen = hamburger.classList.contains("is-open");
    isOpen ? closeMenu() : openMenu();
  }

  hamburger.addEventListener("click", toggleMenu);

  // ── 3. CLOSE MENU ON MOBILE LINK CLICK ────────────────────
  mobileLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // ── 4. CLOSE MENU ON OUTSIDE TAP (mobile) ─────────────────
  document.addEventListener("click", function (e) {
    const isMenuOpen = mobileMenu.classList.contains("is-open");
    if (!isMenuOpen) return;

    const clickedInsideMenu = mobileMenu.contains(e.target);
    const clickedHamburger = hamburger.contains(e.target);

    if (!clickedInsideMenu && !clickedHamburger) {
      closeMenu();
    }
  });

  // ── 5. CLOSE ON ESC KEY ───────────────────────────────────
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
      closeMenu();
      hamburger.focus(); // Return focus to trigger
    }
  });

  // ── 6. CLOSE MENU ON RESIZE TO DESKTOP ────────────────────
  const mql = window.matchMedia("(min-width: 768px)");
  mql.addEventListener("change", function (e) {
    if (e.matches) {
      closeMenu();
    }
  });

  // ── 7. ACTIVE NAV LINK ON SCROLL ──────────────────────────
  function updateActiveLink() {
    let currentId = "";
    const scrollY = window.scrollY + 100; // Offset for navbar height

    sections.forEach(function (section) {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        currentId = section.getAttribute("id");
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      // Match '#tentang' → 'tentang'
      if (href && href.slice(1) === currentId) {
        link.classList.add("active");
      }
    });
  }

  // ── 8. SMOOTH SCROLL OFFSET (account for fixed navbar) ────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 68;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  // Initial call
  handleScroll();
})();
