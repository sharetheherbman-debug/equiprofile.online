import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Protected route wrapper
 * 
 * Ensures user is authenticated before rendering children.
 * Redirects to login if not authenticated.
 * Optionally can require admin role.
 */
export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      const loginUrl = getLoginUrl();
      window.location.href = `${loginUrl}&returnUrl=${returnUrl}`;
      return;
    }

    if (requireAdmin && user?.role !== 'admin') {
      // Redirect to dashboard if user is not admin
      setLocation('/dashboard');
    }
  }, [loading, isAuthenticated, requireAdmin, user, setLocation]);

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
  if (requireAdmin && user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
