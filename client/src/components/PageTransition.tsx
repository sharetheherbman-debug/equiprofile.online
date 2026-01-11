import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Page transition wrapper component
 * 
 * Provides smooth fade + slide up animations when pages load
 * Use this to wrap page components for consistent transitions
 * Also scrolls to top when component mounts (respects reduced motion)
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  // Scroll to top when component mounts
  useEffect(() => {
    // Use instant scroll for page navigation to avoid jarring experience
    // when users click navigation links (smooth scroll is for same-page anchors)
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated presence wrapper for route transitions
 */
interface AnimatedRouteProps {
  children: ReactNode;
  routeKey?: string;
}

export function AnimatedRoute({ children, routeKey }: AnimatedRouteProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;
