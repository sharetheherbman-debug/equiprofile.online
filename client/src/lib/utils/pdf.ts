import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/** Brand color constants for PDF generation — premium dark navy */
const BRAND_BLUE_RGB = [12, 35, 82] as const;
const BRAND_ACCENT_RGB = [37, 99, 235] as const;
const PDF_JPEG_QUALITY = 0.95;

export interface PDFOptions {
  filename?: string;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
}

/**
 * Safe CSS variable overrides for PDF export.
 * All oklch() values are replaced with plain hex colours that
 * html2canvas can render without errors.
 */
const PDF_SAFE_CSS = `
  :root, *, .dark {
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

/** Unique marker so we can clean up the live-document injection after export. */
const PDF_SAFE_STYLE_ID = "__equi-pdf-safe__";

/**
 * Replaces oklch() CSS values throughout the cloned document so that
 * html2canvas can render the snapshot correctly.  The oklch() color space
 * is not supported by the canvas 2D drawing model used internally by
 * html2canvas, which causes "unsupported color function" errors and
 * blank/black areas in the generated PDF.
 *
 * This function:
 *  1. Overrides all CSS custom properties with safe hex/rgb values
 *  2. Sanitises every <style> element, replacing oklch() with hex fallbacks
 *  3. Strips oklch() from inline styles on all elements
 */
function injectPdfSafeStyles(doc: Document): void {
  // 1 ─ Override CSS custom properties with safe values
  const style = doc.createElement("style");
  style.textContent = PDF_SAFE_CSS;
  doc.head.appendChild(style);

  // 2 ─ Walk every <style> element in the clone and replace oklch() values
  //     with a generic safe fallback. This catches direct oklch() usage in
  //     gradients, box-shadows, and animations that CSS variable overrides
  //     cannot reach.
  //     Use a fresh regex literal per call — reusing a /g regex across
  //     multiple .test() + .replace() calls causes lastIndex to advance
  //     unpredictably and can silently miss matches.
  const fallbackColor = "#2563eb"; // safe blue fallback
  doc.querySelectorAll("style").forEach((el) => {
    if (el.textContent) {
      el.textContent = el.textContent.replace(/oklch\([^)]*\)/gi, fallbackColor);
    }
  });

  // 3 ─ Strip oklch() from inline styles on all elements
  doc.querySelectorAll("[style]").forEach((el) => {
    const s = el.getAttribute("style");
    if (s) {
      el.setAttribute("style", s.replace(/oklch\([^)]*\)/gi, fallbackColor));
    }
  });
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

  // ── Pre-inject safe CSS into the LIVE document ───────────────────────────
  // html2canvas copies stylesheets from the live document when it builds its
  // internal clone.  Injecting our safe overrides here (before html2canvas
  // runs) guarantees that the cloned document inherits safe, non-oklch values
  // for every CSS custom property — even from compiled stylesheet bundles that
  // are copied after the onclone callback fires.
  let liveOverrideStyle: HTMLStyleElement | null = null;
  if (!document.getElementById(PDF_SAFE_STYLE_ID)) {
    liveOverrideStyle = document.createElement("style");
    liveOverrideStyle.id = PDF_SAFE_STYLE_ID;
    liveOverrideStyle.textContent = PDF_SAFE_CSS;
    document.head.appendChild(liveOverrideStyle);
  }

  try {
    // Clone element for rendering to avoid modifying the DOM
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    // Use a fixed width for consistent rendering, matching A4 proportions
    const renderWidth = Math.max(element.scrollWidth, element.offsetWidth, 800);
    clone.style.width = `${renderWidth}px`;
    clone.style.minHeight = "auto";
    clone.style.overflow = "visible";
    document.body.appendChild(clone);

    try {
      // Convert HTML to canvas, sanitising oklch colours that html2canvas cannot render
      const canvas = await html2canvas(clone, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: renderWidth,
        height: clone.scrollHeight,
        onclone: (documentClone: Document) => {
          // Belt-and-suspenders: also sanitise the internal clone
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
  } finally {
    // Always remove the live-document override so it does not affect normal page rendering
    if (liveOverrideStyle) {
      liveOverrideStyle.remove();
    }
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
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 16;

  // Premium letterhead — elegant dark header bar
  pdf.setFillColor(...BRAND_BLUE_RGB);
  pdf.rect(0, 0, pageWidth, 36, "F");

  // Thin accent line below header
  pdf.setFillColor(...BRAND_ACCENT_RGB);
  pdf.rect(0, 36, pageWidth, 1.5, "F");

  // Header text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text("EquiProfile", margin, 16);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Professional Equine Management", margin, 24);
  pdf.setFontSize(8);
  pdf.text("www.equiprofile.online", margin, 30);

  // Date aligned right in header
  pdf.setFontSize(8);
  pdf.text(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), pageWidth - margin, 30, { align: "right" });

  // Document title
  pdf.setTextColor(...BRAND_BLUE_RGB);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Equine Medical Passport", pageWidth / 2, 50, { align: "center" });

  // Decorative divider
  pdf.setDrawColor(...BRAND_ACCENT_RGB);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 55, pageWidth - margin, 55);

  // Horse details
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  let yPos = 68;

  const addField = (label: string, value: string) => {
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...BRAND_BLUE_RGB);
    pdf.text(label, margin + 4, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(40, 40, 40);
    pdf.text(value, 70, yPos);
    yPos += 9;
  };

  addField("Horse:", data.horseName || "N/A");
  addField("Breed:", data.breed || "N/A");
  addField("Age:", data.age ? `${data.age} years` : "N/A");
  yPos += 6;

  if (data.vaccinations && data.vaccinations.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...BRAND_BLUE_RGB);
    pdf.text("Vaccination Record", margin + 4, yPos);
    yPos += 3;

    // Table header line
    pdf.setDrawColor(...BRAND_ACCENT_RGB);
    pdf.setLineWidth(0.3);
    pdf.line(margin + 4, yPos, pageWidth - margin, yPos);
    yPos += 7;

    pdf.setTextColor(40, 40, 40);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    data.vaccinations.forEach((vacc: any) => {
      pdf.text(`•  ${vacc.name} — ${vacc.date}`, margin + 8, yPos);
      yPos += 7;
    });
  }

  // QR code if available — positioned top right with proper spacing
  if (data.qrCode) {
    pdf.addImage(data.qrCode, "PNG", pageWidth - margin - 36, 44, 36, 36);
  }

  // Footer
  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.4);
  pdf.line(margin, pageH - 18, pageWidth - margin, pageH - 18);
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 100, 100);
  pdf.text("EquiProfile — Confidential Equine Passport", margin, pageH - 12);
  pdf.text(`Page 1`, pageWidth / 2, pageH - 12, { align: "center" });
  pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - margin, pageH - 12, { align: "right" });
}

function generateReportPDF(pdf: jsPDF, data: any) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 16;

  // Premium letterhead
  pdf.setFillColor(...BRAND_BLUE_RGB);
  pdf.rect(0, 0, pageWidth, 36, "F");
  pdf.setFillColor(...BRAND_ACCENT_RGB);
  pdf.rect(0, 36, pageWidth, 1.5, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text("EquiProfile", margin, 16);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Professional Equine Management", margin, 24);
  pdf.setFontSize(8);
  pdf.text("www.equiprofile.online", margin, 30);

  // Title
  pdf.setTextColor(...BRAND_BLUE_RGB);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.title || "Report", pageWidth / 2, 50, { align: "center" });

  pdf.setDrawColor(...BRAND_ACCENT_RGB);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 55, pageWidth - margin, 55);

  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  let yPos = 66;

  Object.entries(data).forEach(([key, value]) => {
    if (key !== "title") {
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...BRAND_BLUE_RGB);
      pdf.text(`${key}:`, margin + 4, yPos);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(40, 40, 40);
      pdf.text(String(value), 80, yPos);
      yPos += 9;
    }
  });

  // Footer
  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.4);
  pdf.line(margin, pageH - 18, pageWidth - margin, pageH - 18);
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 100, 100);
  pdf.text("EquiProfile — Confidential Report", margin, pageH - 12);
  pdf.text(`Page 1`, pageWidth / 2, pageH - 12, { align: "center" });
  pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - margin, pageH - 12, { align: "right" });
}

function generateInvoicePDF(pdf: jsPDF, data: any) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 16;

  // Premium letterhead
  pdf.setFillColor(...BRAND_BLUE_RGB);
  pdf.rect(0, 0, pageWidth, 36, "F");
  pdf.setFillColor(...BRAND_ACCENT_RGB);
  pdf.rect(0, 36, pageWidth, 1.5, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.text("EquiProfile", margin, 16);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Professional Equine Management", margin, 24);
  pdf.setFontSize(8);
  pdf.text("www.equiprofile.online", margin, 30);

  // Title
  pdf.setTextColor(...BRAND_BLUE_RGB);
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("Invoice", pageWidth / 2, 50, { align: "center" });

  pdf.setDrawColor(...BRAND_ACCENT_RGB);
  pdf.setLineWidth(0.5);
  pdf.line(margin, 55, pageWidth - margin, 55);

  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Invoice #: ${data.invoiceNumber || "N/A"}`, margin + 4, 66);
  pdf.text(`Date: ${data.date || "N/A"}`, margin + 4, 76);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...BRAND_BLUE_RGB);
  pdf.text(`Total: £${data.total || "0.00"}`, margin + 4, 90);

  // Footer
  pdf.setDrawColor(...BRAND_BLUE_RGB);
  pdf.setLineWidth(0.4);
  pdf.line(margin, pageH - 18, pageWidth - margin, pageH - 18);
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 100, 100);
  pdf.text("EquiProfile — Confidential Invoice", margin, pageH - 12);
  pdf.text(`Page 1`, pageWidth / 2, pageH - 12, { align: "center" });
  pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, pageWidth - margin, pageH - 12, { align: "right" });
}

export async function generateBlobFromPDF(pdf: jsPDF): Promise<Blob> {
  return pdf.output("blob");
}
