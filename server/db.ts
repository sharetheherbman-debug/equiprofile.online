import { eq, and, desc, sql, gte, lte, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
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
  adminUnlockAttempts, InsertAdminUnlockAttempt
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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
  return result[0].insertId;
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
  return result[0].insertId;
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
  return result[0].insertId;
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
  return result[0].insertId;
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
  return result[0].insertId;
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
  return result[0].insertId;
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
  return result[0].insertId;
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
    return result[0].insertId;
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

// ============ VACCINATION QUERIES ============

export async function createVaccination(data: InsertVaccination) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vaccinations).values(data);
  return result[0].insertId;
}

export async function getVaccinationsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vaccinations).where(
    and(eq(vaccinations.horseId, horseId), eq(vaccinations.userId, userId))
  ).orderBy(desc(vaccinations.dateAdministered));
}

// ============ DEWORMING QUERIES ============

export async function createDeworming(data: InsertDeworming) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dewormings).values(data);
  return result[0].insertId;
}

export async function getDewormingsByHorseId(horseId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dewormings).where(
    and(eq(dewormings.horseId, horseId), eq(dewormings.userId, userId))
  ).orderBy(desc(dewormings.dateAdministered));
}

// ============ COMPETITION QUERIES ============

export async function createCompetition(data: InsertCompetition) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(competitions).values(data);
  return result[0].insertId;
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
