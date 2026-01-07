import express, { Router } from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { SignJWT } from "jose";
import * as db from "../db";
import * as email from "./email";
import { ENV } from "./env";
import { COOKIE_NAME } from "@shared/const";

const router: Router = express.Router();

/**
 * POST /api/auth/signup
 * Create a new user account with email/password
 */
router.post("/signup", async (req, res) => {
  try {
    const { email: userEmail, password, name } = req.body;

    // Validation
    if (!userEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await db.getUserByEmail(userEmail);
    
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique openId for local auth users
    const openId = `local_${nanoid(16)}`;

    // Create user with trial period
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

    // Send welcome email (async, don't wait)
    email.sendWelcomeEmail(user).catch(err => 
      console.error("[Auth] Failed to send welcome email:", err)
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
router.post("/login", async (req, res) => {
  try {
    const { email: userEmail, password } = req.body;

    if (!userEmail || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

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
        reason: user.suspendedReason 
      });
    }

    // Update last signed in
    await db.updateUser(user.id, { lastSignedIn: new Date() });

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

    res.json({
      success: true,
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
router.post("/request-reset", async (req, res) => {
  try {
    const { email: userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user by email
    const user = await db.getUserByEmail(userEmail);

    // Always return success to prevent email enumeration
    if (!user) {
      console.log("[Auth] Password reset requested for non-existent email:", userEmail);
      return res.json({ success: true, message: "If that email exists, a reset link has been sent" });
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
    await email.sendPasswordResetEmail(userEmail, resetToken, user.name || undefined);

    res.json({ 
      success: true, 
      message: "If that email exists, a reset link has been sent" 
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
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Find user by reset token
    const users = await db.getAllUsers();
    const user = users.find(u => u.resetToken === token);

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
      message: "Password reset successful. You can now login with your new password." 
    });
  } catch (error) {
    console.error("[Auth] Reset password error:", error);
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

export default router;
