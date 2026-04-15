import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/ScrollReveal";
import { Link } from "wouter";
import {
  Heart,
  Calendar,
  CloudSun,
  FileText,
  Check,
  ChevronRight,
  Activity,
  Utensils,
  Star,
  Zap,
  Users,
  Award,
  ChevronLeft,
  Shield,
  Clock,
  TrendingUp,
  Folder,
  Brain,
  Smartphone,
  GraduationCap,
  BookOpen,
  Target,
  ClipboardList,
  Stethoscope,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { heroSlides } from "@/config/marketingAssets";
import { motion, AnimatePresence } from "framer-motion";
import { ImageSlider } from "@/components/ImageSlider";

const TESTIMONIAL_ROTATION_INTERVAL = 6000;

const managementFeatures = [
  {
    icon: Heart,
    title: "Health Records",
    description:
      "Vaccinations, vet visits, farrier appointments, and treatments — all logged with smart reminders so nothing is missed.",
  },
  {
    icon: Activity,
    title: "Training Logs",
    description:
      "Log every session with customisable templates. Track performance trends, competition results, and progress over time.",
  },
  {
    icon: Utensils,
    title: "Nutrition Plans",
    description:
      "Build individual feeding programmes per horse, track costs, and ensure consistent care regardless of who's on duty.",
  },
  {
    icon: Folder,
    title: "Document Storage",
    description:
      "Passports, insurance, invoices, and competition records — organised in folders, accessible anywhere.",
  },
  {
    icon: CloudSun,
    title: "Weather & Riding",
    description:
      "Real-time weather with riding suitability advice. Know before you tack up whether conditions are safe.",
  },
  {
    icon: BarChart3,
    title: "Insights & Reports",
    description:
      "Visual dashboards for health timelines, expense tracking, and training analytics across your whole stable.",
  },
];

const learningFeatures = [
  {
    icon: BookOpen,
    title: "15 Learning Pathways",
    description:
      "From horse care to rider skills, nutrition to welfare — structured across 4 progressive levels.",
  },
  {
    icon: Target,
    title: "Progression Gating",
    description:
      "Students unlock new content as they advance — Beginner → Developing → Intermediate → Advanced.",
  },
  {
    icon: Zap,
    title: "Daily Practice",
    description:
      "3 fresh scenario challenges per day, matched to each student's level and weak areas.",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    description:
      "Instant answers to equine questions — from lameness signs to feed ratios, available 24/7.",
  },
  {
    icon: GraduationCap,
    title: "Teacher Dashboard",
    description:
      "Manage cohorts, assign lessons, track progress, and generate reports for students and parents.",
  },
  {
    icon: Award,
    title: "Achievements & Portfolio",
    description:
      "Students earn certificates, build a verifiable learning portfolio, and track milestones.",
  },
];

const testimonials = [
  {
    name: "Sarah Thompson",
    role: "Dressage Rider & Horse Owner",
    content:
      "EquiProfile has completely revolutionised how I manage my horses' health records. I used to lose track of vaccination dates and farrier visits — now everything is in one place with smart reminders.",
    rating: 5,
    avatar: "ST",
  },
  {
    name: "James Whitfield",
    role: "Riding School Owner — 35 Students",
    content:
      "We switched from paper-based tracking to EquiProfile for our school and the difference is night and day. Teachers can assign lessons, track student progression, and parents love the progress reports.",
    rating: 5,
    avatar: "JW",
  },
  {
    name: "Emily Hart",
    role: "BHS Stage 3 Student",
    content:
      "The learning pathways are brilliant — I can study equine nutrition and welfare at my own pace, and the daily practice scenarios really test my knowledge. The AI tutor is great for quick questions.",
    rating: 5,
    avatar: "EH",
  },
  {
    name: "Michael Chen",
    role: "Stable Manager — 25+ Horses",
    content:
      "Managing a large stable used to be overwhelming. EquiProfile makes it simple, organised, and efficient. The time savings on health tracking and scheduling alone have been incredible.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Lucy Brennan",
    role: "Equine Studies Teacher",
    content:
      "Being able to see exactly where each student is in their learning journey is invaluable. I can spot weak areas, set targeted assignments, and track improvement over time.",
    rating: 5,
    avatar: "LB",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Sign up for a free 7-day trial. No credit card required — choose the plan that fits your needs.",
  },
  {
    step: "02",
    title: "Set Up Your Stable",
    description: "Add your horses with profiles, health records, and documents. Or enrol as a student to start learning.",
  },
  {
    step: "03",
    title: "Manage & Learn",
    description: "Track health, log training, follow learning pathways, and let smart reminders keep everything on schedule.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, TESTIMONIAL_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen overflow-hidden">
          {/* ─── Hero Section ─── */}
          <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-[72px]">
            <div className="absolute inset-0 z-0">
              <ImageSlider
                slides={heroSlides}
                interval={6000}
                showArrows={false}
                showDots={false}
                showText={false}
                className="w-full h-full"
                overlayClass="bg-gradient-to-b from-[#1a3a5c]/80 via-[#1a3a5c]/50 to-transparent"
              />
            </div>

            <div className="container relative z-10 pb-16 px-4">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  <span className="inline-block mb-5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium tracking-wide border border-white/20">
                    Trusted by horse owners, students &amp; schools across the UK
                  </span>

                  <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-2xl">
                    Professional Horse Management
                    <br />
                    <span className="text-[#7dd3c0]">&amp;</span>{" "}
                    Equestrian Learning
                  </h1>

                  <p className="text-lg md:text-xl text-white/85 mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow-lg">
                    Health records, training logs, nutrition plans — plus 95+
                    structured lessons across 15 pathways. One platform for
                    owners, students, teachers, and schools.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                      size="lg"
                      className="text-lg px-10 py-6 bg-[#2e6da4] hover:bg-[#245a8a] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all group border-0"
                      asChild
                    >
                      <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                        {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-lg px-10 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm shadow-lg hover:scale-105 transition-all"
                      asChild
                    >
                      <Link href="/features">Explore Features</Link>
                    </Button>
                  </div>

                  <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#7dd3c0]" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#4a9eca]" />
                      <span>7-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#7dd3c0]" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ─── How It Works ─── */}
          <section className="py-20 md:py-28 bg-white">
            <div className="container px-4">
              <ScrollReveal>
                <div className="text-center mb-16">
                  <p className="text-[#3a9d8f] font-semibold text-sm uppercase tracking-widest mb-3">
                    Simple to get started
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a3a5c] mb-4">
                    How It Works
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Get up and running in minutes — whether you're managing a
                    stable or starting your equestrian education.
                  </p>
                </div>
              </ScrollReveal>

              <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {howItWorks.map((item, idx) => (
                  <StaggerItem key={idx}>
                    <div className="text-center group">
                      <div className="w-16 h-16 rounded-full bg-[#2e6da4]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2e6da4]/20 transition-colors">
                        <span className="text-[#2e6da4] font-bold text-xl font-serif">
                          {item.step}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#1a3a5c] mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>

          {/* ─── Two Products Overview ─── */}
          <section className="py-20 md:py-28 bg-[#f8f6f3]">
            <div className="container px-4">
              <ScrollReveal>
                <div className="text-center mb-16">
                  <p className="text-[#3a9d8f] font-semibold text-sm uppercase tracking-widest mb-3">
                    Two platforms, one account
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a3a5c] mb-4">
                    Everything Equestrian, In One Place
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Whether you manage horses or want to learn, EquiProfile has a
                    purpose-built solution for you.
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Horse Management Card */}
                <ScrollReveal direction="left">
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src="/images/hero/image2.jpg"
                        alt="Horse management"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/70 to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2e6da4] text-white text-sm font-medium">
                          <Stethoscope className="w-4 h-4" />
                          Pro &amp; Stable Plans
                        </span>
                      </div>
                    </div>
                    <div className="p-7 flex-1 flex flex-col">
                      <h3 className="font-serif text-2xl font-bold text-[#1a3a5c] mb-2">
                        Horse Management Platform
                      </h3>
                      <p className="text-gray-600 mb-5 leading-relaxed">
                        Complete stable management — health records, training
                        logs, nutrition plans, documents, weather, and more.
                        Built for single-horse owners to multi-horse stables.
                      </p>
                      <ul className="space-y-2 mb-6 flex-1">
                        {["Health &amp; vet record tracking", "Training &amp; performance logs", "Nutrition plans &amp; cost tracking", "Document storage &amp; reminders", "Weather &amp; riding suitability"].map(
                          (item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <Check className="w-4 h-4 text-[#2e6da4] mt-0.5 shrink-0" />
                              <span dangerouslySetInnerHTML={{ __html: item }} />
                            </li>
                          ),
                        )}
                      </ul>
                      <Button
                        className="bg-[#2e6da4] hover:bg-[#245a8a] text-white group w-full"
                        asChild
                      >
                        <Link href="/features">
                          Explore Management Features
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>

                {/* Learning Platform Card */}
                <ScrollReveal direction="right">
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src="/images/hero/image3.jpg"
                        alt="Equestrian learning"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/70 to-transparent" />
                      <div className="absolute bottom-4 left-6">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3a9d8f] text-white text-sm font-medium">
                          <GraduationCap className="w-4 h-4" />
                          Student Plan
                        </span>
                      </div>
                    </div>
                    <div className="p-7 flex-1 flex flex-col">
                      <h3 className="font-serif text-2xl font-bold text-[#1a3a5c] mb-2">
                        Learning Platform
                      </h3>
                      <p className="text-gray-600 mb-5 leading-relaxed">
                        95+ structured lessons across 15 pathways with AI
                        tutoring, daily practice, and progression tracking.
                        Perfect for students, teachers, and riding schools.
                      </p>
                      <ul className="space-y-2 mb-6 flex-1">
                        {["15 pathways from beginner to advanced", "AI tutor for instant answers", "Daily scenario-based practice", "Teacher dashboards &amp; cohort management", "Certificates &amp; learning portfolios"].map(
                          (item, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                              <Check className="w-4 h-4 text-[#3a9d8f] mt-0.5 shrink-0" />
                              <span dangerouslySetInnerHTML={{ __html: item }} />
                            </li>
                          ),
                        )}
                      </ul>
                      <Button
                        className="bg-[#3a9d8f] hover:bg-[#2e8577] text-white group w-full"
                        asChild
                      >
                        <Link href="/students">
                          Explore Learning Platform
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* ─── Horse Management Features ─── */}
          <section className="py-20 md:py-28 bg-white">
            <div className="container px-4">
              <ScrollReveal>
                <div className="text-center mb-16">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2e6da4]/10 text-[#2e6da4] text-sm font-semibold mb-4">
                    <Stethoscope className="w-4 h-4" />
                    Horse Management
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a3a5c] mb-4">
                    Everything Your Stable Needs
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Professional tools for health tracking, training, nutrition,
                    and document management — for one horse or a hundred.
                  </p>
                </div>
              </ScrollReveal>

              <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {managementFeatures.map((feature, idx) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <StaggerItem key={idx}>
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 h-full group">
                        <div className="w-12 h-12 rounded-xl bg-[#2e6da4]/10 flex items-center justify-center mb-4 group-hover:bg-[#2e6da4]/20 transition-colors">
                          <FeatureIcon className="w-6 h-6 text-[#2e6da4]" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[#1a3a5c] mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>

              <div className="text-center mt-12">
                <Button
                  size="lg"
                  className="bg-[#2e6da4] hover:bg-[#245a8a] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all group"
                  asChild
                >
                  <Link href="/features">
                    View All Features
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* ─── Learning Platform Features ─── */}
          <section className="py-20 md:py-28 bg-[#f8f6f3]">
            <div className="container px-4">
              <ScrollReveal>
                <div className="text-center mb-16">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3a9d8f]/10 text-[#3a9d8f] text-sm font-semibold mb-4">
                    <GraduationCap className="w-4 h-4" />
                    Learning Platform
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a3a5c] mb-4">
                    95+ Lessons. 15 Pathways. One Goal.
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    A structured equestrian education platform with AI tutoring,
                    daily practice, and progression tracking for students and
                    schools.
                  </p>
                </div>
              </ScrollReveal>

              <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {learningFeatures.map((feature, idx) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <StaggerItem key={idx}>
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 h-full group">
                        <div className="w-12 h-12 rounded-xl bg-[#3a9d8f]/10 flex items-center justify-center mb-4 group-hover:bg-[#3a9d8f]/20 transition-colors">
                          <FeatureIcon className="w-6 h-6 text-[#3a9d8f]" />
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[#1a3a5c] mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                <Button
                  size="lg"
                  className="bg-[#3a9d8f] hover:bg-[#2e8577] text-white shadow-md hover:shadow-lg hover:scale-105 transition-all group"
                  asChild
                >
                  <Link href="/students">
                    Explore Student Programme
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#3a9d8f] text-[#3a9d8f] hover:bg-[#3a9d8f]/5 shadow-sm hover:shadow-md hover:scale-105 transition-all"
                  asChild
                >
                  <Link href="/pricing?type=school">View School Pricing</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* ─── Quote Block ─── */}
          <section className="py-16 md:py-20 bg-white">
            <div className="container px-4">
              <ScrollReveal>
                <div className="max-w-3xl mx-auto text-center">
                  <p className="text-xl md:text-2xl font-serif text-[#1a3a5c] italic leading-relaxed">
                    "The difference between a good stable and a great one is{" "}
                    <span className="text-[#2e6da4] not-italic font-semibold">
                      the quality of the records behind it
                    </span>
                    ."
                  </p>
                  <p className="mt-5 text-gray-400 text-sm uppercase tracking-widest font-medium">
                    EquiProfile — Built for professionals who care deeply
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* ─── Testimonials ─── */}
          <section className="py-20 md:py-28 bg-[#f8f6f3]">
            <div className="container px-4">
              <ScrollReveal>
                <div className="text-center mb-14">
                  <p className="text-[#3a9d8f] font-semibold text-sm uppercase tracking-widest mb-3">
                    Testimonials
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a3a5c] mb-4">
                    Loved by Equestrians
                  </h2>
                </div>
              </ScrollReveal>

              <div className="max-w-4xl mx-auto relative">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 md:p-12">
                  <div className="mb-5 flex gap-1">
                    {[...Array(testimonials[activeTestimonial].rating)].map(
                      (_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-amber-400 text-amber-400"
                        />
                      ),
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.blockquote
                      key={activeTestimonial}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="text-lg md:text-xl leading-relaxed mb-8 text-[#1a3a5c]"
                    >
                      "{testimonials[activeTestimonial].content}"
                    </motion.blockquote>
                  </AnimatePresence>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2e6da4] to-[#4a9eca] flex items-center justify-center text-white font-bold text-lg">
                      {testimonials[activeTestimonial].avatar}
                    </div>
                    <div>
                      <div className="font-bold text-[#1a3a5c]">
                        {testimonials[activeTestimonial].name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {testimonials[activeTestimonial].role}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className="relative flex items-center justify-center min-w-[44px] min-h-[44px] transition-all duration-300"
                      aria-label={`Go to testimonial ${index + 1}`}
                      aria-current={
                        index === activeTestimonial ? "true" : undefined
                      }
                    >
                      <span
                        className={`rounded-full transition-all duration-300 ${
                          index === activeTestimonial
                            ? "bg-[#2e6da4] w-10 h-2.5"
                            : "bg-gray-300 w-2.5 h-2.5 hover:bg-gray-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setActiveTestimonial(
                      (prev) =>
                        (prev - 1 + testimonials.length) % testimonials.length,
                    )
                  }
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-14 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:shadow-lg hover:bg-gray-50 flex items-center justify-center transition-all duration-300 text-[#1a3a5c]"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveTestimonial(
                      (prev) => (prev + 1) % testimonials.length,
                    )
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-14 w-11 h-11 rounded-full bg-white shadow-md border border-gray-200 hover:shadow-lg hover:bg-gray-50 flex items-center justify-center transition-all duration-300 text-[#1a3a5c]"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

          {/* ─── Gallery Showcase ─── */}
          <section className="py-20 md:py-28 bg-white">
            <div className="container px-4">
              <ScrollReveal>
                <div className="text-center mb-14">
                  <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a3a5c] mb-4">
                    Built for the Way You Work
                  </h2>
                  <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    From the yard to the classroom — EquiProfile fits seamlessly
                    into your equestrian life.
                  </p>
                </div>
              </ScrollReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
                {[1, 4, 7, 10].map((num) => (
                  <ScrollReveal key={num} delay={num * 0.05}>
                    <div className="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <img
                        src={`/images/gallery/${num}.jpg`}
                        alt="Equestrian life"
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ─── Final CTA ─── */}
          <section className="py-20 md:py-28 bg-[#1a3a5c] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#2e6da4]/20 via-transparent to-[#3a9d8f]/20 pointer-events-none" />
            <div className="container px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-center"
              >
                <Award className="w-12 h-12 text-[#7dd3c0] mx-auto mb-6" />
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5">
                  Ready to Transform Your
                  <br />
                  Horse Management?
                </h2>
                <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-xl mx-auto">
                  Join equestrians who trust EquiProfile. Start your free 7-day
                  trial — no credit card required.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="text-base px-10 py-5 bg-white text-[#1a3a5c] hover:bg-white/90 shadow-xl hover:shadow-2xl hover:scale-105 transition-all group border-0 font-semibold"
                    asChild
                  >
                    <Link href="/register">
                      Start Free Trial
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-10 py-5 bg-transparent text-white border-white/30 hover:bg-white/10 shadow-lg hover:scale-105 transition-all"
                    asChild
                  >
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>

                <div className="mt-10 flex items-center justify-center gap-6 text-white/70 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>7-day trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Cancel anytime</span>
                  </div>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/60 text-xs">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Install as an app on iPhone or Android — works offline
                  </span>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
}
