import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useRealtimeModule } from "../hooks/useRealtime";
import { PageHeader } from "@/components/PageHeader";

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
  useEffect(() => {
    if (dentalRecords) setLocalRecords(dentalRecords);
  }, [dentalRecords]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageHeader
            title="Dental Care"
            subtitle="Track dental exams and procedures"
          />
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
              <DialogDescription className="sr-only">Manage dental care record details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            Upcoming Dental Appointments
          </h3>
          <div className="space-y-2">
            {upcomingRecords.map((record) => (
              <div key={record.id} className="text-sm text-foreground/80">
                <strong>{getHorseName(record.horseId)}</strong> -{" "}
                {new Date(record.nextDueDate!).toLocaleDateString()}
              </div>
            ))}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dental Records</CardTitle>
          <CardDescription>All dental exams and procedures</CardDescription>
        </CardHeader>
        <CardContent>
          {localRecords.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No dental records yet</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Record
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {localRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{getHorseName(record.horseId)}</p>
                      {record.teethCondition && (
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getConditionBadge(record.teethCondition)}`}>
                          {record.teethCondition}
                        </span>
                      )}
                      {record.sedationUsed && (
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          Sedated
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.examDate).toLocaleDateString()}
                        {record.dentistName && ` · ${record.dentistName}`}
                        {record.procedureType && ` · ${record.procedureType}`}
                      </span>
                      {record.nextDueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Calendar className="w-3 h-3" />
                          {new Date(record.nextDueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
