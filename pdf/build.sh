#!/usr/bin/env sh
# Regenerates assets/Shane-Turner-Resume.pdf from pdf/index.html with headless Chromium.
# Usage: pdf/build.sh            (uses $CHROME, or finds chromium / google-chrome on PATH)
#
# Superseded October 2026: the official PDF is exported from the Word master résumé.
# Running this would replace it with the older wording in pdf/index.html, so it refuses
# unless FORCE_HTML_PDF=1 is set.
set -eu
if [ "${FORCE_HTML_PDF:-}" != "1" ]; then
  echo "pdf/build.sh is superseded; the official PDF comes from the Word master (see README)." >&2
  echo "Set FORCE_HTML_PDF=1 to overwrite assets/Shane-Turner-Resume.pdf anyway." >&2
  exit 1
fi
cd "$(dirname "$0")/.."
BROWSER="${CHROME:-}"
if [ -z "$BROWSER" ]; then
  for candidate in chromium chromium-browser google-chrome google-chrome-stable chrome; do
    if command -v "$candidate" >/dev/null 2>&1; then BROWSER="$candidate"; break; fi
  done
fi
if [ -z "$BROWSER" ]; then
  echo "Set CHROME to a Chromium/Chrome binary." >&2
  exit 1
fi
OUT="assets/Shane-Turner-Resume.pdf"
"$BROWSER" --headless=new --no-sandbox --disable-gpu --allow-file-access-from-files \
  --run-all-compositor-stages-before-draw --virtual-time-budget=4000 \
  --no-pdf-header-footer --print-to-pdf="$OUT" "file://$PWD/pdf/index.html"
echo "Wrote $OUT"
if command -v pdfinfo >/dev/null 2>&1; then pdfinfo "$OUT" | grep -E '^(Pages|Page size)'; fi
