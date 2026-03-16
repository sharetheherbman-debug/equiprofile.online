import DashboardLayout from "@/components/DashboardLayout";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  Download,
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

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const { data: trainingSessions } = trpc.training.listAll.useQuery();
  const { data: healthRecords } = trpc.healthRecords.listAll.useQuery();
  const { data: competitions } = trpc.competitions.list.useQuery({});
  const { data: horses } = trpc.horses.list.useQuery();

  // Training data aggregation
  const trainingByMonth =
    trainingSessions?.reduce((acc: any, session: any) => {
      const month = new Date(session.date || session.createdAt).toLocaleString(
        "default",
        { month: "short", year: "numeric" },
      );
      if (!acc[month]) acc[month] = { month, sessions: 0, hours: 0 };
      acc[month].sessions += 1;
      acc[month].hours += session.duration || 0;
      return acc;
    }, {}) || {};

  const trainingChartData = Object.values(trainingByMonth).slice(-6);

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
    }),
  );

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

  const healthCostData = Object.values(healthByMonth).slice(-6);

  const totalSessions = trainingSessions?.length || 0;
  const totalHours =
    trainingSessions?.reduce(
      (sum: number, s: any) => sum + (s.duration || 0),
      0,
    ) || 0;
  const completedSessions =
    trainingSessions?.filter((s: any) => s.isCompleted).length || 0;
  const completionRate =
    totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your horses' performance and health
            </p>
          </div>
        </div>

        <Tabs defaultValue="training" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Sessions
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSessions}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Training Hours
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(totalHours)}h
                  </div>
                  <p className="text-xs text-muted-foreground">Total logged</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {completedSessions}/{totalSessions} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg/Month
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {trainingChartData.length > 0
                      ? Math.round(totalSessions / trainingChartData.length)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Sessions per month
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Training Hours per Month</CardTitle>
                <CardDescription>
                  Training volume over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                {trainingChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trainingChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="hours"
                        fill="#8884d8"
                        name="Training Hours"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No training data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>
                  Breakdown of training session ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performancePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={performancePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {performancePieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No performance ratings yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Competitions
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {competitions?.length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Total entries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Top Placements
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {competitions?.filter(
                      (c: any) => c.placement === "1st" || c.placement === "1",
                    ).length || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    First place finishes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Winnings
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    £
                    {competitions?.reduce(
                      (sum: number, c: any) => sum + (c.winnings || 0),
                      0,
                    ) || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total prize money
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Competition Placements</CardTitle>
                <CardDescription>
                  Distribution of competition results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {placementPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={placementPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {placementPieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No competition data available
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Log competition results to track performance
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Health Costs Over Time</CardTitle>
                <CardDescription>
                  Monthly health and veterinary expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {healthCostData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={healthCostData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `£${value}`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cost"
                        stroke="#82ca9d"
                        name="Health Costs (£)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No health cost data available
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add health records with costs to track expenses
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Per-Horse Activity Comparison</CardTitle>
                <CardDescription>
                  Compare training, competitions, and health records across all
                  horses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {horseComparisonData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={horseComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="training"
                        fill="#8884d8"
                        name="Training Sessions"
                      />
                      <Bar
                        dataKey="competitions"
                        fill="#82ca9d"
                        name="Competitions"
                      />
                      <Bar
                        dataKey="health"
                        fill="#ffc658"
                        name="Health Records"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No horses to compare
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Add horses and log activities to see comparisons
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
