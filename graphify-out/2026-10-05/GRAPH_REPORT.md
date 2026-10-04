# Graph Report - ShreeAnna  (2026-10-05)

## Corpus Check
- 339 files · ~349,299 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3528 nodes · 6271 edges · 159 communities (131 shown, 25 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 150 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ad2a8b85`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app_localizations.dart
- app_localizations_hi.dart
- app_localizations_en.dart
- app_localizations_gu.dart
- lot_api.dart
- LotResponse
- Inspection
- Dispatch
- card.jsx
- ref_lucide_react
- farm_api.dart
- StockMovements.jsx
- User
- backend.Migrations
- api_config.dart
- GeneratedPluginRegistrant.swift
- my_lots_screen.dart
- InventoryBatch
- add_farm_screen.dart
- ref_react
- lot_model.dart
- ProcurementLot
- AuthTestController
- microsoft_aspnetcore_authorization
- manage_farm_screen.dart
- lot_details_screen.dart
- profile_screen.dart
- my_application.cc
- AppDbContext
- farm.dart
- FarmResponse
- registration_screen.dart
- sell_millet_screen.dart
- home_screen.dart
- AppDbContext.cs
- backend.Data
- Farm
- login_screen.dart
- StockMovementResponse
- QualityManagement.jsx
- MarketplaceListingDetails.jsx
- farm_management_screen.dart
- otp_screen.dart
- FarmsController
- pickup_delivery_screen.dart
- components.json
- README.md
- Win32Window
- ProcurementLotDetails.jsx
- CreateFarmRequest
- FarmersController
- devDependencies
- procurement_agreement_screen.dart
- backend.Features.Farmers.Entities
- Farmer
- win32_window.cpp
- Reports.jsx
- dependencies
- api.js
- Warehouse
- FarmerResponse
- ShipmentIssue
- FpoMember
- http
- farmer.dart
- UpdateFarmerRequest
- FarmService
- Topbar.jsx
- pages/FarmVerification.jsx
- RecentActivityResponse
- backend.csproj
- State
- FarmCrop
- UpdateFarmRequest
- CreateShipment
- utils.cpp
- ControllerBase
- .BuildTargetModel
- .Login
- CurrentUserResponse
- AuthService
- FarmerService
- LoginRequest
- AddShipmentFields
- OtpService
- IFarmService
- 4. Enums
- manifest.json
- MessageHandler
- MessageHandler
- LoginResponse
- FarmerOtp
- CreateFarmerRequest
- .BuildTargetModel
- 20260909102228_AddMilltetypeInFarm.Designer.cs
- 20261003172849_AddAgreementFields.Designer.cs
- package.json
- IFarmerService
- 20260906102828_AddFarmerAndFarm.Designer.cs
- .SeedAsync
- vite.config.js
- AppLocalizations
- AppDbContextModelSnapshot.cs
- windows/flutter/generated_plugin_registrant.cc
- eslint.config.js
- .Up
- .Up
- .Up
- .Up
- .Up
- .Up
- compilerOptions
- warehouse_receipt_screen.dart
- sheet.jsx
- 20261004170546_AddReportIssue.Designer.cs
- AddFarmerUpdatedAt
- Contributor Covenant Code of Conduct
- AppRoutes.jsx
- JwtOptions
- pdf_generator.dart
- Point
- FlutterActivity
- class-variance-authority
- 20260906035914_InitialCreate.Designer.cs
- cn
- @fontsource-variable/geist
- Runner-Bridging-Header.h
- windows/flutter/generated_plugin_registrant.h
- cn
- recharts
- .BuildTargetModel
- @shreeanna
- DateTime?
- Farm?
- FarmCrop?
- Farmer
- List
- String?
- React + Vite
- rules/graphify.md
- shreeanna
- workflows/graphify.md
- LaunchImage.imageset/README.md
- react
- react-dom
- shadcn
- tailwindcss
- tw-animate-css
- .BuildTargetModel
- utils.js
- .BuildTargetModel
- AuthContext.jsx
- Sidebar.jsx
- .BuildTargetModel
- system_componentmodel_dataannotations
- FarmerAuthService

## God Nodes (most connected - your core abstractions)
1. `AppDbContext` - 57 edges
2. `Card()` - 53 edges
3. `CardContent()` - 53 edges
4. `Button()` - 49 edges
5. `CardHeader()` - 45 edges
6. `CardTitle()` - 45 edges
7. `cn()` - 45 edges
8. `ProcurementLot` - 44 edges
9. `FarmResponse` - 43 edges
10. `Dispatch` - 38 edges

## Surprising Connections (you probably didn't know these)
- `OnCreate` --calls--> `RegisterPlugins()`  [INFERRED]
  frontend/mobile/windows/runner/flutter_window.h → frontend/mobile/windows/flutter/generated_plugin_registrant.cc
- `wWinMain()` --calls--> `CreateAndAttachConsole()`  [INFERRED]
  frontend/mobile/windows/runner/main.cpp → frontend/mobile/windows/runner/utils.cpp
- `Win32Window::Win32Window()` --calls--> `Destroy`  [INFERRED]
  frontend/mobile/windows/runner/win32_window.cpp → frontend/mobile/windows/runner/win32_window.h
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  frontend/website/src/components/ui/dropdown-menu.jsx → frontend/website/src/lib/utils.js
- `DropdownMenuRadioItem()` --calls--> `cn()`  [EXTRACTED]
  frontend/website/src/components/ui/dropdown-menu.jsx → frontend/website/src/lib/utils.js

## Import Cycles
- None detected.

## Communities (159 total, 25 thin omitted)

### Community 0 - "app_localizations.dart"
Cohesion: 0.01
Nodes (185): app_localizations_en.dart, app_localizations_gu.dart, app_localizations_hi.dart, class, acceptAgreement, account, accountStatus, activeLots (+177 more)

### Community 1 - "app_localizations_hi.dart"
Cohesion: 0.01
Nodes (170): acceptAgreement, account, accountStatus, activeLots, addFarm, addFarmTitle, addFirstFarm, address (+162 more)

### Community 2 - "app_localizations_en.dart"
Cohesion: 0.01
Nodes (170): app_localizations.dart, acceptAgreement, account, accountStatus, activeLots, addFarm, addFarmTitle, addFirstFarm (+162 more)

### Community 3 - "app_localizations_gu.dart"
Cohesion: 0.01
Nodes (170): acceptAgreement, account, accountStatus, activeLots, addFarm, addFarmTitle, addFirstFarm, address (+162 more)

### Community 4 - "lot_api.dart"
Cohesion: 0.12
Nodes (15): acceptAgreement, _apiClient, createLot, _extractErrorMessage, _extractList, _extractMap, getLotById, getLotTimeline (+7 more)

### Community 5 - "LotResponse"
Cohesion: 0.10
Nodes (30): LotsController, ActionResult, Authorize, Guid, HttpGet, HttpPost, IActionResult, List (+22 more)

### Community 6 - "Inspection"
Cohesion: 0.06
Nodes (48): QualityController, ActionResult, AllowAnonymous, Authorize, Guid, HttpGet, HttpPost, List (+40 more)

### Community 7 - "Dispatch"
Cohesion: 0.05
Nodes (59): LogisticsController, UpdateDispatchStatusRequest, ActionResult, Guid, HttpGet, HttpPatch, HttpPost, List (+51 more)

### Community 8 - "card.jsx"
Cohesion: 0.12
Nodes (20): Badge(), badgeVariants, Card(), CardContent(), CardHeader(), CardTitle(), CertificationSummary(), InspectionResultCard() (+12 more)

### Community 9 - "ref_lucide_react"
Cohesion: 0.05
Nodes (34): BuyerFilters(), BuyerStats(), BuyerTable(), Buyers(), FarmsByDistrict(), FarmVerificationQueue(), RecentActivity(), StatCard() (+26 more)

### Community 10 - "farm_api.dart"
Cohesion: 0.05
Nodes (42): ../../../core/network/api_config.dart, dart:convert, dart:io, ApiClient, _checkUnauthorized, delete, _headers, navigatorKey (+34 more)

### Community 11 - "StockMovements.jsx"
Cohesion: 0.27
Nodes (4): ReceiveStockForm(), getMovementStyle(), StockMovementTable(), StockMovements()

### Community 12 - "User"
Cohesion: 0.05
Nodes (40): azure_storage, azure_storage_blobs, azure_storage_blobs_models, azure_storage_sas, User, CreatedAt, Email, FpoMember (+32 more)

### Community 13 - "backend.Migrations"
Cohesion: 0.16
Nodes (17): AddCoreEntities, MigrationBuilder, FixFarmerAndFarm, MigrationBuilder, UpdateFarmAndFarmerFields, AddFarmerOtp, AddProcurementLots, AddRefreshToken (+9 more)

### Community 14 - "api_config.dart"
Cohesion: 0.04
Nodes (45): ChangeNotifier, FlutterSecureStorage, AppLanguage, changeLanguage, instance, _languageKey, loadLanguage, _locale (+37 more)

### Community 15 - "GeneratedPluginRegistrant.swift"
Cohesion: 0.05
Nodes (30): Any, Cocoa, file_selector_macos, Flutter, flutter_secure_storage_darwin, FlutterAppDelegate, FlutterImplicitEngineBridge, FlutterImplicitEngineDelegate (+22 more)

### Community 16 - "my_lots_screen.dart"
Cohesion: 0.11
Nodes (18): ../../farmers/services/farmer_api.dart, _buildDetail, _buildLotCard, createState, _errorMessage, _farmerApi, _formatStatusText, _getStatusBg (+10 more)

### Community 17 - "InventoryBatch"
Cohesion: 0.06
Nodes (48): InventoryBatch, BatchCode, Grade, Id, Lot, LotId, MilletType, QuantityInKg (+40 more)

### Community 18 - "add_farm_screen.dart"
Cohesion: 0.05
Nodes (41): File?, _addCrop, areaController, _askLocationAndCapture, build, createState, _cropEntries, _CropEntry (+33 more)

### Community 19 - "ref_react"
Cohesion: 0.17
Nodes (24): Button(), buttonVariants, Checkbox, Input(), Label(), Select(), SelectContent(), SelectItem() (+16 more)

### Community 20 - "lot_model.dart"
Cohesion: 0.05
Nodes (41): actualQuantityKg, agreedQuantityKg, agreementVersion, assignedInspectorName, assignedInspectorPhone, completedAt, currentStatus, description (+33 more)

### Community 21 - "ProcurementLot"
Cohesion: 0.06
Nodes (36): ProcurementLot, ActualQuantityKg, AgreedQuantityKg, AgreementVersion, AssignedInspectorId, AssignedInspectorName, AssignedInspectorPhone, CreatedAt (+28 more)

### Community 22 - "AuthTestController"
Cohesion: 0.52
Nodes (4): AuthTestController, Authorize, HttpGet, IActionResult

### Community 23 - "microsoft_aspnetcore_authorization"
Cohesion: 0.14
Nodes (15): Roles, DashboardController, backend.Features.Farmers.Controllers, backend.Features.Auth, backend.Features.Warehouses.DTOs, backend.Features.Warehouses.Controllers, backend.Features.Dashboard.Controllers, backend.Features.Auth.Controllers (+7 more)

### Community 24 - "manage_farm_screen.dart"
Cohesion: 0.09
Nodes (23): ../data/farm_api.dart, _areaController, build, _buildLabel, createState, dispose, _districtController, farm (+15 more)

### Community 25 - "lot_details_screen.dart"
Cohesion: 0.05
Nodes (36): LotTimelineModel, _buildAgreementNotificationBanner, _buildCompactAgreementCard, _buildCompactDriverCard, _buildCompactInspectorCard, _buildDetailRow, _buildDivider, _buildInfo (+28 more)

### Community 26 - "profile_screen.dart"
Cohesion: 0.05
Nodes (41): ../../auth/screen/welcome_screen.dart, core/localization/app_language.dart, core/network/api_client.dart, core/storage/token_storage.dart, ../../farmers/models/farmer.dart, features/auth/screen/welcome_screen.dart, features/home/screens/home_screen.dart, build (+33 more)

### Community 27 - "my_application.cc"
Cohesion: 0.07
Nodes (27): file_selector_plugin, FlPluginRegistry, flutter_linux, flutter_secure_storage_linux_plugin, FlView, fl_register_plugins(), main(), first_frame_cb() (+19 more)

### Community 28 - "AppDbContext"
Cohesion: 0.10
Nodes (24): AppDbContext, Dispatches, FarmCrops, FarmerOtps, Farmers, Farms, FpoMembers, Inspections (+16 more)

### Community 29 - "farm.dart"
Cohesion: 0.07
Nodes (29): bool get, areaInAcres, createdAt, cropName, crops, district, estimatedAreaInAcres, expectedHarvestDate (+21 more)

### Community 30 - "FarmResponse"
Cohesion: 0.07
Nodes (30): FarmCropResponse, CropName, EstimatedAreaInAcres, ExpectedHarvestDate, Id, Season, SowingDate, Status (+22 more)

### Community 31 - "registration_screen.dart"
Cohesion: 0.07
Nodes (29): FormState, _addressController, build, _buildLabel, createState, dispose, _districts, _dobController (+21 more)

### Community 32 - "sell_millet_screen.dart"
Cohesion: 0.07
Nodes (28): ../../farm/data/farm_api.dart, ../../farm/model/farm.dart, build, _buildLabel, createState, _descriptionController, dispose, _farmApi (+20 more)

### Community 33 - "home_screen.dart"
Cohesion: 0.07
Nodes (27): ../../farm/screen/farm_management_screen.dart, build, _buildActiveLotsCard, _buildBottomNavigationBar, _buildLotCard, createState, _farmer, _farmerApi (+19 more)

### Community 34 - "AppDbContext.cs"
Cohesion: 0.21
Nodes (7): backend.Features.Fpo.Entities, backend.Features.Warehouses.Entities, backend.Features.Auth.Entities, backend.Features.Inventory.Entities, backend.Features.Quality.Entities, backend.Features.Logistics.Entities, backend.Features.Procurement.Entities

### Community 35 - "backend.Data"
Cohesion: 0.12
Nodes (18): backend.Features.Farms.Services, backend.Features.Quality.DTOs, backend.Infrastructure.Authentication, backend.Features.Procurement.DTOs, backend.Features.Auth.DTOs, backend.Data, backend.Features.Farmers.Services, backend.Features.Auth.Services (+10 more)

### Community 36 - "Farm"
Cohesion: 0.08
Nodes (25): Farm, AreaInAcres, CreatedAt, Crops, District, FarmCode, Farmer, FarmerId (+17 more)

### Community 37 - "login_screen.dart"
Cohesion: 0.08
Nodes (24): build, createState, dispose, _farmerAuthApi, _isLoading, _mobileController, _sendOtp, build (+16 more)

### Community 38 - "StockMovementResponse"
Cohesion: 0.15
Nodes (18): InventoryController, ActionResult, HttpGet, HttpPost, List, Task, CreateStockMovementRequest, InventoryBatchResponse (+10 more)

### Community 39 - "QualityManagement.jsx"
Cohesion: 0.25
Nodes (11): Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow(), procurementData, getStatusVariant() (+3 more)

### Community 40 - "MarketplaceListingDetails.jsx"
Cohesion: 0.14
Nodes (10): BuyerOrders(), ListingCertificate(), ListingOverview(), ListingSource(), MarketplaceFilters(), MarketplaceStats(), MarketplaceTable(), Marketplace() (+2 more)

### Community 41 - "farm_management_screen.dart"
Cohesion: 0.04
Nodes (59): add_farm_screen.dart, ../../../app/theme.dart, farm_screen.dart, WelcomeScreen, _apiClient, _buildFarmAction, createState, deleteFarm (+51 more)

### Community 42 - "otp_screen.dart"
Cohesion: 0.09
Nodes (23): dart:async, build, _buildOtpBox, _controllers, createState, dispose, _distributePastedOtp, _farmerAuthApi (+15 more)

### Community 43 - "FarmsController"
Cohesion: 0.25
Nodes (12): FarmsController, ActionResult, Authorize, Guid, HttpDelete, HttpGet, HttpPatch, HttpPost (+4 more)

### Community 44 - "pickup_delivery_screen.dart"
Cohesion: 0.11
Nodes (18): build, _buildDriverAndTransitCard, _detailLabel, driverName, driverPhone, farmName, lotId, milletName (+10 more)

### Community 45 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 46 - "README.md"
Cohesion: 0.04
Nodes (48): 📱 1. FARMER MOBILE APP — Flutter, 💻 2. FPO WEBSITE / WEB DASHBOARD — React, ⚙️ 3. BACKEND — .NET 10, 🔗 4. API INTEGRATION STATUS, Authentication, 🔐 Authentication, ⚙️ Backend Overall, 🏢 Buyers (+40 more)

### Community 47 - "Win32Window"
Cohesion: 0.17
Nodes (17): FlutterWindow, flutter_controller_, OnCreate, OnDestroy, project_, DartProject, HWND, Win32Window (+9 more)

### Community 48 - "ProcurementLotDetails.jsx"
Cohesion: 0.14
Nodes (11): AssignInspectorModal(), formatDate(), formatDateTime(), formatStatusLabel(), InspectorTrackingCard(), LotInformationCard(), LotStatus(), ProcurementLotDetails() (+3 more)

### Community 49 - "CreateFarmRequest"
Cohesion: 0.10
Nodes (20): CreateFarmCropRequest, CropName, EstimatedAreaInAcres, ExpectedHarvestDate, Season, SowingDate, DateTime, CreateFarmRequest (+12 more)

### Community 50 - "FarmersController"
Cohesion: 0.22
Nodes (12): FarmersController, ActionResult, AllowAnonymous, Authorize, Guid, HttpGet, HttpPatch, HttpPost (+4 more)

### Community 51 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+11 more)

### Community 52 - "procurement_agreement_screen.dart"
Cohesion: 0.03
Nodes (70): ../../../core/utils/document_downloader.dart, ../../../core/utils/pdf_generator.dart, CustomPainter, _acceptAgreement, _buildVersionHistoryList, _cert, createState, _docBreakdownRow (+62 more)

### Community 54 - "Farmer"
Cohesion: 0.11
Nodes (18): Farmer, Address, CreatedAt, DateOfBirth, District, Email, FarmerCode, Farms (+10 more)

### Community 55 - "win32_window.cpp"
Cohesion: 0.16
Nodes (15): dwmapi, wchar_t, Scale(), Create, Destroy, SetQuitOnClose, Show, UpdateTheme (+7 more)

### Community 56 - "Reports.jsx"
Cohesion: 0.16
Nodes (9): BuyerPerformance(), InventoryOverview(), ProcurementOverview(), ReportFilters(), ReportStats(), SalesOverview(), Reports(), reportsApi (+1 more)

### Community 57 - "dependencies"
Cohesion: 0.12
Nodes (17): axios, clsx, dependencies, axios, clsx, leaflet, lucide-react, radix-ui (+9 more)

### Community 58 - "api.js"
Cohesion: 0.05
Nodes (26): FarmerActivity(), FarmerDetails(), FarmerFarms(), FarmerFilters(), FarmerProcurement(), FarmerProfile(), FarmerStats(), FarmerTable() (+18 more)

### Community 59 - "Warehouse"
Cohesion: 0.11
Nodes (19): Warehouse, CapacityInTons, ContactPhone, CreatedAt, District, Id, Latitude, Location (+11 more)

### Community 60 - "FarmerResponse"
Cohesion: 0.12
Nodes (17): FarmerResponse, Address, CreatedAt, DateOfBirth, District, Email, FarmCount, FarmerCode (+9 more)

### Community 61 - "ShipmentIssue"
Cohesion: 0.12
Nodes (17): ShipmentIssue, AttachmentUrlsJson, DetailedDescription, DispatchId, DriverName, FarmerName, Id, IncidentDateTime (+9 more)

### Community 62 - "FpoMember"
Cohesion: 0.12
Nodes (16): FpoMember, AssignedArea, Department, Email, EmployeeCode, Id, JoinedDate, Location (+8 more)

### Community 63 - "http"
Cohesion: 0.13
Nodes (15): ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, applicationUrl, commandName (+7 more)

### Community 64 - "farmer.dart"
Cohesion: 0.12
Nodes (15): address, createdAt, dateOfBirth, district, email, farmCount, Farmer, farmerCode (+7 more)

### Community 65 - "UpdateFarmerRequest"
Cohesion: 0.13
Nodes (11): UpdateFarmerRequest, Address, DateOfBirth, District, Email, FullName, Phone, Taluka (+3 more)

### Community 66 - "FarmService"
Cohesion: 0.32
Nodes (5): FarmService, Farm, Guid, List, Task

### Community 67 - "Topbar.jsx"
Cohesion: 0.16
Nodes (11): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+3 more)

### Community 68 - "pages/FarmVerification.jsx"
Cohesion: 0.17
Nodes (13): Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle(), LandRecordVerification(), SubmittedFarmDetails() (+5 more)

### Community 69 - "RecentActivityResponse"
Cohesion: 0.14
Nodes (12): ActionResult, HttpGet, List, Task, RecentActivityResponse, CreatedAt, Status, Subtitle (+4 more)

### Community 70 - "backend.csproj"
Cohesion: 0.15
Nodes (12): net10.0, Azure.Storage.Blobs (12.29.2), BCrypt.Net-Next (4.2.0), DotNetEnv (3.1.1), Microsoft.AspNetCore.Authentication.JwtBearer (10.0.11), Microsoft.AspNetCore.OpenApi (10.0.11), Microsoft.EntityFrameworkCore (10.0.11), Microsoft.EntityFrameworkCore.Design (10.0.11) (+4 more)

### Community 71 - "State"
Cohesion: 0.20
Nodes (14): LoginScreen, _LoginScreenState, AddFarmScreen, _AddFarmScreenState, FarmManagementScreen, _FarmManagementScreenState, LotDetailsScreen, _LotDetailsScreenState (+6 more)

### Community 72 - "FarmCrop"
Cohesion: 0.15
Nodes (13): FarmCrop, CreatedAt, CropName, EstimatedAreaInAcres, ExpectedHarvestDate, Farm, FarmId, Id (+5 more)

### Community 73 - "UpdateFarmRequest"
Cohesion: 0.15
Nodes (13): UpdateFarmRequest, AreaInAcres, Crops, District, FarmName, ImageUrl, Latitude, Longitude (+5 more)

### Community 74 - "CreateShipment"
Cohesion: 0.60
Nodes (5): calculateDistanceKm(), CreateShipment(), fetchAgreements(), formatCoords(), ShipmentWarehouseMap()

### Community 75 - "utils.cpp"
Cohesion: 0.13
Nodes (17): dart_project, flutter_view_controller, flutter_windows, wWinMain(), string, wchar_t, CreateAndAttachConsole(), GetCommandLineArguments() (+9 more)

### Community 76 - "ControllerBase"
Cohesion: 0.23
Nodes (9): FarmerAuthController, ActionResult, AllowAnonymous, Authorize, HttpGet, HttpPost, IActionResult, Task (+1 more)

### Community 77 - ".BuildTargetModel"
Cohesion: 0.50
Nodes (3): DateTime, Guid, ModelBuilder

### Community 78 - ".Login"
Cohesion: 0.23
Nodes (10): AuthController, RefreshRequest, RefreshToken, ActionResult, AllowAnonymous, Authorize, HttpGet, HttpPost (+2 more)

### Community 79 - "CurrentUserResponse"
Cohesion: 0.17
Nodes (10): CurrentUserResponse, Email, MemberName, Role, UserId, Guid, IAuthService, RefreshToken (+2 more)

### Community 80 - "AuthService"
Cohesion: 0.29
Nodes (7): AuthService, DateTime, RefreshToken, Response, Task, User, IHttpContextAccessor

### Community 81 - "FarmerService"
Cohesion: 0.32
Nodes (5): FarmerService, Farmer, Guid, List, Task

### Community 82 - "LoginRequest"
Cohesion: 0.50
Nodes (3): LoginRequest, Email, Password

### Community 83 - "AddShipmentFields"
Cohesion: 0.22
Nodes (7): DateTime, Guid, MigrationBuilder, AddShipmentFields, DateTime, Guid, ModelBuilder

### Community 84 - "OtpService"
Cohesion: 0.29
Nodes (5): IOtpService, Task, OtpService, ILogger, Task

### Community 85 - "IFarmService"
Cohesion: 0.38
Nodes (4): IFarmService, Guid, List, Task

### Community 86 - "4. Enums"
Cohesion: 0.04
Nodes (47): 1.1 Register Farmer, 1.2 Send OTP, 1.3 Verify OTP, 1.4 Resend OTP, 1.5 Update Farmer Profile, 1.6 Create Farm, 1.7 Submit / Sell Millet, 1.8 Reject Procurement Agreement (+39 more)

### Community 87 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, prefer_related_applications, short_name (+2 more)

### Community 88 - "MessageHandler"
Cohesion: 0.18
Nodes (10): DartProject, HWND, LPARAM, LRESULT, UINT, WPARAM, FlutterWindow::FlutterWindow(), MessageHandler (+2 more)

### Community 89 - "MessageHandler"
Cohesion: 0.36
Nodes (10): HWND, LPARAM, LRESULT, UINT, WPARAM, EnableFullDpiSupportIfAvailable(), GetHandle, GetThisFromHandle (+2 more)

### Community 90 - "LoginResponse"
Cohesion: 0.22
Nodes (9): LoginResponse, AccessToken, Email, ExpiresAt, MemberName, Role, UserId, DateTime (+1 more)

### Community 91 - "FarmerOtp"
Cohesion: 0.18
Nodes (10): FarmerOtp, Attempts, CreatedAt, ExpiresAt, Id, IsUsed, OtpHash, Phone (+2 more)

### Community 92 - "CreateFarmerRequest"
Cohesion: 0.20
Nodes (10): CreateFarmerRequest, Address, DateOfBirth, District, Email, FullName, Phone, Taluka (+2 more)

### Community 93 - ".BuildTargetModel"
Cohesion: 0.50
Nodes (3): DateTime, Guid, ModelBuilder

### Community 94 - "20260909102228_AddMilltetypeInFarm.Designer.cs"
Cohesion: 0.22
Nodes (5): MigrationBuilder, AddMilltetypeInFarm, DateTime, Guid, ModelBuilder

### Community 95 - "20261003172849_AddAgreementFields.Designer.cs"
Cohesion: 0.22
Nodes (5): MigrationBuilder, AddAgreementFields, DateTime, Guid, ModelBuilder

### Community 96 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 98 - "IFarmerService"
Cohesion: 0.39
Nodes (4): IFarmerService, Guid, List, Task

### Community 99 - "20260906102828_AddFarmerAndFarm.Designer.cs"
Cohesion: 0.22
Nodes (5): MigrationBuilder, AddFarmerAndFarm, DateTime, Guid, ModelBuilder

### Community 101 - "vite.config.js"
Cohesion: 0.25
Nodes (7): __dirname, __filename, ref_path, ref_tailwindcss_vite, ref_url, ref_vite, ref_vitejs_plugin_react

### Community 102 - "AppLocalizations"
Cohesion: 0.33
Nodes (7): AppLocalizations, _AppLocalizationsDelegate, AppLocalizationsEn, AppLocalizationsGu, AppLocalizationsHi, of, LocalizationsDelegate

### Community 103 - "AppDbContextModelSnapshot.cs"
Cohesion: 0.16
Nodes (8): DateTime, Guid, ModelBuilder, AppDbContextModelSnapshot, DateTime, Guid, ModelBuilder, ModelSnapshot

### Community 104 - "windows/flutter/generated_plugin_registrant.cc"
Cohesion: 0.33
Nodes (5): file_selector_windows, flutter_secure_storage_windows_plugin, RegisterPlugins(), geolocator_windows, PluginRegistry

### Community 105 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): ref_eslint_config, ref_eslint_js, ref_eslint_plugin_react_hooks, ref_eslint_plugin_react_refresh, ref_globals

### Community 106 - ".Up"
Cohesion: 0.40
Nodes (3): DateTime, Guid, MigrationBuilder

### Community 107 - ".Up"
Cohesion: 0.40
Nodes (3): DateTime, Guid, MigrationBuilder

### Community 108 - ".Up"
Cohesion: 0.40
Nodes (3): DateTime, Guid, MigrationBuilder

### Community 109 - ".Up"
Cohesion: 0.40
Nodes (3): DateTime, Guid, MigrationBuilder

### Community 110 - ".Up"
Cohesion: 0.40
Nodes (3): DateTime, Guid, MigrationBuilder

### Community 111 - ".Up"
Cohesion: 0.19
Nodes (6): DateTime, Guid, MigrationBuilder, DateTime, Guid, ModelBuilder

### Community 112 - "compilerOptions"
Cohesion: 0.40
Nodes (4): compilerOptions, baseUrl, ignoreDeprecations, paths

### Community 113 - "warehouse_receipt_screen.dart"
Cohesion: 0.08
Nodes (24): double?, LotModel, actualQty, build, createState, _detailRow, farmerName, initState (+16 more)

### Community 114 - "sheet.jsx"
Cohesion: 0.18
Nodes (6): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 115 - "20261004170546_AddReportIssue.Designer.cs"
Cohesion: 0.18
Nodes (7): DateTime, Guid, MigrationBuilder, AddReportIssue, DateTime, Guid, ModelBuilder

### Community 116 - "AddFarmerUpdatedAt"
Cohesion: 0.25
Nodes (5): MigrationBuilder, AddFarmerUpdatedAt, DateTime, Guid, ModelBuilder

### Community 117 - "Contributor Covenant Code of Conduct"
Cohesion: 0.15
Nodes (12): 1. Correction, 2. Warning, 3. Temporary Ban, 4. Permanent Ban, Attribution, Contributor Covenant Code of Conduct, Enforcement, Enforcement Guidelines (+4 more)

### Community 118 - "AppRoutes.jsx"
Cohesion: 0.03
Nodes (33): Login(), BuyerDetails(), Certification(), Dashboard(), EditFarmer(), FarmerDetails(), FarmVerificationList(), FPOManagement() (+25 more)

### Community 119 - "JwtOptions"
Cohesion: 0.33
Nodes (5): JwtOptions, Audience, ExpirationMinutes, Issuer, Key

### Community 120 - "pdf_generator.dart"
Cohesion: 0.25
Nodes (7): dart:typed_data, generateProcurementAgreementPdf, generateQualityCertificatePdf, PdfGenerator, _pdfRow, package:pdf/pdf.dart, package:pdf/widgets.dart

### Community 121 - "Point"
Cohesion: 0.21
Nodes (6): Point, x, y, Size, height, width

### Community 124 - "20260906035914_InitialCreate.Designer.cs"
Cohesion: 0.29
Nodes (3): MigrationBuilder, InitialCreate, ModelBuilder

### Community 130 - "cn"
Cohesion: 0.20
Nodes (13): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), SelectGroup(), SelectLabel() (+5 more)

### Community 132 - ".BuildTargetModel"
Cohesion: 0.50
Nodes (3): DateTime, Guid, ModelBuilder

### Community 143 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 153 - ".BuildTargetModel"
Cohesion: 0.50
Nodes (3): DateTime, Guid, ModelBuilder

### Community 154 - "utils.js"
Cohesion: 0.15
Nodes (9): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), TooltipContent(), ref_clsx, ref_radix_ui (+1 more)

### Community 155 - ".BuildTargetModel"
Cohesion: 0.50
Nodes (3): DateTime, Guid, ModelBuilder

### Community 156 - "AuthContext.jsx"
Cohesion: 0.21
Nodes (10): App(), API_BASE_URL, AuthContext, AuthProvider(), restoreSession(), frontend_website_src_index, AppRoutes(), auth (+2 more)

### Community 157 - "Sidebar.jsx"
Cohesion: 0.23
Nodes (7): DashboardLayout(), Sidebar(), Topbar(), COMMON_SYSTEM_SECTION, ROLE_CONFIGS, useAuth(), ProtectedRoute()

### Community 158 - ".BuildTargetModel"
Cohesion: 0.50
Nodes (3): DateTime, Guid, ModelBuilder

### Community 160 - "system_componentmodel_dataannotations"
Cohesion: 0.13
Nodes (9): SendOtpRequest, Phone, VerifyOtpRequest, Otp, Phone, UpdateFarmStatusRequest, Status, backend.Features.Farms.DTOs (+1 more)

### Community 161 - "FarmerAuthService"
Cohesion: 0.31
Nodes (5): FarmerAuthService, ILogger, Task, IFarmerAuthService, Task

## Knowledge Gaps
- **1751 isolated node(s):** `Users`, `FpoMembers`, `Farmers`, `Farms`, `FarmerOtps` (+1746 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2159 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `backend.Features.Farmers.Entities` connect `backend.Features.Farmers.Entities` to `AppDbContext.cs`, `backend.Data`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Why does `AppDbContext` connect `AppDbContext` to `FarmerAuthService`, `AppDbContext.cs`, `FarmService`, `.SeedAsync`, `LotResponse`, `Inspection`, `Dispatch`, `StockMovementResponse`, `AuthService`, `InventoryBatch`, `FarmerService`, `OtpService`, `ProcurementLot`, `microsoft_aspnetcore_authorization`, `FarmerOtp`, `ShipmentIssue`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `backend.Features.Farms.Entities` connect `backend.Features.Farmers.Entities` to `AppDbContext.cs`, `backend.Data`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **What connects `Users`, `FpoMembers`, `Farmers` to the rest of the system?**
  _1751 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app_localizations.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.010752688172043012 - nodes in this community are weakly interconnected._
- **Should `app_localizations_hi.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.011695906432748537 - nodes in this community are weakly interconnected._
- **Should `app_localizations_en.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.011695906432748537 - nodes in this community are weakly interconnected._