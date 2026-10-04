/* Progressive enhancements. Content, navigation, details and contact work without JS. */
(() => {
  "use strict";

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeKey = "st-resume-theme";
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)");
  const themeColor = document.querySelector('meta[name="theme-color"]:not([media])');
  function applyTheme(theme) {
    root.dataset.theme = theme;
    const label =
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    themeToggle.setAttribute("aria-label", label);
    themeToggle.title = label;
    if (themeColor)
      themeColor.content = theme === "dark" ? "#0b1f33" : "#f7f8fa";
  }
  let savedTheme;
  try {
    savedTheme = localStorage.getItem(themeKey);
  } catch {
    /* Storage is optional. */
  }
  // The inline script in <head> already set data-theme before first paint.
  applyTheme(root.dataset.theme === "light" ? "light" : "dark");
  themeToggle.hidden = false;
  themeToggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    savedTheme = next;
    applyTheme(next);
    try {
      localStorage.setItem(themeKey, next);
    } catch {
      /* Storage is optional. */
    }
  });
  // Follow the operating system until the visitor picks a theme.
  prefersLight.addEventListener("change", () => {
    if (savedTheme === "light" || savedTheme === "dark") return;
    applyTheme(prefersLight.matches ? "light" : "dark");
  });

  const menu = document.getElementById("sectionMenu");
  const menuSummary = menu.querySelector("summary");
  function closeMenu(restoreFocus = false) {
    if (!menu.open) return;
    menu.open = false;
    if (restoreFocus) menuSummary.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.open) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!menu.contains(event.target)) closeMenu();
  });
  menu.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !menu.contains(event.relatedTarget)) closeMenu();
  });
  const desktop = window.matchMedia("(min-width: 1041px)");
  desktop.addEventListener("change", () => {
    if (!desktop.matches) return;
    const focusWasInMenu = menu.contains(document.activeElement);
    closeMenu();
    if (focusWasInMenu)
      document.querySelector(".brand").focus({ preventScroll: true });
  });

  // Earlier roles stay expanded on wide screens and start collapsed on phones.
  const wide = window.matchMedia("(min-width: 761px)");
  const olderRoles = document.querySelectorAll(".role__more");
  function expandOlderRoles() {
    if (!wide.matches) return;
    olderRoles.forEach((details) => {
      details.open = true;
    });
  }
  expandOlderRoles();
  wide.addEventListener("change", expandOlderRoles);

  // Keep normal links, URL fragments, browser history and reduced-motion scrolling.
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const link = event.target.closest("a[href^='#']");
    if (!link) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    closeMenu();
    let ancestor = target.parentElement;
    while (ancestor) {
      if (ancestor.tagName === "DETAILS") ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    // Focus before the link's native scroll. Focusing during a smooth scroll can cancel it.
    target.focus({ preventScroll: true });
  });

  const navLinks = [
    ...document.querySelectorAll(".nav a, .mobile-nav a[href^='#']"),
  ];
  const sections = [
    ...new Set(
      navLinks.map((link) => document.getElementById(link.hash.slice(1))),
    ),
  ].filter(Boolean);
  const header = document.querySelector(".site-header");
  const toTop = document.getElementById("toTop");
  let pending = false;
  function updatePosition() {
    pending = false;
    const readingLine = header.getBoundingClientRect().height + 48;
    let activeId = "";
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= readingLine)
        activeId = section.id;
    }
    if (window.scrollY + window.innerHeight >= root.scrollHeight - 4)
      activeId = "contact";
    for (const link of navLinks) {
      if (link.hash === `#${activeId}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
    toTop.classList.toggle("is-visible", window.scrollY > 650);
  }
  function schedulePosition() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updatePosition);
  }
  window.addEventListener("scroll", schedulePosition, { passive: true });
  window.addEventListener("resize", schedulePosition);
  document
    .querySelectorAll("details")
    .forEach((details) => details.addEventListener("toggle", schedulePosition));
  document.fonts.ready.then(schedulePosition);
  updatePosition();
})();
