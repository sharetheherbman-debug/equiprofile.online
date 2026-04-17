// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, ChevronRight, Home, Building2, Check } from "lucide-react";

/**
 * Post-registration experience selection page.
 *
 * Shown to new users after registration so they can choose between
 * the Standard (personal equestrian) and Stable (stable management) experience.
 * Sets planTier via user.setExperience and routes to the correct dashboard.
 */
export default function Onboarding() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<"standard" | "stable" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setExperience = trpc.user.setExperience.useMutation();
  const utils = trpc.useUtils();

  const rawName = user?.name?.trim() ?? "";
  const firstName = rawName.split(/\s+/)[0] || "there";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b1726]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleConfirm = async () => {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      await setExperience.mutateAsync({ experience: selected });
      // Invalidate auth cache so planTier is fresh
      await utils.auth.me.invalidate();
      if (selected === "stable") {
        window.location.href = "/stable-setup";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Failed to save your choice. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1726] flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl relative"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3a93b8] to-[#5b8def] mb-4 shadow-lg shadow-[#5b8def]/30">
            <span className="font-serif text-2xl font-bold text-white">E</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif mb-2">
            Welcome, {firstName}!
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-sm mx-auto">
            Choose the experience that best describes how you use EquiProfile.
            You can change this later in Settings.
          </p>
        </div>

        {/* Choice cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Standard */}
          <button
            type="button"
            onClick={() => setSelected("standard")}
            className={`relative group text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none ${
              selected === "standard"
                ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-[#5b8def]/20"
                : "border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/8"
            }`}
          >
            {selected === "standard" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3 shadow-sm">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-semibold text-white text-sm mb-1">
              Personal Equestrian
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              For individual horse owners and riders. Manage your horses,
              health records, training, nutrition, and more.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {["My Horses", "Health", "Training", "Weather"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>

          {/* Stable */}
          <button
            type="button"
            onClick={() => setSelected("stable")}
            className={`relative group text-left rounded-2xl border-2 p-5 transition-all duration-200 focus:outline-none ${
              selected === "stable"
                ? "border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                : "border-white/10 bg-white/5 hover:border-amber-500/50 hover:bg-white/8"
            }`}
          >
            {selected === "stable" && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-semibold text-white text-sm mb-1">
              Stable Management
            </h2>
            <p className="text-slate-400 text-xs leading-relaxed">
              For stable owners and yard managers. Full stable operations,
              staff management, client portal, and lesson scheduling.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              {["Staff", "Clients", "Scheduling", "Operations"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs text-center mb-4">{error}</p>
        )}

        {/* Confirm button */}
        <Button
          onClick={handleConfirm}
          disabled={!selected || saving}
          className={`w-full h-12 text-sm font-semibold transition-all ${
            selected
              ? "bg-gradient-to-r from-[#2e86ab] to-[#5b8def] hover:from-[#1a5276] hover:to-[#4a7dd4] text-white shadow-lg shadow-[#5b8def]/30"
              : "bg-white/10 text-white/40 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Continue to Dashboard
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>

        <p className="text-center text-xs text-slate-500 mt-4">
          You can change your experience at any time in{" "}
          <button
            type="button"
            onClick={() => setLocation("/settings")}
            className="text-slate-400 underline hover:text-slate-300"
          >
            Settings
          </button>
        </p>
      </motion.div>
    </div>
  );
}
