import { useState } from "react";
import { QrCode, Download, Share2, Printer, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { generateQRCode } from "../lib/utils/qrcode";
import { generatePassportPDF, loadLogoBase64 } from "../lib/utils/pdf";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface MedicalPassportProps {
  horse: {
    id: number;
    name: string;
    breed?: string;
    age?: number;
    microchipNumber?: string;
    registrationNumber?: string;
    // FEI/BEF passport fields
    passportNumber?: string;
    feiId?: string;
    ueln?: string;
    color?: string;
    gender?: string;
    dateOfBirth?: string;
    height?: string | number;
  };
  vaccinations?: Array<{
    vaccineName: string;
    dateAdministered: string;
    nextDueDate?: string;
  }>;
  dewormings?: Array<{
    productName: string;
    dateAdministered: string;
    nextDueDate?: string;
  }>;
  healthRecords?: Array<{
    title: string;
    recordDate: string;
    recordType: string;
  }>;
}

export function MedicalPassport({
  horse,
  vaccinations = [],
  dewormings = [],
  healthRecords = [],
}: MedicalPassportProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateQR = async () => {
    const shareUrl = `${window.location.origin}/passport/${horse.id}`;
    const qr = await generateQRCode(shareUrl);
    setQrCodeUrl(qr);
    setQrModalOpen(true);
  };

  const handlePrintPassport = async () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      toast.error("Pop-up blocked — please allow pop-ups to print.");
      return;
    }

    const logoDataUrl = await loadLogoBase64();
    const logoHtml = logoDataUrl
      ? `<img src="${logoDataUrl}" alt="EquiProfile" style="height:40px;width:auto;object-fit:contain;" />`
      : "";

    const field = (label: string, value?: string | number | null) =>
      value
        ? `<tr><th>${label}</th><td>${value}</td></tr>`
        : "";

    const vaccRows = vaccinations.length
      ? vaccinations
          .map(
            (v) =>
              `<tr><td>${v.vaccineName}</td><td>${new Date(v.dateAdministered).toLocaleDateString("en-GB")}</td><td>${v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString("en-GB") : "—"}</td></tr>`,
          )
          .join("")
      : `<tr><td colspan="3" class="empty">No vaccination records</td></tr>`;

    const dewormRows = dewormings.length
      ? dewormings
          .map(
            (d) =>
              `<tr><td>${d.productName}</td><td>${new Date(d.dateAdministered).toLocaleDateString("en-GB")}</td><td>${d.nextDueDate ? new Date(d.nextDueDate).toLocaleDateString("en-GB") : "—"}</td></tr>`,
          )
          .join("")
      : `<tr><td colspan="3" class="empty">No deworming records</td></tr>`;

    const healthRows = healthRecords.length
      ? healthRecords
          .slice(0, 10)
          .map(
            (r) =>
              `<tr><td>${r.title}</td><td>${r.recordType}</td><td>${new Date(r.recordDate).toLocaleDateString("en-GB")}</td></tr>`,
          )
          .join("")
      : "";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${horse.name} — Equine Medical Passport</title>
  <style>
    @page { margin: 15mm; size: A4 portrait; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Helvetica, Arial, sans-serif; font-size: 10pt; color: #1a1a1a; background: #fff; }

    .letterhead {
      background: #0c2352;
      color: #fff;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .letterhead-left { display: flex; align-items: center; gap: 12px; }
    .letterhead-text h1 { font-size: 16pt; font-weight: bold; margin-bottom: 2px; }
    .letterhead-text p { font-size: 8pt; opacity: .85; }
    .accent-line { height: 3px; background: #2563eb; }

    .doc-title {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      color: #0c2352;
      margin: 16px 0 4px;
    }
    .divider { border: none; border-top: 1px solid #2563eb; margin: 0 0 14px; }

    .section-title {
      font-size: 11pt;
      font-weight: bold;
      color: #0c2352;
      border-bottom: 1px solid #2563eb;
      padding-bottom: 3px;
      margin: 14px 0 8px;
    }

    table.fields { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    table.fields th {
      text-align: left;
      font-weight: bold;
      color: #0c2352;
      width: 38%;
      padding: 3px 6px 3px 0;
      font-size: 9.5pt;
    }
    table.fields td { padding: 3px 0; font-size: 9.5pt; }

    table.records { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    table.records thead tr { background: #0c2352; color: #fff; }
    table.records thead th { padding: 5px 8px; text-align: left; font-weight: bold; }
    table.records tbody tr:nth-child(even) { background: #f3f6fb; }
    table.records tbody td { padding: 5px 8px; }
    table.records td.empty { color: #888; font-style: italic; }

    .footer {
      margin-top: 20px;
      border-top: 1px solid #0c2352;
      padding-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #555;
    }
    .disclaimer {
      font-size: 7.5pt;
      color: #777;
      font-style: italic;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="letterhead">
    <div class="letterhead-left">
      ${logoHtml}
      <div class="letterhead-text">
        <h1>EquiProfile</h1>
        <p>Professional Equine Management &nbsp;|&nbsp; www.equiprofile.online</p>
      </div>
    </div>
    <div style="font-size:8pt;opacity:.8;">${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
  </div>
  <div class="accent-line"></div>

  <div class="doc-title">Equine Medical Passport</div>
  <hr class="divider" />

  ${horse.passportNumber || horse.feiId || horse.ueln || horse.microchipNumber || horse.registrationNumber ? `
  <div class="section-title">Passport Identification</div>
  <table class="fields">
    ${field("Passport No", horse.passportNumber)}
    ${field("FEI ID", horse.feiId)}
    ${field("UELN", horse.ueln)}
    ${field("Microchip", horse.microchipNumber)}
    ${field("Registration", horse.registrationNumber)}
  </table>` : ""}

  <div class="section-title">Horse Identification (Signalement)</div>
  <table class="fields">
    ${field("Name", horse.name)}
    ${field("Breed", horse.breed)}
    ${field("Colour", horse.color)}
    ${field("Sex", horse.gender)}
    ${horse.dateOfBirth ? field("Date of Birth", new Date(horse.dateOfBirth).toLocaleDateString("en-GB")) : ""}
    ${horse.age ? field("Age", `${horse.age} years`) : ""}
    ${horse.height ? field("Height", typeof horse.height === "number" ? `${horse.height} cm` : String(horse.height)) : ""}
  </table>

  <div class="section-title">Vaccinations (FEI Section V)</div>
  <table class="records">
    <thead><tr><th>Vaccine</th><th>Administered</th><th>Next Due</th></tr></thead>
    <tbody>${vaccRows}</tbody>
  </table>

  <div class="section-title">Deworming History</div>
  <table class="records">
    <thead><tr><th>Product</th><th>Administered</th><th>Next Due</th></tr></thead>
    <tbody>${dewormRows}</tbody>
  </table>

  ${healthRecords.length ? `
  <div class="section-title">Recent Health Records</div>
  <table class="records">
    <thead><tr><th>Title</th><th>Type</th><th>Date</th></tr></thead>
    <tbody>${healthRows}</tbody>
  </table>` : ""}

  <div class="footer">
    <span>EquiProfile — Confidential Equine Passport &nbsp;|&nbsp; EP-${horse.id}</span>
    <span>Generated: ${new Date().toLocaleDateString("en-GB")}</span>
  </div>
  <p class="disclaimer">
    This digital passport is designed to complement, not replace, the official FEI/BEF equine passport.
    Always carry the original passport when travelling or competing.
  </p>
  <script>window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 800); };</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generatePassportPDF(
        {
          horse,
          vaccinations,
          dewormings,
          healthRecords,
          qrCode: qrCodeUrl || undefined,
        },
        `${horse.name.toLowerCase().replace(/\s+/g, "-")}-passport.pdf`,
      );
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${horse.name} Medical Passport`,
          text: `View medical passport for ${horse.name}`,
          url: `${window.location.origin}/passport/${horse.id}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button onClick={handleGenerateQR} variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR Code
        </Button>
        <Button onClick={handlePrintPassport} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleExportPDF} variant="outline" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? "Exporting..." : "Export PDF"}
        </Button>
        {typeof navigator.share !== "undefined" && (
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </div>

      <Card className="medical-passport w-full overflow-hidden">
        <CardHeader className="pb-4">
          {/* Branded Letterhead — visible in print and PDF export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-4 border-b-2 border-[#0c2352]">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="EquiProfile"
                className="h-10 sm:h-12 w-auto object-contain shrink-0"
                crossOrigin="anonymous"
              />
              <div>
                <p className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent">EquiProfile</p>
                <p className="text-xs sm:text-sm text-[#0c2352]/70">Professional Equine Management</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground">www.equiprofile.online</p>
              </div>
            </div>
            {qrCodeUrl && (
              <div className="self-start sm:self-auto shrink-0">
                <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 sm:w-24 sm:h-24" />
              </div>
            )}
          </div>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-2xl">Equine Passport</CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  FEI/BEF Compliant
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{horse.name}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Passport Identification (FEI/BEF Section I) */}
          <section>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0c2352]" />
              Passport Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {horse.passportNumber && (
                <div>
                  <span className="text-muted-foreground">Passport No:</span>
                  <span className="ml-2 font-medium font-mono">
                    {horse.passportNumber}
                  </span>
                </div>
              )}
              {horse.feiId && (
                <div>
                  <span className="text-muted-foreground">FEI ID:</span>
                  <span className="ml-2 font-medium font-mono">
                    {horse.feiId}
                  </span>
                </div>
              )}
              {horse.ueln && (
                <div>
                  <span className="text-muted-foreground">UELN:</span>
                  <span className="ml-2 font-medium font-mono">
                    {horse.ueln}
                  </span>
                </div>
              )}
              {horse.microchipNumber && (
                <div>
                  <span className="text-muted-foreground">Microchip:</span>
                  <span className="ml-2 font-medium font-mono">
                    {horse.microchipNumber}
                  </span>
                </div>
              )}
              {horse.registrationNumber && (
                <div>
                  <span className="text-muted-foreground">Registration:</span>
                  <span className="ml-2 font-medium">
                    {horse.registrationNumber}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Horse Information (FEI/BEF Section II — Signalement) */}
          <section>
            <h3 className="font-semibold text-lg mb-3">
              Horse Identification (Signalement)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <span className="ml-2 font-medium">{horse.name}</span>
              </div>
              {horse.breed && (
                <div>
                  <span className="text-muted-foreground">Breed:</span>
                  <span className="ml-2 font-medium">{horse.breed}</span>
                </div>
              )}
              {horse.color && (
                <div>
                  <span className="text-muted-foreground">Colour:</span>
                  <span className="ml-2 font-medium">{horse.color}</span>
                </div>
              )}
              {horse.gender && (
                <div>
                  <span className="text-muted-foreground">Sex:</span>
                  <span className="ml-2 font-medium">{horse.gender}</span>
                </div>
              )}
              {horse.dateOfBirth && (
                <div>
                  <span className="text-muted-foreground">Date of Birth:</span>
                  <span className="ml-2 font-medium">
                    {new Date(horse.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
              {horse.age && (
                <div>
                  <span className="text-muted-foreground">Age:</span>
                  <span className="ml-2 font-medium">{horse.age} years</span>
                </div>
              )}
              {horse.height && (
                <div>
                  <span className="text-muted-foreground">Height:</span>
                  <span className="ml-2 font-medium">
                    {typeof horse.height === "number"
                      ? `${horse.height} cm`
                      : horse.height}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Vaccinations (FEI/BEF Section V — Influenza & Tetanus) */}
          <section>
            <h3 className="font-semibold text-lg mb-3">
              Vaccinations (FEI Section V)
            </h3>
            {vaccinations.length > 0 ? (
              <div className="space-y-2">
                {vaccinations.map((vacc, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{vacc.vaccineName}</p>
                      <p className="text-sm text-muted-foreground">
                        Administered:{" "}
                        {new Date(vacc.dateAdministered).toLocaleDateString()}
                      </p>
                    </div>
                    {vacc.nextDueDate && (
                      <Badge variant="outline">
                        Due: {new Date(vacc.nextDueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No vaccination records
              </p>
            )}
          </section>

          {/* Deworming */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Deworming History</h3>
            {dewormings.length > 0 ? (
              <div className="space-y-2">
                {dewormings.map((deworm, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{deworm.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        Administered:{" "}
                        {new Date(deworm.dateAdministered).toLocaleDateString()}
                      </p>
                    </div>
                    {deworm.nextDueDate && (
                      <Badge variant="outline">
                        Due: {new Date(deworm.nextDueDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No deworming records
              </p>
            )}
          </section>

          {/* Recent Health Records */}
          {healthRecords.length > 0 && (
            <section>
              <h3 className="font-semibold text-lg mb-3">
                Recent Health Records
              </h3>
              <div className="space-y-2">
                {healthRecords.slice(0, 5).map((record, idx) => (
                  <div key={idx} className="py-2 border-b last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{record.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {record.recordType}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.recordDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer — Compliance Note */}
          <div className="text-xs text-muted-foreground pt-4 border-t-2 border-[#0c2352] space-y-1">
            <div className="flex justify-between items-center">
              <p className="font-medium text-[#0c2352]">EquiProfile — Professional Equine Management</p>
              <p>Generated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <p>
              Document ID: EP-{horse.id}-{Date.now()}
            </p>
            <p className="text-xs italic">
              This digital passport is designed to complement, not replace, the
              official FEI/BEF equine passport. Always carry the original
              passport when travelling or competing.
            </p>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .medical-passport {
            box-shadow: none !important;
            border: 1px solid #000 !important;
          }
        }
      `}</style>

      {/* QR Code Modal — clean popup for mobile scanning */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">QR Code — {horse.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${horse.name}`}
                className="w-56 h-56 sm:w-64 sm:h-64 rounded-lg border p-2 bg-white"
              />
            )}
            <p className="text-sm text-muted-foreground text-center px-4">
              Scan this QR code to view {horse.name}'s passport on any device
            </p>
            <div className="flex gap-2">
              {qrCodeUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = qrCodeUrl;
                    link.download = `${horse.name.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
                    link.click();
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save QR
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
