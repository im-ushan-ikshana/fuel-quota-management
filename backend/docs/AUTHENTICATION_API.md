# Fuel Quota Management System - Authentication API Documentation

## Base URL
```
http://localhost:4000/api/v1/auth
```

## Authentication Endpoints

### 1. User Registration
**POST** `/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "0771234567",
  "nicNumber": "200012345678",
  "userType": "VEHICLE_OWNER",
  "address": {
    "addressLine1": "123 Main Street",
    "addressLine2": "Apartment 4B",
    "city": "Colombo",
    "district": "COLOMBO",
    "province": "WESTERN"
  }
}
```

**Valid User Types:**
- `VEHICLE_OWNER`
- `FUEL_STATION_OWNER`
- `FUEL_STATION_OPERATOR`
- `ADMIN_USER`

**Valid Districts:**
- `COLOMBO`, `GAMPAHA`, `KALUTARA`, `KANDY`, `MATALE`, `NUWARA_ELIYA`, `GALLE`, `MATARA`, `HAMBANTOTA`, `JAFFNA`, `KILINOCHCHI`, `MANNAR`, `VAVUNIYA`, `MULLAITIVU`, `BATTICALOA`, `AMPARA`, `TRINCOMALEE`, `KURUNEGALA`, `PUTTALAM`, `ANURADHAPURA`, `POLONNARUWA`, `BADULLA`, `MONERAGALA`, `RATNAPURA`, `KEGALLE`

**Valid Provinces:**
- `WESTERN`, `CENTRAL`, `SOUTHERN`, `NORTHERN`, `EASTERN`, `NORTH_WESTERN`, `NORTH_CENTRAL`, `UVA`, `SABARAGAMUWA`

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "cm3...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "0771234567",
      "userType": "VEHICLE_OWNER",
      "isActive": true,
      "emailVerified": false,
      "roles": []
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "24h"
    }
  }
}
```

### 2. User Login
**POST** `/login`

Authenticate user and get access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "cm3...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "0771234567",
      "userType": "VEHICLE_OWNER",
      "isActive": true,
      "emailVerified": false,
      "roles": []
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h"
  }
}
```

### 3. User Logout
**POST** `/logout`

Logout user and invalidate session.

**Headers:**
```
x-session-id: <session-id>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 4. Forgot Password
**POST** `/forgot-password`

Request password reset token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a password reset link has been sent."
}
```

### 5. Reset Password
**POST** `/reset-password`

Reset password using reset token.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully."
}
```

### 6. Verify Token
**GET** `/verify-token`

Verify JWT token validity.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": "cm3...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "userType": "VEHICLE_OWNER",
      "isActive": true,
      "emailVerified": false,
      "roles": []
    }
  }
}
```

### 7. Session Cleanup (Admin)
**DELETE** `/sessions/cleanup`

Clean up expired sessions (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "Cleaned up 5 expired sessions"
}
```

## Validation Rules

### Password Requirements
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (@$!%*?&)

### Phone Number Format
- Sri Lankan phone numbers
- Formats: 0771234567, +94771234567, 94771234567

### NIC Number Format
- Old format: 123456789V
- New format: 200012345678

### Email Format
- Standard email validation

## Error Responses

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation error message",
  "errors": ["Specific error details"]
}
```

### Authentication Errors (401)
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Conflict Errors (409)
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

### Server Errors (500)
```json
{
  "success": false,
  "message": "Internal server error message"
}
```

## Testing Examples

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "0771234567",
    "nicNumber": "200012345678",
    "userType": "VEHICLE_OWNER",
    "address": {
      "addressLine1": "123 Main Street",
      "city": "Colombo",
      "district": "COLOMBO",
      "province": "WESTERN"
    }
  }'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Verify token:**
```bash
curl -X GET http://localhost:4000/api/v1/auth/verify-token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Implementation Status

✅ **Completed Features:**
- User registration with comprehensive validation
- User login with JWT token generation
- User logout with session management
- Forgot password functionality
- Password reset functionality
- JWT token verification
- Session cleanup (admin endpoint)
- Sri Lankan-specific validation (phone, NIC)
- Comprehensive error handling
- Password strength validation
- Email format validation
- Database integration with Prisma
- Bcrypt password hashing
- Session management
- Refresh token support

🔄 **Pending Features:**
- Email service integration for password reset
- Email verification functionality
- Admin authentication middleware for session cleanup
- Rate limiting for authentication endpoints
- Account lockout after failed attempts
- Two-factor authentication (2FA)

## Security Features

- **Password Hashing:** Bcrypt with salt rounds
- **JWT Tokens:** Secure token generation with expiration
- **Session Management:** Database-stored sessions with expiration
- **Input Validation:** Comprehensive validation for all inputs
- **SQL Injection Protection:** Prisma ORM prevents SQL injection
- **CORS Configuration:** Proper CORS setup for frontend integration
- **Environment Variables:** Secure configuration management

## Database Schema

The authentication system uses the following main tables:
- `users` - User account information
- `addresses` - User address information
- `sessions` - Active user sessions
- `user_role_assignments` - User role mappings
- `roles` - Available system roles

All tables are properly indexed and include audit fields (createdAt, updatedAt).
