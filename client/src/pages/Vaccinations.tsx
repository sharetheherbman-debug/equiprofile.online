import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Syringe,
  Plus,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useRealtimeModule } from "../hooks/useRealtime";
import { PageHeader } from "@/components/PageHeader";

export default function Vaccinations() {
  return (
    <DashboardLayout>
      <VaccinationsContent />
    </DashboardLayout>
  );
}

function VaccinationsContent() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<any>(null);
  const [localVaccinations, setLocalVaccinations] = useState<any[]>([]);

  const { data: vaccinations = [], refetch } =
    trpc.vaccinations.list.useQuery();
  const { data: horses = [] } = trpc.horses.list.useQuery();
  const createMutation = trpc.vaccinations.create.useMutation();
  const updateMutation = trpc.vaccinations.update.useMutation();
  const deleteMutation = trpc.vaccinations.delete.useMutation();

  // Initialize local state
  useEffect(() => {
    setLocalVaccinations(vaccinations);
  }, [vaccinations]);

  // Real-time updates
  useRealtimeModule("vaccinations", (action, data) => {
    switch (action) {
      case "created":
        setLocalVaccinations((prev) => [data, ...prev]);
        toast({
          title: "Vaccination added",
          description: "New vaccination record created",
        });
        break;
      case "updated":
        setLocalVaccinations((prev) =>
          prev.map((v) => (v.id === data.id ? { ...v, ...data } : v)),
        );
        break;
      case "deleted":
        setLocalVaccinations((prev) => prev.filter((v) => v.id !== data.id));
        break;
    }
  });

  const [formData, setFormData] = useState({
    horseId: 0,
    vaccineName: "",
    vaccineType: "",
    dateAdministered: "",
    nextDueDate: "",
    batchNumber: "",
    vetName: "",
    vetClinic: "",
    cost: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      horseId: 0,
      vaccineName: "",
      vaccineType: "",
      dateAdministered: "",
      nextDueDate: "",
      batchNumber: "",
      vetName: "",
      vetClinic: "",
      cost: "",
      notes: "",
    });
    setEditingVaccination(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.horseId ||
      !formData.vaccineName ||
      !formData.dateAdministered
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = {
        horseId: formData.horseId,
        vaccineName: formData.vaccineName,
        vaccineType: formData.vaccineType || undefined,
        dateAdministered: new Date(formData.dateAdministered),
        nextDueDate: formData.nextDueDate
          ? new Date(formData.nextDueDate)
          : undefined,
        batchNumber: formData.batchNumber || undefined,
        vetName: formData.vetName || undefined,
        vetClinic: formData.vetClinic || undefined,
        cost: formData.cost ? parseInt(formData.cost) * 100 : undefined, // Convert to pence
        notes: formData.notes || undefined,
      };

      if (editingVaccination) {
        await updateMutation.mutateAsync({
          id: editingVaccination.id,
          ...data,
        });
        toast({ title: "Success", description: "Vaccination record updated" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Success", description: "Vaccination record created" });
      }

      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (vaccination: any) => {
    setEditingVaccination(vaccination);
    setFormData({
      horseId: vaccination.horseId,
      vaccineName: vaccination.vaccineName,
      vaccineType: vaccination.vaccineType || "",
      dateAdministered: vaccination.dateAdministered?.split("T")[0] || "",
      nextDueDate: vaccination.nextDueDate?.split("T")[0] || "",
      batchNumber: vaccination.batchNumber || "",
      vetName: vaccination.vetName || "",
      vetClinic: vaccination.vetClinic || "",
      cost: vaccination.cost ? (vaccination.cost / 100).toString() : "",
      notes: vaccination.notes || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vaccination record?"))
      return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast({ title: "Success", description: "Vaccination record deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getHorseName = (horseId: number) => {
    const horse = horses.find((h) => h.id === horseId);
    return horse?.name || "Unknown";
  };

  const isDueNext30Days = (nextDueDate: string | null) => {
    if (!nextDueDate) return false;
    const due = new Date(nextDueDate);
    const today = new Date();
    const diff = Math.floor(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff >= 0 && diff <= 30;
  };

  const isOverdue = (nextDueDate: string | null) => {
    if (!nextDueDate) return false;
    return new Date(nextDueDate) < new Date();
  };

  // Group by upcoming/current
  const upcomingVaccinations = localVaccinations.filter(
    (v) =>
      v.nextDueDate &&
      (isDueNext30Days(v.nextDueDate) || isOverdue(v.nextDueDate)),
  );
  const completedVaccinations = localVaccinations.filter(
    (v) =>
      !v.nextDueDate ||
      (!isDueNext30Days(v.nextDueDate) && !isOverdue(v.nextDueDate)),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <PageHeader
            title="Vaccinations"
            subtitle="Track vaccination records for your horses"
          />
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vaccination
        </Button>
      </div>

      {/* Upcoming/Due Vaccinations */}
      {upcomingVaccinations.length > 0 && (
        <Card className="border-amber-200/60 bg-amber-50/40 dark:border-amber-800/30 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Upcoming & Overdue Vaccinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {upcomingVaccinations.map((vaccination) => (
                <div
                  key={vaccination.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isOverdue(vaccination.nextDueDate)
                      ? "bg-red-50/60 dark:bg-red-950/20"
                      : "bg-amber-50/40 dark:bg-amber-950/10"
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                    <Syringe className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{vaccination.vaccineName}</p>
                      {isOverdue(vaccination.nextDueDate) && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Overdue</Badge>
                      )}
                      {isDueNext30Days(vaccination.nextDueDate) && !isOverdue(vaccination.nextDueDate) && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-amber-100 dark:bg-amber-950/40">Due Soon</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
                      <span>{getHorseName(vaccination.horseId)}</span>
                      {vaccination.vaccineType && <span>· {vaccination.vaccineType}</span>}
                      {vaccination.nextDueDate && (
                        <span className="text-amber-600 dark:text-amber-400">
                          · Due {new Date(vaccination.nextDueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(vaccination)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(vaccination.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Vaccination Records */}
      <Card>
        <CardHeader>
          <CardTitle>All Vaccination Records</CardTitle>
          <CardDescription>Vaccination history for all horses</CardDescription>
        </CardHeader>
        <CardContent>
          {localVaccinations.length === 0 ? (
            <div className="text-center py-8">
              <Syringe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="font-medium text-muted-foreground mb-4">No vaccination records yet</p>
              <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Record
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {localVaccinations.map((vaccination) => (
                <div
                  key={vaccination.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Syringe className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{vaccination.vaccineName}</p>
                      {vaccination.vaccineType && (
                        <span className="text-xs text-muted-foreground shrink-0">{vaccination.vaccineType}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
                      <span>{getHorseName(vaccination.horseId)}</span>
                      <span>· {new Date(vaccination.dateAdministered).toLocaleDateString()}</span>
                      {vaccination.vetName && <span>· {vaccination.vetName}</span>}
                      {vaccination.nextDueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(vaccination.nextDueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(vaccination)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(vaccination.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVaccination
                ? "Edit Vaccination"
                : "Add Vaccination Record"}
            </DialogTitle>
            <DialogDescription>
              {editingVaccination
                ? "Update the vaccination details below"
                : "Record a new vaccination for your horse"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="horseId">Horse *</Label>
                <Select
                  value={formData.horseId.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, horseId: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a horse" />
                  </SelectTrigger>
                  <SelectContent>
                    {horses.map((horse) => (
                      <SelectItem key={horse.id} value={horse.id.toString()}>
                        {horse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vaccineName">Vaccine Name *</Label>
                <Input
                  id="vaccineName"
                  value={formData.vaccineName}
                  onChange={(e) =>
                    setFormData({ ...formData, vaccineName: e.target.value })
                  }
                  placeholder="e.g., Flu/Tetanus"
                  required
                />
              </div>

              <div>
                <Label htmlFor="vaccineType">Vaccine Type</Label>
                <Input
                  id="vaccineType"
                  value={formData.vaccineType}
                  onChange={(e) =>
                    setFormData({ ...formData, vaccineType: e.target.value })
                  }
                  placeholder="e.g., Influenza, Tetanus"
                />
              </div>

              <div>
                <Label htmlFor="dateAdministered">Date Administered *</Label>
                <Input
                  id="dateAdministered"
                  type="date"
                  value={formData.dateAdministered}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dateAdministered: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
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

              <div>
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, batchNumber: e.target.value })
                  }
                  placeholder="e.g., BN123456"
                />
              </div>

              <div>
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

              <div>
                <Label htmlFor="vetName">Vet Name</Label>
                <Input
                  id="vetName"
                  value={formData.vetName}
                  onChange={(e) =>
                    setFormData({ ...formData, vetName: e.target.value })
                  }
                  placeholder="Vet's name"
                />
              </div>

              <div>
                <Label htmlFor="vetClinic">Vet Clinic</Label>
                <Input
                  id="vetClinic"
                  value={formData.vetClinic}
                  onChange={(e) =>
                    setFormData({ ...formData, vetClinic: e.target.value })
                  }
                  placeholder="Clinic name"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingVaccination ? "Update" : "Save"} Vaccination
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
