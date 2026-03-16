import { useState } from "react";
import { trpc } from "../_core/trpc";
import { useRealtimeModule } from "../hooks/useRealtime";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  useState(() => {
    if (treatments) {
      setLocalTreatments(treatments);
    }
  });

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Pill className="h-8 w-8" />
            Treatments
          </h1>
          <p className="text-gray-600 mt-1">
            Track medications, therapies, and procedures
          </p>
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
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Active Treatments ({activeTreatments.length})
        </h2>
        <div className="grid gap-4">
          {activeTreatments.length === 0 ? (
            <p className="text-gray-500">No active treatments</p>
          ) : (
            activeTreatments.map((treatment: any) => (
              <div
                key={treatment.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {treatment.treatmentName || treatment.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(treatment.status)}`}
                      >
                        {treatment.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {treatment.treatmentType || treatment.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Horse:{" "}
                      {horses?.find((h: any) => h.id === treatment.horseId)
                        ?.name || "Unknown"}
                    </p>
                    {treatment.dosage && (
                      <p className="text-sm">
                        <strong>Dosage:</strong> {treatment.dosage}
                      </p>
                    )}
                    {treatment.frequency && (
                      <p className="text-sm">
                        <strong>Frequency:</strong> {treatment.frequency}
                      </p>
                    )}
                    <p className="text-sm">
                      <strong>Started:</strong>{" "}
                      {new Date(treatment.startDate).toLocaleDateString()}
                    </p>
                    {treatment.endDate && (
                      <p className="text-sm">
                        <strong>Ends:</strong>{" "}
                        {new Date(treatment.endDate).toLocaleDateString()}
                      </p>
                    )}
                    {treatment.vetName && (
                      <p className="text-sm">
                        <strong>Vet:</strong> {treatment.vetName}
                      </p>
                    )}
                    {treatment.cost && (
                      <p className="text-sm">
                        <strong>Cost:</strong> £
                        {(treatment.cost / 100).toFixed(2)}
                      </p>
                    )}
                    {treatment.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {treatment.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(treatment)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(treatment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Completed Treatments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Completed Treatments ({completedTreatments.length})
        </h2>
        <div className="grid gap-4">
          {completedTreatments.slice(0, 10).map((treatment: any) => (
            <div
              key={treatment.id}
              className="bg-gray-50 border rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      {treatment.treatmentName || treatment.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(treatment.status)}`}
                    >
                      {treatment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Horse:{" "}
                    {horses?.find((h: any) => h.id === treatment.horseId)
                      ?.name || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(treatment.startDate).toLocaleDateString()} -{" "}
                    {treatment.endDate
                      ? new Date(treatment.endDate).toLocaleDateString()
                      : "Ongoing"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(treatment)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
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
