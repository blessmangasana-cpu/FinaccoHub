#!/bin/bash

# backup.sh - Backup PostgreSQL database

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="${POSTGRES_DB:-RSE}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_backup_${TIMESTAMP}.sql"

echo "📦 Starting database backup..."
echo "Database: $DB_NAME"
echo "Output: $BACKUP_FILE"

# Create backup
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "$BACKUP_FILE"
    echo "✅ Backup completed: ${BACKUP_FILE}.gz"
    
    # Show file size
    du -h "${BACKUP_FILE}.gz"
    
    # Optional: Clean up old backups (keep last 10)
    echo "🧹 Cleaning up old backups (keeping last 10)..."
    ls -t "$BACKUP_DIR"/${DB_NAME}_backup_*.sql.gz | tail -n +11 | xargs -r rm
else
    echo "❌ Backup failed!"
    rm -f "$BACKUP_FILE"
    exit 1
fi
