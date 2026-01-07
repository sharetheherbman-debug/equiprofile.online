/**
 * Centralized error handling for the API
 * Provides consistent error responses and logging
 */

import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";
import { ErrorMessages } from "./validation";

/**
 * Error types
 */
export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  CONFLICT = "CONFLICT",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

/**
 * Custom application errors
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Format Zod validation errors
 */
export function formatZodError(error: ZodError): string {
  const errors = error.errors.map(err => {
    const path = err.path.join(".");
    return `${path}: ${err.message}`;
  });

  return errors.join(", ");
}

/**
 * Convert application errors to TRPC errors
 */
export function toTRPCError(error: unknown): TRPCError {
  // Already a TRPC error
  if (error instanceof TRPCError) {
    return error;
  }

  // Application error
  if (error instanceof AppError) {
    return new TRPCError({
      code: error.code as any,
      message: error.message,
      cause: error.details,
    });
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: formatZodError(error),
    });
  }

  // Database errors
  if (error instanceof Error) {
    if (error.message.includes("ECONNREFUSED")) {
      return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database connection failed",
      });
    }

    if (error.message.includes("Duplicate entry")) {
      return new TRPCError({
        code: "CONFLICT",
        message: "A record with this information already exists",
      });
    }
  }

  // Unknown error
  console.error("[Error Handler] Unknown error:", error);
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: ErrorMessages.SERVER_ERROR,
  });
}

/**
 * Error response formatter
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    timestamp: string;
  };
}

export function formatErrorResponse(error: TRPCError): ErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
      details: error.cause,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Log error for monitoring
 */
export function logError(
  error: Error,
  context?: {
    userId?: number;
    path?: string;
    input?: unknown;
  }
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  };

  // In production, send to monitoring service (e.g., Sentry, DataDog)
  if (process.env.NODE_ENV === "production") {
    console.error("[Production Error]", JSON.stringify(logData));
    // TODO: Send to monitoring service
  } else {
    console.error("[Development Error]", logData);
  }
}

/**
 * Common error factories
 */
export const Errors = {
  unauthorized: (message: string = ErrorMessages.UNAUTHORIZED) =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message: string = ErrorMessages.FORBIDDEN) =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),

  notFound: (resource: string = "Resource") =>
    new AppError(ErrorCode.NOT_FOUND, `${resource} not found`, 404),

  badRequest: (message: string = ErrorMessages.INVALID_INPUT) =>
    new AppError(ErrorCode.BAD_REQUEST, message, 400),

  conflict: (message: string) =>
    new AppError(ErrorCode.CONFLICT, message, 409),

  serverError: (message: string = ErrorMessages.SERVER_ERROR) =>
    new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500),

  serviceUnavailable: (service: string) =>
    new AppError(
      ErrorCode.SERVICE_UNAVAILABLE,
      `${service} is currently unavailable`,
      503
    ),
};

/**
 * Async error wrapper for database operations
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error as Error);
    throw errorMessage
      ? Errors.serverError(errorMessage)
      : toTRPCError(error);
  }
}
