#!/usr/bin/env node
/**
 * AI Training Template Seeder
 * Creates 5 pre-made AI training templates for users to customize
 * 
 * Run with: node scripts/seed-training-templates.mjs
 */

import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { trainingProgramTemplates } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

// Create mysql2 connection
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// Pre-made training templates
const templates = [
  {
    userId: 0, // System template
    stableId: null,
    name: "Beginner Flatwork Foundation",
    description: "A comprehensive 12-week program designed for novice riders or horses new to flatwork. Focuses on developing basic gaits, rhythm, and balance.",
    duration: 12,
    discipline: "Dressage",
    level: "Beginner",
    goals: "Establish forward movement, develop rhythm in all three gaits, introduce basic lateral work, build trust and confidence",
    programData: JSON.stringify({
      weeks: [
        { week: 1, focus: "Walk rhythm and forward movement", sessions: 3, duration: 30 },
        { week: 2, focus: "Trot transitions and balance", sessions: 3, duration: 30 },
        { week: 3, focus: "Canter transitions", sessions: 4, duration: 35 },
        { week: 4, focus: "Basic circles and turns", sessions: 4, duration: 35 },
        { week: 5, focus: "Introduction to leg yielding", sessions: 4, duration: 40 },
        { week: 6, focus: "Developing straightness", sessions: 4, duration: 40 },
        { week: 7, focus: "Trot work refinement", sessions: 4, duration: 40 },
        { week: 8, focus: "Canter balance", sessions: 4, duration: 45 },
        { week: 9, focus: "Basic serpentines", sessions: 4, duration: 45 },
        { week: 10, focus: "Transitions within gaits", sessions: 4, duration: 45 },
        { week: 11, focus: "Putting it together", sessions: 4, duration: 45 },
        { week: 12, focus: "Assessment and review", sessions: 3, duration: 40 }
      ]
    }),
    isPublic: true,
    isActive: true
  },
  {
    userId: 0,
    stableId: null,
    name: "Show Jumping Progression",
    description: "An 8-week intensive program for horses and riders transitioning from ground poles to small courses. Progressive grid work and technical exercises.",
    duration: 8,
    discipline: "Jumping",
    level: "Intermediate",
    goals: "Build confidence over fences, improve rhythm and balance, develop adjustable canter, introduce course riding",
    programData: JSON.stringify({
      weeks: [
        { week: 1, focus: "Ground poles and cavalletti", sessions: 4, duration: 45 },
        { week: 2, focus: "Single fences at trot", sessions: 4, duration: 45 },
        { week: 3, focus: "Canter poles and small verticals", sessions: 4, duration: 50 },
        { week: 4, focus: "Grid work - basic combinations", sessions: 4, duration: 50 },
        { week: 5, focus: "Adjustability - lengthening and shortening", sessions: 4, duration: 50 },
        { week: 6, focus: "Introduction to oxers", sessions: 4, duration: 50 },
        { week: 7, focus: "Simple courses (4-6 fences)", sessions: 4, duration: 55 },
        { week: 8, focus: "Course refinement and assessment", sessions: 3, duration: 55 }
      ]
    }),
    isPublic: true,
    isActive: true
  },
  {
    userId: 0,
    stableId: null,
    name: "Eventing Conditioning",
    description: "A 10-week fitness program specifically designed for event horses. Combines flatwork, jumping, and cardiovascular conditioning.",
    duration: 10,
    discipline: "Eventing",
    level: "Intermediate",
    goals: "Build cardiovascular fitness, develop strength and stamina, maintain suppleness, prepare for cross-country demands",
    programData: JSON.stringify({
      weeks: [
        { week: 1, focus: "Base fitness - long slow distance", sessions: 4, duration: 45 },
        { week: 2, focus: "Hill work introduction", sessions: 4, duration: 50 },
        { week: 3, focus: "Interval training begins", sessions: 4, duration: 50 },
        { week: 4, focus: "Flatwork and gymnastic jumping", sessions: 5, duration: 50 },
        { week: 5, focus: "Progressive interval work", sessions: 5, duration: 55 },
        { week: 6, focus: "Combined training - dressage/jumping", sessions: 5, duration: 55 },
        { week: 7, focus: "Cross-country schooling", sessions: 4, duration: 60 },
        { week: 8, focus: "Speed work and galloping", sessions: 4, duration: 60 },
        { week: 9, focus: "Competition simulation", sessions: 4, duration: 60 },
        { week: 10, focus: "Taper week - maintenance", sessions: 3, duration: 45 }
      ]
    }),
    isPublic: true,
    isActive: true
  },
  {
    userId: 0,
    stableId: null,
    name: "Young Horse Development",
    description: "A gentle 16-week program for 3-4 year old horses beginning their training journey. Emphasizes soundness, confidence, and correct foundation.",
    duration: 16,
    discipline: "General",
    level: "Beginner",
    goals: "Develop trust and partnership, establish basic commands, build physical strength gradually, create positive training experiences",
    programData: JSON.stringify({
      weeks: [
        { week: 1, focus: "Groundwork and leading", sessions: 3, duration: 20 },
        { week: 2, focus: "Lunging basics", sessions: 3, duration: 25 },
        { week: 3, focus: "Introduction to tack", sessions: 3, duration: 25 },
        { week: 4, focus: "Long-reining", sessions: 3, duration: 30 },
        { week: 5, focus: "First mounting exercises", sessions: 3, duration: 30 },
        { week: 6, focus: "Walk under saddle", sessions: 4, duration: 30 },
        { week: 7, focus: "Walk transitions and steering", sessions: 4, duration: 30 },
        { week: 8, focus: "Introduction to trot", sessions: 4, duration: 30 },
        { week: 9, focus: "Trot development", sessions: 4, duration: 35 },
        { week: 10, focus: "Basic circles and shapes", sessions: 4, duration: 35 },
        { week: 11, focus: "First canter steps", sessions: 4, duration: 35 },
        { week: 12, focus: "Canter balance", sessions: 4, duration: 35 },
        { week: 13, focus: "Outside arena work", sessions: 4, duration: 40 },
        { week: 14, focus: "Trail riding introduction", sessions: 3, duration: 40 },
        { week: 15, focus: "Variety work - poles, obstacles", sessions: 4, duration: 40 },
        { week: 16, focus: "Assessment and planning", sessions: 3, duration: 35 }
      ]
    }),
    isPublic: true,
    isActive: true
  },
  {
    userId: 0,
    stableId: null,
    name: "Competition Preparation - Dressage",
    description: "A focused 6-week program to prepare for a specific dressage test. Includes test riding, weakness targeting, and competition simulation.",
    duration: 6,
    discipline: "Dressage",
    level: "Advanced",
    goals: "Perfect test movements, build consistency, develop competition mindset, refine presentation and accuracy",
    programData: JSON.stringify({
      weeks: [
        { week: 1, focus: "Test breakdown - individual movements", sessions: 5, duration: 45 },
        { week: 2, focus: "Difficult movements practice", sessions: 5, duration: 45 },
        { week: 3, focus: "Full test run-throughs", sessions: 5, duration: 50 },
        { week: 4, focus: "Refinement and polish", sessions: 5, duration: 50 },
        { week: 5, focus: "Competition simulation", sessions: 4, duration: 50 },
        { week: 6, focus: "Final preparation and mental prep", sessions: 3, duration: 40 }
      ]
    }),
    isPublic: true,
    isActive: true
  }
];

async function seedTemplates() {
  console.log("\n🌱 Seeding AI Training Templates\n");
  
  try {
    for (const template of templates) {
      // Check if template already exists
      const existing = await db.select()
        .from(trainingProgramTemplates)
        .where(eq(trainingProgramTemplates.name, template.name));
      
      if (existing.length > 0) {
        console.log(`⏭️  Template "${template.name}" already exists, skipping...`);
      } else {
        await db.insert(trainingProgramTemplates).values(template);
        console.log(`✅ Created template: "${template.name}"`);
      }
    }
    
    console.log("\n✅ Training template seeding complete!\n");
    await connection.end();
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    await connection.end();
    process.exit(1);
  }
  
  process.exit(0);
}

seedTemplates();
