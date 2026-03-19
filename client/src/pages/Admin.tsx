import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import {
  Users,
  Heart,
  Activity,
  FileText,
  AlertCircle,
  Settings,
  Ban,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldOff,
  RefreshCw,
  Search,
  Eye,
  Copy,
  Key,
  Plus,
  RotateCw,
  Server,
  MessageSquare,
  Smartphone,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function AdminContent() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<number | null>(
    null,
  );
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [newApiKeyData, setNewApiKeyData] = useState<{
    id: number;
    key: string;
  } | null>(null);
  const [whatsappForm, setWhatsappForm] = useState({
    enabled: false,
    phoneNumberId: "",
    accessToken: "",
  });

  // API key configuration form state
  const [aiConfigForm, setAiConfigForm] = useState({
    openai_api_key: "",
  });
  const [smtpForm, setSmtpForm] = useState({
    smtp_host: "",
    smtp_port: "",
    smtp_user: "",
    smtp_pass: "",
    smtp_from: "",
  });
  const [stripeForm, setStripeForm] = useState({
    stripe_secret_key: "",
    stripe_webhook_secret: "",
  });

  // Check admin session status
  const statusQuery = trpc.adminUnlock.getStatus.useQuery();
  const isUnlocked = !!statusQuery.data?.isUnlocked;

  // All admin queries — only fire once admin session is confirmed
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery(
    undefined,
    { enabled: isUnlocked },
  );
  const {
    data: users,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = trpc.admin.getUsers.useQuery(undefined, { enabled: isUnlocked });
  const { data: overdueUsers } = trpc.admin.getOverdueUsers.useQuery(
    undefined,
    { enabled: isUnlocked },
  );
  const { data: activityLogs } = trpc.admin.getActivityLogs.useQuery(
    { limit: 50 },
    { enabled: isUnlocked },
  );
  const { data: settings } = trpc.admin.getSettings.useQuery(undefined, {
    enabled: isUnlocked,
  });
  const siteSettingsQuery = trpc.admin.getSiteSettings.useQuery(undefined, {
    enabled: isUnlocked,
  });

  // API Key queries
  const apiKeysQuery = trpc.admin.apiKeys.list.useQuery(undefined, {
    enabled: isUnlocked,
  });
  const envHealthQuery = trpc.admin.getEnvHealth.useQuery(undefined, {
    enabled: isUnlocked,
    refetchInterval: isUnlocked ? 30000 : false,
  });
  const leadsQuery = trpc.admin.getLeads.useQuery(undefined, {
    enabled: isUnlocked,
  });
  const whatsappConfigQuery = trpc.admin.getWhatsAppConfig.useQuery(undefined, {
    enabled: isUnlocked,
  });

  // All mutations (lazy — no enabled needed)
  const setSiteSettingMutation = trpc.admin.setSiteSetting.useMutation({
    onSuccess: (_data, variables) => {
      toast.success(`${variables.key} saved`);
      siteSettingsQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateWhatsAppMutation = trpc.admin.updateWhatsAppConfig.useMutation({
    onSuccess: () => {
      toast.success("WhatsApp configuration saved");
      whatsappConfigQuery.refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const suspendMutation = trpc.admin.suspendUser.useMutation({
    onSuccess: () => {
      toast.success("User suspended successfully");
      refetchUsers();
    },
    onError: (error) => toast.error(error.message),
  });

  const unsuspendMutation = trpc.admin.unsuspendUser.useMutation({
    onSuccess: () => {
      toast.success("User unsuspended successfully");
      refetchUsers();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      refetchUsers();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetchUsers();
    },
    onError: (error) => toast.error(error.message),
  });

  const resetPasswordMutation = trpc.admin.resetUserPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully");
      setResetPasswordUserId(null);
      setResetPasswordValue("");
    },
    onError: (error) => toast.error(error.message),
  });

  // API Key mutations
  const createApiKeyMutation = trpc.admin.apiKeys.create.useMutation({
    onSuccess: (data) => {
      setNewApiKeyData(data);
      apiKeysQuery.refetch();
      toast.success("API key created successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeApiKeyMutation = trpc.admin.apiKeys.revoke.useMutation({
    onSuccess: () => {
      apiKeysQuery.refetch();
      toast.success("API key revoked");
    },
    onError: (error) => toast.error(error.message),
  });

  const rotateApiKeyMutation = trpc.admin.apiKeys.rotate.useMutation({
    onSuccess: (data, variables) => {
      setNewApiKeyData({ id: variables.id, key: data.key });
      apiKeysQuery.refetch();
      toast.success("API key rotated. Save the new key now!");
    },
    onError: (error) => toast.error(error.message),
  });

  // Sync WhatsApp form when data loads
  useEffect(() => {
    if (whatsappConfigQuery.data) {
      setWhatsappForm((prev) => ({
        ...prev,
        enabled: whatsappConfigQuery.data!.enabled,
      }));
    }
  }, [whatsappConfigQuery.data]);

  // Populate API key forms from stored siteSettings
  useEffect(() => {
    if (siteSettingsQuery.data) {
      const s = siteSettingsQuery.data as Record<string, string>;
      setAiConfigForm({
        openai_api_key: s.openai_api_key ? "••••••••" : "",
      });
      setSmtpForm({
        smtp_host: s.smtp_host ?? "",
        smtp_port: s.smtp_port ?? "",
        smtp_user: s.smtp_user ?? "",
        smtp_pass: s.smtp_pass ? "••••••••" : "",
        smtp_from: s.smtp_from ?? "",
      });
      setStripeForm({
        stripe_secret_key: s.stripe_secret_key ? "••••••••" : "",
        stripe_webhook_secret: s.stripe_webhook_secret ? "••••••••" : "",
      });
    }
  }, [siteSettingsQuery.data]);

  // Redirect if admin not unlocked (after data resolves)
  useEffect(() => {
    if (statusQuery.data && !statusQuery.data.isUnlocked) {
      toast.error("Admin session expired. Please unlock admin mode.");
      navigate("/ai-chat");
    }
  }, [statusQuery.data, navigate]);

  // Show loading state while checking admin session
  if (statusQuery.isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show access required if session is not unlocked
  if (!isUnlocked) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            Your admin session has expired or you don't have admin access.
            Go to AI Chat and type <strong>show admin</strong> to unlock.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/ai-chat")} className="mt-4">
          Go to AI Chat
        </Button>
      </div>
    );
  }

  const filteredUsers = users?.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case "trial":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Trial
          </Badge>
        );
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Active
          </Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "expired":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Expired
          </Badge>
        );
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor users, subscriptions, and system health
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.users?.totalUsers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.users?.activeUsers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Subscribers
            </CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.users?.paidUsers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.users?.trialUsers || 0} on trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Horses
            </CardTitle>
            <Heart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.horses?.totalHorses || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.horses?.activeHorses || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue Payments
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-destructive">
                {stats?.users?.overdueUsers || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.users?.suspendedUsers || 0} suspended
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="overdue" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Overdue
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            System Secrets
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="w-4 h-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage all registered users
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Subscription</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {user.name || "No name"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.role === "admin" ? "default" : "outline"
                              }
                            >
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getSubscriptionBadge(user.subscriptionStatus)}
                          </TableCell>
                          <TableCell>
                            {user.isSuspended ? (
                              <Badge variant="destructive">Suspended</Badge>
                            ) : user.isActive ? (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {user.isSuspended ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    unsuspendMutation.mutate({
                                      userId: user.id,
                                    })
                                  }
                                >
                                  Unsuspend
                                </Button>
                              ) : (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Ban className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Suspend User</DialogTitle>
                                      <DialogDescription>
                                        This will prevent{" "}
                                        {user.name || user.email} from accessing
                                        their account.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Reason for suspension</Label>
                                        <Textarea
                                          value={suspendReason}
                                          onChange={(e) =>
                                            setSuspendReason(e.target.value)
                                          }
                                          placeholder="Enter reason..."
                                        />
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button
                                        variant="destructive"
                                        onClick={() => {
                                          suspendMutation.mutate({
                                            userId: user.id,
                                            reason: suspendReason,
                                          });
                                          setSuspendReason("");
                                        }}
                                      >
                                        Suspend User
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}

                              <Dialog
                                open={resetPasswordUserId === user.id}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setResetPasswordUserId(null);
                                    setResetPasswordValue("");
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setResetPasswordUserId(user.id)
                                    }
                                  >
                                    <Key className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reset Password</DialogTitle>
                                    <DialogDescription>
                                      Set a new password for{" "}
                                      {user.name || user.email}.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="reset-password-input">
                                        New Password (min 12 chars)
                                      </Label>
                                      <Input
                                        id="reset-password-input"
                                        type="password"
                                        value={resetPasswordValue}
                                        onChange={(e) =>
                                          setResetPasswordValue(e.target.value)
                                        }
                                        placeholder="Enter new password..."
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      disabled={
                                        resetPasswordValue.length < 8 ||
                                        resetPasswordMutation.isPending
                                      }
                                      onClick={() => {
                                        resetPasswordMutation.mutate({
                                          userId: user.id,
                                          newPassword: resetPasswordValue,
                                        });
                                      }}
                                    >
                                      Reset Password
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              {/* Grant / Revoke Admin role */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title={
                                      user.role === "admin"
                                        ? "Revoke admin role"
                                        : "Grant admin role"
                                    }
                                    className={
                                      user.role === "admin"
                                        ? "text-amber-600 hover:text-amber-700"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {user.role === "admin" ? (
                                      <ShieldOff className="w-4 h-4" />
                                    ) : (
                                      <ShieldCheck className="w-4 h-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      {user.role === "admin"
                                        ? "Revoke Admin Role"
                                        : "Grant Admin Role"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {user.role === "admin"
                                        ? `Remove admin privileges from ${user.name || user.email}? They will lose access to the Admin Panel.`
                                        : `Grant admin privileges to ${user.name || user.email}? They will be able to unlock the Admin Panel and manage all users.`}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className={
                                        user.role === "admin"
                                          ? "bg-amber-600 text-white hover:bg-amber-700"
                                          : ""
                                      }
                                      onClick={() =>
                                        updateRoleMutation.mutate({
                                          userId: user.id,
                                          role:
                                            user.role === "admin"
                                              ? "user"
                                              : "admin",
                                        })
                                      }
                                    >
                                      {user.role === "admin"
                                        ? "Revoke Admin"
                                        : "Grant Admin"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete User
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently deactivate{" "}
                                      {user.name || user.email}'s account. This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() =>
                                        deleteMutation.mutate({
                                          userId: user.id,
                                        })
                                      }
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue Tab */}
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Subscriptions</CardTitle>
              <CardDescription>
                Users with payment issues requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!overdueUsers || overdueUsers.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No overdue subscriptions
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Last Payment</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {user.name || "No name"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.lastPaymentAt
                            ? new Date(user.lastPaymentAt).toLocaleDateString()
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">Overdue</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Send Reminder
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Recent system activity and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!activityLogs || activityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No activity logs yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.entityType &&
                            `${log.entityType} #${log.entityId} • `}
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* AI / LLM Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  AI Configuration (OpenAI)
                </CardTitle>
                <CardDescription>
                  Configure the OpenAI API key used for the chat assistant and
                  AI features. Keys saved here override environment variables
                  and take effect immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="Enter new key to update"
                      value={aiConfigForm.openai_api_key}
                      onChange={(e) =>
                        setAiConfigForm((p) => ({
                          ...p,
                          openai_api_key: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        setSiteSettingMutation.mutate({
                          key: "openai_api_key",
                          value: aiConfigForm.openai_api_key,
                        })
                      }
                      disabled={
                        setSiteSettingMutation.isPending ||
                        !aiConfigForm.openai_api_key ||
                        aiConfigForm.openai_api_key === "••••••••"
                      }
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave blank / unchanged to keep the existing key.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SMTP / Email Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Email (SMTP) Configuration
                </CardTitle>
                <CardDescription>
                  Configure the email service for password resets and
                  notifications. Changes take effect on the next email send.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.gmail.com"
                      value={smtpForm.smtp_host}
                      onChange={(e) =>
                        setSmtpForm((p) => ({
                          ...p,
                          smtp_host: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input
                      id="smtp-port"
                      placeholder="587"
                      value={smtpForm.smtp_port}
                      onChange={(e) =>
                        setSmtpForm((p) => ({
                          ...p,
                          smtp_port: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-user">SMTP Username</Label>
                  <Input
                    id="smtp-user"
                    placeholder="you@gmail.com"
                    value={smtpForm.smtp_user}
                    onChange={(e) =>
                      setSmtpForm((p) => ({
                        ...p,
                        smtp_user: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-pass">SMTP Password / App Password</Label>
                  <Input
                    id="smtp-pass"
                    type="password"
                    placeholder="Enter new password to update"
                    value={smtpForm.smtp_pass}
                    onChange={(e) =>
                      setSmtpForm((p) => ({
                        ...p,
                        smtp_pass: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-from">From Address</Label>
                  <Input
                    id="smtp-from"
                    placeholder='"EquiProfile" <noreply@equiprofile.online>'
                    value={smtpForm.smtp_from}
                    onChange={(e) =>
                      setSmtpForm((p) => ({
                        ...p,
                        smtp_from: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  onClick={async () => {
                    const fields: Array<{ key: string; value: string }> = [
                      { key: "smtp_host", value: smtpForm.smtp_host },
                      { key: "smtp_port", value: smtpForm.smtp_port },
                      { key: "smtp_user", value: smtpForm.smtp_user },
                      { key: "smtp_from", value: smtpForm.smtp_from },
                    ];
                    if (
                      smtpForm.smtp_pass &&
                      smtpForm.smtp_pass !== "••••••••"
                    ) {
                      fields.push({
                        key: "smtp_pass",
                        value: smtpForm.smtp_pass,
                      });
                    }
                    try {
                      await Promise.all(
                        fields
                          .filter((f) => f.value)
                          .map((f) => setSiteSettingMutation.mutateAsync(f)),
                      );
                      toast.success("SMTP settings saved");
                    } catch {
                      toast.error("Failed to save one or more SMTP settings");
                    }
                  }}
                  disabled={setSiteSettingMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save SMTP Settings
                </Button>
              </CardContent>
            </Card>

            {/* Stripe Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Stripe Configuration
                </CardTitle>
                <CardDescription>
                  Store Stripe keys for reference. A server restart is required
                  for Stripe changes to take effect.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe Secret Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="stripe-key"
                      type="password"
                      placeholder="sk_live_..."
                      value={stripeForm.stripe_secret_key}
                      onChange={(e) =>
                        setStripeForm((p) => ({
                          ...p,
                          stripe_secret_key: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        setSiteSettingMutation.mutate({
                          key: "stripe_secret_key",
                          value: stripeForm.stripe_secret_key,
                        })
                      }
                      disabled={
                        setSiteSettingMutation.isPending ||
                        !stripeForm.stripe_secret_key ||
                        stripeForm.stripe_secret_key === "••••••••"
                      }
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-webhook">Stripe Webhook Secret</Label>
                  <div className="flex gap-2">
                    <Input
                      id="stripe-webhook"
                      type="password"
                      placeholder="whsec_..."
                      value={stripeForm.stripe_webhook_secret}
                      onChange={(e) =>
                        setStripeForm((p) => ({
                          ...p,
                          stripe_webhook_secret: e.target.value,
                        }))
                      }
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        setSiteSettingMutation.mutate({
                          key: "stripe_webhook_secret",
                          value: stripeForm.stripe_webhook_secret,
                        })
                      }
                      disabled={
                        setSiteSettingMutation.isPending ||
                        !stripeForm.stripe_webhook_secret ||
                        stripeForm.stripe_webhook_secret === "••••••••"
                      }
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {settings && settings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {settings.map((setting) => (
                      <div
                        key={setting.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{setting.settingKey}</p>
                          {setting.description && (
                            <p className="text-sm text-muted-foreground">
                              {setting.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{setting.settingType}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* System Secrets Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Integration Keys</CardTitle>
                  <CardDescription>
                    Configure global API keys for platform integrations (OpenAI,
                    SMTP, weather providers). These are system-wide settings,
                    not user-specific.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    const name = prompt(
                      'Enter integration name (e.g., "OpenAI API", "Weather API"):',
                    );
                    if (name) {
                      createApiKeyMutation.mutate({ name, rateLimit: 100 });
                    }
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {newApiKeyData && (
                <Alert className="mb-4 border-yellow-500 bg-yellow-50">
                  <Key className="h-4 w-4" />
                  <AlertTitle>Save This Key Now!</AlertTitle>
                  <AlertDescription className="mt-2 space-y-2">
                    <p className="text-sm">
                      This is the only time you'll see this key:
                    </p>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border font-mono text-sm">
                      <code className="flex-1">{newApiKeyData.key}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(newApiKeyData.key);
                          toast.success("Copied to clipboard");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setNewApiKeyData(null)}
                    >
                      I've saved it
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {apiKeysQuery.data && apiKeysQuery.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key Prefix</TableHead>
                      <TableHead>Rate Limit</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeysQuery.data.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">
                          {key.name}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{key.keyPrefix}_...</code>
                        </TableCell>
                        <TableCell>{key.rateLimit}/hr</TableCell>
                        <TableCell>
                          {key.lastUsedAt
                            ? formatDistanceToNow(new Date(key.lastUsedAt), {
                                addSuffix: true,
                              })
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={key.isActive ? "default" : "secondary"}
                          >
                            {key.isActive ? "Active" : "Revoked"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Rotate this API key? The old key will stop working immediately.",
                                  )
                                ) {
                                  rotateApiKeyMutation.mutate({ id: key.id });
                                }
                              }}
                              disabled={!key.isActive}
                            >
                              <RotateCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (
                                  confirm(
                                    "Revoke this API key? This cannot be undone.",
                                  )
                                ) {
                                  revokeApiKeyMutation.mutate({ id: key.id });
                                }
                              }}
                              disabled={!key.isActive}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No API keys created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Health</CardTitle>
              <CardDescription>System configuration status</CardDescription>
            </CardHeader>
            <CardContent>
              {envHealthQuery.data && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        envHealthQuery.data.healthy ? "default" : "destructive"
                      }
                    >
                      {envHealthQuery.data.healthy
                        ? "✓ All Critical OK"
                        : "✗ Issues Detected"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Environment: {envHealthQuery.data.environment}
                    </span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variable</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {envHealthQuery.data.checks.map((check) => (
                        <TableRow key={check.name}>
                          <TableCell className="font-mono text-sm">
                            {check.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={check.status ? "default" : "destructive"}
                            >
                              {check.status ? "✓ Set" : "✗ Missing"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                check.critical ? "destructive" : "secondary"
                              }
                            >
                              {check.critical ? "Critical" : "Optional"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Leads Tab */}
        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Chat Leads</CardTitle>
              <CardDescription>
                Visitors who submitted their details via the sales chat widget
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leadsQuery.isLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : leadsQuery.data && leadsQuery.data.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadsQuery.data.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">
                          {lead.name}
                        </TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {lead.source ?? "chat"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(lead.createdAt), {
                            addSuffix: true,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No leads captured yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Config Tab */}
        <TabsContent value="whatsapp">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  WhatsApp Business Configuration
                </CardTitle>
                <CardDescription>
                  Configure WhatsApp Business API for event reminders and
                  notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  {whatsappConfigQuery.data?.enabled ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">
                      Status:{" "}
                      {whatsappConfigQuery.data?.enabled
                        ? "Enabled"
                        : "Disabled"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Phone ID:{" "}
                      {whatsappConfigQuery.data?.phoneNumberId ||
                        "Not configured"}{" "}
                      · Token:{" "}
                      {whatsappConfigQuery.data?.hasAccessToken
                        ? "Configured"
                        : "Not set"}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <div className="space-y-2">
                  <Label>Enable WhatsApp</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="wa-enabled"
                      checked={whatsappForm.enabled}
                      onChange={(e) =>
                        setWhatsappForm({
                          ...whatsappForm,
                          enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <label
                      htmlFor="wa-enabled"
                      className="text-sm text-muted-foreground"
                    >
                      Enable WhatsApp Business notifications
                    </label>
                  </div>
                </div>

                {/* Phone Number ID */}
                <div className="space-y-2">
                  <Label>Phone Number ID</Label>
                  <Input
                    placeholder="Meta Phone Number ID"
                    value={whatsappForm.phoneNumberId}
                    onChange={(e) =>
                      setWhatsappForm({
                        ...whatsappForm,
                        phoneNumberId: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Found in Meta Business Manager → WhatsApp → Phone Numbers
                  </p>
                </div>

                {/* Access Token */}
                <div className="space-y-2">
                  <Label>Access Token</Label>
                  <Input
                    type="password"
                    placeholder={
                      whatsappConfigQuery.data?.hasAccessToken
                        ? "••••••••• (already configured)"
                        : "Meta permanent access token"
                    }
                    value={whatsappForm.accessToken}
                    onChange={(e) =>
                      setWhatsappForm({
                        ...whatsappForm,
                        accessToken: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Permanent token from Meta Business Manager. Leave blank to
                    keep existing.
                  </p>
                </div>

                <Button
                  onClick={() =>
                    updateWhatsAppMutation.mutate({
                      enabled: whatsappForm.enabled,
                      phoneNumberId: whatsappForm.phoneNumberId || undefined,
                      accessToken: whatsappForm.accessToken || undefined,
                    })
                  }
                  disabled={updateWhatsAppMutation.isPending}
                >
                  {updateWhatsAppMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Required Message Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">
                  Pre-approve these templates in your Meta Business account:
                </p>
                <ul className="space-y-1.5">
                  {[
                    "event_reminder — 24h and 1h before events",
                    "reminder_notification — health and care reminders",
                    "vaccination_due — upcoming vaccination alerts",
                    "trial_ending — trial expiry notifications",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm">
                      <span className="text-primary">•</span>
                      <code className="text-xs">{t}</code>
                    </li>
                  ))}
                </ul>
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    See{" "}
                    <code className="text-primary">docs/WHATSAPP_SETUP.md</code>{" "}
                    for full setup instructions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Admin() {
  return (
    <DashboardLayout>
      <AdminContent />
    </DashboardLayout>
  );
}
