import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Play,
  Globe,
  Lock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

// Predesigned training templates with week 1 program data
// Note: These templates provide week 1 as a starter. Users can extend
// them by adding additional weeks based on the established pattern.
const PREDESIGNED_TEMPLATES = [
  {
    id: "flatwork",
    name: "Flatwork Session",
    description:
      "Foundation flatwork training focusing on rhythm, suppleness, and connection",
    duration: 4,
    discipline: "general",
    level: "beginner",
    goals: "Develop basic flatwork skills, improve rhythm and balance",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Establishing rhythm and relaxation",
          sessions: [
            {
              day: "Monday",
              type: "flatwork",
              duration: 30,
              description: "Walk and trot work focusing on rhythm",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "rest",
              duration: 0,
              description: "Rest day - turnout",
              intensity: "none",
            },
            {
              day: "Wednesday",
              type: "flatwork",
              duration: 35,
              description: "Circles and transitions",
              intensity: "low",
            },
            {
              day: "Thursday",
              type: "rest",
              duration: 0,
              description: "Light hack or turnout",
              intensity: "none",
            },
            {
              day: "Friday",
              type: "flatwork",
              duration: 40,
              description: "Serpentines and changes of direction",
              intensity: "low-moderate",
            },
            {
              day: "Saturday",
              type: "flatwork",
              duration: 45,
              description: "Review week's work",
              intensity: "low-moderate",
            },
            {
              day: "Sunday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "jumping",
    name: "Jumping Session",
    description:
      "Progressive jumping training from ground poles to small fences",
    duration: 6,
    discipline: "jumping",
    level: "intermediate",
    goals: "Build confidence over fences, improve jumping technique and style",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Ground poles and rhythm",
          sessions: [
            {
              day: "Monday",
              type: "flatwork",
              duration: 30,
              description: "Flatwork warm-up",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "jumping",
              duration: 40,
              description: "Ground poles in trot",
              intensity: "moderate",
            },
            {
              day: "Wednesday",
              type: "rest",
              duration: 0,
              description: "Rest or light hack",
              intensity: "none",
            },
            {
              day: "Thursday",
              type: "flatwork",
              duration: 35,
              description: "Canter work",
              intensity: "moderate",
            },
            {
              day: "Friday",
              type: "jumping",
              duration: 45,
              description: "Small cross-poles",
              intensity: "moderate",
            },
            {
              day: "Saturday",
              type: "rest",
              duration: 0,
              description: "Turnout",
              intensity: "none",
            },
            {
              day: "Sunday",
              type: "jumping",
              duration: 40,
              description: "Grid work",
              intensity: "moderate",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "dressage",
    name: "Dressage Session",
    description:
      "Classical dressage training emphasizing precision and collection",
    duration: 8,
    discipline: "dressage",
    level: "intermediate",
    goals: "Improve collection, lateral work, and test accuracy",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Establishing the basics",
          sessions: [
            {
              day: "Monday",
              type: "flatwork",
              duration: 45,
              description: "Walk, trot, canter transitions",
              intensity: "moderate",
            },
            {
              day: "Tuesday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
            {
              day: "Wednesday",
              type: "flatwork",
              duration: 50,
              description: "Lateral work introduction",
              intensity: "moderate",
            },
            {
              day: "Thursday",
              type: "hack",
              duration: 30,
              description: "Light hack",
              intensity: "low",
            },
            {
              day: "Friday",
              type: "flatwork",
              duration: 45,
              description: "Test practice",
              intensity: "moderate",
            },
            {
              day: "Saturday",
              type: "rest",
              duration: 0,
              description: "Turnout",
              intensity: "none",
            },
            {
              day: "Sunday",
              type: "flatwork",
              duration: 40,
              description: "Review and polish",
              intensity: "moderate",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "conditioning",
    name: "Conditioning Session",
    description:
      "Fitness and stamina building for all-around horse development",
    duration: 6,
    discipline: "general",
    level: "beginner",
    goals:
      "Build cardiovascular fitness, muscle tone, and overall conditioning",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Building base fitness",
          sessions: [
            {
              day: "Monday",
              type: "walk",
              duration: 30,
              description: "Walk work only",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "hack",
              duration: 40,
              description: "Walk and trot hack",
              intensity: "low-moderate",
            },
            {
              day: "Wednesday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
            {
              day: "Thursday",
              type: "flatwork",
              duration: 35,
              description: "Trot work",
              intensity: "moderate",
            },
            {
              day: "Friday",
              type: "rest",
              duration: 0,
              description: "Light turnout",
              intensity: "none",
            },
            {
              day: "Saturday",
              type: "hack",
              duration: 45,
              description: "Longer hack with hills",
              intensity: "moderate",
            },
            {
              day: "Sunday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "warmup",
    name: "Warmup Session",
    description: "Essential warmup routine before training or competition",
    duration: 2,
    discipline: "general",
    level: "beginner",
    goals: "Prepare horse physically and mentally for work",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Standard warmup protocol",
          sessions: [
            {
              day: "Monday",
              type: "walk",
              duration: 15,
              description:
                "Walk on long rein - 10 min, then working walk - 5 min",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "flatwork",
              duration: 20,
              description: "Progressive trot work",
              intensity: "low-moderate",
            },
            {
              day: "Wednesday",
              type: "flatwork",
              duration: 20,
              description: "Canter warmup",
              intensity: "moderate",
            },
            {
              day: "Thursday",
              type: "walk",
              duration: 15,
              description: "Pre-jumping warmup",
              intensity: "low",
            },
            {
              day: "Friday",
              type: "flatwork",
              duration: 20,
              description: "Competition day warmup",
              intensity: "moderate",
            },
            {
              day: "Saturday",
              type: "walk",
              duration: 15,
              description: "Gentle warmup",
              intensity: "low",
            },
            {
              day: "Sunday",
              type: "rest",
              duration: 0,
              description: "Rest",
              intensity: "none",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "rehab",
    name: "Rehab Session",
    description:
      "Gentle rehabilitation program for horses returning from injury",
    duration: 8,
    discipline: "general",
    level: "beginner",
    goals: "Safe return to work, rebuild strength and confidence",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Gentle reintroduction to work",
          sessions: [
            {
              day: "Monday",
              type: "walk",
              duration: 15,
              description: "Walk in hand or under saddle",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
            {
              day: "Wednesday",
              type: "walk",
              duration: 20,
              description: "Walk work only",
              intensity: "low",
            },
            {
              day: "Thursday",
              type: "rest",
              duration: 0,
              description: "Turnout only",
              intensity: "none",
            },
            {
              day: "Friday",
              type: "walk",
              duration: 20,
              description: "Walk with gentle stretching",
              intensity: "low",
            },
            {
              day: "Saturday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
            {
              day: "Sunday",
              type: "walk",
              duration: 25,
              description: "Longer walk",
              intensity: "low",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "young-horse",
    name: "Young Horse Basics",
    description:
      "Progressive foundation program for young horses in early development (3–5 year olds)",
    duration: 12,
    discipline: "general",
    level: "beginner",
    goals:
      "Foundation training, build confidence, develop basic skills under saddle",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Building confidence and trust",
          warmup:
            "10 min in-hand walking around arena, introducing new sights and sounds",
          main_work:
            "Short groundwork sessions, gentle lunging, accepting tack",
          cooldown:
            "5 min walking on long rein, gentle grooming and positive reinforcement",
          safety_notes:
            "Keep sessions short (15–20 min). Never rush. End on a positive note.",
          sessions: [
            {
              day: "Monday",
              type: "groundwork",
              duration: 20,
              description:
                "Groundwork and handling — leading, halting, backing",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "rest",
              duration: 0,
              description: "Turnout — allow free movement",
              intensity: "none",
            },
            {
              day: "Wednesday",
              type: "walk",
              duration: 15,
              description: "Walk work — lead or first ridden steps",
              intensity: "low",
            },
            {
              day: "Thursday",
              type: "groundwork",
              duration: 20,
              description: "Lunging basics — circles on lunge line",
              intensity: "low",
            },
            {
              day: "Friday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
            {
              day: "Saturday",
              type: "walk",
              duration: 20,
              description: "Walk with new objects, desensitisation",
              intensity: "low",
            },
            {
              day: "Sunday",
              type: "rest",
              duration: 0,
              description: "Free time / turnout",
              intensity: "none",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "schooling",
    name: "Schooling / Arena Session",
    description:
      "Focused arena schooling session developing suppleness, obedience, and collection",
    duration: 4,
    discipline: "general",
    level: "intermediate",
    goals:
      "Improve responsiveness, establish rhythm, develop throughness and engagement",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Rhythm, relaxation, and contact",
          warmup:
            "10 min walk on a long rein, progressing to working walk. 5 min rising trot both reins.",
          main_work:
            "20 min focused schooling: transitions, serpentines, leg yields, lengthening and shortening strides.",
          cooldown:
            "5 min walk on a long rein, stretching down. Finish with praise.",
          safety_notes:
            "Warm up thoroughly before asking for collection. Check footing before work.",
          sessions: [
            {
              day: "Monday",
              type: "flatwork",
              duration: 40,
              description: "Walk/trot transitions, working on bend and rhythm",
              intensity: "moderate",
            },
            {
              day: "Tuesday",
              type: "hack",
              duration: 30,
              description: "Light hack — mental break from arena",
              intensity: "low",
            },
            {
              day: "Wednesday",
              type: "flatwork",
              duration: 45,
              description: "Canter work, transitions, 20m circles",
              intensity: "moderate",
            },
            {
              day: "Thursday",
              type: "rest",
              duration: 0,
              description: "Rest day — turnout",
              intensity: "none",
            },
            {
              day: "Friday",
              type: "flatwork",
              duration: 45,
              description: "Lateral work: leg yields and shoulder-fore",
              intensity: "moderate",
            },
            {
              day: "Saturday",
              type: "flatwork",
              duration: 40,
              description: "Review week's movements, polish and flow",
              intensity: "moderate",
            },
            {
              day: "Sunday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "pole-work",
    name: "Pole Work Session",
    description:
      "Ground pole and raised pole exercises to improve rhythm, lift, and proprioception",
    duration: 3,
    discipline: "jumping",
    level: "beginner",
    goals:
      "Improve rhythm over poles, develop lift and engagement, sharpen focus and footwork",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Introducing poles and rhythm",
          warmup:
            "10 min walk, 5 min trot. Walk over single pole x 4 passes before introducing multiple poles.",
          main_work:
            "3 poles in a row (trot distance ~1.3m apart). Progress to 5 poles. Canter poles at 3m spacing.",
          cooldown: "5 min walk on long rein. Praise.",
          safety_notes:
            "Ensure poles are bright and visible. Check distances suit your horse's stride length. Build gradually.",
          sessions: [
            {
              day: "Monday",
              type: "flatwork",
              duration: 30,
              description: "Flatwork warm-up: circles, transitions, rhythm",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "jumping",
              duration: 35,
              description: "Single pole in walk, then trot. Build to 3 poles.",
              intensity: "low-moderate",
            },
            {
              day: "Wednesday",
              type: "rest",
              duration: 0,
              description: "Rest or hack",
              intensity: "none",
            },
            {
              day: "Thursday",
              type: "jumping",
              duration: 40,
              description: "5-pole trot grid, introduce raised poles",
              intensity: "moderate",
            },
            {
              day: "Friday",
              type: "flatwork",
              duration: 30,
              description: "Flat work consolidation — no poles",
              intensity: "low",
            },
            {
              day: "Saturday",
              type: "jumping",
              duration: 40,
              description: "Canter poles 3m spacing, 5 poles in a row",
              intensity: "moderate",
            },
            {
              day: "Sunday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "jump-conditioning",
    name: "Jump Conditioning Programme",
    description:
      "Systematic jumping programme to build confidence, power, and technique over fences",
    duration: 6,
    discipline: "jumping",
    level: "intermediate",
    goals:
      "Build scope, consistency over fences, develop rider–horse jumping partnership",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Ground poles, trot poles, and small crosses",
          warmup:
            "10 min flatwork on both reins. Walk and trot poles before fence work.",
          main_work:
            "Grid work: 2 poles, then a small cross-pole. Maximum height 50cm. 4–6 repetitions.",
          cooldown: "Walk on long rein for 5–10 min. Stretch and praise.",
          safety_notes:
            "Never jump tired. Stop after refusals and reassess. Check tack before every session.",
          sessions: [
            {
              day: "Monday",
              type: "flatwork",
              duration: 35,
              description: "Flatwork — prepare canter for jump work",
              intensity: "moderate",
            },
            {
              day: "Tuesday",
              type: "jumping",
              duration: 40,
              description: "Pole grid in trot, cross-poles (50cm)",
              intensity: "moderate",
            },
            {
              day: "Wednesday",
              type: "hack",
              duration: 30,
              description: "Relaxing hack — mental rest",
              intensity: "low",
            },
            {
              day: "Thursday",
              type: "flatwork",
              duration: 35,
              description: "Canter work, adjustability, distances",
              intensity: "moderate",
            },
            {
              day: "Friday",
              type: "jumping",
              duration: 45,
              description: "Grid: cross-pole + upright (60cm)",
              intensity: "moderate-high",
            },
            {
              day: "Saturday",
              type: "rest",
              duration: 0,
              description: "Rest — turnout",
              intensity: "none",
            },
            {
              day: "Sunday",
              type: "jumping",
              duration: 45,
              description: "Course of 4–6 fences, emphasis on rhythm",
              intensity: "moderate",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "hacking-conditioning",
    name: "Hacking / Conditioning Ride",
    description:
      "Outdoor conditioning rides combining terrain work, fitness, and mental wellbeing",
    duration: 4,
    discipline: "general",
    level: "beginner",
    goals:
      "Build cardiovascular fitness, strengthen topline, provide variety and mental stimulation",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Building base fitness through varied terrain",
          warmup:
            "First 10 min always walk to warm up tendons and muscles before trotting.",
          main_work:
            "Include walk, trot, and short canter sections. Introduce gentle hills for hindquarter strength.",
          cooldown: "Last 10 min walk to cool down. Check legs on return.",
          safety_notes:
            "Always tell someone your route. Check footing before canter. Use hi-vis in low light.",
          sessions: [
            {
              day: "Monday",
              type: "hack",
              duration: 45,
              description: "Moderate hack — walk and trot on flat terrain",
              intensity: "low-moderate",
            },
            {
              day: "Tuesday",
              type: "flatwork",
              duration: 30,
              description: "Arena flatwork — transitions and suppleness",
              intensity: "moderate",
            },
            {
              day: "Wednesday",
              type: "rest",
              duration: 0,
              description: "Rest day — turnout",
              intensity: "none",
            },
            {
              day: "Thursday",
              type: "hack",
              duration: 50,
              description: "Hill work hack — includes uphill trot",
              intensity: "moderate",
            },
            {
              day: "Friday",
              type: "flatwork",
              duration: 30,
              description: "Arena work — maintain suppleness",
              intensity: "low-moderate",
            },
            {
              day: "Saturday",
              type: "hack",
              duration: 60,
              description: "Longer conditioning hack — walk/trot/short canters",
              intensity: "moderate",
            },
            {
              day: "Sunday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "groundwork",
    name: "Groundwork Session",
    description:
      "In-hand and lungeing programme to develop obedience, suppleness, and partnership",
    duration: 3,
    discipline: "general",
    level: "beginner",
    goals:
      "Improve responsiveness, develop calmness and focus, build horse–handler relationship",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Establishing clear communication from the ground",
          warmup:
            "5 min in-hand walk around arena. Introduce equipment calmly.",
          main_work:
            "Lunging on 20m circle both directions. Walk, trot, canter transitions. Lateral movements in-hand.",
          cooldown:
            "5 min walk on lunge, finishing with a pat and positive reward.",
          safety_notes:
            "Always wear gloves when lunging. Keep safe distance. Work on non-slip footing.",
          sessions: [
            {
              day: "Monday",
              type: "groundwork",
              duration: 25,
              description: "In-hand: halt, walk, backing, yielding to pressure",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "groundwork",
              duration: 30,
              description: "Lunging: walk-trot transitions on 20m circle",
              intensity: "low",
            },
            {
              day: "Wednesday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
            {
              day: "Thursday",
              type: "groundwork",
              duration: 30,
              description: "Lunging: trot-canter transitions, rhythm focus",
              intensity: "low-moderate",
            },
            {
              day: "Friday",
              type: "groundwork",
              duration: 25,
              description:
                "In-hand lateral work: shoulder-in, turn on haunches",
              intensity: "low",
            },
            {
              day: "Saturday",
              type: "rest",
              duration: 0,
              description: "Rest or light turnout",
              intensity: "none",
            },
            {
              day: "Sunday",
              type: "groundwork",
              duration: 30,
              description: "Free lungeing or join-up work",
              intensity: "low",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "rest-recovery",
    name: "Rest & Light Recovery",
    description:
      "Low-intensity recovery week for horses after competition, injury, or heavy training",
    duration: 1,
    discipline: "general",
    level: "beginner",
    goals:
      "Allow physical and mental recovery, maintain light movement, assess soundness",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Gentle movement and recovery",
          warmup:
            "Always start with 5–10 min slow walk. Do not rush into trot.",
          main_work:
            "Short walk or very light trot sessions only. Prioritise turnout and rest.",
          cooldown: "Always finish with walk. Check legs for heat or swelling.",
          safety_notes:
            "If horse shows any lameness or discomfort, consult vet before continuing exercise.",
          sessions: [
            {
              day: "Monday",
              type: "walk",
              duration: 20,
              description: "Gentle walk in-hand or under saddle",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "rest",
              duration: 0,
              description: "Full rest — turnout preferred",
              intensity: "none",
            },
            {
              day: "Wednesday",
              type: "walk",
              duration: 25,
              description: "Light walk hack",
              intensity: "low",
            },
            {
              day: "Thursday",
              type: "rest",
              duration: 0,
              description: "Rest — turnout",
              intensity: "none",
            },
            {
              day: "Friday",
              type: "walk",
              duration: 20,
              description: "Short gentle walk, check soundness",
              intensity: "low",
            },
            {
              day: "Saturday",
              type: "rest",
              duration: 0,
              description: "Rest",
              intensity: "none",
            },
            {
              day: "Sunday",
              type: "walk",
              duration: 25,
              description: "Easy walk, assess readiness to return to work",
              intensity: "low",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "fitness-building",
    name: "Fitness Building Week",
    description:
      "Progressive weekly fitness plan to increase cardiovascular capacity and muscle strength",
    duration: 6,
    discipline: "general",
    level: "intermediate",
    goals:
      "Systematically raise fitness level, build stamina, improve recovery time after work",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Establishing aerobic base",
          warmup: "10 min walk, increasing pace over the first 5 min.",
          main_work:
            "20–30 min continuous trot with regular rest walks. Include 2× 5-min canter sets.",
          cooldown:
            "10 min walk to let heart rate return to normal. Check breathing.",
          safety_notes:
            "Monitor for excessive sweating, laboured breathing, or stumbling. Build up load progressively.",
          sessions: [
            {
              day: "Monday",
              type: "hack",
              duration: 45,
              description: "Long trot hack with gentle hills",
              intensity: "moderate",
            },
            {
              day: "Tuesday",
              type: "flatwork",
              duration: 40,
              description: "Arena work — active trot transitions",
              intensity: "moderate",
            },
            {
              day: "Wednesday",
              type: "rest",
              duration: 0,
              description: "Rest day — active turnout",
              intensity: "none",
            },
            {
              day: "Thursday",
              type: "hack",
              duration: 50,
              description:
                "Interval training: 3× 5-min canter with 5-min trot recovery",
              intensity: "moderate-high",
            },
            {
              day: "Friday",
              type: "flatwork",
              duration: 35,
              description: "Light schooling — maintain suppleness",
              intensity: "low-moderate",
            },
            {
              day: "Saturday",
              type: "hack",
              duration: 60,
              description: "Longer conditioning ride — mixed terrain",
              intensity: "moderate",
            },
            {
              day: "Sunday",
              type: "rest",
              duration: 0,
              description: "Rest day",
              intensity: "none",
            },
          ],
        },
      ],
    }),
  },
  {
    id: "confidence-rebuilding",
    name: "Confidence Rebuilding",
    description:
      "Gentle, structured programme to rebuild confidence in horses that have had a setback",
    duration: 8,
    discipline: "general",
    level: "beginner",
    goals:
      "Restore confidence and willingness, re-establish trust, identify and address fear triggers",
    isPredesigned: true,
    programData: JSON.stringify({
      weeks: [
        {
          week: 1,
          focus: "Calm foundations — no pressure, only success",
          warmup:
            "Always start further away from any feared object/area. Let the horse observe calmly.",
          main_work:
            "Only ask for things horse is confident doing. Reward try and effort. Short sessions.",
          cooldown:
            "Always end on a positive note, even something very small. Praise lavishly.",
          safety_notes:
            "Never force or flood. If horse is very anxious, consult qualified trainer or behaviourist.",
          sessions: [
            {
              day: "Monday",
              type: "groundwork",
              duration: 20,
              description: "Calm groundwork — things the horse knows well",
              intensity: "low",
            },
            {
              day: "Tuesday",
              type: "walk",
              duration: 20,
              description: "Relaxed walk in a safe, familiar area",
              intensity: "low",
            },
            {
              day: "Wednesday",
              type: "rest",
              duration: 0,
              description: "Rest — turnout in calm environment",
              intensity: "none",
            },
            {
              day: "Thursday",
              type: "groundwork",
              duration: 25,
              description:
                "Desensitisation — introduce calm new stimulus at distance",
              intensity: "low",
            },
            {
              day: "Friday",
              type: "walk",
              duration: 25,
              description: "Gentle ridden walk — familiar route",
              intensity: "low",
            },
            {
              day: "Saturday",
              type: "rest",
              duration: 0,
              description: "Rest",
              intensity: "none",
            },
            {
              day: "Sunday",
              type: "walk",
              duration: 25,
              description: "Walk with companion horse for confidence",
              intensity: "low",
            },
          ],
        },
      ],
    }),
  },
];

function TrainingTemplatesContent() {
  const [, setLocation] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    discipline: "",
    level: "",
    goals: "",
    isPublic: false,
  });
  const [applyData, setApplyData] = useState({
    horseId: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const utils = trpc.useUtils();
  const { data: templates, isLoading } =
    trpc.trainingPrograms.listTemplates.useQuery();
  const { data: horses } = trpc.horses.list.useQuery();

  const createMutation = trpc.trainingPrograms.createTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template created successfully");
      utils.trainingPrograms.listTemplates.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = trpc.trainingPrograms.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template updated successfully");
      utils.trainingPrograms.listTemplates.invalidate();
      setIsEditOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.trainingPrograms.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template deleted successfully");
      utils.trainingPrograms.listTemplates.invalidate();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const duplicateMutation = trpc.trainingPrograms.duplicateTemplate.useMutation(
    {
      onSuccess: () => {
        toast.success("Template duplicated successfully");
        utils.trainingPrograms.listTemplates.invalidate();
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      },
    },
  );

  const applyMutation = trpc.trainingPrograms.applyTemplate.useMutation({
    onSuccess: (data) => {
      const count = data.sessionsCreated || 0;
      toast.success(`Training plan applied! ${count} sessions scheduled.`);
      setIsApplyOpen(false);
      setSelectedTemplate(null);
      setApplyData({
        horseId: "",
        startDate: new Date().toISOString().split("T")[0],
      });
      // Invalidate training sessions so the new plan appears immediately
      utils.training.listAll.invalidate();
      // Navigate to training page so user sees the result immediately
      setLocation("/training");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const usePredesignedMutation =
    trpc.trainingPrograms.createTemplate.useMutation({
      onSuccess: (data, variables) => {
        utils.trainingPrograms.listTemplates.invalidate();
        // Immediately open the apply dialog so the user can apply the template
        // to a horse right away — no need to search for it in the list.
        const newTemplate = {
          id: data.id,
          name: variables.name,
          description: variables.description,
          duration: variables.duration,
          discipline: variables.discipline,
          level: variables.level,
          goals: variables.goals,
          programData: variables.programData,
        };
        setSelectedTemplate(newTemplate);
        setIsApplyOpen(true);
        toast.success(`"${variables.name}" added — choose a horse to apply it`);
      },
      onError: (error) => {
        toast.error(`Error: ${error.message}`);
      },
    });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      discipline: "",
      level: "",
      goals: "",
      isPublic: false,
    });
    setSelectedTemplate(null);
  };

  const handleCreate = () => {
    if (!formData.name) {
      toast.error("Template name is required");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      discipline: formData.discipline || undefined,
      level: formData.level || undefined,
      goals: formData.goals || undefined,
      programData: JSON.stringify({ weeks: [] }),
      isPublic: formData.isPublic,
    });
  };

  const handleEdit = () => {
    if (!selectedTemplate || !formData.name) {
      toast.error("Template name is required");
      return;
    }

    updateMutation.mutate({
      id: selectedTemplate.id,
      name: formData.name,
      description: formData.description || undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      discipline: formData.discipline || undefined,
      level: formData.level || undefined,
      goals: formData.goals || undefined,
      isPublic: formData.isPublic,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate({ id });
  };

  const openEditDialog = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      duration: template.duration?.toString() || "",
      discipline: template.discipline || "",
      level: template.level || "",
      goals: template.goals || "",
      isPublic: template.isPublic || false,
    });
    setIsEditOpen(true);
  };

  const openApplyDialog = (template: any) => {
    setSelectedTemplate(template);
    setIsApplyOpen(true);
  };

  const handleApply = () => {
    if (!selectedTemplate || !applyData.horseId) {
      toast.error("Please select a horse");
      return;
    }

    applyMutation.mutate({
      templateId: selectedTemplate.id,
      horseId: parseInt(applyData.horseId),
      startDate: applyData.startDate,
    });
  };

  const handleAddPredesignedTemplate = (
    predesigned: (typeof PREDESIGNED_TEMPLATES)[0],
  ) => {
    usePredesignedMutation.mutate({
      name: predesigned.name,
      description: predesigned.description,
      duration: predesigned.duration,
      discipline: predesigned.discipline,
      level: predesigned.level,
      goals: predesigned.goals,
      programData: predesigned.programData,
      isPublic: false,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif">Training Templates</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Create reusable training session templates to quickly log consistent workouts. Templates save your common exercises, durations, and goals — apply them to any horse in seconds.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Training Template</DialogTitle>
              <DialogDescription>
                Create a reusable training program template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Jumping Fundamentals, Dressage Level 1"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the training program"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g., 12"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) =>
                      setFormData({ ...formData, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discipline">Discipline</Label>
                <Select
                  value={formData.discipline}
                  onValueChange={(value) =>
                    setFormData({ ...formData, discipline: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dressage">Dressage</SelectItem>
                    <SelectItem value="jumping">Jumping</SelectItem>
                    <SelectItem value="eventing">Eventing</SelectItem>
                    <SelectItem value="western">Western</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) =>
                    setFormData({ ...formData, goals: e.target.value })
                  }
                  placeholder="Training goals and objectives"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublic: e.target.checked })
                  }
                  className="rounded"
                />
                <Label htmlFor="isPublic">
                  Make this template public (visible to all users)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Predesigned Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold font-serif">
              Predesigned Templates
            </h2>
            <p className="text-xs text-muted-foreground">
              Professional training programs ready to use
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PREDESIGNED_TEMPLATES.map((predesigned) => (
            <Card
              key={predesigned.id}
              className="hover:shadow-lg transition-shadow border-indigo-500/20"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      {predesigned.name}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {predesigned.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {predesigned.discipline && (
                      <Badge variant="outline" className="text-xs">
                        {predesigned.discipline}
                      </Badge>
                    )}
                    {predesigned.level && (
                      <Badge variant="outline" className="text-xs">
                        {predesigned.level}
                      </Badge>
                    )}
                    {predesigned.duration && (
                      <Badge variant="outline" className="text-xs">
                        {predesigned.duration} weeks
                      </Badge>
                    )}
                  </div>

                  {predesigned.goals && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {predesigned.goals}
                    </p>
                  )}

                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleAddPredesignedTemplate(predesigned)}
                    disabled={usePredesignedMutation.isPending}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Use This Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* User Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold font-serif">Your Templates</h2>
          {templates && templates.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {templates.length}
            </Badge>
          )}
        </div>

        {/* Templates Grid */}
        {!templates || templates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                No custom templates yet
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm text-sm">
                Create your first custom training template or use one of the
                predesigned templates above.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.description || "No description"}
                        </CardDescription>
                      </div>
                      {template.isPublic ? (
                        <Badge variant="secondary" className="ml-2">
                          <Globe className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2">
                          <Lock className="w-3 h-3 mr-1" />
                          Private
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {template.discipline && (
                          <Badge variant="outline">{template.discipline}</Badge>
                        )}
                        {template.level && (
                          <Badge variant="outline">{template.level}</Badge>
                        )}
                        {template.duration && (
                          <Badge variant="outline">
                            {template.duration} weeks
                          </Badge>
                        )}
                      </div>

                      {template.goals && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {template.goals}
                        </p>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openApplyDialog(template)}
                          className="flex-1"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(template)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDuplicate(template.id)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Training Template</DialogTitle>
            <DialogDescription>
              Update the training program template details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Template Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Jumping Fundamentals, Dressage Level 1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the training program"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-duration">Duration (weeks)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 12"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-level">Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-discipline">Discipline</Label>
              <Select
                value={formData.discipline}
                onValueChange={(value) =>
                  setFormData({ ...formData, discipline: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dressage">Dressage</SelectItem>
                  <SelectItem value="jumping">Jumping</SelectItem>
                  <SelectItem value="eventing">Eventing</SelectItem>
                  <SelectItem value="western">Western</SelectItem>
                  <SelectItem value="endurance">Endurance</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-goals">Goals</Label>
              <Textarea
                id="edit-goals"
                value={formData.goals}
                onChange={(e) =>
                  setFormData({ ...formData, goals: e.target.value })
                }
                placeholder="Training goals and objectives"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isPublic"
                checked={formData.isPublic}
                onChange={(e) =>
                  setFormData({ ...formData, isPublic: e.target.checked })
                }
                className="rounded"
              />
              <Label htmlFor="edit-isPublic">Make this template public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Template to Horse</DialogTitle>
            <DialogDescription>
              Select a horse and start date to apply this training template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="horse">Select Horse *</Label>
              <Select
                value={applyData.horseId}
                onValueChange={(value) =>
                  setApplyData({ ...applyData, horseId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a horse" />
                </SelectTrigger>
                <SelectContent>
                  {horses?.map((horse) => (
                    <SelectItem key={horse.id} value={horse.id.toString()}>
                      {horse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={applyData.startDate}
                onChange={(e) =>
                  setApplyData({ ...applyData, startDate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsApplyOpen(false);
                setSelectedTemplate(null);
                setApplyData({
                  horseId: "",
                  startDate: new Date().toISOString().split("T")[0],
                });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? "Applying..." : "Apply Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function TrainingTemplates() {
  return (
    <DashboardLayout>
      <TrainingTemplatesContent />
    </DashboardLayout>
  );
}
