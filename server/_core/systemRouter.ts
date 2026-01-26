import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminUnlockedProcedure, publicProcedure, router } from "./trpc";
import { ENV } from "./env";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  getFeatureFlags: publicProcedure.query(() => ({
    enableStripe: ENV.enableStripe,
    enableUploads: ENV.enableUploads,
  })),

  // System status endpoint for ops visibility
  status: publicProcedure.query(() => {
    // Check environment readiness
    const uploadsReady = ENV.enableUploads && (
      (ENV.builtInForgeApiUrl && ENV.builtInForgeApiKey) || // Forge storage
      !!process.env.LOCAL_UPLOADS_PATH || // Local fallback
      (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) // AWS S3
    );

    const aiReady = ENV.enableForge && ENV.builtInForgeApiUrl && ENV.builtInForgeApiKey;
    
    const weatherReady = ENV.enableForge && ENV.builtInForgeApiUrl && ENV.builtInForgeApiKey;
    
    const stripeReady = ENV.enableStripe && 
      !!process.env.STRIPE_SECRET_KEY && 
      !!process.env.STRIPE_PUBLISHABLE_KEY;

    return {
      featureFlags: {
        uploadsEnabled: ENV.enableUploads,
        stripeEnabled: ENV.enableStripe,
        forgeEnabled: ENV.enableForge,
        pwaEnabled: !!process.env.ENABLE_PWA,
      },
      serviceStatus: {
        uploads: {
          enabled: ENV.enableUploads,
          ready: uploadsReady,
          backend: uploadsReady 
            ? (ENV.builtInForgeApiUrl ? 'forge' : process.env.AWS_ACCESS_KEY_ID ? 's3' : 'local')
            : 'none',
        },
        ai: {
          enabled: ENV.enableForge,
          ready: aiReady,
        },
        weather: {
          enabled: ENV.enableForge,
          ready: weatherReady,
        },
        stripe: {
          enabled: ENV.enableStripe,
          ready: stripeReady,
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        version: process.env.BUILD_ID || 'dev',
      },
    };
  }),

  notifyOwner: adminUnlockedProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
