import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";

export interface TourStep {
  /** A CSS selector or element ref to spotlight. If omitted the tooltip is centred. */
  target?: string;
  title: string;
  content: string;
  /** Position relative to the target element */
  placement?: "top" | "bottom" | "left" | "right";
}

interface GuidedTourProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
}

/**
 * Reusable guided-tour overlay.
 *
 * Renders a dark backdrop with a spotlight on the `target` element and a
 * floating tooltip that walks the user through the provided steps.
 */
export function GuidedTour({ tourId, steps, onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const dismissTour = trpc.user.dismissTour.useMutation();

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const finish = useCallback(() => {
    setVisible(false);
    dismissTour.mutate({ tourId });
    onComplete?.();
  }, [dismissTour, tourId, onComplete]);

  const next = useCallback(() => {
    if (isLast) {
      finish();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [isLast, finish]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  // Allow Escape to dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [finish]);

  if (!visible || !step) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={finish}
        />

        {/* Tooltip card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-sm mx-4 bg-[#0f1d32]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6"
        >
          {/* Close button */}
          <button
            onClick={finish}
            className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
            aria-label="Close tour"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Step counter */}
          <div className="flex gap-1 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= currentStep ? "bg-gradient-to-r from-indigo-500 to-cyan-500" : "bg-white/10"}`}
              />
            ))}
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            {step.content}
          </p>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              disabled={currentStep === 0}
              className="text-gray-400 hover:text-white disabled:opacity-30"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            <Button
              size="sm"
              onClick={next}
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20"
            >
              {isLast ? "Got it!" : "Next"}
              {!isLast && <ArrowRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
