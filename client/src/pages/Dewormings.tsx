import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeModule } from "../hooks/useRealtime";
import { PageHeader } from "@/components/PageHeader";

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
  useEffect(() => {
    setLocalDewormings(dewormings);
  }, [dewormings]);

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
      <div className="px-4 py-6 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <PageHeader title="Dewormings" subtitle="Track deworming treatments and schedules" />
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
                <DialogDescription className="sr-only">Manage deworming record details</DialogDescription>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <Card className="border-amber-200/60 bg-amber-50/40 dark:border-amber-800/30 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-amber-500" />
                Upcoming Dewormings (Next 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {upcomingDewormings.map((deworming: any) => {
                  const horse = horses.find(
                    (h: any) => h.id === deworming.horseId,
                  );
                  return (
                    <div
                      key={deworming.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-amber-50/40 dark:bg-amber-950/10"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium truncate">{horse?.name}</span>
                        <span className="text-sm text-muted-foreground shrink-0">· {deworming.productName || deworming.product}</span>
                      </div>
                      <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0 ml-2">
                        Due {new Date(deworming.nextDueDate).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Deworming Records</CardTitle>
            <CardDescription>Deworming history for all horses</CardDescription>
          </CardHeader>
          <CardContent>
            {localDewormings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No deworming records yet</p>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Record
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {localDewormings.map((deworming: any) => {
                  const horse = horses.find((h: any) => h.id === deworming.horseId);
                  return (
                    <div
                      key={deworming.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{horse?.name || "Unknown Horse"}</p>
                          <span className="text-xs text-muted-foreground shrink-0">{deworming.productName || deworming.product}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
                          <span>{new Date(deworming.dateAdministered).toLocaleDateString()}</span>
                          {deworming.activeIngredient && <span>· {deworming.activeIngredient}</span>}
                          {deworming.nextDueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(deworming.nextDueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(deworming)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(deworming.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
