#!/usr/bin/env bash
# رفع رقم الإصدار في كل مكان دفعة واحدة ثم إعادة بناء js المصغّرة (js/css تُخزَّن سنة immutable)
# الاستخدام:  bash tools/bump-version.sh 217
set -e
N="$1"; [ -z "$N" ] && { echo "usage: bump-version.sh <number>"; exit 1; }
cd "$(dirname "$0")/.."
OLD=$(grep -o "const VERSION = '[0-9]*'" sw.js | grep -o "[0-9]*")
sed -i "s/?v=$OLD/?v=$N/g" index.html
sed -i "s/const VERSION = '$OLD'/const VERSION = '$N'/; s/Service Worker — v$OLD/Service Worker — v$N/" sw.js
sed -i "s/version: \"$OLD\"/version: \"$N\"/" src/js/core-utils.js
sed -i "s/version: \"v$OLD\"/version: \"v$N\"/" _worker.js
sed -i "s/EduTech Mindset v$OLD/EduTech Mindset v$N/" offline.html 2>/dev/null || true
bash tools/build.sh
echo "bumped $OLD -> $N"; bash tools/preflight.sh
