/* ============================================================
   STAYKOST — scroll-reveal.js
   Uses IntersectionObserver to trigger entrance animations
   when elements enter the viewport. Respects prefers-reduced-motion.
   ============================================================ */

(function () {
  "use strict";

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // If reduced motion, make everything visible immediately
  if (prefersReducedMotion) {
    document
      .querySelectorAll(".reveal, .reveal-left, .reveal-right")
      .forEach(function (el) {
        el.classList.add("is-visible");
      });
    return;
  }

  // If browser doesn't support IntersectionObserver, fallback
  if (!("IntersectionObserver" in window)) {
    document
      .querySelectorAll(".reveal, .reveal-left, .reveal-right")
      .forEach(function (el) {
        el.classList.add("is-visible");
      });
    return;
  }

  // ── CREATE OBSERVER ───────────────────────────────────────
  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          // Unobserve after reveal (one-shot animation)
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12, // Trigger when 12% of element is visible
      rootMargin: "0px 0px -40px 0px", // Start slightly before element enters
    },
  );

  // ── OBSERVE ALL REVEAL ELEMENTS ───────────────────────────
  function initReveal() {
    const revealEls = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right",
    );

    revealEls.forEach(function (el) {
      // Already in viewport on load (e.g. hero) — reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        // Small delay so CSS transitions are registered
        setTimeout(function () {
          el.classList.add("is-visible");
        }, 50);
      } else {
        observer.observe(el);
      }
    });
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initReveal);
  } else {
    initReveal();
  }
})();
