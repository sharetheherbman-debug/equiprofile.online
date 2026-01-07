import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getAllUsers: vi.fn().mockResolvedValue([
    {
      id: 1,
      openId: "user-1",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      subscriptionStatus: "active",
      isSuspended: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getUserById: vi.fn().mockResolvedValue({
    id: 1,
    openId: "admin-user",
    subscriptionStatus: "active",
    isSuspended: false,
    role: "admin",
  }),
  getHorsesByUserId: vi.fn().mockResolvedValue([]),
  getUserActivityLogs: vi.fn().mockResolvedValue([]),
  suspendUser: vi.fn().mockResolvedValue(undefined),
  unsuspendUser: vi.fn().mockResolvedValue(undefined),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  updateUser: vi.fn().mockResolvedValue(undefined),
  getSystemStats: vi.fn().mockResolvedValue({
    totalUsers: 100,
    activeSubscriptions: 80,
    trialUsers: 15,
    overdueUsers: 5,
    totalHorses: 150,
    totalHealthRecords: 300,
    totalTrainingSessions: 450,
  }),
  getOverdueSubscriptions: vi.fn().mockResolvedValue([]),
  getExpiredTrials: vi.fn().mockResolvedValue([]),
  getActivityLogs: vi.fn().mockResolvedValue([]),
  getAllSettings: vi.fn().mockResolvedValue([]),
  upsertSetting: vi.fn().mockResolvedValue(undefined),
  getRecentBackups: vi.fn().mockResolvedValue([]),
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
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

describe("admin router - authorized admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets all users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getUsers();

    expect(result).toHaveLength(1);
    expect(result[0].email).toBe("test@example.com");
  });

  it("gets user details", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getUserDetails({ userId: 1 });

    expect(result).toHaveProperty("user");
    expect(result).toHaveProperty("horses");
    expect(result).toHaveProperty("activity");
  });

  it("suspends a user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.suspendUser({
      userId: 2,
      reason: "Payment failure",
    });

    expect(result).toEqual({ success: true });
  });

  it("unsuspends a user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.unsuspendUser({ userId: 2 });

    expect(result).toEqual({ success: true });
  });

  it("deletes a user", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteUser({ userId: 2 });

    expect(result).toEqual({ success: true });
  });

  it("updates user role", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateUserRole({
      userId: 2,
      role: "admin",
    });

    expect(result).toEqual({ success: true });
  });

  it("gets system stats", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getStats();

    expect(result).toHaveProperty("totalUsers");
    expect(result.totalUsers).toBe(100);
  });

  it("gets overdue users", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getOverdueUsers();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("gets system settings", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getSettings();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("updates system setting", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateSetting({
      key: "site_name",
      value: "EquiProfile",
      type: "string",
      description: "Site name",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("admin router - unauthorized access", () => {
  it("throws error for non-admin user accessing admin routes", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.admin.getUsers()).rejects.toThrow("Admin access required");
  });

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

    await expect(caller.admin.getUsers()).rejects.toThrow();
  });
});
