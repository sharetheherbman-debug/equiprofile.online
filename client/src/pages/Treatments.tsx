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
import { Pill, Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";

function TreatmentsContent() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<any>(null);

  const { data: treatments, refetch } = trpc.treatments.list.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();
  const createMutation = trpc.treatments.create.useMutation();
  const updateMutation = trpc.treatments.update.useMutation();
  const deleteMutation = trpc.treatments.delete.useMutation();

  const [localTreatments, setLocalTreatments] = useState(treatments || []);

  // Update local state when data changes
  useEffect(() => {
    if (treatments) {
      setLocalTreatments(treatments);
    }
  }, [treatments]);

  // Real-time updates
  useRealtimeModule("treatments", (action, data) => {
    switch (action) {
      case "created":
        setLocalTreatments((prev) => [data, ...prev]);
        toast({ title: "New treatment added", description: data.name });
        break;
      case "updated":
        setLocalTreatments((prev) =>
          prev.map((t) => (t.id === data.id ? { ...t, ...data } : t)),
        );
        break;
      case "deleted":
        setLocalTreatments((prev) => prev.filter((t) => t.id !== data.id));
        break;
    }
  });

  const [formData, setFormData] = useState({
    horseId: "",
    type: "medication",
    name: "",
    dosage: "",
    frequency: "",
    startDate: "",
    endDate: "",
    vet: "",
    vetClinic: "",
    cost: "",
    status: "active",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      horseId: "",
      type: "medication",
      name: "",
      dosage: "",
      frequency: "",
      startDate: "",
      endDate: "",
      vet: "",
      vetClinic: "",
      cost: "",
      status: "active",
      notes: "",
    });
    setEditingTreatment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        horseId: parseInt(formData.horseId),
        treatmentType: formData.type,
        treatmentName: formData.name,
        dosage: formData.dosage || undefined,
        frequency: formData.frequency || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        vetName: formData.vet || undefined,
        vetClinic: formData.vetClinic || undefined,
        cost: formData.cost
          ? Math.round(parseFloat(formData.cost) * 100)
          : undefined,
        status: formData.status as
          | "active"
          | "completed"
          | "discontinued"
          | undefined,
        notes: formData.notes || undefined,
      };

      if (editingTreatment) {
        await updateMutation.mutateAsync({
          id: editingTreatment.id,
          treatmentType: payload.treatmentType,
          treatmentName: payload.treatmentName,
          dosage: payload.dosage,
          frequency: payload.frequency,
          startDate: payload.startDate,
          endDate: payload.endDate,
          vetName: payload.vetName,
          vetClinic: payload.vetClinic,
          cost: payload.cost,
          status: payload.status,
          notes: payload.notes,
        });
        toast({ title: "Treatment updated successfully" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Treatment created successfully" });
      }

      setOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (treatment: any) => {
    setEditingTreatment(treatment);
    setFormData({
      horseId: treatment.horseId?.toString() || "",
      type: treatment.treatmentType || treatment.type || "",
      name: treatment.treatmentName || treatment.name || "",
      dosage: treatment.dosage || "",
      frequency: treatment.frequency || "",
      startDate: treatment.startDate
        ? new Date(treatment.startDate).toISOString().split("T")[0]
        : "",
      endDate: treatment.endDate
        ? new Date(treatment.endDate).toISOString().split("T")[0]
        : "",
      vet: treatment.vetName || treatment.vet || "",
      vetClinic: treatment.vetClinic || "",
      cost: treatment.cost ? (treatment.cost / 100).toFixed(2) : "",
      status: treatment.status,
      notes: treatment.notes || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this treatment?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast({ title: "Treatment deleted successfully" });
        refetch();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const activeTreatments = localTreatments.filter(
    (t: any) => t.status === "active",
  );
  const completedTreatments = localTreatments.filter(
    (t: any) => t.status === "completed",
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      discontinued: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <PageHeader
            title="Treatments"
            subtitle="Track medications, therapies, and procedures"
          />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Treatment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTreatment ? "Edit Treatment" : "New Treatment"}
              </DialogTitle>
              <DialogDescription className="sr-only">Manage treatment record details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Horse *</Label>
                  <Select
                    value={formData.horseId}
                    onValueChange={(v) =>
                      setFormData({ ...formData, horseId: v })
                    }
                  >
                    <SelectTrigger>
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
                  <Label>Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="therapy">Therapy</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="supplement">Supplement</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Treatment Name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Bute, Physiotherapy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Dosage</Label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) =>
                      setFormData({ ...formData, dosage: e.target.value })
                    }
                    placeholder="e.g., 2g, 5ml"
                  />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Input
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({ ...formData, frequency: e.target.value })
                    }
                    placeholder="e.g., Twice daily"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date *</Label>
                  <Input
                    required
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Vet</Label>
                  <Input
                    value={formData.vet}
                    onChange={(e) =>
                      setFormData({ ...formData, vet: e.target.value })
                    }
                    placeholder="Veterinarian name"
                  />
                </div>
                <div>
                  <Label>Vet Clinic</Label>
                  <Input
                    value={formData.vetClinic}
                    onChange={(e) =>
                      setFormData({ ...formData, vetClinic: e.target.value })
                    }
                    placeholder="Clinic name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Cost (£)</Label>
                  <Input
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
                  <Label>Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) =>
                      setFormData({ ...formData, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
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
                  {editingTreatment ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Treatments */}
      <Card>
        <CardHeader>
          <CardTitle>Active Treatments</CardTitle>
          <CardDescription>Ongoing medications and therapies</CardDescription>
        </CardHeader>
        <CardContent>
          {activeTreatments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">No active treatments</p>
          ) : (
            <div className="space-y-1">
              {activeTreatments.map((treatment: any) => (
                <div
                  key={treatment.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{treatment.treatmentName || treatment.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusBadge(treatment.status)}`}>
                        {treatment.status}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                        {treatment.treatmentType || treatment.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
                      <span>{horses?.find((h: any) => h.id === treatment.horseId)?.name || "Unknown"}</span>
                      {treatment.dosage && <span>· {treatment.dosage}</span>}
                      <span>· {new Date(treatment.startDate).toLocaleDateString()}</span>
                      {treatment.endDate && <span>– {new Date(treatment.endDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(treatment)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(treatment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Treatments */}
      {completedTreatments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Treatments</CardTitle>
            <CardDescription>Previous and finished treatment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {completedTreatments.slice(0, 10).map((treatment: any) => (
                <div
                  key={treatment.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate text-muted-foreground">{treatment.treatmentName || treatment.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusBadge(treatment.status)}`}>
                        {treatment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
                      <span>{horses?.find((h: any) => h.id === treatment.horseId)?.name || "Unknown"}</span>
                      <span>· {new Date(treatment.startDate).toLocaleDateString()}</span>
                      {treatment.endDate && <span>– {new Date(treatment.endDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => handleEdit(treatment)}>
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

export default function Treatments() {
  return (
    <DashboardLayout>
      <TreatmentsContent />
    </DashboardLayout>
  );
}
