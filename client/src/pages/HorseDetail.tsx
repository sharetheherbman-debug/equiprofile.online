import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";

function HorseDetailContent() {
  const params = useParams<{ id: string }>();
  const horseId = parseInt(params.id);

  const { data: horse, isLoading } = trpc.horses.get.useQuery({ id: horseId });
  const { data: healthRecords } = trpc.healthRecords.listByHorse.useQuery({ horseId });
  const { data: trainingSessions } = trpc.training.listByHorse.useQuery({ horseId });
  const { data: feedingPlans } = trpc.feeding.listByHorse.useQuery({ horseId });

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
        <h2 className="font-serif text-xl font-semibold mb-2">Horse not found</h2>
        <p className="text-muted-foreground mb-4">This horse may have been removed.</p>
        <Link href="/horses">
          <Button>Back to Horses</Button>
        </Link>
      </div>
    );
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return <Syringe className="w-4 h-4" />;
      case 'veterinary':
        return <Stethoscope className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
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
          <h1 className="font-serif text-3xl font-bold text-foreground">{horse.name}</h1>
          <p className="text-muted-foreground">
            {horse.breed || 'Unknown breed'}
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
              <img src={horse.photoUrl} alt={horse.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Heart className="w-24 h-24 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div className="md:col-span-2 p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {horse.gender && <Badge className="capitalize">{horse.gender}</Badge>}
              {horse.discipline && <Badge variant="secondary">{horse.discipline}</Badge>}
              {horse.level && <Badge variant="outline">{horse.level}</Badge>}
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {horse.color && (
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{horse.color}</p>
                </div>
              )}
              {horse.height && (
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="font-medium">{horse.height} cm</p>
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
                  <p className="font-medium">{new Date(horse.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}
              {horse.registrationNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Registration #</p>
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

      {/* Tabs for Health, Training, Feeding */}
      <Tabs defaultValue="health" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Health
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="feeding" className="flex items-center gap-2">
            <Utensils className="w-4 h-4" />
            Feeding
          </TabsTrigger>
        </TabsList>

        {/* Health Records Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Health Records</CardTitle>
                <CardDescription>Vaccinations, vet visits, and medical history</CardDescription>
              </div>
              <Link href={`/health/new?horseId=${horse.id}`}>
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
                    <div key={record.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        {getRecordTypeIcon(record.recordType)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.recordDate).toLocaleDateString()} • {record.recordType}
                        </p>
                      </div>
                      {record.nextDueDate && (
                        <Badge variant="outline">
                          Due: {new Date(record.nextDueDate).toLocaleDateString()}
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
                <CardDescription>Scheduled and completed training activities</CardDescription>
              </div>
              <Link href={`/training/new?horseId=${horse.id}`}>
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
                  <p className="text-muted-foreground">No training sessions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainingSessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{session.sessionType}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.sessionDate).toLocaleDateString()}
                          {session.startTime && ` at ${session.startTime}`}
                        </p>
                      </div>
                      <Badge variant={session.isCompleted ? "secondary" : "outline"}>
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
                <CardDescription>Daily feeding schedule and nutrition</CardDescription>
              </div>
              <Link href={`/feeding/new?horseId=${horse.id}`}>
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
                  <p className="text-muted-foreground">No feeding plan set up yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feedingPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{plan.feedType}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.quantity} {plan.unit || ''} • {plan.mealTime}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">{plan.mealTime}</Badge>
                    </div>
                  ))}
                </div>
              )}
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
