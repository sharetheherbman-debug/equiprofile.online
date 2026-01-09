import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw,
  Search,
  Eye,
  Copy,
  Key,
  Plus,
  RotateCw,
  Server
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

function AdminContent() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newApiKeyData, setNewApiKeyData] = useState<{ id: number; key: string } | null>(null);

  // Check admin session status
  const statusQuery = trpc.adminUnlock.getStatus.useQuery();

  // Redirect if admin not unlocked
  useEffect(() => {
    if (statusQuery.data && !statusQuery.data.isUnlocked) {
      toast.error('Admin session expired. Please unlock admin mode.');
      navigate('/ai-chat');
    }
  }, [statusQuery.data, navigate]);

  if (!statusQuery.data?.isUnlocked) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Admin Access Required</AlertTitle>
          <AlertDescription>
            Your admin session has expired or you don't have admin access.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.getUsers.useQuery();
  const { data: overdueUsers } = trpc.admin.getOverdueUsers.useQuery();
  const { data: activityLogs } = trpc.admin.getActivityLogs.useQuery({ limit: 50 });
  const { data: settings } = trpc.admin.getSettings.useQuery();
  
  // API Key queries
  const apiKeysQuery = trpc.admin.apiKeys.list.useQuery();
  const envHealthQuery = trpc.admin.getEnvHealth.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30s
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
  
  // API Key mutations
  const createApiKeyMutation = trpc.admin.apiKeys.create.useMutation({
    onSuccess: (data) => {
      setNewApiKeyData(data);
      apiKeysQuery.refetch();
      toast.success('API key created successfully');
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeApiKeyMutation = trpc.admin.apiKeys.revoke.useMutation({
    onSuccess: () => {
      apiKeysQuery.refetch();
      toast.success('API key revoked');
    },
    onError: (error) => toast.error(error.message),
  });

  const rotateApiKeyMutation = trpc.admin.apiKeys.rotate.useMutation({
    onSuccess: (data, variables) => {
      setNewApiKeyData({ id: variables.id, key: data.key });
      apiKeysQuery.refetch();
      toast.success('API key rotated. Save the new key now!');
    },
    onError: (error) => toast.error(error.message),
  });

  const filteredUsers = users?.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case 'trial':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Trial</Badge>;
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor users, subscriptions, and system health
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.users?.totalUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.users?.activeUsers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Subscribers</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.users?.paidUsers || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.users?.trialUsers || 0} on trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Horses</CardTitle>
            <Heart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats?.horses?.totalHorses || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.horses?.activeHorses || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue Payments</CardTitle>
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
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage all registered users</CardDescription>
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
                              <p className="font-medium">{user.name || 'No name'}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
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
                              <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
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
                                  onClick={() => unsuspendMutation.mutate({ userId: user.id })}
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
                                        This will prevent {user.name || user.email} from accessing their account.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Reason for suspension</Label>
                                        <Textarea
                                          value={suspendReason}
                                          onChange={(e) => setSuspendReason(e.target.value)}
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
                                            reason: suspendReason 
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
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently deactivate {user.name || user.email}'s account. 
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      onClick={() => deleteMutation.mutate({ userId: user.id })}
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
              <CardDescription>Users with payment issues requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {!overdueUsers || overdueUsers.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No overdue subscriptions</p>
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
                            <p className="font-medium">{user.name || 'No name'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.lastPaymentAt 
                            ? new Date(user.lastPaymentAt).toLocaleDateString()
                            : 'Never'
                          }
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
              <CardDescription>Recent system activity and user actions</CardDescription>
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
                    <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.entityType && `${log.entityType} #${log.entityId} • `}
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
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure API keys and system parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h3 className="font-medium mb-2">API Configuration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    API keys are managed securely through environment variables. 
                    Contact your system administrator to update API keys.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-background">
                      <span className="text-sm">OpenAI API</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">Configured</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-background">
                      <span className="text-sm">Stripe API</span>
                      <Badge variant="outline">Not Configured</Badge>
                    </div>
                  </div>
                </div>

                {settings && settings.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Custom Settings</h3>
                    {settings.map((setting) => (
                      <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{setting.settingKey}</p>
                          {setting.description && (
                            <p className="text-sm text-muted-foreground">{setting.description}</p>
                          )}
                        </div>
                        <Badge variant="outline">{setting.settingType}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Secrets Tab */}
        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>System Integration Keys</CardTitle>
                  <CardDescription>Configure global API keys for platform integrations (OpenAI, SMTP, weather providers). These are system-wide settings, not user-specific.</CardDescription>
                </div>
                <Button onClick={() => {
                  const name = prompt('Enter integration name (e.g., "OpenAI API", "Weather API"):');
                  if (name) {
                    createApiKeyMutation.mutate({ name, rateLimit: 100 });
                  }
                }}>
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
                    <p className="text-sm">This is the only time you'll see this key:</p>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border font-mono text-sm">
                      <code className="flex-1">{newApiKeyData.key}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(newApiKeyData.key);
                          toast.success('Copied to clipboard');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setNewApiKeyData(null)}>
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
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <code className="text-xs">{key.keyPrefix}_...</code>
                        </TableCell>
                        <TableCell>{key.rateLimit}/hr</TableCell>
                        <TableCell>
                          {key.lastUsedAt ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true }) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={key.isActive ? 'default' : 'secondary'}>
                            {key.isActive ? 'Active' : 'Revoked'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm('Rotate this API key? The old key will stop working immediately.')) {
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
                                if (confirm('Revoke this API key? This cannot be undone.')) {
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
                    <Badge variant={envHealthQuery.data.healthy ? 'default' : 'destructive'}>
                      {envHealthQuery.data.healthy ? '✓ All Critical OK' : '✗ Issues Detected'}
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
                          <TableCell className="font-mono text-sm">{check.name}</TableCell>
                          <TableCell>
                            <Badge variant={check.status ? 'default' : 'destructive'}>
                              {check.status ? '✓ Set' : '✗ Missing'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={check.critical ? 'destructive' : 'secondary'}>
                              {check.critical ? 'Critical' : 'Optional'}
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
