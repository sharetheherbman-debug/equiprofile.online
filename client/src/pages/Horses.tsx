import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Plus, Heart, ChevronRight, Edit, Trash2, Download } from "lucide-react";
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
import { toast } from "sonner";
import { downloadCSV } from "@/lib/csvDownload";
import { useRealtimeModule } from "@/hooks/useRealtime";

function HorsesContent() {
  const { data: horses, isLoading, refetch } = trpc.horses.list.useQuery();
  const [localHorses, setLocalHorses] = useState(horses || []);
  
  // Real-time updates
  useRealtimeModule('horses', (action, data) => {
    switch (action) {
      case 'created':
        setLocalHorses(prev => [...prev, data]);
        toast.success(`${data.name} added`);
        break;
      case 'updated':
        setLocalHorses(prev => 
          prev.map(h => h.id === data.id ? { ...h, ...data } : h)
        );
        break;
      case 'deleted':
        setLocalHorses(prev => prev.filter(h => h.id !== data.id));
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
    onSuccess: () => {
      toast.success("Horse removed successfully");
      // Real-time will handle the UI update
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove horse");
    },
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id });
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
          <h1 className="font-serif text-3xl font-bold text-foreground">Your Horses</h1>
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
            <h3 className="font-serif text-xl font-semibold mb-2">No horses yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your first horse to start tracking their health, training, and care.
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
              <div className="aspect-video bg-muted relative">
                {horse.photoUrl ? (
                  <img 
                    src={horse.photoUrl} 
                    alt={horse.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Heart className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
                {horse.gender && (
                  <Badge className="absolute top-3 right-3 capitalize">
                    {horse.gender}
                  </Badge>
                )}
              </div>
              <CardHeader>
                <CardTitle className="font-serif">{horse.name}</CardTitle>
                <CardDescription>
                  {horse.breed || 'Unknown breed'}
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {horse.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the horse from your profile. All associated health records, 
                          training sessions, and documents will also be removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDelete(horse.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
