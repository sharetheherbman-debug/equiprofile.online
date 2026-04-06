import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  Smartphone,
  Mail,
  MapPin,
  Trash2,
  Edit,
  Building2,
  Search,
  Globe,
  StickyNote,
  Star,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { useRealtimeModule } from "@/hooks/useRealtime";
import { downloadCSV } from "@/lib/csvDownload";

function ContactsContent() {
  const utils = trpc.useUtils();
  const { data: contacts, isLoading } = trpc.contacts.list.useQuery();
  const [localContacts, setLocalContacts] = useState(contacts || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<(typeof localContacts)[0] | null>(null);
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
  const [editFormData, setEditFormData] = useState({ ...formData });

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
    onSuccess: async () => {
      setIsCreateOpen(false);
      resetForm();
      await utils.contacts.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create contact");
    },
  });

  const updateMutation = trpc.contacts.update.useMutation({
    onSuccess: async () => {
      setEditingContact(null);
      await utils.contacts.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update contact");
    },
  });

  const deleteMutation = trpc.contacts.delete.useMutation({
    onSuccess: async () => {
      await utils.contacts.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete contact");
    },
  });

  const exportQuery = trpc.contacts.exportCSV.useQuery(undefined, {
    enabled: false,
  });

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (result.data) {
      downloadCSV(result.data.csv, result.data.filename);
    }
  };

  const avatarColors: Record<string, string> = {
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

  const openEditDialog = (contact: (typeof localContacts)[0]) => {
    setEditFormData({
      name: contact.name || "",
      contactType: contact.contactType || "vet",
      company: contact.company || "",
      email: contact.email || "",
      phone: contact.phone || "",
      mobile: contact.mobile || "",
      address: contact.address || "",
      city: contact.city || "",
      postcode: contact.postcode || "",
      country: contact.country || "United Kingdom",
      website: contact.website || "",
      notes: contact.notes || "",
      isPrimary: !!contact.isPrimary,
    });
    setEditingContact(contact);
  };

  const handleUpdate = () => {
    if (!editingContact) return;
    if (!editFormData.name) {
      toast.error("Please enter a contact name");
      return;
    }
    updateMutation.mutate({
      id: editingContact.id,
      name: editFormData.name,
      contactType: editFormData.contactType as any,
      company: editFormData.company || undefined,
      email: editFormData.email || undefined,
      phone: editFormData.phone || undefined,
      mobile: editFormData.mobile || undefined,
      address: editFormData.address || undefined,
      city: editFormData.city || undefined,
      postcode: editFormData.postcode || undefined,
      country: editFormData.country || undefined,
      website: editFormData.website || undefined,
      notes: editFormData.notes || undefined,
      isPrimary: editFormData.isPrimary,
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

  const filteredContacts = searchQuery.trim()
    ? localContacts.filter((c) => {
        const q = searchQuery.toLowerCase();
        return (
          c.name?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.mobile?.toLowerCase().includes(q) ||
          c.contactType?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q)
        );
      })
    : localContacts;

  const groupedContacts = filteredContacts.reduce(
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
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exportQuery.isFetching}
          >
            <Download className="w-4 h-4 mr-2" />
            {exportQuery.isFetching ? "Exporting…" : "Export CSV"}
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Contact
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Add a vet, farrier, trainer, or other service provider
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dr. Smith"
                    autoComplete="name"
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
                    <SelectTrigger id="contactType">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    autoComplete="email"
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
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({ ...formData, mobile: e.target.value })
                    }
                    placeholder="07123 456789"
                    autoComplete="tel"
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
                    autoComplete="url"
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="London"
                    autoComplete="address-level2"
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
                    autoComplete="postal-code"
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
                    autoComplete="country-name"
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
      ) : filteredContacts.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No contacts match &ldquo;{searchQuery}&rdquo;</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedContacts).map(([type, typeContacts]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground capitalize">
                  {type}s
                </h2>
                <Badge variant="secondary" className="text-xs">{typeContacts.length}</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeContacts.map((contact) => {
                  const addressParts = [contact.address, contact.city, contact.postcode, contact.country].filter(Boolean);
                  const mapsUrl = addressParts.length
                    ? `https://maps.google.com/?q=${encodeURIComponent(addressParts.join(", "))}`
                    : null;
                  const rawWebsite = contact.website ?? "";
                  const websiteUrl = rawWebsite
                    ? rawWebsite.startsWith("http") ? rawWebsite : `https://${rawWebsite}`
                    : null;
                  const avatarColor = avatarColors[contact.contactType] ?? "bg-gray-500";
                  const initial = contact.name ? contact.name.charAt(0).toUpperCase() : "?";

                  return (
                    <Card key={contact.id} className="flex flex-col">
                      <CardContent className="flex flex-col flex-1 p-4 gap-0">
                        {/* Card header: avatar + name + badge */}
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg shrink-0`}
                          >
                            {initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-semibold text-sm leading-tight truncate">
                                {contact.name}
                              </h4>
                              {contact.isPrimary && (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                            {contact.company && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {contact.company}
                              </p>
                            )}
                            <div className="mt-1">
                              {getContactTypeBadge(contact.contactType)}
                            </div>
                          </div>
                        </div>

                        {/* Notes snippet */}
                        {contact.notes && (
                          <div className="flex items-start gap-1.5 mb-2 text-xs text-muted-foreground">
                            <StickyNote className="w-3 h-3 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{contact.notes}</span>
                          </div>
                        )}

                        {/* Action icon buttons */}
                        <div className="flex items-center gap-1 flex-wrap mt-auto pt-2 border-t">
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              title={`Call ${contact.phone}`}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                          {contact.mobile && (
                            <a
                              href={`tel:${contact.mobile}`}
                              title={`Mobile ${contact.mobile}`}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Smartphone className="w-4 h-4" />
                            </a>
                          )}
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              title={contact.email}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {websiteUrl && (
                            <a
                              href={websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={rawWebsite || "Website"}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <Globe className="w-4 h-4" />
                            </a>
                          )}
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={addressParts.join(", ")}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                              <MapPin className="w-4 h-4" />
                            </a>
                          )}

                          {/* Edit / Delete pushed to the right */}
                          <div className="flex items-center gap-1 ml-auto">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-9 h-9"
                              onClick={() => openEditDialog(contact)}
                              title="Edit contact"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-9 h-9 text-destructive hover:text-destructive"
                              onClick={() => deleteMutation.mutate({ id: contact.id })}
                              title="Delete contact"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => { if (!open) setEditingContact(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  autoComplete="name"
                />
              </div>
              <div>
                <Label htmlFor="edit-contactType">Type</Label>
                <Select
                  value={editFormData.contactType}
                  onValueChange={(value) => setEditFormData({ ...editFormData, contactType: value })}
                >
                  <SelectTrigger id="edit-contactType">
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
              <Label htmlFor="edit-company">Company/Practice</Label>
              <Input
                id="edit-company"
                value={editFormData.company}
                onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  autoComplete="tel"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-mobile">Mobile</Label>
                <Input
                  id="edit-mobile"
                  value={editFormData.mobile}
                  onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  autoComplete="tel"
                />
              </div>
              <div>
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={editFormData.website}
                  onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                  autoComplete="url"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  autoComplete="address-level2"
                />
              </div>
              <div>
                <Label htmlFor="edit-postcode">Postcode</Label>
                <Input
                  id="edit-postcode"
                  value={editFormData.postcode}
                  onChange={(e) => setEditFormData({ ...editFormData, postcode: e.target.value })}
                  autoComplete="postal-code"
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                  autoComplete="country-name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContact(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
