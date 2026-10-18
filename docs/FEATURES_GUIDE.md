# ShreeAnna — Features & Operational Functional Guide

> **Document Version:** 1.0.0  
> **Target Audience:** Product Engineers, QA Engineers, Solution Architects, Operations Teams  
> **Last Updated:** October 2026  
> **Classification:** Functional Specification & Operational Runbook  

---

## 1. Introduction

**ShreeAnna** is a digital agritech ecosystem built to modernize and empower the Millet Value Chain in India. This document explains the operational workflows, business rules, implicit algorithms, and edge-case handling across all functional modules in plain English.

---

## 2. Core Functional Modules

### 2.1 Multi-Role Authentication & Session Architecture

#### Operational Overview
ShreeAnna supports three distinct user authentication experiences tailored to their field conditions:
1. **Farmers (Mobile):** Passwordless authentication via mobile phone number. The user enters their registered 10-digit phone number. An SMS containing a 4-digit numeric OTP is dispatched. Entering the OTP mints a scoped JWT bearer token stored securely on the mobile device.
2. **Drivers (Mobile):** Transporters authenticate via their registered phone number. Upon verification, the driver is immediately directed to their dedicated `DriverJourneyScreen` displaying active assignments and route maps.
3. **FPO Staff & Web Operators (Web):** Email/password credentials authentication with role-based dashboard gating (`FpoAdmin`, `QualityInspector`, `WarehouseManager`, `Accountant`, `Buyer`).

#### Implicit Logic & Business Rules
- **Token Expiry:** Access tokens have a 60-minute lifetime.
- **Web Token Security:** Access tokens are stored purely in-memory in JavaScript closure on the web browser. Refresh tokens are stored in an encrypted, HttpOnly, SameSite cookie. This eliminates XSS and CSRF exposure.
- **Transparent Refresh:** When any API call returns `401 Unauthorized`, the web client intercepts the failure, executes `POST /api/auth/refresh` using the HttpOnly cookie, receives a fresh access token, and retries the original request once before redirecting to `/login`.
- **Mobile Session Management:** Tokens are persisted via `TokenStorage`. A global 401 interceptor automatically routes the mobile user to `WelcomeScreen` if their token is invalidated or revoked.

#### Edge Cases & Fallbacks
- **Offline / Non-responsive SMS Gateway:** If MSG91 SendOTP times out or is unreachable, the system falls back to internal database verification with an encrypted hash in `FarmerOtps`.
- **Brute-Force Protection:** Maximum 3 failed OTP attempts permitted per verification window. OTPs expire strictly after 10 minutes.
- **Android Emulator Loopback:** In Flutter `ApiClient`, network requests targeting `10.0.2.2:5066` automatically fall back to `127.0.0.1:5066` upon socket exceptions.

---

### 2.2 Farmer Profile & Geo-Spatial Farm Management

#### Operational Overview
Farmers can register multiple farm land parcels under their profile. Each farm entry captures:
- Farm Name and Cadastral Survey Number
- Total Land Area in Acres (with decimal precision)
- Soil Classification (e.g., Black Cotton, Red Loamy, Sandy Loam)
- Geo-spatial Coordinates (Latitude and Longitude)
- Active Millet Crops cultivated per season (e.g., Ragi/Finger Millet, Pearl Millet/Bajra, Foxtail Millet)
- Photographic documentation of the farm/land title.

#### Implicit Logic & Business Rules
- **Farm Code Generation:** Each registered farm is assigned a unique alphanumeric code formatted as `FARM-XXXX` via EF Core transaction.
- **Initial Verification State:** New farms are created with `Status = "PendingVerification"`. FPO agricultural extension officers inspect cadastral survey numbers on the web portal (`/farm-verification`) and mark farms as `Verified` or `Rejected`.
- **Unique Crop Seasons:** A unique database index ensures a farm cannot have duplicate crop records for the exact same season (e.g. `(FarmId, CropName, Season)` is unique).

#### Edge Cases & Fallbacks
- **Zero GPS Satellite Lock:** If the farmer is in an area with poor GPS, `Geolocator` requests high accuracy with a 15-second timeout; if it fails, the farmer can pin location manually or retry.
- **Azure Blob SAS Upload Resiliency:**
  1. The client first requests a signed write-only Shared Access Signature (SAS) URL via `GET /api/upload/sas?ext=jpg`.
  2. The mobile/web client uploads the image binary directly to Azure Blob Storage container `farm-images`, bypassing the backend server CPU and RAM.
  3. If Azure Blob direct upload fails (e.g. corporate firewall blocking raw Azure endpoints), the client automatically falls back to `POST /api/upload`, sending the image as `multipart/form-data` to the .NET backend, which relays it to Azure.

---

### 2.3 Procurement Lot Creation & Dynamic Price Quotation

#### Operational Overview
When millet is harvested and ready for sale, the farmer creates a **Procurement Lot** via the mobile app:
1. Selects the verified farm and cultivated millet crop.
2. Inputs estimated harvest quantity in Kilograms (Kg).
3. Sets their expected asking price per Kg.
4. Adds optional descriptions or crop images.

#### Implicit Logic & Business Rules
- **Lot Number Generation:** The system issues a globally unique identifier: `LOT-YYYYMMDD-XXXX`.
- **State Machine Progression:**
  ```
  PendingAgreement ──> PendingConsent ──> AgreementAccepted ──> QualityCertified ──> Dispatched ──> StoredInWarehouse ──> Settled
         │                     │
         ▼                     ▼
  (Cancelled)          AgreementRejected
  ```
- **Timeline Auditability:** Every stage transition creates an immutable entry in the `LotTimelineResponse` with timestamp, actor identity, and operational notes.

---

### 2.4 Procurement Agreement Negotiation & Digital Consent

#### Operational Overview
FPO officers review pending lots on the web dashboard (`/agreements`). They evaluate market prices, warehouse capacity, and transport logistics:
1. The officer formulates a formal procurement agreement specifying:
   - Final Offered Price per Kg.
   - Target Pickup Window (Date range).
   - Designated Delivery Warehouse.
2. The agreement is transmitted to the farmer's mobile app.
3. The farmer reviews the terms in `ProcurementAgreementScreen`:
   - **Accept:** Marks status as `AgreementAccepted`, locking in price and pickup date.
   - **Reject:** Prompts for a mandatory reason (e.g., "Offered price below minimum support price") and sets status to `AgreementRejected`.

#### Edge Cases & Fallbacks
- **Pickup Reschedule:** If heavy rains or harvest delays occur, the farmer can trigger `POST /api/lots/{id}/pickup/reschedule` with proposed revised dates, notifying the FPO logistics manager.

---

### 2.5 Field Quality Inspection, Assessment Grading & QR Certification

#### Operational Overview
Quality verification guarantees that millets meet stringent FSSAI and commercial standards before warehouse ingestion:
1. A certified Quality Inspector is assigned to the lot.
2. The inspector conducts on-site testing for key quality metrics:
   - **Moisture Percentage (%):** Target <= 12.0% for safe long-term grain storage.
   - **Foreign Matter / Impurities (%):** Target <= 1.0%.
   - **Damaged / Weeviled Grains (%):** Target <= 2.0%.
   - **Grain Color, Aroma & Immature Grains.**

#### Automated Grading Matrix
The .NET `QualityService` calculates grades deterministically:

| Grade | Moisture Range | Foreign Matter | Visual Criteria | Action |
| :---: | :---: | :---: | :---: | :--- |
| **Grade A** | $\le 12.0\%$ | $\le 1.0\%$ | Normal aroma, golden/uniform color | Premium rate approved, Certificate issued |
| **Grade B** | $12.1\% - 14.0\%$ | $1.1\% - 3.0\%$ | Acceptable slight discoloration | Standard rate approved with moisture deduction |
| **Grade C / Rejected** | $> 14.0\%$ | $> 3.0\%$ | Musty odor, pest damage | Lot rejected; drying/cleaning required |

#### Digital Provenance & Public QR Verification
- Upon passing, a unique Certificate is generated: `CERT-YYYYMMDD-XXXX`.
- The system embeds a cryptographic verification URL (`https://shreeanna.web/verify-certificate?id=...`).
- Anyone scanning the physical QR code on the grain bag can view the immutable test results, inspector name, GPS location of the farm, and harvest date without requiring authentication.

---

### 2.6 Logistics, Driver Dispatch & Real-Time GPS Tracking

#### Operational Overview
Logistics coordinates grain transportation from farm gates to central FPO warehouses:
1. FPO creates a `Dispatch` record assigning a registered driver and vehicle.
2. A random 6-digit **Verification Code** is securely minted and sent to the farmer's mobile screen.
3. **Pickup Verification:** When the driver arrives at the farm, they must physically collect the 6-digit code from the farmer and enter it into their app (`POST /api/dispatches/{id}/verify-pickup`). This guarantees the driver is on-site with the authorized farmer before goods are loaded.
4. **Live In-Transit Telemetry:** Once verified, the driver's app initiates background GPS publishing.
5. **Delivery Confirmation:** Upon arrival at the warehouse, the warehouse gate manager and driver inspect the seal and confirm delivery.

#### Telemetry & Map Filtering
- **GPS Telemetry Filtering:** Location points with `AccuracyMeters > 50` are filtered out to prevent erratic map jumps.
- **Route Visualization:** Both the FPO web dashboard and driver mobile app render live tracks utilizing Leaflet / CARTO map tiles.
- **Trip Abort Mechanism:** If vehicle breakdown occurs, the driver triggers `AbortRide` with a reason (e.g., "Flat tire"), alerting the FPO logistics desk to dispatch a relief vehicle.

---

### 2.7 Warehouse Receiving, Weighment Verification & Lot Allocation

#### Operational Overview
When the transport vehicle arrives at the warehouse gate:
1. The weighbridge registers Gross Vehicle Weight (truck + grain) and Tare Weight (empty truck) to determine **Net Received Quantity in Kg**.
2. Gate moisture testing verifies if grain moisture changed during transit.
3. The warehouse supervisor assigns the grain to a specific storage bin or silo (e.g., `SILO-A2`, `BIN-04`).
4. An `InventoryBatch` is created in PostgreSQL with an associated `StockMovement` audit log.

#### Capacity Guardrails
- Before lot allocation, `WarehouseService` compares `(CurrentOccupancyKg + InboundKg)` against `CapacityKg`.
- If capacity is exceeded, the API returns `400 Bad Request` with exact remaining storage capacity in Kg, preventing physical overcrowding.

---

### 2.8 Financial Settlements, FPO Margins & Razorpay Integration

#### Operational Overview
Fair, timely payment is the core value proposition of ShreeAnna:
1. Once grain is safely stored in the warehouse, the system computes the settlement:
   $$\text{Gross Amount} = \text{Actual Quantity (Kg)} \times \text{Agreed Price/Kg}$$
   $$\text{FPO Margin (e.g. 2\%)} = \text{Gross Amount} \times 0.02$$
   $$\text{Net Farmer Disbursement} = \text{Gross Amount} - \text{FPO Margin}$$
2. FPO finance officers review settlements at `/settlements`.
3. Officers click "Generate Payment Link", which calls `IRazorpayMockGatewayService`.
4. Razorpay returns an official payment short-link (`https://rzp.io/i/xxxx`).
5. Upon payment completion (or direct bank transfer UTR entry), the settlement is marked `Completed` and the farmer sees the credited status in their mobile app.

---

### 2.9 Multi-Tenant Analytics & Financial Reporting

#### Operational Overview
FPO leadership accesses executive analytics at `/reports` covering:
- **Financial Summary:** Total procurement expenditure, disbursements, pending payables, and collected FPO commission margins.
- **Volume by Millet Type:** Real-time distribution charts (Recharts) showing breakdown of Finger Millet (Ragi), Pearl Millet (Bajra), Foxtail, Kodo, and Barnyard millet.
- **Monthly Revenue & Procurement Trends:** Historical comparison tracking seasonal spikes and procurement efficiency.

---

### 2.10 Multilingual Mobile Localization (i18n)

#### Operational Overview
Recognizing that Indian farmers speak diverse regional languages, the Flutter mobile app provides full native localization in:
- **English (`en`)**
- **Hindi (`hi`) — हिन्दी**
- **Gujarati (`gu`) — ગુજરાતી**

#### Technical Implementation
- Managed through Flutter's `intl` toolchain with ARB definitions: `app_en.arb`, `app_hi.arb`, and `app_gu.arb`.
- State managed globally by `AppLanguage.instance` with persistent preferences in local device storage.
- Zero restart required: language switching updates the UI dynamically across all screens and validation messages.
