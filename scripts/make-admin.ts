#!/usr/bin/env tsx
/**
 * Admin Bootstrap Script
 * 
 * Usage: tsx scripts/make-admin.ts --email user@example.com
 * 
 * This script promotes a user to admin role. It requires local server access
 * and is not exposed publicly for security reasons.
 * 
 * SAFETY: This script requires direct database access and cannot be run remotely.
 */

import { getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function makeAdmin(email: string) {
  console.log("🔧 Admin Bootstrap Script");
  console.log("========================\n");

  if (!email) {
    console.error("❌ Error: Email address is required");
    console.log("\nUsage: tsx scripts/make-admin.ts --email user@example.com");
    process.exit(1);
  }

  console.log(`Looking up user: ${email}...`);

  try {
    const db = getDb();
    
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.error(`❌ Error: User not found with email: ${email}`);
      console.log("\nMake sure the user has registered an account first.");
      process.exit(1);
    }

    // Check if already admin
    if (user.role === 'admin') {
      console.log(`✅ User ${email} is already an admin!`);
      console.log(`   User ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      process.exit(0);
    }

    // Update user role to admin
    await db
      .update(users)
      .set({ role: 'admin' })
      .where(eq(users.id, user.id));

    console.log(`✅ Success! User promoted to admin.`);
    console.log(`   Email: ${email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.name || 'N/A'}`);
    console.log(`   Previous role: ${user.role}`);
    console.log(`   New role: admin\n`);
    console.log("ℹ️  The user can now access admin features after unlocking admin mode in the app.");

  } catch (error) {
    console.error("❌ Database error:", error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const emailIndex = args.indexOf('--email');

if (emailIndex === -1 || !args[emailIndex + 1]) {
  console.error("❌ Error: --email parameter is required");
  console.log("\nUsage: tsx scripts/make-admin.ts --email user@example.com");
  process.exit(1);
}

const email = args[emailIndex + 1];
makeAdmin(email);
