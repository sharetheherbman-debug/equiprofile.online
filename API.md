# EquiProfile API Documentation

This document provides comprehensive documentation for the EquiProfile API endpoints.

## Base URL

- Development: `http://localhost:3000/api/trpc`
- Production: `https://equiprofile.online/api/trpc`

## Authentication

The API uses session-based authentication with HTTP-only cookies. Authentication is handled via OAuth 2.0 with supported providers:
- Google
- GitHub
- Microsoft

Once authenticated, a session cookie is automatically set and included in subsequent requests.

## API Structure

The API is built using tRPC and organized into the following routers:

### System Router (`system.*`)

Public system information endpoints.

#### `system.status`
- **Type**: Query
- **Auth**: Public
- **Description**: Get system status and health
- **Response**: System status object

---

### Auth Router (`auth.*`)

Authentication and session management.

#### `auth.me`
- **Type**: Query
- **Auth**: Public (returns null if not authenticated)
- **Description**: Get current authenticated user
- **Response**: User object or null

#### `auth.logout`
- **Type**: Mutation
- **Auth**: Public
- **Description**: Logout current user
- **Response**: `{ success: true }`

---

### User Router (`user.*`)

User profile and subscription management.

#### `user.getProfile`
- **Type**: Query
- **Auth**: Required
- **Description**: Get current user's profile
- **Response**: User profile object

#### `user.updateProfile`
- **Type**: Mutation
- **Auth**: Required
- **Input**:
  ```typescript
  {
    name?: string;
    phone?: string;
    location?: string;
    profileImageUrl?: string;
  }
  ```
- **Response**: `{ success: true }`

#### `user.getSubscriptionStatus`
- **Type**: Query
- **Auth**: Required
- **Description**: Get user's subscription details
- **Response**:
  ```typescript
  {
    status: 'trial' | 'active' | 'cancelled' | 'overdue' | 'expired';
    plan: 'monthly' | 'yearly';
    trialEndsAt: Date | null;
    subscriptionEndsAt: Date | null;
    lastPaymentAt: Date | null;
  }
  ```

#### `user.getDashboardStats`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Description**: Get dashboard statistics
- **Response**:
  ```typescript
  {
    horseCount: number;
    upcomingSessionCount: number;
    reminderCount: number;
    latestWeather: WeatherLog | null;
  }
  ```

---

### Horses Router (`horses.*`)

Horse profile management.

#### `horses.list`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Description**: List all horses for current user
- **Response**: Array of Horse objects

#### `horses.get`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Input**: `{ id: number }`
- **Response**: Horse object

#### `horses.create`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**:
  ```typescript
  {
    name: string;
    breed?: string;
    age?: number;
    dateOfBirth?: string; // ISO 8601 date
    height?: number; // cm
    weight?: number; // kg
    color?: string;
    gender?: 'stallion' | 'mare' | 'gelding';
    discipline?: string;
    level?: string;
    registrationNumber?: string;
    microchipNumber?: string;
    notes?: string;
    photoUrl?: string;
  }
  ```
- **Response**: `{ id: number }`

#### `horses.update`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: Same as create, plus `id: number`
- **Response**: `{ success: true }`

#### `horses.delete`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: `{ id: number }`
- **Response**: `{ success: true }`

---

### Health Records Router (`healthRecords.*`)

Health record management.

#### `healthRecords.listAll`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Description**: List all health records for user
- **Response**: Array of HealthRecord objects

#### `healthRecords.listByHorse`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Input**: `{ horseId: number }`
- **Response**: Array of HealthRecord objects

#### `healthRecords.get`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Input**: `{ id: number }`
- **Response**: HealthRecord object

#### `healthRecords.create`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**:
  ```typescript
  {
    horseId: number;
    recordType: 'vaccination' | 'deworming' | 'dental' | 'farrier' | 'veterinary' | 'injury' | 'medication' | 'other';
    title: string;
    description?: string;
    recordDate: string; // ISO 8601 date
    nextDueDate?: string; // ISO 8601 date
    vetName?: string;
    vetPhone?: string;
    vetClinic?: string;
    cost?: number; // pence/cents
    documentUrl?: string;
    notes?: string;
  }
  ```
- **Response**: `{ id: number }`

#### `healthRecords.update`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: Partial of create input, plus `id: number`
- **Response**: `{ success: true }`

#### `healthRecords.delete`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: `{ id: number }`
- **Response**: `{ success: true }`

#### `healthRecords.getReminders`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Input**: `{ days?: number }` (default: 30)
- **Description**: Get upcoming health reminders
- **Response**: Array of HealthRecord objects with upcoming due dates

---

### Training Router (`training.*`)

Training session management.

#### `training.listAll`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Response**: Array of TrainingSession objects

#### `training.listByHorse`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Input**: `{ horseId: number }`
- **Response**: Array of TrainingSession objects

#### `training.getUpcoming`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Response**: Array of upcoming TrainingSession objects

#### `training.create`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**:
  ```typescript
  {
    horseId: number;
    sessionDate: string; // ISO 8601 date
    startTime?: string; // HH:MM
    endTime?: string; // HH:MM
    duration?: number; // minutes
    sessionType: 'flatwork' | 'jumping' | 'hacking' | 'lunging' | 'groundwork' | 'competition' | 'lesson' | 'other';
    discipline?: string;
    trainer?: string;
    location?: string;
    goals?: string;
    exercises?: string;
    notes?: string;
  }
  ```
- **Response**: `{ id: number }`

#### `training.update`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: Partial of create input, plus `id: number`
- **Response**: `{ success: true }`

#### `training.complete`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**:
  ```typescript
  {
    id: number;
    performance?: 'excellent' | 'good' | 'average' | 'poor';
    notes?: string;
  }
  ```
- **Response**: `{ success: true }`

#### `training.delete`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: `{ id: number }`
- **Response**: `{ success: true }`

---

### Feeding Router (`feeding.*`)

Feeding plan management.

#### `feeding.listAll`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Response**: Array of FeedingPlan objects

#### `feeding.listByHorse`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Input**: `{ horseId: number }`
- **Response**: Array of FeedingPlan objects

#### `feeding.create`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**:
  ```typescript
  {
    horseId: number;
    feedType: string;
    brandName?: string;
    quantity: string;
    unit?: string;
    mealTime: 'morning' | 'midday' | 'evening' | 'night';
    frequency?: string;
    specialInstructions?: string;
  }
  ```
- **Response**: `{ id: number }`

#### `feeding.update`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: Partial of create input, plus `id: number`
- **Response**: `{ success: true }`

#### `feeding.delete`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: `{ id: number }`
- **Response**: `{ success: true }`

---

### Documents Router (`documents.*`)

Document storage and management.

#### `documents.list`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Response**: Array of Document objects

#### `documents.listByHorse`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Input**: `{ horseId: number }`
- **Response**: Array of Document objects

#### `documents.upload`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**:
  ```typescript
  {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string; // base64 encoded
    horseId?: number;
    healthRecordId?: number;
    category?: 'health' | 'registration' | 'insurance' | 'competition' | 'other';
    description?: string;
  }
  ```
- **Response**: `{ id: number, url: string }`

#### `documents.delete`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**: `{ id: number }`
- **Response**: `{ success: true }`

---

### Weather Router (`weather.*`)

AI-powered weather analysis for riding conditions.

#### `weather.analyze`
- **Type**: Mutation
- **Auth**: Required (active subscription)
- **Input**:
  ```typescript
  {
    location: string;
    temperature: number; // celsius
    humidity: number; // percentage
    windSpeed: number; // km/h
    precipitation?: number; // mm
    conditions: string;
    uvIndex?: number;
    visibility?: number; // km
  }
  ```
- **Response**:
  ```typescript
  {
    recommendation: 'excellent' | 'good' | 'fair' | 'poor' | 'not_recommended';
    analysis: string; // AI-generated analysis
  }
  ```

#### `weather.getLatest`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Response**: Latest WeatherLog object or null

#### `weather.getHistory`
- **Type**: Query
- **Auth**: Required (active subscription)
- **Input**: `{ limit?: number }` (default: 7)
- **Response**: Array of WeatherLog objects

---

### Admin Router (`admin.*`)

Administrative functions (requires admin role).

#### `admin.getUsers`
- **Type**: Query
- **Auth**: Required (admin only)
- **Response**: Array of User objects

#### `admin.getUserDetails`
- **Type**: Query
- **Auth**: Required (admin only)
- **Input**: `{ userId: number }`
- **Response**:
  ```typescript
  {
    user: User;
    horses: Horse[];
    activity: ActivityLog[];
  }
  ```

#### `admin.suspendUser`
- **Type**: Mutation
- **Auth**: Required (admin only)
- **Input**: `{ userId: number, reason: string }`
- **Response**: `{ success: true }`

#### `admin.unsuspendUser`
- **Type**: Mutation
- **Auth**: Required (admin only)
- **Input**: `{ userId: number }`
- **Response**: `{ success: true }`

#### `admin.deleteUser`
- **Type**: Mutation
- **Auth**: Required (admin only)
- **Input**: `{ userId: number }`
- **Response**: `{ success: true }`

#### `admin.updateUserRole`
- **Type**: Mutation
- **Auth**: Required (admin only)
- **Input**: `{ userId: number, role: 'user' | 'admin' }`
- **Response**: `{ success: true }`

#### `admin.getStats`
- **Type**: Query
- **Auth**: Required (admin only)
- **Response**:
  ```typescript
  {
    totalUsers: number;
    activeSubscriptions: number;
    trialUsers: number;
    overdueUsers: number;
    totalHorses: number;
    totalHealthRecords: number;
    totalTrainingSessions: number;
  }
  ```

#### `admin.getOverdueUsers`
- **Type**: Query
- **Auth**: Required (admin only)
- **Response**: Array of User objects with overdue subscriptions

#### `admin.getExpiredTrials`
- **Type**: Query
- **Auth**: Required (admin only)
- **Response**: Array of User objects with expired trials

#### `admin.getActivityLogs`
- **Type**: Query
- **Auth**: Required (admin only)
- **Input**: `{ limit?: number }` (default: 100)
- **Response**: Array of ActivityLog objects

#### `admin.getSettings`
- **Type**: Query
- **Auth**: Required (admin only)
- **Response**: Array of SystemSetting objects

#### `admin.updateSetting`
- **Type**: Mutation
- **Auth**: Required (admin only)
- **Input**:
  ```typescript
  {
    key: string;
    value: string;
    type?: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
  }
  ```
- **Response**: `{ success: true }`

#### `admin.getBackupLogs`
- **Type**: Query
- **Auth**: Required (admin only)
- **Input**: `{ limit?: number }` (default: 10)
- **Response**: Array of BackupLog objects

---

## Error Handling

The API uses tRPC error codes for error handling:

- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User doesn't have permission (suspended, expired subscription, or not admin)
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input data
- `INTERNAL_SERVER_ERROR` - Server error

### Common Error Responses

```typescript
{
  error: {
    message: string;
    code: string;
    data: {
      code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'BAD_REQUEST' | 'INTERNAL_SERVER_ERROR';
      httpStatus: number;
      path: string;
    }
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Public endpoints: 100 requests per 15 minutes
- Authenticated endpoints: 1000 requests per 15 minutes
- File uploads: 50 requests per hour

## Data Formats

### Dates
All dates are in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`

### Currency
All monetary values are stored in the smallest currency unit (pence for GBP, cents for USD)

### File Uploads
Files are base64 encoded in the request and stored in AWS S3. Maximum file size: 20MB

## Example Usage

### Using tRPC Client (TypeScript)

```typescript
import { trpc } from './lib/trpc';

// Query example
const horses = await trpc.horses.list.query();

// Mutation example
const newHorse = await trpc.horses.create.mutate({
  name: 'Thunder',
  breed: 'Thoroughbred',
  gender: 'gelding',
  age: 8,
});

// With React Query
const { data, isLoading } = trpc.horses.list.useQuery();
```

### Using REST (via HTTP)

```bash
# Query
curl -X POST https://equiprofile.online/api/trpc/horses.list \
  -H "Content-Type: application/json" \
  --cookie "session=..." \
  -d '{}'

# Mutation
curl -X POST https://equiprofile.online/api/trpc/horses.create \
  -H "Content-Type: application/json" \
  --cookie "session=..." \
  -d '{"name":"Thunder","breed":"Thoroughbred"}'
```

## Support

For API support or questions:
- Email: api@equiprofile.online
- Documentation: https://docs.equiprofile.online
- Issues: https://github.com/amarktainetwork-blip/Equiprofile.online/issues
