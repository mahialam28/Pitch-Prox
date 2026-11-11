#!/usr/bin/env bash
# PitchProX nightly backup: the MySQL database + uploaded files (storage/uploads).
#
#   ./scripts/backup.sh                     # uses MYSQL_* / UPLOAD_DIR from the environment or .env.local
#   BACKUP_DIR=/home/pitchprox/backups KEEP_DAYS=14 ./scripts/backup.sh
#
# Cron (2:30am every night):
#   30 2 * * * cd /path/to/app && ./scripts/backup.sh >> storage/backup.log 2>&1
#
# Restore: gunzip -c db-<stamp>.sql.gz | mysql -u <user> -p <database>
#          tar -xzf uploads-<stamp>.tar.gz -C <app folder>/storage
# Copy the backup folder off the server too (Hostinger backups, rclone to Drive/S3, ...):
# a backup that lives only on the same server is lost with it.
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Read MYSQL_* and UPLOAD_DIR from .env.local when they aren't already set (values never printed)
if [ -f "$APP_DIR/.env.local" ]; then
  while IFS='=' read -r key value; do
    case "$key" in
      MYSQL_HOST|MYSQL_PORT|MYSQL_DATABASE|MYSQL_USER|MYSQL_PASSWORD|UPLOAD_DIR)
        if [ -z "${!key:-}" ]; then
          value="${value%\"}"; value="${value#\"}"; value="${value%\'}"; value="${value#\'}"
          export "$key=$value"
        fi
        ;;
    esac
  done < <(grep -E '^[A-Z_]+=' "$APP_DIR/.env.local")
fi

DB_HOST="${MYSQL_HOST:-127.0.0.1}"
DB_PORT="${MYSQL_PORT:-3306}"
DB_NAME="${MYSQL_DATABASE:-pitchprox_dev}"
DB_USER="${MYSQL_USER:-pitchprox_app}"
UPLOADS="${UPLOAD_DIR:-$APP_DIR/storage/uploads}"
BACKUP_DIR="${BACKUP_DIR:-$APP_DIR/storage/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
umask 077

# Password goes through a temporary options file so it never shows in `ps`
MYCNF="$(mktemp)"
trap 'rm -f "$MYCNF"' EXIT
printf '[client]\nhost=%s\nport=%s\nuser=%s\npassword="%s"\n' "$DB_HOST" "$DB_PORT" "$DB_USER" "${MYSQL_PASSWORD:-}" > "$MYCNF"

# MySQL 8's mysqldump wants FLUSH privileges for GTID info; shared-hosting users don't have them
EXTRA=()
# (and newer versions also dump masking policies, which the app user can't read). Only add
# flags this mysqldump knows — MariaDB's has neither.
HELP="$(mysqldump --help 2>/dev/null || true)"
if grep -q -- '--set-gtid-purged' <<<"$HELP"; then EXTRA+=(--set-gtid-purged=OFF); fi
if grep -q -- '--masking-policies' <<<"$HELP"; then EXTRA+=(--skip-masking-policies); fi

DB_FILE="$BACKUP_DIR/db-$STAMP.sql.gz"
mysqldump --defaults-extra-file="$MYCNF" --single-transaction --quick --routines --triggers --no-tablespaces ${EXTRA[@]+"${EXTRA[@]}"} "$DB_NAME" | gzip -9 > "$DB_FILE.partial"
mv "$DB_FILE.partial" "$DB_FILE"
echo "$(date -u +%FT%TZ) database -> $DB_FILE ($(du -h "$DB_FILE" | cut -f1))"

if [ -d "$UPLOADS" ]; then
  UP_FILE="$BACKUP_DIR/uploads-$STAMP.tar.gz"
  tar -czf "$UP_FILE.partial" -C "$(dirname "$UPLOADS")" "$(basename "$UPLOADS")"
  mv "$UP_FILE.partial" "$UP_FILE"
  echo "$(date -u +%FT%TZ) uploads  -> $UP_FILE ($(du -h "$UP_FILE" | cut -f1))"
else
  echo "$(date -u +%FT%TZ) uploads  -> skipped ($UPLOADS not found)"
fi

# Keep the last KEEP_DAYS days
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.sql.gz' -o -name 'uploads-*.tar.gz' \) -mtime +"$KEEP_DAYS" -print -delete | sed 's/^/removed old backup: /'
