#!/usr/bin/env node
/**
 * Production Startup Script
 * Validates environment and starts the server with production settings
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
config();

console.log('🚀 Starting EquiProfile in production mode...\n');

// Verify required environment variables
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_UNLOCK_PASSWORD'
];

const missing = requiredVars.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease configure these in your .env file.\n');
  process.exit(1);
}

// Verify production requirements
if (process.env.NODE_ENV === 'production') {
  // Check for default/insecure values
  const dangerousDefaults = [
    { var: 'JWT_SECRET', badValues: ['your_jwt_secret_here', 'FHnuavgCmZtlXQ2AAxgq+bmpt6D4Iqfl'] },
    { var: 'ADMIN_UNLOCK_PASSWORD', badValues: ['ashmor12@', 'EquiProfile2026!Admin'] }
  ];

  const insecure = dangerousDefaults.filter(({ var: v, badValues }) => 
    badValues.includes(process.env[v] || '')
  );

  if (insecure.length > 0) {
    console.error('❌ SECURITY ERROR: Default values detected in production!\n');
    insecure.forEach(({ var: v }) => {
      console.error(`   ${v} is still set to a default/example value`);
    });
    console.error('\nGenerate secure values:');
    console.error('   JWT_SECRET: openssl rand -base64 32');
    console.error('   ADMIN_UNLOCK_PASSWORD: Use a strong unique password\n');
    process.exit(1);
  }

  // Verify JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌ SECURITY ERROR: JWT_SECRET must be at least 32 characters\n');
    process.exit(1);
  }
}

// Verify build exists
const distPath = resolve(process.cwd(), 'dist/index.js');
if (!existsSync(distPath)) {
  console.error('❌ ERROR: Build not found at dist/index.js');
  console.error('Run: pnpm build\n');
  process.exit(1);
}

// Log configuration status
console.log('✅ Environment validated');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   PORT: ${process.env.PORT || '3000'}`);
console.log(`   Database: ${process.env.DATABASE_URL?.split('@')[1] || 'configured'}`);

// Log feature flags
console.log('\n📦 Features:');
console.log(`   Stripe: ${process.env.ENABLE_STRIPE === 'true' ? '✅ enabled' : '❌ disabled'}`);
console.log(`   Uploads: ${process.env.ENABLE_UPLOADS === 'true' ? '✅ enabled' : '❌ disabled'}`);
console.log(`   OAuth: ${process.env.OAUTH_SERVER_URL ? '✅ configured' : '❌ not configured'}`);
console.log(`   PWA: ${process.env.VITE_PWA_ENABLED === 'true' ? '✅ enabled' : '❌ disabled'}`);

console.log('\n🔧 Starting server...\n');

// Import and start the server
import('./dist/index.js').catch(err => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
