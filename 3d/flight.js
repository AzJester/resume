/* Reading view is the default. The optional 3D view is driven by native
   document scrolling: no wheel/touch interception and no scroll snapping. */
(() => {
  "use strict";
  const root = document.documentElement;
  const main = document.getElementById("main-content");
  const header = document.querySelector(".site-header");
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
  const status = document.getElementById("view-status");
  const contents = document.getElementById("contents-menu");
  const copyEmail = document.getElementById("copy-email");
  const progress = document.getElementById("reading-progress");
  const routeCount = document.querySelector(".route-eyebrow span");
  const routeLinks = [
    ...document.querySelectorAll(
      '.route nav a, .contents-menu nav a[href^="#"]',
    ),
  ];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  // Keep this query in step with the inline script in index.html.
  const flightCapable = matchMedia(
    "(min-width: 901px) and (min-height: 620px)",
  );
  const storageKey = "resume-view-v2";
  const total = String(sections.length).padStart(2, "0");
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  let preference = null;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "flight" || saved === "reading") preference = saved;
  } catch (_) {
    /* Navigation still works when storage is unavailable. */
  }
  // A link can ask for the 3D view (?view=3d). It applies to this visit and is
  // saved only if the visitor then uses the toggle.
  const linked3d = /[?&]view=3d(&|$)/.test(location.search);
  if (linked3d) preference = "flight";
  // Set for this visit only when find-in-page needs the whole document in flow.
  let readingForFind = false;
  let flight = false;
  let ready = false;
  let printing = false;
  let frameQueued = false;
  let layoutQueued = false;
  let activeIndex = -1;
  let path = [];
  let flightLength = 0;
  let lastPlace = null;
  let placeTimer = 0;
  let statusTimer = 0;
  let movingFocus = false;
  let keyTarget = null;
  const canvas = document.getElementById("starfield");
  const context = canvas.getContext("2d");
  let canvasWidth = 0;
  let canvasHeight = 0;
  const stars = Array.from({ length: 95 }, (_, index) => ({
    x: (((index * 97 + 13) % 997) / 997 - 0.5) * 2.8,
    y: (((index * 173 + 41) % 991) / 991 - 0.5) * 2.8,
    depth: 0.1 + ((index * 61) % 97) / 97,
  }));
  // Custom properties are written only when their value changes.
  const written = sections.map(() => ({}));
  function setVar(index, name, value) {
    if (written[index][name] === value) return;
    written[index][name] = value;
    sections[index].style.setProperty(name, value);
  }

  root.classList.add("js");

  function announce(message, visible = true) {
    status.textContent = message;
    clearTimeout(statusTimer);
    status.classList.toggle("is-visible", visible);
    if (visible)
      statusTimer = setTimeout(
        () => status.classList.remove("is-visible"),
        4500,
      );
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
      const line = header.offsetHeight + 24;
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
        header.offsetHeight -
        24;
    window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
  }

  // Each panel gets scroll room for its full content, then a short hop to the
  // next one. The hop is kept brief so most of the scrolling is reading.
  function measureFlight() {
    const viewport = sections[0].clientHeight;
    const transition = clamp(innerHeight * 0.42, 300, 420);
    const dwell = 40;
    let start = 0;
    path = surfaces.map((surface, index) => {
      const overflow = Math.max(0, surface.offsetHeight - viewport);
      const last = index === sections.length - 1;
      const depart = start + overflow + (last ? 0 : dwell);
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

  function applyView(message = "") {
    const available = flightCapable.matches && !reducedMotion.matches;
    const chosen = available && preference === "flight" && !readingForFind;
    const place = ready && chosen !== flight ? capturePlace() : null;
    flight = chosen;
    root.classList.toggle("flight-mode", flight);
    if (flight) measureFlight();
    else lastPlace = null;
    if (place) restorePlace(place);
    ready = true;
    // The label names what the button does, not the current state.
    viewToggle.hidden = !available;
    viewLabel.textContent = flight ? "Exit 3D view" : "View in 3D";
    viewToggle.title = flight
      ? "Return to the reading view without losing your place"
      : "Fly through the six sections in 3D";
    if (message) announce(message);
    queueFrame();
  }

  viewToggle.addEventListener("click", () => {
    preference = flight ? "reading" : "flight";
    readingForFind = false;
    try {
      localStorage.setItem(storageKey, preference);
    } catch (_) {
      /* Keep this visit's choice. */
    }
    applyView(
      preference === "flight"
        ? "3D view on. Scroll to read each panel, keep scrolling to fly to the next."
        : "Reading view on. Your place is kept.",
    );
  });
  reducedMotion.addEventListener("change", () => applyView());
  flightCapable.addEventListener("change", () => applyView());

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
        const from = flightPosition();
        const current = from.transition > 0.5 ? from.index + 1 : from.index;
        // A jump of more than one section fades in at the destination rather
        // than streaking every panel in between past the reader.
        if (behavior === "smooth" && Math.abs(index - current) > 1) {
          behavior = "instant";
          main.classList.remove("flight-jump");
          void main.offsetWidth;
          main.classList.add("flight-jump");
        }
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
  main.addEventListener("animationend", (event) => {
    if (event.animationName === "flight-arrive")
      main.classList.remove("flight-jump");
  });

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

  // Page Down, Page Up and Space move by readable pages in the 3D view: they
  // page through the current panel, then land on the next panel, never between.
  function pageStep(forward) {
    const now = performance.now();
    const base =
      keyTarget && now - keyTarget.time < 700 ? keyTarget.top : scrollY;
    const position = flightPosition(base);
    const stop = path[position.index];
    const end = stop.start + stop.overflow;
    const page = sections[0].clientHeight * 0.88;
    let top;
    if (forward) {
      if (base < end - 2) top = Math.min(base + page, end);
      else if (position.index < path.length - 1)
        top = path[position.index + 1].start;
      else return false;
    } else if (base > end + 2) top = end;
    else if (base > stop.start + 2) top = Math.max(base - page, stop.start);
    else if (position.index > 0) {
      const before = path[position.index - 1];
      top = before.start + before.overflow;
    } else return false;
    keyTarget = { top, time: now };
    window.scrollTo({
      top,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
    return true;
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contents.open) {
      event.preventDefault();
      closeMenu(true);
      return;
    }
    if (!flight || event.defaultPrevented) return;
    const key = event.key;
    // Find-in-page cannot reach text in panels that are out of view, so the
    // page returns to the reading view (same place) while the browser searches.
    const find =
      ((event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        (key === "f" || key === "F" || key === "g" || key === "G")) ||
      key === "F3";
    if (find) {
      readingForFind = true;
      applyView("Reading view on so find-in-page can search every section.");
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const editable = event.target.closest?.(
      "input,select,textarea,[contenteditable]",
    );
    if (editable) return;
    let forward;
    if (key === "PageDown") forward = true;
    else if (key === "PageUp") forward = false;
    else if (key === " " || key === "Spacebar") {
      if (event.target.closest?.("a,button,summary")) return;
      forward = !event.shiftKey;
    } else return;
    if (pageStep(forward)) event.preventDefault();
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
      // only as the camera travels toward it. A departing panel fades quickly
      // so its text never sits over the navigation.
      const opacity = future
        ? clamp((1 - distance) * 1.45, 0, 1)
        : clamp(1 + distance * 2.6, 0, 1);
      // At rest (distance 0) the panel is flat and unscaled, so text is drawn
      // on the pixel grid at its true size. Depth and tilt apply only in transit.
      const reach = clamp(distance, -1, 1);
      const x = Math.sin((reach * Math.PI) / 2) * width * 0.95;
      const y = Math.abs(reach) * 24;
      const z = clamp(-distance * 1400, -3000, 980);
      setVar(i, "--panel-x", `${x.toFixed(1)}px`);
      setVar(i, "--panel-y", `${y.toFixed(1)}px`);
      setVar(i, "--panel-z", `${z.toFixed(1)}px`);
      setVar(i, "--panel-turn", `${(-distance * 18).toFixed(2)}deg`);
      setVar(i, "--panel-tilt", `${Math.abs(reach).toFixed(3)}deg`);
      setVar(i, "--panel-opacity", opacity.toFixed(3));
      const section = sections[i];
      if (!written[i].z) {
        written[i].z = true;
        section.style.zIndex = String(20 - i);
      }
      section.classList.toggle("flight-current", i === current);
      const offset =
        i < position.index
          ? path[i].overflow
          : i === position.index
            ? position.offset
            : 0;
      setVar(i, "--content-y", `${-offset}px`);
      // Edge fades show that a panel holds more content above or below.
      const resting = i === position.index && position.transition === 0;
      section.classList.toggle("has-more-above", resting && offset > 4);
      section.classList.toggle(
        "has-more-below",
        resting && offset < path[i].overflow - 4,
      );
    }
    const inTransit = position.transition > 0;
    const atBottom = position.offset >= path[position.index].overflow - 2;
    const last = current === sections.length - 1;
    const text = inTransit
      ? `Flying to ${sections[position.index + 1].dataset.label}`
      : last
        ? "Final section"
        : atBottom
          ? `Keep scrolling for ${sections[current + 1].dataset.label}`
          : "Scroll to read";
    if (instruction.textContent !== text) instruction.textContent = text;
    root.style.setProperty(
      "--floor-shift",
      `${((position.camera * 140) % 100).toFixed(1)}px`,
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
      const count = `${String(current + 1).padStart(2, "0")} / ${total}`;
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
    // The reader's place is only needed to survive a re-measure in the 3D
    // view, so it is recorded once scrolling settles rather than every frame.
    if (flight) {
      clearTimeout(placeTimer);
      placeTimer = setTimeout(() => {
        if (flight && !printing) lastPlace = capturePlace();
      }, 140);
    }
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
    if (!document.hidden) queueFrame();
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

  // A mailto link does nothing on a machine with no mail app set up, so the
  // address can also be copied.
  if (copyEmail) {
    const label = copyEmail.textContent.trim();
    let resetTimer = 0;
    copyEmail.addEventListener("click", async () => {
      const address = copyEmail.dataset.copy;
      let copied = false;
      try {
        await navigator.clipboard.writeText(address);
        copied = true;
      } catch (_) {
        // Older browsers and non-secure contexts: copy through a selection.
        const field = document.createElement("textarea");
        field.value = address;
        field.setAttribute("readonly", "");
        field.style.cssText = "position:fixed;top:0;left:0;opacity:0";
        document.body.appendChild(field);
        field.select();
        try {
          copied = document.execCommand("copy");
        } catch (_) {
          copied = false;
        }
        field.remove();
        copyEmail.focus({ preventScroll: true });
      }
      copyEmail.textContent = copied ? "Copied" : "Select the address to copy";
      copyEmail.classList.toggle("is-copied", copied);
      announce(
        copied ? `Copied ${address}` : "Copy is not available here.",
        false,
      );
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        copyEmail.textContent = label;
        copyEmail.classList.remove("is-copied");
      }, 2400);
    });
  }

  let closedForPrint = [];
  window.addEventListener("beforeprint", () => {
    printing = true;
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
  applyView(
    linked3d && !(flightCapable.matches && !reducedMotion.matches)
      ? "The 3D view needs a larger window with motion enabled. Showing the reading view."
      : "",
  );
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
