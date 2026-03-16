import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  Settings,
  Plus,
  Mail,
  Loader2,
  Building2,
  MapPin,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function StablePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedStableId, setSelectedStableId] = useState<number | null>(null);

  const [createData, setCreateData] = useState({
    name: "",
    description: "",
    location: "",
  });

  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member" as "admin" | "trainer" | "member" | "viewer",
  });

  // Fetch stables
  const { data: stables = [], refetch: refetchStables } =
    trpc.stables.list.useQuery();

  const currentStable = selectedStableId
    ? stables.find((s: any) => s.id === selectedStableId)
    : stables[0];

  // Fetch members for current stable
  const { data: members = [], refetch: refetchMembers } =
    trpc.stables.getMembers.useQuery(
      { stableId: currentStable?.id! },
      { enabled: !!currentStable?.id },
    );

  const createStable = trpc.stables.create.useMutation({
    onSuccess: (data) => {
      toast.success("Stable created successfully!");
      setIsCreateOpen(false);
      setCreateData({ name: "", description: "", location: "" });
      setSelectedStableId(data.id);
      refetchStables();
    },
    onError: (error) => toast.error(error.message),
  });

  const inviteMember = trpc.stables.inviteMember.useMutation({
    onSuccess: () => {
      toast.success("Invitation sent!");
      setIsInviteOpen(false);
      setInviteData({ email: "", role: "member" });
      refetchMembers();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreateStable = () => {
    if (!createData.name.trim()) {
      toast.error("Stable name is required");
      return;
    }
    createStable.mutate({
      name: createData.name,
      description: createData.description || undefined,
      location: createData.location || undefined,
    });
  };

  const handleInvite = () => {
    if (!inviteData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!currentStable?.id) {
      toast.error("No stable selected");
      return;
    }
    inviteMember.mutate({
      stableId: currentStable.id,
      email: inviteData.email,
      role: inviteData.role,
    });
  };

  const ROLE_COLORS: Record<string, string> = {
    owner:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    trainer:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    member: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    viewer:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("stable.title")}</h1>
            <p className="text-muted-foreground">
              {currentStable
                ? `Managing: ${currentStable.name}`
                : "Manage your stable and team members"}
            </p>
          </div>
          <div className="flex gap-2">
            {!currentStable ? (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {t("stable.createStable")}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsInviteOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                {t("stable.inviteMembers")}
              </Button>
            )}
          </div>
        </div>

        {/* Stable selector if multiple stables */}
        {stables.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {stables.map((s: any) => (
              <Button
                key={s.id}
                variant={currentStable?.id === s.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStableId(s.id)}
              >
                <Building2 className="mr-1 h-3 w-3" />
                {s.name}
              </Button>
            ))}
          </div>
        )}

        {!currentStable ? (
          /* No stable — prompt to create */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No stable yet</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                Create your stable to collaborate with trainers, vets, and team
                members. Share horse records, schedule training, and communicate
                in one place.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create My Stable
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">
                Members {members.length > 0 && `(${members.length})`}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Members
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{members.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {members.length === 0
                        ? "Invite members to collaborate"
                        : "Active team members"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Stable Name
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold truncate">
                      {currentStable.name}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentStable.description || "No description"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Location
                    </CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">
                      {currentStable.location || "Not set"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Update in Settings
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick invite */}
              <Card>
                <CardHeader>
                  <CardTitle>Team</CardTitle>
                  <CardDescription>
                    Invite trainers, vets, and team members to collaborate
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setIsInviteOpen(true)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Invite a Member
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Members */}
            <TabsContent value="members" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("stable.members")}</CardTitle>
                    <CardDescription>
                      Manage stable members and their roles
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setIsInviteOpen(true)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Invite
                  </Button>
                </CardHeader>
                <CardContent>
                  {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No members yet</p>
                      <Button
                        className="mt-4"
                        onClick={() => setIsInviteOpen(true)}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Invite First Member
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member: any) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Member #{member.userId}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Joined{" "}
                                {new Date(
                                  member.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={ROLE_COLORS[member.role] || ""}
                            variant="outline"
                          >
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("stable.settings")}</CardTitle>
                  <CardDescription>
                    Configure your stable settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Stable Name</Label>
                    <Input
                      defaultValue={currentStable.name}
                      disabled
                      className="opacity-70"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to rename your stable.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input
                      defaultValue={currentStable.location || ""}
                      disabled
                      className="opacity-70"
                    />
                  </div>
                  <div className="p-3 rounded-lg border border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
                    <p className="text-xs text-yellow-700 dark:text-yellow-400">
                      Stable ID: {currentStable.id} · Created{" "}
                      {new Date(currentStable.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Create Stable Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Your Stable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Stable Name *</Label>
              <Input
                value={createData.name}
                onChange={(e) =>
                  setCreateData({ ...createData, name: e.target.value })
                }
                placeholder="e.g. Sunrise Equestrian Centre"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={createData.description}
                onChange={(e) =>
                  setCreateData({ ...createData, description: e.target.value })
                }
                placeholder="Brief description of your stable"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={createData.location}
                onChange={(e) =>
                  setCreateData({ ...createData, location: e.target.value })
                }
                placeholder="e.g. Newmarket, Suffolk"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateStable}
              disabled={createStable.isPending}
            >
              {createStable.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Stable"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input
                type="email"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
                placeholder="member@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={inviteData.role}
                onValueChange={(v) =>
                  setInviteData({
                    ...inviteData,
                    role: v as typeof inviteData.role,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={inviteMember.isPending}>
              {inviteMember.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
