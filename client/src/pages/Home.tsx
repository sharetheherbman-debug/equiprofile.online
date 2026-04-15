import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  TrendingUp,
  Folder,
  Brain,
  Smartphone,
  GraduationCap,
  BookOpen,
  Target,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { marketingAssets, heroSlides } from "@/config/marketingAssets";
import { motion, AnimatePresence } from "framer-motion";
import { coreFeatures, featureHighlights } from "@/content/features";
import { ImageSlider } from "@/components/ImageSlider";

const TESTIMONIAL_ROTATION_INTERVAL = 6000;

const painPoints = [
  {
    icon: AlertTriangle,
    gradient: "from-rose-500 to-pink-500",
    problem: "Lost in paperwork and missed records",
    solution:
      "Every vaccination, vet visit, farrier appointment, and treatment is logged and instantly searchable—no more digging through folders or relying on memory.",
  },
  {
    icon: Calendar,
    gradient: "from-amber-500 to-orange-500",
    problem: "Forgotten schedules and missed appointments",
    solution:
      "Automated reminders for health events, training sessions, and farrier visits keep you ahead of every deadline—before it becomes a problem.",
  },
  {
    icon: TrendingUp,
    gradient: "from-cyan-500 to-blue-500",
    problem: "No visibility into training progress",
    solution:
      "Track sessions, log performance, and spot trends over time. Know exactly what's working and when your horse needs adjustment.",
  },
  {
    icon: Folder,
    gradient: "from-[#5b8def] to-[#3a93b8]",
    problem: "Documents scattered across email and phone",
    solution:
      "Passports, insurance docs, competition records, and invoices stored in organised folders—accessible anywhere, at any time.",
  },
  {
    icon: Brain,
    gradient: "from-emerald-500 to-teal-500",
    problem: "Inconsistent feeding across multiple horses",
    solution:
      "Build individual nutrition plans, track feed costs, and ensure every horse gets exactly what they need—regardless of who's doing the feeding.",
  },
  {
    icon: CloudSun,
    gradient: "from-sky-500 to-cyan-500",
    problem: "Riding in unsafe weather without guidance",
    solution:
      "Live weather data with real-time riding suitability advice. Know before you tack up whether conditions are safe for outdoor work.",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Sarah Thompson",
      role: "Dressage Rider & Horse Owner",
      content:
        "EquiProfile has completely revolutionised how I manage my horses' health records. I used to lose track of vaccination dates and farrier visits — now everything is in one place with smart reminders. My vet was impressed!",
      rating: 5,
      avatar: "ST",
    },
    {
      name: "James Whitfield",
      role: "Riding School Owner — 35 Students",
      content:
        "We switched from paper-based tracking to EquiProfile for our school and the difference is night and day. Teachers can assign lessons, track student progression, and parents love the progress reports. Worth every penny.",
      rating: 5,
      avatar: "JW",
    },
    {
      name: "Emily Hart",
      role: "BHS Stage 3 Student",
      content:
        "The learning pathways are brilliant — I can study equine nutrition and welfare at my own pace, and the daily practice scenarios really test my knowledge. The AI tutor is great for quick questions between lessons.",
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
        "Being able to see exactly where each student is in their learning journey is invaluable. I can spot weak areas, set targeted assignments, and track improvement over time. It's transformed my teaching.",
      rating: 5,
      avatar: "LB",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, TESTIMONIAL_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      <Navbar />
      <PageTransition>
        <div className="min-h-screen overflow-hidden bg-[#0b1726]">
          {/* Hero Section with Image Slider Background */}
          <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-[72px]">
            {/* Image Slider Background */}
            <div className="absolute inset-0 z-0">
              <ImageSlider
                slides={heroSlides}
                interval={6000}
                showArrows={false}
                showDots={false}
                showText={false}
                className="w-full h-full"
                overlayClass="bg-[#0b1726]/50"
              />
            </div>

            {/* Hero Content */}
            <div className="container relative z-10 pb-16 px-4">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-center"
                >
                  <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-2xl">
                    Horse Management &{" "}
                    <span className="bg-gradient-to-r from-[#5b8def] to-[#7dd3c0] bg-clip-text text-transparent">
                      Equestrian Learning
                    </span>
                    <br />
                    in One Platform
                  </h1>

                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                    Health records, training logs, GPS tracking, and a
                    complete learning portal with 95 lessons across 15
                    pathways — for owners, students, teachers, and schools.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                      <Button
                        size="lg"
                        className="text-lg px-10 py-6 bg-gradient-to-r from-[#2e86ab] to-[#5b8def] hover:from-[#1a5276] hover:to-[#4a7dd4] text-white shadow-2xl hover:scale-105 transition-transform group border-0"
                      >
                        {isAuthenticated
                          ? "Go to Dashboard"
                          : "Start Free Trial"}
                        <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>

                  {/* Trust indicators */}
                  <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>No credit card required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#5b8def]" />
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

          {/* Features Highlight Section */}
          <section className="py-20 bg-[#101f3a] relative overflow-hidden">
            <div className="container px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
                  Powerful Features for{" "}
                  <span className="bg-gradient-to-r from-[#5b8def] to-[#7dd3c0] bg-clip-text text-transparent">
                    Modern Equestrians
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  From health tracking to structured learning — everything you need in one platform
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                {featureHighlights.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 group">
                      <CardHeader>
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}
                        >
                          <img src={feature.icon} alt="" className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl mb-2 text-white">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed text-white/70">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Link href="/features">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 bg-gradient-to-r from-[#2e86ab] to-[#5b8def] hover:from-[#1a5276] hover:to-[#4a7dd4] text-white shadow-xl hover:scale-105 transition-transform group border-0"
                  >
                    View All Features
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Premium CTA Quote Block */}
          <section className="py-20 bg-[#0b1726] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a6e]/20 via-black to-[#1a6e5e]/20 pointer-events-none" />
            <div className="container px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-center"
              >
                <p className="text-lg md:text-2xl font-serif text-white/90 italic leading-relaxed">
                  "The difference between a good stable and a great one is{" "}
                  <span className="bg-gradient-to-r from-[#5b8def] to-[#7dd3c0] bg-clip-text text-transparent not-italic font-semibold">
                    the quality of the records behind it
                  </span>
                  ."
                </p>
                <p className="mt-6 text-white/50 text-sm uppercase tracking-widest font-medium">
                  EquiProfile — Built for professionals who care deeply
                </p>
                <div className="mt-8">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#2e86ab] to-[#5b8def] hover:from-[#3a93b8] hover:to-[#5b8def] text-white border-0 shadow-lg shadow-[#5b8def]/20 px-8 hover:scale-105 transition-transform"
                    >
                      Start Your Free Trial
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Learning Platform Section */}
          <section className="py-28 bg-gradient-to-b from-[#0b1726] via-[#0f1e38] to-[#0b1726] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a3a6e]/15 via-transparent to-transparent pointer-events-none" />
            <div className="container px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-14"
              >
                <Badge className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-[#5b8def]/10 backdrop-blur-md border-[#5b8def]/20 text-[#7baaf5]">
                  <GraduationCap className="w-4 h-4" />
                  Equestrian Learning Portal
                </Badge>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
                  More Than Management —{" "}
                  <span className="bg-gradient-to-r from-[#5b8def] to-[#7dd3c0] bg-clip-text text-transparent">
                    A Complete Learning Platform
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-3xl mx-auto">
                  95 structured lessons across 15 pathways — from beginner to advanced.
                  Built for students, teachers, and riding schools.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                {[
                  { icon: BookOpen, title: "15 Learning Pathways", desc: "Horse care, rider skills, safety, nutrition, welfare, and more — structured across 4 levels", color: "from-[#5b8def] to-[#3a93b8]" },
                  { icon: Target, title: "Progression Gating", desc: "Students unlock content as they advance — Beginner → Developing → Intermediate → Advanced", color: "from-emerald-500 to-teal-500" },
                  { icon: Zap, title: "Daily Practice", desc: "3 fresh scenario challenges per day, matched to each student's level and weak areas", color: "from-amber-500 to-orange-500" },
                  { icon: Brain, title: "AI Tutor", desc: "Instant answers to equine questions — from lameness signs to feed ratios, available 24/7", color: "from-cyan-500 to-blue-500" },
                ].map((item, idx) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} p-3 mb-3 flex items-center justify-center`}>
                            <ItemIcon className="w-6 h-6 text-white" />
                          </div>
                          <CardTitle className="text-lg text-white">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-sm text-white/60">{item.desc}</CardDescription>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative rounded-2xl border border-[#5b8def]/20 bg-gradient-to-br from-[#5b8def]/10 to-[#3a93b8]/10 p-7 hover:border-[#5b8def]/40 transition-colors"
                >
                  <GraduationCap className="w-10 h-10 text-[#5b8def] mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">For Students & Riders</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Follow professional pathways covering horse care, rider skills, stable management, nutrition, and welfare.
                    Track your progress, earn achievements, and build a verifiable learning portfolio — all from £8/month.
                  </p>
                  <Link href="/students">
                    <Button className="bg-[#2e86ab] hover:bg-[#3a93b8] text-white border-0 group">
                      Explore Student Programme
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-7 hover:border-emerald-500/40 transition-colors"
                >
                  <Users className="w-10 h-10 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">For Schools & Organisations</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Manage cohorts, assign lessons, track student progress, and generate reports.
                    Seat-based pricing from £49/month — includes teacher accounts, AI tutor, and full lesson access.
                  </p>
                  <Link href="/pricing?type=school">
                    <Button className="bg-emerald-700 hover:bg-emerald-600 text-white border-0 group">
                      View School Pricing
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-28 bg-[#0b1726] relative">
            <div className="container px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <Badge className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <Zap className="w-4 h-4" />
                  Powerful Features
                </Badge>
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                  Comprehensive Features for
                  <br />
                  <span className="bg-gradient-to-r from-[#5b8def] to-[#7dd3c0] bg-clip-text text-transparent">
                    Complete Horse Care
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-3xl mx-auto">
                  From health tracking to training logs, EquiProfile provides
                  everything you need for professional horse management.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {coreFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-105 hover:shadow-2xl hover:shadow-[#5b8def]/20 transition-all duration-300 group cursor-pointer">
                      <CardHeader>
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}
                        >
                          <img src={feature.icon} alt="" className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl mb-2 text-white">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed text-white/70">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Carousel */}
          <section className="py-28 bg-[#101f3a] relative overflow-hidden">
            <div className="container px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <Badge className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <Users className="w-4 h-4" />
                  Testimonials
                </Badge>
                <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                  Loved by Horse Owners
                  <br />
                  <span className="bg-gradient-to-r from-[#5b8def] to-[#7dd3c0] bg-clip-text text-transparent">
                    Around the World
                  </span>
                </h2>
              </motion.div>

              <div className="max-w-4xl mx-auto relative">
                <Card className="bg-white/5 backdrop-blur-md border-white/10 p-8 md:p-12">
                  <CardContent className="p-0">
                    <div className="mb-6 flex gap-1">
                      {[...Array(testimonials[activeTestimonial].rating)].map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="w-6 h-6 fill-yellow-400 text-yellow-400"
                          />
                        ),
                      )}
                    </div>
                    <blockquote className="text-xl md:text-2xl leading-relaxed mb-8 text-white">
                      "{testimonials[activeTestimonial].content}"
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3a93b8] to-[#5b8def] flex items-center justify-center text-white font-bold text-xl">
                        {testimonials[activeTestimonial].avatar}
                      </div>
                      <div>
                        <div className="font-bold text-lg text-white">
                          {testimonials[activeTestimonial].name}
                        </div>
                        <div className="text-white/70">
                          {testimonials[activeTestimonial].role}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-center gap-3 mt-8">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`relative flex items-center justify-center min-w-[44px] min-h-[44px] transition-all duration-300`}
                      aria-label={`Go to testimonial ${index + 1}`}
                      aria-current={
                        index === activeTestimonial ? "true" : undefined
                      }
                    >
                      <span
                        className={`rounded-full transition-all duration-300 ${
                          index === activeTestimonial
                            ? "bg-gradient-to-r from-[#3a93b8] to-[#5b8def] w-12 h-2"
                            : "bg-white/30 w-2 h-2"
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 text-white"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setActiveTestimonial(
                      (prev) => (prev + 1) % testimonials.length,
                    )
                  }
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 text-white"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </section>

          {/* Pain Points Section */}
          <section className="py-28 bg-[#101f3a] relative">
            <div className="container px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <Badge className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border-white/20 text-white">
                  <AlertTriangle className="w-4 h-4" />
                  The Problems We Solve
                </Badge>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
                  Every horse owner knows{" "}
                  <span className="bg-gradient-to-r from-[#5b8def] to-[#7dd3c0] bg-clip-text text-transparent">
                    these struggles
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  EquiProfile was built to solve the real, daily problems that
                  make horse ownership harder than it should be.
                </p>
              </motion.div>

              <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">
                {painPoints.map((item, index) => {
                  const ItemIcon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      viewport={{ once: true }}
                      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} p-3 flex items-center justify-center shrink-0`}
                        >
                          <ItemIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">
                            The problem
                          </p>
                          <h3 className="text-white font-semibold text-base mb-2">
                            {item.problem}
                          </h3>
                          <p className="text-white/70 text-sm leading-relaxed">
                            {item.solution}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a5276] via-[#2e86ab] to-[#3a93b8]" />
            <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10" />
            <div className="container px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-center bg-[#0b1726]/40 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-3xl"
              >
                <Award className="w-14 h-14 text-white mx-auto mb-6" />
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your
                  <br />
                  Horse Management?
                </h2>
                <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed">
                  Join equestrians who trust EquiProfile to care for their
                  horses. Start your free 7-day trial—no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="text-base px-10 py-5 bg-white text-[#2e86ab] hover:bg-white/90 shadow-2xl hover:scale-105 transition-transform group border-0"
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
                    className="text-base px-10 py-5 bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-md shadow-xl hover:scale-105 transition-transform"
                    asChild
                  >
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
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
                <div className="mt-6 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white/70 text-xs backdrop-blur-sm">
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
