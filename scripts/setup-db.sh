#!/bin/bash
# ==========================================
# Database Setup Script for EquiProfile
# ==========================================
# This script creates the database and user for EquiProfile.
# It can be run manually or as part of automated deployment.
#
# Usage: ./scripts/setup-db.sh
#
# Environment variables (optional, defaults to .env values):
# - DB_HOST: Database host (default: localhost)
# - DB_PORT: Database port (default: 3306)
# - DB_ROOT_USER: Root user (default: root)
# - DB_ROOT_PASSWORD: Root password (prompt if not set)
# - DB_NAME: Database name (default: equiprofile)
# - DB_USER: Application user (default: equiprofile)
# - DB_PASSWORD: Application password (prompt if not set)

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
  echo -e "${GREEN}✅ $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
}

echo "==========================================="
echo "  EquiProfile Database Setup"
echo "==========================================="
echo ""

# Load environment variables from .env or .env.default
if [ -f ".env" ]; then
  source .env
elif [ -f ".env.default" ]; then
  source .env.default
fi

# Check if DATABASE_URL is set and points to SQLite
if [ -n "$DATABASE_URL" ] && [[ "$DATABASE_URL" == sqlite:* ]]; then
  info "DATABASE_URL points to SQLite, skipping MySQL setup"
  
  # Extract SQLite file path
  SQLITE_PATH="${DATABASE_URL#sqlite:}"
  
  # Create directory if needed
  SQLITE_DIR=$(dirname "$SQLITE_PATH")
  if [ ! -d "$SQLITE_DIR" ]; then
    info "Creating SQLite data directory: $SQLITE_DIR"
    mkdir -p "$SQLITE_DIR"
  fi
  
  success "SQLite setup complete. Database will be created automatically on first run."
  exit 0
fi

# Default values
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_ROOT_USER="${DB_ROOT_USER:-root}"
DB_NAME="${DB_NAME:-equiprofile}"
DB_USER="${DB_USER:-equiprofile}"

# Parse DATABASE_URL if available
if [ -n "$DATABASE_URL" ]; then
  # Extract credentials from DATABASE_URL
  # Format: mysql://user:password@host:port/database or mysql://user:password@host/database
  if [[ "$DATABASE_URL" =~ mysql://([^:]+):([^@]+)@([^:/?]+)(:([0-9]+))?/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[5]:-3306}"  # Default to 3306 if not specified
    DB_NAME="${BASH_REMATCH[6]}"
    info "Parsed DATABASE_URL: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
  fi
fi

# Prompt for root password if not set
if [ -z "$DB_ROOT_PASSWORD" ]; then
  read -sp "Enter MySQL root password: " DB_ROOT_PASSWORD
  echo ""
fi

# Prompt for app user password if not set
if [ -z "$DB_PASSWORD" ]; then
  read -sp "Enter password for database user '$DB_USER': " DB_PASSWORD
  echo ""
  read -sp "Confirm password: " DB_PASSWORD_CONFIRM
  echo ""
  
  if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    error "Passwords do not match!"
    exit 1
  fi
fi

# Test MySQL connection
info "Testing MySQL connection..."
if ! mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
  error "Failed to connect to MySQL server at $DB_HOST:$DB_PORT"
  error "Please check your credentials and ensure MySQL is running."
  exit 1
fi
success "Connected to MySQL server"

# Create database
info "Creating database '$DB_NAME'..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF
success "Database '$DB_NAME' created"

# Create user and grant privileges
info "Creating user '$DB_USER' and granting privileges..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_ROOT_USER" -p"$DB_ROOT_PASSWORD" <<EOF
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;
EOF
success "User '$DB_USER' created with full privileges on '$DB_NAME'"

# Test connection with new user
info "Testing connection with application user..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -D "$DB_NAME" -e "SELECT 1;" >/dev/null 2>&1; then
  success "Application user can connect successfully"
else
  warn "Could not verify application user connection"
fi

echo ""
echo "==========================================="
echo "  Database Setup Complete!"
echo "==========================================="
echo ""
success "Database and user configured successfully"
echo ""
echo "Connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""
echo "Update your .env file with:"
echo "  DATABASE_URL=mysql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "Next steps:"
echo "  1. Update .env with the DATABASE_URL above"
echo "  2. Run: pnpm db:push (to create tables)"
echo "  3. Run: pnpm build (to build the application)"
echo "  4. Run: pnpm start (to start the server)"
echo ""
