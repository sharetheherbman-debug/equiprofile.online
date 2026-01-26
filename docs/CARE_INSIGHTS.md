# Care Insights System (B1)

## Overview

The Care Insights system provides comprehensive health monitoring and care tracking for horses, including:

- Daily care scores (0-100)
- Medication scheduling and tracking
- Behavior and activity logging
- Automated health alerts
- Trend analysis

## Database Schema

### Tables

1. **careScores** - Daily care score calculations
   - Tracks overall care quality (0-100)
   - Components: task completion (40 pts), medication compliance (30 pts), health events (30 pts)

2. **medicationSchedules** - Medication schedules for horses
   - Supports various frequencies (daily, twice daily, weekly, etc.)
   - Time-of-day scheduling
   - Active/inactive status

3. **medicationLogs** - Medication administration tracking
   - Records actual administration times
   - Tracks skipped doses with reasons
   - Links to schedules

4. **behaviorLogs** - Daily behavior and activity observations
   - Weight tracking
   - Appetite, energy levels
   - Soreness scores (0-10)
   - Ride quality ratings

5. **healthAlerts** - Automated health alerts
   - Types: repeat_injury, weight_loss, reduced_activity, medication_missed, overdue_health
   - Severity levels: low, medium, high
   - Resolution tracking

## API Endpoints

### Care Scores

- `careInsights.getScore` - Get/calculate daily care score for a horse
- `careInsights.getScoreHistory` - Get score history (7/30/90 days)

### Health Alerts

- `careInsights.getAlerts` - Get active alerts for a horse
- `careInsights.checkAlerts` - Run alert detection engine
- `careInsights.resolveAlert` - Mark alert as resolved
- `careInsights.dismissAlert` - Dismiss (delete) an alert

### Medication Management

- `careInsights.createSchedule` - Create medication schedule
- `careInsights.listSchedules` - List schedules for a horse
- `careInsights.updateSchedule` - Update schedule
- `careInsights.deleteSchedule` - Delete schedule
- `careInsights.logMedication` - Log medication administration
- `careInsights.getMedicationLogs` - Get medication logs

### Behavior Tracking

- `careInsights.createBehaviorLog` - Create daily behavior log
- `careInsights.listBehaviorLogs` - List behavior logs
- `careInsights.updateBehaviorLog` - Update behavior log
- `careInsights.deleteBehaviorLog` - Delete behavior log

## Score Calculation

Daily care score (0-100) is calculated from three components:

### Task Completion (40 points)
- Daily behavior log completed: 20 points
- Training session logged: 20 points

### Medication Compliance (30 points)
- All scheduled medications administered: 30 points
- Partial compliance: Proportional points
- No medications scheduled: 30 points (full credit)

### Health Events (30 points)
- Start with 30 points
- High severity alerts: -15 points each
- Medium severity alerts: -7 points each
- Minimum: 0 points

## Alert Detection

The system automatically detects the following conditions:

### Repeat Injury (Medium Severity)
- Same injury type occurs multiple times within 90 days

### Weight Loss (High Severity)
- More than 5% weight loss within 30 days

### Reduced Activity (Medium Severity)
- Ride quality declining over 3+ consecutive sessions

### Medication Missed (High Severity)
- 2 or more consecutive missed doses

### Overdue Health (Medium Severity)
- Vaccinations, dental work, or other health events past due date

## Feature Gating by Subscription Tier

### Trial/Free Users
- Basic care scores
- Active alerts
- Medication tracking
- Behavior logs

### Normal Plan (monthly/yearly)
- All free features
- Score history (7/30/90 days)
- Basic trend analysis

### Stable Plan (stable_monthly/stable_yearly)
- All normal features
- AI-generated insights (future)
- Predictive alerts (future)
- Multi-horse analytics (future)

## Migration

Run migration: `drizzle/0003_care_insights.sql`

Creates all five tables with appropriate indexes for performance.

## Security

- All endpoints use `subscribedProcedure` for authentication
- Horse ownership validated on all operations
- User ID checked on all queries
- Activity logging for audit trail

## Usage Example

```typescript
// Calculate today's care score
const score = await trpc.careInsights.getScore.query({
  horseId: 123,
});

// Create medication schedule
await trpc.careInsights.createSchedule.mutate({
  horseId: 123,
  medicationName: "Bute",
  dosage: "2g",
  frequency: "twice_daily",
  startDate: "2026-01-27",
  timeOfDay: "morning",
});

// Log medication administration
await trpc.careInsights.logMedication.mutate({
  scheduleId: 456,
  administeredAt: new Date().toISOString(),
  administeredBy: "John Doe",
  wasSkipped: false,
});

// Check for health alerts
await trpc.careInsights.checkAlerts.mutate({
  horseId: 123,
});

// Get alerts
const alerts = await trpc.careInsights.getAlerts.query({
  horseId: 123,
  includeResolved: false,
});
```

## Future Enhancements

- AI-powered insights (Stable tier)
- Predictive health alerts
- Multi-horse comparison analytics
- Custom alert rules
- Integration with veterinary systems
- Mobile push notifications for critical alerts
