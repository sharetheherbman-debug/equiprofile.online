#!/bin/bash
#=============================================================================
# EquiProfile One-Click Deployment to Webdock VPS
#=============================================================================
# This script prepares and deploys EquiProfile to a Webdock VPS with all
# necessary configurations for production use.
#
# Prerequisites on VPS:
# - Node.js 18+ installed
# - MySQL/MariaDB installed and running
# - Nginx installed
# - PM2 installed globally (npm install -g pm2)
#
# Usage: bash scripts/deploy-webdock.sh
#=============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "================================================================="
echo "  EquiProfile - Webdock VPS Deployment"
echo "================================================================="
echo ""

# Step 1: Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}[1/8]${NC} Checking prerequisites..."
echo "-----------------------------------"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Install with: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi
NODE_VERSION=$(node -v | sed 's/v//')
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION installed"

# Check npm/pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} pnpm not found, installing..."
    npm install -g pnpm
fi
echo -e "${GREEN}✓${NC} pnpm installed"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} MySQL client not found"
    echo "  If MySQL is not installed, run: sudo apt-get install -y mysql-server"
fi

# Check Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Nginx not found"
    echo "  Install with: sudo apt-get install -y nginx"
fi

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} PM2 not found, installing..."
    npm install -g pm2
fi
echo -e "${GREEN}✓${NC} PM2 installed"

echo ""
echo -e "${BLUE}[2/8]${NC} Installing dependencies..."
echo "-----------------------------------"
pnpm install --frozen-lockfile
echo -e "${GREEN}✓${NC} Dependencies installed"

echo ""
echo -e "${BLUE}[3/8]${NC} Building application..."
echo "-----------------------------------"
NODE_OPTIONS='--max_old_space_size=2048' pnpm run build
echo -e "${GREEN}✓${NC} Build completed"

echo ""
echo -e "${BLUE}[4/8]${NC} Checking environment configuration..."
echo "-----------------------------------"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} .env file not found"
    echo "Creating .env from template..."
    
    cat > .env << 'EOF'
# EquiProfile Production Environment Configuration
# Generated for Webdock VPS Deployment

# ====================
# Core Configuration
# ====================
NODE_ENV=production
PORT=3000
HOST=127.0.0.1

# Base URL - CHANGE THIS to your domain
BASE_URL=https://equiprofile.online

# ====================
# Database
# ====================
# Format: mysql://username:password@host:port/database
# CHANGE THIS to your actual MySQL credentials
DATABASE_URL=mysql://equiprofile:CHANGE_PASSWORD_HERE@localhost:3306/equiprofile

# ====================
# Security
# ====================
# Generate with: openssl rand -base64 32
# CRITICAL: Generate a new secure secret!
JWT_SECRET=GENERATE_NEW_SECRET_HERE

# CRITICAL: Change this from default!
# Use a strong password
ADMIN_UNLOCK_PASSWORD=CHANGE_THIS_NOW

# ====================
# Feature Flags
# ====================
# Stripe billing (disabled by default - enable when ready)
ENABLE_STRIPE=false

# File uploads (disabled by default - enable when ready)
ENABLE_UPLOADS=false

# ====================
# Optional Features
# ====================
# OpenAI API for AI features (optional)
OPENAI_API_KEY=

# SMTP for email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=support@equiprofile.online

# Stripe (configure when ENABLE_STRIPE=true)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_MONTHLY_PRICE_ID=
STRIPE_YEARLY_PRICE_ID=

# OAuth (optional)
OWNER_OPEN_ID=
EOF

    echo -e "${GREEN}✓${NC} Created .env file"
    echo ""
    echo -e "${RED}IMPORTANT: You MUST edit .env and set:${NC}"
    echo "  1. DATABASE_URL (your MySQL connection string)"
    echo "  2. JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "  3. ADMIN_UNLOCK_PASSWORD (use a strong password)"
    echo "  4. BASE_URL (your domain name)"
    echo ""
    echo -e "${YELLOW}Press Enter after editing .env to continue, or Ctrl+C to exit${NC}"
    read
fi

# Run preflight check
echo ""
echo "Running environment validation..."
if bash scripts/preflight.sh; then
    echo -e "${GREEN}✓${NC} Environment validation passed"
else
    echo -e "${RED}✗${NC} Environment validation failed"
    echo "Please fix the errors above and run this script again"
    exit 1
fi

echo ""
echo -e "${BLUE}[5/8]${NC} Setting up database..."
echo "-----------------------------------"
echo "Database setup options:"
echo "1. Run database migrations now (recommended)"
echo "2. Skip and do manually later"
echo ""
read -p "Enter choice (1 or 2): " db_choice

if [ "$db_choice" = "1" ]; then
    if pnpm run db:push; then
        echo -e "${GREEN}✓${NC} Database migrations completed"
    else
        echo -e "${YELLOW}⚠${NC} Database migrations failed"
        echo "You can run them manually later with: pnpm run db:push"
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping database setup"
    echo "Remember to run: pnpm run db:push before starting the app"
fi

echo ""
echo -e "${BLUE}[6/8]${NC} Configuring PM2..."
echo "-----------------------------------"

# Create or update PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'equiprofile',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '127.0.0.1'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF

echo -e "${GREEN}✓${NC} PM2 configuration created"

echo ""
echo -e "${BLUE}[7/8]${NC} Creating Nginx configuration..."
echo "-----------------------------------"

mkdir -p deployment/nginx

cat > deployment/nginx/equiprofile.conf << 'EOF'
# EquiProfile Nginx Configuration
# For Webdock VPS Deployment

upstream equiprofile_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    
    # CHANGE THIS to your actual domain
    server_name equiprofile.online www.equiprofile.online;
    
    # Redirect to HTTPS (after SSL is configured)
    # Uncomment these lines after running certbot
    # return 301 https://$server_name$request_uri;
    
    # Client upload size limit
    client_max_body_size 50M;
    
    # Logging
    access_log /var/log/nginx/equiprofile-access.log;
    error_log /var/log/nginx/equiprofile-error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://equiprofile_backend;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
    }
    
    # Static assets with caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        proxy_pass http://equiprofile_backend;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}

# HTTPS configuration (add after SSL certificate is obtained)
# Uncomment after running: sudo certbot --nginx -d equiprofile.online
#
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     
#     server_name equiprofile.online www.equiprofile.online;
#     
#     ssl_certificate /etc/letsencrypt/live/equiprofile.online/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/equiprofile.online/privkey.pem;
#     
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#     
#     # ... rest of configuration same as above ...
# }
EOF

echo -e "${GREEN}✓${NC} Nginx configuration created at deployment/nginx/equiprofile.conf"

echo ""
echo -e "${BLUE}[8/8]${NC} Final steps..."
echo "-----------------------------------"

# Create logs directory
mkdir -p logs

echo -e "${GREEN}✓${NC} Logs directory created"

echo ""
echo "================================================================="
echo -e "${GREEN}✅ Deployment Preparation Complete!${NC}"
echo "================================================================="
echo ""
echo "🚀 To start EquiProfile in production:"
echo ""
echo "1. Start with PM2:"
echo "   ${YELLOW}pm2 start ecosystem.config.js${NC}"
echo "   pm2 save"
echo "   pm2 startup  # Follow the instructions"
echo ""
echo "2. Configure Nginx (if not already done):"
echo "   ${YELLOW}sudo cp deployment/nginx/equiprofile.conf /etc/nginx/sites-available/${NC}"
echo "   sudo ln -s /etc/nginx/sites-available/equiprofile.conf /etc/nginx/sites-enabled/"
echo "   # Edit the file and change 'equiprofile.online' to your domain"
echo "   sudo nginx -t"
echo "   sudo systemctl reload nginx"
echo ""
echo "3. Setup SSL with Let's Encrypt:"
echo "   ${YELLOW}sudo apt-get install -y certbot python3-certbot-nginx${NC}"
echo "   sudo certbot --nginx -d your-domain.com"
echo ""
echo "4. Check application status:"
echo "   ${YELLOW}pm2 status${NC}"
echo "   pm2 logs equiprofile"
echo ""
echo "5. Monitor and manage:"
echo "   pm2 monit          # Real-time monitoring"
echo "   pm2 restart all    # Restart application"
echo "   pm2 stop all       # Stop application"
echo ""
echo "📋 Health check URL: http://localhost:3000/health"
echo ""
echo -e "${YELLOW}⚠  IMPORTANT SECURITY REMINDERS:${NC}"
echo "   • Change ADMIN_UNLOCK_PASSWORD in .env"
echo "   • Generate new JWT_SECRET"
echo "   • Configure your MySQL database"
echo "   • Update BASE_URL in .env"
echo "   • Setup firewall (ufw allow 80, ufw allow 443, ufw allow 22)"
echo ""
echo "For troubleshooting, check logs:"
echo "   tail -f logs/pm2-out.log"
echo "   tail -f logs/pm2-error.log"
echo ""
echo -e "${GREEN}Ready to deploy! 🎉${NC}"
echo ""
