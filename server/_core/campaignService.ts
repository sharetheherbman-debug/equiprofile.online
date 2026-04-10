/**
 * Campaign Service — Phase 3
 *
 * Centralized campaign logic for:
 * - Lead import (CSV/XLSX) with validation + dedup
 * - Country/type segmentation
 * - Daily send limit enforcement (50/day default)
 * - Follow-up sequence scheduling
 * - Country normalization
 */

// ─── Country normalization ───────────────────────────────────
const COUNTRY_ALIASES: Record<string, string> = {
  uk: "UK",
  "united kingdom": "UK",
  "great britain": "UK",
  gb: "UK",
  england: "UK",
  scotland: "UK",
  wales: "UK",
  "northern ireland": "UK",
  ireland: "Ireland",
  ie: "Ireland",
  eire: "Ireland",
  "republic of ireland": "Ireland",
  roi: "Ireland",
  usa: "USA",
  "united states": "USA",
  "united states of america": "USA",
  us: "USA",
  america: "USA",
  france: "France",
  fr: "France",
  germany: "Germany",
  de: "Germany",
  spain: "Spain",
  es: "Spain",
  italy: "Italy",
  it: "Italy",
  australia: "Australia",
  au: "Australia",
  canada: "Canada",
  ca: "Canada",
  "new zealand": "New Zealand",
  nz: "New Zealand",
  netherlands: "Netherlands",
  nl: "Netherlands",
  belgium: "Belgium",
  be: "Belgium",
  sweden: "Sweden",
  se: "Sweden",
  norway: "Norway",
  no: "Norway",
  denmark: "Denmark",
  dk: "Denmark",
  portugal: "Portugal",
  pt: "Portugal",
  "south africa": "South Africa",
  za: "South Africa",
  uae: "UAE",
  "united arab emirates": "UAE",
};

export function normalizeCountry(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const key = raw.trim().toLowerCase();
  return COUNTRY_ALIASES[key] || raw.trim();
}

// ─── Contact type normalization ──────────────────────────────
const TYPE_ALIASES: Record<string, string> = {
  school: "school",
  "riding school": "school",
  "riding_school": "school",
  college: "college",
  academy: "academy",
  "riding academy": "academy",
  stable: "stable",
  stables: "stable",
  yard: "stable",
  "livery yard": "stable",
  venue: "venue",
  "equestrian centre": "venue",
  "equestrian center": "venue",
  federation: "federation",
  governance: "governance",
  "governing body": "governance",
  "health/vet": "health_vet",
  vet: "health_vet",
  veterinary: "health_vet",
  "elite/luxury": "elite_luxury",
  elite: "elite_luxury",
  luxury: "elite_luxury",
  racing: "racing",
  breeding: "breeding",
  breeder: "breeding",
  individual: "individual",
  personal: "individual",
};

export function normalizeContactType(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "individual";
  const key = raw.trim().toLowerCase();
  return TYPE_ALIASES[key] || raw.trim().toLowerCase().replace(/\s+/g, "_");
}

// ─── Email validation ────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 320) return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

// ─── CSV parsing ─────────────────────────────────────────────
export function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] || "").trim();
    }
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// ─── Column mapping ──────────────────────────────────────────
const COLUMN_MAP: Record<string, string> = {
  email: "email",
  "email address": "email",
  "e-mail": "email",
  "email_address": "email",
  name: "name",
  "contact name": "name",
  "full name": "name",
  "organization name": "organizationName",
  "organisation name": "organizationName",
  organization: "organizationName",
  organisation: "organizationName",
  "org name": "organizationName",
  "business name": "businessName",
  business: "businessName",
  company: "businessName",
  type: "contactType",
  "contact type": "contactType",
  category: "contactType",
  country: "country",
  region: "region",
  area: "region",
  county: "region",
  state: "region",
  province: "region",
  "lead focus": "leadFocus",
  focus: "leadFocus",
  interest: "leadFocus",
  tags: "tags",
  tag: "tags",
};

export function autoMapColumns(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const header of headers) {
    const key = header.trim().toLowerCase();
    if (COLUMN_MAP[key]) {
      mapping[header] = COLUMN_MAP[key];
    }
  }
  return mapping;
}

export interface ImportedRow {
  email: string;
  name?: string;
  organizationName?: string;
  businessName?: string;
  contactType?: string;
  country?: string;
  region?: string;
  leadFocus?: string;
  tags?: string;
}

export function mapRowToContact(
  row: Record<string, string>,
  columnMapping: Record<string, string>,
): ImportedRow | null {
  const mapped: Record<string, string> = {};
  for (const [header, value] of Object.entries(row)) {
    const field = columnMapping[header];
    if (field && value) {
      mapped[field] = value;
    }
  }

  if (!mapped.email || !isValidEmail(mapped.email)) return null;

  return {
    email: mapped.email.trim().toLowerCase(),
    name: mapped.name || undefined,
    organizationName: mapped.organizationName || undefined,
    businessName: mapped.businessName || mapped.organizationName || undefined,
    contactType: mapped.contactType ? normalizeContactType(mapped.contactType) : undefined,
    country: mapped.country ? normalizeCountry(mapped.country) ?? undefined : undefined,
    region: mapped.region || undefined,
    leadFocus: mapped.leadFocus || undefined,
    tags: mapped.tags || undefined,
  };
}

// ─── Daily limit helpers ─────────────────────────────────────
export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export const DEFAULT_DAILY_LIMIT = 50;

// ─── Follow-up schedule (default) ────────────────────────────
export const DEFAULT_FOLLOWUP_SCHEDULE = [
  { stepNumber: 1, delayDays: 0, label: "Initial Send" },
  { stepNumber: 2, delayDays: 3, label: "Follow-up 1" },
  { stepNumber: 3, delayDays: 7, label: "Follow-up 2" },
  { stepNumber: 4, delayDays: 14, label: "Follow-up 3 (Final)" },
];

export function getScheduledDate(initialDate: Date, delayDays: number): string {
  const d = new Date(initialDate);
  d.setDate(d.getDate() + delayDays);
  return d.toISOString().split("T")[0];
}

// ─── Segment key builder ─────────────────────────────────────
export function buildSegmentKey(country?: string | null, type?: string | null): string {
  const parts: string[] = [];
  if (country) parts.push(country.replace(/\s+/g, "_"));
  if (type) parts.push(type);
  return parts.join("_") || "all";
}

// ─── Priority countries ──────────────────────────────────────
export const PRIORITY_COUNTRIES = ["UK", "Ireland", "USA"] as const;
export type PriorityCountry = (typeof PRIORITY_COUNTRIES)[number];
