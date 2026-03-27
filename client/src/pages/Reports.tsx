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
   * Download a generated report as a JSON file.
   * Reports are stored as JSON data in the database — this exports that data
   * as a downloadable .json file. PDF generation is not available.
   */
  const handleDownloadReport = (report: {
    id: number;
    title: string;
    reportType: string;
    reportData: string;
    generatedAt: Date | string;
  }) => {
    try {
      const data = JSON.parse(report.reportData);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.reportType}_${new Date(report.generatedAt).toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Unable to export this report");
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
