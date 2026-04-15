/**
 * SchoolLayout — Layout wrapper for school public marketing pages
 */
import { ReactNode } from "react";
import { SchoolNavbar } from "./SchoolNavbar";
import { SchoolFooter } from "./SchoolFooter";
import { PageTransition } from "@/components/PageTransition";

interface SchoolLayoutProps {
  children: ReactNode;
}

export function SchoolLayout({ children }: SchoolLayoutProps) {
  return (
    <>
      <SchoolNavbar />
      <PageTransition>{children}</PageTransition>
      <SchoolFooter />
    </>
  );
}
