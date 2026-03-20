#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo "[step] backend tests"
cd "$BACKEND_DIR"
/usr/bin/python3 manage.py test

echo "[step] django deploy security checks"
SECURITY_CHECK_SECRET_KEY="${SECURITY_CHECK_SECRET_KEY:-7af4c8a0fce1d049b8fdf5f1f07d6a9de56d159f0b8a417f1fd3d3090f34d823}"
DJANGO_DEBUG=false \
DJANGO_SECRET_KEY="$SECURITY_CHECK_SECRET_KEY" \
DJANGO_SECURE_SSL_REDIRECT=true \
	/usr/bin/python3 manage.py check --deploy

echo "[step] frontend tests"
cd "$ROOT_DIR"
npm run test

echo "[step] frontend production build"
npm run build

echo "[done] validation completed"
