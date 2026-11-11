# Shane Turner Résumé

A web résumé for **Shane Turner, D.B.A.** The main page is an executive flight profile in six sections that follow the résumé's order: introduction, executive summary (with core capabilities), selected AI initiatives, experience, education and credentials, and contact. The positioning is **Enterprise AI Executive** (agentic AI, AI governance, regulated defense environments), matching the November 2026 résumé. The classic single-page résumé lives at `/classic/`, and old `/3d/` links redirect to the main page. The main page opens in a reading view on every screen; a 3D view is an opt-in extra on larger windows. Both use normal document scrolling.

🔗 **Live site:** [`https://resume.st-dba.com`](https://resume.st-dba.com) (custom domain via `CNAME`; GitHub Pages serving from `main`, which can differ from the repository's default branch).

## Features

- **Classic résumé** (`/classic/`): a compact introduction with immediate PDF, email, and LinkedIn links; the four-part executive summary and grouped capabilities; the three AI initiatives; and the full career history. All roles, dates, promotions, and concurrent assignments remain visible. It links back to the flight profile and carries `noindex`, so search engines index the main page.
- **Phone navigation**: a native contents menu at narrower widths, with keyboard focus, Escape dismissal, active-section feedback, and a persistent PDF link. Navigation, email links, and expandable methodology still work without JavaScript. Light/dark preference is remembered when storage is available.
- **Selected AI initiatives**: shAIne, the AI Intel Brief Agent, and the Enterprise Intelligence Command Center, each written as problem, solution, and outcome. shAIne's measured savings (first three instrumented users, compared with the full annual subscription), its adoption rate, and the separate reporting-tool estimate are labeled separately on both versions, with the method and its limits one click away.
- **Local assets**: both résumé pages load their fonts and optimized photographs from this repository, without external font requests. Both pages respect reduced motion and print in ordinary document flow.
- **Six-section flight profile**: proof points in the introduction, a four-part executive summary (agentic AI, regulated environments, scale, talent) with capabilities grouped as in the résumé, three AI case studies, and an Astrion promotion timeline above role-by-role experience. Navigation has readable section labels and working legacy waypoint anchors.
- **Reading view by default**: every visitor lands in the reading view, an ordinary scrolling page. The first screen holds the name, positioning line, headline, three proof points, and direct links (email address, LinkedIn, résumé PDF), and it fits without scrolling on laptop-height windows. No text on the page is set below 12px.
- **Optional 3D view**: a "View in 3D" button in the header appears on windows at least 901 × 620 px when the visitor has not asked for reduced motion; the choice is remembered. A link can also request it for one visit with `?view=3d` (the classic page's "View the 3D résumé" links do this). The 3D view places the six sections in a perspective scene with a starfield and a range grid. Native document scrolling first reads a panel's entire measured content, then makes a short hop to the next panel. A panel at rest is flat and unscaled so its text stays sharp; depth and tilt apply only in transit. Page Down, Page Up, and Space move by readable pages and land on a panel, never between two. Find-in-page (Ctrl/Cmd+F) returns the page to the reading view at the same place, because a browser cannot scroll to text in an off-screen panel. A jump of more than one section fades in at the destination. Previous/next controls and the contents rail also navigate. No wheel/touch interception, scroll snapping, mouse tilt, or sound.
- **Progressive enhancement**: all content, links, final career figures, and expandable details work without JavaScript. The view preference is saved when storage is available, and a small inline script in the `<head>` applies a saved 3D choice before first paint so the layout does not jump; changing views preserves the current paragraph or heading even when line wrapping changes. 3D distances remeasure after resizing, font/image loading, and opening details. The operating system's reduced-motion preference always selects the reading view and hides the 3D button.
- **Résumé PDF**: every PDF link serves the official, maintained résumé PDF (`assets/Shane-Turner-Resume.pdf`). On the main page it opens in a new tab, like the LinkedIn and st-dba.com links, so the visitor keeps their place.
- **Copyable email**: the address is shown as text in the introduction and the contact section, and the contact section has a "Copy address" button for visitors with no mail app configured.
- **Print**: an ink-light print stylesheet flattens the flight into a clean document straight from the browser's native print / Save-as-PDF (Ctrl/Cmd+P).
- **Social share card**: `assets/og-card.png` gives links a branded preview on LinkedIn, Slack, email, etc. `assets/og-card.svg` is its source; it names the site fonts (Fraunces, Inter), so render it at 1200 × 630 in a browser page that loads `assets/fonts/`. Both pages reference the image with a `?v=` date so social platforms pick up a new card; bump it when the card changes.
- **Structured data**: schema.org `Person` JSON-LD for search engines and rich previews.
- **Keyboard access**: native arrow, Page Up/Down, Home/End, and Tab behavior in the reading view (the 3D view adds the page-key handling described above); skip links move focus to their destination; the mobile contents menu supports Escape; the active section is exposed to assistive technology, and view changes are announced.

## The downloadable PDF

`assets/Shane-Turner-Resume.pdf` is the official résumé PDF, served by every "Download PDF" link. Since October 2026 it is produced from Shane's Word master résumé, which is kept outside this repository. In Word, use **File → Export → Create PDF/XPS** (or Save As → PDF) with "Document structure tags for accessibility" checked, save it as `assets/Shane-Turner-Resume.pdf`, confirm it is two letter pages, and commit it.

The November 2026 copy was converted from the Word file with headless LibreOffice (`soffice --headless --convert-to pdf`) because Word was not available. The document's font is Cambria; LibreOffice substituted Caladea, which has the same metrics, so line and page breaks match and only the letter shapes differ slightly. Re-export from Word to restore Cambria.

`pdf/index.html` and `pdf/build.sh` are the earlier HTML print source. They no longer match the official PDF; running `pdf/build.sh` would overwrite the current download with older wording. `assets/Shane-Turner-Resume.pptx` is separate share collateral and is not generated by either route.

## Project structure

```
.
├── index.html                      # Six-section main page (reading view; optional 3D view)
├── pdf/
│   ├── index.html                  # Earlier HTML print source (superseded by the Word master)
│   └── build.sh                    # Old Chromium build; do not run (overwrites the official PDF)
├── robots.txt / sitemap.xml        # Crawl hints for the main page
├── 3d/
│   ├── index.html                  # Redirect to the main page, keeping any #section (old link compatibility)
│   ├── flight.css                  # Reading and 3D layouts, responsive and print styles
│   └── flight.js                   # View choice, 3D route and page keys, anchors, active navigation, copy button
├── classic/
│   └── index.html                  # Classic single-page résumé (noindex; canonical is the main page)
├── assets/
│   ├── fonts/                      # Subset Fraunces / Inter / IBM Plex Mono woff2
│   ├── styles.css                  # Classic page styles (light/dark themes)
│   ├── main.js                     # Classic page scripts
│   ├── favicon.svg                 # "ST" monogram icon
│   ├── og-card.svg / og-card.png   # Social share card (source + rendered)
│   ├── shane-turner-{160..760}.jpg # Portrait at five widths (srcset), plus .webp versions
│   ├── nlos-c-640.jpg / .webp      # Optimized early-career photo used by both pages
│   ├── Shane-Turner-Resume.pdf     # Official downloadable PDF (exported from the Word master)
│   └── (share collateral)          # NOT referenced by index.html; distributed directly:
│                                   #   Shane-Turner-Resume.pptx, Shane_blue_suite.png,
│                                   #   infographic*.svg, shane-turner-infographic*.png,
│                                   #   XM1203_Non_Line_of_Sight-Cannon_(NLOS-C).jpg
└── README.md
```

## Editing the content

The executive flight version lives in `index.html` (each section has `class="waypoint"`; styles and scripts are `3d/flight.css` and `3d/flight.js`). Classic résumé text lives in `classic/index.html`, which loads its assets with `../assets/` paths. Common flight-page edits:

- **Contact details**: the `mailto:` links in the briefing and contact waypoints, whose visible text is the address, plus the `data-copy` attribute on the "Copy address" button (no phone number is published).
- **Hero copy**: the `#wp-briefing` section (name line `.hero-name`, positioning line, headline, lead) and the current-appointment portrait caption.
- **Stats**: the `#wp-flight-data` definition list. Values are real text, not zero-initialized animation counters.
- **Executive summary**: `#wp-profile`, holding the four summary cards (`.pillar-grid`) and the core capabilities (`#wp-capabilities`), worded as in the résumé. Its intro carries only the résumé summary's closing sentence; the first two sentences are the hero lead, so they are not repeated here.
- **AI initiatives**: `#wp-results`, containing shAIne (`#wp-shaine`), the AI Intel Brief Agent (`#wp-intel-brief`), the Enterprise Intelligence Command Center (`#wp-command-center`), and recognition (`#wp-recognition`). State the shAIne savings as measured for the first three instrumented users against the full annual subscription, keep the method sentence visible in the value panel with the caveats under "Limits of this figure", and keep the separate reporting-tool estimate out of that figure.
- **Experience**: `#wp-experience`, with employer anchors `#wp-astrion`, `#wp-hii`, `#wp-amentum` (URS/AECOM and Amentum, 2015–2020), `#wp-northrop`, and `#wp-origins`. Each role has its own title, dates, and bullets (`.role-block`); concurrent HII assignments are labeled.
- **Education / credentials / service / affiliations**: `#wp-foundation`.

**Dated statement.** The Command Center outcome reads "Goes live December 4, 2026" on both pages and in the hero-style metric on the main page. Change it to past tense after go-live.

**Say it once.** Each claim appears once as a headline figure and once where it is substantiated. When adding copy, avoid restating the hero lead, the clearance/veteran/location line, or the promotion line in other sections; the section labels in the contents rail, the phone menu, and each section's `data-label` use the same wording.

Update both pages when the résumé changes, then export the Word master to `assets/Shane-Turner-Resume.pdf` so the downloadable copy stays in sync. Keep the three copies on the same wording for the shAIne figures: savings measured for the first three instrumented users, compared with the full annual subscription, with the reporting-tool estimate kept separate.

The classic page also has a **Writing** section (`#writing`) that lists recent analysis from [st-dba.com](https://st-dba.com/). The titles, dates, and links are hard-coded; refresh them when new posts go up.

**Theme.** An inline script in the `<head>` of `classic/index.html` applies the saved theme, or the operating system's light/dark preference, before first paint. The stylesheet also follows `prefers-color-scheme` without JavaScript. The toggle stores the visitor's choice in `localStorage`.

The classic page retains its existing `#top`, `#highlights` (now the AI initiatives), `#recognition`, `#about` (now the executive summary), `#capabilities`, `#experience`, `#education`, and `#contact` anchors. Summary cards and older links also point to `#astrion`, `#astrion-vp`, `#hii`, `#nite`, `#yuma` (URS/AECOM and Amentum), and `#northrop`. Keep these destinations when editing. The main stylesheet is `assets/styles.css`; `assets/main.js` adds theme persistence, menu dismissal, focus management, and active-section feedback. Update their version query strings in `classic/index.html` when publishing changes, and the `3d/flight.css` / `3d/flight.js` query strings in `index.html` when those files change.

For classic-page changes, check 320px and 375px phones, tablet and desktop layouts, menu opening and Escape, keyboard navigation, light/dark persistence, deep links, contact/download destinations, and the print stylesheet. Compare career role titles and dates with the prior page to catch accidental omissions. The maintained PDF is independent of the web layout; a layout or wording clarification does not regenerate that file automatically.

For layout-only changes to the main page (`index.html`, `3d/flight.css`, `3d/flight.js`), keep the official PDF and classic page intact. Preserve the existing navy/gold palette, local fonts, and portrait assets. Test phone widths (including 375 × 667 and 320px), laptop-height windows (1536 × 730 and 1366 × 650, where the introduction's actions must stay on the first screen), anchor navigation, view persistence, keyboard use, and printing before publishing. In the 3D view, check that the introduction fits its panel at those laptop sizes, scroll to the bottom of the long results and experience panels, expand the details, press Page Down from the top to the end, press Ctrl/Cmd+F, and check a transition in both directions. The media query that decides where the 3D view is offered appears in three places that must match: the inline script in `index.html`, `flightCapable` in `3d/flight.js`, and the `.view-toggle` rule in `3d/flight.css`. 3D-only geometry is scoped to screen media so printing retains normal document flow. A view or interaction change does not require changing the public DNS or GoDaddy website builder.

## Security headers and analytics

GitHub Pages cannot set response headers, so the site ships without `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, or `X-Content-Type-Options` (securityheaders.com grades it F for that reason). The page sets a `referrer` meta tag, which is the only policy a static page can declare itself. To add the rest, put Cloudflare (free plan) in front of Pages: point the `resume` CNAME at Cloudflare, re-point to `azjester.github.io` inside Cloudflare, and add the headers with a Transform Rule. The same move lets you set a longer cache lifetime than Pages' ten minutes. Moving the site to Cloudflare Pages or Netlify with a `_headers` file is the other option.

No analytics are installed. A privacy-friendly counter (Cloudflare Web Analytics, Plausible, Fathom, or GoatCounter) is a one-line `<script>` in both `index.html` and `classic/index.html` once an account exists.

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
