import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  stableOnly?: boolean;
}

/**
 * Protected route wrapper
 *
 * Ensures user is authenticated before rendering children.
 * Redirects to login if not authenticated.
 * Optionally can require admin role or stable plan.
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
  stableOnly = false,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const isStablePlan = (() => {
    if (!user?.preferences) return false;
    try {
      const prefs = JSON.parse(user.preferences);
      return prefs.planTier === "stable";
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // Redirect to login. If OAuth is configured use the OAuth URL,
      // otherwise fall back to the built-in /login route so we never
      // produce an invalid URL (which causes a 404).
      const oauthUrl = getLoginUrl();
      const baseUrl = oauthUrl || "/login";
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      const loginUrl = oauthUrl
        ? `${oauthUrl}&returnUrl=${returnUrl}`
        : `/login?returnUrl=${returnUrl}`;
      window.location.href = loginUrl;
      return;
    }

    if (requireAdmin && user?.role !== "admin") {
      // Redirect to dashboard if user is not admin
      setLocation("/dashboard");
    }

    if (stableOnly && !isStablePlan) {
      toast.error("This feature requires the Stable plan. Upgrade to access.");
      setLocation("/billing");
    }
  }, [
    loading,
    isAuthenticated,
    requireAdmin,
    stableOnly,
    isStablePlan,
    user,
    setLocation,
  ]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render until authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Don't render if admin required but user is not admin
  if (requireAdmin && user?.role !== "admin") {
    return null;
  }

  // Don't render if stable plan required but user is not on stable plan
  if (stableOnly && !isStablePlan) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Stable plan route - requires Stable subscription tier.
 * Redirects to /billing with toast if user is on a lower plan.
 */
export function StableRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute stableOnly>{children}</ProtectedRoute>;
}

export default ProtectedRoute;
