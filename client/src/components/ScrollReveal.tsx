import { motion, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  once?: boolean;
}

/**
 * Scroll reveal animation component
 *
 * Animates children when they enter the viewport
 * Uses IntersectionObserver via Framer Motion's useInView
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  once = true,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-100px" });

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
  };

  const variants = {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      {...({
        variants,
        initial: "hidden",
        animate: isInView ? "visible" : "hidden",
        transition: {
          duration: 0.5,
          delay,
          ease: "easeOut",
        },
      } as any)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger children animation
 * Useful for lists or grids of items
 */
interface StaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function Stagger({
  children,
  className = "",
  staggerDelay = 0.1,
}: StaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Create custom variants with the staggerDelay
  const customVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      {...({
        variants: customVariants,
        initial: "hidden",
        animate: isInView ? "visible" : "hidden",
      } as any)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual stagger item
 * Use as children of Stagger component
 */
const staggerItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      {...({
        variants: staggerItemVariants,
        transition: { duration: 0.4, ease: "easeOut" },
      } as any)}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
