import { create } from "zustand";

interface UpgradeModalState {
  isOpen: boolean;
  reason: "trial_expired" | "subscription_expired" | "payment_required";
  message?: string;
  open: (
    reason?: "trial_expired" | "subscription_expired" | "payment_required",
    message?: string,
  ) => void;
  close: () => void;
}

export const useUpgradeModal = create<UpgradeModalState>((set) => ({
  isOpen: false,
  reason: "trial_expired",
  message: undefined,
  open: (reason = "trial_expired", message) =>
    set({ isOpen: true, reason, message }),
  close: () => set({ isOpen: false, message: undefined }),
}));
