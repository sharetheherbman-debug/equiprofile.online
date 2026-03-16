import { useState, useEffect, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

const disciplines = [
  "Dressage",
  "Show Jumping",
  "Eventing",
  "Western",
  "Endurance",
  "Polo",
  "Racing",
  "Trail Riding",
  "Driving",
  "Other",
];

const levels = [
  "Beginner",
  "Novice",
  "Intermediate",
  "Advanced",
  "Competition",
  "Professional",
];

function HorseFormContent() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const isEditing = params.id && params.id !== "new";
  const horseId = isEditing ? parseInt(params.id!) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoUploading, setPhotoUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    age: "",
    dateOfBirth: "",
    height: "",
    weight: "",
    color: "",
    gender: "" as "" | "stallion" | "mare" | "gelding",
    discipline: "",
    level: "",
    registrationNumber: "",
    microchipNumber: "",
    notes: "",
    photoUrl: "",
  });

  const { data: horse, isLoading: horseLoading } = trpc.horses.get.useQuery(
    { id: horseId! },
    { enabled: !!horseId },
  );

  const uploadMutation = trpc.documents.upload.useMutation();

  const createMutation = trpc.horses.create.useMutation({
    onSuccess: (data) => {
      toast.success("Horse added successfully!");
      navigate(`/horses/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add horse");
    },
  });

  const updateMutation = trpc.horses.update.useMutation({
    onSuccess: () => {
      toast.success("Horse updated successfully!");
      navigate(`/horses/${horseId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update horse");
    },
  });

  useEffect(() => {
    if (horse) {
      setFormData({
        name: horse.name || "",
        breed: horse.breed || "",
        age: horse.age?.toString() || "",
        dateOfBirth: horse.dateOfBirth
          ? new Date(horse.dateOfBirth).toISOString().split("T")[0]
          : "",
        height: horse.height?.toString() || "",
        weight: horse.weight?.toString() || "",
        color: horse.color || "",
        gender: (horse.gender as "" | "stallion" | "mare" | "gelding") || "",
        discipline: horse.discipline || "",
        level: horse.level || "",
        registrationNumber: horse.registrationNumber || "",
        microchipNumber: horse.microchipNumber || "",
        notes: horse.notes || "",
        photoUrl: horse.photoUrl || "",
      });
      if (horse.photoUrl) setPhotoPreview(horse.photoUrl);
    }
  }, [horse]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Photo must be under 5MB");
      return;
    }
    // Show preview immediately before upload starts
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result;
        if (typeof dataUrl !== "string" || !dataUrl.includes(",")) {
          toast.error("Failed to read file");
          setPhotoUploading(false);
          return;
        }
        const base64 = dataUrl.split(",")[1];
        try {
          const result = await uploadMutation.mutateAsync({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            fileData: base64,
            category: "other",
            description: "Horse profile photo",
          });
          setFormData((prev) => ({ ...prev, photoUrl: result.url }));
          toast.success("Photo uploaded");
        } catch (err: any) {
          toast.error(err.message || "Failed to upload photo");
        } finally {
          setPhotoUploading(false);
        }
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setPhotoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
      setPhotoUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a name for your horse");
      return;
    }

    const data = {
      name: formData.name,
      breed: formData.breed || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      height: formData.height ? parseInt(formData.height) : undefined,
      weight: formData.weight ? parseInt(formData.weight) : undefined,
      color: formData.color || undefined,
      gender: formData.gender || undefined,
      discipline: formData.discipline || undefined,
      level: formData.level || undefined,
      registrationNumber: formData.registrationNumber || undefined,
      microchipNumber: formData.microchipNumber || undefined,
      notes: formData.notes || undefined,
      photoUrl: formData.photoUrl || undefined,
    };

    if (isEditing && horseId) {
      updateMutation.mutate({ id: horseId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending || photoUploading;

  if (horseLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/horses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {isEditing ? "Edit Horse" : "Add New Horse"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditing
              ? "Update your horse's information"
              : "Enter details about your equine companion"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about your horse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter horse's name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) =>
                    setFormData({ ...formData, breed: e.target.value })
                  }
                  placeholder="e.g., Thoroughbred, Arabian"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age (years)</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stallion">Stallion</SelectItem>
                    <SelectItem value="mare">Mare</SelectItem>
                    <SelectItem value="gelding">Gelding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  min="0"
                  max="250"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({ ...formData, height: e.target.value })
                  }
                  placeholder="Height in cm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="1500"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  placeholder="Weight in kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="e.g., Bay, Chestnut"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Training & Discipline</CardTitle>
            <CardDescription>
              Your horse's specialty and skill level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
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
                    {disciplines.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
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
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Identification</CardTitle>
            <CardDescription>
              Registration and identification numbers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registrationNumber: e.target.value,
                    })
                  }
                  placeholder="Passport/registration number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microchipNumber">Microchip Number</Label>
                <Input
                  id="microchipNumber"
                  value={formData.microchipNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      microchipNumber: e.target.value,
                    })
                  }
                  placeholder="Microchip ID"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Photo and notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-start gap-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Horse preview"
                      className="w-20 h-20 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/assets/marketing/brand/horse-1.svg";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoPreview("");
                        setFormData((prev) => ({ ...prev, photoUrl: "" }));
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      aria-label="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20">
                    <Upload className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={photoUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {photoPreview ? "Change Photo" : "Upload Photo"}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Any additional notes about your horse..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/horses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Update Horse" : "Add Horse"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function HorseForm() {
  return (
    <DashboardLayout>
      <HorseFormContent />
    </DashboardLayout>
  );
}
