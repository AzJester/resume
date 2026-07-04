# Shane Turner Résumé

An interactive web résumé for **Shane Turner, D.B.A.** The main site is a 3D scroll "flight profile" — twelve career waypoints flown by a camera as you scroll — with flat, print, and no-JS fallbacks, plus the classic single-page version preserved at `/classic/`.

🔗 **Live site:** [`https://resume.st-dba.com`](https://resume.st-dba.com) (custom domain via `CNAME`; GitHub Pages serving from the default branch).

## Features

- **3D flight profile**: scroll dollies a camera through 12 waypoints (briefing → flight data → recognition → shAIne case study → profile → capabilities → experience by era → foundation → contact) with waypoint magnetism, a banking camera, per-era atmosphere tints, and a flight-plan HUD.
- **Fallbacks everywhere**: a `3D : OFF` toggle, `prefers-reduced-motion`, `<noscript>`, and print styles all serve a flat document; the previous site lives on at [`/classic/`](https://resume.st-dba.com/classic/).
- **Download PDF**: serves the official, maintained résumé PDF (`assets/Shane-Turner-Resume.pdf`).
- **Opt-in sound**: ambient hum, scroll whoosh, and a docking ping behind the `SND` toggle (muted by default).
- **Social share card**: `assets/og-card.png` gives links a branded preview on LinkedIn, Slack, email, etc.
- **Structured data**: schema.org `Person` JSON-LD for search engines and rich previews.
- **Accessible**: DOM order matches the flight order, `aria-live` waypoint announcements, keyboard navigation (arrows / PgUp / PgDn / Home / End / J / K), skip link, focus-driven camera, and WCAG AA contrast.

## The downloadable PDF

`assets/Shane-Turner-Resume.pdf` is the official, maintained résumé PDF. It is the file served by every "Download PDF" link on the page. To update it, replace that file with a new export of the résumé (keep the same filename).

## Project structure

```
.
├── index.html                      # 3D flight-profile résumé (styles + engine inline)
├── classic/
│   └── index.html                  # The previous single-page version (noindex)
├── assets/
│   ├── fonts/                      # Subset Fraunces / Inter / IBM Plex Mono woff2
│   ├── styles.css                  # Classic page styles (light/dark themes)
│   ├── main.js                     # Classic page scripts
│   ├── favicon.svg                 # "ST" monogram icon
│   ├── og-card.svg / og-card.png   # Social share card (source + rendered)
│   └── Shane-Turner-Resume.pdf     # Official downloadable PDF (maintained by hand)
└── README.md
```

## Editing the content

All résumé text lives in `index.html` (each waypoint is a `<section class="ch">`). Common edits:

- **Contact details**: the `mailto:` links in the briefing and contact waypoints.
- **Hero copy**: the `#wp-briefing` section (headline words are individual `<span class="w">` for the reveal).
- **Stats**: the `#wp-flight-data` counters (`data-target` / `data-prefix` / `data-suffix`).
- **shAIne case study**: `#wp-shaine`, including the value-model bar widths (`--bw`, percent of the $73K scale).
- **Experience**: one waypoint per employer (`#wp-astrion`, `#wp-hii`, `#wp-amentum`, `#wp-origins`).
- **Education / service / affiliations**: `#wp-foundation`.

The same content also lives in `classic/index.html`; update both when the résumé changes, and refresh `assets/Shane-Turner-Resume.pdf` so the downloadable copy stays in sync.

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
