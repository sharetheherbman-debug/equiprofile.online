var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";
var users, horses, healthRecords, trainingSessions, feedingPlans, documents, weatherLogs, systemSettings, adminSessions, adminUnlockAttempts, activityLogs, backupLogs, stables, stableMembers, stableInvites, events, eventReminders, feedCosts, vaccinations, dewormings, shareLinks, competitions, documentTags, stripeEvents, messageThreads, messages, competitionResults, trainingProgramTemplates, trainingPrograms, reports, reportSchedules, breeding, foals, pedigree, lessonBookings, trainerAvailability, apiKeys, webhooks;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
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
      // User preferences and settings
      preferences: text("preferences"),
      // JSON: theme, language, dashboard layout
      language: varchar("language", { length: 10 }).default("en"),
      theme: mysqlEnum("theme", ["light", "dark", "system"]).default("system"),
      // Timestamps
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    horses = mysqlTable("horses", {
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
    healthRecords = mysqlTable("healthRecords", {
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
    trainingSessions = mysqlTable("trainingSessions", {
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
    feedingPlans = mysqlTable("feedingPlans", {
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
    documents = mysqlTable("documents", {
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
    weatherLogs = mysqlTable("weatherLogs", {
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
    systemSettings = mysqlTable("systemSettings", {
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
    adminSessions = mysqlTable("adminSessions", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      expiresAt: timestamp("expiresAt").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    adminUnlockAttempts = mysqlTable("adminUnlockAttempts", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull().unique(),
      attempts: int("attempts").default(0).notNull(),
      lockedUntil: timestamp("lockedUntil"),
      lastAttemptAt: timestamp("lastAttemptAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    activityLogs = mysqlTable("activityLogs", {
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
    backupLogs = mysqlTable("backupLogs", {
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
    stables = mysqlTable("stables", {
      id: int("id").autoincrement().primaryKey(),
      name: varchar("name", { length: 200 }).notNull(),
      description: text("description"),
      ownerId: int("ownerId").notNull(),
      // The user who created the stable
      location: varchar("location", { length: 255 }),
      logo: text("logo"),
      // Branding and customization
      primaryColor: varchar("primaryColor", { length: 7 }),
      // Hex color
      secondaryColor: varchar("secondaryColor", { length: 7 }),
      customDomain: varchar("customDomain", { length: 255 }),
      branding: text("branding"),
      // JSON: additional branding settings
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    stableMembers = mysqlTable("stableMembers", {
      id: int("id").autoincrement().primaryKey(),
      stableId: int("stableId").notNull(),
      userId: int("userId").notNull(),
      role: mysqlEnum("role", ["owner", "admin", "trainer", "member", "viewer"]).notNull(),
      permissions: text("permissions"),
      // JSON string of specific permissions
      isActive: boolean("isActive").default(true).notNull(),
      joinedAt: timestamp("joinedAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    stableInvites = mysqlTable("stableInvites", {
      id: int("id").autoincrement().primaryKey(),
      stableId: int("stableId").notNull(),
      invitedByUserId: int("invitedByUserId").notNull(),
      email: varchar("email", { length: 320 }).notNull(),
      role: mysqlEnum("role", ["admin", "trainer", "member", "viewer"]).notNull(),
      token: varchar("token", { length: 100 }).notNull().unique(),
      status: mysqlEnum("status", ["pending", "accepted", "declined", "expired"]).default("pending").notNull(),
      expiresAt: timestamp("expiresAt").notNull(),
      acceptedAt: timestamp("acceptedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    events = mysqlTable("events", {
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
      recurrenceRule: text("recurrenceRule"),
      // iCal RRULE format
      color: varchar("color", { length: 7 }),
      // Hex color code
      isCompleted: boolean("isCompleted").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    eventReminders = mysqlTable("eventReminders", {
      id: int("id").autoincrement().primaryKey(),
      eventId: int("eventId").notNull(),
      userId: int("userId").notNull(),
      reminderTime: timestamp("reminderTime").notNull(),
      reminderType: mysqlEnum("reminderType", ["email", "push", "sms"]).notNull(),
      isSent: boolean("isSent").default(false).notNull(),
      sentAt: timestamp("sentAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    feedCosts = mysqlTable("feedCosts", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      horseId: int("horseId"),
      feedType: varchar("feedType", { length: 100 }).notNull(),
      brandName: varchar("brandName", { length: 100 }),
      quantity: varchar("quantity", { length: 50 }).notNull(),
      unit: varchar("unit", { length: 20 }),
      costPerUnit: int("costPerUnit").notNull(),
      // in pence/cents
      purchaseDate: date("purchaseDate").notNull(),
      supplier: varchar("supplier", { length: 200 }),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    vaccinations = mysqlTable("vaccinations", {
      id: int("id").autoincrement().primaryKey(),
      horseId: int("horseId").notNull(),
      userId: int("userId").notNull(),
      vaccineName: varchar("vaccineName", { length: 200 }).notNull(),
      vaccineType: varchar("vaccineType", { length: 100 }),
      // flu, tetanus, etc.
      dateAdministered: date("dateAdministered").notNull(),
      nextDueDate: date("nextDueDate"),
      batchNumber: varchar("batchNumber", { length: 100 }),
      vetName: varchar("vetName", { length: 100 }),
      vetClinic: varchar("vetClinic", { length: 200 }),
      cost: int("cost"),
      // in pence/cents
      notes: text("notes"),
      documentUrl: text("documentUrl"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    dewormings = mysqlTable("dewormings", {
      id: int("id").autoincrement().primaryKey(),
      horseId: int("horseId").notNull(),
      userId: int("userId").notNull(),
      productName: varchar("productName", { length: 200 }).notNull(),
      activeIngredient: varchar("activeIngredient", { length: 200 }),
      dateAdministered: date("dateAdministered").notNull(),
      nextDueDate: date("nextDueDate"),
      dosage: varchar("dosage", { length: 100 }),
      weight: int("weight"),
      // horse weight at time of treatment
      cost: int("cost"),
      // in pence/cents
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    shareLinks = mysqlTable("shareLinks", {
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
      settings: text("settings"),
      // JSON string for privacy settings
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    competitions = mysqlTable("competitions", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      horseId: int("horseId").notNull(),
      competitionName: varchar("competitionName", { length: 200 }).notNull(),
      venue: varchar("venue", { length: 200 }),
      date: date("date").notNull(),
      discipline: varchar("discipline", { length: 100 }),
      // dressage, jumping, etc.
      level: varchar("level", { length: 50 }),
      class: varchar("class", { length: 100 }),
      // specific class/event name
      placement: varchar("placement", { length: 50 }),
      // 1st, 2nd, etc. or score
      score: varchar("score", { length: 50 }),
      notes: text("notes"),
      cost: int("cost"),
      // entry fee in pence/cents
      winnings: int("winnings"),
      // prize money in pence/cents
      documentUrl: text("documentUrl"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    documentTags = mysqlTable("documentTags", {
      id: int("id").autoincrement().primaryKey(),
      documentId: int("documentId").notNull(),
      tag: varchar("tag", { length: 50 }).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    stripeEvents = mysqlTable("stripeEvents", {
      id: int("id").autoincrement().primaryKey(),
      eventId: varchar("eventId", { length: 255 }).notNull().unique(),
      eventType: varchar("eventType", { length: 100 }).notNull(),
      processed: boolean("processed").default(false).notNull(),
      payload: text("payload"),
      // Full event payload for debugging
      error: text("error"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      processedAt: timestamp("processedAt")
    });
    messageThreads = mysqlTable("messageThreads", {
      id: int("id").autoincrement().primaryKey(),
      stableId: int("stableId").notNull(),
      title: varchar("title", { length: 200 }),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    messages = mysqlTable("messages", {
      id: int("id").autoincrement().primaryKey(),
      threadId: int("threadId").notNull(),
      senderId: int("senderId").notNull(),
      content: text("content").notNull(),
      attachments: text("attachments"),
      // JSON array of file URLs
      isRead: boolean("isRead").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    competitionResults = mysqlTable("competitionResults", {
      id: int("id").autoincrement().primaryKey(),
      competitionId: int("competitionId").notNull(),
      userId: int("userId").notNull(),
      horseId: int("horseId").notNull(),
      roundNumber: int("roundNumber").default(1),
      score: varchar("score", { length: 50 }),
      penalties: int("penalties"),
      time: varchar("time", { length: 20 }),
      judgeScores: text("judgeScores"),
      // JSON array of judge scores
      technicalScore: int("technicalScore"),
      artisticScore: int("artisticScore"),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    trainingProgramTemplates = mysqlTable("trainingProgramTemplates", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      stableId: int("stableId"),
      name: varchar("name", { length: 200 }).notNull(),
      description: text("description"),
      duration: int("duration"),
      // in weeks
      discipline: varchar("discipline", { length: 100 }),
      level: varchar("level", { length: 50 }),
      goals: text("goals"),
      programData: text("programData").notNull(),
      // JSON: weekly schedule
      isPublic: boolean("isPublic").default(false).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    trainingPrograms = mysqlTable("trainingPrograms", {
      id: int("id").autoincrement().primaryKey(),
      horseId: int("horseId").notNull(),
      userId: int("userId").notNull(),
      templateId: int("templateId"),
      name: varchar("name", { length: 200 }).notNull(),
      startDate: date("startDate").notNull(),
      endDate: date("endDate"),
      status: mysqlEnum("status", ["active", "completed", "paused", "cancelled"]).default("active").notNull(),
      progress: int("progress").default(0),
      // percentage
      programData: text("programData").notNull(),
      // JSON: customized schedule
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    reports = mysqlTable("reports", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      stableId: int("stableId"),
      horseId: int("horseId"),
      reportType: mysqlEnum("reportType", ["monthly_summary", "health_report", "training_progress", "cost_analysis", "competition_summary"]).notNull(),
      title: varchar("title", { length: 200 }).notNull(),
      reportData: text("reportData").notNull(),
      // JSON: report content
      fileUrl: text("fileUrl"),
      // PDF URL
      generatedAt: timestamp("generatedAt").defaultNow().notNull()
    });
    reportSchedules = mysqlTable("reportSchedules", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      stableId: int("stableId"),
      reportType: mysqlEnum("reportType", ["monthly_summary", "health_report", "training_progress", "cost_analysis", "competition_summary"]).notNull(),
      frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "quarterly"]).notNull(),
      recipients: text("recipients"),
      // JSON array of email addresses
      isActive: boolean("isActive").default(true).notNull(),
      lastRunAt: timestamp("lastRunAt"),
      nextRunAt: timestamp("nextRunAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    breeding = mysqlTable("breeding", {
      id: int("id").autoincrement().primaryKey(),
      mareId: int("mareId").notNull(),
      // horseId of mare
      stallionId: int("stallionId"),
      // horseId of stallion (if owned)
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
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    foals = mysqlTable("foals", {
      id: int("id").autoincrement().primaryKey(),
      breedingId: int("breedingId").notNull(),
      horseId: int("horseId"),
      // linked to horses table after birth
      birthDate: date("birthDate").notNull(),
      gender: mysqlEnum("gender", ["colt", "filly"]),
      name: varchar("name", { length: 100 }),
      color: varchar("color", { length: 50 }),
      markings: text("markings"),
      birthWeight: int("birthWeight"),
      // in kg
      currentWeight: int("currentWeight"),
      healthStatus: varchar("healthStatus", { length: 100 }),
      milestones: text("milestones"),
      // JSON array of development milestones
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    pedigree = mysqlTable("pedigree", {
      id: int("id").autoincrement().primaryKey(),
      horseId: int("horseId").notNull(),
      sireId: int("sireId"),
      // horseId of sire
      sireName: varchar("sireName", { length: 200 }),
      damId: int("damId"),
      // horseId of dam
      damName: varchar("damName", { length: 200 }),
      sireOfSireId: int("sireOfSireId"),
      sireOfSireName: varchar("sireOfSireName", { length: 200 }),
      damOfSireId: int("damOfSireId"),
      damOfSireName: varchar("damOfSireName", { length: 200 }),
      sireOfDamId: int("sireOfDamId"),
      sireOfDamName: varchar("sireOfDamName", { length: 200 }),
      damOfDamId: int("damOfDamId"),
      damOfDamName: varchar("damOfDamName", { length: 200 }),
      geneticInfo: text("geneticInfo"),
      // JSON: genetic markers, health predispositions
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    lessonBookings = mysqlTable("lessonBookings", {
      id: int("id").autoincrement().primaryKey(),
      trainerId: int("trainerId").notNull(),
      clientId: int("clientId").notNull(),
      horseId: int("horseId"),
      lessonDate: timestamp("lessonDate").notNull(),
      duration: int("duration").notNull(),
      // in minutes
      lessonType: varchar("lessonType", { length: 100 }),
      location: varchar("location", { length: 200 }),
      status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
      fee: int("fee"),
      // in pence/cents
      paid: boolean("paid").default(false).notNull(),
      notes: text("notes"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    trainerAvailability = mysqlTable("trainerAvailability", {
      id: int("id").autoincrement().primaryKey(),
      trainerId: int("trainerId").notNull(),
      dayOfWeek: int("dayOfWeek").notNull(),
      // 0-6 (Sunday-Saturday)
      startTime: varchar("startTime", { length: 5 }).notNull(),
      // HH:MM
      endTime: varchar("endTime", { length: 5 }).notNull(),
      // HH:MM
      isActive: boolean("isActive").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    apiKeys = mysqlTable("apiKeys", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      stableId: int("stableId"),
      name: varchar("name", { length: 100 }).notNull(),
      keyHash: varchar("keyHash", { length: 255 }).notNull(),
      // bcrypt hash of key
      keyPrefix: varchar("keyPrefix", { length: 20 }).notNull(),
      // first few chars for identification
      permissions: text("permissions"),
      // JSON array of allowed endpoints
      rateLimit: int("rateLimit").default(100).notNull(),
      // requests per hour
      isActive: boolean("isActive").default(true).notNull(),
      lastUsedAt: timestamp("lastUsedAt"),
      expiresAt: timestamp("expiresAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    webhooks = mysqlTable("webhooks", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      stableId: int("stableId"),
      url: text("url").notNull(),
      events: text("events").notNull(),
      // JSON array of subscribed events
      secret: varchar("secret", { length: 255 }).notNull(),
      isActive: boolean("isActive").default(true).notNull(),
      lastTriggeredAt: timestamp("lastTriggeredAt"),
      failureCount: int("failureCount").default(0),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    if (process.env.NODE_ENV === "production") {
      const requiredVars = [
        "DATABASE_URL",
        "JWT_SECRET",
        "ADMIN_UNLOCK_PASSWORD",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_S3_BUCKET"
      ];
      const missing = requiredVars.filter((v) => !process.env[v]);
      if (missing.length > 0) {
        console.error(`\u274C PRODUCTION ERROR: Missing required environment variables: ${missing.join(", ")}`);
        console.error("Application cannot start. Please configure all required environment variables.");
        process.exit(1);
      }
      if (process.env.ADMIN_UNLOCK_PASSWORD === "ashmor12@") {
        console.error("\u274C PRODUCTION ERROR: ADMIN_UNLOCK_PASSWORD is still set to default value!");
        console.error("You MUST change this to a secure password before running in production.");
        process.exit(1);
      }
    }
    ENV = {
      // App config
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      // Admin unlock
      adminUnlockPassword: process.env.ADMIN_UNLOCK_PASSWORD ?? "ashmor12@",
      // Security
      baseUrl: process.env.BASE_URL ?? "http://localhost:3000",
      cookieDomain: process.env.COOKIE_DOMAIN ?? void 0,
      cookieSecure: process.env.COOKIE_SECURE === "true",
      // Stripe
      stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
      // AWS S3
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      awsRegion: process.env.AWS_REGION ?? "eu-west-2",
      awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
      // OpenAI
      openaiApiKey: process.env.OPENAI_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createAdminSession: () => createAdminSession,
  createApiKey: () => createApiKey,
  createBackupLog: () => createBackupLog,
  createCompetition: () => createCompetition,
  createDeworming: () => createDeworming,
  createDocument: () => createDocument,
  createFeedingPlan: () => createFeedingPlan,
  createHealthRecord: () => createHealthRecord,
  createHorse: () => createHorse,
  createStripeEvent: () => createStripeEvent,
  createTrainingSession: () => createTrainingSession,
  createVaccination: () => createVaccination,
  createWeatherLog: () => createWeatherLog,
  deleteDocument: () => deleteDocument,
  deleteFeedingPlan: () => deleteFeedingPlan,
  deleteHealthRecord: () => deleteHealthRecord,
  deleteHorse: () => deleteHorse,
  deleteTrainingSession: () => deleteTrainingSession,
  deleteUser: () => deleteUser,
  getActivityLogs: () => getActivityLogs,
  getAdminSession: () => getAdminSession,
  getAllSettings: () => getAllSettings,
  getAllUsers: () => getAllUsers,
  getCompetitionsByHorseId: () => getCompetitionsByHorseId,
  getCompetitionsByUserId: () => getCompetitionsByUserId,
  getDb: () => getDb,
  getDewormingsByHorseId: () => getDewormingsByHorseId,
  getDocumentsByHorseId: () => getDocumentsByHorseId,
  getDocumentsByUserId: () => getDocumentsByUserId,
  getExpiredTrials: () => getExpiredTrials,
  getFeedingPlansByHorseId: () => getFeedingPlansByHorseId,
  getFeedingPlansByUserId: () => getFeedingPlansByUserId,
  getHealthRecordById: () => getHealthRecordById,
  getHealthRecordsByHorseId: () => getHealthRecordsByHorseId,
  getHealthRecordsByUserId: () => getHealthRecordsByUserId,
  getHorseById: () => getHorseById,
  getHorsesByUserId: () => getHorsesByUserId,
  getLatestWeatherLog: () => getLatestWeatherLog,
  getOverdueSubscriptions: () => getOverdueSubscriptions,
  getRecentBackups: () => getRecentBackups,
  getSetting: () => getSetting,
  getSystemStats: () => getSystemStats,
  getTrainingSessionsByHorseId: () => getTrainingSessionsByHorseId,
  getTrainingSessionsByUserId: () => getTrainingSessionsByUserId,
  getUnlockAttempts: () => getUnlockAttempts,
  getUnlockLockoutTime: () => getUnlockLockoutTime,
  getUpcomingReminders: () => getUpcomingReminders,
  getUpcomingTrainingSessions: () => getUpcomingTrainingSessions,
  getUserActivityLogs: () => getUserActivityLogs,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getVaccinationsByHorseId: () => getVaccinationsByHorseId,
  getWeatherHistory: () => getWeatherHistory,
  incrementUnlockAttempts: () => incrementUnlockAttempts,
  isStripeEventProcessed: () => isStripeEventProcessed,
  listApiKeys: () => listApiKeys,
  logActivity: () => logActivity,
  markStripeEventProcessed: () => markStripeEventProcessed,
  resetUnlockAttempts: () => resetUnlockAttempts,
  revokeAdminSession: () => revokeAdminSession,
  revokeApiKey: () => revokeApiKey,
  rotateApiKey: () => rotateApiKey,
  setUnlockLockout: () => setUnlockLockout,
  suspendUser: () => suspendUser,
  unsuspendUser: () => unsuspendUser,
  updateApiKeySettings: () => updateApiKeySettings,
  updateBackupLog: () => updateBackupLog,
  updateFeedingPlan: () => updateFeedingPlan,
  updateHealthRecord: () => updateHealthRecord,
  updateHorse: () => updateHorse,
  updateTrainingSession: () => updateTrainingSession,
  updateUser: () => updateUser,
  upsertSetting: () => upsertSetting,
  upsertUser: () => upsertUser,
  verifyApiKey: () => verifyApiKey
});
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
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
async function getSetting(key) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(systemSettings).where(
    eq(systemSettings.settingKey, key)
  ).limit(1);
  return result.length > 0 ? result[0] : void 0;
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
async function createBackupLog(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(backupLogs).values(data);
  return result[0].insertId;
}
async function updateBackupLog(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(backupLogs).set(data).where(eq(backupLogs.id, id));
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
async function createStripeEvent(eventId, eventType, payload) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(stripeEvents).values({
      eventId,
      eventType,
      payload
    });
    return result[0].insertId;
  } catch (error) {
    return null;
  }
}
async function markStripeEventProcessed(eventId, error) {
  const db = await getDb();
  if (!db) return;
  await db.update(stripeEvents).set({
    processed: true,
    processedAt: /* @__PURE__ */ new Date(),
    error
  }).where(eq(stripeEvents.eventId, eventId));
}
async function isStripeEventProcessed(eventId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(stripeEvents).where(
    eq(stripeEvents.eventId, eventId)
  ).limit(1);
  return result.length > 0;
}
async function createVaccination(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(vaccinations).values(data);
  return result[0].insertId;
}
async function getVaccinationsByHorseId(horseId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vaccinations).where(
    and(eq(vaccinations.horseId, horseId), eq(vaccinations.userId, userId))
  ).orderBy(desc(vaccinations.dateAdministered));
}
async function createDeworming(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dewormings).values(data);
  return result[0].insertId;
}
async function getDewormingsByHorseId(horseId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dewormings).where(
    and(eq(dewormings.horseId, horseId), eq(dewormings.userId, userId))
  ).orderBy(desc(dewormings.dateAdministered));
}
async function createCompetition(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(competitions).values(data);
  return result[0].insertId;
}
async function getCompetitionsByHorseId(horseId, userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitions).where(
    and(eq(competitions.horseId, horseId), eq(competitions.userId, userId))
  ).orderBy(desc(competitions.date));
}
async function getCompetitionsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(competitions).where(
    eq(competitions.userId, userId)
  ).orderBy(desc(competitions.date));
}
async function getAdminSession(userId) {
  const db = await getDb();
  if (!db) return null;
  const sessions = await db.select().from(adminSessions).where(and(
    eq(adminSessions.userId, userId),
    gte(adminSessions.expiresAt, /* @__PURE__ */ new Date())
  )).limit(1);
  return sessions[0] || null;
}
async function createAdminSession(userId, expiresAt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(adminSessions).where(eq(adminSessions.userId, userId));
  await db.insert(adminSessions).values({ userId, expiresAt });
}
async function revokeAdminSession(userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminSessions).where(eq(adminSessions.userId, userId));
}
async function getUnlockAttempts(userId) {
  const db = await getDb();
  if (!db) return 0;
  const record = await db.select().from(adminUnlockAttempts).where(eq(adminUnlockAttempts.userId, userId)).limit(1);
  if (!record[0]) return 0;
  if (record[0].lockedUntil && record[0].lockedUntil < /* @__PURE__ */ new Date()) {
    await db.update(adminUnlockAttempts).set({ attempts: 0, lockedUntil: null }).where(eq(adminUnlockAttempts.userId, userId));
    return 0;
  }
  return record[0].attempts;
}
async function incrementUnlockAttempts(userId) {
  const db = await getDb();
  if (!db) return 0;
  const existing = await db.select().from(adminUnlockAttempts).where(eq(adminUnlockAttempts.userId, userId)).limit(1);
  if (!existing[0]) {
    await db.insert(adminUnlockAttempts).values({
      userId,
      attempts: 1,
      lastAttemptAt: /* @__PURE__ */ new Date()
    });
    return 1;
  }
  const newAttempts = existing[0].attempts + 1;
  await db.update(adminUnlockAttempts).set({ attempts: newAttempts, lastAttemptAt: /* @__PURE__ */ new Date() }).where(eq(adminUnlockAttempts.userId, userId));
  return newAttempts;
}
async function resetUnlockAttempts(userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminUnlockAttempts).set({ attempts: 0, lockedUntil: null }).where(eq(adminUnlockAttempts.userId, userId));
}
async function setUnlockLockout(userId, minutes) {
  const db = await getDb();
  if (!db) return;
  const lockedUntil = new Date(Date.now() + minutes * 60 * 1e3);
  await db.update(adminUnlockAttempts).set({ lockedUntil }).where(eq(adminUnlockAttempts.userId, userId));
}
async function getUnlockLockoutTime(userId) {
  const db = await getDb();
  if (!db) return null;
  const record = await db.select().from(adminUnlockAttempts).where(eq(adminUnlockAttempts.userId, userId)).limit(1);
  return record[0]?.lockedUntil || null;
}
async function createApiKey(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const prefix = "ep_" + nanoid(4);
  const secret = nanoid(32);
  const fullKey = prefix + "_" + secret;
  const keyHash = await bcrypt.hash(fullKey, 10);
  const result = await db.insert(apiKeys).values({
    userId: data.userId,
    stableId: data.stableId,
    name: data.name,
    keyHash,
    keyPrefix: prefix,
    permissions: data.permissions ? JSON.stringify(data.permissions) : null,
    rateLimit: data.rateLimit ?? 100,
    expiresAt: data.expiresAt
  });
  return { id: result[0].insertId, key: fullKey };
}
async function listApiKeys(userId) {
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
    createdAt: apiKeys.createdAt
  }).from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
}
async function revokeApiKey(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(apiKeys).set({ isActive: false }).where(
    and(eq(apiKeys.id, id), eq(apiKeys.userId, userId))
  );
}
async function rotateApiKey(id, userId) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(apiKeys).where(
    and(eq(apiKeys.id, id), eq(apiKeys.userId, userId))
  ).limit(1);
  if (!existing[0]) return null;
  const prefix = "ep_" + nanoid(4);
  const secret = nanoid(32);
  const fullKey = prefix + "_" + secret;
  const keyHash = await bcrypt.hash(fullKey, 10);
  await db.update(apiKeys).set({
    keyHash,
    keyPrefix: prefix
  }).where(and(eq(apiKeys.id, id), eq(apiKeys.userId, userId)));
  return { key: fullKey };
}
async function updateApiKeySettings(id, userId, data) {
  const db = await getDb();
  if (!db) return;
  const updateData = {};
  if (data.name !== void 0) updateData.name = data.name;
  if (data.rateLimit !== void 0) updateData.rateLimit = data.rateLimit;
  if (data.permissions !== void 0) updateData.permissions = JSON.stringify(data.permissions);
  if (data.isActive !== void 0) updateData.isActive = data.isActive;
  await db.update(apiKeys).set(updateData).where(
    and(eq(apiKeys.id, id), eq(apiKeys.userId, userId))
  );
}
async function verifyApiKey(key) {
  const db = await getDb();
  if (!db) return null;
  const prefix = key.substring(0, 7);
  const keys = await db.select().from(apiKeys).where(
    and(
      eq(apiKeys.keyPrefix, prefix),
      eq(apiKeys.isActive, true)
    )
  );
  for (const apiKey of keys) {
    const match = await bcrypt.compare(key, apiKey.keyHash);
    if (match) {
      if (apiKey.expiresAt && apiKey.expiresAt < /* @__PURE__ */ new Date()) {
        return null;
      }
      await db.update(apiKeys).set({ lastUsedAt: /* @__PURE__ */ new Date() }).where(eq(apiKeys.id, apiKey.id));
      const permissions = apiKey.permissions ? JSON.parse(apiKey.permissions) : [];
      return { userId: apiKey.userId, permissions };
    }
  }
  return null;
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

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
init_db();
init_env();
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
init_env();
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
var adminUnlockedProcedure = protectedProcedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    const db = await Promise.resolve().then(() => (init_db(), db_exports));
    const session = await db.getAdminSession(ctx.user.id);
    if (!session || session.expiresAt < /* @__PURE__ */ new Date()) {
      throw new TRPCError2({
        code: "FORBIDDEN",
        message: "Admin session expired. Please unlock admin mode in AI Chat."
      });
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
  notifyOwner: adminUnlockedProcedure.input(
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
init_db();
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// server/_core/llm.ts
init_env();
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
    messages: messages3,
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
    messages: messages3.map(normalizeMessage)
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
init_env();
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
import { nanoid as nanoid2 } from "nanoid";

// server/stripe.ts
import Stripe from "stripe";
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("[Stripe] Secret key not configured");
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-12-15.clover",
    typescript: true
  });
}
var STRIPE_PRICING = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || "",
    amount: 799,
    // £7.99 in pence
    currency: "gbp",
    interval: "month"
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || "",
    amount: 7990,
    // £79.90 in pence (equivalent to ~£6.66/month)
    currency: "gbp",
    interval: "year"
  }
};
async function createCheckoutSession(userId, userEmail, priceId, successUrl, cancelUrl, customerId) {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const sessionParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString()
      },
      customer_email: customerId ? void 0 : userEmail,
      allow_promotion_codes: true
    };
    if (customerId) {
      sessionParams.customer = customerId;
    }
    const session = await stripe.checkout.sessions.create(sessionParams);
    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error) {
    console.error("[Stripe] Failed to create checkout session:", error);
    return null;
  }
}
async function createPortalSession(customerId, returnUrl) {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl
    });
    return session.url;
  } catch (error) {
    console.error("[Stripe] Failed to create portal session:", error);
    return null;
  }
}

// server/routers.ts
init_db();
init_schema();
import { eq as eq2, and as and2, desc as desc2, sql as sql2, gte as gte2, lte as lte2, or as or2 } from "drizzle-orm";
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
  // Admin unlock system
  adminUnlock: router({
    // Check if admin mode is unlocked
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const session = await getAdminSession(ctx.user.id);
      return {
        isUnlocked: session ? session.expiresAt > /* @__PURE__ */ new Date() : false,
        expiresAt: session?.expiresAt
      };
    }),
    // Initiate unlock (returns challenge)
    requestUnlock: protectedProcedure.mutation(async ({ ctx }) => {
      const attempts = await getUnlockAttempts(ctx.user.id);
      if (attempts >= 5) {
        const lockedUntil = await getUnlockLockoutTime(ctx.user.id);
        if (lockedUntil && lockedUntil > /* @__PURE__ */ new Date()) {
          throw new TRPCError3({
            code: "TOO_MANY_REQUESTS",
            message: `Too many attempts. Try again after ${lockedUntil.toISOString()}`
          });
        }
      }
      return {
        challenge: "Admin mode requires password. Enter password:",
        attemptsRemaining: Math.max(0, 5 - attempts)
      };
    }),
    // Submit password
    submitPassword: protectedProcedure.input(z2.object({ password: z2.string() })).mutation(async ({ ctx, input }) => {
      const adminPassword = process.env.ADMIN_UNLOCK_PASSWORD || "ashmor12@";
      const attempts = await incrementUnlockAttempts(ctx.user.id);
      if (attempts > 5) {
        await setUnlockLockout(ctx.user.id, 15);
        throw new TRPCError3({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Account locked for 15 minutes." });
      }
      if (input.password !== adminPassword) {
        await logActivity({
          userId: ctx.user.id,
          action: "admin_unlock_failed",
          entityType: "system",
          details: JSON.stringify({ attempts })
        });
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "Incorrect password"
        });
      }
      const expiresAt = new Date(Date.now() + 30 * 60 * 1e3);
      await createAdminSession(ctx.user.id, expiresAt);
      await resetUnlockAttempts(ctx.user.id);
      await logActivity({
        userId: ctx.user.id,
        action: "admin_unlocked",
        entityType: "system",
        details: JSON.stringify({ expiresAt })
      });
      return { success: true, expiresAt };
    }),
    // Revoke admin session
    lock: protectedProcedure.mutation(async ({ ctx }) => {
      await revokeAdminSession(ctx.user.id);
      return { success: true };
    })
  }),
  // AI chat
  ai: router({
    chat: protectedProcedure.input(z2.object({
      messages: z2.array(z2.object({
        role: z2.enum(["system", "user", "assistant"]),
        content: z2.string()
      }))
    })).mutation(async ({ ctx, input }) => {
      const userMessage = input.messages[input.messages.length - 1]?.content.toLowerCase().trim();
      if (userMessage === "show admin") {
        if (ctx.user.role !== "admin") {
          return {
            role: "assistant",
            content: "You do not have admin privileges."
          };
        }
        const session = await getAdminSession(ctx.user.id);
        if (session && session.expiresAt > /* @__PURE__ */ new Date()) {
          return {
            role: "assistant",
            content: `Admin mode is already unlocked. Session expires at ${session.expiresAt.toLocaleString()}.`
          };
        }
        return {
          role: "assistant",
          content: "\u{1F510} **Admin Mode**\n\nPlease enter the admin password to unlock admin features.",
          metadata: { adminChallenge: true }
        };
      }
      const response = await invokeLLM({
        messages: input.messages.map((m) => ({
          role: m.role,
          content: m.content
        }))
      });
      return {
        role: "assistant",
        content: response.choices[0]?.message?.content || "No response"
      };
    })
  }),
  // Billing and subscription management
  billing: router({
    getPricing: publicProcedure.query(() => {
      return {
        monthly: {
          amount: STRIPE_PRICING.monthly.amount,
          currency: STRIPE_PRICING.monthly.currency,
          interval: STRIPE_PRICING.monthly.interval
        },
        yearly: {
          amount: STRIPE_PRICING.yearly.amount,
          currency: STRIPE_PRICING.yearly.currency,
          interval: STRIPE_PRICING.yearly.interval
        }
      };
    }),
    createCheckout: protectedProcedure.input(z2.object({
      plan: z2.enum(["monthly", "yearly"])
    })).mutation(async ({ ctx, input }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "User not found" });
      }
      const priceId = input.plan === "monthly" ? STRIPE_PRICING.monthly.priceId : STRIPE_PRICING.yearly.priceId;
      if (!priceId) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Stripe price ID not configured"
        });
      }
      const protocol = ctx.req.protocol || "https";
      const host = ctx.req.headers.host || "equiprofile.online";
      const baseUrl = `${protocol}://${host}`;
      const session = await createCheckoutSession(
        user.id,
        user.email || "",
        priceId,
        `${baseUrl}/dashboard?success=true`,
        `${baseUrl}/pricing?cancelled=true`,
        user.stripeCustomerId || void 0
      );
      if (!session) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkout session"
        });
      }
      return { url: session.url };
    }),
    createPortal: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user || !user.stripeCustomerId) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "No active subscription found"
        });
      }
      const protocol = ctx.req.protocol || "https";
      const host = ctx.req.headers.host || "equiprofile.online";
      const baseUrl = `${protocol}://${host}`;
      const portalUrl = await createPortalSession(
        user.stripeCustomerId,
        `${baseUrl}/dashboard`
      );
      if (!portalUrl) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create portal session"
        });
      }
      return { url: portalUrl };
    }),
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) return null;
      return {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        lastPaymentAt: user.lastPaymentAt,
        hasActiveSubscription: ["trial", "active"].includes(user.subscriptionStatus)
      };
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
      const fileKey = `${ctx.user.id}/documents/${nanoid2()}-${input.fileName}`;
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
    getUsers: adminUnlockedProcedure.query(async () => {
      return getAllUsers();
    }),
    getUserDetails: adminUnlockedProcedure.input(z2.object({ userId: z2.number() })).query(async ({ input }) => {
      const user = await getUserById(input.userId);
      if (!user) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "User not found" });
      }
      const horses2 = await getHorsesByUserId(input.userId);
      const activity = await getUserActivityLogs(input.userId, 20);
      return { user, horses: horses2, activity };
    }),
    suspendUser: adminUnlockedProcedure.input(z2.object({
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
    unsuspendUser: adminUnlockedProcedure.input(z2.object({ userId: z2.number() })).mutation(async ({ ctx, input }) => {
      await unsuspendUser(input.userId);
      await logActivity({
        userId: ctx.user.id,
        action: "user_unsuspended",
        entityType: "user",
        entityId: input.userId
      });
      return { success: true };
    }),
    deleteUser: adminUnlockedProcedure.input(z2.object({ userId: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteUser(input.userId);
      await logActivity({
        userId: ctx.user.id,
        action: "user_deleted",
        entityType: "user",
        entityId: input.userId
      });
      return { success: true };
    }),
    updateUserRole: adminUnlockedProcedure.input(z2.object({
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
    getStats: adminUnlockedProcedure.query(async () => {
      return getSystemStats();
    }),
    getOverdueUsers: adminUnlockedProcedure.query(async () => {
      return getOverdueSubscriptions();
    }),
    getExpiredTrials: adminUnlockedProcedure.query(async () => {
      return getExpiredTrials();
    }),
    // Activity logs
    getActivityLogs: adminUnlockedProcedure.input(z2.object({ limit: z2.number().default(100) })).query(async ({ input }) => {
      return getActivityLogs(input.limit);
    }),
    // System settings
    getSettings: adminUnlockedProcedure.query(async () => {
      return getAllSettings();
    }),
    updateSetting: adminUnlockedProcedure.input(z2.object({
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
    getBackupLogs: adminUnlockedProcedure.input(z2.object({ limit: z2.number().default(10) })).query(async ({ input }) => {
      return getRecentBackups(input.limit);
    }),
    // API Key Management
    apiKeys: router({
      list: adminUnlockedProcedure.query(async ({ ctx }) => {
        return listApiKeys(ctx.user.id);
      }),
      create: adminUnlockedProcedure.input(z2.object({
        name: z2.string().min(1).max(100),
        rateLimit: z2.number().min(1).max(1e4).optional(),
        permissions: z2.array(z2.string()).optional(),
        expiresAt: z2.string().optional()
      })).mutation(async ({ ctx, input }) => {
        const result = await createApiKey({
          userId: ctx.user.id,
          name: input.name,
          rateLimit: input.rateLimit,
          permissions: input.permissions,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : void 0
        });
        await logActivity({
          userId: ctx.user.id,
          action: "api_key_created",
          entityType: "api_key",
          entityId: result.id,
          details: JSON.stringify({ name: input.name })
        });
        return result;
      }),
      revoke: adminUnlockedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        await revokeApiKey(input.id, ctx.user.id);
        await logActivity({
          userId: ctx.user.id,
          action: "api_key_revoked",
          entityType: "api_key",
          entityId: input.id
        });
        return { success: true };
      }),
      rotate: adminUnlockedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
        const result = await rotateApiKey(input.id, ctx.user.id);
        if (!result) {
          throw new TRPCError3({ code: "NOT_FOUND", message: "API key not found" });
        }
        await logActivity({
          userId: ctx.user.id,
          action: "api_key_rotated",
          entityType: "api_key",
          entityId: input.id
        });
        return result;
      }),
      updateSettings: adminUnlockedProcedure.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        rateLimit: z2.number().optional(),
        permissions: z2.array(z2.string()).optional(),
        isActive: z2.boolean().optional()
      })).mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await updateApiKeySettings(id, ctx.user.id, data);
        await logActivity({
          userId: ctx.user.id,
          action: "api_key_updated",
          entityType: "api_key",
          entityId: id
        });
        return { success: true };
      })
    }),
    // Environment Health Check
    getEnvHealth: adminUnlockedProcedure.query(() => {
      const checks = [
        { name: "DATABASE_URL", status: !!process.env.DATABASE_URL, critical: true },
        { name: "JWT_SECRET", status: !!process.env.JWT_SECRET, critical: true },
        { name: "ADMIN_UNLOCK_PASSWORD", status: !!process.env.ADMIN_UNLOCK_PASSWORD, critical: true },
        { name: "STRIPE_SECRET_KEY", status: !!process.env.STRIPE_SECRET_KEY, critical: true },
        { name: "STRIPE_WEBHOOK_SECRET", status: !!process.env.STRIPE_WEBHOOK_SECRET, critical: true },
        { name: "AWS_ACCESS_KEY_ID", status: !!process.env.AWS_ACCESS_KEY_ID, critical: true },
        { name: "AWS_SECRET_ACCESS_KEY", status: !!process.env.AWS_SECRET_ACCESS_KEY, critical: true },
        { name: "AWS_S3_BUCKET", status: !!process.env.AWS_S3_BUCKET, critical: true },
        { name: "OPENAI_API_KEY", status: !!process.env.OPENAI_API_KEY, critical: false },
        { name: "SMTP_HOST", status: !!process.env.SMTP_HOST, critical: false }
      ];
      const allCriticalOk = checks.filter((c) => c.critical).every((c) => c.status);
      return {
        healthy: allCriticalOk,
        checks,
        environment: process.env.NODE_ENV || "development",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    })
  }),
  // Stable management
  stables: router({
    create: subscribedProcedure.input(z2.object({
      name: z2.string().min(1).max(200),
      description: z2.string().optional(),
      location: z2.string().optional(),
      logo: z2.string().optional(),
      primaryColor: z2.string().optional(),
      secondaryColor: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const result = await db.insert(stables).values({
        ...input,
        ownerId: ctx.user.id
      });
      await db.insert(stableMembers).values({
        stableId: result[0].insertId,
        userId: ctx.user.id,
        role: "owner"
      });
      return { id: result[0].insertId };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const members = await db.select().from(stableMembers).where(eq2(stableMembers.userId, ctx.user.id));
      if (members.length === 0) return [];
      const stableIds = members.map((m) => m.stableId);
      return db.select().from(stables).where(and2(
        sql2`id IN (${stableIds.join(",")})`,
        eq2(stables.isActive, true)
      ));
    }),
    getById: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const member = await db.select().from(stableMembers).where(and2(
        eq2(stableMembers.stableId, input.id),
        eq2(stableMembers.userId, ctx.user.id)
      )).limit(1);
      if (member.length === 0) {
        throw new TRPCError3({ code: "FORBIDDEN", message: "Access denied" });
      }
      const stable = await db.select().from(stables).where(eq2(stables.id, input.id)).limit(1);
      return stable[0] || null;
    }),
    update: subscribedProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      description: z2.string().optional(),
      location: z2.string().optional(),
      logo: z2.string().optional(),
      primaryColor: z2.string().optional(),
      secondaryColor: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const member = await db.select().from(stableMembers).where(and2(
        eq2(stableMembers.stableId, input.id),
        eq2(stableMembers.userId, ctx.user.id)
      )).limit(1);
      if (member.length === 0 || !["owner", "admin"].includes(member[0].role)) {
        throw new TRPCError3({ code: "FORBIDDEN" });
      }
      const { id, ...updateData } = input;
      await db.update(stables).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(stables.id, id));
      return { success: true };
    }),
    inviteMember: subscribedProcedure.input(z2.object({
      stableId: z2.number(),
      email: z2.string().email(),
      role: z2.enum(["admin", "trainer", "member", "viewer"])
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const member = await db.select().from(stableMembers).where(and2(
        eq2(stableMembers.stableId, input.stableId),
        eq2(stableMembers.userId, ctx.user.id)
      )).limit(1);
      if (member.length === 0 || !["owner", "admin"].includes(member[0].role)) {
        throw new TRPCError3({ code: "FORBIDDEN" });
      }
      const token = nanoid2(32);
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await db.insert(stableInvites).values({
        stableId: input.stableId,
        invitedByUserId: ctx.user.id,
        email: input.email,
        role: input.role,
        token,
        expiresAt
      });
      return { token, expiresAt };
    }),
    getMembers: protectedProcedure.input(z2.object({ stableId: z2.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const isMember = await db.select().from(stableMembers).where(and2(
        eq2(stableMembers.stableId, input.stableId),
        eq2(stableMembers.userId, ctx.user.id)
      )).limit(1);
      if (isMember.length === 0) {
        throw new TRPCError3({ code: "FORBIDDEN" });
      }
      return db.select().from(stableMembers).where(and2(
        eq2(stableMembers.stableId, input.stableId),
        eq2(stableMembers.isActive, true)
      ));
    })
  }),
  // Messages
  messages: router({
    getThreads: protectedProcedure.input(z2.object({ stableId: z2.number() })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(messageThreads).where(and2(
        eq2(messageThreads.stableId, input.stableId),
        eq2(messageThreads.isActive, true)
      )).orderBy(desc2(messageThreads.updatedAt));
    }),
    getMessages: protectedProcedure.input(z2.object({
      threadId: z2.number(),
      limit: z2.number().default(50)
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(messages).where(eq2(messages.threadId, input.threadId)).orderBy(desc2(messages.createdAt)).limit(input.limit);
    }),
    sendMessage: protectedProcedure.input(z2.object({
      threadId: z2.number(),
      content: z2.string().min(1),
      attachments: z2.array(z2.string()).optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(messages).values({
        threadId: input.threadId,
        senderId: ctx.user.id,
        content: input.content,
        attachments: input.attachments ? JSON.stringify(input.attachments) : null
      });
      return { id: result[0].insertId };
    }),
    createThread: protectedProcedure.input(z2.object({
      stableId: z2.number(),
      title: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(messageThreads).values({
        stableId: input.stableId,
        title: input.title
      });
      return { id: result[0].insertId };
    })
  }),
  // Analytics
  analytics: router({
    getTrainingStats: protectedProcedure.input(z2.object({
      horseId: z2.number().optional(),
      startDate: z2.string().optional(),
      endDate: z2.string().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      let query = db.select({
        totalSessions: sql2`COUNT(*)`,
        completedSessions: sql2`SUM(CASE WHEN isCompleted = 1 THEN 1 ELSE 0 END)`,
        totalDuration: sql2`SUM(duration)`,
        avgPerformance: sql2`AVG(CASE 
            WHEN performance = 'excellent' THEN 4
            WHEN performance = 'good' THEN 3
            WHEN performance = 'average' THEN 2
            WHEN performance = 'poor' THEN 1
            ELSE 0 END)`
      }).from(trainingSessions).where(eq2(trainingSessions.userId, ctx.user.id));
      if (input.horseId) {
        query = query.where(eq2(trainingSessions.horseId, input.horseId));
      }
      const result = await query;
      return result[0] || null;
    }),
    getHealthStats: protectedProcedure.input(z2.object({
      horseId: z2.number().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select({
        totalRecords: sql2`COUNT(*)`,
        upcomingReminders: sql2`SUM(CASE WHEN nextDueDate >= CURDATE() THEN 1 ELSE 0 END)`,
        overdueReminders: sql2`SUM(CASE WHEN nextDueDate < CURDATE() THEN 1 ELSE 0 END)`
      }).from(healthRecords).where(eq2(healthRecords.userId, ctx.user.id));
      return result[0] || null;
    }),
    getCostAnalysis: protectedProcedure.input(z2.object({
      horseId: z2.number().optional(),
      startDate: z2.string().optional(),
      endDate: z2.string().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const feedCostsResult = await db.select({
        totalCost: sql2`SUM(costPerUnit)`
      }).from(feedCosts).where(eq2(feedCosts.userId, ctx.user.id));
      const healthCostsResult = await db.select({
        totalCost: sql2`SUM(cost)`
      }).from(healthRecords).where(eq2(healthRecords.userId, ctx.user.id));
      return {
        feedCosts: feedCostsResult[0]?.totalCost || 0,
        healthCosts: healthCostsResult[0]?.totalCost || 0,
        totalCosts: (feedCostsResult[0]?.totalCost || 0) + (healthCostsResult[0]?.totalCost || 0)
      };
    })
  }),
  // Reports
  reports: router({
    generate: subscribedProcedure.input(z2.object({
      reportType: z2.enum(["monthly_summary", "health_report", "training_progress", "cost_analysis", "competition_summary"]),
      horseId: z2.number().optional(),
      stableId: z2.number().optional(),
      startDate: z2.string().optional(),
      endDate: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      let reportData = {};
      const result = await db.insert(reports).values({
        userId: ctx.user.id,
        stableId: input.stableId,
        horseId: input.horseId,
        reportType: input.reportType,
        title: `${input.reportType.replace("_", " ")} Report`,
        reportData: JSON.stringify(reportData)
      });
      return { id: result[0].insertId };
    }),
    list: protectedProcedure.input(z2.object({
      limit: z2.number().default(20)
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(reports).where(eq2(reports.userId, ctx.user.id)).orderBy(desc2(reports.generatedAt)).limit(input.limit);
    }),
    scheduleReport: subscribedProcedure.input(z2.object({
      reportType: z2.enum(["monthly_summary", "health_report", "training_progress", "cost_analysis", "competition_summary"]),
      frequency: z2.enum(["daily", "weekly", "monthly", "quarterly"]),
      recipients: z2.array(z2.string().email()),
      stableId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(reportSchedules).values({
        userId: ctx.user.id,
        stableId: input.stableId,
        reportType: input.reportType,
        frequency: input.frequency,
        recipients: JSON.stringify(input.recipients),
        nextRunAt: /* @__PURE__ */ new Date()
      });
      return { id: result[0].insertId };
    })
  }),
  // Calendar and Events
  calendar: router({
    getEvents: protectedProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string(),
      stableId: z2.number().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(events).where(and2(
        eq2(events.userId, ctx.user.id),
        gte2(events.startDate, new Date(input.startDate)),
        lte2(events.startDate, new Date(input.endDate))
      )).orderBy(events.startDate);
    }),
    createEvent: subscribedProcedure.input(z2.object({
      title: z2.string().min(1).max(200),
      description: z2.string().optional(),
      eventType: z2.enum(["training", "competition", "veterinary", "farrier", "lesson", "meeting", "other"]),
      startDate: z2.string(),
      endDate: z2.string().optional(),
      horseId: z2.number().optional(),
      stableId: z2.number().optional(),
      location: z2.string().optional(),
      isAllDay: z2.boolean().default(false),
      color: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(events).values({
        ...input,
        userId: ctx.user.id,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null
      });
      return { id: result[0].insertId };
    }),
    updateEvent: subscribedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      startDate: z2.string().optional(),
      endDate: z2.string().optional(),
      isCompleted: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...updateData } = input;
      await db.update(events).set({
        ...updateData,
        startDate: updateData.startDate ? new Date(updateData.startDate) : void 0,
        endDate: updateData.endDate ? new Date(updateData.endDate) : void 0,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and2(
        eq2(events.id, id),
        eq2(events.userId, ctx.user.id)
      ));
      return { success: true };
    }),
    deleteEvent: subscribedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(events).where(and2(
        eq2(events.id, input.id),
        eq2(events.userId, ctx.user.id)
      ));
      return { success: true };
    })
  }),
  // Competition Management
  competitions: router({
    create: subscribedProcedure.input(z2.object({
      horseId: z2.number(),
      competitionName: z2.string().min(1).max(200),
      venue: z2.string().optional(),
      date: z2.string(),
      discipline: z2.string().optional(),
      level: z2.string().optional(),
      class: z2.string().optional(),
      placement: z2.string().optional(),
      score: z2.string().optional(),
      notes: z2.string().optional(),
      cost: z2.number().optional(),
      winnings: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(competitions).values({
        ...input,
        userId: ctx.user.id,
        date: new Date(input.date)
      });
      return { id: result[0].insertId };
    }),
    list: protectedProcedure.input(z2.object({
      horseId: z2.number().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      if (input.horseId) {
        return db.getCompetitionsByHorseId(input.horseId, ctx.user.id);
      }
      return db.getCompetitionsByUserId(ctx.user.id);
    })
  }),
  // Training Program Templates
  trainingPrograms: router({
    listTemplates: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(trainingProgramTemplates).where(or2(
        eq2(trainingProgramTemplates.userId, ctx.user.id),
        eq2(trainingProgramTemplates.isPublic, true)
      )).orderBy(desc2(trainingProgramTemplates.createdAt));
    }),
    createTemplate: subscribedProcedure.input(z2.object({
      name: z2.string().min(1).max(200),
      description: z2.string().optional(),
      duration: z2.number().optional(),
      discipline: z2.string().optional(),
      level: z2.string().optional(),
      goals: z2.string().optional(),
      programData: z2.string(),
      isPublic: z2.boolean().default(false)
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(trainingProgramTemplates).values({
        ...input,
        userId: ctx.user.id
      });
      return { id: result[0].insertId };
    }),
    applyTemplate: subscribedProcedure.input(z2.object({
      templateId: z2.number(),
      horseId: z2.number(),
      startDate: z2.string()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const template = await db.select().from(trainingProgramTemplates).where(eq2(trainingProgramTemplates.id, input.templateId)).limit(1);
      if (template.length === 0) {
        throw new TRPCError3({ code: "NOT_FOUND" });
      }
      const result = await db.insert(trainingPrograms).values({
        horseId: input.horseId,
        userId: ctx.user.id,
        templateId: input.templateId,
        name: template[0].name,
        startDate: new Date(input.startDate),
        programData: template[0].programData
      });
      return { id: result[0].insertId };
    })
  }),
  // Breeding Management
  breeding: router({
    createRecord: subscribedProcedure.input(z2.object({
      mareId: z2.number(),
      stallionId: z2.number().optional(),
      stallionName: z2.string().optional(),
      breedingDate: z2.string(),
      method: z2.enum(["natural", "artificial", "embryo_transfer"]),
      veterinarianName: z2.string().optional(),
      cost: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(breeding).values({
        ...input,
        breedingDate: new Date(input.breedingDate)
      });
      return { id: result[0].insertId };
    }),
    list: protectedProcedure.input(z2.object({
      mareId: z2.number().optional()
    })).query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      let query = db.select().from(breeding);
      if (input.mareId) {
        query = query.where(eq2(breeding.mareId, input.mareId));
      }
      return query.orderBy(desc2(breeding.breedingDate));
    }),
    addFoal: subscribedProcedure.input(z2.object({
      breedingId: z2.number(),
      birthDate: z2.string(),
      gender: z2.enum(["colt", "filly"]),
      name: z2.string().optional(),
      color: z2.string().optional(),
      birthWeight: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(foals).values({
        ...input,
        birthDate: new Date(input.birthDate)
      });
      return { id: result[0].insertId };
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
import { nanoid as nanoid3 } from "nanoid";
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
        `src="/src/main.tsx?v=${nanoid3()}"`
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
init_db();
import { nanoid as nanoid4 } from "nanoid";
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
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? void 0 : false,
    crossOriginEmbedderPolicy: false
  }));
  app.use((req, res, next) => {
    req.headers["x-request-id"] = req.headers["x-request-id"] || nanoid4();
    res.setHeader("X-Request-ID", req.headers["x-request-id"]);
    next();
  });
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[${req.headers["x-request-id"]}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });
    next();
  });
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
    // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use("/api", limiter);
  app.post("/api/webhooks/stripe", express2.raw({ type: "application/json" }), async (req, res) => {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ error: "Stripe not configured" });
    }
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: "Missing signature or secret" });
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }
    const alreadyProcessed = await isStripeEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`[Stripe Webhook] Event ${event.id} already processed`);
      return res.json({ received: true, cached: true });
    }
    await createStripeEvent(event.id, event.type, JSON.stringify(event.data.object));
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = parseInt(session.metadata?.userId || "0");
          if (userId && session.customer && session.subscription) {
            await updateUser(userId, {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              subscriptionStatus: "active",
              lastPaymentAt: /* @__PURE__ */ new Date()
            });
            console.log(`[Stripe Webhook] User ${userId} subscription activated`);
          }
          break;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const userId = await getUserIdByStripeSubscription(subscription.id);
          if (userId) {
            let status = "active";
            if (subscription.status === "past_due") status = "overdue";
            if (subscription.status === "canceled" || subscription.status === "unpaid") status = "cancelled";
            if (subscription.status === "incomplete_expired") status = "expired";
            await updateUser(userId, {
              subscriptionStatus: status,
              subscriptionEndsAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1e3) : null
            });
            console.log(`[Stripe Webhook] User ${userId} subscription updated to ${status}`);
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const userId = await getUserIdByStripeSubscription(subscription.id);
          if (userId) {
            await updateUser(userId, {
              subscriptionStatus: "cancelled",
              subscriptionEndsAt: /* @__PURE__ */ new Date()
            });
            console.log(`[Stripe Webhook] User ${userId} subscription cancelled`);
          }
          break;
        }
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          if (subscriptionId) {
            const userId = await getUserIdByStripeSubscription(subscriptionId);
            if (userId) {
              await updateUser(userId, {
                subscriptionStatus: "active",
                lastPaymentAt: /* @__PURE__ */ new Date()
              });
              console.log(`[Stripe Webhook] User ${userId} payment succeeded`);
            }
          }
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const subscriptionId = invoice.subscription;
          if (subscriptionId) {
            const userId = await getUserIdByStripeSubscription(subscriptionId);
            if (userId) {
              await updateUser(userId, {
                subscriptionStatus: "overdue"
              });
              console.log(`[Stripe Webhook] User ${userId} payment failed`);
            }
          }
          break;
        }
        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }
      await markStripeEventProcessed(event.id);
      res.json({ received: true });
    } catch (error) {
      console.error(`[Stripe Webhook] Error processing event ${event.id}:`, error);
      await markStripeEventProcessed(event.id, error.message);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
  async function getUserIdByStripeSubscription(subscriptionId) {
    const users2 = await getAllUsers();
    const user = users2.find((u) => u.stripeSubscriptionId === subscriptionId);
    return user?.id || null;
  }
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", async (req, res) => {
    const dbConnected = !!await getDb();
    const stripeConfigured = !!getStripe();
    res.json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0",
      services: {
        database: dbConnected,
        stripe: stripeConfigured
      }
    });
  });
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
