import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables with fallback to .env.default in non-production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  // In development/test, load .env first, then fallback to .env.default
  config(); // Load .env if exists
  
  // If .env doesn't exist or variables are missing, try .env.default
  const envDefaultPath = resolve(process.cwd(), '.env.default');
  if (existsSync(envDefaultPath)) {
    config({ path: envDefaultPath, override: false }); // Don't override existing vars
  }
} else {
  // In production, only load .env (no fallback)
  config();
}

// Feature flags (default to false for plug-and-play deployment)
const enableStripe = process.env.ENABLE_STRIPE === 'true';
const enableUploads = process.env.ENABLE_UPLOADS === 'true';

// Startup validation helper
function validateEnvironment() {
  
  // Core required vars (always needed)
  const coreRequiredVars = [
    { name: 'DATABASE_URL', description: 'Database connection string' },
    { name: 'JWT_SECRET', description: 'JWT secret for token signing' },
    { name: 'ADMIN_UNLOCK_PASSWORD', description: 'Admin unlock password' },
  ];
  
  const missing: Array<{ name: string; description: string }> = [];
  
  // Check core required variables
  coreRequiredVars.forEach(v => {
    if (!process.env[v.name]) {
      missing.push(v);
    }
  });
  
  // Conditionally require Stripe vars if enabled
  if (enableStripe) {
    const stripeVars = [
      { name: 'STRIPE_SECRET_KEY', description: 'Stripe secret key' },
      { name: 'STRIPE_WEBHOOK_SECRET', description: 'Stripe webhook secret' },
    ];
    stripeVars.forEach(v => {
      if (!process.env[v.name]) {
        missing.push(v);
      }
    });
  }
  
  // Conditionally require upload/storage vars if enabled
  if (enableUploads) {
    const uploadVars = [
      { name: 'BUILT_IN_FORGE_API_URL', description: 'Forge API URL' },
      { name: 'BUILT_IN_FORGE_API_KEY', description: 'Forge API key' },
    ];
    uploadVars.forEach(v => {
      if (!process.env[v.name]) {
        missing.push(v);
      }
    });
  }
  
  // Report missing variables and exit if any
  if (missing.length > 0) {
    console.error('❌ STARTUP ERROR: Missing required environment variables\n');
    console.error('The following required environment variables are not set:\n');
    missing.forEach(v => {
      console.error(`  • ${v.name} - ${v.description}`);
    });
    console.error('\nFeature flags:');
    console.error(`  • ENABLE_STRIPE=${enableStripe}`);
    console.error(`  • ENABLE_UPLOADS=${enableUploads}`);
    console.error('\nPlease configure all required environment variables in your .env file.');
    console.error('See .env.example for a complete list of available options.\n');
    process.exit(1);
  }
  
  // Validate no hardcoded fallbacks in production
  if (isProduction && (process.env.ADMIN_UNLOCK_PASSWORD === 'ashmor12@' || process.env.ADMIN_UNLOCK_PASSWORD === 'EquiProfile2026!Admin')) {
    console.error('❌ PRODUCTION ERROR: ADMIN_UNLOCK_PASSWORD is still set to default value!');
    console.error('You MUST change this to a secure password before running in production.');
    console.error('Generate a secure password and update your .env file.\n');
    process.exit(1);
  }
  
  // Log OAuth configuration status
  if (process.env.OAUTH_SERVER_URL) {
    if (!process.env.VITE_APP_ID) {
      console.warn('⚠️  WARNING: OAUTH_SERVER_URL is set but VITE_APP_ID is missing.');
      console.warn('   OAuth login will not work correctly without an app ID.\n');
    } else {
      console.log('✅ OAuth configured:', process.env.OAUTH_SERVER_URL);
    }
  } else {
    console.log('ℹ️  OAuth not configured - using email/password authentication only');
  }
  
  // Log feature status
  console.log('ℹ️  Feature flags:');
  console.log(`   • Stripe billing: ${enableStripe ? '✅ enabled' : '❌ disabled'}`);
  console.log(`   • Document uploads: ${enableUploads ? '✅ enabled' : '❌ disabled'}`);
  
  // Validate JWT secret length in production
  if (isProduction && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.error('❌ PRODUCTION ERROR: JWT_SECRET must be at least 32 characters long!');
    console.error('Generate a secure secret with: openssl rand -base64 32\n');
    process.exit(1);
  }
}

// Run validation
validateEnvironment();

export const ENV = {
  // Feature flags
  enableStripe,
  enableUploads,
  
  // App config
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Admin unlock
  adminUnlockPassword: process.env.ADMIN_UNLOCK_PASSWORD ?? "ashmor12@",
  
  // Security
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
  cookieDomain: process.env.COOKIE_DOMAIN ?? undefined,
  cookieSecure: process.env.COOKIE_SECURE === "true",
  
  // Stripe (only used if enableStripe is true)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  
  // AWS S3 (legacy - kept for backward compatibility)
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "eu-west-2",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
};
