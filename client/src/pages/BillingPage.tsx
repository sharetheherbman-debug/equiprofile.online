import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/_core/trpc";
import { Loader2, Check, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BillingPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate trial days remaining
  const trialDaysLeft = user?.trialEndsAt 
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const isTrialActive = user?.subscriptionStatus === "trial" && trialDaysLeft > 0;
  const isSubscriptionActive = user?.subscriptionStatus === "active";
  const isTrialExpired = user?.subscriptionStatus === "trial" && trialDaysLeft <= 0;

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    setIsLoading(true);
    setError("");

    try {
      // Call tRPC mutation to create checkout session
      // This will be implemented in the tRPC router
      window.location.href = `/api/billing/checkout?plan=${plan}`;
    } catch (err) {
      setError("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Redirect to Stripe Customer Portal
      window.location.href = "/api/billing/portal";
    } catch (err) {
      setError("Failed to open billing portal. Please try again.");
      setIsLoading(false);
    }
  };

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

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
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
                        {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} remaining
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your trial ends on{" "}
                      <strong>{user?.trialEndsAt ? new Date(user.trialEndsAt).toLocaleDateString() : "N/A"}</strong>.
                      Subscribe to continue using all features.
                    </p>
                  </div>
                )}

                {isTrialExpired && (
                  <div>
                    <Badge variant="destructive" className="mb-2">Trial Ended</Badge>
                    <p className="text-sm text-muted-foreground">
                      Your trial has ended. Please subscribe to regain access to all features.
                    </p>
                  </div>
                )}

                {isSubscriptionActive && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="bg-green-600">Active</Badge>
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
                            ? new Date(user.subscriptionEndsAt).toLocaleDateString()
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
                    disabled={isLoading}
                  >
                    {isLoading ? (
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

          {/* Pricing Plans - Only show if not active subscriber */}
          {!isSubscriptionActive && (
            <>
              <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Monthly Plan */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Monthly</CardTitle>
                    <CardDescription>Billed monthly, cancel anytime</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="text-4xl font-bold">£7.99</div>
                      <div className="text-muted-foreground">per month</div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Unlimited horse profiles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Complete health tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Training session management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Document storage (5GB)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Calendar & reminders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Priority support</span>
                      </li>
                    </ul>

                    <Button
                      onClick={() => handleSubscribe("monthly")}
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Choose Monthly"
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Yearly Plan */}
                <Card className="border-2 border-primary relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Save 17%
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle>Yearly</CardTitle>
                    <CardDescription>Best value - save £16 per year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="text-4xl font-bold">£79.90</div>
                      <div className="text-muted-foreground">per year</div>
                      <div className="text-sm text-primary mt-1">
                        Just £6.66 per month
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Unlimited horse profiles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Complete health tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Training session management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Document storage (5GB)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Calendar & reminders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Priority support</span>
                      </li>
                    </ul>

                    <Button
                      onClick={() => handleSubscribe("yearly")}
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Choose Yearly"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>All plans include a secure checkout powered by Stripe.</p>
                <p className="mt-2">Cancel anytime. No questions asked.</p>
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
