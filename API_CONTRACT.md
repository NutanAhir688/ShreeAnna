Absolutely. Here is the **clean API contract section** you can directly give to your .NET backend developer.

# ShreeAnna API Contract — v1

**Base URL**

```text
/api/v1
```

---

# 1. Request JSON

## 1.1 Register Farmer

```http
POST /api/v1/auth/register
```

```json
{
  "farmerName": "Ramesh Kumar",
  "mobileNumber": "9876543210",
  "address": "Green Hill Farm",
  "village": "Palampur",
  "district": "Anand",
  "state": "Gujarat",
  "fpoId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 1.2 Send OTP

```http
POST /api/v1/auth/send-otp
```

```json
{
  "mobileNumber": "9876543210"
}
```

---

## 1.3 Verify OTP

```http
POST /api/v1/auth/verify-otp
```

```json
{
  "mobileNumber": "9876543210",
  "otp": "1234"
}
```

---

## 1.4 Resend OTP

```http
POST /api/v1/auth/resend-otp
```

```json
{
  "mobileNumber": "9876543210"
}
```

---

## 1.5 Update Farmer Profile

```http
PUT /api/v1/farmers/me
```

```json
{
  "name": "Ramesh Kumar",
  "address": "Green Hill Farm",
  "village": "Palampur",
  "district": "Anand",
  "state": "Gujarat"
}
```

---

## 1.6 Create Farm

```http
POST /api/v1/farmers/me/farms
```

```json
{
  "name": "Green Hill Farm",
  "acres": 12,
  "soilType": "BLACK_SOIL",
  "village": "Anand",
  "district": "Anand",
  "state": "Gujarat"
}
```

---

## 1.7 Submit / Sell Millet

```http
POST /api/v1/farmers/me/lots
```

```json
{
  "fpoId": "550e8400-e29b-41d4-a716-446655440000",
  "farmId": "660e8400-e29b-41d4-a716-446655440000",
  "milletTypeId": "770e8400-e29b-41d4-a716-446655440000",
  "estimatedQuantityKg": 500,
  "harvestDate": "2026-08-08",
  "description": "Freshly harvested pearl millet."
}
```

---

## 1.8 Reject Procurement Agreement

```http
POST /api/v1/procurement-agreements/{agreementId}/reject
```

```json
{
  "reason": "PRICE_NOT_ACCEPTABLE",
  "comment": "The offered price is too low."
}
```

---

## 1.9 Reschedule Pickup

```http
POST /api/v1/lots/{lotId}/pickup/reschedule
```

```json
{
  "requestedDate": "2026-08-28",
  "reason": "Farmer unavailable on scheduled date."
}
```

---

# 2. Response JSON

All successful responses follow:

```json
{
  "success": true,
  "data": {}
}
```

## 2.1 Registration Response

```json
{
  "success": true,
  "data": {
    "farmerId": "550e8400-e29b-41d4-a716-446655440000",
    "farmerName": "Ramesh Kumar",
    "mobileNumber": "9876543210",
    "isVerified": false
  }
}
```

---

## 2.2 OTP Response

```json
{
  "success": true,
  "data": {
    "message": "OTP sent successfully.",
    "expiresInSeconds": 30
  }
}
```

**Never return the actual OTP in production.**

---

## 2.3 Login / Verify OTP Response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "expiresIn": 3600,
    "farmer": {
      "farmerId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Ramesh Kumar",
      "mobileNumber": "9876543210"
    }
  }
}
```

---

## 2.4 Farmer Profile Response

```json
{
  "success": true,
  "data": {
    "farmerId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Ramesh Kumar",
    "mobileNumber": "9876543210",
    "village": "Palampur",
    "district": "Anand",
    "state": "Gujarat",
    "fpo": {
      "fpoId": "uuid",
      "name": "Kisan Vikas FPO"
    }
  }
}
```

---

## 2.5 Farm Response

```json
{
  "success": true,
  "data": {
    "farmId": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Green Hill Farm",
    "acres": 12,
    "soilType": "BLACK_SOIL",
    "village": "Anand",
    "district": "Anand",
    "state": "Gujarat",
    "status": "ACTIVE"
  }
}
```

---

## 2.6 Lot Response

```json
{
  "success": true,
  "data": {
    "lotId": "770e8400-e29b-41d4-a716-446655440000",
    "lotNumber": "LOT-2026-001",
    "milletType": {
      "id": "uuid",
      "name": "Pearl Millet",
      "localName": "Bajra"
    },
    "estimatedQuantityKg": 500,
    "actualQuantityKg": null,
    "submissionDate": "2026-08-10",
    "status": "QUALITY_INSPECTION"
  }
}
```

---

## 2.7 Lot Timeline Response

```json
{
  "success": true,
  "data": {
    "currentStatus": "QUALITY_INSPECTION",
    "steps": [
      {
        "step": "SUBMITTED",
        "status": "COMPLETED",
        "completedAt": "2026-08-10T09:30:00Z"
      },
      {
        "step": "QUALITY_INSPECTION",
        "status": "IN_PROGRESS",
        "completedAt": null
      },
      {
        "step": "QUALITY_CERTIFICATE",
        "status": "PENDING",
        "completedAt": null
      },
      {
        "step": "PROCUREMENT_AGREEMENT",
        "status": "PENDING",
        "completedAt": null
      },
      {
        "step": "PICKUP",
        "status": "PENDING",
        "completedAt": null
      },
      {
        "step": "PAYMENT",
        "status": "PENDING",
        "completedAt": null
      }
    ]
  }
}
```

---

# 3. HTTP Status Codes

Backend should consistently use these:

|  Code | Meaning             | Example                                  |
| ----: | ------------------- | ---------------------------------------- |
| `200` | OK                  | GET/update successful                    |
| `201` | Created             | Farmer/farm/lot created                  |
| `204` | No Content          | Successful delete/logout                 |
| `400` | Bad Request         | Invalid JSON/request                     |
| `401` | Unauthorized        | Missing/invalid JWT                      |
| `403` | Forbidden           | User doesn't have permission             |
| `404` | Not Found           | Lot/farm doesn't exist                   |
| `409` | Conflict            | Mobile number already registered         |
| `422` | Business validation | Cannot reject already rejected agreement |
| `429` | Too Many Requests   | Too many OTP requests                    |
| `500` | Server Error        | Unexpected backend error                 |

### Important distinction

```text
401 = "Who are you?"
403 = "I know who you are, but you can't do this."
```

---

# 4. Enums

**These values must remain identical between Flutter and .NET.**

## Lot Status

```text
SUBMITTED
QUALITY_INSPECTION
QUALITY_CERTIFIED
AGREEMENT_PENDING
AGREEMENT_ACCEPTED
AGREEMENT_REJECTED
PICKUP_SCHEDULED
PICKUP_COMPLETED
DELIVERY_COMPLETED
PAYMENT_PENDING
PAYMENT_COMPLETED
CANCELLED
```

---

## Quality Status

```text
PENDING
IN_PROGRESS
PASSED
FAILED
```

---

## Quality Grade

```text
A
B
C
REJECTED
```

---

## Agreement Status

```text
AWAITING_FARMER_REVIEW
ACCEPTED
REJECTED
EXPIRED
CANCELLED
```

---

## Agreement Rejection Reason

```text
PRICE_NOT_ACCEPTABLE
QUANTITY_NOT_ACCEPTABLE
PICKUP_CHARGES
OTHER
```

---

## Farm Status

```text
ACTIVE
PENDING_VERIFICATION
INACTIVE
```

---

## Soil Type

```text
BLACK_SOIL
RED_SOIL
ALLUVIAL_SOIL
LOAMY_SOIL
SANDY_SOIL
CLAY_SOIL
OTHER
```

---

## Transportation Type

```text
FPO_PICKUP
FARMER_DELIVERY
```

---

## Pickup Status

```text
SCHEDULED
RESCHEDULE_REQUESTED
IN_PROGRESS
COMPLETED
CANCELLED
```

---

## Payment Status

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

---

## Payment Reference

A payment reference is a **string**, not an enum:

```json
{
  "reference": "TXN-984421"
}
```

---

# 5. Authentication

We'll use **JWT Bearer Authentication**.

After OTP verification:

```text
Flutter
   │
   │ POST /auth/verify-otp
   ▼
.NET API
   │
   ├── Verify OTP
   ├── Generate JWT
   └── Generate refresh token
   │
   ▼
Flutter
```

Backend returns:

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "expiresIn": 3600
}
```

For protected APIs Flutter sends:

```http
Authorization: Bearer eyJhbGciOi...
```

Example:

```http
GET /api/v1/farmers/me/lots
Authorization: Bearer eyJhbGciOi...
```

### Public endpoints

```text
POST /auth/register
POST /auth/send-otp
POST /auth/verify-otp
POST /auth/resend-otp
```

### Protected endpoints

Everything involving farmer data:

```text
GET  /farmers/me
PUT  /farmers/me

GET  /farmers/me/farms
POST /farmers/me/farms

GET  /farmers/me/lots
POST /farmers/me/lots

GET  /lots/{lotId}
GET  /lots/{lotId}/timeline
GET  /lots/{lotId}/quality

GET  /lots/{lotId}/procurement-agreement
POST /procurement-agreements/{id}/accept
POST /procurement-agreements/{id}/reject

GET  /lots/{lotId}/pickup
POST /lots/{lotId}/pickup/reschedule

GET /lots/{lotId}/payment
```

### Flutter token storage

Don't store JWT in plain `SharedPreferences`.

Use secure storage:

```text
flutter_secure_storage
```

We'll implement this when we reach authentication.

---

# 6. Pagination

For list endpoints:

```http
GET /api/v1/farmers/me/lots?page=1&pageSize=20
```

Default:

```text
page = 1
pageSize = 20
```

Maximum:

```text
pageSize = 100
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "lotId": "uuid",
      "lotNumber": "LOT-2026-001",
      "status": "SUBMITTED"
    },
    {
      "lotId": "uuid",
      "lotNumber": "LOT-2026-002",
      "status": "QUALITY_INSPECTION"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 42,
    "totalPages": 3
  }
}
```

For the Flutter developer:

```text
page       → current page
pageSize   → number requested
totalItems → total records
totalPages → pages available
```

This allows us to implement:

```text
Load page 1
     ↓
Scroll
     ↓
Load page 2
     ↓
Scroll
     ↓
Load page 3
```

rather than downloading every farmer lot at once.

---

# 7. Error Format

**This is especially important.** Every backend error should have the same structure.

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message.",
    "details": {}
  }
}
```

---

## Validation Error

HTTP:

```http
400 Bad Request
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please correct the highlighted fields.",
    "details": {
      "mobileNumber": "Mobile number must contain 10 digits.",
      "farmerName": "Farmer name is required."
    }
  }
}
```

Flutter can then show:

```text
Farmer Name
[                         ]
Farmer name is required.

Mobile Number
[ 98765                    ]
Mobile number must contain 10 digits.
```

---

## Unauthorized

HTTP:

```http
401 Unauthorized
```

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required.",
    "details": null
  }
}
```

Flutter should normally:

```text
401
 ↓
Clear expired session
 ↓
Return to Login
```

---

## Not Found

HTTP:

```http
404 Not Found
```

```json
{
  "success": false,
  "error": {
    "code": "LOT_NOT_FOUND",
    "message": "The requested lot was not found.",
    "details": null
  }
}
```

---

## Conflict

HTTP:

```http
409 Conflict
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "MOBILE_ALREADY_REGISTERED",
    "message": "A farmer with this mobile number already exists.",
    "details": null
  }
}
```

---

## Too Many Requests

HTTP:

```http
429 Too Many Requests
```

```json
{
  "success": false,
  "error": {
    "code": "OTP_RATE_LIMIT",
    "message": "Too many OTP requests. Please try again later.",
    "details": {
      "retryAfterSeconds": 60
    }
  }
}
```

---

## Business Error

Example: farmer tries to accept an already rejected agreement.

HTTP:

```http
422 Unprocessable Entity
```

```json
{
  "success": false,
  "error": {
    "code": "AGREEMENT_ALREADY_REJECTED",
    "message": "This procurement agreement can no longer be accepted.",
    "details": null
  }
}
```

---

# Final Contract Summary

Give your backend developer this as the **non-negotiable shared contract**:

```text
                    SHREEANNA API
                         │
          ┌──────────────┴──────────────┐
          │                             │
       Flutter                       .NET
          │                             │
          │       JSON                  │
          ├─────────────────────────────┤
          │                             │
       Request ────────────────────→ Endpoint
          │                             │
       Response ←──────────────────── Endpoint
          │                             │
       HTTP Status                     Service
          │                             │
       Enums                           EF Core
          │                             │
       JWT Auth                       Database
          │
       Pagination
          │
       Error Format
```

### The most important rule

**Don't let the .NET developer invent the response format while you're already coding Flutter.**

Agree on:

```text
JSON field names
    +
types
    +
enum values
    +
status codes
    +
error structure
```

**now**.

Then you can both work independently.

For your Flutter project, our next implementation can follow this exact chain:

```text
Welcome
  ↓
Login
  ↓
Mobile number
  ↓
Send OTP API
  ↓
Verify OTP API
  ↓
JWT
  ↓
Home Dashboard API
```

That is a much better first milestone than trying to build all those wireframe screens at once.
