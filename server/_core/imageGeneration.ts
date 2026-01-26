/**
 * Image generation helper - DISABLED
 * 
 * This feature requires Forge API which has been removed.
 * To enable image generation, integrate OpenAI DALL-E or similar service.
 */
import { ENV } from "./env";

export type GenerateImageOptions = {
  prompt: string;
  originalImages?: Array<{
    url?: string;
    b64Json?: string;
    mimeType?: string;
  }>;
};

export type GenerateImageResponse = {
  url?: string;
};

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResponse> {
  const error = new Error("Image generation is not available. This feature requires additional configuration.");
  (error as any).statusCode = 503;
  throw error;
}
