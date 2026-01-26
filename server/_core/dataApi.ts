/**
 * Data API Integration - DISABLED
 * 
 * This feature requires Forge API which has been removed.
 */
import { ENV } from "./env";

export type DataApiCallOptions = {
  query?: Record<string, unknown>;
  body?: Record<string, unknown>;
  pathParams?: Record<string, unknown>;
  formData?: Record<string, unknown>;
};

export async function callDataApi(
  apiId: string,
  options: DataApiCallOptions = {}
): Promise<unknown> {
  const error = new Error("Data API is not available. This feature requires additional configuration.");
  (error as any).statusCode = 503;
  throw error;
}
