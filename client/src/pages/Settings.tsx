import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "@/components/PageTransition";
import DashboardLayout from "@/components/DashboardLayout";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Bell,
  Lock,
  User,
  Moon,
  MapPin,
  Loader2,
  Info,
  Shield,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
import { AdminUnlockDialog } from "@/components/AdminUnlockDialog";

export default function Settings() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);

  const adminStatus = trpc.adminUnlock.getStatus.useQuery(undefined, {
    staleTime: 60_000,
  });
  const buildInfo = trpc.system.getBuildInfo.useQuery(undefined, {
    enabled: !!adminStatus.data?.isUnlocked,
    staleTime: Infinity,
  });

  const updateLocation = trpc.weather.updateLocation.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully");
      setIsCapturingLocation(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update location");
      setIsCapturingLocation(false);
    },
  });

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const updateNotificationPreferences =
    trpc.user.updateNotificationPreferences.useMutation({
      onSuccess: () => {
        toast.success("Notification preferences saved");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save preferences");
      },
    });

  const { data: savedNotificationPrefs } =
    trpc.user.getNotificationPreferences.useQuery();

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    healthReminders: true,
    trainingReminders: true,
    feedingReminders: true,
    weatherAlerts: true,
    weeklyDigest: true,
  });

  // Sync notification prefs from server when loaded
  useEffect(() => {
    if (savedNotificationPrefs) {
      setNotifications((prev) => ({ ...prev, ...savedNotificationPrefs }));
    }
  }, [savedNotificationPrefs]);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({ name: profileData.name });
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

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (res.ok) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleNotificationSave = () => {
    updateNotificationPreferences.mutate(notifications);
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsCapturingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation.mutate({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          location: "",
        });
      },
      (error) => {
        toast.error(`Failed to get location: ${error.message}`);
        setIsCapturingLocation(false);
      },
    );
  };

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Avatar image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setAvatarPreview(dataUrl);
      updateProfile.mutate({ avatarData: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const isProfileLoading = updateProfile.isPending;

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="container max-w-4xl py-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-serif mb-2">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
            {/* Admin panel shortcut — visible to users with role=admin */}
            {user?.role === "admin" && (
              <div className="shrink-0">
                {adminStatus.data?.isUnlocked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/admin")}
                    className="border-primary/40 text-primary hover:bg-primary/10"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Open Admin Panel
                  </Button>
                ) : (
                  <AdminUnlockDialog
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/40 text-primary hover:bg-primary/10"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Open Admin Panel
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList
              className={
                adminStatus.data?.isUnlocked
                  ? "grid grid-cols-5 w-full max-w-2xl"
                  : "grid grid-cols-4 w-full max-w-2xl"
              }
            >
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
              {adminStatus.data?.isUnlocked && (
                <TabsTrigger value="system">
                  <Info className="w-4 h-4 mr-2" />
                  System
                </TabsTrigger>
              )}
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
                        <AvatarImage
                          src={
                            avatarPreview ?? user?.profileImageUrl ?? undefined
                          }
                          alt={user?.name ?? "Avatar"}
                        />
                        <AvatarFallback className="text-2xl">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={isProfileLoading}
                        >
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
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          disabled={isProfileLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          disabled
                          className="opacity-70"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed here. Contact support if
                          needed.
                        </p>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label>Location for Weather</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow EquiProfile to access your location for accurate
                          weather forecasts and riding conditions.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={captureLocation}
                          disabled={isCapturingLocation}
                        >
                          {isCapturingLocation ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Getting Location...
                            </>
                          ) : (
                            <>
                              <MapPin className="mr-2 h-4 w-4" />
                              Use My Current Location
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" disabled={isProfileLoading}>
                      {isProfileLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
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
                      />
                      <p className="text-xs text-muted-foreground">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
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
                      />
                    </div>

                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing...
                        </>
                      ) : (
                        "Change Password"
                      )}
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
                        description:
                          "Receive email notifications for important updates",
                      },
                      {
                        key: "healthReminders",
                        label: "Health Reminders",
                        description:
                          "Get notified about upcoming vet visits and vaccinations",
                      },
                      {
                        key: "trainingReminders",
                        label: "Training Reminders",
                        description:
                          "Reminders for scheduled training sessions",
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
                      <div
                        key={item.key}
                        className="flex items-center justify-between"
                      >
                        <div className="space-y-0.5">
                          <Label htmlFor={item.key}>{item.label}</Label>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <Switch
                          id={item.key}
                          checked={
                            notifications[
                              item.key as keyof typeof notifications
                            ]
                          }
                          onCheckedChange={(checked) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: checked,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleNotificationSave}
                    disabled={updateNotificationPreferences.isPending}
                  >
                    {updateNotificationPreferences.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab — admin only */}
            {adminStatus.data?.isUnlocked && (
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>
                      Build fingerprint and deployment details (admin only)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Version
                        </p>
                        <p className="font-mono text-sm">
                          {buildInfo.data?.version ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Build SHA
                        </p>
                        <p className="font-mono text-sm">
                          {buildInfo.data?.sha ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Build Time
                        </p>
                        <p className="font-mono text-sm">
                          {buildInfo.data?.buildTime ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                          Dashboard
                        </p>
                        <p className="font-mono text-sm font-semibold text-primary">
                          v2
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <p className="text-xs text-muted-foreground">
                      Full build info is also available at{" "}
                      <a
                        href="/build.txt"
                        target="_blank"
                        className="underline hover:text-foreground"
                      >
                        /build.txt
                      </a>
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
