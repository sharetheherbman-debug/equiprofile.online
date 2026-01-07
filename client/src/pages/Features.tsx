import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/ScrollReveal";
import {
  Heart,
  Activity,
  Utensils,
  Calendar,
  FileText,
  Cloud,
  BarChart3,
  Users,
  Shield,
  Smartphone,
  Bell,
  Download,
} from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: Heart,
    title: "Health Records",
    description:
      "Comprehensive health tracking with vaccination schedules, vet visits, medications, and medical history. Upload documents and set automatic reminders for important health checkups.",
    points: [
      "Vaccination tracking with auto-reminders",
      "Medical document storage",
      "Vet visit history and notes",
      "Medication schedules",
    ],
  },
  {
    icon: Activity,
    title: "Training Management",
    description:
      "Plan, log, and track training sessions with detailed notes, performance ratings, and progress analytics. Monitor improvement over time with visual charts and insights.",
    points: [
      "Session planning and logging",
      "Performance tracking",
      "Progress analytics",
      "Trainer collaboration",
    ],
  },
  {
    icon: Utensils,
    title: "Feeding Schedules",
    description:
      "Create detailed feeding plans with meal timing, quantities, supplements, and special instructions. Track costs and monitor dietary changes with ease.",
    points: [
      "Custom feeding plans",
      "Supplement tracking",
      "Cost management",
      "Dietary notes and allergies",
    ],
  },
  {
    icon: Calendar,
    title: "Calendar & Reminders",
    description:
      "Never miss an appointment with integrated calendar for all horse-related events. Set reminders for farrier visits, competitions, vet appointments, and training sessions.",
    points: [
      "Unified event calendar",
      "Customizable reminders",
      "Recurring appointments",
      "Mobile notifications",
    ],
  },
  {
    icon: FileText,
    title: "Document Storage",
    description:
      "Securely store all horse-related documents in one place. Registration papers, insurance documents, competition records, and more with organized categorization and search.",
    points: [
      "Cloud storage for documents",
      "Category organization",
      "Full-text search",
      "Secure access controls",
    ],
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Generate detailed reports on health trends, training progress, expenses, and more. Export data for sharing with trainers, vets, or for personal records.",
    points: [
      "Health trend analysis",
      "Expense reports",
      "Training progress charts",
      "Export to PDF/Excel",
    ],
  },
  {
    icon: Cloud,
    title: "AI Weather Analysis",
    description:
      "Get intelligent riding condition recommendations based on real-time weather data. Safety alerts for extreme conditions and optimal training times.",
    points: [
      "Real-time weather data",
      "AI-powered recommendations",
      "Safety alerts",
      "Historical weather tracking",
    ],
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite trainers, stable staff, and vets to collaborate. Role-based permissions ensure everyone has the right level of access to horse information.",
    points: [
      "Multi-user accounts",
      "Role-based access",
      "Team messaging",
      "Activity logs",
    ],
  },
  {
    icon: Shield,
    title: "Data Security",
    description:
      "Your data is protected with enterprise-grade encryption and security. Regular backups ensure your horse information is never lost.",
    points: [
      "End-to-end encryption",
      "Automatic backups",
      "GDPR compliant",
      "Secure cloud storage",
    ],
  },
  {
    icon: Smartphone,
    title: "Mobile-Friendly",
    description:
      "Access your horse information anywhere, anytime. Responsive design works perfectly on desktop, tablet, and mobile devices.",
    points: [
      "Responsive design",
      "Progressive Web App",
      "Offline access",
      "Touch-optimized interface",
    ],
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Stay informed with intelligent notifications for upcoming events, health reminders, and important updates. Customize notification preferences to your needs.",
    points: [
      "Customizable alerts",
      "Email & push notifications",
      "Important event reminders",
      "Digest summaries",
    ],
  },
  {
    icon: Download,
    title: "Data Export",
    description:
      "Own your data. Export all horse information, records, and documents at any time. Generate reports in multiple formats for sharing or archiving.",
    points: [
      "Full data export",
      "Multiple file formats",
      "Shareable profiles",
      "Backup downloads",
    ],
  },
];

export default function Features() {
  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen pt-24 pb-16">
          {/* Hero Section */}
          <section className="container mx-auto px-4 mb-20">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6">
                  Everything You Need for{" "}
                  <span className="text-gradient">Horse Management</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  EquiProfile combines powerful features with an intuitive
                  interface to provide the ultimate equine management platform.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="text-lg">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="text-lg">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Features Grid */}
          <section className="container mx-auto px-4">
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <StaggerItem key={index}>
                  <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 card-hover">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.points.map((point, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 mt-20">
            <ScrollReveal>
              <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
                    Ready to Transform Your Horse Management?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Join thousands of horse owners who trust EquiProfile for their
                    equine management needs.
                  </p>
                  <Link href="/register">
                    <Button size="lg" className="text-lg">
                      Start Your Free Trial
                    </Button>
                  </Link>
                </div>
              </Card>
            </ScrollReveal>
          </section>
        </div>
      </PageTransition>
    </>
  );
}
