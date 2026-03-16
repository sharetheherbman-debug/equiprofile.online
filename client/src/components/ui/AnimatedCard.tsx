import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * AnimatedCard component with fade-in and hover animations
 *
 * Note: Using 'as any' type assertions for framer-motion props is a workaround
 * for React 19 type compatibility issues with framer-motion 12.x. This is a
 * known limitation and will be resolved when framer-motion releases full React 19 support.
 * The props work correctly at runtime despite the TypeScript warnings.
 */
export function AnimatedCard({
  children,
  className = "",
  delay = 0,
}: AnimatedCardProps) {
  return (
    <motion.div
      {...({
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay },
        whileHover: { scale: 1.02, y: -5 },
      } as any)}
      className={`backdrop-blur-lg bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}
