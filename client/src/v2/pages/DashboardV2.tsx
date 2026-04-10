import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import type { LucideIcon } from "lucide-react";
import {
  Heart,
  Calendar,
  CloudSun,
  Cloud,
  Plus,
  ChevronRight,
  AlertCircle,
  Clock,
  Activity,
  Stethoscope,
  Dumbbell,
  Apple,
  CalendarDays,
  Brain,
  FileText,
  Baby,
  DollarSign,
  BarChart3,
  Settings,
  Users,
  MessageSquare,
  Shield,
  Syringe,
  Pill,
  Scissors,
  XCircle,
  GitBranch,
  Tag,
  Sparkles,
  BookOpen,
  TrendingUp,
  Navigation,
  ShoppingCart,
  Home,
  UserCog,
  Star,
  Zap,
  ClipboardList,
} from "lucide-react";

// ─── Design Tokens ───────────────────────────────────────────────────────────

const ACCENT = "#4f5fd6";

// ─── Module Navigation Data ──────────────────────────────────────────────────

const dashboardModuleGroups = [
  {
    label: "Core",
    items: [
      { icon: Brain, label: "AI Assistant", path: "/ai-chat" },
      { icon: Cloud, label: "Weather", path: "/weather" },
      { icon: Users, label: "Contacts", path: "/contacts" },
      { icon: Clock, label: "Appointments", path: "/appointments" },
    ],
  },
  {
    label: "Health",
    items: [
      { icon: Stethoscope, label: "Health Hub", path: "/health" },
      { icon: Syringe, label: "Vaccinations", path: "/vaccinations" },
      { icon: Scissors, label: "Dental Care", path: "/dental" },
      { icon: Activity, label: "Hoof Care", path: "/hoofcare" },
      { icon: Pill, label: "Dewormings", path: "/dewormings" },
      { icon: Heart, label: "Treatments", path: "/treatments" },
      { icon: XCircle, label: "X-Rays", path: "/xrays" },
    ],
  },
  {
    label: "Training & Activity",
    items: [
      { icon: Dumbbell, label: "Training Log", path: "/training" },
      { icon: BookOpen, label: "Templates", path: "/training-templates" },
      { icon: Navigation, label: "GPS Tracking", path: "/ride-tracking" },
    ],
  },
  {
    label: "Nutrition",
    items: [
      { icon: Apple, label: "Feeding Plans", path: "/feeding" },
      { icon: FileText, label: "Nutrition Plans", path: "/nutrition-plans" },
      { icon: BarChart3, label: "Nutrition Logs", path: "/nutrition-logs" },
      { icon: ShoppingCart, label: "Feed Costs", path: "/feed-costs" },
    ],
  },
  {
    label: "Management & Docs",
    items: [
      { icon: Calendar, label: "Calendar", path: "/calendar" },
      { icon: FileText, label: "Documents", path: "/documents" },
      { icon: ClipboardList, label: "Tasks", path: "/tasks" },
      { icon: Tag, label: "Tags", path: "/tags" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: FileText, label: "Reports", path: "/reports" },
      { icon: GitBranch, label: "Pedigree", path: "/pedigree" },
      { icon: Shield, label: "Equine Passport", path: "/equine-passport" },
      { icon: TrendingUp, label: "Competitions", path: "/competitions" },
      { icon: Settings, label: "Settings", path: "/settings" },
      { icon: DollarSign, label: "Billing", path: "/billing" },
    ],
  },
];

// ─── Quick Actions ───────────────────────────────────────────────────────────

const quickActions = [
  { icon: Plus, label: "Add Horse", path: "/horses/new", description: "Register a new horse" },
  { icon: Dumbbell, label: "Log Training", path: "/training", description: "Record a training session" },
  { icon: Stethoscope, label: "Record Health", path: "/health", description: "Log a health observation" },
  { icon: Calendar, label: "View Calendar", path: "/calendar", description: "Check upcoming events" },
  { icon: Apple, label: "Feeding Plan", path: "/feeding", description: "Manage feeding schedules" },
  { icon: FileText, label: "Documents", path: "/documents", description: "Access your files" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Skeleton Components ─────────────────────────────────────────────────────

function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-[#242a38] ${className}`}
      aria-hidden="true"
    />
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] p-5">
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-11 w-11 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-7 w-12" />
        </div>
      </div>
    </div>
  );
}

function FocusCardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] p-4"
        >
          <SkeletonPulse className="h-5 w-5 shrink-0 rounded" />
          <SkeletonPulse className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  href?: string;
}) {
  const card = (
    <div className={`rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] p-5 transition-all duration-200 hover:shadow-md ${href ? "cursor-pointer hover:border-[#4f5fd6]/40" : ""}`}>
      <div className="flex items-center gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${ACCENT}14` }}
        >
          <Icon className="h-5 w-5" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[#5c6370] dark:text-[#9ca3b0]">
            {label}
          </p>
          <p className="mt-0.5 text-2xl font-semibold text-[#1a1d24] dark:text-[#e8eaef]">
            {value}
          </p>
        </div>
        {href && <ChevronRight className="h-4 w-4 shrink-0 text-[#5c6370]/40" />}
      </div>
    </div>
  );
  if (href) return <Link href={href}>{card}</Link>;
  return card;
}

// ─── Focus Item ──────────────────────────────────────────────────────────────

function FocusItem({
  icon: Icon,
  text,
  variant = "info",
  href,
}: {
  icon: LucideIcon;
  text: string;
  variant?: "alert" | "warning" | "info";
  href?: string;
}) {
  const colors = {
    alert: "text-red-500 bg-red-50 dark:bg-red-950/30",
    warning: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    info: "text-[#4f5fd6] bg-[#4f5fd6]/10",
  };
  const iconBg = colors[variant];

  const content = (
    <div className={`flex items-center gap-3 rounded-lg border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] p-4 transition-colors duration-200 hover:border-[#4f5fd6]/30 ${href ? "cursor-pointer" : ""}`}>
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconBg}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-sm text-[#1a1d24] dark:text-[#e8eaef] flex-1">{text}</p>
      {href && <ChevronRight className="h-4 w-4 shrink-0 text-[#5c6370]/40" />}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

// ─── Quick Action Card ───────────────────────────────────────────────────────

function QuickActionCard({
  icon: Icon,
  label,
  description,
  path,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  path: string;
}) {
  return (
    <Link
      href={path}
      className="group flex items-center gap-4 rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] p-4 transition-all duration-200 hover:border-[#4f5fd6]/40 hover:shadow-md"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 group-hover:bg-[#4f5fd6] group-hover:text-white"
        style={{ backgroundColor: `${ACCENT}14`, color: ACCENT }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#1a1d24] dark:text-[#e8eaef]">{label}</p>
        <p className="text-xs text-[#5c6370] dark:text-[#9ca3b0]">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#5c6370]/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#4f5fd6]" />
    </Link>
  );
}

// ─── Module Group Card ───────────────────────────────────────────────────────

function ModuleGroupCard({
  label,
  items,
}: {
  label: string;
  items: { icon: LucideIcon; label: string; path: string }[];
}) {
  return (
    <div className="rounded-xl border border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] p-5">
      <h3 className="mb-4 font-serif text-sm font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#9ca3b0]">
        {label}
      </h3>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="group flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-colors duration-200 hover:bg-[#4f5fd6]/5 dark:hover:bg-[#4f5fd6]/10"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 group-hover:bg-[#4f5fd6] group-hover:text-white"
                style={{ backgroundColor: `${ACCENT}0d`, color: ACCENT }}
              >
                <ItemIcon className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs font-medium text-[#1a1d24] dark:text-[#e8eaef]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function GettingStarted() {
  return (
    <div className="rounded-xl border border-dashed border-[#e4e7ec] dark:border-[#2a3040] bg-white dark:bg-[#181d27] p-8 text-center sm:p-12">
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${ACCENT}14` }}
      >
        <Sparkles className="h-7 w-7" style={{ color: ACCENT }} />
      </div>
      <h3 className="font-serif text-lg font-semibold text-[#1a1d24] dark:text-[#e8eaef]">
        Welcome to EquiProfile
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#5c6370] dark:text-[#9ca3b0]">
        Get started by adding your first horse. You&apos;ll be able to track health records,
        training sessions, nutrition plans, and much more.
      </p>
      <Link
        href="/horses/new"
        className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
        style={{ backgroundColor: ACCENT }}
      >
        <Plus className="h-4 w-4" />
        Add Your First Horse
      </Link>
    </div>
  );
}

// ─── Section Heading ─────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-lg font-semibold text-[#1a1d24] dark:text-[#e8eaef]">
      {children}
    </h2>
  );
}

// ─── Dashboard Content ───────────────────────────────────────────────────────

function DashboardContent() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: horses, isLoading: horsesLoading } = trpc.horses.list.useQuery();
  const { data: healthAlerts } = trpc.timeline.getHealthAlerts.useQuery({});
  const { data: tasks } = trpc.tasks.list.useQuery();
  const { data: upcomingAppointments } = trpc.appointments.list.useQuery();
  const { data: recentTraining } = trpc.training.listAll.useQuery();

  const today = useMemo(() => formatDate(new Date()), []);

  const horseCount = horses?.length ?? 0;
  const alertCount = Array.isArray(healthAlerts) ? healthAlerts.length : 0;

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayAppointments = useMemo(() => {
    if (!Array.isArray(upcomingAppointments)) return [];
    return upcomingAppointments.filter((a: any) => {
      const d = a.date ?? a.appointmentDate ?? a.scheduledDate;
      if (!d) return false;
      return String(d).slice(0, 10) === todayStr;
    });
  }, [upcomingAppointments, todayStr]);

  const upcomingTaskCount = useMemo(() => {
    if (!Array.isArray(tasks)) return 0;
    return tasks.filter(
      (t: any) => t.status !== "completed" && t.status !== "done"
    ).length;
  }, [tasks]);

  // Build today's focus items
  const focusItems = useMemo(() => {
    const items: { icon: LucideIcon; text: string; variant: "alert" | "warning" | "info"; href: string }[] = [];

    if (Array.isArray(healthAlerts)) {
      healthAlerts.slice(0, 3).forEach((alert: any) => {
        const name = alert.horseName ?? alert.horse?.name ?? "A horse";
        const message = alert.message ?? alert.description ?? "needs attention";
        items.push({
          icon: AlertCircle,
          text: `${name}: ${message}`,
          variant: "alert",
          href: "/health",
        });
      });
    }

    if (Array.isArray(tasks)) {
      tasks
        .filter((t: any) => {
          if (t.status === "completed" || t.status === "done") return false;
          if (!t.dueDate) return false;
          return String(t.dueDate).slice(0, 10) <= todayStr;
        })
        .slice(0, 3)
        .forEach((t: any) => {
          const overdue = String(t.dueDate).slice(0, 10) < todayStr;
          items.push({
            icon: ClipboardList,
            text: `${overdue ? "Overdue: " : "Due today: "}${t.title ?? t.name ?? "Task"}`,
            variant: overdue ? "warning" : "info",
            href: "/tasks",
          });
        });
    }

    if (todayAppointments.length > 0) {
      todayAppointments.slice(0, 2).forEach((a: any) => {
        items.push({
          icon: Clock,
          text: `Appointment: ${a.title ?? a.type ?? "Scheduled today"}`,
          variant: "info",
          href: "/appointments",
        });
      });
    }

    return items;
  }, [healthAlerts, tasks, todayAppointments, todayStr]);

  const isLoading = horsesLoading;
  const hasHorses = horseCount > 0;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0f1219] relative overflow-hidden">
      {/* ── Subtle Premium Background Depth ────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#4f5fd6]/[0.04] blur-3xl" />
        <div className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-[#3b7dd8]/[0.03] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-[#2d8a56]/[0.03] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="mb-8">
          <h1 className="font-serif text-2xl font-semibold text-[#1a1d24] dark:text-[#e8eaef] sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-[#5c6370] dark:text-[#9ca3b0]">{today}</p>
        </header>

        {/* ── Key Metrics ────────────────────────────────────────── */}
        <section aria-label="Key metrics" className="mb-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <MetricCard icon={Heart} label="Total Horses" value={horseCount} href="/horses" />
                <MetricCard icon={AlertCircle} label="Health Alerts" value={alertCount} href="/health" />
                <MetricCard icon={ClipboardList} label="Upcoming Tasks" value={upcomingTaskCount} href="/tasks" />
                <MetricCard icon={CalendarDays} label="Today's Appts" value={todayAppointments.length} href="/appointments" />
              </>
            )}
          </div>
        </section>

        {/* ── Today's Focus — only show when items exist ──────────── */}
        {isLoading ? (
          <section aria-label="Today's focus" className="mb-8">
            <SectionHeading>Today&apos;s Focus</SectionHeading>
            <div className="mt-4">
              <FocusCardSkeleton />
            </div>
          </section>
        ) : focusItems.length > 0 ? (
          <section aria-label="Today's focus" className="mb-8">
            <SectionHeading>Today&apos;s Focus</SectionHeading>
            <div className="mt-4 space-y-2">
              {focusItems.map((item, i) => (
                <FocusItem key={i} icon={item.icon} text={item.text} variant={item.variant} href={item.href} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Quick Actions ──────────────────────────────────────── */}
        <section aria-label="Quick actions" className="mb-8">
          <SectionHeading>Quick Actions</SectionHeading>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <QuickActionCard key={action.path} {...action} />
            ))}
          </div>
        </section>

        {/* ── Module Navigation — desktop only ───────────────────── */}
        <section aria-label="Modules" className="mb-8 hidden md:block">
          <SectionHeading>Modules</SectionHeading>
          <div className="mt-4 space-y-4">
            {dashboardModuleGroups.map((group) => (
              <ModuleGroupCard key={group.label} label={group.label} items={group.items} />
            ))}
          </div>
        </section>

        {/* ── Getting Started (empty state) ──────────────────────── */}
        {!isLoading && !hasHorses && (
          <section aria-label="Getting started" className="mb-8">
            <GettingStarted />
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function DashboardV2() {
  const { loading } = useAuth({ redirectOnUnauthenticated: true });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0f1219]">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <SkeletonPulse className="mb-2 h-8 w-64" />
            <SkeletonPulse className="mb-8 h-4 w-48" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
