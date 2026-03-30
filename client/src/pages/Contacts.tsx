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
  Search,
  Eye,
  Globe,
  StickyNote,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useRealtimeModule } from "@/hooks/useRealtime";

function ContactsContent() {
  const utils = trpc.useUtils();
  const { data: contacts, isLoading } = trpc.contacts.list.useQuery();
  const [localContacts, setLocalContacts] = useState(contacts || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<(typeof localContacts)[0] | null>(null);
  const [viewingContact, setViewingContact] = useState<(typeof localContacts)[0] | null>(null);
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
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setViewingContact(contact)}
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
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {getContactTypeBadge(contact.contactType)}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setViewingContact(contact)}
                              title="View contact"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(contact)}
                              title="Edit contact"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                deleteMutation.mutate({ id: contact.id })
                              }
                              title="Delete contact"
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
                                onClick={(e) => e.stopPropagation()}
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
                                onClick={(e) => e.stopPropagation()}
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

      {/* View Contact Dialog */}
      <Dialog open={!!viewingContact} onOpenChange={(open) => { if (!open) setViewingContact(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingContact?.name}
              {viewingContact?.isPrimary && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              )}
            </DialogTitle>
            <DialogDescription>
              {viewingContact && getContactTypeBadge(viewingContact.contactType)}
            </DialogDescription>
          </DialogHeader>
          {viewingContact && (
            <div className="space-y-3 py-2">
              {viewingContact.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm">{viewingContact.company}</span>
                </div>
              )}
              {viewingContact.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <a href={`mailto:${viewingContact.email}`} className="text-sm hover:underline text-primary">
                    {viewingContact.email}
                  </a>
                </div>
              )}
              {viewingContact.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <a href={`tel:${viewingContact.phone}`} className="text-sm hover:underline">
                    {viewingContact.phone}
                  </a>
                </div>
              )}
              {viewingContact.mobile && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <a href={`tel:${viewingContact.mobile}`} className="text-sm hover:underline">
                    {viewingContact.mobile} <span className="text-muted-foreground">(mobile)</span>
                  </a>
                </div>
              )}
              {(viewingContact.address || viewingContact.city || viewingContact.postcode) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-sm">
                    {[viewingContact.address, viewingContact.city, viewingContact.postcode, viewingContact.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
              {viewingContact.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <a
                    href={viewingContact.website.startsWith("http") ? viewingContact.website : `https://${viewingContact.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline text-primary"
                  >
                    {viewingContact.website}
                  </a>
                </div>
              )}
              {viewingContact.notes && (
                <div className="flex items-start gap-3">
                  <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingContact.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (viewingContact) {
                  openEditDialog(viewingContact);
                  setViewingContact(null);
                }
              }}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button onClick={() => setViewingContact(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => { if (!open) setEditingContact(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
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
                />
              </div>
              <div>
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={editFormData.website}
                  onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
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
                />
              </div>
              <div>
                <Label htmlFor="edit-postcode">Postcode</Label>
                <Input
                  id="edit-postcode"
                  value={editFormData.postcode}
                  onChange={(e) => setEditFormData({ ...editFormData, postcode: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
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
