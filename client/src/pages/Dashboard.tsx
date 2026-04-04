import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
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
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { motion } from "framer-motion";
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
} from "lucide-react";

// ─── All Modules data — mirrors mobile "More" sheet exactly ─────────────────

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
      { icon: Users, label: "Lessons", path: "/lessons" },
      { icon: Baby, label: "Breeding", path: "/breeding" },
    ],
  },
  {
    label: "Nutrition",
    items: [
      { icon: Apple, label: "Feeding Plans", path: "/feeding" },
      { icon: FileText, label: "Nutrition Plans", path: "/nutrition-plans" },
      { icon: BookOpen, label: "Nutrition Logs", path: "/nutrition-logs" },
      { icon: ShoppingCart, label: "Feed Costs", path: "/feed-costs" },
    ],
  },
  {
    label: "Data & Reports",
    items: [
      { icon: FileText, label: "Documents", path: "/documents" },
      { icon: BarChart3, label: "Analytics", path: "/analytics" },
      { icon: FileText, label: "Reports", path: "/reports" },
      { icon: Tag, label: "Tags", path: "/tags" },
      { icon: GitBranch, label: "Pedigree", path: "/pedigree" },
      { icon: Shield, label: "Equine Passport", path: "/equine-passport" },
    ],
  },
  {
    label: "Stable & People",
    items: [
      { icon: Home, label: "Stable Management", path: "/stable" },
      { icon: UserCog, label: "Staff", path: "/staff" },
      { icon: MessageSquare, label: "Messages", path: "/messages" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: Settings, label: "Settings", path: "/settings" },
      { icon: DollarSign, label: "Billing", path: "/billing" },
    ],
  },
];

// Helper: map task priority to a dot color class
const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};
function taskPriorityColor(priority: string): string {
  return PRIORITY_COLOR[priority] ?? "bg-green-500";
}

// Quick actions for the pill row
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
    label: "Weather",
    href: "/weather",
    icon: CloudSun,
    color: "from-sky-500 to-blue-600",
  },
  {
    label: "AI Chat",
    href: "/ai-chat",
    icon: Sparkles,
    color: "from-indigo-500 to-violet-600",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    color: "from-cyan-500 to-blue-600",
  },
];

function DashboardContent() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: stats } = trpc.user.getDashboardStats.useQuery(undefined, {
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
  const { data: subscription } = trpc.user.getSubscriptionStatus.useQuery();
  const { data: trainingStats } = trpc.analytics.getTrainingStats.useQuery(
    {},
    { retry: false },
  );
  const { data: horses = [] } = trpc.horses.list.useQuery(undefined, {
    retry: false,
    staleTime: 2 * 60 * 1000,
  });
  const { data: upcomingAppointments = [] } = trpc.appointments.list.useQuery(
    undefined,
    { retry: false },
  );
  const { data: tasks = [] } = trpc.tasks.list.useQuery(undefined, {
    retry: false,
  });

  // Redirect Stable plan users to the Stable Dashboard
  // Skip redirect if user has both dashboards unlocked (admin-granted free access)
  useEffect(() => {
    if (subscription?.planTier === "stable" && !subscription?.bothDashboardsUnlocked) {
      setLocation("/stable-dashboard");
    }
  }, [subscription?.planTier, subscription?.bothDashboardsUnlocked, setLocation]);

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

  // Single calendar query for the next 30 days — filtered client-side for "today"
  // to avoid two separate HTTP requests on every Dashboard mount.
  const { data: allCalendarEvents = [] } = trpc.calendar.getEvents.useQuery(
    {
      startDate: todayStart.toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    { retry: false, staleTime: 5 * 60 * 1000 },
  );

  // Split into today's events and all upcoming events from the single response
  const calendarEvents = allCalendarEvents.filter((e: any) => {
    const d = new Date(e.startDate);
    return d >= todayStart && d < todayEnd;
  });
  const upcomingCalendarEvents = allCalendarEvents;

  const greeting = (() => {
    const h = today.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

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
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800 gap-1 text-[11px]">
            <Star className="w-3 h-3" />
            {trialDays}d trial
          </Badge>
        );
      }
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 gap-1 text-[11px]">
            <Zap className="w-3 h-3" />
            Starter
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <AlertCircle className="w-3 h-3" />
            Overdue
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="gap-1 text-[11px]">
            <AlertCircle className="w-3 h-3" />
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  const futureAppointments = upcomingAppointments
    .filter((a: any) => new Date(a.appointmentDate) >= new Date())
    .sort(
      (a: any, b: any) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )
    .slice(0, 4);

  const activeTasks = (tasks as any[]).filter((t: any) => !t.isCompleted);

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

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800/90 to-emerald-950/40 p-5 sm:p-6 text-white shadow-xl shadow-black/30 border border-white/10"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-6 right-14 h-28 w-28 rounded-full bg-white/[0.04]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-300/80 mb-1">
              {greeting}, {user?.name?.split(" ")[0] || "Rider"} 🐎
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              My Dashboard
            </h1>
            <p className="text-white/50 text-xs mt-1">
              {today.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {getSubscriptionBadge()}
          </div>
        </div>

        {/* Quick action pills */}
        <div className="relative mt-4 flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <button className="flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-medium text-white border border-white/15">
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center`}
                  >
                    <ActionIcon className="w-2.5 h-2.5 text-white" />
                  </div>
                  {action.label}
                </button>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-3 gap-3 sm:gap-4"
      >
        <Link href="/horses">
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-950/40 to-pink-950/30 hover:from-rose-950/60 transition-all cursor-pointer text-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold leading-none">{(horses as any[]).length}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Horses
            </p>
          </div>
        </Link>
        <Link href="/calendar">
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-950/40 to-violet-950/30 hover:from-purple-950/60 transition-all cursor-pointer text-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold leading-none">
              {(upcomingCalendarEvents as any[]).length}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Events
            </p>
          </div>
        </Link>
        <Link href="/tasks">
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-orange-950/30 hover:from-amber-950/60 transition-all cursor-pointer text-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold leading-none">
              {activeTasks.length}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Tasks
            </p>
          </div>
        </Link>
      </motion.div>

      {/* ── Alerts ───────────────────────────────────────────── */}
      {healthAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {healthAlerts.map((alert) => (
            <Link key={alert.id} href={alert.href}>
              <div className="flex items-center justify-between p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 cursor-pointer hover:bg-amber-500/10 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <p className="text-sm font-medium text-amber-300">
                    {alert.message}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
              </div>
            </Link>
          ))}
        </motion.div>
      )}

      {/* ── Getting Started (shown when user has no horses yet) ───── */}
      {(horses as any[]).length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-slate-950/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Getting Started
              </CardTitle>
              <CardDescription className="text-[11px]">
                Welcome! Complete these steps to set up your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/horses/new">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-indigo-500/15 bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                    <p className="text-xs font-medium">Add your first horse</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              </Link>
              <Link href="/settings">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-indigo-500/15 bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                    <p className="text-xs font-medium">Set your location for weather</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              </Link>
              <Link href="/contacts">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-indigo-500/15 bg-indigo-500/5 hover:bg-indigo-500/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="text-xs font-medium">Add your vet or farrier</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Two-column live view ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        {/* Today */}
        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-400" />
              Today
            </CardTitle>
            <CardDescription className="text-[11px]">
              {today.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendarEvents.length === 0 && futureAppointments.length === 0 ? (
              <div className="text-center py-5 text-muted-foreground">
                <CalendarDays className="w-7 h-7 mx-auto mb-2 opacity-25" />
                <p className="text-xs">Nothing scheduled today</p>
                <Link href="/calendar">
                  <Button variant="ghost" size="sm" className="mt-2 text-xs h-7">
                    Open calendar
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {calendarEvents.slice(0, 3).map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-purple-500/15 bg-purple-500/5"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
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
                {futureAppointments.slice(0, 2).map((appt: any) => {
                  const d = new Date(appt.appointmentDate);
                  const isToday =
                    d.toDateString() === new Date().toDateString();
                  if (!isToday) return null;
                  return (
                    <div
                      key={appt.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-muted/30 bg-muted/20"
                    >
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">
                          {appt.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {appt.appointmentType || "Appointment"}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Link href="/calendar">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground mt-1 h-7"
                  >
                    View calendar <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming */}
        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            {futureAppointments.length === 0 ? (
              <div className="text-center py-5 text-muted-foreground">
                <Calendar className="w-7 h-7 mx-auto mb-2 opacity-25" />
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
              <div className="space-y-1.5">
                {futureAppointments.map((appt: any) => {
                  const d = new Date(appt.appointmentDate);
                  const isToday =
                    d.toDateString() === new Date().toDateString();
                  return (
                    <div
                      key={appt.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border ${isToday ? "border-purple-500/25 bg-purple-500/5" : "border-muted/30 bg-muted/20"}`}
                    >
                      <div className="text-center shrink-0 w-8">
                        <p className="text-[9px] text-muted-foreground font-medium uppercase leading-none">
                          {d.toLocaleDateString("en-GB", { month: "short" })}
                        </p>
                        <p className="text-sm font-bold leading-tight">
                          {d.getDate()}
                        </p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate">
                          {appt.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {appt.appointmentType || "Appointment"}
                        </p>
                      </div>
                      {isToday && (
                        <Badge className="text-[9px] h-4 px-1.5 bg-purple-500/20 text-purple-300 border-purple-500/30 shrink-0">
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
                    className="w-full text-xs text-muted-foreground hover:text-foreground mt-1 h-7"
                  >
                    Open calendar <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Horses + Active Tasks ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        {/* Horse Overview */}
        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                My Horses
              </CardTitle>
              <Link href="/horses/new">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 px-2"
                >
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {horses.length === 0 ? (
              <div className="text-center py-5 text-muted-foreground">
                <Heart className="w-7 h-7 mx-auto mb-2 opacity-25" />
                <p className="text-xs">No horses added yet</p>
                <Link href="/horses/new">
                  <Button variant="ghost" size="sm" className="mt-2 text-xs h-7">
                    Add first horse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {(horses as any[]).slice(0, 5).map((horse: any) => (
                  <Link key={horse.id} href={`/horses/${horse.id}`}>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-muted/30 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      {horse.photoUrl ? (
                        <img
                          src={horse.photoUrl}
                          alt={horse.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/images/hero/image6.jpg";
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
                          {horse.age ? ` · ${horse.age}yr` : ""}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                    </div>
                  </Link>
                ))}
                {(horses as any[]).length > 5 && (
                  <Link href="/horses">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground mt-1 h-7"
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Active Tasks
              </CardTitle>
              <Link href="/tasks">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1 px-2"
                >
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {activeTasks.length === 0 ? (
              <div className="text-center py-5 text-muted-foreground">
                <Activity className="w-7 h-7 mx-auto mb-2 opacity-25" />
                <p className="text-xs">No pending tasks</p>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="mt-2 text-xs h-7">
                    Add task
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {activeTasks.slice(0, 6).map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-muted/30 bg-muted/20"
                  >
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${taskPriorityColor(task.priority)}`}
                    />
                    <p className="text-xs font-medium truncate flex-1">
                      {task.title}
                    </p>
                  </div>
                ))}
                {activeTasks.length > 6 && (
                  <Link href="/tasks">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs text-muted-foreground hover:text-foreground mt-1 h-7"
                    >
                      View all tasks <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── KPI Strip ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.22 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          {
            label: "Horses",
            value: stats?.horseCount ?? (horses as any[]).length,
            icon: Heart,
            color: "text-rose-400",
          },
          {
            label: "Training hrs",
            value: Math.round((trainingStats?.totalDuration || 0) / 60),
            icon: Dumbbell,
            color: "text-green-400",
          },
          {
            label: "Upcoming",
            value: stats?.upcomingSessionCount || 0,
            icon: Calendar,
            color: "text-purple-400",
          },
          {
            label: "Health alerts",
            value: stats?.reminderCount || 0,
            icon: Stethoscope,
            color: "text-amber-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 p-3 rounded-xl border border-muted/30 bg-card/60"
          >
            <Icon className={`w-4 h-4 shrink-0 ${color}`} />
            <div>
              <p className="text-lg font-bold leading-none">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {label}
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── All Modules (same style as mobile More sheet) ───── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.28 }}
        className="space-y-4"
      >
        <h2 className="font-serif text-base font-semibold px-0.5">
          All Modules
        </h2>
        <div className="space-y-4">
          {dashboardModuleGroups.map((group) => {
            const isStablePlan =
              subscription?.bothDashboardsUnlocked ||
              subscription?.planTier === "stable";
            const items = group.items.filter((item) => {
              if (
                !isStablePlan &&
                (item.label === "Breeding" ||
                  item.label === "Stable Management" ||
                  item.label === "Staff" ||
                  item.label === "Messages")
              )
                return false;
              return true;
            });
            if (items.length === 0) return null;
            return (
              <div key={group.label}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {group.label}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => setLocation(item.path)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center min-h-[72px] ${
                          isActive
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card hover:bg-accent"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="text-[11px] leading-tight font-medium">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
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
