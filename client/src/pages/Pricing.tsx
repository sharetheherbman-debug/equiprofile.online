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
import { DEFAULT_PRICING, penceToGBP } from "@shared/pricing";

const YEARLY_SAVINGS_PERCENTAGE = 17;

export default function Pricing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const { data: pricing, isLoading: pricingLoading } =
    trpc.billing.getPricing.useQuery(undefined, {
      staleTime: 5 * 60 * 1000,
      retry: false,
    });
  const { data: subscriptionStatus } = trpc.billing.getStatus.useQuery(
    undefined,
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000,
    },
  );
  const createCheckout = trpc.billing.createCheckout.useMutation();
  const createPortal = trpc.billing.createPortal.useMutation();

  // Check for URL parameters (success/cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast.success("Subscription activated!", {
        description:
          "Welcome to EquiProfile Pro. Your subscription is now active.",
      });
    } else if (params.get("cancelled") === "true") {
      toast.error("Checkout cancelled", {
        description: "No charges were made. You can try again anytime.",
      });
    }
  }, []);

  const handleSubscribe = async (
    planName: "pro" | "stable",
    interval: "monthly" | "yearly",
  ) => {
    if (!user) {
      // Not logged in: send to /register with intent preserved so that after
      // successful signup the app can auto-redirect to Stripe checkout.
      setLocation(`/register?plan=${planName}&interval=${interval}`);
      return;
    }

    setLoadingPlan(interval);
    try {
      const result = await createCheckout.mutateAsync({
        plan: planName,
        interval,
      });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      const isBillingDisabled = error?.data?.code === "PRECONDITION_FAILED";
      if (isBillingDisabled) {
        toast.error("Billing unavailable", {
          description:
            "Online billing is not currently available. Please contact support to upgrade your plan.",
        });
      } else {
        toast.error("Error", {
          description: error?.message || "Failed to create checkout session",
        });
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const result = await createPortal.mutateAsync();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to open billing portal",
      });
    }
  };

  const features = {
    free: [
      "7-day free trial",
      "1 horse only",
      "ALL features enabled",
      "Basic health records",
      "Training session logging",
      "Secure storage",
      "Email support",
    ],
    pro: [
      "Up to 5 horses",
      "Complete health tracking",
      "Advanced training logs",
      "Competition results",
      "Secure storage",
      "AI weather analysis (50/day)",
      "Email reminders",
      "Export to CSV/PDF",
    ],
    stable: [
      "Everything in Pro, plus:",
      "Up to 20 horses",
      "Up to 5 users",
      "Role-based permissions",
      "Stable management",
      "Secure storage",
      "Unlimited AI weather",
      "Advanced analytics",
      "Priority email support",
      "WhatsApp support",
    ],
  };

  const isCurrentPlan = (plan: string) => {
    if (!subscriptionStatus) return false;
    if (plan === "trial") return subscriptionStatus.status === "trial";
    if (plan === "pro")
      return (
        subscriptionStatus.plan === "monthly" ||
        subscriptionStatus.plan === "yearly"
      );
    if (plan === "stable")
      return (
        (subscriptionStatus.plan as string) === "stable_monthly" ||
        (subscriptionStatus.plan as string) === "stable_yearly"
      );
    return false;
  };

  const hasActiveSubscription = subscriptionStatus?.status === "active";

  // Helper function to format price from API (pence to pounds)
  // Falls back to hard-coded GBP defaults so UI never shows £0
  const formatPrice = (amountInPence: number | undefined): string => {
    if (!amountInPence || amountInPence <= 0) return "";
    return penceToGBP(amountInPence);
  };

  const getProPlanPrice = () => {
    if (billingPeriod === "monthly") {
      const amount = pricing?.pro?.monthly?.amount;
      return amount && amount > 0
        ? formatPrice(amount)
        : formatPrice(DEFAULT_PRICING.individual.monthly.amount);
    }
    const amount = pricing?.pro?.yearly?.amount;
    return amount && amount > 0
      ? formatPrice(amount)
      : formatPrice(DEFAULT_PRICING.individual.yearly.amount);
  };

  const getStablePlanPrice = () => {
    if (billingPeriod === "monthly") {
      const amount = pricing?.stable?.monthly?.amount;
      return amount && amount > 0
        ? formatPrice(amount)
        : formatPrice(DEFAULT_PRICING.stable.monthly.amount);
    }
    const amount = pricing?.stable?.yearly?.amount;
    return amount && amount > 0
      ? formatPrice(amount)
      : formatPrice(DEFAULT_PRICING.stable.yearly.amount);
  };

  const pricingPlans = [
    {
      name: pricing?.trial?.name || "Free Trial",
      plan: "trial",
      description: "Try all features with 1 horse",
      price: "Free",
      period: `/${pricing?.trial?.duration || 7} days`,
      features: pricing?.trial?.features || features.free,
      icon: Sparkles,
      iconColor: "from-blue-400 to-cyan-400",
      popular: false,
    },
    {
      name: pricing?.pro?.name || "Standard",
      plan: "pro",
      description: "For individual horse owners",
      price: getProPlanPrice(),
      period: billingPeriod === "monthly" ? "/month" : "/year",
      yearlyPrice: formatPrice(pricing?.pro?.yearly?.amount),
      monthlySavings: true,
      features: pricing?.pro?.features || features.pro,
      icon: Crown,
      iconColor: "from-indigo-400 to-purple-400",
      popular: true,
    },
    {
      name: pricing?.stable?.name || "Stable",
      plan: "stable",
      description: "For professional operations",
      price: getStablePlanPrice(),
      period: billingPeriod === "monthly" ? "/month" : "/year",
      yearlyPrice: formatPrice(pricing?.stable?.yearly?.amount),
      monthlySavings: true,
      features: pricing?.stable?.features || features.stable,
      icon: Building2,
      iconColor: "from-purple-400 to-pink-400",
      popular: false,
    },
  ];

  // Show loading state while pricing data is being fetched
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
        subtitle="Professional equine management for every need"
        imageSrc="/images/price3.jpg"
        imagePosition="center"
      />
      <div className="min-h-screen bg-[#0a1628] bg-gradient-to-br from-[#0a1628] via-[#0f1f45] to-[#0a1628]">
        <div className="container mx-auto px-4 py-16">
          {/* Top 3 Blocks - What's included, Free trial, Cancel anytime */}
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
                <h3 className="text-xl font-semibold text-white mb-2">
                  What's Included
                </h3>
                <p className="text-gray-400 text-sm">
                  All plans include unlimited updates, priority support, and
                  access to all core features
                </p>
              </div>
            </div>
            <div className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  7-Day Free Trial
                </h3>
                <p className="text-gray-400 text-sm">
                  Try EquiProfile risk-free with full access to ALL features for
                  1 horse for 7 days
                </p>
              </div>
            </div>
            <div className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center mb-4">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Cancel Anytime
                </h3>
                <p className="text-gray-400 text-sm">
                  No long-term contracts. Cancel or change your plan anytime
                  with no hidden fees
                </p>
              </div>
            </div>
          </motion.div>

          {/* Billing Period Header */}
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

            {/* Billing Period Toggle */}
            <motion.div
              className="mt-8 inline-flex items-center gap-4 bg-[#0f2040]/60 backdrop-blur-md rounded-full p-2 border border-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
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
                  Save {YEARLY_SAVINGS_PERCENTAGE}%
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Current Subscription Alert */}
          {hasActiveSubscription && subscriptionStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Alert className="mb-8 max-w-3xl mx-auto bg-[#0f2040]/60 backdrop-blur-md border-white/10 text-white">
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Your current plan:{" "}
                    <strong className="capitalize text-cyan-400">
                      {subscriptionStatus.plan}
                    </strong>
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

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((planData, index) => {
              const isCurrentPlanActive = isCurrentPlan(planData.plan);

              return (
                <motion.div
                  key={planData.plan}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="relative flex"
                >
                  {planData.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Card uses flex column for equal-height layout:
                        - Card and CardContent use flex-grow to expand
                        - CardFooter uses mt-auto to stick to bottom
                        This ensures all cards have same height with footer aligned */}
                  <Card
                    className={`
                    flex flex-col w-full bg-[#0f2040]/60 backdrop-blur-md border-white/10 
                    hover:border-white/30 transition-all duration-300
                    ${planData.popular ? "border-2 border-indigo-500/50 shadow-xl shadow-indigo-500/20" : ""}
                    ${isCurrentPlanActive ? "ring-2 ring-cyan-400/50" : ""}
                    overflow-hidden group
                  `}
                  >
                    {/* Icon Header */}
                    <div className="h-40 overflow-hidden bg-gradient-to-br from-indigo-900/20 to-cyan-900/20 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <div
                        className={`relative z-20 w-24 h-24 rounded-full bg-gradient-to-r ${planData.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl`}
                      >
                        <planData.icon className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="text-white text-2xl">
                        {planData.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        {planData.description}
                      </CardDescription>
                      <div className="mt-4">
                        <span className="text-5xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                          {planData.plan === "trial"
                            ? planData.price
                            : `£${planData.price}`}
                        </span>
                        <span className="text-gray-400 text-lg">
                          {planData.period}
                        </span>
                      </div>
                      {planData.monthlySavings &&
                        billingPeriod === "yearly" && (
                          <p className="text-sm text-gray-400 mt-2">
                            <span className="text-green-400 font-semibold">
                              Save {YEARLY_SAVINGS_PERCENTAGE}% with yearly
                              billing
                            </span>
                          </p>
                        )}
                    </CardHeader>

                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {planData.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="flex-col gap-2 mt-auto">
                      {isCurrentPlanActive ? (
                        <>
                          <Button
                            className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0"
                            disabled
                          >
                            Current Plan
                          </Button>
                          {planData.plan === "pro" && (
                            <Button
                              className="w-full bg-[#0f2040]/70 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
                              onClick={handleManageBilling}
                            >
                              Manage Subscription
                            </Button>
                          )}
                        </>
                      ) : planData.plan === "trial" ? (
                        <Button
                          className="w-full bg-[#0f2040]/70 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
                          onClick={() => setLocation("/register")}
                        >
                          Start Free Trial
                        </Button>
                      ) : planData.plan === "pro" ? (
                        <Button
                          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:to-cyan-600 shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
                          onClick={() => handleSubscribe("pro", billingPeriod)}
                          disabled={loadingPlan === billingPeriod}
                        >
                          {loadingPlan === billingPeriod ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Subscribe{" "}
                              {billingPeriod === "monthly"
                                ? "Monthly"
                                : "Yearly"}
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 hover:from-indigo-600 hover:to-cyan-600 shadow-lg hover:shadow-indigo-500/50 transition-all duration-300"
                          onClick={() =>
                            handleSubscribe(
                              planData.plan === "stable" ? "stable" : "pro",
                              billingPeriod,
                            )
                          }
                          disabled={loadingPlan === billingPeriod}
                        >
                          {loadingPlan === billingPeriod ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Subscribe{" "}
                              {billingPeriod === "monthly"
                                ? "Monthly"
                                : "Yearly"}
                            </>
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

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
                {
                  question: "Can I cancel anytime?",
                  answer:
                    "Yes! You can cancel your subscription at any time. Your access continues until the end of your billing period.",
                },
                {
                  question: "What happens after the free trial?",
                  answer:
                    "Your account becomes read-only. You can upgrade to a paid plan anytime to regain full access to all features.",
                },
                {
                  question: "Can I switch plans?",
                  answer:
                    "Yes! You can upgrade or downgrade your plan at any time. Changes are prorated automatically.",
                },
                {
                  question: "What payment methods do you accept?",
                  answer:
                    "We accept all major credit cards via Stripe. Your payment information is securely processed and never stored on our servers.",
                },
                {
                  question: "How many horses can I manage?",
                  answer:
                    "Free trial: 1 horse. Pro plan: up to 5 horses. Stable plan: up to 20 horses. Choose the plan that fits your needs.",
                },
                {
                  question: "Is there a discount for yearly billing?",
                  answer:
                    "Yes! Save 17% when you choose yearly billing. Plus, you only need to renew once per year.",
                },
                {
                  question: "Do I need a credit card for the trial?",
                  answer:
                    "No! Start your 7-day free trial without entering any credit card information. No hidden charges.",
                },
                {
                  question: "Can I export my data?",
                  answer:
                    "Yes! All paid plans include the ability to export your data to CSV and PDF formats for backup or sharing.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-[#0f2040]/60 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-white/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="font-semibold mb-2 text-white">
                    {faq.question}
                  </h3>
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
                    Start your free 7-day trial today. No credit card required.
                    Experience all features with 1 horse.
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
