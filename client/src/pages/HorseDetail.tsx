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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  Edit,
  Heart,
  Activity,
  Utensils,
  FileText,
  Plus,
  Calendar,
  Syringe,
  Stethoscope,
  FileHeart,
  Clock,
  AlertTriangle,
  Trophy,
  StickyNote,
  Pill,
  CalendarCheck,
  Upload,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { MedicalPassport } from "@/components/MedicalPassport";

function HorseDetailContent() {
  const params = useParams<{ id: string }>();
  const horseId = parseInt(params.id);

  const { data: horse, isLoading } = trpc.horses.get.useQuery({ id: horseId });
  const { data: healthRecords } = trpc.healthRecords.listByHorse.useQuery({
    horseId,
  });
  const { data: trainingSessions } = trpc.training.listByHorse.useQuery({
    horseId,
  });
  const { data: feedingPlans } = trpc.feeding.listByHorse.useQuery({ horseId });
  const { data: timeline } = trpc.timeline.getHorseTimeline.useQuery({ horseId, limit: 50 });
  const { data: healthAlerts } = trpc.timeline.getHealthAlerts.useQuery({ horseId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-serif text-xl font-semibold mb-2">
          Horse not found
        </h2>
        <p className="text-muted-foreground mb-4">
          This horse may have been removed.
        </p>
        <Link href="/horses">
          <Button>Back to Horses</Button>
        </Link>
      </div>
    );
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return <Syringe className="w-4 h-4" />;
      case "veterinary":
        return <Stethoscope className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTimelineCategoryIcon = (category: string) => {
    switch (category) {
      case "health": return <Heart className="w-4 h-4 text-rose-500" />;
      case "training": return <Activity className="w-4 h-4 text-blue-500" />;
      case "vaccination": return <Syringe className="w-4 h-4 text-emerald-500" />;
      case "treatment": return <Pill className="w-4 h-4 text-purple-500" />;
      case "appointment": return <CalendarCheck className="w-4 h-4 text-amber-500" />;
      case "document": return <Upload className="w-4 h-4 text-indigo-500" />;
      case "note": return <StickyNote className="w-4 h-4 text-yellow-500" />;
      case "competition": return <Trophy className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health": return "bg-rose-500/10 border-rose-500/20";
      case "training": return "bg-blue-500/10 border-blue-500/20";
      case "vaccination": return "bg-emerald-500/10 border-emerald-500/20";
      case "treatment": return "bg-purple-500/10 border-purple-500/20";
      case "appointment": return "bg-amber-500/10 border-amber-500/20";
      case "document": return "bg-indigo-500/10 border-indigo-500/20";
      case "note": return "bg-yellow-500/10 border-yellow-500/20";
      case "competition": return "bg-orange-500/10 border-orange-500/20";
      default: return "bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/horses">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            {horse.name}
          </h1>
          <p className="text-muted-foreground">
            {horse.breed || "Unknown breed"}
            {horse.age && ` • ${horse.age} years old`}
          </p>
        </div>
        <Link href={`/horses/${horse.id}/edit`}>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Horse Profile Card */}
      <Card>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="aspect-square bg-muted rounded-l-lg overflow-hidden">
            {horse.photoUrl ? (
              <img
                src={horse.photoUrl}
                alt={horse.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/hero/image6.jpg";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-900/20 to-pink-900/20">
                <Heart className="w-24 h-24 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="md:col-span-2 p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {horse.gender && (
                <Badge className="capitalize">{horse.gender}</Badge>
              )}
              {horse.discipline && (
                <Badge variant="secondary">{horse.discipline}</Badge>
              )}
              {horse.level && <Badge variant="outline">{horse.level}</Badge>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {horse.color && (
                <div>
                  <p className="text-sm text-muted-foreground">Colour</p>
                  <p className="font-medium">{horse.color}</p>
                </div>
              )}
              {horse.height && (
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="font-medium">{(horse.height / 10).toFixed(1)} hh</p>
                </div>
              )}
              {horse.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{horse.weight} kg</p>
                </div>
              )}
              {horse.dateOfBirth && (
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(horse.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
              {horse.registrationNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Registration #
                  </p>
                  <p className="font-medium">{horse.registrationNumber}</p>
                </div>
              )}
              {horse.microchipNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Microchip #</p>
                  <p className="font-medium">{horse.microchipNumber}</p>
                </div>
              )}
            </div>

            {horse.notes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-foreground">{horse.notes}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Health Alerts Banner */}
      {healthAlerts && healthAlerts.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-semibold">Health Alerts</p>
              <Badge variant="secondary" className="text-[10px]">{healthAlerts.length}</Badge>
            </div>
            <div className="space-y-1.5">
              {healthAlerts.slice(0, 5).map((alert: any) => (
                <div key={alert.id} className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    alert.severity === "urgent" ? "bg-red-500" :
                    alert.severity === "warning" ? "bg-amber-500" : "bg-blue-400"
                  }`} />
                  <span className={alert.severity === "urgent" ? "font-medium text-red-700 dark:text-red-400" : "text-muted-foreground"}>
                    {alert.title}
                  </span>
                  {alert.dueDate && (
                    <span className="text-muted-foreground/60 ml-auto">
                      {new Date(alert.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Timeline, Health, Training, Feeding, Medical Passport */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto gap-0 rounded-md h-auto p-1">
          <TabsTrigger value="timeline" className="flex-shrink-0 flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="health" className="flex-shrink-0 flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            Health
          </TabsTrigger>
          <TabsTrigger value="training" className="flex-shrink-0 flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            Training
          </TabsTrigger>
          <TabsTrigger value="feeding" className="flex-shrink-0 flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5">
            <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            Feeding
          </TabsTrigger>
          <TabsTrigger value="passport" className="flex-shrink-0 flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5">
            <FileHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Passport</span>
            <span className="sm:hidden">Pass</span>
          </TabsTrigger>
        </TabsList>

        {/* Timeline Tab — unified chronological view */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horse Timeline
              </CardTitle>
              <CardDescription>
                A complete chronological story of {horse.name}'s care, training, and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!timeline || timeline.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No timeline events yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Add health records, training sessions, or documents to build the timeline
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-0">
                    {timeline.map((event: any, idx: number) => {
                      const isFirst = idx === 0;
                      const prevEvent = idx > 0 ? timeline[idx - 1] : null;
                      const showDateHeader = isFirst || (
                        prevEvent &&
                        new Date(event.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) !==
                        new Date(prevEvent.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
                      );

                      return (
                        <div key={event.id}>
                          {showDateHeader && (
                            <div className="relative flex items-center gap-3 py-2 pl-12">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {new Date(event.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                              </p>
                            </div>
                          )}
                          <div className="relative flex items-start gap-3 py-2 pl-0">
                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border ${getCategoryColor(event.category)}`}>
                              {getTimelineCategoryIcon(event.category)}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{event.title}</p>
                                  {event.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {event.status && (
                                    <Badge variant={event.status === "completed" ? "secondary" : "outline"} className="text-[10px]">
                                      {event.status}
                                    </Badge>
                                  )}
                                  <span className="text-[11px] text-muted-foreground/70">
                                    {new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Records Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Health Records</CardTitle>
                <CardDescription>
                  Vaccinations, vet visits, and medical history
                </CardDescription>
              </div>
              <Link href={`/health?horseId=${horse.id}`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!healthRecords || healthRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No health records yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {healthRecords.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getRecordTypeIcon(record.recordType)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.recordDate).toLocaleDateString()} •{" "}
                          {record.recordType}
                        </p>
                      </div>
                      {record.nextDueDate && (
                        <Badge variant="outline">
                          Due:{" "}
                          {new Date(record.nextDueDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Training Sessions</CardTitle>
                <CardDescription>
                  Scheduled and completed training activities
                </CardDescription>
              </div>
              <Link href={`/training?horseId=${horse.id}`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Session
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!trainingSessions || trainingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No training sessions yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">
                          {session.sessionType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.sessionDate).toLocaleDateString()}
                          {session.startTime && ` at ${session.startTime}`}
                        </p>
                      </div>
                      <Badge
                        variant={session.isCompleted ? "secondary" : "outline"}
                      >
                        {session.isCompleted ? "Completed" : "Scheduled"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feeding Tab */}
        <TabsContent value="feeding">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Feeding Plan</CardTitle>
                <CardDescription>
                  Daily feeding schedule and nutrition
                </CardDescription>
              </div>
              <Link href={`/feeding?horseId=${horse.id}`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feed
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {!feedingPlans || feedingPlans.length === 0 ? (
                <div className="text-center py-8">
                  <Utensils className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No feeding plan set up yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedingPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{plan.feedType}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.quantity} {plan.unit || ""} • {plan.mealTime}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {plan.mealTime}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Passport Tab */}
        <TabsContent value="passport">
          <Card>
            <CardHeader>
              <CardTitle>Medical Passport</CardTitle>
              <CardDescription>
                Comprehensive health record document with QR code for easy
                sharing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MedicalPassport
                horse={{
                  id: horse.id,
                  name: horse.name,
                  breed: horse.breed || undefined,
                  age: horse.age || undefined,
                  microchipNumber: horse.microchipNumber || undefined,
                  registrationNumber: horse.registrationNumber || undefined,
                }}
                vaccinations={healthRecords
                  ?.filter((r) => r.recordType === "vaccination")
                  .map((r) => ({
                    vaccineName: r.title || "Vaccination",
                    dateAdministered:
                      r.recordDate instanceof Date
                        ? r.recordDate.toISOString()
                        : r.recordDate,
                    nextDueDate: r.nextDueDate
                      ? r.nextDueDate instanceof Date
                        ? r.nextDueDate.toISOString()
                        : r.nextDueDate
                      : undefined,
                  }))}
                dewormings={healthRecords
                  ?.filter((r) => r.recordType === "deworming")
                  .map((r) => ({
                    productName: r.title || "Deworming",
                    dateAdministered:
                      r.recordDate instanceof Date
                        ? r.recordDate.toISOString()
                        : r.recordDate,
                    nextDueDate: r.nextDueDate
                      ? r.nextDueDate instanceof Date
                        ? r.nextDueDate.toISOString()
                        : r.nextDueDate
                      : undefined,
                  }))}
                healthRecords={healthRecords?.map((r) => ({
                  title: r.title,
                  recordDate:
                    r.recordDate instanceof Date
                      ? r.recordDate.toISOString()
                      : r.recordDate,
                  recordType: r.recordType,
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function HorseDetail() {
  return (
    <DashboardLayout>
      <HorseDetailContent />
    </DashboardLayout>
  );
}
