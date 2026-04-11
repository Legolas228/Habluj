#!/usr/bin/env bash
set -euo pipefail

# Verifies that production-critical secrets are present and not placeholders.
# Usage:
#   source /path/to/production-env.sh
#   bash backend/scripts/verify_secret_rotation.sh

required_vars=(
  DJANGO_SECRET_KEY
  MAILERLITE_API_KEY
  DJANGO_EMAIL_HOST_PASSWORD
)

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
backend_dir="$(cd "$script_dir/.." && pwd)"
env_file="$backend_dir/.env"

placeholder_values=(
  "__ROTATE_REQUIRED__"
  "__SET_STRONG_RANDOM_SECRET__"
  "replace-with-strong-secret"
  "replace-with-mailerlite-api-key"
)

errors=0

is_placeholder() {
  local value="$1"
  for p in "${placeholder_values[@]}"; do
    if [[ "$value" == "$p" ]]; then
      return 0
    fi
  done
  return 1
}

load_env_file_if_present() {
  if [[ ! -f "$env_file" ]]; then
    return
  fi

  while IFS= read -r raw_line; do
    line="${raw_line%%$'\r'}"
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" != *"="* ]] && continue

    key="${line%%=*}"
    value="${line#*=}"

    key="$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    # Only parse canonical env var keys (prevents crashes with multiline JSON blocks).
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue

    value="$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"

    # Do not overwrite already provided process environment.
    if [[ -z "${!key-}" ]]; then
      export "$key=$value"
    fi
  done < "$env_file"
}

load_env_file_if_present

echo "[check] Validating rotated secrets..."
for var_name in "${required_vars[@]}"; do
  value="${!var_name-}"

  if [[ -z "$value" ]]; then
    echo "[ERROR] $var_name is empty or missing"
    errors=$((errors + 1))
    continue
  fi

  if is_placeholder "$value"; then
    echo "[ERROR] $var_name still uses placeholder value"
    errors=$((errors + 1))
    continue
  fi

  if [[ "$var_name" == "DJANGO_SECRET_KEY" && ${#value} -lt 32 ]]; then
    echo "[ERROR] DJANGO_SECRET_KEY is too short (expected >= 32 chars)"
    errors=$((errors + 1))
    continue
  fi

  echo "[OK] $var_name is set"
done

echo "[check] Validating optional GoPay secret policy..."
if [[ -n "${GOPAY_CLIENT_ID-}" || -n "${GOPAY_CLIENT_SECRET-}" || -n "${GOPAY_GOID-}" ]]; then
  if [[ -z "${GOPAY_WEBHOOK_SECRET-}" ]]; then
    echo "[ERROR] GOPAY_WEBHOOK_SECRET is required when GoPay is configured"
    errors=$((errors + 1))
  elif is_placeholder "${GOPAY_WEBHOOK_SECRET}"; then
    echo "[ERROR] GOPAY_WEBHOOK_SECRET still uses placeholder value"
    errors=$((errors + 1))
  else
    echo "[OK] GOPAY_WEBHOOK_SECRET is set"
  fi
fi

echo "[check] Validating optional Google Calendar secret policy..."
if [[ -n "${GOOGLE_CALENDAR_ID-}" ]]; then
  if [[ -z "${GOOGLE_SERVICE_ACCOUNT_JSON-}" ]]; then
    echo "[ERROR] GOOGLE_SERVICE_ACCOUNT_JSON is required when GOOGLE_CALENDAR_ID is set"
    errors=$((errors + 1))
  elif is_placeholder "${GOOGLE_SERVICE_ACCOUNT_JSON}"; then
    echo "[ERROR] GOOGLE_SERVICE_ACCOUNT_JSON still uses placeholder value"
    errors=$((errors + 1))
  elif ! GOOGLE_SERVICE_ACCOUNT_JSON="$GOOGLE_SERVICE_ACCOUNT_JSON" /usr/bin/python3 - <<'PY'
import json
import os

raw = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON', '')
try:
    data = json.loads(raw)
except Exception:
    raise SystemExit(1)

required = {'type', 'project_id', 'private_key', 'client_email'}
raise SystemExit(0 if required.issubset(set(data.keys())) else 1)
PY
  then
    echo "[ERROR] GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON service account content"
    errors=$((errors + 1))
  else
    echo "[OK] GOOGLE_SERVICE_ACCOUNT_JSON is set"
  fi
fi

if [[ $errors -gt 0 ]]; then
  echo "\nResult: FAILED ($errors issue(s) found)"
  exit 1
fi

echo "\nResult: PASSED (rotation checks look good)"