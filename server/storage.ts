// Preconfigured storage helpers for Manus WebDev templates
// Uses the Biz-provided storage proxy (Authorization: Bearer <token>)
// With local filesystem fallback when Forge is unavailable

import { ENV } from './_core/env';
import { TRPCError } from '@trpc/server';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';

type StorageConfig = { 
  baseUrl: string; 
  apiKey: string;
  mode: 'forge' | 'local';
};

function getStorageConfig(): StorageConfig {
  // Check if uploads are enabled
  if (!ENV.enableUploads) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: "Uploads are disabled. Contact your administrator to enable upload features."
    });
  }
  
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  // Try Forge first
  if (baseUrl && apiKey) {
    return { 
      baseUrl: baseUrl.replace(/\/+$/, ""), 
      apiKey,
      mode: 'forge'
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
    apiKey: '',
    mode: 'local'
  };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
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
  
  // Forge mode
  const { baseUrl, apiKey } = config;
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
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `Storage upload failed: ${message}`
    });
  }
  const url = (await response.json()).url;
  return { key, url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  const config = getStorageConfig();
  
  if (config.mode === 'local') {
    return localStorageGet(config.baseUrl, relKey);
  }
  
  // Forge mode
  const { baseUrl, apiKey } = config;
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}

// Helper to get storage mode for UI display
export function getStorageMode(): 'forge' | 'local' | 'disabled' {
  try {
    const config = getStorageConfig();
    return config.mode;
  } catch {
    return 'disabled';
  }
}
