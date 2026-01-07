import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminUnlockedProcedure, router } from "./_core/trpc";
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
        const adminPassword = process.env.ADMIN_UNLOCK_PASSWORD || 'ashmor12@';
        
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
      };
    }),

    createCheckout: protectedProcedure
      .input(z.object({
        plan: z.enum(['monthly', 'yearly']),
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

        const priceId = input.plan === 'monthly' 
          ? STRIPE_PRICING.monthly.priceId 
          : STRIPE_PRICING.yearly.priceId;

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
    list: subscribedProcedure.query(async ({ ctx }) => {
      return db.getHorsesByUserId(ctx.user.id);
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
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteHealthRecord(input.id, ctx.user.id);
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
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteTrainingSession(input.id, ctx.user.id);
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
        return { success: true };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteFeedingPlan(input.id, ctx.user.id);
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
        
        return { id, url };
      }),
    
    delete: subscribedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteDocument(input.id, ctx.user.id);
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
        
        // Upload/Storage vars (critical only if ENABLE_UPLOADS=true)
        { name: 'BUILT_IN_FORGE_API_URL', status: !!process.env.BUILT_IN_FORGE_API_URL, critical: ENV.enableUploads, conditional: true, requiredWhen: 'ENABLE_UPLOADS=true' },
        { name: 'BUILT_IN_FORGE_API_KEY', status: !!process.env.BUILT_IN_FORGE_API_KEY, critical: ENV.enableUploads, conditional: true, requiredWhen: 'ENABLE_UPLOADS=true' },
        
        // Legacy AWS vars (optional - kept for backward compatibility)
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
  }),

  // Stable management
  stables: router({
    create: subscribedProcedure
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

    update: subscribedProcedure
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
    getTrainingStats: protectedProcedure
      .input(z.object({
        horseId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        let query = db.select({
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
        .where(eq(trainingSessions.userId, ctx.user.id));
        
        if (input.horseId) {
          query = query.where(eq(trainingSessions.horseId, input.horseId));
        }
        
        const result = await query;
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
        const db = await getDb();
        if (!db) return [];
        
        if (input.horseId) {
          return db.getCompetitionsByHorseId(input.horseId, ctx.user.id);
        }
        return db.getCompetitionsByUserId(ctx.user.id);
      }),
    
    exportCSV: subscribedProcedure.query(async ({ ctx }) => {
      const dbInstance = await getDb();
      if (!dbInstance) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      
      const competitionData = await dbInstance.getCompetitionsByUserId(ctx.user.id);
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
    createRecord: subscribedProcedure
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
        
        return { id: result[0].insertId };
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
      
      const breedingRecords = await dbInstance.select()
        .from(breeding)
        .where(eq(breeding.userId, ctx.user.id))
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
        [headers.join(','), ...data.map(row => headers.map(h => row[h]).join(','))].join('\n') :
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
});

export type AppRouter = typeof appRouter;
