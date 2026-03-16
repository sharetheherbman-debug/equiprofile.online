export const colors = {
  primary: {
    navy: "#1e3a8a",
    royal: "#2563eb",
    sky: "#3b82f6",
  },
  neutral: {
    white: "#ffffff",
    darkGray: "#1f2937",
  },
  semantic: {
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
  dark: {
    background: "#0f172a",
    card: "#1e293b",
    text: "#f1f5f9",
    border: "#334155",
    accent: "#60a5fa",
  },
};

export const animations = {
  transition: {
    default: { duration: 0.3, ease: "easeInOut" },
    slow: { duration: 0.5, ease: "easeInOut" },
    spring: { type: "spring", stiffness: 300, damping: 30 },
  },
  hover: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  },
};

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
};
