#!/usr/bin/env node
/**
 * User creation script for EquiProfile
 * 
 * Usage:
 *   node scripts/create-user.mjs --email test@equiprofile.online --password "ashmor12@" --name "Test User"
 * 
 * Features:
 * - Connects using DATABASE_URL from environment
 * - Hashes password with bcrypt (same as register endpoint)
 * - If user exists, prints "already exists" and exits 0
 * - If created, prints "created" and exits 0
 * - On error, prints error message and exits 1
 */

import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/mysql2';
import { eq } from 'drizzle-orm';
import { users } from '../drizzle/schema.js';

// Load environment variables
config();

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name) => {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
};

const email = getArg('email');
const password = getArg('password');
const name = getArg('name') || 'User';

// Validate inputs
if (!email || !password) {
  console.error('Error: --email and --password are required');
  console.error('Usage: node scripts/create-user.mjs --email test@equiprofile.online --password "ashmor12@" --name "Test User"');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function createUser() {
  try {
    // Connect to database
    const db = drizzle(process.env.DATABASE_URL);

    // Check if user already exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUsers.length > 0) {
      console.log('already exists');
      process.exit(0);
    }

    // Hash password (same salt rounds as register endpoint)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      role: 'user', // Default role
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('created');
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error.message);
    process.exit(1);
  }
}

createUser();
