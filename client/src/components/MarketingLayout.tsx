import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageTransition } from "./PageTransition";

interface MarketingLayoutProps {
  children: ReactNode;
}

/**
 * Shared layout for all marketing/public pages.
 * Provides the consistent Navbar + dark background + Footer wrapper
 * that matches the landing page styling.
 */
export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}
