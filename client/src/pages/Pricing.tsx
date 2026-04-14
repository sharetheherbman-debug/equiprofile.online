import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Loader2,
  Clock,
  XCircle,
  Sparkles,
  Crown,
  Building2,
  GraduationCap,
  Users,
  Mail,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { PageBanner } from "@/components/PageBanner";
import { DEFAULT_PRICING, SCHOOL_PRICING, FREE_TRIAL_DAYS, penceToGBP } from "@shared/pricing";

export default function Pricing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [audienceType, setAudienceType] = useState<"individual" | "school">("individual");

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
      iconColor: "from-emerald-400 to-teal-400",
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
      iconColor: "from-indigo-400 to-purple-400",
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
      iconColor: "from-purple-400 to-pink-400",
      popular: false,
    },
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
        <div className="min-h-screen bg-[#0a1628] bg-gradient-to-br from-[#0a1628] via-[#0f1f45] to-[#0a1628] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading pricing information...</p>
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
      <div className="min-h-screen bg-[#0a1628] bg-gradient-to-br from-[#0a1628] via-[#0f1f45] to-[#0a1628]">
        <div className="container mx-auto px-4 py-16">
          {/* Top 3 Blocks */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">What's Included</h3>
                <p className="text-gray-400 text-sm">All plans include unlimited updates, support, and access to all core features</p>
              </div>
            </div>
            <div className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{FREE_TRIAL_DAYS}-Day Free Trial</h3>
                <p className="text-gray-400 text-sm">Try EquiProfile risk-free with full access for {FREE_TRIAL_DAYS} days. No credit card required.</p>
              </div>
            </div>
            <div className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center mb-4">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Cancel Anytime</h3>
                <p className="text-gray-400 text-sm">No long-term contracts. Cancel or change your plan anytime with no hidden fees</p>
              </div>
            </div>
          </motion.div>

          {/* ── "Who are you?" Audience Switcher ── */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Who are you?</h2>
            <div className="inline-flex items-center gap-2 bg-[#0f2040]/60 backdrop-blur-md rounded-full p-1.5 border border-white/10">
              <button
                onClick={() => setAudienceType("individual")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  audienceType === "individual"
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Individual
                </span>
              </button>
              <button
                onClick={() => setAudienceType("school")}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  audienceType === "school"
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> School / Organisation
                </span>
              </button>
            </div>
          </motion.div>

          {/* ── Billing Period Toggle ── */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                Perfect Plan
              </span>
            </h2>
            <div className="mt-6 inline-flex items-center gap-4 bg-[#0f2040]/60 backdrop-blur-md rounded-full p-2 border border-white/10">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingPeriod === "monthly"
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingPeriod === "yearly"
                    ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </motion.div>

          {/* Current Subscription Alert */}
          {hasActiveSubscription && subscriptionStatus && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Alert className="mb-8 max-w-3xl mx-auto bg-[#0f2040]/60 backdrop-blur-md border-white/10 text-white">
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Your current plan:{" "}
                    <strong className="capitalize text-cyan-400">{subscriptionStatus.plan}</strong>
                    {subscriptionStatus.status === "active" && " (Active)"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManageBilling}
                    className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:to-cyan-600"
                  >
                    Manage Billing
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* ══════════ INDIVIDUAL VIEW ══════════ */}
          {audienceType === "individual" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {individualPlans.map((planData, index) => {
                const isActive = isCurrentPlan(planData.plan);
                const loadKey = `${planData.plan}_${billingPeriod}`;
                return (
                  <motion.div
                    key={planData.plan}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -8 }}
                    className="relative flex"
                  >
                    {planData.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <Card
                      className={`flex flex-col w-full bg-[#0f2040]/60 backdrop-blur-md border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden group ${
                        planData.popular ? "border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/20" : ""
                      } ${isActive ? "ring-2 ring-cyan-400/50" : ""}`}
                    >
                      <div className="h-32 overflow-hidden bg-gradient-to-br from-indigo-900/20 to-cyan-900/20 relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                        <div
                          className={`relative z-20 w-20 h-20 rounded-full bg-gradient-to-r ${planData.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl`}
                        >
                          <planData.icon className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle className="text-white text-2xl">{planData.name}</CardTitle>
                        <CardDescription className="text-gray-400">{planData.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                            {planData.price}
                          </span>
                          <span className="text-gray-400 text-lg">
                            /{billingPeriod === "monthly" ? "month" : "year"}
                          </span>
                        </div>
                        {billingPeriod === "yearly" && (
                          <p className="text-sm text-green-400 font-semibold mt-2">Save 17% with yearly billing</p>
                        )}
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <ul className="space-y-3">
                          {planData.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <Check className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="flex-col gap-2 mt-auto pt-6">
                        {isActive ? (
                          <Button className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0" disabled>
                            Current Plan
                          </Button>
                        ) : planData.plan === "student" ? (
                          <Button
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 hover:from-emerald-600 hover:to-teal-600 shadow-lg transition-all duration-300"
                            onClick={() => setLocation(`/register?plan=student&interval=${billingPeriod}`)}
                          >
                            Start Free Trial
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:to-cyan-600 shadow-lg transition-all duration-300"
                            onClick={() => handleSubscribe(planData.plan, billingPeriod)}
                            disabled={loadingPlan === loadKey}
                          >
                            {loadingPlan === loadKey ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                              `Start Free Trial`
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ══════════ SCHOOL / ORGANISATION VIEW ══════════ */}
          {audienceType === "school" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto"
            >
              <div className="text-center mb-8">
                <p className="text-gray-400 max-w-2xl mx-auto">
                  EquiProfile offers tailored pricing for riding schools, colleges, and training centres.
                  Each plan includes teacher &amp; student accounts, lesson management, progress reporting, and AI tutor access.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      whileHover={{ scale: 1.03, y: -8 }}
                    >
                      <Card className="flex flex-col h-full bg-[#0f2040]/60 backdrop-blur-md border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden">
                        <CardHeader className="text-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center mx-auto mb-3">
                            {isEnterprise ? <Building2 className="w-6 h-6 text-white" /> : <Users className="w-6 h-6 text-white" />}
                          </div>
                          <CardTitle className="text-white text-xl">{tier.label}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {isEnterprise ? "50+ students" : `Up to ${tier.maxStudents} students`}
                          </CardDescription>
                          <div className="mt-4">
                            {price ? (
                              <>
                                <span className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                                  {price.display}
                                </span>
                                <span className="text-gray-400 text-lg">
                                  /{billingPeriod === "monthly" ? "mo" : "yr"}
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-white">Custom</span>
                            )}
                          </div>
                          {billingPeriod === "yearly" && price && (
                            <p className="text-sm text-green-400 font-semibold mt-1">Save ~17% yearly</p>
                          )}
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <ul className="space-y-2.5 text-sm text-gray-300">
                            <li className="flex items-start gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> Teacher & student accounts</li>
                            <li className="flex items-start gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> Lesson management</li>
                            <li className="flex items-start gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> Progress reporting</li>
                            <li className="flex items-start gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> AI tutor for students</li>
                            <li className="flex items-start gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> Group & class management</li>
                            <li className="flex items-start gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> Assignment & feedback tools</li>
                            <li className="flex items-start gap-2"><Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" /> {FREE_TRIAL_DAYS}-day free trial</li>
                          </ul>
                        </CardContent>
                        <CardFooter className="mt-auto pt-4">
                          {isEnterprise ? (
                            <Link href="/contact" className="w-full">
                              <Button
                                variant="outline"
                                className="w-full border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 hover:text-white"
                              >
                                <Mail className="w-4 h-4 mr-2" /> Contact Us
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/contact?plan=school" className="w-full">
                              <Button className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:to-cyan-600">
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
          )}

          {/* FAQ Section */}
          <motion.div
            className="mt-24 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-white">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                Questions
              </span>
            </h2>
            <div className="max-w-3xl mx-auto text-left grid md:grid-cols-2 gap-6">
              {[
                { question: "Can I cancel anytime?", answer: "Yes! Cancel your subscription at any time. Your access continues until the end of your billing period." },
                { question: "What happens after the free trial?", answer: "Your account becomes read-only. Upgrade to a paid plan anytime to regain full access." },
                { question: "Can I switch plans?", answer: "Yes! Upgrade or downgrade at any time. Changes are prorated automatically." },
                { question: "What payment methods do you accept?", answer: "All major credit cards via Stripe. Your payment info is securely processed." },
                { question: "What is the Student plan?", answer: "Designed for equestrian students — a dedicated dashboard with learning pathways, AI tutor, assignments, and progress tracking from £8/month." },
                { question: "Do schools get volume discounts?", answer: "Yes — tiered pricing from £49/month for up to 10 students. Larger schools get even better rates." },
                { question: "Do I need a credit card for the trial?", answer: "No! Start your 7-day free trial without any payment info." },
                { question: "Can I export my data?", answer: "Yes! All paid plans include CSV and PDF export for backup or sharing." },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                >
                  <h3 className="font-semibold mb-2 text-white">{faq.question}</h3>
                  <p className="text-gray-400 text-sm">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="mt-24 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
              <div className="relative backdrop-blur-md bg-white/5 border-2 border-white/20 rounded-3xl p-8 md:p-12 hover:bg-white/10 hover:border-white/30 transition-all duration-500">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4 text-white">
                    Ready to Get{" "}
                    <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                      Started?
                    </span>
                  </h2>
                  <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Start your free {FREE_TRIAL_DAYS}-day trial today. No credit card required.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                      <Button
                        size="lg"
                        className="text-lg px-10 py-6 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white border-0 shadow-xl"
                      >
                        Start Free Trial
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-10 py-6 border-white/20 text-white hover:bg-white/10"
                      >
                        Contact Sales
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MarketingLayout>
  );
}
