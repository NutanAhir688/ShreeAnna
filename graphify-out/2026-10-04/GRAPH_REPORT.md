# Graph Report - ShreeAnna  (2026-10-04)

## Corpus Check
- 338 files · ~347,065 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3508 nodes · 6213 edges · 158 communities (130 shown, 25 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 147 edges (avg confidence: 0.85)
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
- quality_certificate_screen.dart
- LotResponse
- InspectionResponse
- Dispatch
- card.jsx
- ref_lucide_react
- farm_api.dart
- package:flutter/material.dart
- AzureBlobStorageService
- backend.Migrations
- api_config.dart
- GeneratedPluginRegistrant.swift
- my_lots_screen.dart
- InventoryBatch
- add_farm_screen.dart
- button.jsx
- lot_model.dart
- ProcurementLot
- Inspection
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
- Program.cs
- Farm
- login_screen.dart
- StockMovementResponse
- FarmVerificationList.jsx
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
- AppRoutes.jsx
- Farmer
- win32_window.cpp
- Reports.jsx
- dependencies
- ref_react_router_dom
- Warehouse
- FarmerResponse
- ShipmentIssue
- FpoMember
- http
- farmer.dart
- UpdateFarmerRequest
- FarmService
- Topbar.jsx
- QualityManagement.jsx
- RecentActivityResponse
- backend.csproj
- api_client.dart
- State
- UpdateFarmRequest
- main.dart
- string
- QualityController
- sheet.jsx
- .Login
- CurrentUserResponse
- AuthService
- FarmerService
- ControllerBase
- AddShipmentFields
- OtpService
- IFarmService
- 4. Enums
- manifest.json
- MessageHandler
- MessageHandler
- .OnModelCreating
- FarmerOtp
- CreateFarmerRequest
- FixFarmerAndFarm
- AddMilltetypeInFarm
- AddAgreementFields
- package.json
- reject_agreement_dialog.dart
- IFarmerService
- AddFarmerAndFarm
- .SeedAsync
- vite.config.js
- AppLocalizations
- .BuildModel
- windows/flutter/generated_plugin_registrant.cc
- eslint.config.js
- AddCoreEntities
- AddFarmerOtp
- AddProcurementLots
- AddRefreshToken
- AddFarmCrops
- AddInspectorTracking
- compilerOptions
- LogisticsController.cs
- warehouse_receipt_screen.dart
- AddReportIssue
- AddFarmerUpdatedAt
- Contributor Covenant Code of Conduct
- ref_react
- JwtOptions
- pdf_generator.dart
- Point
- FlutterActivity
- class-variance-authority
- Migration
- cn
- @fontsource-variable/geist
- Runner-Bridging-Header.h
- windows/flutter/generated_plugin_registrant.h
- QualityService.cs
- cn
- recharts
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
- utils.js
- quality_results_screen.dart
- AuthContext.jsx
- Sidebar.jsx
- system_componentmodel_dataannotations
- LoginResponse

## God Nodes (most connected - your core abstractions)
1. `AppDbContext` - 57 edges
2. `Card()` - 53 edges
3. `CardContent()` - 53 edges
4. `Button()` - 48 edges
5. `CardHeader()` - 45 edges
6. `CardTitle()` - 45 edges
7. `cn()` - 45 edges
8. `ProcurementLot` - 44 edges
9. `FarmResponse` - 43 edges
10. `Dispatch` - 37 edges

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

## Communities (158 total, 25 thin omitted)

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

### Community 4 - "quality_certificate_screen.dart"
Cohesion: 0.10
Nodes (19): ../../../core/utils/document_downloader.dart, ../../../core/utils/pdf_generator.dart, CustomPainter, build, _buildCertRow, _buildLabGridRow, _certData, createState (+11 more)

### Community 5 - "LotResponse"
Cohesion: 0.06
Nodes (51): User, CreatedAt, Email, FpoMember, FpoMemberId, Id, IsActive, PasswordHash (+43 more)

### Community 6 - "InspectionResponse"
Cohesion: 0.19
Nodes (13): CreateInspectionRequest, InspectionResponse, QualityCertificateResponse, DateTime, Guid, IQualityService, Guid, List (+5 more)

### Community 7 - "Dispatch"
Cohesion: 0.06
Nodes (55): LogisticsController, ActionResult, Guid, HttpGet, HttpPatch, HttpPost, List, Task (+47 more)

### Community 8 - "card.jsx"
Cohesion: 0.11
Nodes (24): Badge(), badgeVariants, Card(), CardContent(), CardHeader(), CardTitle(), CertificationForm(), CertificationSummary() (+16 more)

### Community 9 - "ref_lucide_react"
Cohesion: 0.05
Nodes (34): BuyerFilters(), BuyerStats(), BuyerTable(), Buyers(), FarmsByDistrict(), FarmVerificationQueue(), RecentActivity(), StatCard() (+26 more)

### Community 10 - "farm_api.dart"
Cohesion: 0.05
Nodes (40): core/network/api_client.dart, ../../../core/network/api_config.dart, dart:convert, ApiClient, FarmerAuthApi, sendOtp, verifyOtp, _apiClient (+32 more)

### Community 11 - "package:flutter/material.dart"
Cohesion: 0.06
Nodes (35): ../../../app/theme.dart, background, primaryGreen, ShreeAnnaTheme, build, _buildDetailRow, _buildDivider, _buildFarmImage (+27 more)

### Community 12 - "AzureBlobStorageService"
Cohesion: 0.11
Nodes (19): azure_storage, azure_storage_blobs, azure_storage_blobs_models, azure_storage_sas, AzureBlobStorageService, IBlobStorageService, IFormFile, ILogger (+11 more)

### Community 13 - "backend.Migrations"
Cohesion: 0.25
Nodes (9): backend.Migrations, backend.Data, microsoft_entityframeworkcore, microsoft_entityframeworkcore_infrastructure, microsoft_entityframeworkcore_migrations, microsoft_entityframeworkcore_storage_valueconversion, microsoft_extensions_logging, npgsql_entityframeworkcore_postgresql_metadata (+1 more)

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
Nodes (47): InventoryBatch, BatchCode, Grade, Id, Lot, LotId, MilletType, QuantityInKg (+39 more)

### Community 18 - "add_farm_screen.dart"
Cohesion: 0.05
Nodes (41): File?, _addCrop, areaController, _askLocationAndCapture, build, createState, _cropEntries, _CropEntry (+33 more)

### Community 19 - "button.jsx"
Cohesion: 0.18
Nodes (21): Button(), buttonVariants, Input(), Label(), Select(), SelectContent(), SelectItem(), SelectTrigger() (+13 more)

### Community 20 - "lot_model.dart"
Cohesion: 0.05
Nodes (41): actualQuantityKg, agreedQuantityKg, agreementVersion, assignedInspectorName, assignedInspectorPhone, completedAt, currentStatus, description (+33 more)

### Community 21 - "ProcurementLot"
Cohesion: 0.06
Nodes (36): ProcurementLot, ActualQuantityKg, AgreedQuantityKg, AgreementVersion, AssignedInspectorId, AssignedInspectorName, AssignedInspectorPhone, CreatedAt (+28 more)

### Community 22 - "Inspection"
Cohesion: 0.08
Nodes (27): Inspection, DamagedGrainsPercentage, ForeignMatterPercentage, Grade, Id, ImmatureGrainsPercentage, InsectDamage, InspectionDate (+19 more)

### Community 23 - "microsoft_aspnetcore_authorization"
Cohesion: 0.11
Nodes (18): Roles, backend.Features.Farmers.Controllers, backend.Features.Auth, backend.Features.Warehouses.DTOs, backend.Features.Inventory.Services, backend.Features.Inventory.Controllers, backend.Features.Warehouses.Controllers, backend.Features.Inventory.DTOs (+10 more)

### Community 24 - "manage_farm_screen.dart"
Cohesion: 0.09
Nodes (23): ../data/farm_api.dart, _areaController, build, _buildLabel, createState, dispose, _districtController, farm (+15 more)

### Community 25 - "lot_details_screen.dart"
Cohesion: 0.05
Nodes (36): LotTimelineModel, _buildAgreementNotificationBanner, _buildCompactAgreementCard, _buildCompactDriverCard, _buildCompactInspectorCard, _buildDetailRow, _buildDivider, _buildInfo (+28 more)

### Community 26 - "profile_screen.dart"
Cohesion: 0.09
Nodes (22): ../../auth/screen/welcome_screen.dart, ../../farmers/models/farmer.dart, build, _buildActionTile, _buildDivider, _buildErrorView, _buildInfoRow, _buildLanguageOption (+14 more)

### Community 27 - "my_application.cc"
Cohesion: 0.07
Nodes (27): file_selector_plugin, FlPluginRegistry, flutter_linux, flutter_secure_storage_linux_plugin, FlView, fl_register_plugins(), main(), first_frame_cb() (+19 more)

### Community 28 - "AppDbContext"
Cohesion: 0.11
Nodes (18): AppDbContext, Dispatches, FarmCrops, FarmerOtps, Farmers, Farms, FpoMembers, Inspections (+10 more)

### Community 29 - "farm.dart"
Cohesion: 0.06
Nodes (30): bool get, double?, areaInAcres, createdAt, cropName, crops, district, estimatedAreaInAcres (+22 more)

### Community 30 - "FarmResponse"
Cohesion: 0.07
Nodes (30): FarmCropResponse, CropName, EstimatedAreaInAcres, ExpectedHarvestDate, Id, Season, SowingDate, Status (+22 more)

### Community 31 - "registration_screen.dart"
Cohesion: 0.07
Nodes (27): FormState, _addressController, build, _buildLabel, createState, dispose, _districts, _dobController (+19 more)

### Community 32 - "sell_millet_screen.dart"
Cohesion: 0.07
Nodes (28): ../../farm/data/farm_api.dart, ../../farm/model/farm.dart, build, _buildLabel, createState, _descriptionController, dispose, _farmApi (+20 more)

### Community 33 - "home_screen.dart"
Cohesion: 0.07
Nodes (27): ../../farm/screen/farm_management_screen.dart, build, _buildActiveLotsCard, _buildBottomNavigationBar, _buildLotCard, createState, _farmer, _farmerApi (+19 more)

### Community 34 - "AppDbContext.cs"
Cohesion: 0.15
Nodes (8): backend.Features.Farmers.Entities, backend.Features.Fpo.Entities, backend.Features.Warehouses.Entities, backend.Features.Farms.Entities, backend.Features.Auth.Entities, backend.Features.Inventory.Entities, backend.Features.Logistics.Entities, backend.Features.Procurement.Entities

### Community 35 - "Program.cs"
Cohesion: 0.16
Nodes (11): backend.Features.Farms.Services, backend.Infrastructure.Authentication, backend.Features.Auth.DTOs, backend.Features.Farmers.Services, backend.Features.Auth.Services, microsoft_aspnetcore_authentication_jwtbearer, microsoft_extensions_options, microsoft_identitymodel_tokens (+3 more)

### Community 36 - "Farm"
Cohesion: 0.05
Nodes (38): Farm, AreaInAcres, CreatedAt, Crops, District, FarmCode, Farmer, FarmerId (+30 more)

### Community 37 - "login_screen.dart"
Cohesion: 0.09
Nodes (22): build, createState, dispose, _farmerAuthApi, _isLoading, LoginScreen, _LoginScreenState, _mobileController (+14 more)

### Community 38 - "StockMovementResponse"
Cohesion: 0.19
Nodes (15): InventoryController, ActionResult, HttpGet, HttpPost, List, Task, CreateStockMovementRequest, InventoryBatchResponse (+7 more)

### Community 39 - "FarmVerificationList.jsx"
Cohesion: 0.29
Nodes (10): Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow(), procurementData, getStatusVariant() (+2 more)

### Community 40 - "MarketplaceListingDetails.jsx"
Cohesion: 0.14
Nodes (10): BuyerOrders(), ListingCertificate(), ListingOverview(), ListingSource(), MarketplaceFilters(), MarketplaceStats(), MarketplaceTable(), Marketplace() (+2 more)

### Community 41 - "farm_management_screen.dart"
Cohesion: 0.07
Nodes (32): add_farm_screen.dart, farm_screen.dart, WelcomeScreen, _apiClient, _buildFarmAction, createState, deleteFarm, _EmptyFarmView (+24 more)

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
Cohesion: 0.09
Nodes (22): LotModel, _acceptAgreement, _buildVersionHistoryList, _cert, createState, _docBreakdownRow, _error, _handleRejectClick (+14 more)

### Community 53 - "AppRoutes.jsx"
Cohesion: 0.04
Nodes (27): Login(), Certification(), Dashboard(), EditFarmer(), FarmVerification(), FarmVerificationList(), FPOManagement(), Inventory() (+19 more)

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

### Community 58 - "ref_react_router_dom"
Cohesion: 0.13
Nodes (12): FarmerActivity(), FarmerDetails(), FarmerFarms(), FarmerFilters(), FarmerProcurement(), FarmerProfile(), FarmerStats(), FarmerTable() (+4 more)

### Community 59 - "Warehouse"
Cohesion: 0.10
Nodes (19): Warehouse, CapacityInTons, ContactPhone, CreatedAt, District, Id, Latitude, Location (+11 more)

### Community 60 - "FarmerResponse"
Cohesion: 0.12
Nodes (17): FarmerResponse, Address, CreatedAt, DateOfBirth, District, Email, FarmCount, FarmerCode (+9 more)

### Community 61 - "ShipmentIssue"
Cohesion: 0.11
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
Cohesion: 0.14
Nodes (11): UpdateFarmerRequest, Address, DateOfBirth, District, Email, FullName, Phone, Taluka (+3 more)

### Community 66 - "FarmService"
Cohesion: 0.32
Nodes (5): FarmService, Farm, Guid, List, Task

### Community 67 - "Topbar.jsx"
Cohesion: 0.16
Nodes (11): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut() (+3 more)

### Community 68 - "QualityManagement.jsx"
Cohesion: 0.15
Nodes (16): Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle(), LandRecordVerification(), SubmittedFarmDetails() (+8 more)

### Community 69 - "RecentActivityResponse"
Cohesion: 0.12
Nodes (14): DashboardController, ActionResult, HttpGet, List, Task, RecentActivityResponse, CreatedAt, Status (+6 more)

### Community 70 - "backend.csproj"
Cohesion: 0.15
Nodes (12): net10.0, Azure.Storage.Blobs (12.29.2), BCrypt.Net-Next (4.2.0), DotNetEnv (3.1.1), Microsoft.AspNetCore.Authentication.JwtBearer (10.0.11), Microsoft.AspNetCore.OpenApi (10.0.11), Microsoft.EntityFrameworkCore (10.0.11), Microsoft.EntityFrameworkCore.Design (10.0.11) (+4 more)

### Community 71 - "api_client.dart"
Cohesion: 0.11
Nodes (17): dart:io, _checkUnauthorized, delete, _headers, navigatorKey, patch, post, put (+9 more)

### Community 72 - "State"
Cohesion: 0.16
Nodes (18): RegistrationScreen, _RegistrationScreenState, AddFarmScreen, _AddFarmScreenState, FarmManagementScreen, _FarmManagementScreenState, LotDetailsScreen, _LotDetailsScreenState (+10 more)

### Community 73 - "UpdateFarmRequest"
Cohesion: 0.15
Nodes (13): UpdateFarmRequest, AreaInAcres, Crops, District, FarmName, ImageUrl, Latitude, Longitude (+5 more)

### Community 74 - "main.dart"
Cohesion: 0.12
Nodes (14): core/localization/app_language.dart, core/storage/token_storage.dart, features/auth/screen/welcome_screen.dart, features/home/screens/home_screen.dart, build, ShreeAnnaApp, build, isLoggedIn (+6 more)

### Community 75 - "string"
Cohesion: 0.12
Nodes (19): dart_project, flutter_view_controller, flutter_windows, wWinMain(), string, wchar_t, CreateAndAttachConsole(), GetCommandLineArguments() (+11 more)

### Community 76 - "QualityController"
Cohesion: 0.29
Nodes (9): QualityController, ActionResult, AllowAnonymous, Authorize, Guid, HttpGet, HttpPost, List (+1 more)

### Community 77 - "sheet.jsx"
Cohesion: 0.18
Nodes (6): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 78 - ".Login"
Cohesion: 0.30
Nodes (8): AuthController, RefreshRequest, RefreshToken, ActionResult, AllowAnonymous, HttpPost, IActionResult, Task

### Community 79 - "CurrentUserResponse"
Cohesion: 0.22
Nodes (8): Authorize, HttpGet, CurrentUserResponse, Email, MemberName, Role, UserId, Guid

### Community 80 - "AuthService"
Cohesion: 0.14
Nodes (14): LoginRequest, Email, Password, AuthService, DateTime, RefreshToken, Response, Task (+6 more)

### Community 81 - "FarmerService"
Cohesion: 0.32
Nodes (5): FarmerService, Farmer, Guid, List, Task

### Community 82 - "ControllerBase"
Cohesion: 0.43
Nodes (5): AuthTestController, Authorize, HttpGet, IActionResult, ControllerBase

### Community 83 - "AddShipmentFields"
Cohesion: 0.24
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

### Community 90 - ".OnModelCreating"
Cohesion: 0.22
Nodes (6): Farm, FarmCrop, Farmer, FpoMember, ModelBuilder, User

### Community 91 - "FarmerOtp"
Cohesion: 0.18
Nodes (10): FarmerOtp, Attempts, CreatedAt, ExpiresAt, Id, IsUsed, OtpHash, Phone (+2 more)

### Community 92 - "CreateFarmerRequest"
Cohesion: 0.20
Nodes (10): CreateFarmerRequest, Address, DateOfBirth, District, Email, FullName, Phone, Taluka (+2 more)

### Community 93 - "FixFarmerAndFarm"
Cohesion: 0.25
Nodes (5): MigrationBuilder, FixFarmerAndFarm, DateTime, Guid, ModelBuilder

### Community 94 - "AddMilltetypeInFarm"
Cohesion: 0.25
Nodes (5): MigrationBuilder, AddMilltetypeInFarm, DateTime, Guid, ModelBuilder

### Community 95 - "AddAgreementFields"
Cohesion: 0.25
Nodes (5): MigrationBuilder, AddAgreementFields, DateTime, Guid, ModelBuilder

### Community 96 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 97 - "reject_agreement_dialog.dart"
Cohesion: 0.15
Nodes (12): build, _commentController, createState, dispose, _isSubmitting, _lotApi, lotId, _radioTile (+4 more)

### Community 98 - "IFarmerService"
Cohesion: 0.39
Nodes (4): IFarmerService, Guid, List, Task

### Community 99 - "AddFarmerAndFarm"
Cohesion: 0.25
Nodes (5): MigrationBuilder, AddFarmerAndFarm, DateTime, Guid, ModelBuilder

### Community 101 - "vite.config.js"
Cohesion: 0.25
Nodes (7): __dirname, __filename, ref_path, ref_tailwindcss_vite, ref_url, ref_vite, ref_vitejs_plugin_react

### Community 102 - "AppLocalizations"
Cohesion: 0.33
Nodes (7): AppLocalizations, _AppLocalizationsDelegate, AppLocalizationsEn, AppLocalizationsGu, AppLocalizationsHi, of, LocalizationsDelegate

### Community 103 - ".BuildModel"
Cohesion: 0.33
Nodes (5): AppDbContextModelSnapshot, DateTime, Guid, ModelBuilder, ModelSnapshot

### Community 104 - "windows/flutter/generated_plugin_registrant.cc"
Cohesion: 0.33
Nodes (5): file_selector_windows, flutter_secure_storage_windows_plugin, RegisterPlugins(), geolocator_windows, PluginRegistry

### Community 105 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): ref_eslint_config, ref_eslint_js, ref_eslint_plugin_react_hooks, ref_eslint_plugin_react_refresh, ref_globals

### Community 106 - "AddCoreEntities"
Cohesion: 0.22
Nodes (7): DateTime, Guid, MigrationBuilder, AddCoreEntities, DateTime, Guid, ModelBuilder

### Community 107 - "AddFarmerOtp"
Cohesion: 0.22
Nodes (7): DateTime, Guid, MigrationBuilder, AddFarmerOtp, DateTime, Guid, ModelBuilder

### Community 108 - "AddProcurementLots"
Cohesion: 0.22
Nodes (7): DateTime, Guid, MigrationBuilder, AddProcurementLots, DateTime, Guid, ModelBuilder

### Community 109 - "AddRefreshToken"
Cohesion: 0.22
Nodes (7): DateTime, Guid, MigrationBuilder, AddRefreshToken, DateTime, Guid, ModelBuilder

### Community 110 - "AddFarmCrops"
Cohesion: 0.22
Nodes (7): DateTime, Guid, MigrationBuilder, AddFarmCrops, DateTime, Guid, ModelBuilder

### Community 111 - "AddInspectorTracking"
Cohesion: 0.22
Nodes (7): DateTime, Guid, MigrationBuilder, AddInspectorTracking, DateTime, Guid, ModelBuilder

### Community 112 - "compilerOptions"
Cohesion: 0.40
Nodes (4): compilerOptions, baseUrl, ignoreDeprecations, paths

### Community 113 - "LogisticsController.cs"
Cohesion: 0.40
Nodes (4): UpdateDispatchStatusRequest, backend.Features.Logistics.Controllers, backend.Features.Logistics.Services, backend.Features.Logistics.DTOs

### Community 114 - "warehouse_receipt_screen.dart"
Cohesion: 0.18
Nodes (10): build, _detailRow, _docRow, _moneyRow, _panel, _qualityCell, _sectionTitle, _statusPill (+2 more)

### Community 115 - "AddReportIssue"
Cohesion: 0.22
Nodes (7): DateTime, Guid, MigrationBuilder, AddReportIssue, DateTime, Guid, ModelBuilder

### Community 116 - "AddFarmerUpdatedAt"
Cohesion: 0.29
Nodes (5): MigrationBuilder, AddFarmerUpdatedAt, DateTime, Guid, ModelBuilder

### Community 117 - "Contributor Covenant Code of Conduct"
Cohesion: 0.15
Nodes (12): 1. Correction, 2. Warning, 3. Temporary Ban, 4. Permanent Ban, Attribution, Contributor Covenant Code of Conduct, Enforcement, Enforcement Guidelines (+4 more)

### Community 118 - "ref_react"
Cohesion: 0.05
Nodes (25): Checkbox, BuyerDetails(), FPOMemberDetails(), ReceiveStockForm(), getMovementStyle(), StockMovementTable(), InventoryDetails(), StockMovements() (+17 more)

### Community 119 - "JwtOptions"
Cohesion: 0.33
Nodes (5): JwtOptions, Audience, ExpirationMinutes, Issuer, Key

### Community 120 - "pdf_generator.dart"
Cohesion: 0.25
Nodes (7): dart:typed_data, generateProcurementAgreementPdf, generateQualityCertificatePdf, PdfGenerator, _pdfRow, package:pdf/pdf.dart, package:pdf/widgets.dart

### Community 121 - "Point"
Cohesion: 0.21
Nodes (6): Point, x, y, Size, height, width

### Community 124 - "Migration"
Cohesion: 0.14
Nodes (9): MigrationBuilder, InitialCreate, ModelBuilder, MigrationBuilder, UpdateFarmAndFarmerFields, DateTime, Guid, ModelBuilder (+1 more)

### Community 130 - "cn"
Cohesion: 0.20
Nodes (13): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage(), SelectGroup(), SelectLabel() (+5 more)

### Community 143 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 154 - "utils.js"
Cohesion: 0.15
Nodes (9): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger(), TooltipContent(), ref_clsx, ref_radix_ui (+1 more)

### Community 155 - "quality_results_screen.dart"
Cohesion: 0.15
Nodes (12): createState, _errorMessage, _fetchQualityResults, initState, _inspectionData, _isLoading, label, _lotApi (+4 more)

### Community 156 - "AuthContext.jsx"
Cohesion: 0.21
Nodes (10): App(), API_BASE_URL, AuthContext, AuthProvider(), restoreSession(), frontend_website_src_index, AppRoutes(), auth (+2 more)

### Community 157 - "Sidebar.jsx"
Cohesion: 0.23
Nodes (7): DashboardLayout(), Sidebar(), Topbar(), COMMON_SYSTEM_SECTION, ROLE_CONFIGS, useAuth(), ProtectedRoute()

### Community 160 - "system_componentmodel_dataannotations"
Cohesion: 0.14
Nodes (9): SendOtpRequest, Phone, VerifyOtpRequest, Otp, Phone, UpdateFarmStatusRequest, Status, backend.Features.Farms.DTOs (+1 more)

### Community 161 - "LoginResponse"
Cohesion: 0.10
Nodes (22): FarmerAuthController, ActionResult, AllowAnonymous, Authorize, HttpGet, HttpPost, IActionResult, Task (+14 more)

## Knowledge Gaps
- **1739 isolated node(s):** `Users`, `FpoMembers`, `Farmers`, `Farms`, `FarmerOtps` (+1734 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2145 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `backend.Features.Farmers.Entities` connect `AppDbContext.cs` to `Program.cs`?**
  _High betweenness centrality (0.149) - this node is a cross-community bridge._
- **Why does `AppDbContext` connect `AppDbContext` to `LoginResponse`, `AppDbContext.cs`, `FarmService`, `.SeedAsync`, `RecentActivityResponse`, `StockMovementResponse`, `Dispatch`, `LotResponse`, `InspectionResponse`, `AuthService`, `InventoryBatch`, `FarmerService`, `OtpService`, `ProcurementLot`, `Inspection`, `.OnModelCreating`, `FarmerOtp`, `ShipmentIssue`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **What connects `Users`, `FpoMembers`, `Farmers` to the rest of the system?**
  _1739 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app_localizations.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.010752688172043012 - nodes in this community are weakly interconnected._
- **Should `app_localizations_hi.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.011695906432748537 - nodes in this community are weakly interconnected._
- **Should `app_localizations_en.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.011695906432748537 - nodes in this community are weakly interconnected._
- **Should `app_localizations_gu.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.011695906432748537 - nodes in this community are weakly interconnected._