import { useState } from "react";
import { trpc } from "../_core/trpc";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Stethoscope,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useRealtimeModule } from "../hooks/useRealtime";

function DentalCareContent() {
  const { toast } = useToast();
  const { data: dentalRecords, refetch } = trpc.dentalCare.list.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();
  const createMutation = trpc.dentalCare.create.useMutation();
  const updateMutation = trpc.dentalCare.update.useMutation();
  const deleteMutation = trpc.dentalCare.delete.useMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localRecords, setLocalRecords] = useState(dentalRecords || []);

  // Real-time updates
  useRealtimeModule("dentalCare", (action, data) => {
    if (action === "created") {
      setLocalRecords((prev) => [data, ...prev]);
      toast({
        title: "Dental record added",
        description: "New dental care record created",
      });
    } else if (action === "updated") {
      setLocalRecords((prev) =>
        prev.map((r) => (r.id === data.id ? { ...r, ...data } : r)),
      );
    } else if (action === "deleted") {
      setLocalRecords((prev) => prev.filter((r) => r.id !== data.id));
    }
  });

  // Update local state when data loads
  if (dentalRecords && localRecords.length === 0) {
    setLocalRecords(dentalRecords);
  }

  const [formData, setFormData] = useState({
    horseId: 0,
    examDate: new Date().toISOString().split("T")[0],
    dentistName: "",
    dentistClinic: "",
    procedureType: "",
    findings: "",
    treatmentPerformed: "",
    nextDueDate: "",
    cost: "",
    sedationUsed: false,
    teethCondition: "" as "excellent" | "good" | "fair" | "poor" | "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.horseId === 0) {
      toast({
        title: "Error",
        description: "Please select a horse",
        variant: "destructive",
      });
      return;
    }

    const costInPence = formData.cost
      ? Math.round(parseFloat(formData.cost) * 100)
      : undefined;

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
          cost: costInPence,
          teethCondition: formData.teethCondition || undefined,
        });
        toast({
          title: "Success",
          description: "Dental record updated successfully",
        });
      } else {
        await createMutation.mutateAsync({
          ...formData,
          cost: costInPence,
          teethCondition: formData.teethCondition as any,
        });
        toast({
          title: "Success",
          description: "Dental record created successfully",
        });
      }

      setOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save dental record",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    setFormData({
      horseId: record.horseId,
      examDate: record.examDate,
      dentistName: record.dentistName || "",
      dentistClinic: record.dentistClinic || "",
      procedureType: record.procedureType || "",
      findings: record.findings || "",
      treatmentPerformed: record.treatmentPerformed || "",
      nextDueDate: record.nextDueDate || "",
      cost: record.cost ? (record.cost / 100).toFixed(2) : "",
      sedationUsed: record.sedationUsed || false,
      teethCondition: record.teethCondition || "",
      notes: record.notes || "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this dental record?")) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Success", description: "Dental record deleted" });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      horseId: 0,
      examDate: new Date().toISOString().split("T")[0],
      dentistName: "",
      dentistClinic: "",
      procedureType: "",
      findings: "",
      treatmentPerformed: "",
      nextDueDate: "",
      cost: "",
      sedationUsed: false,
      teethCondition: "",
      notes: "",
    });
  };

  const getHorseName = (horseId: number) => {
    const horse = horses?.find((h) => h.id === horseId);
    return horse?.name || "Unknown Horse";
  };

  const getConditionBadge = (condition: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    };
    return (
      colors[condition as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const upcomingRecords = localRecords
    .filter((r) => r.nextDueDate && new Date(r.nextDueDate) >= new Date())
    .sort(
      (a, b) =>
        new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime(),
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dental Care</h1>
          <p className="text-muted-foreground">
            Track dental exams and procedures
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Dental Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Dental Record" : "New Dental Record"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horseId">Horse *</Label>
                  <Select
                    value={formData.horseId.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, horseId: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select horse" />
                    </SelectTrigger>
                    <SelectContent>
                      {horses?.map((horse) => (
                        <SelectItem key={horse.id} value={horse.id.toString()}>
                          {horse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examDate">Exam Date *</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={formData.examDate}
                    onChange={(e) =>
                      setFormData({ ...formData, examDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dentistName">Dentist Name</Label>
                  <Input
                    id="dentistName"
                    value={formData.dentistName}
                    onChange={(e) =>
                      setFormData({ ...formData, dentistName: e.target.value })
                    }
                    placeholder="Dr. Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dentistClinic">Clinic</Label>
                  <Input
                    id="dentistClinic"
                    value={formData.dentistClinic}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dentistClinic: e.target.value,
                      })
                    }
                    placeholder="Equine Dental Centre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="procedureType">Procedure Type</Label>
                  <Input
                    id="procedureType"
                    value={formData.procedureType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        procedureType: e.target.value,
                      })
                    }
                    placeholder="Routine exam, floating, extraction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teethCondition">Teeth Condition</Label>
                  <Select
                    value={formData.teethCondition}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teethCondition: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nextDueDate">Next Due Date</Label>
                  <Input
                    id="nextDueDate"
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, nextDueDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (£)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="findings">Findings</Label>
                <Textarea
                  id="findings"
                  value={formData.findings}
                  onChange={(e) =>
                    setFormData({ ...formData, findings: e.target.value })
                  }
                  placeholder="Examination findings..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentPerformed">Treatment Performed</Label>
                <Textarea
                  id="treatmentPerformed"
                  value={formData.treatmentPerformed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      treatmentPerformed: e.target.value,
                    })
                  }
                  placeholder="Procedures and treatments..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sedationUsed"
                  checked={formData.sedationUsed}
                  onChange={(e) =>
                    setFormData({ ...formData, sedationUsed: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="sedationUsed" className="cursor-pointer">
                  Sedation Used
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes..."
                  rows={2}
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
                  {editingId ? "Update" : "Create"} Record
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcomingRecords.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming Dental Appointments
          </h3>
          <div className="space-y-2">
            {upcomingRecords.map((record) => (
              <div key={record.id} className="text-sm text-blue-800">
                <strong>{getHorseName(record.horseId)}</strong> -{" "}
                {new Date(record.nextDueDate!).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Dental Records</h2>
        {localRecords.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Stethoscope className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No dental records yet. Add your first record to get started.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {localRecords.map((record) => (
              <div
                key={record.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">
                        {getHorseName(record.horseId)}
                      </h3>
                      {record.teethCondition && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionBadge(record.teethCondition)}`}
                        >
                          {record.teethCondition}
                        </span>
                      )}
                      {record.sedationUsed && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Sedated
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.examDate).toLocaleDateString()}
                      {record.dentistName && ` • ${record.dentistName}`}
                      {record.dentistClinic && ` (${record.dentistClinic})`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                {record.procedureType && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Procedure: </span>
                    <span className="text-sm">{record.procedureType}</span>
                  </div>
                )}

                {record.findings && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Findings: </span>
                    <span className="text-sm text-muted-foreground">
                      {record.findings}
                    </span>
                  </div>
                )}

                {record.treatmentPerformed && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Treatment: </span>
                    <span className="text-sm text-muted-foreground">
                      {record.treatmentPerformed}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                  {record.nextDueDate && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Next: {new Date(record.nextDueDate).toLocaleDateString()}
                    </div>
                  )}
                  {record.cost && (
                    <div>Cost: £{(record.cost / 100).toFixed(2)}</div>
                  )}
                </div>

                {record.notes && (
                  <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
                    {record.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DentalCare() {
  return (
    <DashboardLayout>
      <DentalCareContent />
    </DashboardLayout>
  );
}
