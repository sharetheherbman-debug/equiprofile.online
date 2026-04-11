import { useAuth } from "@/_core/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { heroSlides } from "@/config/marketingAssets";
import { coreFeatures, featureHighlights } from "@/content/features";
import { ImageSlider } from "@/components/ImageSlider";
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
  AlertTriangle,
  TrendingUp,
  Folder,
  Brain,
  Smartphone,
  GraduationCap,
  BookOpen,
  Trophy,
  Sparkles,
} from "lucide-react";

const TESTIMONIAL_ROTATION_INTERVAL = 6000;

const painPoints = [
  {
    icon: AlertTriangle,
    problem: "Lost in paperwork and missed records",
    solution:
      "Every vaccination, vet visit, farrier appointment, and treatment is logged and instantly searchable—no more digging through folders or relying on memory.",
  },
  {
    icon: Calendar,
    problem: "Forgotten schedules and missed appointments",
    solution:
      "Automated reminders for health events, training sessions, and farrier visits keep you ahead of every deadline—before it becomes a problem.",
  },
  {
    icon: TrendingUp,
    problem: "No visibility into training progress",
    solution:
      "Track sessions, log performance, and spot trends over time. Know exactly what's working and when your horse needs adjustment.",
  },
  {
    icon: Folder,
    problem: "Documents scattered across email and phone",
    solution:
      "Passports, insurance docs, competition records, and invoices stored in organised folders—accessible anywhere, at any time.",
  },
  {
    icon: Brain,
    problem: "Inconsistent feeding across multiple horses",
    solution:
      "Build individual nutrition plans, track feed costs, and ensure every horse gets exactly what they need—regardless of who's doing the feeding.",
  },
  {
    icon: CloudSun,
    problem: "Riding in unsafe weather without guidance",
    solution:
      "Live weather data with real-time riding suitability advice. Know before you tack up whether conditions are safe for outdoor work.",
  },
];

const testimonials = [
  {
    name: "Sarah Thompson",
    role: "Professional Dressage Rider",
    content:
      "EquiProfile has completely revolutionized how I manage my horses. The health tracking and intelligent reminders have been absolutely invaluable for maintaining peak performance!",
    rating: 5,
    avatar: "ST",
  },
  {
    name: "Michael Chen",
    role: "Stable Manager - 25+ Horses",
    content:
      "Managing a large stable used to be overwhelming. EquiProfile makes it simple, organised, and efficient. The time savings alone have been incredible. Highly recommend!",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emma Rodriguez",
    role: "Eventing Trainer & Coach",
    content:
      "The training logs and analytics are phenomenal. I can see progress clearly, identify areas for improvement, and share detailed updates with clients easily. Game-changing!",
    rating: 5,
    avatar: "ER",
  },
];

export default function HomeV2() {
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
      <div className="min-h-screen bg-[#f7f8fa] dark:bg-[#0f1219]">
        {/* ===== Hero Section ===== */}
        <section
          className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-[72px]"
          aria-label="Hero"
        >
          {/* Background slider */}
          <div className="absolute inset-0 z-0">
            <ImageSlider
              slides={heroSlides}
              interval={6000}
              showArrows={false}
              showDots={false}
              showText={false}
              className="w-full h-full"
              overlayClass="bg-[#0f1219]/60"
            />
          </div>

          {/* Hero content */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-16 text-center">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 text-white tracking-tight">
              Professional Horse
              <br />
              Management Made{" "}
              <span className="text-[#8b9cf7]">Simple</span>
            </h1>

            <p className="text-base md:text-lg lg:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto font-sans">
              One platform for health records, GPS tracking, training, and the
              digital passport that keeps your horse's care organised and
              shareable.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 text-base px-8 py-3.5 bg-[#4f5fd6] hover:bg-[#4554c4] text-white font-medium rounded-lg transition-colors duration-200 shadow-md"
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div
              className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/60"
              aria-label="Trust indicators"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-white/50" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/50" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-white/50" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Feature Highlights Section ===== */}
        <section
          className="py-20 md:py-24 bg-[#f7f8fa] dark:bg-[#0f1219]"
          aria-label="Feature highlights"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#1a1d24] dark:text-white tracking-tight">
                Powerful Features Built for{" "}
                <span className="text-[#4f5fd6]">Modern Stables</span>
              </h2>
              <p className="text-lg text-[#5a5e6b] dark:text-white/60 max-w-2xl mx-auto font-sans">
                Discover the tools that make horse management effortless
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {featureHighlights.map((feature, index) => (
                <article
                  key={index}
                  className="group rounded-xl border border-[#e2e4ea] dark:border-white/10 bg-white dark:bg-[#1a1d24] p-8 hover:border-[#4f5fd6]/30 dark:hover:border-[#4f5fd6]/40 transition-colors duration-200"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#4f5fd6]/10 dark:bg-[#4f5fd6]/15 flex items-center justify-center mb-5">
                    <img
                      src={feature.icon}
                      alt=""
                      className="w-7 h-7"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#1a1d24] dark:text-white font-sans">
                    {feature.title}
                  </h3>
                  <p className="text-[#5a5e6b] dark:text-white/60 text-base leading-relaxed font-sans">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/features"
                className="inline-flex items-center gap-2 text-base px-7 py-3 bg-[#4f5fd6] hover:bg-[#4554c4] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                View All Features
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== Quote Block ===== */}
        <section
          className="py-16 md:py-20 bg-white dark:bg-[#141720]"
          aria-label="Quote"
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-lg md:text-2xl font-serif text-[#1a1d24] dark:text-white/90 italic leading-relaxed">
              "The difference between a good stable and a great one is{" "}
              <span className="not-italic font-semibold text-[#4f5fd6]">
                the quality of the records behind it
              </span>
              ."
            </p>
            <p className="mt-6 text-[#8b8f9c] dark:text-white/40 text-sm uppercase tracking-widest font-medium font-sans">
              EquiProfile — Built for professionals who care deeply
            </p>
            <div className="mt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-base px-7 py-3 bg-[#4f5fd6] hover:bg-[#4554c4] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </section>

        {/* ===== Core Features Grid ===== */}
        <section
          className="py-20 md:py-24 bg-[#f7f8fa] dark:bg-[#0f1219]"
          aria-label="Core features"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4f5fd6]/10 dark:bg-[#4f5fd6]/15 text-[#4f5fd6] text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Powerful Features
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-[#1a1d24] dark:text-white tracking-tight">
                Comprehensive Features for
                <br />
                <span className="text-[#4f5fd6]">Complete Horse Care</span>
              </h2>
              <p className="text-lg text-[#5a5e6b] dark:text-white/60 max-w-3xl mx-auto font-sans">
                From health tracking to training logs, EquiProfile provides
                everything you need for professional horse management.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreFeatures.map((feature, index) => (
                <article
                  key={index}
                  className="group rounded-xl border border-[#e2e4ea] dark:border-white/10 bg-white dark:bg-[#1a1d24] p-8 hover:border-[#4f5fd6]/30 dark:hover:border-[#4f5fd6]/40 hover:shadow-lg hover:shadow-[#4f5fd6]/5 transition-all duration-200"
                >
                  <div className="w-14 h-14 rounded-xl bg-[#4f5fd6]/10 dark:bg-[#4f5fd6]/15 flex items-center justify-center mb-5 group-hover:bg-[#4f5fd6]/15 dark:group-hover:bg-[#4f5fd6]/20 transition-colors duration-200">
                    <img
                      src={feature.icon}
                      alt=""
                      className="w-7 h-7"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#1a1d24] dark:text-white font-sans">
                    {feature.title}
                  </h3>
                  <p className="text-[#5a5e6b] dark:text-white/60 text-base leading-relaxed font-sans">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Testimonials ===== */}
        <section
          className="py-20 md:py-24 bg-white dark:bg-[#141720]"
          aria-label="Testimonials"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4f5fd6]/10 dark:bg-[#4f5fd6]/15 text-[#4f5fd6] text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                Testimonials
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#1a1d24] dark:text-white tracking-tight">
                Loved by Horse Owners
                <br />
                <span className="text-[#4f5fd6]">Around the World</span>
              </h2>
            </div>

            <div className="max-w-3xl mx-auto relative">
              {/* Testimonial card */}
              <div className="rounded-xl border border-[#e2e4ea] dark:border-white/10 bg-[#f7f8fa] dark:bg-[#1a1d24] p-8 md:p-12">
                <div aria-label={`Rated ${testimonials[activeTestimonial].rating} out of 5 stars`} className="mb-6 flex gap-1">
                  {[...Array(testimonials[activeTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                    ),
                  )}
                </div>
                <blockquote className="text-lg md:text-xl leading-relaxed mb-8 text-[#1a1d24] dark:text-white font-sans">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full bg-[#4f5fd6] flex items-center justify-center text-white font-semibold text-lg"
                    aria-hidden="true"
                  >
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-base text-[#1a1d24] dark:text-white font-sans">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-[#5a5e6b] dark:text-white/60 text-sm font-sans">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation dots */}
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className="relative flex items-center justify-center min-w-[44px] min-h-[44px] transition-all duration-200"
                    aria-label={`Go to testimonial ${index + 1}`}
                    aria-current={
                      index === activeTestimonial ? "true" : undefined
                    }
                  >
                    <span
                      className={`rounded-full transition-all duration-200 ${
                        index === activeTestimonial
                          ? "bg-[#4f5fd6] w-10 h-2"
                          : "bg-[#d1d3da] dark:bg-white/20 w-2 h-2"
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Arrow controls */}
              <button
                onClick={() =>
                  setActiveTestimonial(
                    (prev) =>
                      (prev - 1 + testimonials.length) % testimonials.length,
                  )
                }
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-14 w-11 h-11 rounded-full border border-[#e2e4ea] dark:border-white/10 bg-white dark:bg-[#1a1d24] hover:border-[#4f5fd6]/40 flex items-center justify-center transition-colors duration-200 text-[#5a5e6b] dark:text-white/60 hover:text-[#4f5fd6]"
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
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-14 w-11 h-11 rounded-full border border-[#e2e4ea] dark:border-white/10 bg-white dark:bg-[#1a1d24] hover:border-[#4f5fd6]/40 flex items-center justify-center transition-colors duration-200 text-[#5a5e6b] dark:text-white/60 hover:text-[#4f5fd6]"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ===== Pain Points Section ===== */}
        <section
          className="py-20 md:py-24 bg-[#f7f8fa] dark:bg-[#0f1219]"
          aria-label="Problems we solve"
        >
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4f5fd6]/10 dark:bg-[#4f5fd6]/15 text-[#4f5fd6] text-sm font-medium mb-4">
                <AlertTriangle className="w-4 h-4" />
                The Problems We Solve
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#1a1d24] dark:text-white tracking-tight">
                Every horse owner knows{" "}
                <span className="text-[#4f5fd6]">these struggles</span>
              </h2>
              <p className="text-lg text-[#5a5e6b] dark:text-white/60 max-w-2xl mx-auto font-sans">
                EquiProfile was built to solve the real, daily problems that make
                horse ownership harder than it should be.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {painPoints.map((item, index) => {
                const ItemIcon = item.icon;
                return (
                  <article
                    key={index}
                    className="rounded-xl border border-[#e2e4ea] dark:border-white/10 bg-white dark:bg-[#1a1d24] p-6 hover:border-[#4f5fd6]/30 dark:hover:border-[#4f5fd6]/40 transition-colors duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-lg bg-[#4f5fd6]/10 dark:bg-[#4f5fd6]/15 flex items-center justify-center shrink-0">
                        <ItemIcon className="w-5 h-5 text-[#4f5fd6]" />
                      </div>
                      <div>
                        <p className="text-[#8b8f9c] dark:text-white/40 text-xs font-medium uppercase tracking-wider mb-1 font-sans">
                          The problem
                        </p>
                        <h3 className="text-[#1a1d24] dark:text-white font-semibold text-base mb-2 font-sans">
                          {item.problem}
                        </h3>
                        <p className="text-[#5a5e6b] dark:text-white/60 text-sm leading-relaxed font-sans">
                          {item.solution}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== Student Section ===== */}
        <section
          className="py-20 md:py-24 bg-white dark:bg-[#141720]"
          aria-label="For Students"
        >
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4f5fd6]/10 dark:bg-[#4f5fd6]/15 text-[#4f5fd6] dark:text-[#8b9cf7] text-sm font-medium mb-4">
                <GraduationCap className="w-4 h-4" />
                Equestrian Education
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-[#1a1d24] dark:text-white tracking-tight">
                Built for the Next Generation of{" "}
                <span className="text-[#4f5fd6]">Horsemen &amp; Horsewomen</span>
              </h2>
              <p className="text-lg text-[#5a5e6b] dark:text-white/60 max-w-2xl mx-auto font-sans">
                EquiProfile for Students gives every learner a professional-grade
                dashboard — the same tools working yards rely on, adapted for education.
                From £5/month.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {[
                {
                  icon: Sparkles,
                  title: "Your Own Horse to Manage",
                  description:
                    "Start with a virtual horse to practise care routines safely, or manage a real horse assigned by your school. Build genuine responsibility from day one.",
                },
                {
                  icon: BookOpen,
                  title: "Study Hub & AI Tutor",
                  description:
                    "Access structured learning materials aligned to BHS and Pony Club syllabi. Get instant, knowledgeable answers from an AI tutor whenever you need them.",
                },
                {
                  icon: Trophy,
                  title: "Portfolios & Progress Reports",
                  description:
                    "Log every lesson, task, and care session. Earn achievement badges, build a verifiable portfolio, and generate reports for parents, trainers, and assessors.",
                },
              ].map((item, i) => {
                const ItemIcon = item.icon;
                return (
                  <article
                    key={i}
                    className="rounded-xl border border-[#e2e4ea] dark:border-white/10 bg-[#f7f8fa] dark:bg-[#1a1d24] p-7 hover:border-[#4f5fd6]/30 dark:hover:border-[#4f5fd6]/40 transition-colors duration-200"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#4f5fd6]/10 dark:bg-[#4f5fd6]/15 flex items-center justify-center mb-5">
                      <ItemIcon className="w-6 h-6 text-[#4f5fd6] dark:text-[#8b9cf7]" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[#1a1d24] dark:text-white font-sans">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#5a5e6b] dark:text-white/60 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                href="/students"
                className="inline-flex items-center gap-2 text-base px-7 py-3 bg-[#4f5fd6] hover:bg-[#4554c4] text-white font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                Explore the Student Programme
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ===== Final CTA Section ===== */}
        <section
          className="py-16 md:py-20 bg-[#4f5fd6]"
          aria-label="Call to action"
        >
          <div className="max-w-3xl mx-auto px-4 text-center">
            <Award className="w-12 h-12 text-white/80 mx-auto mb-6" />
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
              Ready to Transform Your
              <br />
              Horse Management?
            </h2>
            <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed font-sans">
              Join equestrians who trust EquiProfile to care for their horses.
              Start your free 7-day trial—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 text-base px-8 py-3.5 bg-white text-[#4f5fd6] font-semibold rounded-lg hover:bg-white/90 transition-colors duration-200 shadow-md"
              >
                Start Free Trial
                <ChevronRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 text-base px-8 py-3.5 bg-transparent text-white font-medium rounded-lg border border-white/30 hover:bg-white/10 transition-colors duration-200"
              >
                Contact Sales
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-white/70 text-sm flex-wrap">
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
            {/* PWA install hint */}
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/70 text-xs">
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>
                Install as an app on iPhone or Android — works offline
              </span>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
