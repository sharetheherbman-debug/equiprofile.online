/**
 * Training Templates Seed Data
 *
 * This file contains 5 curated training programs that will be seeded as public templates.
 * Each template includes detailed weekly schedules with exercises, duration, and intensity.
 */

import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { trainingProgramTemplates } from "../../drizzle/schema";

export const TRAINING_TEMPLATES = [
  {
    name: "General Conditioning",
    description: "A 4-week foundation program to build overall fitness, stamina, and muscle tone. Ideal for horses returning to work or starting a new routine.",
    duration: 4,
    discipline: "general",
    level: "beginner",
    goals: "Build cardiovascular fitness, develop muscle tone, establish consistent work routine, improve suppleness",
    isPublic: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1, focus: "Gentle introduction to regular work",
          sessions: [
            { day: "Monday", type: "Walk", duration: 30, description: "Relaxed walk focusing on rhythm and forward movement.", intensity: "low" },
            { day: "Tuesday", type: "Rest/Turnout", duration: 0, description: "Free turnout or hand walking.", intensity: "none" },
            { day: "Wednesday", type: "Walk/Trot", duration: 35, description: "20 mins walk, 3-5 mins trot in short intervals.", intensity: "low" },
            { day: "Thursday", type: "Rest/Turnout", duration: 0, description: "Free turnout.", intensity: "none" },
            { day: "Friday", type: "Walk", duration: 35, description: "Relaxed walk on varied terrain.", intensity: "low" },
            { day: "Saturday", type: "Walk/Trot", duration: 40, description: "25 mins walk, 5-8 mins trot.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Complete rest day.", intensity: "none" },
          ],
        },
        {
          week: 2, focus: "Increase trot work and introduce basic exercises",
          sessions: [
            { day: "Monday", type: "Walk/Trot", duration: 40, description: "20 mins walk, 10 mins trot with large circles.", intensity: "low-moderate" },
            { day: "Tuesday", type: "Rest/Turnout", duration: 0, description: "Free turnout.", intensity: "none" },
            { day: "Wednesday", type: "Trot/Canter", duration: 40, description: "15 mins trot, introduce 2-3 short canter transitions.", intensity: "moderate" },
            { day: "Thursday", type: "Rest/Turnout", duration: 0, description: "Free turnout.", intensity: "none" },
            { day: "Friday", type: "Trot Work", duration: 40, description: "Steady trot work with serpentines and changes of rein.", intensity: "moderate" },
            { day: "Saturday", type: "Hack/Trail", duration: 45, description: "Relaxed hack to encourage relaxation and fitness.", intensity: "low-moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Complete rest.", intensity: "none" },
          ],
        },
        {
          week: 3, focus: "Build strength and introduce canter work",
          sessions: [
            { day: "Monday", type: "Flatwork", duration: 45, description: "Transitions, circles, 10 mins canter each rein.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest/Turnout", duration: 0, description: "Free turnout.", intensity: "none" },
            { day: "Wednesday", type: "Trot/Canter", duration: 45, description: "Ground poles, transitions, strengthening exercises.", intensity: "moderate" },
            { day: "Thursday", type: "Rest/Turnout", duration: 0, description: "Light hand walk or turnout.", intensity: "none" },
            { day: "Friday", type: "Flatwork", duration: 45, description: "Lengthened strides, lateral movements intro.", intensity: "moderate" },
            { day: "Saturday", type: "Hill Work/Hack", duration: 50, description: "Include hills for building hindquarter strength.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Complete rest.", intensity: "none" },
          ],
        },
        {
          week: 4, focus: "Consolidate fitness and assess progress",
          sessions: [
            { day: "Monday", type: "Flatwork", duration: 50, description: "Full flatwork session, test all gaits and transitions.", intensity: "moderate-high" },
            { day: "Tuesday", type: "Rest/Turnout", duration: 0, description: "Free turnout.", intensity: "none" },
            { day: "Wednesday", type: "Interval Training", duration: 50, description: "Trot/canter intervals to build fitness.", intensity: "moderate-high" },
            { day: "Thursday", type: "Rest/Turnout", duration: 0, description: "Active recovery — hand walk.", intensity: "none" },
            { day: "Friday", type: "Flatwork", duration: 45, description: "Suppling exercises, lateral work, good transitions.", intensity: "moderate" },
            { day: "Saturday", type: "Assessment Ride", duration: 55, description: "Assess progress over 4 weeks. Note improvements.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Complete rest.", intensity: "none" },
          ],
        },
      ],
    }),
  },
  {
    name: "Flatwork Foundation",
    description: "A 4-week program focused on establishing rhythm, contact, and suppleness through progressive flatwork exercises. Suitable for beginner-intermediate horse and rider combinations.",
    duration: 4,
    discipline: "flatwork",
    level: "beginner-intermediate",
    goals: "Establish consistent rhythm, develop soft contact, improve lateral suppleness, introduce leg-yielding and shoulder-in",
    isPublic: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1, focus: "Rhythm and relaxation",
          sessions: [
            { day: "Monday", type: "Rhythm Work", duration: 40, description: "Focus on consistent rhythm in walk and trot. Use 20m circles.", intensity: "low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest or light turnout.", intensity: "none" },
            { day: "Wednesday", type: "Contact Work", duration: 40, description: "Establish soft, consistent contact. Transitions walk-trot-walk.", intensity: "low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Suppling", duration: 45, description: "Serpentines, loops, 10m circles to encourage bend.", intensity: "low-moderate" },
            { day: "Saturday", type: "Free Ride", duration: 40, description: "Relaxed ride maintaining rhythm.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 2, focus: "Transitions and bend",
          sessions: [
            { day: "Monday", type: "Transitions", duration: 45, description: "Walk-trot-canter transitions, focus on prompt responses.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest or turnout.", intensity: "none" },
            { day: "Wednesday", type: "Bend and Flexion", duration: 45, description: "Shoulder-fore, leg yield intro along long side.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Canter Work", duration: 45, description: "Canter 20m circles, transitions within gait.", intensity: "moderate" },
            { day: "Saturday", type: "Full Session", duration: 50, description: "Combine rhythm, transitions, and bend in one session.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 3, focus: "Lateral work introduction",
          sessions: [
            { day: "Monday", type: "Leg Yield", duration: 45, description: "Leg yield from centre line to track and back.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Shoulder-In", duration: 45, description: "Introduce shoulder-in in walk and trot.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Combined Lateral", duration: 50, description: "Leg yield, shoulder-fore, transitions. Reward lightness.", intensity: "moderate" },
            { day: "Saturday", type: "Hack", duration: 40, description: "Relaxed hack for mental break.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 4, focus: "Consolidation and forwardness",
          sessions: [
            { day: "Monday", type: "Lengthening", duration: 50, description: "Introduce medium trot, lengthen strides on long sides.", intensity: "moderate-high" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Full Flatwork", duration: 50, description: "Full test including all lateral work, transitions, and gaits.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Collection", duration: 45, description: "Introduce collection with half-halts in trot and canter.", intensity: "moderate" },
            { day: "Saturday", type: "Assessment", duration: 50, description: "Assess all week 1-4 skills. Note what to develop further.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
      ],
    }),
  },
  {
    name: "Show Jumping Progression",
    description: "A 6-week jumping programme building from grid work and gymnastics to riding full courses. Designed for intermediate riders with a basic jumping foundation.",
    duration: 6,
    discipline: "jumping",
    level: "intermediate",
    goals: "Improve jumping technique, develop horse's scope and confidence, introduce related distances, ride full courses fluently",
    isPublic: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1, focus: "Grid work and trot poles",
          sessions: [
            { day: "Monday", type: "Flatwork", duration: 45, description: "Gymnastic flatwork: transitions, suppleness, forward canter.", intensity: "moderate" },
            { day: "Tuesday", type: "Trot Poles", duration: 40, description: "Trot poles in a straight line and fan shape.", intensity: "low-moderate" },
            { day: "Wednesday", type: "Rest", duration: 0, description: "Rest or light turnout.", intensity: "none" },
            { day: "Thursday", type: "Grid Work", duration: 45, description: "Simple bounce grid: 2 trot poles to cross-pole oxer.", intensity: "moderate" },
            { day: "Friday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Saturday", type: "Grid + Single", duration: 50, description: "Grid work followed by single upright at 60cm.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 2, focus: "Building grid height and oxers",
          sessions: [
            { day: "Monday", type: "Flatwork", duration: 45, description: "Collection and lengthening to develop scopey jump.", intensity: "moderate" },
            { day: "Tuesday", type: "Gymnastics", duration: 45, description: "3-fence grid: trot poles – cross pole – upright – oxer.", intensity: "moderate" },
            { day: "Wednesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Thursday", type: "Related Fences", duration: 50, description: "Introduce 4-stride related distance between two uprights.", intensity: "moderate" },
            { day: "Friday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Saturday", type: "Course Work", duration: 55, description: "Small 5-fence course at 70-75cm, focusing on rhythm.", intensity: "moderate-high" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 3, focus: "Distances and turns",
          sessions: [
            { day: "Monday", type: "Flatwork", duration: 45, description: "Sharp canter transitions, counter-canter circles.", intensity: "moderate" },
            { day: "Tuesday", type: "Distances", duration: 50, description: "Various related distances: 3, 4, 5 strides.", intensity: "moderate" },
            { day: "Wednesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Thursday", type: "Tight Turns", duration: 50, description: "Practice riding tight turns between fences.", intensity: "moderate-high" },
            { day: "Friday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Saturday", type: "Course 80cm", duration: 55, description: "Course work at 80cm, two changes of rein, double combination.", intensity: "high" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 4, focus: "Confidence and scope building",
          sessions: [
            { day: "Monday", type: "Gymnastics", duration: 50, description: "Wider oxers and ascending oxers in grid.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Water/Fillers", duration: 50, description: "Introduce coloured fillers and novelty fences.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Course 85cm", duration: 55, description: "Full course at 85cm, focus on rhythm throughout.", intensity: "high" },
            { day: "Saturday", type: "Rest", duration: 0, description: "Recovery day.", intensity: "none" },
            { day: "Sunday", type: "Light Hack", duration: 35, description: "Relaxed hack.", intensity: "low" },
          ],
        },
        {
          week: 5, focus: "Competition preparation",
          sessions: [
            { day: "Monday", type: "Flatwork", duration: 45, description: "Quality flatwork, suppleness before jumping week.", intensity: "moderate" },
            { day: "Tuesday", type: "Grid Refresher", duration: 45, description: "Quick grid session to sharpen technique.", intensity: "moderate" },
            { day: "Wednesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Thursday", type: "Practice Round", duration: 55, description: "Simulate competition: full course, one round only.", intensity: "high" },
            { day: "Friday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Saturday", type: "Competition/Test", duration: 60, description: "Competition or test day at target height (90-100cm).", intensity: "high" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Complete rest after competition.", intensity: "none" },
          ],
        },
        {
          week: 6, focus: "Consolidation and assessment",
          sessions: [
            { day: "Monday", type: "Light Flatwork", duration: 40, description: "Relaxed flatwork to recover and maintain fitness.", intensity: "low" },
            { day: "Tuesday", type: "Gymnastics", duration: 45, description: "Revisit grid work, refine technique from competition feedback.", intensity: "moderate" },
            { day: "Wednesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Thursday", type: "Course Work", duration: 50, description: "Final assessment course at target height.", intensity: "moderate-high" },
            { day: "Friday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Saturday", type: "Review Session", duration: 45, description: "Review and plan next training phase.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
      ],
    }),
  },
  {
    name: "Dressage Development",
    description: "A 6-week programme developing collection, engagement, and more advanced movements including half-pass and pirouette preparation. For intermediate dressage horse and rider.",
    duration: 6,
    discipline: "dressage",
    level: "intermediate",
    goals: "Develop collection and self-carriage, introduce half-pass, improve canter quality, prepare for pirouette movements",
    isPublic: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1, focus: "Establishing collection",
          sessions: [
            { day: "Monday", type: "Collection", duration: 50, description: "Half-halts to develop collection in trot. Shoulder-in on circle.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Travers/Renvers", duration: 50, description: "Introduce travers (haunches-in) in walk and trot.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Canter Work", duration: 50, description: "Collected canter, counter-canter loops, simple changes.", intensity: "moderate" },
            { day: "Saturday", type: "Full Session", duration: 55, description: "Full training session linking all movements.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 2, focus: "Half-pass introduction",
          sessions: [
            { day: "Monday", type: "Leg Yield to Half-Pass", duration: 50, description: "Transition from leg yield to half-pass in trot.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Half-Pass Trot", duration: 50, description: "Half-pass in both directions, maintain bend.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Flying Changes Prep", duration: 50, description: "Simple changes through walk. Counter-canter serpentines.", intensity: "moderate" },
            { day: "Saturday", type: "Combined Work", duration: 55, description: "Combine half-pass with collected trot movements.", intensity: "moderate-high" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 3, focus: "Engagement and impulsion",
          sessions: [
            { day: "Monday", type: "Piaffe Preparation", duration: 50, description: "Collected trot with increased engagement, slow rhythm.", intensity: "moderate-high" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Passage Intro", duration: 50, description: "Transition between collected and extended trot for spring.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Half-Pass Canter", duration: 50, description: "Begin half-pass in canter, smaller angles initially.", intensity: "moderate-high" },
            { day: "Saturday", type: "Test Simulation", duration: 55, description: "Ride movements in test-like sequence.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 4, focus: "Pirouette preparation",
          sessions: [
            { day: "Monday", type: "Walk Pirouette", duration: 50, description: "Collected walk pirouettes both directions.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Canter Pirouette Prep", duration: 50, description: "Small canter circles 6m, haunches-in canter.", intensity: "moderate-high" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Flying Changes", duration: 50, description: "First flying change attempts with good preparation.", intensity: "moderate-high" },
            { day: "Saturday", type: "Full Session", duration: 60, description: "Full dressage session linking all new work.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 5, focus: "Competition preparation",
          sessions: [
            { day: "Monday", type: "Flatwork", duration: 50, description: "Suppling warm-up, all movements at quality.", intensity: "moderate" },
            { day: "Tuesday", type: "Test Riding", duration: 55, description: "Ride competition test movements in order.", intensity: "moderate-high" },
            { day: "Wednesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Thursday", type: "Refinement", duration: 50, description: "Focus on weakest areas from test riding.", intensity: "moderate" },
            { day: "Friday", type: "Light Work", duration: 40, description: "Light, relaxed schooling before competition.", intensity: "low" },
            { day: "Saturday", type: "Competition", duration: 60, description: "Competition day.", intensity: "high" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 6, focus: "Consolidation",
          sessions: [
            { day: "Monday", type: "Light Hack", duration: 40, description: "Recovery hack, mental break from arena.", intensity: "low" },
            { day: "Tuesday", type: "Flatwork", duration: 50, description: "Maintain all movements, light and forward.", intensity: "moderate" },
            { day: "Wednesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Thursday", type: "Full Test", duration: 55, description: "Final assessment — ride test and assess marks.", intensity: "moderate" },
            { day: "Friday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Saturday", type: "Review & Plan", duration: 45, description: "Review progress and set goals for next phase.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
      ],
    }),
  },
  {
    name: "Active Warmup & Cooldown",
    description: "A repeatable daily routine (1 week template) providing structured 30-45 minute warmup and cooldown protocols. Use before and after every training session.",
    duration: 1,
    discipline: "general",
    level: "all-levels",
    goals: "Prevent injury, improve muscle readiness, aid recovery, establish consistent daily routine",
    isPublic: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1, focus: "Daily warmup and cooldown routine — repeat each week",
          sessions: [
            { day: "Warmup Protocol", type: "Warmup", duration: 15, description: "5 mins walk on long rein → 5 mins rising trot large circles → 5 mins working trot with transitions. Horse should be forward and relaxed before main session.", intensity: "low" },
            { day: "Cooldown Protocol", type: "Cooldown", duration: 15, description: "5 mins working trot → 5 mins walk on long rein → 5 mins walk on a loose rein. Check temperature and pulse before returning to stable.", intensity: "low" },
            { day: "Monday", type: "Full Routine", duration: 45, description: "Warmup 15 mins → 15 mins training → Cooldown 15 mins.", intensity: "low-moderate" },
            { day: "Tuesday", type: "Full Routine", duration: 45, description: "Warmup 15 mins → 15 mins training → Cooldown 15 mins.", intensity: "low-moderate" },
            { day: "Wednesday", type: "Rest or Light", duration: 20, description: "Hand walk 10 mins or light warmup only — active recovery.", intensity: "low" },
            { day: "Thursday", type: "Full Routine", duration: 45, description: "Warmup 15 mins → 15 mins training → Cooldown 15 mins.", intensity: "low-moderate" },
            { day: "Friday", type: "Full Routine", duration: 45, description: "Warmup 15 mins → 15 mins training → Cooldown 15 mins.", intensity: "low-moderate" },
            { day: "Saturday", type: "Extended Warmup", duration: 55, description: "Extended warmup 20 mins → 20 mins training → Cooldown 15 mins.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest day — no riding.", intensity: "none" },
          ],
        },
      ],
    }),
  },
  {
    name: "Rehabilitation Return to Work",
    description: "An 8-week graduated return-to-work programme following injury or extended rest. Progresses from walk-only through trot and canter with careful rest days to prevent re-injury.",
    duration: 8,
    discipline: "rehab",
    level: "post-injury",
    goals: "Safe return to work, rebuild fitness gradually, prevent re-injury, restore muscle strength and suppleness",
    isPublic: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1, focus: "Walk only — 15-20 mins",
          sessions: [
            { day: "Monday", type: "Walk", duration: 15, description: "Gentle walk on firm, even ground. Monitor for heat or swelling.", intensity: "very-low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Observe. Ice/cold hose as directed by vet.", intensity: "none" },
            { day: "Wednesday", type: "Walk", duration: 15, description: "Gentle walk. Check legs thoroughly after.", intensity: "very-low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Walk", duration: 20, description: "Extend to 20 mins if no adverse reaction.", intensity: "very-low" },
            { day: "Saturday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 2, focus: "Walk — 20-30 mins",
          sessions: [
            { day: "Monday", type: "Walk", duration: 25, description: "Steady walk. Note any changes in way of going.", intensity: "very-low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Walk", duration: 25, description: "Walk including gentle turns and changes of rein.", intensity: "very-low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Walk", duration: 30, description: "30 mins walk. If sound, prepare to introduce trot next week.", intensity: "very-low" },
            { day: "Saturday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 3, focus: "Introduce trot — short intervals",
          sessions: [
            { day: "Monday", type: "Walk/Trot", duration: 25, description: "20 mins walk, 1-2 mins trot x2. Confirm soundness each transition.", intensity: "low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest. Monitor legs.", intensity: "none" },
            { day: "Wednesday", type: "Walk/Trot", duration: 30, description: "25 mins walk, 2 mins trot x2 intervals.", intensity: "low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Walk/Trot", duration: 30, description: "20 mins walk, 3-4 mins trot total. Large circles only.", intensity: "low" },
            { day: "Saturday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 4, focus: "Build trot duration",
          sessions: [
            { day: "Monday", type: "Trot Work", duration: 35, description: "15 mins walk, 10 mins trot in intervals. Assess comfort.", intensity: "low-moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Trot Work", duration: 35, description: "10 mins walk, 15 mins trot. Monitor recovery time.", intensity: "low-moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Trot Work", duration: 40, description: "10 mins walk, 20 mins trot. Introduce gentle circles.", intensity: "low-moderate" },
            { day: "Saturday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 5, focus: "Introduce canter — short intervals",
          sessions: [
            { day: "Monday", type: "Trot", duration: 40, description: "Steady trot, confirm full soundness before canter phase.", intensity: "low-moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Trot/Canter", duration: 40, description: "20 mins trot, 1 min canter x2 on large circle. Observe carefully.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Trot/Canter", duration: 40, description: "15 mins trot, 2 mins canter x2. Increase only if fully comfortable.", intensity: "moderate" },
            { day: "Saturday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 6, focus: "Build canter and confidence",
          sessions: [
            { day: "Monday", type: "Canter Work", duration: 45, description: "20 mins trot, 5 mins canter total in intervals.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Canter Work", duration: 45, description: "15 mins trot, 8 mins canter, large circles both reins.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Hack", duration: 40, description: "Light hack, walk and trot only. Change of scenery.", intensity: "low-moderate" },
            { day: "Saturday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 7, focus: "Consolidate fitness",
          sessions: [
            { day: "Monday", type: "Full Flatwork", duration: 50, description: "Normal flatwork session. All gaits. Note quality of work.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest/Turnout", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Flatwork", duration: 50, description: "Suppling, transitions, light lateral work.", intensity: "moderate" },
            { day: "Thursday", type: "Rest/Turnout", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Hack", duration: 50, description: "Hack including trot and short canter on good ground.", intensity: "moderate" },
            { day: "Saturday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 8, focus: "Return to full work — final assessment",
          sessions: [
            { day: "Monday", type: "Full Work", duration: 55, description: "Full training session at normal intensity. Assess fitness.", intensity: "moderate-high" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Full Work", duration: 55, description: "Discipline-specific training session.", intensity: "moderate-high" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Vet Check", duration: 30, description: "Schedule vet/physio assessment to confirm full return to work.", intensity: "low" },
            { day: "Saturday", type: "Normal Session", duration: 55, description: "Normal training session. Rehab programme complete.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
      ],
    }),
  },
  {
    name: "Young Horse Foundation",
    description: "An 8-week introduction programme for young horses (3-4 years). Covers lunging, first rides, desensitisation, and establishing basic gaits with patience and consistency.",
    duration: 8,
    discipline: "general",
    level: "young-horse",
    goals: "Build trust and confidence, establish lunging, introduce rider weight, develop walk-trot-canter, desensitise to common stimuli",
    isPublic: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1, focus: "Groundwork and lunging introduction",
          sessions: [
            { day: "Monday", type: "Groundwork", duration: 20, description: "Leading, standing, and basic handling. Introduce lunge caveson.", intensity: "very-low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest. Observe horse in field.", intensity: "none" },
            { day: "Wednesday", type: "Lunging Intro", duration: 15, description: "First lunge session: walk only on large circle. Keep calm and short.", intensity: "very-low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Lunging", duration: 20, description: "Walk lunge both reins. Reward calmness.", intensity: "very-low" },
            { day: "Saturday", type: "Groundwork", duration: 20, description: "Continue handling: rugging, picking hooves, tying up.", intensity: "very-low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 2, focus: "Introducing trot on lunge and basic voice commands",
          sessions: [
            { day: "Monday", type: "Lunge Walk/Trot", duration: 20, description: "Walk then short trot intervals. Voice command 'trot on'.", intensity: "low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Lunging", duration: 20, description: "Walk-trot-walk transitions on lunge. Both reins.", intensity: "low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Desensitisation", duration: 20, description: "Introduce tarpaulin, umbrellas, and plastic bags at safe distance.", intensity: "very-low" },
            { day: "Saturday", type: "Lunging", duration: 25, description: "Longer trot intervals. Relaxed and rhythmical gait.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 3, focus: "Introducing tack — saddle and bridle",
          sessions: [
            { day: "Monday", type: "Tack Introduction", duration: 20, description: "Introduce saddle and girth slowly. Reward calm behaviour.", intensity: "very-low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Lunge with Saddle", duration: 25, description: "Lunge with saddle and stirrups flapping. Assess reaction.", intensity: "low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Bridle and Bit", duration: 20, description: "Introduce bridle and bit. Allow horse to relax.", intensity: "very-low" },
            { day: "Saturday", type: "Full Tack Lunge", duration: 25, description: "Lunge with full tack. Walk and trot both reins.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 4, focus: "First rider weight — backing",
          sessions: [
            { day: "Monday", type: "Backing Prep", duration: 20, description: "Lay over horse's back (leaning), increase weight gradually with experienced handler.", intensity: "low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "First Sit", duration: 20, description: "Experienced lightweight rider sits briefly in saddle, horse led in walk.", intensity: "low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Walk with Rider", duration: 20, description: "Short walk with rider. Led by handler. Reward calmness.", intensity: "low" },
            { day: "Saturday", type: "Walk with Rider", duration: 25, description: "Continue walking with rider, introduce gentle steering.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 5, focus: "Independent walk and steering",
          sessions: [
            { day: "Monday", type: "Ridden Walk", duration: 25, description: "Walk around arena independently. Steering and halt.", intensity: "low" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Ridden Walk", duration: 25, description: "Large circles, centre line, changes of rein in walk.", intensity: "low" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Walk/Intro Trot", duration: 25, description: "Walk with a few trot steps. Let horse find balance with rider.", intensity: "low" },
            { day: "Saturday", type: "Lunge + Ride", duration: 30, description: "5 mins lunge then 20 mins ridden walk and short trot.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 6, focus: "Developing trot",
          sessions: [
            { day: "Monday", type: "Ridden Trot", duration: 30, description: "20 mins walk, 5-8 mins trot. Encourage rhythm.", intensity: "low-moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Trot Work", duration: 30, description: "Trot circles and straight lines. Avoid overworking.", intensity: "low-moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Desensitisation Ride", duration: 25, description: "Ride near distractions: traffic cones, poles, coloured boards.", intensity: "low" },
            { day: "Saturday", type: "Hack Lead-Rein", duration: 30, description: "First hack out, led by experienced horse and rider.", intensity: "low" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 7, focus: "Introducing canter",
          sessions: [
            { day: "Monday", type: "Trot Work", duration: 35, description: "Quality trot session. Horse relaxed and forward.", intensity: "low-moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "First Canter", duration: 30, description: "Allow first canter in rising trot, then ask for canter on large circle. Keep session short.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Canter Both Reins", duration: 35, description: "Short canter each rein. Praise effort and calmness.", intensity: "moderate" },
            { day: "Saturday", type: "Hack", duration: 35, description: "Hack including walk and trot. Broaden experience.", intensity: "low-moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
          ],
        },
        {
          week: 8, focus: "Consolidation and future goals",
          sessions: [
            { day: "Monday", type: "All Gaits", duration: 40, description: "Full walk-trot-canter session. Assess quality and relaxation.", intensity: "moderate" },
            { day: "Tuesday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Wednesday", type: "Flatwork", duration: 40, description: "Circles, transitions, start to develop basic bend.", intensity: "moderate" },
            { day: "Thursday", type: "Rest", duration: 0, description: "Rest.", intensity: "none" },
            { day: "Friday", type: "Hack", duration: 40, description: "Solo or led hack. Build confidence in varied environments.", intensity: "low-moderate" },
            { day: "Saturday", type: "Assessment", duration: 45, description: "Final assessment ride. Note key strengths and areas to develop.", intensity: "moderate" },
            { day: "Sunday", type: "Rest", duration: 0, description: "Rest. Programme complete — plan next 8-week phase.", intensity: "none" },
          ],
        },
      ],
    }),
  },
];

/**
 * Seed training templates into the database
 * This function is idempotent - it will only insert templates that don't already exist
 */
export async function seedTrainingTemplates() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    return;
  }

  console.log("🌱 Seeding training templates...");

  let insertedCount = 0;
  let skippedCount = 0;

  for (const template of TRAINING_TEMPLATES) {
    try {
      // Check if template with this name already exists (for any user)
      const existing = await db
        .select()
        .from(trainingProgramTemplates)
        .where(eq(trainingProgramTemplates.name, template.name))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Skipped: "${template.name}" (already exists)`);
        skippedCount++;
        continue;
      }

      // Insert template with userId 1 (admin/system user)
      await db.insert(trainingProgramTemplates).values({
        ...template,
        userId: 1, // System/admin user
      });

      console.log(`✅ Created: "${template.name}"`);
      insertedCount++;
    } catch (error: any) {
      console.error(`❌ Error creating "${template.name}":`, error.message);
    }
  }

  console.log(`\n✨ Seeding complete!`);
  console.log(`   Inserted: ${insertedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total: ${TRAINING_TEMPLATES.length}`);
}

// Allow running this script directly
if (require.main === module) {
  seedTrainingTemplates()
    .then(() => {
      console.log("\n✅ Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Error:", error);
      process.exit(1);
    });
}
