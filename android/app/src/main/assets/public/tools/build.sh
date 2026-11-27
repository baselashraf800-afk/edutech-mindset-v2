#!/usr/bin/env bash
# يبني js/ المصغّرة من المصدر المقروء src/js/ (عدّل في src/js ثم شغّل هذا الأمر)
# يدعم esbuild (إن كان مثبتاً في tools/minify) أو terser تلقائياً
set -e
cd "$(dirname "$0")/.."
ES=tools/minify/node_modules/.bin/esbuild
if [ -x "$ES" ]; then
  for f in src/js/*.js; do $ES "$f" --minify --charset=utf8 --target=es2019 --outfile="js/$(basename "$f")" --log-level=error; done
elif command -v terser >/dev/null 2>&1; then
  for f in src/js/*.js; do terser "$f" --compress --mangle --ecma 2019 --output "js/$(basename "$f")"; done
else
  echo "ثبّت esbuild (cd tools/minify && npm install) أو terser أولاً"
  exit 1
fi
echo "built $(ls js/*.js | wc -l) files"
