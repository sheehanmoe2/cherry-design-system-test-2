#!/bin/sh
mkdir -p preview
npx esbuild src/preview.tsx --bundle --outdir=preview --loader:.module.css=local-css --loader:.css=css --define:process.env.NODE_ENV='"development"' --jsx=automatic --log-level=warning
cat > preview/index.html <<'H'
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Button preview</title><link rel="stylesheet" href="preview.css"></head><body><div id="root"></div><script src="preview.js"></script></body></html>
H
