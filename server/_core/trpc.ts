import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

// Secure admin procedure that requires both admin role AND active admin session
export const adminUnlockedProcedure = protectedProcedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // At this point, ctx.user is guaranteed to exist because of protectedProcedure
    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    // Import db dynamically to avoid circular dependencies
    const db = await import('../db');
    const session = await db.getAdminSession(ctx.user.id);
    
    if (!session || session.expiresAt < new Date()) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Admin session expired. Please unlock admin mode in AI Chat." 
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);

// Stable-tier procedure that requires stable subscription plan
export const stableProcedure = protectedProcedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    // Import db dynamically to avoid circular dependencies
    const db = await import('../db');
    const user = await db.getUserById(ctx.user.id);
    
    if (!user) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found" });
    }

    // Allow admins full access
    if (user.role === 'admin') {
      return next({ ctx });
    }

    // Check if user has stable plan
    const hasStablePlan = user.subscriptionPlan === 'stable_monthly' || user.subscriptionPlan === 'stable_yearly';
    
    if (!hasStablePlan) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "This feature requires a Stable subscription plan. Please upgrade to access stable management features." 
      });
    }

    // Check if subscription is active
    const validStatuses = ['trial', 'active'];
    if (!validStatuses.includes(user.subscriptionStatus)) {
      throw new TRPCError({ 
        code: "FORBIDDEN", 
        message: "Your subscription has expired. Please renew to continue." 
      });
    }

    return next({ ctx });
  }),
);
