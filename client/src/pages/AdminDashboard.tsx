import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  HardDrive, 
  Activity, 
  Bell, 
  Shield,
  Database,
  Server,
  Zap
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

function AdminDashboardContent() {
  const { data: users, isLoading: usersLoading } = trpc.adminUnlock.listUsers.useQuery();
  const { data: systemHealth, isLoading: healthLoading } = trpc.system.health.useQuery();
  const { data: storageStats, isLoading: storageLoading } = trpc.storage.getAdminStats.useQuery();
  const { data: userStorageDetails } = trpc.storage.getUserStorageDetails.useQuery();

  if (usersLoading || healthLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.plan && u.plan !== 'trial').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          System overview and management
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {activeUsers} active subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {storageStats ? `${(storageStats.totalUsed / (1024 ** 3)).toFixed(1)} GB` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.status === 'ok' ? (
                <Badge className="bg-green-100 text-green-700">Healthy</Badge>
              ) : (
                <Badge variant="destructive">Issues</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Last checked: now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.uptime ? `${Math.floor(systemHealth.uptime / 3600)}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Server uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Overview of all registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {users?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{user.name || 'No name'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role || 'user'}
                        </Badge>
                        <Badge variant="outline">
                          {user.plan || 'trial'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Storage Overview</CardTitle>
              <CardDescription>
                Storage usage across all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Total Storage Used</p>
                    <p className="text-sm text-muted-foreground">All users combined</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {storageStats ? `${(storageStats.totalUsed / (1024 ** 3)).toFixed(2)} GB` : 'N/A'}
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Total Documents</p>
                    <p className="text-sm text-muted-foreground">Files uploaded</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {storageStats?.totalFiles || 0}
                  </div>
                </div>
              </div>

              {/* Per-user storage details */}
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Storage by User</h3>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {userStorageDetails?.map((userStorage) => (
                      <div key={userStorage.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{userStorage.userName}</p>
                          <p className="text-xs text-muted-foreground">{userStorage.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {(userStorage.usedBytes / (1024 ** 3)).toFixed(2)} GB
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {userStorage.fileCount} files
                            </p>
                          </div>
                          <Badge variant="outline">
                            {((userStorage.usedBytes / userStorage.quotaBytes) * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Monitor system performance and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-sm text-muted-foreground">Connection status</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Server</p>
                      <p className="text-sm text-muted-foreground">Application server</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Running</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Uptime</p>
                      <p className="text-sm text-muted-foreground">Server runtime</p>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">
                    {systemHealth?.uptime ? `${Math.floor(systemHealth.uptime / 3600)}h ${Math.floor((systemHealth.uptime % 3600) / 60)}m` : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="broadcasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Broadcasts</CardTitle>
              <CardDescription>
                Send announcements to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Broadcast functionality coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <AdminDashboardContent />
    </DashboardLayout>
  );
}
