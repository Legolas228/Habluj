#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

if ! command -v npm >/dev/null 2>&1; then
  echo "[error] npm is not installed"
  exit 1
fi

if ! command -v /usr/bin/python3 >/dev/null 2>&1; then
  echo "[error] /usr/bin/python3 is not available"
  exit 1
fi

cleanup() {
  echo ""
  echo "[info] stopping services..."
  if [[ -n "${BACKEND_PID:-}" ]]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi
  if [[ -n "${FRONTEND_PID:-}" ]]; then
    kill "$FRONTEND_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

cd "$BACKEND_DIR"
/usr/bin/python3 manage.py migrate --noinput >/dev/null
/usr/bin/python3 manage.py runserver 8000 &
BACKEND_PID=$!

echo "[info] backend running at http://127.0.0.1:8000 (pid $BACKEND_PID)"

cd "$ROOT_DIR"
npm run dev &
FRONTEND_PID=$!

echo "[info] frontend running at http://127.0.0.1:4028 (pid $FRONTEND_PID)"
echo "[info] press Ctrl+C to stop both"

wait "$BACKEND_PID" "$FRONTEND_PID"
