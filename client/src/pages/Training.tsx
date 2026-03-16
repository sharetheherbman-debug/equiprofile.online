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
import { Link } from "wouter";
import {
  Plus,
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const sessionTypes = [
  { value: "flatwork", label: "Flatwork" },
  { value: "jumping", label: "Jumping" },
  { value: "hacking", label: "Hacking" },
  { value: "lunging", label: "Lunging" },
  { value: "groundwork", label: "Groundwork" },
  { value: "competition", label: "Competition" },
  { value: "lesson", label: "Lesson" },
  { value: "other", label: "Other" },
];

function TrainingContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    horseId: "",
    sessionDate: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    sessionType: "flatwork" as const,
    duration: "60",
    trainer: "",
    location: "",
    goals: "",
    notes: "",
  });

  const { data: horses } = trpc.horses.list.useQuery();
  const {
    data: sessions,
    isLoading,
    refetch,
  } = trpc.training.listAll.useQuery();
  const { data: upcomingSessions } = trpc.training.getUpcoming.useQuery();

  const createMutation = trpc.training.create.useMutation({
    onSuccess: () => {
      toast.success("Training session scheduled!");
      setIsDialogOpen(false);
      refetch();
      setFormData({
        horseId: "",
        sessionDate: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        sessionType: "flatwork",
        duration: "60",
        trainer: "",
        location: "",
        goals: "",
        notes: "",
      });
    },
    onError: (error) => toast.error(error.message),
  });

  const completeMutation = trpc.training.complete.useMutation({
    onSuccess: () => {
      toast.success("Session marked as complete!");
      refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.horseId) {
      toast.error("Please select a horse");
      return;
    }
    createMutation.mutate({
      horseId: parseInt(formData.horseId),
      sessionDate: formData.sessionDate,
      startTime: formData.startTime,
      sessionType: formData.sessionType,
      duration: parseInt(formData.duration) || undefined,
      trainer: formData.trainer || undefined,
      location: formData.location || undefined,
      goals: formData.goals || undefined,
      notes: formData.notes || undefined,
    });
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
            Training Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            Plan and track your training sessions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Schedule Training Session</DialogTitle>
                <DialogDescription>
                  Plan a new training session for your horse
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
                    <Label>Date *</Label>
                    <Input
                      type="date"
                      value={formData.sessionDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sessionDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Session Type *</Label>
                    <Select
                      value={formData.sessionType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, sessionType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trainer</Label>
                    <Input
                      value={formData.trainer}
                      onChange={(e) =>
                        setFormData({ ...formData, trainer: e.target.value })
                      }
                      placeholder="Trainer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Arena, field, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Goals</Label>
                  <Textarea
                    value={formData.goals}
                    onChange={(e) =>
                      setFormData({ ...formData, goals: e.target.value })
                    }
                    placeholder="What do you want to achieve?"
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
                  Schedule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions && upcomingSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingSessions.slice(0, 5).map((session) => {
                const horse = horses?.find((h) => h.id === session.horseId);
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">
                          {session.sessionType}
                        </p>
                        {horse && <Badge variant="outline">{horse.name}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.sessionDate).toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          },
                        )}
                        {session.startTime && ` at ${session.startTime}`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        completeMutation.mutate({ id: session.id })
                      }
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>Your complete training history</CardDescription>
        </CardHeader>
        <CardContent>
          {!sessions || sessions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No training sessions yet
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const horse = horses?.find((h) => h.id === session.horseId);
                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium capitalize">
                          {session.sessionType}
                        </p>
                        {horse && (
                          <span className="text-sm text-muted-foreground">
                            • {horse.name}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.sessionDate).toLocaleDateString()}
                        {session.duration && ` • ${session.duration} min`}
                      </p>
                    </div>
                    <Badge
                      variant={session.isCompleted ? "secondary" : "outline"}
                    >
                      {session.isCompleted ? "Completed" : "Scheduled"}
                    </Badge>
                    {session.performance && (
                      <Badge variant="outline" className="capitalize">
                        {session.performance}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Training() {
  return (
    <DashboardLayout>
      <TrainingContent />
    </DashboardLayout>
  );
}
