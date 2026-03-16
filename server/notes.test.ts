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
  getNotesByUserId: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      horseId: null,
      title: "General note",
      content: "Some note content",
      transcribed: false,
      tags: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getNoteById: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    horseId: null,
    title: "General note",
    content: "Some note content",
    transcribed: false,
    tags: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createNote: vi.fn().mockResolvedValue(1),
  updateNote: vi.fn().mockResolvedValue(undefined),
  deleteNote: vi.fn().mockResolvedValue(undefined),
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "email",
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

describe("notes router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists notes for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notes.list({});

    expect(result).toHaveLength(1);
    expect(result[0].content).toBe("Some note content");
    expect(result[0].transcribed).toBe(false);
  });

  it("lists notes filtered by horse", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notes.list({ horseId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("creates a new note", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notes.create({
      content: "New note content",
      title: "My Note",
      transcribed: false,
    });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);
  });

  it("creates a transcribed (voice) note", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notes.create({
      content: "Voice dictated note",
      transcribed: true,
    });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe(1);

    // Verify createNote was called with transcribed: true
    const { createNote } = await import("./db");
    expect(vi.mocked(createNote)).toHaveBeenCalledWith(
      expect.objectContaining({
        transcribed: true,
        content: "Voice dictated note",
      }),
    );
  });

  it("updates a note", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notes.update({
      id: 1,
      content: "Updated content",
    });

    expect(result).toEqual({ success: true });
  });

  it("deletes a note", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notes.delete({ id: 1 });

    expect(result).toEqual({ success: true });
  });
});

describe("notes router - unauthenticated", () => {
  it("throws error for unauthenticated user on list", async () => {
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

    await expect(caller.notes.list({})).rejects.toThrow();
  });

  it("throws error for unauthenticated user on create", async () => {
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

    await expect(caller.notes.create({ content: "test" })).rejects.toThrow();
  });
});
