#!/usr/bin/env bash
set -euo pipefail

# Post-deploy smoke checks for Habluj.
#
# Usage example:
#   FRONTEND_URL="https://habluj.vercel.app" \
#   API_BASE_URL="https://legolas228.pythonanywhere.com" \
#   bash scripts/post_deploy_smoke.sh

FRONTEND_URL="${FRONTEND_URL:-https://habluj.vercel.app}"
API_BASE_URL="${API_BASE_URL:-https://legolas228.pythonanywhere.com}"

errors=0

check_http_200() {
  local url="$1"
  local label="$2"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ "$code" == "200" ]]; then
    echo "[OK] $label -> $code"
  else
    echo "[ERROR] $label -> expected 200, got $code"
    errors=$((errors + 1))
  fi
}

check_http_400_or_401() {
  local url="$1"
  local label="$2"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$url" -H 'Content-Type: application/json' -d '{}' || true)"
  if [[ "$code" == "400" || "$code" == "401" ]]; then
    echo "[OK] $label -> $code"
  else
    echo "[ERROR] $label -> expected 400/401, got $code"
    errors=$((errors + 1))
  fi
}

echo "[smoke] FRONTEND_URL=$FRONTEND_URL"
echo "[smoke] API_BASE_URL=$API_BASE_URL"

check_http_200 "$FRONTEND_URL/" "Frontend home"
check_http_200 "$API_BASE_URL/api/" "API root"
check_http_400_or_401 "$API_BASE_URL/api/auth/login/" "Auth login validation"

if [[ $errors -gt 0 ]]; then
  echo "\nResult: FAILED ($errors issue(s) found)"
  exit 1
fi

echo "\nResult: PASSED (post-deploy smoke checks look good)"