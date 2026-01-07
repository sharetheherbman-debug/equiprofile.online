import { Activity, Heart, FileText, Calendar, Syringe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

interface ActivityItem {
  id: string;
  type: 'horse' | 'health' | 'training' | 'document';
  title: string;
  description: string;
  timestamp: Date;
  horseName?: string;
}

const activityTypeIcons = {
  horse: Heart,
  health: Syringe,
  training: Activity,
  document: FileText,
};

const activityTypeColors = {
  horse: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
  health: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300",
  training: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
  document: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300",
};

interface ActivityFeedProps {
  activities?: ActivityItem[];
  maxHeight?: string;
}

export function ActivityFeed({ activities = [], maxHeight = "400px" }: ActivityFeedProps) {
  const { t } = useTranslation();

  // Sample activities for empty state
  const sampleActivities: ActivityItem[] = activities.length > 0 ? activities : [
    {
      id: '1',
      type: 'horse',
      title: 'Horse Added',
      description: 'New horse profile created',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      horseName: 'Example Horse',
    },
    {
      id: '2',
      type: 'training',
      title: 'Training Session',
      description: 'Completed flatwork training',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      horseName: 'Example Horse',
    },
    {
      id: '3',
      type: 'health',
      title: 'Health Record',
      description: 'Vaccination administered',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      horseName: 'Example Horse',
    },
  ];

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t("dashboard.activityFeed")}
        </CardTitle>
        <CardDescription>{t("dashboard.recentActivity")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ height: maxHeight }}>
          <div className="space-y-4">
            {(activities.length > 0 ? activities : sampleActivities).map((activity) => {
              const Icon = activityTypeIcons[activity.type];
              const colorClass = activityTypeColors[activity.type];

              return (
                <div key={activity.id} className="flex gap-3 items-start">
                  <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    {activity.horseName && (
                      <Badge variant="outline" className="text-xs">
                        {activity.horseName}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
