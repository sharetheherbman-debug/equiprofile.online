# Care Insights Quick Start Guide

## 🚀 Getting Started

### 1. Apply Database Migration

```bash
# Connect to your database
mysql -u your_user -p your_database < drizzle/0003_care_insights.sql
```

### 2. Verify Installation

```typescript
// Test the endpoint
const score = await trpc.careInsights.getScore.query({
  horseId: 1,
});
console.log(score); // Should return care score object
```

## 📖 Basic Usage

### Calculate Daily Care Score

```typescript
const score = await trpc.careInsights.getScore.query({
  horseId: horseId,
  date: "2026-01-27", // Optional, defaults to today
});

// Returns:
// {
//   id: 1,
//   horseId: 1,
//   userId: 1,
//   date: "2026-01-27",
//   overallScore: 85,
//   taskCompletionScore: 35,
//   medicationComplianceScore: 30,
//   healthEventScore: 20,
//   notes: "{...}",
//   createdAt: "..."
// }
```

### Create Medication Schedule

```typescript
await trpc.careInsights.createSchedule.mutate({
  horseId: 1,
  medicationName: "Bute",
  dosage: "2g",
  frequency: "twice_daily",
  startDate: "2026-01-27",
  timeOfDay: "morning",
  specialInstructions: "Give with food",
});
```

### Log Medication Administration

```typescript
await trpc.careInsights.logMedication.mutate({
  scheduleId: 1,
  administeredAt: new Date().toISOString(),
  administeredBy: "John Doe",
  dosageGiven: "2g",
  wasSkipped: false,
});
```

### Create Behavior Log

```typescript
await trpc.careInsights.createBehaviorLog.mutate({
  horseId: 1,
  logDate: "2026-01-27",
  weight: 550,
  appetite: "good",
  energy: "normal",
  sorenessScore: 2,
  rideQuality: "excellent",
  notes: "Great session today!",
});
```

### Check for Health Alerts

```typescript
// Automatically detect issues
const result = await trpc.careInsights.checkAlerts.mutate({
  horseId: 1,
});
console.log(`Found ${result.newAlertsCount} new alerts`);

// Get active alerts
const alerts = await trpc.careInsights.getAlerts.query({
  horseId: 1,
  includeResolved: false,
});
```

### Get Score History

```typescript
const history = await trpc.careInsights.getScoreHistory.query({
  horseId: 1,
  days: 30, // 7, 30, or 90
});
```

## 🎯 Score Breakdown

| Component | Points | Criteria |
|-----------|--------|----------|
| Task Completion | 40 | Daily log (20) + Training (20) |
| Medication Compliance | 30 | All meds given on time |
| Health Events | 30 | No high/medium alerts |
| **Total** | **100** | |

## 🚨 Alert Types

| Alert | Severity | Trigger |
|-------|----------|---------|
| Repeat Injury | Medium | Same injury 2+ times in 90 days |
| Weight Loss | High | >5% loss in 30 days |
| Reduced Activity | Medium | Declining ride quality (3+ sessions) |
| Medication Missed | High | 2+ consecutive misses |
| Overdue Health | Medium | Past due vaccination/checkup |

## 🔐 Authentication

All endpoints require authentication:

```typescript
// Automatic with tRPC context
// User must be logged in with valid session
// Horse ownership is verified automatically
```

## 📊 Common Patterns

### Daily Care Routine

```typescript
// 1. Create behavior log
await trpc.careInsights.createBehaviorLog.mutate({...});

// 2. Log medications
await trpc.careInsights.logMedication.mutate({...});

// 3. Get care score
const score = await trpc.careInsights.getScore.query({horseId});

// 4. Check for alerts
await trpc.careInsights.checkAlerts.mutate({horseId});
```

### Weekly Review

```typescript
// Get 7-day history
const history = await trpc.careInsights.getScoreHistory.query({
  horseId: 1,
  days: 7,
});

// Check medication compliance
const schedules = await trpc.careInsights.listSchedules.query({horseId: 1});
for (const schedule of schedules) {
  const logs = await trpc.careInsights.getMedicationLogs.query({
    scheduleId: schedule.id,
    days: 7,
  });
  console.log(`${schedule.medicationName}: ${logs.length} doses`);
}
```

## 🔧 Troubleshooting

### Score is 0
- Check if behavior logs exist for today
- Verify training sessions are logged
- Ensure medications are marked as administered

### Alerts not showing
- Run `checkAlerts` manually
- Verify sufficient historical data exists (30-90 days)
- Check if alerts were already resolved

### Can't create schedule
- Verify horse ownership
- Check date format (YYYY-MM-DD)
- Ensure frequency enum is valid

## 📚 Full Documentation

- **API Reference**: `docs/CARE_INSIGHTS.md`
- **Implementation**: `CARE_INSIGHTS_IMPLEMENTATION.md`
- **Completion Summary**: `IMPLEMENTATION_COMPLETE.md`

## 💡 Tips

1. **Daily Logging**: Encourage users to log behavior daily for best scores
2. **Medication Reminders**: Set up frontend notifications for medication times
3. **Alert Review**: Check alerts weekly and resolve/dismiss appropriately
4. **Trend Analysis**: Use score history to identify patterns
5. **Weight Tracking**: Log weight consistently for accurate loss detection

## 🎨 Frontend Integration

### Display Score Card

```tsx
const { data: score } = trpc.careInsights.getScore.useQuery({horseId});

return (
  <div className="score-card">
    <h2>Care Score: {score?.overallScore}/100</h2>
    <div>Tasks: {score?.taskCompletionScore}/40</div>
    <div>Meds: {score?.medicationComplianceScore}/30</div>
    <div>Health: {score?.healthEventScore}/30</div>
  </div>
);
```

### Show Alerts

```tsx
const { data: alerts } = trpc.careInsights.getAlerts.useQuery({
  horseId,
  includeResolved: false,
});

return (
  <div className="alerts">
    {alerts?.map(alert => (
      <Alert key={alert.id} severity={alert.severity}>
        {alert.message}
      </Alert>
    ))}
  </div>
);
```

## ✅ Next Steps

1. Build frontend components
2. Add real-time notifications
3. Create data visualizations
4. Implement AI insights (Stable tier)

---

**Ready to start tracking horse care with Care Insights!** 🐴
