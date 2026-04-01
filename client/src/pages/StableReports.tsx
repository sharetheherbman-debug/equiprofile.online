import { useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Heart,
  Users,
  Calendar,
  Activity,
  Stethoscope,
  Dumbbell,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { format } from "date-fns";

// ─── helpers ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  colour,
  sub,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  colour: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border bg-card">
      <div className={`p-2 rounded-lg ${colour}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const MINUTES_PER_HOUR = 60;

function StableReportsContent() {
  const [isExporting, setIsExporting] = useState(false);

  // ── data queries ──
  const { data: horses = [], isLoading: horsesLoading } =
    trpc.horses.list.useQuery(undefined, { retry: false, staleTime: 0 });

  const { data: tasks = [], isLoading: tasksLoading } =
    trpc.tasks.list.useQuery(undefined, { retry: false });

  const { data: appointments = [], isLoading: apptLoading } =
    trpc.appointments.list.useQuery(undefined, { retry: false });

  const { data: contacts = [], isLoading: contactsLoading } =
    trpc.contacts.list.useQuery(undefined, { retry: false });

  const { data: healthStats } = trpc.analytics.getHealthStats.useQuery(
    {},
    { retry: false },
  );

  const { data: trainingStats } = trpc.analytics.getTrainingStats.useQuery(
    {},
    { retry: false },
  );

  const { data: vaccinations = [] } =
    trpc.vaccinations.list.useQuery(undefined, { retry: false });

  const isLoading =
    horsesLoading || tasksLoading || apptLoading || contactsLoading;

  // ── derived data ──
  const today = new Date();
  const thirtyDaysAhead = new Date(Date.now() + THIRTY_DAYS_MS);

  const upcomingAppts = appointments.filter(
    (a: any) =>
      new Date(a.appointmentDate) >= today &&
      new Date(a.appointmentDate) <= thirtyDaysAhead,
  );

  const completedAppts = appointments.filter(
    (a: any) => a.status === "completed",
  );

  const pendingTasks = tasks.filter(
    (t: any) => t.status === "pending" || t.status === "in_progress",
  );

  const completedTasks = tasks.filter((t: any) => t.status === "completed");

  const overdueVaccinations = vaccinations.filter((v: any) => {
    if (!v.nextDueDate) return false;
    return new Date(v.nextDueDate) < today;
  });

  const dueSoonVaccinations = vaccinations.filter((v: any) => {
    if (!v.nextDueDate) return false;
    const due = new Date(v.nextDueDate);
    return due >= today && due <= thirtyDaysAhead;
  });

  const recentAppointments = [...appointments]
    .sort(
      (a: any, b: any) =>
        new Date(b.appointmentDate).getTime() -
        new Date(a.appointmentDate).getTime(),
    )
    .slice(0, 10);

  const appointmentTypes = appointments.reduce(
    (acc: Record<string, number>, a: any) => {
      const type = a.appointmentType || "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {},
  );

  const horseBreeds = horses.reduce((acc: Record<string, number>, h: any) => {
    const breed = h.breed || "Unknown";
    acc[breed] = (acc[breed] || 0) + 1;
    return acc;
  }, {});

  const tasksByPriority = tasks.reduce(
    (acc: Record<string, number>, t: any) => {
      const p = t.priority || "low";
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    },
    {},
  );

  // ── PDF export ──
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 20;

      // Header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Stable Operations Report", margin, y);
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120);
      doc.text(
        `Generated: ${format(new Date(), "dd MMMM yyyy, HH:mm")}`,
        margin,
        y,
      );
      y += 10;
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
      doc.setTextColor(0);

      const heading = (text: string) => {
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(text, margin, y);
        y += 7;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
      };

      const row = (label: string, value: string | number) => {
        doc.text(`${label}:`, margin + 2, y);
        doc.text(String(value), margin + 60, y);
        y += 5.5;
      };

      // Horse Summary
      heading("Horse Summary");
      row("Total horses", horses.length);
      Object.entries(horseBreeds)
        .slice(0, 5)
        .forEach(([breed, count]) => row(`  ${breed}`, count));
      y += 4;

      // Health & Vaccinations
      heading("Health & Vaccinations");
      row("Overdue vaccinations", overdueVaccinations.length);
      row("Due within 30 days", dueSoonVaccinations.length);
      if (healthStats) {
        row("Total health records", healthStats.totalRecords ?? 0);
      }
      y += 4;

      // Training
      heading("Training Activity");
      if (trainingStats) {
        row("Total sessions", trainingStats.totalSessions ?? 0);
        row(
          "Completed sessions",
          trainingStats.completedSessions ?? 0,
        );
        const hrs = Math.round((trainingStats.totalDuration ?? 0) / MINUTES_PER_HOUR);
        row("Total training hours", hrs);
      }
      y += 4;

      // Appointments
      heading("Appointments (Last / Next 30 Days)");
      row("Upcoming (next 30 days)", upcomingAppts.length);
      row("Completed to date", completedAppts.length);
      Object.entries(appointmentTypes)
        .slice(0, 5)
        .forEach(([type, count]) => row(`  ${type}`, count));
      y += 4;

      // Tasks
      heading("Task Summary");
      row("Pending / In Progress", pendingTasks.length);
      row("Completed", completedTasks.length);
      y += 4;

      // Contacts
      heading("Contacts & Clients");
      row("Total contacts", contacts.length);
      y += 4;

      doc.save(`stable-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("Report exported as PDF");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        <RefreshCw className="h-5 w-5 animate-spin mr-2" />
        Loading stable data…
      </div>
    );
  }

  return (
    <div className="space-y-6 p-3 sm:p-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7" />
            Stable Reports
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Operational overview across your stable — powered by live data
          </p>
        </div>
        <Button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="shrink-0"
          variant="outline"
        >
          {isExporting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Export PDF
        </Button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          label="Horses"
          value={horses.length}
          icon={Heart}
          colour="bg-rose-500"
        />
        <StatCard
          label="Appointments"
          value={appointments.length}
          icon={Calendar}
          colour="bg-blue-500"
          sub={`${upcomingAppts.length} upcoming`}
        />
        <StatCard
          label="Active Tasks"
          value={pendingTasks.length}
          icon={Activity}
          colour="bg-amber-500"
          sub={`${completedTasks.length} completed`}
        />
        <StatCard
          label="Contacts"
          value={contacts.length}
          icon={Users}
          colour="bg-teal-500"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="horses">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg">
          <TabsTrigger value="horses" className="gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            Horses
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5">
            <Stethoscope className="h-3.5 w-3.5" />
            Health
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-1.5">
            <Dumbbell className="h-3.5 w-3.5" />
            Training
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Contacts
          </TabsTrigger>
        </TabsList>

        {/* ── Horses ── */}
        <TabsContent value="horses" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Horse Roster
              </CardTitle>
              <CardDescription>
                {horses.length} horse{horses.length !== 1 ? "s" : ""} registered
              </CardDescription>
            </CardHeader>
            <CardContent>
              {horses.length === 0 ? (
                <p className="text-muted-foreground text-sm">No horses registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {horses.map((horse: any) => (
                    <div
                      key={horse.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {horse.photoUrl ? (
                          <img
                            src={horse.photoUrl}
                            alt={horse.name}
                            className="h-8 w-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                            <Heart className="h-4 w-4 text-rose-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{horse.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {horse.breed || "Unknown breed"}
                            {horse.age ? ` · ${horse.age}yr` : ""}
                          </p>
                        </div>
                      </div>
                      {horse.microchipNumber && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          Chipped
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {Object.keys(horseBreeds).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Breeds Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(horseBreeds).map(([breed, count]) => (
                    <div key={breed} className="flex items-center justify-between text-sm">
                      <span>{breed}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Health ── */}
        <TabsContent value="health" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className={overdueVaccinations.length > 0 ? "border-red-500/40" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertCircle className={`h-4 w-4 ${overdueVaccinations.length > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                  Overdue Vaccinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{overdueVaccinations.length}</p>
                {overdueVaccinations.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {overdueVaccinations.slice(0, 5).map((v: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {v.vaccineName} — overdue since{" "}
                        {format(new Date(v.nextDueDate), "dd MMM yyyy")}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={dueSoonVaccinations.length > 0 ? "border-amber-500/40" : ""}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className={`h-4 w-4 ${dueSoonVaccinations.length > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
                  Due Within 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{dueSoonVaccinations.length}</p>
                {dueSoonVaccinations.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {dueSoonVaccinations.slice(0, 5).map((v: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        {v.vaccineName} — due{" "}
                        {format(new Date(v.nextDueDate), "dd MMM yyyy")}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {healthStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Health Records Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-2xl font-bold">{healthStats.totalRecords ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total records</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-2xl font-bold">{healthStats.upcomingReminders ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Upcoming reminders</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <p className="text-2xl font-bold text-amber-600">{healthStats.overdueReminders ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Overdue reminders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Training ── */}
        <TabsContent value="training" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="h-4 w-4 text-green-500" />
                Training Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainingStats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-2xl font-bold">{trainingStats.totalSessions ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total sessions</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-2xl font-bold">{trainingStats.completedSessions ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">Completed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-2xl font-bold">
                      {Math.round((trainingStats.totalDuration ?? 0) / MINUTES_PER_HOUR)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total hours</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/40">
                    <p className="text-2xl font-bold">
                      {trainingStats.avgPerformance
                        ? trainingStats.avgPerformance.toFixed(1)
                        : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Avg performance</p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No training data available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Appointments ── */}
        <TabsContent value="appointments" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Upcoming (30 days)"
              value={upcomingAppts.length}
              icon={Calendar}
              colour="bg-blue-500"
            />
            <StatCard
              label="Completed"
              value={completedAppts.length}
              icon={CheckCircle2}
              colour="bg-green-500"
            />
            <StatCard
              label="Total recorded"
              value={appointments.length}
              icon={FileText}
              colour="bg-slate-500"
            />
          </div>

          {Object.keys(appointmentTypes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(appointmentTypes).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="capitalize">{type}</span>
                      <Badge variant="secondary">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {recentAppointments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentAppointments.map((appt: any) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 text-sm gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {appt.title || appt.appointmentType}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(appt.appointmentDate), "dd MMM yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          appt.status === "completed"
                            ? "default"
                            : appt.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-[10px] shrink-0"
                      >
                        {appt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Tasks ── */}
        <TabsContent value="tasks" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Pending / In Progress"
              value={pendingTasks.length}
              icon={Clock}
              colour="bg-amber-500"
            />
            <StatCard
              label="Completed"
              value={completedTasks.length}
              icon={CheckCircle2}
              colour="bg-green-500"
            />
            <StatCard
              label="Total tasks"
              value={tasks.length}
              icon={Activity}
              colour="bg-slate-500"
            />
          </div>

          {Object.keys(tasksByPriority).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(["high", "medium", "low"] as const).map((priority) =>
                    tasksByPriority[priority] ? (
                      <div
                        key={priority}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="capitalize flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              priority === "high"
                                ? "bg-red-500"
                                : priority === "medium"
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            }`}
                          />
                          {priority}
                        </span>
                        <Badge variant="secondary">
                          {tasksByPriority[priority]}
                        </Badge>
                      </div>
                    ) : null,
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Contacts ── */}
        <TabsContent value="contacts" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-teal-500" />
                Contacts & Clients
              </CardTitle>
              <CardDescription>
                {contacts.length} contact{contacts.length !== 1 ? "s" : ""} in your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No contacts added yet.</p>
              ) : (
                <div className="space-y-2">
                  {contacts.slice(0, 20).map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {contact.role || contact.contactType || "Contact"}
                          {contact.email ? ` · ${contact.email}` : ""}
                        </p>
                      </div>
                      {contact.phone && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {contact.phone}
                        </Badge>
                      )}
                    </div>
                  ))}
                  {contacts.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      + {contacts.length - 20} more contacts
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function StableReports() {
  return (
    <DashboardLayout>
      <StableReportsContent />
    </DashboardLayout>
  );
}
