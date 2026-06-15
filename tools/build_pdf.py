#!/usr/bin/env python3
"""Render the resume web page to a print-ready PDF.

Uses WeasyPrint, which applies the page's print stylesheet (@media print)
and @page rules directly, so the output always has correct margins and
page breaks regardless of any browser print dialog.

Usage:
    python3 tools/build_pdf.py            # writes assets/Shane-Turner-Resume.pdf
    python3 tools/build_pdf.py out.pdf    # custom output path
"""
import sys
from pathlib import Path

from weasyprint import HTML

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
DEFAULT_OUT = ROOT / "assets" / "Shane-Turner-Resume.pdf"


def main() -> int:
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUT
    out.parent.mkdir(parents=True, exist_ok=True)
    # base_url is the repo root so relative asset URLs (CSS, fonts) resolve.
    HTML(filename=str(SRC), base_url=str(ROOT)).write_pdf(str(out))
    print(f"Wrote {out} ({out.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
