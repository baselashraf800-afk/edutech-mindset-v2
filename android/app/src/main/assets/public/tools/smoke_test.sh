#!/usr/bin/env bash
# فحص دخان بعد النشر:  bash tools/smoke_test.sh [https://edutech-mindset.pages.dev]
BASE="${1:-https://edutech-mindset.pages.dev}"; FAIL=0
chk(){ if eval "$2"; then echo "OK   $1"; else echo "FAIL $1"; FAIL=1; fi; }
H=$(curl -fsS "$BASE/api/health" || true)
chk "/api/health يعمل ويعرض الإصدار" "echo '$H' | grep -q '\"version\":\"v'"
chk "مخزن المفاتيح دائم (KV أو متغيرات بيئة)" "echo '$H' | grep -q '\"keysPersistent\":true'"
chk "KV مربوط للحد اليومي" "echo '$H' | grep -q '\"kv\":true'"
S=$(curl -s -o /dev/null -w "%{http_code}" -H "Origin: https://evil.example" "$BASE/api/keys"); chk "رفض Origin غريب على /api/keys (403) = $S" "[ '$S' = 403 ]"
S=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/docs/x.md"); chk "/docs محجوب (404) = $S" "[ '$S' = 404 ]"
S=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/non-existent-page-check"); echo "INFO 404 page status: $S"
CC=$(curl -sI "$BASE/js/app.js?v=1" | tr -d '\r' | grep -i '^cache-control'); chk "js مخزّن immutable: $CC" "echo '$CC' | grep -qi immutable"
CSP=$(curl -sI "$BASE/" | tr -d '\r' | grep -i '^content-security-policy'); chk "CSP تسمح بـ youtube-nocookie" "echo '$CSP' | grep -q youtube-nocookie"
exit $FAIL
