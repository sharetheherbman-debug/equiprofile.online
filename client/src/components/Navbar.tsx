/**
 * Universal Navbar Component
 *
 * Single source of truth for the top navigation bar used across the entire platform.
 *
 * - When NOT authenticated: shows public marketing nav (Features, Pricing, About + Login/Register)
 * - When authenticated: shows app nav (Dashboard, Horses, Calendar, ...) + profile dropdown
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const publicNavLinks = [
  { label: "Features", path: "/features" },
  { label: "Students", path: "/students" },
  { label: "Schools", path: "/schools" },
  { label: "Pricing", path: "/pricing" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const appNavLinks = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Horses", path: "/horses" },
  { label: "Calendar", path: "/calendar" },
  { label: "Training", path: "/training" },
  { label: "Health", path: "/health" },
  { label: "Documents", path: "/documents" },
  { label: "Reports", path: "/reports" },
  { label: "Messages", path: "/messages" },
];

const stableNavLinks = [
  { label: "Stable Dashboard", path: "/stable-dashboard" },
  { label: "Stable", path: "/stable" },
  { label: "Staff", path: "/contacts" },
];

interface NavbarProps {
  alwaysDark?: boolean;
  alwaysLight?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Navbar(_props: NavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: subscriptionStatus } = trpc.user.getSubscriptionStatus.useQuery(
    undefined,
    { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 },
  );
  const isStablePlan = subscriptionStatus?.planTier === "stable";

  const showSolid = isAuthenticated || scrolled;
  const navLinks = isAuthenticated ? appNavLinks : publicNavLinks;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showSolid
          ? "bg-white/97 dark:bg-[#111827]/97 backdrop-blur-lg shadow-sm border-b border-gray-200/60 dark:border-gray-700/60"
          : "bg-gradient-to-b from-black/50 to-transparent border-b border-transparent"
      }`}
      style={{ paddingTop: "var(--safe-area-top, 0px)" }}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="EquiProfile"
              className="h-10 w-auto object-contain"
            />
            <span
              className={`text-xl font-bold tracking-tight font-serif ${
                showSolid
                  ? "text-[#1a3a5c] dark:text-white"
                  : "text-white"
              }`}
            >
              EquiProfile
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  showSolid
                    ? location === link.path
                      ? "text-[#2e6da4] bg-blue-50/60 dark:bg-blue-900/20 font-semibold"
                      : "text-gray-600 dark:text-gray-300 hover:text-[#1a3a5c] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    : location === link.path
                      ? "text-white font-semibold bg-white/10"
                      : "text-white/85 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && isStablePlan && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                      showSolid
                        ? "text-gray-600 dark:text-gray-300 hover:text-[#1a3a5c] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                        : "text-white/85 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Stable <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-44">
                  {stableNavLinks.map((link) => (
                    <DropdownMenuItem key={`stable-${link.label}`} asChild>
                      <Link href={link.path} className="cursor-pointer">
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none">
                    <Avatar className="h-8 w-8 ring-2 ring-[#2e6da4]/20">
                      <AvatarFallback className="text-xs font-semibold bg-[#2e6da4]/10 text-[#2e6da4]">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {user?.email || ""}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="cursor-pointer flex items-center gap-2.5"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="cursor-pointer flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/billing"
                      className="cursor-pointer flex items-center gap-2.5"
                    >
                      <CreditCard className="w-4 h-4" /> Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2.5"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      showSolid
                        ? "text-gray-700 hover:text-[#1a3a5c]"
                        : "text-white hover:bg-white/10 hover:text-white"
                    }
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-[#2e6da4] hover:bg-[#245a8a] text-white shadow-sm"
                  >
                    Start Free Trial
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2.5 rounded-lg transition-colors ${
              showSolid
                ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
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
            className="lg:hidden border-t bg-white dark:bg-[#111827] shadow-xl overflow-hidden border-gray-200 dark:border-gray-700"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`block px-3 py-2.5 text-base font-medium rounded-lg transition-colors ${
                    location === link.path
                      ? "text-[#2e6da4] bg-blue-50/60 dark:bg-blue-900/20 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:text-[#1a3a5c] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && isStablePlan && (
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1 px-3 font-semibold">
                    Stable
                  </p>
                  {stableNavLinks.map((link) => (
                    <Link
                      key={`mobile-stable-${link.label}`}
                      href={link.path}
                      className="block px-3 py-2.5 text-base font-medium text-gray-700 hover:text-[#1a3a5c] hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
              <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <Avatar className="h-9 w-9 ring-2 ring-[#2e6da4]/20">
                        <AvatarFallback className="text-xs font-semibold bg-[#2e6da4]/10 text-[#2e6da4]">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button
                        className="w-full bg-[#2e6da4] hover:bg-[#245a8a] text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Start Free Trial
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

export default Navbar;
