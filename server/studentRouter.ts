// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
// Student system router — Phase 2 backend integration
import {
  protectedProcedure,
  router,
} from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM, isAIConfigured } from "./_core/llm";
import { getRuntimeConfig } from "./dynamicConfig";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  virtualHorses,
  studentHorseAssignments,
  studentTasks,
  studentTrainingEntries,
  studentProgress,
  studyTopics,
  aiTutorSessions,
  horses,
} from "../drizzle/schema";

/** Safely parse user preferences JSON. */
function parseUserPrefs(raw: string | null | undefined): Record<string, any> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Student procedure — extends protectedProcedure to check that the user has
 * selected the student experience OR is an admin.
 */
const studentProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await db.getUserById(ctx.user.id);
  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }
  const prefs = parseUserPrefs(user.preferences);
  const isAdmin = user.role === "admin";
  const isStudent = prefs.selectedExperience === "student" || prefs.planTier === "student";
  if (!isAdmin && !isStudent) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires the Student plan.",
    });
  }
  return next({ ctx });
});

// ─────────────────────────────────────────────────────────────────────────────
// AI Tutor — tiered model architecture
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum AI tutor questions per user per day (cost control). */
const AI_TUTOR_DAILY_LIMIT = 20;

/** System prompt for the AI tutor — educational, horse-focused, safe. */
const AI_TUTOR_SYSTEM_PROMPT = `You are EquiProfile AI Tutor, a knowledgeable and friendly equestrian education assistant.

Your role:
- Help students learn about horse care, riding, stable management, and equine health
- Explain concepts clearly at a level appropriate for student riders
- Encourage safe practices and proper horse handling
- Be supportive, patient, and educational
- Reference standard equestrian knowledge and BHS/Pony Club guidelines where relevant

Rules:
- Only answer questions related to horses, riding, equestrian care, and related topics
- If asked about unrelated topics, gently redirect to equestrian learning
- Never give veterinary diagnoses — advise consulting a vet for health concerns
- Keep answers concise but thorough (max 300 words unless more detail is requested)
- Use British English spelling conventions`;

/**
 * Resolve AI tutor model based on tier.
 * Tier 1 (standard): Use the cheapest available model (gpt-4o-mini or equivalent)
 * Tier 2 (smart): Use a more capable model for complex questions
 */
async function resolveTutorModel(tier: "standard" | "smart"): Promise<string> {
  if (tier === "smart") {
    const smartModel = await getRuntimeConfig("ai_tutor_smart_model", "AI_TUTOR_SMART_MODEL");
    return smartModel?.trim() || "gpt-4o-mini";
  }
  // Standard tier — cheapest model
  const cheapModel = await getRuntimeConfig("ai_tutor_model", "AI_TUTOR_MODEL");
  return cheapModel?.trim() || "gpt-4o-mini";
}

/**
 * Determine whether a question needs the smarter (more expensive) model.
 * Simple heuristic: long questions or those with complex keywords escalate.
 */
function shouldEscalate(question: string): boolean {
  const complexKeywords = [
    "explain in detail", "compare", "difference between",
    "why does", "biomechanics", "physiology", "nutrition plan",
    "detailed analysis", "training programme", "dressage test",
    "show jumping course", "lameness", "colic signs",
  ];
  if (question.length > 500) return true;
  const lower = question.toLowerCase();
  return complexKeywords.some((kw) => lower.includes(kw));
}

// ─────────────────────────────────────────────────────────────────────────────
// Default study topics — seeded on first request if table is empty
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_STUDY_TOPICS = [
  { slug: "riding-position", title: "Riding Position & Balance", description: "Learn the fundamentals of a correct riding position, balance, and seat.", category: "riding", difficulty: "beginner" as const, sortOrder: 1 },
  { slug: "aids-and-control", title: "Aids & Control", description: "Understanding natural and artificial aids to communicate with your horse.", category: "riding", difficulty: "beginner" as const, sortOrder: 2 },
  { slug: "grooming-basics", title: "Grooming Basics", description: "How to groom a horse properly — brushes, techniques, and routine.", category: "care", difficulty: "beginner" as const, sortOrder: 3 },
  { slug: "feeding-basics", title: "Feeding Basics", description: "Understanding horse nutrition, feed types, and feeding schedules.", category: "care", difficulty: "beginner" as const, sortOrder: 4 },
  { slug: "tack-and-equipment", title: "Tack & Equipment", description: "Identifying, fitting, and caring for saddles, bridles, and equipment.", category: "care", difficulty: "beginner" as const, sortOrder: 5 },
  { slug: "horse-behaviour", title: "Horse Behaviour Basics", description: "Reading body language, understanding flight response, and building trust.", category: "theory", difficulty: "beginner" as const, sortOrder: 6 },
  { slug: "stable-safety", title: "Stable Safety", description: "Essential safety practices around horses and in the stable yard.", category: "safety", difficulty: "beginner" as const, sortOrder: 7 },
  { slug: "horse-health-awareness", title: "Horse Health Awareness", description: "Recognising signs of good health, common ailments, and when to call the vet.", category: "theory", difficulty: "beginner" as const, sortOrder: 8 },
  { slug: "lesson-preparation", title: "Lesson Preparation", description: "How to prepare for a riding lesson — tacking up, warming up, and goal setting.", category: "riding", difficulty: "beginner" as const, sortOrder: 9 },
  { slug: "care-routine", title: "Daily Care Routines", description: "Building consistent daily horse care habits — morning checks, turnout, and evening routines.", category: "care", difficulty: "beginner" as const, sortOrder: 10 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────
export const studentRouter = router({

  // ── Overview ─────────────────────────────────────────────────────────────
  getOverview: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    const userId = ctx.user.id;

    // Fetch virtual horse
    const [vHorse] = await dbConn.select().from(virtualHorses)
      .where(and(eq(virtualHorses.userId, userId), eq(virtualHorses.isActive, true)))
      .limit(1);

    // Fetch assigned real horse
    const assignments = await dbConn.select({
      assignmentId: studentHorseAssignments.id,
      horseId: studentHorseAssignments.horseId,
      horseName: horses.name,
      horseBreed: horses.breed,
      horsePhotoUrl: horses.photoUrl,
    }).from(studentHorseAssignments)
      .innerJoin(horses, eq(studentHorseAssignments.horseId, horses.id))
      .where(and(
        eq(studentHorseAssignments.studentUserId, userId),
        eq(studentHorseAssignments.isActive, true),
      ))
      .limit(1);
    const assignedHorse = assignments[0] ?? null;

    // Today's tasks
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = await dbConn.select().from(studentTasks)
      .where(and(
        eq(studentTasks.userId, userId),
        sql`${studentTasks.targetDate} = ${today}`,
      ))
      .orderBy(studentTasks.createdAt);

    // Incomplete daily tasks (no target date or today)
    const pendingDailyTasks = await dbConn.select().from(studentTasks)
      .where(and(
        eq(studentTasks.userId, userId),
        eq(studentTasks.frequency, "daily"),
        eq(studentTasks.isCompleted, false),
      ))
      .limit(10);

    // Recent training entries (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];
    const recentTraining = await dbConn.select().from(studentTrainingEntries)
      .where(and(
        eq(studentTrainingEntries.userId, userId),
        sql`${studentTrainingEntries.sessionDate} >= ${weekAgoStr}`,
      ))
      .orderBy(desc(studentTrainingEntries.sessionDate));

    // Progress summary
    const progress = await dbConn.select().from(studentProgress)
      .where(eq(studentProgress.userId, userId));

    // Stats
    const totalTasks = todayTasks.length + pendingDailyTasks.filter(
      (t) => !todayTasks.some((tt) => tt.id === t.id)
    ).length;
    const completedTasks = todayTasks.filter((t) => t.isCompleted).length;

    return {
      virtualHorse: vHorse ?? null,
      assignedHorse,
      todayTasks: [...todayTasks, ...pendingDailyTasks.filter(
        (t) => !todayTasks.some((tt) => tt.id === t.id)
      )],
      tasksCompleted: completedTasks,
      tasksPending: totalTasks - completedTasks,
      weeklySessionCount: recentTraining.length,
      progressSkills: progress,
    };
  }),

  // ── Virtual Horse ────────────────────────────────────────────────────────
  getVirtualHorse: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
    const [vHorse] = await dbConn.select().from(virtualHorses)
      .where(and(eq(virtualHorses.userId, ctx.user.id), eq(virtualHorses.isActive, true)))
      .limit(1);
    return vHorse ?? null;
  }),

  createVirtualHorse: studentProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      breed: z.string().max(100).optional(),
      color: z.string().max(50).optional(),
      age: z.number().int().min(1).max(40).optional(),
      personality: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      // Only allow one active virtual horse per student
      const [existing] = await dbConn.select().from(virtualHorses)
        .where(and(eq(virtualHorses.userId, ctx.user.id), eq(virtualHorses.isActive, true)))
        .limit(1);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You already have an active virtual horse." });
      }

      const [result] = await dbConn.insert(virtualHorses).values({
        userId: ctx.user.id,
        name: input.name,
        breed: input.breed ?? null,
        color: input.color ?? null,
        age: input.age ?? null,
        personality: input.personality ?? null,
      });
      return { id: result.insertId, success: true };
    }),

  updateVirtualHorse: studentProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      breed: z.string().max(100).optional(),
      color: z.string().max(50).optional(),
      age: z.number().int().min(1).max(40).optional(),
      personality: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      const { id, ...updates } = input;
      await dbConn.update(virtualHorses)
        .set(updates)
        .where(and(eq(virtualHorses.id, id), eq(virtualHorses.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── Assigned Horse ───────────────────────────────────────────────────────
  getAssignedHorse: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
    const assignments = await dbConn.select({
      assignmentId: studentHorseAssignments.id,
      horseId: studentHorseAssignments.horseId,
      notes: studentHorseAssignments.notes,
      assignedAt: studentHorseAssignments.assignedAt,
      horseName: horses.name,
      horseBreed: horses.breed,
      horseColor: horses.color,
      horseAge: horses.age,
      horsePhotoUrl: horses.photoUrl,
      horseGender: horses.gender,
    }).from(studentHorseAssignments)
      .innerJoin(horses, eq(studentHorseAssignments.horseId, horses.id))
      .where(and(
        eq(studentHorseAssignments.studentUserId, ctx.user.id),
        eq(studentHorseAssignments.isActive, true),
      ))
      .limit(1);
    return assignments[0] ?? null;
  }),

  // ── Tasks ────────────────────────────────────────────────────────────────
  listTasks: studentProcedure
    .input(z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      completed: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      const conditions = [eq(studentTasks.userId, ctx.user.id)];
      if (input?.completed !== undefined) {
        conditions.push(eq(studentTasks.isCompleted, input.completed));
      }
      if (input?.dateFrom) {
        conditions.push(sql`${studentTasks.targetDate} >= ${input.dateFrom}` as any);
      }
      if (input?.dateTo) {
        conditions.push(sql`${studentTasks.targetDate} <= ${input.dateTo}` as any);
      }

      return dbConn.select().from(studentTasks)
        .where(and(...conditions))
        .orderBy(desc(studentTasks.createdAt))
        .limit(100);
    }),

  createTask: studentProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      category: z.enum(["care", "grooming", "feeding", "study", "exercise", "other"]).default("care"),
      frequency: z.enum(["daily", "weekly", "once"]).default("daily"),
      targetDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const [result] = await dbConn.insert(studentTasks).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        frequency: input.frequency,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
      });
      return { id: result.insertId, success: true };
    }),

  completeTask: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.update(studentTasks)
        .set({ isCompleted: true, completedAt: new Date() })
        .where(and(eq(studentTasks.id, input.id), eq(studentTasks.userId, ctx.user.id)));
      return { success: true };
    }),

  uncompleteTask: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.update(studentTasks)
        .set({ isCompleted: false, completedAt: null })
        .where(and(eq(studentTasks.id, input.id), eq(studentTasks.userId, ctx.user.id)));
      return { success: true };
    }),

  deleteTask: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.delete(studentTasks)
        .where(and(eq(studentTasks.id, input.id), eq(studentTasks.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── Training Log ─────────────────────────────────────────────────────────
  listTraining: studentProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      return dbConn.select().from(studentTrainingEntries)
        .where(eq(studentTrainingEntries.userId, ctx.user.id))
        .orderBy(desc(studentTrainingEntries.sessionDate))
        .limit(input?.limit ?? 20);
    }),

  createTraining: studentProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      sessionDate: z.string(),
      duration: z.number().int().min(1).optional(),
      sessionType: z.enum(["lesson", "practice", "groundwork", "theory", "other"]).default("lesson"),
      notes: z.string().optional(),
      wentWell: z.string().optional(),
      needsImprovement: z.string().optional(),
      instructor: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const [result] = await dbConn.insert(studentTrainingEntries).values({
        userId: ctx.user.id,
        title: input.title,
        sessionDate: new Date(input.sessionDate),
        duration: input.duration ?? null,
        sessionType: input.sessionType,
        notes: input.notes ?? null,
        wentWell: input.wentWell ?? null,
        needsImprovement: input.needsImprovement ?? null,
        instructor: input.instructor ?? null,
      });
      return { id: result.insertId, success: true };
    }),

  deleteTraining: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.delete(studentTrainingEntries)
        .where(and(eq(studentTrainingEntries.id, input.id), eq(studentTrainingEntries.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── Progress ─────────────────────────────────────────────────────────────
  getProgress: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
    return dbConn.select().from(studentProgress)
      .where(eq(studentProgress.userId, ctx.user.id))
      .orderBy(studentProgress.skillArea);
  }),

  // ── Study Hub ────────────────────────────────────────────────────────────
  listStudyTopics: studentProcedure
    .input(z.object({
      category: z.string().optional(),
    }).optional())
    .query(async ({ ctx: _ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      // Seed defaults if table is empty
      const existing = await dbConn.select({ id: studyTopics.id }).from(studyTopics).limit(1);
      if (existing.length === 0) {
        await dbConn.insert(studyTopics).values(DEFAULT_STUDY_TOPICS);
      }

      const conditions = [eq(studyTopics.isPublished, true)];
      if (input?.category) {
        conditions.push(eq(studyTopics.category, input.category));
      }

      return dbConn.select().from(studyTopics)
        .where(and(...conditions))
        .orderBy(studyTopics.sortOrder);
    }),

  getStudyTopic: studentProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx: _ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const [topic] = await dbConn.select().from(studyTopics)
        .where(eq(studyTopics.slug, input.slug))
        .limit(1);
      if (!topic) throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      return topic;
    }),

  // ── AI Tutor ─────────────────────────────────────────────────────────────
  askTutor: studentProcedure
    .input(z.object({
      question: z.string().min(1).max(2000),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      // Rate limit: check daily usage
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todaySessions = await dbConn.select({ id: aiTutorSessions.id })
        .from(aiTutorSessions)
        .where(and(
          eq(aiTutorSessions.userId, ctx.user.id),
          gte(aiTutorSessions.createdAt, todayStart),
        ));

      if (todaySessions.length >= AI_TUTOR_DAILY_LIMIT) {
        return {
          answer: `You've reached today's limit of ${AI_TUTOR_DAILY_LIMIT} questions. Your limit resets at midnight. Keep studying — you're doing great! 🐴`,
          tier: "limited" as const,
          modelUsed: "none",
        };
      }

      // Check if AI is configured
      if (!(await isAIConfigured())) {
        return {
          answer: "⚠️ The AI Tutor is not yet configured. Please ask your school or check back later.",
          tier: "unavailable" as const,
          modelUsed: "none",
        };
      }

      // Determine tier
      const tier = shouldEscalate(input.question) ? "smart" : "standard";
      const model = await resolveTutorModel(tier);

      // Build messages
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: AI_TUTOR_SYSTEM_PROMPT },
      ];

      // Add conversation history for context
      if (input.conversationHistory?.length) {
        for (const msg of input.conversationHistory.slice(-6)) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      messages.push({ role: "user", content: input.question });

      try {
        const response = await invokeLLM({
          messages,
          maxTokens: tier === "smart" ? 1024 : 512,
        });

        const answer = typeof response.choices[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : "I couldn't generate a response. Please try rephrasing your question.";

        // Log the session
        await dbConn.insert(aiTutorSessions).values({
          userId: ctx.user.id,
          question: input.question,
          answer,
          modelUsed: model,
          tier,
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
        });

        return { answer, tier, modelUsed: model };
      } catch (err: any) {
        // Log the failed attempt
        await dbConn.insert(aiTutorSessions).values({
          userId: ctx.user.id,
          question: input.question,
          answer: `Error: ${err?.message || "Unknown error"}`,
          modelUsed: model,
          tier,
          promptTokens: 0,
          completionTokens: 0,
        }).catch((logErr: unknown) => {
          console.error("[AI Tutor] Failed to log error session:", logErr);
        }); // don't fail on logging failure

        return {
          answer: "Sorry, the AI Tutor encountered an error. Please try again in a moment.",
          tier: "error" as const,
          modelUsed: model,
        };
      }
    }),

  getTutorUsage: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = await dbConn.select({ id: aiTutorSessions.id })
      .from(aiTutorSessions)
      .where(and(
        eq(aiTutorSessions.userId, ctx.user.id),
        gte(aiTutorSessions.createdAt, todayStart),
      ));

    return {
      usedToday: todaySessions.length,
      dailyLimit: AI_TUTOR_DAILY_LIMIT,
      remaining: Math.max(0, AI_TUTOR_DAILY_LIMIT - todaySessions.length),
    };
  }),
});
