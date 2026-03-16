import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

/**
 * Page transition wrapper component
 *
 * Provides smooth fade + slide up animations when pages load
 * Use this to wrap page components for consistent transitions
 */
export function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div
      {...({
        variants: pageVariants,
        initial: "initial",
        animate: "animate",
        exit: "exit",
        transition: { duration: 0.3, ease: "easeOut" },
      } as any)}
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
        {...({
          variants: pageVariants,
          initial: "initial",
          animate: "animate",
          exit: "exit",
          transition: { duration: 0.3, ease: "easeOut" },
        } as any)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;
