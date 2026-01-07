import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/_core/trpc";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function Pricing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const { data: pricing } = trpc.billing.getPricing.useQuery();
  const { data: subscriptionStatus } = trpc.billing.getStatus.useQuery(undefined, {
    enabled: !!user,
  });
  const createCheckout = trpc.billing.createCheckout.useMutation();
  const createPortal = trpc.billing.createPortal.useMutation();

  // Check for URL parameters (success/cancelled)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      toast({
        title: "Subscription activated!",
        description: "Welcome to EquiProfile Pro. Your subscription is now active.",
      });
    } else if (params.get('cancelled') === 'true') {
      toast({
        title: "Checkout cancelled",
        description: "No charges were made. You can try again anytime.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      setLocation('/');
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPlan(plan);
    try {
      const result = await createCheckout.mutateAsync({ plan });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    }
  };

  const features = {
    free: [
      "7-day free trial",
      "Up to 3 horses",
      "Basic health records",
      "Training session logging",
      "1GB document storage",
      "Email support",
    ],
    pro: [
      "Unlimited horses",
      "Complete health tracking",
      "Advanced training logs",
      "Competition results",
      "10GB document storage",
      "AI weather analysis (50/day)",
      "Email reminders",
      "Mobile app access",
      "Export to CSV/PDF",
    ],
    stable: [
      "Everything in Pro, plus:",
      "Unlimited horses",
      "Unlimited team members",
      "Role-based permissions",
      "Stable management",
      "100GB document storage",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional equine management for every need. Start with a free trial, upgrade anytime.
          </p>
        </div>

        {/* Current Subscription Alert */}
        {hasActiveSubscription && subscriptionStatus && (
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
          <Card className={isCurrentPlan('trial') ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>Free Trial</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">£0</span>
                <span className="text-muted-foreground">/7 days</span>
              </div>
            </CardHeader>
            <CardContent>
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
          <Card className={`${isCurrentPlan('pro') ? 'border-primary' : ''} border-2 border-primary shadow-lg relative`}>
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
                  £{pricing?.monthly.amount ? (pricing.monthly.amount / 100).toFixed(2) : '7.99'}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                or £{pricing?.yearly.amount ? (pricing.yearly.amount / 100).toFixed(2) : '79.90'}/year 
                <span className="text-green-600 font-semibold"> (Save 17%)</span>
              </p>
            </CardHeader>
            <CardContent>
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
                  <Button className="w-full" variant="outline" onClick={handleManageBilling}>
                    Manage Subscription
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    className="w-full" 
                    onClick={() => handleSubscribe('monthly')}
                    disabled={loadingPlan === 'monthly'}
                  >
                    {loadingPlan === 'monthly' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      'Subscribe Monthly'
                    )}
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleSubscribe('yearly')}
                    disabled={loadingPlan === 'yearly'}
                  >
                    {loadingPlan === 'yearly' ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      'Subscribe Yearly (Save 17%)'
                    )}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>

          {/* Stable Plan */}
          <Card className={isCurrentPlan('stable') ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>Stable</CardTitle>
              <CardDescription>For professional operations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">£24.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                or £249.90/year <span className="text-green-600 font-semibold">(Save 17%)</span>
              </p>
            </CardHeader>
            <CardContent>
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
                <Button className="w-full" variant="outline">
                  Contact Sales
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto text-left space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can cancel your subscription at any time. Your access continues until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">What happens after the free trial?</h3>
              <p className="text-muted-foreground">
                Your account becomes read-only. You can upgrade to a paid plan anytime to regain full access.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Can I switch plans?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes are prorated automatically.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards via Stripe. Your payment information is securely processed and never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/MarketingNav";
import { PageTransition } from "@/components/PageTransition";
import { ScrollReveal, Stagger, StaggerItem } from "@/components/ScrollReveal";
import { Check } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const plans = [
  {
    name: "Basic",
    description: "Perfect for individual horse owners",
    monthlyPrice: 9,
    annualPrice: 90,
    popular: false,
    features: [
      "Up to 3 horses",
      "Health records tracking",
      "Training logs",
      "Feeding schedules",
      "Document storage (5GB)",
      "Calendar & reminders",
      "Mobile app access",
      "Email support",
    ],
  },
  {
    name: "Pro",
    description: "For serious equestrians and trainers",
    monthlyPrice: 29,
    annualPrice: 290,
    popular: true,
    features: [
      "Unlimited horses",
      "Everything in Basic",
      "AI weather analysis",
      "Advanced analytics & reports",
      "Document storage (50GB)",
      "Team collaboration (5 users)",
      "Priority support",
      "Custom branding",
      "API access",
    ],
  },
  {
    name: "Enterprise",
    description: "For stables and professional facilities",
    monthlyPrice: 99,
    annualPrice: 990,
    popular: false,
    features: [
      "Unlimited horses & users",
      "Everything in Pro",
      "Document storage (500GB)",
      "Advanced team permissions",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom integrations",
      "Training & onboarding",
      "SLA guarantee",
    ],
  },
];

const faqs = [
  {
    question: "Can I change plans later?",
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes! All new accounts get a 14-day free trial of the Pro plan with no credit card required. Cancel anytime before the trial ends.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data is always yours. You can export all your information at any time, and we'll keep your account active for 30 days after cancellation in case you change your mind.",
  },
  {
    question: "Do you offer discounts for multiple horses?",
    answer:
      "Pro and Enterprise plans include unlimited horses, making them cost-effective for managing large stables. Contact us for volume pricing options.",
  },
  {
    question: "Can I add more team members?",
    answer:
      "Yes! Pro plans include 5 team members, and you can add more for $5/month each. Enterprise plans include unlimited team members.",
  },
];

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");

  return (
    <>
      <MarketingNav />
      <PageTransition>
        <div className="min-h-screen pt-24 pb-16">
          {/* Hero Section */}
          <section className="container mx-auto px-4 mb-12">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6">
                  Simple, Transparent{" "}
                  <span className="text-gradient">Pricing</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                  Choose the perfect plan for your needs. All plans include a
                  14-day free trial.
                </p>

                {/* Billing toggle */}
                <div className="inline-flex items-center gap-3 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setBillingPeriod("monthly")}
                    className={`px-6 py-2 rounded-md transition-all ${
                      billingPeriod === "monthly"
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod("annual")}
                    className={`px-6 py-2 rounded-md transition-all ${
                      billingPeriod === "annual"
                        ? "bg-background shadow-sm font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    Annual
                    <Badge className="ml-2" variant="secondary">
                      Save 17%
                    </Badge>
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Pricing Cards */}
          <section className="container mx-auto px-4 mb-20">
            <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <StaggerItem key={index}>
                  <Card
                    className={`relative h-full flex flex-col ${
                      plan.popular
                        ? "border-2 border-primary shadow-xl scale-105"
                        : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <Badge className="px-4 py-1">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold">
                          $
                          {billingPeriod === "monthly"
                            ? plan.monthlyPrice
                            : plan.annualPrice}
                        </span>
                        <span className="text-muted-foreground">
                          /{billingPeriod === "monthly" ? "month" : "year"}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link href="/register" className="w-full">
                        <Button
                          className="w-full"
                          size="lg"
                          variant={plan.popular ? "default" : "outline"}
                        >
                          Start Free Trial
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          {/* FAQ Section */}
          <section className="container mx-auto px-4">
            <ScrollReveal>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold font-serif text-center mb-12">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <Card key={index} className="p-6">
                      <h3 className="text-lg font-semibold mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Contact CTA */}
          <section className="container mx-auto px-4 mt-20">
            <ScrollReveal>
              <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold font-serif mb-4">
                    Need a Custom Solution?
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Contact our sales team for custom enterprise pricing and
                    features tailored to your organization.
                  </p>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="text-lg">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </Card>
            </ScrollReveal>
          </section>
        </div>
      </PageTransition>
    </>
  );
}
