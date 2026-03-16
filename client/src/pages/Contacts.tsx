import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Plus,
  Phone,
  Mail,
  MapPin,
  Trash2,
  Edit,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { useRealtimeModule } from "@/hooks/useRealtime";

function ContactsContent() {
  const { data: contacts, isLoading } = trpc.contacts.list.useQuery();
  const [localContacts, setLocalContacts] = useState(contacts || []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactType: "vet",
    company: "",
    email: "",
    phone: "",
    mobile: "",
    address: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    website: "",
    notes: "",
    isPrimary: false,
  });

  // Real-time updates
  useRealtimeModule("contacts", (action, data) => {
    switch (action) {
      case "created":
        setLocalContacts((prev) => [data, ...prev]);
        toast.success("Contact added");
        break;
      case "updated":
        setLocalContacts((prev) =>
          prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)),
        );
        break;
      case "deleted":
        setLocalContacts((prev) => prev.filter((c) => c.id !== data.id));
        toast.success("Contact deleted");
        break;
    }
  });

  useEffect(() => {
    if (contacts) setLocalContacts(contacts);
  }, [contacts]);

  const createMutation = trpc.contacts.create.useMutation({
    onSuccess: () => {
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create contact");
    },
  });

  const deleteMutation = trpc.contacts.delete.useMutation({
    onError: (error) => {
      toast.error(error.message || "Failed to delete contact");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contactType: "vet",
      company: "",
      email: "",
      phone: "",
      mobile: "",
      address: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
      website: "",
      notes: "",
      isPrimary: false,
    });
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Please enter a contact name");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      contactType: formData.contactType as any,
      company: formData.company || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      mobile: formData.mobile || undefined,
      address: formData.address || undefined,
      city: formData.city || undefined,
      postcode: formData.postcode || undefined,
      country: formData.country || undefined,
      website: formData.website || undefined,
      notes: formData.notes || undefined,
      isPrimary: formData.isPrimary,
    });
  };

  const getContactTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      vet: "bg-blue-500",
      farrier: "bg-amber-500",
      trainer: "bg-purple-500",
      instructor: "bg-pink-500",
      stable: "bg-green-500",
      breeder: "bg-indigo-500",
      supplier: "bg-orange-500",
      emergency: "bg-red-500",
      other: "bg-gray-500",
    };
    return <Badge className={colors[type] || "bg-gray-500"}>{type}</Badge>;
  };

  const groupedContacts = localContacts.reduce(
    (acc, contact) => {
      if (!acc[contact.contactType]) acc[contact.contactType] = [];
      acc[contact.contactType].push(contact);
      return acc;
    },
    {} as Record<string, typeof localContacts>,
  );

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Contacts
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage vets, farriers, trainers, and service providers
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Add a vet, farrier, trainer, or other service provider
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dr. Smith"
                  />
                </div>

                <div>
                  <Label htmlFor="contactType">Type</Label>
                  <Select
                    value={formData.contactType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, contactType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vet">Vet</SelectItem>
                      <SelectItem value="farrier">Farrier</SelectItem>
                      <SelectItem value="trainer">Trainer</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="stable">Stable</SelectItem>
                      <SelectItem value="breeder">Breeder</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company/Practice</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="ABC Veterinary Clinic"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="01234 567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    placeholder="07123 456789"
                  />
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="London"
                  />
                </div>

                <div>
                  <Label htmlFor="postcode">Postcode</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) =>
                      setFormData({ ...formData, postcode: e.target.value })
                    }
                    placeholder="SW1A 1AA"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional information..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Contact"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {localContacts.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Building2 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">
              No contacts yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Add vets, farriers, trainers, and other service providers
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.entries(groupedContacts).map(([type, typeContacts]) => (
            <Card key={type}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="capitalize">{type}s</CardTitle>
                  <Badge variant="secondary">{typeContacts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold">{contact.name}</h4>
                            {contact.company && (
                              <p className="text-sm text-muted-foreground">
                                {contact.company}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {getContactTypeBadge(contact.contactType)}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                deleteMutation.mutate({ id: contact.id })
                              }
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <a
                                href={`mailto:${contact.email}`}
                                className="hover:underline"
                              >
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <a
                                href={`tel:${contact.phone}`}
                                className="hover:underline"
                              >
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {contact.address && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {contact.address}
                                {contact.city && `, ${contact.city}`}
                                {contact.postcode && ` ${contact.postcode}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Contacts() {
  return (
    <DashboardLayout>
      <ContactsContent />
    </DashboardLayout>
  );
}
