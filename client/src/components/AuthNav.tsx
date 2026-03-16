import { Link } from "wouter";

/**
 * Minimal transparent header for Login and Register pages.
 * Shows only the EquiProfile brand name — no nav links, no auth buttons.
 */
export function AuthNav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-transparent pointer-events-none">
      <div className="container mx-auto px-4 h-[72px] flex items-center">
        <Link
          href="/"
          className="pointer-events-auto hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl font-bold font-serif text-blue-500">
            EquiProfile
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default AuthNav;
