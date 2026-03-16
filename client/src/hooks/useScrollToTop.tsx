import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Hook that scrolls to the top of the page whenever the route changes
 * This ensures users start at the top of each new page
 */
export function useScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top instantly on route change
    // Use try-catch for browsers that don't support ScrollToOptions
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant" as ScrollBehavior,
      });
    } catch {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [location]);
}
