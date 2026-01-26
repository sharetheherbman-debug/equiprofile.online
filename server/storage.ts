// Preconfigured storage helpers for local filesystem and S3
// With local filesystem as default when S3 is not configured

import { ENV } from './_core/env';
import { TRPCError } from '@trpc/server';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

type StorageConfig = { 
  baseUrl: string;
  mode: 'local' | 's3';
};

function getStorageConfig(): StorageConfig {
  // Check if uploads are enabled
  if (!ENV.enableUploads) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: "Uploads are disabled. Contact your administrator to enable upload features."
    });
  }
  
  // Check for S3 configuration
  if (ENV.awsAccessKeyId && ENV.awsSecretAccessKey && ENV.awsS3Bucket) {
    return {
      baseUrl: ENV.awsS3Bucket,
      mode: 's3'
    };
  }

  // Fallback to local storage
  const localPath = process.env.LOCAL_UPLOADS_PATH || '/var/equiprofile/uploads';
  
  // Ensure local directory exists
  try {
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: "Upload storage is not properly configured. Please contact your administrator."
    });
  }

  return {
    baseUrl: localPath,
    mode: 'local'
  };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  // Not used in local/S3 mode, kept for compatibility
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string
): Promise<string> {
  // Not used in local/S3 mode, kept for compatibility
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
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
  fileName: string
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
  // Not used in local/S3 mode, kept for compatibility
  return { Authorization: `Bearer ${apiKey}` };
}

// Local storage helpers
async function localStoragePut(
  basePath: string,
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const filePath = path.join(basePath, key);
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write file
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  fs.writeFileSync(filePath, buffer);

  // Return local URL (will be served via backend route)
  const url = `/api/storage/${key}`;
  
  return { key, url };
}

async function localStorageGet(
  basePath: string,
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const filePath = path.join(basePath, key);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'File not found'
    });
  }

  // Return local URL
  const url = `/api/storage/${key}`;
  
  return { key, url };
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const config = getStorageConfig();
  
  if (config.mode === 'local') {
    return localStoragePut(config.baseUrl, relKey, data, contentType);
  }
  
  // S3 mode - TODO: implement S3 upload using AWS SDK
  // For now, fall back to local storage
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'S3 storage mode not yet implemented. Please use local storage.'
  });
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const config = getStorageConfig();
  
  if (config.mode === 'local') {
    return localStorageGet(config.baseUrl, relKey);
  }
  
  // S3 mode - TODO: implement S3 URL generation
  // For now, fall back to local storage
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'S3 storage mode not yet implemented. Please use local storage.'
  });
}

// Helper to get storage mode for UI display
export function getStorageMode(): 's3' | 'local' | 'disabled' {
  try {
    const config = getStorageConfig();
    return config.mode;
  } catch {
    return 'disabled';
  }
}
