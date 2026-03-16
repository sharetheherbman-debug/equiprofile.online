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
import { useToast } from "../hooks/use-toast";
import { useRealtimeModule } from "../hooks/useRealtime";
import { PlusCircle, Edit2, Trash2, Tag } from "lucide-react";
import { Badge } from "../components/ui/badge";

const PRESET_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
];

export default function Tags() {
  return (
    <DashboardLayout>
      <TagsContent />
    </DashboardLayout>
  );
}

function TagsContent() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    category: "",
    description: "",
  });

  const { data: tags, refetch } = trpc.tags.list.useQuery();
  const [localTags, setLocalTags] = useState(tags || []);

  // Real-time updates
  useRealtimeModule("tags", (action, data) => {
    if (action === "created") {
      setLocalTags((prev) => [data, ...(prev || [])]);
      toast({ title: "New tag created" });
    } else if (action === "updated") {
      setLocalTags((prev) =>
        (prev || []).map((t) => (t.id === data.id ? { ...t, ...data } : t)),
      );
    } else if (action === "deleted") {
      setLocalTags((prev) => (prev || []).filter((t) => t.id !== data.id));
    }
  });

  // Update local state when data loads
  useState(() => {
    if (tags) setLocalTags(tags);
  });

  const createMutation = trpc.tags.create.useMutation({
    onSuccess: () => {
      toast({ title: "Tag created successfully" });
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

  const updateMutation = trpc.tags.update.useMutation({
    onSuccess: () => {
      toast({ title: "Tag updated successfully" });
      setIsDialogOpen(false);
      setEditingTag(null);
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

  const deleteMutation = trpc.tags.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Tag deleted" });
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
      name: "",
      color: "#3b82f6",
      category: "",
      description: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTag) {
      updateMutation.mutate({
        id: editingTag.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name || "",
      color: tag.color || "#3b82f6",
      category: tag.category || "",
      description: tag.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground">
            Organize your horses, documents, and tasks
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingTag(null);
                resetForm();
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTag ? "Edit Tag" : "New Tag"}</DialogTitle>
              <DialogDescription>
                {editingTag
                  ? "Update tag details"
                  : "Create a new tag for organization"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tag Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Competition, Training, Medical"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Color *</Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                        className={`w-10 h-10 rounded-md border-2 ${
                          formData.color === color.value
                            ? "border-primary ring-2 ring-primary"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Label htmlFor="customColor" className="text-sm">
                      Custom:
                    </Label>
                    <Input
                      id="customColor"
                      type="color"
                      value={formData.color}
                      onChange={(e) =>
                        setFormData({ ...formData, color: e.target.value })
                      }
                      className="w-20 h-10"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.color}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Health, Training, Events"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this tag used for?"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Preview</Label>
                  <Badge
                    style={{
                      backgroundColor: formData.color,
                      color: "#ffffff",
                    }}
                    className="w-fit"
                  >
                    {formData.name || "Tag Name"}
                  </Badge>
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
                  {editingTag ? "Update" : "Create"} Tag
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {localTags && localTags.length > 0 ? (
          localTags.map((tag: any) => (
            <Card key={tag.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      {tag.name}
                    </CardTitle>
                    {tag.category && (
                      <CardDescription>{tag.category}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(tag)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge
                    style={{
                      backgroundColor: tag.color,
                      color: "#ffffff",
                    }}
                  >
                    {tag.name}
                  </Badge>
                  {tag.description && (
                    <p className="text-sm text-muted-foreground">
                      {tag.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No tags yet. Create your first tag above.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
