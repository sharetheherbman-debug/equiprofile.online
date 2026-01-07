import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getUserById: vi.fn().mockResolvedValue({
    id: 1,
    openId: "test-user",
    subscriptionStatus: "active",
    isSuspended: false,
  }),
  getTrainingSessionsByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      horseId: 1,
      userId: 1,
      sessionDate: new Date("2024-12-20"),
      startTime: "09:00",
      endTime: "10:00",
      duration: 60,
      sessionType: "flatwork",
      discipline: "Dressage",
      trainer: "Jane Smith",
      location: "Main Arena",
      goals: "Work on transitions",
      exercises: "Walk-trot transitions, circles",
      notes: "Good progress",
      performance: "good",
      weather: "Sunny",
      temperature: 15,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getTrainingSessionsByHorseId: vi.fn().mockResolvedValue([]),
  getUpcomingTrainingSessions: vi.fn().mockResolvedValue([]),
  createTrainingSession: vi.fn().mockResolvedValue(1),
  updateTrainingSession: vi.fn().mockResolvedValue(undefined),
  deleteTrainingSession: vi.fn().mockResolvedValue(undefined),
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("training router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists all training sessions for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.training.listAll();

    expect(result).toHaveLength(1);
    expect(result[0].sessionType).toBe("flatwork");
    expect(result[0].trainer).toBe("Jane Smith");
  });

  it("lists training sessions by horse", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.training.listByHorse({ horseId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("gets upcoming training sessions", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.training.getUpcoming();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a new training session", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.training.create({
      horseId: 1,
      sessionDate: "2024-12-25",
      startTime: "14:00",
      endTime: "15:00",
      duration: 60,
      sessionType: "jumping",
      discipline: "Show Jumping",
      trainer: "John Doe",
      location: "Outdoor Arena",
      goals: "Practice grid work",
    });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });

  it("updates a training session", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.training.update({
      id: 1,
      notes: "Updated session notes",
      performance: "excellent",
    });

    expect(result).toEqual({ success: true });
  });

  it("completes a training session", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.training.complete({
      id: 1,
      performance: "excellent",
      notes: "Great session!",
    });

    expect(result).toEqual({ success: true });
  });

  it("deletes a training session", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.training.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });
});

describe("training router - unauthenticated", () => {
  it("throws error for unauthenticated user", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {
        clearCookie: vi.fn(),
      } as unknown as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(caller.training.listAll()).rejects.toThrow();
  });
});
