// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
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
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var horses = mysqlTable("horses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  breed: varchar("breed", { length: 100 }),
  age: int("age"),
  dateOfBirth: date("dateOfBirth"),
  height: int("height"),
  // in centimeters
  weight: int("weight"),
  // in kilograms
  color: varchar("color", { length: 50 }),
  gender: mysqlEnum("gender", ["stallion", "mare", "gelding"]),
  discipline: varchar("discipline", { length: 100 }),
  // dressage, jumping, eventing, etc.
  level: varchar("level", { length: 50 }),
  // beginner, intermediate, advanced, competition
  registrationNumber: varchar("registrationNumber", { length: 100 }),
  microchipNumber: varchar("microchipNumber", { length: 100 }),
  notes: text("notes"),
  photoUrl: text("photoUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var healthRecords = mysqlTable("healthRecords", {
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
  cost: int("cost"),
  // in pence/cents
  documentUrl: text("documentUrl"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var trainingSessions = mysqlTable("trainingSessions", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  sessionDate: date("sessionDate").notNull(),
  startTime: varchar("startTime", { length: 10 }),
  // HH:MM format
  endTime: varchar("endTime", { length: 10 }),
  duration: int("duration"),
  // in minutes
  sessionType: mysqlEnum("sessionType", ["flatwork", "jumping", "hacking", "lunging", "groundwork", "competition", "lesson", "other"]).notNull(),
  discipline: varchar("discipline", { length: 100 }),
  trainer: varchar("trainer", { length: 100 }),
  location: varchar("location", { length: 200 }),
  goals: text("goals"),
  exercises: text("exercises"),
  notes: text("notes"),
  performance: mysqlEnum("performance", ["excellent", "good", "average", "poor"]),
  weather: varchar("weather", { length: 100 }),
  temperature: int("temperature"),
  // in celsius
  isCompleted: boolean("isCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var feedingPlans = mysqlTable("feedingPlans", {
  id: int("id").autoincrement().primaryKey(),
  horseId: int("horseId").notNull(),
  userId: int("userId").notNull(),
  feedType: varchar("feedType", { length: 100 }).notNull(),
  // hay, grain, supplements, etc.
  brandName: varchar("brandName", { length: 100 }),
  quantity: varchar("quantity", { length: 50 }).notNull(),
  // e.g., "2kg", "1 scoop"
  unit: varchar("unit", { length: 20 }),
  // kg, lbs, scoops, flakes
  mealTime: mysqlEnum("mealTime", ["morning", "midday", "evening", "night"]).notNull(),
  frequency: varchar("frequency", { length: 50 }).default("daily"),
  // daily, twice daily, etc.
  specialInstructions: text("specialInstructions"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  horseId: int("horseId"),
  healthRecordId: int("healthRecordId"),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  // pdf, image, etc.
  fileSize: int("fileSize"),
  // in bytes
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  category: mysqlEnum("category", ["health", "registration", "insurance", "competition", "other"]).default("other"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var weatherLogs = mysqlTable("weatherLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  temperature: int("temperature"),
  // celsius
  humidity: int("humidity"),
  // percentage
  windSpeed: int("windSpeed"),
  // km/h
  precipitation: int("precipitation"),
  // mm
  conditions: varchar("conditions", { length: 100 }),
  // sunny, cloudy, rainy, etc.
  uvIndex: int("uvIndex"),
  visibility: int("visibility"),
  // km
  ridingRecommendation: mysqlEnum("ridingRecommendation", ["excellent", "good", "fair", "poor", "not_recommended"]),
  aiAnalysis: text("aiAnalysis"),
  checkedAt: timestamp("checkedAt").defaultNow().notNull()
});
var systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue"),
  settingType: mysqlEnum("settingType", ["string", "number", "boolean", "json"]).default("string"),
  description: text("description"),
  isEncrypted: boolean("isEncrypted").default(false),
  updatedBy: int("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  // user, horse, health_record, etc.
  entityId: int("entityId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var backupLogs = mysqlTable("backupLogs", {
  id: int("id").autoincrement().primaryKey(),
  backupType: mysqlEnum("backupType", ["full", "incremental", "users", "horses"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).notNull(),
  fileName: varchar("fileName", { length: 255 }),
  fileSize: int("fileSize"),
  fileUrl: text("fileUrl"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt")
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.trialEndsAt) {
      const trialEnd = /* @__PURE__ */ new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      values.trialEndsAt = trialEnd;
      values.subscriptionStatus = "trial";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}
async function updateUser(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
}
async function suspendUser(id, reason) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({
    isSuspended: true,
    suspendedReason: reason,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(users.id, id));
}
async function unsuspendUser(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({
    isSuspended: false,
    suspendedReason: null,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(users.id, id));
}
async function deleteUser(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
}
async function getOverdueSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  return db.select().from(users).where(
    and(
      eq(users.subscriptionStatus, "overdue"),
      eq(users.isActive, true)
    )
  );
}
async function getExpiredTrials() {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  return db.select().from(users).where(
    and(
      eq(users.subscriptionStatus, "trial"),
      lte(users.trialEndsAt, now),
      eq(users.isActive, true)
    )
  );
}
async function createHorse(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(horses).values(data);
  return result[0].insertId;
}
async function getHorsesByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(horses).where(
    and(eq(horses.userId, userId), eq(horses.isActive, true))
  ).orderBy(desc(horses.createdAt));
}
async function getHorseById(id, userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(horses).where(
    and(eq(horses.id, id), eq(horses.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateHorse(id, userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(horses).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(
    and(eq(horses.id, id), eq(horses.userId, userId))
  );
}
async function deleteHorse(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(horses).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(
    and(eq(horses.id, id), eq(horses.userId, userId))
  );
}
async function createHealthRecord(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(healthRecords).values(data);
  return result[0].insertId;
}
async function getHealthRecordsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthRecords).where(
    eq(healthRecords.userId, userId)
  ).orderBy(desc(healthRecords.recordDate));
}
async function getHealthRecordsByHorseId(horseId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthRecords).where(
    and(eq(healthRecords.horseId, horseId), eq(healthRecords.userId, userId))
  ).orderBy(desc(healthRecords.recordDate));
}
async function getHealthRecordById(id, userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(healthRecords).where(
    and(eq(healthRecords.id, id), eq(healthRecords.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateHealthRecord(id, userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(healthRecords).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(
    and(eq(healthRecords.id, id), eq(healthRecords.userId, userId))
  );
}
async function deleteHealthRecord(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(healthRecords).where(
    and(eq(healthRecords.id, id), eq(healthRecords.userId, userId))
  );
}
async function getUpcomingReminders(userId, days = 30) {
  const db = await getDb();
  if (!db) return [];
  const now = /* @__PURE__ */ new Date();
  const futureDate = /* @__PURE__ */ new Date();
  futureDate.setDate(futureDate.getDate() + days);
  return db.select().from(healthRecords).where(
    and(
      eq(healthRecords.userId, userId),
      gte(healthRecords.nextDueDate, now),
      lte(healthRecords.nextDueDate, futureDate)
    )
  ).orderBy(healthRecords.nextDueDate);
}
async function createTrainingSession(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trainingSessions).values(data);
  return result[0].insertId;
}
async function getTrainingSessionsByHorseId(horseId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingSessions).where(
    and(eq(trainingSessions.horseId, horseId), eq(trainingSessions.userId, userId))
  ).orderBy(desc(trainingSessions.sessionDate));
}
async function getTrainingSessionsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingSessions).where(
    eq(trainingSessions.userId, userId)
  ).orderBy(desc(trainingSessions.sessionDate));
}
async function getUpcomingTrainingSessions(userId) {
  const db = await getDb();
  if (!db) return [];
  const today = /* @__PURE__ */ new Date();
  return db.select().from(trainingSessions).where(
    and(
      eq(trainingSessions.userId, userId),
      gte(trainingSessions.sessionDate, today),
      eq(trainingSessions.isCompleted, false)
    )
  ).orderBy(trainingSessions.sessionDate);
}
async function updateTrainingSession(id, userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(trainingSessions).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(
    and(eq(trainingSessions.id, id), eq(trainingSessions.userId, userId))
  );
}
async function deleteTrainingSession(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(trainingSessions).where(
    and(eq(trainingSessions.id, id), eq(trainingSessions.userId, userId))
  );
}
async function createFeedingPlan(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(feedingPlans).values(data);
  return result[0].insertId;
}
async function getFeedingPlansByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedingPlans).where(
    and(
      eq(feedingPlans.userId, userId),
      eq(feedingPlans.isActive, true)
    )
  ).orderBy(feedingPlans.mealTime);
}
async function getFeedingPlansByHorseId(horseId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedingPlans).where(
    and(
      eq(feedingPlans.horseId, horseId),
      eq(feedingPlans.userId, userId),
      eq(feedingPlans.isActive, true)
    )
  ).orderBy(feedingPlans.mealTime);
}
async function updateFeedingPlan(id, userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(feedingPlans).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(
    and(eq(feedingPlans.id, id), eq(feedingPlans.userId, userId))
  );
}
async function deleteFeedingPlan(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(feedingPlans).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(
    and(eq(feedingPlans.id, id), eq(feedingPlans.userId, userId))
  );
}
async function createDocument(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data);
  return result[0].insertId;
}
async function getDocumentsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
}
async function getDocumentsByHorseId(horseId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(
    and(eq(documents.horseId, horseId), eq(documents.userId, userId))
  ).orderBy(desc(documents.createdAt));
}
async function deleteDocument(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(documents).where(
    and(eq(documents.id, id), eq(documents.userId, userId))
  );
}
async function createWeatherLog(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(weatherLogs).values(data);
  return result[0].insertId;
}
async function getLatestWeatherLog(userId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(weatherLogs).where(
    eq(weatherLogs.userId, userId)
  ).orderBy(desc(weatherLogs.checkedAt)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getWeatherHistory(userId, limit = 7) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weatherLogs).where(
    eq(weatherLogs.userId, userId)
  ).orderBy(desc(weatherLogs.checkedAt)).limit(limit);
}
async function upsertSetting(key, value, type = "string", description, updatedBy) {
  const db = await getDb();
  if (!db) return;
  await db.insert(systemSettings).values({
    settingKey: key,
    settingValue: value,
    settingType: type,
    description,
    updatedBy
  }).onDuplicateKeyUpdate({
    set: { settingValue: value, updatedBy, updatedAt: /* @__PURE__ */ new Date() }
  });
}
async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(systemSettings).orderBy(systemSettings.settingKey);
}
async function logActivity(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}
async function getActivityLogs(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}
async function getUserActivityLogs(userId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).where(
    eq(activityLogs.userId, userId)
  ).orderBy(desc(activityLogs.createdAt)).limit(limit);
}
async function getRecentBackups(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(backupLogs).orderBy(desc(backupLogs.startedAt)).limit(limit);
}
async function getSystemStats() {
  const db = await getDb();
  if (!db) return null;
  const [userStats] = await db.select({
    totalUsers: sql`COUNT(*)`,
    activeUsers: sql`SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END)`,
    trialUsers: sql`SUM(CASE WHEN subscriptionStatus = 'trial' THEN 1 ELSE 0 END)`,
    paidUsers: sql`SUM(CASE WHEN subscriptionStatus = 'active' THEN 1 ELSE 0 END)`,
    overdueUsers: sql`SUM(CASE WHEN subscriptionStatus = 'overdue' THEN 1 ELSE 0 END)`,
    suspendedUsers: sql`SUM(CASE WHEN isSuspended = 1 THEN 1 ELSE 0 END)`
  }).from(users);
  const [horseStats] = await db.select({
    totalHorses: sql`COUNT(*)`,
    activeHorses: sql`SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END)`
  }).from(horses);
  const [recordStats] = await db.select({
    totalRecords: sql`COUNT(*)`
  }).from(healthRecords);
  const [sessionStats] = await db.select({
    totalSessions: sql`COUNT(*)`,
    completedSessions: sql`SUM(CASE WHEN isCompleted = 1 THEN 1 ELSE 0 END)`
  }).from(trainingSessions);
  return {
    users: userStats,
    horses: horseStats,
    healthRecords: recordStats,
    trainingSessions: sessionStats
  };
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/routers.ts
import { nanoid } from "nanoid";
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});
var subscribedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await getUserById(ctx.user.id);
  if (!user) {
    throw new TRPCError3({ code: "UNAUTHORIZED", message: "User not found" });
  }
  if (user.isSuspended) {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Your account has been suspended. Please contact support." });
  }
  const validStatuses = ["trial", "active"];
  if (!validStatuses.includes(user.subscriptionStatus)) {
    if (user.subscriptionStatus === "trial" && user.trialEndsAt && new Date(user.trialEndsAt) < /* @__PURE__ */ new Date()) {
      throw new TRPCError3({ code: "FORBIDDEN", message: "Your free trial has expired. Please subscribe to continue." });
    }
    if (user.subscriptionStatus === "overdue" || user.subscriptionStatus === "expired") {
      throw new TRPCError3({ code: "FORBIDDEN", message: "Your subscription has expired. Please renew to continue." });
    }
  }
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // User profile and subscription
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      return user;
    }),
    updateProfile: protectedProcedure.input(z2.object({
      name: z2.string().optional(),
      phone: z2.string().optional(),
      location: z2.string().optional(),
      profileImageUrl: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      await updateUser(ctx.user.id, input);
      await logActivity({
        userId: ctx.user.id,
        action: "profile_updated",
        entityType: "user",
        entityId: ctx.user.id,
        details: JSON.stringify(input)
      });
      return { success: true };
    }),
    getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) return null;
      return {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        lastPaymentAt: user.lastPaymentAt
      };
    }),
    getDashboardStats: subscribedProcedure.query(async ({ ctx }) => {
      const horses2 = await getHorsesByUserId(ctx.user.id);
      const upcomingSessions = await getUpcomingTrainingSessions(ctx.user.id);
      const reminders = await getUpcomingReminders(ctx.user.id, 14);
      const latestWeather = await getLatestWeatherLog(ctx.user.id);
      return {
        horseCount: horses2.length,
        upcomingSessionCount: upcomingSessions.length,
        reminderCount: reminders.length,
        latestWeather
      };
    })
  }),
  // Horse management
  horses: router({
    list: subscribedProcedure.query(async ({ ctx }) => {
      return getHorsesByUserId(ctx.user.id);
    }),
    get: subscribedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const horse = await getHorseById(input.id, ctx.user.id);
      if (!horse) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Horse not found" });
      }
      return horse;
    }),
    create: subscribedProcedure.input(z2.object({
      name: z2.string().min(1),
      breed: z2.string().optional(),
      age: z2.number().optional(),
      dateOfBirth: z2.string().optional(),
      height: z2.number().optional(),
      weight: z2.number().optional(),
      color: z2.string().optional(),
      gender: z2.enum(["stallion", "mare", "gelding"]).optional(),
      discipline: z2.string().optional(),
      level: z2.string().optional(),
      registrationNumber: z2.string().optional(),
      microchipNumber: z2.string().optional(),
      notes: z2.string().optional(),
      photoUrl: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const id = await createHorse({
        ...input,
        userId: ctx.user.id,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : void 0
      });
      await logActivity({
        userId: ctx.user.id,
        action: "horse_created",
        entityType: "horse",
        entityId: id,
        details: JSON.stringify({ name: input.name })
      });
      return { id };
    }),
    update: subscribedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      breed: z2.string().optional(),
      age: z2.number().optional(),
      dateOfBirth: z2.string().optional(),
      height: z2.number().optional(),
      weight: z2.number().optional(),
      color: z2.string().optional(),
      gender: z2.enum(["stallion", "mare", "gelding"]).optional(),
      discipline: z2.string().optional(),
      level: z2.string().optional(),
      registrationNumber: z2.string().optional(),
      microchipNumber: z2.string().optional(),
      notes: z2.string().optional(),
      photoUrl: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, dateOfBirth, ...data } = input;
      await updateHorse(id, ctx.user.id, {
        ...data,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : void 0
      });
      await logActivity({
        userId: ctx.user.id,
        action: "horse_updated",
        entityType: "horse",
        entityId: id
      });
      return { success: true };
    }),
    delete: subscribedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteHorse(input.id, ctx.user.id);
      await logActivity({
        userId: ctx.user.id,
        action: "horse_deleted",
        entityType: "horse",
        entityId: input.id
      });
      return { success: true };
    })
  }),
  // Health records
  healthRecords: router({
    listAll: subscribedProcedure.query(async ({ ctx }) => {
      return getHealthRecordsByUserId(ctx.user.id);
    }),
    listByHorse: subscribedProcedure.input(z2.object({ horseId: z2.number() })).query(async ({ ctx, input }) => {
      return getHealthRecordsByHorseId(input.horseId, ctx.user.id);
    }),
    get: subscribedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const record = await getHealthRecordById(input.id, ctx.user.id);
      if (!record) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Health record not found" });
      }
      return record;
    }),
    create: subscribedProcedure.input(z2.object({
      horseId: z2.number(),
      recordType: z2.enum(["vaccination", "deworming", "dental", "farrier", "veterinary", "injury", "medication", "other"]),
      title: z2.string().min(1),
      description: z2.string().optional(),
      recordDate: z2.string(),
      nextDueDate: z2.string().optional(),
      vetName: z2.string().optional(),
      vetPhone: z2.string().optional(),
      vetClinic: z2.string().optional(),
      cost: z2.number().optional(),
      documentUrl: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const id = await createHealthRecord({
        ...input,
        userId: ctx.user.id,
        recordDate: new Date(input.recordDate),
        nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : void 0
      });
      await logActivity({
        userId: ctx.user.id,
        action: "health_record_created",
        entityType: "health_record",
        entityId: id
      });
      return { id };
    }),
    update: subscribedProcedure.input(z2.object({
      id: z2.number(),
      recordType: z2.enum(["vaccination", "deworming", "dental", "farrier", "veterinary", "injury", "medication", "other"]).optional(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      recordDate: z2.string().optional(),
      nextDueDate: z2.string().optional(),
      vetName: z2.string().optional(),
      vetPhone: z2.string().optional(),
      vetClinic: z2.string().optional(),
      cost: z2.number().optional(),
      documentUrl: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, recordDate, nextDueDate, ...data } = input;
      await updateHealthRecord(id, ctx.user.id, {
        ...data,
        recordDate: recordDate ? new Date(recordDate) : void 0,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : void 0
      });
      return { success: true };
    }),
    delete: subscribedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteHealthRecord(input.id, ctx.user.id);
      return { success: true };
    }),
    getReminders: subscribedProcedure.input(z2.object({ days: z2.number().default(30) })).query(async ({ ctx, input }) => {
      return getUpcomingReminders(ctx.user.id, input.days);
    })
  }),
  // Training sessions
  training: router({
    listByHorse: subscribedProcedure.input(z2.object({ horseId: z2.number() })).query(async ({ ctx, input }) => {
      return getTrainingSessionsByHorseId(input.horseId, ctx.user.id);
    }),
    listAll: subscribedProcedure.query(async ({ ctx }) => {
      return getTrainingSessionsByUserId(ctx.user.id);
    }),
    getUpcoming: subscribedProcedure.query(async ({ ctx }) => {
      return getUpcomingTrainingSessions(ctx.user.id);
    }),
    create: subscribedProcedure.input(z2.object({
      horseId: z2.number(),
      sessionDate: z2.string(),
      startTime: z2.string().optional(),
      endTime: z2.string().optional(),
      duration: z2.number().optional(),
      sessionType: z2.enum(["flatwork", "jumping", "hacking", "lunging", "groundwork", "competition", "lesson", "other"]),
      discipline: z2.string().optional(),
      trainer: z2.string().optional(),
      location: z2.string().optional(),
      goals: z2.string().optional(),
      exercises: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const id = await createTrainingSession({
        ...input,
        userId: ctx.user.id,
        sessionDate: new Date(input.sessionDate)
      });
      await logActivity({
        userId: ctx.user.id,
        action: "training_session_created",
        entityType: "training_session",
        entityId: id
      });
      return { id };
    }),
    update: subscribedProcedure.input(z2.object({
      id: z2.number(),
      sessionDate: z2.string().optional(),
      startTime: z2.string().optional(),
      endTime: z2.string().optional(),
      duration: z2.number().optional(),
      sessionType: z2.enum(["flatwork", "jumping", "hacking", "lunging", "groundwork", "competition", "lesson", "other"]).optional(),
      discipline: z2.string().optional(),
      trainer: z2.string().optional(),
      location: z2.string().optional(),
      goals: z2.string().optional(),
      exercises: z2.string().optional(),
      notes: z2.string().optional(),
      performance: z2.enum(["excellent", "good", "average", "poor"]).optional(),
      weather: z2.string().optional(),
      temperature: z2.number().optional(),
      isCompleted: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, sessionDate, ...data } = input;
      await updateTrainingSession(id, ctx.user.id, {
        ...data,
        sessionDate: sessionDate ? new Date(sessionDate) : void 0
      });
      return { success: true };
    }),
    delete: subscribedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteTrainingSession(input.id, ctx.user.id);
      return { success: true };
    }),
    complete: subscribedProcedure.input(z2.object({
      id: z2.number(),
      performance: z2.enum(["excellent", "good", "average", "poor"]).optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      await updateTrainingSession(input.id, ctx.user.id, {
        isCompleted: true,
        performance: input.performance,
        notes: input.notes
      });
      return { success: true };
    })
  }),
  // Feeding plans
  feeding: router({
    listAll: subscribedProcedure.query(async ({ ctx }) => {
      return getFeedingPlansByUserId(ctx.user.id);
    }),
    listByHorse: subscribedProcedure.input(z2.object({ horseId: z2.number() })).query(async ({ ctx, input }) => {
      return getFeedingPlansByHorseId(input.horseId, ctx.user.id);
    }),
    create: subscribedProcedure.input(z2.object({
      horseId: z2.number(),
      feedType: z2.string().min(1),
      brandName: z2.string().optional(),
      quantity: z2.string().min(1),
      unit: z2.string().optional(),
      mealTime: z2.enum(["morning", "midday", "evening", "night"]),
      frequency: z2.string().optional(),
      specialInstructions: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const id = await createFeedingPlan({
        ...input,
        userId: ctx.user.id
      });
      return { id };
    }),
    update: subscribedProcedure.input(z2.object({
      id: z2.number(),
      feedType: z2.string().optional(),
      brandName: z2.string().optional(),
      quantity: z2.string().optional(),
      unit: z2.string().optional(),
      mealTime: z2.enum(["morning", "midday", "evening", "night"]).optional(),
      frequency: z2.string().optional(),
      specialInstructions: z2.string().optional(),
      isActive: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateFeedingPlan(id, ctx.user.id, data);
      return { success: true };
    }),
    delete: subscribedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteFeedingPlan(input.id, ctx.user.id);
      return { success: true };
    })
  }),
  // Documents
  documents: router({
    list: subscribedProcedure.query(async ({ ctx }) => {
      return getDocumentsByUserId(ctx.user.id);
    }),
    listByHorse: subscribedProcedure.input(z2.object({ horseId: z2.number() })).query(async ({ ctx, input }) => {
      return getDocumentsByHorseId(input.horseId, ctx.user.id);
    }),
    upload: subscribedProcedure.input(z2.object({
      fileName: z2.string(),
      fileType: z2.string(),
      fileSize: z2.number(),
      fileData: z2.string(),
      // base64 encoded
      horseId: z2.number().optional(),
      healthRecordId: z2.number().optional(),
      category: z2.enum(["health", "registration", "insurance", "competition", "other"]).optional(),
      description: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const buffer = Buffer.from(input.fileData, "base64");
      const fileKey = `${ctx.user.id}/documents/${nanoid()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.fileType);
      const id = await createDocument({
        userId: ctx.user.id,
        horseId: input.horseId,
        healthRecordId: input.healthRecordId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        fileUrl: url,
        fileKey,
        category: input.category,
        description: input.description
      });
      await logActivity({
        userId: ctx.user.id,
        action: "document_uploaded",
        entityType: "document",
        entityId: id,
        details: JSON.stringify({ fileName: input.fileName })
      });
      return { id, url };
    }),
    delete: subscribedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteDocument(input.id, ctx.user.id);
      return { success: true };
    })
  }),
  // Weather and AI analysis
  weather: router({
    analyze: subscribedProcedure.input(z2.object({
      location: z2.string(),
      temperature: z2.number(),
      humidity: z2.number(),
      windSpeed: z2.number(),
      precipitation: z2.number().optional(),
      conditions: z2.string(),
      uvIndex: z2.number().optional(),
      visibility: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const prompt = `As an equestrian expert, analyze the following weather conditions for horse riding safety and provide a recommendation:

Location: ${input.location}
Temperature: ${input.temperature}\xB0C
Humidity: ${input.humidity}%
Wind Speed: ${input.windSpeed} km/h
Precipitation: ${input.precipitation || 0} mm
Conditions: ${input.conditions}
UV Index: ${input.uvIndex || "Unknown"}
Visibility: ${input.visibility || "Unknown"} km

Please provide:
1. A riding recommendation (excellent, good, fair, poor, or not_recommended)
2. A brief explanation of the conditions
3. Any safety precautions riders should take
4. Best time of day to ride if conditions are marginal

Format your response as JSON with keys: recommendation, explanation, precautions, bestTime`;
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are an expert equestrian advisor specializing in weather safety for horse riding. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ]
      });
      const messageContent = response.choices[0]?.message?.content;
      let aiAnalysis = typeof messageContent === "string" ? messageContent : "";
      let recommendation = "fair";
      try {
        const parsed = JSON.parse(aiAnalysis);
        recommendation = parsed.recommendation || "fair";
      } catch {
        const precip = input.precipitation ?? 0;
        if (input.windSpeed > 50 || precip > 10) {
          recommendation = "not_recommended";
        } else if (input.temperature < 0 || input.temperature > 35) {
          recommendation = "poor";
        } else if (input.windSpeed > 30 || precip > 5) {
          recommendation = "fair";
        } else if (input.temperature >= 10 && input.temperature <= 25) {
          recommendation = "excellent";
        } else {
          recommendation = "good";
        }
      }
      await createWeatherLog({
        userId: ctx.user.id,
        location: input.location,
        temperature: input.temperature,
        humidity: input.humidity,
        windSpeed: input.windSpeed,
        precipitation: input.precipitation,
        conditions: input.conditions,
        uvIndex: input.uvIndex,
        visibility: input.visibility,
        ridingRecommendation: recommendation,
        aiAnalysis
      });
      return {
        recommendation,
        analysis: aiAnalysis
      };
    }),
    getLatest: subscribedProcedure.query(async ({ ctx }) => {
      return getLatestWeatherLog(ctx.user.id);
    }),
    getHistory: subscribedProcedure.input(z2.object({ limit: z2.number().default(7) })).query(async ({ ctx, input }) => {
      return getWeatherHistory(ctx.user.id, input.limit);
    })
  }),
  // Admin routes
  admin: router({
    // User management
    getUsers: adminProcedure2.query(async () => {
      return getAllUsers();
    }),
    getUserDetails: adminProcedure2.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "User not found" });
      }
      const horses2 = await getHorsesByUserId(input.userId);
      const activity = await getUserActivityLogs(input.userId, 20);
      return { user, horses: horses2, activity };
    }),
    suspendUser: adminProcedure2.input(z2.object({
      userId: z2.number(),
      reason: z2.string()
    })).mutation(async ({ ctx, input }) => {
      await suspendUser(input.userId, input.reason);
      await logActivity({
        userId: ctx.user.id,
        action: "user_suspended",
        entityType: "user",
        entityId: input.userId,
        details: JSON.stringify({ reason: input.reason })
      });
      return { success: true };
    }),
    unsuspendUser: adminProcedure2.input(z2.object({ userId: z2.number() })).mutation(async ({ ctx, input }) => {
      await unsuspendUser(input.userId);
      await logActivity({
        userId: ctx.user.id,
        action: "user_unsuspended",
        entityType: "user",
        entityId: input.userId
      });
      return { success: true };
    }),
    deleteUser: adminProcedure2.input(z2.object({ userId: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteUser(input.userId);
      await logActivity({
        userId: ctx.user.id,
        action: "user_deleted",
        entityType: "user",
        entityId: input.userId
      });
      return { success: true };
    }),
    updateUserRole: adminProcedure2.input(z2.object({
      userId: z2.number(),
      role: z2.enum(["user", "admin"])
    })).mutation(async ({ ctx, input }) => {
      await updateUser(input.userId, { role: input.role });
      await logActivity({
        userId: ctx.user.id,
        action: "user_role_updated",
        entityType: "user",
        entityId: input.userId,
        details: JSON.stringify({ newRole: input.role })
      });
      return { success: true };
    }),
    // System stats
    getStats: adminProcedure2.query(async () => {
      return getSystemStats();
    }),
    getOverdueUsers: adminProcedure2.query(async () => {
      return getOverdueSubscriptions();
    }),
    getExpiredTrials: adminProcedure2.query(async () => {
      return getExpiredTrials();
    }),
    // Activity logs
    getActivityLogs: adminProcedure2.input(z2.object({ limit: z2.number().default(100) })).query(async ({ input }) => {
      return getActivityLogs(input.limit);
    }),
    // System settings
    getSettings: adminProcedure2.query(async () => {
      return getAllSettings();
    }),
    updateSetting: adminProcedure2.input(z2.object({
      key: z2.string(),
      value: z2.string(),
      type: z2.enum(["string", "number", "boolean", "json"]).optional(),
      description: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      await upsertSetting(input.key, input.value, input.type, input.description, ctx.user.id);
      await logActivity({
        userId: ctx.user.id,
        action: "setting_updated",
        entityType: "setting",
        details: JSON.stringify({ key: input.key })
      });
      return { success: true };
    }),
    // Backup logs
    getBackupLogs: adminProcedure2.input(z2.object({ limit: z2.number().default(10) })).query(async ({ input }) => {
      return getRecentBackups(input.limit);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
