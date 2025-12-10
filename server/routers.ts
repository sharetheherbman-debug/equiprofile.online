import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

// Admin procedure middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

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
          userId: ctx.user.id,
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
          userId: ctx.user.id,
          dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
        });
        await db.logActivity({
          userId: ctx.user.id,
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
          userId: ctx.user.id,
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
          userId: ctx.user.id,
          action: 'horse_deleted',
          entityType: 'horse',
          entityId: input.id,
        });
        return { success: true };
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
          userId: ctx.user.id,
          recordDate: new Date(input.recordDate),
          nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : undefined,
        });
        await db.logActivity({
          userId: ctx.user.id,
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
          userId: ctx.user.id,
          sessionDate: new Date(input.sessionDate),
        });
        await db.logActivity({
          userId: ctx.user.id,
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
          userId: ctx.user.id,
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
        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `${ctx.user.id}/documents/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.fileType);
        
        const id = await db.createDocument({
          userId: ctx.user.id,
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
          userId: ctx.user.id,
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
    getUsers: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),
    
    getUserDetails: adminProcedure
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
    
    suspendUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.suspendUser(input.userId, input.reason);
        await db.logActivity({
          userId: ctx.user.id,
          action: 'user_suspended',
          entityType: 'user',
          entityId: input.userId,
          details: JSON.stringify({ reason: input.reason }),
        });
        return { success: true };
      }),
    
    unsuspendUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unsuspendUser(input.userId);
        await db.logActivity({
          userId: ctx.user.id,
          action: 'user_unsuspended',
          entityType: 'user',
          entityId: input.userId,
        });
        return { success: true };
      }),
    
    deleteUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteUser(input.userId);
        await db.logActivity({
          userId: ctx.user.id,
          action: 'user_deleted',
          entityType: 'user',
          entityId: input.userId,
        });
        return { success: true };
      }),
    
    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUser(input.userId, { role: input.role });
        await db.logActivity({
          userId: ctx.user.id,
          action: 'user_role_updated',
          entityType: 'user',
          entityId: input.userId,
          details: JSON.stringify({ newRole: input.role }),
        });
        return { success: true };
      }),
    
    // System stats
    getStats: adminProcedure.query(async () => {
      return db.getSystemStats();
    }),
    
    getOverdueUsers: adminProcedure.query(async () => {
      return db.getOverdueSubscriptions();
    }),
    
    getExpiredTrials: adminProcedure.query(async () => {
      return db.getExpiredTrials();
    }),
    
    // Activity logs
    getActivityLogs: adminProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        return db.getActivityLogs(input.limit);
      }),
    
    // System settings
    getSettings: adminProcedure.query(async () => {
      return db.getAllSettings();
    }),
    
    updateSetting: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertSetting(input.key, input.value, input.type, input.description, ctx.user.id);
        await db.logActivity({
          userId: ctx.user.id,
          action: 'setting_updated',
          entityType: 'setting',
          details: JSON.stringify({ key: input.key }),
        });
        return { success: true };
      }),
    
    // Backup logs
    getBackupLogs: adminProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getRecentBackups(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
