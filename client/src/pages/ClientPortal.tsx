import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import {
  Eye,
  Heart,
  Activity,
  FileText,
  Calendar,
  TrendingUp,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { trpc } from "../lib/trpc";
import { format } from "date-fns";

export default function ClientPortal() {
  const [, params] = useRoute("/client/:clientId");
  const clientId = params?.clientId ? parseInt(params.clientId) : null;

  // For demo purposes, we'll show the current user's horses
  // In production, this would check share tokens or client access permissions
  const { data: horses = [] } = trpc.horses.list.useQuery();
  const { data: healthRecords = [] } = trpc.healthRecords.listAll.useQuery();
  const { data: trainingSessions = [] } = trpc.training.listAll.useQuery();
  const { data: competitions = [] } = trpc.competitions.list.useQuery({
    horseId: undefined,
  });
  const { data: documents = [] } = trpc.documents.list.useQuery();

  if (!clientId) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Lock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Client Portal</h2>
            <p className="text-muted-foreground">Invalid client portal link</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3">
          <Eye className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Client Portal</h1>
            <p className="text-muted-foreground">
              Read-only view of your horses' information
            </p>
          </div>
        </div>
      </div>

      {horses.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No horses available in this portal
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Total Horses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{horses.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Health Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthRecords.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Training Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {trainingSessions.length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{competitions.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Horses List */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Your Horses</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {horses.map((horse) => {
                const horseHealth = healthRecords.filter(
                  (h) => h.horseId === horse.id,
                );
                const horseTraining = trainingSessions.filter(
                  (t) => t.horseId === horse.id,
                );
                const horseCompetitions = competitions.filter(
                  (c: any) => c.horseId === horse.id,
                );

                return (
                  <Card key={horse.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">
                            {horse.name}
                          </CardTitle>
                          <CardDescription>
                            {horse.breed} • {horse.age} years
                          </CardDescription>
                        </div>
                        {horse.isActive ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Gender:</span>
                          <div className="font-medium">
                            {horse.gender || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Color:</span>
                          <div className="font-medium">
                            {horse.color || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Discipline:
                          </span>
                          <div className="font-medium">
                            {horse.discipline || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Level:</span>
                          <div className="font-medium">
                            {horse.level || "N/A"}
                          </div>
                        </div>
                      </div>

                      <Tabs defaultValue="health" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="health" className="text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            Health
                          </TabsTrigger>
                          <TabsTrigger value="training" className="text-xs">
                            <Activity className="h-3 w-3 mr-1" />
                            Training
                          </TabsTrigger>
                          <TabsTrigger value="competitions" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Comps
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="health" className="mt-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              {horseHealth.length} Records
                            </div>
                            {horseHealth.slice(0, 3).map((record) => (
                              <div
                                key={record.id}
                                className="text-xs p-2 bg-muted rounded"
                              >
                                <div className="font-medium">
                                  {record.title}
                                </div>
                                <div className="text-muted-foreground">
                                  {format(new Date(record.recordDate), "PP")}
                                </div>
                              </div>
                            ))}
                            {horseHealth.length === 0 && (
                              <p className="text-xs text-muted-foreground">
                                No health records
                              </p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="training" className="mt-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              {horseTraining.length} Sessions
                            </div>
                            {horseTraining.slice(0, 3).map((session) => (
                              <div
                                key={session.id}
                                className="text-xs p-2 bg-muted rounded"
                              >
                                <div className="font-medium">
                                  {session.sessionType}
                                </div>
                                <div className="text-muted-foreground">
                                  {format(new Date(session.sessionDate), "PP")}
                                </div>
                              </div>
                            ))}
                            {horseTraining.length === 0 && (
                              <p className="text-xs text-muted-foreground">
                                No training sessions
                              </p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="competitions" className="mt-3">
                          <div className="space-y-2">
                            <div className="text-sm font-medium">
                              {horseCompetitions.length} Events
                            </div>
                            {horseCompetitions.slice(0, 3).map((comp) => (
                              <div
                                key={comp.id}
                                className="text-xs p-2 bg-muted rounded"
                              >
                                <div className="font-medium">
                                  {comp.competitionName}
                                </div>
                                <div className="text-muted-foreground">
                                  {comp.placement && `${comp.placement} place`}
                                </div>
                              </div>
                            ))}
                            {horseCompetitions.length === 0 && (
                              <p className="text-xs text-muted-foreground">
                                No competitions
                              </p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across all your horses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {healthRecords.slice(0, 5).map((record) => {
                  const horse = horses.find((h) => h.id === record.horseId);
                  return (
                    <div
                      key={record.id}
                      className="flex items-start gap-3 pb-3 border-b last:border-0"
                    >
                      <Heart className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{record.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {horse?.name} •{" "}
                          {format(new Date(record.recordDate), "PPP")}
                        </div>
                      </div>
                      <Badge variant="outline">Health</Badge>
                    </div>
                  );
                })}
                {trainingSessions.slice(0, 5).map((session) => {
                  const horse = horses.find((h) => h.id === session.horseId);
                  return (
                    <div
                      key={session.id}
                      className="flex items-start gap-3 pb-3 border-b last:border-0"
                    >
                      <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{session.sessionType}</div>
                        <div className="text-sm text-muted-foreground">
                          {horse?.name} •{" "}
                          {format(new Date(session.sessionDate), "PPP")}
                        </div>
                      </div>
                      <Badge variant="outline">Training</Badge>
                    </div>
                  );
                })}
                {healthRecords.length === 0 &&
                  trainingSessions.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No recent activity
                    </p>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Documents (Filtered) */}
          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Documents</CardTitle>
                <CardDescription>Documents shared with you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {documents.slice(0, 6).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {doc.fileName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(doc.createdAt), "PP")}
                        </div>
                      </div>
                      <Badge variant="secondary">{doc.category}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Read-Only Notice */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold">Read-Only Access</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is a view-only portal. You can see your horses'
                    information but cannot make changes. Contact your trainer or
                    stable manager if you need updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
