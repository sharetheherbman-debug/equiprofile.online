import { Plus, Calendar, FileText, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { useLocation } from "wouter";

export function QuickActionsWidget() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const actions = [
    {
      icon: Plus,
      title: t("dashboard.addHorse"),
      description: "Add a new horse to your profile",
      href: "/horses/new",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: Calendar,
      title: t("dashboard.scheduleTraining"),
      description: "Schedule a training session",
      href: "/training",
      color: "text-green-600 dark:text-green-400",
    },
    {
      icon: FileText,
      title: t("dashboard.logHealth"),
      description: "Log a health record",
      href: "/health",
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      icon: Activity,
      title: "View Analytics",
      description: "Check performance insights",
      href: "/analytics",
      color: "text-orange-600 dark:text-orange-400",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.quickActions")}</CardTitle>
        <CardDescription>Common tasks to help you get started</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.href}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2"
                onClick={() => setLocation(action.href)}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className={`h-5 w-5 ${action.color}`} />
                  <span className="font-semibold">{action.title}</span>
                </div>
                <p className="text-sm text-muted-foreground text-left">
                  {action.description}
                </p>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
