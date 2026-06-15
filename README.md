# Shane Turner — Résumé

A fast, accessible, single-page web résumé for **Shane Turner, D.B.A.** — built to be read comfortably on any device and printed (or saved as a PDF) with one click.

🔗 **Live site:** enable GitHub Pages for this repo (see below), then visit
`https://<your-github-username>.github.io/resume/`.

## Features

- **Read anywhere** — responsive layout that works on phones, tablets, and desktops.
- **Print / Save as PDF** — a button in the top bar triggers the browser print dialog, with a dedicated print stylesheet that produces a clean, ink-light, recruiter-ready document. (No external service; "Save as PDF" is built into every modern browser's print window.)
- **Light & dark themes** — auto-detects the visitor's system preference and remembers manual overrides.
- **Download the Word version** — the original `.docx` is linked in the footer.
- **Accessible** — semantic HTML, skip link, keyboard focus styles, reduced-motion support, and color contrast that meets WCAG AA.
- **No build step, no dependencies** — plain HTML, CSS, and a small progressive-enhancement script. The page is fully functional with JavaScript disabled.

## Saving as a PDF

1. Open the page and click **Print / Save PDF** (top right).
2. In the print dialog, set the destination to **Save as PDF**.
3. For best results, leave margins at *Default* and turn **off** "Headers and footers."

## Project structure

```
.
├── index.html              # The résumé content + structure
├── assets/
│   ├── styles.css          # Screen + print styles (light/dark themes)
│   ├── main.js             # Theme toggle, print button, scroll-spy, back-to-top
│   ├── favicon.svg         # "ST" monogram icon
│   └── Shane-Turner-Resume.docx   # Downloadable Word version
└── README.md
```

## Editing the content

All résumé text lives in `index.html`. Common edits:

- **Contact details** — the `.contact` list and the `tel:` / `mailto:` links in the hero section.
- **Summary** — the two paragraphs under `.hero__summary`.
- **Capabilities** — the `#capabilities` tag list.
- **Experience** — each employer is an `<article class="org">`; each position is a `<div class="role">` with a `<ul class="bullets">`.
- **Education / service / affiliations** — the `#education` section.
- **"Current as of" date** — the `<time id="lastUpdated">` element in the footer.

After editing, replace `assets/Shane-Turner-Resume.docx` if you want the downloadable Word file to stay in sync.

## Hosting on GitHub Pages

1. Push to GitHub (this branch or `main`).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick the branch, folder `/ (root)`, and save.
4. Wait a minute, then open the published URL.

Because the site is static, it also runs by simply opening `index.html` in a browser, or behind any static host (Netlify, Cloudflare Pages, S3, etc.).
