import { useState } from "react";
import { trpc } from "../_core/trpc";
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
  useState(() => {
    if (records) setLocalRecords(records);
  });

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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Hoofcare</h1>
          <p className="text-muted-foreground">
            Manage farrier visits and hoof maintenance
          </p>
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Upcoming Visits</CardTitle>
            <CardDescription className="text-blue-700">
              {upcomingRecords.length} visit
              {upcomingRecords.length !== 1 ? "s" : ""} due in the next 30 days
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4">
        {localRecords && localRecords.length > 0 ? (
          localRecords.map((record: any) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      {getHorseName(record.horseId)} - {record.careType}
                    </CardTitle>
                    <CardDescription>
                      {new Date(record.date).toLocaleDateString()} •{" "}
                      {record.farrierName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Condition:</span>
                    {getConditionBadge(record.hoofCondition)}
                  </div>
                  {record.workPerformed && (
                    <div>
                      <span className="font-medium">Work Performed:</span>{" "}
                      {record.workPerformed}
                    </div>
                  )}
                  {record.findings && (
                    <div>
                      <span className="font-medium">Findings:</span>{" "}
                      {record.findings}
                    </div>
                  )}
                  {record.nextDueDate && (
                    <div>
                      <span className="font-medium">Next Due:</span>{" "}
                      {new Date(record.nextDueDate).toLocaleDateString()}
                    </div>
                  )}
                  {record.cost > 0 && (
                    <div>
                      <span className="font-medium">Cost:</span> £
                      {(record.cost / 100).toFixed(2)}
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <span className="font-medium">Notes:</span> {record.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hoofcare records yet. Add your first record above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
