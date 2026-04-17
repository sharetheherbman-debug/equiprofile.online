import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import {
  Heart,
  Shield,
  Lightbulb,
  Users,
  ArrowRight,
  ChevronRight,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Animation helper                                                   */
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

const values = [
  {
    icon: Heart,
    title: "Horse-First Design",
    description:
      "Every decision we make starts with one question — does this improve the life of the horse? Welfare is never compromised for convenience.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description:
      "Your data deserves the same care you give your horses. End-to-end encryption and strict privacy by default protect every record.",
    gradient: "from-[#2e6da4] to-[#4a9eca]",
  },
  {
    icon: Lightbulb,
    title: "Relentless Innovation",
    description:
      "We ship improvements weekly, informed directly by the equestrian community. Your feedback shapes the product roadmap.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "EquiProfile is built alongside trainers, grooms, vets and owners who share a passion for raising the standard of horse care.",
    gradient: "from-[#1a7a6d] to-[#4eca9d]",
  },
];

const timeline = [
  {
    year: "The Idea",
    title: "The Spark",
    description:
      "Frustrated with scattered spreadsheets and paper files, our founder — a lifelong rider — began sketching a better way to manage horse care.",
  },
  {
    year: "Early Beta",
    title: "First Beta",
    description:
      "A small group of yards in the UK tested the earliest version, providing invaluable feedback that shaped the core features.",
  },
  {
    year: "Launch",
    title: "Public Launch",
    description:
      "EquiProfile launched to the public with health records, training logs, nutrition plans and document storage — and the response was encouraging.",
  },
  {
    year: "Today",
    title: "Growing",
    description:
      "EquiProfile continues to grow, adding weather integration, reporting dashboards, stable management tools, and an ever-expanding feature set — all shaped by real user feedback.",
  },
];

const missionPoints = [
  "Replace cluttered files and forgotten notebooks",
  "Adapts to the way you work — not the other way around",
  "Trusted by individual riders and competition yards alike",
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function About() {
  return (
    <ManagementLayout>
      <div className="min-h-screen">
        {/* ======================== HERO ======================== */}
        <section className="relative min-h-[520px] md:min-h-[580px] flex items-center overflow-hidden">
          <img
            src="/images/aboutus.jpg"
            alt="EquiProfile team and horses"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          {/* Deep layered overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#070f1c]/88 via-[#0f1d2e]/75 to-[#0a1628]/92" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_rgba(26,122,109,0.12)_0%,_transparent_70%)]" />

          <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#c5a55a]/10 border border-[#c5a55a]/20 rounded-full px-4 py-1.5 text-sm font-bold text-[#c5a55a] tracking-widest uppercase mb-5">
                Our Story
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold font-serif text-white leading-tight max-w-4xl mx-auto">
                About EquiProfile
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                Born from a love of horses and a frustration with outdated tools,
                EquiProfile is on a mission to modernise equine management.
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f8f9fb] to-transparent" />
        </section>

        {/* ====================== MISSION ====================== */}
        <section className="bg-[#f8f9fb] py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <AnimatedSection>
                <div className="inline-flex items-center gap-2 bg-[#1a7a6d]/8 rounded-full px-4 py-1.5 text-sm font-bold text-[#1a7a6d] tracking-widest uppercase mb-5">
                  Our Mission
                </div>
                <h2 className="text-3xl md:text-[42px] font-bold font-serif text-[#0f1d2e] leading-tight">
                  Empowering equestrians with tools they actually want to use
                </h2>
                <div className="mt-3 w-12 h-1 rounded-full bg-gradient-to-r from-[#1a7a6d] to-[#4a9eca]" />
                <p className="mt-6 text-[#0f1d2e]/58 leading-relaxed text-lg">
                  We believe every horse deserves the highest standard of care —
                  and that technology should make achieving that standard easier,
                  not harder. EquiProfile replaces cluttered files, forgotten
                  notebooks and endless WhatsApp threads with a single,
                  beautifully designed platform.
                </p>
                <p className="mt-4 text-[#0f1d2e]/58 leading-relaxed text-lg">
                  Whether you manage one horse or an entire competition yard, our
                  software adapts to the way you work — not the other way around.
                </p>
                <ul className="mt-8 space-y-3">
                  {missionPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[#0f1d2e]/70">
                      <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#1a7a6d]/15 border border-[#1a7a6d]/40 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#1a7a6d]" />
                      </span>
                      <span className="text-[15px]">{point}</span>
                    </li>
                  ))}
                </ul>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                  <img
                    src="/images/hero/image5.jpg"
                    alt="Close-up of horse and rider"
                    className="w-full h-[380px] md:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-[#0f1d2e]/8 rounded-2xl pointer-events-none" />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ====================== VALUES ====================== */}
        <section className="bg-white py-24 md:py-32">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-[#2e6da4]/8 rounded-full px-4 py-1.5 text-sm font-bold text-[#2e6da4] tracking-widest uppercase mb-4">
                What We Stand For
              </div>
              <h2 className="text-3xl md:text-[42px] font-bold font-serif text-[#0f1d2e] leading-tight">
                Our Values
              </h2>
              <p className="mt-4 text-[#0f1d2e]/55 text-lg max-w-xl mx-auto">
                These principles guide every feature we build and every
                conversation we have.
              </p>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 gap-7 max-w-5xl mx-auto">
              {values.map((v, i) => (
                <AnimatedSection key={v.title} delay={i * 0.08}>
                  <div
                    className="group rounded-2xl border border-[#0f1d2e]/5 bg-[#f8f9fb] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[#2e6da4]/6 hover:-translate-y-2 h-full"
                    style={{ boxShadow: "0 2px 12px -4px rgba(15,29,46,0.07)" }}
                  >
                    {/* Colored top accent */}
                    <div className={`h-1 w-full bg-gradient-to-r ${v.gradient}`} />
                    <div className="p-8">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${v.gradient} text-white mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                        <v.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold font-serif text-[#0f1d2e] mb-2">
                        {v.title}
                      </h3>
                      <p className="text-[#0f1d2e]/58 leading-relaxed text-[15px]">
                        {v.description}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== ORIGIN STORY ==================== */}
        <section className="relative bg-[#0f1d2e] py-24 md:py-32 overflow-hidden">
          {/* Gradual entry from white sections above */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-[#c5a55a]/10 border border-[#c5a55a]/20 rounded-full px-4 py-1.5 text-xs font-bold text-[#c5a55a] tracking-widest uppercase mb-4">
                Our Journey
              </div>
              <h2 className="text-3xl md:text-[42px] font-bold font-serif text-white leading-tight">
                Building something that matters
              </h2>
              <p className="mt-4 text-white/40 text-lg">
                From the first sketch to a fully featured platform — shaped entirely by real equestrians.
              </p>
            </AnimatedSection>

            <div className="max-w-3xl mx-auto relative">
              {/* Vertical line */}
              <div className="absolute left-[22px] md:left-[26px] top-2 bottom-2 w-px bg-gradient-to-b from-[#c5a55a]/40 via-[#c5a55a]/20 to-transparent" />

              {timeline.map((item, i) => (
                <AnimatedSection
                  key={item.year}
                  delay={i * 0.12}
                  className="relative pl-16 md:pl-20 pb-12 last:pb-0"
                >
                  {/* Dot */}
                  <div className="absolute left-[14px] md:left-[18px] top-1 w-5 h-5 rounded-full border-2 border-[#c5a55a] bg-[#070f1c] shadow-lg shadow-[#c5a55a]/20" />
                  <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#c5a55a] mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-bold font-serif text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/45 leading-relaxed text-[15px]">
                    {item.description}
                  </p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CTA BANNER ===================== */}
        <section className="relative py-28 md:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#070f1c] via-[#0f1d2e] to-[#091524]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_50%,_rgba(26,122,109,0.12)_0%,_transparent_70%)] pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-[#c5a55a]/45 to-transparent" />

          <div className="relative z-10 container mx-auto px-4 text-center">
            <AnimatedSection>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#c5a55a] mb-5">
                Join us
              </p>
              <blockquote className="text-base md:text-lg italic text-white/40 max-w-2xl mx-auto mb-8 leading-relaxed">
                "Our technology exists to serve the horse, not the other way around."
              </blockquote>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-white max-w-3xl mx-auto leading-tight">
                Join us on the journey
              </h2>
              <p className="mt-6 text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
                Whether you're an individual rider or manage a busy yard,
                EquiProfile is built for you. Start your free trial today.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-[#c5a55a] hover:bg-[#d4b468] text-[#0f1d2e] font-bold px-12 h-12 text-base rounded-full shadow-2xl shadow-[#c5a55a]/25 border-0 transition-all duration-200 hover:-translate-y-0.5 group"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/15 text-white hover:bg-white/[0.07] hover:border-white/25 px-10 h-12 text-base rounded-full transition-all duration-200"
                  >
                    Contact Us
                    <ChevronRight className="ml-1 h-4 w-4" />
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
