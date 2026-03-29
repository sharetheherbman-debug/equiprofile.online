import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { QrCode, Download, Share2, Printer, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { generateQRCode } from "../lib/utils/qrcode";
import { generatePDFFromHTML } from "../lib/utils/pdf";
import { Badge } from "./ui/badge";

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
    // Secure sharing token — used for QR code URL instead of sequential integer ID
    shareToken?: string;
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
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const passportRef = useRef<HTMLDivElement>(null);

  const handleGenerateQR = async () => {
    // Use shareToken for secure, non-enumerable QR links. Fall back to legacy
    // integer ID only if shareToken is not yet available (pre-migration horses).
    const passportPath = horse.shareToken
      ? `/passport/${horse.shareToken}`
      : `/passport/${horse.id}`;
    const shareUrl = `${window.location.origin}${passportPath}`;
    const qr = await generateQRCode(shareUrl);
    setQrCodeUrl(qr);
  };

  const handlePrintPassport = () => {
    if (passportRef.current) {
      window.print();
    }
  };

  const handleExportPDF = async () => {
    if (passportRef.current) {
      await generatePDFFromHTML(passportRef.current, {
        filename: `${horse.name.toLowerCase().replace(/\s+/g, "-")}-passport.pdf`,
        orientation: "portrait",
      });
    }
  };

  const handleShare = async () => {
    const passportPath = horse.shareToken
      ? `/passport/${horse.shareToken}`
      : `/passport/${horse.id}`;
    const shareUrl = `${window.location.origin}${passportPath}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${horse.name} Medical Passport`,
          text: `View medical passport for ${horse.name}`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.error("Error sharing:", err);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 print:hidden">
        <Button onClick={handleGenerateQR} variant="outline">
          <QrCode className="mr-2 h-4 w-4" />
          Generate QR Code
        </Button>
        <Button onClick={handlePrintPassport} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleExportPDF} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        {typeof navigator.share !== "undefined" && (
          <Button onClick={handleShare} variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </div>

      <Card ref={passportRef} className="medical-passport">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">Equine Passport</CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  FEI/BEF Compliant
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{horse.name}</p>
            </div>
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Passport Identification (FEI/BEF Section I) */}
          <section>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              Passport Identification
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
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
            <div className="grid grid-cols-2 gap-2 text-sm">
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
          <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
            <p>Generated on: {new Date().toLocaleString()}</p>
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
    </div>
  );
}
