import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Plus,
  Heart,
  ChevronRight,
  Edit,
  Trash2,
  Download,
  Archive,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csvDownload";
import { useRealtimeModule } from "@/hooks/useRealtime";

function HorsesContent() {
  const { data: horses, isLoading, refetch } = trpc.horses.list.useQuery();
  const [localHorses, setLocalHorses] = useState(horses || []);

  // Real-time updates
  useRealtimeModule("horses", (action, data) => {
    switch (action) {
      case "created":
        setLocalHorses((prev) => [...prev, data]);
        toast.success(`${data.name} added`);
        break;
      case "updated":
        setLocalHorses((prev) =>
          prev.map((h) => (h.id === data.id ? { ...h, ...data } : h)),
        );
        break;
      case "deleted":
        setLocalHorses((prev) => prev.filter((h) => h.id !== data.id));
        break;
    }
  });

  // Update local state when query data changes
  useEffect(() => {
    if (horses) setLocalHorses(horses);
  }, [horses]);

  const exportMutation = trpc.horses.exportCSV.useQuery(undefined, {
    enabled: false,
  });

  const deleteMutation = trpc.horses.delete.useMutation({
    onSuccess: (_data, variables) => {
      const labels: Record<string, string> = {
        archive: "Horse archived successfully",
        delete: "Horse removed successfully",
        delete_all: "Horse and all data permanently deleted",
      };
      toast.success(labels[variables.mode ?? "archive"] || "Done");
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove horse");
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [confirmFullDelete, setConfirmFullDelete] = useState(false);

  const handleDelete = (mode: "archive" | "delete" | "delete_all") => {
    if (!deleteTarget) return;
    if (mode === "delete_all" && !confirmFullDelete) {
      setConfirmFullDelete(true);
      return;
    }
    deleteMutation.mutate({ id: deleteTarget.id, mode });
    setConfirmFullDelete(false);
  };

  const handleExport = async () => {
    try {
      const result = await exportMutation.refetch();
      if (result.data) {
        downloadCSV(result.data.csv, result.data.filename);
        toast.success("Horses exported successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to export horses");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
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
            Your Horses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage profiles for all your equine companions
          </p>
        </div>
        <div className="flex gap-2">
          {localHorses && localHorses.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
          <Link href="/horses/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Horse
            </Button>
          </Link>
        </div>
      </div>

      {!localHorses || localHorses.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">
              No horses yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Add your first horse to start tracking their health, training, and
              care.
            </p>
            <Link href="/horses/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Horse
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localHorses.map((horse) => (
            <Card key={horse.id} className="card-hover overflow-hidden">
              <div className="p-3 pb-0">
                <div className="aspect-[4/3] bg-muted rounded-xl overflow-hidden relative">
                  {horse.photoUrl ? (
                    <img
                      src={horse.photoUrl}
                      alt={horse.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/hero/image6.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-900/20 to-pink-900/20">
                      <Heart className="w-14 h-14 text-muted-foreground/30" />
                    </div>
                  )}
                  {horse.gender && (
                    <Badge className="absolute top-2.5 right-2.5 capitalize">
                      {horse.gender}
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="font-serif">{horse.name}</CardTitle>
                <CardDescription>
                  {horse.breed || "Unknown breed"}
                  {horse.age && ` • ${horse.age} years old`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {horse.discipline && (
                    <Badge variant="secondary">{horse.discipline}</Badge>
                  )}
                  {horse.level && (
                    <Badge variant="outline">{horse.level}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/horses/${horse.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Profile
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href={`/horses/${horse.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => { setDeleteTarget(horse); setConfirmFullDelete(false); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Horse removal dialog — three safe options */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setConfirmFullDelete(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Remove {deleteTarget?.name}
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to handle this horse and its records.
            </DialogDescription>
          </DialogHeader>

          {!confirmFullDelete ? (
            <div className="space-y-3 py-2">
              {/* Option 1: Archive (safest) */}
              <button
                onClick={() => handleDelete("archive")}
                disabled={deleteMutation.isPending}
                className="w-full text-left p-4 rounded-lg border hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <Archive className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Archive Horse</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hides {deleteTarget?.name} from your stable list. All records
                      (health, training, documents) are preserved and can be restored later.
                    </p>
                    <Badge variant="secondary" className="mt-2 text-[10px]">Recommended</Badge>
                  </div>
                </div>
              </button>

              {/* Option 2: Delete horse only */}
              <button
                onClick={() => handleDelete("delete")}
                disabled={deleteMutation.isPending}
                className="w-full text-left p-4 rounded-lg border hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Remove Horse</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Removes {deleteTarget?.name} from your profile. Linked records remain
                      in the system for your records.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 3: Delete everything */}
              <button
                onClick={() => handleDelete("delete_all")}
                disabled={deleteMutation.isPending}
                className="w-full text-left p-4 rounded-lg border border-red-200 hover:border-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-red-600 dark:text-red-400">
                      Delete Horse &amp; All Data
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently removes {deleteTarget?.name} and all linked health records,
                      training sessions, documents, appointments, and other data. This cannot be undone.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* Confirmation step for full delete */
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  ⚠️ This will permanently delete:
                </p>
                <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 list-disc list-inside">
                  <li>All health records &amp; vaccinations</li>
                  <li>Training sessions &amp; programmes</li>
                  <li>Documents &amp; uploads</li>
                  <li>Feeding plans &amp; nutrition logs</li>
                  <li>Appointments, tasks &amp; calendar events</li>
                  <li>Pedigree data &amp; competition records</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setConfirmFullDelete(false)}
                >
                  Go Back
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (deleteTarget) {
                      deleteMutation.mutate({ id: deleteTarget.id, mode: "delete_all" });
                      setConfirmFullDelete(false);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete Everything"}
                </Button>
              </div>
            </div>
          )}

          {!confirmFullDelete && (
            <div className="flex justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={() => { setDeleteTarget(null); setConfirmFullDelete(false); }}>
                Cancel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Horses() {
  return (
    <DashboardLayout>
      <HorsesContent />
    </DashboardLayout>
  );
}
