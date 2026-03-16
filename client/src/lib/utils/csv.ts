export interface CSVExportOptions {
  filename?: string;
  headers?: string[];
  delimiter?: string;
}

export function exportToCSV(data: any[], options: CSVExportOptions = {}): void {
  const { filename = "export.csv", headers, delimiter = "," } = options;

  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Extract headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Headers row
    csvHeaders.map((header) => escapeCSVValue(header)).join(delimiter),
    // Data rows
    ...data.map((row) =>
      csvHeaders.map((header) => escapeCSVValue(row[header])).join(delimiter),
    ),
  ].join("\n");

  // Create blob and download
  downloadCSV(csvContent, filename);
}

export function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Escape quotes and wrap in quotes if contains delimiter, newline, or quote
  if (
    stringValue.includes(",") ||
    stringValue.includes("\n") ||
    stringValue.includes('"')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function exportHorsesToCSV(horses: any[]): void {
  const headers = [
    "ID",
    "Name",
    "Breed",
    "Age",
    "Gender",
    "Color",
    "Height",
    "Weight",
    "Discipline",
    "Level",
    "Registration Number",
    "Microchip Number",
    "Created At",
  ];

  const data = horses.map((horse) => ({
    ID: horse.id,
    Name: horse.name,
    Breed: horse.breed,
    Age: horse.age,
    Gender: horse.gender,
    Color: horse.color,
    Height: horse.height,
    Weight: horse.weight,
    Discipline: horse.discipline,
    Level: horse.level,
    "Registration Number": horse.registrationNumber,
    "Microchip Number": horse.microchipNumber,
    "Created At": horse.createdAt,
  }));

  exportToCSV(data, {
    filename: `horses_export_${new Date().toISOString().split("T")[0]}.csv`,
    headers,
  });
}

export function exportHealthRecordsToCSV(records: any[]): void {
  const headers = [
    "ID",
    "Horse ID",
    "Record Type",
    "Title",
    "Date",
    "Next Due Date",
    "Vet Name",
    "Cost",
    "Notes",
  ];

  const data = records.map((record) => ({
    ID: record.id,
    "Horse ID": record.horseId,
    "Record Type": record.recordType,
    Title: record.title,
    Date: record.recordDate,
    "Next Due Date": record.nextDueDate,
    "Vet Name": record.vetName,
    Cost: record.cost ? (record.cost / 100).toFixed(2) : "",
    Notes: record.notes,
  }));

  exportToCSV(data, {
    filename: `health_records_export_${new Date().toISOString().split("T")[0]}.csv`,
    headers,
  });
}

export function exportTrainingSessionsToCSV(sessions: any[]): void {
  const headers = [
    "ID",
    "Horse ID",
    "Date",
    "Type",
    "Duration",
    "Trainer",
    "Performance",
    "Weather",
    "Completed",
    "Notes",
  ];

  const data = sessions.map((session) => ({
    ID: session.id,
    "Horse ID": session.horseId,
    Date: session.sessionDate,
    Type: session.sessionType,
    Duration: session.duration,
    Trainer: session.trainer,
    Performance: session.performance,
    Weather: session.weather,
    Completed: session.isCompleted ? "Yes" : "No",
    Notes: session.notes,
  }));

  exportToCSV(data, {
    filename: `training_sessions_export_${new Date().toISOString().split("T")[0]}.csv`,
    headers,
  });
}

export function importCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const csvContent = event.target?.result as string;
        const lines = csvContent.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const data = lines
          .slice(1)
          .filter((line) => line.trim())
          .map((line) => {
            const values = line
              .split(",")
              .map((v) => v.trim().replace(/^"|"$/g, ""));
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index];
            });
            return obj;
          });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
