/**
 * LegalLayout — Minimal layout for legal pages (Terms, Privacy)
 *
 * Provides a clean, site-neutral layout for legal content pages:
 * - Minimal dark header with EquiProfile logo + Home link
 * - Minimal dark footer with copyright
 *
 * Used by both management and school frontends — legal pages share
 * the same content and layout regardless of which site serves them.
 */
import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

interface LegalLayoutProps {
  children: ReactNode;
}

function LegalHeader() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f1d2e]/98 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl font-bold font-serif text-white tracking-tight">
            Equi<span className="text-[#4a9eca]">Profile</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to site</span>
        </Link>
      </div>
    </nav>
  );
}

function LegalFooter() {
  return (
    <footer className="py-6 bg-[#0b1726] text-gray-500 text-center text-xs border-t border-white/[0.04]">
      <div className="container px-4">
        <p>
          © {new Date().getFullYear()} EquiProfile. All rights reserved.
          {" · "}
          <Link href="/terms" className="hover:text-gray-300 transition-colors">
            Terms
          </Link>
          {" · "}
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">
            Privacy
          </Link>
        </p>
      </div>
    </footer>
  );
}

export function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <>
      <LegalHeader />
      <PageTransition>{children}</PageTransition>
      <LegalFooter />
    </>
  );
}
