# REST API Reference

## Overview

The EquiProfile REST API provides programmatic access to your horse management data for third-party integrations. All API requests require authentication via API keys.

**Base URL**: `https://your-domain.com/api/v1`

## Authentication

All API endpoints require authentication using an API key in the `Authorization` header with the `Bearer` scheme:

```http
Authorization: Bearer your_api_key_here
```

### Creating API Keys

API keys can be created from the Admin Panel:

1. Navigate to Admin Panel → API Keys tab
2. Click "Create New API Key"
3. Provide a name and optional rate limit
4. Save the generated key securely (it won't be shown again)

### API Key Security

- **Store keys securely**: Never commit API keys to version control
- **Use environment variables**: Store keys in `.env` files or secret managers
- **Rotate regularly**: Rotate keys every 90 days or when compromised
- **Revoke unused keys**: Remove keys that are no longer needed

## Rate Limiting

API requests are rate-limited to prevent abuse:

- Default: **100 requests per hour** per API key
- Custom limits can be configured per key in the Admin Panel
- Exceeded rate limits return `429 Too Many Requests`

Response headers indicate rate limit status:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Response Format

All successful responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "count": 5  // For list endpoints
}
```

Error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

## HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid API key
- `403 Forbidden`: API key doesn't have permission for this resource
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

## Endpoints

### List Horses

Returns all horses for the authenticated user.

**Endpoint**: `GET /api/v1/horses`

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "name": "Thunder",
      "breed": "Thoroughbred",
      "age": 8,
      "dateOfBirth": "2015-03-15",
      "height": 165,
      "weight": 550,
      "color": "Bay",
      "gender": "gelding",
      "discipline": "Show Jumping",
      "level": "Advanced",
      "registrationNumber": "TB123456",
      "microchipNumber": "MC789012",
      "notes": "High energy, loves jumping",
      "photoUrl": "https://...",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-10T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Example**:

```bash
curl -H "Authorization: Bearer your_api_key" \
  https://your-domain.com/api/v1/horses
```

---

### Get Horse Details

Returns detailed information about a specific horse.

**Endpoint**: `GET /api/v1/horses/:id`

**Parameters**:

- `id` (path parameter): Horse ID

**Response**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "name": "Thunder",
    "breed": "Thoroughbred"
    // ... all horse fields
  }
}
```

**Example**:

```bash
curl -H "Authorization: Bearer your_api_key" \
  https://your-domain.com/api/v1/horses/1
```

**Errors**:

- `400 Bad Request`: Invalid horse ID format
- `404 Not Found`: Horse doesn't exist
- `403 Forbidden`: You don't own this horse

---

### List Health Records

Returns all health records for a specific horse.

**Endpoint**: `GET /api/v1/health-records/:horseId`

**Parameters**:

- `horseId` (path parameter): Horse ID

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "horseId": 1,
      "userId": 1,
      "recordType": "vaccination",
      "title": "Annual Vaccination",
      "description": "EHV-1/4, Influenza, Tetanus",
      "recordDate": "2024-03-15",
      "nextDueDate": "2025-03-15",
      "vetName": "Dr. Smith",
      "vetPhone": "+1234567890",
      "vetClinic": "Equine Veterinary Center",
      "cost": 15000,
      "documentUrl": "https://...",
      "notes": "No adverse reactions",
      "createdAt": "2024-03-15T00:00:00.000Z",
      "updatedAt": "2024-03-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Example**:

```bash
curl -H "Authorization: Bearer your_api_key" \
  https://your-domain.com/api/v1/health-records/1
```

**Record Types**:

- `vaccination`
- `deworming`
- `dental`
- `farrier`
- `veterinary`
- `injury`
- `medication`
- `other`

---

### List Training Sessions

Returns all training sessions for a specific horse.

**Endpoint**: `GET /api/v1/training-sessions/:horseId`

**Parameters**:

- `horseId` (path parameter): Horse ID

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "horseId": 1,
      "userId": 1,
      "sessionDate": "2024-03-20",
      "startTime": "09:00",
      "endTime": "10:00",
      "duration": 60,
      "sessionType": "jumping",
      "discipline": "Show Jumping",
      "trainer": "Jane Doe",
      "location": "Main Arena",
      "goals": "Improve grid work",
      "exercises": "Cavaletti work, 6-fence grid",
      "notes": "Great session, very focused",
      "performance": "excellent",
      "weather": "Clear",
      "temperature": 18,
      "isCompleted": true,
      "createdAt": "2024-03-20T00:00:00.000Z",
      "updatedAt": "2024-03-20T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Example**:

```bash
curl -H "Authorization: Bearer your_api_key" \
  https://your-domain.com/api/v1/training-sessions/1
```

**Session Types**:

- `flatwork`
- `jumping`
- `hacking`
- `lunging`
- `groundwork`
- `competition`
- `lesson`
- `other`

**Performance Levels**:

- `excellent`
- `good`
- `average`
- `poor`

---

### List Competitions

Returns all competition entries for a specific horse.

**Endpoint**: `GET /api/v1/competitions/:horseId`

**Parameters**:

- `horseId` (path parameter): Horse ID

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "horseId": 1,
      "userId": 1,
      "eventName": "Spring Classic",
      "eventDate": "2024-04-15",
      "eventLocation": "National Equestrian Center",
      "discipline": "Show Jumping",
      "className": "1.20m Open",
      "placement": 1,
      "score": 0,
      "penaltyPoints": 0,
      "time": "45.32",
      "prizeMoney": 50000,
      "notes": "Clear round, fastest time",
      "createdAt": "2024-04-15T00:00:00.000Z",
      "updatedAt": "2024-04-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Example**:

```bash
curl -H "Authorization: Bearer your_api_key" \
  https://your-domain.com/api/v1/competitions/1
```

---

## Error Handling

Always check the HTTP status code and handle errors appropriately:

```javascript
fetch("https://your-domain.com/api/v1/horses", {
  headers: {
    Authorization: "Bearer your_api_key",
  },
})
  .then((response) => {
    if (!response.ok) {
      return response.json().then((err) => {
        throw new Error(err.error || "API request failed");
      });
    }
    return response.json();
  })
  .then((data) => {
    console.log("Horses:", data.data);
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
```

## Best Practices

1. **Cache responses**: Reduce API calls by caching data where appropriate
2. **Handle pagination**: Future versions will add pagination; prepare for it
3. **Retry with exponential backoff**: Retry failed requests with increasing delays
4. **Monitor rate limits**: Track `X-RateLimit-Remaining` header
5. **Use webhooks**: Future versions will support webhooks for real-time updates

## Support

For API support or to request new endpoints:

- **Email**: support@equiprofile.online
- **Documentation**: https://docs.equiprofile.online/api
- **Status**: https://status.equiprofile.online

## Changelog

### v1.0.0 (2024-01-01)

- Initial REST API release
- Read-only endpoints for horses, health records, training sessions, and competitions
- API key authentication
- Rate limiting
