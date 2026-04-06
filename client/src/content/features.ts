/**
 * EquiProfile Features Content
 *
 * Single source of truth for all feature content across the marketing site.
 * Used by Home page and Features page to ensure consistency.
 */

import {
  Heart,
  Activity,
  Calendar,
  Users,
} from "lucide-react";
import { marketingAssets } from "@/config/marketingAssets";

export interface Feature {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

/**
 * Core features displayed on the home page
 * These are the primary features that define EquiProfile
 */
export const coreFeatures: Feature[] = [
  {
    icon: marketingAssets.features.iconAnalytics,
    title: "Complete Horse Profiles",
    description:
      "Maintain comprehensive profiles for each horse including pedigree, ownership, identification, tags, and complete history in one organised place.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: marketingAssets.features.iconSpeed,
    title: "Health Record Tracking",
    description:
      "Track vaccinations, dewormings, veterinary visits, treatments, and vital signs. Smart health alerts notify you of overdue or upcoming care.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: marketingAssets.features.iconAutomation,
    title: "Training & Performance Logs",
    description:
      "Log training sessions with templates, track competition results, and analyse performance metrics. Full activity timeline per horse.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: marketingAssets.features.iconIntegrations,
    title: "GPS Ride Tracking",
    description:
      "Track rides in real time with GPS. Record your route, distance, and duration — saved automatically to your horse's activity history.",
    gradient: "from-red-500 to-pink-500",
  },
  {
    icon: marketingAssets.features.iconSupport,
    title: "Digital Equine Passport",
    description:
      "Generate a shareable Medical Passport for each horse. Share a secure read-only link with vets, officials, or buyers — no login required.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: marketingAssets.features.iconSecurity,
    title: "Document & Photo Storage",
    description:
      "Securely store vet records, registration papers, insurance, and photos. Export detailed reports and share health summaries in one click.",
    gradient: "from-violet-500 to-purple-500",
  },
];

/**
 * Extended features for the Features page
 * Provides detailed information about all EquiProfile capabilities
 */
export const detailedFeatures = [
  {
    title: "Complete Health Management",
    description:
      "Keep detailed health records for all your horses in one place",
    image: "/images/gallery/1.jpg",
    imagePosition: "right" as const,
    features: [
      "Track vaccinations, dewormings, and treatments",
      "Store veterinary records and prescriptions",
      "Smart health alerts for overdue or upcoming care",
      "Monitor health trends and vital signs",
    ],
    icon: Heart,
    gradient: "from-rose-500 to-pink-500",
  },
  {
    title: "GPS Ride Tracking & Timeline",
    description: "Real-time GPS tracking and a complete activity timeline for every horse",
    image: "/images/gallery/2.jpg",
    imagePosition: "left" as const,
    features: [
      "Track rides in real time with GPS route recording",
      "View distance, duration, and route on an interactive map",
      "Unified timeline of all events — health, training, appointments",
      "Auto-saves rides to your horse's activity history",
    ],
    icon: Activity,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Training & Performance Tracking",
    description: "Monitor and optimise every training session",
    image: "/images/gallery/10.jpg",
    imagePosition: "right" as const,
    features: [
      "Log training sessions with reusable templates",
      "Track progress towards competition goals",
      "Record competition results and analyse performance",
      "Export training data for coaches and vets",
    ],
    icon: Activity,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Digital Equine Passport & Sharing",
    description: "Share your horse's full health profile securely with anyone",
    image: "/images/gallery/12.jpg",
    imagePosition: "left" as const,
    features: [
      "Generate a digital Medical Passport per horse",
      "Share a secure read-only link — no login required",
      "Perfect for vet visits, competitions, and sales",
      "Includes vaccinations, treatments, and identification",
    ],
    icon: Users,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Scheduling & Smart Reminders",
    description: "Never miss important appointments or care events",
    image: "/images/gallery/15.jpg",
    imagePosition: "right" as const,
    features: [
      "Unified calendar for all horses and events",
      "Automatic reminders for farrier, vet, and dental visits",
      "Schedule training sessions and competitions",
      "Smart alerts for upcoming or overdue health tasks",
    ],
    icon: Calendar,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Stable & Team Management",
    description: "Coordinate care across your entire stable operation",
    image: "/images/gallery/18.jpg",
    imagePosition: "left" as const,
    features: [
      "Manage multiple horses efficiently",
      "Collaborate with trainers, vets, and staff",
      "Role-based access permissions",
      "Export reports and data to CSV or PDF",
    ],
    icon: Users,
    gradient: "from-indigo-500 to-blue-500",
  },
];

/**
 * Feature highlights for compact display (e.g., About page)
 */
export const featureHighlights: Feature[] = [
  {
    icon: marketingAssets.features.iconAnalytics,
    title: "Advanced Analytics",
    description:
      "Gain deep insights into your horse's performance, health trends, and training progress with powerful analytics and exportable reports.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: marketingAssets.features.iconAutomation,
    title: "GPS & Timeline",
    description:
      "Track every ride with GPS and see a complete chronological timeline of each horse's health, training, and care events.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: marketingAssets.features.iconSpeed,
    title: "Passport & Sharing",
    description:
      "Share a secure digital passport for any horse with vets, officials, or buyers — no account required. All records in one shareable link.",
    gradient: "from-purple-500 to-violet-500",
  },
];
