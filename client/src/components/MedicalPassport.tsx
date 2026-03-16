import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { QrCode, Download, Share2, Printer } from "lucide-react";
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
    const shareUrl = `${window.location.origin}/share/medical/${horse.id}`;
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
        filename: `medical-passport-${horse.name.replace(/\s+/g, "-")}.pdf`,
        orientation: "portrait",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${horse.name} Medical Passport`,
          text: `View medical passport for ${horse.name}`,
          url: `${window.location.origin}/share/medical/${horse.id}`,
        });
      } catch (err) {
        console.error("Error sharing:", err);
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
              <CardTitle className="text-2xl">Medical Passport</CardTitle>
              <p className="text-muted-foreground mt-1">{horse.name}</p>
            </div>
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Horse Information */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Horse Information</h3>
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
              {horse.age && (
                <div>
                  <span className="text-muted-foreground">Age:</span>
                  <span className="ml-2 font-medium">{horse.age} years</span>
                </div>
              )}
              {horse.microchipNumber && (
                <div>
                  <span className="text-muted-foreground">Microchip:</span>
                  <span className="ml-2 font-medium">
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

          {/* Vaccinations */}
          <section>
            <h3 className="font-semibold text-lg mb-3">Vaccinations</h3>
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

          {/* Footer */}
          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>Generated on: {new Date().toLocaleString()}</p>
            <p>
              Document ID: MP-{horse.id}-{Date.now()}
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
