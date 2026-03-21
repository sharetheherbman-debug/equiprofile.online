import { useAuth } from "@/_core/hooks/useAuth";
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
  Home,
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
  AlertCircle,
  Wrench,
} from "lucide-react";

type HorseEntry = {
  id: number;
  name: string;
  breed?: string | null;
  age?: number | null;
  photoUrl?: string | null;
};

// Stable-specific operational modules — all with real routes
const stableOperations = [
  {
    title: "Horse Roster",
    description: "All horses in the stable",
    icon: Heart,
    href: "/horses",
    color: "from-rose-500 to-pink-600",
    accent: "border-rose-500/30",
  },
  {
    title: "Staff Management",
    description: "Trainers, grooms, and yard team",
    icon: UserCog,
    href: "/staff",
    color: "from-blue-500 to-cyan-600",
    accent: "border-blue-500/30",
  },
  {
    title: "Owners & Clients",
    description: "Horse owners and client contacts",
    icon: Users,
    href: "/contacts",
    color: "from-purple-500 to-violet-600",
    accent: "border-purple-500/30",
  },
  {
    title: "Stable Calendar",
    description: "Scheduling for the whole yard",
    icon: Calendar,
    href: "/calendar",
    color: "from-indigo-500 to-blue-600",
    accent: "border-indigo-500/30",
  },
  {
    title: "Training Operations",
    description: "Sessions and training programmes",
    icon: Dumbbell,
    href: "/training",
    color: "from-green-500 to-emerald-600",
    accent: "border-green-500/30",
  },
  {
    title: "Health Operations",
    description: "Vet records and medical history",
    icon: Stethoscope,
    href: "/health",
    color: "from-teal-500 to-cyan-600",
    accent: "border-teal-500/30",
  },
  {
    title: "Tasks & Workflows",
    description: "Yard tasks and daily operations",
    icon: ClipboardList,
    href: "/tasks",
    color: "from-amber-500 to-orange-600",
    accent: "border-amber-500/30",
  },
  {
    title: "Documents",
    description: "Stable records and documents",
    icon: FolderOpen,
    href: "/documents",
    color: "from-yellow-500 to-amber-600",
    accent: "border-yellow-500/30",
  },
  {
    title: "Billing & Admin",
    description: "Subscription and billing",
    icon: DollarSign,
    href: "/billing",
    color: "from-emerald-500 to-green-600",
    accent: "border-emerald-500/30",
  },
  {
    title: "Stable Setup",
    description: "Configure your stable profile",
    icon: Wrench,
    href: "/stable-setup",
    color: "from-slate-500 to-gray-600",
    accent: "border-slate-500/30",
  },
  {
    title: "Stable Profile",
    description: "Business details and yard info",
    icon: Building2,
    href: "/stable",
    color: "from-orange-500 to-amber-600",
    accent: "border-orange-500/30",
  },
  {
    title: "Settings",
    description: "Account and stable preferences",
    icon: Settings,
    href: "/settings",
    color: "from-gray-500 to-slate-600",
    accent: "border-gray-500/30",
  },
];

function StableDashboardContent() {
  const { user } = useAuth();
  const { data: horses = [], isLoading: horsesLoading } =
    trpc.horses.list.useQuery(undefined, { retry: false, staleTime: 0 });
  const { data: subscriptionStatus, isLoading: subLoading } =
    trpc.user.getSubscriptionStatus.useQuery();
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
        <p className="text-muted-foreground mb-6 max-w-md text-sm">
          The Stable Dashboard is available exclusively for Stable plan
          subscribers. Upgrade to access full stable management, staff tools,
          client portal, and more.
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

  return (
    <div className="space-y-6 pb-6">
      {/* Stable Operations Hero */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950 p-6 text-white shadow-xl shadow-black/30 border border-white/10"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-16 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-100 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Stable Operations Platform
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              {user?.name?.split(" ")[0] || "Manager"}&apos;s Stable
            </h1>
            <p className="text-amber-200 text-sm">
              Manage your entire stable from one place
            </p>
          </div>
          <div className="flex flex-wrap items-start gap-2 shrink-0">
            <Badge className="bg-white/20 text-white border-white/30 gap-1">
              <Shield className="w-3 h-3" />
              Stable Plan
            </Badge>
            <Badge className="bg-amber-500/30 text-amber-200 border-amber-500/40 gap-1">
              <Heart className="w-3 h-3" />
              {horsesLoading ? "..." : horses.length} Horses
            </Badge>
          </div>
        </div>
        {/* Quick actions */}
        <div className="relative mt-4 flex flex-wrap gap-2">
          <Link href="/horses/new">
            <Button
              size="sm"
              className="h-8 text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Horse
            </Button>
          </Link>
          <Link href="/staff">
            <Button
              size="sm"
              className="h-8 text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 gap-1"
            >
              <UserCog className="w-3.5 h-3.5" /> Add Staff
            </Button>
          </Link>
          <Link href="/stable-setup">
            <Button
              size="sm"
              className="h-8 text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 gap-1"
            >
              <Wrench className="w-3.5 h-3.5" /> Stable Setup
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Horse Roster Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Stable Horses
              </CardTitle>
              <Link href="/horses/new">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Horse
                </Button>
              </Link>
            </div>
            <CardDescription className="text-xs">
              {horsesLoading
                ? "Loading..."
                : `${horses.length} horse${horses.length !== 1 ? "s" : ""} in your stable`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {horsesLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : horses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No horses registered yet</p>
                <Link href="/horses/new">
                  <Button variant="ghost" size="sm" className="mt-2">
                    Add your first horse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(horses as HorseEntry[]).slice(0, 6).map((horse) => (
                  <Link key={horse.id} href={`/horses/${horse.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-muted/40 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      {horse.photoUrl ? (
                        <img
                          src={horse.photoUrl}
                          alt={horse.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/images/hero/image6.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0">
                          <span className="text-xs text-white font-bold">
                            {horse.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {horse.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {horse.breed || "Unknown breed"}
                          {horse.age ? ` · ${horse.age}yr` : ""}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {(horses as HorseEntry[]).length > 6 && (
              <Link href="/horses">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground"
                >
                  View all {horses.length} horses{" "}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stable Operations Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="font-serif text-lg font-bold">Stable Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {stableOperations.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
              >
                <Link href={module.href}>
                  <div
                    className={`group relative rounded-xl border ${module.accent} bg-card/80 backdrop-blur-sm p-4 h-full cursor-pointer hover:shadow-lg hover:bg-card/90 hover:border-opacity-60 transition-all duration-200 hover:-translate-y-0.5`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-sm shrink-0`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm leading-tight">
                          {module.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                          {module.description}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-0.5 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Setup reminder */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-300">
              Complete your stable setup
            </p>
            <p className="text-xs text-amber-400/70 mt-0.5">
              Add your stable details, staff members, and owners to get the most
              out of your Stable plan.
            </p>
          </div>
          <Link href="/stable-setup">
            <Button
              size="sm"
              className="h-8 text-xs shrink-0 bg-amber-600 hover:bg-amber-700 text-white border-0 gap-1"
            >
              Setup <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
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
