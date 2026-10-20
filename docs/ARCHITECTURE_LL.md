# ShreeAnna — Low-Level Architecture & Data Flow (LLD)

> **Document Version:** 1.0.0  
> **Target Platform:** Cloud / Hybrid (.NET 10 + Flutter + React 19 + PostgreSQL)  
> **Last Updated:** October 2026  
> **Classification:** Technical Low-Level System Specification  

---

## 1. Architectural Patterns & Layering

The ShreeAnna codebase follows a strictly separated **Clean Architecture / Vertical Slice Architecture** across all three platforms:

```
[Flutter Mobile App]                   [React 19 Web Dashboard]
        │                                        │
        ▼ (ApiClient with Fallback)              ▼ (Central api.js + In-Memory Token)
        └─────────────────┬──────────────────────┘
                          │ HTTPS / JSON / Multipart
                          ▼
            [ASP.NET Core 10 Web API]
 ┌─────────────────────────────────────────────────────────┐
 │ Controllers Tier: [ApiController] Attributes            │
 │ Auth & Claims: ClaimsPrincipal / Roles Validation       │
 ├─────────────────────────────────────────────────────────┤
 │ Service Interface Tier: IFarmerService, ILotService... │
 │ Business Logic Tier: Domain Validations, Calculations   │
 ├─────────────────────────────────────────────────────────┤
 │ Data Access Tier: EF Core 10 / AppDbContext             │
 │ Database Provider: Npgsql (PostgreSQL 16+)              │
 ├─────────────────────────────────────────────────────────┤
 │ External Gateways: Azure Blob SAS, Razorpay, MSG91      │
 └─────────────────────────────────────────────────────────┘
```

---

## 2. End-to-End Data Lifecycles

### 2.1 Farmer Authentication & OTP Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (Mobile)
    participant Flutter as Flutter Auth Screen
    participant TokenStorage as TokenStorage (Secure)
    participant FarmerAuthCtrl as FarmerAuthController (.NET)
    participant FarmerAuthSvc as FarmerAuthService
    participant SendOtpSvc as SendOtpService / MSG91
    participant DB as PostgreSQL (FarmerOtps, Farmers)

    Farmer->>Flutter: Enters phone number & taps "Send OTP"
    Flutter->>FarmerAuthCtrl: POST /api/auth/farmer/send-otp { phone }
    FarmerAuthCtrl->>FarmerAuthSvc: SendOtpAsync(phone)
    FarmerAuthSvc->>DB: Query Farmers.FirstOrDefaultAsync(Phone == phone)
    alt Farmer Not Found
        FarmerAuthSvc-->>FarmerAuthCtrl: return false
        FarmerAuthCtrl-->>Flutter: 404 NotFound ("No farmer account found")
    else Farmer Found
        FarmerAuthSvc->>SendOtpSvc: Generate 4-digit OTP & Hash
        FarmerAuthSvc->>DB: Insert FarmerOtp (Phone, OtpHash, ExpiresAt: +10min)
        FarmerAuthSvc->>SendOtpSvc: Trigger MSG91 SMS Gateway
        FarmerAuthCtrl-->>Flutter: 200 OK ("OTP sent successfully")
    end

    Farmer->>Flutter: Submits 4-digit OTP
    Flutter->>FarmerAuthCtrl: POST /api/auth/farmer/verify-otp { phone, otp }
    FarmerAuthCtrl->>FarmerAuthSvc: VerifyOtpAsync(phone, otp)
    FarmerAuthSvc->>DB: Query FarmerOtp (Valid, Unused, Attempts < 3)
    FarmerAuthSvc->>DB: Mark IsUsed = true
    FarmerAuthSvc->>FarmerAuthSvc: Mint JWT Bearer Token (Claim: FarmerId, Role: "Farmer")
    FarmerAuthCtrl-->>Flutter: 200 OK { token, farmer: { id, name, code } }
    Flutter->>TokenStorage: Save accessToken, role: "farmer", farmerId
    Flutter->>Flutter: Navigate to HomeScreen
```

- **Impacted Files:**
  - Mobile: `frontend/mobile/lib/features/auth/screen/login_screen.dart`, `otp_screen.dart`, `send_otp_service.dart`, `api_client.dart`
  - Backend: `backend/Features/Auth/Controllers/FarmerAuthController.cs`, `FarmerAuthService.cs`, `FarmerOtp.cs`
  - Database: `public."FarmerOtps"`, `public."Farmers"`
- **DTOs & Models:** `SendOtpRequest(Phone)`, `VerifyOtpRequest(Phone, Otp)`, `LoginResponse(Token, Farmer)`

---

### 2.2 Farm Registration, Geo-Tagging & Azure SAS Image Upload

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (Mobile)
    participant AddFarm as AddFarmScreen (Flutter)
    participant ApiClient as ApiClient (Flutter)
    participant UploadCtrl as UploadController (.NET)
    participant AzureBlob as Azure Blob Storage (farm-images)
    participant FarmsCtrl as FarmsController (.NET)
    participant FarmSvc as FarmService
    participant DB as PostgreSQL (Farms, FarmCrops)

    Farmer->>AddFarm: Fills Survey No, Area, Soil Type, Millet Crops
    Farmer->>AddFarm: Captures GPS Location via Geolocator
    Farmer->>AddFarm: Picks Land Document / Farm Photo from Camera
    AddFarm->>ApiClient: GET /api/upload/sas?ext=jpg
    ApiClient->>UploadCtrl: GetSasToken("jpg")
    UploadCtrl-->>ApiClient: { sasUrl: "https://...blob.core.windows.net/farm-images/guid.jpg?sp=w...", permanentUrl: "https://.../guid.jpg" }
    AddFarm->>AzureBlob: HTTP PUT to sasUrl (Header: x-ms-blob-type: BlockBlob, Body: Binary)
    AzureBlob-->>AddFarm: 201 Created

    AddFarm->>ApiClient: POST /api/farmers/{farmerId}/farms { farmName, surveyNumber, areaInAcres, latitude, longitude, imageUrl, crops }
    ApiClient->>FarmsCtrl: Create(farmerId, CreateFarmRequest)
    FarmsCtrl->>FarmSvc: CreateAsync(farmerId, request)
    FarmSvc->>FarmSvc: Generate Unique FarmCode (e.g. FARM-XXXX)
    FarmSvc->>DB: Insert Farm (Status: "PendingVerification")
    FarmSvc->>DB: Insert FarmCrops (MilletType, Season, Area)
    FarmSvc->>DB: SaveChangesAsync()
    FarmSvc-->>FarmsCtrl: FarmResponse DTO
    FarmsCtrl-->>ApiClient: 201 Created { id, farmCode, status: "PendingVerification" }
    ApiClient-->>AddFarm: Success Alert -> Navigates to ManageFarmScreen
```

- **Impacted Files:**
  - Mobile: `frontend/mobile/lib/features/farm/screen/add_farm_screen.dart`, `farm_api.dart`, `api_config.dart`
  - Backend: `backend/Features/Farms/Controllers/FarmsController.cs`, `UploadController.cs`, `FarmService.cs`, `AzureBlobStorageService.cs`
  - Database: `public."Farms"`, `public."FarmCrops"`
- **DTOs & Models:** `CreateFarmRequest`, `FarmResponse`, `CreateFarmCropRequest`, `FarmCropResponse`

---

### 2.3 Procurement Lot Creation & FPO Agreement Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (Mobile)
    actor FPO as FPO Admin / Officer (Web)
    participant SellScreen as SellMilletScreen (Flutter)
    participant LotsCtrl as LotsController (.NET)
    participant LotSvc as LotService
    participant DB as PostgreSQL (ProcurementLots, Settlements)
    participant WebAgreements as Agreements.jsx (React)

    Farmer->>SellScreen: Selects Farm, Crop (e.g. Ragi), Quantity (Kg), Asking Price
    SellScreen->>LotsCtrl: POST /api/farmers/me/lots { farmId, cropType, estimatedQuantityKg, askingPricePerKg }
    LotsCtrl->>LotSvc: CreateAsync(farmerId, CreateLotRequest)
    LotSvc->>LotSvc: Generate LotNumber (LOT-YYYYMMDD-XXXX)
    LotSvc->>DB: Insert ProcurementLot (Status: "PendingAgreement")
    LotSvc-->>LotsCtrl: LotResponse DTO
    LotsCtrl-->>SellScreen: 201 Created

    FPO->>WebAgreements: Reviews Lot on FPO Dashboard
    FPO->>WebAgreements: Enters Agreed Price Per Kg & Pickup Window
    WebAgreements->>LotsCtrl: POST /api/lots/{id}/agreement/create { offeredPricePerKg, pickupDateWindow }
    LotsCtrl->>LotSvc: CreateAgreementAsync(id, request)
    LotSvc->>DB: Update ProcurementLot (AgreementOfferedPrice, Status: "PendingConsent")
    LotsCtrl-->>WebAgreements: 200 OK ("Agreement created, awaiting farmer consent")

    Farmer->>SellScreen: Opens ProcurementAgreementScreen in Mobile
    alt Farmer Accepts
        Farmer->>LotsCtrl: POST /api/lots/{id}/agreement/accept
        LotsCtrl->>LotSvc: AcceptAgreementAsync(id)
        LotSvc->>DB: Update ProcurementLot (Status: "AgreementAccepted", AgreementConsentDate: UtcNow)
        LotSvc-->>LotsCtrl: 200 OK ("Agreement accepted")
    else Farmer Rejects
        Farmer->>LotsCtrl: POST /api/lots/{id}/agreement/reject { reason }
        LotsCtrl->>LotSvc: RejectAgreementAsync(id, reason)
        LotSvc->>DB: Update ProcurementLot (Status: "AgreementRejected", RejectionReason)
    end
```

- **Impacted Files:**
  - Mobile: `frontend/mobile/lib/features/lots/screen/sell_millet_screen.dart`, `procurement_agreement_screen.dart`, `lot_api.dart`
  - Web: `frontend/website/src/features/procurement/pages/Agreements.jsx`, `CreateAgreement.jsx`
  - Backend: `backend/Features/Procurement/Controllers/LotsController.cs`, `LotService.cs`, `ProcurementLot.cs`
  - Database: `public."ProcurementLots"`
- **DTOs & Models:** `CreateLotRequest`, `FormulateAgreementRequest`, `RejectAgreementRequest`, `LotResponse`, `LotTimelineResponse`

---

### 2.4 Quality Inspection & QR Certificate Generation Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Inspector as Certified Inspector (Web)
    participant QualityWeb as QualityInspection.jsx (React)
    participant QualityCtrl as QualityController (.NET)
    participant QualitySvc as QualityService
    participant DB as PostgreSQL (Inspections, QualityCertificates, ProcurementLots)
    actor Public as Public Buyer / Auditor

    Inspector->>QualityWeb: Selects Lot for Assessment
    Inspector->>QualityWeb: Inputs Moisture (%), Foreign Matter (%), Grain Color, Pest Damage (%)
    QualityWeb->>QualityCtrl: POST /api/quality/inspections { lotId, moisturePercentage, foreignMatterPercentage, ... }
    QualityCtrl->>QualitySvc: CreateInspectionAsync(CreateInspectionRequest)
    QualitySvc->>QualitySvc: Execute Automated Grading Algorithm:
    Note over QualitySvc: Grade A: Moisture <= 12% & Impurities <= 1%<br/>Grade B: Moisture <= 14% & Impurities <= 3%<br/>Grade C: Beyond tolerance
    QualitySvc->>DB: Insert Inspection (Grade, Parameters, Passed: true/false)
    alt Inspection Passed
        QualitySvc->>QualitySvc: Mint Certificate Number (CERT-YYYYMMDD-XXXX)
        QualitySvc->>DB: Insert QualityCertificate (QRCodeUrl, IssuedDate, Grade)
        QualitySvc->>DB: Update ProcurementLot (Status: "QualityCertified", QualityGrade)
    else Inspection Failed
        QualitySvc->>DB: Update ProcurementLot (Status: "QualityRejected")
    end
    QualitySvc-->>QualityCtrl: InspectionResponse DTO
    QualityCtrl-->>QualityWeb: 200 OK

    Public->>QualityCtrl: GET /api/quality/certificates/verify/{certificateNumber}
    QualityCtrl->>QualitySvc: VerifyCertificateAsync(certificateNumber)
    QualitySvc->>DB: Query QualityCertificate + Lot + Farmer + Farm
    QualityCtrl-->>Public: 200 OK (Full Provenance, Moisture, Grain Grade & Date)
```

- **Impacted Files:**
  - Web: `frontend/website/src/features/quality/pages/QualityInspection.jsx`, `QualityManagement.jsx`, `VerifyCertificate.jsx`
  - Mobile: `frontend/mobile/lib/features/lots/screen/quality_results_screen.dart`, `quality_certificate_screen.dart`
  - Backend: `backend/Features/Quality/Controllers/QualityController.cs`, `QualityService.cs`, `Inspection.cs`, `QualityCertificate.cs`
  - Database: `public."Inspections"`, `public."QualityCertificates"`
- **DTOs & Models:** `CreateInspectionRequest`, `InspectionResponse`, `QualityCertificateResponse`

---

### 2.5 Logistics Dispatch, Driver Assignment & Live GPS Telemetry

```mermaid
sequenceDiagram
    autonumber
    actor FPO as Logistics Manager (Web)
    actor Driver as Transporter / Driver (Mobile)
    participant WebLogistics as Logistics.jsx (React)
    participant LogisticsCtrl as LogisticsController (.NET)
    participant LogisticsSvc as LogisticsService
    participant DB as PostgreSQL (Dispatches, Drivers, DriverLocationLogs)
    participant DriverMobile as DriverJourneyScreen (Flutter)
    participant LocationPub as DriverLocationPublisher (Dart)

    FPO->>WebLogistics: Clicks "Create Dispatch" for Approved Lot
    FPO->>WebLogistics: Selects Destination Warehouse & Assigned Driver
    WebLogistics->>LogisticsCtrl: POST /api/dispatches { lotId, warehouseId, driverId, vehicleNumber, scheduledPickupDate }
    LogisticsCtrl->>LogisticsSvc: CreateAsync(CreateDispatchRequest)
    LogisticsSvc->>LogisticsSvc: Generate VerificationCode (6-digit OTP) & DispatchCode (DSP-XXXX)
    LogisticsSvc->>DB: Insert Dispatch (Status: "Assigned", VerificationCode)
    LogisticsCtrl-->>WebLogistics: 201 Created

    Driver->>DriverMobile: Opens Driver Journey Tab
    DriverMobile->>LogisticsCtrl: GET /api/dispatches/driver-journey?phone={driverPhone}
    LogisticsCtrl-->>DriverMobile: Returns Active Dispatches
    Driver->>DriverMobile: Arrives at Farm, asks Farmer for 6-digit VerificationCode
    DriverMobile->>LogisticsCtrl: POST /api/dispatches/{id}/verify-pickup { verificationCode }
    LogisticsCtrl->>LogisticsSvc: VerifyPickupAsync(id, code)
    LogisticsSvc->>DB: Update Dispatch (Status: "InTransit", PickedUpAt: UtcNow)
    LogisticsCtrl-->>DriverMobile: 200 OK (Pickup Confirmed)

    loop Every 15-30 Seconds During Journey
        LocationPub->>DriverMobile: Reads GPS (Latitude, Longitude, Accuracy)
        DriverMobile->>LogisticsCtrl: POST /api/lots/{lotId}/location { latitude, longitude, accuracyMeters }
        LogisticsCtrl->>DB: Insert DriverLocationLog (Timestamp: UtcNow)
    end

    Driver->>DriverMobile: Arrives at Warehouse & taps "Confirm Delivery"
    DriverMobile->>LogisticsCtrl: POST /api/dispatches/{id}/confirm-delivery { deliveryNotes }
    LogisticsCtrl->>DB: Update Dispatch (Status: "Delivered", DeliveredAt: UtcNow)
    LogisticsCtrl-->>DriverMobile: 200 OK
```

- **Impacted Files:**
  - Mobile: `frontend/mobile/lib/features/driver/screens/driver_journey_screen.dart`, `driver_location_publisher.dart`, `driver_fullscreen_map_screen.dart`
  - Web: `frontend/website/src/features/logistics/pages/Logistics.jsx`, `CreateShipment.jsx`, `ShipmentDetails.jsx`
  - Backend: `backend/Features/Logistics/Controllers/LogisticsController.cs`, `LogisticsService.cs`, `Dispatch.cs`, `Driver.cs`, `DriverLocationLog.cs`
  - Database: `public."Dispatches"`, `public."Drivers"`, `public."DriverLocationLogs"`
- **DTOs & Models:** `CreateDispatchRequest`, `AssignDriverRequest`, `VerifyPickupRequest`, `RecordDriverLocationRequest`, `DispatchResponse`

---

### 2.6 Warehouse Ingestion, Weighment & Lot Allocation Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor WHStaff as Warehouse Staff (Web)
    participant WHWeb as WarehouseReceiving.jsx (React)
    participant WHCtrl as WarehousesController (.NET)
    participant WHSvc as WarehouseService
    participant InvSvc as InventoryService
    participant DB as PostgreSQL (Warehouses, InventoryBatches, StockMovements)

    WHStaff->>WHWeb: Inspects Delivered Truck, weighs Gross & Tare
    WHStaff->>WHWeb: Enters Received Quantity (Kg), Moisture at Gate, Storage Bin/Section
    WHWeb->>WHCtrl: POST /api/warehouses/receipts { dispatchId, lotId, warehouseId, receivedQuantityKg, moisturePercentage }
    WHCtrl->>WHSvc: CreateReceiptAsync(CreateWarehouseReceiptRequest)
    WHSvc->>DB: Check Warehouse Capacity vs Current Occupancy
    WHSvc->>DB: Insert InventoryBatch (BatchNumber, MilletType, QuantityKg, StorageBin)
    WHSvc->>InvSvc: Record StockMovement (Type: "Inward", QuantityKg, Reference: LotNumber)
    WHSvc->>DB: Update ProcurementLot (Status: "StoredInWarehouse", ActualQuantityKg)
    WHSvc-->>WHCtrl: WarehouseReceiptResponse DTO
    WHCtrl-->>WHWeb: 200 OK { receiptNumber, batchId, allocatedBin }
```

- **Impacted Files:**
  - Web: `frontend/website/src/features/warehouse/pages/WarehouseReceiving.jsx`, `WarehouseLotAllocation.jsx`, `Warehouses.jsx`
  - Backend: `backend/Features/Warehouses/Controllers/WarehousesController.cs`, `WarehouseService.cs`, `InventoryService.cs`, `Warehouse.cs`, `InventoryBatch.cs`
  - Database: `public."Warehouses"`, `public."InventoryBatches"`, `public."StockMovements"`
- **DTOs & Models:** `CreateWarehouseReceiptRequest`, `WarehouseReceiptResponse`, `AllocateLotRequest`, `LotAllocationResponse`

---

### 2.7 Settlement Generation & Razorpay Payment Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Finance as FPO Finance Officer (Web)
    participant SettleWeb as SettlementDetails.jsx (React)
    participant SettleCtrl as SettlementsController (.NET)
    participant SettleSvc as SettlementService
    participant RazorpayMock as RazorpayMockGatewayService
    participant DB as PostgreSQL (Settlements, ProcurementLots)
    actor Farmer as Farmer (Mobile)

    Finance->>SettleWeb: Reviews Verified Lot Weight & Agreed Rate
    SettleWeb->>SettleCtrl: POST /api/settlements/{id}/create-payment-link
    SettleCtrl->>SettleSvc: CreatePaymentLinkAsync(settlementId)
    SettleSvc->>RazorpayMock: CreatePaymentLinkAsync(AmountInPaise, FarmerPhone, Description)
    RazorpayMock-->>SettleSvc: { paymentLinkId: "plink_xxxx", shortUrl: "https://rzp.io/i/xxxx" }
    SettleSvc->>DB: Update Settlement (PaymentLinkId, ShortUrl, Status: "PaymentInitiated")
    SettleCtrl-->>SettleWeb: 200 OK { paymentLinkId, shortUrl }

    Finance->>SettleWeb: Triggers "Disburse Payment" (or Farmer pays via link)
    SettleWeb->>SettleCtrl: POST /api/settlements/{id}/pay { paymentMethod: "UPI_DIRECT", referenceId: "UTR123456" }
    SettleCtrl->>SettleSvc: ProcessPaymentAsync(id, request)
    SettleSvc->>RazorpayMock: VerifyOrProcessDirectTransferAsync()
    SettleSvc->>DB: Update Settlement (Status: "Completed", PaidAt: UtcNow, TransactionReference)
    SettleSvc->>DB: Update ProcurementLot (Status: "Settled")
    SettleCtrl-->>SettleWeb: 200 OK (Settlement Finalized)

    Farmer->>Farmer: Receives SMS notification & views "Paid" in PaymentStatusScreen
```

- **Impacted Files:**
  - Web: `frontend/website/src/features/settlements/pages/Settlements.jsx`, `SettlementDetails.jsx`
  - Mobile: `frontend/mobile/lib/features/lots/screen/payment_status_screen.dart`
  - Backend: `backend/Features/Settlements/Controllers/SettlementsController.cs`, `SettlementService.cs`, `RazorpayMockGatewayService.cs`, `Settlement.cs`
  - Database: `public."Settlements"`
- **DTOs & Models:** `CreatePaymentLinkResponse`, `ProcessPaymentRequest`, `SettlementResponse`, `SettlementStatsResponse`

---

### 2.8 Akka.NET Actor-Based Support Chat Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer (Mobile / Web)
    participant ChatCtrl as SupportChatController (.NET)
    participant ChatSvc as SupportChatService
    participant ActorSystem as Akka ActorSystem
    participant ChatMgr as ChatManagerActor
    participant FarmerActor as UserSessionActor (Farmer)
    participant InspectorActor as UserSessionActor (Inspector)
    actor Inspector as Quality Inspector (Web Desk)

    Farmer->>ChatCtrl: POST /api/support/chat/connect { userId, role: "Farmer", stage: "Inspection", lotId }
    ChatCtrl->>ChatSvc: ConnectSessionAsync(request)
    ChatSvc->>ChatMgr: ConnectUserSession(userId, role, metadata)
    ChatMgr->>ActorSystem: GetOrCreate child UserSessionActor(userId)
    ChatMgr-->>ChatSvc: Session Initialized
    ChatSvc-->>ChatCtrl: 200 OK (List<ChatMessageDto> history)
    ChatCtrl-->>Farmer: Connected to active support session

    Farmer->>ChatCtrl: POST /api/support/chat/send { senderId, recipientId, content, stage: "Inspection" }
    ChatCtrl->>ChatSvc: SendMessageAsync(request)
    ChatSvc->>ChatMgr: RouteChatMessage(message)
    ChatMgr->>FarmerActor: AppendMessage(message)
    ChatMgr->>InspectorActor: DeliverMessage(message, increment unread)
    InspectorActor-->>ChatMgr: Acknowledged
    ChatSvc-->>ChatCtrl: 200 OK (Updated message thread)

    Inspector->>ChatCtrl: GET /api/support/chat/sessions/active (4s Web Poll)
    ChatCtrl->>ChatSvc: GetActiveSessionsAsync()
    ChatSvc->>ChatMgr: QueryActiveSessions()
    ChatMgr-->>ChatSvc: List<ChatSessionSummaryDto> (badges, lot codes, stage tags)
    ChatSvc-->>ChatCtrl: 200 OK
    ChatCtrl-->>Inspector: Render WhatsApp-style conversation list & chat stream
```

- **Impacted Files:**
  - Mobile: `frontend/mobile/lib/features/support/screen/inspector_chat_screen.dart`, `lot_details_screen.dart`
  - Web: `frontend/website/src/features/portal/pages/Support.jsx`, `frontend/website/src/services/api.js`
  - Backend: `backend/Features/Support/Controllers/SupportChatController.cs`, `SupportChatService.cs`, `Actors/ChatManagerActor.cs`, `Actors/UserSessionActor.cs`, `Actors/SupportChatMessages.cs`
- **DTOs & Models:** `ConnectSessionRequest`, `SendMessageRequest`, `ResetSessionRequest`, `ChatMessageDto`, `ChatSessionSummaryDto`

---

### 2.9 Customer Marketplace & E-Commerce Order Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer (Web Marketplace)
    participant Catalog as LandingPage.jsx / Marketplace.jsx
    participant Cart as CartDrawer (Slide-out)
    participant OrdersCtrl as OrdersController (.NET)
    participant OrderSvc as OrderService
    participant DB as PostgreSQL (Orders, OrderItems, Products)
    actor Driver as Delivery Driver

    Customer->>Catalog: Clicks "Buy Now" on Millet Product
    Catalog->>Cart: Directly adds product item without requiring pre-login modal
    Customer->>Cart: Reviews items, inputs shipping details, clicks "Place Order"
    Cart->>OrdersCtrl: POST /api/orders (CreateOrderRequest)
    OrdersCtrl->>OrderSvc: CreateOrderAsync(request)
    OrderSvc->>OrderSvc: Generate OrderNumber (ORD-YYYYMMDD-XXXX) & 6-digit DeliveryOtp
    OrderSvc->>DB: Insert Order (Status: "Pending") + OrderItems
    OrdersCtrl-->>Cart: 201 Created (OrderResponse with delivery details)

    Note over OrdersCtrl,Driver: Driver Allocation & Dispatch
    OrdersCtrl->>OrderSvc: POST /api/orders/{id}/assign-driver (AssignOrderDriverRequest)
    OrderSvc->>DB: Update Order (AssignedDriverId, Status: "Shipped")

    Note over Customer,Driver: Physical Delivery & OTP Handshake
    Driver->>Customer: Arrives at address and requests 6-digit delivery OTP
    Customer->>Driver: Provides OTP
    Driver->>OrdersCtrl: POST /api/orders/{id}/confirm-delivery { otp }
    OrdersCtrl->>OrderSvc: ConfirmDeliveryWithOtpAsync(id, otp)
    OrderSvc->>DB: Verify OTP, mark Status: "Delivered", DeliveredAt: UtcNow
    OrdersCtrl-->>Driver: 200 OK (Delivery Confirmed)
```

- **Impacted Files:**
  - Web: `frontend/website/src/features/landing/pages/LandingPage.jsx`, `frontend/website/src/features/portal/pages/Orders.jsx`, `services/api.js`
  - Backend: `backend/Features/Orders/Controllers/OrdersController.cs`, `OrderService.cs`, `DTOs/OrderDTOs.cs`, `Order.cs`, `OrderItem.cs`
  - Database: `public."Orders"`, `public."OrderItems"`, `public."Products"`
- **DTOs & Models:** `CreateOrderRequest`, `CreateOrderItemRequest`, `AssignOrderDriverRequest`, `ConfirmDeliveryOtpRequest`, `OrderResponse`, `OrderItemResponse`

---

## 3. Database Schema & Entity Inventory

All tables are defined in PostgreSQL with standard UTC timestamps and decimal precision constraints configured in `backend/Data/AppDbContext.cs`:

| Table Name | Primary Key | Key Foreign Keys | Unique Indexes | Critical Columns |
| :--- | :--- | :--- | :--- | :--- |
| `Users` | `Id (UUID)` | `FpoMemberId (UUID)` | `Email` | `PasswordHash`, `Role`, `RefreshToken`, `RefreshTokenExpiryTime` |
| `FpoMembers` | `Id (UUID)` | — | `EmployeeCode` | `Name`, `Role`, `Designation`, `Phone` |
| `Farmers` | `Id (UUID)` | — | `FarmerCode` | `FullName`, `Phone`, `Taluka`, `Village`, `District`, `Status` |
| `FarmerOtps` | `Id (UUID)` | — | `Phone` | `OtpHash`, `ExpiresAt`, `IsUsed`, `Attempts`, `CreatedAt` |
| `Farms` | `Id (UUID)` | `FarmerId (UUID)` | `FarmCode` | `SurveyNumber`, `AreaInAcres`, `Latitude`, `Longitude`, `ImageUrl`, `Status` |
| `FarmCrops` | `Id (UUID)` | `FarmId (UUID)` | `(FarmId, CropName, Season)` | `CropName`, `Season`, `EstimatedAreaInAcres`, `Status` |
| `ProcurementLots` | `Id (UUID)` | `FarmerId`, `FarmId` | `LotNumber` | `MilletType`, `EstimatedQuantityKg`, `ActualQuantityKg`, `PricePerKg`, `Status` |
| `Inspections` | `Id (UUID)` | `LotId (UUID)` | — | `MoisturePercentage`, `ForeignMatterPercentage`, `Grade`, `Passed` |
| `QualityCertificates`| `Id (UUID)`| `LotId (UUID)` | `CertificateNumber` | `Grade`, `IssuedDate`, `QRCodeUrl`, `InspectorName` |
| `Drivers` | `Id (UUID)` | — | `Phone` | `Name`, `VehicleNumber`, `VehicleCapacityKg`, `LicenseNumber`, `Status` |
| `Dispatches` | `Id (UUID)` | `LotId`, `DriverId`, `WarehouseId` | `DispatchCode` | `VerificationCode`, `Status`, `ScheduledPickupDate`, `DeliveredAt` |
| `DriverLocationLogs` | `Id (UUID)` | `LotId (UUID)` | — | `Latitude`, `Longitude`, `AccuracyMeters`, `Timestamp` |
| `Warehouses` | `Id (UUID)` | — | `WarehouseCode`| `Name`, `CapacityKg`, `CurrentOccupancyKg`, `District`, `Pincode` |
| `InventoryBatches` | `Id (UUID)` | `WarehouseId`, `LotId`| `BatchNumber` | `MilletType`, `QuantityKg`, `StorageBin`, `QualityGrade` |
| `StockMovements` | `Id (UUID)` | `WarehouseId`, `BatchId`| — | `MovementType (Inward/Outward)`, `QuantityKg`, `Timestamp` |
| `Settlements` | `Id (UUID)` | `LotId`, `FarmerId` | `SettlementNumber` | `TotalAmount`, `FpoMarginAmount`, `NetPayableToFarmer`, `Status`, `ShortUrl` |
| `PurchaseRequests`| `Id (UUID)` | `BuyerId`, `LotId` | `RequestCode` | `RequestedQuantityKg`, `OfferedPricePerKg`, `Status` |
| `Products` | `Id (UUID)` | — | `ProductCode` | `Title`, `Category`, `Price`, `AvailableQuantity`, `ProducerName`, `ImageUrl` |
| `Orders` | `Id (UUID)` | `AssignedDriverId` | `OrderNumber` | `CustomerName`, `CustomerEmail`, `CustomerPhone`, `ShippingAddress`, `Status`, `DeliveryOtp`, `TotalAmount` |
| `OrderItems` | `Id (UUID)` | `OrderId (UUID)` | — | `ProductId`, `ProductTitle`, `UnitPrice`, `Quantity`, `TotalPrice` |

---

## 4. API Endpoints Comprehensive Registry

| HTTP Verb | Route | Auth Role | Controller | Primary DTOs |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Anonymous | `AuthController` | `LoginRequest` → `LoginResponse` |
| `POST` | `/api/auth/refresh` | Anonymous (Cookie) | `AuthController` | None → `LoginResponse` |
| `POST` | `/api/auth/register-customer` | Anonymous | `AuthController` | `RegisterCustomerRequest` → `LoginResponse` |
| `POST` | `/api/auth/farmer/send-otp` | Anonymous | `FarmerAuthController` | `SendOtpRequest` → Status |
| `POST` | `/api/auth/farmer/verify-otp` | Anonymous | `FarmerAuthController` | `VerifyOtpRequest` → `LoginResponse` |
| `GET` | `/api/farmers` | Authorized | `FarmersController` | None → `List<FarmerResponse>` |
| `POST` | `/api/farmers` | Authorized | `FarmersController` | `CreateFarmerRequest` → `FarmerResponse` |
| `GET` | `/api/upload/sas` | Authorized | `UploadController` | `?ext=jpg` → `{ sasUrl, permanentUrl }` |
| `POST` | `/api/upload` | Authorized | `UploadController` | Multipart `file` → `{ url }` |
| `GET` | `/api/lots` | Anonymous / Auth | `LotsController` | None → `List<LotResponse>` |
| `POST` | `/api/farmers/me/lots` | Farmer | `LotsController` | `CreateLotRequest` → `LotResponse` |
| `POST` | `/api/lots/{id}/agreement/create` | FPO Officer | `LotsController` | `FormulateAgreementRequest` → Status |
| `POST` | `/api/lots/{id}/agreement/accept` | Farmer | `LotsController` | None → Status |
| `POST` | `/api/lots/{id}/agreement/reject` | Farmer | `LotsController` | `RejectAgreementRequest` → Status |
| `POST` | `/api/quality/inspections` | QualityInspector | `QualityController` | `CreateInspectionRequest` → `InspectionResponse` |
| `GET` | `/api/quality/certificates/verify/{no}` | Anonymous | `QualityController` | None → `QualityCertificateResponse` |
| `POST` | `/api/dispatches` | FPO Officer | `LogisticsController` | `CreateDispatchRequest` → `DispatchResponse` |
| `POST` | `/api/dispatches/{id}/assign-driver`| FPO Officer | `LogisticsController`| `AssignDriverRequest` → `DispatchResponse` |
| `POST` | `/api/dispatches/{id}/verify-pickup`| Driver / Anonymous| `LogisticsController`| `VerifyPickupRequest` → `DispatchResponse` |
| `POST` | `/api/lots/{lotId}/location` | Driver | `LotsController` | `RecordDriverLocationRequest` → Status |
| `POST` | `/api/warehouses/receipts` | WarehouseManager | `WarehousesController` | `CreateWarehouseReceiptRequest` → Response |
| `POST` | `/api/settlements/{id}/create-payment-link` | FPO / Accountant | `SettlementsController` | None → `CreatePaymentLinkResponse` |
| `POST` | `/api/settlements/{id}/pay` | FPO / Accountant | `SettlementsController` | `ProcessPaymentRequest` → `SettlementResponse` |
| `GET` | `/api/reports/summary` | Authorized | `ReportsController` | None → `ReportsSummaryResponse` |
| `GET` | `/api/reports/margin` | Authorized | `ReportsController` | None → `FpoMarginReportResponse` |
| `GET` | `/api/marketplace/products` | Anonymous | `MarketplaceController`| None → `List<ProductResponse>` |
| `POST` | `/api/orders` | Anonymous / Customer | `OrdersController` | `CreateOrderRequest` → `OrderResponse` |
| `GET` | `/api/orders` | Anonymous / Customer | `OrdersController` | `?email=...` → `List<OrderResponse>` |
| `GET` | `/api/orders/{id}` | Anonymous / Customer | `OrdersController` | None → `OrderResponse` |
| `POST` | `/api/orders/{id}/assign-driver` | FPO / Logistics | `OrdersController` | `AssignOrderDriverRequest` → `OrderResponse` |
| `POST` | `/api/orders/{id}/confirm-delivery`| Anonymous / Driver | `OrdersController` | `ConfirmDeliveryOtpRequest` → `OrderResponse` |
| `POST` | `/api/support/chat/connect` | Authorized / Public | `SupportChatController`| `ConnectSessionRequest` → `List<ChatMessageDto>` |
| `POST` | `/api/support/chat/send` | Authorized / Public | `SupportChatController`| `SendMessageRequest` → `List<ChatMessageDto>` |
| `GET` | `/api/support/chat/sessions/{id}/messages`| Authorized / Public| `SupportChatController`| None → `List<ChatMessageDto>` |
| `GET` | `/api/support/chat/sessions/active`| Authorized / Staff | `SupportChatController`| None → `List<ChatSessionSummaryDto>` |
| `POST` | `/api/support/chat/reset` | Authorized / Public | `SupportChatController`| `ResetSessionRequest` → Status |
