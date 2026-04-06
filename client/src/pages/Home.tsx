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
    gradient: "from-indigo-500 to-violet-500",
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
        <div className="min-h-screen overflow-hidden bg-[#0a1628]">
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
                overlayClass="bg-[#0a1628]/50"
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
                    Professional Horse
                    <br />
                    Management Made{" "}
                    <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                      Simple
                    </span>
                  </h1>

                  <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 leading-relaxed max-w-3xl mx-auto drop-shadow-lg">
                    One platform for health records, GPS tracking, training,
                    and the digital passport that keeps your horse's care
                    organised and shareable.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link href={isAuthenticated ? "/dashboard" : "/register"}>
                      <Button
                        size="lg"
                        className="text-lg px-10 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-2xl hover:scale-105 transition-transform group border-0"
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
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>14-day free trial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-cyan-400" />
                      <span>Cancel anytime</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Features Highlight Section */}
          <section className="py-20 bg-[#0f2040] relative overflow-hidden">
            <div className="container px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-white">
                  Powerful Features Built for{" "}
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    Modern Stables
                  </span>
                </h2>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                  Discover the tools that make horse management effortless
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
                    className="text-lg px-8 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-xl hover:scale-105 transition-transform group border-0"
                  >
                    View All Features
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Premium CTA Quote Block */}
          <section className="py-20 bg-[#0a1628] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 via-black to-cyan-900/20 pointer-events-none" />
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
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent not-italic font-semibold">
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
                      className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 px-8 hover:scale-105 transition-transform"
                    >
                      Start Your Free Trial
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-24 bg-[#0a1628] relative">
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
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
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
                    <Card className="h-full bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 group cursor-pointer">
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
          <section className="py-24 bg-[#0f2040] relative overflow-hidden">
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
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
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
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
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
                            ? "bg-gradient-to-r from-indigo-500 to-cyan-500 w-12 h-2"
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
          <section className="py-24 bg-[#0f2040] relative">
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
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
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
          <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600" />
            <div className="absolute inset-0 bg-[url('/assets/pattern.svg')] opacity-10" />
            <div className="container px-4 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="max-w-3xl mx-auto text-center bg-[#0a1628]/40 backdrop-blur-md border border-white/20 p-8 md:p-12 rounded-3xl"
              >
                <Award className="w-14 h-14 text-white mx-auto mb-6" />
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your
                  <br />
                  Horse Management?
                </h2>
                <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed">
                  Join equestrians who trust EquiProfile to care for their
                  horses. Start your free 14-day trial—no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="text-base px-10 py-5 bg-white text-indigo-600 hover:bg-white/90 shadow-2xl hover:scale-105 transition-transform group border-0"
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
                    <span>14-day trial</span>
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
