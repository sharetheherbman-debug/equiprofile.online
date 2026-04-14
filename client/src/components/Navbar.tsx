/**
 * Universal Navbar Component
 *
 * Single source of truth for the top navigation bar used across the entire platform.
 *
 * - When NOT authenticated: shows public marketing nav (Features, Pricing, About + Login/Register)
 * - When authenticated: shows app nav (Dashboard, Horses, Calendar, ...) + profile dropdown
 *
 * Usage:
 *   import Navbar from "@/components/Navbar";
 *   <Navbar />
 */
import { useState } from "react";
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
  User,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

// Public nav links (for unauthenticated users)
const publicNavLinks = [
  { label: "About", path: "/about" },
  { label: "Features", path: "/features" },
  { label: "Students", path: "/students" },
  { label: "Schools", path: "/schools" },
  { label: "Pricing", path: "/pricing" },
  { label: "Contact", path: "/contact" },
];

// App nav links (for authenticated users)
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

// Stable plan additional navigation links
const stableNavLinks = [
  { label: "Stable Dashboard", path: "/stable-dashboard" },
  { label: "Stable", path: "/stable" },
  { label: "Staff", path: "/contacts" },
  { label: "Owners", path: "/contacts" },
];

// Props are kept for backward compatibility but no longer affect rendering.
// The navbar always uses a permanent background.
interface NavbarProps {
  alwaysDark?: boolean;
  alwaysLight?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Navbar(_props: NavbarProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  // Check subscription for stable plan items
  const { data: subscriptionStatus } = trpc.user.getSubscriptionStatus.useQuery(
    undefined,
    { enabled: isAuthenticated, staleTime: 5 * 60 * 1000 },
  );
  const isStablePlan = subscriptionStatus?.planTier === "stable";

  // Navbar always shows the light (white) background — no scroll-activation.
  const showLight = true;

  const navLinks = isAuthenticated ? appNavLinks : publicNavLinks;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showLight
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200"
          : "bg-transparent"
      }`}
      style={{ paddingTop: 'var(--safe-area-top, 0px)' }}
    >
      <div className="container mx-auto px-4 h-[72px]">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            href={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="EquiProfile"
              className="h-14 w-auto object-contain"
            />
            <span className={`text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
              EquiProfile
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.slice(0, 5).map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors ${
                  showLight
                    ? location === link.path
                      ? "text-black font-semibold"
                      : "text-gray-700 hover:text-black"
                    : location === link.path
                      ? "text-white font-semibold"
                      : "text-white/90 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && navLinks.length > 5 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                      showLight
                        ? "text-gray-700 hover:text-black"
                        : "text-white/90 hover:text-white"
                    }`}
                  >
                    More <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-40">
                  {navLinks.slice(5).map((link) => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link href={link.path} className="cursor-pointer">
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {isStablePlan && (
                    <>
                      <DropdownMenuSeparator />
                      {stableNavLinks.map((link) => (
                        <DropdownMenuItem key={`stable-${link.label}`} asChild>
                          <Link href={link.path} className="cursor-pointer">
                            {link.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
                    <Avatar className="h-8 w-8 border border-white/20">
                      <AvatarFallback
                        className={`text-xs font-medium ${showLight ? "bg-gray-100 text-gray-700" : "bg-white/10 text-white"}`}
                      >
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown
                      className={`w-3.5 h-3.5 ${showLight ? "text-gray-700" : "text-white/80"}`}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || ""}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/billing"
                      className="cursor-pointer flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" /> Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            className={`md:hidden p-2 hover:bg-accent/10 rounded-lg transition-colors ${
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
            className="md:hidden border-t border-gray-200 bg-white overflow-hidden shadow-lg"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`block py-2 text-base font-medium transition-colors ${
                    location === link.path
                      ? "text-foreground"
                      : "text-foreground/80 hover:text-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && isStablePlan && (
                <>
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">
                      Stable
                    </p>
                    {stableNavLinks.map((link) => (
                      <Link
                        key={`mobile-stable-${link.label}`}
                        href={link.path}
                        className="block py-2 text-base font-medium text-foreground/80 hover:text-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
              <div className="pt-3 border-t flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 py-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
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
                      Sign out
                    </Button>
                  </>
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

export default Navbar;
