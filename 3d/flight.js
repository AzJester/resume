/* Native document scrolling drives the flight. No wheel/touch interception. */
(() => {
  "use strict";
  const root = document.documentElement;
  const main = document.getElementById("main-content");
  const sections = [...document.querySelectorAll(".waypoint")];
  const surfaces = sections.map((section) =>
    section.querySelector(".journey-surface"),
  );
  const track = document.getElementById("flight-scroll-track");
  const previous = document.getElementById("flight-previous");
  const next = document.getElementById("flight-next");
  const chapter = document.getElementById("flight-chapter");
  const instruction = document.getElementById("flight-instruction");
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
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let preference = null;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "flight" || saved === "reading") preference = saved;
  } catch (_) {
    /* Navigation still works when storage is unavailable. */
  }
  let flight = false;
  let ready = false;
  let printing = false;
  let frameQueued = false;
  let layoutQueued = false;
  let activeIndex = -1;
  let audio = null;
  let path = [];
  let flightLength = 0;
  let lastPlace = null;
  let movingFocus = false;
  const canvas = document.getElementById("starfield");
  const context = canvas.getContext("2d");
  let canvasWidth = 0;
  let canvasHeight = 0;
  const stars = Array.from({ length: 95 }, (_, index) => ({
    x: (((index * 97 + 13) % 997) / 997 - 0.5) * 2.8,
    y: (((index * 173 + 41) % 991) / 991 - 0.5) * 2.8,
    depth: 0.1 + ((index * 61) % 97) / 97,
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

  // Layout offsets are measured before transforms, including nested legacy targets.
  function contentOffset(element, index) {
    const surface = surfaces[index];
    if (
      !element ||
      element === sections[index] ||
      element === surface ||
      element === main
    )
      return 0;
    let offset = 0;
    let current = element;
    while (current && current !== surface) {
      offset += current.offsetTop;
      current = current.offsetParent;
    }
    return current === surface ? offset : 0;
  }

  function flightPosition(y = scrollY) {
    let index = 0;
    for (let i = 1; i < path.length; i++) {
      if (y >= path[i].start - 1) index = i;
    }
    const stop = path[index];
    if (!stop) return { index: 0, offset: 0, transition: 0, camera: 0 };
    const transition =
      index < path.length - 1
        ? clamp((y - stop.depart) / stop.transition, 0, 1)
        : 0;
    return {
      index,
      offset: clamp(y - stop.start, 0, stop.overflow),
      transition,
      camera: index + transition,
    };
  }

  function capturePlace() {
    let index = 0;
    let offset = 0;
    if (flight && path.length) {
      const position = flightPosition();
      index = position.index;
      offset = position.offset;
      if (position.transition > 0.5) {
        index++;
        offset = 0;
      }
    } else {
      const line = document.querySelector(".site-header").offsetHeight + 24;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) index = i;
      }
      offset = Math.max(0, line - surfaces[index].getBoundingClientRect().top);
    }
    // Preserve a real paragraph or heading when a view change alters line wrapping.
    let anchor = surfaces[index];
    let anchorTop = 0;
    for (const element of surfaces[index].querySelectorAll(
      "h1,h2,h3,p,li,dt,summary,figure",
    )) {
      if (!element.getClientRects().length) continue;
      const top = contentOffset(element, index);
      if (top <= offset + 1 && top >= anchorTop) {
        anchor = element;
        anchorTop = top;
      }
    }
    return { index, anchor, delta: offset - anchorTop };
  }

  function restorePlace(place) {
    if (!place) return;
    const offset = Math.max(
      0,
      contentOffset(place.anchor, place.index) + place.delta,
    );
    const y = flight
      ? path[place.index].start + Math.min(offset, path[place.index].overflow)
      : surfaces[place.index].getBoundingClientRect().top +
        scrollY +
        offset -
        document.querySelector(".site-header").offsetHeight -
        24;
    window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
  }

  function measureFlight() {
    const viewport = sections[0].clientHeight;
    const transition = Math.max(640, innerHeight * 0.9);
    let start = 0;
    path = surfaces.map((surface, index) => {
      const overflow = Math.max(0, surface.offsetHeight - viewport);
      const last = index === sections.length - 1;
      const depart = start + overflow + (last ? 0 : 130);
      const stop = { start, overflow, depart, transition };
      start = depart + (last ? 0 : transition);
      return stop;
    });
    flightLength = start;
    track.style.height = `${Math.ceil(flightLength + innerHeight)}px`;
  }

  function refreshLayout() {
    layoutQueued = false;
    if (!flight || printing) return;
    const place = lastPlace || capturePlace();
    measureFlight();
    restorePlace(place);
    queueFrame();
  }

  function queueLayout() {
    if (!layoutQueued && flight && !printing) {
      layoutQueued = true;
      requestAnimationFrame(refreshLayout);
    }
  }

  function applyView(announce = false) {
    const chosen =
      !reducedMotion.matches &&
      (preference ? preference === "flight" : !smallScreen.matches);
    const place = ready && chosen !== flight ? capturePlace() : null;
    flight = chosen;
    root.classList.toggle("flight-mode", flight);
    if (flight) measureFlight();
    if (place) restorePlace(place);
    ready = true;
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
      ? "Scroll to read. Keep scrolling to fly."
      : "Reading view. Content scrolls at your pace.";
    soundToggle.hidden = !flight;
    if (!flight) stopSound();
    if (announce)
      viewStatus.textContent = flight
        ? "3D flight enabled. Scroll to read each panel and fly between sections. Your place is preserved."
        : "Reading view enabled. Your place is preserved.";
    queueFrame();
  }

  viewToggle.addEventListener("click", () => {
    preference = flight ? "reading" : "flight";
    try {
      localStorage.setItem(storageKey, preference);
    } catch (_) {
      /* Keep this visit's choice. */
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

  function navigate(target, behavior = "smooth") {
    let ancestor = target.parentElement;
    while (ancestor) {
      if (ancestor.tagName === "DETAILS") ancestor.open = true;
      ancestor = ancestor.parentElement;
    }
    closeMenu();
    if (flight) {
      measureFlight();
      const index =
        target === main ? 0 : sections.indexOf(target.closest(".waypoint"));
      if (index >= 0) {
        const offset = Math.max(0, contentOffset(target, index) - 24);
        window.scrollTo({
          top: path[index].start + Math.min(offset, path[index].overflow),
          behavior,
        });
      }
    } else target.scrollIntoView({ block: "start", behavior });
    if (
      !target.hasAttribute("tabindex") &&
      !target.matches("a,button,input,select,textarea,summary")
    ) {
      target.setAttribute("tabindex", "-1");
    }
    movingFocus = true;
    target.focus({ preventScroll: true });
    movingFocus = false;
    queueFrame();
  }

  function goToSection(index) {
    const target = sections[clamp(index, 0, sections.length - 1)];
    if (location.hash !== `#${target.id}`)
      history.pushState(null, "", `#${target.id}`);
    navigate(target, reducedMotion.matches ? "instant" : "smooth");
  }
  previous.addEventListener("click", () => goToSection(activeIndex - 1));
  next.addEventListener("click", () => goToSection(activeIndex + 1));

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
        navigate(target, reducedMotion.matches ? "instant" : "smooth");
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
    if (target) navigate(target, "instant");
  });
  // Tab and assistive-technology focus can reach the complete DOM in source order.
  // Bring a focused link/summary into the viewport, even in a distant panel.
  document.addEventListener("focusin", (event) => {
    if (!flight || movingFocus || !main.contains(event.target)) return;
    const index = sections.indexOf(event.target.closest(".waypoint"));
    if (index < 0) return;
    const position = flightPosition();
    const top = contentOffset(event.target, index);
    const bottom = top + event.target.offsetHeight;
    if (
      position.index !== index ||
      position.transition > 0 ||
      top < position.offset ||
      bottom > position.offset + sections[index].clientHeight
    ) {
      navigate(event.target, "instant");
    }
  });

  function sizeCanvas() {
    if (!context) return;
    canvasWidth = innerWidth;
    canvasHeight = innerHeight;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(canvasWidth * ratio);
    canvas.height = Math.round(canvasHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawStars(camera) {
    if (!context || !flight) return;
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    for (const star of stars) {
      const depth = 0.15 + ((((star.depth - camera * 0.28) % 1) + 1) % 1);
      const scale = 0.35 / depth;
      const x = canvasWidth * (0.56 + star.x * scale);
      const y = canvasHeight * (0.47 + star.y * scale);
      context.beginPath();
      context.fillStyle = `rgba(169,203,231,${Math.min(0.75, 0.12 / depth)})`;
      context.arc(x, y, Math.min(2.2, 0.7 / depth), 0, Math.PI * 2);
      context.fill();
    }
  }

  function renderFlight() {
    const position = flightPosition();
    const current =
      position.transition > 0.5 ? position.index + 1 : position.index;
    const width = main.clientWidth;
    for (let i = 0; i < sections.length; i++) {
      const distance = i - position.camera;
      const future = distance >= 0;
      // The next panel stays hidden while a section is at rest and fades in
      // only as the camera travels toward it, so no clipped panel edge shows.
      const opacity = future
        ? clamp((1 - distance) * 1.45, 0, 1)
        : clamp(1 + distance * 1.7, 0, 1);
      const x = Math.sin((clamp(distance, -1, 1) * Math.PI) / 2) * width * 0.95;
      const y = Math.min(1, Math.abs(distance)) * 24;
      const z = clamp(-distance * 1400 - 50, -3000, 980);
      const section = sections[i];
      section.style.setProperty("--panel-x", `${x.toFixed(1)}px`);
      section.style.setProperty("--panel-y", `${y.toFixed(1)}px`);
      section.style.setProperty("--panel-z", `${z.toFixed(1)}px`);
      section.style.setProperty(
        "--panel-turn",
        `${(-distance * 18 - 3).toFixed(2)}deg`,
      );
      section.style.setProperty("--panel-opacity", opacity.toFixed(3));
      section.style.zIndex = String(20 - i);
      section.classList.toggle("flight-current", i === current);
      const offset =
        i < position.index
          ? path[i].overflow
          : i === position.index
            ? position.offset
            : 0;
      section.style.setProperty("--content-y", `${-offset}px`);
    }
    const inTransit = position.transition > 0;
    const atBottom = position.offset >= path[position.index].overflow - 2;
    const last = current === sections.length - 1;
    instruction.textContent = inTransit
      ? `Flying to ${sections[position.index + 1].dataset.label}`
      : atBottom && !last
        ? `Keep scrolling to fly to ${sections[current + 1].dataset.label}`
        : last
          ? "Final section · Contact details and résumé below"
          : "Scroll to read · Use the arrows to change section";
    root.style.setProperty(
      "--floor-shift",
      `${(position.camera * 140) % 100}px`,
    );
    root.style.setProperty(
      "--tunnel-scale",
      (1 + position.transition * 0.38).toFixed(3),
    );
    drawStars(
      position.camera +
        (position.offset / Math.max(1, path[position.index].overflow)) * 0.07,
    );
    return current;
  }

  function updateFrame() {
    frameQueued = false;
    if (document.hidden || printing) return;
    const range = Math.max(1, root.scrollHeight - innerHeight);
    progress.style.transform = `scaleX(${clamp(scrollY / range, 0, 1)})`;
    let current = 0;
    if (flight) current = renderFlight();
    else {
      const line = Math.min(innerHeight * 0.35, 260);
      sections.forEach((section, index) => {
        if (section.getBoundingClientRect().top <= line) current = index;
      });
      if (scrollY >= range - 4) current = sections.length - 1;
    }
    if (current !== activeIndex) {
      activeIndex = current;
      for (const link of routeLinks) {
        if (link.hash === `#${sections[current].id}`)
          link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
      const count = `${String(current + 1).padStart(2, "0")} / 06`;
      routeCount.textContent = count;
      chapter.textContent = `${count} · ${sections[current].dataset.label}`;
      previous.disabled = current === 0;
      next.disabled = current === sections.length - 1;
      previous.setAttribute(
        "aria-label",
        current > 0
          ? `Previous section: ${sections[current - 1].dataset.label}`
          : "Previous section",
      );
      next.setAttribute(
        "aria-label",
        current < sections.length - 1
          ? `Next section: ${sections[current + 1].dataset.label}`
          : "Next section",
      );
    }
    lastPlace = capturePlace();
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
      queueLayout();
      queueFrame();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopSound();
    else queueFrame();
  });
  document.querySelectorAll("main details").forEach((details) =>
    details.addEventListener("toggle", () => {
      queueLayout();
      queueFrame();
    }),
  );
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(queueLayout);
    surfaces.forEach((surface) => observer.observe(surface));
    observer.observe(main);
  }

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
    printing = true;
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
    printing = false;
    queueLayout();
    queueFrame();
  });

  sizeCanvas();
  applyView();
  // Re-align direct and legacy links once images and local fonts establish layout.
  const initialHash = location.hash;
  window.addEventListener(
    "load",
    () => {
      if (flight) measureFlight();
      if (initialHash && location.hash === initialHash) {
        const target = targetFor(initialHash);
        if (target) navigate(target, "instant");
      }
      queueFrame();
    },
    { once: true },
  );
})();
