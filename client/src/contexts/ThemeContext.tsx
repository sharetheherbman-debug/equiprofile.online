import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to check if current route is a dashboard route
const isDashboardRoute = () => {
  return (
    window.location.pathname.startsWith("/dashboard") ||
    window.location.pathname.startsWith("/horses") ||
    window.location.pathname.startsWith("/health") ||
    window.location.pathname.startsWith("/training")
  );
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Only apply saved theme in dashboard routes
    if (isDashboardRoute()) {
      const saved = localStorage.getItem("equiprofile-theme") as Theme;
      return saved || "light";
    }
    return "light";
  });

  useEffect(() => {
    if (isDashboardRoute()) {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("equiprofile-theme", theme);
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, isDarkMode: theme === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
