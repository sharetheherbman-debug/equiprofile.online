import { useAuth } from "@/_core/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export function TrialBanner() {
  const { user } = useAuth();

  if (!user) return null;

  // Calculate trial days remaining
  const trialDaysLeft = user.trialEndsAt
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const isTrialActive = user.subscriptionStatus === "trial" && trialDaysLeft > 0;
  const isTrialExpired = user.subscriptionStatus === "trial" && trialDaysLeft <= 0;
  const isSubscriptionActive = user.subscriptionStatus === "active";

  // Don't show banner if user has active subscription or is admin
  if (isSubscriptionActive || user.role === "admin") {
    return null;
  }

  // Trial ending soon (2 days or less)
  if (isTrialActive && trialDaysLeft <= 2) {
    return (
      <Alert variant="destructive" className="border-orange-600 bg-orange-50 dark:bg-orange-950/20">
        <Clock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span className="text-sm">
            <strong>Trial ending soon!</strong> You have {trialDaysLeft}{" "}
            {trialDaysLeft === 1 ? "day" : "days"} left. Subscribe to keep your data and continue using all features.
          </span>
          <Link href="/billing">
            <Button variant="default" size="sm" className="ml-4 bg-orange-600 hover:bg-orange-700">
              Upgrade Now
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // Active trial (more than 2 days left)
  if (isTrialActive) {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Free Trial:</strong> {trialDaysLeft} days remaining. Enjoying EquiProfile?{" "}
            <Link href="/billing">
              <a className="underline font-medium">Subscribe now</a>
            </Link>
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial expired
  if (isTrialExpired) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between w-full">
          <span className="text-sm">
            <strong>Trial Ended:</strong> Your free trial has expired. Subscribe now to regain access to all features.
          </span>
          <Link href="/billing">
            <Button variant="default" size="sm" className="ml-4">
              Subscribe
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
