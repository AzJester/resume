# Shane Turner Résumé

A web résumé for **Shane Turner, D.B.A.** The main page is the classic single-page résumé. An executive flight profile at `/3d/` organizes the career into six sections: introduction, results, experience, capabilities, education and service, and contact. Both its reading and optional 3D views use normal document scrolling.

🔗 **Live site:** [`https://resume.st-dba.com`](https://resume.st-dba.com) (custom domain via `CNAME`; GitHub Pages serving from `main`, which can differ from the repository's default branch).

## Features

- **Six-section flight profile**: career results in the introduction, three case studies, an explicit Astrion promotion timeline, and capabilities grouped by leadership, mission, and delivery. Navigation has readable section labels and working legacy waypoint anchors.
- **Reading and 3D views**: phones and short screens default to reading view. Desktop flight view adds a perspective entrance, starfield, and range-grid background. Content settles before it reaches the reading area. No scroll interception, snapping, mouse tilt, or fixed-height content viewport.
- **Progressive enhancement**: all content, links, final career figures, and expandable details work without JavaScript. The view preference is saved when storage is available; changing views preserves reading position. The operating system's reduced-motion preference always selects reading view.
- **Download PDF**: serves the official, maintained résumé PDF (`assets/Shane-Turner-Resume.pdf`). No print-dialog fiddling required.
- **Print**: an ink-light print stylesheet flattens the flight into a clean document straight from the browser's native print / Save-as-PDF (Ctrl/Cmd+P).
- **Opt-in sound**: a quiet ambient tone is available from the desktop flight-plan rail. It starts only after a click, and stops when the page is hidden or reading view is selected.
- **Social share card**: `assets/og-card.png` gives links a branded preview on LinkedIn, Slack, email, etc.
- **Structured data**: schema.org `Person` JSON-LD for search engines and rich previews.
- **Keyboard access**: native arrow, Page Up/Down, Home/End, and Tab behavior; skip links move focus to their destination; the mobile contents menu supports Escape; active section and view state are exposed to assistive technology.

## The downloadable PDF

`assets/Shane-Turner-Resume.pdf` is the official, maintained résumé PDF. It is the file served by every "Download PDF" link on the page. To update it, replace that file with a new export of the résumé (keep the same filename).

## Project structure

```
.
├── index.html                      # Classic single-page résumé (the default)
├── 3d/
│   ├── index.html                  # Six-section flight profile (noindex; canonical remains the classic résumé)
│   ├── flight.css                  # Shared reading/flight layout, responsive and print styles
│   └── flight.js                   # Optional motion, saved view, anchors and active navigation
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

Classic résumé text lives in `index.html`; the executive flight version lives in `3d/index.html` (each section has `class="waypoint"`). Common flight-page edits:

- **Contact details**: the `mailto:` links in the briefing and contact waypoints (no phone number is published).
- **Hero copy**: the `#wp-briefing` section and current-appointment portrait caption.
- **Stats**: the `#wp-flight-data` definition list. Values are real text, not zero-initialized animation counters.
- **Results**: `#wp-results`, containing shAIne, Navy program execution, CrewFlex, and recognition. Keep modeled cost avoidance distinct from cash savings; the annual subscription and separate reporting-tool estimate must not be combined into unsupported ROI.
- **Experience**: `#wp-experience`, retaining employer anchors `#wp-astrion`, `#wp-hii`, `#wp-amentum`, and `#wp-origins`. Astrion promotions have their own dates, and concurrent HII assignments are labeled.
- **Education / service / affiliations**: `#wp-foundation`.

Update both pages when the résumé changes, and refresh `assets/Shane-Turner-Resume.pdf` so the downloadable copy stays in sync.

For layout-only changes to `/3d/`, keep the official PDF and classic page intact. Preserve the existing navy/gold palette, local fonts, and portrait assets. Test phone widths (including 375 × 667), desktop, anchor navigation, view persistence, keyboard use, and printing before publishing. A view or interaction change does not require changing the public DNS or GoDaddy website builder.

## Hosting on GitHub Pages

1. Push to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to _Deploy from a branch_, pick `main`, folder `/ (root)`, and save.
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
