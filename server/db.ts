import { eq, and, desc, sql, gte, lte, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import type { ResultSetHeader } from "mysql2";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { 
  InsertUser, users, 
  horses, InsertHorse,
  healthRecords, InsertHealthRecord,
  trainingSessions, InsertTrainingSession,
  feedingPlans, InsertFeedingPlan,
  documents, InsertDocument,
  weatherLogs, InsertWeatherLog,
  systemSettings, InsertSystemSetting,
  activityLogs, InsertActivityLog,
  backupLogs, InsertBackupLog,
  stables, InsertStable,
  stableMembers, InsertStableMember,
  stableInvites, InsertStableInvite,
  events, InsertEvent,
  eventReminders, InsertEventReminder,
  feedCosts, InsertFeedCost,
  vaccinations, InsertVaccination,
  dewormings, InsertDeworming,
  shareLinks, InsertShareLink,
  competitions, InsertCompetition,
  documentTags, InsertDocumentTag,
  stripeEvents, InsertStripeEvent,
  messageThreads, InsertMessageThread,
  messages, InsertMessage,
  competitionResults, InsertCompetitionResult,
  trainingProgramTemplates, InsertTrainingProgramTemplate,
  trainingPrograms, InsertTrainingProgram,
  reports, InsertReport,
  reportSchedules, InsertReportSchedule,
  breeding, InsertBreeding,
  foals, InsertFoal,
  pedigree, InsertPedigree,
  lessonBookings, InsertLessonBooking,
  trainerAvailability, InsertTrainerAvailability,
  apiKeys, InsertApiKey,
  webhooks, InsertWebhook,
  adminSessions, InsertAdminSession,
  adminUnlockAttempts, InsertAdminUnlockAttempt,
  treatments, InsertTreatment,
  appointments, InsertAppointment,
  dentalCare, InsertDentalCare,
  xrays, InsertXray,
  tags, InsertTag,
  hoofcare, InsertHoofcare,
  nutritionLogs, InsertNutritionLog,
  nutritionPlans, InsertNutritionPlan,
  careScores, InsertCareScore,
  medicationSchedules, InsertMedicationSchedule,
  medicationLogs, InsertMedicationLog,
  behaviorLogs, InsertBehaviorLog,
  healthAlerts, InsertHealthAlert
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      // Check if this is an access denied error (common with MariaDB/MySQL)
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Access denied') || errorMessage.includes('ER_ACCESS_DENIED_ERROR')) {
        console.error("\n⚠️  Database connection failed with 'Access denied'\n");
        console.error("For MariaDB/MySQL, you may need BOTH host entries:\n");
        console.error("  CREATE USER 'your_db_user'@'localhost' IDENTIFIED BY 'your_password';");
        console.error("  CREATE USER 'your_db_user'@'127.0.0.1' IDENTIFIED BY 'your_password';");
        console.error("  GRANT ALL PRIVILEGES ON your_database.* TO 'your_db_user'@'localhost';");
        console.error("  GRANT ALL PRIVILEGES ON your_database.* TO 'your_db_user'@'127.0.0.1';");
        console.error("  FLUSH PRIVILEGES;\n");
        console.error("Replace 'your_db_user', 'your_password', and 'your_database' with your actual values.\n");
      } else {
        console.warn("[Database] Failed to connect:", error);
      }
      _db = null;
    }
  }
  return _db;
}

// ============ USER QUERIES ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    // Set trial period for new users (7 days)
    if (!values.trialEndsAt) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      values.trialEndsAt = trialEnd;
      values.subscriptionStatus = 'trial';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ...data, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function suspendUser(id: number, reason: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ 
    isSuspended: true, 
    suspendedReason: reason,
    updatedAt: new Date() 
  }).where(eq(users.id, id));
}

export async function unsuspendUser(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ 
    isSuspended: false, 
    suspendedReason: null,
    updatedAt: new Date() 
  }).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) return;
  // Soft delete by deactivating
  await db.update(users).set({ isActive: false, updatedAt: new Date() }).where(eq(users.id, id));
}

export async function getOverdueSubscriptions() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(users).where(
    and(
      eq(users.subscriptionStatus, 'overdue'),
      eq(users.isActive, true)
    )
  );
}

export async function getExpiredTrials() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(users).where(
    and(
      eq(users.subscriptionStatus, 'trial'),
      lte(users.trialEndsAt, now),
      eq(users.isActive, true)
    )
  );
}

// ============ HORSE QUERIES ============

export async function createHorse(data: InsertHorse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(horses).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getHorsesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(horses).where(
    and(eq(horses.userId, userId), eq(horses.isActive, true))
  ).orderBy(desc(horses.createdAt));
}

export async function getHorseById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(horses).where(
    and(eq(horses.id, id), eq(horses.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateHorse(id: number, userId: number, data: Partial<InsertHorse>) {
  const db = await getDb();
  if (!db) return;
  await db.update(horses).set({ ...data, updatedAt: new Date() }).where(
    and(eq(horses.id, id), eq(horses.userId, userId))
  );
}

export async function deleteHorse(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(horses).set({ isActive: false, updatedAt: new Date() }).where(
    and(eq(horses.id, id), eq(horses.userId, userId))
  );
}

// ============ HEALTH RECORD QUERIES ============

export async function createHealthRecord(data: InsertHealthRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(healthRecords).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getHealthRecordsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthRecords).where(
    eq(healthRecords.userId, userId)
  ).orderBy(desc(healthRecords.recordDate));
}

export async function getHealthRecordsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(healthRecords).where(
    and(eq(healthRecords.horseId, horseId), eq(healthRecords.userId, userId))
  ).orderBy(desc(healthRecords.recordDate));
}

export async function getHealthRecordById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(healthRecords).where(
    and(eq(healthRecords.id, id), eq(healthRecords.userId, userId))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateHealthRecord(id: number, userId: number, data: Partial<InsertHealthRecord>) {
  const db = await getDb();
  if (!db) return;
  await db.update(healthRecords).set({ ...data, updatedAt: new Date() }).where(
    and(eq(healthRecords.id, id), eq(healthRecords.userId, userId))
  );
}

export async function deleteHealthRecord(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(healthRecords).where(
    and(eq(healthRecords.id, id), eq(healthRecords.userId, userId))
  );
}

export async function getUpcomingReminders(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return db.select().from(healthRecords).where(
    and(
      eq(healthRecords.userId, userId),
      gte(healthRecords.nextDueDate, now),
      lte(healthRecords.nextDueDate, futureDate)
    )
  ).orderBy(healthRecords.nextDueDate);
}

// ============ TRAINING SESSION QUERIES ============

export async function createTrainingSession(data: InsertTrainingSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trainingSessions).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getTrainingSessionsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingSessions).where(
    and(eq(trainingSessions.horseId, horseId), eq(trainingSessions.userId, userId))
  ).orderBy(desc(trainingSessions.sessionDate));
}

export async function getTrainingSessionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(trainingSessions).where(
    eq(trainingSessions.userId, userId)
  ).orderBy(desc(trainingSessions.sessionDate));
}

export async function getTrainingSessionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(trainingSessions).where(
    and(eq(trainingSessions.id, id), eq(trainingSessions.userId, userId))
  ).limit(1);
  return result[0] || null;
}

export async function getUpcomingTrainingSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date();
  return db.select().from(trainingSessions).where(
    and(
      eq(trainingSessions.userId, userId),
      gte(trainingSessions.sessionDate, today),
      eq(trainingSessions.isCompleted, false)
    )
  ).orderBy(trainingSessions.sessionDate);
}

export async function updateTrainingSession(id: number, userId: number, data: Partial<InsertTrainingSession>) {
  const db = await getDb();
  if (!db) return;
  await db.update(trainingSessions).set({ ...data, updatedAt: new Date() }).where(
    and(eq(trainingSessions.id, id), eq(trainingSessions.userId, userId))
  );
}

export async function deleteTrainingSession(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(trainingSessions).where(
    and(eq(trainingSessions.id, id), eq(trainingSessions.userId, userId))
  );
}

// ============ FEEDING PLAN QUERIES ============

export async function createFeedingPlan(data: InsertFeedingPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(feedingPlans).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getFeedingPlansByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(feedingPlans).where(
    and(
      eq(feedingPlans.userId, userId),
      eq(feedingPlans.isActive, true)
    )
  ).orderBy(feedingPlans.mealTime);
}

export async function getFeedingPlansByHorseId(horseId: number, userId: number) {
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

export async function getFeedingPlanById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(feedingPlans).where(
    and(eq(feedingPlans.id, id), eq(feedingPlans.userId, userId))
  ).limit(1);
  return result[0] || null;
}

export async function updateFeedingPlan(id: number, userId: number, data: Partial<InsertFeedingPlan>) {
  const db = await getDb();
  if (!db) return;
  await db.update(feedingPlans).set({ ...data, updatedAt: new Date() }).where(
    and(eq(feedingPlans.id, id), eq(feedingPlans.userId, userId))
  );
}

export async function deleteFeedingPlan(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(feedingPlans).set({ isActive: false, updatedAt: new Date() }).where(
    and(eq(feedingPlans.id, id), eq(feedingPlans.userId, userId))
  );
}

// ============ DOCUMENT QUERIES ============

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getDocumentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(
    and(eq(documents.horseId, horseId), eq(documents.userId, userId))
  ).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(documents).where(
    and(eq(documents.id, id), eq(documents.userId, userId))
  ).limit(1);
  return result[0] || null;
}

export async function deleteDocument(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(documents).where(
    and(eq(documents.id, id), eq(documents.userId, userId))
  );
}

// ============ WEATHER LOG QUERIES ============

export async function createWeatherLog(data: InsertWeatherLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(weatherLogs).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getLatestWeatherLog(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(weatherLogs).where(
    eq(weatherLogs.userId, userId)
  ).orderBy(desc(weatherLogs.checkedAt)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWeatherHistory(userId: number, limit: number = 7) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(weatherLogs).where(
    eq(weatherLogs.userId, userId)
  ).orderBy(desc(weatherLogs.checkedAt)).limit(limit);
}

// ============ SYSTEM SETTINGS QUERIES ============

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(systemSettings).where(
    eq(systemSettings.settingKey, key)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertSetting(key: string, value: string, type: 'string' | 'number' | 'boolean' | 'json' = 'string', description?: string, updatedBy?: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(systemSettings).values({
    settingKey: key,
    settingValue: value,
    settingType: type,
    description,
    updatedBy
  }).onDuplicateKeyUpdate({
    set: { settingValue: value, updatedBy, updatedAt: new Date() }
  });
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(systemSettings).orderBy(systemSettings.settingKey);
}

// ============ ACTIVITY LOG QUERIES ============

export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}

// Alias for compatibility
export const createActivityLog = logActivity;

export async function getActivityLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

export async function getUserActivityLogs(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).where(
    eq(activityLogs.userId, userId)
  ).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

// ============ BACKUP LOG QUERIES ============

export async function createBackupLog(data: InsertBackupLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(backupLogs).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function updateBackupLog(id: number, data: Partial<InsertBackupLog>) {
  const db = await getDb();
  if (!db) return;
  await db.update(backupLogs).set(data).where(eq(backupLogs.id, id));
}

export async function getRecentBackups(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(backupLogs).orderBy(desc(backupLogs.startedAt)).limit(limit);
}

// ============ ANALYTICS QUERIES ============

export async function getSystemStats() {
  const db = await getDb();
  if (!db) return null;
  
  const [userStats] = await db.select({
    totalUsers: sql<number>`COUNT(*)`,
    activeUsers: sql<number>`SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END)`,
    trialUsers: sql<number>`SUM(CASE WHEN subscriptionStatus = 'trial' THEN 1 ELSE 0 END)`,
    paidUsers: sql<number>`SUM(CASE WHEN subscriptionStatus = 'active' THEN 1 ELSE 0 END)`,
    overdueUsers: sql<number>`SUM(CASE WHEN subscriptionStatus = 'overdue' THEN 1 ELSE 0 END)`,
    suspendedUsers: sql<number>`SUM(CASE WHEN isSuspended = 1 THEN 1 ELSE 0 END)`,
  }).from(users);
  
  const [horseStats] = await db.select({
    totalHorses: sql<number>`COUNT(*)`,
    activeHorses: sql<number>`SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END)`,
  }).from(horses);
  
  const [recordStats] = await db.select({
    totalRecords: sql<number>`COUNT(*)`,
  }).from(healthRecords);
  
  const [sessionStats] = await db.select({
    totalSessions: sql<number>`COUNT(*)`,
    completedSessions: sql<number>`SUM(CASE WHEN isCompleted = 1 THEN 1 ELSE 0 END)`,
  }).from(trainingSessions);
  
  return {
    users: userStats,
    horses: horseStats,
    healthRecords: recordStats,
    trainingSessions: sessionStats,
  };
}

// ============ STRIPE EVENT QUERIES ============

export async function createStripeEvent(eventId: string, eventType: string, payload?: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(stripeEvents).values({
      eventId,
      eventType,
      payload,
    });
    return (result[0] as ResultSetHeader).insertId as number;
  } catch (error) {
    // If duplicate, event already processed
    return null;
  }
}

export async function markStripeEventProcessed(eventId: string, error?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(stripeEvents).set({
    processed: true,
    processedAt: new Date(),
    error,
  }).where(eq(stripeEvents.eventId, eventId));
}

export async function isStripeEventProcessed(eventId: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(stripeEvents).where(
    eq(stripeEvents.eventId, eventId)
  ).limit(1);
  return result.length > 0;
}

// ============ COMPETITION QUERIES ============

export async function createCompetition(data: InsertCompetition) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(competitions).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getCompetitionsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitions).where(
    and(eq(competitions.horseId, horseId), eq(competitions.userId, userId))
  ).orderBy(desc(competitions.date));
}

export async function getCompetitionsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitions).where(
    eq(competitions.userId, userId)
  ).orderBy(desc(competitions.date));
}

// ============ ADMIN SESSION QUERIES ============

export async function getAdminSession(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const sessions = await db.select()
    .from(adminSessions)
    .where(and(
      eq(adminSessions.userId, userId),
      gte(adminSessions.expiresAt, new Date())
    ))
    .limit(1);
  
  return sessions[0] || null;
}

export async function createAdminSession(userId: number, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  // Remove old sessions for this user
  await db.delete(adminSessions).where(eq(adminSessions.userId, userId));
  
  // Create new session
  await db.insert(adminSessions).values({ userId, expiresAt });
}

export async function revokeAdminSession(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminSessions).where(eq(adminSessions.userId, userId));
}

export async function getUnlockAttempts(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const record = await db.select()
    .from(adminUnlockAttempts)
    .where(eq(adminUnlockAttempts.userId, userId))
    .limit(1);
  
  if (!record[0]) return 0;
  
  // Reset if locked period expired
  if (record[0].lockedUntil && record[0].lockedUntil < new Date()) {
    await db.update(adminUnlockAttempts)
      .set({ attempts: 0, lockedUntil: null })
      .where(eq(adminUnlockAttempts.userId, userId));
    return 0;
  }
  
  return record[0].attempts;
}

export async function incrementUnlockAttempts(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const existing = await db.select()
    .from(adminUnlockAttempts)
    .where(eq(adminUnlockAttempts.userId, userId))
    .limit(1);
  
  if (!existing[0]) {
    await db.insert(adminUnlockAttempts).values({ 
      userId, 
      attempts: 1,
      lastAttemptAt: new Date()
    });
    return 1;
  }
  
  const newAttempts = existing[0].attempts + 1;
  await db.update(adminUnlockAttempts)
    .set({ attempts: newAttempts, lastAttemptAt: new Date() })
    .where(eq(adminUnlockAttempts.userId, userId));
  
  return newAttempts;
}

export async function resetUnlockAttempts(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminUnlockAttempts)
    .set({ attempts: 0, lockedUntil: null })
    .where(eq(adminUnlockAttempts.userId, userId));
}

export async function setUnlockLockout(userId: number, minutes: number) {
  const db = await getDb();
  if (!db) return;
  const lockedUntil = new Date(Date.now() + minutes * 60 * 1000);
  await db.update(adminUnlockAttempts)
    .set({ lockedUntil })
    .where(eq(adminUnlockAttempts.userId, userId));
}

export async function getUnlockLockoutTime(userId: number): Promise<Date | null> {
  const db = await getDb();
  if (!db) return null;
  
  const record = await db.select()
    .from(adminUnlockAttempts)
    .where(eq(adminUnlockAttempts.userId, userId))
    .limit(1);
  
  return record[0]?.lockedUntil || null;
}

// ============ API KEY QUERIES ============

export async function createApiKey(data: {
  userId: number;
  stableId?: number;
  name: string;
  permissions?: string[];
  rateLimit?: number;
  expiresAt?: Date;
}): Promise<{ id: number; key: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate secure API key: prefix + random string
  const prefix = 'ep_' + nanoid(4);
  const secret = nanoid(32);
  const fullKey = prefix + '_' + secret;
  
  // Hash the full key for storage
  const keyHash = await bcrypt.hash(fullKey, 10);
  
  const result = await db.insert(apiKeys).values({
    userId: data.userId,
    stableId: data.stableId,
    name: data.name,
    keyHash,
    keyPrefix: prefix,
    permissions: data.permissions ? JSON.stringify(data.permissions) : null,
    rateLimit: data.rateLimit ?? 100,
    expiresAt: data.expiresAt,
  });
  
  // Return the PLAIN KEY only once (never stored)
  return { id: (result[0] as ResultSetHeader).insertId as number, key: fullKey };
}

export async function listApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: apiKeys.id,
    name: apiKeys.name,
    keyPrefix: apiKeys.keyPrefix,
    isActive: apiKeys.isActive,
    rateLimit: apiKeys.rateLimit,
    lastUsedAt: apiKeys.lastUsedAt,
    expiresAt: apiKeys.expiresAt,
    createdAt: apiKeys.createdAt,
  }).from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
}

export async function revokeApiKey(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ isActive: false }).where(
    and(eq(apiKeys.id, id), eq(apiKeys.userId, userId))
  );
}

export async function rotateApiKey(id: number, userId: number): Promise<{ key: string } | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Get existing key
  const existing = await db.select().from(apiKeys).where(
    and(eq(apiKeys.id, id), eq(apiKeys.userId, userId))
  ).limit(1);
  
  if (!existing[0]) return null;
  
  // Generate new key
  const prefix = 'ep_' + nanoid(4);
  const secret = nanoid(32);
  const fullKey = prefix + '_' + secret;
  const keyHash = await bcrypt.hash(fullKey, 10);
  
  // Update
  await db.update(apiKeys).set({
    keyHash,
    keyPrefix: prefix,
  }).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
  
  return { key: fullKey };
}

export async function updateApiKeySettings(id: number, userId: number, data: {
  name?: string;
  rateLimit?: number;
  permissions?: string[];
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.rateLimit !== undefined) updateData.rateLimit = data.rateLimit;
  if (data.permissions !== undefined) updateData.permissions = JSON.stringify(data.permissions);
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  
  await db.update(apiKeys).set(updateData).where(
    and(eq(apiKeys.id, id), eq(apiKeys.userId, userId))
  );
}

export async function verifyApiKey(key: string): Promise<{ userId: number; permissions: string[] } | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Extract prefix
  const prefix = key.substring(0, 7); // "ep_xxxx"
  
  // Find keys with this prefix
  const keys = await db.select().from(apiKeys).where(
    and(
      eq(apiKeys.keyPrefix, prefix),
      eq(apiKeys.isActive, true)
    )
  );
  
  // Check each key with bcrypt
  for (const apiKey of keys) {
    const match = await bcrypt.compare(key, apiKey.keyHash);
    if (match) {
      // Check expiration
      if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
        return null; // Expired
      }
      
      // Update last used
      await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, apiKey.id));
      
      // Parse permissions
      const permissions = apiKey.permissions ? JSON.parse(apiKey.permissions) : [];
      return { userId: apiKey.userId, permissions };
    }
  }
  
  return null;
}

// =====================
// Tasks Functions
// =====================

export async function createTask(data: {
  userId: number;
  horseId?: number;
  title: string;
  description?: string;
  taskType: string;
  priority?: string;
  status?: string;
  dueDate?: Date;
  assignedTo?: string;
  notes?: string;
  reminderDays?: number;
  isRecurring?: boolean;
  recurringInterval?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { tasks } = await import('../drizzle/schema');
  const result = await db.insert(tasks).values(data as any);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getTasksByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { tasks } = await import('../drizzle/schema');
  return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
}

export async function getTasksByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { tasks } = await import('../drizzle/schema');
  return db.select().from(tasks).where(
    and(eq(tasks.horseId, horseId), eq(tasks.userId, userId))
  ).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { tasks } = await import('../drizzle/schema');
  const results = await db.select().from(tasks).where(
    and(eq(tasks.id, id), eq(tasks.userId, userId))
  );
  return results[0] || null;
}

export async function getUpcomingTasks(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const { tasks } = await import('../drizzle/schema');
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return db.select().from(tasks).where(
    and(
      eq(tasks.userId, userId),
      eq(tasks.status, 'pending'),
      lte(tasks.dueDate, futureDate)
    )
  ).orderBy(tasks.dueDate);
}

export async function getUpcomingEvents(userId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  
  const { events } = await import('../drizzle/schema');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  futureDate.setHours(23, 59, 59, 999);
  
  return db.select().from(events).where(
    and(
      eq(events.userId, userId),
      gte(events.startDate, today),
      lte(events.startDate, futureDate)
    )
  ).orderBy(events.startDate);
}

export async function updateTask(id: number, userId: number, data: {
  title?: string;
  description?: string;
  taskType?: string;
  priority?: string;
  status?: string;
  dueDate?: Date;
  completedAt?: Date;
  assignedTo?: string;
  notes?: string;
  reminderDays?: number;
  isRecurring?: boolean;
  recurringInterval?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { tasks } = await import('../drizzle/schema');
  await db.update(tasks).set(data as any).where(
    and(eq(tasks.id, id), eq(tasks.userId, userId))
  );
}

export async function deleteTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { tasks } = await import('../drizzle/schema');
  await db.delete(tasks).where(
    and(eq(tasks.id, id), eq(tasks.userId, userId))
  );
}

export async function completeTask(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { tasks } = await import('../drizzle/schema');
  await db.update(tasks).set({
    status: 'completed',
    completedAt: new Date(),
  }).where(
    and(eq(tasks.id, id), eq(tasks.userId, userId))
  );
}

// =====================
// Contacts Functions
// =====================

export async function createContact(data: {
  userId: number;
  name: string;
  contactType: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  website?: string;
  notes?: string;
  isPrimary?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { contacts } = await import('../drizzle/schema');
  const result = await db.insert(contacts).values(data as any);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getContactsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { contacts } = await import('../drizzle/schema');
  return db.select().from(contacts).where(eq(contacts.userId, userId)).orderBy(desc(contacts.createdAt));
}

export async function getContactById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { contacts } = await import('../drizzle/schema');
  const results = await db.select().from(contacts).where(
    and(eq(contacts.id, id), eq(contacts.userId, userId))
  );
  return results[0] || null;
}

export async function getContactsByType(userId: number, contactType: string) {
  const db = await getDb();
  if (!db) return [];
  
  const { contacts } = await import('../drizzle/schema');
  return db.select().from(contacts).where(
    and(eq(contacts.userId, userId), eq(contacts.contactType, contactType as any))
  ).orderBy(contacts.name);
}

export async function updateContact(id: number, userId: number, data: {
  name?: string;
  contactType?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  website?: string;
  notes?: string;
  isPrimary?: boolean;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { contacts } = await import('../drizzle/schema');
  await db.update(contacts).set(data as any).where(
    and(eq(contacts.id, id), eq(contacts.userId, userId))
  );
}

export async function deleteContact(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { contacts } = await import('../drizzle/schema');
  await db.delete(contacts).where(
    and(eq(contacts.id, id), eq(contacts.userId, userId))
  );
}

// ============ VACCINATION QUERIES ============

export async function createVaccination(data: {
  horseId: number;
  userId: number;
  vaccineName: string;
  vaccineType?: string;
  dateAdministered: Date;
  nextDueDate?: Date;
  batchNumber?: string;
  vetName?: string;
  vetClinic?: string;
  cost?: number;
  notes?: string;
  documentUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { vaccinations } = await import('../drizzle/schema');
  const result = await db.insert(vaccinations).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getVaccinationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { vaccinations } = await import('../drizzle/schema');
  return db.select().from(vaccinations).where(eq(vaccinations.userId, userId)).orderBy(desc(vaccinations.dateAdministered));
}

export async function getVaccinationsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { vaccinations } = await import('../drizzle/schema');
  return db.select().from(vaccinations).where(
    and(eq(vaccinations.horseId, horseId), eq(vaccinations.userId, userId))
  ).orderBy(desc(vaccinations.dateAdministered));
}

export async function getVaccinationById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { vaccinations } = await import('../drizzle/schema');
  const results = await db.select().from(vaccinations).where(
    and(eq(vaccinations.id, id), eq(vaccinations.userId, userId))
  );
  return results[0] || null;
}

export async function updateVaccination(id: number, userId: number, data: {
  vaccineName?: string;
  vaccineType?: string;
  dateAdministered?: Date;
  nextDueDate?: Date;
  batchNumber?: string;
  vetName?: string;
  vetClinic?: string;
  cost?: number;
  notes?: string;
  documentUrl?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { vaccinations } = await import('../drizzle/schema');
  await db.update(vaccinations).set(data).where(
    and(eq(vaccinations.id, id), eq(vaccinations.userId, userId))
  );
}

export async function deleteVaccination(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { vaccinations } = await import('../drizzle/schema');
  await db.delete(vaccinations).where(
    and(eq(vaccinations.id, id), eq(vaccinations.userId, userId))
  );
}

// ============ DEWORMING QUERIES ============

export async function createDeworming(data: {
  horseId: number;
  userId: number;
  productName: string;
  activeIngredient?: string;
  dateAdministered: Date;
  nextDueDate?: Date;
  dosage?: string;
  weight?: number;
  cost?: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { dewormings } = await import('../drizzle/schema');
  const result = await db.insert(dewormings).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getDewormingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { dewormings } = await import('../drizzle/schema');
  return db.select().from(dewormings).where(eq(dewormings.userId, userId)).orderBy(desc(dewormings.dateAdministered));
}

export async function getDewormingsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { dewormings } = await import('../drizzle/schema');
  return db.select().from(dewormings).where(
    and(eq(dewormings.horseId, horseId), eq(dewormings.userId, userId))
  ).orderBy(desc(dewormings.dateAdministered));
}

export async function getDewormingById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { dewormings } = await import('../drizzle/schema');
  const results = await db.select().from(dewormings).where(
    and(eq(dewormings.id, id), eq(dewormings.userId, userId))
  );
  return results[0] || null;
}

export async function updateDeworming(id: number, userId: number, data: {
  productName?: string;
  activeIngredient?: string;
  dateAdministered?: Date;
  nextDueDate?: Date;
  dosage?: string;
  weight?: number;
  cost?: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { dewormings } = await import('../drizzle/schema');
  await db.update(dewormings).set(data).where(
    and(eq(dewormings.id, id), eq(dewormings.userId, userId))
  );
}

export async function deleteDeworming(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { dewormings } = await import('../drizzle/schema');
  await db.delete(dewormings).where(
    and(eq(dewormings.id, id), eq(dewormings.userId, userId))
  );
}

// ============ PEDIGREE QUERIES ============

export async function createOrUpdatePedigree(data: {
  horseId: number;
  sireId?: number;
  sireName?: string;
  damId?: number;
  damName?: string;
  sireOfSireId?: number;
  sireOfSireName?: string;
  damOfSireId?: number;
  damOfSireName?: string;
  sireOfDamId?: number;
  sireOfDamName?: string;
  damOfDamId?: number;
  damOfDamName?: string;
  geneticInfo?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { pedigree } = await import('../drizzle/schema');
  
  // Check if pedigree exists for this horse
  const existing = await db.select().from(pedigree).where(eq(pedigree.horseId, data.horseId));
  
  if (existing.length > 0) {
    // Update existing
    await db.update(pedigree).set(data).where(eq(pedigree.horseId, data.horseId));
    return existing[0].id;
  } else {
    // Create new
    const result = await db.insert(pedigree).values(data);
    return (result[0] as ResultSetHeader).insertId as number;
  }
}

export async function getPedigreeByHorseId(horseId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const { pedigree } = await import('../drizzle/schema');
  const results = await db.select().from(pedigree).where(eq(pedigree.horseId, horseId));
  return results[0] || null;
}

export async function deletePedigree(horseId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const { pedigree } = await import('../drizzle/schema');
  await db.delete(pedigree).where(eq(pedigree.horseId, horseId));
}

// ============ TREATMENTS ============
export async function createTreatment(data: InsertTreatment) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(treatments).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getTreatmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(treatments)
    .where(eq(treatments.userId, userId))
    .orderBy(desc(treatments.startDate));
}

export async function getTreatmentsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(treatments)
    .where(and(eq(treatments.horseId, horseId), eq(treatments.userId, userId)))
    .orderBy(desc(treatments.startDate));
}

export async function getTreatmentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(treatments)
    .where(and(eq(treatments.id, id), eq(treatments.userId, userId)));
  return results[0] || null;
}

export async function updateTreatment(id: number, userId: number, data: Partial<InsertTreatment>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(treatments)
    .set(data)
    .where(and(eq(treatments.id, id), eq(treatments.userId, userId)));
}

export async function deleteTreatment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(treatments)
    .where(and(eq(treatments.id, id), eq(treatments.userId, userId)));
}

// ============ APPOINTMENTS ============
export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(appointments).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getAppointmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(appointments)
    .where(eq(appointments.userId, userId))
    .orderBy(desc(appointments.appointmentDate));
}

export async function getAppointmentsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(appointments)
    .where(and(eq(appointments.horseId, horseId), eq(appointments.userId, userId)))
    .orderBy(desc(appointments.appointmentDate));
}

export async function getAppointmentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
  return results[0] || null;
}

export async function updateAppointment(id: number, userId: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(appointments)
    .set(data)
    .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
}

export async function deleteAppointment(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
}

// ============ DENTAL CARE ============
export async function createDentalCare(data: InsertDentalCare) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(dentalCare).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getDentalCareByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dentalCare)
    .where(eq(dentalCare.userId, userId))
    .orderBy(desc(dentalCare.examDate));
}

export async function getDentalCareByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(dentalCare)
    .where(and(eq(dentalCare.horseId, horseId), eq(dentalCare.userId, userId)))
    .orderBy(desc(dentalCare.examDate));
}

export async function getDentalCareById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(dentalCare)
    .where(and(eq(dentalCare.id, id), eq(dentalCare.userId, userId)));
  return results[0] || null;
}

export async function updateDentalCare(id: number, userId: number, data: Partial<InsertDentalCare>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(dentalCare)
    .set(data)
    .where(and(eq(dentalCare.id, id), eq(dentalCare.userId, userId)));
}

export async function deleteDentalCare(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(dentalCare)
    .where(and(eq(dentalCare.id, id), eq(dentalCare.userId, userId)));
}

// ============ X-RAYS ============
export async function createXray(data: InsertXray) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(xrays).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getXraysByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(xrays)
    .where(eq(xrays.userId, userId))
    .orderBy(desc(xrays.xrayDate));
}

export async function getXraysByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(xrays)
    .where(and(eq(xrays.horseId, horseId), eq(xrays.userId, userId)))
    .orderBy(desc(xrays.xrayDate));
}

export async function getXrayById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(xrays)
    .where(and(eq(xrays.id, id), eq(xrays.userId, userId)));
  return results[0] || null;
}

export async function updateXray(id: number, userId: number, data: Partial<InsertXray>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(xrays)
    .set(data)
    .where(and(eq(xrays.id, id), eq(xrays.userId, userId)));
}

export async function deleteXray(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(xrays)
    .where(and(eq(xrays.id, id), eq(xrays.userId, userId)));
}

// ============ TAGS ============
export async function createTag(data: InsertTag) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(tags).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getTagsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(tags.name);
}

export async function getTagById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)));
  return results[0] || null;
}

export async function updateTag(id: number, userId: number, data: Partial<InsertTag>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(tags)
    .set(data)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)));
}

export async function deleteTag(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)));
}

// ============ HOOFCARE ============
export async function createHoofcare(data: InsertHoofcare) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(hoofcare).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getHoofcareByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(hoofcare)
    .where(eq(hoofcare.userId, userId))
    .orderBy(desc(hoofcare.careDate));
}

export async function getHoofcareByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(hoofcare)
    .where(and(eq(hoofcare.horseId, horseId), eq(hoofcare.userId, userId)))
    .orderBy(desc(hoofcare.careDate));
}

export async function getHoofcareById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(hoofcare)
    .where(and(eq(hoofcare.id, id), eq(hoofcare.userId, userId)));
  return results[0] || null;
}

export async function updateHoofcare(id: number, userId: number, data: Partial<InsertHoofcare>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(hoofcare)
    .set(data)
    .where(and(eq(hoofcare.id, id), eq(hoofcare.userId, userId)));
}

export async function deleteHoofcare(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(hoofcare)
    .where(and(eq(hoofcare.id, id), eq(hoofcare.userId, userId)));
}

// ============ NUTRITION LOGS ============
export async function createNutritionLog(data: InsertNutritionLog) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(nutritionLogs).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getNutritionLogsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(nutritionLogs)
    .where(eq(nutritionLogs.userId, userId))
    .orderBy(desc(nutritionLogs.logDate));
}

export async function getNutritionLogsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(nutritionLogs)
    .where(and(eq(nutritionLogs.horseId, horseId), eq(nutritionLogs.userId, userId)))
    .orderBy(desc(nutritionLogs.logDate));
}

export async function getNutritionLogById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(nutritionLogs)
    .where(and(eq(nutritionLogs.id, id), eq(nutritionLogs.userId, userId)));
  return results[0] || null;
}

export async function updateNutritionLog(id: number, userId: number, data: Partial<InsertNutritionLog>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(nutritionLogs)
    .set(data)
    .where(and(eq(nutritionLogs.id, id), eq(nutritionLogs.userId, userId)));
}

export async function deleteNutritionLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(nutritionLogs)
    .where(and(eq(nutritionLogs.id, id), eq(nutritionLogs.userId, userId)));
}

// ============ NUTRITION PLANS ============
export async function createNutritionPlan(data: InsertNutritionPlan) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(nutritionPlans).values(data);
  return (result[0] as ResultSetHeader).insertId as number;
}

export async function getNutritionPlansByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(nutritionPlans)
    .where(eq(nutritionPlans.userId, userId))
    .orderBy(desc(nutritionPlans.startDate));
}

export async function getNutritionPlansByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(nutritionPlans)
    .where(and(eq(nutritionPlans.horseId, horseId), eq(nutritionPlans.userId, userId)))
    .orderBy(desc(nutritionPlans.startDate));
}

export async function getNutritionPlanById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(nutritionPlans)
    .where(and(eq(nutritionPlans.id, id), eq(nutritionPlans.userId, userId)));
  return results[0] || null;
}

export async function updateNutritionPlan(id: number, userId: number, data: Partial<InsertNutritionPlan>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(nutritionPlans)
    .set(data)
    .where(and(eq(nutritionPlans.id, id), eq(nutritionPlans.userId, userId)));
}

export async function deleteNutritionPlan(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(nutritionPlans)
    .where(and(eq(nutritionPlans.id, id), eq(nutritionPlans.userId, userId)));
}

// ============ CARE INSIGHTS QUERIES ============

// Care Scores
export async function createCareScore(data: InsertCareScore) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.insert(careScores).values(data);
}

export async function getCareScore(horseId: number, userId: number, date: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const results = await db.select()
    .from(careScores)
    .where(and(
      eq(careScores.horseId, horseId),
      eq(careScores.userId, userId),
      eq(careScores.date, date)
    ))
    .limit(1);
  
  return results[0] || null;
}

export async function getCareScoreHistory(horseId: number, userId: number, days: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.select()
    .from(careScores)
    .where(and(
      eq(careScores.horseId, horseId),
      eq(careScores.userId, userId),
      gte(careScores.date, startDate.toISOString().split('T')[0])
    ))
    .orderBy(desc(careScores.date));
}

// Medication Schedules
export async function createMedicationSchedule(data: InsertMedicationSchedule) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(medicationSchedules).values(data);
  return (result as unknown as ResultSetHeader).insertId;
}

export async function getMedicationSchedules(horseId: number, userId: number, activeOnly = true) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const conditions = [
    eq(medicationSchedules.horseId, horseId),
    eq(medicationSchedules.userId, userId)
  ];
  
  if (activeOnly) {
    conditions.push(eq(medicationSchedules.isActive, true));
  }
  
  return await db.select()
    .from(medicationSchedules)
    .where(and(...conditions))
    .orderBy(desc(medicationSchedules.createdAt));
}

export async function getMedicationSchedule(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const results = await db.select()
    .from(medicationSchedules)
    .where(and(eq(medicationSchedules.id, id), eq(medicationSchedules.userId, userId)))
    .limit(1);
  
  return results[0] || null;
}

export async function updateMedicationSchedule(id: number, userId: number, data: Partial<InsertMedicationSchedule>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(medicationSchedules)
    .set(data)
    .where(and(eq(medicationSchedules.id, id), eq(medicationSchedules.userId, userId)));
}

export async function deleteMedicationSchedule(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(medicationSchedules)
    .where(and(eq(medicationSchedules.id, id), eq(medicationSchedules.userId, userId)));
}

// Medication Logs
export async function createMedicationLog(data: InsertMedicationLog) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(medicationLogs).values(data);
  return (result as unknown as ResultSetHeader).insertId;
}

export async function getMedicationLogs(scheduleId: number, userId: number, days = 30) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.select()
    .from(medicationLogs)
    .where(and(
      eq(medicationLogs.scheduleId, scheduleId),
      eq(medicationLogs.userId, userId),
      gte(medicationLogs.administeredAt, startDate)
    ))
    .orderBy(desc(medicationLogs.administeredAt));
}

export async function getMedicationLogsByHorse(horseId: number, userId: number, days = 7) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.select()
    .from(medicationLogs)
    .where(and(
      eq(medicationLogs.horseId, horseId),
      eq(medicationLogs.userId, userId),
      gte(medicationLogs.administeredAt, startDate)
    ))
    .orderBy(desc(medicationLogs.administeredAt));
}

// Behavior Logs
export async function createBehaviorLog(data: InsertBehaviorLog) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(behaviorLogs).values(data);
  return (result as unknown as ResultSetHeader).insertId;
}

export async function getBehaviorLogs(horseId: number, userId: number, days = 30) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await db.select()
    .from(behaviorLogs)
    .where(and(
      eq(behaviorLogs.horseId, horseId),
      eq(behaviorLogs.userId, userId),
      gte(behaviorLogs.logDate, startDate.toISOString().split('T')[0])
    ))
    .orderBy(desc(behaviorLogs.logDate));
}

export async function getBehaviorLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const results = await db.select()
    .from(behaviorLogs)
    .where(and(eq(behaviorLogs.id, id), eq(behaviorLogs.userId, userId)))
    .limit(1);
  
  return results[0] || null;
}

export async function updateBehaviorLog(id: number, userId: number, data: Partial<InsertBehaviorLog>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(behaviorLogs)
    .set(data)
    .where(and(eq(behaviorLogs.id, id), eq(behaviorLogs.userId, userId)));
}

export async function deleteBehaviorLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(behaviorLogs)
    .where(and(eq(behaviorLogs.id, id), eq(behaviorLogs.userId, userId)));
}

// Health Alerts
export async function createHealthAlert(data: InsertHealthAlert) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.insert(healthAlerts).values(data);
  return (result as unknown as ResultSetHeader).insertId;
}

export async function getHealthAlerts(horseId: number, userId: number, resolvedOnly = false) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const conditions = [
    eq(healthAlerts.horseId, horseId),
    eq(healthAlerts.userId, userId)
  ];
  
  if (!resolvedOnly) {
    conditions.push(eq(healthAlerts.isResolved, false));
  }
  
  return await db.select()
    .from(healthAlerts)
    .where(and(...conditions))
    .orderBy(desc(healthAlerts.createdAt));
}

export async function getHealthAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const results = await db.select()
    .from(healthAlerts)
    .where(and(eq(healthAlerts.id, id), eq(healthAlerts.userId, userId)))
    .limit(1);
  
  return results[0] || null;
}

export async function resolveHealthAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.update(healthAlerts)
    .set({ isResolved: true, resolvedAt: new Date() })
    .where(and(eq(healthAlerts.id, id), eq(healthAlerts.userId, userId)));
}

export async function deleteHealthAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.delete(healthAlerts)
    .where(and(eq(healthAlerts.id, id), eq(healthAlerts.userId, userId)));
}
