import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminUnlockedProcedure, stableProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { createCheckoutSession, createPortalSession, STRIPE_PRICING } from "./stripe";
import {
  exportHorsesCSV,
  exportHealthRecordsCSV,
  exportTrainingSessionsCSV,
  exportCompetitionsCSV,
  exportFeedCostsCSV,
  exportDocumentsCSV,
  generateCSVFilename,
} from "./csvExport";
import { eq, and, desc, sql, gte, lte, or, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { ENV } from "./_core/env";
import {
  stables,
  stableMembers,
  stableInvites,
  messageThreads,
  messages,
  reports,
  reportSchedules,
  events,
  competitions,
  trainingProgramTemplates,
  trainingPrograms,
  breeding,
  foals,
  trainingSessions,
  healthRecords,
  feedCosts,
  lessonBookings,
  trainerAvailability,
  horses,
  careScores,
  medicationSchedules,
  medicationLogs,
  behaviorLogs,
  healthAlerts,
} from "../drizzle/schema";

// Subscription check middleware
const subscribedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await db.getUserById(ctx.user.id);
  if (!user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
  }
  
  // Check if user is suspended
  if (user.isSuspended) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Your account has been suspended. Please contact support.' });
  }
  
  // Check subscription status
  const validStatuses = ['trial', 'active'];
  if (!validStatuses.includes(user.subscriptionStatus)) {
    // Check if trial has expired
    if (user.subscriptionStatus === 'trial' && user.trialEndsAt && new Date(user.trialEndsAt) < new Date()) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Your free trial has expired. Please subscribe to continue.' });
    }
    if (user.subscriptionStatus === 'overdue' || user.subscriptionStatus === 'expired') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Your subscription has expired. Please renew to continue.' });
    }
  }
  
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Admin unlock system
  adminUnlock: router({
    // Check if admin mode is unlocked
    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const session = await db.getAdminSession(ctx.user.id);
      return {
        isUnlocked: session ? session.expiresAt > new Date() : false,
        expiresAt: session?.expiresAt,
      };
    }),

    // Initiate unlock (returns challenge)
    requestUnlock: protectedProcedure.mutation(async ({ ctx }) => {
      // Check rate limit
      const attempts = await db.getUnlockAttempts(ctx.user.id);
      if (attempts >= 5) {
        const lockedUntil = await db.getUnlockLockoutTime(ctx.user.id);
        if (lockedUntil && lockedUntil > new Date()) {
          throw new TRPCError({ 
            code: 'TOO_MANY_REQUESTS', 
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
    submitPassword: protectedProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const adminPassword = process.env.ADMIN_UNLOCK_PASSWORD || 'Ashmor12@';
        
        // Check rate limit
        const attempts = await db.incrementUnlockAttempts(ctx.user.id);
        if (attempts > 5) {
          await db.setUnlockLockout(ctx.user.id, 15); // 15 minutes
          throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many attempts. Account locked for 15 minutes.' });
        }

        if (input.password !== adminPassword) {
          await db.logActivity({
            userId: ctx.user!.id,
            action: 'admin_unlock_failed',
            entityType: 'system',
            details: JSON.stringify({ attempts }),
          });
          throw new TRPCError({ 
            code: 'UNAUTHORIZED', 
            message: 'Incorrect password',
          });
        }

        // Success - create session
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await db.createAdminSession(ctx.user.id, expiresAt);
        await db.resetUnlockAttempts(ctx.user.id);
        
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'admin_unlocked',
          entityType: 'system',
          details: JSON.stringify({ expiresAt }),
        });

        return { success: true, expiresAt };
      }),

    // Revoke admin session
    lock: protectedProcedure.mutation(async ({ ctx }) => {
      await db.revokeAdminSession(ctx.user.id);
      return { success: true };
    }),
  }),

  // AI chat
  ai: router({
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const userMessage = input.messages[input.messages.length - 1]?.content.toLowerCase().trim();
        
        // Check for admin unlock command
        if (userMessage === 'show admin') {
          // Check if user has admin role
          if (ctx.user.role !== 'admin') {
            return {
              role: 'assistant' as const,
              content: 'You do not have admin privileges.',
            };
          }
          
          // Check current session
          const session = await db.getAdminSession(ctx.user.id);
          if (session && session.expiresAt > new Date()) {
            return {
              role: 'assistant' as const,
              content: `Admin mode is already unlocked. Session expires at ${session.expiresAt.toLocaleString()}.`,
            };
          }
          
          // Return password challenge
          return {
            role: 'assistant' as const,
            content: '🔐 **Admin Mode**\n\nPlease enter the admin password to unlock admin features.',
            metadata: { adminChallenge: true },
          };
        }
        
        // Normal AI chat processing
        const response = await invokeLLM({
          messages: input.messages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        });
        
        return {
          role: 'assistant' as const,
          content: response.choices[0]?.message?.content || 'No response',
        };
      }),
  }),

  // Billing and subscription management
  billing: router({
    getPricing: publicProcedure.query(() => {
      // Return disabled state if billing is disabled
      if (!ENV.enableStripe) {
        return {
          enabled: false,
          message: 'Billing is disabled',
          monthly: null,
          yearly: null,
        };
      }
      
      return {
        enabled: true,
        monthly: {
          amount: STRIPE_PRICING.monthly.amount,
          currency: STRIPE_PRICING.monthly.currency,
          interval: STRIPE_PRICING.monthly.interval,
        },
        yearly: {
          amount: STRIPE_PRICING.yearly.amount,
          currency: STRIPE_PRICING.yearly.currency,
          interval: STRIPE_PRICING.yearly.interval,
        },
        stable_monthly: {
          amount: STRIPE_PRICING.stable_monthly.amount,
          currency: STRIPE_PRICING.stable_monthly.currency,
          interval: STRIPE_PRICING.stable_monthly.interval,
        },
        stable_yearly: {
          amount: STRIPE_PRICING.stable_yearly.amount,
          currency: STRIPE_PRICING.stable_yearly.currency,
          interval: STRIPE_PRICING.stable_yearly.interval,
        },
      };
    }),

    createCheckout: protectedProcedure
      .input(z.object({
        plan: z.enum(['monthly', 'yearly', 'stable_monthly', 'stable_yearly']),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if billing is enabled
        if (!ENV.enableStripe) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Billing is disabled'
          });
        }
        
        const user = await db.getUserById(ctx.user.id);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        const priceId = STRIPE_PRICING[input.plan]?.priceId;

        if (!priceId) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Stripe price ID not configured' 
          });
        }

        const protocol = ctx.req.protocol || 'https';
        const host = ctx.req.headers.host || 'equiprofile.online';
        const baseUrl = `${protocol}://${host}`;

        const session = await createCheckoutSession(
          user.id,
          user.email || '',
          priceId,
          `${baseUrl}/dashboard?success=true`,
          `${baseUrl}/pricing?cancelled=true`,
          user.stripeCustomerId || undefined
        );

        if (!session) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Failed to create checkout session' 
          });
        }

        return { url: session.url };
      }),

    createPortal: protectedProcedure.mutation(async ({ ctx }) => {
      // Check if billing is enabled
      if (!ENV.enableStripe) {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message: 'Billing is disabled'
        });
      }
      
      const user = await db.getUserById(ctx.user.id);
      if (!user || !user.stripeCustomerId) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'No active subscription found' 
        });
      }

      const protocol = ctx.req.protocol || 'https';
      const host = ctx.req.headers.host || 'equiprofile.online';
      const baseUrl = `${protocol}://${host}`;

      const portalUrl = await createPortalSession(
        user.stripeCustomerId,
        `${baseUrl}/dashboard`
      );

      if (!portalUrl) {
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'Failed to create portal session' 
        });
      }

      return { url: portalUrl };
    }),

    getStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) return null;

      return {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        lastPaymentAt: user.lastPaymentAt,
        hasActiveSubscription: ['trial', 'active'].includes(user.subscriptionStatus),
      };
    }),
  }),

  // User profile and subscription
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      return user;
    }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        profileImageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUser(ctx.user.id, input);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'profile_updated',
          entityType: 'user',
          entityId: ctx.user.id,
          details: JSON.stringify(input),
        });
        return { success: true };
      }),
    
    getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) return null;
      
      return {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        trialEndsAt: user.trialEndsAt,
        subscriptionEndsAt: user.subscriptionEndsAt,
        lastPaymentAt: user.lastPaymentAt,
      };
    }),
    
    getDashboardStats: subscribedProcedure.query(async ({ ctx }) => {
      const horses = await db.getHorsesByUserId(ctx.user.id);
      const upcomingSessions = await db.getUpcomingTrainingSessions(ctx.user.id);
      const reminders = await db.getUpcomingReminders(ctx.user.id, 14);
      const latestWeather = await db.getLatestWeatherLog(ctx.user.id);
      
      return {
        horseCount: horses.length,
        upcomingSessionCount: upcomingSessions.length,
        reminderCount: reminders.length,
        latestWeather,
      };
    }),
  }),

  // Horse management
  horses: router({
    list: subscribedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        const horses = await db.getHorsesByUserId(ctx.user.id);
        const limit = input?.limit || 50;
        const offset = input?.offset || 0;
        return {
          horses: horses.slice(offset, offset + limit),
          total: horses.length,
          hasMore: offset + limit < horses.length,
        };
      }),
    
    get: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const horse = await db.getHorseById(input.id, ctx.user.id);
        if (!horse) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }
        return horse;
      }),
    
    create: subscribedProcedure
      .input(z.object({
        name: z.string().min(1),
        breed: z.string().optional(),
        age: z.number().optional(),
        dateOfBirth: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        color: z.string().optional(),
        gender: z.enum(['stallion', 'mare', 'gelding']).optional(),
        discipline: z.string().optional(),
        level: z.string().optional(),
        registrationNumber: z.string().optional(),
        microchipNumber: z.string().optional(),
        notes: z.string().optional(),
        photoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createHorse({
          ...input,
          userId: ctx.user!.id,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'horse_created',
          entityType: 'horse',
          entityId: id,
          details: JSON.stringify({ name: input.name }),
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const horse = await db.getHorseById(id, ctx.user!.id);
        publishModuleEvent('horses', 'created', horse, ctx.user!.id);
        
        return { id };
      }),
    
    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        breed: z.string().optional(),
        age: z.number().optional(),
        dateOfBirth: z.string().optional(),
        height: z.number().optional(),
        weight: z.number().optional(),
        color: z.string().optional(),
        gender: z.enum(['stallion', 'mare', 'gelding']).optional(),
        discipline: z.string().optional(),
        level: z.string().optional(),
        registrationNumber: z.string().optional(),
        microchipNumber: z.string().optional(),
        notes: z.string().optional(),
        photoUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, dateOfBirth, ...data } = input;
        await db.updateHorse(id, ctx.user.id, {
          ...data,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'horse_updated',
          entityType: 'horse',
          entityId: id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const horse = await db.getHorseById(id, ctx.user.id);
        publishModuleEvent('horses', 'updated', horse, ctx.user.id);
        
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteHorse(input.id, ctx.user.id);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'horse_deleted',
          entityType: 'horse',
          entityId: input.id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('horses', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
    
    exportCSV: subscribedProcedure.query(async ({ ctx }) => {
      const horses = await db.getHorsesByUserId(ctx.user.id);
      const csv = exportHorsesCSV(horses);
      const filename = generateCSVFilename('horses');
      
      return {
        csv,
        filename,
        mimeType: 'text/csv',
      };
    }),
  }),

  // Health records
  healthRecords: router({
    listAll: subscribedProcedure.query(async ({ ctx }) => {
      return db.getHealthRecordsByUserId(ctx.user.id);
    }),
    
    listByHorse: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getHealthRecordsByHorseId(input.horseId, ctx.user.id);
      }),
    
    get: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const record = await db.getHealthRecordById(input.id, ctx.user.id);
        if (!record) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Health record not found' });
        }
        return record;
      }),
    
    create: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        recordType: z.enum(['vaccination', 'deworming', 'dental', 'farrier', 'veterinary', 'injury', 'medication', 'other']),
        title: z.string().min(1),
        description: z.string().optional(),
        recordDate: z.string(),
        nextDueDate: z.string().optional(),
        vetName: z.string().optional(),
        vetPhone: z.string().optional(),
        vetClinic: z.string().optional(),
        cost: z.number().optional(),
        documentUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createHealthRecord({
          ...input,
          userId: ctx.user!.id,
          recordDate: new Date(input.recordDate),
          nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : undefined,
        });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'health_record_created',
          entityType: 'health_record',
          entityId: id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const record = await db.getHealthRecordById(id, ctx.user!.id);
        publishModuleEvent('health', 'created', record, ctx.user!.id);
        
        return { id };
      }),
    
    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        recordType: z.enum(['vaccination', 'deworming', 'dental', 'farrier', 'veterinary', 'injury', 'medication', 'other']).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        recordDate: z.string().optional(),
        nextDueDate: z.string().optional(),
        vetName: z.string().optional(),
        vetPhone: z.string().optional(),
        vetClinic: z.string().optional(),
        cost: z.number().optional(),
        documentUrl: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, recordDate, nextDueDate, ...data } = input;
        await db.updateHealthRecord(id, ctx.user.id, {
          ...data,
          recordDate: recordDate ? new Date(recordDate) : undefined,
          nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const record = await db.getHealthRecordById(id, ctx.user.id);
        publishModuleEvent('health', 'updated', record, ctx.user.id);
        
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteHealthRecord(input.id, ctx.user.id);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('health', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
    
    getReminders: subscribedProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(async ({ ctx, input }) => {
        return db.getUpcomingReminders(ctx.user.id, input.days);
      }),
    
    exportCSV: subscribedProcedure.query(async ({ ctx }) => {
      const records = await db.getHealthRecordsByUserId(ctx.user.id);
      const csv = exportHealthRecordsCSV(records);
      const filename = generateCSVFilename('health_records');
      
      return {
        csv,
        filename,
        mimeType: 'text/csv',
      };
    }),
  }),

  // Training sessions
  training: router({
    listByHorse: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getTrainingSessionsByHorseId(input.horseId, ctx.user.id);
      }),
    
    listAll: subscribedProcedure.query(async ({ ctx }) => {
      return db.getTrainingSessionsByUserId(ctx.user.id);
    }),
    
    getUpcoming: subscribedProcedure.query(async ({ ctx }) => {
      return db.getUpcomingTrainingSessions(ctx.user.id);
    }),
    
    create: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        sessionDate: z.string(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        duration: z.number().optional(),
        sessionType: z.enum(['flatwork', 'jumping', 'hacking', 'lunging', 'groundwork', 'competition', 'lesson', 'other']),
        discipline: z.string().optional(),
        trainer: z.string().optional(),
        location: z.string().optional(),
        goals: z.string().optional(),
        exercises: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createTrainingSession({
          ...input,
          userId: ctx.user!.id,
          sessionDate: new Date(input.sessionDate),
        });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'training_session_created',
          entityType: 'training_session',
          entityId: id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const session = await db.getTrainingSessionById(id, ctx.user!.id);
        publishModuleEvent('training', 'created', session, ctx.user!.id);
        
        return { id };
      }),
    
    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        sessionDate: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        duration: z.number().optional(),
        sessionType: z.enum(['flatwork', 'jumping', 'hacking', 'lunging', 'groundwork', 'competition', 'lesson', 'other']).optional(),
        discipline: z.string().optional(),
        trainer: z.string().optional(),
        location: z.string().optional(),
        goals: z.string().optional(),
        exercises: z.string().optional(),
        notes: z.string().optional(),
        performance: z.enum(['excellent', 'good', 'average', 'poor']).optional(),
        weather: z.string().optional(),
        temperature: z.number().optional(),
        isCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, sessionDate, ...data } = input;
        await db.updateTrainingSession(id, ctx.user.id, {
          ...data,
          sessionDate: sessionDate ? new Date(sessionDate) : undefined,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const session = await db.getTrainingSessionById(id, ctx.user.id);
        publishModuleEvent('training', 'updated', session, ctx.user.id);
        
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTrainingSession(input.id, ctx.user.id);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('training', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
    
    complete: subscribedProcedure
      .input(z.object({
        id: z.number(),
        performance: z.enum(['excellent', 'good', 'average', 'poor']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateTrainingSession(input.id, ctx.user.id, {
          isCompleted: true,
          performance: input.performance,
          notes: input.notes,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const session = await db.getTrainingSessionById(input.id, ctx.user.id);
        publishModuleEvent('training', 'completed', session, ctx.user.id);
        
        return { success: true };
      }),
    
    exportCSV: subscribedProcedure.query(async ({ ctx }) => {
      const sessions = await db.getTrainingSessionsByUserId(ctx.user.id);
      const csv = exportTrainingSessionsCSV(sessions);
      const filename = generateCSVFilename('training_sessions');
      
      return {
        csv,
        filename,
        mimeType: 'text/csv',
      };
    }),
  }),

  // Feeding plans
  feeding: router({
    listAll: subscribedProcedure.query(async ({ ctx }) => {
      return db.getFeedingPlansByUserId(ctx.user.id);
    }),
    
    listByHorse: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getFeedingPlansByHorseId(input.horseId, ctx.user.id);
      }),
    
    create: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        feedType: z.string().min(1),
        brandName: z.string().optional(),
        quantity: z.string().min(1),
        unit: z.string().optional(),
        mealTime: z.enum(['morning', 'midday', 'evening', 'night']),
        frequency: z.string().optional(),
        specialInstructions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createFeedingPlan({
          ...input,
          userId: ctx.user!.id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const plan = await db.getFeedingPlanById(id, ctx.user!.id);
        publishModuleEvent('feeding', 'created', plan, ctx.user!.id);
        
        return { id };
      }),
    
    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        feedType: z.string().optional(),
        brandName: z.string().optional(),
        quantity: z.string().optional(),
        unit: z.string().optional(),
        mealTime: z.enum(['morning', 'midday', 'evening', 'night']).optional(),
        frequency: z.string().optional(),
        specialInstructions: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateFeedingPlan(id, ctx.user.id, data);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const plan = await db.getFeedingPlanById(id, ctx.user.id);
        publishModuleEvent('feeding', 'updated', plan, ctx.user.id);
        
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteFeedingPlan(input.id, ctx.user.id);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('feeding', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
    
    exportCSV: subscribedProcedure.query(async ({ ctx }) => {
      const feedPlans = await db.getFeedingPlansByUserId(ctx.user.id);
      const csv = exportFeedCostsCSV(feedPlans);
      const filename = generateCSVFilename('feeding_plans');
      
      return {
        csv,
        filename,
        mimeType: 'text/csv',
      };
    }),
  }),

  // Tasks management
  tasks: router({
    list: subscribedProcedure.query(async ({ ctx }) => {
      return db.getTasksByUserId(ctx.user.id);
    }),
    
    listByHorse: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getTasksByHorseId(input.horseId, ctx.user.id);
      }),
    
    get: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const task = await db.getTaskById(input.id, ctx.user.id);
        if (!task) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
        }
        return task;
      }),
    
    getUpcoming: subscribedProcedure
      .input(z.object({ days: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return db.getUpcomingTasks(ctx.user.id, input.days);
      }),
    
    create: subscribedProcedure
      .input(z.object({
        horseId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        taskType: z.enum(['hoofcare', 'health_appointment', 'treatment', 'vaccination', 'deworming', 'dental', 'general_care', 'training', 'feeding', 'other']),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
        dueDate: z.string().optional(),
        assignedTo: z.string().optional(),
        notes: z.string().optional(),
        reminderDays: z.number().default(1),
        isRecurring: z.boolean().default(false),
        recurringInterval: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createTask({
          ...input,
          userId: ctx.user!.id,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'task_created',
          entityType: 'task',
          entityId: id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const task = await db.getTaskById(id, ctx.user!.id);
        publishModuleEvent('tasks', 'created', task, ctx.user!.id);
        
        return { id };
      }),
    
    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        taskType: z.enum(['hoofcare', 'health_appointment', 'treatment', 'vaccination', 'deworming', 'dental', 'general_care', 'training', 'feeding', 'other']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
        dueDate: z.string().optional(),
        assignedTo: z.string().optional(),
        notes: z.string().optional(),
        reminderDays: z.number().optional(),
        isRecurring: z.boolean().optional(),
        recurringInterval: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, dueDate, ...data } = input;
        await db.updateTask(id, ctx.user.id, {
          ...data,
          dueDate: dueDate ? new Date(dueDate) : undefined,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const task = await db.getTaskById(id, ctx.user.id);
        publishModuleEvent('tasks', 'updated', task, ctx.user.id);
        
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTask(input.id, ctx.user.id);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('tasks', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
    
    complete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.completeTask(input.id, ctx.user.id);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const task = await db.getTaskById(input.id, ctx.user.id);
        publishModuleEvent('tasks', 'completed', task, ctx.user.id);
        
        return { success: true };
      }),
    
    // AI-powered task generation (B2)
    generateDailyPlan: subscribedProcedure
      .input(z.object({
        horseId: z.number().optional(),
        date: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const targetDate = input.date ? new Date(input.date) : new Date();
        
        // Get horse data if specified
        let horseData = null;
        if (input.horseId) {
          const horse = await db.getHorseById(input.horseId, ctx.user.id);
          if (!horse) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
          }
          horseData = horse;
          
          // Get recent health logs and training
          const healthRecords = await db.getHealthRecordsByHorseId(input.horseId, ctx.user.id);
          const trainingSessions = await db.getTrainingSessionsByHorseId(input.horseId, ctx.user.id);
          horseData = { ...horseData, recentHealth: healthRecords.slice(0, 5), recentTraining: trainingSessions.slice(0, 5) };
        }
        
        // Get weather if available
        let weatherData = null;
        try {
          const { getWeather } = await import('./_core/weather');
          const userLocation = ctx.user.location || 'London, UK';
          weatherData = await getWeather(userLocation);
        } catch (err) {
          console.warn('[Task AI] Could not fetch weather:', err);
        }
        
        // Get upcoming events
        const upcomingEvents = await db.getUpcomingEvents(ctx.user.id, 7);
        
        // Generate AI suggestions
        const prompt = `As an equestrian care expert, generate a prioritized daily task plan for ${targetDate.toLocaleDateString()}.

Horse Info: ${horseData ? JSON.stringify({ name: horseData.name, age: horseData.age, discipline: horseData.discipline, level: horseData.level }) : 'Multiple horses'}
Weather: ${weatherData ? `${weatherData.temperature}°C, ${weatherData.conditions}, Wind: ${weatherData.windSpeed}km/h` : 'Unknown'}
Upcoming Events: ${upcomingEvents.length > 0 ? upcomingEvents.map(e => e.title).join(', ') : 'None'}

Generate 5-8 prioritized tasks for today covering:
1. Essential care (feeding, water, turnout, grooming)
2. Health/medication (if any due)
3. Training/exercise (weather-appropriate)
4. Stable maintenance
5. Event preparation (if applicable)

Format as JSON array with: { title, description, priority (urgent/high/medium/low), taskType, estimatedMinutes }`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'You are an expert equestrian care advisor. Generate practical, actionable daily tasks. Always respond with valid JSON array.' },
            { role: 'user', content: prompt },
          ],
        });

        let tasks = [];
        try {
          const content = response.choices[0]?.message?.content || '[]';
          try {
            const parsed = JSON.parse(content);
            tasks = Array.isArray(parsed) ? parsed : [];
          } catch (parseErr) {
            console.warn('[Task AI] Failed to parse AI response, using fallback');
            // Use fallback below
          }
        } catch (err) {
          console.warn('[Task AI] AI request failed:', err);
        }
        
        // Fallback to basic tasks if empty
        if (tasks.length === 0) {
          tasks = [
            { title: 'Morning feed and water check', priority: 'high', taskType: 'feeding', estimatedMinutes: 30 },
            { title: 'Turnout and paddock check', priority: 'high', taskType: 'general_care', estimatedMinutes: 45 },
            { title: 'Groom and check for injuries', priority: 'medium', taskType: 'general_care', estimatedMinutes: 30 },
            { title: 'Evening feed and water', priority: 'high', taskType: 'feeding', estimatedMinutes: 30 },
          ];
        }
        
        return {
          date: targetDate.toISOString(),
          tasks,
          weather: weatherData,
          generated: true,
        };
      }),
    
    // AI task prioritization
    prioritizeTasks: subscribedProcedure
      .input(z.object({
        horseId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        // Get all pending tasks
        const allTasks = input.horseId 
          ? await db.getTasksByHorseId(input.horseId, ctx.user.id)
          : await db.getTasksByUserId(ctx.user.id);
        
        const pendingTasks = allTasks.filter(t => t.status === 'pending');
        
        if (pendingTasks.length === 0) {
          return { urgent: [], high: [], medium: [], low: [] };
        }
        
        // Categorize by due date and priority
        const now = new Date();
        const urgent = pendingTasks.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursUntilDue <= 24 || t.priority === 'urgent';
        });
        
        const high = pendingTasks.filter(t => {
          if (urgent.includes(t)) return false;
          if (t.priority === 'high') return true;
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          return hoursUntilDue <= 48;
        });
        
        const medium = pendingTasks.filter(t => !urgent.includes(t) && !high.includes(t) && (t.priority === 'medium' || t.dueDate));
        const low = pendingTasks.filter(t => !urgent.includes(t) && !high.includes(t) && !medium.includes(t));
        
        return {
          urgent: urgent.slice(0, 10),
          high: high.slice(0, 10),
          medium: medium.slice(0, 10),
          low: low.slice(0, 10),
        };
      }),
  }),

  // Contacts management
  contacts: router({
    list: subscribedProcedure.query(async ({ ctx }) => {
      return db.getContactsByUserId(ctx.user.id);
    }),
    
    listByType: subscribedProcedure
      .input(z.object({ contactType: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getContactsByType(ctx.user.id, input.contactType);
      }),
    
    get: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const contact = await db.getContactById(input.id, ctx.user.id);
        if (!contact) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Contact not found' });
        }
        return contact;
      }),
    
    create: subscribedProcedure
      .input(z.object({
        name: z.string().min(1),
        contactType: z.enum(['vet', 'farrier', 'trainer', 'instructor', 'stable', 'breeder', 'supplier', 'emergency', 'other']),
        company: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postcode: z.string().optional(),
        country: z.string().optional(),
        website: z.string().optional(),
        notes: z.string().optional(),
        isPrimary: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createContact({
          ...input,
          userId: ctx.user!.id,
        });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'contact_created',
          entityType: 'contact',
          entityId: id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const contact = await db.getContactById(id, ctx.user!.id);
        publishModuleEvent('contacts', 'created', contact, ctx.user!.id);
        
        return { id };
      }),
    
    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        contactType: z.enum(['vet', 'farrier', 'trainer', 'instructor', 'stable', 'breeder', 'supplier', 'emergency', 'other']).optional(),
        company: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        mobile: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        postcode: z.string().optional(),
        country: z.string().optional(),
        website: z.string().optional(),
        notes: z.string().optional(),
        isPrimary: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateContact(id, ctx.user.id, data);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const contact = await db.getContactById(id, ctx.user.id);
        publishModuleEvent('contacts', 'updated', contact, ctx.user.id);
        
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteContact(input.id, ctx.user.id);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('contacts', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
  }),

  // Vaccinations management
  vaccinations: router({
    list: subscribedProcedure.query(async ({ ctx }) => {
      return db.getVaccinationsByUserId(ctx.user.id);
    }),
    
    listByHorse: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getVaccinationsByHorseId(input.horseId, ctx.user.id);
      }),
    
    get: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const vaccination = await db.getVaccinationById(input.id, ctx.user.id);
        if (!vaccination) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Vaccination not found' });
        }
        return vaccination;
      }),
    
    create: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        vaccineName: z.string().min(1),
        vaccineType: z.string().optional(),
        dateAdministered: z.date(),
        nextDueDate: z.date().optional(),
        batchNumber: z.string().optional(),
        vetName: z.string().optional(),
        vetClinic: z.string().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
        documentUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createVaccination({
          ...input,
          userId: ctx.user!.id,
        });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'vaccination_created',
          entityType: 'vaccination',
          entityId: id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const vaccination = await db.getVaccinationById(id, ctx.user!.id);
        publishModuleEvent('vaccinations', 'created', vaccination, ctx.user!.id);
        
        return { id };
      }),
    
    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        vaccineName: z.string().optional(),
        vaccineType: z.string().optional(),
        dateAdministered: z.date().optional(),
        nextDueDate: z.date().optional(),
        batchNumber: z.string().optional(),
        vetName: z.string().optional(),
        vetClinic: z.string().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
        documentUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateVaccination(id, ctx.user.id, data);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const vaccination = await db.getVaccinationById(id, ctx.user.id);
        publishModuleEvent('vaccinations', 'updated', vaccination, ctx.user.id);
        
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteVaccination(input.id, ctx.user.id);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'vaccination_deleted',
          entityType: 'vaccination',
          entityId: input.id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('vaccinations', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
  }),

  // Dewormings management
  dewormings: router({
    list: subscribedProcedure.query(async ({ ctx }) => {
      return db.getDewormingsByUserId(ctx.user.id);
    }),
    
    listByHorse: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getDewormingsByHorseId(input.horseId, ctx.user.id);
      }),
    
    get: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const deworming = await db.getDewormingById(input.id, ctx.user.id);
        if (!deworming) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Deworming record not found' });
        }
        return deworming;
      }),
    
    create: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        productName: z.string().min(1),
        activeIngredient: z.string().optional(),
        dateAdministered: z.date(),
        nextDueDate: z.date().optional(),
        dosage: z.string().optional(),
        weight: z.number().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createDeworming({
          ...input,
          userId: ctx.user!.id,
        });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'deworming_created',
          entityType: 'deworming',
          entityId: id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const deworming = await db.getDewormingById(id, ctx.user!.id);
        publishModuleEvent('dewormings', 'created', deworming, ctx.user!.id);
        
        return { id };
      }),
    
    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        productName: z.string().optional(),
        activeIngredient: z.string().optional(),
        dateAdministered: z.date().optional(),
        nextDueDate: z.date().optional(),
        dosage: z.string().optional(),
        weight: z.number().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateDeworming(id, ctx.user.id, data);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const deworming = await db.getDewormingById(id, ctx.user.id);
        publishModuleEvent('dewormings', 'updated', deworming, ctx.user.id);
        
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteDeworming(input.id, ctx.user.id);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'deworming_deleted',
          entityType: 'deworming',
          entityId: input.id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('dewormings', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
  }),

  // Pedigree management
  pedigree: router({
    get: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getPedigreeByHorseId(input.horseId);
      }),
    
    createOrUpdate: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        sireId: z.number().optional(),
        sireName: z.string().optional(),
        damId: z.number().optional(),
        damName: z.string().optional(),
        sireOfSireId: z.number().optional(),
        sireOfSireName: z.string().optional(),
        damOfSireId: z.number().optional(),
        damOfSireName: z.string().optional(),
        sireOfDamId: z.number().optional(),
        sireOfDamName: z.string().optional(),
        damOfDamId: z.number().optional(),
        damOfDamName: z.string().optional(),
        geneticInfo: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createOrUpdatePedigree(input);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'pedigree_updated',
          entityType: 'pedigree',
          entityId: id,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const pedigree = await db.getPedigreeByHorseId(input.horseId);
        publishModuleEvent('pedigree', 'updated', pedigree, ctx.user!.id);
        
        return { id };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deletePedigree(input.horseId);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'pedigree_deleted',
          entityType: 'pedigree',
          entityId: input.horseId,
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('pedigree', 'deleted', { horseId: input.horseId }, ctx.user!.id);
        
        return { success: true };
      }),
  }),

  // Documents
  documents: router({
    list: subscribedProcedure.query(async ({ ctx }) => {
      return db.getDocumentsByUserId(ctx.user.id);
    }),
    
    listByHorse: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getDocumentsByHorseId(input.horseId, ctx.user.id);
      }),
    
    upload: subscribedProcedure
      .input(z.object({
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        fileData: z.string(), // base64 encoded
        horseId: z.number().optional(),
        healthRecordId: z.number().optional(),
        category: z.enum(['health', 'registration', 'insurance', 'competition', 'other']).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check if uploads are enabled
        if (!ENV.enableUploads) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Uploads are disabled'
          });
        }
        
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `${ctx.user.id}/documents/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.fileType);
        
        const id = await db.createDocument({
          userId: ctx.user!.id,
          horseId: input.horseId,
          healthRecordId: input.healthRecordId,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          fileUrl: url,
          fileKey,
          category: input.category,
          description: input.description,
        });
        
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'document_uploaded',
          entityType: 'document',
          entityId: id,
          details: JSON.stringify({ fileName: input.fileName }),
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const document = await db.getDocumentById(id, ctx.user!.id);
        publishModuleEvent('documents', 'uploaded', document, ctx.user!.id);
        
        return { id, url };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteDocument(input.id, ctx.user.id);
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('documents', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
    
    exportCSV: subscribedProcedure.query(async ({ ctx }) => {
      const documents = await db.getDocumentsByUserId(ctx.user.id);
      const csv = exportDocumentsCSV(documents);
      const filename = generateCSVFilename('documents');
      
      return {
        csv,
        filename,
        mimeType: 'text/csv',
      };
    }),
  }),

  // Weather and AI analysis
  weather: router({
    // Fetch real-time weather for a location
    getCurrent: subscribedProcedure
      .input(z.object({
        location: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const { getWeather, getCareSuggestions, getRidingRecommendation } = await import('./_core/weather');
        
        try {
          const weatherData = await getWeather(input.location);
          const suggestions = getCareSuggestions(weatherData);
          const ridingRec = getRidingRecommendation(weatherData);
          
          // Log the weather check
          await db.createWeatherLog({
            userId: ctx.user!.id,
            location: weatherData.location,
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            precipitation: weatherData.precipitation,
            conditions: weatherData.conditions,
            uvIndex: weatherData.uvIndex,
            visibility: weatherData.visibility,
            ridingRecommendation: ridingRec.safety,
            aiAnalysis: JSON.stringify({ suggestions, ridingRec }),
          });
          
          return {
            ...weatherData,
            suggestions,
            ridingRecommendation: ridingRec,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Failed to fetch weather data',
          });
        }
      }),
    
    analyze: subscribedProcedure
      .input(z.object({
        location: z.string(),
        temperature: z.number(),
        humidity: z.number(),
        windSpeed: z.number(),
        precipitation: z.number().optional(),
        conditions: z.string(),
        uvIndex: z.number().optional(),
        visibility: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Use AI to analyze riding conditions
        const prompt = `As an equestrian expert, analyze the following weather conditions for horse riding safety and provide a recommendation:

Location: ${input.location}
Temperature: ${input.temperature}°C
Humidity: ${input.humidity}%
Wind Speed: ${input.windSpeed} km/h
Precipitation: ${input.precipitation || 0} mm
Conditions: ${input.conditions}
UV Index: ${input.uvIndex || 'Unknown'}
Visibility: ${input.visibility || 'Unknown'} km

Please provide:
1. A riding recommendation (excellent, good, fair, poor, or not_recommended)
2. A brief explanation of the conditions
3. Any safety precautions riders should take
4. Best time of day to ride if conditions are marginal

Format your response as JSON with keys: recommendation, explanation, precautions, bestTime`;

        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'You are an expert equestrian advisor specializing in weather safety for horse riding. Always respond with valid JSON.' },
            { role: 'user', content: prompt },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        let aiAnalysis = typeof messageContent === 'string' ? messageContent : '';
        let recommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended' = 'fair';
        
        try {
          const parsed = JSON.parse(aiAnalysis);
          recommendation = parsed.recommendation || 'fair';
        } catch {
          // Default to fair if parsing fails
          const precip = input.precipitation ?? 0;
          if (input.windSpeed > 50 || precip > 10) {
            recommendation = 'not_recommended';
          } else if (input.temperature < 0 || input.temperature > 35) {
            recommendation = 'poor';
          } else if (input.windSpeed > 30 || precip > 5) {
            recommendation = 'fair';
          } else if (input.temperature >= 10 && input.temperature <= 25) {
            recommendation = 'excellent';
          } else {
            recommendation = 'good';
          }
        }

        // Save weather log
        await db.createWeatherLog({
          userId: ctx.user!.id,
          location: input.location,
          temperature: input.temperature,
          humidity: input.humidity,
          windSpeed: input.windSpeed,
          precipitation: input.precipitation,
          conditions: input.conditions,
          uvIndex: input.uvIndex,
          visibility: input.visibility,
          ridingRecommendation: recommendation,
          aiAnalysis,
        });

        return {
          recommendation,
          analysis: aiAnalysis,
        };
      }),
    
    getLatest: subscribedProcedure.query(async ({ ctx }) => {
      return db.getLatestWeatherLog(ctx.user.id);
    }),
    
    getHistory: subscribedProcedure
      .input(z.object({ limit: z.number().default(7) }))
      .query(async ({ ctx, input }) => {
        return db.getWeatherHistory(ctx.user.id, input.limit);
      }),
  }),

  // Admin routes
  admin: router({
    // User management
    getUsers: adminUnlockedProcedure.query(async () => {
      return db.getAllUsers();
    }),
    
    getUserDetails: adminUnlockedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.userId);
        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }
        const horses = await db.getHorsesByUserId(input.userId);
        const activity = await db.getUserActivityLogs(input.userId, 20);
        return { user, horses, activity };
      }),
    
    suspendUser: adminUnlockedProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.suspendUser(input.userId, input.reason);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'user_suspended',
          entityType: 'user',
          entityId: input.userId,
          details: JSON.stringify({ reason: input.reason }),
        });
        return { success: true };
      }),
    
    unsuspendUser: adminUnlockedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unsuspendUser(input.userId);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'user_unsuspended',
          entityType: 'user',
          entityId: input.userId,
        });
        return { success: true };
      }),
    
    deleteUser: adminUnlockedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteUser(input.userId);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'user_deleted',
          entityType: 'user',
          entityId: input.userId,
        });
        return { success: true };
      }),
    
    updateUserRole: adminUnlockedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUser(input.userId, { role: input.role });
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'user_role_updated',
          entityType: 'user',
          entityId: input.userId,
          details: JSON.stringify({ newRole: input.role }),
        });
        return { success: true };
      }),
    
    // System stats
    getStats: adminUnlockedProcedure.query(async () => {
      return db.getSystemStats();
    }),
    
    getOverdueUsers: adminUnlockedProcedure.query(async () => {
      return db.getOverdueSubscriptions();
    }),
    
    getExpiredTrials: adminUnlockedProcedure.query(async () => {
      return db.getExpiredTrials();
    }),
    
    // Activity logs
    getActivityLogs: adminUnlockedProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return db.getActivityLogs(input.limit);
      }),
    
    // System settings
    getSettings: adminUnlockedProcedure.query(async () => {
      return db.getAllSettings();
    }),
    
    updateSetting: adminUnlockedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertSetting(input.key, input.value, input.type, input.description, ctx.user!.id);
        await db.logActivity({
          userId: ctx.user!.id,
          action: 'setting_updated',
          entityType: 'setting',
          details: JSON.stringify({ key: input.key }),
        });
        return { success: true };
      }),
    
    // Backup logs
    getBackupLogs: adminUnlockedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getRecentBackups(input.limit);
      }),
    
    // API Key Management
    apiKeys: router({
      list: adminUnlockedProcedure.query(async ({ ctx }) => {
        return db.listApiKeys(ctx.user.id);
      }),
      
      create: adminUnlockedProcedure
        .input(z.object({
          name: z.string().min(1).max(100),
          rateLimit: z.number().min(1).max(10000).optional(),
          permissions: z.array(z.string()).optional(),
          expiresAt: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const result = await db.createApiKey({
            userId: ctx.user!.id,
            name: input.name,
            rateLimit: input.rateLimit,
            permissions: input.permissions,
            expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
          });
          
          await db.logActivity({
            userId: ctx.user!.id,
            action: 'api_key_created',
            entityType: 'api_key',
            entityId: result.id,
            details: JSON.stringify({ name: input.name }),
          });
          
          return result; // Contains { id, key }
        }),
      
      revoke: adminUnlockedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          await db.revokeApiKey(input.id, ctx.user.id);
          await db.logActivity({
            userId: ctx.user!.id,
            action: 'api_key_revoked',
            entityType: 'api_key',
            entityId: input.id,
          });
          return { success: true };
        }),
      
      rotate: adminUnlockedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const result = await db.rotateApiKey(input.id, ctx.user.id);
          if (!result) {
            throw new TRPCError({ code: 'NOT_FOUND', message: 'API key not found' });
          }
          
          await db.logActivity({
            userId: ctx.user!.id,
            action: 'api_key_rotated',
            entityType: 'api_key',
            entityId: input.id,
          });
          
          return result; // Contains { key }
        }),
      
      updateSettings: adminUnlockedProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          rateLimit: z.number().optional(),
          permissions: z.array(z.string()).optional(),
          isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { id, ...data } = input;
          await db.updateApiKeySettings(id, ctx.user.id, data);
          await db.logActivity({
            userId: ctx.user!.id,
            action: 'api_key_updated',
            entityType: 'api_key',
            entityId: id,
          });
          return { success: true };
        }),
    }),
    
    // Environment Health Check
    getEnvHealth: adminUnlockedProcedure.query(() => {
      const checks = [
        // Core required vars (always critical)
        { name: 'DATABASE_URL', status: !!process.env.DATABASE_URL, critical: true, conditional: false },
        { name: 'JWT_SECRET', status: !!process.env.JWT_SECRET, critical: true, conditional: false },
        { name: 'ADMIN_UNLOCK_PASSWORD', status: !!process.env.ADMIN_UNLOCK_PASSWORD, critical: true, conditional: false },
        
        // Stripe vars (critical only if ENABLE_STRIPE=true)
        { name: 'STRIPE_SECRET_KEY', status: !!process.env.STRIPE_SECRET_KEY, critical: ENV.enableStripe, conditional: true, requiredWhen: 'ENABLE_STRIPE=true' },
        { name: 'STRIPE_WEBHOOK_SECRET', status: !!process.env.STRIPE_WEBHOOK_SECRET, critical: ENV.enableStripe, conditional: true, requiredWhen: 'ENABLE_STRIPE=true' },
        
        // Upload/Storage vars (optional - for S3 storage)
        { name: 'LOCAL_UPLOADS_PATH', status: !!process.env.LOCAL_UPLOADS_PATH, critical: false, conditional: false },
        
        // AWS S3 vars (optional - for S3 storage)
        { name: 'AWS_ACCESS_KEY_ID', status: !!process.env.AWS_ACCESS_KEY_ID, critical: false, conditional: false },
        { name: 'AWS_SECRET_ACCESS_KEY', status: !!process.env.AWS_SECRET_ACCESS_KEY, critical: false, conditional: false },
        { name: 'AWS_S3_BUCKET', status: !!process.env.AWS_S3_BUCKET, critical: false, conditional: false },
        
        // AI/LLM vars (critical for AI features)
        { name: 'OPENAI_API_KEY', status: !!process.env.OPENAI_API_KEY, critical: false, conditional: false },
        { name: 'OPENAI_MODEL', status: !!process.env.OPENAI_MODEL, critical: false, conditional: false },
        
        // Weather API vars (critical for weather features)
        { name: 'WEATHER_API_KEY', status: !!process.env.WEATHER_API_KEY, critical: false, conditional: false },
        { name: 'WEATHER_API_PROVIDER', status: !!process.env.WEATHER_API_PROVIDER, critical: false, conditional: false },
        
        // Legacy AWS vars (deprecated - kept for backward compatibility)
        { name: 'AWS_ACCESS_KEY_ID', status: !!process.env.AWS_ACCESS_KEY_ID, critical: false, conditional: false },
        { name: 'AWS_SECRET_ACCESS_KEY', status: !!process.env.AWS_SECRET_ACCESS_KEY, critical: false, conditional: false },
        { name: 'AWS_S3_BUCKET', status: !!process.env.AWS_S3_BUCKET, critical: false, conditional: false },
        
        // Optional features
        { name: 'OPENAI_API_KEY', status: !!process.env.OPENAI_API_KEY, critical: false, conditional: false },
        { name: 'SMTP_HOST', status: !!process.env.SMTP_HOST, critical: false, conditional: false },
      ];
      
      const allCriticalOk = checks.filter(c => c.critical).every(c => c.status);
      
      return {
        healthy: allCriticalOk,
        checks,
        featureFlags: {
          enableStripe: ENV.enableStripe,
          enableUploads: ENV.enableUploads,
        },
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      };
    }),
    
    // Data Cleanup & Maintenance
    purgeOrphans: adminUnlockedProcedure
      .input(z.object({
        dryRun: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const orphans = {
          healthRecords: 0,
          trainingSessions: 0,
          feedCosts: 0,
          vaccinations: 0,
          dewormings: 0,
          documents: 0,
          treatments: 0,
          appointments: 0,
          dentalCare: 0,
          xrays: 0,
          hoofcare: 0,
          nutritionLogs: 0,
          nutritionPlans: 0,
        };

        // Find all valid horse IDs
        const allHorses = await getDb().select({ id: horses.id }).from(horses);
        const validHorseIds = allHorses.map(h => h.id);

        if (validHorseIds.length === 0) {
          // No horses exist, all records are orphans
          if (!input.dryRun) {
            // Delete all horse-related records
            await getDb().delete(healthRecords);
            await getDb().delete(trainingSessions);
            await getDb().delete(feedCosts);
            // Add more deletions as needed
          }
          
          // Count would be all records
          const hRecords = await getDb().select().from(healthRecords);
          orphans.healthRecords = hRecords.length;
          
        } else {
          // Find orphaned health records
          const orphanedHealthRecords = await getDb()
            .select()
            .from(healthRecords)
            .where(sql`${healthRecords.horseId} NOT IN (${sql.join(validHorseIds.map(id => sql`${id}`), sql`, `)})`)
            .execute();
          
          orphans.healthRecords = orphanedHealthRecords.length;

          if (!input.dryRun && orphanedHealthRecords.length > 0) {
            const orphanIds = orphanedHealthRecords.map(r => r.id);
            await getDb().delete(healthRecords).where(inArray(healthRecords.id, orphanIds));
          }

          // Find orphaned training sessions
          const orphanedTrainingSessions = await getDb()
            .select()
            .from(trainingSessions)
            .where(sql`${trainingSessions.horseId} NOT IN (${sql.join(validHorseIds.map(id => sql`${id}`), sql`, `)})`)
            .execute();
          
          orphans.trainingSessions = orphanedTrainingSessions.length;

          if (!input.dryRun && orphanedTrainingSessions.length > 0) {
            const orphanIds = orphanedTrainingSessions.map(r => r.id);
            await getDb().delete(trainingSessions).where(inArray(trainingSessions.id, orphanIds));
          }

          // Find orphaned feed costs
          const orphanedFeedCosts = await getDb()
            .select()
            .from(feedCosts)
            .where(sql`${feedCosts.horseId} NOT IN (${sql.join(validHorseIds.map(id => sql`${id}`), sql`, `)})`)
            .execute();
          
          orphans.feedCosts = orphanedFeedCosts.length;

          if (!input.dryRun && orphanedFeedCosts.length > 0) {
            const orphanIds = orphanedFeedCosts.map(r => r.id);
            await getDb().delete(feedCosts).where(inArray(feedCosts.id, orphanIds));
          }
        }

        await db.logActivity({
          userId: ctx.user!.id,
          action: input.dryRun ? 'orphan_scan' : 'orphans_purged',
          entityType: 'system',
          details: JSON.stringify(orphans),
        });

        return {
          success: true,
          dryRun: input.dryRun,
          orphans,
        };
      }),
    
    deleteHorseHard: adminUnlockedProcedure
      .input(z.object({
        horseId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify horse exists
        const horse = await db.getHorseById(input.horseId);
        if (!horse) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        const deleted = {
          healthRecords: 0,
          trainingSessions: 0,
          feedCosts: 0,
          vaccinations: 0,
          dewormings: 0,
          documents: 0,
          lessonBookings: 0,
        };

        // Delete all related records
        const healthRecordsDeleted = await getDb()
          .delete(healthRecords)
          .where(eq(healthRecords.horseId, input.horseId))
          .execute();
        deleted.healthRecords = healthRecordsDeleted.rowsAffected || 0;

        const trainingSessionsDeleted = await getDb()
          .delete(trainingSessions)
          .where(eq(trainingSessions.horseId, input.horseId))
          .execute();
        deleted.trainingSessions = trainingSessionsDeleted.rowsAffected || 0;

        const feedCostsDeleted = await getDb()
          .delete(feedCosts)
          .where(eq(feedCosts.horseId, input.horseId))
          .execute();
        deleted.feedCosts = feedCostsDeleted.rowsAffected || 0;

        const lessonBookingsDeleted = await getDb()
          .delete(lessonBookings)
          .where(eq(lessonBookings.horseId, input.horseId))
          .execute();
        deleted.lessonBookings = lessonBookingsDeleted.rowsAffected || 0;

        // Finally, delete the horse itself
        await db.deleteHorse(input.horseId);

        await db.logActivity({
          userId: ctx.user!.id,
          action: 'horse_hard_deleted',
          entityType: 'horse',
          entityId: input.horseId,
          details: JSON.stringify({ horseName: horse.name, deleted }),
        });

        return {
          success: true,
          horseName: horse.name,
          deleted,
        };
      }),
  }),

  // Stable management
  stables: router({
    create: stableProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        location: z.string().optional(),
        logo: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database not available' });
        
        const result = await db.insert(stables).values({
          ...input,
          ownerId: ctx.user.id,
        });
        
        // Add creator as owner member
        await db.insert(stableMembers).values({
          stableId: result[0].insertId,
          userId: ctx.user!.id,
          role: 'owner',
        });
        
        return { id: result[0].insertId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      // Get stables where user is a member
      const members = await db.select()
        .from(stableMembers)
        .where(eq(stableMembers.userId, ctx.user.id));
      
      if (members.length === 0) return [];
      
      const stableIds = members.map(m => m.stableId);
      return db.select()
        .from(stables)
        .where(and(
          sql`id IN (${stableIds.join(',')})`,
          eq(stables.isActive, true)
        ));
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        // Check if user is a member
        const member = await db.select()
          .from(stableMembers)
          .where(and(
            eq(stableMembers.stableId, input.id),
            eq(stableMembers.userId, ctx.user.id)
          ))
          .limit(1);
        
        if (member.length === 0) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
        }
        
        const stable = await db.select()
          .from(stables)
          .where(eq(stables.id, input.id))
          .limit(1);
        
        return stable[0] || null;
      }),

    update: stableProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        logo: z.string().optional(),
        primaryColor: z.string().optional(),
        secondaryColor: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Check if user is owner or admin
        const member = await db.select()
          .from(stableMembers)
          .where(and(
            eq(stableMembers.stableId, input.id),
            eq(stableMembers.userId, ctx.user.id)
          ))
          .limit(1);
        
        if (member.length === 0 || !['owner', 'admin'].includes(member[0].role)) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const { id, ...updateData } = input;
        await db.update(stables)
          .set({ ...updateData, updatedAt: new Date() })
          .where(eq(stables.id, id));
        
        return { success: true };
      }),

    inviteMember: subscribedProcedure
      .input(z.object({
        stableId: z.number(),
        email: z.string().email(),
        role: z.enum(['admin', 'trainer', 'member', 'viewer']),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Check permissions
        const member = await db.select()
          .from(stableMembers)
          .where(and(
            eq(stableMembers.stableId, input.stableId),
            eq(stableMembers.userId, ctx.user.id)
          ))
          .limit(1);
        
        if (member.length === 0 || !['owner', 'admin'].includes(member[0].role)) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const token = nanoid(32);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await db.insert(stableInvites).values({
          stableId: input.stableId,
          invitedByUserId: ctx.user.id,
          email: input.email,
          role: input.role,
          token,
          expiresAt,
        });
        
        return { token, expiresAt };
      }),

    getMembers: protectedProcedure
      .input(z.object({ stableId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        // Verify user is a member
        const isMember = await db.select()
          .from(stableMembers)
          .where(and(
            eq(stableMembers.stableId, input.stableId),
            eq(stableMembers.userId, ctx.user.id)
          ))
          .limit(1);
        
        if (isMember.length === 0) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        return db.select()
          .from(stableMembers)
          .where(and(
            eq(stableMembers.stableId, input.stableId),
            eq(stableMembers.isActive, true)
          ));
      }),
  }),

  // Messages
  messages: router({
    getThreads: protectedProcedure
      .input(z.object({ stableId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select()
          .from(messageThreads)
          .where(and(
            eq(messageThreads.stableId, input.stableId),
            eq(messageThreads.isActive, true)
          ))
          .orderBy(desc(messageThreads.updatedAt));
      }),

    getMessages: protectedProcedure
      .input(z.object({ 
        threadId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select()
          .from(messages)
          .where(eq(messages.threadId, input.threadId))
          .orderBy(desc(messages.createdAt))
          .limit(input.limit);
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        threadId: z.number(),
        content: z.string().min(1),
        attachments: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await db.insert(messages).values({
          threadId: input.threadId,
          senderId: ctx.user.id,
          content: input.content,
          attachments: input.attachments ? JSON.stringify(input.attachments) : null,
        });
        
        return { id: result[0].insertId };
      }),

    createThread: protectedProcedure
      .input(z.object({
        stableId: z.number(),
        title: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await db.insert(messageThreads).values({
          stableId: input.stableId,
          title: input.title,
        });
        
        return { id: result[0].insertId };
      }),
  }),

  // Analytics
  analytics: router({
    // Timeline view - unified feed per horse (B6)
    getTimeline: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        // Get all activities for the horse
        const activities: any[] = [];
        
        // Health records
        const health = await db.select().from(healthRecords)
          .where(and(eq(healthRecords.horseId, input.horseId), eq(healthRecords.userId, ctx.user.id)))
          .orderBy(desc(healthRecords.recordDate))
          .limit(20);
        health.forEach(h => activities.push({
          type: 'health',
          date: h.recordDate,
          title: h.title,
          description: h.description,
          category: h.recordType,
          id: h.id,
        }));
        
        // Training sessions
        const training = await db.select().from(trainingSessions)
          .where(and(eq(trainingSessions.horseId, input.horseId), eq(trainingSessions.userId, ctx.user.id)))
          .orderBy(desc(trainingSessions.sessionDate))
          .limit(20);
        training.forEach(t => activities.push({
          type: 'training',
          date: t.sessionDate,
          title: `${t.sessionType} session`,
          description: t.notes,
          category: t.sessionType,
          performance: t.performance,
          id: t.id,
        }));
        
        // Tasks
        const tasks = await db.getTasksByHorseId(input.horseId, ctx.user.id);
        const completedTasks = tasks.filter(t => t.status === 'completed').slice(0, 20);
        completedTasks.forEach(t => activities.push({
          type: 'task',
          date: t.updatedAt,
          title: t.title,
          description: t.description,
          category: t.taskType,
          id: t.id,
        }));
        
        // Documents
        const docs = await db.getDocumentsByHorseId(input.horseId, ctx.user.id);
        docs.slice(0, 20).forEach(d => activities.push({
          type: 'document',
          date: d.createdAt,
          title: `Document: ${d.fileName}`,
          description: d.description,
          category: d.category,
          id: d.id,
        }));
        
        // Sort by date descending
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        return activities.slice(input.offset, input.offset + input.limit);
      }),
    
    // AI-powered monthly summary (B6)
    getMonthlySummary: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        month: z.string().optional(), // YYYY-MM format
      }))
      .query(async ({ ctx, input }) => {
        const targetMonth = input.month || new Date().toISOString().slice(0, 7);
        const [year, month] = targetMonth.split('-').map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        // Get horse data
        const horse = await db.getHorseById(input.horseId, ctx.user.id);
        if (!horse) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }
        
        // Get data for the month
        const dbInstance = await getDb();
        if (!dbInstance) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const trainingSessions = await dbInstance.select().from(trainingSessions)
          .where(and(
            eq(trainingSessions.horseId, input.horseId),
            eq(trainingSessions.userId, ctx.user.id),
            gte(trainingSessions.sessionDate, startDate.toISOString().split('T')[0]),
            lte(trainingSessions.sessionDate, endDate.toISOString().split('T')[0])
          ));
        
        const healthRecords = await dbInstance.select().from(healthRecords)
          .where(and(
            eq(healthRecords.horseId, input.horseId),
            eq(healthRecords.userId, ctx.user.id),
            gte(healthRecords.recordDate, startDate.toISOString().split('T')[0]),
            lte(healthRecords.recordDate, endDate.toISOString().split('T')[0])
          ));
        
        // Generate AI summary
        const trainingTypes = trainingSessions
          .map(t => t.sessionType)
          .filter(Boolean)
          .join(', ') || 'None';
        const healthTypes = healthRecords
          .map(h => h.recordType)
          .filter(Boolean)
          .join(', ') || 'None';
        
        const prompt = `Generate a concise monthly summary for ${horse.name} for ${targetMonth}:

Training: ${trainingSessions.length} sessions, types: ${trainingTypes}
Health: ${healthRecords.length} records, types: ${healthTypes}

Provide:
1. Key highlights (2-3 points)
2. Notable trends or changes
3. Recommendations for next month

Keep it brief and actionable. Format as JSON: { highlights: [], trends: [], recommendations: [] }`;

        let aiSummary = { highlights: [], trends: [], recommendations: [] };
        try {
          const response = await invokeLLM({
            messages: [
              { role: 'system', content: 'You are an equestrian care analyst. Provide brief, actionable insights. Always respond with valid JSON.' },
              { role: 'user', content: prompt },
            ],
          });
          
          const content = response.choices[0]?.message?.content || '{}';
          try {
            const parsed = JSON.parse(content);
            if (parsed && typeof parsed === 'object') {
              aiSummary = parsed;
            }
          } catch (parseErr) {
            console.warn('[Analytics] Failed to parse AI response:', parseErr);
          }
        } catch (err) {
          console.warn('[Analytics] AI summary failed:', err);
        }
        
        return {
          month: targetMonth,
          horse: { id: horse.id, name: horse.name },
          stats: {
            trainingSessions: trainingSessions.length,
            healthRecords: healthRecords.length,
            avgPerformance: trainingSessions.filter(t => t.performance).length > 0
              ? trainingSessions.filter(t => t.performance).map(t => 
                  t.performance === 'excellent' ? 4 : t.performance === 'good' ? 3 : t.performance === 'average' ? 2 : 1
                ).reduce((a, b) => a + b, 0) / trainingSessions.filter(t => t.performance).length
              : 0,
          },
          aiSummary,
        };
      }),
    
    getTrainingStats: protectedProcedure
      .input(z.object({
        horseId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const whereConditions = [eq(trainingSessions.userId, ctx.user.id)];
        if (input.horseId) {
          whereConditions.push(eq(trainingSessions.horseId, input.horseId));
        }
        
        const result = await db.select({
          totalSessions: sql<number>`COUNT(*)`,
          completedSessions: sql<number>`SUM(CASE WHEN isCompleted = 1 THEN 1 ELSE 0 END)`,
          totalDuration: sql<number>`SUM(duration)`,
          avgPerformance: sql<number>`AVG(CASE 
            WHEN performance = 'excellent' THEN 4
            WHEN performance = 'good' THEN 3
            WHEN performance = 'average' THEN 2
            WHEN performance = 'poor' THEN 1
            ELSE 0 END)`,
        }).from(trainingSessions)
        .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0]);
        
        return result[0] || null;
      }),

    getHealthStats: protectedProcedure
      .input(z.object({
        horseId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const result = await db.select({
          totalRecords: sql<number>`COUNT(*)`,
          upcomingReminders: sql<number>`SUM(CASE WHEN nextDueDate >= CURDATE() THEN 1 ELSE 0 END)`,
          overdueReminders: sql<number>`SUM(CASE WHEN nextDueDate < CURDATE() THEN 1 ELSE 0 END)`,
        }).from(healthRecords)
        .where(eq(healthRecords.userId, ctx.user.id));
        
        return result[0] || null;
      }),

    getCostAnalysis: protectedProcedure
      .input(z.object({
        horseId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const feedCostsResult = await db.select({
          totalCost: sql<number>`SUM(costPerUnit)`,
        }).from(feedCosts)
        .where(eq(feedCosts.userId, ctx.user.id));
        
        const healthCostsResult = await db.select({
          totalCost: sql<number>`SUM(cost)`,
        }).from(healthRecords)
        .where(eq(healthRecords.userId, ctx.user.id));
        
        return {
          feedCosts: feedCostsResult[0]?.totalCost || 0,
          healthCosts: healthCostsResult[0]?.totalCost || 0,
          totalCosts: (feedCostsResult[0]?.totalCost || 0) + (healthCostsResult[0]?.totalCost || 0),
        };
      }),
  }),

  // Reports
  reports: router({
    generate: subscribedProcedure
      .input(z.object({
        reportType: z.enum(['monthly_summary', 'health_report', 'training_progress', 'cost_analysis', 'competition_summary']),
        horseId: z.number().optional(),
        stableId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Generate report data based on type
        let reportData = {};
        
        const result = await db.insert(reports).values({
          userId: ctx.user!.id,
          stableId: input.stableId,
          horseId: input.horseId,
          reportType: input.reportType,
          title: `${input.reportType.replace('_', ' ')} Report`,
          reportData: JSON.stringify(reportData),
        });
        
        return { id: result[0].insertId };
      }),

    list: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select()
          .from(reports)
          .where(eq(reports.userId, ctx.user.id))
          .orderBy(desc(reports.generatedAt))
          .limit(input.limit);
      }),

    scheduleReport: subscribedProcedure
      .input(z.object({
        reportType: z.enum(['monthly_summary', 'health_report', 'training_progress', 'cost_analysis', 'competition_summary']),
        frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']),
        recipients: z.array(z.string().email()),
        stableId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await db.insert(reportSchedules).values({
          userId: ctx.user!.id,
          stableId: input.stableId,
          reportType: input.reportType,
          frequency: input.frequency,
          recipients: JSON.stringify(input.recipients),
          nextRunAt: new Date(),
        });
        
        return { id: result[0].insertId };
      }),
  }),

  // Calendar and Events
  calendar: router({
    getEvents: protectedProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
        stableId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select()
          .from(events)
          .where(and(
            eq(events.userId, ctx.user.id),
            gte(events.startDate, new Date(input.startDate)),
            lte(events.startDate, new Date(input.endDate))
          ))
          .orderBy(events.startDate);
      }),

    createEvent: subscribedProcedure
      .input(z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        eventType: z.enum(['training', 'competition', 'veterinary', 'farrier', 'lesson', 'meeting', 'other']),
        startDate: z.string(),
        endDate: z.string().optional(),
        horseId: z.number().optional(),
        stableId: z.number().optional(),
        location: z.string().optional(),
        isAllDay: z.boolean().default(false),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await db.insert(events).values({
          ...input,
          userId: ctx.user!.id,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : null,
        });
        
        // Real-time update
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('events', 'created', { id: result[0].insertId, ...input }, ctx.user!.id);
        
        return { id: result[0].insertId };
      }),

    updateEvent: subscribedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const { id, ...updateData } = input;
        await db.update(events)
          .set({ 
            ...updateData,
            startDate: updateData.startDate ? new Date(updateData.startDate) : undefined,
            endDate: updateData.endDate ? new Date(updateData.endDate) : undefined,
            updatedAt: new Date(),
          })
          .where(and(
            eq(events.id, id),
            eq(events.userId, ctx.user.id)
          ));
        
        // Real-time update
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('events', 'updated', { id, ...updateData }, ctx.user.id);
        
        return { success: true };
      }),

    deleteEvent: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        await db.delete(events)
          .where(and(
            eq(events.id, input.id),
            eq(events.userId, ctx.user.id)
          ));
        
        // Real-time update
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('events', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),
  }),

  // Competition Management
  competitions: router({
    create: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        competitionName: z.string().min(1).max(200),
        venue: z.string().optional(),
        date: z.string(),
        discipline: z.string().optional(),
        level: z.string().optional(),
        class: z.string().optional(),
        placement: z.string().optional(),
        score: z.string().optional(),
        notes: z.string().optional(),
        cost: z.number().optional(),
        winnings: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await db.insert(competitions).values({
          ...input,
          userId: ctx.user!.id,
          date: new Date(input.date),
        });
        
        return { id: result[0].insertId };
      }),

    list: protectedProcedure
      .input(z.object({
        horseId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        if (input.horseId) {
          return db.getCompetitionsByHorseId(input.horseId, ctx.user.id);
        }
        return db.getCompetitionsByUserId(ctx.user.id);
      }),
    
    exportCSV: subscribedProcedure.query(async ({ ctx }) => {
      const competitionData = await db.getCompetitionsByUserId(ctx.user.id);
      const csv = exportCompetitionsCSV(competitionData);
      const filename = generateCSVFilename('competitions');
      
      return {
        csv,
        filename,
        mimeType: 'text/csv',
      };
    }),
  }),

  // Training Program Templates
  trainingPrograms: router({
    listTemplates: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select()
        .from(trainingProgramTemplates)
        .where(or(
          eq(trainingProgramTemplates.userId, ctx.user.id),
          eq(trainingProgramTemplates.isPublic, true)
        ))
        .orderBy(desc(trainingProgramTemplates.createdAt));
    }),

    createTemplate: subscribedProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        duration: z.number().optional(),
        discipline: z.string().optional(),
        level: z.string().optional(),
        goals: z.string().optional(),
        programData: z.string(),
        isPublic: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await db.insert(trainingProgramTemplates).values({
          ...input,
          userId: ctx.user!.id,
        });
        
        return { id: result[0].insertId };
      }),

    getTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const templates = await db.select()
          .from(trainingProgramTemplates)
          .where(eq(trainingProgramTemplates.id, input.id))
          .limit(1);
        
        if (templates.length === 0) return null;
        
        // Check permissions
        const template = templates[0];
        if (template.userId !== ctx.user.id && !template.isPublic) {
          return null;
        }
        
        return template;
      }),

    updateTemplate: subscribedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        duration: z.number().optional(),
        discipline: z.string().optional(),
        level: z.string().optional(),
        goals: z.string().optional(),
        programData: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const { id, ...updateData } = input;
        
        // Verify ownership
        const existing = await db.select()
          .from(trainingProgramTemplates)
          .where(eq(trainingProgramTemplates.id, id))
          .limit(1);
        
        if (existing.length === 0 || existing[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.update(trainingProgramTemplates)
          .set(updateData)
          .where(eq(trainingProgramTemplates.id, id));
        
        return { success: true };
      }),

    deleteTemplate: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Verify ownership
        const existing = await db.select()
          .from(trainingProgramTemplates)
          .where(eq(trainingProgramTemplates.id, input.id))
          .limit(1);
        
        if (existing.length === 0 || existing[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.delete(trainingProgramTemplates)
          .where(eq(trainingProgramTemplates.id, input.id));
        
        return { success: true };
      }),

    duplicateTemplate: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Get existing template
        const existing = await db.select()
          .from(trainingProgramTemplates)
          .where(eq(trainingProgramTemplates.id, input.id))
          .limit(1);
        
        if (existing.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        
        const template = existing[0];
        
        // Check if user can access this template
        if (template.userId !== ctx.user.id && !template.isPublic) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        // Create duplicate
        const result = await db.insert(trainingProgramTemplates).values({
          name: `${template.name} (Copy)`,
          description: template.description,
          duration: template.duration,
          discipline: template.discipline,
          level: template.level,
          goals: template.goals,
          programData: template.programData,
          isPublic: false,
          userId: ctx.user.id,
        });
        
        return { id: result[0].insertId };
      }),

    applyTemplate: subscribedProcedure
      .input(z.object({
        templateId: z.number(),
        horseId: z.number(),
        startDate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Get template
        const template = await db.select()
          .from(trainingProgramTemplates)
          .where(eq(trainingProgramTemplates.id, input.templateId))
          .limit(1);
        
        if (template.length === 0) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }
        
        // Create program instance
        const result = await db.insert(trainingPrograms).values({
          horseId: input.horseId,
          userId: ctx.user!.id,
          templateId: input.templateId,
          name: template[0].name,
          startDate: new Date(input.startDate),
          programData: template[0].programData,
        });
        
        return { id: result[0].insertId };
      }),
  }),

  // Breeding Management
  breeding: router({
    createRecord: stableProcedure
      .input(z.object({
        mareId: z.number(),
        stallionId: z.number().optional(),
        stallionName: z.string().optional(),
        breedingDate: z.string(),
        method: z.enum(['natural', 'artificial', 'embryo_transfer']),
        veterinarianName: z.string().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await db.insert(breeding).values({
          ...input,
          breedingDate: new Date(input.breedingDate),
        });
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const recordId = result[0].insertId;
        const record = await db.select().from(breeding).where(eq(breeding.id, recordId)).limit(1);
        if (record[0]) {
          publishModuleEvent('breeding', 'created', record[0], ctx.user!.id);
        }
        
        return { id: recordId };
      }),

    list: protectedProcedure
      .input(z.object({
        mareId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        // Join with horses table to filter by user ownership
        const userHorses = await db.select({ id: horses.id })
          .from(horses)
          .where(eq(horses.userId, ctx.user.id));
        
        const horseIds = userHorses.map(h => h.id);
        if (horseIds.length === 0) return [];
        
        let query = db.select().from(breeding)
          .where(inArray(breeding.mareId, horseIds));
        
        if (input.mareId) {
          query = db.select().from(breeding)
            .where(and(
              inArray(breeding.mareId, horseIds),
              eq(breeding.mareId, input.mareId)
            ));
        }
        
        return query.orderBy(desc(breeding.breedingDate));
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        // Verify ownership through horses table
        const userHorses = await db.select({ id: horses.id })
          .from(horses)
          .where(eq(horses.userId, ctx.user.id));
        
        const horseIds = userHorses.map(h => h.id);
        
        const records = await db.select()
          .from(breeding)
          .where(and(
            eq(breeding.id, input.id),
            inArray(breeding.mareId, horseIds)
          ))
          .limit(1);
        
        return records.length > 0 ? records[0] : null;
      }),

    update: subscribedProcedure
      .input(z.object({
        id: z.number(),
        stallionName: z.string().optional(),
        breedingDate: z.string().optional(),
        method: z.enum(['natural', 'artificial', 'embryo_transfer']).optional(),
        veterinarianName: z.string().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const { id, ...updateData } = input;
        
        // Verify ownership through horses table
        const userHorses = await db.select({ id: horses.id })
          .from(horses)
          .where(eq(horses.userId, ctx.user.id));
        
        const horseIds = userHorses.map(h => h.id);
        
        const existing = await db.select()
          .from(breeding)
          .where(and(
            eq(breeding.id, id),
            inArray(breeding.mareId, horseIds)
          ))
          .limit(1);
        
        if (existing.length === 0) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const dataToUpdate: any = { ...updateData };
        if (updateData.breedingDate) {
          dataToUpdate.breedingDate = new Date(updateData.breedingDate);
        }
        
        await db.update(breeding)
          .set(dataToUpdate)
          .where(eq(breeding.id, id));
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const record = await db.select().from(breeding).where(eq(breeding.id, id)).limit(1);
        if (record[0]) {
          publishModuleEvent('breeding', 'updated', record[0], ctx.user.id);
        }
        
        return { success: true };
      }),

    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Verify ownership through horses table
        const userHorses = await db.select({ id: horses.id })
          .from(horses)
          .where(eq(horses.userId, ctx.user.id));
        
        const horseIds = userHorses.map(h => h.id);
        
        const existing = await db.select()
          .from(breeding)
          .where(and(
            eq(breeding.id, input.id),
            inArray(breeding.mareId, horseIds)
          ))
          .limit(1);
        
        if (existing.length === 0) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        await db.delete(breeding)
          .where(eq(breeding.id, input.id));
        
        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('breeding', 'deleted', { id: input.id }, ctx.user.id);
        
        return { success: true };
      }),

    confirmPregnancy: subscribedProcedure
      .input(z.object({
        id: z.number(),
        confirmed: z.boolean(),
        confirmationDate: z.string().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        // Verify ownership through horses table
        const userHorses = await db.select({ id: horses.id })
          .from(horses)
          .where(eq(horses.userId, ctx.user.id));
        
        const horseIds = userHorses.map(h => h.id);
        
        const existing = await db.select()
          .from(breeding)
          .where(and(
            eq(breeding.id, input.id),
            inArray(breeding.mareId, horseIds)
          ))
          .limit(1);
        
        if (existing.length === 0) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        
        const updateData: any = {
          pregnancyConfirmed: input.confirmed,
        };
        
        if (input.confirmationDate) {
          updateData.confirmationDate = new Date(input.confirmationDate);
        }
        if (input.dueDate) {
          updateData.dueDate = new Date(input.dueDate);
        }
        
        await db.update(breeding)
          .set(updateData)
          .where(eq(breeding.id, input.id));
        
        return { success: true };
      }),

    addFoal: subscribedProcedure
      .input(z.object({
        breedingId: z.number(),
        birthDate: z.string(),
        gender: z.enum(['colt', 'filly']),
        name: z.string().optional(),
        color: z.string().optional(),
        birthWeight: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        
        const result = await db.insert(foals).values({
          ...input,
          birthDate: new Date(input.birthDate),
        });
        
        return { id: result[0].insertId };
      }),

    listFoals: protectedProcedure
      .input(z.object({
        breedingId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        if (input.breedingId) {
          return db.select().from(foals)
            .where(eq(foals.breedingId, input.breedingId))
            .orderBy(desc(foals.birthDate));
        }
        
        return db.select().from(foals)
          .orderBy(desc(foals.birthDate));
      }),
    
    exportCSV: subscribedProcedure.query(async ({ ctx }) => {
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      
      // Get user's horses first
      const userHorses = await dbInstance.select({ id: horses.id })
        .from(horses)
        .where(eq(horses.userId, ctx.user.id));
      
      const horseIds = userHorses.map(h => h.id);
      if (horseIds.length === 0) {
        // No horses, return empty CSV
        const headers = ['id', 'mareId', 'stallionName', 'breedingDate', 'method', 'cost', 'pregnancyConfirmed', 'dueDate', 'notes'];
        const csv = [headers.join(',')].join('\n');
        return {
          csv,
          filename: generateCSVFilename('breeding'),
          mimeType: 'text/csv',
        };
      }
      
      const breedingRecords = await dbInstance.select()
        .from(breeding)
        .where(inArray(breeding.mareId, horseIds))
        .orderBy(desc(breeding.createdAt));
      
      // Create CSV with breeding data
      const headers = ['id', 'mareId', 'stallionName', 'breedingDate', 'method', 'cost', 'pregnancyConfirmed', 'dueDate', 'notes'];
      const data = breedingRecords.map(record => ({
        id: record.id,
        mareId: record.mareId,
        stallionName: record.stallionName || 'N/A',
        breedingDate: record.breedingDate ? new Date(record.breedingDate).toISOString().split('T')[0] : '',
        method: record.method,
        cost: record.cost || 0,
        pregnancyConfirmed: record.pregnancyConfirmed ? 'Yes' : 'No',
        dueDate: record.dueDate ? new Date(record.dueDate).toISOString().split('T')[0] : '',
        notes: record.notes || '',
      }));
      
      const csv = data.length > 0 ? 
        [headers.join(','), ...data.map(row => headers.map(h => (row as any)[h]).join(','))].join('\n') :
        headers.join(',');
      
      const filename = generateCSVFilename('breeding_records');
      
      return {
        csv,
        filename,
        mimeType: 'text/csv',
      };
    }),
  }),

  // Trainer availability management
  trainerAvailability: router({
    create: protectedProcedure
      .input(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
        
        const result = await db.insert(trainerAvailability).values({
          trainerId: ctx.user.id,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          isActive: true,
        });
        
        return { id: result[0].insertId };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select()
        .from(trainerAvailability)
        .where(and(
          eq(trainerAvailability.trainerId, ctx.user.id),
          eq(trainerAvailability.isActive, true)
        ))
        .orderBy(trainerAvailability.dayOfWeek, trainerAvailability.startTime);
    }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const existing = await db.select().from(trainerAvailability)
          .where(eq(trainerAvailability.id, input.id))
          .limit(1);
        
        if (!existing.length || existing[0].trainerId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const updateData: any = {};
        if (input.dayOfWeek !== undefined) updateData.dayOfWeek = input.dayOfWeek;
        if (input.startTime) updateData.startTime = input.startTime;
        if (input.endTime) updateData.endTime = input.endTime;

        await db.update(trainerAvailability)
          .set(updateData)
          .where(eq(trainerAvailability.id, input.id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const existing = await db.select().from(trainerAvailability)
          .where(eq(trainerAvailability.id, input.id))
          .limit(1);
        
        if (!existing.length || existing[0].trainerId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        await db.update(trainerAvailability)
          .set({ isActive: false })
          .where(eq(trainerAvailability.id, input.id));

        return { success: true };
      }),
  }),

  // Lesson bookings management
  lessonBookings: router({
    create: protectedProcedure
      .input(z.object({
        trainerId: z.number(),
        horseId: z.number().optional(),
        lessonDate: z.string(),
        duration: z.number(),
        lessonType: z.string().optional(),
        location: z.string().optional(),
        fee: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }
        
        const result = await db.insert(lessonBookings).values({
          trainerId: input.trainerId,
          clientId: ctx.user.id,
          horseId: input.horseId,
          lessonDate: new Date(input.lessonDate),
          duration: input.duration,
          lessonType: input.lessonType,
          location: input.location,
          status: 'scheduled',
          fee: input.fee,
          paid: false,
          notes: input.notes,
        });
        
        return { id: result[0].insertId };
      }),

    list: protectedProcedure
      .input(z.object({
        asTrainer: z.boolean().optional(),
        status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        let conditions: any[] = [];
        
        if (input.asTrainer) {
          conditions.push(eq(lessonBookings.trainerId, ctx.user.id));
        } else {
          conditions.push(eq(lessonBookings.clientId, ctx.user.id));
        }
        
        if (input.status) {
          conditions.push(eq(lessonBookings.status, input.status));
        }
        
        return db.select()
          .from(lessonBookings)
          .where(and(...conditions))
          .orderBy(desc(lessonBookings.lessonDate));
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const lessons = await db.select()
          .from(lessonBookings)
          .where(eq(lessonBookings.id, input.id))
          .limit(1);

        if (!lessons.length) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const lesson = lessons[0];
        if (lesson.trainerId !== ctx.user.id && lesson.clientId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        return lesson;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        lessonDate: z.string().optional(),
        duration: z.number().optional(),
        lessonType: z.string().optional(),
        location: z.string().optional(),
        status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']).optional(),
        fee: z.number().optional(),
        paid: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const existing = await db.select().from(lessonBookings)
          .where(eq(lessonBookings.id, input.id))
          .limit(1);
        
        if (!existing.length) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const lesson = existing[0];
        if (lesson.trainerId !== ctx.user.id && lesson.clientId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const updateData: any = {};
        if (input.lessonDate) updateData.lessonDate = new Date(input.lessonDate);
        if (input.duration) updateData.duration = input.duration;
        if (input.lessonType) updateData.lessonType = input.lessonType;
        if (input.location) updateData.location = input.location;
        if (input.status) updateData.status = input.status;
        if (input.fee !== undefined) updateData.fee = input.fee;
        if (input.paid !== undefined) updateData.paid = input.paid;
        if (input.notes) updateData.notes = input.notes;

        await db.update(lessonBookings)
          .set(updateData)
          .where(eq(lessonBookings.id, input.id));

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const existing = await db.select().from(lessonBookings)
          .where(eq(lessonBookings.id, input.id))
          .limit(1);
        
        if (!existing.length) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const lesson = existing[0];
        if (lesson.trainerId !== ctx.user.id && lesson.clientId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.delete(lessonBookings)
          .where(eq(lessonBookings.id, input.id));

        return { success: true };
      }),

    markCompleted: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const existing = await db.select().from(lessonBookings)
          .where(eq(lessonBookings.id, input.id))
          .limit(1);
        
        if (!existing.length) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        if (existing[0].trainerId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.update(lessonBookings)
          .set({ status: 'completed' })
          .where(eq(lessonBookings.id, input.id));

        return { success: true };
      }),

    markCancelled: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const existing = await db.select().from(lessonBookings)
          .where(eq(lessonBookings.id, input.id))
          .limit(1);
        
        if (!existing.length) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const lesson = existing[0];
        if (lesson.trainerId !== ctx.user.id && lesson.clientId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        await db.update(lessonBookings)
          .set({ status: 'cancelled' })
          .where(eq(lessonBookings.id, input.id));

        return { success: true };
      }),
  }),

  // ============ TREATMENTS ROUTER ============
  treatments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTreatmentsByUserId(ctx.user.id);
    }),

    listByHorse: protectedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getTreatmentsByHorseId(input.horseId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getTreatmentById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        treatmentType: z.string().min(1),
        treatmentName: z.string().min(1).max(200),
        description: z.string().optional(),
        startDate: z.string(), // ISO date string
        endDate: z.string().optional(),
        frequency: z.string().optional(),
        dosage: z.string().optional(),
        administeredBy: z.string().optional(),
        vetName: z.string().optional(),
        vetClinic: z.string().optional(),
        cost: z.number().optional(),
        status: z.enum(['active', 'completed', 'discontinued']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { startDate, endDate, ...rest } = input;
        const id = await db.createTreatment({
          ...rest,
          userId: ctx.user.id,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const treatment = await db.getTreatmentById(id, ctx.user.id);
        if (treatment) {
          publishModuleEvent('treatments', 'created', treatment, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'treatment_created',
          entityType: 'treatment',
          entityId: id,
          details: `Created treatment: ${input.treatmentName}`,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        treatmentType: z.string().optional(),
        treatmentName: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        frequency: z.string().optional(),
        dosage: z.string().optional(),
        administeredBy: z.string().optional(),
        vetName: z.string().optional(),
        vetClinic: z.string().optional(),
        cost: z.number().optional(),
        status: z.enum(['active', 'completed', 'discontinued']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, startDate, endDate, ...data } = input;
        await db.updateTreatment(id, ctx.user.id, {
          ...data,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const treatment = await db.getTreatmentById(id, ctx.user.id);
        if (treatment) {
          publishModuleEvent('treatments', 'updated', treatment, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'treatment_updated',
          entityType: 'treatment',
          entityId: id,
          details: `Updated treatment`,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTreatment(input.id, ctx.user.id);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('treatments', 'deleted', { id: input.id }, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'treatment_deleted',
          entityType: 'treatment',
          entityId: input.id,
          details: `Deleted treatment`,
        });

        return { success: true };
      }),
  }),

  // ============ APPOINTMENTS ROUTER ============
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAppointmentsByUserId(ctx.user.id);
    }),

    listByHorse: protectedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getAppointmentsByHorseId(input.horseId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getAppointmentById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        appointmentType: z.string().min(1).max(100),
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        appointmentDate: z.string(), // ISO date string
        appointmentTime: z.string().optional(),
        duration: z.number().optional(),
        providerName: z.string().optional(),
        providerPhone: z.string().optional(),
        providerClinic: z.string().optional(),
        location: z.string().optional(),
        cost: z.number().optional(),
        status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { appointmentDate, ...rest } = input;
        const id = await db.createAppointment({
          ...rest,
          userId: ctx.user.id,
          appointmentDate: new Date(appointmentDate),
          reminderSent: false,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const appointment = await db.getAppointmentById(id, ctx.user.id);
        if (appointment) {
          publishModuleEvent('appointments', 'created', appointment, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'appointment_created',
          entityType: 'appointment',
          entityId: id,
          details: `Created appointment: ${input.title}`,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        appointmentType: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        appointmentDate: z.string().optional(),
        appointmentTime: z.string().optional(),
        duration: z.number().optional(),
        providerName: z.string().optional(),
        providerPhone: z.string().optional(),
        providerClinic: z.string().optional(),
        location: z.string().optional(),
        cost: z.number().optional(),
        status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, appointmentDate, ...data } = input;
        await db.updateAppointment(id, ctx.user.id, {
          ...data,
          appointmentDate: appointmentDate ? new Date(appointmentDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const appointment = await db.getAppointmentById(id, ctx.user.id);
        if (appointment) {
          publishModuleEvent('appointments', 'updated', appointment, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'appointment_updated',
          entityType: 'appointment',
          entityId: id,
          details: `Updated appointment`,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteAppointment(input.id, ctx.user.id);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('appointments', 'deleted', { id: input.id }, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'appointment_deleted',
          entityType: 'appointment',
          entityId: input.id,
          details: `Deleted appointment`,
        });

        return { success: true };
      }),
  }),

  // ============ DENTAL CARE ROUTER ============
  dentalCare: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getDentalCareByUserId(ctx.user.id);
    }),

    listByHorse: protectedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getDentalCareByHorseId(input.horseId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getDentalCareById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        examDate: z.string(), // ISO date string
        dentistName: z.string().optional(),
        dentistClinic: z.string().optional(),
        procedureType: z.string().optional(),
        findings: z.string().optional(),
        treatmentPerformed: z.string().optional(),
        nextDueDate: z.string().optional(),
        cost: z.number().optional(),
        sedationUsed: z.boolean().optional(),
        teethCondition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { examDate, nextDueDate, ...rest } = input;
        const id = await db.createDentalCare({
          ...rest,
          userId: ctx.user.id,
          examDate: new Date(examDate),
          nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const dental = await db.getDentalCareById(id, ctx.user.id);
        if (dental) {
          publishModuleEvent('dentalCare', 'created', dental, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'dental_care_created',
          entityType: 'dental_care',
          entityId: id,
          details: `Created dental care record`,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        examDate: z.string().optional(),
        dentistName: z.string().optional(),
        dentistClinic: z.string().optional(),
        procedureType: z.string().optional(),
        findings: z.string().optional(),
        treatmentPerformed: z.string().optional(),
        nextDueDate: z.string().optional(),
        cost: z.number().optional(),
        sedationUsed: z.boolean().optional(),
        teethCondition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, examDate, nextDueDate, ...data } = input;
        await db.updateDentalCare(id, ctx.user.id, {
          ...data,
          examDate: examDate ? new Date(examDate) : undefined,
          nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const dental = await db.getDentalCareById(id, ctx.user.id);
        if (dental) {
          publishModuleEvent('dentalCare', 'updated', dental, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'dental_care_updated',
          entityType: 'dental_care',
          entityId: id,
          details: `Updated dental care record`,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteDentalCare(input.id, ctx.user.id);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('dentalCare', 'deleted', { id: input.id }, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'dental_care_deleted',
          entityType: 'dental_care',
          entityId: input.id,
          details: `Deleted dental care record`,
        });

        return { success: true };
      }),
  }),

  // ============ X-RAYS ROUTER ============
  xrays: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getXraysByUserId(ctx.user.id);
    }),

    listByHorse: protectedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getXraysByHorseId(input.horseId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getXrayById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        xrayDate: z.string(), // ISO date string
        bodyPart: z.string().min(1).max(100),
        reason: z.string().optional(),
        vetName: z.string().optional(),
        vetClinic: z.string().optional(),
        findings: z.string().optional(),
        diagnosis: z.string().optional(),
        fileUrl: z.string().optional(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { xrayDate, ...rest } = input;
        const id = await db.createXray({
          ...rest,
          userId: ctx.user.id,
          xrayDate: new Date(xrayDate),
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const xray = await db.getXrayById(id, ctx.user.id);
        if (xray) {
          publishModuleEvent('xrays', 'created', xray, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'xray_created',
          entityType: 'xray',
          entityId: id,
          details: `Created x-ray record for ${input.bodyPart}`,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        xrayDate: z.string().optional(),
        bodyPart: z.string().optional(),
        reason: z.string().optional(),
        vetName: z.string().optional(),
        vetClinic: z.string().optional(),
        findings: z.string().optional(),
        diagnosis: z.string().optional(),
        fileUrl: z.string().optional(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, xrayDate, ...data } = input;
        await db.updateXray(id, ctx.user.id, {
          ...data,
          xrayDate: xrayDate ? new Date(xrayDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const xray = await db.getXrayById(id, ctx.user.id);
        if (xray) {
          publishModuleEvent('xrays', 'updated', xray, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'xray_updated',
          entityType: 'xray',
          entityId: id,
          details: `Updated x-ray record`,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteXray(input.id, ctx.user.id);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('xrays', 'deleted', { id: input.id }, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'xray_deleted',
          entityType: 'xray',
          entityId: input.id,
          details: `Deleted x-ray record`,
        });

        return { success: true };
      }),
  }),

  // ============ TAGS ROUTER ============
  tags: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTagsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getTagById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        color: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createTag({
          ...input,
          userId: ctx.user.id,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const tag = await db.getTagById(id, ctx.user.id);
        if (tag) {
          publishModuleEvent('tags', 'created', tag, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'tag_created',
          entityType: 'tag',
          entityId: id,
          details: `Created tag: ${input.name}`,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        color: z.string().optional(),
        category: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateTag(id, ctx.user.id, data);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const tag = await db.getTagById(id, ctx.user.id);
        if (tag) {
          publishModuleEvent('tags', 'updated', tag, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'tag_updated',
          entityType: 'tag',
          entityId: id,
          details: `Updated tag`,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTag(input.id, ctx.user.id);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('tags', 'deleted', { id: input.id }, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'tag_deleted',
          entityType: 'tag',
          entityId: input.id,
          details: `Deleted tag`,
        });

        return { success: true };
      }),
  }),

  // ============ HOOFCARE ROUTER ============
  hoofcare: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getHoofcareByUserId(ctx.user.id);
    }),

    listByHorse: protectedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getHoofcareByHorseId(input.horseId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getHoofcareById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        careDate: z.string(), // ISO date string
        careType: z.enum(['shoeing', 'trimming', 'remedial', 'inspection', 'other']),
        farrierName: z.string().optional(),
        farrierPhone: z.string().optional(),
        hoofCondition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        shoesType: z.string().optional(),
        findings: z.string().optional(),
        workPerformed: z.string().optional(),
        nextDueDate: z.string().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { careDate, nextDueDate, ...rest } = input;
        const id = await db.createHoofcare({
          ...rest,
          userId: ctx.user.id,
          careDate: new Date(careDate),
          nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const hoofcare = await db.getHoofcareById(id, ctx.user.id);
        if (hoofcare) {
          publishModuleEvent('hoofcare', 'created', hoofcare, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'hoofcare_created',
          entityType: 'hoofcare',
          entityId: id,
          details: `Created hoofcare record`,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        careDate: z.string().optional(),
        careType: z.enum(['shoeing', 'trimming', 'remedial', 'inspection', 'other']).optional(),
        farrierName: z.string().optional(),
        farrierPhone: z.string().optional(),
        hoofCondition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        shoesType: z.string().optional(),
        findings: z.string().optional(),
        workPerformed: z.string().optional(),
        nextDueDate: z.string().optional(),
        cost: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, careDate, nextDueDate, ...data } = input;
        await db.updateHoofcare(id, ctx.user.id, {
          ...data,
          careDate: careDate ? new Date(careDate) : undefined,
          nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const hoofcare = await db.getHoofcareById(id, ctx.user.id);
        if (hoofcare) {
          publishModuleEvent('hoofcare', 'updated', hoofcare, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'hoofcare_updated',
          entityType: 'hoofcare',
          entityId: id,
          details: `Updated hoofcare record`,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteHoofcare(input.id, ctx.user.id);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('hoofcare', 'deleted', { id: input.id }, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'hoofcare_deleted',
          entityType: 'hoofcare',
          entityId: input.id,
          details: `Deleted hoofcare record`,
        });

        return { success: true };
      }),
  }),

  // ============ NUTRITION LOGS ROUTER ============
  nutritionLogs: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNutritionLogsByUserId(ctx.user.id);
    }),

    listByHorse: protectedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getNutritionLogsByHorseId(input.horseId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getNutritionLogById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        logDate: z.string(), // ISO date string
        feedType: z.string().min(1).max(100),
        feedName: z.string().optional(),
        amount: z.string().optional(),
        mealTime: z.string().optional(),
        supplements: z.string().optional(),
        hay: z.string().optional(),
        water: z.string().optional(),
        bodyConditionScore: z.number().optional(),
        weight: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { logDate, ...rest } = input;
        const id = await db.createNutritionLog({
          ...rest,
          userId: ctx.user.id,
          logDate: new Date(logDate),
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const log = await db.getNutritionLogById(id, ctx.user.id);
        if (log) {
          publishModuleEvent('nutritionLogs', 'created', log, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'nutrition_log_created',
          entityType: 'nutrition_log',
          entityId: id,
          details: `Created nutrition log`,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        logDate: z.string().optional(),
        feedType: z.string().optional(),
        feedName: z.string().optional(),
        amount: z.string().optional(),
        mealTime: z.string().optional(),
        supplements: z.string().optional(),
        hay: z.string().optional(),
        water: z.string().optional(),
        bodyConditionScore: z.number().optional(),
        weight: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, logDate, ...data } = input;
        await db.updateNutritionLog(id, ctx.user.id, {
          ...data,
          logDate: logDate ? new Date(logDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const log = await db.getNutritionLogById(id, ctx.user.id);
        if (log) {
          publishModuleEvent('nutritionLogs', 'updated', log, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'nutrition_log_updated',
          entityType: 'nutrition_log',
          entityId: id,
          details: `Updated nutrition log`,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNutritionLog(input.id, ctx.user.id);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('nutritionLogs', 'deleted', { id: input.id }, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'nutrition_log_deleted',
          entityType: 'nutrition_log',
          entityId: input.id,
          details: `Deleted nutrition log`,
        });

        return { success: true };
      }),
  }),

  // ============ NUTRITION PLANS ROUTER ============
  nutritionPlans: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNutritionPlansByUserId(ctx.user.id);
    }),

    listByHorse: protectedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getNutritionPlansByHorseId(input.horseId, ctx.user.id);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return await db.getNutritionPlanById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        horseId: z.number(),
        planName: z.string().min(1).max(200),
        startDate: z.string(), // ISO date string
        endDate: z.string().optional(),
        targetWeight: z.number().optional(),
        targetBodyCondition: z.number().optional(),
        dailyHay: z.string().optional(),
        dailyConcentrates: z.string().optional(),
        supplements: z.string().optional(),
        specialInstructions: z.string().optional(),
        feedingSchedule: z.string().optional(),
        caloriesPerDay: z.number().optional(),
        proteinPerDay: z.string().optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { startDate, endDate, ...rest } = input;
        const id = await db.createNutritionPlan({
          ...rest,
          userId: ctx.user.id,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const plan = await db.getNutritionPlanById(id, ctx.user.id);
        if (plan) {
          publishModuleEvent('nutritionPlans', 'created', plan, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'nutrition_plan_created',
          entityType: 'nutrition_plan',
          entityId: id,
          details: `Created nutrition plan: ${input.planName}`,
        });

        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        planName: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        targetWeight: z.number().optional(),
        targetBodyCondition: z.number().optional(),
        dailyHay: z.string().optional(),
        dailyConcentrates: z.string().optional(),
        supplements: z.string().optional(),
        specialInstructions: z.string().optional(),
        feedingSchedule: z.string().optional(),
        caloriesPerDay: z.number().optional(),
        proteinPerDay: z.string().optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, startDate, endDate, ...data } = input;
        await db.updateNutritionPlan(id, ctx.user.id, {
          ...data,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        });

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        const plan = await db.getNutritionPlanById(id, ctx.user.id);
        if (plan) {
          publishModuleEvent('nutritionPlans', 'updated', plan, ctx.user.id);
        }

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'nutrition_plan_updated',
          entityType: 'nutrition_plan',
          entityId: id,
          details: `Updated nutrition plan`,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteNutritionPlan(input.id, ctx.user.id);

        // Publish real-time event
        const { publishModuleEvent } = await import('./_core/realtime');
        publishModuleEvent('nutritionPlans', 'deleted', { id: input.id }, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'nutrition_plan_deleted',
          entityType: 'nutrition_plan',
          entityId: input.id,
          details: `Deleted nutrition plan`,
        });

        return { success: true };
      }),
  }),

  // ============ CARE INSIGHTS ROUTER ============
  careInsights: router({
    // Get daily care score for a horse
    getScore: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        date: z.string().optional(), // ISO date string, defaults to today
      }))
      .query(async ({ ctx, input }) => {
        const targetDate = input.date || new Date().toISOString().split('T')[0];
        
        // Check horse ownership
        const horse = await db.getHorseById(input.horseId);
        if (!horse || horse.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        // Check if score already calculated for this date
        let score = await db.getCareScore(input.horseId, ctx.user.id, targetDate);
        
        if (!score) {
          // Calculate score
          let taskCompletionScore = 0;
          let medicationComplianceScore = 0;
          let healthEventScore = 30;

          // Task completion (40 points): Check for feeding, training, behavior logs
          const behaviorLog = await db.getBehaviorLogs(input.horseId, ctx.user.id, 1);
          if (behaviorLog.length > 0 && behaviorLog[0].logDate === targetDate) {
            taskCompletionScore += 20; // Daily log completed
          }

          const sessions = await db.getTrainingSessionsByHorseId(input.horseId, ctx.user.id);
          const todaySessions = sessions.filter(s => s.sessionDate === targetDate);
          if (todaySessions.length > 0) {
            taskCompletionScore += 20; // Training session logged
          }

          // Medication compliance (30 points): Check all scheduled meds administered
          const schedules = await db.getMedicationSchedules(input.horseId, ctx.user.id, true);
          if (schedules.length > 0) {
            const medLogs = await db.getMedicationLogsByHorse(input.horseId, ctx.user.id, 1);
            const todayLogs = medLogs.filter(l => {
              const logDate = new Date(l.administeredAt).toISOString().split('T')[0];
              return logDate === targetDate && !l.wasSkipped;
            });
            
            if (todayLogs.length >= schedules.length) {
              medicationComplianceScore = 30; // All meds given
            } else if (todayLogs.length > 0) {
              medicationComplianceScore = Math.floor((todayLogs.length / schedules.length) * 30);
            }
          } else {
            medicationComplianceScore = 30; // No meds scheduled = full points
          }

          // Health events (30 points): Check for active alerts and overdue health records
          const alerts = await db.getHealthAlerts(input.horseId, ctx.user.id, false);
          const highSeverityAlerts = alerts.filter(a => a.severity === 'high').length;
          const mediumSeverityAlerts = alerts.filter(a => a.severity === 'medium').length;
          
          healthEventScore -= (highSeverityAlerts * 15 + mediumSeverityAlerts * 7);
          healthEventScore = Math.max(0, healthEventScore);

          const overallScore = taskCompletionScore + medicationComplianceScore + healthEventScore;

          const notes = JSON.stringify({
            taskCompletion: {
              dailyLog: behaviorLog.length > 0,
              trainingSession: todaySessions.length > 0,
            },
            medicationCompliance: {
              scheduled: schedules.length,
              administered: medLogs.filter(l => new Date(l.administeredAt).toISOString().split('T')[0] === targetDate).length,
            },
            healthEvents: {
              activeAlerts: alerts.length,
              highSeverity: highSeverityAlerts,
              mediumSeverity: mediumSeverityAlerts,
            },
          });

          // Create and save score
          await db.createCareScore({
            horseId: input.horseId,
            userId: ctx.user.id,
            date: targetDate,
            overallScore,
            taskCompletionScore,
            medicationComplianceScore,
            healthEventScore,
            notes,
          });

          score = await db.getCareScore(input.horseId, ctx.user.id, targetDate);
        }

        return score;
      }),

    // Get score history
    getScoreHistory: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        days: z.number().min(1).max(90).default(7),
      }))
      .query(async ({ ctx, input }) => {
        const horse = await db.getHorseById(input.horseId);
        if (!horse || horse.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        return await db.getCareScoreHistory(input.horseId, ctx.user.id, input.days);
      }),

    // Get active health alerts
    getAlerts: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        includeResolved: z.boolean().default(false),
      }))
      .query(async ({ ctx, input }) => {
        const horse = await db.getHorseById(input.horseId);
        if (!horse || horse.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        return await db.getHealthAlerts(input.horseId, ctx.user.id, input.includeResolved);
      }),

    // Resolve an alert
    resolveAlert: subscribedProcedure
      .input(z.object({
        alertId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const alert = await db.getHealthAlert(input.alertId, ctx.user.id);
        if (!alert) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Alert not found' });
        }

        await db.resolveHealthAlert(input.alertId, ctx.user.id);

        // Audit log
        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'health_alert_resolved',
          entityType: 'health_alert',
          entityId: input.alertId,
          details: `Resolved health alert: ${alert.alertType}`,
        });

        return { success: true };
      }),

    // Dismiss (delete) an alert
    dismissAlert: subscribedProcedure
      .input(z.object({
        alertId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const alert = await db.getHealthAlert(input.alertId, ctx.user.id);
        if (!alert) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Alert not found' });
        }

        await db.deleteHealthAlert(input.alertId, ctx.user.id);

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'health_alert_dismissed',
          entityType: 'health_alert',
          entityId: input.alertId,
          details: `Dismissed health alert: ${alert.alertType}`,
        });

        return { success: true };
      }),

    // Check and generate alerts for a horse
    checkAlerts: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const horse = await db.getHorseById(input.horseId, ctx.user.id);
        if (!horse || horse.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        const newAlerts = [];

        // Check for repeat injuries (same type within 90 days)
        const healthRecords = await db.getHealthRecordsByHorseId(input.horseId, ctx.user.id);
        const recentInjuries = healthRecords.filter(r => 
          r.recordType === 'injury' &&
          r.recordDate &&
          new Date(r.recordDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        );
        
        const injuryTypes = recentInjuries.map(r => r.title.toLowerCase());
        const seen = new Set<string>();
        const duplicates: string[] = [];
        for (const type of injuryTypes) {
          if (seen.has(type)) {
            if (!duplicates.includes(type)) {
              duplicates.push(type);
            }
          } else {
            seen.add(type);
          }
        }
        
        if (duplicates.length > 0) {
          const alertId = await db.createHealthAlert({
            horseId: input.horseId,
            userId: ctx.user.id,
            alertType: 'repeat_injury',
            severity: 'medium',
            message: `Repeat injury detected: ${duplicates[0]} has occurred multiple times in the last 90 days`,
          });
          newAlerts.push(alertId);
        }

        // Check for weight loss (>5% in 30 days)
        const behaviorLogs = await db.getBehaviorLogs(input.horseId, ctx.user.id, 30);
        const logsWithWeight = behaviorLogs.filter(l => l.weight != null);
        
        if (logsWithWeight.length >= 2) {
          const oldestWeight = logsWithWeight[logsWithWeight.length - 1].weight;
          const newestWeight = logsWithWeight[0].weight;
          
          if (oldestWeight && newestWeight) {
            const weightLossPercent = ((oldestWeight - newestWeight) / oldestWeight) * 100;
            
            if (weightLossPercent > 5) {
              const alertId = await db.createHealthAlert({
                horseId: input.horseId,
                userId: ctx.user.id,
                alertType: 'weight_loss',
                severity: 'high',
                message: `Significant weight loss detected: ${weightLossPercent.toFixed(1)}% loss in the last 30 days`,
              });
              newAlerts.push(alertId);
            }
          }
        }

        // Check for reduced activity (ride quality declining)
        const recentLogs = behaviorLogs.slice(0, 3);
        const rideQualityMap: Record<string, number> = { excellent: 4, good: 3, fair: 2, poor: 1, skipped: 0 };
        
        if (recentLogs.length === 3 && recentLogs.every(l => l.rideQuality)) {
          const qualities = recentLogs.map(l => l.rideQuality ? rideQualityMap[l.rideQuality] : 0);
          const declining = qualities[0] < qualities[1] && qualities[1] < qualities[2];
          
          if (declining && qualities[0] <= 2) {
            const alertId = await db.createHealthAlert({
              horseId: input.horseId,
              userId: ctx.user.id,
              alertType: 'reduced_activity',
              severity: 'medium',
              message: 'Ride quality has been declining over the last 3 sessions',
            });
            newAlerts.push(alertId);
          }
        }

        // Check for missed medications (2+ consecutive misses)
        const schedules = await db.getMedicationSchedules(input.horseId, ctx.user.id, true);
        
        for (const schedule of schedules) {
          const logs = await db.getMedicationLogs(schedule.id, ctx.user.id, 7);
          const skippedLogs = logs.filter(l => l.wasSkipped).slice(0, 2);
          
          if (skippedLogs.length >= 2) {
            const alertId = await db.createHealthAlert({
              horseId: input.horseId,
              userId: ctx.user.id,
              alertType: 'medication_missed',
              severity: 'high',
              message: `Medication "${schedule.medicationName}" has been skipped 2 or more times recently`,
            });
            newAlerts.push(alertId);
            break;
          }
        }

        // Check for overdue health events
        const overdueRecords = healthRecords.filter(r => 
          r.nextDueDate &&
          new Date(r.nextDueDate) < new Date()
        );
        
        if (overdueRecords.length > 0) {
          const alertId = await db.createHealthAlert({
            horseId: input.horseId,
            userId: ctx.user.id,
            alertType: 'overdue_health',
            severity: 'medium',
            message: `${overdueRecords.length} health record(s) are overdue (vaccination, dental, etc.)`,
          });
          newAlerts.push(alertId);
        }

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'health_alerts_checked',
          entityType: 'horse',
          entityId: input.horseId,
          details: `Checked health alerts, found ${newAlerts.length} new alerts`,
        });

        return { newAlertsCount: newAlerts.length };
      }),

    // Medication schedules
    createSchedule: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        medicationName: z.string().min(1).max(200),
        dosage: z.string().min(1).max(100),
        frequency: z.enum(['daily', 'twice_daily', 'three_times_daily', 'weekly', 'biweekly', 'monthly', 'as_needed']),
        startDate: z.string(),
        endDate: z.string().optional(),
        timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'any']).optional(),
        specialInstructions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const horse = await db.getHorseById(input.horseId);
        if (!horse || horse.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        const scheduleId = await db.createMedicationSchedule({
          ...input,
          userId: ctx.user.id,
          isActive: true,
        });

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'medication_schedule_created',
          entityType: 'medication_schedule',
          entityId: scheduleId,
          details: `Created medication schedule for ${input.medicationName}`,
        });

        return { id: scheduleId };
      }),

    listSchedules: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        activeOnly: z.boolean().default(true),
      }))
      .query(async ({ ctx, input }) => {
        const horse = await db.getHorseById(input.horseId);
        if (!horse || horse.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        return await db.getMedicationSchedules(input.horseId, ctx.user.id, input.activeOnly);
      }),

    updateSchedule: subscribedProcedure
      .input(z.object({
        id: z.number(),
        medicationName: z.string().min(1).max(200).optional(),
        dosage: z.string().min(1).max(100).optional(),
        frequency: z.enum(['daily', 'twice_daily', 'three_times_daily', 'weekly', 'biweekly', 'monthly', 'as_needed']).optional(),
        endDate: z.string().optional(),
        timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'any']).optional(),
        specialInstructions: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const schedule = await db.getMedicationSchedule(input.id, ctx.user.id);
        if (!schedule) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
        }

        const { id, ...updateData } = input;
        await db.updateMedicationSchedule(id, ctx.user.id, updateData);

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'medication_schedule_updated',
          entityType: 'medication_schedule',
          entityId: id,
          details: `Updated medication schedule`,
        });

        return { success: true };
      }),

    deleteSchedule: subscribedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const schedule = await db.getMedicationSchedule(input.id, ctx.user.id);
        if (!schedule) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
        }

        await db.deleteMedicationSchedule(input.id, ctx.user.id);

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'medication_schedule_deleted',
          entityType: 'medication_schedule',
          entityId: input.id,
          details: `Deleted medication schedule`,
        });

        return { success: true };
      }),

    logMedication: subscribedProcedure
      .input(z.object({
        scheduleId: z.number(),
        administeredAt: z.string(), // ISO timestamp
        administeredBy: z.string().max(100).optional(),
        dosageGiven: z.string().max(100).optional(),
        notes: z.string().optional(),
        wasSkipped: z.boolean().default(false),
        skipReason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const schedule = await db.getMedicationSchedule(input.scheduleId, ctx.user.id);
        if (!schedule) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
        }

        const logId = await db.createMedicationLog({
          ...input,
          horseId: schedule.horseId,
          userId: ctx.user.id,
        });

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'medication_logged',
          entityType: 'medication_log',
          entityId: logId,
          details: `Logged medication administration for ${schedule.medicationName}`,
        });

        return { id: logId };
      }),

    getMedicationLogs: subscribedProcedure
      .input(z.object({
        scheduleId: z.number(),
        days: z.number().min(1).max(90).default(30),
      }))
      .query(async ({ ctx, input }) => {
        const schedule = await db.getMedicationSchedule(input.scheduleId, ctx.user.id);
        if (!schedule) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Schedule not found' });
        }

        return await db.getMedicationLogs(input.scheduleId, ctx.user.id, input.days);
      }),

    // Behavior logs
    createBehaviorLog: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        logDate: z.string(),
        weight: z.number().optional(),
        appetite: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        energy: z.enum(['high', 'normal', 'low']).optional(),
        sorenessScore: z.number().min(0).max(10).optional(),
        rideQuality: z.enum(['excellent', 'good', 'fair', 'poor', 'skipped']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const horse = await db.getHorseById(input.horseId);
        if (!horse || horse.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        const logId = await db.createBehaviorLog({
          ...input,
          userId: ctx.user.id,
        });

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'behavior_log_created',
          entityType: 'behavior_log',
          entityId: logId,
          details: `Created behavior log for ${horse.name}`,
        });

        return { id: logId };
      }),

    listBehaviorLogs: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        days: z.number().min(1).max(90).default(30),
      }))
      .query(async ({ ctx, input }) => {
        const horse = await db.getHorseById(input.horseId);
        if (!horse || horse.userId !== ctx.user.id) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }

        return await db.getBehaviorLogs(input.horseId, ctx.user.id, input.days);
      }),

    updateBehaviorLog: subscribedProcedure
      .input(z.object({
        id: z.number(),
        weight: z.number().optional(),
        appetite: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
        energy: z.enum(['high', 'normal', 'low']).optional(),
        sorenessScore: z.number().min(0).max(10).optional(),
        rideQuality: z.enum(['excellent', 'good', 'fair', 'poor', 'skipped']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const log = await db.getBehaviorLog(input.id, ctx.user.id);
        if (!log) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Behavior log not found' });
        }

        const { id, ...updateData } = input;
        await db.updateBehaviorLog(id, ctx.user.id, updateData);

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'behavior_log_updated',
          entityType: 'behavior_log',
          entityId: id,
          details: `Updated behavior log`,
        });

        return { success: true };
      }),

    deleteBehaviorLog: subscribedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const log = await db.getBehaviorLog(input.id, ctx.user.id);
        if (!log) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Behavior log not found' });
        }

        await db.deleteBehaviorLog(input.id, ctx.user.id);

        await db.createActivityLog({
          userId: ctx.user.id,
          action: 'behavior_log_deleted',
          entityType: 'behavior_log',
          entityId: input.id,
          details: `Deleted behavior log`,
        });

        return { success: true };
      }),
  }),

  // ============ STORAGE ROUTER ============
  storage: router({
    getUsage: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Get user's subscription plan to determine quota
      let quotaBytes = 1 * 1024 ** 3; // Default: 1 GB for trial/free users
      
      if (user.plan === 'monthly' || user.plan === 'yearly') {
        quotaBytes = 10 * 1024 ** 3; // 10 GB for Pro plan
      } else if (user.plan === 'stable_monthly' || user.plan === 'stable_yearly') {
        quotaBytes = 100 * 1024 ** 3; // 100 GB for Stable plan
      }

      // Get user's current storage usage from documents
      const documents = await db.getDocumentsByUserId(ctx.user.id);
      const usedBytes = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

      return {
        usedBytes,
        quotaBytes,
        remainingBytes: quotaBytes - usedBytes,
        percentUsed: (usedBytes / quotaBytes) * 100,
        plan: user.plan || 'trial',
      };
    }),

    // Admin-only: Get storage stats for all users
    getAdminStats: adminUnlockedProcedure.query(async () => {
      const allUsers = await db.getAllUsers();
      let totalUsed = 0;
      let totalFiles = 0;

      for (const user of allUsers) {
        const documents = await db.getDocumentsByUserId(user.id);
        totalUsed += documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
        totalFiles += documents.length;
      }

      return {
        totalUsed,
        totalFiles,
        userCount: allUsers.length,
      };
    }),

    // Admin-only: Get per-user storage details
    getUserStorageDetails: adminUnlockedProcedure.query(async () => {
      const allUsers = await db.getAllUsers();
      const userStorageDetails = [];

      for (const user of allUsers) {
        const documents = await db.getDocumentsByUserId(user.id);
        const usedBytes = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
        
        // Calculate quota based on plan
        let quotaBytes = 1 * 1024 ** 3; // Default: 1 GB
        if (user.plan === 'monthly' || user.plan === 'yearly') {
          quotaBytes = 10 * 1024 ** 3; // 10 GB for Pro
        } else if (user.plan === 'stable_monthly' || user.plan === 'stable_yearly') {
          quotaBytes = 100 * 1024 ** 3; // 100 GB for Stable
        }

        userStorageDetails.push({
          userId: user.id,
          userName: user.name || 'Unknown',
          userEmail: user.email,
          usedBytes,
          quotaBytes,
          fileCount: documents.length,
          plan: user.plan || 'trial',
        });
      }

      // Sort by usage (highest first)
      return userStorageDetails.sort((a, b) => b.usedBytes - a.usedBytes);
    }),
  }),
  
  // Collaboration system (B5)
  collaboration: router({
    // Share horse with collaborator
    shareHorse: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        email: z.string().email(),
        role: z.enum(['viewer', 'caretaker', 'trainer', 'vet', 'farrier']),
        permissions: z.object({
          viewHealth: z.boolean().default(true),
          editHealth: z.boolean().default(false),
          viewTraining: z.boolean().default(true),
          editTraining: z.boolean().default(false),
          viewTasks: z.boolean().default(true),
          editTasks: z.boolean().default(false),
          viewDocuments: z.boolean().default(true),
        }).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify horse ownership
        const horse = await db.getHorseById(input.horseId, ctx.user.id);
        if (!horse) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }
        
        // Check if user being invited exists
        const inviteeUser = await db.getUserByEmail(input.email);
        
        // Create or update share
        const shareData = {
          horseId: input.horseId,
          ownerId: ctx.user.id,
          sharedWithEmail: input.email,
          sharedWithUserId: inviteeUser?.id,
          role: input.role,
          permissions: JSON.stringify(input.permissions || {}),
          createdAt: new Date(),
        };
        
        // For now, store in activity log (proper table can be added in migration)
        await db.logActivity({
          userId: ctx.user.id,
          action: 'horse_shared',
          entityType: 'horse',
          entityId: input.horseId,
          details: JSON.stringify({ email: input.email, role: input.role }),
        });
        
        return { success: true, message: `Horse shared with ${input.email}` };
      }),
    
    // List collaborators for a horse
    listCollaborators: subscribedProcedure
      .input(z.object({ horseId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Verify horse access
        const horse = await db.getHorseById(input.horseId, ctx.user.id);
        if (!horse) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }
        
        // Get shares from activity log (placeholder until proper table)
        const activities = await db.getActivityLogs(ctx.user.id, 100);
        const shares = activities
          .filter(a => a.action === 'horse_shared' && a.entityId === input.horseId)
          .map(a => {
            try {
              const details = JSON.parse(a.details || '{}');
              return {
                email: details.email,
                role: details.role,
                sharedAt: a.timestamp,
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        
        return shares;
      }),
    
    // Add comment/message to horse timeline
    addComment: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        content: z.string().min(1),
        type: z.enum(['note', 'question', 'update']).default('note'),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify horse access
        const horse = await db.getHorseById(input.horseId, ctx.user.id);
        if (!horse) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }
        
        // Store as activity
        await db.logActivity({
          userId: ctx.user.id,
          action: 'comment_added',
          entityType: 'horse',
          entityId: input.horseId,
          details: JSON.stringify({ content: input.content, type: input.type }),
        });
        
        return { success: true };
      }),
    
    // Get comments/messages for a horse
    getComments: subscribedProcedure
      .input(z.object({
        horseId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ ctx, input }) => {
        // Verify horse access
        const horse = await db.getHorseById(input.horseId, ctx.user.id);
        if (!horse) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Horse not found' });
        }
        
        // Get comments from activity log
        const activities = await db.getActivityLogs(ctx.user.id, input.limit);
        const comments = activities
          .filter(a => a.action === 'comment_added' && a.entityId === input.horseId)
          .map(a => {
            try {
              const details = JSON.parse(a.details || '{}');
              return {
                id: a.id,
                userId: a.userId,
                content: details.content,
                type: details.type,
                createdAt: a.timestamp,
              };
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        
        return comments;
      }),
  }),
});

export type AppRouter = typeof appRouter;
