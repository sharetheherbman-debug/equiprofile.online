import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useRealtimeModule } from "../hooks/useRealtime";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Pencil, Trash2, Clock, Search, Download } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { downloadCSV } from "@/lib/csvDownload";
import { PageHeader } from "@/components/PageHeader";

function AppointmentsContent() {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const { data: appointments, refetch } = trpc.appointments.list.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();
  const createMutation = trpc.appointments.create.useMutation();
  const updateMutation = trpc.appointments.update.useMutation();
  const deleteMutation = trpc.appointments.delete.useMutation();

  const [localAppointments, setLocalAppointments] = useState(
    appointments || [],
  );

  // Update local state when data changes
  useEffect(() => {
    if (appointments) {
      setLocalAppointments(appointments);
    }
  }, [appointments]);

  // Real-time updates
  useRealtimeModule("appointments", (action, data) => {
    switch (action) {
      case "created":
        setLocalAppointments((prev) => [data, ...prev]);
        toast({ title: "New appointment scheduled", description: data.type });
        break;
      case "updated":
        setLocalAppointments((prev) =>
          prev.map((a) => (a.id === data.id ? { ...a, ...data } : a)),
        );
        break;
      case "deleted":
        setLocalAppointments((prev) => prev.filter((a) => a.id !== data.id));
        break;
    }
  });

  const exportQuery = trpc.appointments.exportCSV.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (result.data) {
      downloadCSV(result.data.csv, result.data.filename);
    }
  };

  const [formData, setFormData] = useState({
    horseId: "",
    type: "vet",
    appointmentDate: "",
    appointmentTime: "",
    provider: "",
    location: "",
    cost: "",
    status: "scheduled",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      horseId: "",
      type: "vet",
      appointmentDate: "",
      appointmentTime: "",
      provider: "",
      location: "",
      cost: "",
      status: "scheduled",
      notes: "",
    });
    setEditingAppointment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        horseId: parseInt(formData.horseId),
        appointmentType: formData.type,
        title: `${formData.type} - ${formData.provider}`,
        description: formData.notes || undefined,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime || undefined,
        providerName: formData.provider || undefined,
        location: formData.location || undefined,
        cost: formData.cost
          ? Math.round(parseFloat(formData.cost) * 100)
          : undefined,
        status: formData.status as
          | "scheduled"
          | "confirmed"
          | "completed"
          | "cancelled"
          | undefined,
        notes: formData.notes || undefined,
      };

      if (editingAppointment) {
        await updateMutation.mutateAsync({
          id: editingAppointment.id,
          appointmentType: payload.appointmentType,
          title: payload.title,
          description: payload.description,
          appointmentDate: payload.appointmentDate,
          appointmentTime: payload.appointmentTime,
          providerName: payload.providerName,
          location: payload.location,
          cost: payload.cost,
          status: payload.status,
          notes: payload.notes,
        });
        toast({ title: "Appointment updated successfully" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Appointment scheduled successfully" });
      }

      setOpen(false);
      resetForm();
      await utils.appointments.list.invalidate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setFormData({
      horseId: appointment.horseId?.toString() || "",
      type: appointment.appointmentType || appointment.type || "",
      appointmentDate: appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toISOString().split("T")[0]
        : "",
      appointmentTime: appointment.appointmentTime || "",
      provider: appointment.providerName || appointment.provider || "",
      location: appointment.location || "",
      cost: appointment.cost ? (appointment.cost / 100).toFixed(2) : "",
      status: appointment.status || "scheduled",
      notes: appointment.notes || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast({ title: "Appointment deleted successfully" });
        await utils.appointments.list.invalidate();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const apptMatchesSearch = (a: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const horse = horses?.find((h: any) => h.id === a.horseId);
    return (
      (a.title || a.providerName || a.provider || "").toLowerCase().includes(q) ||
      (a.appointmentType || a.type || "").toLowerCase().includes(q) ||
      (a.status || "").toLowerCase().includes(q) ||
      (a.notes || "").toLowerCase().includes(q) ||
      horse?.name?.toLowerCase().includes(q)
    );
  };

  const upcomingAppointments = localAppointments.filter(
    (a: any) =>
      a.status !== "completed" &&
      a.status !== "cancelled" &&
      new Date(a.appointmentDate) >= new Date() &&
      apptMatchesSearch(a),
  );
  const pastAppointments = localAppointments.filter(
    (a: any) =>
      (a.status === "completed" || new Date(a.appointmentDate) < new Date()) &&
      apptMatchesSearch(a),
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      completed: "bg-muted text-muted-foreground",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[status as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      vet: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      farrier: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      dentist: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
      physio: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      trainer: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      other: "bg-muted text-muted-foreground",
    };
    return colors[type as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <PageHeader
            title="Appointments"
            subtitle="Schedule and manage appointments"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full sm:w-56"
            />
          </div>
          {localAppointments.length > 0 && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportQuery.isFetching}
              className="shrink-0"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportQuery.isFetching ? "Exporting…" : "Export CSV"}
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "Edit Appointment" : "New Appointment"}
              </DialogTitle>
              <DialogDescription className="sr-only">Manage appointment details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appt-horse">Horse *</Label>
                  <Select
                    value={formData.horseId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, horseId: v })
                    }
                  >
                    <SelectTrigger id="appt-horse">
                      <SelectValue placeholder="Select horse" />
                    </SelectTrigger>
                    <SelectContent>
                      {horses?.map((horse: any) => (
                        <SelectItem key={horse.id} value={horse.id.toString()}>
                          {horse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="appt-type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger id="appt-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vet">Vet</SelectItem>
                      <SelectItem value="farrier">Farrier</SelectItem>
                      <SelectItem value="dentist">Dentist</SelectItem>
                      <SelectItem value="physio">Physiotherapist</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appt-date">Date *</Label>
                  <Input
                    id="appt-date"
                    required
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="appt-time">Time</Label>
                  <Input
                    id="appt-time"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        appointmentTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="appt-provider">Provider *</Label>
                <Input
                  id="appt-provider"
                  required
                  autoComplete="name"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  placeholder="Vet/farrier/provider name"
                />
              </div>

              <div>
                <Label htmlFor="appt-location">Location</Label>
                <Input
                  id="appt-location"
                  autoComplete="off"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Clinic or stable location"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appt-cost">Cost (£)</Label>
                  <Input
                    id="appt-cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="appt-status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger id="appt-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="appt-notes">Notes</Label>
                <Textarea
                  id="appt-notes"
                  autoComplete="off"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingAppointment ? "Update" : "Schedule"}
                </Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Scheduled and confirmed upcoming appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No upcoming appointments</p>
              <Button onClick={() => { resetForm(); setOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingAppointments.map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">
                        {appointment.title || appointment.providerName || appointment.provider}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${getTypeBadge(appointment.appointmentType || appointment.type)}`}>
                        {appointment.appointmentType || appointment.type}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${getStatusBadge(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
                      <span>{horses?.find((h: any) => h.id === appointment.horseId)?.name || "Unknown"}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(appointment.appointmentDate).toLocaleDateString()}
                      </span>
                      {appointment.appointmentTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.appointmentTime}
                        </span>
                      )}
                      {appointment.location && <span>· {appointment.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(appointment)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(appointment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>Completed and historical appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {pastAppointments.slice(0, 10).map((appointment: any) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate text-muted-foreground">
                        {appointment.title || appointment.providerName || appointment.provider}
                      </p>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${getTypeBadge(appointment.appointmentType || appointment.type)}`}>
                        {appointment.appointmentType || appointment.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
                      <span>{horses?.find((h: any) => h.id === appointment.horseId)?.name || "Unknown"}</span>
                      <span>· {new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                      {appointment.appointmentTime && <span>at {appointment.appointmentTime}</span>}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => handleEdit(appointment)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Appointments() {
  return (
    <DashboardLayout>
      <AppointmentsContent />
    </DashboardLayout>
  );
}
