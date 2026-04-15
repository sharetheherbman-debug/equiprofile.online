/**
 * ManagementLayout — Layout wrapper for management public marketing pages
 */
import { ReactNode } from "react";
import { ManagementNavbar } from "./ManagementNavbar";
import { ManagementFooter } from "./ManagementFooter";
import { PageTransition } from "@/components/PageTransition";

interface ManagementLayoutProps {
  children: ReactNode;
}

export function ManagementLayout({ children }: ManagementLayoutProps) {
  return (
    <>
      <ManagementNavbar />
      <PageTransition>{children}</PageTransition>
      <ManagementFooter />
    </>
  );
}
