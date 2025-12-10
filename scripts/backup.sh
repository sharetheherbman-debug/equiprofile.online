#!/bin/bash

# EquiProfile Daily Backup Script
# This script creates daily backups of the database and uploaded files
# Designed for 250+ users with 30-day retention

set -e

# Configuration - Update these values for your environment
BACKUP_DIR="${BACKUP_DIR:-/var/backups/equiprofile}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-equiprofile}"
DB_USER="${DB_USER:-equiprofile}"
DB_PASS="${DB_PASS:-}"
UPLOADS_DIR="${UPLOADS_DIR:-/var/www/equiprofile/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
LOG_FILE="${LOG_FILE:-/var/log/equiprofile-backup.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_DIR=$(date +%Y/%m)

# Create date-based subdirectory
mkdir -p "$BACKUP_DIR/$DATE_DIR"

log "INFO" "Starting EquiProfile backup..."

# Backup database
log "INFO" "Backing up database..."
DB_BACKUP_FILE="$BACKUP_DIR/$DATE_DIR/db_${TIMESTAMP}.sql.gz"

if mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    "$DB_NAME" 2>/dev/null | gzip > "$DB_BACKUP_FILE"; then
    DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
    log "INFO" "${GREEN}Database backup completed: $DB_BACKUP_FILE ($DB_SIZE)${NC}"
else
    log "ERROR" "${RED}Database backup failed!${NC}"
    exit 1
fi

# Backup uploaded files (if directory exists)
if [ -d "$UPLOADS_DIR" ]; then
    log "INFO" "Backing up uploaded files..."
    UPLOADS_BACKUP_FILE="$BACKUP_DIR/$DATE_DIR/uploads_${TIMESTAMP}.tar.gz"
    
    if tar -czf "$UPLOADS_BACKUP_FILE" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")" 2>/dev/null; then
        UPLOADS_SIZE=$(du -h "$UPLOADS_BACKUP_FILE" | cut -f1)
        log "INFO" "${GREEN}Uploads backup completed: $UPLOADS_BACKUP_FILE ($UPLOADS_SIZE)${NC}"
    else
        log "WARN" "${YELLOW}Uploads backup failed or directory empty${NC}"
    fi
else
    log "INFO" "No uploads directory found, skipping..."
fi

# Create backup manifest
MANIFEST_FILE="$BACKUP_DIR/$DATE_DIR/manifest_${TIMESTAMP}.json"
cat > "$MANIFEST_FILE" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "backup_id": "${TIMESTAMP}",
    "database": {
        "file": "$(basename "$DB_BACKUP_FILE")",
        "size": "$(stat -f%z "$DB_BACKUP_FILE" 2>/dev/null || stat -c%s "$DB_BACKUP_FILE")"
    },
    "uploads": {
        "file": "$(basename "$UPLOADS_BACKUP_FILE" 2>/dev/null || echo 'N/A')",
        "size": "$(stat -f%z "$UPLOADS_BACKUP_FILE" 2>/dev/null || stat -c%s "$UPLOADS_BACKUP_FILE" 2>/dev/null || echo '0')"
    },
    "retention_days": ${RETENTION_DAYS}
}
EOF

log "INFO" "Manifest created: $MANIFEST_FILE"

# Remove old backups
log "INFO" "Cleaning up backups older than ${RETENTION_DAYS} days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
log "INFO" "Deleted $DELETED_COUNT old backup files"

# Remove empty directories
find "$BACKUP_DIR" -type d -empty -delete 2>/dev/null || true

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "INFO" "Total backup storage used: $TOTAL_SIZE"

# Summary
log "INFO" "${GREEN}=== Backup Summary ===${NC}"
log "INFO" "Backup ID: $TIMESTAMP"
log "INFO" "Database: $(basename "$DB_BACKUP_FILE")"
log "INFO" "Location: $BACKUP_DIR/$DATE_DIR"
log "INFO" "${GREEN}Backup completed successfully!${NC}"

exit 0
