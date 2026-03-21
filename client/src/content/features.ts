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
  Utensils,
  BarChart,
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
      "Maintain comprehensive profiles for each horse including pedigree, ownership details, identification, and complete history in one organized place.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: marketingAssets.features.iconSpeed,
    title: "Health Record Tracking",
    description:
      "Track vaccinations, dewormings, veterinary visits, treatments, medications, and vital signs. Never miss important health milestones again.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: marketingAssets.features.iconAutomation,
    title: "Training & Performance Logs",
    description:
      "Document training sessions, track progress, record competition results, and analyze performance metrics to optimize your training program.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: marketingAssets.features.iconIntegrations,
    title: "Farrier & Dental Care",
    description:
      "Schedule and track hoof care appointments, shoeing records, dental check-ups, and maintenance schedules with automated reminders.",
    gradient: "from-red-500 to-pink-500",
  },
  {
    icon: marketingAssets.features.iconSupport,
    title: "Smart Reminders & Alerts",
    description:
      "Receive automated reminders for vaccinations, farrier visits, vet appointments, and other important care tasks. Never forget critical dates.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: marketingAssets.features.iconSecurity,
    title: "Document & Photo Storage",
    description:
      "Securely store veterinary records, registration papers, insurance documents, and photos in one centralized, encrypted location.",
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
      "Set automatic reminders for upcoming care",
      "Monitor health trends and vital signs",
    ],
    icon: Heart,
    gradient: "from-rose-500 to-pink-500",
  },
  {
    title: "Advanced Analytics & Insights",
    description: "Data-driven decisions for optimal horse care and performance",
    image: "/images/gallery/2.jpg",
    imagePosition: "left" as const,
    features: [
      "Track training progress and performance metrics",
      "Visualize health patterns over time",
      "Compare performance across multiple horses",
      "Export detailed reports for vets and trainers",
    ],
    icon: BarChart,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "Training & Performance Tracking",
    description: "Monitor and optimize every training session",
    image: "/images/gallery/10.jpg",
    imagePosition: "right" as const,
    features: [
      "Log training sessions with detailed notes",
      "Track progress towards competition goals",
      "Record performance videos and photos",
      "Share achievements with your team",
    ],
    icon: Activity,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "Smart Feeding & Nutrition",
    description: "Optimize nutrition plans for peak performance",
    image: "/images/gallery/12.jpg",
    imagePosition: "left" as const,
    features: [
      "Create custom feeding schedules",
      "Track feed inventory and costs",
      "Monitor weight and body condition",
      "Get nutrition recommendations",
    ],
    icon: Utensils,
    gradient: "from-amber-500 to-orange-500",
  },
  {
    title: "Scheduling & Calendar",
    description: "Never miss important appointments or events",
    image: "/images/gallery/15.jpg",
    imagePosition: "right" as const,
    features: [
      "Unified calendar for all horses and events",
      "Automatic reminders for farrier, vet visits",
      "Schedule training sessions and competitions",
      "Sync with your personal calendar",
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
      "Track expenses and budgets",
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
      "Gain deep insights into your horse's performance, health trends, and training progress with powerful analytics and visual reports.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: marketingAssets.features.iconAutomation,
    title: "Smart Automation",
    description:
      "Automated reminders for vaccinations, farrier visits, and vet appointments ensure you never miss important care tasks.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: marketingAssets.features.iconSpeed,
    title: "All-in-One Platform",
    description:
      "Manage health records, training logs, feeding schedules, documents, photos, and more in one centralized platform.",
    gradient: "from-purple-500 to-violet-500",
  },
];
