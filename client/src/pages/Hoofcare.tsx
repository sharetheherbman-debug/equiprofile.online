import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { DashboardLayout } from "../components/DashboardLayout";
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
  DialogDescription,
  DialogFooter,
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
import { useToast } from "../hooks/use-toast";
import { useRealtimeModule } from "../hooks/useRealtime";
import { PlusCircle, Edit2, Trash2, Heart } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { PageHeader } from "@/components/PageHeader";

export default function Hoofcare() {
  return (
    <DashboardLayout>
      <HoofcareContent />
    </DashboardLayout>
  );
}

function HoofcareContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const [formData, setFormData] = useState({
    horseId: "",
    date: new Date().toISOString().split("T")[0],
    careType: "shoeing",
    farrierName: "",
    farrierContact: "",
    hoofCondition: "good",
    workPerformed: "",
    findings: "",
    nextDueDate: "",
    cost: 0,
    notes: "",
  });

  const { data: horses } = trpc.horses.list.useQuery();
  const { data: records, refetch } = trpc.hoofcare.list.useQuery();
  const [localRecords, setLocalRecords] = useState(records || []);

  // Real-time updates
  useRealtimeModule("hoofcare", (action, data) => {
    if (action === "created") {
      setLocalRecords((prev) => [data, ...(prev || [])]);
      toast({ title: "New hoofcare record added" });
    } else if (action === "updated") {
      setLocalRecords((prev) =>
        (prev || []).map((r) => (r.id === data.id ? { ...r, ...data } : r)),
      );
    } else if (action === "deleted") {
      setLocalRecords((prev) => (prev || []).filter((r) => r.id !== data.id));
    }
  });

  // Update local state when data loads
  useEffect(() => {
    if (records) setLocalRecords(records);
  }, [records]);

  const createMutation = trpc.hoofcare.create.useMutation({
    onSuccess: () => {
      toast({ title: "Hoofcare record created successfully" });
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = trpc.hoofcare.update.useMutation({
    onSuccess: () => {
      toast({ title: "Hoofcare record updated successfully" });
      setIsDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = trpc.hoofcare.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Hoofcare record deleted" });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      horseId: "",
      date: new Date().toISOString().split("T")[0],
      careType: "shoeing",
      farrierName: "",
      farrierContact: "",
      hoofCondition: "good",
      workPerformed: "",
      findings: "",
      nextDueDate: "",
      cost: 0,
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const costInPence = Math.round(parseFloat(formData.cost.toString()) * 100);

    const payload = {
      horseId: parseInt(formData.horseId),
      careDate: formData.date,
      careType: formData.careType as
        | "shoeing"
        | "trimming"
        | "remedial"
        | "inspection"
        | "other",
      farrierName: formData.farrierName || undefined,
      farrierPhone: formData.farrierContact || undefined,
      hoofCondition: formData.hoofCondition as
        | "excellent"
        | "good"
        | "fair"
        | "poor"
        | undefined,
      workPerformed: formData.workPerformed || undefined,
      findings: formData.findings || undefined,
      nextDueDate: formData.nextDueDate || undefined,
      cost: costInPence,
      notes: formData.notes || undefined,
    };

    if (editingRecord) {
      updateMutation.mutate({
        id: editingRecord.id,
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setFormData({
      horseId: record.horseId?.toString() || "",
      date:
        record.careDate?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
      careType: record.careType || "shoeing",
      farrierName: record.farrierName || "",
      farrierContact: record.farrierPhone || "",
      hoofCondition: record.hoofCondition || "good",
      workPerformed: record.workPerformed || "",
      findings: record.findings || "",
      nextDueDate: record.nextDueDate?.split("T")[0] || "",
      cost: (record.cost || 0) / 100,
      notes: record.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this hoofcare record?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getHorseName = (horseId: number) => {
    const horse = horses?.find((h) => h.id === horseId);
    return horse ? horse.name : "Unknown Horse";
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, string> = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={variants[condition] || variants.good}>
        {condition}
      </Badge>
    );
  };

  const upcomingRecords =
    localRecords?.filter((record: any) => {
      if (!record.nextDueDate) return false;
      const dueDate = new Date(record.nextDueDate);
      const today = new Date();
      const diffDays = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return diffDays >= 0 && diffDays <= 30;
    }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageHeader
            title="Hoofcare"
            subtitle="Manage farrier visits and hoof maintenance"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingRecord(null);
                resetForm();
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Hoofcare Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? "Edit Hoofcare Record" : "New Hoofcare Record"}
              </DialogTitle>
              <DialogDescription>
                {editingRecord
                  ? "Update hoofcare details"
                  : "Record a new farrier visit"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
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
                      {horses?.map((horse) => (
                        <SelectItem key={horse.id} value={horse.id.toString()}>
                          {horse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="careType">Care Type *</Label>
                    <Select
                      value={formData.careType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, careType: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shoeing">Shoeing</SelectItem>
                        <SelectItem value="trimming">Trimming</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="farrierName">Farrier Name *</Label>
                    <Input
                      id="farrierName"
                      placeholder="Farrier name"
                      value={formData.farrierName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          farrierName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="farrierContact">Farrier Contact</Label>
                    <Input
                      id="farrierContact"
                      placeholder="Phone/email"
                      value={formData.farrierContact}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          farrierContact: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="hoofCondition">Hoof Condition</Label>
                  <Select
                    value={formData.hoofCondition}
                    onValueChange={(value) =>
                      setFormData({ ...formData, hoofCondition: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="workPerformed">Work Performed</Label>
                  <Textarea
                    id="workPerformed"
                    placeholder="Describe the work done..."
                    value={formData.workPerformed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workPerformed: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="findings">Findings</Label>
                  <Textarea
                    id="findings"
                    placeholder="Any issues or observations..."
                    value={formData.findings}
                    onChange={(e) =>
                      setFormData({ ...formData, findings: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="grid gap-2">
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
                  <div className="grid gap-2">
                    <Label htmlFor="cost">Cost (£)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cost: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
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
                <Button type="submit">
                  {editingRecord ? "Update" : "Create"} Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcomingRecords.length > 0 && (
        <Card className="mb-6 border-primary/20 bg-primary/5 dark:bg-primary/10">
          <CardHeader>
            <CardTitle className="text-foreground">Upcoming Visits</CardTitle>
            <CardDescription className="text-muted-foreground">
              {upcomingRecords.length} visit
              {upcomingRecords.length !== 1 ? "s" : ""} due in the next 30 days
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Hoofcare Records</CardTitle>
          <CardDescription>All farrier visits and hoof maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          {!localRecords || localRecords.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No hoofcare records yet</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add First Record
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {localRecords.map((record: any) => (
                <div
                  key={record.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{getHorseName(record.horseId)}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{record.careType ? record.careType.charAt(0).toUpperCase() + record.careType.slice(1) : ""}</span>
                      {getConditionBadge(record.hoofCondition)}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                        {record.farrierName && ` · ${record.farrierName}`}
                      </span>
                      {record.nextDueDate && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <span>Next: {new Date(record.nextDueDate).toLocaleDateString()}</span>
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
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
