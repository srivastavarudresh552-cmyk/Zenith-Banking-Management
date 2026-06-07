# API Integration Configuration

## Backend API Information

**Base URL**: `http://localhost:3000`
**API Prefix**: `/api`
**Full API URL**: `http://localhost:3000/api`

## Authentication

### Token Management
- Token stored in: `localStorage['token']`
- User data stored in: `localStorage['user']`
- Token format: JWT (JSON Web Token)
- Token expiration: 3 days

### Token Injection
All requests automatically include token in Authorization header:
```
Authorization: Bearer <token>
```

### Auto-Logout
- Token automatically added to every request via interceptor
- On 401 response, user is logged out and redirected to login
- Token and user data cleared from localStorage

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response (201):
{
  "user": {
    "_id": "userId",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}

Error Response (422):
{
  "message": "User already exists with email.",
  "status": "Failed"
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "user": {
    "_id": "userId",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}

Error Response (401):
{
  "message": "Email or password is INVALID"
}
```

#### Logout User
```
POST /api/auth/logout
Authorization: Bearer <token>

Response (200):
Success response with empty body
```

### Account Endpoints

#### Create Account
```
POST /api/accounts
Authorization: Bearer <token>
Content-Type: application/json

Response (201):
{
  "account": {
    "_id": "accountId",
    "user": "userId",
    "createdAt": "2026-06-05T10:00:00Z",
    "updatedAt": "2026-06-05T10:00:00Z"
  }
}
```

#### Get All User Accounts
```
GET /api/accounts
Authorization: Bearer <token>

Response (200):
{
  "accounts": [
    {
      "_id": "accountId1",
      "user": "userId",
      "createdAt": "2026-06-05T10:00:00Z",
      "updatedAt": "2026-06-05T10:00:00Z"
    },
    {
      "_id": "accountId2",
      "user": "userId",
      "createdAt": "2026-06-05T10:05:00Z",
      "updatedAt": "2026-06-05T10:05:00Z"
    }
  ]
}
```

#### Get Account Balance
```
GET /api/accounts/balance/:accountId
Authorization: Bearer <token>

Response (200):
{
  "accountId": "accountId",
  "balance": 1500.50,
  "message": "Account balance retrieved successfully"
}

Error Response (404):
{
  "message": "Account not found"
}
```

### Transaction Endpoints

#### Create Transfer Transaction
```
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "fromAccount": "sourceAccountId",
  "toAccount": "destinationAccountId",
  "amount": 100.50,
  "idempotencyKey": "unique-key-for-idempotency"
}

Response (201):
{
  "transaction": {
    "_id": "transactionId",
    "from": "sourceAccountId",
    "to": "destinationAccountId",
    "amount": 100.50,
    "status": "COMPLETED",
    "createdAt": "2026-06-05T10:10:00Z"
  },
  "message": "Transaction created successfully"
}

Error Response (400):
{
  "message": "From Account , toAccount , Amount and the idemotencyKey are required"
}
```

#### Create Initial Funds Transaction
```
POST /api/transactions/system/initial-funds
Authorization: Bearer <token> (System User Required)
Content-Type: application/json

Request Body:
{
  "toAccount": "destinationAccountId",
  "amount": 5000.00,
  "idempotencyKey": "unique-key-for-idempotency"
}

Response (201):
Transaction created with initial funds
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials) |
| 404 | Not Found |
| 422 | Unprocessable Entity (user exists) |
| 500 | Server Error |

## Environment Variables

```
VITE_API_URL=http://localhost:3000/api
```

Change this if your backend runs on a different server.

## Axios Configuration

### Request Interceptor
- Automatically adds Authorization header with token
- Extracts token from localStorage

### Response Interceptor
- Handles 401 errors by logging out user
- Redirects to login on authentication failure

### CORS
- Backend must have CORS enabled
- `withCredentials: true` for cookie support

## Data Formatting

### Currency
- All amounts in USD
- Decimal format (e.g., 100.50)
- No currency symbol in API

### Dates
- ISO 8601 format
- UTC timezone
- Example: "2026-06-05T10:00:00Z"

### IDs
- MongoDB ObjectID format
- 24-character hex string
- Example: "507f1f77bcf86cd799439011"

## Idempotency

### Why It Matters
Idempotency keys ensure that duplicate requests don't create duplicate transactions.

### Implementation
```javascript
// Generate unique key for each transaction
const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Use same key for retry - server will return same result
await api.post('/transactions', {
  ...transactionData,
  idempotencyKey
});
```

### Key Format
- Unique per transaction
- Combination of timestamp and random string
- Stored in database for deduplication

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get Accounts (replace TOKEN)
curl -X GET http://localhost:3000/api/accounts \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman
1. Create environment variable: `api_url = http://localhost:3000`
2. Create authorization: `Bearer {{token}}`
3. Import endpoints and test

## Common Issues & Solutions

### 401 Unauthorized
- Token may have expired (3 days)
- localStorage may have been cleared
- Re-login to get new token

### CORS Errors
- Backend CORS not configured correctly
- Ensure `http://localhost:5173` is whitelisted
- Check backend for CORS middleware

### Account Not Found
- Account may belong to different user
- Wrong account ID format
- Account may have been deleted

### Insufficient Balance
- Check current balance before transfer
- Amount must be positive and less than balance

### Duplicate Transaction
- Idempotency key already used
- Server will return previous transaction

## Security Notes

1. **Token Storage**
   - Stored in localStorage (not HttpOnly)
   - Consider alternatives for production

2. **HTTPS**
   - Always use HTTPS in production
   - Never send tokens over HTTP

3. **Token Expiration**
   - Currently 3 days
   - Implement refresh token for production

4. **Rate Limiting**
   - Backend should implement rate limiting
   - Prevent brute force attacks

## Monitoring & Debugging

### Console Logs
```javascript
// API calls logged in console
console.log(response.data);

// Errors logged
console.error(error.response?.data);
```

### Network Tab
- Browser DevTools > Network tab
- View all API requests/responses
- Check headers and payload

### API Response Times
- Typical: 50-200ms
- Slow: > 1000ms (check backend)

---

For backend API changes, update this document and the service files accordingly.
