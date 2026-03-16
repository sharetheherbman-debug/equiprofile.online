export interface Feature {
  title: string;
  description: string;
  icon?: string; // Optional lucide-react icon name
}

export interface FeatureCategory {
  category: string;
  description: string;
  features: Feature[];
}

export const featuresRegistry: FeatureCategory[] = [
  {
    category: "Horse Profile Management",
    description: "Complete digital profiles for every horse in your care",
    features: [
      {
        title: "Comprehensive Profiles",
        description:
          "Store complete details including breed, color, markings, microchip, registration info",
        icon: "FileText",
      },
      {
        title: "Photo Galleries",
        description: "Unlimited photos with captions and dates",
        icon: "Image",
      },
      {
        title: "Document Storage",
        description: "Securely store registration papers, insurance, contracts",
        icon: "FolderLock",
      },
      {
        title: "Quick Search & Filter",
        description:
          "Find horses instantly by name, breed, location, or custom tags",
        icon: "Search",
      },
      {
        title: "Pedigree Tracking",
        description: "Full family tree visualization and lineage records",
        icon: "GitBranch",
      },
    ],
  },
  {
    category: "Health & Veterinary Care",
    description: "Complete medical record keeping and health monitoring",
    features: [
      {
        title: "Vaccination Records",
        description: "Track all vaccines with automated reminders for boosters",
        icon: "Syringe",
      },
      {
        title: "Veterinary Visits",
        description:
          "Log vet appointments, diagnoses, treatments, and prescriptions",
        icon: "Stethoscope",
      },
      {
        title: "Medication Management",
        description: "Track medications, dosages, schedules with alerts",
        icon: "Pill",
      },
      {
        title: "Dental Care Tracking",
        description: "Schedule and record dental work and examinations",
        icon: "Smile",
      },
      {
        title: "Hoof Care Management",
        description: "Track farrier visits, shoeing, and hoof health",
        icon: "Footprints",
      },
      {
        title: "Deworming Schedule",
        description: "Automated deworming schedules with product tracking",
        icon: "Calendar",
      },
      {
        title: "X-rays & Imaging",
        description: "Store and view x-rays, ultrasounds, and medical imaging",
        icon: "ScanLine",
      },
      {
        title: "Treatment Plans",
        description: "Create and track ongoing treatment protocols",
        icon: "ClipboardList",
      },
    ],
  },
  {
    category: "Training & Performance",
    description: "Track progress and optimize training programs",
    features: [
      {
        title: "Training Sessions",
        description:
          "Log detailed training sessions with exercises and duration",
        icon: "Dumbbell",
      },
      {
        title: "Progress Tracking",
        description: "Monitor improvement over time with visual charts",
        icon: "TrendingUp",
      },
      {
        title: "Training Templates",
        description: "Create reusable training plans and programs",
        icon: "Layout",
      },
      {
        title: "Performance Analytics",
        description: "Data-driven insights into training effectiveness",
        icon: "BarChart3",
      },
      {
        title: "Video Analysis",
        description: "Upload and annotate training videos",
        icon: "Video",
      },
      {
        title: "Competition Records",
        description: "Track show results, scores, and achievements",
        icon: "Trophy",
      },
    ],
  },
  {
    category: "Feeding & Nutrition",
    description: "Optimize nutrition for peak performance",
    features: [
      {
        title: "Custom Feeding Plans",
        description: "Create detailed feeding schedules per horse",
        icon: "UtensilsCrossed",
      },
      {
        title: "Nutrition Logs",
        description: "Track daily feed intake and supplements",
        icon: "Clipboard",
      },
      {
        title: "Weight Monitoring",
        description: "Record and chart weight changes over time",
        icon: "Scale",
      },
      {
        title: "Body Condition Scoring",
        description: "Track body condition with visual scoring system",
        icon: "Activity",
      },
      {
        title: "Supplement Management",
        description: "Manage supplements with dosage tracking",
        icon: "Pill",
      },
      {
        title: "Feed Inventory",
        description: "Track feed stock levels and ordering",
        icon: "Package",
      },
    ],
  },
  {
    category: "Breeding Management",
    description: "Comprehensive breeding program management",
    features: [
      {
        title: "Heat Cycle Tracking",
        description: "Monitor and predict heat cycles",
        icon: "Heart",
      },
      {
        title: "Breeding Records",
        description: "Log breeding dates, stallions, and methods",
        icon: "BookOpen",
      },
      {
        title: "Pregnancy Monitoring",
        description: "Track pregnancy progress with ultrasound dates",
        icon: "Baby",
      },
      {
        title: "Foaling Calendar",
        description: "Predict and plan for foaling dates",
        icon: "CalendarDays",
      },
      {
        title: "Foal Records",
        description: "Complete records from birth onwards",
        icon: "FileHeart",
      },
    ],
  },
  {
    category: "Stable & Facility Management",
    description: "Manage stables, stalls, and facilities",
    features: [
      {
        title: "Multi-Stable Support",
        description: "Manage multiple locations from one account",
        icon: "Building2",
      },
      {
        title: "Stall Assignments",
        description: "Track which horses are in which stalls",
        icon: "Grid3x3",
      },
      {
        title: "Staff Scheduling",
        description: "Create work schedules for stable staff",
        icon: "Users",
      },
      {
        title: "Facility Maintenance",
        description: "Log and schedule facility maintenance",
        icon: "Wrench",
      },
      {
        title: "Inventory Management",
        description: "Track equipment, supplies, and feed stock",
        icon: "Warehouse",
      },
    ],
  },
  {
    category: "Calendar & Scheduling",
    description: "Never miss important dates and appointments",
    features: [
      {
        title: "Integrated Calendar",
        description: "All-in-one calendar for all activities",
        icon: "Calendar",
      },
      {
        title: "Appointment Scheduling",
        description: "Schedule vet visits, farrier, training",
        icon: "CalendarCheck",
      },
      {
        title: "Automated Reminders",
        description: "Smart reminders via email and in-app",
        icon: "Bell",
      },
      {
        title: "Lesson Scheduling",
        description: "Schedule and manage riding lessons",
        icon: "Clock",
      },
      {
        title: "iCal Export",
        description: "Sync with Google Calendar, Apple Calendar, Outlook",
        icon: "Download",
      },
    ],
  },
  {
    category: "AI-Powered Features",
    description: "Intelligent insights and recommendations",
    features: [
      {
        title: "AI Chat Assistant",
        description: "Ask questions and get instant expert advice",
        icon: "MessageSquare",
      },
      {
        title: "Weather Analysis",
        description: "Real-time weather with riding recommendations",
        icon: "CloudRain",
      },
      {
        title: "Smart Insights",
        description: "AI-powered analysis of health and training data",
        icon: "Lightbulb",
      },
      {
        title: "Predictive Analytics",
        description: "Forecast health issues and optimal training times",
        icon: "Brain",
      },
    ],
  },
  {
    category: "Financial Management",
    description: "Track expenses and manage budgets",
    features: [
      {
        title: "Expense Tracking",
        description: "Log all horse-related expenses by category",
        icon: "Receipt",
      },
      {
        title: "Budget Planning",
        description: "Set and track budgets per horse or stable",
        icon: "PiggyBank",
      },
      {
        title: "Invoice Generation",
        description: "Create professional invoices for services",
        icon: "FileText",
      },
      {
        title: "Financial Reports",
        description: "Comprehensive financial reports and exports",
        icon: "DollarSign",
      },
      {
        title: "Subscription Billing",
        description: "Integrated Stripe payment processing",
        icon: "CreditCard",
      },
    ],
  },
  {
    category: "Collaboration & Communication",
    description: "Share information and communicate with your team",
    features: [
      {
        title: "Client Portal",
        description: "Share updates with horse owners",
        icon: "UserCircle",
      },
      {
        title: "Messaging System",
        description: "In-app messaging with staff and clients",
        icon: "MessageCircle",
      },
      {
        title: "Contact Management",
        description: "Centralized database of vets, farriers, suppliers",
        icon: "Users",
      },
      {
        title: "Document Sharing",
        description: "Securely share files with authorized users",
        icon: "Share2",
      },
      {
        title: "Role-Based Access",
        description: "Control who sees what with granular permissions",
        icon: "ShieldCheck",
      },
    ],
  },
  {
    category: "Reports & Analytics",
    description: "Data-driven insights and comprehensive reporting",
    features: [
      {
        title: "Health Reports",
        description: "Comprehensive health summary reports",
        icon: "FileBarChart",
      },
      {
        title: "Training Analytics",
        description: "Performance trends and training effectiveness",
        icon: "LineChart",
      },
      {
        title: "Financial Reports",
        description: "Expense summaries and budget analysis",
        icon: "PieChart",
      },
      {
        title: "Custom Reports",
        description: "Build custom reports with your data",
        icon: "Settings",
      },
      {
        title: "Export to PDF/Excel",
        description: "Download reports in multiple formats",
        icon: "FileDown",
      },
      {
        title: "Data Visualization",
        description: "Beautiful charts and graphs for insights",
        icon: "BarChart",
      },
    ],
  },
];
