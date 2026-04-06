import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Eye,
  Users,
  Clock,
  MousePointerClick,
  UserPlus,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Activity,
  ArrowUpRight,
} from "lucide-react";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function formatSource(source: string): string {
  if (source === "Direct") return "Direct";
  try {
    const url = new URL(source);
    return url.hostname;
  } catch {
    return source.slice(0, 40);
  }
}

function DeviceIcon({ device }: { device: string }) {
  switch (device) {
    case "mobile":
      return <Smartphone className="w-4 h-4" />;
    case "tablet":
      return <Tablet className="w-4 h-4" />;
    default:
      return <Monitor className="w-4 h-4" />;
  }
}

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  const analytics = trpc.admin.getAnalytics.useQuery({ period });

  const data = analytics.data;

  const statCards = [
    {
      label: "Total Visits",
      value: data?.totalVisits || 0,
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Unique Visitors",
      value: data?.uniqueVisitors || 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Page Views",
      value: data?.pageViews || 0,
      icon: BarChart3,
      color: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      label: "Avg Session",
      value: formatDuration(data?.avgSessionDuration || 0),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Live Now",
      value: data?.liveVisitors || 0,
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
      pulse: (data?.liveVisitors || 0) > 0,
    },
    {
      label: "CTA Clicks",
      value: data?.ctaClicks || 0,
      icon: MousePointerClick,
      color: "text-pink-600",
      bg: "bg-pink-50 dark:bg-pink-950/30",
    },
    {
      label: "Lead Captures",
      value: data?.leadCaptures || 0,
      icon: UserPlus,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Signups",
      value: data?.signupConversions || 0,
      icon: ArrowUpRight,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Trial → Paid",
      value: data?.trialToPaid || 0,
      icon: TrendingUp,
      color: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Site Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Internal analytics — no external dependencies
          </p>
        </div>
        <Select
          value={period}
          onValueChange={(v) => setPeriod(v as "day" | "week" | "month")}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24h</SelectItem>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabbed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[statCards[0], statCards[1], statCards[3], statCards[4]].map((stat) => (
              <Card key={stat.label} className={stat.bg}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    {stat.pulse && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {analytics.isLoading ? (
                    <Skeleton className="h-7 w-16 mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString()
                        : stat.value}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Monitor className="w-4 h-4" />
                  Devices
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : !data?.deviceBreakdown?.length ? (
                  <p className="text-center text-muted-foreground py-4">
                    No device data yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {data.deviceBreakdown.map(
                      (
                        d: { device: string; count: number },
                        i: number,
                      ) => {
                        const total = data.deviceBreakdown.reduce(
                          (
                            acc: number,
                            x: { device: string; count: number },
                          ) => acc + x.count,
                          0,
                        );
                        const pct =
                          total > 0 ? Math.round((d.count / total) * 100) : 0;
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <DeviceIcon device={d.device} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm capitalize">
                                  {d.device}
                                </span>
                                <span className="text-sm font-medium">
                                  {pct}%
                                </span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {d.count}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="w-4 h-4" />
                  Daily Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : !data?.dailyTrend?.length ? (
                  <p className="text-center text-muted-foreground py-4">
                    No trend data yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Visitors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.dailyTrend.map(
                        (
                          day: {
                            date: string;
                            views: number;
                            visitors: number;
                          },
                          i: number,
                        ) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">
                              {new Date(day.date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                },
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {day.views.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              {day.visitors.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(() => {
              const stat = statCards[1];
              return (
                <Card className={stat.bg}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    {analytics.isLoading ? (
                      <Skeleton className="h-7 w-16 mt-1" />
                    ) : (
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString()
                          : stat.value}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4" />
                  Traffic Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : !data?.trafficSources?.length ? (
                  <p className="text-center text-muted-foreground py-4">
                    No referrer data yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead className="text-right">Visits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.trafficSources.map(
                        (
                          src: { source: string; count: number },
                          i: number,
                        ) => (
                          <TableRow key={i}>
                            <TableCell className="text-sm">
                              {formatSource(src.source)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {src.count.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-4 h-4" />
                  Top Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : !data?.topPages?.length ? (
                  <p className="text-center text-muted-foreground py-4">
                    No page view data yet
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topPages.map(
                        (
                          page: { path: string; views: number },
                          i: number,
                        ) => (
                          <TableRow key={i}>
                            <TableCell className="font-mono text-sm">
                              {page.path}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {page.views.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[statCards[2], statCards[3], statCards[5]].map((stat) => (
              <Card key={stat.label} className={stat.bg}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {analytics.isLoading ? (
                    <Skeleton className="h-7 w-16 mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString()
                        : stat.value}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="w-4 h-4" />
                Engagement Metrics
              </CardTitle>
              <CardDescription>
                Track user interaction and session quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Average Pages per Session</span>
                    <span className="text-lg font-bold">
                      {data?.pageViews && data?.totalVisits 
                        ? (data.pageViews / data.totalVisits).toFixed(1)
                        : "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">CTA Click Rate</span>
                    <span className="text-lg font-bold">
                      {data?.ctaClicks && data?.totalVisits
                        ? ((data.ctaClicks / data.totalVisits) * 100).toFixed(1)
                        : "0"}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversions Tab */}
        <TabsContent value="conversions" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[statCards[6], statCards[7], statCards[8]].map((stat) => (
              <Card key={stat.label} className={stat.bg}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  {analytics.isLoading ? (
                    <Skeleton className="h-7 w-16 mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {typeof stat.value === "number"
                        ? stat.value.toLocaleString()
                        : stat.value}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>
                Track the user journey from visitor to paid customer
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Lead Capture Rate</span>
                    <span className="text-lg font-bold">
                      {data?.leadCaptures && data?.uniqueVisitors
                        ? ((data.leadCaptures / data.uniqueVisitors) * 100).toFixed(1)
                        : "0"}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Signup Conversion Rate</span>
                    <span className="text-lg font-bold">
                      {data?.signupConversions && data?.leadCaptures
                        ? ((data.signupConversions / data.leadCaptures) * 100).toFixed(1)
                        : "0"}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Trial to Paid Rate</span>
                    <span className="text-lg font-bold">
                      {data?.trialToPaid && data?.signupConversions
                        ? ((data.trialToPaid / data.signupConversions) * 100).toFixed(1)
                        : "0"}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
