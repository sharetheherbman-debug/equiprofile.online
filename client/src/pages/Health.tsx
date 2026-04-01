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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Heart,
  Syringe,
  Stethoscope,
  Pill,
  FileText,
  AlertCircle,
  Calendar,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

const recordTypes = [
  { value: "vaccination", label: "Vaccination", icon: Syringe },
  { value: "veterinary", label: "Vet Visit", icon: Stethoscope },
  { value: "medication", label: "Medication", icon: Pill },
  { value: "dental", label: "Dental", icon: Heart },
  { value: "farrier", label: "Farrier", icon: Heart },
  { value: "deworming", label: "Deworming", icon: Pill },
  { value: "other", label: "Other", icon: FileText },
];

function HealthContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    horseId: "",
    recordType: "vaccination" as const,
    title: "",
    recordDate: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    vetName: "",
    vetPhone: "",
    description: "",
    notes: "",
  });
  const [formData, setFormData] = useState({
    horseId: "",
    recordType: "vaccination" as const,
    title: "",
    recordDate: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    vetName: "",
    vetPhone: "",
    description: "",
    notes: "",
  });

  const { data: horses } = trpc.horses.list.useQuery();
  const {
    data: records,
    isLoading,
    refetch,
  } = trpc.healthRecords.listAll.useQuery();
  const { data: reminders } = trpc.healthRecords.getReminders.useQuery({
    days: 30,
  });

  const createMutation = trpc.healthRecords.create.useMutation({
    onSuccess: () => {
      toast.success("Health record added!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        horseId: "",
        recordType: "vaccination",
        title: "",
        recordDate: new Date().toISOString().split("T")[0],
        nextDueDate: "",
        vetName: "",
        vetPhone: "",
        description: "",
        notes: "",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const utils = trpc.useUtils();

  const deleteMutation = trpc.healthRecords.delete.useMutation({
    onSuccess: () => {
      toast.success("Health record deleted!");
      utils.healthRecords.listAll.invalidate();
      utils.healthRecords.getReminders.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.healthRecords.update.useMutation({
    onSuccess: () => {
      toast.success("Health record updated!");
      setIsEditDialogOpen(false);
      setEditingRecord(null);
      utils.healthRecords.listAll.invalidate();
      utils.healthRecords.getReminders.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setEditFormData({
      horseId: record.horseId.toString(),
      recordType: record.recordType,
      title: record.title || "",
      recordDate: record.recordDate
        ? new Date(record.recordDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      nextDueDate: record.nextDueDate
        ? new Date(record.nextDueDate).toISOString().split("T")[0]
        : "",
      vetName: record.vetName || "",
      vetPhone: record.vetPhone || "",
      description: record.description || "",
      notes: record.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (!editFormData.title) {
      toast.error("Please fill in required fields");
      return;
    }
    updateMutation.mutate({
      id: editingRecord.id,
      recordType: editFormData.recordType,
      title: editFormData.title,
      recordDate: editFormData.recordDate,
      nextDueDate: editFormData.nextDueDate || undefined,
      vetName: editFormData.vetName || undefined,
      vetPhone: editFormData.vetPhone || undefined,
      description: editFormData.description || undefined,
      notes: editFormData.notes || undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.horseId || !formData.title) {
      toast.error("Please fill in required fields");
      return;
    }
    createMutation.mutate({
      horseId: parseInt(formData.horseId),
      recordType: formData.recordType,
      title: formData.title,
      recordDate: formData.recordDate,
      nextDueDate: formData.nextDueDate || undefined,
      vetName: formData.vetName || undefined,
      vetPhone: formData.vetPhone || undefined,
      description: formData.description || undefined,
      notes: formData.notes || undefined,
    });
  };

  const getRecordIcon = (type: string) => {
    const recordType = recordTypes.find((r) => r.value === type);
    const Icon = recordType?.icon || FileText;
    return <Icon className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
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
            Health Records
          </h1>
          <p className="text-muted-foreground mt-1">
            Track vaccinations, vet visits, and medical history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-48 sm:w-56"
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add Health Record</DialogTitle>
                <DialogDescription>
                  Record a vaccination, vet visit, or other health event
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <SelectItem
                            key={horse.id}
                            value={horse.id.toString()}
                          >
                            {horse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Record Type *</Label>
                    <Select
                      value={formData.recordType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, recordType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recordTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Annual flu vaccination"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.recordDate}
                      onChange={(e) =>
                        setFormData({ ...formData, recordDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Next Due Date</Label>
                    <Input
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
                  <div className="space-y-2">
                    <Label>Vet Name</Label>
                    <Input
                      value={formData.vetName}
                      onChange={(e) =>
                        setFormData({ ...formData, vetName: e.target.value })
                      }
                      placeholder="Veterinarian name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vet Contact</Label>
                    <Input
                      value={formData.vetPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, vetPhone: e.target.value })
                      }
                      placeholder="Phone or email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Details about the treatment or visit..."
                    rows={3}
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
                  Add Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upcoming Reminders */}
      {reminders && reminders.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Upcoming Reminders
            </CardTitle>
            <CardDescription>
              Health events due in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reminders.slice(0, 5).map((reminder) => {
                const horse = horses?.find((h) => h.id === reminder.horseId);
                const daysUntil = reminder.nextDueDate
                  ? Math.ceil(
                      (new Date(reminder.nextDueDate).getTime() - Date.now()) /
                        (1000 * 60 * 60 * 24),
                    )
                  : 0;
                return (
                  <div
                    key={reminder.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white border border-orange-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                      {getRecordIcon(reminder.recordType)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {horse?.name} • Due in {daysUntil} days
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-700 border-orange-200"
                    >
                      {reminder.nextDueDate &&
                        new Date(reminder.nextDueDate).toLocaleDateString()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Records */}
      <Card>
        <CardHeader>
          <CardTitle>All Health Records</CardTitle>
          <CardDescription>
            Complete medical history for all horses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!records || records.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No health records yet
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Record
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {records
                .filter((record) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  const horse = horses?.find((h) => h.id === record.horseId);
                  return (
                    record.title?.toLowerCase().includes(q) ||
                    record.recordType?.toLowerCase().includes(q) ||
                    record.vetName?.toLowerCase().includes(q) ||
                    record.description?.toLowerCase().includes(q) ||
                    horse?.name?.toLowerCase().includes(q)
                  );
                })
                .map((record) => {
                const horse = horses?.find((h) => h.id === record.horseId);
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {getRecordIcon(record.recordType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{record.title}</p>
                        {horse && (
                          <span className="text-sm text-muted-foreground">
                            • {horse.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.recordDate).toLocaleDateString()}
                        {record.vetName && ` • ${record.vetName}`}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {record.recordType}
                    </Badge>
                    {record.nextDueDate && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.nextDueDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(record)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete this record?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the health record
                              &ldquo;{record.title}&rdquo;. This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(record.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Health Record</DialogTitle>
              <DialogDescription>
                Update the details of this health record
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Horse</Label>
                  <Select value={editFormData.horseId} disabled>
                    <SelectTrigger>
                      <SelectValue placeholder="Select horse" />
                    </SelectTrigger>
                    <SelectContent>
                      {horses?.map((horse) => (
                        <SelectItem
                          key={horse.id}
                          value={horse.id.toString()}
                        >
                          {horse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Record Type *</Label>
                  <Select
                    value={editFormData.recordType}
                    onValueChange={(value: any) =>
                      setEditFormData({ ...editFormData, recordType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                  placeholder="e.g., Annual flu vaccination"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={editFormData.recordDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        recordDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Next Due Date</Label>
                  <Input
                    type="date"
                    value={editFormData.nextDueDate}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        nextDueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vet Name</Label>
                  <Input
                    value={editFormData.vetName}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        vetName: e.target.value,
                      })
                    }
                    placeholder="Veterinarian name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vet Contact</Label>
                  <Input
                    value={editFormData.vetPhone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        vetPhone: e.target.value,
                      })
                    }
                    placeholder="Phone or email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Details about the treatment or visit..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Health() {
  return (
    <DashboardLayout>
      <HealthContent />
    </DashboardLayout>
  );
}
