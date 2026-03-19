// Copyright (c) 2025-2026 Amarktai Network. All rights reserved.
/**
 * Quick example (matches curl usage):
 *   await callDataApi("Youtube/search", {
 *     query: { gl: "US", hl: "en", q: "horse care" },
 *   })
 */

export type DataApiCallOptions = {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  pathParams?: Record<string, unknown>;
  formData?: Record<string, unknown>;
};

export async function callDataApi(
  apiId: string,
  options: DataApiCallOptions = {},
): Promise<unknown> {
  const proxyUrl = process.env.BUILT_IN_FORGE_API_URL ?? "";
  const proxyKey = process.env.BUILT_IN_FORGE_API_KEY ?? "";

  if (!proxyUrl) {
    throw new Error("Data API service is not configured");
  }
  if (!proxyKey) {
    throw new Error("Data API service authentication is missing");
  }

  // Build the full URL by appending the service path to the base URL
  const baseUrl = proxyUrl.endsWith("/")
    ? proxyUrl
    : `${proxyUrl}/`;
  const fullUrl = new URL(
    "webdevtoken.v1.WebDevService/CallApi",
    baseUrl,
  ).toString();

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${proxyKey}`,
    },
    body: JSON.stringify({
      apiId,
      query: options.query,
      body: options.body,
      path_params: options.pathParams,
      multipart_form_data: options.formData,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Data API request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`,
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (payload && typeof payload === "object" && "jsonData" in payload) {
    try {
      return JSON.parse((payload as Record<string, string>).jsonData ?? "{}");
    } catch {
      return (payload as Record<string, unknown>).jsonData;
    }
  }
  return payload;
}
