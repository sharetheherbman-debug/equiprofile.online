import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";

const navLinks = [
  { label: "About", path: "/about" },
  { label: "Features", path: "/features" },
  { label: "Pricing", path: "/pricing" },
  { label: "Contact", path: "/contact" },
];

interface MarketingNavProps {
  /**
   * When true the nav always renders in its "light" state
   * (white background + black text, no scroll-triggered change).
   * Use on Login and Register pages where the form background is dark
   * and we need permanently visible black text.
   */
  alwaysLight?: boolean;
  /**
   * When true the nav is always transparent with white text regardless of
   * scroll position. Use on auth pages (Login/Register/ForgotPassword/Reset)
   * so the dark-themed pages never show a white bar on scroll.
   */
  alwaysDark?: boolean;
}

/**
 * Marketing navigation component for public pages
 *
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Sticky header: transparent + white text at top of page,
 *   white background + black text once scrolled (or always when alwaysLight=true)
 * - Login/Register buttons
 * - Logo on the left
 */
export function MarketingNav({
  alwaysLight = false,
  alwaysDark = false,
}: MarketingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  // showLight = true  → white bg + black/dark text  (scrolled or forced)
  // showLight = false → transparent bg + white text  (top of page, default)
  // alwaysDark overrides everything → always transparent/dark
  const showLight = !alwaysDark && (alwaysLight || isScrolled);

  // Handle scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ${
        showLight
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-[72px]">
        <div className="flex items-center justify-between h-full">
          {/* Logo — wouter v3 Link renders as <a>; no nested <a> needed */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="text-2xl font-bold font-serif">
              <span
                className={
                  showLight
                    ? "bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent"
                    : "text-white"
                }
              >
                EquiProfile
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors ${
                  showLight
                    ? location === link.path
                      ? "text-black font-semibold"
                      : "text-gray-900 hover:text-black"
                    : location === link.path
                      ? "text-white font-semibold"
                      : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  className={
                    showLight
                      ? ""
                      : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                  }
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={
                      showLight
                        ? ""
                        : "text-white hover:bg-white/10 hover:text-white"
                    }
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    className={
                      showLight
                        ? ""
                        : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white border-0"
                    }
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 hover:bg-accent rounded-lg transition-colors ${
              showLight ? "text-black" : "text-white"
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            {...({
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              transition: { duration: 0.2 },
            } as any)}
            className="md:hidden border-t bg-background/95 backdrop-blur-md overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`block py-2 text-base font-medium transition-colors ${
                    location === link.path
                      ? "text-foreground hover:text-foreground/90"
                      : "text-foreground/90 hover:text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 border-t flex flex-col gap-2">
                {isAuthenticated ? (
                  <Link href="/dashboard">
                    <Button
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default MarketingNav;
