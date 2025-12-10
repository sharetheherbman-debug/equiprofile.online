import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
  "Other"
];

const levels = [
  "Beginner",
  "Novice",
  "Intermediate",
  "Advanced",
  "Competition",
  "Professional"
];

function HorseFormContent() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const isEditing = params.id && params.id !== "new";
  const horseId = isEditing ? parseInt(params.id!) : null;

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
    { enabled: !!horseId }
  );

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
        dateOfBirth: horse.dateOfBirth ? new Date(horse.dateOfBirth).toISOString().split('T')[0] : "",
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
    }
  }, [horse]);

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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
            {isEditing ? "Update your horse's information" : "Enter details about your equine companion"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about your horse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter horse's name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as any })}
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
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Weight in kg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g., Bay, Chestnut"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Training & Discipline</CardTitle>
            <CardDescription>Your horse's specialty and skill level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discipline">Discipline</Label>
                <Select
                  value={formData.discipline}
                  onValueChange={(value) => setFormData({ ...formData, discipline: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    {disciplines.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
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
            <CardDescription>Registration and identification numbers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="Passport/registration number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="microchipNumber">Microchip Number</Label>
                <Input
                  id="microchipNumber"
                  value={formData.microchipNumber}
                  onChange={(e) => setFormData({ ...formData, microchipNumber: e.target.value })}
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
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL to your horse's photo. File upload coming soon.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about your horse..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/horses">
            <Button type="button" variant="outline">Cancel</Button>
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
