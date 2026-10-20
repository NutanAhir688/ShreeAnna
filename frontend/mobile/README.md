# ShreeAnna — Farmer & Driver Mobile App

> Native, offline-tolerant mobile application built with **Flutter 3.x** for smallholder millet farmers and transport logistics drivers across India.

---

## 🌟 Overview & Experiences

The ShreeAnna Mobile App bridges rural farmers and transporters directly to Farmer Producer Organizations (FPOs):

### 1. 👨‍🌾 Farmer Experience
- **Passwordless OTP Login:** Simple, high-trust authentication using 10-digit mobile numbers with SMS OTP verification.
- **Farm Boundary Geo-Tagging:** Interactive GPS map boundary picker using Leaflet / OpenStreetMap tiles to submit farm land parcels and cadastral survey numbers.
- **Procurement Lot Lifecycle:** Real-time visual timeline tracking grain status from `Submitted` → `Inspection` → `Agreement` → `Intake` → `Settled`.
- **1-to-1 Inspector Live Chat (`InspectorChatScreen`):** Direct support dialogue between the farmer and assigned Quality Inspector during the lot inspection phase, pre-bound to the lot code and stage context.
- **Offline PDF Generation & Export:** Instant client-side binary rendering and device download for:
  - Official Procurement Agreement Contracts
  - QR-Coded Quality Certificates
  - Warehouse Intake Receipts
  - Itemized Farmer Settlement Payout Vouchers

### 2. 🚚 Logistics Driver Experience
- **Transporter Dispatch Dashboard:** Real-time view of active procurement pickup and warehouse delivery assignments.
- **6-Digit Farmer Pickup Verification:** Cryptographic handshake requiring the driver to collect and input the farmer's on-screen code before loading grain.
- **Live Background GPS Telemetry:** Continuous location broadcasting (`/api/lots/{id}/location`) with accuracy filtering to prevent map jumps.
- **Fullscreen Turn-by-Turn Navigation:** Visual route line, estimated arrival time, and geofence arrival confirmation.

### 3. 🌐 Multilingual Localization (i18n)
Full native localization in three languages with zero-restart hot switching:
- **English (`en`)**
- **Hindi (`hi`) — हिन्दी**
- **Gujarati (`gu`) — ગુજરાતી**

---

## 🛠️ Architecture & Tech Stack

- **Framework:** Flutter 3.x / Dart 3.x
- **Architecture:** Feature-First Clean Architecture (`lib/features/{auth, farm, lots, driver, support, profile}`)
- **State Management:** Provider / ChangeNotifier with scoped models
- **Networking:** Resilient `ApiClient` with automatic fallback:
  - Maps `10.0.2.2:5066` on Android Emulator
  - Automatically falls back to `127.0.0.1:5066` or LAN IP
- **Maps:** `flutter_map` with OpenStreetMap / CARTO raster tiles
- **PDF Generation:** `pdf` and `printing` packages with QR code generation
- **Secure Storage:** `flutter_secure_storage` for JWT tokens and role claims

---

## ⚙️ Network & Backend Configuration

In `lib/core/network/api_config.dart`:
- **Android Emulator:** Automatically routes to `http://10.0.2.2:5066`.
- **Physical Device over Wi-Fi:** Set `baseUrl` to your computer's local IP (e.g. `http://192.168.1.X:5066`).
- **Production Cloud:** Points to Azure Container Apps backend.

---

## 🏃 Run & Test Commands

```bash
# Fetch dependencies
flutter pub get

# Check connected emulators/devices
flutter devices

# Run the app
flutter run

# Run unit tests
flutter test

# Build release APK for Android
flutter build apk --release
```
