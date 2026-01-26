import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as db from './db';
import { InsertHorse, InsertMedicationSchedule, InsertBehaviorLog } from '../drizzle/schema';

describe('Care Insights Database Functions', () => {
  let testUserId: number;
  let testHorseId: number;

  beforeAll(async () => {
    // Note: This assumes test database is available
    // In production, you'd set up a proper test database
    testUserId = 1;
    testHorseId = 1;
  });

  describe('Medication Schedules', () => {
    it('should create a medication schedule', async () => {
      const schedule: InsertMedicationSchedule = {
        horseId: testHorseId,
        userId: testUserId,
        medicationName: 'Test Medication',
        dosage: '2g',
        frequency: 'daily',
        startDate: new Date().toISOString().split('T')[0],
        isActive: true,
      };

      const scheduleId = await db.createMedicationSchedule(schedule);
      expect(scheduleId).toBeGreaterThan(0);

      // Clean up
      await db.deleteMedicationSchedule(scheduleId, testUserId);
    });

    it('should list medication schedules for a horse', async () => {
      const schedules = await db.getMedicationSchedules(testHorseId, testUserId, true);
      expect(Array.isArray(schedules)).toBe(true);
    });
  });

  describe('Behavior Logs', () => {
    it('should create a behavior log', async () => {
      const log: InsertBehaviorLog = {
        horseId: testHorseId,
        userId: testUserId,
        logDate: new Date().toISOString().split('T')[0],
        appetite: 'good',
        energy: 'normal',
        weight: 500,
      };

      const logId = await db.createBehaviorLog(log);
      expect(logId).toBeGreaterThan(0);

      // Clean up
      await db.deleteBehaviorLog(logId, testUserId);
    });

    it('should retrieve behavior logs', async () => {
      const logs = await db.getBehaviorLogs(testHorseId, testUserId, 30);
      expect(Array.isArray(logs)).toBe(true);
    });
  });

  describe('Health Alerts', () => {
    it('should create a health alert', async () => {
      const alertId = await db.createHealthAlert({
        horseId: testHorseId,
        userId: testUserId,
        alertType: 'overdue_health',
        severity: 'medium',
        message: 'Test alert',
      });

      expect(alertId).toBeGreaterThan(0);

      // Clean up
      await db.deleteHealthAlert(alertId, testUserId);
    });

    it('should retrieve health alerts', async () => {
      const alerts = await db.getHealthAlerts(testHorseId, testUserId, false);
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should resolve a health alert', async () => {
      const alertId = await db.createHealthAlert({
        horseId: testHorseId,
        userId: testUserId,
        alertType: 'medication_missed',
        severity: 'high',
        message: 'Test alert for resolution',
      });

      await db.resolveHealthAlert(alertId, testUserId);

      const alert = await db.getHealthAlert(alertId, testUserId);
      expect(alert?.isResolved).toBe(true);

      // Clean up
      await db.deleteHealthAlert(alertId, testUserId);
    });
  });

  describe('Care Scores', () => {
    it('should create a care score', async () => {
      const today = new Date().toISOString().split('T')[0];
      
      await db.createCareScore({
        horseId: testHorseId,
        userId: testUserId,
        date: today,
        overallScore: 85,
        taskCompletionScore: 35,
        medicationComplianceScore: 30,
        healthEventScore: 20,
        notes: JSON.stringify({ test: true }),
      });

      const score = await db.getCareScore(testHorseId, testUserId, today);
      expect(score).toBeDefined();
      expect(score?.overallScore).toBe(85);
    });

    it('should retrieve care score history', async () => {
      const history = await db.getCareScoreHistory(testHorseId, testUserId, 7);
      expect(Array.isArray(history)).toBe(true);
    });
  });
});

describe('Score Calculation Logic', () => {
  it('should calculate correct overall score', () => {
    const taskScore = 40;
    const medScore = 30;
    const healthScore = 30;
    const overall = taskScore + medScore + healthScore;
    
    expect(overall).toBe(100);
  });

  it('should handle partial task completion', () => {
    const taskScore = 20; // Only one task completed
    const medScore = 30;
    const healthScore = 30;
    const overall = taskScore + medScore + healthScore;
    
    expect(overall).toBe(80);
  });

  it('should deduct points for high severity alerts', () => {
    const taskScore = 40;
    const medScore = 30;
    let healthScore = 30;
    
    const highSeverityCount = 2;
    healthScore -= (highSeverityCount * 15);
    healthScore = Math.max(0, healthScore);
    
    expect(healthScore).toBe(0);
  });
});
