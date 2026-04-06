import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Shield, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function PassportContent({ token }: { token: string }) {
  const { data, isLoading, error } = trpc.horses.getPassportByToken.useQuery(
    { token },
    { retry: 1 },
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    const msg =
      error?.data?.code === "FORBIDDEN"
        ? "This share link has expired."
        : "This horse passport could not be found. The link may be invalid or has been revoked.";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Passport Not Found</h2>
        <p className="text-muted-foreground max-w-sm">{msg}</p>
      </div>
    );
  }

  const { horse, healthRecords } = data;

  const vaccinations = healthRecords.filter(
    (r) => r.recordType === "vaccination",
  );
  const dewormings = healthRecords.filter((r) => r.recordType === "deworming");
  const otherRecords = healthRecords.filter(
    (r) => r.recordType !== "vaccination" && r.recordType !== "deworming",
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Branded Header */}
      <div className="bg-gradient-to-r from-[#0a1628] to-[#0f2e6b] rounded-lg p-5 mb-4">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="EquiProfile"
            className="h-14 w-auto object-contain"
          />
          <div className="text-white">
            <h2 className="text-xl font-bold font-serif">EquiProfile</h2>
            <p className="text-sm text-blue-200">Professional Equine Management</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-500" />
        <div>
          <h1 className="text-2xl font-bold">{horse.name}</h1>
          <p className="text-sm text-muted-foreground">
            Equine Passport — Read Only
          </p>
        </div>
        <Badge variant="outline" className="ml-auto text-xs">
          FEI/BEF Compliant
        </Badge>
      </div>

      {/* Identification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Horse Identification (Signalement)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{horse.name}</dd>
            </div>
            {horse.breed && (
              <div>
                <dt className="text-muted-foreground">Breed</dt>
                <dd className="font-medium">{horse.breed}</dd>
              </div>
            )}
            {horse.color && (
              <div>
                <dt className="text-muted-foreground">Colour</dt>
                <dd className="font-medium">{horse.color}</dd>
              </div>
            )}
            {horse.gender && (
              <div>
                <dt className="text-muted-foreground">Sex</dt>
                <dd className="font-medium capitalize">{horse.gender}</dd>
              </div>
            )}
            {horse.dateOfBirth && (
              <div>
                <dt className="text-muted-foreground">Date of Birth</dt>
                <dd className="font-medium">
                  {new Date(horse.dateOfBirth).toLocaleDateString()}
                </dd>
              </div>
            )}
            {horse.height && (
              <div>
                <dt className="text-muted-foreground">Height</dt>
                <dd className="font-medium">
                  {(horse.height / 10).toFixed(1)} hh
                </dd>
              </div>
            )}
            {horse.microchipNumber && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">Microchip</dt>
                <dd className="font-medium font-mono">{horse.microchipNumber}</dd>
              </div>
            )}
            {horse.registrationNumber && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">Registration</dt>
                <dd className="font-medium">{horse.registrationNumber}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Vaccinations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Vaccinations (FEI Section V)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vaccinations.length > 0 ? (
            <div className="space-y-2">
              {vaccinations.map((v) => (
                <div
                  key={v.id}
                  className="flex justify-between items-center py-2 border-b last:border-0 text-sm"
                >
                  <div>
                    <p className="font-medium">{v.title}</p>
                    <p className="text-muted-foreground">
                      {new Date(v.recordDate).toLocaleDateString()}
                    </p>
                  </div>
                  {v.nextDueDate && (
                    <Badge variant="outline">
                      Due: {new Date(v.nextDueDate).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No vaccination records
            </p>
          )}
        </CardContent>
      </Card>

      {/* Deworming */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deworming History</CardTitle>
        </CardHeader>
        <CardContent>
          {dewormings.length > 0 ? (
            <div className="space-y-2">
              {dewormings.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center py-2 border-b last:border-0 text-sm"
                >
                  <div>
                    <p className="font-medium">{d.title}</p>
                    <p className="text-muted-foreground">
                      {new Date(d.recordDate).toLocaleDateString()}
                    </p>
                  </div>
                  {d.nextDueDate && (
                    <Badge variant="outline">
                      Due: {new Date(d.nextDueDate).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No deworming records</p>
          )}
        </CardContent>
      </Card>

      {/* Other health records */}
      {otherRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Health Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {otherRecords.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-start py-2 border-b last:border-0 text-sm"
                >
                  <div>
                    <p className="font-medium">{r.title}</p>
                    <p className="text-muted-foreground capitalize">
                      {r.recordType}
                    </p>
                  </div>
                  <p className="text-muted-foreground shrink-0">
                    {new Date(r.recordDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        This digital passport complements, but does not replace, the official
        FEI/BEF equine passport. Generated by EquiProfile.
      </p>
    </div>
  );
}

export default function PassportView() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Invalid Passport Link</h2>
        <p className="text-muted-foreground max-w-sm">
          The QR code does not contain a valid share token.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PassportContent token={token} />
    </div>
  );
}
