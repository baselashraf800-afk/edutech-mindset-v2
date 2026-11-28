#!/usr/bin/env bash
set -euo pipefail
WEB_DIR="${1:-../edutech-mindset-web}"
if [ ! -d "$WEB_DIR" ]; then
  echo "Usage: $0 <path-to-edutech-mindset-web>" >&2
  exit 1
fi
rsync -av --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude '_worker.js' \
  --exclude '_headers' \
  --exclude '_redirects' \
  --exclude '.cfignore' \
  --exclude 'tools' \
  --exclude 'downloads/*.apk' \
  "$WEB_DIR/" "./www/"
echo "✅ Synced web assets from $WEB_DIR into ./www/"
