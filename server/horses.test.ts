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
  getHorsesByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      name: "Thunder",
      breed: "Thoroughbred",
      dateOfBirth: new Date("2018-05-15"),
      gender: "gelding",
      color: "Bay",
      height: 16.2,
      weight: 500,
      discipline: "Dressage",
      level: "Advanced",
      notes: "Excellent temperament",
      profileImageUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  createHorse: vi.fn().mockResolvedValue(1),
  getHorseById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    name: "Thunder",
    breed: "Thoroughbred",
    dateOfBirth: new Date("2018-05-15"),
    gender: "gelding",
    color: "Bay",
    height: 16.2,
    weight: 500,
    discipline: "Dressage",
    level: "Advanced",
    notes: "Excellent temperament",
    profileImageUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateHorse: vi.fn().mockResolvedValue(undefined),
  deleteHorse: vi.fn().mockResolvedValue(undefined),
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

describe("horses router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists horses for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.horses.list();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Thunder");
    expect(result[0].breed).toBe("Thoroughbred");
  });

  it("creates a new horse", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.horses.create({
      name: "Spirit",
      breed: "Arabian",
      gender: "mare",
      color: "Grey",
    });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });

  it("gets a horse by ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.horses.get({ id: 1 });

    expect(result).toBeDefined();
    expect(result?.name).toBe("Thunder");
  });

  it("updates a horse", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.horses.update({
      id: 1,
      name: "Thunder II",
      notes: "Updated notes",
    });

    expect(result).toEqual({ success: true });
  });

  it("deletes a horse", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.horses.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });
});

describe("horses router - unauthenticated", () => {
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

    await expect(caller.horses.list()).rejects.toThrow();
  });
});
