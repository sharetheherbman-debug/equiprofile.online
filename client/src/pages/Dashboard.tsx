import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { QuickActionsWidget } from "@/components/QuickActionsWidget";
import { ActivityFeed } from "@/components/ActivityFeed";
import { StatsOverview } from "@/components/StatsOverview";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Heart, 
  Calendar, 
  CloudSun, 
  Plus,
  ChevronRight,
  AlertCircle,
  Clock,
  Activity
} from "lucide-react";

function DashboardContent() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.user.getDashboardStats.useQuery();
  const { data: subscription } = trpc.user.getSubscriptionStatus.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();
  const { data: upcomingSessions } = trpc.training.getUpcoming.useQuery();
  const { data: reminders } = trpc.healthRecords.getReminders.useQuery({ days: 14 });

  // Runtime guards to ensure data is always treated as an array
  const horsesList = horses?.horses && Array.isArray(horses.horses) ? horses.horses : [];
  const upcomingList = Array.isArray(upcomingSessions) ? upcomingSessions : [];
  const remindersList = Array.isArray(reminders) ? reminders : [];

  // Log when fallback values are used to help identify data shape issues
  if (horses && (!horses.horses || !Array.isArray(horses.horses))) {
    console.warn('[Dashboard] Unexpected horses data shape:', horses);
  }
  if (upcomingSessions && !Array.isArray(upcomingSessions)) {
    console.warn('[Dashboard] Unexpected upcomingSessions data shape:', upcomingSessions);
  }
  if (reminders && !Array.isArray(reminders)) {
    console.warn('[Dashboard] Unexpected reminders data shape:', reminders);
  }

  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    switch (subscription.status) {
      case 'trial':
        const trialDays = subscription.trialEndsAt 
          ? Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 0;
        return (
          <Link href="/billing">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors">
              {trialDays} days left · Subscribe now
            </Badge>
          </Link>
        );
      case 'active':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Active Subscription</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Payment Overdue</Badge>;
      case 'expired':
        return <Badge variant="destructive">Subscription Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-foreground transition-all">
            Welcome back, {user?.name?.split(' ')[0] || 'Rider'}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your horses and activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getSubscriptionBadge()}
          <Link href="/horses/new">
            <Button className="transition-all hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              Add Horse
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsOverview
        totalHorses={stats?.horseCount || 0}
        trainingHours={0}
        upcomingEvents={stats?.upcomingSessionCount || 0}
        healthReminders={stats?.reminderCount || 0}
      />

      {/* Quick Actions */}
      <QuickActionsWidget />

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <ActivityFeed maxHeight="500px" />
        
        {/* Horses List */}
        <Card className="lg:col-span-2 transition-all hover:shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif">Your Horses</CardTitle>
              <CardDescription>Manage your equine companions</CardDescription>
            </div>
            <Link href="/horses">
              <Button variant="ghost" size="sm" className="transition-all hover:scale-105">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {horsesList.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4 animate-pulse" />
                <p className="text-muted-foreground mb-4">No horses added yet</p>
                <Link href="/horses/new">
                  <Button className="transition-all hover:scale-105">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Horse
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {horsesList.slice(0, 3).map((horse) => (
                  <Link key={horse.id} href={`/horses/${horse.id}`}>
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-all cursor-pointer hover:scale-[1.02]">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-all">
                        <Heart className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{horse.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {horse.breed || 'Unknown breed'} • {horse.age ? `${horse.age} years` : 'Age unknown'}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground transition-all group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingList.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingList.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 transition-all hover:bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{session.sessionType}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.sessionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/training">
                <Button variant="outline" className="w-full mt-4 transition-all hover:scale-105" size="sm">
                  View Schedule
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Health Reminders */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Health Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              {remindersList.length === 0 ? (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming reminders</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {remindersList.slice(0, 3).map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 transition-all hover:bg-muted/50">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Due: {reminder.nextDueDate ? new Date(reminder.nextDueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weather Card */}
          <Card className="transition-all hover:shadow-lg">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Riding Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/weather">
                <Button variant="outline" className="w-full transition-all hover:scale-105">
                  <CloudSun className="w-4 h-4 mr-2" />
                  Check Weather
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
