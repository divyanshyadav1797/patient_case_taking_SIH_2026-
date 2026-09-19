# Quantum Care Backend - JWT Authentication System

Enterprise-grade, multi-role JSON Web Token (JWT) authentication, token lifecycle management, session revocation, and Aadhaar OTP verification engine for **Quantum Care** (SIH 2026).

---

## 🔑 Complete JWT Token Architecture

The authentication engine implements an RFC 7519 compliant JSON Web Token (JWT) system with **Access + Refresh Token rotation** and **Server-Side Token Revocation (Blacklisting)**:

### 1. Dual Token Pair
Every successful authentication (`/login` or `/register`) issues:
- **JWT Access Token**: Short-lived (default `1h`), cryptographically signed with `JWT_SECRET`, used in `Authorization: Bearer <token>` for API access.
- **JWT Refresh Token**: Long-lived (default `7d`), cryptographically signed with `JWT_REFRESH_SECRET`, used on `/api/v1/auth/refresh` to obtain new access tokens without re-entering passwords.

### 2. Standardized JWT Claims
```json
{
  "sub": "P-10249",
  "id": "P-10249",
  "customId": "P-10249",
  "role": "patient",
  "name": "Rahul Sharma",
  "email": "rahul.sharma@example.com",
  "tokenType": "access",
  "jti": "550e8400-e29b-41d4-a716-446655440000",
  "iat": 1720000000,
  "exp": 1720003600
}
```

### 3. Server-Side Token Revocation & Blacklisting on Logout
Unlike naive JWT setups that cannot invalidate tokens before expiration, Quantum Care features an **active Token Blacklist**:
- When `POST /api/v1/auth/logout` is called, both the Access Token and Refresh Token are registered in the Token Blacklist.
- [`authMiddleware.js`](src/middleware/authMiddleware.js) verifies both signature and blacklist status. Any attempt to use a logged-out token is rejected with `401 Unauthorized`.
- In MongoDB, tokens are automatically purged upon natural expiration using MongoDB TTL indexes (`expires: 0`).
- When offline, blacklisted tokens are persisted in [`Backend/data/db.json`](data/db.json).

---

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd Backend
npm start
```

### 2. Run Complete JWT Test Suite (18 Tests)
```bash
npm test
```

---

## 📡 JWT API Endpoints

**Base URL:** `http://localhost:3000/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Universal login, returns `{ accessToken, refreshToken, user }` | No |
| `POST` | `/api/v1/auth/register` | Direct registration, returns `{ accessToken, refreshToken, user }` | No |
| `POST` | `/api/v1/auth/refresh` | Exchange `refreshToken` for a new JWT `accessToken` | No |
| `POST` | `/api/v1/auth/verify-token`| Validate and decode token claims | Optional Bearer |
| `POST` | `/api/v1/auth/logout` | Revokes and blacklists active JWT token(s) | Bearer Token |
| `GET` | `/api/v1/auth/me` | Retrieve profile and decoded JWT claims | Bearer Token |
| `POST` | `/api/v1/auth/password/change` | Authenticated password change | Bearer Token |
| `POST` | `/api/v1/auth/register/request-otp` | Request 6-digit Aadhaar / phone OTP | No |
| `POST` | `/api/v1/auth/register/verify-otp` | Verify OTP code | No |
| `POST` | `/api/v1/auth/register/complete` | Complete registration with verified token | No |

---

## 🧪 Verified Test Output

Running `npm test` executes the 18 automated test cases:
```text
======================================================
--- Quantum Care JWT Token Authentication Test Suite ---
======================================================
✅ PASS: Server is healthy
✅ PASS: Patient login issues JWT Access Token + Refresh Token pair
✅ PASS: JWT token inspection confirms valid claims (sub, role, jti, tokenType)
✅ PASS: Patient login with 12-digit Aadhaar number
✅ PASS: Doctor login with NMC ID
✅ PASS: Hospital login with Registration No
✅ PASS: Kiosk terminal login with PIN
✅ PASS: Reject invalid password with 401
✅ PASS: Register new Patient returns JWT tokens
✅ PASS: Request Aadhaar OTP session
✅ PASS: Verify 6-digit Aadhaar OTP
✅ PASS: Protected GET /api/v1/auth/me returns profile & claims
✅ PASS: Exchange Refresh Token for new JWT Access Token
✅ PASS: Newly refreshed JWT Access Token grants access to protected routes
✅ PASS: Authenticated password change via JWT Bearer
✅ PASS: Logout endpoint revokes JWT access & refresh tokens
✅ PASS: Token Blacklist successfully blocks revoked JWT token from further use
✅ PASS: Reject forged/tampered JWT token with 401

Results: 18 passed, 0 failed.
```
