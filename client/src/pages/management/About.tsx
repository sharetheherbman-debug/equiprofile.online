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
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description:
      "Your data deserves the same care you give your horses. End-to-end encryption and strict privacy by default protect every record.",
  },
  {
    icon: Lightbulb,
    title: "Relentless Innovation",
    description:
      "We ship improvements weekly, informed directly by the equestrian community. Your feedback shapes the product roadmap.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "EquiProfile is built alongside trainers, grooms, vets and owners who share a passion for raising the standard of horse care.",
  },
];

const timeline = [
  {
    year: "2022",
    title: "The Spark",
    description:
      "Frustrated with scattered spreadsheets and paper files, our founder — a lifelong rider — began sketching a better way to manage horse care.",
  },
  {
    year: "2023",
    title: "First Beta",
    description:
      "A small group of yards in the UK tested the earliest version, providing invaluable feedback that shaped the core features.",
  },
  {
    year: "2024",
    title: "Public Launch",
    description:
      "EquiProfile launched to the public with health records, training logs, nutrition plans and document storage — and the response was overwhelming.",
  },
  {
    year: "2025",
    title: "Growing Fast",
    description:
      "Today EquiProfile serves hundreds of stables, with weather integration, reporting dashboards and an ever-expanding feature set.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function About() {
  return (
    <ManagementLayout>
      <div className="min-h-screen">
        {/* ======================== HERO ======================== */}
        <section className="relative min-h-[500px] md:min-h-[560px] flex items-center overflow-hidden">
          <img
            src="/images/aboutus.jpg"
            alt="EquiProfile team and horses"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1d2e]/90 via-[#0f1d2e]/70 to-[#1a7a6d]/30" />

          <div className="relative z-10 container mx-auto px-4 pt-28 pb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-sm font-semibold tracking-widest uppercase text-[#c5a55a] mb-4">
                Our Story
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-serif text-white leading-tight max-w-4xl mx-auto">
                About EquiProfile
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Born from a love of horses and a frustration with outdated tools,
                EquiProfile is on a mission to modernise equine management.
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f9fb] to-transparent" />
        </section>

        {/* ====================== MISSION ====================== */}
        <section className="bg-[#f8f9fb] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
              <AnimatedSection>
                <p className="text-sm font-semibold tracking-widest uppercase text-[#1a7a6d] mb-4">
                  Our Mission
                </p>
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0f1d2e] leading-tight">
                  Empowering equestrians with tools they actually want to use
                </h2>
                <p className="mt-6 text-[#0f1d2e]/60 leading-relaxed text-lg">
                  We believe every horse deserves the highest standard of care —
                  and that technology should make achieving that standard easier,
                  not harder. EquiProfile replaces cluttered files, forgotten
                  notebooks and endless WhatsApp threads with a single,
                  beautifully designed platform.
                </p>
                <p className="mt-4 text-[#0f1d2e]/60 leading-relaxed text-lg">
                  Whether you manage one horse or an entire competition yard, our
                  software adapts to the way you work — not the other way around.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.15}>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/images/hero/image5.jpg"
                    alt="Close-up of horse and rider"
                    className="w-full h-[380px] md:h-[460px] object-cover"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-[#0f1d2e]/10 rounded-2xl" />
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ====================== VALUES ====================== */}
        <section className="bg-white py-20 md:py-28">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold tracking-widest uppercase text-[#2e6da4] mb-3">
                What We Stand For
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0f1d2e]">
                Our Values
              </h2>
              <p className="mt-4 text-[#0f1d2e]/60 text-lg">
                These principles guide every feature we build and every
                conversation we have.
              </p>
            </AnimatedSection>

            <div className="grid sm:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {values.map((v, i) => (
                <AnimatedSection key={v.title} delay={i * 0.08}>
                  <div className="group rounded-2xl border border-[#0f1d2e]/5 bg-[#f8f9fb] p-8 transition-all duration-300 hover:shadow-xl hover:shadow-[#2e6da4]/5 hover:-translate-y-1 h-full">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#2e6da4] to-[#4a9eca] text-white mb-5 shadow-md shadow-[#2e6da4]/20">
                      <v.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-serif text-[#0f1d2e] mb-2">
                      {v.title}
                    </h3>
                    <p className="text-[#0f1d2e]/60 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== ORIGIN STORY ==================== */}
        <section className="bg-[#0f1d2e] py-20 md:py-28 overflow-hidden">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-sm font-semibold tracking-widest uppercase text-[#c5a55a] mb-3">
                Our Journey
              </p>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-white">
                From a stable yard to a global platform
              </h2>
            </AnimatedSection>

            <div className="max-w-3xl mx-auto relative">
              {/* vertical line */}
              <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-white/10" />

              {timeline.map((item, i) => (
                <AnimatedSection
                  key={item.year}
                  delay={i * 0.12}
                  className="relative pl-16 md:pl-20 pb-12 last:pb-0"
                >
                  {/* dot */}
                  <div className="absolute left-4 md:left-6 top-1 w-4 h-4 rounded-full border-2 border-[#c5a55a] bg-[#0f1d2e]" />
                  <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#c5a55a] mb-2">
                    {item.year}
                  </span>
                  <h3 className="text-xl font-bold font-serif text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CTA BANNER ===================== */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-[#f8f9fb]">
          <div className="container mx-auto px-4 text-center">
            <AnimatedSection>
              <h2 className="text-3xl md:text-5xl font-bold font-serif text-[#0f1d2e] max-w-3xl mx-auto leading-tight">
                Join us on the journey
              </h2>
              <p className="mt-6 text-[#0f1d2e]/60 text-lg max-w-xl mx-auto">
                Whether you're an individual rider or manage a busy yard,
                EquiProfile is built for you. Start your free trial today.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-[#2e6da4] hover:bg-[#256091] text-white font-semibold px-10 h-12 text-base rounded-full shadow-lg shadow-[#2e6da4]/20"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#0f1d2e]/20 text-[#0f1d2e] hover:bg-[#0f1d2e]/5 px-8 h-12 text-base rounded-full"
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
