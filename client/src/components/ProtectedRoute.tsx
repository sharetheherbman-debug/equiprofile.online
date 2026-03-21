import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { OnboardingWizard } from "./OnboardingWizard";

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
 * Shows the onboarding wizard on first login (unless already completed/skipped).
 * Optionally can require admin role or stable plan.
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
  stableOnly = false,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, error } = useAuth();
  const [, setLocation] = useLocation();
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const onboardingQuery = trpc.user.getOnboardingStatus.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const skipOnboarding = trpc.user.skipOnboarding.useMutation();

  const isStablePlan = (() => {
    if (!user?.preferences) return false;
    try {
      const prefs = JSON.parse(user.preferences);
      return prefs.planTier === "stable";
    } catch {
      return false;
    }
  })();

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingDismissed(true);
    onboardingQuery.refetch();
  }, [onboardingQuery]);

  const handleOnboardingSkip = useCallback(async () => {
    // Fire-and-forget — dismiss immediately, save in background
    setOnboardingDismissed(true);
    skipOnboarding.mutate(undefined, {
      onSettled: () => onboardingQuery.refetch(),
    });
  }, [skipOnboarding, onboardingQuery]);

  useEffect(() => {
    if (loading) return;

    // If there's a network/fetch error but we had a previous user in cache,
    // don't redirect — the user may still have a valid session and just had
    // a momentary network issue. Only redirect if we definitively have no auth.
    if (!isAuthenticated && !error) {
      const oauthUrl = getLoginUrl();
      const returnUrl = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      const loginUrl = oauthUrl
        ? `${oauthUrl}&returnUrl=${returnUrl}`
        : `/login?returnUrl=${returnUrl}`;
      window.location.href = loginUrl;
      return;
    }

    // If there's a network error but no cached user, redirect to login
    if (!isAuthenticated && error) {
      // Check if we have cached user info — if so, don't redirect yet
      const cachedUser = localStorage.getItem("equiprofile-user-info");
      if (!cachedUser) {
        const loginUrl = `/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        window.location.href = loginUrl;
        return;
      }
      // If we have cached user but server returned error, wait for retry
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
    error,
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

  // Show onboarding wizard if not completed and not skipped
  const onboardingData = onboardingQuery.data;
  const showOnboarding =
    !onboardingDismissed &&
    onboardingData != null &&
    !onboardingData.completed &&
    !onboardingData.skipped;

  return (
    <>
      {showOnboarding && (
        <OnboardingWizard
          userName={user?.name || ""}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
      {children}
    </>
  );
}

/**
 * Stable plan route - requires Stable subscription tier.
 * Redirects to /billing with toast if user is on a lower plan.
 */
export function StableRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute stableOnly>{children}</ProtectedRoute>;
}

export default ProtectedRoute;
