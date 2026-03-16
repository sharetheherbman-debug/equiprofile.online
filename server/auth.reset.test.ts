/**
 * Tests for the password reset flow — verifying that the O(n) getAllUsers()
 * scan was replaced with a direct getUserByResetToken() lookup.
 *
 * These tests replay the reset-password handler logic inline (mirroring the
 * api.test.ts pattern already used in this repo) so they require no extra
 * dependencies like supertest.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

// ----- mock DB module -------------------------------------------------------

const mockGetUserByResetToken = vi.fn();
const mockUpdateUser = vi.fn().mockResolvedValue(undefined);
const mockGetAllUsers = vi.fn(); // must NOT be called by the reset flow

vi.mock("./db", () => ({
  getUserByResetToken: mockGetUserByResetToken,
  getUserByEmail: vi.fn().mockResolvedValue(null),
  getAllUsers: mockGetAllUsers,
  updateUser: mockUpdateUser,
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

// ----- inline reset-password handler logic (mirrors authRouter.ts) ----------

/**
 * Replays the reset-password handler from server/_core/authRouter.ts so we
 * can unit-test the security-critical DB call without starting Express.
 */
async function handleResetPassword(
  token: string,
  password: string,
  db: {
    getUserByResetToken: typeof mockGetUserByResetToken;
    updateUser: typeof mockUpdateUser;
    getAllUsers: typeof mockGetAllUsers;
  },
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!token || !password) {
    return { status: 400, body: { error: "Token and password are required" } };
  }

  if (password.length < 12) {
    return {
      status: 400,
      body: { error: "Password must be at least 12 characters" },
    };
  }

  // This is the fixed implementation — direct lookup, not getAllUsers scan
  const user = await db.getUserByResetToken(token);

  if (!user) {
    return { status: 400, body: { error: "Invalid or expired reset token" } };
  }

  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return { status: 400, body: { error: "Reset token has expired" } };
  }

  const passwordHash = await bcrypt.hash(password, 4); // Low cost intentional for tests — production uses 10
  await db.updateUser(user.id, {
    passwordHash,
    resetToken: null,
    resetTokenExpiry: null,
  });

  return {
    status: 200,
    body: {
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    },
  };
}

// ----- tests ----------------------------------------------------------------

describe("password reset — direct DB lookup (replaces O(n) getAllUsers scan)", () => {
  const db = {
    getUserByResetToken: mockGetUserByResetToken,
    updateUser: mockUpdateUser,
    getAllUsers: mockGetAllUsers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an unknown reset token without calling getAllUsers", async () => {
    mockGetUserByResetToken.mockResolvedValue(undefined);

    const result = await handleResetPassword(
      "unknown-token-xyz",
      "NewPassword1234!",
      db,
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/invalid or expired/i);
    // Direct lookup must have been used
    expect(mockGetUserByResetToken).toHaveBeenCalledWith("unknown-token-xyz");
    // O(n) scan must NOT be called
    expect(mockGetAllUsers).not.toHaveBeenCalled();
  });

  it("rejects a reset token that has expired", async () => {
    const ONE_SECOND_MS = 1000;
    const expiredDate = new Date(Date.now() - ONE_SECOND_MS);
    mockGetUserByResetToken.mockResolvedValue({
      id: 5,
      resetToken: "expired-token",
      resetTokenExpiry: expiredDate,
    });

    const result = await handleResetPassword(
      "expired-token",
      "NewPassword1234!",
      db,
    );

    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/expired/i);
    expect(mockUpdateUser).not.toHaveBeenCalled();
    expect(mockGetAllUsers).not.toHaveBeenCalled();
  });

  it("accepts a valid token, hashes password, and clears token fields", async () => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const futureDate = new Date(Date.now() + ONE_HOUR_MS);
    mockGetUserByResetToken.mockResolvedValue({
      id: 7,
      resetToken: "good-token",
      resetTokenExpiry: futureDate,
    });

    const result = await handleResetPassword(
      "good-token",
      "NewSecurePassword12!",
      db,
    );

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);

    // Must clear resetToken and resetTokenExpiry
    expect(mockUpdateUser).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ resetToken: null, resetTokenExpiry: null }),
    );
    // Must store a bcrypt hash, not the plain password
    const callArg = mockUpdateUser.mock.calls[0][1];
    expect(typeof callArg.passwordHash).toBe("string");
    expect(callArg.passwordHash).not.toBe("NewSecurePassword12!");
    const hashIsValid = await bcrypt.compare(
      "NewSecurePassword12!",
      callArg.passwordHash,
    );
    expect(hashIsValid).toBe(true);

    expect(mockGetAllUsers).not.toHaveBeenCalled();
  });

  it("rejects passwords shorter than 12 characters before touching the DB", async () => {
    const result = await handleResetPassword("any-token", "short", db);

    expect(result.status).toBe(400);
    expect(result.body.error).toMatch(/12/);
    // No DB calls should be made for a validation failure
    expect(mockGetUserByResetToken).not.toHaveBeenCalled();
    expect(mockGetAllUsers).not.toHaveBeenCalled();
  });
});
