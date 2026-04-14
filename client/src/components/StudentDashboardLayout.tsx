// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
/**
 * StudentDashboardLayout — isolated layout for student plan users.
 *
 * Entirely separate from DashboardLayout / Pro nav. No Pro nav items are
 * visible here. Student-specific sidebar with student nav, topbar with
 * dark/light toggle and logout. Mobile responsive.
 *
 * When an admin user enters this layout (via Admin → Portals), an
 * "Admin Viewing" banner is shown at the top with a back-to-admin button.
 */
import { ReactNode, useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Brain,
  TrendingUp,
  Zap,
  LogOut,
  Menu,
  X,
  Settings,
  DollarSign,
  Library,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TrialBanner } from "@/components/TrialBanner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAdminViewMode } from "@/contexts/AdminViewContext";

// ── Types ──────────────────────────────────────────────────────────────────

export type StudentView =
  | "overview"
  | "learning-path"
  | "practice"
  | "assignments"
  | "ai-tutor"
  | "progress"
  | "settings";

interface StudentNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  view: StudentView;
}

interface StudentDashboardLayoutProps {
  children: ReactNode;
  activeView: StudentView;
  onNavigate: (view: StudentView) => void;
}

// ── Nav items — student sections only ─────────────────────────────────────

const studentNavItems: StudentNavItem[] = [
  { icon: LayoutDashboard, label: "Home", view: "overview" },
  { icon: Library, label: "Learning Path", view: "learning-path" },
  { icon: Zap, label: "Practice", view: "practice" },
  { icon: ClipboardList, label: "Assignments", view: "assignments" },
  { icon: TrendingUp, label: "Progress", view: "progress" },
  { icon: Brain, label: "AI Tutor", view: "ai-tutor" },
];

// ── Sidebar nav ────────────────────────────────────────────────────────────

function SidebarNav({
  activeView,
  onNavigate,
  onClose,
}: {
  activeView: StudentView;
  onNavigate: (view: StudentView) => void;
  onClose?: () => void;
}) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-indigo-500/20">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-bold text-white tracking-tight truncate block">
            EquiProfile
          </span>
          <span className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
            Student
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {studentNavItems.map((item) => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => {
                onNavigate(item.view);
                onClose?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-0.5 text-sm font-medium transition-all text-left ${
                isActive
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"
              }`}
            >
              <item.icon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-gray-500"}`}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              )}
            </button>
          );
        })}

        {/* Divider + account links */}
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <button
            onClick={() => { onNavigate("settings"); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-0.5 text-sm font-medium text-gray-400 hover:bg-white/[0.06] hover:text-gray-200 transition-all text-left"
          >
            <Settings className="w-4 h-4 shrink-0 text-gray-500" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => { setLocation("/billing"); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-0.5 text-sm font-medium text-gray-400 hover:bg-white/[0.06] hover:text-gray-200 transition-all text-left"
          >
            <DollarSign className="w-4 h-4 shrink-0 text-gray-500" />
            <span>Billing</span>
          </button>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-indigo-500/20">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition-colors group">
          <Avatar className="h-8 w-8 border border-indigo-500/30 shrink-0">
            <AvatarImage src={user?.profileImageUrl ?? undefined} alt={user?.name ?? ""} />
            <AvatarFallback className="text-xs font-medium bg-indigo-900 text-indigo-200">
              {user?.name?.charAt(0).toUpperCase() ?? "S"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-200 truncate leading-none">
              {user?.name || "Student"}
            </p>
            <p className="text-[10px] text-gray-500 truncate mt-0.5">
              {user?.email || ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-all"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Admin view indicator (read-only banner — switching is in Admin portal) ─

function AdminViewIndicator() {
  const [, setLocation] = useLocation();
  const { exitViewMode } = useAdminViewMode();

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20 shrink-0">
      <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
      <span className="text-xs font-semibold text-indigo-300">
        Admin Preview — Student Portal
      </span>
      <div className="flex-1" />
      <button
        onClick={() => { exitViewMode(); setLocation("/admin"); }}
        className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Back to Admin
      </button>
    </div>
  );
}

// ── Main layout ────────────────────────────────────────────────────────────

export default function StudentDashboardLayout({
  children,
  activeView,
  onNavigate,
}: StudentDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: subscriptionStatus } = trpc.billing.getStatus.useQuery(
    undefined,
    { staleTime: 5 * 60 * 1000 },
  );

  const viewLabels: Record<StudentView, string> = {
    overview: "Student Dashboard",
    "learning-path": "Learning Path",
    practice: "Practice",
    assignments: "Assignments",
    "ai-tutor": "AI Tutor",
    progress: "Progress",
    settings: "Settings",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c1222]">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col md:w-56 shrink-0 border-r border-indigo-500/20 bg-[#0c1222]">
        <SidebarNav activeView={activeView} onNavigate={onNavigate} />
      </aside>

      {/* ── Mobile overlay sidebar ──────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0c1222] border-r border-indigo-500/20 flex flex-col transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarNav
          activeView={activeView}
          onNavigate={onNavigate}
          onClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Main content area ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin view indicator — shown when admin is reviewing this portal */}
        {isAdmin && <AdminViewIndicator />}

        {/* Trial banner — show for non-admin users (admin previewing sees student UI faithfully) */}
        {subscriptionStatus && !isAdmin && (
          <TrialBanner />
        )}

        {/* Topbar */}
        <header className="flex items-center justify-between h-14 px-4 shrink-0 border-b border-indigo-500/10 bg-[#0c1222]/80 backdrop-blur-md">
          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2 md:ml-0 ml-2">
            <GraduationCap className="w-4 h-4 text-indigo-400 hidden md:block" />
            <span className="text-sm font-semibold text-gray-200">
              {viewLabels[activeView]}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
