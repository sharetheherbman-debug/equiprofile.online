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
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Phone,
  Mail,
  Trash2,
  UserCog,
  Shield,
  ChevronRight,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

// Staff roles use the existing contact type enum values that represent yard staff
const STAFF_ROLES = [
  { value: "trainer", label: "Trainer", color: "bg-blue-500/20 text-blue-300" },
  {
    value: "instructor",
    label: "Instructor",
    color: "bg-purple-500/20 text-purple-300",
  },
  { value: "stable", label: "Stable Manager", color: "bg-amber-500/20 text-amber-300" },
  { value: "farrier", label: "Farrier", color: "bg-orange-500/20 text-orange-300" },
  { value: "vet", label: "Vet / Veterinary", color: "bg-green-500/20 text-green-300" },
  { value: "other", label: "Groom / Yard Hand", color: "bg-slate-500/20 text-slate-300" },
];

const STAFF_TYPE_VALUES = STAFF_ROLES.map((r) => r.value);

type Contact = {
  id: number;
  name: string;
  contactType: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  notes?: string | null;
};

function getRoleMeta(type: string) {
  return (
    STAFF_ROLES.find((r) => r.value === type) ?? {
      label: type,
      color: "bg-slate-500/20 text-slate-300",
    }
  );
}

function StableStaffContent() {
  const { data: allContacts = [], isLoading } = trpc.contacts.list.useQuery();
  const createContact = trpc.contacts.create.useMutation();
  const deleteContact = trpc.contacts.delete.useMutation();
  const utils = trpc.useUtils();

  const staffContacts = (allContacts as Contact[]).filter((c) =>
    STAFF_TYPE_VALUES.includes(c.contactType),
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactType: "trainer",
    email: "",
    phone: "",
    mobile: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contactType: "trainer",
      email: "",
      phone: "",
      mobile: "",
      notes: "",
    });
  };

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await createContact.mutateAsync({
        name: formData.name.trim(),
        contactType: formData.contactType as
          | "vet"
          | "farrier"
          | "trainer"
          | "instructor"
          | "stable"
          | "breeder"
          | "supplier"
          | "emergency"
          | "other",
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        mobile: formData.mobile || undefined,
        notes: formData.notes || undefined,
      });
      await utils.contacts.list.invalidate();
      toast.success("Staff member added");
      setIsAddOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to add staff member");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteContact.mutateAsync({ id });
      await utils.contacts.list.invalidate();
      toast.success("Staff member removed");
    } catch {
      toast.error("Failed to remove staff member");
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <UserCog className="w-6 h-6 text-blue-400" />
            Staff Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your stable&apos;s team members, roles, and contact details.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 gap-2"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAFF_ROLES.map((role) => {
          const count = staffContacts.filter(
            (c) => c.contactType === role.value,
          ).length;
          return (
            <Card
              key={role.value}
              className="border-white/5 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {role.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Staff list */}
      <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Team Members
          </CardTitle>
          <CardDescription className="text-xs">
            {staffContacts.length} staff member
            {staffContacts.length !== 1 ? "s" : ""} in your stable
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : staffContacts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCog className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">No staff members yet</p>
              <p className="text-xs">
                Add your first team member to get started.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3"
                onClick={() => setIsAddOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Staff Member
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {staffContacts.map((staff) => {
                const role = getRoleMeta(staff.contactType);
                return (
                  <div
                    key={staff.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-muted/40 bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0">
                      <span className="text-sm text-white font-bold">
                        {staff.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium">{staff.name}</p>
                        <Badge
                          className={`text-[10px] px-1.5 py-0 ${role.color} border-0`}
                        >
                          {role.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {staff.email && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {staff.email}
                          </span>
                        )}
                        {staff.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {staff.phone}
                          </span>
                        )}
                        {staff.mobile && !staff.phone && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {staff.mobile}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(staff.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link to full contacts for non-staff contacts */}
      <div className="flex items-center justify-between rounded-xl border border-white/5 bg-card/60 p-4">
        <div>
          <p className="text-sm font-medium">Owners &amp; Clients</p>
          <p className="text-xs text-muted-foreground">
            Manage horse owners, livery clients, breeders, and other external contacts
          </p>
        </div>
        <Link href="/contacts">
          <Button variant="outline" size="sm" className="gap-1">
            Open Contacts <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* Add Staff Dialog */}
      <Dialog
        open={isAddOpen}
        onOpenChange={(v) => {
          setIsAddOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Add Staff Member
            </DialogTitle>
            <DialogDescription>
              Add a team member to your stable. Staff members are separate from
              general contacts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                placeholder="e.g. Sarah Johnson"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={formData.contactType}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, contactType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  placeholder="+44 7700 000000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any notes about this staff member..."
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={createContact.isPending}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0"
            >
              {createContact.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function StableStaff() {
  return (
    <DashboardLayout>
      <StableStaffContent />
    </DashboardLayout>
  );
}
