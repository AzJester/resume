/* Shane Turner — Resume: progressive enhancement only.
   The page is fully readable and printable with JS disabled. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------- Theme (light / dark) ---------- */
  var THEME_KEY = "st-resume-theme";
  var toggle = document.getElementById("themeToggle");

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
      toggle.title = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }
  }

  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(saved || (systemPrefersDark() ? "dark" : "light"));

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  // Follow the OS setting only while the visitor hasn't picked one.
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      var stored = null;
      try { stored = localStorage.getItem(THEME_KEY); } catch (err) {}
      if (!stored) applyTheme(e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ---------- Print / Save as PDF ---------- */
  var printBtn = document.getElementById("printBtn");
  if (printBtn) {
    printBtn.addEventListener("click", function () { window.print(); });
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("toTop");
  if (toTop) {
    var onScroll = function () {
      if (window.scrollY > 600) toTop.classList.add("is-visible");
      else toTop.classList.remove("is-visible");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Scroll-spy: highlight active nav link ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      byId[id] = link;
    });

    var sections = navLinks
      .map(function (l) { return document.getElementById(l.getAttribute("href").slice(1)); })
      .filter(Boolean);

    var setActive = function (id) {
      navLinks.forEach(function (l) { l.classList.remove("is-active"); });
      if (byId[id]) byId[id].classList.add("is-active");
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------- Keep the "current as of" date honest-ish ---------- */
  // Leaves the authored date in place; no action needed at runtime.
})();
