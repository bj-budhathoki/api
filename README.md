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
  "password": "password123"
}

Response:
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
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
  "token": "eyJhbGc...",
  "user": {
    "id": "1234567890",
    "name": "John Doe",
    "email": "john@example.com",
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
- ✅ JWT token generation
- ✅ Protected routes with middleware
- ✅ JSON server for development
- ✅ Error handling
- ✅ Environment variables

## Environment Variables

Edit `.env` file:

```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=3000
DB_URL=http://localhost:3001
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
