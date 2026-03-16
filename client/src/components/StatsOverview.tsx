import { Heart, Activity, Calendar, Bell, TrendingUp } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useTranslation } from "react-i18next";

interface StatsOverviewProps {
  totalHorses?: number;
  trainingHours?: number;
  upcomingEvents?: number;
  healthReminders?: number;
}

export function StatsOverview({
  totalHorses = 0,
  trainingHours = 0,
  upcomingEvents = 0,
  healthReminders = 0,
}: StatsOverviewProps) {
  const { t } = useTranslation();

  const stats = [
    {
      title: t("dashboard.stats.totalHorses"),
      display: String(totalHorses),
      icon: Heart,
      gradient: "from-rose-500 to-pink-600",
      shadow: "shadow-rose-500/20",
      trend: totalHorses > 0,
      sub: totalHorses === 0 ? "Add your first horse" : "In your stable",
    },
    {
      title: t("dashboard.stats.trainingHours"),
      display: `${trainingHours}h`,
      icon: Activity,
      gradient: "from-emerald-500 to-green-600",
      shadow: "shadow-emerald-500/20",
      trend: trainingHours > 0,
      sub: trainingHours === 0 ? "Log your first session" : "This month",
    },
    {
      title: t("dashboard.stats.upcomingEvents"),
      display: String(upcomingEvents),
      icon: Calendar,
      gradient: "from-violet-500 to-purple-600",
      shadow: "shadow-violet-500/20",
      trend: upcomingEvents > 0,
      sub: upcomingEvents === 0 ? "Nothing scheduled" : "Upcoming",
    },
    {
      title: t("dashboard.stats.healthReminders"),
      display: String(healthReminders),
      icon: Bell,
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
      trend: healthReminders > 0,
      sub: healthReminders === 0 ? "All clear" : "Need attention",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={`border-muted/50 shadow-md ${stat.shadow} transition-shadow hover:shadow-lg`}
          >
            <CardContent className="p-4 pt-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-sm`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                {stat.trend && (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500 mt-1" />
                )}
              </div>
              <div className="text-2xl font-bold tracking-tight">
                {stat.display}
              </div>
              <p className="text-[11px] font-medium text-muted-foreground mt-0.5 truncate">
                {stat.title}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {stat.sub}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
