# ⚠️ DEPRECATED SCRIPTS - DO NOT USE ⚠️

This archive directory contains **DEPRECATED** deployment scripts that should **NOT** be used for new deployments.

## Why These Are Deprecated

These scripts were part of earlier deployment approaches that used inconsistent paths and configurations:

### `ops-deprecated/` (Formerly `ops/`)

- **Issue**: Used path `/var/equiprofile/app` but documentation was inconsistent
- **Issue**: Created duplicate deployment workflow alongside `deployment/` directory
- **Issue**: Some scripts referenced old paths or had incomplete error handling

### `systemd-deprecated/` (Formerly `deployment/systemd/`)

- **Issue**: Used path `/var/www/equiprofile` (non-canonical)
- **Issue**: Inconsistent with main deployment configuration

## ⚠️ DO NOT USE THESE SCRIPTS

**These archived scripts will NOT work correctly and may cause deployment failures.**

They are preserved here only for:

1. Historical reference
2. Understanding migration path for existing deployments
3. Recovery scenarios for legacy installations

## ✅ CANONICAL DEPLOYMENT PATH

For **ALL** new deployments, use:

```bash
# Ubuntu 24.04 Fresh Install
sudo bash deployment/ubuntu24/install.sh

# Or use the simple deploy script
sudo bash deployment/deploy.sh
```

### Canonical Settings

- **App root**: `/var/equiprofile/app`
- **Logs**: `/var/log/equiprofile`
- **Node listens on**: `127.0.0.1:3000`
- **Systemd service name**: `equiprofile`
- **Systemd service file**: `deployment/equiprofile.service`
- **Nginx config**: `deployment/nginx/equiprofile.conf`
- **Build outputs**:
  - Frontend: `dist/public`
  - Server bundle: `dist/index.js`

## Documentation

Follow the official guides:

- **DEPLOYMENT.md** - Complete production deployment guide
- **QUICK_START.md** - Quick start for fresh installations
- **README.md** - General overview and setup

## Migration from Legacy Paths

If you have an existing deployment using old paths:

### From `/var/www/equiprofile` to `/var/equiprofile/app`

```bash
# 1. Stop the service
sudo systemctl stop equiprofile

# 2. Create new directory
sudo mkdir -p /var/equiprofile/app

# 3. Move files
sudo rsync -av /var/www/equiprofile/ /var/equiprofile/app/

# 4. Update systemd service
sudo cp /var/equiprofile/app/deployment/equiprofile.service /etc/systemd/system/
sudo systemctl daemon-reload

# 5. Start service
sudo systemctl start equiprofile
```

## Questions?

If you need help with migration or have questions about the canonical deployment:

1. Review **DEPLOYMENT.md**
2. Check the troubleshooting section
3. Open an issue on GitHub with [DEPLOYMENT] tag
