import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ManagementLayout } from "@/components/management/ManagementLayout";
import { DEFAULT_PRICING, FREE_TRIAL_DAYS } from "@shared/pricing";
import {
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  User,
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

interface PlanFeature {
  label: string;
  individual: boolean;
  stable: boolean;
  enterprise: boolean;
}

const planFeatures: PlanFeature[] = [
  { label: "Up to 3 horse profiles", individual: true, stable: true, enterprise: true },
  { label: "Unlimited horse profiles", individual: false, stable: true, enterprise: true },
  { label: "Health & medical records", individual: true, stable: true, enterprise: true },
  { label: "Training logs", individual: true, stable: true, enterprise: true },
  { label: "Nutrition plans", individual: true, stable: true, enterprise: true },
  { label: "Document storage (1 GB)", individual: true, stable: false, enterprise: false },
  { label: "Document storage (10 GB)", individual: false, stable: true, enterprise: false },
  { label: "Document storage (unlimited)", individual: false, stable: false, enterprise: true },
  { label: "Weather & riding conditions", individual: true, stable: true, enterprise: true },
  { label: "Insights & reports", individual: false, stable: true, enterprise: true },
  { label: "Team members & roles", individual: false, stable: true, enterprise: true },
  { label: "Stable management tools", individual: false, stable: true, enterprise: true },
  { label: "Priority support", individual: false, stable: false, enterprise: true },
  { label: "Custom branding", individual: false, stable: false, enterprise: true },
  { label: "Dedicated account manager", individual: false, stable: false, enterprise: true },
];

const plans = [
  {
    id: "individual",
    name: "Individual",
    icon: User,
    description: "Perfect for the hands-on owner managing a few horses.",
    price: DEFAULT_PRICING.individual.monthly.display,
    period: "/mo",
    popular: false,
    cta: "Start Free Trial",
    href: "/register?plan=individual",
  },
  {
    id: "stable",
    name: "Stable",
    icon: Sparkles,
    description: "For yards, trainers and teams managing multiple horses.",
    price: DEFAULT_PRICING.stable.monthly.display,
    period: "/mo",
    popular: true,
    cta: "Start Free Trial",
    href: "/register?plan=stable",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    description: "Bespoke solutions for large yards and professional operations.",
    price: "Custom",
    period: "",
    popular: false,
    cta: "Contact Sales",
    href: "/contact",
  },
];

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: "Is there a free trial?",
    a: `Absolutely. Every plan includes a ${FREE_TRIAL_DAYS}-day free trial — no credit card required. You'll have full access to all features so you can explore everything before committing.`,
  },
  {
    q: "Can I switch plans later?",
    a: "Yes! You can upgrade or downgrade at any time from your account settings. Changes take effect at the start of your next billing cycle, and we'll pro-rate any difference.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via Stripe. For Enterprise plans we also support invoicing and bank transfer.",
  },
  {
    q: "Is my data safe?",
    a: "Security is paramount. All data is encrypted at rest and in transit, and we perform regular backups. We never share your information with third parties.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Of course. There are no long-term contracts. Cancel from your dashboard whenever you like and you'll retain access until the end of your current billing period.",
  },
];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <AnimatedSection key={item.q} delay={i * 0.06}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full text-left rounded-xl border border-[#0f1d2e]/10 bg-white px-6 py-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-semibold text-[#0f1d2e]">{item.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-[#2e6da4] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#0f1d2e]/40 flex-shrink-0" />
                )}
              </div>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="pt-3 text-[#0f1d2e]/60 leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            </button>
          </AnimatedSection>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function Pricing() {
  return (
    <ManagementLayout>
      <div className="min-h-screen">
        {/* ======================== HERO ======================== */}
        <section className="relative min-h-[460px] md:min-h-[520px] flex items-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#070f1c] via-[#0f1d2e] to-[#0a1e35]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(26,122,109,0.18)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(46,109,164,0.12)_0%,_transparent_60%)] pointer-events-none" />
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
                Pricing
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold font-serif text-white leading-tight max-w-4xl mx-auto">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-6 text-lg md:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed">
                Choose the plan that fits your yard. Every plan includes a{" "}
                {FREE_TRIAL_DAYS}-day free trial — no credit card required.
              </p>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f9fb] to-transparent" />
        </section>

        {/* ===================== PRICING CARDS ===================== */}
        <section className="bg-[#f8f9fb] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
              {plans.map((plan, i) => (
                <AnimatedSection key={plan.id} delay={i * 0.1}>
                  <div
                    className={`relative rounded-2xl bg-white flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${
                      plan.popular
                        ? "shadow-xl shadow-[#c5a55a]/12 border-2 border-[#c5a55a]/40"
                        : "border border-[#0f1d2e]/8 shadow-sm"
                    }`}
                  >
                    {/* Colored top strip */}
                    <div
                      className={`h-1.5 w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-[#c5a55a] via-[#e8d08a] to-[#c5a55a]"
                          : "bg-gradient-to-r from-[#2e6da4] to-[#4a9eca]"
                      }`}
                    />

                    {plan.popular && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#c5a55a] px-3 py-1 text-[10px] font-bold text-[#0f1d2e] uppercase tracking-wider shadow-md">
                          <Sparkles className="w-2.5 h-2.5" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="p-8 flex flex-col flex-1">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 shadow-md ${
                          plan.popular
                            ? "bg-gradient-to-br from-[#c5a55a] to-[#e8c85a] text-[#0f1d2e] shadow-[#c5a55a]/20"
                            : "bg-gradient-to-br from-[#2e6da4] to-[#4a9eca] text-white shadow-[#2e6da4]/15"
                        }`}
                      >
                        <plan.icon className="w-5 h-5" />
                      </div>

                      <h3 className="text-xl font-bold font-serif text-[#0f1d2e]">
                        {plan.name}
                      </h3>
                      <p className="mt-1 text-sm text-[#0f1d2e]/48">
                        {plan.description}
                      </p>

                      <div className="mt-6 mb-8 pb-6 border-b border-[#0f1d2e]/6">
                        <span className={`text-4xl font-bold font-serif ${plan.popular ? "text-[#c5a55a]" : "text-[#0f1d2e]"}`}>
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className="text-[#0f1d2e]/38 ml-1 text-sm">
                            {plan.period}
                          </span>
                        )}
                      </div>

                      {/* Feature checklist */}
                      <ul className="space-y-2.5 mb-8 flex-1">
                        {planFeatures.map((f) => {
                          const included =
                            f[plan.id as keyof Pick<PlanFeature, "individual" | "stable" | "enterprise">];
                          if (!included) return null;
                          return (
                            <li key={f.label} className="flex items-start gap-2.5 text-sm text-[#0f1d2e]/65">
                              <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.popular ? "text-[#c5a55a]" : "text-[#1a7a6d]"}`} />
                              {f.label}
                            </li>
                          );
                        })}
                      </ul>

                      <Link href={plan.href}>
                        <Button
                          size="lg"
                          className={`w-full rounded-full font-bold h-12 transition-all duration-200 hover:-translate-y-0.5 ${
                            plan.popular
                              ? "bg-[#c5a55a] hover:bg-[#d4b468] text-[#0f1d2e] shadow-lg shadow-[#c5a55a]/25"
                              : "bg-[#0f1d2e] hover:bg-[#1a2e45] text-white"
                          }`}
                        >
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ================ FULL COMPARISON TABLE ================ */}
        <section className="bg-white py-20 md:py-28">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 bg-[#0f1d2e]/5 rounded-full px-4 py-1.5 text-sm font-bold text-[#0f1d2e]/50 tracking-widest uppercase mb-4">
                Compare Plans
              </div>
              <h2 className="text-3xl md:text-[42px] font-bold font-serif text-[#0f1d2e]">
                Compare Plans
              </h2>
              <p className="mt-4 text-[#0f1d2e]/55 text-lg">
                A detailed breakdown so you can pick with confidence.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <div className="overflow-x-auto max-w-4xl mx-auto rounded-2xl border border-[#0f1d2e]/6 shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8f9fb] border-b border-[#0f1d2e]/8">
                      <th className="text-left py-4 px-6 font-semibold text-[#0f1d2e]">
                        Feature
                      </th>
                      {plans.map((p) => (
                        <th
                          key={p.id}
                          className={`text-center py-4 px-4 font-bold ${p.popular ? "text-[#c5a55a]" : "text-[#0f1d2e]"}`}
                        >
                          {p.name}
                          {p.popular && (
                            <span className="block text-[10px] text-[#c5a55a]/70 font-medium tracking-wide normal-case mt-0.5">
                              Most Popular
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {planFeatures.map((f, i) => (
                      <tr
                        key={f.label}
                        className={`border-b border-[#0f1d2e]/4 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#f8f9fb]/50"}`}
                      >
                        <td className="py-3.5 px-6 text-[#0f1d2e]/65 text-[13px]">
                          {f.label}
                        </td>
                        {(["individual", "stable", "enterprise"] as const).map(
                          (planId) => (
                            <td key={planId} className="py-3.5 text-center">
                              {f[planId] ? (
                                <Check className={`w-4 h-4 mx-auto ${planId === "stable" ? "text-[#c5a55a]" : "text-[#1a7a6d]"}`} />
                              ) : (
                                <X className="w-4 h-4 text-[#0f1d2e]/15 mx-auto" />
                              )}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ======================== FAQ ======================== */}
        <section className="bg-[#f8f9fb] py-20 md:py-28">
          <div className="container mx-auto px-4">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 bg-[#2e6da4]/8 rounded-full px-4 py-1.5 text-sm font-bold text-[#2e6da4] tracking-widest uppercase mb-4">
                FAQ
              </div>
              <h2 className="text-3xl md:text-[42px] font-bold font-serif text-[#0f1d2e]">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-[#0f1d2e]/55 text-lg">
                Everything you need to know before getting started.
              </p>
            </AnimatedSection>

            <FaqAccordion items={faqs} />
          </div>
        </section>

        {/* ===================== CTA BANNER ===================== */}
        <section className="relative py-28 md:py-36 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#070f1c] via-[#0f1d2e] to-[#091524]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_50%,_rgba(197,165,90,0.08)_0%,_transparent_70%)] pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px bg-gradient-to-r from-transparent via-[#c5a55a]/50 to-transparent" />

          <div className="relative z-10 container mx-auto px-4 text-center">
            <AnimatedSection>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#c5a55a] mb-5">
                Start today
              </p>
              <h2 className="text-4xl md:text-5xl font-bold font-serif text-white max-w-3xl mx-auto leading-tight">
                Start your free trial today
              </h2>
              <p className="mt-6 text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
                No credit card. No commitment. Just {FREE_TRIAL_DAYS} days of
                full access to see why equestrians love EquiProfile.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="mt-10 bg-[#c5a55a] hover:bg-[#d4b468] text-[#0f1d2e] font-bold px-12 h-12 text-base rounded-full shadow-2xl shadow-[#c5a55a]/25 border-0 transition-all duration-200 hover:-translate-y-0.5 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </AnimatedSection>
          </div>
        </section>
      </div>
    </ManagementLayout>
  );
}
