#!/usr/bin/env bash
set -euo pipefail

# Creates a timestamped SQLite backup and keeps the newest 30 files.
BACKUP_DIR="${1:-$HOME/backups/habluj}"
DB_PATH="${2:-$HOME/Habluj/backend/db.sqlite3}"

mkdir -p "$BACKUP_DIR"

if [[ ! -f "$DB_PATH" ]]; then
  echo "Database file not found: $DB_PATH" >&2
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/db-$STAMP.sqlite3.gz"

gzip -c "$DB_PATH" > "$OUT"

echo "Backup created: $OUT"

# Keep last 30 backups only.
ls -1t "$BACKUP_DIR"/db-*.sqlite3.gz 2>/dev/null | tail -n +31 | xargs -r rm -f
