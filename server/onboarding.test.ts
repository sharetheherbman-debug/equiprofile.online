/**
 * Tests for the onboarding system tRPC endpoints:
 * - user.getOnboardingStatus
 * - user.updateOnboardingStep
 * - user.completeOnboarding
 * - user.setExperience
 * - user.updateActivationChecklist
 * - user.dismissTour
 * - user.dismissTip
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ────────────────────────────────────────────────────────────────
let mockPreferences: string | null = null;

vi.mock("./db", () => ({
  getUserById: vi.fn().mockImplementation(() =>
    Promise.resolve({
      id: 1,
      preferences: mockPreferences,
      subscriptionStatus: "trial",
      isSuspended: false,
    }),
  ),
  updateUser: vi.fn().mockResolvedValue(undefined),
  logActivity: vi.fn().mockResolvedValue(undefined),
  getUserByEmail: vi.fn().mockResolvedValue(null),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  getHorsesByUserId: vi.fn().mockResolvedValue([]),
  getUpcomingTrainingSessions: vi.fn().mockResolvedValue([]),
  getUpcomingReminders: vi.fn().mockResolvedValue([]),
  getLatestWeatherLog: vi.fn().mockResolvedValue(null),
}));

import * as db from "./db";

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeContext(userId = 1): TrpcContext {
  return {
    req: {} as any,
    res: {} as any,
    user: {
      id: userId,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      passwordHash: null,
      emailVerified: false,
      resetToken: null,
      resetTokenExpiry: null,
      loginMethod: "email",
      role: "user",
      subscriptionStatus: "trial",
      subscriptionPlan: "monthly",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subscriptionEndsAt: null,
      lastPaymentAt: null,
      isActive: true,
      isSuspended: false,
      suspendedReason: null,
      phone: null,
      location: null,
      latitude: null,
      longitude: null,
      profileImageUrl: null,
      storageUsedBytes: 0,
      storageQuotaBytes: 104857600,
      preferences: null,
      language: "en",
      theme: "system",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    hasAccess: true,
  };
}

const caller = appRouter.createCaller(makeContext());

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("onboarding endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPreferences = null;
  });

  describe("user.getOnboardingStatus", () => {
    it("returns defaults for a new user with no preferences", async () => {
      const result = await caller.user.getOnboardingStatus();
      expect(result.completed).toBe(false);
      expect(result.skipped).toBe(false);
      expect(result.step).toBe(1);
      expect(result.selectedExperience).toBeNull();
      expect(result.activationChecklist).toEqual({
        addedHorse: false,
        choseExperience: false,
        viewedDashboard: false,
        addedHealthRecord: false,
        exploredTraining: false,
      });
    });

    it("returns saved onboarding state from preferences", async () => {
      mockPreferences = JSON.stringify({
        onboardingCompleted: true,
        onboardingStep: 5,
        selectedExperience: "stable",
        activationChecklist: {
          addedHorse: true,
          choseExperience: true,
          viewedDashboard: false,
          addedHealthRecord: false,
          exploredTraining: false,
        },
      });

      const result = await caller.user.getOnboardingStatus();
      expect(result.completed).toBe(true);
      expect(result.step).toBe(5);
      expect(result.selectedExperience).toBe("stable");
      expect(result.activationChecklist.addedHorse).toBe(true);
    });
  });

  describe("user.updateOnboardingStep", () => {
    it("saves the onboarding step", async () => {
      await caller.user.updateOnboardingStep({ step: 3 });
      expect(db.updateUser).toHaveBeenCalledWith(1, {
        preferences: expect.stringContaining('"onboardingStep":3'),
      });
    });
  });

  describe("user.completeOnboarding", () => {
    it("sets onboardingCompleted to true and skipped to false", async () => {
      const result = await caller.user.completeOnboarding();
      expect(result.success).toBe(true);
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(savedPrefs.onboardingCompleted).toBe(true);
      expect(savedPrefs.onboardingStep).toBe(5);
      expect(savedPrefs.onboardingSkipped).toBe(false);
    });
  });

  describe("user.skipOnboarding", () => {
    it("sets onboardingCompleted to true and skipped to true", async () => {
      const result = await caller.user.skipOnboarding();
      expect(result.success).toBe(true);
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(savedPrefs.onboardingCompleted).toBe(true);
      expect(savedPrefs.onboardingSkipped).toBe(true);
    });
  });

  describe("user.resetOnboarding", () => {
    it("resets onboarding state so setup can be restarted", async () => {
      const result = await caller.user.resetOnboarding();
      expect(result.success).toBe(true);
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(savedPrefs.onboardingCompleted).toBe(false);
      expect(savedPrefs.onboardingSkipped).toBe(false);
      expect(savedPrefs.onboardingStep).toBe(1);
    });
  });

  describe("user.setExperience", () => {
    it("sets standard experience with planTier=pro", async () => {
      await caller.user.setExperience({ experience: "standard" });
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(savedPrefs.selectedExperience).toBe("standard");
      expect(savedPrefs.planTier).toBe("pro");
      expect(savedPrefs.activationChecklist.choseExperience).toBe(true);
    });

    it("sets stable experience with planTier=stable", async () => {
      await caller.user.setExperience({ experience: "stable" });
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(savedPrefs.selectedExperience).toBe("stable");
      expect(savedPrefs.planTier).toBe("stable");
    });
  });

  describe("user.updateActivationChecklist", () => {
    it("updates a single checklist item", async () => {
      await caller.user.updateActivationChecklist({
        item: "viewedDashboard",
        value: true,
      });
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(savedPrefs.activationChecklist.viewedDashboard).toBe(true);
    });
  });

  describe("user.dismissTour", () => {
    it("adds tour ID to dismissedTours array", async () => {
      await caller.user.dismissTour({ tourId: "dashboard" });
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(savedPrefs.dismissedTours).toContain("dashboard");
    });

    it("does not duplicate tour IDs", async () => {
      mockPreferences = JSON.stringify({
        dismissedTours: ["dashboard"],
      });
      await caller.user.dismissTour({ tourId: "dashboard" });
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(
        savedPrefs.dismissedTours.filter((t: string) => t === "dashboard")
          .length,
      ).toBe(1);
    });
  });

  describe("user.dismissTip", () => {
    it("adds tip ID to dismissedTips array", async () => {
      await caller.user.dismissTip({ tipId: "dashboard-welcome" });
      const callArgs = vi.mocked(db.updateUser).mock.calls[0];
      const savedPrefs = JSON.parse(callArgs[1].preferences as string);
      expect(savedPrefs.dismissedTips).toContain("dashboard-welcome");
    });
  });
});
