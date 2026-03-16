/**
 * Common validation utilities and schemas
 * Provides reusable validation logic for the API
 */

import { z } from "zod";

/**
 * Common validation schemas
 */
export const ValidationSchemas = {
  // ID validations
  id: z.number().int().positive("ID must be a positive integer"),
  horseId: z.number().int().positive("Horse ID must be a positive integer"),
  userId: z.number().int().positive("User ID must be a positive integer"),

  // String validations
  nonEmptyString: z.string().min(1, "This field cannot be empty"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[\d\s\-+()]+$/, "Invalid phone number format")
    .optional(),
  url: z.string().url("Invalid URL format").optional(),

  // Date validations
  isoDate: z.string().refine((date) => {
    const parsed = Date.parse(date);
    return !isNaN(parsed);
  }, "Invalid date format. Use ISO 8601 format (YYYY-MM-DD)"),

  futureDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return parsed > new Date();
  }, "Date must be in the future"),

  // Numeric validations
  positiveNumber: z.number().positive("Value must be positive"),
  nonNegativeNumber: z.number().min(0, "Value cannot be negative"),

  // File validations
  fileSize: z
    .number()
    .max(20 * 1024 * 1024, "File size must be less than 20MB"),
  base64String: z
    .string()
    .regex(/^[A-Za-z0-9+/=]+$/, "Invalid base64 encoding"),
};

/**
 * Common error messages
 */
export const ErrorMessages = {
  UNAUTHORIZED: "You must be logged in to access this resource",
  FORBIDDEN: "You do not have permission to access this resource",
  NOT_FOUND: "The requested resource was not found",
  INVALID_INPUT: "Invalid input data provided",
  SUSPENDED_ACCOUNT: "Your account has been suspended. Please contact support.",
  EXPIRED_SUBSCRIPTION:
    "Your subscription has expired. Please renew to continue.",
  EXPIRED_TRIAL: "Your free trial has expired. Please subscribe to continue.",
  SERVER_ERROR: "An unexpected error occurred. Please try again later.",
};

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(30),
});

/**
 * Sanitize input strings to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
}

/**
 * File upload constants
 */
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * Validate file upload
 */
export function validateFileUpload(
  fileName: string,
  fileType: string,
  fileSize: number,
): { valid: boolean; error?: string } {
  // Check file size
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
    };
  }

  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(fileType)) {
    return { valid: false, error: "File type not supported" };
  }

  // Check file name
  const fileExtension = fileName.split(".").pop()?.toLowerCase();
  const allowedExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "pdf",
    "doc",
    "docx",
  ];

  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: "Invalid file extension" };
  }

  return { valid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date,
): { valid: boolean; error?: string } {
  if (endDate < startDate) {
    return { valid: false, error: "End date must be after start date" };
  }

  const daysDiff =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    return { valid: false, error: "Date range cannot exceed 1 year" };
  }

  return { valid: true };
}

/**
 * Rate limiting key generator
 */
export function getRateLimitKey(userId: number, action: string): string {
  return `ratelimit:${userId}:${action}`;
}

/**
 * Horse age constants
 */
const MAX_HORSE_AGE = 50;

/**
 * Validate horse age
 */
export function validateHorseAge(
  age?: number,
  dateOfBirth?: Date,
): {
  valid: boolean;
  error?: string;
} {
  if (age !== undefined && age < 0) {
    return { valid: false, error: "Age cannot be negative" };
  }

  if (age !== undefined && age > MAX_HORSE_AGE) {
    return {
      valid: false,
      error: `Age seems unrealistic (max ${MAX_HORSE_AGE} years)`,
    };
  }

  if (dateOfBirth) {
    const now = new Date();
    if (dateOfBirth > now) {
      return { valid: false, error: "Date of birth cannot be in the future" };
    }

    const yearsDiff =
      (now.getTime() - dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (yearsDiff > MAX_HORSE_AGE) {
      return {
        valid: false,
        error: `Date of birth indicates unrealistic age (max ${MAX_HORSE_AGE} years)`,
      };
    }
  }

  return { valid: true };
}
