# User Profile Service

Microservice for managing user profiles, income brackets, league assignments, and user preferences for VitalScore Finance.

## Features

- ✅ User profile creation and management
- ✅ Automatic league assignment based on income brackets
- ✅ Household configuration for shared expenses
- ✅ Consent flags management
- ✅ Notification preferences
- ✅ Income declaration and updates

## API Endpoints

### User Management

#### Create User Profile
```
POST /users
Content-Type: application/json

{
  "declaredMonthlyIncome": 50000,
  "incomeType": "SALARIED",
  "locationType": "URBAN",
  "locationState": "Maharashtra",
  "locationCity": "Mumbai",
  "algorandAddress": "ALGO_ADDRESS_58_CHARS"
}
```

#### Get User Profile
```
GET /users/:userId
```

#### Update User Profile
```
PATCH /users/:userId
Content-Type: application/json

{
  "declaredMonthlyIncome": 60000,
  "notificationPreferences": {
    "frequency": "FULL"
  }
}
```

### League Management

#### Get League Assignment
```
GET /users/:userId/league
```

#### Update Income (triggers league reassignment if needed)
```
POST /users/:userId/income
Content-Type: application/json

{
  "monthlyIncome": 80000
}
```

### Settings

#### Get User Settings
```
GET /users/:userId/settings
```

#### Update User Settings
```
PATCH /users/:userId/settings
Content-Type: application/json

{
  "notificationPreferences": {
    "streakAlerts": true,
    "challengeAlerts": true
  },
  "consentFlags": {
    "escrowEnabled": true
  }
}
```

## League Tiers

- **Tier 1**: <₹25K/month
- **Tier 2**: ₹25K–75K/month
- **Tier 3**: ₹75K–2L/month
- **Tier 4**: >₹2L/month

League IDs are generated quarterly: `TIER_X_QY_YYYY` (e.g., `TIER_2_Q1_2026`)

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Build TypeScript
npm run build

# Run migrations (from project root)
./backend/database/migrations/run_migrations.sh
```

### Development

```bash
# Run in development mode with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vitalscore
DB_USER=postgres
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10

# Logging
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Response Format

All endpoints return responses in the standard format:

```json
{
  "success": true,
  "data": { },
  "error": null,
  "meta": {
    "requestId": "req-123456",
    "timestamp": "2026-02-27T00:00:00.000Z",
    "version": "v1"
  }
}
```

## Error Codes

- `VALIDATION_ERROR` - Invalid request data
- `USER_NOT_FOUND` - User profile not found
- `INTERNAL_ERROR` - Server error
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `NOT_FOUND` - Endpoint not found

## Health Check

```
GET /health
```

Returns service health status and database connectivity.

## Architecture

```
src/
├── config/
│   ├── database.ts      # PostgreSQL connection pool
│   └── logger.ts        # Winston logger configuration
├── models/
│   └── UserProfile.ts   # TypeScript interfaces and enums
├── repositories/
│   └── UserProfileRepository.ts  # Database operations
├── services/
│   └── LeagueService.ts # League assignment logic
├── controllers/
│   └── UserProfileController.ts  # Request handlers
├── routes/
│   └── userRoutes.ts    # Express routes
└── index.ts             # Application entry point
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- UserProfileRepository.test.ts
```

## Docker

```bash
# Build image
docker build -t vitalscore/user-profile-service .

# Run container
docker run -p 3001:3001 --env-file .env vitalscore/user-profile-service
```

## License

PROPRIETARY - VitalScore Finance
