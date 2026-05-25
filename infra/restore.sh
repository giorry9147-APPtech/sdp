#!/usr/bin/env bash
# SDP — restore vanuit backup-bestand.
#
# Gebruik:
#   ./infra/restore.sh path/to/backup.sql.gz[.gpg]
#
# WAARSCHUWING: schrijft over bestaande data!
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Gebruik: $0 <pad-naar-backup>"
    echo "  bv. $0 backups/sdp-20260601T020000Z.sql.gz.gpg"
    exit 1
fi

BACKUP="$1"
if [ ! -f "$BACKUP" ]; then
    echo "✗ Backup-bestand niet gevonden: $BACKUP"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
# shellcheck disable=SC1091
source "$REPO_DIR/.env"

echo "⚠️  Dit overschrijft alle data in database '$POSTGRES_DB'."
read -r -p "Typ 'restore' om door te gaan: " bevestig
if [ "$bevestig" != "restore" ]; then
    echo "Geannuleerd"
    exit 0
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# Decrypt indien GPG
DUMP="$BACKUP"
if [[ "$BACKUP" == *.gpg ]]; then
    DUMP="$TMP_DIR/$(basename "${BACKUP%.gpg}")"
    echo "→ Decrypten..."
    gpg --batch --yes --decrypt --output "$DUMP" "$BACKUP"
fi

# Gunzip indien nodig
if [[ "$DUMP" == *.gz ]]; then
    UNCOMP="$TMP_DIR/$(basename "${DUMP%.gz}")"
    echo "→ Decompressie..."
    gunzip -c "$DUMP" > "$UNCOMP"
    DUMP="$UNCOMP"
fi

echo "→ Drop + recreate schema..."
docker exec sdp-postgres-prod psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
    "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "→ Restore..."
docker exec -i sdp-postgres-prod pg_restore \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --no-owner --no-privileges \
    --verbose \
    < "$DUMP"

echo "✓ Restore klaar"
