import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Check,
  Loader2,
  Crown,
  Building2,
  GraduationCap,
  Users,
  Mail,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { PageBanner } from "@/components/PageBanner";
import { DEFAULT_PRICING, SCHOOL_PRICING, FREE_TRIAL_DAYS } from "@shared/pricing";

export default function Pricing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [audienceType, setAudienceType] = useState<"individual" | "school">("individual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: pricing, isLoading: pricingLoading } =
    trpc.billing.getPricing.useQuery(undefined, {
      staleTime: 5 * 60 * 1000,
      retry: false,
    });
  const { data: subscriptionStatus } = trpc.billing.getStatus.useQuery(
    undefined,
    { enabled: !!user, staleTime: 5 * 60 * 1000, retry: false },
  );
  const createCheckout = trpc.billing.createCheckout.useMutation();
  const createPortal = trpc.billing.createPortal.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Subscription activated!", {
        description: "Welcome to EquiProfile. Your subscription is now active.",
      });
    } else if (params.get("cancelled") === "true") {
      toast.error("Checkout cancelled", {
        description: "No charges were made. You can try again anytime.",
      });
    }
    // Pre-select audience from URL param (e.g. /pricing?type=school)
    if (params.get("type") === "school") setAudienceType("school");
  }, []);

  const handleSubscribe = async (
    planName: "pro" | "stable" | "student",
    interval: "monthly" | "yearly",
  ) => {
    if (!user) {
      setLocation(`/register?plan=${planName}&interval=${interval}`);
      return;
    }
    setLoadingPlan(`${planName}_${interval}`);
    try {
      const result = await createCheckout.mutateAsync({
        plan: planName as "pro" | "stable",
        interval,
      });
      if (result.url) window.location.href = result.url;
    } catch (error: any) {
      const isBillingDisabled = error?.data?.code === "PRECONDITION_FAILED";
      if (isBillingDisabled) {
        toast.error("Billing unavailable", {
          description: "Online billing is not currently available. Please contact support.",
        });
      } else {
        toast.error("Error", { description: error?.message || "Failed to create checkout session" });
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const result = await createPortal.mutateAsync();
      if (result.url) window.location.href = result.url;
    } catch (error: any) {
      toast.error("Error", { description: error.message || "Failed to open billing portal" });
    }
  };

  const isCurrentPlan = (plan: string) => {
    if (!subscriptionStatus) return false;
    if (plan === "trial") return subscriptionStatus.status === "trial";
    if (plan === "pro")
      return subscriptionStatus.plan === "monthly" || subscriptionStatus.plan === "yearly";
    if (plan === "stable")
      return (subscriptionStatus.plan as string) === "stable_monthly" || (subscriptionStatus.plan as string) === "stable_yearly";
    return false;
  };

  const hasActiveSubscription = subscriptionStatus?.status === "active";

  const formatPrice = (amountInPence: number | undefined): string => {
    if (!amountInPence || amountInPence <= 0) return "";
    const value = amountInPence / 100;
    return value % 1 === 0 ? `£${value}` : `£${value.toFixed(2)}`;
  };

  const getStudentPrice = () => {
    return billingPeriod === "monthly"
      ? formatPrice(DEFAULT_PRICING.student.monthly.amount)
      : formatPrice(DEFAULT_PRICING.student.yearly.amount);
  };
  const getProPrice = () => {
    const amt = billingPeriod === "monthly"
      ? (pricing?.pro?.monthly?.amount ?? DEFAULT_PRICING.individual.monthly.amount)
      : (pricing?.pro?.yearly?.amount ?? DEFAULT_PRICING.individual.yearly.amount);
    return formatPrice(amt);
  };
  const getStablePrice = () => {
    const amt = billingPeriod === "monthly"
      ? (pricing?.stable?.monthly?.amount ?? DEFAULT_PRICING.stable.monthly.amount)
      : (pricing?.stable?.yearly?.amount ?? DEFAULT_PRICING.stable.yearly.amount);
    return formatPrice(amt);
  };

  const individualPlans = [
    {
      name: "Student",
      plan: "student" as const,
      description: "For equestrian learners & riding students",
      price: getStudentPrice(),
      features: [
        "Virtual or assigned horse",
        "Structured learning pathways",
        "Daily care task tracking",
        "AI tutor support",
        "Progress tracking & reports",
        "Knowledge check quizzes",
        "Achievement badges",
        `${FREE_TRIAL_DAYS}-day free trial`,
      ],
      icon: GraduationCap,
      accent: "text-[#3a9d8f]",
      popular: false,
    },
    {
      name: "Pro",
      plan: "pro" as const,
      description: "For individual horse owners",
      price: getProPrice(),
      features: [
        "Up to 5 horses",
        "Complete health tracking",
        "Advanced training logs",
        "Competition results",
        "AI weather analysis (50/day)",
        "Export to CSV/PDF",
        "Email reminders",
        `${FREE_TRIAL_DAYS}-day free trial`,
      ],
      icon: Crown,
      accent: "text-[#2e6da4]",
      popular: true,
    },
    {
      name: "Stable",
      plan: "stable" as const,
      description: "For professional stables & yards",
      price: getStablePrice(),
      features: [
        "Everything in Pro, plus:",
        "Up to 20 horses",
        "Up to 5 team members",
        "Role-based permissions",
        "Stable management tools",
        "Unlimited AI weather",
        "Advanced analytics",
        "Priority support",
      ],
      icon: Building2,
      accent: "text-[#1a3a5c]",
      popular: false,
    },
  ];

  const faqs = [
    { question: "Can I cancel anytime?", answer: "Yes! Cancel your subscription at any time. Your access continues until the end of your billing period." },
    { question: "What happens after the free trial?", answer: "Your account becomes read-only. Upgrade to a paid plan anytime to regain full access." },
    { question: "Can I switch plans?", answer: "Yes! Upgrade or downgrade at any time. Changes are prorated automatically." },
    { question: "What payment methods do you accept?", answer: "All major credit cards via Stripe. Your payment info is securely processed." },
    { question: "What is the Student plan?", answer: "Designed for equestrian students — a dedicated dashboard with learning pathways, AI tutor, assignments, and progress tracking from £8/month." },
    { question: "Do schools get volume discounts?", answer: "Yes — tiered pricing from £49/month for up to 10 students. Larger schools get even better rates." },
    { question: "Do I need a credit card for the trial?", answer: `No! Start your ${FREE_TRIAL_DAYS}-day free trial without any payment info.` },
    { question: "Can I export my data?", answer: "Yes! All paid plans include CSV and PDF export for backup or sharing." },
  ];

  const schoolFeatures = [
    "Teacher & student accounts",
    "Lesson management",
    "Progress reporting",
    "AI tutor for students",
    "Group & class management",
    "Assignment & feedback tools",
    `${FREE_TRIAL_DAYS}-day free trial`,
  ];

  if (pricingLoading) {
    return (
      <MarketingLayout>
        <PageBanner
          title="Pricing"
          subtitle="Professional equine management for every need"
          imageSrc="/images/price3.jpg"
          imagePosition="center"
        />
        <div className="min-h-[60vh] bg-[#f8f6f3] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#2e6da4] mx-auto mb-4" />
            <p className="text-[#1a3a5c]/60">Loading pricing information...</p>
          </div>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <PageBanner
        title="Pricing"
        subtitle="Horse management, equestrian learning, and school solutions — plans for every rider and organisation"
        imageSrc="/images/price3.jpg"
        imagePosition="center"
      />

      <div className="bg-[#f8f6f3]">
        {/* ── Hero Heading ── */}
        <section className="pt-28 pb-8 text-center px-4">
          <motion.h1
            className="font-serif text-4xl md:text-5xl font-bold text-[#1a3a5c] mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            className="text-lg text-[#1a3a5c]/60 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {FREE_TRIAL_DAYS}-day free trial on every plan. No credit card required. Cancel anytime.
          </motion.p>
        </section>

        {/* ── Audience Toggle ── */}
        <section className="pb-6 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="inline-flex items-center rounded-full bg-white p-1 shadow-sm border border-gray-200"
          >
            <button
              onClick={() => setAudienceType("individual")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                audienceType === "individual"
                  ? "bg-[#1a3a5c] text-white shadow-md"
                  : "text-[#1a3a5c]/60 hover:text-[#1a3a5c]"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Individual
            </button>
            <button
              onClick={() => setAudienceType("school")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                audienceType === "school"
                  ? "bg-[#1a3a5c] text-white shadow-md"
                  : "text-[#1a3a5c]/60 hover:text-[#1a3a5c]"
              }`}
            >
              <Building2 className="w-4 h-4" />
              School / Organisation
            </button>
          </motion.div>
        </section>

        {/* ── Billing Period Toggle ── */}
        <section className="pb-12 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-flex items-center rounded-full bg-white p-1 shadow-sm border border-gray-200"
          >
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingPeriod === "monthly"
                  ? "bg-[#1a3a5c] text-white shadow-md"
                  : "text-[#1a3a5c]/60 hover:text-[#1a3a5c]"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingPeriod === "yearly"
                  ? "bg-[#1a3a5c] text-white shadow-md"
                  : "text-[#1a3a5c]/60 hover:text-[#1a3a5c]"
              }`}
            >
              Yearly
              <span className="text-xs bg-[#3a9d8f] text-white px-2 py-0.5 rounded-full font-bold">
                Save 17%
              </span>
            </button>
          </motion.div>
        </section>

        {/* ── Current Subscription Alert ── */}
        {hasActiveSubscription && subscriptionStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-4"
          >
            <Alert className="mb-8 max-w-3xl mx-auto bg-white border-[#3a9d8f]/30 text-[#1a3a5c]">
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Your current plan:{" "}
                  <strong className="capitalize text-[#2e6da4]">{subscriptionStatus.plan}</strong>
                  {subscriptionStatus.status === "active" && " (Active)"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManageBilling}
                  className="border-[#2e6da4] text-[#2e6da4] hover:bg-[#2e6da4] hover:text-white"
                >
                  Manage Billing
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* ══════════ INDIVIDUAL CARDS ══════════ */}
        {audienceType === "individual" && (
          <section className="px-4 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
              {individualPlans.map((planData, index) => {
                const isActive = isCurrentPlan(planData.plan);
                const loadKey = `${planData.plan}_${billingPeriod}`;
                return (
                  <motion.div
                    key={planData.plan}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative flex"
                  >
                    {planData.popular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="bg-[#2e6da4] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                          Recommended
                        </span>
                      </div>
                    )}
                    <Card
                      className={`flex flex-col w-full bg-white border transition-all duration-300 shadow-sm hover:shadow-lg ${
                        planData.popular
                          ? "ring-2 ring-[#2e6da4] border-[#2e6da4]/20 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      } ${isActive ? "ring-2 ring-[#3a9d8f]" : ""}`}
                    >
                      <CardHeader className="pb-4 pt-8">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 rounded-lg bg-[#f8f6f3] flex items-center justify-center ${planData.accent}`}>
                            <planData.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-serif text-xl font-bold text-[#1a3a5c]">{planData.name}</h3>
                          </div>
                        </div>
                        <p className="text-sm text-[#1a3a5c]/60">{planData.description}</p>
                        <div className="mt-4 flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-[#1a3a5c]">
                            {planData.price}
                          </span>
                          <span className="text-[#1a3a5c]/50 text-base">
                            /{billingPeriod === "monthly" ? "mo" : "yr"}
                          </span>
                        </div>
                        {billingPeriod === "yearly" && (
                          <p className="text-sm text-[#3a9d8f] font-semibold mt-1">Save 17% with yearly billing</p>
                        )}
                      </CardHeader>

                      <CardContent className="flex-grow px-6 pb-4">
                        <div className="border-t border-gray-100 pt-4">
                          <ul className="space-y-3">
                            {planData.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-[#3a9d8f]/10 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check className="h-3 w-3 text-[#3a9d8f]" />
                                </div>
                                <span className="text-sm text-[#1a3a5c]/80">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>

                      <CardFooter className="mt-auto px-6 pb-6">
                        {isActive ? (
                          <Button className="w-full bg-[#1a3a5c]/10 text-[#1a3a5c] cursor-default" disabled>
                            Current Plan
                          </Button>
                        ) : planData.plan === "student" ? (
                          <Button
                            className={`w-full text-white shadow-sm transition-all duration-200 ${
                              planData.popular
                                ? "bg-[#2e6da4] hover:bg-[#1a3a5c]"
                                : "bg-[#1a3a5c] hover:bg-[#2e6da4]"
                            }`}
                            onClick={() => setLocation(`/register?plan=student&interval=${billingPeriod}`)}
                          >
                            Start Free Trial
                          </Button>
                        ) : (
                          <Button
                            className={`w-full text-white shadow-sm transition-all duration-200 ${
                              planData.popular
                                ? "bg-[#2e6da4] hover:bg-[#1a3a5c]"
                                : "bg-[#1a3a5c] hover:bg-[#2e6da4]"
                            }`}
                            onClick={() => handleSubscribe(planData.plan, billingPeriod)}
                            disabled={loadingPlan === loadKey}
                          >
                            {loadingPlan === loadKey ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                              "Start Free Trial"
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* ══════════ SCHOOL / ORGANISATION CARDS ══════════ */}
        {audienceType === "school" && (
          <section className="px-4 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto"
            >
              <p className="text-center text-[#1a3a5c]/60 max-w-2xl mx-auto mb-10">
                EquiProfile offers tailored pricing for riding schools, colleges, and training centres.
                Each plan includes teacher &amp; student accounts, lesson management, progress reporting, and AI tutor access.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {SCHOOL_PRICING.tiers.map((tier, index) => {
                  const isEnterprise = tier.maxStudents === null;
                  const price = isEnterprise
                    ? null
                    : billingPeriod === "monthly"
                      ? tier.monthly
                      : tier.yearly;
                  return (
                    <motion.div
                      key={tier.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex"
                    >
                      <Card className="flex flex-col w-full bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300">
                        <CardHeader className="text-center pb-4 pt-8">
                          <div className="w-12 h-12 rounded-lg bg-[#f8f6f3] flex items-center justify-center mx-auto mb-3 text-[#2e6da4]">
                            {isEnterprise ? <Building2 className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                          </div>
                          <h3 className="font-serif text-lg font-bold text-[#1a3a5c]">{tier.label}</h3>
                          <p className="text-sm text-[#1a3a5c]/50">
                            {isEnterprise ? "50+ students" : `Up to ${tier.maxStudents} students`}
                          </p>
                          <div className="mt-4">
                            {price ? (
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-3xl font-bold text-[#1a3a5c]">
                                  {price.display}
                                </span>
                                <span className="text-[#1a3a5c]/50">
                                  /{billingPeriod === "monthly" ? "mo" : "yr"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-[#1a3a5c]">Custom</span>
                            )}
                          </div>
                          {billingPeriod === "yearly" && price && (
                            <p className="text-sm text-[#3a9d8f] font-semibold mt-1">Save ~17% yearly</p>
                          )}
                        </CardHeader>

                        <CardContent className="flex-grow px-5">
                          <div className="border-t border-gray-100 pt-4">
                            <ul className="space-y-2.5">
                              {schoolFeatures.map((feature, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                  <div className="w-4 h-4 rounded-full bg-[#3a9d8f]/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <Check className="h-2.5 w-2.5 text-[#3a9d8f]" />
                                  </div>
                                  <span className="text-sm text-[#1a3a5c]/70">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>

                        <CardFooter className="mt-auto px-5 pb-6">
                          {isEnterprise ? (
                            <Link href="/contact" className="w-full">
                              <Button
                                variant="outline"
                                className="w-full border-[#2e6da4]/30 text-[#2e6da4] hover:bg-[#2e6da4] hover:text-white"
                              >
                                <Mail className="w-4 h-4 mr-2" /> Contact Us
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/contact?plan=school" className="w-full">
                              <Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#2e6da4]">
                                Start School Setup
                              </Button>
                            </Link>
                          )}
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        )}

        {/* ══════════ FAQ Section ══════════ */}
        <section className="bg-white py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.h2
              className="font-serif text-3xl md:text-4xl font-bold text-[#1a3a5c] text-center mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-[#f8f6f3]/50"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#f8f6f3] transition-colors"
                  >
                    <span className="font-semibold text-[#1a3a5c]">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#1a3a5c]/40 shrink-0 ml-4 transition-transform duration-200 ${
                        openFaq === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-4 text-sm text-[#1a3a5c]/60 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ Bottom CTA ══════════ */}
        <section className="py-20 px-4">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="bg-white border border-gray-200 rounded-2xl p-10 md:p-14 text-center shadow-sm">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#1a3a5c] mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-[#1a3a5c]/60 mb-8 max-w-xl mx-auto">
                Start your free {FREE_TRIAL_DAYS}-day trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-base px-8 py-6 bg-[#2e6da4] hover:bg-[#1a3a5c] text-white shadow-md"
                  >
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base px-8 py-6 border-[#1a3a5c]/20 text-[#1a3a5c] hover:bg-[#1a3a5c] hover:text-white"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </MarketingLayout>
  );
}
