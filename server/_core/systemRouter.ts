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
      !!process.env.LOCAL_UPLOADS_PATH || // Local storage
      (ENV.awsAccessKeyId && ENV.awsSecretAccessKey && ENV.awsS3Bucket) // AWS S3
    );

    const openaiReady = !!ENV.openaiApiKey;
    
    const weatherReady = !!ENV.weatherApiKey && !!ENV.weatherApiProvider;
    
    const stripeReady = ENV.enableStripe && 
      !!ENV.stripeSecretKey && 
      !!ENV.stripeWebhookSecret;

    return {
      featureFlags: {
        uploadsEnabled: ENV.enableUploads,
        stripeEnabled: ENV.enableStripe,
        pwaEnabled: !!process.env.ENABLE_PWA,
      },
      serviceStatus: {
        uploads: {
          enabled: ENV.enableUploads,
          ready: uploadsReady,
          backend: uploadsReady 
            ? (ENV.awsAccessKeyId ? 's3' : 'local')
            : 'none',
        },
        openai: {
          enabled: true,
          ready: openaiReady,
          model: ENV.openaiModel,
        },
        weather: {
          enabled: true,
          ready: weatherReady,
          provider: ENV.weatherApiProvider || 'none',
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
