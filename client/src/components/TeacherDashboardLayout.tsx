// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
/**
 * TeacherDashboardLayout — isolated layout for teacher/instructor users.
 *
 * Entirely separate from DashboardLayout / Pro nav. Teacher-specific sidebar
 * with teacher nav, topbar with dark/light toggle and logout. Mobile responsive.
 *
 * When an admin user enters this layout (via Admin → Portals), an
 * "Admin Viewing" banner is shown at the top with a back-to-admin button.
 */
import { ReactNode, useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UsersRound,
  ClipboardList,
  BarChart2,
  MessageSquare,
  FileText,
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
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useAdminViewMode } from "@/contexts/AdminViewContext";

// ── Types ──────────────────────────────────────────────────────────────────

export type TeacherView =
  | "overview"
  | "students"
  | "groups"
  | "tasks"
  | "feedback"
  | "reports"
  | "lessons"
  | "progress";

interface TeacherNavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  view: TeacherView;
}

interface TeacherDashboardLayoutProps {
  children: ReactNode;
  activeView: TeacherView;
  onNavigate: (view: TeacherView) => void;
}

const teacherNavItems: TeacherNavItem[] = [
  { icon: LayoutDashboard, label: "Home", view: "overview" },
  { icon: Users, label: "Students", view: "students" },
  { icon: UsersRound, label: "Groups", view: "groups" },
  { icon: ClipboardList, label: "Assign Work", view: "tasks" },
  { icon: Library, label: "Lessons", view: "lessons" },
  { icon: MessageSquare, label: "Reviews", view: "feedback" },
  { icon: BarChart2, label: "Progress", view: "progress" },
  { icon: FileText, label: "Reports", view: "reports" },
];

// ── Colours ────────────────────────────────────────────────────────────────
const TEACHER_ACCENT = "#10b981"; // Emerald — distinct from student indigo

function SidebarNav({
  activeView,
  onNavigate,
  onClose,
}: {
  activeView: TeacherView;
  onNavigate: (view: TeacherView) => void;
  onClose?: () => void;
}) {
  const { user, logout } = useAuth();
  const logoutMut = trpc.auth.logout.useMutation();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMut.mutateAsync();
    logout();
    setLocation("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "T";

  return (
    <div className="flex flex-col h-full">
      {/* Logo / brand */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${TEACHER_ACCENT}, #059669)` }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">EquiProfile</p>
            <p className="text-[10px]" style={{ color: TEACHER_ACCENT }}>Instructor Portal</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {teacherNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => { onNavigate(item.view); onClose?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
              style={isActive ? { background: `${TEACHER_ACCENT}20`, color: TEACHER_ACCENT } : {}}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer: settings, billing, logout */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-0.5">
        <button
          onClick={() => { setLocation("/settings"); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <Settings className="w-4 h-4" /> Settings
        </button>
        <button
          onClick={() => { setLocation("/billing"); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <DollarSign className="w-4 h-4" /> Billing
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            {user?.profileImageUrl && <AvatarImage src={user.profileImageUrl} />}
            <AvatarFallback className="text-xs font-semibold" style={{ backgroundColor: `${TEACHER_ACCENT}30`, color: TEACHER_ACCENT }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? "Instructor"}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email ?? ""}</p>
          </div>
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
    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 shrink-0">
      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
      <span className="text-xs font-semibold text-emerald-300">
        Admin Preview — Teacher Portal
      </span>
      <div className="flex-1" />
      <button
        onClick={() => { exitViewMode(); setLocation("/admin"); }}
        className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Back to Admin
      </button>
    </div>
  );
}

// ── Main Layout ────────────────────────────────────────────────────────────

export default function TeacherDashboardLayout({
  children,
  activeView,
  onNavigate,
}: TeacherDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const viewLabels: Record<TeacherView, string> = {
    overview: "Instructor Dashboard",
    students: "My Students",
    groups: "Groups & Classes",
    tasks: "Assign Work",
    lessons: "Lessons",
    feedback: "Reviews & Feedback",
    progress: "Student Progress",
    reports: "Reports",
  };

  return (
    <div className="flex h-screen bg-[#0e1117] overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/[0.06] bg-[#0e1520]">
        <SidebarNav activeView={activeView} onNavigate={onNavigate} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#0e1520] border-r border-white/[0.06] flex flex-col z-10">
            <div className="flex justify-end px-4 pt-4">
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarNav activeView={activeView} onNavigate={onNavigate} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin view indicator — shown when admin is reviewing this portal */}
        {isAdmin && <AdminViewIndicator />}

        {/* Topbar */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-[#0e1520] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-gray-400 hover:text-white p-2 -ml-1 rounded-lg hover:bg-white/[0.06] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-white">{viewLabels[activeView]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
