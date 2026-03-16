import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeModule } from "../hooks/useRealtime";

export default function Dewormings() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    horseId: "",
    product: "",
    activeIngredient: "",
    dosage: "",
    weight: "",
    nextDueDate: "",
    dateAdministered: new Date().toISOString().split("T")[0],
    vet: "",
    clinic: "",
    cost: "",
    notes: "",
  });

  const { data: dewormings = [], refetch } = trpc.dewormings.list.useQuery();
  const { data: horses = [] } = trpc.horses.list.useQuery();
  const createMutation = trpc.dewormings.create.useMutation();
  const updateMutation = trpc.dewormings.update.useMutation();
  const deleteMutation = trpc.dewormings.delete.useMutation();

  const [localDewormings, setLocalDewormings] = useState(dewormings);

  // Update local state when query data changes
  useState(() => {
    setLocalDewormings(dewormings);
  });

  // Real-time subscription
  useRealtimeModule("dewormings", (action, data) => {
    if (action === "created") {
      setLocalDewormings((prev) => [data, ...prev]);
      toast.success("Deworming record added");
    } else if (action === "updated") {
      setLocalDewormings((prev) =>
        prev.map((item) => (item.id === data.id ? { ...item, ...data } : item)),
      );
      toast.info("Deworming record updated");
    } else if (action === "deleted") {
      setLocalDewormings((prev) => prev.filter((item) => item.id !== data.id));
      toast.info("Deworming record deleted");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        horseId: parseInt(formData.horseId),
        productName: formData.product,
        activeIngredient: formData.activeIngredient || undefined,
        dosage: formData.dosage || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        nextDueDate: formData.nextDueDate
          ? new Date(formData.nextDueDate)
          : undefined,
        dateAdministered: new Date(formData.dateAdministered),
        cost: formData.cost
          ? Math.round(parseFloat(formData.cost) * 100)
          : undefined,
        notes: formData.notes || undefined,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save deworming record");
    }
  };

  const handleEdit = (deworming: any) => {
    setEditingId(deworming.id);
    setFormData({
      horseId: deworming.horseId.toString(),
      product: deworming.productName || deworming.product || "",
      activeIngredient: deworming.activeIngredient || "",
      dosage: deworming.dosage || "",
      weight: deworming.weight?.toString() || "",
      nextDueDate: deworming.nextDueDate
        ? new Date(deworming.nextDueDate).toISOString().split("T")[0]
        : "",
      dateAdministered: deworming.dateAdministered
        ? new Date(deworming.dateAdministered).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      vet: "",
      clinic: "",
      cost: deworming.cost ? (deworming.cost / 100).toString() : "",
      notes: deworming.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this deworming record?")) {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (error) {
        toast.error("Failed to delete deworming record");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      horseId: "",
      product: "",
      activeIngredient: "",
      dosage: "",
      weight: "",
      nextDueDate: "",
      dateAdministered: new Date().toISOString().split("T")[0],
      vet: "",
      clinic: "",
      cost: "",
      notes: "",
    });
  };

  const upcomingDewormings = localDewormings.filter((d) => {
    if (!d.nextDueDate) return false;
    const dueDate = new Date(d.nextDueDate);
    const today = new Date();
    const daysDiff = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysDiff >= 0 && daysDiff <= 30;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dewormings</h1>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Deworming
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Deworming" : "Add Deworming"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="horseId">Horse *</Label>
                  <Select
                    value={formData.horseId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, horseId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select horse" />
                    </SelectTrigger>
                    <SelectContent>
                      {horses.map((horse: any) => (
                        <SelectItem key={horse.id} value={horse.id.toString()}>
                          {horse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product">Product *</Label>
                    <Input
                      id="product"
                      value={formData.product}
                      onChange={(e) =>
                        setFormData({ ...formData, product: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="activeIngredient">
                      Active Ingredient *
                    </Label>
                    <Input
                      id="activeIngredient"
                      value={formData.activeIngredient}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          activeIngredient: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                      placeholder="e.g., 10ml"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({ ...formData, weight: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateAdministered">
                      Date Administered *
                    </Label>
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
                        setFormData({
                          ...formData,
                          nextDueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vet">Vet</Label>
                    <Input
                      id="vet"
                      value={formData.vet}
                      onChange={(e) =>
                        setFormData({ ...formData, vet: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinic">Clinic</Label>
                    <Input
                      id="clinic"
                      value={formData.clinic}
                      onChange={(e) =>
                        setFormData({ ...formData, clinic: e.target.value })
                      }
                    />
                  </div>
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
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {upcomingDewormings.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Dewormings (Next 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingDewormings.map((deworming: any) => {
                  const horse = horses.find(
                    (h: any) => h.id === deworming.horseId,
                  );
                  return (
                    <div
                      key={deworming.id}
                      className="flex justify-between items-center p-2 bg-white rounded"
                    >
                      <div>
                        <span className="font-medium">{horse?.name}</span> -{" "}
                        {deworming.product}
                      </div>
                      <span className="text-sm text-gray-600">
                        Due:{" "}
                        {new Date(deworming.nextDueDate).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {localDewormings.map((deworming: any) => {
            const horse = horses.find((h: any) => h.id === deworming.horseId);
            return (
              <Card key={deworming.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <div>
                      <div className="text-lg">
                        {horse?.name || "Unknown Horse"}
                      </div>
                      <div className="text-sm font-normal text-gray-600">
                        {deworming.product}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(deworming)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(deworming.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <span className="text-gray-600">Active Ingredient:</span>{" "}
                    {deworming.activeIngredient}
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Dosage:</span>{" "}
                    {deworming.dosage}
                  </div>
                  {deworming.weight && (
                    <div className="text-sm">
                      <span className="text-gray-600">Weight:</span>{" "}
                      {deworming.weight} kg
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-600">Date:</span>{" "}
                    {new Date(deworming.dateAdministered).toLocaleDateString()}
                  </div>
                  {deworming.nextDueDate && (
                    <div className="text-sm">
                      <span className="text-gray-600">Next Due:</span>{" "}
                      {new Date(deworming.nextDueDate).toLocaleDateString()}
                    </div>
                  )}
                  {deworming.vet && (
                    <div className="text-sm">
                      <span className="text-gray-600">Vet:</span>{" "}
                      {deworming.vet}
                    </div>
                  )}
                  {deworming.cost && (
                    <div className="text-sm">
                      <span className="text-gray-600">Cost:</span> £
                      {(deworming.cost / 100).toFixed(2)}
                    </div>
                  )}
                  {deworming.notes && (
                    <div className="text-sm">
                      <span className="text-gray-600">Notes:</span>{" "}
                      {deworming.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {localDewormings.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No deworming records yet</p>
              <p className="text-sm text-gray-500">
                Click "Add Deworming" to create your first record
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
