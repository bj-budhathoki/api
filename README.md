# Dashboard API

Node.js API with MVC structure, JWT authentication, and JSON server.

## Folder Structure

```
dashboard-api/
├── config/
│   └── config.js           # Configuration
├── controllers/
│   └── authController.js   # Authentication logic
├── middleware/
│   └── authMiddleware.js   # JWT verification middleware
├── routes/
│   └── authRoutes.js       # API routes
├── .env                    # Environment variables
├── db.json                 # JSON server database
├── package.json
├── server.js              # Entry point
└── README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start json-server (in one terminal):

```bash
npm run db
```

3. Start the API server (in another terminal):

```bash
npm run dev
```

## API Endpoints

### Authentication

#### Signup

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}

Response:
{
  "message": "User registered successfully",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "accessTokenExpiresIn": "15m",
  "refreshTokenExpiresIn": "7d",
  "accessTokenExpiresAt": "2026-03-17T12:15:00.000Z",
  "refreshTokenExpiresAt": "2026-03-24T11:00:00.000Z",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-03-10T10:00:00.000Z"
  }
}
```

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "accessTokenExpiresIn": "15m",
  "refreshTokenExpiresIn": "7d",
  "accessTokenExpiresAt": "2026-03-17T12:15:00.000Z",
  "refreshTokenExpiresAt": "2026-03-24T11:00:00.000Z",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-03-10T10:00:00.000Z"
  }
}
```

#### Refresh Token

```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response:
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "accessTokenExpiresIn": "15m",
  "refreshTokenExpiresIn": "7d",
  "accessTokenExpiresAt": "2026-03-17T12:30:00.000Z",
  "refreshTokenExpiresAt": "2026-03-24T11:15:00.000Z",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2026-03-10T10:00:00.000Z"
  }
}
```

#### Protected Route - Profile

```
GET /api/auth/profile
Authorization: Bearer <token>

Response:
{
  "message": "Profile route accessed",
  "userId": "1234567890"
}
```

### Health Check

```
GET /api/health

Response:
{
  "message": "API is running"
}
```

## Features

- ✅ MVC architecture
- ✅ User signup and login
- ✅ Password hashing with bcryptjs
- ✅ JWT access and refresh token authentication
- ✅ Token refresh functionality
- ✅ Protected routes with middleware
- ✅ JSON server for development
- ✅ Error handling
- ✅ Environment variables
- ✅ Swagger API documentation

## Token Management

This API implements JWT with refresh token rotation for enhanced security:

- **Access Tokens**: Short-lived (15 minutes) tokens for API access
- **Refresh Tokens**: Long-lived (7 days) tokens for obtaining new access tokens
- **Token Rotation**: New refresh tokens are issued on each refresh for security

### Usage Flow

1. User logs in and receives both access and refresh tokens
2. Access token is used for API calls
3. When access token expires, use refresh token to get new tokens
4. Store refresh token securely (e.g., httpOnly cookie in production)

### Testing

Run the test script to verify refresh token functionality:

```bash
node test-refresh-token.js
```

This will:

- Register a test user
- Obtain tokens
- Refresh the tokens
- Test protected route access

## Environment Variables

Edit `.env` file:

```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_different_from_access_secret
PORT=3001
DB_URL=http://localhost:3002
```

## Testing with cURL

### Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Access Protected Route

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```
