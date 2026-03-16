import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from "@shared/const";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async (opts) => {
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

// Middleware to check trial expiration
const checkTrialStatus = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  // At this point, ctx.user is guaranteed to exist because of protectedProcedure
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  // If user is on trial status, check if trial has expired
  if (ctx.user.subscriptionStatus === "trial") {
    const now = new Date();

    // Calculate trial end date (7 days from createdAt)
    const trialEndDate = new Date(ctx.user.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // If trial has expired, throw PAYMENT_REQUIRED error
    if (now > trialEndDate) {
      throw new TRPCError({
        code: "PAYMENT_REQUIRED",
        message:
          "Your 7-day trial has ended. Please upgrade to continue using EquiProfile.",
      });
    }
  }

  // If subscription is expired or overdue (not trial, not active)
  if (
    ctx.user.subscriptionStatus === "expired" ||
    ctx.user.subscriptionStatus === "overdue"
  ) {
    throw new TRPCError({
      code: "PAYMENT_REQUIRED",
      message:
        "Your subscription has expired. Please renew to continue using EquiProfile.",
    });
  }

  // If user is suspended
  if (ctx.user.isSuspended) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Account suspended: ${ctx.user.suspendedReason || "Please contact support"}`,
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

// Protected procedure with trial/subscription enforcement
export const activeUserProcedure = protectedProcedure.use(checkTrialStatus);

// Secure admin procedure that requires both admin role AND active admin session
export const adminUnlockedProcedure = protectedProcedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;

    // At this point, ctx.user is guaranteed to exist because of protectedProcedure
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    // Import db dynamically to avoid circular dependencies
    const db = await import("../db");
    const session = await db.getAdminSession(ctx.user.id);

    if (!session || session.expiresAt < new Date()) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin session expired. Please unlock admin mode in AI Chat.",
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
