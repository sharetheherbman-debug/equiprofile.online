import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Pricing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
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
      toast.success("Subscription activated!", {
        description: "Welcome to EquiProfile Pro. Your subscription is now active.",
      });
    } else if (params.get('cancelled') === 'true') {
      toast.error("Checkout cancelled", {
        description: "No charges were made. You can try again anytime.",
      });
    }
  }, []);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      setLocation('/');
      toast.error("Authentication required", {
        description: "Please sign in to subscribe.",
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
      toast.error("Error", {
        description: error.message || "Failed to create checkout session",
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
      toast.error("Error", {
        description: error.message || "Failed to open billing portal",
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
  );
}

