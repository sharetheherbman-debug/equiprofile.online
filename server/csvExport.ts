/**
 * CSV Export Utilities
 * Provides functions to convert data to CSV format for download
 */

/**
 * Escape CSV field value
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Format date for CSV
 */
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Format datetime for CSV
 */
function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return d.toISOString().replace("T", " ").split(".")[0]; // YYYY-MM-DD HH:mm:ss
}

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers: string[]): string {
  if (data.length === 0) {
    return headers.join(",") + "\n";
  }

  // Header row
  const csvLines = [headers.map(escapeCSV).join(",")];

  // Data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];

      // Handle dates
      if (value instanceof Date) {
        return escapeCSV(formatDateTime(value));
      }

      // Handle objects/arrays (stringify)
      if (typeof value === "object" && value !== null) {
        return escapeCSV(JSON.stringify(value));
      }

      return escapeCSV(value);
    });

    csvLines.push(values.join(","));
  }

  return csvLines.join("\n");
}

/**
 * Generate CSV filename with timestamp
 */
export function generateCSVFilename(prefix: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `${prefix}_${timestamp}.csv`;
}

/**
 * Export horses to CSV
 */
export function exportHorsesCSV(horses: any[]): string {
  const headers = [
    "id",
    "name",
    "breed",
    "age",
    "dateOfBirth",
    "height",
    "weight",
    "color",
    "gender",
    "discipline",
    "level",
    "registrationNumber",
    "microchipNumber",
    "notes",
    "createdAt",
  ];

  const data = horses.map((horse) => ({
    ...horse,
    dateOfBirth: formatDate(horse.dateOfBirth),
    createdAt: formatDateTime(horse.createdAt),
  }));

  return arrayToCSV(data, headers);
}

/**
 * Export health records to CSV
 */
export function exportHealthRecordsCSV(records: any[]): string {
  const headers = [
    "id",
    "horseId",
    "horseName",
    "type",
    "date",
    "dueDate",
    "veterinarian",
    "diagnosis",
    "treatment",
    "medication",
    "cost",
    "notes",
    "createdAt",
  ];

  const data = records.map((record) => ({
    ...record,
    date: formatDate(record.date),
    dueDate: formatDate(record.dueDate),
    createdAt: formatDateTime(record.createdAt),
  }));

  return arrayToCSV(data, headers);
}

/**
 * Export training sessions to CSV
 */
export function exportTrainingSessionsCSV(sessions: any[]): string {
  const headers = [
    "id",
    "horseId",
    "horseName",
    "sessionType",
    "date",
    "duration",
    "exercises",
    "performanceRating",
    "notes",
    "weatherConditions",
    "completedAt",
    "createdAt",
  ];

  const data = sessions.map((session) => ({
    ...session,
    date: formatDate(session.date),
    completedAt: formatDateTime(session.completedAt),
    createdAt: formatDateTime(session.createdAt),
  }));

  return arrayToCSV(data, headers);
}

/**
 * Export competitions to CSV
 */
export function exportCompetitionsCSV(competitions: any[]): string {
  const headers = [
    "id",
    "horseId",
    "horseName",
    "competitionName",
    "date",
    "venue",
    "discipline",
    "level",
    "placement",
    "score",
    "notes",
    "createdAt",
  ];

  const data = competitions.map((comp) => ({
    ...comp,
    date: formatDate(comp.date),
    createdAt: formatDateTime(comp.createdAt),
  }));

  return arrayToCSV(data, headers);
}

/**
 * Export feed costs to CSV
 */
export function exportFeedCostsCSV(costs: any[]): string {
  const headers = [
    "id",
    "horseId",
    "horseName",
    "feedType",
    "brandName",
    "quantity",
    "unit",
    "cost",
    "purchaseDate",
    "supplierName",
    "notes",
    "createdAt",
  ];

  const data = costs.map((cost) => ({
    ...cost,
    purchaseDate: formatDate(cost.purchaseDate),
    createdAt: formatDateTime(cost.createdAt),
  }));

  return arrayToCSV(data, headers);
}

/**
 * Export documents metadata to CSV
 */
export function exportDocumentsCSV(documents: any[]): string {
  const headers = [
    "id",
    "horseId",
    "horseName",
    "fileName",
    "fileSize",
    "fileType",
    "category",
    "description",
    "uploadedAt",
  ];

  const data = documents.map((doc) => ({
    ...doc,
    uploadedAt: formatDateTime(doc.uploadedAt || doc.createdAt),
  }));

  return arrayToCSV(data, headers);
}
