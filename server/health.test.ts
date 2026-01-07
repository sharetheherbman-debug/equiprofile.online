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
  getHealthRecordsByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      horseId: 1,
      userId: 1,
      recordType: "vaccination",
      title: "Annual Vaccinations",
      description: "Flu and tetanus shots",
      recordDate: new Date("2024-01-15"),
      nextDueDate: new Date("2025-01-15"),
      vetName: "Dr. Smith",
      vetPhone: "555-0123",
      vetClinic: "Equine Care Center",
      cost: 15000,
      documentUrl: null,
      notes: "No adverse reactions",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getHealthRecordsByHorseId: vi.fn().mockResolvedValue([]),
  getHealthRecordById: vi.fn().mockResolvedValue({
    id: 1,
    horseId: 1,
    userId: 1,
    recordType: "vaccination",
    title: "Annual Vaccinations",
    recordDate: new Date("2024-01-15"),
    nextDueDate: new Date("2025-01-15"),
  }),
  createHealthRecord: vi.fn().mockResolvedValue(1),
  updateHealthRecord: vi.fn().mockResolvedValue(undefined),
  deleteHealthRecord: vi.fn().mockResolvedValue(undefined),
  getUpcomingReminders: vi.fn().mockResolvedValue([]),
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

describe("healthRecords router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists all health records for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.healthRecords.listAll();

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Annual Vaccinations");
    expect(result[0].recordType).toBe("vaccination");
  });

  it("lists health records by horse", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.healthRecords.listByHorse({ horseId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a new health record", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.healthRecords.create({
      horseId: 1,
      recordType: "vaccination",
      title: "Spring Vaccinations",
      description: "Annual shots",
      recordDate: "2024-03-15",
      nextDueDate: "2025-03-15",
      vetName: "Dr. Johnson",
      cost: 12000,
    });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });

  it("updates a health record", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.healthRecords.update({
      id: 1,
      title: "Updated Vaccination Record",
      notes: "Updated notes",
    });

    expect(result).toEqual({ success: true });
  });

  it("deletes a health record", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.healthRecords.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });

  it("gets upcoming reminders", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.healthRecords.getReminders({ days: 30 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("healthRecords router - unauthenticated", () => {
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

    await expect(caller.healthRecords.listAll()).rejects.toThrow();
  });
});
