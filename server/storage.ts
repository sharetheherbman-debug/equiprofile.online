// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
// Preconfigured storage helpers for EquiProfile
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)
// Falls back to local disk when Forge credentials are not configured.

import fs from "fs";
import path from "path";
import { ENV } from "./_core/env";
import { TRPCError } from "@trpc/server";

type StorageConfig = { baseUrl: string; apiKey: string };

function getStorageConfig(): StorageConfig {
  // Check if uploads are enabled
  if (!ENV.enableUploads) {
    throw new Error(
      "Uploads are disabled. Set ENABLE_UPLOADS=true to enable storage features.",
    );
  }

  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY",
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string,
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl),
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string,
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  // Use Forge if ENABLE_UPLOADS=true and credentials are present
  if (ENV.enableUploads && ENV.forgeApiUrl && ENV.forgeApiKey) {
    const { baseUrl, apiKey } = getStorageConfig();
    const key = normalizeKey(relKey);
    const uploadUrl = buildUploadUrl(baseUrl, key);
    const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: buildAuthHeaders(apiKey),
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText);
      throw new Error(
        `Storage upload failed (${response.status} ${response.statusText}): ${message}`,
      );
    }
    const url = (await response.json()).url;
    return { key, url };
  }

  // Fall back to local disk storage
  const buf =
    data instanceof Buffer
      ? data
      : data instanceof Uint8Array
        ? Buffer.from(data.buffer, data.byteOffset, data.byteLength)
        : Buffer.from(data as string);
  return storagePutLocal(relKey, buf, contentType);
}

/**
 * Save a file to local disk storage.
 * Returns a URL of the form /api/files/<key> for serving.
 */
export async function storagePutLocal(
  relKey: string,
  data: Buffer,
  _contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const uploadsDir = path.resolve(ENV.storagePath);
  const key = normalizeKey(relKey);
  const filePath = path.resolve(uploadsDir, key);

  // Security: ensure the resolved path is strictly inside the uploads directory.
  // The `filePath === uploadsDir` case is intentionally excluded — writing a
  // file that shadows the directory itself is not valid.
  if (!filePath.startsWith(uploadsDir + path.sep)) {
    throw new Error("Invalid storage key: path traversal detected");
  }

  // Create parent directories if needed
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, data);

  return { key, url: `/api/files/${key}` };
}

export async function storageGet(
  relKey: string,
): Promise<{ key: string; url: string }> {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}

/**
 * Storage Quota Management
 * Tracks and enforces storage limits per user
 */

// Storage quotas in bytes
export const STORAGE_QUOTAS = {
  trial: 104857600, // 100MB
  pro: 1073741824, // 1GB
  stable: 5368709120, // 5GB
} as const;

export function getStorageQuotaForPlan(
  subscriptionPlan: string | null,
  subscriptionStatus: string,
): number {
  if (subscriptionStatus === "trial") {
    return STORAGE_QUOTAS.trial;
  }
  if (subscriptionPlan === "monthly" || subscriptionPlan === "yearly") {
    return STORAGE_QUOTAS.pro;
  }
  if (
    subscriptionPlan === "stable_monthly" ||
    subscriptionPlan === "stable_yearly"
  ) {
    return STORAGE_QUOTAS.stable;
  }
  // Default to trial quota
  return STORAGE_QUOTAS.trial;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export async function checkStorageQuota(
  userId: number,
  fileSize: number,
): Promise<{ allowed: boolean; reason?: string }> {
  const db = await import("./db");
  const user = await db.getUserById(userId);

  if (!user) {
    return { allowed: false, reason: "User not found" };
  }

  const quota =
    user.storageQuotaBytes ||
    getStorageQuotaForPlan(user.subscriptionPlan, user.subscriptionStatus);
  const used = user.storageUsedBytes || 0;
  const willUse = used + fileSize;

  if (willUse > quota) {
    return {
      allowed: false,
      reason: `Storage quota exceeded. Used: ${formatBytes(used)}, Quota: ${formatBytes(quota)}. Upgrade your plan for more storage.`,
    };
  }

  return { allowed: true };
}

export async function trackStorageUsage(
  userId: number,
  bytesAdded: number,
): Promise<void> {
  const db = await import("./db");
  const user = await db.getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newUsage = (user.storageUsedBytes || 0) + bytesAdded;
  await db.updateUser(userId, {
    storageUsedBytes: newUsage,
  });
}

export async function releaseStorageUsage(
  userId: number,
  bytesReleased: number,
): Promise<void> {
  const db = await import("./db");
  const user = await db.getUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const newUsage = Math.max(0, (user.storageUsedBytes || 0) - bytesReleased);
  await db.updateUser(userId, {
    storageUsedBytes: newUsage,
  });
}
