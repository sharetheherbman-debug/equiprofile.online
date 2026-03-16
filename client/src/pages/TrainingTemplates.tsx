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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Copy, Trash2, Play, Globe, Lock } from "lucide-react";
import { toast } from "sonner";

function TrainingTemplatesContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    discipline: "",
    level: "",
    goals: "",
    isPublic: false,
  });
  const [applyData, setApplyData] = useState({
    horseId: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const utils = trpc.useUtils();
  const { data: templates, isLoading } =
    trpc.trainingPrograms.listTemplates.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();

  const createMutation = trpc.trainingPrograms.createTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template created successfully");
      utils.trainingPrograms.listTemplates.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = trpc.trainingPrograms.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template updated successfully");
      utils.trainingPrograms.listTemplates.invalidate();
      setIsEditOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.trainingPrograms.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template deleted successfully");
      utils.trainingPrograms.listTemplates.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const duplicateMutation = trpc.trainingPrograms.duplicateTemplate.useMutation(
    {
      onSuccess: () => {
        toast.success("Template duplicated successfully");
        utils.trainingPrograms.listTemplates.invalidate();
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      },
    },
  );

  const applyMutation = trpc.trainingPrograms.applyTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template applied to horse successfully");
      setIsApplyOpen(false);
      setSelectedTemplate(null);
      setApplyData({
        horseId: "",
        startDate: new Date().toISOString().split("T")[0],
      });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      discipline: "",
      level: "",
      goals: "",
      isPublic: false,
    });
    setSelectedTemplate(null);
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      discipline: formData.discipline || undefined,
      level: formData.level || undefined,
      goals: formData.goals || undefined,
      programData: JSON.stringify({ weeks: [] }),
      isPublic: formData.isPublic,
    });
  };

  const handleEdit = () => {
    if (!selectedTemplate || !formData.name) {
      toast.error("Template name is required");
      return;
    }

    updateMutation.mutate({
      id: selectedTemplate.id,
      name: formData.name,
      description: formData.description || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      discipline: formData.discipline || undefined,
      level: formData.level || undefined,
      goals: formData.goals || undefined,
      isPublic: formData.isPublic,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate({ id });
  };

  const openEditDialog = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      duration: template.duration?.toString() || "",
      discipline: template.discipline || "",
      level: template.level || "",
      goals: template.goals || "",
      isPublic: template.isPublic || false,
    });
    setIsEditOpen(true);
  };

  const openApplyDialog = (template: any) => {
    setSelectedTemplate(template);
    setIsApplyOpen(true);
  };

  const handleApply = () => {
    if (!selectedTemplate || !applyData.horseId) {
      toast.error("Please select a horse");
      return;
    }

    applyMutation.mutate({
      templateId: selectedTemplate.id,
      horseId: parseInt(applyData.horseId),
      startDate: applyData.startDate,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable training program templates
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Training Template</DialogTitle>
              <DialogDescription>
                Create a reusable training program template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Jumping Fundamentals, Dressage Level 1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the training program"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 12"
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="discipline">Discipline</Label>
                <Select
                  value={formData.discipline}
                  onValueChange={(value) =>
                    setFormData({ ...formData, discipline: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dressage">Dressage</SelectItem>
                    <SelectItem value="jumping">Jumping</SelectItem>
                    <SelectItem value="eventing">Eventing</SelectItem>
                    <SelectItem value="western">Western</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) =>
                    setFormData({ ...formData, goals: e.target.value })
                  }
                  placeholder="Training goals and objectives"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="isPublic">
                  Make this template public (visible to all users)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {!templates || templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              No training templates yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first training template to streamline your training
              programs
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.description || "No description"}
                    </CardDescription>
                  </div>
                  {template.isPublic ? (
                    <Badge variant="secondary" className="ml-2">
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {template.discipline && (
                      <Badge variant="outline">{template.discipline}</Badge>
                    )}
                    {template.level && (
                      <Badge variant="outline">{template.level}</Badge>
                    )}
                    {template.duration && (
                      <Badge variant="outline">{template.duration} weeks</Badge>
                    )}
                  </div>

                  {template.goals && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.goals}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => openApplyDialog(template)}
                      className="flex-1"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(template)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(template.id)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Training Template</DialogTitle>
            <DialogDescription>
              Update the training program template details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Template Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Jumping Fundamentals, Dressage Level 1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the training program"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration (weeks)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <Label htmlFor="edit-level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-discipline">Discipline</Label>
              <Select
                value={formData.discipline}
                onValueChange={(value) =>
                  setFormData({ ...formData, discipline: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dressage">Dressage</SelectItem>
                  <SelectItem value="jumping">Jumping</SelectItem>
                  <SelectItem value="eventing">Eventing</SelectItem>
                  <SelectItem value="western">Western</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-goals">Goals</Label>
              <Textarea
                id="edit-goals"
                value={formData.goals}
                onChange={(e) =>
                  setFormData({ ...formData, goals: e.target.value })
                }
                placeholder="Training goals and objectives"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPublic"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="edit-isPublic">Make this template public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Template to Horse</DialogTitle>
            <DialogDescription>
              Select a horse and start date to apply this training template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="horse">Select Horse *</Label>
              <Select
                value={applyData.horseId}
                onValueChange={(value) =>
                  setApplyData({ ...applyData, horseId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a horse" />
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
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={applyData.startDate}
                onChange={(e) =>
                  setApplyData({ ...applyData, startDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApplyOpen(false);
                setSelectedTemplate(null);
                setApplyData({
                  horseId: "",
                  startDate: new Date().toISOString().split("T")[0],
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Applying..." : "Apply Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TrainingTemplates() {
  return (
    <DashboardLayout>
      <TrainingTemplatesContent />
    </DashboardLayout>
  );
}
