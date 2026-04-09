// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import express, { Router } from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { SignJWT } from "jose";
import rateLimit from "express-rate-limit";
import * as db from "../db";
import * as email from "./email";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

/** Hours before a verification token expires */
const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

/** Extract plan-related flags from a JSON preferences string. */
function extractPlanInfo(preferences: string | null | undefined): {
  planTier: string | null;
  freeAccess: boolean;
  bothDashboardsUnlocked: boolean;
} {
  const emptyPlanInfo = { planTier: null, freeAccess: false, bothDashboardsUnlocked: false } as const;
  if (!preferences) return emptyPlanInfo;
  try {
    const prefs = JSON.parse(preferences);
    return {
      planTier: prefs?.planTier ?? null,
      freeAccess: !!prefs?.freeAccess,
      bothDashboardsUnlocked: !!prefs?.bothDashboardsUnlocked,
    };
  } catch {
    return emptyPlanInfo;
  }
}

const router: Router = express.Router();

// Rate limiter for signup attempts — prevents abuse and fake signups.
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    error: "Too many requests",
    message: "Too many signup attempts from this IP, please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

// Rate limiter for verification resend — prevents email abuse.
const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too many requests",
    message: "Too many resend requests. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

// Rate limiter for login attempts — limits failed login attempts per IP.
// skipSuccessfulRequests: true means only failed attempts count toward the limit.
// Window of 15 min with max 30 failed attempts is permissive enough for shared
// networks (offices, mobile carriers with NAT) while still blocking brute-force.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: {
    error: "Too many requests",
    message: "Too many login attempts from this IP, please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

// Stricter rate limiter for password reset requests — prevents email enumeration
// and abuse of email sending. 5 requests per 15 minutes per IP.
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: "Too many requests",
    message: "Too many password reset requests. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * POST /api/auth/signup
 * Create a new user account with email/password.
 * Account starts as unverified — a verification email is sent.
 */
router.post("/signup", signupLimiter, async (req, res) => {
  try {
    const { email: rawEmail, password, name, planType } = req.body;

    // Validation
    if (!rawEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalise email to lowercase for consistent matching
    const userEmail = rawEmail.trim().toLowerCase();

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(userEmail);

    if (existingUser) {
      // If user exists but is unverified, allow re-sending verification
      if (existingUser.emailVerified === false && existingUser.loginMethod === "email") {
        const verificationToken = nanoid(32);
        const verificationTokenExpiry = new Date();
        verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

        await db.updateUser(existingUser.id, {
          verificationToken,
          verificationTokenExpiry,
        } as any);

        // Send verification email (async, don't wait)
        email
          .sendVerificationEmail(userEmail, verificationToken, existingUser.name || undefined)
          .catch((err) =>
            console.error("[Auth] Failed to send verification email:", err),
          );

        return res.json({
          success: true,
          requiresVerification: true,
          message: "A verification email has been sent. Please check your inbox.",
        });
      }
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique openId for local auth users
    const openId = `local_${nanoid(16)}`;

    // Generate verification token
    const verificationToken = nanoid(32);
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS); // 24 hour expiry

    // Create user with trial period — starts as unverified
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    await db.upsertUser({
      openId,
      email: userEmail,
      passwordHash,
      name: name || null,
      loginMethod: "email",
      emailVerified: false,
      subscriptionStatus: "trial",
      trialEndsAt: trialEnd,
      lastSignedIn: new Date(),
    });

    // Get the created user
    const user = await db.getUserByOpenId(openId);
    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    // Store verification token and plan type preference
    const userUpdates: Record<string, unknown> = {
      verificationToken,
      verificationTokenExpiry,
    };

    // Auto-grant admin role to primary admin email
    if (ENV.primaryAdminEmail && userEmail === ENV.primaryAdminEmail && user.role !== "admin") {
      userUpdates.role = "admin";
    }
    if (planType === "stable" || planType === "normal" || planType === "standard") {
      let prefs: Record<string, unknown> = {};
      if (user.preferences) {
        try {
          prefs = JSON.parse(user.preferences);
        } catch {
          prefs = {};
        }
      }
      prefs.planTier = planType === "stable" ? "stable" : "pro";
      userUpdates.preferences = JSON.stringify(prefs);
    }

    await db.updateUser(user.id, userUpdates as any);

    // Send verification email (async, don't wait)
    email
      .sendVerificationEmail(userEmail, verificationToken, name || undefined)
      .catch((err) =>
        console.error("[Auth] Failed to send verification email:", err),
      );

    // Do NOT auto-login — user must verify email first
    res.json({
      success: true,
      requiresVerification: true,
      message: "Account created! Please check your email to verify your account.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[Auth] Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Normalise email to lowercase for consistent matching
    const userEmail = rawEmail.trim().toLowerCase();

    // Find user by email
    const user = await db.getUserByEmail(userEmail);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({
        error: "Account suspended",
        reason: user.suspendedReason,
      });
    }

    // Check if email is verified
    if (!user.emailVerified && user.loginMethod === "email") {
      // Legacy users created before email verification was introduced have
      // emailVerified = false but no verificationToken. Auto-verify them so
      // they are never locked out of an account they've always been able to use.
      // The update is fire-and-forget so a transient DB failure never causes a 500.
      if (!user.verificationToken) {
        db.updateUser(user.id, { emailVerified: true }).catch((err) =>
          console.error("[Auth] Failed to auto-verify legacy user:", err),
        );
      } else {
        return res.status(403).json({
          error: "Email not verified",
          requiresVerification: true,
          email: user.email,
          message: "Please verify your email address before signing in. Check your inbox for the verification link.",
        });
      }
    }

    // Update last signed in
    await db.updateUser(user.id, { lastSignedIn: new Date() });

    // Auto-grant admin role to primary admin email if not already set
    if (ENV.primaryAdminEmail && user.email === ENV.primaryAdminEmail && user.role !== "admin") {
      await db.updateUser(user.id, { role: "admin" });
    }

    // Generate JWT token
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(new TextEncoder().encode(ENV.cookieSecret));

    // Set cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: ENV.cookieSecure,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      domain: ENV.cookieDomain,
    });

    const { planTier, freeAccess, bothDashboardsUnlocked } = extractPlanInfo(user.preferences);

    res.json({
      success: true,
      planTier,
      freeAccess,
      bothDashboardsUnlocked,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/request-reset
 * Request a password reset email
 */
router.post("/request-reset", passwordResetLimiter, async (req, res) => {
  try {
    const { email: rawEmail } = req.body;

    if (!rawEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Normalise email to lowercase for consistent matching
    const userEmail = rawEmail.trim().toLowerCase();

    // Find user by email
    const user = await db.getUserByEmail(userEmail);

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(
        "[Auth] Password reset requested for non-existent email:",
        userEmail,
      );
      return res.json({
        success: true,
        message: "If that email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    // Save reset token
    await db.updateUser(user.id, {
      resetToken,
      resetTokenExpiry,
    });

    // Send reset email
    await email.sendPasswordResetEmail(
      userEmail,
      resetToken,
      user.name || undefined,
    );

    res.json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("[Auth] Request reset error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    // Find user by reset token (direct indexed lookup)
    const user = await db.getUserByResetToken(token);

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Check token expiry
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await db.updateUser(user.id, {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/verify-email
 * Verify email address with token
 */
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Find user by verification token
    const user = await db.getUserByVerificationToken(token);

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }

    // Check token expiry
    if (!user.verificationTokenExpiry || user.verificationTokenExpiry < new Date()) {
      return res.status(400).json({ error: "Verification token has expired. Please request a new one." });
    }

    // Mark email as verified and clear token
    await db.updateUser(user.id, {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    } as any);

    // Auto-login: generate JWT and set cookie
    const jwtToken = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("30d")
      .sign(new TextEncoder().encode(ENV.cookieSecret));

    res.cookie(COOKIE_NAME, jwtToken, {
      httpOnly: true,
      secure: ENV.cookieSecure,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      domain: ENV.cookieDomain,
    });

    // Send welcome email now that user is verified (async)
    email
      .sendWelcomeEmail(user)
      .catch((err) =>
        console.error("[Auth] Failed to send welcome email:", err),
      );

    const { planTier, freeAccess, bothDashboardsUnlocked } = extractPlanInfo(user.preferences);

    res.json({
      success: true,
      message: "Email verified successfully! Welcome to EquiProfile.",
      planTier,
      freeAccess,
      bothDashboardsUnlocked,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[Auth] Verify email error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/resend-verification
 * Resend verification email
 */
router.post("/resend-verification", resendLimiter, async (req, res) => {
  try {
    const { email: rawEmail } = req.body;

    if (!rawEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userEmail = rawEmail.trim().toLowerCase();
    const user = await db.getUserByEmail(userEmail);

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return res.json({
        success: true,
        message: "If that email needs verification, a new link has been sent.",
      });
    }

    // Generate new verification token
    const verificationToken = nanoid(32);
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + VERIFICATION_TOKEN_EXPIRY_HOURS);

    await db.updateUser(user.id, {
      verificationToken,
      verificationTokenExpiry,
    } as any);

    // Send verification email
    await email.sendVerificationEmail(
      userEmail,
      verificationToken,
      user.name || undefined,
    );

    res.json({
      success: true,
      message: "If that email needs verification, a new link has been sent.",
    });
  } catch (error) {
    console.error("[Auth] Resend verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (clear cookie)
 */
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: ENV.cookieSecure,
    sameSite: "lax",
    domain: ENV.cookieDomain,
  });
  res.json({ success: true });
});

/**
 * POST /api/auth/change-password
 * Change password for the currently authenticated user.
 * Requires a valid session cookie + current password for verification.
 */
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword are required" });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "New password must be at least 8 characters" });
    }

    // Verify the session cookie to get the current user
    const cookieHeader = req.headers.cookie || "";
    const cookiePairs = cookieHeader.split(";").map((c) => c.trim());
    let sessionCookieValue: string | undefined;
    for (const pair of cookiePairs) {
      const [key, ...vals] = pair.split("=");
      if (key.trim() === COOKIE_NAME) {
        sessionCookieValue = vals.join("=");
        break;
      }
    }

    if (!sessionCookieValue) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Use SDK to authenticate
    let user;
    try {
      const { sdk } = await import("./sdk");
      user = await sdk.authenticateRequest(req as any);
    } catch {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify current password
    if (!user.passwordHash) {
      return res.status(400).json({
        error:
          "No password set. Use forgot-password to create a password for your account.",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash and save the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id, { passwordHash: newPasswordHash });

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("[Auth] Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
