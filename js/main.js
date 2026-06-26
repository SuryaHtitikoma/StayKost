/* ============================================================
   STAYKOST — main.js
   Entry point: global utilities, lazy image loading,
   copyright year, and any cross-module coordination.
   (navbar.js, scroll-reveal.js, stayassist.js loaded before this)
   ============================================================ */

(function () {
  'use strict';

  // ── 1. AUTO-UPDATE COPYRIGHT YEAR ─────────────────────────
  const yearEls = document.querySelectorAll('[data-year]');
  yearEls.forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ── 2. LAZY LOAD IMAGES (native + fallback) ───────────────
  // Add loading="lazy" to all images below the fold
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    document.querySelectorAll('img:not([loading])').forEach(function (img) {
      // Skip logo and hero images (above the fold)
      const isAboveFold = img.closest('.navbar') || img.closest('.hero');
      if (!isAboveFold) {
        img.setAttribute('loading', 'lazy');
      }
    });
  }

  // ── 3. EXTERNAL LINKS — open in new tab with rel ──────────
  document.querySelectorAll('a[href^="http"]').forEach(function (link) {
    if (!link.getAttribute('target')) {
      link.setAttribute('target', '_blank');
    }
    if (!link.getAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // ── 4. SMOOTH SCROLL POLYFILL CHECK ──────────────────────
  // Modern browsers support scroll-behavior: smooth in CSS.
  // For older Safari, we already handle this in navbar.js via
  // window.scrollTo({ behavior: 'smooth' }).

  // ── 5. HERO STATS COUNTER ANIMATION ──────────────────────
  function animateCounter(el, target, suffix) {
    const duration = 1600; // ms
    const step     = 16;   // ~60fps
    const steps    = duration / step;
    let   current  = 0;
    const increment = target / steps;

    const timer = setInterval(function () {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = formatNumber(Math.round(current)) + suffix;
    }, step);
  }

  function formatNumber(n) {
    if (n >= 1000) {
      return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    }
    return n.toString();
  }

  // Parse a stat element's text to extract number and suffix
  function parseStatText(text) {
    // e.g. "5.000+" → number: 5000, suffix: "+"
    //      "20K+"  → number: 20000, suffix: "K+"  → we keep as-is
    //      "50+"   → number: 50, suffix: "+"
    const match = text.match(/^([\d.,]+)([A-Za-z+]*)/);
    if (!match) return null;

    let numStr = match[1].replace(/\./g, '').replace(',', '.');
    let num    = parseFloat(numStr);
    let suffix = match[2] || '';

    // Handle "K" shorthand
    if (suffix.startsWith('K')) {
      num    = num * 1000;
      suffix = suffix.slice(1);
    }

    return { num, suffix };
  }

  // Trigger counter when hero stats become visible
  const statNums = document.querySelectorAll('.hero-stat-num');
  if (statNums.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el   = entry.target;
        const orig = el.textContent.trim();
        const data = parseStatText(orig);
        if (data) {
          animateCounter(el, data.num, data.suffix);
        }
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    statNums.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // ── 6. ACTIVE SECTION INDICATOR IN MOBILE MENU ────────────
  // Mirror the active class to mobile menu links
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  // Sync active state by observing desktop nav
  const syncObserver = new MutationObserver(function () {
    let activeHref = '';
    desktopNavLinks.forEach(function (link) {
      if (link.classList.contains('active')) {
        activeHref = link.getAttribute('href');
      }
    });

    mobileNavLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === activeHref) {
        link.classList.add('active');
      }
    });
  });

  desktopNavLinks.forEach(function (link) {
    syncObserver.observe(link, { attributes: true, attributeFilter: ['class'] });
  });

  // ── 7. LOG INIT ───────────────────────────────────────────
  console.log(
    '%cStayKost 🏠',
    'color: #3B82F6; font-size: 16px; font-weight: bold;'
  );
  console.log(
    '%cKelola kost, lebih mudah dan teratur',
    'color: #0D2257; font-size: 12px;'
  );

})();