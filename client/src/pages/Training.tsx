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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Sparkles,
  Play,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { useRealtimeModule } from "@/hooks/useRealtime";

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

type SessionType = "flatwork" | "jumping" | "hacking" | "lunging" | "groundwork" | "competition" | "lesson" | "other";
type PerformanceType = "excellent" | "good" | "average" | "poor";

function TrainingContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null);
  const [editingSession, setEditingSession] = useState<{ id: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [editFormData, setEditFormData] = useState({
    horseId: "",
    sessionDate: "",
    startTime: "",
    sessionType: "flatwork" as string,
    duration: "",
    trainer: "",
    location: "",
    goals: "",
    notes: "",
    performance: "" as string,
  });

  // All hooks must be before any conditional returns
  const utils = trpc.useUtils();
  const { data: horses } = trpc.horses.list.useQuery();
  const {
    data: sessions,
    isLoading,
  } = trpc.training.listAll.useQuery();
  const { data: upcomingSessions } = trpc.training.getUpcoming.useQuery();
  const { data: templates } = trpc.trainingPrograms.listTemplates.useQuery();

  // Real-time subscription — refresh when another device adds/updates a session
  useRealtimeModule("training", () => {
    utils.training.listAll.invalidate();
    utils.training.getUpcoming.invalidate();
  });

  const createMutation = trpc.training.create.useMutation({
    onSuccess: () => {
      toast.success("Training session scheduled!");
      setIsDialogOpen(false);
      utils.training.listAll.invalidate();
      utils.training.getUpcoming.invalidate();
      // Also invalidate calendar cache since backend auto-creates a calendar event
      utils.calendar.getEvents.invalidate();
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
      utils.training.listAll.invalidate();
      utils.training.getUpcoming.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateMutation = trpc.training.update.useMutation({
    onSuccess: () => {
      toast.success("Training session updated!");
      setIsEditDialogOpen(false);
      setEditingSession(null);
      utils.training.listAll.invalidate();
      utils.training.getUpcoming.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.training.delete.useMutation({
    onSuccess: () => {
      toast.success("Training session deleted!");
      setIsDeleteAlertOpen(false);
      setDeletingSessionId(null);
      utils.training.listAll.invalidate();
      utils.training.getUpcoming.invalidate();
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

  const handleEdit = (session: {
    id: number;
    horseId: number;
    sessionDate: string | Date;
    startTime: string | null;
    sessionType: string;
    duration: number | null;
    trainer: string | null;
    location: string | null;
    goals: string | null;
    notes: string | null;
    performance: string | null;
  }) => {
    setEditingSession(session);
    setEditFormData({
      horseId: session.horseId?.toString() || "",
      sessionDate: session.sessionDate
        ? new Date(session.sessionDate).toISOString().split("T")[0]
        : "",
      startTime: session.startTime || "",
      sessionType: session.sessionType || "flatwork",
      duration: session.duration?.toString() || "",
      trainer: session.trainer || "",
      location: session.location || "",
      goals: session.goals || "",
      notes: session.notes || "",
      performance: session.performance || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    updateMutation.mutate({
      id: editingSession.id,
      sessionDate: editFormData.sessionDate || undefined,
      startTime: editFormData.startTime || undefined,
      sessionType: (editFormData.sessionType as SessionType) || undefined,
      duration: editFormData.duration ? parseInt(editFormData.duration) : undefined,
      trainer: editFormData.trainer || undefined,
      location: editFormData.location || undefined,
      goals: editFormData.goals || undefined,
      notes: editFormData.notes || undefined,
      performance: editFormData.performance
        ? (editFormData.performance as PerformanceType)
        : undefined,
    });
  };

  const handleDeleteConfirm = (sessionId: number) => {
    setDeletingSessionId(sessionId);
    setIsDeleteAlertOpen(true);
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
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Training
          </h1>
          <p className="text-muted-foreground mt-1">
            Sessions, schedules, and training programmes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-48 sm:w-56"
            />
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
                  <Label htmlFor="train-horse">Horse *</Label>
                  <Select
                    value={formData.horseId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, horseId: value })
                    }
                  >
                    <SelectTrigger id="train-horse">
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
                  <div className="space-y-2">
                    <Label htmlFor="train-date">Date *</Label>
                    <Input
                      id="train-date"
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
                    <Label htmlFor="train-time">Time</Label>
                    <Input
                      id="train-time"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="train-session-type">Session Type *</Label>
                    <Select
                      value={formData.sessionType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, sessionType: value })
                      }
                    >
                      <SelectTrigger id="train-session-type">
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
                    <Label htmlFor="train-duration">Duration (min)</Label>
                    <Input
                      id="train-duration"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="train-trainer">Trainer</Label>
                    <Input
                      id="train-trainer"
                      autoComplete="name"
                      value={formData.trainer}
                      onChange={(e) =>
                        setFormData({ ...formData, trainer: e.target.value })
                      }
                      placeholder="Trainer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="train-location">Location</Label>
                    <Input
                      id="train-location"
                      autoComplete="off"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Arena, field, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="train-goals">Goals</Label>
                  <Textarea
                    id="train-goals"
                    autoComplete="off"
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
      </div>

      {/* Tabs: Sessions / Templates */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="sessions" className="gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Sessions tab */}
        <TabsContent value="sessions" className="space-y-4">
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
                            {horse && (
                              <Badge variant="outline">{horse.name}</Badge>
                            )}
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
                        <div className="flex items-center gap-2">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(session)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteConfirm(session.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
                  {sessions
                    .filter((session) => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      const horse = horses?.find((h) => h.id === session.horseId);
                      return (
                        session.sessionType?.toLowerCase().includes(q) ||
                        session.trainer?.toLowerCase().includes(q) ||
                        session.location?.toLowerCase().includes(q) ||
                        session.goals?.toLowerCase().includes(q) ||
                        session.notes?.toLowerCase().includes(q) ||
                        horse?.name?.toLowerCase().includes(q)
                      );
                    })
                    .map((session) => {
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
                          variant={
                            session.isCompleted ? "secondary" : "outline"
                          }
                        >
                          {session.isCompleted ? "Completed" : "Scheduled"}
                        </Badge>
                        {session.performance && (
                          <Badge variant="outline" className="capitalize">
                            {session.performance}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(session)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteConfirm(session.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates tab */}
        <TabsContent value="templates" className="space-y-4">
          {/* Quick template grid — compact preview; full management on /training-templates */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {templates && templates.length > 0
                ? `${templates.length} template${templates.length !== 1 ? "s" : ""} in your library`
                : "No custom templates yet — add from the starter library below"}
            </p>
            <Link href="/training-templates">
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4 mr-1.5" />
                Manage All Templates
              </Button>
            </Link>
          </div>

          {/* User templates (compact) */}
          {templates && templates.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => (
                <Card
                  key={tpl.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{tpl.name}</CardTitle>
                    {tpl.description && (
                      <CardDescription className="text-xs line-clamp-2">
                        {tpl.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tpl.discipline && (
                        <Badge variant="outline" className="text-xs">
                          {tpl.discipline}
                        </Badge>
                      )}
                      {tpl.level && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {tpl.level}
                        </Badge>
                      )}
                      {tpl.duration && (
                        <Badge variant="outline" className="text-xs">
                          {tpl.duration}w
                        </Badge>
                      )}
                    </div>
                    <Link href="/training-templates">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs"
                      >
                        <Play className="w-3 h-3 mr-1.5" />
                        View &amp; Apply
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Starter library prompt */}
          <Card className="border-dashed border-2 border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    Starter Template Library
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Browse &amp; apply professional equestrian training
                    programmes
                  </p>
                </div>
              </div>
              <Link href="/training-templates">
                <Button
                  variant="default"
                  size="sm"
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-700"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Templates
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this training session. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingSessionId &&
                deleteMutation.mutate({ id: deletingSessionId })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit session dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Training Session</DialogTitle>
              <DialogDescription>
                Update the details of this training session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-train-horse">Horse</Label>
                <Select
                  value={editFormData.horseId}
                  disabled
                >
                  <SelectTrigger id="edit-train-horse">
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
                <div className="space-y-2">
                  <Label htmlFor="edit-train-date">Date *</Label>
                  <Input
                    id="edit-train-date"
                    type="date"
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        sessionDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-train-time">Time</Label>
                  <Input
                    id="edit-train-time"
                    type="time"
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-train-session-type">Session Type *</Label>
                  <Select
                    value={editFormData.sessionType}
                    onValueChange={(value: SessionType) =>
                      setEditFormData({ ...editFormData, sessionType: value })
                    }
                  >
                    <SelectTrigger id="edit-train-session-type">
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
                  <Label htmlFor="edit-train-duration">Duration (min)</Label>
                  <Input
                    id="edit-train-duration"
                    type="number"
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        duration: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-train-trainer">Trainer</Label>
                  <Input
                    id="edit-train-trainer"
                    autoComplete="name"
                    value={editFormData.trainer}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        trainer: e.target.value,
                      })
                    }
                    placeholder="Trainer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-train-location">Location</Label>
                  <Input
                    id="edit-train-location"
                    autoComplete="off"
                    value={editFormData.location}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        location: e.target.value,
                      })
                    }
                    placeholder="Arena, field, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-train-performance">Performance</Label>
                <Select
                  value={editFormData.performance}
                  onValueChange={(value) =>
                    setEditFormData({ ...editFormData, performance: value })
                  }
                >
                  <SelectTrigger id="edit-train-performance">
                    <SelectValue placeholder="Select performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-train-goals">Goals</Label>
                <Textarea
                  id="edit-train-goals"
                  autoComplete="off"
                  value={editFormData.goals}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, goals: e.target.value })
                  }
                  placeholder="What do you want to achieve?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-train-notes">Notes</Label>
                <Textarea
                  id="edit-train-notes"
                  autoComplete="off"
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  placeholder="Session notes"
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

export default function Training() {
  return (
    <DashboardLayout>
      <TrainingContent />
    </DashboardLayout>
  );
}
