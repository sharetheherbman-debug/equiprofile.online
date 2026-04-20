import DashboardLayout from "@/components/DashboardLayout";
import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  Download,
  Heart,
  Dumbbell,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { downloadCSV } from "@/lib/csvDownload";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";

// Premium, brand-aligned colour palette
const CHART_COLORS = {
  primary: "#2e6da4",
  secondary: "#1a7a6d",
  accent: "#c5a55a",
  muted: "#64748b",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#7c3aed",
};

const PERFORMANCE_COLORS: Record<string, string> = {
  EXCELLENT: "#22c55e",
  GOOD: "#2e6da4",
  AVERAGE: "#f59e0b",
  POOR: "#ef4444",
  // Darker slate so the "Not Rated" slice is legible against a white chart background
  NOT_RATED: "#64748b",
};

const PIE_COLORS = [
  "#2e6da4", "#1a7a6d", "#c5a55a", "#7c3aed",
  "#22c55e", "#f59e0b", "#ef4444", "#64748b",
];

/**
 * Format a tooltip entry value based on the data series name.
 *
 * Note: Recharts does not provide a built-in typed format hint mechanism, so we
 * use series name matching as a pragmatic approach. Series names follow a consistent
 * naming convention: names containing "£", "cost", or "prize" format as currency;
 * names containing "hour" or "duration" format as hours.
 * If series names change, update the conditions in this function accordingly.
 */
function formatTooltipValue(entry: any): string {
  if (typeof entry.value !== "number") return String(entry.value ?? "");
  const name: string = entry.name ?? "";
  if (name.includes("£") || name.toLowerCase().includes("cost") || name.toLowerCase().includes("prize")) {
    return `£${entry.value.toFixed(2)}`;
  }
  if (name.toLowerCase().includes("hour") || name.toLowerCase().includes("duration")) {
    return `${entry.value.toFixed(1)}h`;
  }
  return String(entry.value);
}

// Custom tooltip with cleaner design
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-sm min-w-[130px]">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.color || entry.fill }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{formatTooltipValue(entry)}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ icon: Icon, message, hint }: { icon: any; message: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground font-medium">{message}</p>
      {hint && <p className="text-sm text-muted-foreground mt-1 max-w-xs">{hint}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: trainingSessions } = trpc.training.listAll.useQuery();
  const { data: healthRecords } = trpc.healthRecords.listAll.useQuery();
  const { data: competitions } = trpc.competitions.list.useQuery({});
  const { data: horses } = trpc.horses.list.useQuery();

  // Training data aggregation — duration is stored in minutes; convert to hours for display
  const trainingByMonth =
    trainingSessions?.reduce((acc: any, session: any) => {
      const month = new Date(session.date || session.createdAt).toLocaleString(
        "default",
        { month: "short", year: "numeric" },
      );
      if (!acc[month]) acc[month] = { month, sessions: 0, hours: 0 };
      acc[month].sessions += 1;
      acc[month].hours += (session.duration || 0) / 60;
      return acc;
    }, {}) || {};

  const trainingChartData = Object.values(trainingByMonth).slice(-6) as any[];

  // Performance ratings distribution
  const performanceData =
    trainingSessions?.reduce((acc: any, session: any) => {
      const rating = session.performance || "not_rated";
      if (!acc[rating]) acc[rating] = 0;
      acc[rating] += 1;
      return acc;
    }, {}) || {};

  const performancePieData = Object.entries(performanceData).map(
    ([name, value]) => ({
      name: name.replace("_", " ").toUpperCase(),
      value,
      fill: PERFORMANCE_COLORS[name.toUpperCase()] || CHART_COLORS.muted,
    }),
  );

  // Session types distribution
  const sessionTypeData =
    trainingSessions?.reduce((acc: any, session: any) => {
      const type = session.sessionType || "other";
      if (!acc[type]) acc[type] = 0;
      acc[type] += 1;
      return acc;
    }, {}) || {};

  const sessionTypeChartData = Object.entries(sessionTypeData)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      count: value,
    }))
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 8);

  // Competition placements
  const placementData =
    competitions?.reduce((acc: any, comp: any) => {
      const placement = comp.placement || "unplaced";
      if (!acc[placement]) acc[placement] = 0;
      acc[placement] += 1;
      return acc;
    }, {}) || {};

  const placementPieData = Object.entries(placementData).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  // Per-horse comparison
  const horseComparisonData =
    horses?.map((horse) => {
      const horseSessions =
        trainingSessions?.filter((s: any) => s.horseId === horse.id).length ||
        0;
      const horseCompetitions =
        competitions?.filter((c: any) => c.horseId === horse.id).length || 0;
      const horseHealth =
        healthRecords?.filter((h: any) => h.horseId === horse.id).length || 0;

      return {
        name: horse.name,
        training: horseSessions,
        competitions: horseCompetitions,
        health: horseHealth,
      };
    }) || [];

  // Health costs over time
  const healthByMonth =
    healthRecords?.reduce((acc: any, record: any) => {
      if (!record.cost) return acc;
      const month = new Date(
        record.recordDate || record.createdAt,
      ).toLocaleString("default", { month: "short", year: "numeric" });
      if (!acc[month]) acc[month] = { month, cost: 0, count: 0 };
      acc[month].cost += record.cost;
      acc[month].count += 1;
      return acc;
    }, {}) || {};

  const healthCostData = Object.values(healthByMonth).slice(-6) as any[];

  // Health record types breakdown
  const healthTypeData =
    healthRecords?.reduce((acc: any, record: any) => {
      const type = record.recordType || "other";
      if (!acc[type]) acc[type] = 0;
      acc[type] += 1;
      return acc;
    }, {}) || {};

  const healthTypePieData = Object.entries(healthTypeData).map(([name, value]) => ({
    name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
  }));

  const totalSessions = trainingSessions?.length || 0;
  // duration is stored in minutes — divide by 60 to get hours
  const totalHours =
    (trainingSessions?.reduce(
      (sum: number, s: any) => sum + (s.duration || 0),
      0,
    ) ?? 0) / 60;
  const completedSessions =
    trainingSessions?.filter((s: any) => s.isCompleted).length || 0;
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;
  const avgSessionDuration = totalSessions > 0 ? Math.round((totalHours * 60) / totalSessions) : 0;

  const totalHealthCost = healthRecords?.reduce((sum: number, r: any) => sum + (r.cost || 0), 0) || 0;
  const totalCompetitions = competitions?.length || 0;
  const firstPlaces = competitions?.filter((c: any) => c.placement === "1st" || c.placement === "1").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <PageHeader
              title="Analytics"
              subtitle="Comprehensive insights into your horses' performance and health"
            />
          </div>
        </div>

        <Tabs defaultValue="training" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          {/* ── Training Tab ──────────────────────────────────────────── */}
          <TabsContent value="training" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSessions}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(totalHours)}h</div>
                  <p className="text-xs text-muted-foreground">Total logged</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgSessionDuration}m</div>
                  <p className="text-xs text-muted-foreground">Average duration</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {completedSessions}/{totalSessions} completed
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Training Volume</CardTitle>
                  <CardDescription>Hours logged per month (last 6 months)</CardDescription>
                </CardHeader>
                <CardContent>
                  {trainingChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={trainingChartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} unit="h" />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="hours" fill={CHART_COLORS.primary} name="Training Hours" radius={[4, 4, 0, 0]} maxBarSize={48} />
                        <Bar dataKey="sessions" fill={CHART_COLORS.secondary} name="Sessions" radius={[4, 4, 0, 0]} maxBarSize={48} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart icon={BarChart3} message="No training data yet" hint="Log training sessions to see your monthly volume here." />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sessions by Type</CardTitle>
                  <CardDescription>Breakdown of training activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessionTypeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={sessionTypeChartData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} width={55} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Sessions" radius={[0, 4, 4, 0]} maxBarSize={24}>
                          {sessionTypeChartData.map((_: any, index: number) => (
                            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart icon={Dumbbell} message="No session types recorded" hint="Session type breakdowns will appear here as you log training." />
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Performance Rating Distribution</CardTitle>
                <CardDescription>How training sessions have been rated over time</CardDescription>
              </CardHeader>
              <CardContent>
                {performancePieData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={performancePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {performancePieData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={10} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                      {performancePieData.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: entry.fill }} />
                          <span className="text-sm text-muted-foreground">{entry.name}</span>
                          <Badge variant="secondary" className="text-xs">{entry.value as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyChart icon={TrendingUp} message="No performance ratings yet" hint="Rate your training sessions to see the distribution here." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Performance Tab ───────────────────────────────────────── */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Competitions</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCompetitions}</div>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">1st Place Finishes</CardTitle>
                  <TrendingUp className="h-4 w-4 text-[#c5a55a]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{firstPlaces}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalCompetitions > 0 ? `${Math.round((firstPlaces / totalCompetitions) * 100)}% win rate` : "No entries yet"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Prize Winnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{competitions?.reduce((sum: number, c: any) => sum + (c.winnings || 0), 0) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total prize money</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Competition Placement Breakdown</CardTitle>
                <CardDescription>Distribution of results across all competitions entered</CardDescription>
              </CardHeader>
              <CardContent>
                {placementPieData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={placementPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={105}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {placementPieData.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={10} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart icon={TrendingUp} message="No competition results yet" hint="Log competition results to track your performance here." />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Health Tab ────────────────────────────────────────────── */}
          <TabsContent value="health" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Health Records</CardTitle>
                  <Heart className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{healthRecords?.length || 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Health Spend</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">£{Math.round(totalHealthCost)}</div>
                  <p className="text-xs text-muted-foreground">Across all records</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Cost/Record</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £{healthRecords?.length ? Math.round(totalHealthCost / healthRecords.length) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Per health record</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Health Costs</CardTitle>
                  <CardDescription>Veterinary and health expenses over time</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthCostData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={healthCostData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} formatter={(v: any) => `£${v}`} />
                        <Legend iconType="circle" iconSize={10} />
                        <Line
                          type="monotone"
                          dataKey="cost"
                          stroke={CHART_COLORS.danger}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: CHART_COLORS.danger, strokeWidth: 0 }}
                          activeDot={{ r: 6 }}
                          name="Health Costs (£)"
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={CHART_COLORS.secondary}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3, fill: CHART_COLORS.secondary, strokeWidth: 0 }}
                          name="Records"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart icon={Activity} message="No health cost data yet" hint="Add health records with costs to see your spending trends." />
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Record Types</CardTitle>
                  <CardDescription>Breakdown of health record categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {healthTypePieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={healthTypePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {healthTypePieData.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={10} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart icon={Heart} message="No health records yet" hint="Add health records to see the type breakdown." />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Comparison Tab ────────────────────────────────────────── */}
          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Per-Horse Activity Comparison</CardTitle>
                <CardDescription>
                  Training sessions, competitions, and health records across all horses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {horseComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={horseComparisonData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={10} />
                      <Bar dataKey="training" fill={CHART_COLORS.primary} name="Training Sessions" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="competitions" fill={CHART_COLORS.accent} name="Competitions" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="health" fill={CHART_COLORS.danger} name="Health Records" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart icon={BarChart3} message="No horses to compare" hint="Add horses and log activities to see comparisons here." />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
