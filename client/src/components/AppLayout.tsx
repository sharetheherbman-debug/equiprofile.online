import DashboardLayout from "./DashboardLayout";
import { ReactNode } from "react";

/**
 * App layout wrapper
 *
 * This is a simple wrapper around the existing DashboardLayout component
 * to provide a consistent API for protected app routes.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default AppLayout;
