export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Returns empty string if OAuth is not configured (prevents crashes)
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Return empty string if OAuth is not configured
  if (!oauthPortalUrl || !appId) {
    console.warn("OAuth not configured: VITE_OAUTH_PORTAL_URL or VITE_APP_ID missing");
    return "";
  }

  try {
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);

    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error("Failed to generate OAuth login URL:", error);
    return "";
  }
};

// Check if OAuth is available
export const isOAuthAvailable = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  return !!(oauthPortalUrl && appId);
};
