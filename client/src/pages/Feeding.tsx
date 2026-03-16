import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Plus, Utensils, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";

type RouterOutput = inferRouterOutputs<AppRouter>;
type FeedingPlan = RouterOutput["feeding"]["listAll"][number];

const mealTimes = [
  { value: "morning", label: "Morning" },
  { value: "midday", label: "Midday" },
  { value: "evening", label: "Evening" },
  { value: "night", label: "Night" },
];

const feedTypes = [
  "Hay",
  "Haylage",
  "Chaff",
  "Hard Feed",
  "Balancer",
  "Supplement",
  "Treats",
  "Other",
];

function FeedingContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    horseId: "",
    feedType: "",
    quantity: "",
    unit: "kg",
    mealTime: "morning" as const,
    notes: "",
  });

  const { data: horses } = trpc.horses.list.useQuery();
  const {
    data: feedingPlans,
    isLoading,
    refetch,
  } = trpc.feeding.listAll.useQuery();

  const createMutation = trpc.feeding.create.useMutation({
    onSuccess: () => {
      toast.success("Feeding plan added!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        horseId: "",
        feedType: "",
        quantity: "",
        unit: "kg",
        mealTime: "morning",
        notes: "",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.feeding.delete.useMutation({
    onSuccess: () => {
      toast.success("Feeding plan removed!");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.horseId || !formData.feedType) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate({
      horseId: parseInt(formData.horseId),
      feedType: formData.feedType,
      quantity: formData.quantity || "1",
      unit: formData.unit || undefined,
      mealTime: formData.mealTime,
      specialInstructions: formData.notes || undefined,
    });
  };

  // Group feeding plans by horse
  const groupedPlans = feedingPlans?.reduce(
    (acc: Record<number, FeedingPlan[]>, plan: FeedingPlan) => {
      const horseId = plan.horseId;
      if (!acc[horseId]) {
        acc[horseId] = [];
      }
      acc[horseId].push(plan);
      return acc;
    },
    {} as Record<number, FeedingPlan[]>,
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Feeding Plans
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage daily feeding schedules for your horses
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Feed
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Feeding Plan</DialogTitle>
                <DialogDescription>
                  Add a feed item to your horse's daily schedule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Horse *</Label>
                  <Select
                    value={formData.horseId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, horseId: value })
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Feed Type *</Label>
                    <Select
                      value={formData.feedType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, feedType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
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
                  <div className="space-y-2">
                    <Label>Meal Time *</Label>
                    <Select
                      value={formData.mealTime}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, mealTime: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTimes.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      placeholder="e.g., 2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                        <SelectItem value="scoop">scoop</SelectItem>
                        <SelectItem value="handful">handful</SelectItem>
                        <SelectItem value="flake">flake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Any special instructions..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  Add Feed
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!feedingPlans || feedingPlans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Utensils className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">
              No feeding plans yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create feeding schedules to keep track of your horses' nutrition.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Feed
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {horses?.map((horse) => {
            const horsePlans = groupedPlans?.[horse.id];
            if (!horsePlans || horsePlans.length === 0) return null;

            return (
              <Card key={horse.id}>
                <CardHeader>
                  <CardTitle className="font-serif">{horse.name}</CardTitle>
                  <CardDescription>Daily feeding schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mealTimes.map((mealTime) => {
                      const mealPlans = horsePlans.filter(
                        (p: FeedingPlan) => p.mealTime === mealTime.value,
                      );
                      return (
                        <div
                          key={mealTime.value}
                          className="p-4 rounded-lg border bg-muted/30"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <h4 className="font-medium">{mealTime.label}</h4>
                          </div>
                          {mealPlans.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No feeds scheduled
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {mealPlans.map((plan: FeedingPlan) => (
                                <div
                                  key={plan.id}
                                  className="flex items-center justify-between p-2 rounded bg-background"
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {plan.feedType}
                                    </p>
                                    {plan.quantity && (
                                      <p className="text-xs text-muted-foreground">
                                        {plan.quantity} {plan.unit}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                      deleteMutation.mutate({ id: plan.id })
                                    }
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Feeding() {
  return (
    <DashboardLayout>
      <FeedingContent />
    </DashboardLayout>
  );
}
