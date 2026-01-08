#!/bin/bash
# ==========================================
# EquiProfile Deployment Orchestrator
# ==========================================
# One-command deployment script that orchestrates:
# 1. Dependency installation
# 2. Production build
# 3. Deployment instructions
#
# Usage: bash scripts/deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "=========================================="
echo "EquiProfile Deployment Orchestrator"
echo "=========================================="
echo ""
echo "Project root: $PROJECT_ROOT"
echo ""

# Step 1: Install dependencies
echo "Step 1/2: Installing dependencies..."
echo "=========================================="
echo ""
bash "$SCRIPT_DIR/install.sh"

# Step 2: Build application
echo ""
echo "Step 2/2: Building application..."
echo "=========================================="
echo ""
bash "$SCRIPT_DIR/build.sh"

# Deployment instructions
echo ""
echo "=========================================="
echo "✅ Pre-deployment Complete!"
echo "=========================================="
echo ""
echo "Your application is now built and ready for deployment."
echo ""
echo "📋 Next Steps for Production Deployment:"
echo ""
echo "1. Verify .env configuration:"
echo "   - Copy .env.example to .env if not already done"
echo "   - Set NODE_ENV=production"
echo "   - Configure DATABASE_URL"
echo "   - Set JWT_SECRET (generate with: openssl rand -base64 32)"
echo "   - Set ADMIN_UNLOCK_PASSWORD"
echo "   - Configure optional services (Stripe, OAuth, S3, etc.)"
echo ""
echo "2. For local testing:"
echo "   NODE_ENV=production node dist/index.js"
echo "   # Or use: pnpm start"
echo ""
echo "3. For production server deployment:"
echo "   a) Using systemd service:"
echo "      - Copy deployment/systemd/equiprofile.service to /etc/systemd/system/"
echo "      - Run: sudo systemctl daemon-reload"
echo "      - Run: sudo systemctl start equiprofile"
echo "      - Run: sudo systemctl enable equiprofile"
echo ""
echo "   b) Using PM2:"
echo "      - Install PM2: npm install -g pm2"
echo "      - Run: pm2 start ecosystem.config.js"
echo "      - Run: pm2 save"
echo "      - Run: pm2 startup (follow instructions)"
echo ""
echo "4. Configure Nginx:"
echo "   - Edit deployment/nginx/equiprofile.conf"
echo "   - Replace YOUR_DOMAIN_HERE with your actual domain"
echo "   - Copy to /etc/nginx/sites-available/equiprofile"
echo "   - Create symlink: sudo ln -s /etc/nginx/sites-available/equiprofile /etc/nginx/sites-enabled/"
echo "   - Test: sudo nginx -t"
echo "   - Reload: sudo systemctl reload nginx"
echo ""
echo "5. Setup SSL with Let's Encrypt:"
echo "   sudo certbot --nginx -d YOUR_DOMAIN_HERE"
echo ""
echo "📚 For more details, see README.md"
echo ""
