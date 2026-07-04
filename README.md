# Shane Turner Résumé

A web résumé for **Shane Turner, D.B.A.** The main page is the classic single-page résumé; a 3D scroll "flight profile" — twelve career waypoints flown by a camera as you scroll — lives at `/3d/` behind an animated launch button in the header, with flat, print, and no-JS fallbacks of its own.

🔗 **Live site:** [`https://resume.st-dba.com`](https://resume.st-dba.com) (custom domain via `CNAME`; GitHub Pages serving from the default branch).

## Features

- **3D flight profile**: scroll dollies a camera through 12 waypoints (briefing → flight data → recognition → shAIne case study → profile → capabilities → experience by era → foundation → contact) with waypoint magnetism, a banking camera, per-era atmosphere tints, and a flight-plan HUD.
- **Fallbacks everywhere**: on the 3D page a `3D : OFF` toggle, `prefers-reduced-motion`, `<noscript>`, and print styles all serve a flat document; a `CLASSIC` link returns to the main page.
- **Download PDF**: serves the official, maintained résumé PDF (`assets/Shane-Turner-Resume.pdf`). No print-dialog fiddling required.
- **Print**: an ink-light print stylesheet flattens the flight into a clean document straight from the browser's native print / Save-as-PDF (Ctrl/Cmd+P).
- **Opt-in sound**: ambient hum, scroll whoosh, and a docking ping behind the `SND` toggle (muted by default).
- **Social share card**: `assets/og-card.png` gives links a branded preview on LinkedIn, Slack, email, etc.
- **Structured data**: schema.org `Person` JSON-LD for search engines and rich previews.
- **Accessible**: DOM order matches the flight order, `aria-live` waypoint announcements, keyboard navigation (arrows / PgUp / PgDn / Home / End / J / K), skip link, focus-driven camera, and WCAG AA contrast.

## The downloadable PDF

`assets/Shane-Turner-Resume.pdf` is the official, maintained résumé PDF. It is the file served by every "Download PDF" link on the page. To update it, replace that file with a new export of the résumé (keep the same filename).

## Project structure

```
.
├── index.html                      # Classic single-page résumé (the default)
├── 3d/
│   └── index.html                  # 3D flight-profile version (noindex; styles + engine inline)
├── classic/
│   └── index.html                  # Redirect to the main page (old link compatibility)
├── assets/
│   ├── fonts/                      # Subset Fraunces / Inter / IBM Plex Mono woff2
│   ├── styles.css                  # Classic page styles (light/dark themes)
│   ├── main.js                     # Classic page scripts
│   ├── favicon.svg                 # "ST" monogram icon
│   ├── og-card.svg / og-card.png   # Social share card (source + rendered)
│   ├── shane-turner.jpg            # Hero portrait (referenced by the page)
│   ├── nlos-c.jpg                  # XM1203 NLOS-C photo in the Early-career section
│   ├── Shane-Turner-Resume.pdf     # Official downloadable PDF (maintained by hand)
│   └── (share collateral)          # NOT referenced by index.html; distributed directly:
│                                   #   Shane-Turner-Resume.pptx, Shane_blue_suite.png,
│                                   #   infographic*.svg, shane-turner-infographic*.png,
│                                   #   XM1203_Non_Line_of_Sight-Cannon_(NLOS-C).jpg
└── README.md
```

## Editing the content

Classic résumé text lives in `index.html`; the 3D version mirrors it in `3d/index.html` (each waypoint is a `<section class="ch">`). Common 3D-page edits:

- **Contact details**: the `mailto:` links in the briefing and contact waypoints (no phone number is published).
- **Hero copy**: the `#wp-briefing` section (headline words are individual `<span class="w">` for the reveal).
- **Stats**: the `#wp-flight-data` counters (`data-target` / `data-prefix` / `data-suffix`).
- **shAIne case study**: `#wp-shaine`, including the value-model bar widths (`--bw`, percent of the $73K scale).
- **Experience**: one waypoint per employer (`#wp-astrion`, `#wp-hii`, `#wp-amentum`, `#wp-origins`).
- **Education / service / affiliations**: `#wp-foundation`.

Update both pages when the résumé changes, and refresh `assets/Shane-Turner-Resume.pdf` so the downloadable copy stays in sync.

## Hosting on GitHub Pages

1. Push to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick `main`, folder `/ (root)`, and save.
4. Wait a minute, then open the published URL.

Because the site is static, it also runs by simply opening `index.html` in a browser, or behind any static host (Netlify, Cloudflare Pages, S3, etc.).

## Optional: custom domain (e.g. `resume.st-dba.com`)

You own `st-dba.com`, so you can serve the résumé from a branded subdomain:

1. At your DNS provider, add a **CNAME** record:
   `resume` → `azjester.github.io`
2. Once that record resolves, add a file named `CNAME` (no extension) to the repo root containing the single line:
   `resume.st-dba.com`
3. In **Settings → Pages → Custom domain**, enter `resume.st-dba.com` and enable **Enforce HTTPS**.

> Add the `CNAME` file only **after** the DNS record exists. Committing it before DNS resolves will take the `github.io` URL offline until the custom domain is reachable. Once you switch domains, update the absolute URLs in `index.html` (`og:url`, `canonical`, `og:image`, JSON-LD `url`) and the card to the new domain.
