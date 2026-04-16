import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import {
  HeartPulse,
  Dumbbell,
  Salad,
  FileText,
  CloudSun,
  BarChart3,
  ArrowRight,
  ChevronRight,
  Star,
  Users,
  Server,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.7, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const stats = [
  { icon: HeartPulse, value: "Complete", label: "Health tracking" },
  { icon: Users, value: "All-in-one", label: "Stable management" },
  { icon: Server, value: "Cloud", label: "Hosted & secure" },
  { icon: Star, value: "UK-built", label: "Equine-first platform" },
];

const features = [
  {
    icon: HeartPulse,
    title: "Health Records",
    desc: "Centralise veterinary visits, vaccinations and medical history in one secure timeline.",
  },
  {
    icon: Dumbbell,
    title: "Training Logs",
    desc: "Track sessions, monitor progress and plan workouts tailored to each horse.",
  },
  {
    icon: Salad,
    title: "Nutrition Plans",
    desc: "Build custom feeding schedules, log supplements and adjust diets with ease.",
  },
  {
    icon: FileText,
    title: "Document Storage",
    desc: "Keep passports, insurance and certificates organised and accessible anywhere.",
  },
  {
    icon: CloudSun,
    title: "Weather & Riding",
    desc: "Real-time forecasts matched to your location so you can plan the perfect ride.",
  },
  {
    icon: BarChart3,
    title: "Insights & Reports",
    desc: "Beautiful dashboards and exportable reports to keep every stakeholder informed.",
  },
];

const testimonials = [
  {
    name: "Eleanor Whitfield",
    role: "Dressage Trainer, Berkshire",
    initials: "EW",
    quote:
      "EquiProfile transformed the way we manage our yard. Health records, feeding plans — everything in one place. I can't imagine going back.",
  },
  {
    name: "James Haverford",
    role: "Stable Owner, Yorkshire",
    initials: "JH",
    quote:
      "The training logs alone saved us hours every week. My grooms finally have a single source of truth they actually enjoy using.",
  },
  {
    name: "Sofia Lindgren",
    role: "Event Rider, Hampshire",
    initials: "SL",
    quote:
      "Beautifully designed and genuinely useful. The weather integration is a game-changer for scheduling — highly recommend.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <ManagementLayout>
      <div className="min-h-screen">
        {/* ======================== HERO ======================== */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          <img
            src="/images/hero/image1.jpg"
            alt="Horses in a field at sunset"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1d2e]/90 via-[#0f1d2e]/70 to-[#1a7a6d]/40" />

          <div className="relative z-10 container mx-auto px-4 pt-28 pb-20 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif text-white leading-tight max-w-5xl mx-auto"
            >
              Professional Horse
              <br />
              <span className="bg-gradient-to-r from-[#c5a55a] to-[#e8cf8a] bg-clip-text text-transparent">
                Management Software
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"
            >
              The all-in-one platform trusted by trainers, owners and stables to
              keep every horse healthy, happy and performing at its best.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-[#c5a55a] hover:bg-[#b8963f] text-[#0f1d2e] font-semibold px-8 h-12 text-base rounded-full shadow-lg shadow-[#c5a55a]/20"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-8 h-12 text-base rounded-full backdrop-blur-sm"
                >
                  Learn More
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* subtle bottom fade into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8f9fb] to-transparent" />
        </section>

        {/* ====================== STATS BAR ====================== */}
        <section className="relative bg-[#f8f9fb] py-14">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <AnimatedSection key={s.label} delay={i * 0.1} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#2e6da4]/10 mb-3">
                    <s.icon className="w-5 h-5 text-[#2e6da4]" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold font-serif text-[#0f1d2e]">
                    {s.value}
                  </p>
                  <p className="text-sm text-[#0f1d2e]/60 mt-1">{s.label}</p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FEATURES GRID ==================== */}
        <section className="bg-white py-20 md:py-28">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold tracking-widest uppercase text-[#1a7a6d] mb-3">
                Core Capabilities
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0f1d2e]">
                Everything you need, nothing you don't
              </h2>
              <p className="mt-4 text-[#0f1d2e]/60 text-lg">
                Six powerful modules designed by equestrians, for equestrians.
              </p>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((f, i) => (
                <AnimatedSection key={f.title} delay={i * 0.08}>
                  <div className="group relative rounded-2xl border border-[#0f1d2e]/5 bg-[#f8f9fb] p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[#2e6da4]/5 hover:-translate-y-1">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#2e6da4] to-[#4a9eca] text-white mb-5 shadow-md shadow-[#2e6da4]/20">
                      <f.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-[#0f1d2e] mb-2">
                      {f.title}
                    </h3>
                    <p className="text-[#0f1d2e]/60 leading-relaxed">{f.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ================== SPLIT IMAGE + TEXT ================== */}
        <section className="bg-[#0f1d2e] py-20 md:py-28 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <AnimatedSection>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/hero/image3.jpg"
                    alt="Horse and rider training"
                    className="w-full h-[400px] md:h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <p className="text-sm font-semibold tracking-widest uppercase text-[#c5a55a] mb-4">
                  Why EquiProfile
                </p>
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-white leading-tight">
                  Built by riders.
                  <br />
                  Loved by stables.
                </h2>
                <p className="mt-6 text-gray-400 leading-relaxed text-lg">
                  We started EquiProfile because no tool on the market truly
                  understood the daily reality of horse care. From morning feeds
                  to competition prep, every feature has been shaped by real
                  feedback from trainers, owners and grooms.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    "Designed for equestrians, not generic pet software",
                    "Offline-capable — works even at remote yards",
                    "Invite your team with role-based permissions",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-gray-300">
                      <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#1a7a6d]/30 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-[#1a7a6d]" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/about">
                  <Button className="mt-8 bg-[#c5a55a] hover:bg-[#b8963f] text-[#0f1d2e] font-semibold rounded-full px-6">
                    Our Story
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* =================== TESTIMONIALS =================== */}
        <section className="bg-[#f8f9fb] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold tracking-widest uppercase text-[#2e6da4] mb-3">
                Testimonials
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0f1d2e]">
                Trusted by equestrians everywhere
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((t, i) => (
                <AnimatedSection key={t.name} delay={i * 0.1}>
                  <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-[#0f1d2e]/5 h-full flex flex-col">
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className="w-4 h-4 fill-[#c5a55a] text-[#c5a55a]"
                        />
                      ))}
                    </div>
                    <p className="text-[#0f1d2e]/70 leading-relaxed flex-1 italic">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#0f1d2e]/5">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-[#2e6da4]/10 text-[#2e6da4] text-sm font-semibold">
                          {t.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-[#0f1d2e] text-sm">
                          {t.name}
                        </p>
                        <p className="text-xs text-[#0f1d2e]/50">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CTA BANNER ===================== */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1d2e] via-[#1a3152] to-[#0f1d2e]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2e6da4]/15 via-transparent to-transparent" />

          <div className="relative z-10 container mx-auto px-4 text-center">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-white max-w-3xl mx-auto leading-tight">
                Ready to elevate your horse management?
              </h2>
              <p className="mt-6 text-gray-400 text-lg max-w-xl mx-auto">
                The platform built for equestrians who take horse care seriously.
                Start your free 7-day trial — no credit card required.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-[#c5a55a] hover:bg-[#b8963f] text-[#0f1d2e] font-semibold px-10 h-12 text-base rounded-full shadow-lg shadow-[#c5a55a]/20"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 px-8 h-12 text-base rounded-full"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </ManagementLayout>
  );
}
