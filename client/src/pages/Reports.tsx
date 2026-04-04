import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Plus,
  FileText,
  Calendar as CalendarIcon,
  Download,
  Clock,
  Mail,
  Trash2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "../lib/trpc";
import { format } from "date-fns";
import jsPDF from "jspdf";

/** Brand color for PDF letterhead */
const BRAND_BLUE_RGB = [15, 46, 107] as const;

const REPORT_TYPES = [
  { value: "monthly_summary", label: "Monthly Summary" },
  { value: "health_report", label: "Health Report" },
  { value: "training_progress", label: "Training Progress" },
  { value: "cost_analysis", label: "Cost Analysis" },
  { value: "competition_summary", label: "Competition Summary" },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState<
    "generate" | "history" | "schedules"
  >("generate");

  // Generate report state
  const [generateForm, setGenerateForm] = useState({
    reportType: "",
    horseId: "",
    startDate: "",
    endDate: "",
  });

  // Schedule report state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    reportType: "",
    frequency: "",
    recipients: "",
  });

  // Queries
  const { data: generatedReports = [], refetch: refetchReports } =
    trpc.reports.list.useQuery({ limit: 50 });
  const { data: horses = [] } = trpc.horses.list.useQuery();
  const { data: scheduledReports = [], refetch: refetchSchedules } =
    trpc.reports.listSchedules.useQuery();

  // Mutations
  const generateReport = trpc.reports.generate.useMutation({
    onSuccess: () => {
      toast.success("Report generated successfully");
      refetchReports();
      resetGenerateForm();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const scheduleReport = trpc.reports.scheduleReport.useMutation({
    onSuccess: () => {
      toast.success("Report scheduled successfully");
      setIsScheduleDialogOpen(false);
      resetScheduleForm();
      refetchSchedules();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const deleteSchedule = trpc.reports.deleteSchedule.useMutation({
    onSuccess: () => {
      toast.success("Schedule removed");
      refetchSchedules();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetGenerateForm = () => {
    setGenerateForm({
      reportType: "",
      horseId: "",
      startDate: "",
      endDate: "",
    });
  };

  const resetScheduleForm = () => {
    setScheduleForm({
      reportType: "",
      frequency: "",
      recipients: "",
    });
  };

  const handleGenerateReport = () => {
    if (!generateForm.reportType) {
      toast.error("Error", {
        description: "Please select a report type",
      });
      return;
    }

    generateReport.mutate({
      reportType: generateForm.reportType as any,
      horseId:
        generateForm.horseId && generateForm.horseId !== "none"
          ? parseInt(generateForm.horseId)
          : undefined,
      startDate: generateForm.startDate || undefined,
      endDate: generateForm.endDate || undefined,
    });
  };

  const handleScheduleReport = () => {
    if (
      !scheduleForm.reportType ||
      !scheduleForm.frequency ||
      !scheduleForm.recipients
    ) {
      toast.error("Error", {
        description: "Please fill in all required fields",
      });
      return;
    }

    const recipients = scheduleForm.recipients
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);
    if (recipients.length === 0) {
      toast.error("Error", {
        description: "Please enter at least one recipient email",
      });
      return;
    }

    scheduleReport.mutate({
      reportType: scheduleForm.reportType as any,
      frequency: scheduleForm.frequency as any,
      recipients,
    });
  };

  const getHorseName = (horseId: number | null) => {
    if (!horseId) return "All Horses";
    const horse = horses.find((h) => h.id === horseId);
    return horse?.name || `Horse #${horseId}`;
  };

  const getReportTypeName = (type: string) => {
    return REPORT_TYPES.find((t) => t.value === type)?.label || type;
  };

  /**
   * Load the brand logo as a base64-encoded data URL for PDF embedding.
   */
  const loadLogoBase64 = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = "/logo.png";
    });
  };

  /**
   * Download a generated report as a PDF with EquiProfile letterhead.
   */
  const handleDownloadReport = async (report: {
    id: number;
    title: string;
    reportType: string;
    reportData: string;
    generatedAt: Date | string;
  }) => {
    try {
      const data = JSON.parse(report.reportData);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 20;

      // Load logo for letterhead
      const logoBase64 = await loadLogoBase64();

      // Letterhead — darker premium blue
      doc.setFillColor(...BRAND_BLUE_RGB);
      doc.rect(0, 0, pageWidth, 32, "F");

      // Add logo to letterhead if available
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", 10, 4, 20, 24);
        } catch { /* logo embed failed, continue without */ }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("EquiProfile", logoBase64 ? 34 : 14, 15);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Professional Equine Management  |  equiprofile.online", logoBase64 ? 34 : 14, 23);
      doc.text(
        `Generated: ${new Date(report.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`,
        pageWidth - 14,
        23,
        { align: "right" },
      );

      // Accent line below header
      doc.setDrawColor(...BRAND_BLUE_RGB);
      doc.setLineWidth(0.8);
      doc.line(0, 32, pageWidth, 32);

      y = 44;
      // Report title
      doc.setTextColor(...BRAND_BLUE_RGB);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(report.title, 14, y);
      y += 10;
      doc.setDrawColor(...BRAND_BLUE_RGB);
      doc.setLineWidth(0.5);
      doc.line(14, y, pageWidth - 14, y);
      y += 8;

      // Helper to add a section heading
      const heading = (text: string) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...BRAND_BLUE_RGB);
        doc.text(text, 14, y);
        y += 7;
        doc.setTextColor(20, 20, 20);
      };

      // Helper to add a key-value row
      const row = (label: string, value: string | number) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 14, y);
        doc.setFont("helvetica", "normal");
        doc.text(String(value), 80, y);
        y += 6;
      };

      // Render data sections based on report type
      if (report.reportType === "monthly_summary") {
        heading("Period");
        if (data.period) {
          row("From", new Date(data.period.start).toLocaleDateString("en-GB"));
          row("To", new Date(data.period.end).toLocaleDateString("en-GB"));
        }
        y += 2;
        heading("Horses");
        row("Total horses", data.horses?.total ?? 0);
        if (data.horses?.names?.length) row("Names", data.horses.names.join(", "));
        y += 2;
        heading("Training Sessions");
        row("Total", data.trainingSessions?.total ?? 0);
        row("Completed", data.trainingSessions?.completed ?? 0);
        y += 2;
        heading("Tasks");
        row("Total", data.tasks?.total ?? 0);
        row("Completed", data.tasks?.completed ?? 0);
        row("Pending", data.tasks?.pending ?? 0);
        y += 2;
        heading("Appointments");
        row("Total", data.appointments?.total ?? 0);
        y += 2;
        heading("Vaccinations");
        row("Due in 30 days", data.vaccinations?.dueSoon ?? 0);

      } else if (report.reportType === "health_report") {
        heading("Vaccinations");
        row("Total records", data.vaccinations?.total ?? 0);
        row("Upcoming (60 days)", data.vaccinations?.upcomingDue?.length ?? 0);
        row("Overdue", data.vaccinations?.overdue?.length ?? 0);
        y += 2;
        if (data.vaccinations?.overdue?.length) {
          heading("Overdue Vaccinations");
          (data.vaccinations.overdue as any[]).forEach((v) => {
            row(v.vaccine ?? "Vaccine", `Due ${v.due ? new Date(v.due).toLocaleDateString("en-GB") : "unknown"}`);
          });
          y += 2;
        }
        heading("Dewormings");
        row("Total records", data.dewormings?.total ?? 0);
        row("Upcoming (60 days)", data.dewormings?.upcomingDue?.length ?? 0);
        y += 2;
        heading("Treatments");
        row("Total records", data.treatments?.total ?? 0);
        y += 2;
        heading("Dental");
        row("Total records", data.dental?.total ?? 0);
        row("Upcoming (60 days)", data.dental?.upcomingDue?.length ?? 0);

      } else if (report.reportType === "training_progress") {
        if (data.period) {
          heading("Period");
          row("From", new Date(data.period.start).toLocaleDateString("en-GB"));
          row("To", new Date(data.period.end).toLocaleDateString("en-GB"));
          y += 2;
        }
        heading("Summary");
        row("Total sessions", data.totalSessions ?? 0);
        row("Completed", data.completedSessions ?? 0);
        row("Completion rate", `${data.completionRate ?? 0}%`);
        y += 2;
        if (data.disciplineBreakdown && Object.keys(data.disciplineBreakdown).length) {
          heading("Discipline Breakdown");
          Object.entries(data.disciplineBreakdown).forEach(([disc, count]) => {
            row(disc.charAt(0).toUpperCase() + disc.slice(1), count as number);
          });
          y += 2;
        }
        if (data.recentSessions?.length) {
          heading("Recent Sessions");
          (data.recentSessions as any[]).slice(0, 8).forEach((s) => {
            row(
              new Date(s.date).toLocaleDateString("en-GB"),
              `${s.type ?? ""}${s.discipline ? ` — ${s.discipline}` : ""}${s.completed ? " ✓" : ""}`,
            );
          });
        }

      } else if (report.reportType === "cost_analysis") {
        heading("Summary");
        if (data.period) {
          row("From", new Date(data.period.start).toLocaleDateString("en-GB"));
          row("To", new Date(data.period.end).toLocaleDateString("en-GB"));
          y += 2;
        }
        const fmt = (p: number) => `£${(p / 100).toFixed(2)}`;
        heading("Costs");
        row("Feeding", fmt(data.breakdown?.feeding?.totalPence ?? 0));
        row("Appointments", fmt(data.breakdown?.appointments?.totalPence ?? 0));
        row("Vaccinations", fmt(data.breakdown?.vaccinations?.totalPence ?? 0));
        row("Competitions (entry)", fmt(data.breakdown?.competitions?.totalPence ?? 0));
        y += 2;
        heading("Totals");
        row("Total cost", fmt(data.summary?.totalCostPence ?? 0));
        row("Competition winnings", fmt(data.breakdown?.competitions?.winningsPence ?? 0));
        row("Net cost", fmt(data.summary?.netCostPence ?? 0));

      } else if (report.reportType === "competition_summary") {
        heading("Summary");
        row("Total competitions", data.totalCompetitions ?? 0);
        if (data.period) {
          row("From", new Date(data.period.start).toLocaleDateString("en-GB"));
          row("To", new Date(data.period.end).toLocaleDateString("en-GB"));
        }
        y += 2;
        heading("Financials");
        row("Total entry cost", `£${((data.totalEntryCostPence ?? 0) / 100).toFixed(2)}`);
        row("Total winnings", `£${((data.totalWinningsPence ?? 0) / 100).toFixed(2)}`);
        y += 2;
        if (data.recentResults?.length) {
          heading("Results");
          (data.recentResults as any[]).slice(0, 10).forEach((c) => {
            row(
              new Date(c.date).toLocaleDateString("en-GB"),
              `${c.name ?? ""}${c.placement ? ` — ${c.placement}` : ""}${c.discipline ? ` (${c.discipline})` : ""}`,
            );
          });
        }
      } else {
        // Generic fallback
        heading("Data");
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(JSON.stringify(data, null, 2), pageWidth - 28);
        doc.text(lines, 14, y);
      }

      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageH = doc.internal.pageSize.getHeight();
        // Footer line
        doc.setDrawColor(...BRAND_BLUE_RGB);
        doc.setLineWidth(0.3);
        doc.line(14, pageH - 14, pageWidth - 14, pageH - 14);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(
          "EquiProfile — Confidential Equine Management Report",
          14,
          pageH - 9,
        );
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 14,
          pageH - 9,
          { align: "right" },
        );
      }

      const filename = `${report.reportType}_${new Date(report.generatedAt).toISOString().split("T")[0]}.pdf`;
      doc.save(filename);
    } catch {
      toast.error("Unable to export this report as PDF");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports and set up automated schedules
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="generate">Generate Report</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
            <TabsTrigger value="schedules">Scheduled Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Report</CardTitle>
                <CardDescription>
                  Create a comprehensive report for your horses and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="reportType">Report Type *</Label>
                    <Select
                      value={generateForm.reportType}
                      onValueChange={(value) =>
                        setGenerateForm({ ...generateForm, reportType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Choose the type of report you want to generate
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="horse">Horse (Optional)</Label>
                    <Select
                      value={generateForm.horseId}
                      onValueChange={(value) =>
                        setGenerateForm({ ...generateForm, horseId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All horses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">All Horses</SelectItem>
                        {horses.map((horse) => (
                          <SelectItem
                            key={horse.id}
                            value={horse.id.toString()}
                          >
                            {horse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Leave blank for all horses
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={generateForm.startDate}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          startDate: e.target.value,
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Start of reporting period
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={generateForm.endDate}
                      onChange={(e) =>
                        setGenerateForm({
                          ...generateForm,
                          endDate: e.target.value,
                        })
                      }
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      End of reporting period
                    </p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold">What's included:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>
                      <strong>Monthly Summary:</strong> Overview of all
                      activities, costs, and health records
                    </li>
                    <li>
                      <strong>Health Report:</strong> Detailed health records,
                      vaccinations, and upcoming care
                    </li>
                    <li>
                      <strong>Training Progress:</strong> Training sessions,
                      performance metrics, and goals
                    </li>
                    <li>
                      <strong>Cost Analysis:</strong> Breakdown of expenses by
                      category with trends
                    </li>
                    <li>
                      <strong>Competition Summary:</strong> Results, placements,
                      and performance statistics
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateReport}
                    disabled={generateReport.isPending}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {generateReport.isPending
                      ? "Generating..."
                      : "Generate Report"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsScheduleDialogOpen(true)}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Schedule Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Generated Reports</h2>
            </div>

            {generatedReports.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No reports generated yet
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("generate")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Your First Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {generatedReports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {report.title}
                          </CardTitle>
                          <CardDescription>
                            <Badge variant="outline" className="mt-1">
                              {getReportTypeName(report.reportType)}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(report.generatedAt), "PPp")}
                        </span>
                      </div>
                      {report.horseId && (
                        <div className="text-sm text-muted-foreground">
                          Horse: {getHorseName(report.horseId)}
                        </div>
                      )}
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleDownloadReport(report)}
                      >
                        <Download className="mr-2 h-3 w-3" />
                        Export Data
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Scheduled Reports</h2>
              <Button onClick={() => setIsScheduleDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Schedule
              </Button>
            </div>

            {scheduledReports.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No scheduled reports yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Schedule reports to be generated and emailed automatically
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsScheduleDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Your First Report
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {scheduledReports.map((schedule) => {
                  const recipients: string[] = (() => {
                    try {
                      return schedule.recipients
                        ? JSON.parse(schedule.recipients)
                        : [];
                    } catch (err) {
                      console.error("Invalid recipients JSON:", err);
                      return [];
                    }
                  })();
                  return (
                    <Card key={schedule.id}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {getReportTypeName(schedule.reportType)}
                              </span>
                              <Badge variant="secondary" className="capitalize">
                                {schedule.frequency}
                              </Badge>
                            </div>
                            {recipients.length > 0 && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {recipients.join(", ")}
                              </p>
                            )}
                            {schedule.nextRunAt && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Next run:{" "}
                                {format(
                                  new Date(schedule.nextRunAt),
                                  "dd MMM yyyy",
                                )}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteSchedule.mutate({ id: schedule.id })
                            }
                            disabled={deleteSchedule.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Schedule Report Dialog */}
        <Dialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Automatic Report</DialogTitle>
              <DialogDescription>
                Set up a recurring report to be generated and emailed
                automatically
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduleReportType">Report Type *</Label>
                <Select
                  value={scheduleForm.reportType}
                  onValueChange={(value) =>
                    setScheduleForm({ ...scheduleForm, reportType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Select
                  value={scheduleForm.frequency}
                  onValueChange={(value) =>
                    setScheduleForm({ ...scheduleForm, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="recipients">Recipients *</Label>
                <Input
                  id="recipients"
                  value={scheduleForm.recipients}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      recipients: e.target.value,
                    })
                  }
                  placeholder="email1@example.com, email2@example.com"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Comma-separated email addresses
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsScheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleScheduleReport}>Schedule Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
