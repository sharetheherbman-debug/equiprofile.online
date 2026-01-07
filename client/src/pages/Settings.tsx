import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageTransition } from "@/components/PageTransition";
import DashboardLayout from "@/components/DashboardLayout";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, Lock, User, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    healthReminders: true,
    trainingReminders: true,
    feedingReminders: true,
    weatherAlerts: true,
    weeklyDigest: true,
  });

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Profile updated successfully");
    setIsLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Password changed successfully");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsLoading(false);
  };

  const handleNotificationSave = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    toast.success("Notification preferences saved");
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="container max-w-4xl py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-serif mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance">
                <Moon className="w-4 h-4 mr-2" />
                Appearance
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20">
                        <AvatarFallback className="text-2xl">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm">
                          Change Photo
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          JPG, PNG or GIF. Max 2MB.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({ ...profileData, name: e.target.value })
                          }
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        description: "Receive email notifications for important updates",
                      },
                      {
                        key: "healthReminders",
                        label: "Health Reminders",
                        description: "Get notified about upcoming vet visits and vaccinations",
                      },
                      {
                        key: "trainingReminders",
                        label: "Training Reminders",
                        description: "Reminders for scheduled training sessions",
                      },
                      {
                        key: "feedingReminders",
                        label: "Feeding Reminders",
                        description: "Notifications for feeding schedules",
                      },
                      {
                        key: "weatherAlerts",
                        label: "Weather Alerts",
                        description: "Alerts for adverse weather conditions",
                      },
                      {
                        key: "weeklyDigest",
                        label: "Weekly Digest",
                        description: "Receive a weekly summary of activities",
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor={item.key}>{item.label}</Label>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Switch
                          id={item.key}
                          checked={
                            notifications[item.key as keyof typeof notifications]
                          }
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, [item.key]: checked })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleNotificationSave} disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how EquiProfile looks for you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {["light", "dark", "system"].map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => setTheme(themeOption as any)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            theme === themeOption
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="text-center">
                            <div className="capitalize font-medium mb-1">
                              {themeOption}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {themeOption === "system"
                                ? "Match system"
                                : `Use ${themeOption} theme`}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
