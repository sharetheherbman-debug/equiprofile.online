// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
/**
 * PlanAwareLayout — wraps pages (Settings, Billing, etc.) in the correct
 * dashboard shell based on the user's plan tier.
 *
 * - Student plan → StudentDashboardLayout (settings view)
 * - Teacher plan → TeacherDashboardLayout (overview, since these are standalone pages)
 * - Pro / Stable / Admin → DashboardLayout (existing behaviour)
 *
 * This prevents students/teachers from being dropped into the Pro dashboard
 * when they click Settings, Billing, or Security in their sidebar.
 */
import { ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import StudentDashboardLayout from "@/components/StudentDashboardLayout";
import TeacherDashboardLayout from "@/components/TeacherDashboardLayout";

function parseUserPrefs(raw: string | null | undefined): Record<string, any> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function PlanAwareLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const prefs = parseUserPrefs(user?.preferences);
  const planTier = prefs.planTier ?? prefs.selectedExperience ?? "";
  const isAdmin = user?.role === "admin";

  // Admin users always see Pro/DashboardLayout unless in view-as mode
  if (isAdmin) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }

  if (planTier === "student") {
    return (
      <StudentDashboardLayout
        activeView="settings"
        onNavigate={(view) => {
          // Navigate back to student dashboard with the selected view
          if (view === "settings") return; // Already on settings-like page
          setLocation("/student-dashboard");
        }}
      >
        {children}
      </StudentDashboardLayout>
    );
  }

  if (planTier === "teacher") {
    return (
      <TeacherDashboardLayout
        activeView="overview"
        onNavigate={(view) => {
          // Navigate back to teacher dashboard with the selected view
          setLocation("/teacher-dashboard");
        }}
      >
        {children}
      </TeacherDashboardLayout>
    );
  }

  // Default: Pro / Stable / other
  return <DashboardLayout>{children}</DashboardLayout>;
}
