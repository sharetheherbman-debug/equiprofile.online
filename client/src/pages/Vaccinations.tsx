import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { trpc } from "../_core/trpc";
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
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useRealtimeModule } from "../hooks/useRealtime";

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Syringe className="h-8 w-8 text-blue-600" />
            Vaccinations
          </h1>
          <p className="text-muted-foreground mt-1">
            Track vaccination records for your horses
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Vaccination
        </Button>
      </div>

      {/* Upcoming/Due Vaccinations */}
      {upcomingVaccinations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Upcoming & Overdue Vaccinations ({upcomingVaccinations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingVaccinations.map((vaccination) => (
                <Card
                  key={vaccination.id}
                  className={
                    isOverdue(vaccination.nextDueDate)
                      ? "border-red-300 bg-red-50"
                      : "border-yellow-300 bg-yellow-50"
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">
                            {vaccination.vaccineName}
                          </h3>
                          {isOverdue(vaccination.nextDueDate) && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                          {isDueNext30Days(vaccination.nextDueDate) &&
                            !isOverdue(vaccination.nextDueDate) && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-100"
                              >
                                Due Soon
                              </Badge>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">
                            {getHorseName(vaccination.horseId)}
                          </span>
                          {vaccination.vaccineType && (
                            <span> • {vaccination.vaccineType}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Last:{" "}
                            {new Date(
                              vaccination.dateAdministered,
                            ).toLocaleDateString()}
                          </span>
                          {vaccination.nextDueDate && (
                            <span className="flex items-center gap-1 font-medium text-orange-700">
                              <Calendar className="h-4 w-4" />
                              Next Due:{" "}
                              {new Date(
                                vaccination.nextDueDate,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(vaccination)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(vaccination.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Vaccination Records */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Vaccination Records ({localVaccinations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {localVaccinations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Syringe className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No vaccination records yet</p>
              <p className="text-sm">
                Add your first vaccination record to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {localVaccinations.map((vaccination) => (
                <Card key={vaccination.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {vaccination.vaccineName}
                        </h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="font-medium">
                            {getHorseName(vaccination.horseId)}
                          </span>
                          {vaccination.vaccineType && (
                            <span> • {vaccination.vaccineType}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(
                              vaccination.dateAdministered,
                            ).toLocaleDateString()}
                          </span>
                          {vaccination.nextDueDate && (
                            <span className="flex items-center gap-1">
                              Next:{" "}
                              {new Date(
                                vaccination.nextDueDate,
                              ).toLocaleDateString()}
                            </span>
                          )}
                          {vaccination.vetName && (
                            <span>Vet: {vaccination.vetName}</span>
                          )}
                          {vaccination.cost && (
                            <span>£{(vaccination.cost / 100).toFixed(2)}</span>
                          )}
                        </div>
                        {vaccination.notes && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {vaccination.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(vaccination)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(vaccination.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
            <div className="grid grid-cols-2 gap-4">
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

            <div className="flex justify-end gap-2">
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
                {editingVaccination ? "Update" : "Create"} Vaccination
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
