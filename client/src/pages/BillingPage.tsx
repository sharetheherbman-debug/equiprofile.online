import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/_core/trpc";
import {
  Loader2,
  Check,
  CreditCard,
  Calendar,
  AlertCircle,
  Sparkles,
  Crown,
  Building2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DEFAULT_PRICING, penceToGBP } from "@shared/pricing";
import { toast } from "sonner";

const YEARLY_SAVINGS_PERCENTAGE = Math.round(
  ((DEFAULT_PRICING.individual.monthly.amount * 12 -
    DEFAULT_PRICING.individual.yearly.amount) /
    (DEFAULT_PRICING.individual.monthly.amount * 12)) *
    100,
);

export default function BillingPage() {
  const { user } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const { data: featureFlags } = trpc.system.getFeatureFlags.useQuery();
  const { data: pricing } = trpc.billing.getPricing.useQuery();
  const { data: subscriptionStatus } = trpc.billing.getStatus.useQuery();

  const createCheckout = trpc.billing.createCheckout.useMutation({
    onError: (error) => {
      toast.error("Checkout failed", { description: error.message });
    },
  });
  const createPortal = trpc.billing.createPortal.useMutation({
    onError: (error) => {
      toast.error("Portal failed", { description: error.message });
    },
  });

  const trialDaysLeft = user?.trialEndsAt
    ? Math.ceil(
        (new Date(user.trialEndsAt).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const isTrialActive =
    user?.subscriptionStatus === "trial" && trialDaysLeft > 0;
  const isSubscriptionActive = user?.subscriptionStatus === "active";
  const isTrialExpired =
    user?.subscriptionStatus === "trial" && trialDaysLeft <= 0;

  const handleSubscribe = async (plan: "pro" | "stable") => {
    try {
      const result = await createCheckout.mutateAsync({
        plan,
        interval: billingPeriod,
      });
      if (result.url) window.location.href = result.url;
    } catch {
      // error handled by mutation onError
    }
  };

  const handleManageSubscription = async () => {
    try {
      const result = await createPortal.mutateAsync();
      if (result.url) window.location.href = result.url;
    } catch {
      // error handled by mutation onError
    }
  };

  const formatPrice = (amountInPence: number | undefined): string => {
    if (!amountInPence || amountInPence <= 0)
      return penceToGBP(DEFAULT_PRICING.individual.monthly.amount);
    return penceToGBP(amountInPence);
  };

  const getProPrice = () => {
    const amount =
      billingPeriod === "monthly"
        ? (pricing?.pro?.monthly?.amount ??
          DEFAULT_PRICING.individual.monthly.amount)
        : (pricing?.pro?.yearly?.amount ??
          DEFAULT_PRICING.individual.yearly.amount);
    return formatPrice(amount);
  };

  const getStablePrice = () => {
    const amount =
      billingPeriod === "monthly"
        ? (pricing?.stable?.monthly?.amount ??
          DEFAULT_PRICING.stable.monthly.amount)
        : (pricing?.stable?.yearly?.amount ??
          DEFAULT_PRICING.stable.yearly.amount);
    return formatPrice(amount);
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

  const trialFeatures: readonly string[] = pricing?.trial?.features ?? [
    "7-day free trial",
    "1 horse only",
    "ALL features enabled",
    "Basic health records",
    "Training session logging",
    "Secure storage",
    "Email support",
  ];

  const proFeatures: readonly string[] = pricing?.pro?.features ?? [
    "Up to 5 horses",
    "Complete health tracking",
    "Advanced training logs",
    "Competition results",
    "Secure storage",
    "AI weather analysis (50/day)",
    "Email reminders",
    "Export to CSV/PDF",
  ];

  const stableFeatures: readonly string[] = pricing?.stable?.features ?? [
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
  ];

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
            <p className="text-muted-foreground">
              Manage your subscription and billing information
            </p>
          </div>

          {/* Stripe disabled state */}
          {featureFlags && !featureFlags.enableStripe && (
            <Alert className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Billing is not configured. Contact your administrator.
              </AlertDescription>
            </Alert>
          )}

          {/* Current Status Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isTrialActive && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Free Trial</Badge>
                      <span className="text-sm text-muted-foreground">
                        {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"}{" "}
                        remaining
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your trial ends on{" "}
                      <strong>
                        {user?.trialEndsAt
                          ? new Date(user.trialEndsAt).toLocaleDateString()
                          : "N/A"}
                      </strong>
                      . Subscribe to continue using all features.
                    </p>
                  </div>
                )}

                {isTrialExpired && (
                  <div>
                    <Badge variant="destructive" className="mb-2">
                      Trial Ended
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Your trial has ended. Please subscribe to regain access to
                      all features.
                    </p>
                  </div>
                )}

                {isSubscriptionActive && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                      <span className="text-sm text-muted-foreground capitalize">
                        {user?.subscriptionPlan || "Monthly"} Plan
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Next billing date:{" "}
                        <strong>
                          {user?.subscriptionEndsAt
                            ? new Date(
                                user.subscriptionEndsAt,
                              ).toLocaleDateString()
                            : "N/A"}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {isSubscriptionActive && (
                <div className="mt-6">
                  <Button
                    onClick={handleManageSubscription}
                    variant="outline"
                    disabled={createPortal.isPending}
                  >
                    {createPortal.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Update payment method, view invoices, or cancel subscription
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing Period Toggle */}
          {!isSubscriptionActive && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Choose Your Plan</h2>
                <div className="inline-flex items-center gap-2 bg-muted rounded-full p-1">
                  <button
                    onClick={() => setBillingPeriod("monthly")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      billingPeriod === "monthly"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod("yearly")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      billingPeriod === "yearly"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Yearly
                    <span className="ml-1.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">
                      Save {YEARLY_SAVINGS_PERCENTAGE}%
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
                {/* Starter Plan */}
                <Card className="border-2 border-primary relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3">
                      Most Popular
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {"Starter"}
                        {isCurrentPlan("pro") && (
                          <Badge variant="secondary" className="text-xs">
                            Current Plan
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      For individual horse owners — up to 5 horses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-5">
                      <div className="text-3xl font-bold">£{getProPrice()}</div>
                      <div className="text-muted-foreground text-sm">
                        per {billingPeriod === "monthly" ? "month" : "year"}
                        {billingPeriod === "yearly" && (
                          <span className="ml-2 text-xs text-green-600">
                            (£
                            {(
                              (pricing?.pro?.yearly?.amount ??
                                DEFAULT_PRICING.individual.yearly.amount) /
                              100 /
                              12
                            ).toFixed(2)}
                            /mo)
                          </span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {proFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                    {isCurrentPlan("pro") ? (
                      <Button
                        onClick={() => handleSubscribe("pro")}
                        className="w-full"
                        disabled
                        variant="secondary"
                      >
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe("pro")}
                        className="w-full"
                        disabled={createCheckout.isPending}
                      >
                        {createCheckout.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Choose Starter"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Stable Plan */}
                <Card
                  className={`border-2 ${isCurrentPlan("stable") ? "border-primary" : "border-muted"}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {pricing?.stable?.name ?? "Stable"}
                        {isCurrentPlan("stable") && (
                          <Badge variant="secondary" className="text-xs">
                            Current Plan
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      For stables managing multiple horses, staff, and owners
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-5">
                      <div className="text-3xl font-bold">
                        £{getStablePrice()}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        per {billingPeriod === "monthly" ? "month" : "year"}
                        {billingPeriod === "yearly" && (
                          <span className="ml-2 text-xs text-green-600">
                            (£
                            {(
                              (pricing?.stable?.yearly?.amount ??
                                DEFAULT_PRICING.stable.yearly.amount) /
                              100 /
                              12
                            ).toFixed(2)}
                            /mo)
                          </span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-2 mb-5">
                      {stableFeatures.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                    {isCurrentPlan("stable") ? (
                      <Button variant="secondary" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleSubscribe("stable")}
                        variant="outline"
                        className="w-full"
                        disabled={createCheckout.isPending}
                      >
                        {createCheckout.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Choose Stable"
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>All plans include a secure checkout powered by Stripe.</p>
                <p className="mt-2">Cancel anytime. No questions asked.</p>
              </div>
            </>
          )}

          {/* Active subscriber: show manage options */}
          {isSubscriptionActive && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    To upgrade or change your plan, use{" "}
                    <strong>Manage Subscription</strong> above or contact{" "}
                    <a
                      href="mailto:hello@equiprofile.online"
                      className="underline"
                    >
                      hello@equiprofile.online
                    </a>
                    .
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
