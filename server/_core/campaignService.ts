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
  // ── Student / Education segment ──────────────────────────────
  student: "student",
  pupil: "student",
  learner: "student",
  "riding student": "student",
  // ── Teacher / Instructor segment ─────────────────────────────
  teacher: "teacher",
  instructor: "teacher",
  coach: "teacher",
  "riding instructor": "teacher",
  "riding teacher": "teacher",
  "riding coach": "teacher",
  trainer: "teacher",
  "equestrian coach": "teacher",
  "equestrian instructor": "teacher",
};

export function normalizeContactType(raw: string | null | undefined): string {
  if (!raw || !raw.trim()) return "individual";
  const key = raw.trim().toLowerCase();
  return TYPE_ALIASES[key] || raw.trim().toLowerCase().replace(/\s+/g, "_");
}

// ─── Email validation ────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 320) return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

// ─── Free-mail domain filtering (for B2B compliance) ─────────
const FREE_MAIL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "yahoo.co.uk", "outlook.com", "hotmail.com",
  "hotmail.co.uk", "aol.com", "gmx.com", "icloud.com", "mail.com",
  "live.com", "live.co.uk", "msn.com", "me.com", "protonmail.com",
  "proton.me", "ymail.com", "rocketmail.com", "zoho.com",
]);

const DISPOSABLE_MAIL_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "guerrillamail.com", "throwaway.email",
  "10minutemail.com", "trashmail.com", "fakeinbox.com", "sharklasers.com",
  "guerrillamailblock.com", "grr.la", "dispostable.com", "yopmail.com",
]);

export function isFreeMailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return FREE_MAIL_DOMAINS.has(domain || "");
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return DISPOSABLE_MAIL_DOMAINS.has(domain || "");
}

// B2B contact types that should NOT use free-mail addresses
const B2B_CONTACT_TYPES = new Set([
  "riding_school", "stable", "school", "college", "academy",
  "venue", "federation", "governance", "health_vet", "racing", "breeding",
]);

export interface ComplianceResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate a marketing contact for legal compliance.
 * Rejects contacts that do not meet campaign lawful-basis rules.
 */
export function validateContactCompliance(
  email: string,
  contactType: string,
): ComplianceResult {
  // 1. Invalid email format
  if (!isValidEmail(email)) {
    return { valid: false, reason: "invalid_email_format" };
  }
  // 2. Disposable email
  if (isDisposableEmail(email)) {
    return { valid: false, reason: "disposable_email_domain" };
  }
  // 3. B2B contacts must NOT use free-mail addresses (PECR / GDPR B2B legitimate interest)
  const normalizedType = normalizeContactType(contactType);
  if (B2B_CONTACT_TYPES.has(normalizedType) && isFreeMailDomain(email)) {
    return { valid: false, reason: "b2b_freemail_rejected" };
  }
  return { valid: true };
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
  role: "contactType",
  "role type": "contactType",
  roletype: "contactType",
  role_type: "contactType",
  segment: "contactType",
  audience: "contactType",
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

// ─── Campaign sending policy ─────────────────────────────────
/**
 * Single-mailbox hard daily cap across ALL send types (new outreach + follow-ups).
 * This is the absolute ceiling for the sending mailbox per calendar day.
 */
export const TOTAL_MAILBOX_DAILY_CAP = 40;

/**
 * Maximum new outreach emails per day across all campaigns combined.
 * Follow-ups may use remaining capacity: TOTAL_MAILBOX_DAILY_CAP - new outreach sent today.
 */
export const NEW_OUTREACH_DAILY_CAP = 25;

/**
 * Maximum new outreach sends per single trigger (stagger window bucket).
 * With five natural send windows per day and a 25-email cap, each trigger
 * sends ≤ 5 emails. This distributes sends through the day without
 * requiring a background scheduler.
 */
export const NEW_OUTREACH_PER_WINDOW = 5;

/**
 * Default per-campaign daily limit used at campaign creation.
 * Set to NEW_OUTREACH_DAILY_CAP for single-mailbox safety.
 */
export const DEFAULT_DAILY_LIMIT = 25;

/** Backwards-compat alias — now equal to NEW_OUTREACH_DAILY_CAP. */
export const MANAGEMENT_DAILY_LIMIT = 25;
/** Retained for backwards-compat. Academy campaign daily limit. */
export const ACADEMY_DAILY_LIMIT = 15;

/** UTC hour range for campaign sends: 08:00–17:59 UTC. */
export const SEND_HOURS_UTC = { start: 8, end: 18 } as const;

/**
 * Returns true if the given date (defaults to now) is a weekday (Mon–Fri).
 * Used to enforce weekday-only campaign sending policy.
 */
export function isWeekday(date?: Date): boolean {
  const day = (date ?? new Date()).getDay(); // 0=Sun, 6=Sat
  return day >= 1 && day <= 5;
}

/**
 * Returns true if the current UTC time is within the permitted send window
 * (08:00–17:59 UTC). Prevents off-hours blasts that hurt deliverability.
 */
export function isWithinSendHours(date?: Date): boolean {
  const h = (date ?? new Date()).getUTCHours();
  return h >= SEND_HOURS_UTC.start && h < SEND_HOURS_UTC.end;
}

// ─── Follow-up schedule (default) ────────────────────────────
export const DEFAULT_FOLLOWUP_SCHEDULE = [
  { stepNumber: 1, delayDays: 0, label: "Initial Send" },
  { stepNumber: 2, delayDays: 3, label: "Follow-up 1 (Day 3)" },
  { stepNumber: 3, delayDays: 6, label: "Follow-up 2 (Day 6)" },
  { stepNumber: 4, delayDays: 10, label: "Final Nudge (Day 10)" },
];

/**
 * Staggered send windows for new outreach — UTC.
 * Five windows per weekday, each allowing up to NEW_OUTREACH_PER_WINDOW sends.
 * Total across all windows: 5 × 5 = 25 = NEW_OUTREACH_DAILY_CAP.
 */
export const SEND_WINDOWS: Array<{ hour: number; minute: number; label: string }> = [
  { hour: 8, minute: 30, label: "08:30 UTC" },
  { hour: 10, minute: 30, label: "10:30 UTC" },
  { hour: 12, minute: 30, label: "12:30 UTC" },
  { hour: 14, minute: 30, label: "14:30 UTC" },
  { hour: 16, minute: 30, label: "16:30 UTC" },
];

/**
 * Returns the next upcoming send window label for today (UTC), or null if all
 * windows have passed (meaning next window is tomorrow's 08:30 UTC).
 */
export function getNextSendWindow(now: Date = new Date()): string | null {
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  for (const w of SEND_WINDOWS) {
    const windowMinutes = w.hour * 60 + w.minute;
    if (windowMinutes > currentMinutes) return w.label;
  }
  return null; // all windows passed — next is tomorrow 08:30 UTC
}

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
