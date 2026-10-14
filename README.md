# ShreeAnna
> **Legend:** ✅ Completed · 🟡 Partially completed / prototype · ⬜ Not started

# 🌾 ShreeAnna Overall Status

| Area                                   | Status                                         | Approx. |
| -------------------------------------- | ---------------------------------------------- | ------: |
| 📱 Farmer & Driver Mobile App (Flutter)| 🟢 Feature-complete with live backend & GPS    |    ~92% |
| 💻 FPO Web Dashboard (React + Vite)    | 🟢 Multi-role portals & real payment workflows |    ~96% |
| ⚙️ .NET 10 Backend & PostgreSQL        | 🟢 Full end-to-end controllers & microservices |    ~88% |
| 🔗 Frontend ↔ Backend Integration      | 🟢 End-to-end API connected (No mock data)     |    ~90% |
| 🧪 Production-level validation/testing | 🟡 Unit/API verified, load testing pending     |    ~65% |

These percentages reflect actual functional implementations across frontend, backend, mobile, and payment gateway integration.

---

# 🚀 Getting Started & How to Run

This project consists of three main sub-systems working end-to-end:
1. **Backend:** .NET 10 Web API + Entity Framework Core + PostgreSQL (`http://localhost:5066`)
2. **Web Portal:** React 19 + Vite + Tailwind CSS + shadcn/ui (`http://localhost:5173`)
3. **Mobile App:** Flutter 3.x for Farmers & Drivers (Android / iOS)

---

## 🐳 Quick Start with Docker Compose (One-Click Setup)

You can spin up the entire backend, database, and web dashboard with Docker Compose. Environment variables and secrets are read directly from the root `.env` file.

1. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *(The default `.env` is pre-configured with local database credentials, JWT keys, and Razorpay MockGateway keys).*

2. **Build and Start All Containers:**
   ```bash
   docker compose up --build -d
   ```

3. **Verify Service Status:**
   ```bash
   docker compose ps
   ```

4. **Access Applications:**
   - **FPO Web Portal:** [http://localhost:5173](http://localhost:5173)
   - **Backend REST API & Swagger UI:** [http://localhost:5066/swagger](http://localhost:5066/swagger)
   - **PostgreSQL Database:** `localhost:5432` (`shreeanna` / `shreeanna_user`)

5. **Stop All Services:**
   ```bash
   docker compose down
   ```

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
- [**.NET 10 SDK**](https://dotnet.microsoft.com/download) (or .NET 9+)
- [**PostgreSQL 16+**](https://www.postgresql.org/download/) (or Docker)
- [**Node.js 18+ & npm**](https://nodejs.org/)
- [**Flutter SDK 3.x+**](https://docs.flutter.dev/get-started/install) with Android Studio / Xcode

---

## 🗄️ 1. Database Setup (PostgreSQL)

The backend expects PostgreSQL to be running on port `5432`.

### Option A: Local PostgreSQL
Create the user and database in `psql`:
```bash
psql -U postgres -c "CREATE USER shreeanna_user WITH PASSWORD 'shreeanna_dev';"
psql -U postgres -c "CREATE DATABASE shreeanna OWNER shreeanna_user;"
```

### Option B: Using Docker
Alternatively, spin up a PostgreSQL container in one command:
```bash
docker run --name shreeanna-pg \
  -e POSTGRES_DB=shreeanna \
  -e POSTGRES_USER=shreeanna_user \
  -e POSTGRES_PASSWORD=shreeanna_dev \
  -p 5432:5432 -d postgres:16
```

> **Note:** The database migrations and initial seed records (users, test farmers, lots, warehouses, drivers) are applied **automatically on application startup** by `DbSeeder.cs`.

---

## ⚙️ 2. Run the Backend (.NET 10 Web API)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Defaults in `appsettings.json` work out of the box for local development).*

3. Run the backend:
   ```bash
   dotnet run
   ```

4. Verify the API:
   - **Base API URL:** `http://localhost:5066`
   - **Swagger / OpenAPI Documentation:** [http://localhost:5066/swagger](http://localhost:5066/swagger)

---

## 💻 3. Run the Web Dashboard (React + Vite)

1. Open a new terminal and navigate to the website directory:
   ```bash
   cd frontend/website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   - **Portal URL:** [http://localhost:5173](http://localhost:5173)

### 🔑 Demo Login Credentials (All Portals)
The system is seeded with dedicated role accounts. **All accounts use the password:** `Password123!`

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **FPO Manager** | `fpo@shreeanna.com` | `Password123!` | Full dashboard, farmer/farm approvals, lots |
| **Accountant** | `accountant@shreeanna.com` | `Password123!` | Finance portal, settlement ledger, Razorpay payout |
| **Logistics Coordinator** | `logistics@shreeanna.com` | `Password123!` | Dispatch scheduling, driver vehicle assignment |
| **Warehouse Manager** | `warehouse@shreeanna.com` | `Password123!` | Intake receiving, lot allocation, capacity |
| **Quality Inspector** | `quality@shreeanna.com` | `Password123!` | Quality grading, moisture test, issue certificates |
| **Procurement Officer** | `procurement@shreeanna.com` | `Password123!` | Procurement contracts & pricing agreements |
| **Driver** | `driver@shreeanna.com` | `Password123!` | Web driver view |

---

## 📱 4. Run the Mobile App (Flutter)

1. Open a new terminal and navigate to the mobile app directory:
   ```bash
   cd frontend/mobile
   ```

2. (Optional) Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Install Flutter dependencies:
   ```bash
   flutter pub get
   ```

4. Check connected devices or start an Android emulator:
   ```bash
   flutter devices
   # or launch an emulator via Android Studio / command line
   ```

5. Run the application:
   ```bash
   flutter run
   ```

### 📱 Mobile Login & OTP Guide
- **Farmer Login:**
  - Enter any registered farmer phone number (e.g., `9876543210`, `9876543211`, or `8612489824`).
  - Click **Send OTP**.
  - In development mode, the 6-digit OTP is printed directly in the **Backend terminal logs** (`Development OTP for ...`). Enter the OTP to log in.
- **Driver Login:**
  - Switch to the **Driver** tab on the login screen.
  - Enter driver phone (e.g. `9876543210`) or use one-tap direct driver login.
- **Network Note:**
  - On the Android emulator, `http://10.0.2.2:5066` automatically maps to `localhost:5066` on your host machine.
  - If running on a physical Android/iOS phone over Wi-Fi, change `baseUrl` in `frontend/mobile/lib/core/network/api_config.dart` to your computer's local IP address (e.g., `http://192.168.1.X:5066`).

---

## 🌐 Summary of Ports & Services

| Service | Technology | Port / URL | Description |
| :--- | :--- | :--- | :--- |
| **Backend API** | .NET 10 | `http://localhost:5066` | Core REST API & Business Logic |
| **Swagger UI** | Swashbuckle | `http://localhost:5066/swagger` | Interactive API documentation |
| **FPO Web Portal** | React 19 + Vite | `http://localhost:5173` | Management & Staff Dashboard |
| **Mobile App** | Flutter 3.x | Emulator / Device | Farmer & Driver Native Mobile App |
| **Database** | PostgreSQL | `localhost:5432` | Primary Database (`shreeanna`) |

---

# 📱 1. FARMER & DRIVER MOBILE APP — Flutter

## Authentication & Onboarding

| Module                              | Status                           |
| ----------------------------------- | -------------------------------- |
| Farmer Login (Phone / OTP)          | ✅                               |
| Driver Login (Phone / OTP)          | ✅                               |
| Role-based App Redirection          | ✅ Farmer vs Driver view         |
| OTP Generation / Verification API   | ✅ Connected with .NET 10 API    |
| JWT Token Storage & Refresh         | ✅ Secure TokenStorage           |
| Logout & Session Invalidation       | ✅                               |

---

## 👨‍🌾 Farmer Profile & Settings

| Module                       | Status                           |
| ---------------------------- | -------------------------------- |
| Farmer profile screen        | ✅                               |
| View profile & KYC status    | ✅                               |
| Edit profile details         | ✅ EditProfileScreen             |
| Notifications Center         | ✅ Real-time NotificationsScreen |
| Privacy Policy screen        | ✅ PrivacyPolicyScreen           |
| Terms & Conditions screen    | ✅ TermsConditionsScreen         |
| Farmer details API           | ✅ Connected (`/api/farmers/{id}`)|
| Profile update API           | ✅ Connected                     |

---

## 🌱 Farm Management & Verification

| Module                             | Status                           |
| ---------------------------------- | -------------------------------- |
| Farm management screen             | ✅                               |
| Farm list & summary cards          | ✅                               |
| Farm details & crop history        | ✅                               |
| Add / Edit farm UI                 | ✅                               |
| Interactive GPS Farm Map Picker    | ✅ OpenStreetMap / Leaflet lat/lng|
| AnyRoR Survey No. submission       | ✅                               |
| Verification status tracker        | ✅ Real-time status badge        |
| Verified land parcel badge         | ✅                               |
| Backend farm CRUD & verification   | ✅ Connected (`/api/farms`)      |

---

## 📦 Procurement Lots & Farmer Journey

| Module                                 | Status                           |
| -------------------------------------- | -------------------------------- |
| Procurement lot list                   | ✅                               |
| Full Lot Journey Timeline              | ✅ Submitted → Inspection → Contract → Intake → Settled |
| Quality Inspection review card         | ✅ Moisture, Grade, Foreign matter|
| Procurement Agreement review           | ✅ Price, quantity, terms        |
| Warehouse Inward Intake status         | ✅ Weighment & Allocation receipt|
| Real-time driver dispatch tracker      | ✅ Live pickup/delivery status   |
| Fullscreen Driver Live Tracking Map    | ✅ Driver route & ETA            |

---

## 📄 Digital Document Generation & PDF Download (Offline Ready)

| Module                                      | Status                           |
| ------------------------------------------- | -------------------------------- |
| Procurement Agreement Contract PDF          | ✅ PdfGenerator binary output    |
| Quality Inspection Certificate PDF with QR  | ✅ PdfGenerator with QR code     |
| Official Warehouse Procurement Receipt PDF  | ✅ PdfGenerator inward intake    |
| Farmer Settlement Bill & Payment Voucher PDF| ✅ Complete itemized tax invoice |
| Device Downloads storage export             | ✅ DocumentDownloader utility    |

---

## 💰 Farmer Payments & Settlement Payout Details

| Module                                      | Status                           |
| ------------------------------------------- | -------------------------------- |
| Settlement Payout Details Screen            | ✅ PaymentStatusScreen           |
| Itemized calculation (Gross, 5% FPO, Freight)| ✅ Real backend calculations    |
| Final Settlement Payout amount (₹)          | ✅ Accurate rupee amount         |
| Razorpay MockGateway transaction status     | ✅ Live webhook / status sync    |
| Razorpay Receipt Link opener                | ✅ External browser launch       |
| **Download Bill Button**                    | ✅ Instant PDF generation & save |
| Backend Settlement API integration          | ✅ Connected (`/api/settlements`)|

---

## 🚚 Driver Journey & Logistics (Mobile)

| Module                                      | Status                           |
| ------------------------------------------- | -------------------------------- |
| Driver Login Screen                         | ✅ DriverLoginScreen             |
| Driver Active Dispatches list               | ✅ DriverJourneyScreen           |
| Shipment origin & destination overview      | ✅ Farmer pickup to FPO warehouse|
| Background GPS Location Publisher           | ✅ DriverLocationPublisher       |
| Fullscreen Live Navigation Map              | ✅ DriverFullscreenMapScreen     |
| Turn-by-turn route line & distance to target| ✅ Leaflet/Mapbox vector routing |
| Pickup & Delivery Geofence confirmation     | ✅ Interactive arrive/pickup btns|
| Delivery Verification OTP / Code input      | ✅ Code verification modal       |
| Driver Profile & Vehicle details            | ✅ DriverProfileScreen           |

---

# 💻 2. FPO WEBSITE / WEB DASHBOARD — React + Vite

## 📊 Role-Based Multi-Portal Architecture

The web dashboard is customized with dedicated views and permissions across roles:
1. **FPO Manager Portal** (`FpoManager`)
2. **Finance Portal** (`Accountant`)
3. **Logistics Portal** (`LogisticsCoordinator`)
4. **Warehouse Portal** (`WarehouseManager`)
5. **Quality Portal** (`QualityInspector`)

---

## 🏛️ Finance Portal (Accountant Officer)

| Module                                      | Status                           |
| ------------------------------------------- | -------------------------------- |
| Dedicated Accountant Dashboard              | ✅ AccountantDashboard.jsx       |
| Financial Stat Cards (Total, Paid, Pending) | ✅ Real settlement metrics       |
| **Settlement Queue** (Replaced farm queue)  | ✅ SettlementQueue.jsx           |
| **Revenue & Payout Chart** (Replaced donut) | ✅ RevenueChart.jsx (SVG Donut)  |
| **Recent Transactions Ledger**              | ✅ RecentTransactions.jsx        |
| **Revenue by Millet Variety Table**         | ✅ RevenueByMillet.jsx           |
| Live Razorpay Payment Modal (Card & UPI)    | ✅ RazorpayPaymentDialog.jsx     |
| **Download Bill Button** (Printable Tax Inv)| ✅ SettlementDetails.jsx         |

---

## 👨‍🌾 Farmers & Farm Verification

| Module                              | Status                           |
| ----------------------------------- | -------------------------------- |
| Farmer list & directory             | ✅ Real backend DB               |
| Search, filters, pagination         | ✅                               |
| Farmer details & farm parcels       | ✅                               |
| Farm verification queue             | ✅ FarmVerificationQueue.jsx     |
| AnyRoR revenue record verification  | ✅ Verified / Rejected workflow  |
| Verification audit notes & reasons  | ✅                               |
| Backend persistence & approval API  | ✅ Connected (`/api/farms/verify`)|

---

## 🌾 Procurement Lots & Quality Inspection

| Module                              | Status                           |
| ----------------------------------- | -------------------------------- |
| Procurement lot list & filters      | ✅ Real PostgreSQL lots          |
| Lot timeline & journey tracker      | ✅ Complete status progression   |
| Quality Inspection interface        | ✅ Moisture, Grade, Impurities   |
| Pass / Hold / Reject actions        | ✅                               |
| Digital Certificate issuance        | ✅ QR-coded verification badge   |
| Verify Certificate public portal    | ✅ VerifyCertificate.jsx         |

---

## 🏭 Warehouse & Inventory Management

| Module                                      | Status                           |
| ------------------------------------------- | -------------------------------- |
| Warehouse directory & capacity cards        | ✅ Warehouses.jsx                |
| Add Warehouse modal with Map coordinates    | ✅ WarehouseMapPicker.jsx        |
| Warehouse Inward Receiving screen           | ✅ WarehouseReceiving.jsx        |
| Quality certificate lot validation         | ✅ Only passed lots receivable   |
| Warehouse Lot Allocation & bin management   | ✅ WarehouseLotAllocation.jsx    |
| Stock Movements history & audit log         | ✅ StockMovements.jsx            |
| Real backend integration                    | ✅ Connected (`/api/warehouses`) |

---

## 🚚 Logistics & Dispatch Management

| Module                                      | Status                           |
| ------------------------------------------- | -------------------------------- |
| Logistics Dashboard (Dedicated portal)      | ✅ LogisticsDashboard.jsx        |
| Dispatch list with status filters           | ✅ Inbound & Outbound shipments  |
| Create Shipment / Dispatch wizard           | ✅ CreateShipment.jsx            |
| Vehicle & Driver Assignment modal           | ✅ Direct driver allocation      |
| Interactive Delivery Challan view & print   | ✅ DeliveryChallanModal.jsx      |
| Secure 6-digit delivery verification code   | ✅ Cryptographic validation modal|
| Real-time Driver GPS location tracking      | ✅ Live coordinates logging      |
| Backend logistics API                       | ✅ Connected (`/api/logistics`)  |

---

## 💳 Settlements & Razorpay MockGateway Integration

| Module                                      | Status                           |
| ------------------------------------------- | -------------------------------- |
| Settlement list & status filters            | ✅ Settlements.jsx               |
| Settlement Calculation & Deductions         | ✅ Gross, 5% FPO, Freight, Net   |
| Settlement Details screen                   | ✅ SettlementDetails.jsx         |
| Razorpay MockGateway payment link creation  | ✅ RazorpayMockGatewayService    |
| Card Details payment modal (Test cards)     | ✅ RazorpayPaymentDialog.jsx     |
| UPI ID payment option (Instant VPA)         | ✅ RazorpayPaymentDialog.jsx     |
| MockGateway captured status reconciliation  | ✅ Live DB update to `PAID`      |
| Automated Farmer notification on disbarment | ✅ In-app notification           |
| **Download Bill** printable invoice         | ✅ HTML & Print-to-PDF invoice   |

---

## 📈 Reports & Analytics

| Module                                 | Status                           |
| -------------------------------------- | -------------------------------- |
| Reports dashboard                      | ✅ Reports.jsx                   |
| Financial & Revenue Reports            | ✅ FPO margins & payouts         |
| Procurement aggregation by Millet type | ✅ Volume & pricing trends       |
| Inventory & Stock utilization reports  | ✅ Warehouse capacity tracking   |
| Logistics & Fulfillment reports        | ✅ Transit turnaround times      |

---

# ⚙️ 3. BACKEND — .NET 10 & PostgreSQL

## Architecture & Infrastructure

| Module                               | Status                           |
| ------------------------------------ | -------------------------------- |
| .NET 10 Web API project              | ✅                               |
| PostgreSQL 16 database               | ✅ Hosted on port 5432           |
| Entity Framework Core 10             | ✅ Code-first with Migrations    |
| JWT Authentication & Bearer Tokens   | ✅ Secure token validation       |
| Refresh Token Rotation               | ✅ Silent refresh in cookie/body |
| Role-based RBAC Authorization        | ✅ Manager, Inspector, Driver, etc.|
| Clean Feature-driven architecture    | ✅ Features/{Domain}/...         |
| Real Database Seeder                 | ✅ Initial lots, farms, drivers  |
| Swagger / OpenAPI Documentation      | ✅ Interactive docs at `/swagger`|

---

## Core Domain APIs

| Feature / Domain       | Endpoints                               | Status |
| ---------------------- | --------------------------------------- | ------ |
| **Auth**               | `/api/auth/login`, `/api/auth/refresh`  | ✅     |
| **Driver Auth**        | `/api/driver/auth/login`, `/verify-otp` | ✅     |
| **Farmers**            | `/api/farmers`, `/api/farmers/{id}`     | ✅     |
| **Farms**              | `/api/farms`, `/api/farms/verify`       | ✅     |
| **Procurement Lots**   | `/api/lots`, `/api/lots/{id}/status`    | ✅     |
| **Quality Inspection** | `/api/quality/inspect`, `/certificates` | ✅     |
| **Warehouses**         | `/api/warehouses`, `/receive`, `/allocate` | ✅  |
| **Inventory**          | `/api/inventory/movements`, `/stats`    | ✅     |
| **Logistics**          | `/api/logistics`, `/assign`, `/verify-code` | ✅ |
| **Driver GPS**         | `/api/logistics/{id}/location`          | ✅     |
| **Settlements**        | `/api/settlements`, `/create-payment-link`, `/pay` | ✅ |
| **Notifications**      | `/api/notifications`, `/mark-read`     | ✅     |
| **Dashboard**          | `/api/dashboard/stats`, `/recent-activities` | ✅ |
| **Reports**            | `/api/reports/summary`, `/finance`, `/revenue`, `/margin` | ✅ |

---

## 💳 Payment Gateway Microservice (MockGateway)

- **Service:** `RazorpayMockGatewayService.cs` implementing `IRazorpayMockGatewayService`
- **Configuration:** Stored in `.env` (`MOCKGATEWAY_BASE_URL`, `MOCKGATEWAY_KEY_ID`, `MOCKGATEWAY_KEY_SECRET`)
- **Amount Accuracy:** Exact rupee amounts passed to MockGateway avoiding 100x double-paise calculation bugs.
- **Capabilities:**
  - Automated Payment Link generation (`v1/payment_links`)
  - Hosted checkout URL integration
  - Programmatic action trigger (`/payment/action/captured`)
  - Automatic status reconciliation with PostgreSQL database

---

# 🔗 4. END-TO-END INTEGRATION STATUS

```text
========================================================================
Feature Pipeline                Backend DB   API Controller   Web   Mobile
========================================================================
Authentication & Users              ✅             ✅          ✅     ✅
Farmer Profiles                     ✅             ✅          ✅     ✅
Farm Registration & AnyRoR          ✅             ✅          ✅     ✅
Procurement Lot Lifecycle           ✅             ✅          ✅     ✅
Quality Inspection & Certificates   ✅             ✅          ✅     ✅
Procurement Agreements              ✅             ✅          ✅     ✅
Warehouse Receiving & Allocation    ✅             ✅          ✅     ✅
Stock Movements & Inventory         ✅             ✅          ✅     —
Logistics Dispatches                ✅             ✅          ✅     ✅
Driver Journey & Live GPS Tracking  ✅             ✅          ✅     ✅
Delivery Code Verification          ✅             ✅          ✅     ✅
Settlement Payouts (DBT / Card)     ✅             ✅          ✅     ✅
Razorpay MockGateway Engine         ✅             ✅          ✅     ✅
Download Bill / Voucher PDFs        ✅             ✅          ✅     ✅
In-App Notifications                ✅             ✅          ✅     ✅
Multi-Role Dashboards (Accountant)  ✅             ✅          ✅     —
========================================================================
```

---

# 🧭 Current Project State

```text
                           SHREEANNA PLATFORM
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      │                            │                            │
  MOBILE APP                  WEB PORTAL                   .NET 10 API
 (Flutter 3.x)            (React 19 + shadcn)             (PostgreSQL)
      │                            │                            │
   ~92% 🟢                      ~96% 🟢                       ~88% 🟢
  (Farmer & Driver)        (Multi-Role Portals)         (EF Core & Microservices)
```

The system operates with **zero mock or placeholder data arrays**, using live PostgreSQL models, end-to-end controllers, and real Razorpay MockGateway payment integrations across mobile and web interfaces.
