import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import {
  HeartPulse,
  Dumbbell,
  Salad,
  FileText,
  CloudSun,
  BarChart3,
  CalendarDays,
  Building2,
  ArrowRight,
  Bell,
  Share2,
  Smartphone,
  ShieldCheck,
  Palette,
  Globe,
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

const majorFeatures = [
  {
    icon: HeartPulse,
    title: "Health Records",
    subtitle: "Complete medical history at your fingertips",
    description:
      "Log vet visits, vaccinations, farrier appointments and medications in a secure, searchable timeline. Set reminders so nothing falls through the cracks and share records instantly with your veterinary team.",
    image: "/images/hero/image2.jpg",
    imagePosition: "object-center",
  },
  {
    icon: Dumbbell,
    title: "Training Logs",
    subtitle: "Track every stride of progress",
    description:
      "Record sessions by discipline, duration and intensity. Attach notes, photos or videos and visualise trends over weeks and months. Perfect for trainers coordinating across multiple riders and horses.",
    image: "/images/hero/image4.jpg",
    imagePosition: "object-center",
  },
  {
    icon: Salad,
    title: "Nutrition Plans",
    subtitle: "Precision feeding, simplified",
    description:
      "Create detailed feed charts per horse, log daily supplements and adjust diets as seasons change. Our built-in calculator helps you balance energy intake against workload with clarity.",
    image: "/images/gallery/10.jpg",
    imagePosition: "object-center",
  },
  {
    icon: FileText,
    title: "Document Storage",
    subtitle: "Passports, insurance and more — always to hand",
    description:
      "Upload and organise every important document — horse passports, competition entries, insurance policies, livery contracts. Access them on any device, even offline at remote yards.",
    image: "/images/gallery/12.jpg",
    imagePosition: "object-center",
  },
  {
    icon: CloudSun,
    title: "Weather & Riding Conditions",
    subtitle: "Plan your week with confidence",
    description:
      "Hyper-local forecasts matched to your yard's location give you real-time insights on temperature, rainfall and footing conditions so you can schedule rides and turnout intelligently.",
    image: "/images/hero/image6.jpg",
    imagePosition: "object-center",
  },
  {
    icon: BarChart3,
    title: "Insights & Reports",
    subtitle: "Data that tells a story",
    description:
      "Beautiful dashboards summarise health trends, training progress and costs across your entire string. Export PDF reports for owners, sponsors or insurance providers in one click.",
    image: "/images/gallery/15.jpg",
    imagePosition: "object-center",
  },
  {
    icon: CalendarDays,
    title: "Calendar & Scheduling",
    subtitle: "One calendar, every appointment",
    description:
      "Unify vet calls, farrier visits, competitions, lessons and rest days in a shared team calendar. Colour-coded views per horse keep even the busiest yards running smoothly.",
    image: "/images/gallery/18.jpg",
    imagePosition: "object-center",
  },
  {
    icon: Building2,
    title: "Stable Management",
    subtitle: "Run your yard like a business",
    description:
      "Manage stables, paddock rotations, livery clients and invoicing from a single dashboard. Role-based access means grooms, managers and owners see exactly what they need.",
    image: "/images/gallery/19.jpg",
    imagePosition: "object-top",
  },
];

const extraFeatures = [
  { icon: Bell, title: "Smart Reminders" },
  { icon: Share2, title: "Team Sharing" },
  { icon: Smartphone, title: "Mobile Friendly" },
  { icon: ShieldCheck, title: "Data Encryption" },
  { icon: Palette, title: "Custom Branding" },
  { icon: Globe, title: "Multi-Language" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Features() {
  return (
    <ManagementLayout>
      <div className="min-h-screen">
        {/* ======================== HERO ======================== */}
        <section className="relative min-h-[500px] md:min-h-[560px] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#070f1c] via-[#0f1d2e] to-[#0a1e35]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(46,109,164,0.22)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(26,122,109,0.12)_0%,_transparent_60%)] pointer-events-none" />

          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 container mx-auto px-4 pt-32 pb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#c5a55a]/10 border border-[#c5a55a]/20 rounded-full px-4 py-1.5 text-sm font-bold text-[#c5a55a] tracking-widest uppercase mb-5">
                Features
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold font-serif text-white leading-tight max-w-5xl mx-auto">
                Everything You Need to
                <br />
                <span className="bg-gradient-to-r from-[#4a9eca] via-[#2e6da4] to-[#1a7a6d] bg-clip-text text-transparent">
                  Manage Your Horses
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
                Eight powerful modules working in harmony — from daily health
                records to stable-wide business management.
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f9fb] to-transparent" />
        </section>

        {/* =============== ALTERNATING FEATURE SECTIONS =============== */}
        {majorFeatures.map((feature, index) => {
          const isEven = index % 2 === 0;
          const bg = isEven ? "bg-[#f8f9fb]" : "bg-white";

          return (
            <section key={feature.title} className={`${bg} py-20 md:py-28 overflow-hidden`}>
              <div className="container mx-auto px-4">
                <div
                  className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto ${
                    isEven ? "" : "lg:[direction:rtl]"
                  }`}
                >
                  {/* Image — bordered container prevents awkward crops */}
                  <AnimatedSection className="lg:[direction:ltr]">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                      {/* Subtle border ring */}
                      <div className="absolute inset-0 ring-1 ring-inset ring-[#0f1d2e]/8 rounded-2xl pointer-events-none z-10" />
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className={`w-full h-[320px] md:h-[420px] object-cover ${feature.imagePosition} transition-transform duration-700 group-hover:scale-105`}
                      />
                      {/* Icon badge overlay */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#2e6da4] to-[#4a9eca] text-white shadow-lg shadow-[#2e6da4]/30 backdrop-blur-sm">
                          <feature.icon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>

                  {/* Text */}
                  <AnimatedSection delay={0.12} className="lg:[direction:ltr]">
                    <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#1a7a6d] mb-2">
                      {feature.subtitle}
                    </p>
                    <h2 className="text-3xl md:text-4xl font-bold font-serif text-[#0f1d2e] leading-tight">
                      {feature.title}
                    </h2>
                    <div className="mt-3 w-12 h-1 rounded-full bg-gradient-to-r from-[#2e6da4] to-[#3a9d8f]" />
                    <p className="mt-5 text-[#0f1d2e]/58 leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </AnimatedSection>
                </div>
              </div>
            </section>
          );
        })}

        {/* ================ SEE ALL FEATURES GRID ================ */}
        <section className="bg-[#070f1c] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-[#c5a55a]/10 border border-[#c5a55a]/20 rounded-full px-4 py-1.5 text-xs font-bold text-[#c5a55a] tracking-widest uppercase mb-4">
                And More
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-white">
                Plus dozens of thoughtful extras
              </h2>
              <p className="mt-4 text-white/40 text-lg">
                Little details that add up to a delightful experience.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {extraFeatures.map((ef, i) => (
                <AnimatedSection key={ef.title} delay={i * 0.06}>
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-6 text-center transition-all duration-300 hover:bg-white/[0.08] hover:border-white/15 hover:-translate-y-1">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#2e6da4]/30 to-[#4a9eca]/20 border border-[#4a9eca]/20">
                      <ef.icon className="w-5 h-5 text-[#4a9eca]" />
                    </div>
                    <span className="text-sm font-semibold text-white/85">
                      {ef.title}
                    </span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CTA SECTION ===================== */}
        <section className="relative py-28 md:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#070f1c] via-[#0f1d2e] to-[#091524]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_50%,_rgba(46,109,164,0.14)_0%,_transparent_70%)] pointer-events-none" />
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
                Try it free
              </p>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-white max-w-3xl mx-auto leading-tight">
                See every feature in action
              </h2>
              <p className="mt-6 text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
                Start a 7-day free trial and explore every module with your own
                horses. No credit card needed.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-[#c5a55a] hover:bg-[#d4b468] text-[#0f1d2e] font-bold px-12 h-12 text-base rounded-full shadow-2xl shadow-[#c5a55a]/25 border-0 transition-all duration-200 hover:-translate-y-0.5 group"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/15 text-white hover:bg-white/[0.07] hover:border-white/25 px-10 h-12 text-base rounded-full transition-all duration-200"
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
