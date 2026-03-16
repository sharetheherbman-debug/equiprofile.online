import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason?: "trial_expired" | "subscription_expired" | "payment_required";
  message?: string;
}

export function UpgradeModal({
  open,
  onClose,
  reason = "trial_expired",
  message,
}: UpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation("/pricing");
    onClose();
  };

  const getIcon = () => {
    switch (reason) {
      case "trial_expired":
        return <Clock className="w-12 h-12 text-orange-500" />;
      case "subscription_expired":
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Clock className="w-12 h-12 text-orange-500" />;
    }
  };

  const getTitle = () => {
    switch (reason) {
      case "trial_expired":
        return "Your Free Trial Has Ended";
      case "subscription_expired":
        return "Subscription Expired";
      default:
        return "Upgrade Required";
    }
  };

  const getDescription = () => {
    if (message) return message;

    switch (reason) {
      case "trial_expired":
        return "Your 7-day free trial has ended. Upgrade to a paid plan to continue using EquiProfile and keep all your data.";
      case "subscription_expired":
        return "Your subscription has expired. Please renew to continue accessing your horse management features.";
      default:
        return "Please upgrade your plan to continue using EquiProfile.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">{getIcon()}</div>
          <DialogTitle className="text-center text-2xl">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="font-semibold">What you're missing:</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Complete health tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Training session logs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Weather & riding conditions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>AI-powered insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Document storage & more</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Badge variant="secondary" className="bg-blue-100">
                💎 Pro
              </Badge>
              <span className="font-medium">Starting at just £7.99/month</span>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button onClick={handleUpgrade} className="w-full sm:w-auto">
            View Plans & Upgrade
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
