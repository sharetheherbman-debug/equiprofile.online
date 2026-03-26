import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
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
  Users,
  Calendar,
  Dumbbell,
  Stethoscope,
  ChevronRight,
  Plus,
  Shield,
  Building2,
  UserCog,
  FolderOpen,
  Settings,
  ClipboardList,
  DollarSign,
  Loader2,
  Wrench,
  BarChart3,
  MessageSquare,
  Baby,
  Activity,
  Clock,
  Brain,
  AlertCircle,
  Navigation,
} from "lucide-react";

type HorseEntry = {
  id: number;
  name: string;
  breed?: string | null;
  age?: number | null;
  photoUrl?: string | null;
};

// ─── Stable operational quick-stats ────────────────────────────────────────

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-green-500",
};
function taskPriorityColor(priority: string): string {
  return PRIORITY_COLOR[priority] ?? "bg-green-500";
}

const stableOps = [
  {
    id: "roster",
    title: "Horse Roster",
    description: "All horses in the stable",
    icon: Heart,
    href: "/horses",
    color: "from-rose-500 to-pink-600",
    accent: "border-rose-500/25",
  },
  {
    id: "staff",
    title: "Staff",
    description: "Trainers, grooms & yard team",
    icon: UserCog,
    href: "/staff",
    color: "from-blue-500 to-cyan-600",
    accent: "border-blue-500/25",
  },
  {
    id: "clients",
    title: "Owners & Clients",
    description: "Horse owners and contacts",
    icon: Users,
    href: "/contacts",
    color: "from-purple-500 to-violet-600",
    accent: "border-purple-500/25",
  },
  {
    id: "calendar",
    title: "Yard Calendar",
    description: "Stable-wide scheduling",
    icon: Calendar,
    href: "/calendar",
    color: "from-indigo-500 to-blue-600",
    accent: "border-indigo-500/25",
  },
  {
    id: "training",
    title: "Training Ops",
    description: "Sessions & programmes",
    icon: Dumbbell,
    href: "/training",
    color: "from-green-500 to-emerald-600",
    accent: "border-green-500/25",
  },
  {
    id: "health",
    title: "Health Records",
    description: "Vet records & medical",
    icon: Stethoscope,
    href: "/health",
    color: "from-teal-500 to-cyan-600",
    accent: "border-teal-500/25",
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Yard tasks & workflows",
    icon: ClipboardList,
    href: "/tasks",
    color: "from-amber-500 to-orange-600",
    accent: "border-amber-500/25",
  },
  {
    id: "lessons",
    title: "Lessons",
    description: "Lesson scheduling",
    icon: Activity,
    href: "/lessons",
    color: "from-lime-500 to-green-600",
    accent: "border-lime-500/25",
  },
  {
    id: "breeding",
    title: "Breeding",
    description: "Foaling & lineage records",
    icon: Baby,
    href: "/breeding",
    color: "from-pink-500 to-rose-600",
    accent: "border-pink-500/25",
  },
  {
    id: "messages",
    title: "Messages",
    description: "Team & client messaging",
    icon: MessageSquare,
    href: "/messages",
    color: "from-sky-500 to-blue-600",
    accent: "border-sky-500/25",
  },
  {
    id: "documents",
    title: "Documents",
    description: "Stable records & files",
    icon: FolderOpen,
    href: "/documents",
    color: "from-yellow-500 to-amber-600",
    accent: "border-yellow-500/25",
  },
  {
    id: "gps",
    title: "GPS Tracking",
    description: "Ride & route tracking",
    icon: Navigation,
    href: "/ride-tracking",
    color: "from-cyan-500 to-sky-600",
    accent: "border-cyan-500/25",
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Reports & performance data",
    icon: BarChart3,
    href: "/analytics",
    color: "from-violet-500 to-purple-600",
    accent: "border-violet-500/25",
  },
  {
    id: "ai",
    title: "AI Assistant",
    description: "Smart equestrian advisor",
    icon: Brain,
    href: "/ai-chat",
    color: "from-indigo-500 to-violet-600",
    accent: "border-indigo-500/25",
  },
  {
    id: "billing",
    title: "Billing",
    description: "Subscription & payments",
    icon: DollarSign,
    href: "/billing",
    color: "from-emerald-500 to-green-600",
    accent: "border-emerald-500/25",
  },
  {
    id: "stableSetup",
    title: "Stable Setup",
    description: "Configure your stable",
    icon: Wrench,
    href: "/stable-setup",
    color: "from-slate-500 to-gray-600",
    accent: "border-slate-500/25",
  },
  {
    id: "stableProfile",
    title: "Stable Profile",
    description: "Business & yard details",
    icon: Building2,
    href: "/stable",
    color: "from-orange-500 to-amber-600",
    accent: "border-orange-500/25",
  },
  {
    id: "settings",
    title: "Settings",
    description: "Account preferences",
    icon: Settings,
    href: "/settings",
    color: "from-gray-500 to-slate-600",
    accent: "border-gray-500/25",
  },
];

function StableDashboardContent() {
  const { user } = useAuth();
  const { data: horses = [], isLoading: horsesLoading } =
    trpc.horses.list.useQuery(undefined, { retry: false, staleTime: 0 });
  const { data: subscriptionStatus, isLoading: subLoading } =
    trpc.user.getSubscriptionStatus.useQuery();
  const { data: tasks = [] } = trpc.tasks.list.useQuery(undefined, {
    retry: false,
  });
  const { data: upcomingAppointments = [] } = trpc.appointments.list.useQuery(
    undefined,
    { retry: false },
  );
  const isStablePlan = subscriptionStatus?.planTier === "stable";

  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isStablePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">
          Stable Plan Required
        </h2>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          The Stable Dashboard is exclusively for Stable plan subscribers.
          Upgrade to access full stable management, staff tools, client portal,
          and more.
        </p>
        <Link href="/billing">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0"
          >
            Upgrade to Stable Plan
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  const today = new Date();
  const activeTasks = (tasks as any[]).filter((t: any) => !t.isCompleted);
  const futureAppointments = (upcomingAppointments as any[])
    .filter((a: any) => new Date(a.appointmentDate) >= new Date())
    .sort(
      (a: any, b: any) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )
    .slice(0, 4);

  const greeting = (() => {
    const h = today.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* ── Stable Hero ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/60 to-orange-950/40 p-5 sm:p-6 text-white shadow-xl shadow-black/30 border border-amber-500/20"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-amber-500/10" />
        <div className="pointer-events-none absolute -bottom-6 right-14 h-28 w-28 rounded-full bg-orange-500/[0.07]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-amber-300/70 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {greeting}, {user?.name?.split(" ")[0] || "Manager"}
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              Stable Operations
            </h1>
            <p className="text-amber-200/50 text-xs">
              {today.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-2 shrink-0">
            <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30 gap-1 text-[11px]">
              <Shield className="w-3 h-3" />
              Stable Plan
            </Badge>
            <Badge className="bg-white/10 text-white/80 border-white/15 gap-1 text-[11px]">
              <Heart className="w-3 h-3" />
              {horsesLoading ? "…" : (horses as HorseEntry[]).length} Horses
            </Badge>
          </div>
        </div>

        {/* Quick actions */}
        <div className="relative mt-4 flex flex-wrap gap-2">
          <Link href="/horses/new">
            <Button
              size="sm"
              className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Horse
            </Button>
          </Link>
          <Link href="/staff">
            <Button
              size="sm"
              className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 gap-1"
            >
              <UserCog className="w-3.5 h-3.5" /> Staff
            </Button>
          </Link>
          <Link href="/calendar">
            <Button
              size="sm"
              className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 gap-1"
            >
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </Button>
          </Link>
          <Link href="/ai-chat">
            <Button
              size="sm"
              className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/15 gap-1"
            >
              <Brain className="w-3.5 h-3.5" /> AI
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Operational KPIs ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-3 gap-3 sm:gap-4"
      >
        <Link href="/horses">
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-rose-500/20 bg-gradient-to-br from-rose-950/40 to-pink-950/20 hover:from-rose-950/60 transition-all cursor-pointer text-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold leading-none">
              {horsesLoading ? "…" : (horses as HorseEntry[]).length}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Horses
            </p>
          </div>
        </Link>
        <Link href="/tasks">
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 to-orange-950/20 hover:from-amber-950/60 transition-all cursor-pointer text-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold leading-none">{activeTasks.length}</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Tasks
            </p>
          </div>
        </Link>
        <Link href="/calendar">
          <div className="flex flex-col items-center gap-1 p-3 rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/40 to-blue-950/20 hover:from-indigo-950/60 transition-all cursor-pointer text-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <p className="text-xl font-bold leading-none">
              {futureAppointments.length}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Upcoming
            </p>
          </div>
        </Link>
      </motion.div>

      {/* ── Getting Started (shown when no horses yet) ─────────── */}
      {(horses as HorseEntry[]).length === 0 && !horsesLoading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-slate-950/40">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/stable-setup">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <p className="text-xs font-medium">Complete stable setup</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              </Link>
              <Link href="/horses/new">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                    <p className="text-xs font-medium">Add your first horse</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              </Link>
              <Link href="/staff">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/15 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-blue-400 shrink-0" />
                    <p className="text-xs font-medium">Add staff members</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Horse Roster + Upcoming (two-column) ────────────────*/}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        {/* Horse Roster */}
        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                Horse Roster
              </CardTitle>
              <Link href="/horses/new">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2">
                  <Plus className="w-3 h-3" /> Add
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {horsesLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (horses as HorseEntry[]).length === 0 ? (
              <div className="text-center py-5 text-muted-foreground">
                <Heart className="w-7 h-7 mx-auto mb-2 opacity-25" />
                <p className="text-xs">No horses registered</p>
                <Link href="/horses/new">
                  <Button variant="ghost" size="sm" className="mt-2 text-xs h-7">
                    Add first horse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {(horses as HorseEntry[]).slice(0, 5).map((horse) => (
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
                {(horses as HorseEntry[]).length > 5 && (
                  <Link href="/horses">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-1 text-xs text-muted-foreground hover:text-foreground h-7"
                    >
                      View all {(horses as HorseEntry[]).length} horses{" "}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments + Active Tasks */}
        <div className="flex flex-col gap-3">
          <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {futureAppointments.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Calendar className="w-6 h-6 mx-auto mb-2 opacity-25" />
                  <p className="text-xs">No upcoming appointments</p>
                  <Link href="/appointments">
                    <Button variant="ghost" size="sm" className="mt-1 text-xs h-7">
                      Schedule
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
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs ${isToday ? "border-amber-500/25 bg-amber-500/5" : "border-muted/30 bg-muted/20"}`}
                      >
                        <div className="text-center shrink-0 w-7">
                          <p className="text-[9px] text-muted-foreground uppercase leading-none">
                            {d.toLocaleDateString("en-GB", { month: "short" })}
                          </p>
                          <p className="text-sm font-bold leading-tight">
                            {d.getDate()}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{appt.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {appt.appointmentType || "Appointment"}
                          </p>
                        </div>
                        {isToday && (
                          <Badge className="text-[9px] h-4 px-1.5 bg-amber-500/20 text-amber-300 border-amber-500/30 shrink-0">
                            Today
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          {activeTasks.length > 0 && (
            <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Pending Tasks
                    <Badge className="text-[9px] h-4 px-1.5 bg-amber-500/20 text-amber-300 border-amber-500/30">
                      {activeTasks.length}
                    </Badge>
                  </CardTitle>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                      View all
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {activeTasks.slice(0, 4).map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-muted/25 bg-muted/15 text-xs"
                    >
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${taskPriorityColor(task.priority)}`}
                      />
                      <p className="font-medium truncate">{task.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* ── Stable Operations Grid ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        className="space-y-3"
      >
        <h2 className="font-serif text-base font-semibold px-0.5">
          Stable Operations
        </h2>
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {stableOps.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.18 + index * 0.03 }}
              >
                <Link href={module.href}>
                  <div
                    className={`group relative rounded-xl border ${module.accent} bg-card/70 backdrop-blur-sm p-3.5 h-full cursor-pointer hover:shadow-md hover:bg-card/90 transition-all duration-200 active:scale-[0.98]`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-sm shrink-0`}
                      >
                        <Icon className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-xs leading-tight">
                          {module.title}
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                          {module.description}
                        </p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default function StableDashboard() {
  return (
    <DashboardLayout>
      <StableDashboardContent />
    </DashboardLayout>
  );
}
