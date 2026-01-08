# Nginx Configuration Archive

This directory contains old/deprecated Nginx configurations that have been replaced by the canonical configurations.

## Current Configurations (Use These)

- `../equiprofile.conf` - **RECOMMENDED**: Proxy-all approach (simplest, most reliable)
- `../equiprofile-static.conf` - Alternative with Nginx serving static files

## Archived Configurations (Do Not Use)

These files are kept for reference but should not be used for new deployments:

- `nginx-equiprofile.conf` - Old configuration (replaced by equiprofile.conf)
- `nginx-webdock.conf` - Old webdock-specific configuration (replaced by equiprofile.conf)

## Migration Guide

If you're currently using an archived configuration:

1. Review the new canonical configuration at `../equiprofile.conf`
2. Update your domain name in the new configuration
3. Test the new configuration: `sudo nginx -t`
4. Replace the old configuration
5. Reload nginx: `sudo systemctl reload nginx`
