#!/bin/bash
# Production startup script that loads .env before starting the server
# This ensures environment variables are available even when PM2 doesn't load them

set -e

# Change to project root
cd "$(dirname "$0")/.."

# Load .env file if it exists
if [ -f .env ]; then
  echo "Loading environment from .env file..."
  # Export variables from .env, ignoring comments and empty lines
  export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
  echo "✅ Environment variables loaded"
else
  echo "⚠️  Warning: .env file not found"
  echo "   The app will use system environment variables only"
fi

# Start the application
echo "Starting EquiProfile..."
exec node dist/index.js
