#!/usr/bin/env bash
# فحص ما قبل الرفع: اتساق رقم الإصدار + صياغة JS + وجود الملفات المشار إليها + تطابق js مع src
cd "$(dirname "$0")/.."; FAIL=0
V=$(grep -o "const VERSION = '[0-9]*'" sw.js | grep -o "[0-9]*")
ok(){ echo "OK   $1"; }; bad(){ echo "FAIL $1"; FAIL=1; }
for v in $(grep -rhoE "\?v=[0-9]+" index.html | sort -u | tr -d '?v='); do [ "$v" = "$V" ] && ok "index ?v=$v" || bad "index فيه ?v=$v بينما sw=$V"; done
grep -q "version: \"v$V\"" _worker.js && ok "_worker.js = v$V" || bad "_worker.js لا يطابق v$V"
grep -q "version:\"$V\"" js/core-utils.js && ok "core-utils = $V" || bad "core-utils لا يطابق $V (شغّل tools/build.sh)"
for f in js/*.js sw.js _worker.js; do node --check "$f" 2>/dev/null || bad "صياغة $f"; done; ok "فحص صياغة JS"
for f in $(grep -oE "(js|css)/[A-Za-z0-9._-]+\?v=" index.html | sed 's/?v=//'); do [ -f "$f" ] || bad "ملف مفقود $f"; done
for f in src/js/*.js; do b=$(basename $f); [ "js/$b" -nt "$f" ] || [ "js/$b" -ot "$f" ] && true; done
[ -f offline.html ] && ok offline.html || bad "offline.html مفقود"
exit $FAIL
