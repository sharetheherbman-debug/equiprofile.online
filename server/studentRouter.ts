// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
// Student system router — Phase 2 backend integration
import {
  protectedProcedure,
  router,
} from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { invokeLLM, isAIConfigured } from "./_core/llm";
import { getRuntimeConfig } from "./dynamicConfig";
import { eq, and, desc, gte, lte, sql, inArray, or } from "drizzle-orm";
import { getDb } from "./db";
import {
  virtualHorses,
  studentHorseAssignments,
  studentTasks,
  studentTrainingEntries,
  studentProgress,
  studyTopics,
  aiTutorSessions,
  horses,
  users,
  teacherAssignedTasks,
  teacherFeedback,
  learningPathwayProgress,
  studentGroups,
  studentGroupMembers,
  lessonPathways,
  lessonUnits,
  lessonCompletion,
  studentCompetencies,
  teacherLessonAssignments,
  lessonReviews,
} from "../drizzle/schema";
import { LESSON_PATHWAYS, LESSON_UNITS } from "./lessonContent";

/** Safely parse user preferences JSON. */
function parseUserPrefs(raw: string | null | undefined): Record<string, any> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Student procedure — extends protectedProcedure to check that the user has
 * selected the student experience OR is an admin.
 */
const studentProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const user = await db.getUserById(ctx.user.id);
  if (!user) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  }
  const prefs = parseUserPrefs(user.preferences);
  const isAdmin = user.role === "admin";
  const isStudent = prefs.selectedExperience === "student" || prefs.planTier === "student";
  if (!isAdmin && !isStudent) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This feature requires the Student plan.",
    });
  }
  return next({ ctx });
});

// ─────────────────────────────────────────────────────────────────────────────
// AI Tutor — tiered model architecture
// ─────────────────────────────────────────────────────────────────────────────

/** Maximum AI tutor questions per user per day (cost control). */
const AI_TUTOR_DAILY_LIMIT = 20;

/** System prompt for the AI tutor — educational, horse-focused, safe. */
const AI_TUTOR_SYSTEM_PROMPT = `You are EquiProfile AI Tutor, a knowledgeable and friendly equestrian education assistant.

Your role:
- Help students learn about horse care, riding, stable management, and equine health
- Explain concepts clearly at a level appropriate for student riders
- Encourage safe practices and proper horse handling
- Be supportive, patient, and educational
- Reference standard equestrian knowledge and BHS/Pony Club guidelines where relevant

Rules:
- Only answer questions related to horses, riding, equestrian care, and related topics
- If asked about unrelated topics, gently redirect to equestrian learning
- Never give veterinary diagnoses — advise consulting a vet for health concerns
- Keep answers concise but thorough (max 300 words unless more detail is requested)
- Use British English spelling conventions`;

/**
 * Resolve AI tutor model based on tier.
 * Tier 1 (standard): Use the cheapest available model (gpt-4o-mini or equivalent)
 * Tier 2 (smart): Use a more capable model for complex questions
 */
async function resolveTutorModel(tier: "standard" | "smart"): Promise<string> {
  if (tier === "smart") {
    const smartModel = await getRuntimeConfig("ai_tutor_smart_model", "AI_TUTOR_SMART_MODEL");
    return smartModel?.trim() || "gpt-4o-mini";
  }
  // Standard tier — cheapest model
  const cheapModel = await getRuntimeConfig("ai_tutor_model", "AI_TUTOR_MODEL");
  return cheapModel?.trim() || "gpt-4o-mini";
}

/**
 * Determine whether a question needs the smarter (more expensive) model.
 * Simple heuristic: long questions or those with complex keywords escalate.
 */
function shouldEscalate(question: string): boolean {
  const complexKeywords = [
    "explain in detail", "compare", "difference between",
    "why does", "biomechanics", "physiology", "nutrition plan",
    "detailed analysis", "training programme", "dressage test",
    "show jumping course", "lameness", "colic signs",
  ];
  if (question.length > 500) return true;
  const lower = question.toLowerCase();
  return complexKeywords.some((kw) => lower.includes(kw));
}

// ─────────────────────────────────────────────────────────────────────────────
// Default study topics — seeded on first request if table is empty
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_STUDY_TOPICS = [
  // ── BEGINNER ──────────────────────────────────────────────────────────────
  { slug: "riding-position", title: "Riding Position & Balance", description: "Learn the fundamentals of a correct riding position, balance, and independent seat.", category: "riding", difficulty: "beginner" as const, sortOrder: 1 },
  { slug: "aids-and-control", title: "Aids & Control", description: "Understanding natural and artificial aids to communicate clearly with your horse.", category: "riding", difficulty: "beginner" as const, sortOrder: 2 },
  { slug: "grooming-basics", title: "Grooming Basics", description: "How to groom a horse properly — brushes, techniques, sequence, and daily routine.", category: "care", difficulty: "beginner" as const, sortOrder: 3 },
  { slug: "feeding-basics", title: "Feeding Basics", description: "Understanding horse nutrition, feed types, feeding schedules, and water requirements.", category: "care", difficulty: "beginner" as const, sortOrder: 4 },
  { slug: "tack-and-equipment", title: "Tack & Equipment", description: "Identifying, fitting, and caring for saddles, bridles, girths, and protective boots.", category: "care", difficulty: "beginner" as const, sortOrder: 5 },
  { slug: "horse-behaviour", title: "Horse Behaviour Basics", description: "Reading body language, understanding the flight response, herd instinct, and building trust.", category: "theory", difficulty: "beginner" as const, sortOrder: 6 },
  { slug: "stable-safety", title: "Stable & Yard Safety", description: "Essential safety practices around horses, in the stable yard, and when leading.", category: "safety", difficulty: "beginner" as const, sortOrder: 7 },
  { slug: "horse-health-awareness", title: "Signs of Good Health", description: "Recognising normal vital signs, healthy coat and condition, and when to call the vet.", category: "theory", difficulty: "beginner" as const, sortOrder: 8 },
  { slug: "lesson-preparation", title: "Lesson Preparation", description: "How to prepare for a riding lesson — tacking up, warming up, and goal setting.", category: "riding", difficulty: "beginner" as const, sortOrder: 9 },
  { slug: "care-routine", title: "Daily Care Routines", description: "Building consistent daily horse care habits — morning checks, turnout, and evening routines.", category: "care", difficulty: "beginner" as const, sortOrder: 10 },
  { slug: "horse-welfare", title: "Horse Welfare Principles", description: "The Five Freedoms framework and what it means in everyday horse care and management.", category: "theory", difficulty: "beginner" as const, sortOrder: 11 },
  { slug: "leading-and-handling", title: "Leading & Handling", description: "How to lead safely, tie up correctly, and handle a horse with confidence.", category: "safety", difficulty: "beginner" as const, sortOrder: 12 },
  // ── DEVELOPING ────────────────────────────────────────────────────────────
  { slug: "transitions", title: "Transitions & Paces", description: "Riding smooth upward and downward transitions between walk, trot, and canter.", category: "riding", difficulty: "developing" as const, sortOrder: 20 },
  { slug: "trot-work", title: "Trot Work", description: "Rising trot, sitting trot, diagonal awareness, and rhythm development.", category: "riding", difficulty: "developing" as const, sortOrder: 21 },
  { slug: "nutrition-in-depth", title: "Nutrition in Depth", description: "Feed ratios, roughage requirements, condition scoring, and balancing a diet.", category: "care", difficulty: "developing" as const, sortOrder: 22 },
  { slug: "hoof-care", title: "Hoof Care & the Farrier", description: "Understanding hoof structure, regular farrier cycles, and picking out hooves correctly.", category: "care", difficulty: "developing" as const, sortOrder: 23 },
  { slug: "rugging", title: "Rugging & Clipping", description: "When and how to rug, rug weights, turnout vs stable rugs, and basic clipping awareness.", category: "care", difficulty: "developing" as const, sortOrder: 24 },
  { slug: "horse-behaviour-advanced", title: "Understanding Problem Behaviours", description: "Common stable vices, causes of napping, and safe approaches to challenging behaviour.", category: "theory", difficulty: "developing" as const, sortOrder: 25 },
  { slug: "first-aid-basics", title: "Horse First Aid Basics", description: "Wound assessment, cold therapy, poulticing, and when to call the vet immediately.", category: "safety", difficulty: "developing" as const, sortOrder: 26 },
  { slug: "warming-up", title: "Warming Up & Cooling Down", description: "The importance of a proper warm-up, loosening exercises, and cooling down after exercise.", category: "riding", difficulty: "developing" as const, sortOrder: 27 },
  // ── INTERMEDIATE ──────────────────────────────────────────────────────────
  { slug: "canter-work", title: "Canter Work & Leads", description: "Correct canter lead aids, counter-canter introduction, and developing rhythm.", category: "riding", difficulty: "intermediate" as const, sortOrder: 30 },
  { slug: "lateral-work-intro", title: "Lateral Work — Introduction", description: "Leg yield and turn on the forehand — principles and aids.", category: "riding", difficulty: "intermediate" as const, sortOrder: 31 },
  { slug: "health-monitoring", title: "Health Monitoring & Vital Signs", description: "Taking pulse, respiration, and temperature; TPR norms; recognising illness early.", category: "theory", difficulty: "intermediate" as const, sortOrder: 32 },
  { slug: "lameness-awareness", title: "Lameness Awareness", description: "Recognising lameness, common causes, trot-up assessment, and appropriate response.", category: "theory", difficulty: "intermediate" as const, sortOrder: 33 },
  { slug: "competition-basics", title: "Competition Preparation", description: "Preparing for your first competition — tack checks, dress code, warm-up ring etiquette.", category: "riding", difficulty: "intermediate" as const, sortOrder: 34 },
  { slug: "arena-figures", title: "Arena Figures & Geometry", description: "Accurate circles, serpentines, diagonals, and how correct geometry develops the horse.", category: "riding", difficulty: "intermediate" as const, sortOrder: 35 },
  // ── ADVANCED ──────────────────────────────────────────────────────────────
  { slug: "collection-and-engagement", title: "Collection & Engagement", description: "Understanding collection, hindquarter engagement, and the scale of training.", category: "riding", difficulty: "advanced" as const, sortOrder: 40 },
  { slug: "horse-biomechanics", title: "Horse Biomechanics", description: "How the horse's body moves, back mechanics, and how rider position affects movement.", category: "theory", difficulty: "advanced" as const, sortOrder: 41 },
  { slug: "nutrition-advanced", title: "Advanced Nutrition & Supplementation", description: "Sport horse nutrition, supplements, electrolytes, and managing condition under work.", category: "care", difficulty: "advanced" as const, sortOrder: 42 },
  { slug: "accident-management", title: "Accident Management & Procedure", description: "Yard accident procedures, emergency contacts, insurance implications, and incident recording.", category: "safety", difficulty: "advanced" as const, sortOrder: 43 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Scenario Training — static educational scenarios
// ─────────────────────────────────────────────────────────────────────────────

export type ScenarioLevel = "beginner" | "developing" | "intermediate" | "advanced";

export interface ScenarioChoice {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Scenario {
  id: string;
  title: string;
  level: ScenarioLevel;
  category: string;
  prompt: string;
  choices: ScenarioChoice[];
  learningTakeaway: string;
}

const SCENARIO_DATA: Scenario[] = [
  // ── BEGINNER ──────────────────────────────────────────────────────────────
  {
    id: "s001",
    title: "Horse Unsettled During Grooming",
    level: "beginner",
    category: "Handling & Behaviour",
    prompt: "You are grooming your horse in the stable. He keeps moving away, pinning his ears, and swishing his tail. What is the most appropriate response?",
    choices: [
      { id: "a", text: "Ignore it and carry on — horses are always fidgety.", isCorrect: false, explanation: "Ignoring discomfort signals risks escalating the behaviour and can be unsafe. Horses communicate through body language." },
      { id: "b", text: "Shout at the horse and push him back into position.", isCorrect: false, explanation: "Raising your voice or using force will increase anxiety and may trigger a defensive reaction." },
      { id: "c", text: "Stop, assess the situation — check if the brush is too firm, the area is painful, or the horse is unsettled by something nearby.", isCorrect: true, explanation: "Correct. These are signs of discomfort or stress. Investigate the cause before continuing. Check the grooming tools, the body area, and the horse's surroundings." },
      { id: "d", text: "Remove the horse from the stable and put him out immediately.", isCorrect: false, explanation: "Turnout may not be appropriate at that time and doesn't address the root cause of the discomfort." },
    ],
    learningTakeaway: "Horses communicate discomfort through body language. Ear position, tail swishing, and movement away from the handler are signals to assess — not ignore.",
  },
  {
    id: "s002",
    title: "Water Bucket Empty in the Stable",
    level: "beginner",
    category: "Daily Care",
    prompt: "You go to check on your horse at 3pm and find the water bucket completely empty. The horse was last checked at 8am. What should you do first?",
    choices: [
      { id: "a", text: "Refill it and carry on without concern — it's normal for buckets to empty.", isCorrect: false, explanation: "While horses do drink considerable amounts, an empty bucket by 3pm may indicate unusually high intake, which can be a sign of illness." },
      { id: "b", text: "Refill immediately, note the time and intake, and monitor for signs of dehydration or illness.", isCorrect: true, explanation: "Correct. Always refill promptly. Noting the consumption is important — excessive drinking (polydipsia) can signal health issues. The horse should always have fresh water available." },
      { id: "c", text: "Wait until evening feed to refill as part of the routine.", isCorrect: false, explanation: "A horse should never be left without water. Dehydration can develop rapidly, especially in warm conditions or after exercise." },
      { id: "d", text: "Call the vet immediately because it must be ill.", isCorrect: false, explanation: "Not necessarily — monitoring first is appropriate. A vet call is needed only if there are additional signs of illness." },
    ],
    learningTakeaway: "Fresh water should always be available to horses. Monitoring water intake is part of daily health assessment.",
  },
  {
    id: "s003",
    title: "Yard Gate Left Open",
    level: "beginner",
    category: "Yard Safety",
    prompt: "You notice the yard gate to the road has been left open. Several horses are turned out in the adjoining field. What do you do?",
    choices: [
      { id: "a", text: "Close the gate quietly and continue with your work.", isCorrect: false, explanation: "While closing the gate is essential, you should also alert others on the yard immediately so horses can be accounted for." },
      { id: "b", text: "Immediately close the gate, check horses are accounted for, and inform the yard manager.", isCorrect: true, explanation: "Correct. Close the gate first to prevent escape. Then check all horses are safe and inform the responsible person. This could prevent a serious accident." },
      { id: "c", text: "Run into the field to herd the horses away from the gate.", isCorrect: false, explanation: "Running can startle horses and cause them to bolt toward the open gate. Moving calmly and closing the gate first is safer." },
      { id: "d", text: "Leave it — the horses are unlikely to wander that far.", isCorrect: false, explanation: "Horses on a road present extreme danger to themselves, riders, and the public. An open gate must never be ignored." },
    ],
    learningTakeaway: "Yard security is every person's responsibility. An open gate to a road is a safety emergency. Act calmly and efficiently — close first, then account for animals.",
  },
  {
    id: "s004",
    title: "Finding a Wound on the Leg",
    level: "beginner",
    category: "Health & First Aid",
    prompt: "While picking out hooves, you notice a shallow cut approximately 3cm long on your horse's left foreleg, just below the knee. There is a small amount of dried blood. What should you do?",
    choices: [
      { id: "a", text: "Clean the wound gently with clean water, apply wound spray, and monitor. Report to the yard manager.", isCorrect: true, explanation: "Correct for a minor wound. Clean with clean water (avoid cotton wool fibres), apply antiseptic wound spray if available, and report to the responsible adult. Continuing to monitor for swelling, heat, or lameness is essential." },
      { id: "b", text: "Wrap the leg tightly with a bandage and continue riding.", isCorrect: false, explanation: "Riding a horse with an unassessed wound is inappropriate. Tight bandaging without correct technique can cause pressure injuries." },
      { id: "c", text: "Ignore it — small cuts always heal on their own.", isCorrect: false, explanation: "Even small wounds on legs need attention due to proximity to tendons, joints, and the risk of infection." },
      { id: "d", text: "Call the vet immediately regardless of the wound size.", isCorrect: false, explanation: "For a small superficial wound, immediate first aid and monitoring is appropriate. A vet is needed if the wound is deep, near a joint, or shows signs of infection." },
    ],
    learningTakeaway: "Any wound on a horse's leg requires assessment. Clean, observe, and report. Vet attention is needed for deep wounds, joint proximity, or signs of infection.",
  },
  // ── DEVELOPING ────────────────────────────────────────────────────────────
  {
    id: "s005",
    title: "Horse Showing Signs of Colic",
    level: "developing",
    category: "Health & First Aid",
    prompt: "You arrive at the stable to find your horse refusing his hay, repeatedly looking at his flank, pawing the ground, and appearing restless. What is the most likely concern and what is your immediate action?",
    choices: [
      { id: "a", text: "The horse is probably bored. Put more bedding down and leave him.", isCorrect: false, explanation: "These are classic signs of colic (abdominal pain), not boredom. Ignoring them could be life-threatening." },
      { id: "b", text: "These are signs of possible colic. Remove food, keep the horse calm, contact the vet immediately, and monitor vital signs.", isCorrect: true, explanation: "Correct. Pawing, flank-watching, and restlessness are primary colic indicators. Remove food, keep the horse calm (gentle walking if he wants to lie down), record pulse and respiration if possible, and call the vet without delay. Do not leave the horse unattended." },
      { id: "c", text: "Give the horse a large feed to settle his stomach.", isCorrect: false, explanation: "Feeding a horse showing colic signs can worsen the condition. Food must be removed immediately." },
      { id: "d", text: "Lunge him to encourage gut movement.", isCorrect: false, explanation: "Forcing exercise without veterinary advice is dangerous. Only gentle walking is sometimes appropriate, and only under vet guidance." },
    ],
    learningTakeaway: "Colic is a medical emergency. Recognise the signs early, remove food, keep the horse calm, and call the vet immediately. Do not give feeds, medicines, or vigorous exercise without veterinary advice.",
  },
  {
    id: "s006",
    title: "Saddle Fitting — Identifying a Problem",
    level: "developing",
    category: "Tack & Equipment",
    prompt: "You tack up your horse and notice he is reluctant to stand for mounting, repeatedly moving away and appearing tense when the saddle is placed. Once mounted, he pins his ears and drops his back. What does this suggest?",
    choices: [
      { id: "a", text: "The horse is being difficult and needs firmer handling.", isCorrect: false, explanation: "These behaviours are not naughtiness — they are consistent signs that the saddle is causing discomfort or pain." },
      { id: "b", text: "The behaviour suggests possible saddle fit issues or back discomfort. Dismount, remove the saddle, and report to the instructor or yard manager.", isCorrect: true, explanation: "Correct. Reluctance to mount, back-dropping, and ear-pinning under saddle are classic signs of saddle discomfort. Continuing to ride risks injury to both horse and rider. A qualified saddle fitter should assess the saddle." },
      { id: "c", text: "He's cold — he'll warm up in the lesson.", isCorrect: false, explanation: "While horses may be fresh in cold weather, these specific behavioural patterns under saddle indicate potential pain, not temperature." },
      { id: "d", text: "Tighten the girth further so the saddle doesn't move.", isCorrect: false, explanation: "Tightening a badly fitting saddle worsens the issue. Fit must be assessed by a professional." },
    ],
    learningTakeaway: "Behavioural changes when tacking up or under saddle should be taken seriously. They are often the horse's only way of communicating pain. Never ride if a saddle fit problem is suspected.",
  },
  {
    id: "s007",
    title: "Horse Rolls Repeatedly in the Field",
    level: "developing",
    category: "Health & First Aid",
    prompt: "During turnout, you observe your horse rolling repeatedly in the field, getting up and going down several times in quick succession, unlike his usual single relaxed roll. How do you respond?",
    choices: [
      { id: "a", text: "Repeated rolling during turnout is normal — leave him and check at the next routine time.", isCorrect: false, explanation: "A single roll is normal. Repeated, unsettled rolling is a colic symptom that needs immediate attention." },
      { id: "b", text: "Bring the horse in calmly, assess for other colic signs, remove food, and contact the vet.", isCorrect: true, explanation: "Correct. Repeated rolling is a clear colic indicator. Bring him in calmly (do not rush him), check pulse, gum colour, and gut sounds if trained to do so, and call the vet." },
      { id: "c", text: "Put more hay in the field so he has something to focus on.", isCorrect: false, explanation: "Feeding a horse with suspected colic is dangerous. Food should be withdrawn." },
      { id: "d", text: "It's probably just flies — apply fly repellent.", isCorrect: false, explanation: "Fly irritation causes isolated kicking or tail swishing, not repeated violent rolling. These are colic signs." },
    ],
    learningTakeaway: "Repeated unrestful rolling is a primary sign of abdominal pain. Know the difference between normal rolling behaviour and distress rolling.",
  },
  {
    id: "s008",
    title: "Incorrect Rug Choice",
    level: "developing",
    category: "Daily Care",
    prompt: "It is a mild autumn night (10°C). Your clipped horse has a lightweight turnout rug on. You check at 9pm and find him shivering slightly. What is the correct response?",
    choices: [
      { id: "a", text: "He'll warm up when he moves — leave him until morning.", isCorrect: false, explanation: "A shivering horse is already using energy to stay warm. Leaving a clipped horse under-rugged overnight risks his health and welfare." },
      { id: "b", text: "Replace or add a medium-weight rug appropriate for the temperature and the horse's clip level. Monitor for warming.", isCorrect: true, explanation: "Correct. A clipped horse loses his natural insulation and requires appropriate rugging at 10°C. A medium-weight rug (200–250g fill) is appropriate. Check he has warmed up after 20 minutes." },
      { id: "c", text: "Bring him in and put a thick stable rug on for the rest of the night.", isCorrect: false, explanation: "If he was turned out intentionally, bringing him in may not always be appropriate. The priority is correct rugging — indoor or outdoor depending on yard management." },
      { id: "d", text: "Horses can cope with cold — shivering is normal.", isCorrect: false, explanation: "Shivering indicates the horse is struggling to maintain body temperature. This is a welfare concern, not normal behaviour." },
    ],
    learningTakeaway: "Clipped horses require more rugging support as they have lost their natural coat. Match rug weight to temperature, clip level, and the individual horse.",
  },
  // ── INTERMEDIATE ──────────────────────────────────────────────────────────
  {
    id: "s009",
    title: "Lameness Check",
    level: "intermediate",
    category: "Health & Welfare",
    prompt: "While trotting your horse up for the vet, he appears slightly uneven on his right foreleg — nodding his head up when the right fore lands. The vet asks you to grade the lameness. Which grade best describes this presentation?",
    choices: [
      { id: "a", text: "Grade 0 — no lameness detected.", isCorrect: false, explanation: "A consistent head nod on a specific limb indicates lameness is present." },
      { id: "b", text: "Grade 1–2 — mild/subtle lameness that may only be visible under certain conditions.", isCorrect: true, explanation: "Correct. A subtle but consistent head nod on the right fore at trot, visible on a straight line, typically indicates Grade 1–2 on the AAEP scale. The horse moves inconsistently but isn't severely lame." },
      { id: "c", text: "Grade 4–5 — severe non-weight-bearing lameness.", isCorrect: false, explanation: "Grade 4–5 lameness involves near or complete non-weight-bearing. This horse is still moving with some discomfort, not refusing to use the limb." },
      { id: "d", text: "It's too early to assess — lame horses always show obvious signs.", isCorrect: false, explanation: "Even subtle lameness should be documented. Early detection matters significantly for treatment and welfare." },
    ],
    learningTakeaway: "Understanding lameness grading helps you communicate accurately with your vet. A head nod down on the sound leg (and up when the lame leg lands) is the classic fore-limb lameness indicator.",
  },
  {
    id: "s010",
    title: "Competition Warm-Up Etiquette",
    level: "intermediate",
    category: "Competition",
    prompt: "You are warming up for your dressage test. The warm-up arena is busy. A more advanced rider comes up behind you very closely on a faster horse. What is the correct action?",
    choices: [
      { id: "a", text: "Speed up to match their pace so they don't have to wait.", isCorrect: false, explanation: "Matching an inappropriate pace disrupts your warm-up and may unsettle your horse or compromise safety." },
      { id: "b", text: "Pass left shoulder to left shoulder when your paths cross, allow faster work to have the track, and call your turns early.", isCorrect: true, explanation: "Correct. Standard warm-up etiquette: pass left shoulder to left shoulder, faster work has priority on the track, and slower work moves to the inner track. Communication is key." },
      { id: "c", text: "Stop your horse and wait until the arena is quieter.", isCorrect: false, explanation: "Stopping suddenly in a busy warm-up area is dangerous. Plan your movements and be predictable." },
      { id: "d", text: "Move to the centre of the arena and practise there.", isCorrect: false, explanation: "The centre of the arena is not reserved space for any user — it creates confusion and risk. Use the track and inner tracks correctly." },
    ],
    learningTakeaway: "Warm-up arena etiquette: left shoulder to left shoulder, faster work has the track, communicate your changes of rein, and be predictable at all times.",
  },
  {
    id: "s011",
    title: "Recognising Dehydration",
    level: "intermediate",
    category: "Health & Welfare",
    prompt: "After an endurance training ride on a warm day, you perform a skin pinch test on your horse's neck. The skin takes 3 seconds to return to normal. What does this indicate?",
    choices: [
      { id: "a", text: "Normal — up to 5 seconds is acceptable.", isCorrect: false, explanation: "A skin tent returning within 1–2 seconds is normal. 3 seconds suggests mild to moderate dehydration." },
      { id: "b", text: "Mild to moderate dehydration — offer water immediately and monitor. Rest the horse and allow gradual rehydration.", isCorrect: true, explanation: "Correct. A skin tent test that takes 2–4 seconds to return indicates dehydration. Allow the horse to drink small amounts frequently. Check gum moisture and capillary refill time. Contact the vet if he refuses to drink or condition worsens." },
      { id: "c", text: "The horse has a skin condition — call the vet for dermatology advice.", isCorrect: false, explanation: "The skin pinch test specifically assesses hydration status, not skin condition." },
      { id: "d", text: "He is overheating — cool him with ice water immediately.", isCorrect: false, explanation: "Cooling is a separate consideration from dehydration. Ice water is not recommended for cooling — cool water on major vessels is more appropriate." },
    ],
    learningTakeaway: "The skin pinch test is a quick dehydration check. A tent returning in more than 2 seconds indicates dehydration. Know your basic vital sign monitoring after exercise.",
  },
  // ── ADVANCED ──────────────────────────────────────────────────────────────
  {
    id: "s012",
    title: "Shoeing Decision — To Shoe or Not",
    level: "advanced",
    category: "Hoof Care",
    prompt: "You have a 7-year-old sport horse in light to moderate work on a mix of arena and hacking surfaces. He has good-quality hooves and has been unshod for 6 months without issues. Your farrier suggests continuing barefoot. What factors should influence your decision?",
    choices: [
      { id: "a", text: "All horses in regular work must be shod — barefoot is only for retired horses.", isCorrect: false, explanation: "Many horses successfully perform in moderate work barefoot with correct hoof care and surface management." },
      { id: "b", text: "Consider work intensity, surface type, hoof quality, horse comfort, and farrier/vet advice. Barefoot can be appropriate if the horse is comfortable and performing well.", isCorrect: true, explanation: "Correct. The decision depends on multiple factors: type and intensity of work, surfaces used, individual hoof quality and conformation, and crucially — horse comfort. A horse moving freely and comfortably barefoot on his working surfaces may not require shoeing. Ongoing assessment is key." },
      { id: "c", text: "Shoe him immediately — hacking on roads will damage unshod hooves.", isCorrect: false, explanation: "Road hacking does wear hooves, but this must be balanced against the benefits and the horse's individual hoof quality. Gradual conditioning and appropriate trimming cycles often allow barefoot horses to hack." },
      { id: "d", text: "Ask a fellow livery owner rather than following the farrier's professional advice.", isCorrect: false, explanation: "A qualified farrier is the appropriate professional to consult. Their structural assessment should form the basis of the decision." },
    ],
    learningTakeaway: "Farriery decisions are not one-size-fits-all. Assess the individual horse on work intensity, surfaces, hoof quality, and comfort. A qualified farrier's assessment is essential.",
  },
  {
    id: "s013",
    title: "Muscle Tie-Up (Azoturia)",
    level: "advanced",
    category: "Health & Exercise Management",
    prompt: "During a hack, your horse suddenly becomes stiff behind, is reluctant to move forward, appears distressed, and begins to sweat excessively. The muscles over his quarters feel hard and painful. What is this most likely to be and what is your immediate response?",
    choices: [
      { id: "a", text: "He is tired — walk him home briskly to cool down.", isCorrect: false, explanation: "Tying-up (exertional rhabdomyolysis / azoturia) is serious. Moving the horse can worsen muscle damage and kidney stress significantly." },
      { id: "b", text: "This is consistent with tying-up. Do not move the horse. Keep him warm, call the vet immediately, and do not offer water unless the vet advises.", isCorrect: true, explanation: "Correct. Classic tying-up presentation. Movement causes further muscle fibre damage and can cause myoglobin to damage the kidneys. Keep the horse still and warm, call the vet urgently, and wait for professional guidance before any further action." },
      { id: "c", text: "Walk him in large circles to loosen the muscles.", isCorrect: false, explanation: "Exercise worsens tying-up by increasing muscle damage and myoglobin release. The horse must not be moved without veterinary instruction." },
      { id: "d", text: "Give him a large electrolyte drink to replace lost minerals.", isCorrect: false, explanation: "Do not offer food or water without veterinary advice during a tying-up episode." },
    ],
    learningTakeaway: "Tying-up (azoturia) is a muscular emergency. Do not move the horse. Keep him still and warm, and call the vet immediately. Movement significantly worsens the condition.",
  },
  {
    id: "s014",
    title: "Respiratory Rate — Post Exercise",
    level: "advanced",
    category: "Health Monitoring",
    prompt: "You have just completed a 45-minute canter schooling session. You dismount and check your horse's respiration rate. It is 60 breaths per minute. After 20 minutes of walking cool-down, it is still 36 bpm. The ambient temperature is 18°C. What is your assessment?",
    choices: [
      { id: "a", text: "60 bpm immediately post-canter is normal. 36 bpm after 20 minutes is within acceptable recovery range.", isCorrect: false, explanation: "A resting respiration rate should return to 8–16 bpm within 20–30 minutes post exercise in normal conditions. 36 bpm is elevated and requires monitoring." },
      { id: "b", text: "Immediate post-exercise rate is elevated but expected. However 36 bpm after 20 minutes suggests delayed recovery — continue monitoring, assess for other signs of distress, and consider veterinary advice if not improving.", isCorrect: true, explanation: "Correct. Normal resting respiration is 8–16 bpm. 60 bpm post-canter is expected. By 20 minutes, the rate should be substantially lower. 36 bpm after 20 minutes in mild conditions indicates the horse is working hard to recover. Continue cool-down, assess temperature, pulse, and gum colour, and seek vet advice if not normalising." },
      { id: "c", text: "60 bpm is a respiratory emergency — call the vet immediately before cooling down.", isCorrect: false, explanation: "Immediately post-hard work, elevated respiration is normal. Monitor the recovery rate rather than the immediate post-work figure." },
      { id: "d", text: "The respiration rate doesn't matter as long as the horse is eating normally.", isCorrect: false, explanation: "Vital signs post-exercise are key indicators of fitness, health, and recovery. Respiration monitoring is essential practice for any rider." },
    ],
    learningTakeaway: "Normal resting respiration: 8–16 bpm. Post-work recovery should be substantial within 20 minutes. Delayed recovery needs investigation. Vital sign monitoring post-exercise is essential equestrian practice.",
  },
  {
    id: "s015",
    title: "Stable Vice — Crib-Biting",
    level: "advanced",
    category: "Behaviour & Management",
    prompt: "You have taken on a new livery horse who crib-bites. The previous owner used an anti-cribbing collar. Another livery owner tells you to try a stronger anti-cribbing collar as the current one isn't working. What is the most informed approach?",
    choices: [
      { id: "a", text: "Use a stronger collar — stopping crib-biting is always the right goal.", isCorrect: false, explanation: "Stronger physical restraint addresses the symptom, not the cause. Crib-biting is often linked to stress, boredom, gut pain, or management factors." },
      { id: "b", text: "Review management factors (forage availability, stabling time, social contact, exercise) and seek veterinary advice about underlying gastric issues before increasing physical restraint.", isCorrect: true, explanation: "Correct. Crib-biting can be a response to gastric ulcers, insufficient forage, social isolation, or boredom. Physical restraint prevents the behaviour but does not address the cause, and may increase stress. Reviewing and improving management is the welfare-centred approach." },
      { id: "c", text: "Isolate the horse so other horses don't learn the behaviour.", isCorrect: false, explanation: "Social isolation worsens stress-related behaviours. Crib-biting is not typically learned socially, despite common belief." },
      { id: "d", text: "The collar is fine — increase the horse's workload to reduce boredom.", isCorrect: false, explanation: "Simply increasing work without addressing underlying causes is unlikely to resolve the behaviour and may not address gastric or management issues." },
    ],
    learningTakeaway: "Stable vices are often management or health-related. Investigate the underlying cause — gastric issues, forage, social contact, exercise — before relying on physical restraint.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────
export const studentRouter = router({

  // ── Overview ─────────────────────────────────────────────────────────────
  getOverview: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    const userId = ctx.user.id;

    // Fetch virtual horse
    const [vHorse] = await dbConn.select().from(virtualHorses)
      .where(and(eq(virtualHorses.userId, userId), eq(virtualHorses.isActive, true)))
      .limit(1);

    // Fetch assigned real horse
    const assignments = await dbConn.select({
      assignmentId: studentHorseAssignments.id,
      horseId: studentHorseAssignments.horseId,
      horseName: horses.name,
      horseBreed: horses.breed,
      horsePhotoUrl: horses.photoUrl,
    }).from(studentHorseAssignments)
      .innerJoin(horses, eq(studentHorseAssignments.horseId, horses.id))
      .where(and(
        eq(studentHorseAssignments.studentUserId, userId),
        eq(studentHorseAssignments.isActive, true),
      ))
      .limit(1);
    const assignedHorse = assignments[0] ?? null;

    // Today's tasks
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = await dbConn.select().from(studentTasks)
      .where(and(
        eq(studentTasks.userId, userId),
        sql`${studentTasks.targetDate} = ${today}`,
      ))
      .orderBy(studentTasks.createdAt);

    // Incomplete daily tasks (no target date or today)
    const pendingDailyTasks = await dbConn.select().from(studentTasks)
      .where(and(
        eq(studentTasks.userId, userId),
        eq(studentTasks.frequency, "daily"),
        eq(studentTasks.isCompleted, false),
      ))
      .limit(10);

    // Recent training entries (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];
    const recentTraining = await dbConn.select().from(studentTrainingEntries)
      .where(and(
        eq(studentTrainingEntries.userId, userId),
        sql`${studentTrainingEntries.sessionDate} >= ${weekAgoStr}`,
      ))
      .orderBy(desc(studentTrainingEntries.sessionDate));

    // Progress summary
    const progress = await dbConn.select().from(studentProgress)
      .where(eq(studentProgress.userId, userId));

    // Stats
    const totalTasks = todayTasks.length + pendingDailyTasks.filter(
      (t) => !todayTasks.some((tt) => tt.id === t.id)
    ).length;
    const completedTasks = todayTasks.filter((t) => t.isCompleted).length;

    return {
      virtualHorse: vHorse ?? null,
      assignedHorse,
      todayTasks: [...todayTasks, ...pendingDailyTasks.filter(
        (t) => !todayTasks.some((tt) => tt.id === t.id)
      )],
      tasksCompleted: completedTasks,
      tasksPending: totalTasks - completedTasks,
      weeklySessionCount: recentTraining.length,
      progressSkills: progress,
    };
  }),

  // ── Virtual Horse ────────────────────────────────────────────────────────
  getVirtualHorse: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
    const [vHorse] = await dbConn.select().from(virtualHorses)
      .where(and(eq(virtualHorses.userId, ctx.user.id), eq(virtualHorses.isActive, true)))
      .limit(1);
    return vHorse ?? null;
  }),

  createVirtualHorse: studentProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      breed: z.string().max(100).optional(),
      color: z.string().max(50).optional(),
      age: z.number().int().min(1).max(40).optional(),
      personality: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      // Only allow one active virtual horse per student
      const [existing] = await dbConn.select().from(virtualHorses)
        .where(and(eq(virtualHorses.userId, ctx.user.id), eq(virtualHorses.isActive, true)))
        .limit(1);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You already have an active virtual horse." });
      }

      const [result] = await dbConn.insert(virtualHorses).values({
        userId: ctx.user.id,
        name: input.name,
        breed: input.breed ?? null,
        color: input.color ?? null,
        age: input.age ?? null,
        personality: input.personality ?? null,
      });
      return { id: result.insertId, success: true };
    }),

  updateVirtualHorse: studentProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      breed: z.string().max(100).optional(),
      color: z.string().max(50).optional(),
      age: z.number().int().min(1).max(40).optional(),
      personality: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      const { id, ...updates } = input;
      await dbConn.update(virtualHorses)
        .set(updates)
        .where(and(eq(virtualHorses.id, id), eq(virtualHorses.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── Assigned Horse ───────────────────────────────────────────────────────
  getAssignedHorse: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
    const assignments = await dbConn.select({
      assignmentId: studentHorseAssignments.id,
      horseId: studentHorseAssignments.horseId,
      notes: studentHorseAssignments.notes,
      assignedAt: studentHorseAssignments.assignedAt,
      horseName: horses.name,
      horseBreed: horses.breed,
      horseColor: horses.color,
      horseAge: horses.age,
      horsePhotoUrl: horses.photoUrl,
      horseGender: horses.gender,
    }).from(studentHorseAssignments)
      .innerJoin(horses, eq(studentHorseAssignments.horseId, horses.id))
      .where(and(
        eq(studentHorseAssignments.studentUserId, ctx.user.id),
        eq(studentHorseAssignments.isActive, true),
      ))
      .limit(1);
    return assignments[0] ?? null;
  }),

  // ── Tasks ────────────────────────────────────────────────────────────────
  listTasks: studentProcedure
    .input(z.object({
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      completed: z.boolean().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      const conditions = [eq(studentTasks.userId, ctx.user.id)];
      if (input?.completed !== undefined) {
        conditions.push(eq(studentTasks.isCompleted, input.completed));
      }
      if (input?.dateFrom) {
        conditions.push(sql`${studentTasks.targetDate} >= ${input.dateFrom}` as any);
      }
      if (input?.dateTo) {
        conditions.push(sql`${studentTasks.targetDate} <= ${input.dateTo}` as any);
      }

      return dbConn.select().from(studentTasks)
        .where(and(...conditions))
        .orderBy(desc(studentTasks.createdAt))
        .limit(100);
    }),

  createTask: studentProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      description: z.string().optional(),
      category: z.enum(["care", "grooming", "feeding", "study", "exercise", "other"]).default("care"),
      frequency: z.enum(["daily", "weekly", "once"]).default("daily"),
      targetDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const [result] = await dbConn.insert(studentTasks).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        frequency: input.frequency,
        targetDate: input.targetDate ? new Date(input.targetDate) : null,
      });
      return { id: result.insertId, success: true };
    }),

  completeTask: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.update(studentTasks)
        .set({ isCompleted: true, completedAt: new Date() })
        .where(and(eq(studentTasks.id, input.id), eq(studentTasks.userId, ctx.user.id)));
      return { success: true };
    }),

  uncompleteTask: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.update(studentTasks)
        .set({ isCompleted: false, completedAt: null })
        .where(and(eq(studentTasks.id, input.id), eq(studentTasks.userId, ctx.user.id)));
      return { success: true };
    }),

  deleteTask: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.delete(studentTasks)
        .where(and(eq(studentTasks.id, input.id), eq(studentTasks.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── Training Log ─────────────────────────────────────────────────────────
  listTraining: studentProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
    }).optional())
    .query(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      return dbConn.select().from(studentTrainingEntries)
        .where(eq(studentTrainingEntries.userId, ctx.user.id))
        .orderBy(desc(studentTrainingEntries.sessionDate))
        .limit(input?.limit ?? 20);
    }),

  createTraining: studentProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      sessionDate: z.string(),
      duration: z.number().int().min(1).optional(),
      sessionType: z.enum(["lesson", "practice", "groundwork", "theory", "other"]).default("lesson"),
      notes: z.string().optional(),
      wentWell: z.string().optional(),
      needsImprovement: z.string().optional(),
      instructor: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const [result] = await dbConn.insert(studentTrainingEntries).values({
        userId: ctx.user.id,
        title: input.title,
        sessionDate: new Date(input.sessionDate),
        duration: input.duration ?? null,
        sessionType: input.sessionType,
        notes: input.notes ?? null,
        wentWell: input.wentWell ?? null,
        needsImprovement: input.needsImprovement ?? null,
        instructor: input.instructor ?? null,
      });
      return { id: result.insertId, success: true };
    }),

  deleteTraining: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.delete(studentTrainingEntries)
        .where(and(eq(studentTrainingEntries.id, input.id), eq(studentTrainingEntries.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── Progress ─────────────────────────────────────────────────────────────
  getProgress: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
    return dbConn.select().from(studentProgress)
      .where(eq(studentProgress.userId, ctx.user.id))
      .orderBy(studentProgress.skillArea);
  }),

  // ── Study Hub ────────────────────────────────────────────────────────────
  listStudyTopics: studentProcedure
    .input(z.object({
      category: z.string().optional(),
    }).optional())
    .query(async ({ ctx: _ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      // Seed defaults if table is empty
      const existing = await dbConn.select({ id: studyTopics.id }).from(studyTopics).limit(1);
      if (existing.length === 0) {
        await dbConn.insert(studyTopics).values(DEFAULT_STUDY_TOPICS);
      }

      const conditions = [eq(studyTopics.isPublished, true)];
      if (input?.category) {
        conditions.push(eq(studyTopics.category, input.category));
      }

      return dbConn.select().from(studyTopics)
        .where(and(...conditions))
        .orderBy(studyTopics.sortOrder);
    }),

  getStudyTopic: studentProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx: _ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const [topic] = await dbConn.select().from(studyTopics)
        .where(eq(studyTopics.slug, input.slug))
        .limit(1);
      if (!topic) throw new TRPCError({ code: "NOT_FOUND", message: "Topic not found" });
      return topic;
    }),

  // ── AI Tutor ─────────────────────────────────────────────────────────────
  askTutor: studentProcedure
    .input(z.object({
      question: z.string().min(1).max(2000),
      conversationHistory: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).max(10).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      // Rate limit: check daily usage
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todaySessions = await dbConn.select({ id: aiTutorSessions.id })
        .from(aiTutorSessions)
        .where(and(
          eq(aiTutorSessions.userId, ctx.user.id),
          gte(aiTutorSessions.createdAt, todayStart),
        ));

      if (todaySessions.length >= AI_TUTOR_DAILY_LIMIT) {
        return {
          answer: `You've reached today's limit of ${AI_TUTOR_DAILY_LIMIT} questions. Your limit resets at midnight. Keep studying — you're doing great! 🐴`,
          tier: "limited" as const,
          modelUsed: "none",
        };
      }

      // Check if AI is configured
      if (!(await isAIConfigured())) {
        return {
          answer: "⚠️ The AI Tutor is not yet configured. Please ask your school or check back later.",
          tier: "unavailable" as const,
          modelUsed: "none",
        };
      }

      // Determine tier
      const tier = shouldEscalate(input.question) ? "smart" : "standard";
      const model = await resolveTutorModel(tier);

      // Build messages
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: AI_TUTOR_SYSTEM_PROMPT },
      ];

      // Add conversation history for context
      if (input.conversationHistory?.length) {
        for (const msg of input.conversationHistory.slice(-6)) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }

      messages.push({ role: "user", content: input.question });

      try {
        const response = await invokeLLM({
          messages,
          maxTokens: tier === "smart" ? 1024 : 512,
        });

        const answer = typeof response.choices[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : "I couldn't generate a response. Please try rephrasing your question.";

        // Log the session
        await dbConn.insert(aiTutorSessions).values({
          userId: ctx.user.id,
          question: input.question,
          answer,
          modelUsed: model,
          tier,
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
        });

        return { answer, tier, modelUsed: model };
      } catch (err: any) {
        // Log the failed attempt
        await dbConn.insert(aiTutorSessions).values({
          userId: ctx.user.id,
          question: input.question,
          answer: `Error: ${err?.message || "Unknown error"}`,
          modelUsed: model,
          tier,
          promptTokens: 0,
          completionTokens: 0,
        }).catch((logErr: unknown) => {
          console.error("[AI Tutor] Failed to log error session:", logErr);
        }); // don't fail on logging failure

        return {
          answer: "Sorry, the AI Tutor encountered an error. Please try again in a moment.",
          tier: "error" as const,
          modelUsed: model,
        };
      }
    }),

  getTutorUsage: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySessions = await dbConn.select({ id: aiTutorSessions.id })
      .from(aiTutorSessions)
      .where(and(
        eq(aiTutorSessions.userId, ctx.user.id),
        gte(aiTutorSessions.createdAt, todayStart),
      ));

    return {
      usedToday: todaySessions.length,
      dailyLimit: AI_TUTOR_DAILY_LIMIT,
      remaining: Math.max(0, AI_TUTOR_DAILY_LIMIT - todaySessions.length),
    };
  }),

  // ── Scenario Training ────────────────────────────────────────────────────
  listScenarios: studentProcedure
    .input(z.object({
      level: z.enum(["beginner", "developing", "intermediate", "advanced"]).optional(),
      category: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      let results = SCENARIO_DATA as Scenario[];
      if (input?.level) {
        results = results.filter((s) => s.level === input.level);
      }
      if (input?.category) {
        results = results.filter((s) => s.category === input.category);
      }
      // Strip correct answer info before sending — frontend gets it after answering
      return results.map(({ choices, ...rest }) => ({
        ...rest,
        choices: choices.map(({ id, text }) => ({ id, text })),
      }));
    }),

  checkScenarioAnswer: studentProcedure
    .input(z.object({
      scenarioId: z.string(),
      choiceId: z.string(),
    }))
    .mutation(({ input }) => {
      const scenario = SCENARIO_DATA.find((s) => s.id === input.scenarioId);
      if (!scenario) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Scenario not found" });
      }
      const choice = scenario.choices.find((c) => c.id === input.choiceId);
      if (!choice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Choice not found" });
      }
      // Return the full choice with explanation + all choices with explanations so the frontend can show the reveal
      return {
        isCorrect: choice.isCorrect,
        selectedChoice: choice,
        allChoices: scenario.choices,
        learningTakeaway: scenario.learningTakeaway,
      };
    }),

  // ── Training Log — Update ────────────────────────────────────────────────
  updateTraining: studentProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).max(200).optional(),
      sessionDate: z.string().optional(),
      duration: z.number().int().min(1).optional(),
      sessionType: z.enum(["lesson", "practice", "groundwork", "theory", "other"]).optional(),
      notes: z.string().optional(),
      wentWell: z.string().optional(),
      needsImprovement: z.string().optional(),
      instructor: z.string().max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const { id, sessionDate, ...rest } = input;
      const updateData: Record<string, any> = { ...rest };
      if (sessionDate) {
        updateData.sessionDate = new Date(sessionDate);
      }
      await dbConn.update(studentTrainingEntries)
        .set(updateData)
        .where(and(eq(studentTrainingEntries.id, id), eq(studentTrainingEntries.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── Learner Level ────────────────────────────────────────────────────────
  getLearnerLevel: studentProcedure.query(async ({ ctx }) => {
    const user = await db.getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    const prefs = parseUserPrefs(user.preferences);
    return {
      level: (prefs.studentLevel as "beginner" | "developing" | "intermediate" | "advanced") ?? "beginner",
    };
  }),

  setLearnerLevel: studentProcedure
    .input(z.object({
      level: z.enum(["beginner", "developing", "intermediate", "advanced"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      const user = await db.getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const prefs = parseUserPrefs(user.preferences);
      prefs.studentLevel = input.level;
      await dbConn.update(users)
        .set({ preferences: JSON.stringify(prefs) })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  // ── Teacher-assigned tasks (student view) ─────────────────────────────────

  listAssignedTasksForMe: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    // Find groups the student is in
    const memberships = await dbConn.select({ groupId: studentGroupMembers.groupId })
      .from(studentGroupMembers)
      .where(eq(studentGroupMembers.studentUserId, ctx.user.id));

    const groupIds = memberships.map(m => m.groupId);

    // Individual + group tasks
    const conditions = groupIds.length
      ? [eq(teacherAssignedTasks.studentUserId, ctx.user.id)]
      : [eq(teacherAssignedTasks.studentUserId, ctx.user.id)];

    const individualTasks = await dbConn.select().from(teacherAssignedTasks)
      .where(eq(teacherAssignedTasks.studentUserId, ctx.user.id))
      .orderBy(desc(teacherAssignedTasks.createdAt));

    const groupTasks = groupIds.length
      ? await dbConn.select().from(teacherAssignedTasks)
          .where(inArray(teacherAssignedTasks.groupId, groupIds))
          .orderBy(desc(teacherAssignedTasks.createdAt))
      : [];

    return [...individualTasks, ...groupTasks];
  }),

  completeAssignedTask: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      // Verify the task is assigned to this student (individual or group)
      const [task] = await dbConn.select().from(teacherAssignedTasks)
        .where(eq(teacherAssignedTasks.id, input.id)).limit(1);

      if (!task) throw new TRPCError({ code: "NOT_FOUND" });

      // Check group membership if group task
      if (task.groupId) {
        const [membership] = await dbConn.select({ id: studentGroupMembers.id })
          .from(studentGroupMembers)
          .where(and(eq(studentGroupMembers.groupId, task.groupId), eq(studentGroupMembers.studentUserId, ctx.user.id)))
          .limit(1);
        if (!membership) throw new TRPCError({ code: "FORBIDDEN" });
      } else if (task.studentUserId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await dbConn.update(teacherAssignedTasks)
        .set({ isCompleted: true, completedAt: new Date(), completedByStudentId: ctx.user.id })
        .where(eq(teacherAssignedTasks.id, input.id));
      return { success: true };
    }),

  // ── Teacher feedback (student view) ──────────────────────────────────────

  listMyFeedback: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    const feedback = await dbConn.select({
      id: teacherFeedback.id,
      teacherId: teacherFeedback.teacherId,
      entryType: teacherFeedback.entryType,
      entryId: teacherFeedback.entryId,
      comment: teacherFeedback.comment,
      feedbackType: teacherFeedback.feedbackType,
      isRead: teacherFeedback.isRead,
      createdAt: teacherFeedback.createdAt,
    }).from(teacherFeedback)
      .where(eq(teacherFeedback.studentUserId, ctx.user.id))
      .orderBy(desc(teacherFeedback.createdAt))
      .limit(50);

    if (!feedback.length) return [];

    // Fetch teacher names
    const teacherIds = Array.from(new Set(feedback.map(f => f.teacherId)));
    const teacherUsers = await dbConn.select({ id: users.id, name: users.name })
      .from(users).where(inArray(users.id, teacherIds));
    const teacherMap = new Map(teacherUsers.map(u => [u.id, u.name]));

    return feedback.map(f => ({ ...f, teacherName: teacherMap.get(f.teacherId) ?? "Instructor" }));
  }),

  markFeedbackRead: studentProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.update(teacherFeedback)
        .set({ isRead: true })
        .where(and(eq(teacherFeedback.id, input.id), eq(teacherFeedback.studentUserId, ctx.user.id)));
      return { success: true };
    }),

  // ── Learning Pathway Progress ─────────────────────────────────────────────

  getPathwayProgress: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    const completed = await dbConn.select().from(learningPathwayProgress)
      .where(eq(learningPathwayProgress.studentUserId, ctx.user.id));

    const user = await db.getUserById(ctx.user.id);
    const prefs = parseUserPrefs(user?.preferences);
    const currentLevel = (prefs.studentLevel as string) ?? "beginner";

    return { completed, currentLevel };
  }),

  markPathwayItemComplete: studentProcedure
    .input(z.object({
      pathwayLevel: z.enum(["beginner", "developing", "intermediate", "advanced"]),
      itemType: z.enum(["study_topic", "scenario"]),
      itemSlug: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

      // Idempotent — only insert if not already completed
      const [existing] = await dbConn.select({ id: learningPathwayProgress.id })
        .from(learningPathwayProgress)
        .where(and(
          eq(learningPathwayProgress.studentUserId, ctx.user.id),
          eq(learningPathwayProgress.pathwayLevel, input.pathwayLevel),
          eq(learningPathwayProgress.itemType, input.itemType),
          eq(learningPathwayProgress.itemSlug, input.itemSlug),
        )).limit(1);

      if (!existing) {
        await dbConn.insert(learningPathwayProgress).values({
          studentUserId: ctx.user.id,
          pathwayLevel: input.pathwayLevel,
          itemType: input.itemType,
          itemSlug: input.itemSlug,
        });
      }

      return { success: true };
    }),

  // ─────────────────────────────────────────────────────────────────────────
  // Lesson Engine — structured learning pathways
  // ─────────────────────────────────────────────────────────────────────────

  /** List all lesson pathways (seeds DB on first call). */
  listLessonPathways: studentProcedure
    .query(async () => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });

      // Seed pathways if table is empty
      const existing = await dbConn.select({ id: lessonPathways.id }).from(lessonPathways).limit(1);
      if (existing.length === 0) {
        await dbConn.insert(lessonPathways).values(
          LESSON_PATHWAYS.map((p) => ({
            slug: p.slug,
            title: p.title,
            description: p.description,
            sortOrder: p.sortOrder,
            iconName: p.iconName,
            isPublished: true,
          })),
        );
      }

      const rows = await dbConn.select().from(lessonPathways).orderBy(lessonPathways.sortOrder);
      return rows;
    }),

  /** List lessons, optionally filtered by pathway and/or level. Seeds DB on first call. */
  listLessons: studentProcedure
    .input(z.object({
      pathwaySlug: z.string().optional(),
      level: z.enum(["beginner", "developing", "intermediate", "advanced"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });

      // Seed lessons if table is empty
      const existing = await dbConn.select({ id: lessonUnits.id }).from(lessonUnits).limit(1);
      if (existing.length === 0) {
        await dbConn.insert(lessonUnits).values(
          LESSON_UNITS.map((l) => ({
            slug: l.slug,
            pathwaySlug: l.pathwaySlug,
            title: l.title,
            level: l.level,
            category: l.category,
            sortOrder: l.sortOrder,
            objectives: JSON.stringify(l.objectives),
            content: l.content,
            keyPoints: JSON.stringify(l.keyPoints),
            safetyNote: l.safetyNote,
            practicalApplication: l.practicalApplication,
            commonMistakes: JSON.stringify(l.commonMistakes),
            knowledgeCheck: JSON.stringify(l.knowledgeCheck),
            aiTutorPrompts: JSON.stringify(l.aiTutorPrompts),
            isPublished: true,
          })),
        );
      }

      const conditions = [];
      if (input?.pathwaySlug) conditions.push(eq(lessonUnits.pathwaySlug, input.pathwaySlug));
      if (input?.level) conditions.push(eq(lessonUnits.level, input.level));

      const rows = conditions.length > 0
        ? await dbConn.select().from(lessonUnits).where(and(...conditions)).orderBy(lessonUnits.sortOrder)
        : await dbConn.select().from(lessonUnits).orderBy(lessonUnits.sortOrder);

      // Return summary without full content
      return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        pathwaySlug: r.pathwaySlug,
        title: r.title,
        level: r.level,
        category: r.category,
        sortOrder: r.sortOrder,
      }));
    }),

  /** Get full lesson content by slug. */
  getLesson: studentProcedure
    .input(z.object({ slug: z.string().min(1).max(150) }))
    .query(async ({ input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });

      const [row] = await dbConn.select().from(lessonUnits).where(eq(lessonUnits.slug, input.slug)).limit(1);
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });

      // Parse JSON fields
      const parseJSON = (val: string | null) => {
        if (val === null || val === undefined) return [];
        try { return JSON.parse(val); } catch { return []; }
      };

      // Lookup static competency mapping from lesson content definitions
      const staticUnit = LESSON_UNITS.find(u => u.slug === input.slug);

      return {
        ...row,
        objectives: parseJSON(row.objectives),
        keyPoints: parseJSON(row.keyPoints),
        commonMistakes: parseJSON(row.commonMistakes),
        knowledgeCheck: parseJSON(row.knowledgeCheck),
        aiTutorPrompts: parseJSON(row.aiTutorPrompts),
        linkedCompetencies: staticUnit?.linkedCompetencies ?? [],
      };
    }),

  /** Mark a lesson as complete, with optional quiz score. */
  completeLesson: studentProcedure
    .input(z.object({
      lessonSlug: z.string().min(1).max(150),
      pathwaySlug: z.string().min(1).max(100),
      level: z.enum(["beginner", "developing", "intermediate", "advanced"]),
      score: z.number().min(0).max(100).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });

      // Check if already completed
      const [existing] = await dbConn.select({ id: lessonCompletion.id })
        .from(lessonCompletion)
        .where(and(
          eq(lessonCompletion.studentUserId, ctx.user.id),
          eq(lessonCompletion.lessonSlug, input.lessonSlug),
        )).limit(1);

      if (existing) {
        // Update score if provided
        if (input.score !== undefined) {
          await dbConn.update(lessonCompletion)
            .set({ score: input.score })
            .where(eq(lessonCompletion.id, existing.id));
        }
        return { success: true, alreadyCompleted: true };
      }

      await dbConn.insert(lessonCompletion).values({
        studentUserId: ctx.user.id,
        lessonSlug: input.lessonSlug,
        pathwaySlug: input.pathwaySlug,
        level: input.level,
        score: input.score ?? null,
      });

      return { success: true, alreadyCompleted: false };
    }),

  /** Get lesson completion progress for the current student. */
  getLessonProgress: studentProcedure
    .query(async ({ ctx }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });

      const completions = await dbConn.select()
        .from(lessonCompletion)
        .where(eq(lessonCompletion.studentUserId, ctx.user.id))
        .orderBy(desc(lessonCompletion.completedAt));

      return completions;
    }),

  // ─────────────────────────────────────────────────────────────────────────
  // Phase 2 — Assigned Lessons, Competencies, Progress Intelligence
  // ─────────────────────────────────────────────────────────────────────────

  /** Get lessons assigned to this student by their teacher(s). */
  getAssignedLessons: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    // Find groups this student belongs to
    const memberships = await dbConn.select({ groupId: studentGroupMembers.groupId })
      .from(studentGroupMembers)
      .where(eq(studentGroupMembers.studentUserId, ctx.user.id));

    const groupIds = memberships.map(m => m.groupId);

    // Get assignments for this student directly or via group
    const directCondition = eq(teacherLessonAssignments.studentUserId, ctx.user.id);
    const studentCondition = groupIds.length > 0
      ? (or(directCondition, inArray(teacherLessonAssignments.groupId, groupIds)) ?? directCondition)
      : directCondition;

    const assignments = await dbConn.select()
      .from(teacherLessonAssignments)
      .where(and(eq(teacherLessonAssignments.isActive, true), studentCondition))
      .orderBy(teacherLessonAssignments.dueDate);

    // Get completion data to mark which are done
    const completions = await dbConn.select({ lessonSlug: lessonCompletion.lessonSlug })
      .from(lessonCompletion)
      .where(eq(lessonCompletion.studentUserId, ctx.user.id));

    const completedSlugs = new Set(completions.map(c => c.lessonSlug));
    const now = new Date();

    return assignments.map(a => ({
      ...a,
      isCompleted: a.assignmentType === "lesson" && a.lessonSlug ? completedSlugs.has(a.lessonSlug) : false,
      isOverdue: a.dueDate ? new Date(a.dueDate) < now : false,
    }));
  }),

  /** Get this student's competency records. */
  getMyCompetencies: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    return dbConn.select().from(studentCompetencies)
      .where(eq(studentCompetencies.userId, ctx.user.id))
      .orderBy(studentCompetencies.category, studentCompetencies.competencyKey);
  }),

  /** Get lesson reviews (teacher feedback) for this student. */
  getMyLessonReviews: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    return dbConn.select().from(lessonReviews)
      .where(eq(lessonReviews.studentUserId, ctx.user.id))
      .orderBy(desc(lessonReviews.createdAt));
  }),

  /** Mark a lesson review as read. */
  markReviewRead: studentProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const dbConn = await getDb();
      if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });
      await dbConn.update(lessonReviews)
        .set({ isRead: true })
        .where(and(eq(lessonReviews.id, input.reviewId), eq(lessonReviews.studentUserId, ctx.user.id)));
      return { success: true };
    }),

  /** Calculate intelligent progress across pathways, competencies, and skill areas. */
  getProgressIntelligence: studentProcedure.query(async ({ ctx }) => {
    const dbConn = await getDb();
    if (!dbConn) throw new TRPCError({ code: "SERVICE_UNAVAILABLE" });

    const TOTAL_LESSONS_PER_PATHWAY: Record<string, number> = {
      "horse-care-foundations": 7,
      "rider-foundations": 7,
      "stable-yard-safety": 6,
      "horse-behaviour-welfare": 7,
      "tack-equipment": 6,
      "developing-rider-skills": 8,
    };
    const TOTAL_LESSONS = Object.values(TOTAL_LESSONS_PER_PATHWAY).reduce((a, b) => a + b, 0);

    const [completions, competencies, skillProgress, reviews, assignments] = await Promise.all([
      dbConn.select().from(lessonCompletion).where(eq(lessonCompletion.studentUserId, ctx.user.id)),
      dbConn.select().from(studentCompetencies).where(eq(studentCompetencies.userId, ctx.user.id)),
      dbConn.select().from(studentProgress).where(eq(studentProgress.userId, ctx.user.id)),
      dbConn.select().from(lessonReviews).where(eq(lessonReviews.studentUserId, ctx.user.id)),
      dbConn.select().from(teacherLessonAssignments)
        .where(and(eq(teacherLessonAssignments.studentUserId, ctx.user.id), eq(teacherLessonAssignments.isActive, true))),
    ]);

    // Pathway completion %
    const completedByPathway = completions.reduce((acc, lc) => {
      acc[lc.pathwaySlug] = (acc[lc.pathwaySlug] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pathwayProgress = Object.entries(TOTAL_LESSONS_PER_PATHWAY).map(([slug, total]) => ({
      slug,
      completed: completedByPathway[slug] ?? 0,
      total,
      percent: Math.round(((completedByPathway[slug] ?? 0) / total) * 100),
    }));

    const overallLessonPercent = Math.round((completions.length / TOTAL_LESSONS) * 100);

    // Competency summary
    const achievedCompetencies = competencies.filter(c => c.status === "achieved").length;
    const needsSupportCompetencies = competencies.filter(c => c.status === "needs_support").length;
    const REQUIRED_COMPETENCIES = 17; // defined competency count
    const competencyPercent = Math.round((achievedCompetencies / REQUIRED_COMPETENCIES) * 100);

    // Weak areas — skill areas with lowest XP
    const sortedSkills = skillProgress.slice().sort((a, b) => a.xp - b.xp);
    const weakAreas = sortedSkills.slice(0, 3).map(s => s.skillArea.replace(/_/g, " "));

    // Category-based weak areas from competencies needing support
    const categoryWeakness: Record<string, number> = {};
    for (const c of competencies) {
      if (c.status === "needs_support") {
        categoryWeakness[c.category] = (categoryWeakness[c.category] ?? 0) + 1;
      }
    }
    const weakCategories = Object.entries(categoryWeakness)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Reviews with needs_improvement
    const needsImprovementLessons = reviews
      .filter(r => r.reviewStatus === "needs_improvement")
      .map(r => r.lessonSlug);

    // Recommended next lesson — first uncompleted lesson in order
    const completedSlugs = new Set(completions.map(c => c.lessonSlug));
    const orderedPathways = [
      "horse-care-foundations", "rider-foundations", "stable-yard-safety",
      "horse-behaviour-welfare", "tack-equipment", "developing-rider-skills",
    ];
    let recommendedNextPathway: string | null = null;
    for (const pw of orderedPathways) {
      if ((completedByPathway[pw] ?? 0) < (TOTAL_LESSONS_PER_PATHWAY[pw] ?? 0)) {
        recommendedNextPathway = pw;
        break;
      }
    }

    // Readiness status
    let readinessStatus: "ready_for_next_level" | "needs_support" | "focus_on_safety" | "focus_on_riding" | "focus_on_care";
    if (needsSupportCompetencies > 2 || needsImprovementLessons.length > 3) {
      readinessStatus = "needs_support";
    } else if (weakCategories.some(c => c.toLowerCase().includes("safety"))) {
      readinessStatus = "focus_on_safety";
    } else if (weakCategories.some(c => c.toLowerCase().includes("riding") || c.toLowerCase().includes("rider"))) {
      readinessStatus = "focus_on_riding";
    } else if (weakCategories.some(c => c.toLowerCase().includes("care") || c.toLowerCase().includes("handling"))) {
      readinessStatus = "focus_on_care";
    } else {
      readinessStatus = overallLessonPercent >= 70 && competencyPercent >= 50 ? "ready_for_next_level" : "needs_support";
    }

    // Unread reviews
    const unreadReviews = reviews.filter(r => !r.isRead);

    return {
      overallLessonPercent,
      pathwayProgress,
      competencies: {
        achieved: achievedCompetencies,
        total: REQUIRED_COMPETENCIES,
        percent: competencyPercent,
        needsSupport: needsSupportCompetencies,
      },
      weakAreas,
      weakCategories,
      needsImprovementLessons,
      recommendedNextPathway,
      readinessStatus,
      unreadReviewCount: unreadReviews.length,
      assignedLessonsCount: assignments.length,
    };
  }),
});
