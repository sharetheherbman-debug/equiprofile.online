// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
/**
 * TeacherDashboardLayout — isolated layout for teacher/instructor users.
 *
 * Entirely separate from DashboardLayout / Pro nav. Teacher-specific sidebar
 * with teacher nav, topbar with dark/light toggle and logout. Mobile responsive.
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
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

// ── Types ──────────────────────────────────────────────────────────────────

export type TeacherView =
  | "overview"
  | "students"
  | "groups"
  | "tasks"
  | "feedback"
  | "reports"
  | "lessons";

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
  { icon: LayoutDashboard, label: "Overview", view: "overview" },
  { icon: Users, label: "Students", view: "students" },
  { icon: UsersRound, label: "Groups", view: "groups" },
  { icon: ClipboardList, label: "Assign Tasks", view: "tasks" },
  { icon: Library, label: "Lessons", view: "lessons" },
  { icon: MessageSquare, label: "Feedback", view: "feedback" },
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
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {teacherNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => { onNavigate(item.view); onClose?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
        <button
          onClick={() => { setLocation("/settings"); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <Settings className="w-4 h-4" /> Settings
        </button>
        <button
          onClick={() => { setLocation("/billing"); onClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] transition-all"
        >
          <DollarSign className="w-4 h-4" /> Billing
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all"
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

// ── Main Layout ────────────────────────────────────────────────────────────

export default function TeacherDashboardLayout({
  children,
  activeView,
  onNavigate,
}: TeacherDashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const viewLabels: Record<TeacherView, string> = {
    overview: "Instructor Dashboard",
    students: "My Students",
    groups: "Groups & Classes",
    tasks: "Assign Tasks",
    lessons: "Lessons",
    feedback: "Student Feedback",
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
        {/* Topbar */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-[#0e1520] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden text-gray-400 hover:text-white p-1"
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
        <main className="flex-1 overflow-y-auto px-5 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
