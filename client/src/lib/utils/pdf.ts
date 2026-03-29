import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
    // Convert HTML to canvas, sanitising oklch colours that html2canvas cannot render
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
      backgroundColor: "#ffffff",
      onclone: (documentClone: Document) => {
        injectPdfSafeStyles(documentClone);
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = format === "a4" ? 210 : 216; // A4 or Letter width in mm
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
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    // Save PDF
    pdf.save(filename);
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
  pdf.setFontSize(20);
  pdf.text("Medical Passport", 105, 20, { align: "center" });

  pdf.setFontSize(12);
  pdf.text(`Horse: ${data.horseName || "N/A"}`, 20, 40);
  pdf.text(`Breed: ${data.breed || "N/A"}`, 20, 50);
  pdf.text(`Age: ${data.age || "N/A"}`, 20, 60);

  // Add more details as needed
  let yPos = 80;

  if (data.vaccinations && data.vaccinations.length > 0) {
    pdf.setFontSize(14);
    pdf.text("Vaccinations", 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    data.vaccinations.forEach((vacc: any) => {
      pdf.text(`• ${vacc.name} - ${vacc.date}`, 25, yPos);
      yPos += 7;
    });
  }

  // Add QR code if available
  if (data.qrCode) {
    pdf.addImage(data.qrCode, "PNG", 160, 20, 40, 40);
  }
}

function generateReportPDF(pdf: jsPDF, data: any) {
  pdf.setFontSize(20);
  pdf.text(data.title || "Report", 105, 20, { align: "center" });

  pdf.setFontSize(12);
  let yPos = 40;

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "title") {
      pdf.text(`${key}: ${value}`, 20, yPos);
      yPos += 10;
    }
  });
}

function generateInvoicePDF(pdf: jsPDF, data: any) {
  pdf.setFontSize(20);
  pdf.text("Invoice", 105, 20, { align: "center" });

  pdf.setFontSize(12);
  pdf.text(`Invoice #: ${data.invoiceNumber || "N/A"}`, 20, 40);
  pdf.text(`Date: ${data.date || "N/A"}`, 20, 50);
  pdf.text(`Total: $${data.total || "0.00"}`, 20, 60);
}

export async function generateBlobFromPDF(pdf: jsPDF): Promise<Blob> {
  return pdf.output("blob");
}
