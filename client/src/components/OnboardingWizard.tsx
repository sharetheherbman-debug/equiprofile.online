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
  X,
  BookOpen,
  Calendar,
  FileText,
  Dumbbell,
  MapPin,
  Settings,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface OnboardingWizardProps {
  userName: string;
  onComplete: () => void;
  onSkip: () => void;
}

// Step 0 = welcome choice; steps 1-5 = setup wizard
const WIZARD_STEPS = 5;

/** Translate opaque tRPC/network errors into user-friendly messages. */
function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (
    msg.toLowerCase().includes("transform") ||
    msg.toLowerCase().includes("parse") ||
    msg.toLowerCase().includes("json")
  ) {
    return "Unable to reach the server. Please check your connection and try again, or skip this step.";
  }
  if (
    msg.toLowerCase().includes("trial") ||
    msg.toLowerCase().includes("upgrade") ||
    msg.toLowerCase().includes("subscription")
  ) {
    return msg;
  }
  if (msg.toLowerCase().includes("limit")) {
    return msg;
  }
  return msg || "Something went wrong. Please try again.";
}

export function OnboardingWizard({
  userName,
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  // step === 0 → welcome choice screen
  const [step, setStep] = useState(0);
  const [horseName, setHorseName] = useState("");
  const [horseBreed, setHorseBreed] = useState("");
  const [horseAge, setHorseAge] = useState("");
  const [selectedExperience, setSelectedExperience] = useState<
    "standard" | "stable" | null
  >(null);
  const [horseAdded, setHorseAdded] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const createHorse = trpc.horses.create.useMutation();
  const setExperience = trpc.user.setExperience.useMutation();
  const completeOnboarding = trpc.user.completeOnboarding.useMutation();
  const updateStep = trpc.user.updateOnboardingStep.useMutation();

  const goToStep = useCallback(
    (nextStep: number) => {
      setStep(nextStep);
      setError("");
      if (nextStep >= 1 && nextStep <= WIZARD_STEPS) {
        updateStep.mutate({ step: nextStep });
      }
    },
    [updateStep],
  );

  const handleStartSetup = () => {
    goToStep(1);
  };

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
        age:
          horseAge
            ? Number.isNaN(parseInt(horseAge, 10))
              ? undefined
              : parseInt(horseAge, 10)
            : undefined,
      });
      setHorseAdded(true);
      goToStep(3);
    } catch (err: unknown) {
      setError(friendlyError(err));
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
      setError("Failed to save. Please try again.");
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
      // Proceed to dashboard even if the save failed
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  /** Navigate to a dashboard section and close the wizard */
  const goToSection = (path: string) => {
    handleComplete();
    setLocation(path);
  };

  const progressWidth = step === 0 ? "0%" : `${(step / WIZARD_STEPS) * 100}%`;
  const firstName = userName ? userName.split(" ")[0] : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md">
        {/* Progress bar – only visible during wizard steps */}
        {step > 0 && (
          <div className="mb-5">
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: progressWidth }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Step {step} of {WIZARD_STEPS}
              </p>
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Skip setup
              </button>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-[#0f1d32]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {/* ── Step 0: Welcome choice ─────────────────────────────── */}
            {step === 0 && (
              <StepContainer key="choice">
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                      Welcome to EquiProfile
                      {firstName ? `, ${firstName}` : ""}!
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                      Your horse management dashboard is ready. Would you like a
                      quick guided setup, or jump straight in?
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    <Button
                      onClick={handleStartSetup}
                      className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-12 text-base"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Help me set things up
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onSkip}
                      className="w-full text-gray-400 hover:text-white hover:bg-white/10 h-11 text-sm"
                    >
                      Skip for now — go straight to dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  <p className="text-xs text-gray-600">
                    You can always restart this from Settings → Help & Setup
                  </p>
                </div>
              </StepContainer>
            )}

            {/* ── Step 1: Welcome ───────────────────────────────────── */}
            {step === 1 && (
              <StepContainer key="welcome">
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">
                      Let's get you set up
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                      In just a few steps we'll personalise EquiProfile for you
                      so you get value from day one.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-2">
                    {[
                      { icon: Heart, label: "Add a horse" },
                      { icon: User, label: "Choose your setup" },
                      { icon: Check, label: "Start using it" },
                    ].map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/5 border border-white/5"
                      >
                        <Icon className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => goToStep(2)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-11 text-sm"
                  >
                    Get started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </StepContainer>
            )}

            {/* ── Step 2: Add first horse ───────────────────────────── */}
            {step === 2 && (
              <StepContainer key="horse">
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Add Your First Horse
                    </h2>
                    <p className="text-gray-400 text-sm">
                      You can add more horses and details later
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">
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
                        onKeyDown={(e) => e.key === "Enter" && handleAddHorse()}
                        autoFocus
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-white/20 h-11 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="horse-breed" className="text-white text-sm">
                          Breed{" "}
                          <span className="text-gray-500 font-normal text-xs">
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
                          <span className="text-gray-500 font-normal text-xs">
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
                  </div>

                  <Button
                    onClick={handleAddHorse}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-11 text-sm"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding horse…
                      </>
                    ) : (
                      <>
                        Add horse & continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>

                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
                  >
                    Skip this step →
                  </button>
                </div>
              </StepContainer>
            )}

            {/* ── Step 3: Experience ────────────────────────────────── */}
            {step === 3 && (
              <StepContainer key="experience">
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <h2 className="text-xl font-bold text-white">
                      How will you use EquiProfile?
                    </h2>
                    <p className="text-gray-400 text-sm">
                      We'll customise your dashboard accordingly
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSelectExperience("standard")}
                      disabled={saving}
                      className="group p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/50 transition-all duration-200 text-left disabled:opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Personal Use
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Track and manage your own horses
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectExperience("stable")}
                      disabled={saving}
                      className="group p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-amber-500/50 transition-all duration-200 text-left disabled:opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                          <Home className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white">
                            Stable / Yard Management
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Manage multiple horses, staff, and operations
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {saving && (
                    <div className="flex justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => goToStep(4)}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
                  >
                    Skip this step →
                  </button>
                </div>
              </StepContainer>
            )}

            {/* ── Step 4: Guided tour of key areas ──────────────────── */}
            {step === 4 && (
              <StepContainer key="tour">
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <h2 className="text-xl font-bold text-white">
                      Here's where everything lives
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Click any area to go there now, or continue to finish
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        icon: Heart,
                        label: "My Horses",
                        description: "Profiles & health",
                        path: "/horses",
                        color: "from-rose-500 to-pink-600",
                      },
                      {
                        icon: Dumbbell,
                        label: "Training",
                        description: "Sessions & plans",
                        path: "/training",
                        color: "from-violet-500 to-purple-600",
                      },
                      {
                        icon: FileText,
                        label: "Documents",
                        description: "Files & records",
                        path: "/documents",
                        color: "from-blue-500 to-cyan-600",
                      },
                      {
                        icon: Calendar,
                        label: "Calendar",
                        description: "Events & reminders",
                        path: "/calendar",
                        color: "from-emerald-500 to-teal-600",
                      },
                      {
                        icon: BookOpen,
                        label: "Health",
                        description: "Records & meds",
                        path: "/health",
                        color: "from-amber-500 to-orange-600",
                      },
                      {
                        icon: Settings,
                        label: "Settings",
                        description: "Profile & prefs",
                        path: "/settings",
                        color: "from-gray-500 to-slate-600",
                      },
                    ].map(({ icon: Icon, label, description, path, color }) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => goToSection(path)}
                        className="flex items-center gap-2.5 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}
                        >
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => goToStep(5)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-indigo-500/20 h-11 text-sm"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </StepContainer>
            )}

            {/* ── Step 5: Done ──────────────────────────────────────── */}
            {step === 5 && (
              <StepContainer key="ready">
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Check className="w-7 h-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white">
                      You're all set!
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                      Your dashboard is ready. Here are good first steps:
                    </p>
                  </div>

                  <div className="space-y-2 text-left">
                    {[
                      {
                        icon: Heart,
                        text: horseAdded
                          ? `${horseName || "Your horse"} is added — view their profile`
                          : "Add your first horse",
                        path: "/horses",
                      },
                      {
                        icon: FileText,
                        text: "Upload vet records or documents",
                        path: "/documents",
                      },
                      {
                        icon: MapPin,
                        text: "Set your location for weather-aware scheduling",
                        path: "/settings",
                      },
                    ].map(({ icon: Icon, text, path }) => (
                      <button
                        key={path + text}
                        type="button"
                        onClick={() => goToSection(path)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group"
                      >
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Icon className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors flex-1">
                          {text}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={handleComplete}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-0 shadow-lg shadow-emerald-500/20 h-11 text-sm mt-1"
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="p-6 sm:p-7"
    >
      {children}
    </motion.div>
  );
}

