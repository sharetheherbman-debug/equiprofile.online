#!/usr/bin/env node
/**
 * Admin User Creation Script
 * Creates admin users from environment variables:
 * - ADMIN1_EMAIL / ADMIN1_PASSWORD
 * - ADMIN2_EMAIL / ADMIN2_PASSWORD
 * 
 * Run with: node scripts/create-admin-users.mjs
 */

import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

// Create mysql2 connection
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

async function createAdminUser(email, password, name) {
  if (!email || !password) {
    console.log(`⏭️  Skipping ${name} - no credentials provided`);
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, normalizedEmail));
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      
      // Update existing user to admin role with new password
      const passwordHash = await bcrypt.hash(password, 10);
      
      await db.update(users)
        .set({ 
          role: "admin",
          passwordHash,
          subscriptionStatus: "active",
          lastSignedIn: new Date()
        })
        .where(eq(users.id, existingUser.id));
      
      console.log(`✅ Updated existing user ${normalizedEmail} to admin role`);
    } else {
      // Create new admin user
      const passwordHash = await bcrypt.hash(password, 10);
      const openId = `local_admin_${nanoid(16)}`;
      
      await db.insert(users).values({
        openId,
        email: normalizedEmail,
        passwordHash,
        name: name || "Admin",
        loginMethod: "email",
        emailVerified: true,
        role: "admin",
        subscriptionStatus: "active",
        subscriptionPlan: "monthly",
        trialEndsAt: null,
        lastSignedIn: new Date(),
        isActive: true,
        isSuspended: false,
      });
      
      console.log(`✅ Created new admin user: ${normalizedEmail}`);
    }
  } catch (error) {
    console.error(`❌ Error creating/updating admin user ${normalizedEmail}:`, error);
  }
}

async function main() {
  console.log("\n🔧 Admin User Creation Script\n");
  
  const admin1Email = process.env.ADMIN1_EMAIL;
  const admin1Password = process.env.ADMIN1_PASSWORD;
  const admin2Email = process.env.ADMIN2_EMAIL;
  const admin2Password = process.env.ADMIN2_PASSWORD;
  
  if (!admin1Email && !admin2Email) {
    console.log("⚠️  No admin credentials found in environment variables.");
    console.log("   Set ADMIN1_EMAIL/ADMIN1_PASSWORD or ADMIN2_EMAIL/ADMIN2_PASSWORD");
    process.exit(0);
  }
  
  await createAdminUser(admin1Email, admin1Password, "Admin 1");
  await createAdminUser(admin2Email, admin2Password, "Admin 2");
  
  console.log("\n✅ Admin user creation complete!\n");
  await connection.end();
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
