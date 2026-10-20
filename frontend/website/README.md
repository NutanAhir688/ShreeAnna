# ShreeAnna — Web Dashboard & Customer Marketplace

> Modern, multi-role FPO operations platform and consumer millet marketplace built with **React 19**, **Vite**, **Tailwind CSS**, and **shadcn/ui**.

---

## 🌟 Overview & Key Portals

The ShreeAnna Web Application serves as the mission control center for Farmer Producer Organizations (FPOs), institutional processors, and retail consumers:

1. **FPO Manager Portal (`FpoManager`):** Farmer & farm cadastral verification, lot pricing agreements, warehouse intake approvals, and system oversight.
2. **Finance Portal (`Accountant`):** Financial dashboard, settlement queues, Razorpay MockGateway payouts, and printable GST tax invoices.
3. **Logistics Portal (`LogisticsCoordinator`):** Driver and vehicle assignment, dispatch creation, delivery challan generation, and live GPS tracking.
4. **Warehouse Portal (`WarehouseManager`):** Gate weighbridge intake, capacity management, storage bin allocation, and stock movement logs.
5. **Quality Portal (`QualityInspector`):** Inspection grading (moisture, impurities), digital QR certificate issuance, and live support chat.
6. **Customer Portal & Marketplace (`Customer`):** Direct consumer millet shopping, slide-out cart drawer, order tracking, and delivery OTP handshake.

---

## 🚀 Key Implementations & Highlights

### 1. WhatsApp-Style Support Desk (`Support.jsx`)
- Built with **shadcn/ui** and **Akka.NET Actor** backend integration.
- Two-pane layout:
  - **Left Pane:** Real-time conversation queue with farmer names, lot codes, stage badges, and dynamic unread counter badges.
  - **Right Pane:** Chronological message stream with sender bubble styling, timestamps, and auto-scrolling input box.
- Background polling every 4 seconds via `/api/support/chat/sessions/active`.

### 2. Frictionless Shopping & Cart Drawer
- **No Premature Login Wall:** Clicking "Buy Now" on any product in the marketplace directly adds it to the cart drawer without requiring login.
- **Customer Registration Guardrail:** "Create Account" under the login modal invokes `POST /api/auth/register-customer`, strictly preventing unauthorized role elevation.
- **Order Tracking:** Real-time order status tracking with customer-side 6-digit delivery OTP verification.

### 3. Universal Settings, Support & Profile
- Every role (`Admin`, `FpoAdmin`, `QualityInspector`, `WarehouseManager`, `LogisticsCoordinator`, `Accountant`, `Customer`) has dedicated routes:
  - `/portal/settings` — Notification preferences and security settings.
  - `/portal/support` — Live support desk tailored to the role.
  - `/portal/profile` — User credentials, employee code, and department.

### 4. Zero-CSRF In-Memory Authentication
- Access tokens are stored purely in JavaScript memory closure.
- Refresh tokens are stored in HttpOnly, SameSite cookies.
- Automatic 401 interception in `src/services/api.js` refreshes the token transparently and retries requests once before redirecting to `/login`.

---

## 🛠️ Tech Stack & UI Components

- **Runtime & Bundler:** Vite 6 + React 19
- **Styling:** Tailwind CSS + CSS Modules
- **UI Component Primitives:** [shadcn/ui](https://ui.shadcn.com/) (Dialog, Tabs, Badge, Card, Sheet, ScrollArea, Avatar)
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Revenue charts, settlement trends, inventory breakdown)
- **Maps:** Leaflet / OpenStreetMap / CARTO raster tiles for boundary and route visualization

---

## ⚙️ Environment Variables

Create `.env` in `frontend/website`:
```env
VITE_API_BASE_URL=http://localhost:5066
```

---

## 🏃 Run & Build Commands

```bash
# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev

# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
