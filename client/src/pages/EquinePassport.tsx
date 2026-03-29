import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { MedicalPassport } from "../components/MedicalPassport";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import {
  Shield,
  FileText,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";

function EquinePassportContent() {
  const [selectedHorseId, setSelectedHorseId] = useState<string>("");
  const [showPassportFields, setShowPassportFields] = useState(false);
  const [passportData, setPassportData] = useState({
    passportNumber: "",
    feiId: "",
    ueln: "",
  });

  const utils = trpc.useUtils();
  const { data: horses } = trpc.horses.list.useQuery();

  // Get health data for selected horse
  const selectedHorse = horses?.find((h) => h.id === parseInt(selectedHorseId));

  // Pre-populate passport fields from DB whenever the selected horse changes
  useEffect(() => {
    if (selectedHorse) {
      setPassportData({
        passportNumber: (selectedHorse as any).passportNumber || "",
        feiId: (selectedHorse as any).feiId || "",
        ueln: (selectedHorse as any).ueln || "",
      });
    } else {
      setPassportData({ passportNumber: "", feiId: "", ueln: "" });
    }
  }, [selectedHorse?.id]);

  const savePassportIdsMutation = trpc.horses.update.useMutation({
    onSuccess: () => {
      utils.horses.list.invalidate();
      utils.horses.get.invalidate({ id: parseInt(selectedHorseId) });
      setShowPassportFields(false);
      toast.success("Passport IDs saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save passport IDs");
    },
  });

  const { data: healthRecords } = trpc.healthRecords.listAll.useQuery(
    undefined,
    {
      enabled: !!selectedHorseId,
    },
  );

  // Filter records for selected horse
  const horseHealthRecords = healthRecords?.filter(
    (r: any) => r.horseId === parseInt(selectedHorseId),
  );

  const vaccinations =
    horseHealthRecords
      ?.filter((r: any) => r.recordType === "vaccination")
      .map((r: any) => ({
        vaccineName: r.title,
        dateAdministered: r.recordDate,
        nextDueDate: r.nextDueDate,
      })) || [];

  const dewormings =
    horseHealthRecords
      ?.filter((r: any) => r.recordType === "deworming")
      .map((r: any) => ({
        productName: r.title,
        dateAdministered: r.recordDate,
        nextDueDate: r.nextDueDate,
      })) || [];

  const recentRecords =
    horseHealthRecords?.slice(0, 10).map((r: any) => ({
      title: r.title,
      recordDate: r.recordDate,
      recordType: r.recordType,
    })) || [];

  // Check FEI compliance
  const complianceChecks = selectedHorse
    ? [
        {
          label: "Microchip Number",
          met: !!selectedHorse.microchipNumber,
          required: true,
        },
        {
          label: "Registration Number",
          met: !!selectedHorse.registrationNumber,
          required: true,
        },
        {
          label: "Breed Recorded",
          met: !!selectedHorse.breed,
          required: true,
        },
        {
          label: "Date of Birth",
          met: !!selectedHorse.dateOfBirth,
          required: true,
        },
        {
          label: "Colour Recorded",
          met: !!selectedHorse.color,
          required: true,
        },
        {
          label: "Gender Recorded",
          met: !!selectedHorse.gender,
          required: true,
        },
        {
          label: "Influenza Vaccination",
          met: vaccinations.length > 0,
          required: true,
        },
        {
          label: "Passport Number",
          met: !!passportData.passportNumber,
          required: false,
        },
        {
          label: "FEI ID",
          met: !!passportData.feiId,
          required: false,
        },
        {
          label: "UELN",
          met: !!passportData.ueln,
          required: false,
        },
      ]
    : [];

  const requiredChecks = complianceChecks.filter((c) => c.required);
  const metCount = requiredChecks.filter((c) => c.met).length;
  const compliancePercent =
    requiredChecks.length > 0
      ? Math.round((metCount / requiredChecks.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-500" />
          Equine Passport
        </h1>
        <p className="text-muted-foreground mt-1">
          FEI/BEF compliant digital equine passport with vaccination records and
          identification
        </p>
      </div>

      {/* Horse Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Select Horse
          </CardTitle>
          <CardDescription>
            Choose a horse to view or generate their equine passport
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedHorseId} onValueChange={setSelectedHorseId}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select a horse" />
              </SelectTrigger>
              <SelectContent>
                {horses?.map((horse) => (
                  <SelectItem key={horse.id} value={String(horse.id)}>
                    {horse.name} {horse.breed ? `(${horse.breed})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedHorseId && (
              <Dialog
                open={showPassportFields}
                onOpenChange={setShowPassportFields}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Add Passport IDs
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Passport Identification Numbers</DialogTitle>
                    <DialogDescription className="sr-only">Manage passport details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Passport Number</Label>
                      <Input
                        value={passportData.passportNumber}
                        onChange={(e) =>
                          setPassportData((p) => ({
                            ...p,
                            passportNumber: e.target.value,
                          }))
                        }
                        placeholder="e.g. GBR-2024-123456"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Issued by your passport issuing organisation (PIO)
                      </p>
                    </div>
                    <div>
                      <Label>FEI ID</Label>
                      <Input
                        value={passportData.feiId}
                        onChange={(e) =>
                          setPassportData((p) => ({
                            ...p,
                            feiId: e.target.value,
                          }))
                        }
                        placeholder="e.g. 105AB12"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for FEI registered horses competing
                        internationally
                      </p>
                    </div>
                    <div>
                      <Label>UELN (Universal Equine Life Number)</Label>
                      <Input
                        value={passportData.ueln}
                        onChange={(e) =>
                          setPassportData((p) => ({
                            ...p,
                            ueln: e.target.value,
                          }))
                        }
                        placeholder="e.g. 826000123456789"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        15-digit unique identifier linking to the national
                        database
                      </p>
                    </div>
                    <Button
                      disabled={savePassportIdsMutation.isPending}
                      onClick={() => {
                        if (!selectedHorseId) return;
                        savePassportIdsMutation.mutate({
                          id: parseInt(selectedHorseId),
                          passportNumber: passportData.passportNumber || undefined,
                          feiId: passportData.feiId || undefined,
                          ueln: passportData.ueln || undefined,
                        });
                      }}
                    >
                      {savePassportIdsMutation.isPending ? "Saving…" : "Save IDs"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Checker */}
      {selectedHorse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              FEI/BEF Compliance Check
            </CardTitle>
            <CardDescription>
              Verify your horse's passport data meets FEI and BEF requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Compliance Score:{" "}
                  <span
                    className={
                      compliancePercent === 100
                        ? "text-green-600"
                        : compliancePercent >= 70
                          ? "text-amber-600"
                          : "text-red-600"
                    }
                  >
                    {compliancePercent}%
                  </span>
                </span>
                <Badge
                  variant={compliancePercent === 100 ? "default" : "secondary"}
                >
                  {metCount}/{requiredChecks.length} Required Fields
                </Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    compliancePercent === 100
                      ? "bg-green-500"
                      : compliancePercent >= 70
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${compliancePercent}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {complianceChecks.map((check, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm p-2 rounded-md bg-muted/50"
                >
                  {check.met ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <AlertCircle
                      className={`w-4 h-4 shrink-0 ${check.required ? "text-red-500" : "text-muted-foreground"}`}
                    />
                  )}
                  <span
                    className={
                      check.met ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {check.label}
                  </span>
                  {!check.required && (
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      Optional
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            {compliancePercent < 100 && (
              <p className="text-xs text-muted-foreground mt-3">
                <AlertCircle className="w-3 h-3 inline mr-1" />
                Missing required fields can be updated in the horse profile
                under "My Horses"
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Passport */}
      {selectedHorse && (
        <MedicalPassport
          horse={{
            ...selectedHorse,
            age: selectedHorse.age ?? undefined,
            breed: selectedHorse.breed ?? undefined,
            microchipNumber: selectedHorse.microchipNumber ?? undefined,
            registrationNumber: selectedHorse.registrationNumber ?? undefined,
            color: selectedHorse.color ?? undefined,
            gender: selectedHorse.gender ?? undefined,
            dateOfBirth: selectedHorse.dateOfBirth
              ? new Date(selectedHorse.dateOfBirth).toISOString()
              : undefined,
            height: selectedHorse.height
              ? `${(selectedHorse.height / 10).toFixed(1)} hh`
              : undefined,
            passportNumber: passportData.passportNumber || (selectedHorse as any).passportNumber || undefined,
            feiId: passportData.feiId || (selectedHorse as any).feiId || undefined,
            ueln: passportData.ueln || (selectedHorse as any).ueln || undefined,
            shareToken: (selectedHorse as any).shareToken || undefined,
          }}
          vaccinations={vaccinations}
          dewormings={dewormings}
          healthRecords={recentRecords}
        />
      )}

      {/* Info about FEI/BEF */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            About Equine Passports
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <p>
            Under UK and EU law, all equines (horses, ponies, donkeys) must have
            a passport. The Equine Identification Regulations require:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              A valid passport issued by an approved Passport Issuing
              Organisation (PIO)
            </li>
            <li>
              Microchip implantation for identification (mandatory since 2009)
            </li>
            <li>
              UELN (Universal Equine Life Number) for national database
              registration
            </li>
            <li>
              Up-to-date vaccination records (especially equine influenza for
              competition)
            </li>
          </ul>
          <p>
            For FEI registered horses competing internationally, an FEI ID
            number is also required. This digital passport is designed to
            complement your official physical passport.
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">FEI</Badge>
            <Badge variant="outline">BEF</Badge>
            <Badge variant="outline">DEFRA</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function EquinePassport() {
  return (
    <DashboardLayout>
      <EquinePassportContent />
    </DashboardLayout>
  );
}
