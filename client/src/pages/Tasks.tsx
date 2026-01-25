import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { trpc } from "@/lib/trpc";
import { Plus, CheckCircle, Clock, AlertCircle, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeModule } from "@/hooks/useRealtime";

function TasksContent() {
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();
  const [localTasks, setLocalTasks] = useState(tasks || []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    horseId: "general",
    title: "",
    description: "",
    taskType: "general_care",
    priority: "medium",
    status: "pending",
    dueDate: "",
    assignedTo: "",
    notes: "",
    reminderDays: "1",
    isRecurring: false,
    recurringInterval: "",
  });

  // Real-time updates
  useRealtimeModule('tasks', (action, data) => {
    switch (action) {
      case 'created':
        setLocalTasks(prev => [data, ...prev]);
        toast.success('Task created');
        break;
      case 'updated':
        setLocalTasks(prev => 
          prev.map(t => t.id === data.id ? { ...t, ...data } : t)
        );
        break;
      case 'deleted':
        setLocalTasks(prev => prev.filter(t => t.id !== data.id));
        toast.success('Task deleted');
        break;
      case 'completed':
        setLocalTasks(prev => 
          prev.map(t => t.id === data.id ? { ...t, ...data } : t)
        );
        toast.success('Task completed!');
        break;
    }
  });

  useEffect(() => {
    if (tasks) setLocalTasks(tasks);
  }, [tasks]);

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });

  const completeMutation = trpc.tasks.complete.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to complete task");
    },
  });

  const deleteMutation = trpc.tasks.delete.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });

  const resetForm = () => {
    setFormData({
      horseId: "general",
      title: "",
      description: "",
      taskType: "general_care",
      priority: "medium",
      status: "pending",
      dueDate: "",
      assignedTo: "",
      notes: "",
      reminderDays: "1",
      isRecurring: false,
      recurringInterval: "",
    });
  };

  const handleCreate = () => {
    if (!formData.title) {
      toast.error("Please enter a task title");
      return;
    }

    createMutation.mutate({
      horseId: formData.horseId && formData.horseId !== "general" ? parseInt(formData.horseId) : undefined,
      title: formData.title,
      description: formData.description || undefined,
      taskType: formData.taskType as any,
      priority: formData.priority as any,
      status: formData.status as any,
      dueDate: formData.dueDate || undefined,
      assignedTo: formData.assignedTo || undefined,
      notes: formData.notes || undefined,
      reminderDays: parseInt(formData.reminderDays),
      isRecurring: formData.isRecurring,
      recurringInterval: formData.recurringInterval ? formData.recurringInterval as any : undefined,
    });
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getHorseName = (horseId: number | null) => {
    if (!horseId) return "General";
    const horse = horses?.find(h => h.id === horseId);
    return horse?.name || "Unknown Horse";
  };

  const pendingTasks = localTasks.filter(t => t.status === 'pending');
  const completedTasks = localTasks.filter(t => t.status === 'completed');

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage your horse care tasks and reminders
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task or reminder for horse care
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="E.g., Farrier appointment"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horse">Horse</Label>
                  <Select value={formData.horseId} onValueChange={(value) => setFormData({ ...formData, horseId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="General task" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General (all horses)</SelectItem>
                      {horses?.map((horse) => (
                        <SelectItem key={horse.id} value={horse.id.toString()}>
                          {horse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="taskType">Type</Label>
                  <Select value={formData.taskType} onValueChange={(value) => setFormData({ ...formData, taskType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hoofcare">Hoofcare</SelectItem>
                      <SelectItem value="health_appointment">Health Appointment</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="deworming">Deworming</SelectItem>
                      <SelectItem value="dental">Dental</SelectItem>
                      <SelectItem value="general_care">General Care</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="feeding">Feeding</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task details..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Person responsible"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
            <CardDescription>Active tasks that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending tasks. Great job!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    {getStatusIcon(task.status)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{getHorseName(task.horseId)}</p>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          )}
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(task.priority)}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completeMutation.mutate({ id: task.id })}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteMutation.mutate({ id: task.id })}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
            <CardDescription>Recently completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {completedTasks.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No completed tasks yet
              </div>
            ) : (
              <div className="space-y-2">
                {completedTasks.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg opacity-60">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm line-through">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{getHorseName(task.horseId)}</p>
                    </div>
                    {task.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Tasks() {
  return (
    <DashboardLayout>
      <TasksContent />
    </DashboardLayout>
  );
}
