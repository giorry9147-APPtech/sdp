#!/usr/bin/env bash
# SDP — dagelijkse Postgres backup
#
# Maakt encrypted dump van de productie-DB en upload naar S3.
# Aan te roepen via cron, bijvoorbeeld:
#   0 2 * * * /opt/sdp/infra/backup.sh >> /var/log/sdp-backup.log 2>&1
#
# Vereist op de host: docker, awscli, gpg
# Vereiste env-vars (in .env): POSTGRES_USER, POSTGRES_DB,
#   BACKUP_S3_BUCKET, BACKUP_RETENTION_DAYS, BACKUP_GPG_RECIPIENT
set -euo pipefail

# Laad .env uit dezelfde map als compose-file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
# shellcheck disable=SC1091
source "$REPO_DIR/.env"

TS=$(date -u +"%Y%m%dT%H%M%SZ")
TMP_DIR=$(mktemp -d)
DUMP_FILE="$TMP_DIR/sdp-${TS}.sql.gz"
ENC_FILE="$DUMP_FILE.gpg"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] SDP backup start"

# Dump Postgres via docker exec
docker exec sdp-postgres-prod pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --format=custom \
    --no-owner \
    --no-privileges \
    --verbose 2>/tmp/backup-stderr.log \
  | gzip -9 > "$DUMP_FILE"

DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "  ✓ Dump $DUMP_SIZE → $DUMP_FILE"

# Encrypt met GPG
if [ -n "${BACKUP_GPG_RECIPIENT:-}" ]; then
    gpg --batch --yes --trust-model always \
        --encrypt --recipient "$BACKUP_GPG_RECIPIENT" \
        --output "$ENC_FILE" \
        "$DUMP_FILE"
    UPLOAD="$ENC_FILE"
    echo "  ✓ Encrypted → $ENC_FILE"
else
    echo "  ⚠ BACKUP_GPG_RECIPIENT niet gezet — backup wordt NIET ge-encrypteerd"
    UPLOAD="$DUMP_FILE"
fi

# Upload naar S3 (optioneel — zet BACKUP_S3_BUCKET leeg om over te slaan)
if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
    KEY="postgres/$(date -u +%Y/%m)/$(basename "$UPLOAD")"
    aws s3 cp "$UPLOAD" "s3://${BACKUP_S3_BUCKET}/${KEY}" \
        --storage-class STANDARD_IA \
        --metadata "host=$(hostname),retention=${BACKUP_RETENTION_DAYS:-90}d"
    echo "  ✓ Geüpload naar s3://${BACKUP_S3_BUCKET}/${KEY}"

    # Cleanup oude backups (alleen als retention gezet is)
    if [ -n "${BACKUP_RETENTION_DAYS:-}" ]; then
        CUTOFF_DATE=$(date -u -d "${BACKUP_RETENTION_DAYS} days ago" +%Y-%m-%d 2>/dev/null \
                  || date -u -v-"${BACKUP_RETENTION_DAYS}d" +%Y-%m-%d)
        echo "  Cleanup van backups ouder dan $CUTOFF_DATE..."
        aws s3 ls "s3://${BACKUP_S3_BUCKET}/postgres/" --recursive \
          | awk -v cutoff="$CUTOFF_DATE" '$1 < cutoff {print $4}' \
          | while read -r oud; do
              aws s3 rm "s3://${BACKUP_S3_BUCKET}/$oud"
              echo "    - verwijderd: $oud"
          done
    fi
fi

# Kopie lokaal houden voor snelle restore
BACKUP_LOCAL_DIR="${REPO_DIR}/backups"
mkdir -p "$BACKUP_LOCAL_DIR"
cp "$UPLOAD" "$BACKUP_LOCAL_DIR/"
# Lokaal alleen laatste 7 dagen behouden
find "$BACKUP_LOCAL_DIR" -name "sdp-*.sql.gz*" -mtime +7 -delete

# Cleanup tmp
rm -rf "$TMP_DIR"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] SDP backup klaar"
