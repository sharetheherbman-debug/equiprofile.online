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
  Tag,
  X,
  Share2,
  QrCode,
  Trash2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { MedicalPassport } from "@/components/MedicalPassport";
import { useState } from "react";

function HorseDetailContent() {
  const params = useParams<{ id: string }>();
  const horseId = parseInt(params.id);
  const utils = trpc.useUtils();

  const { data: horse, isLoading } = trpc.horses.get.useQuery({ id: horseId });
  const { data: healthRecords } = trpc.healthRecords.listByHorse.useQuery({
    horseId,
  });
  const { data: trainingSessions } = trpc.training.listByHorse.useQuery({
    horseId,
  });
  const { data: feedingPlans } = trpc.feeding.listByHorse.useQuery({ horseId });
  const { data: competitionRecords } = trpc.competitions.list.useQuery({ horseId });
  const { data: timeline } = trpc.timeline.getHorseTimeline.useQuery({ horseId, limit: 50 });
  const { data: healthAlerts } = trpc.timeline.getHealthAlerts.useQuery({ horseId });
  const { data: horseTags = [] } = trpc.tags.listByHorse.useQuery({ horseId });
  const { data: allTags = [] } = trpc.tags.list.useQuery();
  const { data: shareLinks = [], refetch: refetchShareLinks } = trpc.sharing.list.useQuery();

  const attachTagMutation = trpc.tags.attachToHorse.useMutation({
    onSuccess: () => { utils.tags.listByHorse.invalidate({ horseId }); toast.success("Tag added"); },
    onError: (e) => toast.error(e.message),
  });
  const detachTagMutation = trpc.tags.detachFromHorse.useMutation({
    onSuccess: () => { utils.tags.listByHorse.invalidate({ horseId }); toast.success("Tag removed"); },
    onError: (e) => toast.error(e.message),
  });
  const createShareLinkMutation = trpc.sharing.create.useMutation({
    onSuccess: () => { refetchShareLinks(); toast.success("Share link created!"); },
    onError: (e) => toast.error(e.message),
  });
  const revokeShareLinkMutation = trpc.sharing.revoke.useMutation({
    onSuccess: () => { refetchShareLinks(); toast.success("Share link revoked"); },
    onError: (e) => toast.error(e.message),
  });

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/passport/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  };

  // Horse-specific share links for medical_passport type
  const passportLinks = (shareLinks as any[]).filter(
    (l) => l.linkType === "medical_passport" && l.horseId === horseId && l.isActive,
  );

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
      {/* ── Hero Banner (when photo available) or plain header ── */}
      {horse.photoUrl ? (
        <div className="relative w-full rounded-2xl overflow-hidden shadow-lg">
          {/* 3:1 banner */}
          <div className="aspect-[3/1] w-full">
            <img
              src={horse.photoUrl}
              alt={horse.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/images/hero/image6.jpg";
              }}
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {/* Back + Edit buttons */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <Link href="/horses">
              <Button size="sm" variant="secondary" className="bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Horses
              </Button>
            </Link>
            <Link href={`/horses/${horse.id}/edit`}>
              <Button size="sm" variant="secondary" className="bg-black/40 border-white/20 text-white hover:bg-black/60 backdrop-blur-sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
          </div>
          {/* Horse name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {horse.gender && <Badge className="capitalize bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">{horse.gender}</Badge>}
              {horse.discipline && <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">{horse.discipline}</Badge>}
              {horse.level && <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">{horse.level}</Badge>}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
              {horse.name}
            </h1>
            <p className="text-white/70 text-sm mt-0.5">
              {horse.breed || "Unknown breed"}
              {horse.age && ` • ${horse.age} years old`}
            </p>
          </div>
        </div>
      ) : (
        /* Plain header when no photo */
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
      )}

      {/* Horse Profile Card */}
      <Card>
        <div className={horse.photoUrl ? "" : "grid md:grid-cols-3 gap-6"}>
          {/* Only show the square thumbnail when there's no hero banner */}
          {!horse.photoUrl && (
            <div className="aspect-square bg-muted rounded-l-lg overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-900/20 to-pink-900/20">
                <Heart className="w-24 h-24 text-muted-foreground/30" />
              </div>
            </div>
          )}
          <div className={`${horse.photoUrl ? "" : "md:col-span-2"} p-6`}>
            {/* Show badges here when there's no hero to show them */}
            {!horse.photoUrl && (
              <div className="flex flex-wrap gap-2 mb-4">
                {horse.gender && (
                  <Badge className="capitalize">{horse.gender}</Badge>
                )}
                {horse.discipline && (
                  <Badge variant="secondary">{horse.discipline}</Badge>
                )}
                {horse.level && <Badge variant="outline">{horse.level}</Badge>}
              </div>
            )}

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

            {/* Tags */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Tags</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(horseTags as any[]).map((tag: any) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="cursor-pointer pr-1 gap-1 hover:bg-destructive/10 transition-colors"
                    style={tag.color ? { backgroundColor: tag.color + "22", borderColor: tag.color + "55", color: tag.color } : {}}
                    onClick={() => detachTagMutation.mutate({ horseId, tagId: tag.id })}
                  >
                    {tag.name}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
                {/* Add tag dropdown */}
                {(allTags as any[]).filter((t: any) => !(horseTags as any[]).some((ht: any) => ht.id === t.id)).length > 0 && (
                  <select
                    className="text-xs border rounded px-1.5 py-0.5 bg-background text-muted-foreground cursor-pointer"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) attachTagMutation.mutate({ horseId, tagId: parseInt(e.target.value) });
                    }}
                  >
                    <option value="">+ Add tag</option>
                    {(allTags as any[])
                      .filter((t: any) => !(horseTags as any[]).some((ht: any) => ht.id === t.id))
                      .map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                  </select>
                )}
              </div>
            </div>
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
          <TabsTrigger value="competitions" className="flex-shrink-0 flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Competitions</span>
            <span className="sm:hidden">Comps</span>
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

        {/* Competitions Tab */}
        <TabsContent value="competitions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Competition Record
                  </CardTitle>
                  <CardDescription>
                    All competition entries and results for {horse.name}
                  </CardDescription>
                </div>
                <Link href="/competitions">
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Log Competition
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!competitionRecords || competitionRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    No competition records yet
                  </p>
                  <Link href="/competitions">
                    <Button size="sm" className="mt-3">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Log a Competition
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(competitionRecords as any[]).map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                    >
                      <Trophy className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight">
                          {comp.competitionName}
                        </p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                          {comp.date && (
                            <span>
                              {new Date(comp.date).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          {comp.venue && <span>{comp.venue}</span>}
                          {comp.discipline && <span>{comp.discipline}</span>}
                        </div>
                      </div>
                      {comp.placement && (
                        <Badge
                          variant="outline"
                          className={
                            comp.placement === "1st"
                              ? "bg-yellow-400/20 text-yellow-700 border-yellow-400/40 dark:text-yellow-300"
                              : "bg-blue-100/50 text-blue-700 border-blue-300/40 dark:text-blue-300"
                          }
                        >
                          {comp.placement}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Passport Tab */}
        <TabsContent value="passport">
          {/* Share Link Card */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Shareable Passport Links</CardTitle>
                </div>
                <Button
                  size="sm"
                  onClick={() => createShareLinkMutation.mutate({ linkType: "medical_passport", horseId, expiresInDays: 30 })}
                  disabled={createShareLinkMutation.isPending}
                >
                  <QrCode className="w-4 h-4 mr-1.5" />
                  Generate Link
                </Button>
              </div>
              <CardDescription className="text-xs mt-1">
                Anyone with the link can view this horse's medical passport (read-only, expires in 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {passportLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No active share links. Generate one above.</p>
              ) : (
                <div className="space-y-2">
                  {passportLinks.map((link: any) => {
                    const url = `${window.location.origin}/passport/${link.token}`;
                    return (
                      <div key={link.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm">
                        <code className="flex-1 truncate text-xs text-muted-foreground">{url}</code>
                        {link.expiresAt && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            Exp: {new Date(link.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" })}
                          </span>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={() => copyShareLink(link.token)}
                          title="Copy link"
                        >
                          {copiedToken === link.token ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                          onClick={() => revokeShareLinkMutation.mutate({ id: link.id })}
                          title="Revoke link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Passport Document */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Passport</CardTitle>
              <CardDescription>
                Comprehensive health record document — print or export as PDF
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
