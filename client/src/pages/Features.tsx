import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Footer } from "@/components/Footer";
import {
  Heart,
  Activity,
  Utensils,
  Calendar,
  FileText,
  BarChart3,
  Users,
  Bell,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { Link } from "wouter";

// 6 category sections as per requirements
const categories = [
  {
    id: "stable-management",
    icon: Users,
    title: "Stable Management",
    image: "/images/horse-stable.jpg",
    description:
      "Comprehensive tools to manage your entire stable operation efficiently. Track multiple horses, coordinate staff, and oversee daily operations from a single dashboard.",
    points: [
      "Multi-horse management with unlimited horses",
      "Staff role-based access and permissions",
      "Stable-wide calendar and scheduling",
      "Team collaboration and messaging",
      "Activity logs and audit trails",
    ],
  },
  {
    id: "horse-health",
    icon: Heart,
    title: "Horse Profiles & Health",
    image: "/images/horse-profiles-health.jpg",
    description:
      "Maintain detailed health records for each horse. Track vaccinations, vet visits, medications, and medical history with automated reminders to ensure nothing is missed.",
    points: [
      "Complete horse profiles with photos and details",
      "Vaccination schedules with auto-reminders",
      "Vet visit history and notes",
      "Medication tracking and dosage schedules",
      "Medical document storage",
    ],
  },
  {
    id: "training-scheduling",
    icon: Activity,
    title: "Training & Scheduling",
    image: "/images/hero-horse-riding.jpg",
    description:
      "Plan, log, and analyze training sessions with detailed performance tracking. Schedule lessons, track progress, and monitor improvement over time with visual analytics.",
    points: [
      "Training session planning and logging",
      "Performance ratings and progress tracking",
      "Lesson scheduling and management",
      "Feeding schedules with custom plans",
      "Calendar integration for all activities",
    ],
  },
  {
    id: "documents-xrays",
    icon: FileText,
    title: "Documents & X-rays",
    image: "/images/documents-xrays.jpg",
    description:
      "Securely store and organize all horse-related documents in one central location. Upload registration papers, insurance documents, X-rays, competition records, and more with powerful search capabilities.",
    points: [
      "Cloud storage for all documents",
      "X-ray and medical imaging storage",
      "Category-based organization",
      "Full-text search functionality",
      "Secure access controls and sharing",
    ],
  },
  {
    id: "reporting-analytics",
    icon: BarChart3,
    title: "Reporting & Analytics",
    image: "/images/horse-portrait.jpg",
    description:
      "Generate comprehensive reports and gain insights into health trends, training progress, and expenses. Export data in multiple formats for sharing with vets, trainers, or for your own records.",
    points: [
      "Health trend analysis and charts",
      "Training progress visualization",
      "Expense tracking and reports",
      "Export to PDF, CSV, and Excel",
      "Custom report generation",
    ],
  },
  {
    id: "scheduling-reminders",
    icon: Bell,
    title: "Care Scheduling & Reminders",
    image: "/images/care-scheduling.jpg",
    description:
      "Never miss important care tasks. Set up automated reminders for farrier visits, dental appointments, worming schedules, and daily routines.",
    points: [
      "Automated email and push reminders",
      "Recurring task scheduling",
      "Farrier and dental appointment tracking",
      "Worming and medication schedules",
      "Custom care routine templates",
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
                  Designed for daily workflows: health, training, documents, scheduling. 
                  Built for professional stables and equine teams.
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

          {/* Category Sections */}
          <section className="container mx-auto px-4 space-y-24">
            {categories.map((category, index) => (
              <ScrollReveal key={category.id}>
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}>
                  {/* Image */}
                  <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                    <Card className="p-8 border-2 min-h-[400px] flex flex-col">
                      <CardHeader className="p-0 mb-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-xl bg-primary/10 text-primary">
                            <category.icon className="w-8 h-8" />
                          </div>
                          <CardTitle className="text-3xl font-bold">
                            {category.title}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-base leading-relaxed">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ul className="space-y-3">
                          {category.points.map((point, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                              <span className="text-foreground">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 mt-24">
            <ScrollReveal>
              <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
                    Ready to Transform Your Horse Management?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Join equine professionals who trust EquiProfile for their daily workflows. 
                    Start your 7-day free trial today.
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
      <Footer />
    </>
  );
}
