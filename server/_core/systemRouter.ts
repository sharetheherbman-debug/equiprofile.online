import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminUnlockedProcedure, publicProcedure, router } from "./trpc";
import { ENV } from "./env";
import fs from "fs";
import { resolve } from "path";

// Cache build info at module load time
let _buildInfoCache: {
  sha: string;
  buildTime: string;
  version: string;
} | null = null;

function readBuildInfo() {
  if (_buildInfoCache) return _buildInfoCache;
  let sha = "unknown";
  let buildTime = new Date().toISOString();
  let version = "1.0.0";
  try {
    const pkg = JSON.parse(
      fs.readFileSync(resolve(process.cwd(), "package.json"), "utf-8"),
    );
    version = pkg.version || "1.0.0";
  } catch {}
  try {
    const txt = fs.readFileSync(
      resolve(process.cwd(), "dist/public/build.txt"),
      "utf-8",
    );
    for (const line of txt.split("\n")) {
      const eqIdx = line.indexOf("=");
      if (eqIdx < 0) continue;
      const k = line.slice(0, eqIdx);
      const v = line.slice(eqIdx + 1).trim();
      if (k === "BUILD_SHA" && v) sha = v;
      if (k === "BUILD_TIME" && v) buildTime = v;
      if (k === "VERSION" && v) version = v;
    }
  } catch {}
  _buildInfoCache = { sha, buildTime, version };
  return _buildInfoCache;
}

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      }),
    )
    .query(() => ({
      ok: true,
    })),

  getFeatureFlags: publicProcedure.query(() => ({
    enableStripe: ENV.enableStripe,
    enableUploads: ENV.enableUploads,
  })),

  getBuildInfo: adminUnlockedProcedure.query(() => {
    return readBuildInfo();
  }),

  notifyOwner: adminUnlockedProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
