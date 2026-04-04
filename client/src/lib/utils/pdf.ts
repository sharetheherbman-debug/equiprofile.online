import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/** Brand color constants for PDF generation */
const BRAND_BLUE_RGB = [15, 46, 107] as const;
const PDF_JPEG_QUALITY = 0.95;

export interface PDFOptions {
  filename?: string;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
}

/**
 * Replaces oklch() CSS custom property values with safe hex/rgb fallbacks so
 * that html2canvas can render the snapshot correctly.  The oklch() color space
 * is not supported by the canvas 2D drawing model used internally by
 * html2canvas, which causes the PDF to render with blank/black areas.
 */
function injectPdfSafeStyles(doc: Document): void {
  const style = doc.createElement("style");
  style.textContent = `
    :root, * {
      --background: #f7f8fc !important;
      --foreground: #1a1a1a !important;
      --card: #ffffff !important;
      --card-foreground: #1a1a1a !important;
      --popover: #ffffff !important;
      --popover-foreground: #1a1a1a !important;
      --primary: #2563eb !important;
      --primary-foreground: #ffffff !important;
      --secondary: #f1f5f9 !important;
      --secondary-foreground: #1a1a1a !important;
      --muted: #e2e8f0 !important;
      --muted-foreground: #64748b !important;
      --accent: #0d9488 !important;
      --accent-foreground: #ffffff !important;
      --destructive: #dc2626 !important;
      --destructive-foreground: #ffffff !important;
      --border: #cbd5e1 !important;
      --input: #e2e8f0 !important;
      --ring: #2563eb !important;
      --sidebar: #1e293b !important;
      --sidebar-foreground: #e2e8f0 !important;
      --sidebar-accent: #334155 !important;
      --sidebar-accent-foreground: #f1f5f9 !important;
      --sidebar-border: #334155 !important;
      --sidebar-ring: #2563eb !important;
      --sidebar-primary: #2563eb !important;
      --sidebar-primary-foreground: #ffffff !important;
      --chart-1: #2563eb !important;
      --chart-2: #7c3aed !important;
      --chart-3: #0d9488 !important;
      --chart-4: #16a34a !important;
      --chart-5: #d97706 !important;
    }
    body, html {
      background: #ffffff !important;
      color: #1a1a1a !important;
    }
  `;
  doc.head.appendChild(style);
}

export async function generatePDFFromHTML(
  element: HTMLElement,
  options: PDFOptions = {},
): Promise<void> {
  const {
    filename = "document.pdf",
    orientation = "portrait",
    format = "a4",
  } = options;

  try {
    // Clone element for rendering to avoid modifying the DOM
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = `${element.scrollWidth}px`;
    document.body.appendChild(clone);

    try {
      // Convert HTML to canvas, sanitising oklch colours that html2canvas cannot render
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (documentClone: Document) => {
          injectPdfSafeStyles(documentClone);
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", PDF_JPEG_QUALITY);
      const imgWidth = format === "a4" ? 210 : 216; // A4 or Letter width in mm
      const pageHeight = format === "a4" ? 297 : 279; // A4 or Letter height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF
      const pdf = new jsPDF({
        orientation,
        unit: "mm",
        format,
      });

      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF (handle multiple pages if needed)
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = -(imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save(filename);
    } finally {
      document.body.removeChild(clone);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

export async function generatePDFFromData(
  data: any,
  template: "medical-passport" | "report" | "invoice",
  options: PDFOptions = {},
): Promise<void> {
  const {
    filename = "document.pdf",
    orientation = "portrait",
    format = "a4",
  } = options;

  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format,
  });

  // Add content based on template
  switch (template) {
    case "medical-passport":
      generateMedicalPassportPDF(pdf, data);
      break;
    case "report":
      generateReportPDF(pdf, data);
      break;
    case "invoice":
      generateInvoicePDF(pdf, data);
      break;
  }

  pdf.save(filename);
}

function generateMedicalPassportPDF(pdf: jsPDF, data: any) {
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Professional letterhead
  pdf.setFillColor(...BRAND_BLUE_RGB);
  pdf.rect(0, 0, pageWidth, 32, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("EquiProfile", 14, 15);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Professional Equine Management  |  equiprofile.online", 14, 23);

  // Title
  pdf.setTextColor(...BRAND_BLUE_RGB);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Equine Medical Passport", 105, 45, { align: "center" });

  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.5);
  pdf.line(14, 50, pageWidth - 14, 50);

  pdf.setTextColor(20, 20, 20);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  let yPos = 62;
  pdf.text(`Horse: ${data.horseName || "N/A"}`, 20, yPos); yPos += 10;
  pdf.text(`Breed: ${data.breed || "N/A"}`, 20, yPos); yPos += 10;
  pdf.text(`Age: ${data.age || "N/A"}`, 20, yPos); yPos += 14;

  if (data.vaccinations && data.vaccinations.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...BRAND_BLUE_RGB);
    pdf.text("Vaccinations", 20, yPos);
    yPos += 10;

    pdf.setTextColor(20, 20, 20);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    data.vaccinations.forEach((vacc: any) => {
      pdf.text(`• ${vacc.name} — ${vacc.date}`, 25, yPos);
      yPos += 7;
    });
  }

  // QR code if available
  if (data.qrCode) {
    pdf.addImage(data.qrCode, "PNG", 155, 36, 40, 40);
  }

  // Footer
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.3);
  pdf.line(14, pageH - 14, pageWidth - 14, pageH - 14);
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text("EquiProfile — Confidential Equine Passport", 14, pageH - 9);
  pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - 14, pageH - 9, { align: "right" });
}

function generateReportPDF(pdf: jsPDF, data: any) {
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Professional letterhead
  pdf.setFillColor(...BRAND_BLUE_RGB);
  pdf.rect(0, 0, pageWidth, 32, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("EquiProfile", 14, 15);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Professional Equine Management  |  equiprofile.online", 14, 23);

  // Title
  pdf.setTextColor(...BRAND_BLUE_RGB);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.title || "Report", 105, 45, { align: "center" });

  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.5);
  pdf.line(14, 50, pageWidth - 14, 50);

  pdf.setTextColor(20, 20, 20);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  let yPos = 60;

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "title") {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${key}:`, 20, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.text(String(value), 80, yPos);
      yPos += 8;
    }
  });

  // Footer
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.3);
  pdf.line(14, pageH - 14, pageWidth - 14, pageH - 14);
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text("EquiProfile — Confidential Report", 14, pageH - 9);
  pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - 14, pageH - 9, { align: "right" });
}

function generateInvoicePDF(pdf: jsPDF, data: any) {
  const pageWidth = pdf.internal.pageSize.getWidth();

  // Professional letterhead
  pdf.setFillColor(...BRAND_BLUE_RGB);
  pdf.rect(0, 0, pageWidth, 32, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("EquiProfile", 14, 15);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Professional Equine Management  |  equiprofile.online", 14, 23);

  // Title
  pdf.setTextColor(...BRAND_BLUE_RGB);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Invoice", 105, 45, { align: "center" });

  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.5);
  pdf.line(14, 50, pageWidth - 14, 50);

  pdf.setTextColor(20, 20, 20);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Invoice #: ${data.invoiceNumber || "N/A"}`, 20, 60);
  pdf.text(`Date: ${data.date || "N/A"}`, 20, 70);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(`Total: £${data.total || "0.00"}`, 20, 84);

  // Footer
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.3);
  pdf.line(14, pageH - 14, pageWidth - 14, pageH - 14);
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text("EquiProfile — Confidential Invoice", 14, pageH - 9);
  pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - 14, pageH - 9, { align: "right" });
}

export async function generateBlobFromPDF(pdf: jsPDF): Promise<Blob> {
  return pdf.output("blob");
}
