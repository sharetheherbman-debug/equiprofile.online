import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";

// Core user table with subscription management
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }), // For local email/password auth
  emailVerified: boolean("emailVerified").default(false), // Email verification status
  resetToken: varchar("resetToken", { length: 255 }), // Password reset token
  resetTokenExpiry: timestamp("resetTokenExpiry"), // Reset token expiration
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Subscription fields
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["trial", "active", "cancelled", "overdue", "expired"]).default("trial").notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["monthly", "yearly"]).default("monthly"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  trialEndsAt: timestamp("trialEndsAt"),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  lastPaymentAt: timestamp("lastPaymentAt"),
  // Account status
  isActive: boolean("isActive").default(true).notNull(),
  isSuspended: boolean("isSuspended").default(false).notNull(),
  suspendedReason: text("suspendedReason"),
  // Profile
  phone: varchar("phone", { length: 20 }),
  location: varchar("location", { length: 255 }),
  profileImageUrl: text("profileImageUrl"),
  // User preferences and settings
  preferences: text("preferences"), // JSON: theme, language, dashboard layout
  language: varchar("language", { length: 10 }).default("en"),
  theme: mysqlEnum("theme", ["light", "dark", "system"]).default("system"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Horse profiles
export const horses = mysqlTable("horses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  breed: varchar("breed", { length: 100 }),
  age: int("age"),
  dateOfBirth: date("dateOfBirth"),
  height: int("height"), // in centimeters
  weight: int("weight"), // in kilograms
  color: varchar("color", { length: 50 }),
  gender: mysqlEnum("gender", ["stallion", "mare", "gelding"]),
  discipline: varchar("discipline", { length: 100 }), // dressage, jumping, eventing, etc.
  level: varchar("level", { length: 50 }), // beginner, intermediate, advanced, competition
  registrationNumber: varchar("registrationNumber", { length: 100 }),
  microchipNumber: varchar("microchipNumber", { length: 100 }),
  notes: text("notes"),
  photoUrl: text("photoUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Health records
export const healthRecords = mysqlTable("healthRecords", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  recordType: mysqlEnum("recordType", ["vaccination", "deworming", "dental", "farrier", "veterinary", "injury", "medication", "other"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  recordDate: date("recordDate").notNull(),
  nextDueDate: date("nextDueDate"),
  vetName: varchar("vetName", { length: 100 }),
  vetPhone: varchar("vetPhone", { length: 20 }),
  vetClinic: varchar("vetClinic", { length: 200 }),
  cost: int("cost"), // in pence/cents
  documentUrl: text("documentUrl"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Training sessions
export const trainingSessions = mysqlTable("trainingSessions", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  sessionDate: date("sessionDate").notNull(),
  startTime: varchar("startTime", { length: 10 }), // HH:MM format
  endTime: varchar("endTime", { length: 10 }),
  duration: int("duration"), // in minutes
  sessionType: mysqlEnum("sessionType", ["flatwork", "jumping", "hacking", "lunging", "groundwork", "competition", "lesson", "other"]).notNull(),
  discipline: varchar("discipline", { length: 100 }),
  trainer: varchar("trainer", { length: 100 }),
  location: varchar("location", { length: 200 }),
  goals: text("goals"),
  exercises: text("exercises"),
  notes: text("notes"),
  performance: mysqlEnum("performance", ["excellent", "good", "average", "poor"]),
  weather: varchar("weather", { length: 100 }),
  temperature: int("temperature"), // in celsius
  isCompleted: boolean("isCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Feeding plans
export const feedingPlans = mysqlTable("feedingPlans", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  feedType: varchar("feedType", { length: 100 }).notNull(), // hay, grain, supplements, etc.
  brandName: varchar("brandName", { length: 100 }),
  quantity: varchar("quantity", { length: 50 }).notNull(), // e.g., "2kg", "1 scoop"
  unit: varchar("unit", { length: 20 }), // kg, lbs, scoops, flakes
  mealTime: mysqlEnum("mealTime", ["morning", "midday", "evening", "night"]).notNull(),
  frequency: varchar("frequency", { length: 50 }).default("daily"), // daily, twice daily, etc.
  specialInstructions: text("specialInstructions"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Documents storage
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  horseId: int("horseId"),
  healthRecordId: int("healthRecordId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(), // pdf, image, etc.
  fileSize: int("fileSize"), // in bytes
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  category: mysqlEnum("category", ["health", "registration", "insurance", "competition", "other"]).default("other"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Weather logs for AI analysis
export const weatherLogs = mysqlTable("weatherLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  temperature: int("temperature"), // celsius
  humidity: int("humidity"), // percentage
  windSpeed: int("windSpeed"), // km/h
  precipitation: int("precipitation"), // mm
  conditions: varchar("conditions", { length: 100 }), // sunny, cloudy, rainy, etc.
  uvIndex: int("uvIndex"),
  visibility: int("visibility"), // km
  ridingRecommendation: mysqlEnum("ridingRecommendation", ["excellent", "good", "fair", "poor", "not_recommended"]),
  aiAnalysis: text("aiAnalysis"),
  checkedAt: timestamp("checkedAt").defaultNow().notNull(),
});

// System settings for admin
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  settingType: mysqlEnum("settingType", ["string", "number", "boolean", "json"]).default("string"),
  description: text("description"),
  isEncrypted: boolean("isEncrypted").default(false),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Admin sessions for time-limited admin access
export const adminSessions = mysqlTable("adminSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Admin unlock attempts tracking for rate limiting
export const adminUnlockAttempts = mysqlTable("adminUnlockAttempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  attempts: int("attempts").default(0).notNull(),
  lockedUntil: timestamp("lockedUntil"),
  lastAttemptAt: timestamp("lastAttemptAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Activity logs for admin monitoring
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }), // user, horse, health_record, etc.
  entityId: int("entityId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Backup logs
export const backupLogs = mysqlTable("backupLogs", {
  id: int("id").autoincrement().primaryKey(),
  backupType: mysqlEnum("backupType", ["full", "incremental", "users", "horses"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).notNull(),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"),
  fileUrl: text("fileUrl"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

// Stables/Teams for multi-user management
export const stables = mysqlTable("stables", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  ownerId: int("ownerId").notNull(), // The user who created the stable
  location: varchar("location", { length: 255 }),
  logo: text("logo"),
  // Branding and customization
  primaryColor: varchar("primaryColor", { length: 7 }), // Hex color
  secondaryColor: varchar("secondaryColor", { length: 7 }),
  customDomain: varchar("customDomain", { length: 255 }),
  branding: text("branding"), // JSON: additional branding settings
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Stable members with role-based permissions
export const stableMembers = mysqlTable("stableMembers", {
  id: int("id").autoincrement().primaryKey(),
  stableId: int("stableId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["owner", "admin", "trainer", "member", "viewer"]).notNull(),
  permissions: text("permissions"), // JSON string of specific permissions
  isActive: boolean("isActive").default(true).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Invitations to join stables
export const stableInvites = mysqlTable("stableInvites", {
  id: int("id").autoincrement().primaryKey(),
  stableId: int("stableId").notNull(),
  invitedByUserId: int("invitedByUserId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  role: mysqlEnum("role", ["admin", "trainer", "member", "viewer"]).notNull(),
  token: varchar("token", { length: 100 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "expired"]).default("pending").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Events and calendar
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stableId: int("stableId"),
  horseId: int("horseId"),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  eventType: mysqlEnum("eventType", ["training", "competition", "veterinary", "farrier", "lesson", "meeting", "other"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 255 }),
  isAllDay: boolean("isAllDay").default(false).notNull(),
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurrenceRule: text("recurrenceRule"), // iCal RRULE format
  color: varchar("color", { length: 7 }), // Hex color code
  isCompleted: boolean("isCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Event reminders
export const eventReminders = mysqlTable("eventReminders", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  userId: int("userId").notNull(),
  reminderTime: timestamp("reminderTime").notNull(),
  reminderType: mysqlEnum("reminderType", ["email", "push", "sms"]).notNull(),
  isSent: boolean("isSent").default(false).notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Feed costs tracking
export const feedCosts = mysqlTable("feedCosts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  horseId: int("horseId"),
  feedType: varchar("feedType", { length: 100 }).notNull(),
  brandName: varchar("brandName", { length: 100 }),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  unit: varchar("unit", { length: 20 }),
  costPerUnit: int("costPerUnit").notNull(), // in pence/cents
  purchaseDate: date("purchaseDate").notNull(),
  supplier: varchar("supplier", { length: 200 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Vaccinations tracking
export const vaccinations = mysqlTable("vaccinations", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  vaccineName: varchar("vaccineName", { length: 200 }).notNull(),
  vaccineType: varchar("vaccineType", { length: 100 }), // flu, tetanus, etc.
  dateAdministered: date("dateAdministered").notNull(),
  nextDueDate: date("nextDueDate"),
  batchNumber: varchar("batchNumber", { length: 100 }),
  vetName: varchar("vetName", { length: 100 }),
  vetClinic: varchar("vetClinic", { length: 200 }),
  cost: int("cost"), // in pence/cents
  notes: text("notes"),
  documentUrl: text("documentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Deworming tracking
export const dewormings = mysqlTable("dewormings", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  productName: varchar("productName", { length: 200 }).notNull(),
  activeIngredient: varchar("activeIngredient", { length: 200 }),
  dateAdministered: date("dateAdministered").notNull(),
  nextDueDate: date("nextDueDate"),
  dosage: varchar("dosage", { length: 100 }),
  weight: int("weight"), // horse weight at time of treatment
  cost: int("cost"), // in pence/cents
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Shareable profile links
export const shareLinks = mysqlTable("shareLinks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  horseId: int("horseId"),
  linkType: mysqlEnum("linkType", ["horse", "stable", "medical_passport"]).notNull(),
  token: varchar("token", { length: 100 }).notNull().unique(),
  isPublic: boolean("isPublic").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  viewCount: int("viewCount").default(0).notNull(),
  lastViewedAt: timestamp("lastViewedAt"),
  settings: text("settings"), // JSON string for privacy settings
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Competitions tracking
export const competitions = mysqlTable("competitions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  horseId: int("horseId").notNull(),
  competitionName: varchar("competitionName", { length: 200 }).notNull(),
  venue: varchar("venue", { length: 200 }),
  date: date("date").notNull(),
  discipline: varchar("discipline", { length: 100 }), // dressage, jumping, etc.
  level: varchar("level", { length: 50 }),
  class: varchar("class", { length: 100 }), // specific class/event name
  placement: varchar("placement", { length: 50 }), // 1st, 2nd, etc. or score
  score: varchar("score", { length: 50 }),
  notes: text("notes"),
  cost: int("cost"), // entry fee in pence/cents
  winnings: int("winnings"), // prize money in pence/cents
  documentUrl: text("documentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Document tags for better organization
export const documentTags = mysqlTable("documentTags", {
  id: int("id").autoincrement().primaryKey(),
  documentId: int("documentId").notNull(),
  tag: varchar("tag", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Stripe webhook events for idempotency
export const stripeEvents = mysqlTable("stripeEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 255 }).notNull().unique(),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  processed: boolean("processed").default(false).notNull(),
  payload: text("payload"), // Full event payload for debugging
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

// Message threads for stable communication
export const messageThreads = mysqlTable("messageThreads", {
  id: int("id").autoincrement().primaryKey(),
  stableId: int("stableId").notNull(),
  title: varchar("title", { length: 200 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Messages for in-app communication
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  threadId: int("threadId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  attachments: text("attachments"), // JSON array of file URLs
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Competition results with detailed scoring
export const competitionResults = mysqlTable("competitionResults", {
  id: int("id").autoincrement().primaryKey(),
  competitionId: int("competitionId").notNull(),
  userId: int("userId").notNull(),
  horseId: int("horseId").notNull(),
  roundNumber: int("roundNumber").default(1),
  score: varchar("score", { length: 50 }),
  penalties: int("penalties"),
  time: varchar("time", { length: 20 }),
  judgeScores: text("judgeScores"), // JSON array of judge scores
  technicalScore: int("technicalScore"),
  artisticScore: int("artisticScore"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Training program templates
export const trainingProgramTemplates = mysqlTable("trainingProgramTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stableId: int("stableId"),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  duration: int("duration"), // in weeks
  discipline: varchar("discipline", { length: 100 }),
  level: varchar("level", { length: 50 }),
  goals: text("goals"),
  programData: text("programData").notNull(), // JSON: weekly schedule
  isPublic: boolean("isPublic").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Training programs (instances of templates)
export const trainingPrograms = mysqlTable("trainingPrograms", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  templateId: int("templateId"),
  name: varchar("name", { length: 200 }).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  status: mysqlEnum("status", ["active", "completed", "paused", "cancelled"]).default("active").notNull(),
  progress: int("progress").default(0), // percentage
  programData: text("programData").notNull(), // JSON: customized schedule
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Automated reports
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stableId: int("stableId"),
  horseId: int("horseId"),
  reportType: mysqlEnum("reportType", ["monthly_summary", "health_report", "training_progress", "cost_analysis", "competition_summary"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  reportData: text("reportData").notNull(), // JSON: report content
  fileUrl: text("fileUrl"), // PDF URL
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

// Report schedules for automation
export const reportSchedules = mysqlTable("reportSchedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stableId: int("stableId"),
  reportType: mysqlEnum("reportType", ["monthly_summary", "health_report", "training_progress", "cost_analysis", "competition_summary"]).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "quarterly"]).notNull(),
  recipients: text("recipients"), // JSON array of email addresses
  isActive: boolean("isActive").default(true).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Breeding records
export const breeding = mysqlTable("breeding", {
  id: int("id").autoincrement().primaryKey(),
  mareId: int("mareId").notNull(), // horseId of mare
  stallionId: int("stallionId"), // horseId of stallion (if owned)
  stallionName: varchar("stallionName", { length: 200 }),
  breedingDate: date("breedingDate").notNull(),
  method: mysqlEnum("method", ["natural", "artificial", "embryo_transfer"]).notNull(),
  veterinarianName: varchar("veterinarianName", { length: 100 }),
  cost: int("cost"),
  pregnancyConfirmed: boolean("pregnancyConfirmed").default(false),
  confirmationDate: date("confirmationDate"),
  dueDate: date("dueDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Foal tracking
export const foals = mysqlTable("foals", {
  id: int("id").autoincrement().primaryKey(),
  breedingId: int("breedingId").notNull(),
  horseId: int("horseId"), // linked to horses table after birth
  birthDate: date("birthDate").notNull(),
  gender: mysqlEnum("gender", ["colt", "filly"]),
  name: varchar("name", { length: 100 }),
  color: varchar("color", { length: 50 }),
  markings: text("markings"),
  birthWeight: int("birthWeight"), // in kg
  currentWeight: int("currentWeight"),
  healthStatus: varchar("healthStatus", { length: 100 }),
  milestones: text("milestones"), // JSON array of development milestones
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Pedigree information
export const pedigree = mysqlTable("pedigree", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  sireId: int("sireId"), // horseId of sire
  sireName: varchar("sireName", { length: 200 }),
  damId: int("damId"), // horseId of dam
  damName: varchar("damName", { length: 200 }),
  sireOfSireId: int("sireOfSireId"),
  sireOfSireName: varchar("sireOfSireName", { length: 200 }),
  damOfSireId: int("damOfSireId"),
  damOfSireName: varchar("damOfSireName", { length: 200 }),
  sireOfDamId: int("sireOfDamId"),
  sireOfDamName: varchar("sireOfDamName", { length: 200 }),
  damOfDamId: int("damOfDamId"),
  damOfDamName: varchar("damOfDamName", { length: 200 }),
  geneticInfo: text("geneticInfo"), // JSON: genetic markers, health predispositions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Lesson bookings for trainers
export const lessonBookings = mysqlTable("lessonBookings", {
  id: int("id").autoincrement().primaryKey(),
  trainerId: int("trainerId").notNull(),
  clientId: int("clientId").notNull(),
  horseId: int("horseId"),
  lessonDate: timestamp("lessonDate").notNull(),
  duration: int("duration").notNull(), // in minutes
  lessonType: varchar("lessonType", { length: 100 }),
  location: varchar("location", { length: 200 }),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  fee: int("fee"), // in pence/cents
  paid: boolean("paid").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Trainer availability
export const trainerAvailability = mysqlTable("trainerAvailability", {
  id: int("id").autoincrement().primaryKey(),
  trainerId: int("trainerId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM
  endTime: varchar("endTime", { length: 5 }).notNull(), // HH:MM
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// API keys for third-party integrations
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stableId: int("stableId"),
  name: varchar("name", { length: 100 }).notNull(),
  keyHash: varchar("keyHash", { length: 255 }).notNull(), // bcrypt hash of key
  keyPrefix: varchar("keyPrefix", { length: 20 }).notNull(), // first few chars for identification
  permissions: text("permissions"), // JSON array of allowed endpoints
  rateLimit: int("rateLimit").default(100).notNull(), // requests per hour
  isActive: boolean("isActive").default(true).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Webhooks for third-party integrations
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stableId: int("stableId"),
  url: text("url").notNull(),
  events: text("events").notNull(), // JSON array of subscribed events
  secret: varchar("secret", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  failureCount: int("failureCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Horse = typeof horses.$inferSelect;
export type InsertHorse = typeof horses.$inferInsert;
export type HealthRecord = typeof healthRecords.$inferSelect;
export type InsertHealthRecord = typeof healthRecords.$inferInsert;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type InsertTrainingSession = typeof trainingSessions.$inferInsert;
export type FeedingPlan = typeof feedingPlans.$inferSelect;
export type InsertFeedingPlan = typeof feedingPlans.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type WeatherLog = typeof weatherLogs.$inferSelect;
export type InsertWeatherLog = typeof weatherLogs.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;
export type BackupLog = typeof backupLogs.$inferSelect;
export type InsertBackupLog = typeof backupLogs.$inferInsert;
export type Stable = typeof stables.$inferSelect;
export type InsertStable = typeof stables.$inferInsert;
export type StableMember = typeof stableMembers.$inferSelect;
export type InsertStableMember = typeof stableMembers.$inferInsert;
export type StableInvite = typeof stableInvites.$inferSelect;
export type InsertStableInvite = typeof stableInvites.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type EventReminder = typeof eventReminders.$inferSelect;
export type InsertEventReminder = typeof eventReminders.$inferInsert;
export type FeedCost = typeof feedCosts.$inferSelect;
export type InsertFeedCost = typeof feedCosts.$inferInsert;
export type Vaccination = typeof vaccinations.$inferSelect;
export type InsertVaccination = typeof vaccinations.$inferInsert;
export type Deworming = typeof dewormings.$inferSelect;
export type InsertDeworming = typeof dewormings.$inferInsert;
export type ShareLink = typeof shareLinks.$inferSelect;
export type InsertShareLink = typeof shareLinks.$inferInsert;
export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = typeof competitions.$inferInsert;
export type DocumentTag = typeof documentTags.$inferSelect;
export type InsertDocumentTag = typeof documentTags.$inferInsert;
export type StripeEvent = typeof stripeEvents.$inferSelect;
export type InsertStripeEvent = typeof stripeEvents.$inferInsert;
export type MessageThread = typeof messageThreads.$inferSelect;
export type InsertMessageThread = typeof messageThreads.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type CompetitionResult = typeof competitionResults.$inferSelect;
export type InsertCompetitionResult = typeof competitionResults.$inferInsert;
export type TrainingProgramTemplate = typeof trainingProgramTemplates.$inferSelect;
export type InsertTrainingProgramTemplate = typeof trainingProgramTemplates.$inferInsert;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type InsertTrainingProgram = typeof trainingPrograms.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type InsertReportSchedule = typeof reportSchedules.$inferInsert;
export type Breeding = typeof breeding.$inferSelect;
export type InsertBreeding = typeof breeding.$inferInsert;
export type Foal = typeof foals.$inferSelect;
export type InsertFoal = typeof foals.$inferInsert;
export type Pedigree = typeof pedigree.$inferSelect;
export type InsertPedigree = typeof pedigree.$inferInsert;
export type LessonBooking = typeof lessonBookings.$inferSelect;
export type InsertLessonBooking = typeof lessonBookings.$inferInsert;
export type TrainerAvailability = typeof trainerAvailability.$inferSelect;
export type InsertTrainerAvailability = typeof trainerAvailability.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;
export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;
export type AdminUnlockAttempt = typeof adminUnlockAttempts.$inferSelect;
export type InsertAdminUnlockAttempt = typeof adminUnlockAttempts.$inferInsert;

// Feature flags for account-level feature enablement
export const accountFeatures = mysqlTable("accountFeatures", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Core features (always enabled)
  horsesEnabled: boolean("horsesEnabled").default(true).notNull(),
  healthEnabled: boolean("healthEnabled").default(true).notNull(),
  trainingEnabled: boolean("trainingEnabled").default(true).notNull(),
  // Add-on features (require subscription tier)
  breedingEnabled: boolean("breedingEnabled").default(false).notNull(),
  financeEnabled: boolean("financeEnabled").default(false).notNull(),
  salesEnabled: boolean("salesEnabled").default(false).notNull(),
  teamsEnabled: boolean("teamsEnabled").default(false).notNull(),
  advancedReportsEnabled: boolean("advancedReportsEnabled").default(false).notNull(),
  // Beta features
  peppolEnabled: boolean("peppolEnabled").default(false).notNull(),
  aiInvoiceScanEnabled: boolean("aiInvoiceScanEnabled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AccountFeatures = typeof accountFeatures.$inferSelect;
export type InsertAccountFeatures = typeof accountFeatures.$inferInsert;

// Tasks system for general horse care and management
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  horseId: int("horseId"), // Optional - task may be for specific horse or general
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  taskType: mysqlEnum("taskType", ["hoofcare", "health_appointment", "treatment", "vaccination", "deworming", "dental", "general_care", "training", "feeding", "other"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "cancelled"]).default("pending").notNull(),
  dueDate: date("dueDate"),
  completedAt: timestamp("completedAt"),
  assignedTo: varchar("assignedTo", { length: 100 }), // Name of person assigned
  notes: text("notes"),
  reminderDays: int("reminderDays").default(1), // Days before due date to remind
  isRecurring: boolean("isRecurring").default(false).notNull(),
  recurringInterval: mysqlEnum("recurringInterval", ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Contacts for vets, farriers, trainers, etc.
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  contactType: mysqlEnum("contactType", ["vet", "farrier", "trainer", "instructor", "stable", "breeder", "supplier", "emergency", "other"]).notNull(),
  company: varchar("company", { length: 200 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  mobile: varchar("mobile", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  postcode: varchar("postcode", { length: 20 }),
  country: varchar("country", { length: 100 }).default("United Kingdom"),
  website: varchar("website", { length: 500 }),
  notes: text("notes"),
  isPrimary: boolean("isPrimary").default(false).notNull(), // Primary contact for this type
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// Treatments module
export const treatments = mysqlTable("treatments", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  treatmentType: varchar("treatmentType", { length: 100 }).notNull(), // medication, therapy, procedure, etc.
  treatmentName: varchar("treatmentName", { length: 200 }).notNull(),
  description: text("description"),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  frequency: varchar("frequency", { length: 100 }), // daily, twice daily, weekly, etc.
  dosage: varchar("dosage", { length: 200 }),
  administeredBy: varchar("administeredBy", { length: 100 }),
  vetName: varchar("vetName", { length: 100 }),
  vetClinic: varchar("vetClinic", { length: 200 }),
  cost: int("cost"), // in pence
  status: mysqlEnum("status", ["active", "completed", "discontinued"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Treatment = typeof treatments.$inferSelect;
export type InsertTreatment = typeof treatments.$inferInsert;

// Health appointments module
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  appointmentType: varchar("appointmentType", { length: 100 }).notNull(), // vet, farrier, dentist, physio, etc.
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  appointmentDate: date("appointmentDate").notNull(),
  appointmentTime: varchar("appointmentTime", { length: 10 }), // HH:MM format
  duration: int("duration"), // in minutes
  providerName: varchar("providerName", { length: 100 }),
  providerPhone: varchar("providerPhone", { length: 20 }),
  providerClinic: varchar("providerClinic", { length: 200 }),
  location: varchar("location", { length: 200 }),
  cost: int("cost"), // in pence
  status: mysqlEnum("status", ["scheduled", "confirmed", "completed", "cancelled"]).default("scheduled").notNull(),
  reminderSent: boolean("reminderSent").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// Dental care module
export const dentalCare = mysqlTable("dentalCare", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  examDate: date("examDate").notNull(),
  dentistName: varchar("dentistName", { length: 100 }),
  dentistClinic: varchar("dentistClinic", { length: 200 }),
  procedureType: varchar("procedureType", { length: 200 }), // routine exam, floating, extraction, etc.
  findings: text("findings"),
  treatmentPerformed: text("treatmentPerformed"),
  nextDueDate: date("nextDueDate"),
  cost: int("cost"), // in pence
  sedationUsed: boolean("sedationUsed").default(false).notNull(),
  teethCondition: mysqlEnum("teethCondition", ["excellent", "good", "fair", "poor"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DentalCare = typeof dentalCare.$inferSelect;
export type InsertDentalCare = typeof dentalCare.$inferInsert;

// X-rays module
export const xrays = mysqlTable("xrays", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  xrayDate: date("xrayDate").notNull(),
  bodyPart: varchar("bodyPart", { length: 100 }).notNull(), // front left hoof, hock, stifle, etc.
  reason: varchar("reason", { length: 200 }),
  vetName: varchar("vetName", { length: 100 }),
  vetClinic: varchar("vetClinic", { length: 200 }),
  findings: text("findings"),
  diagnosis: text("diagnosis"),
  fileUrl: text("fileUrl"), // Path to stored x-ray image
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"), // in bytes
  mimeType: varchar("mimeType", { length: 100 }),
  cost: int("cost"), // in pence
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Xray = typeof xrays.$inferSelect;
export type InsertXray = typeof xrays.$inferInsert;

// Tags module (for organizing horses, documents, etc.)
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  color: varchar("color", { length: 20 }), // hex color code
  category: varchar("category", { length: 50 }), // horse, document, task, etc.
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

// Hoofcare module
export const hoofcare = mysqlTable("hoofcare", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  careDate: date("careDate").notNull(),
  careType: mysqlEnum("careType", ["shoeing", "trimming", "remedial", "inspection", "other"]).notNull(),
  farrierName: varchar("farrierName", { length: 100 }),
  farrierPhone: varchar("farrierPhone", { length: 20 }),
  hoofCondition: mysqlEnum("hoofCondition", ["excellent", "good", "fair", "poor"]),
  shoesType: varchar("shoesType", { length: 100 }), // e.g., front only, all four, barefoot
  findings: text("findings"),
  workPerformed: text("workPerformed"),
  nextDueDate: date("nextDueDate"),
  cost: int("cost"), // in pence
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Hoofcare = typeof hoofcare.$inferSelect;
export type InsertHoofcare = typeof hoofcare.$inferInsert;

// Nutrition logs module
export const nutritionLogs = mysqlTable("nutritionLogs", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  logDate: date("logDate").notNull(),
  feedType: varchar("feedType", { length: 100 }).notNull(),
  feedName: varchar("feedName", { length: 200 }),
  amount: varchar("amount", { length: 100 }), // e.g., "2 kg", "3 scoops"
  mealTime: varchar("mealTime", { length: 50 }), // morning, midday, evening
  supplements: text("supplements"),
  hay: varchar("hay", { length: 100 }),
  water: varchar("water", { length: 100 }),
  bodyConditionScore: int("bodyConditionScore"), // 1-9 scale
  weight: int("weight"), // in kg
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NutritionLog = typeof nutritionLogs.$inferSelect;
export type InsertNutritionLog = typeof nutritionLogs.$inferInsert;

// Nutrition plans module (enhanced feeding plans)
export const nutritionPlans = mysqlTable("nutritionPlans", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  planName: varchar("planName", { length: 200 }).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  targetWeight: int("targetWeight"), // in kg
  targetBodyCondition: int("targetBodyCondition"), // 1-9 scale
  dailyHay: varchar("dailyHay", { length: 100 }),
  dailyConcentrates: varchar("dailyConcentrates", { length: 200 }),
  supplements: text("supplements"),
  specialInstructions: text("specialInstructions"),
  feedingSchedule: text("feedingSchedule"), // JSON with meal times and amounts
  caloriesPerDay: int("caloriesPerDay"),
  proteinPerDay: varchar("proteinPerDay", { length: 50 }),
  isActive: boolean("isActive").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NutritionPlan = typeof nutritionPlans.$inferSelect;
export type InsertNutritionPlan = typeof nutritionPlans.$inferInsert;
