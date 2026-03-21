import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsOverview } from "@/components/StatsOverview";
import { ActivationChecklist } from "@/components/ActivationChecklist";
import { GuidedTour, type TourStep } from "@/components/GuidedTour";
import { ContextualTip } from "@/components/ContextualTip";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Heart,
  Calendar,
  CloudSun,
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
  Home,
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
  Zap,
  Star,
} from "lucide-react";

// Module categories with richer descriptions for premium grid
// Grouped into logical sections for dashboard display
const moduleSections = [
  {
    label: "Core",
    description: "Essential horse management",
    ids: ["horses", "health", "nutrition", "training"],
  },
  {
    label: "Planning & Tools",
    description: "Schedule, AI, weather and documents",
    ids: ["schedule", "ai", "documents", "reports"],
  },
  {
    label: "Advanced",
    description: "Financials & settings",
    ids: ["financial", "settings"],
  },
  {
    label: "Stable Management",
    description: "Breeding, team, clients & messaging",
    ids: ["breeding", "stable"],
    stableOnly: true,
  },
];

const moduleCategories = [
  {
    id: "horses",
    name: "Horses",
    description: "Profiles, pedigrees & records",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    accent: "border-rose-500/30",
    href: "/horses",
    modules: [
      { name: "All Horses", href: "/horses", icon: Heart },
      { name: "Add Horse", href: "/horses/new", icon: Plus },
      { name: "Pedigree", href: "/pedigree", icon: GitBranch },
    ],
  },
  {
    id: "health",
    name: "Health",
    description: "Vets, vaccines & treatments",
    icon: Stethoscope,
    color: "from-blue-500 to-cyan-600",
    accent: "border-blue-500/30",
    href: "/health",
    modules: [
      { name: "Health Hub", href: "/health", icon: Stethoscope },
      { name: "Vaccinations", href: "/vaccinations", icon: Syringe },
      { name: "Dental Care", href: "/dental", icon: Scissors },
      { name: "Hoof Care", href: "/hoofcare", icon: Activity },
      { name: "Dewormings", href: "/dewormings", icon: Pill },
      { name: "Treatments", href: "/treatments", icon: Heart },
      { name: "X-Rays", href: "/xrays", icon: XCircle },
    ],
  },
  {
    id: "training",
    name: "Training",
    description: "Sessions, templates & lessons",
    icon: Dumbbell,
    color: "from-green-500 to-emerald-600",
    accent: "border-green-500/30",
    href: "/training",
    modules: [
      { name: "Training Log", href: "/training", icon: Dumbbell },
      { name: "Templates", href: "/training-templates", icon: BookOpen },
      { name: "Lessons", href: "/lessons", icon: Users },
    ],
  },
  {
    id: "nutrition",
    name: "Nutrition",
    description: "Feed plans & diet tracking",
    icon: Apple,
    color: "from-orange-500 to-amber-600",
    accent: "border-orange-500/30",
    href: "/feeding",
    modules: [
      { name: "Feeding Plans", href: "/feeding", icon: Apple },
      { name: "Nutrition Plans", href: "/nutrition-plans", icon: FileText },
      { name: "Nutrition Logs", href: "/nutrition-logs", icon: BookOpen },
    ],
  },
  {
    id: "schedule",
    name: "Schedule",
    description: "Calendar, tasks & appointments",
    icon: CalendarDays,
    color: "from-purple-500 to-violet-600",
    accent: "border-purple-500/30",
    href: "/calendar",
    modules: [
      { name: "Calendar", href: "/calendar", icon: Calendar },
      { name: "Appointments", href: "/appointments", icon: Clock },
      { name: "Tasks", href: "/tasks", icon: Activity },
    ],
  },
  {
    id: "ai",
    name: "AI Tools",
    description: "Smart assistant & weather insights",
    icon: Brain,
    color: "from-indigo-500 to-blue-600",
    accent: "border-indigo-500/30",
    href: "/ai-chat",
    modules: [
      { name: "AI Assistant", href: "/ai-chat", icon: Brain },
      { name: "Weather", href: "/weather", icon: CloudSun },
    ],
  },
  {
    id: "documents",
    name: "Documents",
    description: "Secure file & record vault",
    icon: FileText,
    color: "from-slate-500 to-gray-600",
    accent: "border-slate-500/30",
    href: "/documents",
    modules: [{ name: "Document Vault", href: "/documents", icon: FileText }],
  },
  {
    id: "breeding",
    name: "Breeding",
    description: "Foaling records & lineage",
    icon: Baby,
    color: "from-pink-500 to-rose-600",
    accent: "border-pink-500/30",
    href: "/breeding",
    modules: [{ name: "Breeding Manager", href: "/breeding", icon: Baby }],
  },
  {
    id: "stable",
    name: "Stable",
    description: "Team, contacts & messaging",
    icon: Home,
    color: "from-yellow-500 to-orange-600",
    accent: "border-yellow-500/30",
    href: "/stable",
    modules: [
      { name: "Stable Management", href: "/stable", icon: Home },
      { name: "Contacts", href: "/contacts", icon: Users },
      { name: "Client Portal", href: "/stable", icon: Shield },
      { name: "Messages", href: "/messages", icon: MessageSquare },
    ],
  },
  {
    id: "financial",
    name: "Financial",
    description: "Billing, costs & invoices",
    icon: DollarSign,
    color: "from-emerald-500 to-teal-600",
    accent: "border-emerald-500/30",
    href: "/billing",
    modules: [{ name: "Billing", href: "/billing", icon: DollarSign }],
  },
  {
    id: "reports",
    name: "Reports",
    description: "Analytics, tags & exports",
    icon: BarChart3,
    color: "from-cyan-500 to-blue-600",
    accent: "border-cyan-500/30",
    href: "/analytics",
    modules: [
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
      { name: "Reports", href: "/reports", icon: FileText },
      { name: "Tags", href: "/tags", icon: Tag },
    ],
  },
  {
    id: "settings",
    name: "Settings",
    description: "Account & security",
    icon: Settings,
    color: "from-gray-500 to-slate-600",
    accent: "border-gray-500/30",
    href: "/settings",
    modules: [{ name: "Settings", href: "/settings", icon: Settings }],
  },
];

function PremiumModuleCard({
  category,
  index,
}: {
  category: (typeof moduleCategories)[0];
  index: number;
}) {
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <Link href={category.href}>
        <div
          className={`group relative rounded-xl border ${category.accent} bg-card/60 backdrop-blur-sm p-4 h-full cursor-pointer hover:shadow-md hover:bg-card/80 transition-all duration-200 hover:-translate-y-0.5`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-sm shrink-0`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm leading-tight">
                {category.name}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                {category.description}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {category.modules.slice(0, 3).map((m) => (
              <span
                key={m.href}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground"
              >
                {m.name}
              </span>
            ))}
            {category.modules.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                +{category.modules.length - 3} more
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { data: stats } = trpc.user.getDashboardStats.useQuery(undefined, {
    retry: false,
  });
  const { data: subscription } = trpc.user.getSubscriptionStatus.useQuery();
  const { data: onboarding } = trpc.user.getOnboardingStatus.useQuery(
    undefined,
    { staleTime: 60_000 },
  );
  const updateChecklist = trpc.user.updateActivationChecklist.useMutation();
  const { data: trainingStats } = trpc.analytics.getTrainingStats.useQuery(
    {},
    { retry: false },
  );
  const { data: horses = [] } = trpc.horses.list.useQuery(undefined, {
    retry: false,
  });
  const { data: upcomingAppointments = [] } = trpc.appointments.list.useQuery(
    undefined,
    { retry: false },
  );
  const { data: tasks = [] } = trpc.tasks.list.useQuery(undefined, {
    retry: false,
  });

  // Upcoming events (next 30 days) for "Next Event" quick card
  const { data: upcomingCalendarEvents = [] } =
    trpc.calendar.getEvents.useQuery(
      {
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { retry: false, staleTime: 5 * 60 * 1000 },
    );

  // Today's calendar events
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
  );
  const { data: calendarEvents = [] } = trpc.calendar.getEvents.useQuery(
    {
      startDate: todayStart.toISOString(),
      endDate: todayEnd.toISOString(),
    },
    { retry: false, staleTime: 5 * 60 * 1000 },
  );

  // Mark "viewedDashboard" activation checklist item on first visit
  useEffect(() => {
    if (
      onboarding?.completed &&
      onboarding.activationChecklist &&
      !onboarding.activationChecklist.viewedDashboard
    ) {
      updateChecklist.mutate({ item: "viewedDashboard", value: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarding?.completed, onboarding?.activationChecklist?.viewedDashboard]);

  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    switch (subscription.status) {
      case "trial": {
        const trialDays = subscription.trialEndsAt
          ? Math.ceil(
              (new Date(subscription.trialEndsAt).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800 gap-1">
            <Star className="w-3 h-3" />
            {trialDays} days left in trial
          </Badge>
        );
      }
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 gap-1">
            <Zap className="w-3 h-3" />
            {subscription.planTier === "stable"
              ? "Stable Plan"
              : "Starter Plan"}
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Payment Overdue
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Subscription Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const quickActions = [
    {
      label: "Add Horse",
      href: "/horses/new",
      icon: Plus,
      color: "from-rose-500 to-pink-600",
    },
    {
      label: "Log Training",
      href: "/training",
      icon: Dumbbell,
      color: "from-green-500 to-emerald-600",
    },
    {
      label: "Schedule",
      href: "/calendar",
      icon: Calendar,
      color: "from-purple-500 to-violet-600",
    },
    {
      label: "AI Chat",
      href: "/ai-chat",
      icon: Sparkles,
      color: "from-indigo-500 to-blue-600",
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: TrendingUp,
      color: "from-cyan-500 to-blue-600",
    },
  ];

  // Build a chronological activity feed from horses + appointments
  const activityFeed: Array<{
    id: string;
    type: "horse" | "appointment" | "training";
    title: string;
    subtitle: string;
    date: Date;
    icon: typeof Heart;
    color: string;
  }> = [
    ...horses.slice(0, 3).map((h: any) => ({
      id: `horse-${h.id}`,
      type: "horse" as const,
      title: h.name,
      subtitle: h.breed ? `${h.breed} · Added to stable` : "Added to stable",
      date: new Date(h.createdAt || Date.now()),
      icon: Heart,
      color: "from-rose-500 to-pink-600",
    })),
    ...upcomingAppointments.slice(0, 3).map((a: any) => ({
      id: `appt-${a.id}`,
      type: "appointment" as const,
      title: a.title,
      subtitle: a.appointmentType || "Appointment",
      date: new Date(a.appointmentDate),
      icon: Calendar,
      color: "from-purple-500 to-violet-600",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const futureAppointments = upcomingAppointments
    .filter((a: any) => new Date(a.appointmentDate) >= new Date())
    .sort(
      (a: any, b: any) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )
    .slice(0, 4);

  const healthAlerts =
    (stats?.reminderCount || 0) > 0
      ? [
          {
            id: "health-reminder",
            message: `${stats?.reminderCount} health reminder${(stats?.reminderCount || 0) > 1 ? "s" : ""} due`,
            href: "/health",
          },
        ]
      : [];

  // Dashboard guided tour steps
  const dashboardTourSteps: TourStep[] = [
    {
      title: "Your Dashboard",
      content:
        "Welcome! This is your equestrian command centre. Everything you need is accessible from here.",
    },
    {
      title: "Quick Stats",
      content:
        "At the top you'll see a live overview of your horses, upcoming events, and weather conditions.",
    },
    {
      title: "Module Grid",
      content:
        "Below are all the tools available to you — horse profiles, health records, training plans, documents and more. Click any card to get started.",
    },
    {
      title: "Sidebar Navigation",
      content:
        "Use the sidebar (or the bottom menu on mobile) to jump between sections quickly.",
    },
  ];

  const showDashboardTour = (() => {
    if (!onboarding?.completed) return false;
    try {
      const prefs = JSON.parse(user?.preferences || "{}");
      return !(prefs.dismissedTours || []).includes("dashboard");
    } catch {
      return false;
    }
  })();

  return (
    <div className="space-y-6 pb-6">
      {/* ── Dashboard Guided Tour ─────────────────────────────── */}
      {showDashboardTour && (
        <GuidedTour tourId="dashboard" steps={dashboardTourSteps} />
      )}
      {/* ── Hero Section ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800/90 to-emerald-950/30 p-6 text-white shadow-xl shadow-black/30 border border-white/10"
      >
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-16 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-100 mb-1">
              {(() => {
                const h = new Date().getHours();
                if (h < 12) return "Good morning";
                if (h < 18) return "Good afternoon";
                return "Good evening";
              })()}
              , {user?.name?.split(" ")[0] || "Rider"}! 🐎
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              Your Dashboard
            </h1>
            <p className="text-indigo-200 text-sm mt-1">
              Your equestrian command centre
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {getSubscriptionBadge()}
          </div>
        </div>
      </motion.div>

      {/* ── Activation Checklist (trial users only) ───────────── */}
      {subscription?.status === "trial" &&
        onboarding?.completed &&
        onboarding.activationChecklist && (
          <ActivationChecklist items={onboarding.activationChecklist} />
        )}

      {/* ── Dashboard contextual tip ─────────────────────────── */}
      {onboarding?.completed && (
        <ContextualTip
          tipId="dashboard-welcome"
          title="Welcome to your dashboard"
          message="This is your command centre. Explore the modules below to manage your horses, health records, training and more."
          dismissedTips={
            (() => {
              try {
                return JSON.parse(user?.preferences || "{}").dismissedTips || [];
              } catch {
                return [];
              }
            })()
          }
        />
      )}

      {/* ── Quick-Access Stat Cards ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.06 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        <Link href="/horses">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-950/40 to-pink-950/30 hover:from-rose-950/60 hover:shadow-lg hover:shadow-rose-900/20 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(horses as any[]).length}</p>
              <p className="text-xs text-muted-foreground">My Horses</p>
            </div>
          </div>
        </Link>
        <Link href="/calendar">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 to-violet-950/30 hover:from-purple-950/60 hover:shadow-lg hover:shadow-purple-900/20 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              {(upcomingCalendarEvents as any[]).length > 0 ? (
                <>
                  <p className="text-sm font-semibold leading-tight truncate max-w-[140px]">
                    {(upcomingCalendarEvents as any[])[0]?.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(
                      (upcomingCalendarEvents as any[])[0]?.startDate,
                    ).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold">No upcoming events</p>
                  <p className="text-xs text-muted-foreground">Next Event</p>
                </>
              )}
            </div>
          </div>
        </Link>
        <Link href="/tasks">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-orange-950/30 hover:from-amber-950/60 hover:shadow-lg hover:shadow-amber-900/20 transition-all cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(tasks as any[]).filter((t: any) => !t.isCompleted).length}
              </p>
              <p className="text-xs text-muted-foreground">Active Tasks</p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* ── KPI Stats Row ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="rounded-xl bg-muted/30 p-1"
      >
        <StatsOverview
          totalHorses={stats?.horseCount || 0}
          trainingHours={Math.round((trainingStats?.totalDuration || 0) / 60)}
          upcomingEvents={stats?.upcomingSessionCount || 0}
          healthReminders={stats?.reminderCount || 0}
        />
      </motion.div>

      {/* ── Quick Action Pills ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.14 }}
      >
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <button className="flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-full border border-muted/60 bg-card/60 hover:bg-card hover:shadow-sm active:scale-95 transition-all text-sm font-medium">
                  <div
                    className={`w-5 h-5 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center`}
                  >
                    <ActionIcon className="w-3 h-3 text-white" />
                  </div>
                  {action.label}
                </button>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ── Two-Column Body ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start"
      >
        {/* LEFT — Recent Activity (60%) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Your horses, appointments and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activityFeed.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No activity yet</p>
                  <p className="text-xs mt-1">
                    Add a horse or schedule an appointment to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {activityFeed.map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={item.id} className="flex gap-3 group">
                        {/* timeline line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm shrink-0`}
                          >
                            <ItemIcon className="w-3.5 h-3.5 text-white" />
                          </div>
                          {i < activityFeed.length - 1 && (
                            <div className="w-px flex-1 bg-border/50 my-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                            {item.date.toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year:
                                item.date.getFullYear() !==
                                new Date().getFullYear()
                                  ? "numeric"
                                  : undefined,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {horses.length > 0 && (
                <Link href="/horses">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    View all horses
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — Upcoming Events + Health Alerts (40%) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Upcoming Events */}
          <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              {futureAppointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-7 h-7 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No upcoming appointments</p>
                  <Link href="/appointments">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs h-7"
                    >
                      Schedule one
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {futureAppointments.map((appt: any) => {
                    const d = new Date(appt.appointmentDate);
                    const isToday =
                      d.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={appt.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border ${isToday ? "border-purple-500/30 bg-purple-50/50 dark:bg-purple-900/10" : "border-muted/40 bg-muted/20"}`}
                      >
                        <div className="text-center shrink-0 w-9">
                          <p className="text-[10px] text-muted-foreground font-medium uppercase">
                            {d.toLocaleDateString("en-GB", { month: "short" })}
                          </p>
                          <p className="text-base font-bold leading-tight">
                            {d.getDate()}
                          </p>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">
                            {appt.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {appt.appointmentType || "Appointment"}
                            {appt.providerName ? ` · ${appt.providerName}` : ""}
                          </p>
                        </div>
                        {isToday && (
                          <Badge className="text-[9px] h-4 px-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 shrink-0">
                            Today
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                  <Link href="/calendar">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground mt-1"
                    >
                      Open calendar
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Alerts */}
          {healthAlerts.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/10 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-sm flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertCircle className="w-4 h-4" />
                  Health Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {healthAlerts.map((alert) => (
                  <Link key={alert.id} href={alert.href}>
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        {alert.message}
                      </p>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* ── Today's Schedule ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Today's Schedule */}
        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Today's Schedule
            </CardTitle>
            <CardDescription className="text-xs">
              {today.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendarEvents.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarDays className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No events scheduled today</p>
                <Link href="/calendar">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs h-7"
                  >
                    Open calendar
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {calendarEvents.slice(0, 4).map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-muted/40 bg-muted/20"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {event.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {event.eventType}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/calendar">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground mt-1"
                  >
                    View calendar <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Horse Overview */}
        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Horse Overview
            </CardTitle>
            <CardDescription className="text-xs">
              {horses.length} horse{horses.length !== 1 ? "s" : ""} in your
              stable
            </CardDescription>
          </CardHeader>
          <CardContent>
            {horses.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Heart className="w-7 h-7 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No horses added yet</p>
                <Link href="/horses/new">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs h-7"
                  >
                    Add first horse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {horses.slice(0, 4).map((horse: any) => (
                  <Link key={horse.id} href={`/horses/${horse.id}`}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-muted/40 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      {horse.photoUrl ? (
                        <img
                          src={horse.photoUrl}
                          alt={horse.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/assets/marketing/hero/hero-horse.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0">
                          <span className="text-[10px] text-white font-bold">
                            {horse.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {horse.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {horse.breed || "Unknown breed"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {horses.length > 4 && (
                  <Link href="/horses">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground mt-1"
                    >
                      View all {horses.length} horses{" "}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Tasks */}
        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-xs">No pending tasks</p>
                  <Link href="/tasks">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs h-7"
                    >
                      Add task
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {tasks.slice(0, 6).map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-muted/40 bg-muted/20"
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${task.priority === "high" ? "bg-red-500" : task.priority === "medium" ? "bg-amber-500" : "bg-green-500"}`}
                      />
                      <p className="text-xs font-medium truncate flex-1">
                        {task.title}
                      </p>
                    </div>
                  ))}
                  <Link href="/tasks">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground mt-1"
                    >
                      View all tasks <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
      </motion.div>

      {/* ── Module Grid with Section Headers ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.34 }}
        className="space-y-6"
      >
        {moduleSections
          .filter(
            (section) =>
              !section.stableOnly || subscription?.planTier === "stable",
          )
          .map((section) => {
            const sectionModules = moduleCategories.filter((cat) =>
              section.ids.includes(cat.id),
            );
            if (sectionModules.length === 0) return null;

            return (
              <div key={section.label}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="font-serif text-base font-semibold">
                    {section.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    · {section.description}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sectionModules.map((cat, i) => (
                    <PremiumModuleCard key={cat.id} category={cat} index={i} />
                  ))}
                </div>
              </div>
            );
          })}

        {subscription?.planTier !== "stable" && (
          <div className="mt-4 p-4 rounded-xl border border-yellow-500/20 bg-yellow-50/30 dark:bg-yellow-900/10 flex items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                  Stable Plan Features
                </p>
                <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70">
                  Unlock team management, client portal & staff tools
                </p>
              </div>
            </div>
            <Link href="/billing">
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-yellow-500/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
              >
                Upgrade
              </Button>
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
