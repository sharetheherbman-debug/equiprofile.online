import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function Pricing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  
  // Defensive: use safe queries with error handling
  const { data: pricing, isError: pricingError, isLoading: pricingLoading } = trpc.billing.getPricing.useQuery(undefined, {
    retry: false,
    onError: () => {
      console.warn("Billing pricing endpoint unavailable");
    },
  });
  
  const { data: subscriptionStatus, isError: statusError } = trpc.billing.getStatus.useQuery(undefined, {
    enabled: !!user,
    retry: false,
    onError: () => {
      console.warn("Billing status endpoint unavailable");
    },
  });
  
  const createCheckout = trpc.billing.createCheckout.useMutation();
  const createPortal = trpc.billing.createPortal.useMutation();

  // Backend unavailable flag
  const backendUnavailable = pricingError || statusError;

  // Check for URL parameters (success/cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast.success("Subscription activated!", {
        description: "Welcome to EquiProfile Pro. Your subscription is now active.",
      });
    } else if (params.get('cancelled') === 'true') {
      toast.error("Checkout cancelled", {
        description: "No charges were made. You can try again anytime.",
      });
    }
  }, []);

  const handleSubscribe = async (plan: 'monthly' | 'yearly' | 'stable_monthly' | 'stable_yearly') => {
    if (!user) {
      setLocation('/login');
      toast.error("Authentication required", {
        description: "Please sign in to subscribe.",
      });
      return;
    }

    if (backendUnavailable) {
      toast.error("Billing unavailable", {
        description: "Billing system is temporarily unavailable. Please try again later.",
      });
      return;
    }

    setLoadingPlan(plan);
    try {
      const result = await createCheckout.mutateAsync({ plan });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to create checkout session",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    if (backendUnavailable) {
      toast.error("Billing unavailable", {
        description: "Billing system is temporarily unavailable. Please try again later.",
      });
      return;
    }

    try {
      const result = await createPortal.mutateAsync();
      if (result?.url) {
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
      "1 horse profile",
      "Basic health records",
      "Training session logging",
      "Document storage",
      "Document management",
      "Email support",
    ],
    pro: [
      "Up to 10 horse profiles",
      "Complete health tracking",
      "Advanced training logs",
      "Competition results",
      "Document storage",
      "Document management",
      "AI weather analysis (50/day)",
      "Email reminders",
      "Mobile app access",
      "Export to CSV/PDF",
    ],
    stable: [
      "Everything in Pro, plus:",
      "Unlimited horse profiles",
      "Unlimited team members",
      "Role-based permissions",
      "Stable management",
      "Document storage",
      "Advanced document management",
      "Unlimited AI weather",
      "Advanced analytics",
      "Priority email support",
      "Phone support",
      "Dedicated account manager (yearly)",
    ],
  };

  const isCurrentPlan = (plan: string) => {
    if (!subscriptionStatus) return false;
    if (plan === 'trial') return subscriptionStatus.status === 'trial';
    if (plan === 'pro') return subscriptionStatus.plan === 'monthly' || subscriptionStatus.plan === 'yearly';
    if (plan === 'stable') return subscriptionStatus.plan === 'stable_monthly' || subscriptionStatus.plan === 'stable_yearly';
    return false;
  };

  const hasActiveSubscription = subscriptionStatus?.status === 'active';

  // Fallback prices if backend unavailable - now in GBP
  const monthlyPrice = pricing?.monthly?.amount ? (pricing.monthly.amount / 100).toFixed(2) : '7.99';
  const yearlyPrice = pricing?.yearly?.amount ? (pricing.yearly.amount / 100).toFixed(2) : '79';
  const stableMonthlyPrice = '24.99';
  const stableYearlyPrice = '249';

  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen">
          {/* Hero Section with Image */}
          <section className="relative h-64 md:h-80 lg:h-96 mb-12 overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src="/images/stable-management.jpg" 
                alt="Pricing" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/50" />
            </div>
            <div className="relative z-10 container mx-auto px-4 h-full flex items-center justify-center">
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-white">
                  Choose Your <span className="text-accent-400">Plan</span>
                </h1>
                <p className="text-lg md:text-xl text-white/90">
                  Professional equine management for every need. Start with a 7-day free trial, upgrade anytime.
                </p>
              </div>
            </div>
          </section>
          
          <div className="bg-gradient-to-b from-background to-muted/20 py-12 relative">
            {/* Dark overlay for consistency */}
            <div className="absolute inset-0 bg-black/5" />
            <div className="container mx-auto px-4 relative z-10">

              {/* Billing Period Toggle */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingPeriod === "monthly"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    billingPeriod === "yearly"
                      ? "bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs text-green-600 font-semibold">(Save 17%)</span>
                </button>
              </div>
            </div>

            {/* Backend Unavailable Alert */}
            {backendUnavailable && (
              <Alert className="mb-8 max-w-3xl mx-auto border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Billing system is temporarily unavailable. You can still browse pricing, but checkout is disabled. 
                  Please try again later or contact support.
                </AlertDescription>
              </Alert>
            )}

            {/* Current Subscription Alert */}
            {hasActiveSubscription && subscriptionStatus && !backendUnavailable && (
              <Alert className="mb-8 max-w-3xl mx-auto">
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Your current plan: <strong className="capitalize">{subscriptionStatus.plan}</strong> 
                    {subscriptionStatus.status === 'active' && ' (Active)'}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleManageBilling}>
                    Manage Billing
                  </Button>
                </AlertDescription>
              </Alert>
            )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Trial */}
          <Card className={`${isCurrentPlan('trial') ? 'border-primary' : ''} flex flex-col h-full`}>
            <CardHeader className="flex-grow">
              <CardTitle>Free Trial</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">£0</span>
                <span className="text-muted-foreground">/7 days</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {features.free.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentPlan('trial') ? (
                <Button className="w-full" disabled>Current Plan</Button>
              ) : (
                <Button className="w-full" variant="outline" onClick={() => setLocation('/dashboard')}>
                  Get Started
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className={`${isCurrentPlan('pro') ? 'border-primary' : ''} border-2 border-primary shadow-lg relative flex flex-col h-full`}>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For individual horse owners</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  £{billingPeriod === "monthly" ? monthlyPrice : yearlyPrice}
                </span>
                <span className="text-muted-foreground">
                  /{billingPeriod === "monthly" ? "month" : "year"}
                </span>
              </div>
              {billingPeriod === "yearly" && (
                <p className="text-sm text-green-600 font-semibold">
                  Save 17% with annual billing
                </p>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {features.pro.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              {isCurrentPlan('pro') ? (
                <>
                  <Button className="w-full" disabled>Current Plan</Button>
                  <Button 
                    className="w-full" 
                    variant="outline" 
                    onClick={handleManageBilling}
                    disabled={backendUnavailable}
                  >
                    Manage Subscription
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(billingPeriod)}
                  disabled={loadingPlan === billingPeriod || backendUnavailable}
                >
                  {loadingPlan === billingPeriod ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    backendUnavailable ? 'Temporarily Unavailable' : `Subscribe ${billingPeriod === "monthly" ? "Monthly" : "Yearly"}`
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>

          {/* Stable Plan */}
          <Card className={`${isCurrentPlan('stable') ? 'border-primary' : ''} flex flex-col h-full`}>
            <CardHeader className="flex-grow">
              <CardTitle>Stable</CardTitle>
              <CardDescription>For professional operations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  £{billingPeriod === "monthly" ? stableMonthlyPrice : stableYearlyPrice}
                </span>
                <span className="text-muted-foreground">
                  /{billingPeriod === "monthly" ? "month" : "year"}
                </span>
              </div>
              {billingPeriod === "yearly" && (
                <p className="text-sm text-green-600 font-semibold">
                  Save 17% with annual billing
                </p>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {features.stable.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentPlan('stable') ? (
                <Button className="w-full" disabled>Current Plan</Button>
              ) : (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleSubscribe(billingPeriod === "monthly" ? "stable_monthly" : "stable_yearly")}
                  disabled={backendUnavailable}
                >
                  {backendUnavailable ? 'Temporarily Unavailable' : `Subscribe ${billingPeriod === "monthly" ? "Monthly" : "Yearly"}`}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* FAQ Section - Modern Accordion */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about EquiProfile
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="trial">
                    <AccordionTrigger className="text-left">
                      How long is the free trial?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Your free trial lasts 7 days and includes full access to all features. No credit card required to start.
                      You can upgrade to a paid plan at any time during or after the trial.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cancel">
                    <AccordionTrigger className="text-left">
                      Can I cancel anytime?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Yes! You can cancel your subscription at any time with no questions asked. Your access continues until
                      the end of your current billing period. No cancellation fees, ever.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="features">
                    <AccordionTrigger className="text-left">
                      What's included in each plan?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      <div className="space-y-3">
                        <p>All plans include:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>Unlimited horses and profiles</li>
                          <li>Health records & vaccination tracking</li>
                          <li>Training logs & scheduling</li>
                          <li>Feeding plans & nutrition tracking</li>
                          <li>Document storage & management</li>
                          <li>AI-powered weather insights</li>
                          <li>Mobile app access</li>
                          <li>Email support</li>
                        </ul>
                        <p className="mt-3">
                          Yearly plans save you 17% compared to monthly billing.
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="switch">
                    <AccordionTrigger className="text-left">
                      Can I switch between plans?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll be charged a prorated
                      amount for the remainder of your billing period. When downgrading, the change takes effect at the end
                      of your current billing period.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="security">
                    <AccordionTrigger className="text-left">
                      Is my data secure?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Absolutely. We use bank-level encryption to protect your data. All information is stored securely on
                      UK-based servers with regular backups. We never sell or share your personal information with third parties.
                      Your privacy and data security are our top priorities.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment">
                    <AccordionTrigger className="text-left">
                      What payment methods do you accept?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      We accept all major credit and debit cards via Stripe, the world's leading payment processor. Your
                      payment information is securely processed by Stripe and never stored on our servers. Look for the
                      "Secure payments by Stripe" badge at checkout.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="support">
                    <AccordionTrigger className="text-left">
                      How do I get help if I have billing issues?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Our support team is here to help! Contact us at{" "}
                      <a href="mailto:support@equiprofile.online" className="text-primary hover:underline font-medium">
                        support@equiprofile.online
                      </a>{" "}
                      or call us at{" "}
                      <a href="tel:+447347258089" className="text-primary hover:underline font-medium">
                        +44 7347 258089
                      </a>.
                      We typically respond within 24 hours during business days.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Additional Support CTA */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">
                Still have questions?
              </p>
              <Button variant="outline" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </div>
          </div>
        </div>
          </div>
        </div>
        </div>
      </PageTransition>
      <Footer />
    </>
  );
}

