/* A progressively enhanced document: the flight never owns or cancels scrolling. */
(() => {
  "use strict";
  const root = document.documentElement;
  const sections = [...document.querySelectorAll(".waypoint")];
  const viewToggle = document.getElementById("view-toggle");
  const viewLabel = document.getElementById("view-label");
  const viewHint = document.getElementById("view-hint");
  const viewStatus = document.getElementById("view-status");
  const contents = document.getElementById("contents-menu");
  const soundToggle = document.getElementById("sound-toggle");
  const progress = document.getElementById("reading-progress");
  const routeCount = document.querySelector(".route-eyebrow span");
  const routeLinks = [
    ...document.querySelectorAll(
      '.route nav a, .contents-menu nav a[href^="#"]',
    ),
  ];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const smallScreen = matchMedia("(max-width: 900px), (max-height: 700px)");
  const storageKey = "resume-view-v2";
  let preference = null;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "flight" || saved === "reading") preference = saved;
  } catch (_) {
    /* Reading and navigation also work when storage is unavailable. */
  }
  let flight = false;
  let frameQueued = false;
  let activeId = "";
  let audio = null;
  const canvas = document.getElementById("starfield");
  const context = canvas.getContext("2d");
  let canvasWidth = 0;
  let canvasHeight = 0;
  let canvasRatio = 1;
  const stars = Array.from({ length: 75 }, (_, index) => ({
    x: ((index * 97 + 13) % 997) / 997,
    y: ((index * 173 + 41) % 991) / 991,
    depth: 0.25 + (index % 11) / 15,
  }));

  root.classList.add("js");

  function stopSound() {
    if (audio) {
      audio.context.close().catch(() => {});
      audio = null;
    }
    soundToggle.textContent = "Sound off";
    soundToggle.setAttribute("aria-pressed", "false");
  }

  function applyView(announce = false) {
    // A saved choice persists; the operating system's reduced-motion setting wins.
    flight =
      !reducedMotion.matches &&
      (preference ? preference === "flight" : !smallScreen.matches);
    root.classList.toggle("flight-mode", flight);
    viewToggle.setAttribute("aria-pressed", String(flight));
    viewLabel.textContent = flight ? "3D flight" : "Reading view";
    viewToggle.setAttribute(
      "aria-label",
      flight
        ? "3D flight view. Switch to reading view"
        : "Reading view. Switch to 3D flight view",
    );
    viewToggle.disabled = reducedMotion.matches;
    viewToggle.title = reducedMotion.matches
      ? "Reading view follows your device’s reduced-motion preference."
      : flight
        ? "Switch to reading view without losing your place"
        : "Enable the 3D flight experience";
    viewHint.textContent = flight
      ? "3D transitions on. Text stays still as you read."
      : "Reading view. Content scrolls at your pace.";
    soundToggle.hidden = !flight;
    if (!flight) stopSound();
    if (announce)
      viewStatus.textContent = flight
        ? "3D flight view enabled. Your reading position is unchanged."
        : "Reading view enabled. Your reading position is unchanged.";
    queueFrame();
  }

  viewToggle.addEventListener("click", () => {
    preference = flight ? "reading" : "flight";
    try {
      localStorage.setItem(storageKey, preference);
    } catch (_) {
      /* This visit still keeps the chosen view. */
    }
    applyView(true);
  });
  reducedMotion.addEventListener("change", () => applyView());
  smallScreen.addEventListener("change", () => applyView());

  function closeMenu(returnFocus = false) {
    if (!contents.open) return;
    contents.open = false;
    if (returnFocus) contents.querySelector("summary").focus();
  }

  function targetFor(hash) {
    try {
      return document.getElementById(
        decodeURIComponent(hash.replace(/^#/, "")),
      );
    } catch (_) {
      return null;
    }
  }

  function navigate(target, behavior) {
    // Old waypoint URLs still resolve to their content inside the six new sections.
    let ancestor = target.parentElement;
    while (ancestor) {
      if (ancestor.tagName === "DETAILS") ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
    closeMenu();
    target.scrollIntoView({ block: "start", behavior });
    if (
      !target.hasAttribute("tabindex") &&
      !target.matches("a,button,input,select,textarea")
    )
      target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    queueFrame();
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (
      link &&
      event.button === 0 &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey
    ) {
      const hash = link.getAttribute("href");
      const target = targetFor(hash);
      if (target) {
        event.preventDefault();
        if (location.hash !== hash) history.pushState(null, "", hash);
        navigate(target, reducedMotion.matches ? "auto" : "smooth");
      }
    } else if (contents.open && !contents.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contents.open) {
      event.preventDefault();
      closeMenu(true);
    }
  });
  window.addEventListener("hashchange", () => {
    const target = targetFor(location.hash);
    if (target) navigate(target, "auto");
  });

  function sizeCanvas() {
    if (!context) return;
    canvasWidth = innerWidth;
    canvasHeight = innerHeight;
    canvasRatio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvasWidth * canvasRatio);
    canvas.height = Math.round(canvasHeight * canvasRatio);
    context.setTransform(canvasRatio, 0, 0, canvasRatio, 0, 0);
  }

  function drawStars(scrollFraction) {
    if (!context || !flight) return;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for (const star of stars) {
      const depthShift = scrollFraction * star.depth;
      const x =
        (star.x * canvasWidth +
          Math.sin(depthShift * 2.4) * 38 * star.depth +
          canvasWidth) %
        canvasWidth;
      const y = ((star.y + depthShift * 0.45) % 1) * canvasHeight;
      context.beginPath();
      context.fillStyle = `rgba(159,187,220,${0.16 + star.depth * 0.33})`;
      context.arc(x, y, 0.5 + star.depth, 0, Math.PI * 2);
      context.fill();
    }
  }

  function updateFrame() {
    frameQueued = false;
    if (document.hidden) return;
    const range = Math.max(
      1,
      document.documentElement.scrollHeight - innerHeight,
    );
    const fraction = Math.max(0, Math.min(1, scrollY / range));
    progress.style.transform = `scaleX(${fraction})`;
    root.style.setProperty("--floor-shift", `${(scrollY * 0.055) % 100}px`);
    const readingLine = Math.min(innerHeight * 0.35, 260);
    let current = sections[0];
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= readingLine) current = section;
      // Entry depth settles before the content reaches the reader. No exit animation,
      // pointer tilt, scroll magnet, forced snap, or movement of a paragraph being read.
      const approach = flight
        ? Math.max(
            0,
            Math.min(1, (rect.top - innerHeight * 0.72) / (innerHeight * 0.3)),
          )
        : 0;
      section.style.setProperty("--approach", approach.toFixed(3));
    }
    if (scrollY >= range - 4) current = sections[sections.length - 1];
    if (current.id !== activeId) {
      activeId = current.id;
      for (const link of routeLinks) {
        if (link.hash === `#${activeId}`)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
      routeCount.textContent = `${String(sections.indexOf(current) + 1).padStart(2, "0")} / 06`;
    }
    drawStars(fraction);
  }

  function queueFrame() {
    if (!frameQueued) {
      frameQueued = true;
      requestAnimationFrame(updateFrame);
    }
  }
  window.addEventListener("scroll", queueFrame, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      sizeCanvas();
      queueFrame();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopSound();
    else queueFrame();
  });
  document
    .querySelectorAll("details")
    .forEach((details) => details.addEventListener("toggle", queueFrame));

  soundToggle.addEventListener("click", async () => {
    if (!flight || audio) {
      stopSound();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      soundToggle.hidden = true;
      return;
    }
    try {
      const audioContext = new AudioContext();
      const gain = audioContext.createGain();
      gain.gain.value = 0.017;
      gain.connect(audioContext.destination);
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = 74;
      oscillator.connect(gain);
      oscillator.start();
      audio = { context: audioContext };
      await audioContext.resume();
      soundToggle.textContent = "Sound on";
      soundToggle.setAttribute("aria-pressed", "true");
    } catch (_) {
      stopSound();
    }
  });

  let closedForPrint = [];
  window.addEventListener("beforeprint", () => {
    stopSound();
    closedForPrint = [...document.querySelectorAll("main details:not([open])")];
    closedForPrint.forEach((details) => {
      details.open = true;
    });
  });
  window.addEventListener("afterprint", () => {
    closedForPrint.forEach((details) => {
      details.open = false;
    });
    closedForPrint = [];
  });

  sizeCanvas();
  applyView();
  // Native anchors work without JavaScript. Re-align a direct link after images/fonts
  // have established the layout, without a boot screen or hidden résumé content.
  const initialHash = location.hash;
  if (initialHash)
    window.addEventListener(
      "load",
      () => {
        if (location.hash === initialHash) {
          const target = targetFor(initialHash);
          if (target) navigate(target, "auto");
        }
      },
      { once: true },
    );
})();
