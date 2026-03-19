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
  Trophy,
  ChevronRight,
  Plus,
  Shield,
  Building2,
  UserCog,
  Briefcase,
} from "lucide-react";

type HorseEntry = {
  id: number;
  name: string;
  breed?: string | null;
  age?: number | null;
  photoUrl?: string | null;
};

function StableDashboardContent() {
  const { user } = useAuth();
  const { data: horses = [] } = trpc.horses.list.useQuery(undefined, {
    retry: false,
  });
  const { data: subscriptionStatus } =
    trpc.user.getSubscriptionStatus.useQuery();
  const isStablePlan = subscriptionStatus?.planTier === "stable";

  if (!isStablePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-serif text-2xl font-bold mb-2">
          Stable Plan Required
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          The Stable Dashboard is available exclusively for Stable plan
          subscribers. Upgrade to access horse roster management, staff tools,
          owner portal, and more.
        </p>
        <Link href="/billing">
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white border-0"
          >
            Upgrade to Stable Plan
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  const stableModules = [
    {
      title: "Horse Roster",
      description: `${horses.length} horse${horses.length !== 1 ? "s" : ""} registered`,
      icon: Heart,
      href: "/horses",
      color: "from-rose-500 to-pink-600",
      accent: "border-rose-500/30",
    },
    {
      title: "Staff Management",
      description: "Manage yard staff and roles",
      icon: Users,
      href: "/contacts",
      color: "from-blue-500 to-cyan-600",
      accent: "border-blue-500/30",
    },
    {
      title: "Owner Portal",
      description: "Client and owner access",
      icon: Shield,
      href: "/contacts",
      color: "from-purple-500 to-violet-600",
      accent: "border-purple-500/30",
    },
    {
      title: "Training Logs",
      description: "All sessions and programs",
      icon: Dumbbell,
      href: "/training",
      color: "from-green-500 to-emerald-600",
      accent: "border-green-500/30",
    },
    {
      title: "Vet Records",
      description: "Health and medical history",
      icon: Stethoscope,
      href: "/health",
      color: "from-teal-500 to-cyan-600",
      accent: "border-teal-500/30",
    },
    {
      title: "Competitions",
      description: "Competition tracking and results",
      icon: Trophy,
      href: "/competitions",
      color: "from-amber-500 to-orange-600",
      accent: "border-amber-500/30",
    },
    {
      title: "Stable Calendar",
      description: "Schedule for all horses",
      icon: Calendar,
      href: "/calendar",
      color: "from-indigo-500 to-blue-600",
      accent: "border-indigo-500/30",
    },
    {
      title: "Stable Settings",
      description: "Manage your stable",
      icon: Home,
      href: "/stable",
      color: "from-slate-500 to-gray-600",
      accent: "border-slate-500/30",
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950 to-orange-950 p-6 text-white shadow-xl shadow-black/30 border border-white/10"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-16 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-amber-100 mb-1 flex items-center gap-2">
              <Home className="w-4 h-4" /> Stable Management
            </p>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              {user?.name?.split(" ")[0] || "Manager"}&apos;s Stable
            </h1>
            <p className="text-amber-200 text-sm mt-1">
              Professional stable management dashboard
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className="bg-white/20 text-white border-white/30 gap-1">
              <Shield className="w-3 h-3" />
              Stable Plan
            </Badge>
          </div>
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
                Horse Roster
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
              {horses.length} horse{horses.length !== 1 ? "s" : ""} registered
              in your stable
            </CardDescription>
          </CardHeader>
          <CardContent>
            {horses.length === 0 ? (
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
                {horses.slice(0, 6).map((horse: HorseEntry) => (
                  <Link key={horse.id} href={`/horses/${horse.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-muted/40 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      {horse.photoUrl ? (
                        <img
                          src={horse.photoUrl}
                          alt={horse.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/assets/marketing/hero/hero-horse.jpg";
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
            {horses.length > 6 && (
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

      {/* Stable Modules Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-3"
      >
        <h2 className="font-serif text-lg font-bold">Stable Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stableModules.map((module, index) => {
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
