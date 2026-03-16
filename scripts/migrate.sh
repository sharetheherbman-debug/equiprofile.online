#!/bin/bash
# ==========================================
# EquiProfile Production Migration Script
# ==========================================
# Idempotent DB migration strategy:
#   - New DB:   applies all pending drizzle migrations cleanly.
#   - Existing DB (tables present, drizzle tracking table missing/incomplete):
#       "baseline" mode: creates the __drizzle_migrations table and marks all
#       already-applied migration files as done WITHOUT re-running their SQL.
#       Then applies any genuinely new migrations on top.
#
# NEVER drops production tables automatically.
#
# Usage: bash scripts/migrate.sh
# Requires: DATABASE_URL set in environment (or .env file loaded by caller)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "=========================================="
echo " EquiProfile DB Migration"
echo "=========================================="

# ---------------------------------------------------------------------------
# Load .env if DATABASE_URL is not already set
# ---------------------------------------------------------------------------
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f "$PROJECT_ROOT/.env" ]; then
    echo "ℹ️  Loading DATABASE_URL from .env"
    # Export only DATABASE_URL to avoid clobbering existing env
    DATABASE_URL="$(grep -E '^DATABASE_URL=' "$PROJECT_ROOT/.env" | head -1 | cut -d= -f2-)"
    export DATABASE_URL
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set. Aborting migration."
  exit 1
fi

echo "ℹ️  DATABASE_URL configured."

# ---------------------------------------------------------------------------
# Step 1 – Detect if drizzle migration-tracking table exists
# ---------------------------------------------------------------------------
echo ""
echo "Step 1/3: Checking drizzle migration tracking table..."

TRACKING_EXISTS=$(node --input-type=module << 'JSEOF'
import { createConnection } from 'mysql2/promise';

async function main() {
  const conn = await createConnection(process.env.DATABASE_URL);
  try {
    // Extract DB name from URL (mysql://user:pass@host/dbname?params)
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.replace(/^\//, '');
    const [rows] = await conn.execute(
      'SELECT COUNT(*) AS cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
      [dbName, '__drizzle_migrations']
    );
    process.stdout.write(String(rows[0].cnt));
  } finally {
    await conn.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
JSEOF
)

echo "   __drizzle_migrations table exists: $TRACKING_EXISTS"

# ---------------------------------------------------------------------------
# Step 2 – Baseline: if tracking table is missing but schema tables exist,
#           seed the tracking table so drizzle won't re-run old migrations.
# ---------------------------------------------------------------------------
if [ "$TRACKING_EXISTS" = "0" ]; then
  echo ""
  echo "Step 2/3: Tracking table absent – checking for existing schema tables..."

  SCHEMA_EXISTS=$(node --input-type=module << 'JSEOF'
import { createConnection } from 'mysql2/promise';

async function main() {
  const conn = await createConnection(process.env.DATABASE_URL);
  try {
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.replace(/^\//, '');
    const [rows] = await conn.execute(
      'SELECT COUNT(*) AS cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
      [dbName]
    );
    process.stdout.write(String(rows[0].cnt));
  } finally {
    await conn.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
JSEOF
)

  echo "   Tables found in schema: $SCHEMA_EXISTS"

  if [ "$SCHEMA_EXISTS" -gt "0" ]; then
    echo ""
    echo "   🔵 BASELINE MODE: Existing DB detected (no drizzle tracking table)."
    echo "   Creating __drizzle_migrations and marking all existing migrations"
    echo "   as already applied – no DDL will be re-executed."
    echo ""

    node --input-type=module << 'JSEOF'
import { createConnection } from 'mysql2/promise';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

async function main() {
  const conn = await createConnection(process.env.DATABASE_URL);
  try {
    // Create tracking table (drizzle schema)
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        hash         TEXT NOT NULL,
        created_at   BIGINT
      )
    `);
    console.log('   ✓ __drizzle_migrations table created');

    // Find all migration SQL files
    const drizzleDir = resolve(process.cwd(), 'drizzle');
    const journalPath = join(drizzleDir, 'meta', '_journal.json');
    if (!existsSync(journalPath)) {
      console.log('   ⚠️  No journal found – nothing to baseline.');
      return;
    }

    const { entries } = JSON.parse(readFileSync(journalPath, 'utf-8'));

    // Check which columns already exist so we can decide whether to baseline
    // additive migrations (like 0002) or let them run to fill in gaps.
    const url = new URL(process.env.DATABASE_URL);
    const dbName = url.pathname.replace(/^\//, '');

    // Sentinel: if 'latitude' column is missing, migration 0002 must run.
    const [latRows] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'latitude'",
      [dbName]
    );
    const latitudeExists = Number(latRows[0].cnt) > 0;

    for (const entry of entries) {
      const hash = entry.tag;

      // For migration 0002 (adds missing user columns): only baseline if the
      // columns already exist; otherwise let drizzle run it so gaps are filled.
      if (hash === '0002_add_missing_user_columns' && !latitudeExists) {
        console.log(`   ⚠️  Skipping baseline for ${hash} – missing columns detected, will run migration.`);
        continue;
      }

      const [existing] = await conn.execute(
        'SELECT id FROM `__drizzle_migrations` WHERE hash = ?',
        [hash]
      );
      if (existing.length === 0) {
        await conn.execute(
          'INSERT INTO `__drizzle_migrations` (hash, created_at) VALUES (?, ?)',
          [hash, Date.now()]
        );
        console.log(`   ✓ Baselined migration: ${hash}`);
      } else {
        console.log(`   – Already tracked: ${hash}`);
      }
    }

    console.log('\n   ✅ Baseline complete.');
  } finally {
    await conn.end();
  }
}
main().catch(e => { console.error(e.message); process.exit(1); });
JSEOF

  else
    echo "   🆕 Fresh DB – will apply all migrations normally."
  fi
else
  echo "   Tracking table exists – skipping baseline."
fi

# ---------------------------------------------------------------------------
# Step 3 – Run drizzle-kit migrate (applies only pending migrations)
# ---------------------------------------------------------------------------
echo ""
echo "Step 3/3: Running drizzle-kit migrate..."
echo ""

npx drizzle-kit migrate

echo ""
echo "=========================================="
echo "✅ Migration complete!"
echo "=========================================="
