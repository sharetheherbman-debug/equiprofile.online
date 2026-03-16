/**
 * Runtime environment validation
 *
 * This module ensures that environment variables are properly configured
 * and provides safe defaults for production deployments.
 */

/**
 * Get an environment variable with validation
 * @param key The environment variable key
 * @param required Whether this variable is required
 * @returns The environment variable value or empty string
 */
const getEnvVar = (key: string, required = false): string => {
  const value = import.meta.env[key];

  // Check if value is undefined, null, or an unresolved placeholder
  if (!value || value.startsWith("%VITE_")) {
    if (required) {
      console.error(`Missing required environment variable: ${key}`);
    }
    return "";
  }

  return value;
};

/**
 * Application environment configuration
 *
 * All environment variables are accessed through this object to ensure
 * consistent validation and fallback behavior.
 */
export const ENV = {
  // API Configuration
  API_BASE_URL:
    getEnvVar("VITE_API_BASE_URL") || `${window.location.origin}/api`,

  // OAuth Configuration (for external auth systems)
  OAUTH_PORTAL_URL: getEnvVar("VITE_OAUTH_PORTAL_URL"),
  APP_ID: getEnvVar("VITE_APP_ID"),

  // Stripe Configuration
  STRIPE_PUBLISHABLE_KEY: getEnvVar("VITE_STRIPE_PUBLISHABLE_KEY"),

  // Analytics (Optional)
  ANALYTICS_ENDPOINT: getEnvVar("VITE_ANALYTICS_ENDPOINT"),
  ANALYTICS_WEBSITE_ID: getEnvVar("VITE_ANALYTICS_WEBSITE_ID"),

  // Environment
  ENV: getEnvVar("VITE_ENV") || "production",

  // Computed values
  IS_PRODUCTION: (getEnvVar("VITE_ENV") || "production") === "production",
  IS_DEVELOPMENT: (getEnvVar("VITE_ENV") || "production") === "development",
} as const;

// Log configuration status in development
if (ENV.IS_DEVELOPMENT) {
  console.log("Environment configuration:", {
    API_BASE_URL: ENV.API_BASE_URL,
    ENV: ENV.ENV,
    HAS_OAUTH: Boolean(ENV.OAUTH_PORTAL_URL && ENV.APP_ID),
    HAS_ANALYTICS: Boolean(ENV.ANALYTICS_ENDPOINT && ENV.ANALYTICS_WEBSITE_ID),
    HAS_STRIPE: Boolean(ENV.STRIPE_PUBLISHABLE_KEY),
  });
}

export default ENV;
