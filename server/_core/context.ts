import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  hasAccess: boolean; // Whether user has active trial or subscription
};

/**
 * Check if user has access to protected features
 * User has access if:
 * 1. Trial is active (trialEndsAt > now AND subscriptionStatus = 'trial')
 * 2. Subscription is active (subscriptionStatus = 'active')
 * 3. User is admin (role = 'admin')
 */
function checkUserAccess(user: User | null): boolean {
  if (!user) return false;

  // Admins always have access
  if (user.role === "admin") return true;

  // Check if subscription is active
  if (user.subscriptionStatus === "active") return true;

  // Check if trial is still valid
  if (user.subscriptionStatus === "trial" && user.trialEndsAt) {
    const now = new Date();
    const trialEnd = new Date(user.trialEndsAt);
    if (trialEnd > now) {
      return true;
    }
  }

  return false;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    hasAccess: checkUserAccess(user),
  };
}
