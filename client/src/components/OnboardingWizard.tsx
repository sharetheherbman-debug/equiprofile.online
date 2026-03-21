import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  Sparkles,
  Heart,
  Home,
  User,
  Check,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface OnboardingWizardProps {
  userName: string;
  onComplete: () => void;
}

const TOTAL_STEPS = 5;

export function OnboardingWizard({
  userName,
  onComplete,
}: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [horseName, setHorseName] = useState("");
  const [horseBreed, setHorseBreed] = useState("");
  const [horseAge, setHorseAge] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<
    "standard" | "stable" | null
  >(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const utils = trpc.useUtils();
  const createHorse = trpc.horses.create.useMutation();
  const setExperience = trpc.user.setExperience.useMutation();
  const completeOnboarding = trpc.user.completeOnboarding.useMutation();
  const updateStep = trpc.user.updateOnboardingStep.useMutation();

  const goToStep = useCallback(
    (nextStep: number) => {
      setStep(nextStep);
      setError("");
      updateStep.mutate({ step: nextStep });
    },
    [updateStep],
  );

  const handleAddHorse = async () => {
    if (!horseName.trim()) {
      setError("Please enter your horse's name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createHorse.mutateAsync({
        name: horseName.trim(),
        breed: horseBreed.trim() || undefined,
        age: horseAge ? (Number.isNaN(parseInt(horseAge, 10)) ? undefined : parseInt(horseAge, 10)) : undefined,
      });
      goToStep(3);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to add horse";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectExperience = async (
    experience: "standard" | "stable",
  ) => {
    setSaving(true);
    setError("");
    try {
      await setExperience.mutateAsync({ experience });
      setSelectedExperience(experience);
      goToStep(4);
    } catch {
      setError("Failed to save experience. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await completeOnboarding.mutateAsync();
      await utils.auth.me.invalidate();
      onComplete();
    } catch {
      // Proceed anyway
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const progressWidth = `${(step / TOTAL_STEPS) * 100}%`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a1628]/95 backdrop-blur-xl">
      <div className="w-full max-w-lg mx-4">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: progressWidth }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0f1d32]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepContainer key="welcome">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Welcome to EquiProfile
                    {userName ? `, ${userName.split(" ")[0]}` : ""}!
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                    Let's get you set up in less than a minute. We'll help you
                    add your first horse and personalise your experience.
                  </p>
                  <Button
                    onClick={() => goToStep(2)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-12 text-base mt-4"
                  >
                    Start Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </StepContainer>
            )}

            {step === 2 && (
              <StepContainer key="horse">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Add Your First Horse
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Every great journey starts here
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 text-center bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="horse-name" className="text-white text-sm">
                        Horse Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="horse-name"
                        type="text"
                        placeholder="e.g. Midnight Star"
                        value={horseName}
                        onChange={(e) => setHorseName(e.target.value)}
                        autoFocus
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-white/20 h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="horse-breed"
                        className="text-white text-sm"
                      >
                        Breed{" "}
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="horse-breed"
                        type="text"
                        placeholder="e.g. Thoroughbred"
                        value={horseBreed}
                        onChange={(e) => setHorseBreed(e.target.value)}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-white/20 h-11 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="horse-age" className="text-white text-sm">
                        Age{" "}
                        <span className="text-gray-500 font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        id="horse-age"
                        type="number"
                        placeholder="e.g. 8"
                        value={horseAge}
                        onChange={(e) => setHorseAge(e.target.value)}
                        min={0}
                        max={50}
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-white/20 h-11 text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddHorse}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-12 text-base"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding horse…
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </StepContainer>
            )}

            {step === 3 && (
              <StepContainer key="experience">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-white">
                      How Will You Use EquiProfile?
                    </h2>
                    <p className="text-gray-400 text-sm">
                      We'll customise your dashboard accordingly
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 text-center bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectExperience("standard")}
                      disabled={saving}
                      className="group relative p-5 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-200 text-left disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white mb-0.5">
                            Personal Use
                          </h3>
                          <p className="text-sm text-gray-400">
                            Track and manage your own horses
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectExperience("stable")}
                      disabled={saving}
                      className="group relative p-5 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/50 transition-all duration-200 text-left disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                          <Home className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-white mb-0.5">
                            Stable / Yard Management
                          </h3>
                          <p className="text-sm text-gray-400">
                            Manage multiple horses, staff, and stable operations
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </StepContainer>
            )}

            {step === 4 && (
              <StepContainer key="summary">
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-white">
                      Your Personalised Setup
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {selectedExperience === "stable"
                        ? "Here's what's ready for your stable"
                        : "Here's what's ready for you"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {(selectedExperience === "stable"
                      ? [
                          "Multi-horse management dashboard",
                          "Staff & client management tools",
                          "Stable operations centre",
                          "Health & training tracking",
                          "Document storage & invoicing",
                        ]
                      : [
                          "Horse profile & health records",
                          "Training log & plans",
                          "Nutrition & feeding management",
                          "Weather-aware scheduling",
                          "Document storage & reminders",
                        ]
                    ).map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                      >
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => goToStep(5)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-12 text-base"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </StepContainer>
            )}

            {step === 5 && (
              <StepContainer key="ready">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    You're All Set!
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                    Your account is ready. Explore your dashboard, add more
                    horses, and make the most of your 7-day free trial.
                  </p>

                  <div className="space-y-2 text-left">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm text-gray-300">
                        {horseName || "Horse"} added
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm text-gray-300">
                        {selectedExperience === "stable"
                          ? "Stable / Yard Management"
                          : "Personal Use"}{" "}
                        experience selected
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleComplete}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/20 h-12 text-base mt-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Go to Dashboard
                  </Button>
                </div>
              </StepContainer>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="p-6 sm:p-8"
    >
      {children}
    </motion.div>
  );
}
