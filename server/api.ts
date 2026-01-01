import { Router, Request, Response, NextFunction } from "express";
import * as db from "./db";
import { getDb } from "./db";
import { horses, healthRecords, trainingSessions, competitions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

const apiRouter = Router();

// Middleware to verify API key
async function verifyApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const apiKey = authHeader.substring(7); // Remove "Bearer " prefix
  
  if (!apiKey) {
    return res.status(401).json({ error: "API key is required" });
  }

  try {
    // Validate API key
    const dbInstance = await getDb();
    if (!dbInstance) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    // In production, you would:
    // 1. Hash the provided API key
    // 2. Check against stored key hashes in apiKeys table
    // 3. Verify isActive and expiresAt
    // 4. Enforce rate limiting based on rateLimit field
    // 5. Check permissions field for endpoint access
    
    // For MVP, we'll do a simplified check
    // Store the userId in req for downstream use
    (req as any).apiUserId = 1; // Replace with actual user lookup from API key
    
    next();
  } catch (error) {
    console.error("API key verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Apply API key middleware to all routes
apiRouter.use(verifyApiKey);

// GET /api/v1/horses - List all horses for the authenticated user
apiRouter.get("/horses", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).apiUserId;
    const dbInstance = await getDb();
    
    if (!dbInstance) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    const userHorses = await dbInstance.select()
      .from(horses)
      .where(eq(horses.userId, userId))
      .orderBy(desc(horses.createdAt));

    res.json({
      success: true,
      data: userHorses,
      count: userHorses.length,
    });
  } catch (error) {
    console.error("Error fetching horses:", error);
    res.status(500).json({ error: "Failed to fetch horses" });
  }
});

// GET /api/v1/horses/:id - Get a specific horse
apiRouter.get("/horses/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).apiUserId;
    const horseId = parseInt(req.params.id);
    
    if (isNaN(horseId)) {
      return res.status(400).json({ error: "Invalid horse ID" });
    }

    const dbInstance = await getDb();
    if (!dbInstance) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    const horse = await dbInstance.select()
      .from(horses)
      .where(eq(horses.id, horseId))
      .limit(1);

    if (!horse.length) {
      return res.status(404).json({ error: "Horse not found" });
    }

    // Verify ownership
    if (horse[0].userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      success: true,
      data: horse[0],
    });
  } catch (error) {
    console.error("Error fetching horse:", error);
    res.status(500).json({ error: "Failed to fetch horse" });
  }
});

// GET /api/v1/health-records/:horseId - List health records for a horse
apiRouter.get("/health-records/:horseId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).apiUserId;
    const horseId = parseInt(req.params.horseId);
    
    if (isNaN(horseId)) {
      return res.status(400).json({ error: "Invalid horse ID" });
    }

    const dbInstance = await getDb();
    if (!dbInstance) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    // Verify horse ownership
    const horse = await dbInstance.select()
      .from(horses)
      .where(eq(horses.id, horseId))
      .limit(1);

    if (!horse.length || horse[0].userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const records = await dbInstance.select()
      .from(healthRecords)
      .where(eq(healthRecords.horseId, horseId))
      .orderBy(desc(healthRecords.recordDate));

    res.json({
      success: true,
      data: records,
      count: records.length,
    });
  } catch (error) {
    console.error("Error fetching health records:", error);
    res.status(500).json({ error: "Failed to fetch health records" });
  }
});

// GET /api/v1/training-sessions/:horseId - List training sessions for a horse
apiRouter.get("/training-sessions/:horseId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).apiUserId;
    const horseId = parseInt(req.params.horseId);
    
    if (isNaN(horseId)) {
      return res.status(400).json({ error: "Invalid horse ID" });
    }

    const dbInstance = await getDb();
    if (!dbInstance) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    // Verify horse ownership
    const horse = await dbInstance.select()
      .from(horses)
      .where(eq(horses.id, horseId))
      .limit(1);

    if (!horse.length || horse[0].userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const sessions = await dbInstance.select()
      .from(trainingSessions)
      .where(eq(trainingSessions.horseId, horseId))
      .orderBy(desc(trainingSessions.sessionDate));

    res.json({
      success: true,
      data: sessions,
      count: sessions.length,
    });
  } catch (error) {
    console.error("Error fetching training sessions:", error);
    res.status(500).json({ error: "Failed to fetch training sessions" });
  }
});

// GET /api/v1/competitions/:horseId - List competitions for a horse
apiRouter.get("/competitions/:horseId", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).apiUserId;
    const horseId = parseInt(req.params.horseId);
    
    if (isNaN(horseId)) {
      return res.status(400).json({ error: "Invalid horse ID" });
    }

    const dbInstance = await getDb();
    if (!dbInstance) {
      return res.status(500).json({ error: "Database connection failed" });
    }

    // Verify horse ownership
    const horse = await dbInstance.select()
      .from(horses)
      .where(eq(horses.id, horseId))
      .limit(1);

    if (!horse.length || horse[0].userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    const comps = await dbInstance.select()
      .from(competitions)
      .where(eq(competitions.horseId, horseId))
      .orderBy(desc(competitions.date));

    res.json({
      success: true,
      data: comps,
      count: comps.length,
    });
  } catch (error) {
    console.error("Error fetching competitions:", error);
    res.status(500).json({ error: "Failed to fetch competitions" });
  }
});

export { apiRouter };
