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
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  PieChart,
} from "lucide-react";
import { toast } from "sonner";

const feedTypes = [
  "Hay",
  "Haylage",
  "Hard Feed",
  "Balancer",
  "Supplement",
  "Chaff",
  "Bedding",
  "Treats",
  "Other",
];

function FeedCostContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterHorseId, setFilterHorseId] = useState<string>("all");
  const [formData, setFormData] = useState({
    horseId: "",
    feedType: "",
    brandName: "",
    quantity: "",
    unit: "kg",
    costPerUnit: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    supplier: "",
    notes: "",
  });

  const { data: horses } = trpc.horses.list.useQuery();
  const { data: costs, refetch } = trpc.feedCosts.list.useQuery(
    filterHorseId !== "all" ? { horseId: parseInt(filterHorseId) } : undefined,
  );
  const { data: summary } = trpc.feedCosts.summary.useQuery(
    filterHorseId !== "all" ? { horseId: parseInt(filterHorseId) } : undefined,
  );

  const createMutation = trpc.feedCosts.create.useMutation();
  const deleteMutation = trpc.feedCosts.delete.useMutation();

  useRealtimeModule("feedCosts", (action) => {
    if (action === "created" || action === "deleted") {
      refetch();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        horseId: formData.horseId ? parseInt(formData.horseId) : undefined,
        feedType: formData.feedType,
        brandName: formData.brandName || undefined,
        quantity: formData.quantity,
        unit: formData.unit || undefined,
        costPerUnit: Math.round(parseFloat(formData.costPerUnit) * 100), // Store in pence
        purchaseDate: formData.purchaseDate,
        supplier: formData.supplier || undefined,
        notes: formData.notes || undefined,
      });
      toast.success("Feed cost recorded!");
      setIsDialogOpen(false);
      setFormData({
        horseId: "",
        feedType: "",
        brandName: "",
        quantity: "",
        unit: "kg",
        costPerUnit: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        supplier: "",
        notes: "",
      });
      refetch();
    } catch {
      toast.error("Failed to record feed cost");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Cost record deleted");
      refetch();
    } catch {
      toast.error("Failed to delete record");
    }
  };

  const formatCurrency = (pence: number) => {
    return `£${(pence / 100).toFixed(2)}`;
  };

  const getHorseName = (horseId: number | null) => {
    if (!horseId || !horses) return "General";
    const horse = horses.find((h) => h.id === horseId);
    return horse?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Feed Cost Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Track feed expenses and manage your budget per horse
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Record Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Feed Expense</DialogTitle>
              <DialogDescription className="sr-only">Manage feed cost tracking details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Horse (optional)</Label>
                <Select
                  value={formData.horseId}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, horseId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select horse (or leave general)" />
                  </SelectTrigger>
                  <SelectContent>
                    {horses?.map((horse) => (
                      <SelectItem key={horse.id} value={String(horse.id)}>
                        {horse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Feed Type *</Label>
                <Select
                  value={formData.feedType}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, feedType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Brand Name</Label>
                <Input
                  value={formData.brandName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, brandName: e.target.value }))
                  }
                  placeholder="e.g. Spillers, Dengie"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Quantity *</Label>
                  <Input
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, quantity: e.target.value }))
                    }
                    placeholder="e.g. 20"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, unit: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="bale">bale</SelectItem>
                      <SelectItem value="bag">bag</SelectItem>
                      <SelectItem value="scoop">scoop</SelectItem>
                      <SelectItem value="litre">litre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Cost (£) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.costPerUnit}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, costPerUnit: e.target.value }))
                  }
                  placeholder="e.g. 12.50"
                />
              </div>
              <div>
                <Label>Purchase Date *</Label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      purchaseDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, supplier: e.target.value }))
                  }
                  placeholder="e.g. Local farm shop"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, notes: e.target.value }))
                  }
                  placeholder="Optional notes..."
                  rows={2}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !formData.feedType ||
                  !formData.quantity ||
                  !formData.costPerUnit
                }
              >
                Save Expense
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by Horse */}
      <div className="flex items-center gap-3">
        <Label className="text-sm text-muted-foreground">
          Filter by horse:
        </Label>
        <Select value={filterHorseId} onValueChange={setFilterHorseId}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Horses</SelectItem>
            {horses?.map((horse) => (
              <SelectItem key={horse.id} value={String(horse.id)}>
                {horse.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.totalSpent)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Purchases</p>
                  <p className="text-2xl font-bold">{summary.recordCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Cost</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(summary.avgCost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <PieChart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Horses Tracked
                  </p>
                  <p className="text-2xl font-bold">
                    {summary.perHorse?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Per-Horse Breakdown */}
      {summary?.perHorse && summary.perHorse.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              Cost Breakdown by Horse
            </CardTitle>
            <CardDescription>
              See how feed costs are distributed across your horses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.perHorse.map((entry: any, i: number) => {
                const pct =
                  summary.totalSpent > 0
                    ? Math.round((entry.totalSpent / summary.totalSpent) * 100)
                    : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-medium truncate">
                      {getHorseName(entry.horseId)}
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium w-24 text-right">
                      {formatCurrency(entry.totalSpent)} ({pct}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {!costs || costs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No feed costs recorded yet</p>
              <p className="text-sm">
                Click "Record Expense" to start tracking your feed costs
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {costs.map((cost: any) => (
                <div
                  key={cost.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {cost.feedType}
                        {cost.brandName && (
                          <span className="text-muted-foreground">
                            {" "}
                            — {cost.brandName}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cost.quantity} {cost.unit || ""} •{" "}
                        {getHorseName(cost.horseId)} •{" "}
                        {new Date(cost.purchaseDate).toLocaleDateString()}
                        {cost.supplier && ` • ${cost.supplier}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono">
                      {formatCurrency(cost.costPerUnit)}
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cost.id)}
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

export default function FeedCostTracking() {
  return (
    <DashboardLayout>
      <FeedCostContent />
    </DashboardLayout>
  );
}
