# Shane Turner — Résumé

A fast, accessible, single-page web résumé for **Shane Turner, D.B.A.** — built to be read comfortably on any device, downloaded as a print-ready PDF, or printed directly.

🔗 **Live site:** enable GitHub Pages for this repo (see below), then visit
`https://azjester.github.io/resume/`.

## Features

- **Read anywhere** — responsive layout that works on phones, tablets, and desktops.
- **Download PDF** — a pre-rendered, print-ready PDF (`assets/Shane-Turner-Resume.pdf`) with proper margins and clean page breaks, generated from the page itself. No print-dialog fiddling required.
- **Print** — a print button is also available; a dedicated print stylesheet produces a clean, ink-light document. Horizontal margins come from padding so they survive even when the browser's "Margins" setting is "None."
- **Impact metrics strip** — scannable career highlights ($1B+ wins, $896M program, 700+ led, 20+ years) near the top.
- **Light & dark themes** — auto-detects the visitor's system preference and remembers manual overrides.
- **Social share card** — `assets/og-card.png` gives links a branded preview on LinkedIn, Slack, email, etc.
- **Structured data** — schema.org `Person` JSON-LD for search engines and rich previews.
- **Download the Word version** — the original `.docx` is linked in the footer.
- **Accessible** — semantic HTML, skip link, keyboard focus styles, reduced-motion support, and WCAG AA color contrast.

## The downloadable PDF

`assets/Shane-Turner-Resume.pdf` is rendered from `index.html` with [WeasyPrint](https://weasyprint.org/), which applies the page's print stylesheet directly. Because it doesn't go through a browser print dialog, the margins and layout are always correct.

Regenerate it after editing the résumé:

```bash
python3 -m pip install weasyprint
python3 tools/build_pdf.py        # writes assets/Shane-Turner-Resume.pdf
```

A GitHub Action (`.github/workflows/build-pdf.yml`) also regenerates the PDF and the social card automatically on any push to `main` that changes the content, styles, or card, and commits the refreshed files.

## Project structure

```
.
├── index.html                      # The résumé content + structure
├── assets/
│   ├── styles.css                  # Screen + print styles (light/dark themes)
│   ├── main.js                     # Theme toggle, print button, scroll-spy, back-to-top
│   ├── favicon.svg                 # "ST" monogram icon
│   ├── og-card.svg / og-card.png   # Social share card (source + rendered)
│   ├── Shane-Turner-Resume.pdf     # Pre-rendered, print-ready PDF
│   └── Shane-Turner-Resume.docx    # Downloadable Word version
├── tools/
│   └── build_pdf.py                # Renders index.html -> PDF (WeasyPrint)
├── .github/workflows/build-pdf.yml # Auto-regenerates the PDF + card on push
└── README.md
```

## Editing the content

All résumé text lives in `index.html`. Common edits:

- **Contact details** — the `.contact` list and the `tel:` / `mailto:` links in the hero section.
- **Summary** — the two paragraphs under `.hero__summary`.
- **Impact metrics** — the `.metrics` block at the top of `.wrap`.
- **Capabilities** — the `#capabilities` tag list.
- **Experience** — each employer is an `<article class="org">`; each position is a `<div class="role">` with a `<ul class="bullets">`.
- **Education / service / affiliations** — the `#education` section.
- **"Current as of" date** — the `<time id="lastUpdated">` element in the footer.

After editing, regenerate the PDF (above) and replace `assets/Shane-Turner-Resume.docx` if you want the Word file to stay in sync.

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
