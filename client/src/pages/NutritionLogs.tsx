import { useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { trpc } from "../_core/trpc";
import { useRealtimeModule } from "../hooks/useRealtime";
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
import { Badge } from "../components/ui/badge";
import { Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

function NutritionLogsContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [formData, setFormData] = useState({
    horseId: "",
    date: new Date().toISOString().split("T")[0],
    feedType: "",
    feedAmount: "",
    breakfast: "",
    lunch: "",
    dinner: "",
    nightFeed: "",
    supplements: "",
    hayAmount: "",
    waterConsumption: "",
    bodyConditionScore: "5",
    weight: "",
    notes: "",
  });

  const { data: logs, refetch } = trpc.nutritionLogs.list.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();
  const createMutation = trpc.nutritionLogs.create.useMutation();
  const updateMutation = trpc.nutritionLogs.update.useMutation();
  const deleteMutation = trpc.nutritionLogs.delete.useMutation();

  const [localLogs, setLocalLogs] = useState(logs || []);

  useRealtimeModule("nutritionLogs", (action, data) => {
    if (action === "created") {
      setLocalLogs((prev) => [data, ...prev]);
      toast.success("New nutrition log added");
    } else if (action === "updated") {
      setLocalLogs((prev) =>
        prev.map((log) => (log.id === data.id ? { ...log, ...data } : log)),
      );
      toast.info("Nutrition log updated");
    } else if (action === "deleted") {
      setLocalLogs((prev) => prev.filter((log) => log.id !== data.id));
      toast.info("Nutrition log deleted");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        horseId: parseInt(formData.horseId),
        logDate: formData.date,
        feedType: formData.feedType || "mixed",
        feedName: formData.feedType || undefined,
        amount: formData.feedAmount || undefined,
        mealTime:
          [
            formData.breakfast,
            formData.lunch,
            formData.dinner,
            formData.nightFeed,
          ]
            .filter(Boolean)
            .join(", ") || undefined,
        supplements: formData.supplements || undefined,
        hay: formData.hayAmount || undefined,
        water: formData.waterConsumption || undefined,
        bodyConditionScore: formData.bodyConditionScore
          ? parseInt(formData.bodyConditionScore)
          : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        notes: formData.notes || undefined,
      };

      if (editingLog) {
        await updateMutation.mutateAsync({ id: editingLog.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }

      setIsDialogOpen(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Failed to save nutrition log");
    }
  };

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setFormData({
      horseId: log.horseId.toString(),
      date: log.logDate?.split("T")[0] || log.date,
      feedType: log.feedName || log.feedType || "",
      feedAmount: log.amount || "",
      breakfast: "",
      lunch: "",
      dinner: "",
      nightFeed: "",
      supplements: log.supplements || "",
      hayAmount: log.hay || "",
      waterConsumption: log.water || "",
      bodyConditionScore: log.bodyConditionScore?.toString() || "5",
      weight: log.weight?.toString() || "",
      notes: log.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this nutrition log?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
      } catch (error) {
        toast.error("Failed to delete nutrition log");
      }
    }
  };

  const resetForm = () => {
    setEditingLog(null);
    setFormData({
      horseId: "",
      date: new Date().toISOString().split("T")[0],
      feedType: "",
      feedAmount: "",
      breakfast: "",
      lunch: "",
      dinner: "",
      nightFeed: "",
      supplements: "",
      hayAmount: "",
      waterConsumption: "",
      bodyConditionScore: "5",
      weight: "",
      notes: "",
    });
  };

  const getConditionBadge = (score?: number) => {
    if (!score) return null;
    let variant: "default" | "secondary" | "destructive" | "outline" =
      "default";
    if (score <= 3) variant = "destructive";
    else if (score <= 5) variant = "secondary";
    else if (score <= 7) variant = "default";
    else variant = "outline";
    return <Badge variant={variant}>BCS: {score}/9</Badge>;
  };

  const displayLogs = localLogs.length > 0 ? localLogs : logs || [];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Nutrition Logs</h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>Add Nutrition Log</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLog ? "Edit" : "Add"} Nutrition Log
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                      {horses?.map((horse: any) => (
                        <SelectItem key={horse.id} value={horse.id.toString()}>
                          {horse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="feedType">Feed Type</Label>
                  <Input
                    value={formData.feedType}
                    onChange={(e) =>
                      setFormData({ ...formData, feedType: e.target.value })
                    }
                    placeholder="e.g., Hay, Pellets, Grain"
                  />
                </div>
                <div>
                  <Label htmlFor="feedAmount">Feed Amount (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.feedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, feedAmount: e.target.value })
                    }
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meal Times</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    value={formData.breakfast}
                    onChange={(e) =>
                      setFormData({ ...formData, breakfast: e.target.value })
                    }
                    placeholder="Breakfast"
                  />
                  <Input
                    value={formData.lunch}
                    onChange={(e) =>
                      setFormData({ ...formData, lunch: e.target.value })
                    }
                    placeholder="Lunch"
                  />
                  <Input
                    value={formData.dinner}
                    onChange={(e) =>
                      setFormData({ ...formData, dinner: e.target.value })
                    }
                    placeholder="Dinner"
                  />
                  <Input
                    value={formData.nightFeed}
                    onChange={(e) =>
                      setFormData({ ...formData, nightFeed: e.target.value })
                    }
                    placeholder="Night Feed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplements">Supplements</Label>
                  <Input
                    value={formData.supplements}
                    onChange={(e) =>
                      setFormData({ ...formData, supplements: e.target.value })
                    }
                    placeholder="e.g., Vitamins, Joint Support"
                  />
                </div>
                <div>
                  <Label htmlFor="hayAmount">Hay Amount</Label>
                  <Input
                    value={formData.hayAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, hayAmount: e.target.value })
                    }
                    placeholder="e.g., 2 bales, 5 kg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="waterConsumption">Water (L)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.waterConsumption}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        waterConsumption: e.target.value,
                      })
                    }
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="bodyConditionScore">
                    Body Condition (1-9)
                  </Label>
                  <Select
                    value={formData.bodyConditionScore}
                    onValueChange={(value) =>
                      setFormData({ ...formData, bodyConditionScore: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => (
                        <SelectItem key={score} value={score.toString()}>
                          {score}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional observations or notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLog ? "Update" : "Create"} Log
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {displayLogs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No nutrition logs yet. Start tracking daily feeding!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {displayLogs.map((log: any) => (
            <Card key={log.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {horses?.find((h: any) => h.id === log.horseId)?.name ||
                    "Horse"}{" "}
                  - {log.date}
                </CardTitle>
                <div className="flex gap-2">
                  {getConditionBadge(log.bodyConditionScore)}
                  {log.weight && (
                    <Badge variant="outline">{log.weight} kg</Badge>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(log)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(log.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {log.feedType && (
                    <div>
                      <span className="font-medium">Feed:</span> {log.feedType}{" "}
                      {log.feedAmount && `(${log.feedAmount} kg)`}
                    </div>
                  )}
                  {log.breakfast && (
                    <div>
                      <span className="font-medium">Breakfast:</span>{" "}
                      {log.breakfast}
                    </div>
                  )}
                  {log.lunch && (
                    <div>
                      <span className="font-medium">Lunch:</span> {log.lunch}
                    </div>
                  )}
                  {log.dinner && (
                    <div>
                      <span className="font-medium">Dinner:</span> {log.dinner}
                    </div>
                  )}
                  {log.nightFeed && (
                    <div>
                      <span className="font-medium">Night Feed:</span>{" "}
                      {log.nightFeed}
                    </div>
                  )}
                  {log.supplements && (
                    <div>
                      <span className="font-medium">Supplements:</span>{" "}
                      {log.supplements}
                    </div>
                  )}
                  {log.hayAmount && (
                    <div>
                      <span className="font-medium">Hay:</span> {log.hayAmount}
                    </div>
                  )}
                  {log.waterConsumption && (
                    <div>
                      <span className="font-medium">Water:</span>{" "}
                      {log.waterConsumption} L
                    </div>
                  )}
                </div>
                {log.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {log.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function NutritionLogs() {
  return (
    <DashboardLayout>
      <NutritionLogsContent />
    </DashboardLayout>
  );
}
