using backend.Features.Farmers.Entities;
using backend.Features.Farms.Entities;
using backend.Features.Procurement.Entities;
using backend.Features.Warehouses.Entities;
using backend.Features.Inventory.Entities;
using Microsoft.EntityFrameworkCore;
using backend.Features.Fpo.Entities;
using backend.Features.Auth.Entities;
using backend.Features.Auth;
using backend.Features.Marketplace.Entities;

namespace backend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        try
        {
            await context.Database.MigrateAsync();
        }
        catch { }

        // Create marketplace and orders tables first
        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""marketplace_products"" (
                    ""id"" uuid NOT NULL PRIMARY KEY,
                    ""title"" character varying(200) NOT NULL,
                    ""category"" character varying(100),
                    ""brand"" character varying(100),
                    ""description"" text,
                    ""lot_id"" character varying(50),
                    ""millet_type"" character varying(100),
                    ""farmer_name"" character varying(150),
                    ""quantity_kg"" numeric(18,2),
                    ""price_per_kg"" numeric(18,2),
                    ""status"" character varying(50) NOT NULL DEFAULT 'Active',
                    ""image_url"" text,
                    ""created_by_user_id"" uuid,
                    ""created_at"" timestamp with time zone NOT NULL,
                    ""updated_at"" timestamp with time zone,
                    ""is_deleted"" boolean NOT NULL DEFAULT FALSE
                );
                CREATE TABLE IF NOT EXISTS ""orders"" (
                    ""id"" uuid NOT NULL PRIMARY KEY,
                    ""order_number"" character varying(50) NOT NULL,
                    ""customer_name"" character varying(150) NOT NULL,
                    ""customer_email"" character varying(150) NOT NULL,
                    ""customer_phone"" character varying(20),
                    ""shipping_address"" character varying(300) NOT NULL,
                    ""city"" character varying(100),
                    ""state"" character varying(100),
                    ""pincode"" character varying(20),
                    ""payment_method"" character varying(50),
                    ""payment_status"" character varying(50),
                    ""subtotal"" numeric(18,2) NOT NULL,
                    ""delivery_fee"" numeric(18,2) NOT NULL,
                    ""total_amount"" numeric(18,2) NOT NULL,
                    ""status"" character varying(50) NOT NULL,
                    ""delivery_otp"" character varying(10) NOT NULL,
                    ""assigned_driver_id"" uuid,
                    ""driver_name"" character varying(150),
                    ""driver_phone"" character varying(30),
                    ""vehicle_number"" character varying(50),
                    ""created_at"" timestamp with time zone NOT NULL,
                    ""delivered_at"" timestamp with time zone
                );
                CREATE TABLE IF NOT EXISTS ""order_items"" (
                    ""id"" uuid NOT NULL PRIMARY KEY,
                    ""order_id"" uuid NOT NULL,
                    ""product_id"" uuid,
                    ""product_title"" character varying(200) NOT NULL,
                    ""category"" character varying(100),
                    ""producer_name"" character varying(100),
                    ""image_url"" text,
                    ""unit_price"" numeric(18,2) NOT NULL,
                    ""quantity"" integer NOT NULL,
                    ""total_price"" numeric(18,2) NOT NULL
                );
                CREATE TABLE IF NOT EXISTS ""Drivers"" (
                    ""Id"" uuid NOT NULL PRIMARY KEY,
                    ""DriverCode"" text NOT NULL,
                    ""Name"" text NOT NULL,
                    ""Phone"" text NOT NULL,
                    ""LicenseNumber"" text NOT NULL,
                    ""VehicleNumber"" text NOT NULL,
                    ""VehicleCapacityKg"" numeric(10,2) NOT NULL,
                    ""Status"" text NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL
                );
            ");
        }
        catch { }

        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""VerificationCode"" text NOT NULL DEFAULT '4829';
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""DriverLatitude"" numeric(10,7);
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""DriverLongitude"" numeric(10,7);
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""DriverAccuracyMeters"" numeric(10,2);
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""DriverLastUpdated"" timestamp with time zone;
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""PickupLatitude"" numeric(10,7);
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""PickupLongitude"" numeric(10,7);
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""DestinationLatitude"" numeric(10,7);
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""DestinationLongitude"" numeric(10,7);
                UPDATE ""Dispatches"" SET ""PickupLatitude"" = 22.5645, ""PickupLongitude"" = 72.9289 WHERE ""PickupLatitude"" IS NULL OR ""PickupLatitude"" < 20;
                UPDATE ""Dispatches"" SET ""DestinationLatitude"" = 22.9754, ""DestinationLongitude"" = 72.6322 WHERE ""DestinationLatitude"" IS NULL OR ""DestinationLatitude"" < 20;
                UPDATE ""Dispatches"" SET ""SourceAddress"" = 'Gujarat FPO Central Storage, Anand, Gujarat' WHERE ""SourceAddress"" LIKE '%Mandya%';
                UPDATE ""Dispatches"" SET ""DestinationAddress"" = 'Millet Shakti Processing Unit, GIDC Phase 2, Vatva, Ahmedabad, Gujarat - 382445' WHERE ""DestinationAddress"" LIKE '%Mandya%';
                ALTER TABLE ""ProcurementLots"" ADD COLUMN IF NOT EXISTS ""DriverLatitude"" numeric(10,7);
                ALTER TABLE ""ProcurementLots"" ADD COLUMN IF NOT EXISTS ""DriverLongitude"" numeric(10,7);
                ALTER TABLE ""ProcurementLots"" ADD COLUMN IF NOT EXISTS ""DriverAccuracyMeters"" numeric(10,2);
                ALTER TABLE ""ProcurementLots"" ADD COLUMN IF NOT EXISTS ""DriverLastUpdated"" timestamp with time zone;
                CREATE TABLE IF NOT EXISTS ""DriverLocationLogs"" (
                    ""Id"" uuid NOT NULL PRIMARY KEY,
                    ""LotId"" uuid NOT NULL,
                    ""DriverIdOrPhone"" text NOT NULL,
                    ""Latitude"" numeric(10,7) NOT NULL,
                    ""Longitude"" numeric(10,7) NOT NULL,
                    ""AccuracyMeters"" numeric(10,2),
                    ""RecordedAt"" timestamp with time zone NOT NULL,
                    ""CreatedAt"" timestamp with time zone NOT NULL
                );
                CREATE TABLE IF NOT EXISTS ""Notifications"" (
                    ""Id"" uuid NOT NULL PRIMARY KEY,
                    ""UserId"" uuid,
                    ""FarmerId"" uuid,
                    ""Title"" text NOT NULL,
                    ""Message"" text NOT NULL,
                    ""Category"" text NOT NULL,
                    ""IsRead"" boolean NOT NULL DEFAULT false,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""RelatedEntityId"" text,
                    ""RelatedEntityType"" text
                );
                CREATE TABLE IF NOT EXISTS ""Settlements"" (
                    ""Id"" uuid NOT NULL PRIMARY KEY,
                    ""SettlementCode"" text NOT NULL,
                    ""OrderId"" text NOT NULL,
                    ""LotId"" uuid,
                    ""LotNumber"" text,
                    ""FarmerId"" uuid,
                    ""FarmerName"" text NOT NULL,
                    ""FarmerPhone"" text,
                    ""BuyerName"" text NOT NULL,
                    ""BuyerType"" text NOT NULL,
                    ""MilletType"" text NOT NULL,
                    ""QuantityKg"" numeric(12,2) NOT NULL,
                    ""PricePerKg"" numeric(10,2) NOT NULL,
                    ""GrossAmount"" numeric(12,2) NOT NULL,
                    ""FpoMargin"" numeric(12,2) NOT NULL DEFAULT 0,
                    ""TransportCost"" numeric(12,2) NOT NULL DEFAULT 0,
                    ""OtherCharges"" numeric(12,2) NOT NULL DEFAULT 0,
                    ""FinalAmount"" numeric(12,2) NOT NULL,
                    ""Status"" text NOT NULL,
                    ""PaymentMethod"" text,
                    ""RazorpayPaymentLinkId"" text,
                    ""RazorpayShortUrl"" text,
                    ""TransactionId"" text,
                    ""PaymentDate"" timestamp with time zone,
                    ""DeliveryDate"" timestamp with time zone,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""UpdatedAt"" timestamp with time zone
                );
                CREATE TABLE IF NOT EXISTS ""PurchaseRequests"" (
                    ""Id"" uuid NOT NULL PRIMARY KEY,
                    ""RequestCode"" text NOT NULL,
                    ""LotId"" text NOT NULL,
                    ""MilletType"" text NOT NULL,
                    ""RequestedQuantityKg"" numeric(12,2) NOT NULL,
                    ""IndicativePricePerKg"" numeric(10,2) NOT NULL,
                    ""IndicativeValue"" numeric(12,2) NOT NULL,
                    ""FpoName"" text NOT NULL,
                    ""ProcessorId"" text NOT NULL,
                    ""ProcessorName"" text NOT NULL,
                    ""SubmittedDate"" timestamp with time zone NOT NULL,
                    ""Status"" text NOT NULL,
                    ""AgreementId"" text,
                    ""AgreedQuantityKg"" numeric(12,2),
                    ""SellingPricePerKg"" numeric(10,2),
                    ""TotalValue"" numeric(12,2),
                    ""AgreementValidUntil"" timestamp with time zone,
                    ""PaymentTerms"" text,
                    ""OwnershipTransfer"" text,
                    ""CancellationTerms"" text,
                    ""PaymentStatus"" text,
                    ""PaymentMethod"" text,
                    ""PaymentTransactionId"" text,
                    ""PaymentDate"" timestamp with time zone,
                    ""InvoiceNumber"" text,
                    ""ShipmentId"" uuid,
                    ""DispatchCode"" text,
                    ""DeliveryChallanNumber"" text,
                    ""DeliveryOtp"" text,
                    ""DeliveryProofPhotoUrl"" text,
                    ""DeliveredAt"" timestamp with time zone,
                    ""DeliveryNotes"" text,
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""UpdatedAt"" timestamp with time zone NOT NULL
                );
                CREATE TABLE IF NOT EXISTS ""marketplace_products"" (
                    ""id"" uuid NOT NULL PRIMARY KEY,
                    ""title"" character varying(200) NOT NULL,
                    ""category"" character varying(100),
                    ""brand"" character varying(100),
                    ""description"" text,
                    ""lot_id"" character varying(50),
                    ""millet_type"" character varying(100),
                    ""farmer_name"" character varying(150),
                    ""quantity_kg"" numeric(18,2),
                    ""price_per_kg"" numeric(18,2),
                    ""status"" character varying(50) NOT NULL DEFAULT 'Active',
                    ""image_url"" text,
                    ""created_by_user_id"" uuid,
                    ""created_at"" timestamp with time zone NOT NULL,
                    ""updated_at"" timestamp with time zone,
                    ""is_deleted"" boolean NOT NULL DEFAULT FALSE
                );
                CREATE TABLE IF NOT EXISTS ""orders"" (
                    ""id"" uuid NOT NULL PRIMARY KEY,
                    ""order_number"" character varying(50) NOT NULL,
                    ""customer_name"" character varying(150) NOT NULL,
                    ""customer_email"" character varying(150) NOT NULL,
                    ""customer_phone"" character varying(20),
                    ""shipping_address"" character varying(300) NOT NULL,
                    ""city"" character varying(100),
                    ""state"" character varying(100),
                    ""pincode"" character varying(20),
                    ""payment_method"" character varying(50),
                    ""payment_status"" character varying(50),
                    ""subtotal"" numeric(18,2) NOT NULL,
                    ""delivery_fee"" numeric(18,2) NOT NULL,
                    ""total_amount"" numeric(18,2) NOT NULL,
                    ""status"" character varying(50) NOT NULL,
                    ""delivery_otp"" character varying(10) NOT NULL,
                    ""assigned_driver_id"" uuid,
                    ""driver_name"" character varying(150),
                    ""driver_phone"" character varying(30),
                    ""vehicle_number"" character varying(50),
                    ""created_at"" timestamp with time zone NOT NULL,
                    ""delivered_at"" timestamp with time zone
                );
                CREATE TABLE IF NOT EXISTS ""order_items"" (
                    ""id"" uuid NOT NULL PRIMARY KEY,
                    ""order_id"" uuid NOT NULL,
                    ""product_id"" uuid,
                    ""product_title"" character varying(200) NOT NULL,
                    ""category"" character varying(100),
                    ""producer_name"" character varying(100),
                    ""image_url"" text,
                    ""unit_price"" numeric(18,2) NOT NULL,
                    ""quantity"" integer NOT NULL,
                    ""total_price"" numeric(18,2) NOT NULL
                );
            ");
        }
        catch { }

        await SeedFarmersAsync(context);
        await SeedFarmsAsync(context);
        await SeedFarmCropsAsync(context);
        await SeedUsersAsync(context);
        await SeedProcurementLotsAsync(context);
        await SeedWarehousesAsync(context);
        await SeedDriversAsync(context);
        await SeedPurchaseRequestsAsync(context);
        await SeedInventoryBatchesAsync(context);
        await SeedMarketplaceProductsAsync(context);
    }

    private static async Task SeedFarmCropsAsync(AppDbContext context)
    {
        if (await context.FarmCrops.AnyAsync())
        {
            return;
        }

        var farm = await context.Farms.FirstOrDefaultAsync();
        if (farm == null)
        {
            return;
        }

        var secondFarm = await context.Farms.Skip(2).FirstOrDefaultAsync() ?? farm;

        var farmCrops = new List<FarmCrop>
        {
            new FarmCrop
            {
                Id = Guid.Parse("11111111-2222-3333-4444-555555555555"),
                FarmId = farm.Id,
                CropName = "Ragi (Finger Millet)",
                Season = "Kharif 2026",
                SowingDate = DateTime.SpecifyKind(new DateTime(2026, 6, 15), DateTimeKind.Utc),
                ExpectedHarvestDate = DateTime.SpecifyKind(new DateTime(2026, 10, 10), DateTimeKind.Utc),
                EstimatedAreaInAcres = 3.00m,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            },
            new FarmCrop
            {
                Id = Guid.Parse("22222222-3333-4444-5555-666666666666"),
                FarmId = farm.Id,
                CropName = "Bajra (Pearl Millet)",
                Season = "Kharif 2026",
                SowingDate = DateTime.SpecifyKind(new DateTime(2026, 6, 20), DateTimeKind.Utc),
                ExpectedHarvestDate = DateTime.SpecifyKind(new DateTime(2026, 8, 5), DateTimeKind.Utc),
                EstimatedAreaInAcres = 2.50m,
                Status = "Harvested",
                CreatedAt = DateTime.UtcNow
            },
            new FarmCrop
            {
                Id = Guid.Parse("33333333-4444-5555-6666-777777777777"),
                FarmId = secondFarm.Id,
                CropName = "Foxtail Millet",
                Season = "Kharif 2026",
                SowingDate = DateTime.SpecifyKind(new DateTime(2026, 7, 1), DateTimeKind.Utc),
                ExpectedHarvestDate = DateTime.SpecifyKind(new DateTime(2026, 9, 25), DateTimeKind.Utc),
                EstimatedAreaInAcres = 4.00m,
                Status = "Harvested",
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.FarmCrops.AddRangeAsync(farmCrops);
        await context.SaveChangesAsync();
    }

    private static async Task SeedUsersAsync(AppDbContext context)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

        var seedAccounts = new (string Email, string Role, string MemberName)[]
        {
            ("fpo@shreeanna.com", Roles.FpoManager, "Rajesh Patel (FPO Manager)"),
            ("procurement@shreeanna.com", Roles.ProcurementOfficer, "Vikram Singh (Procurement Officer)"),
            ("quality@shreeanna.com", Roles.QualityInspector, "Ananya Roy (Quality Inspector)"),
            ("warehouse@shreeanna.com", Roles.WarehouseManager, "Suresh Kumar (Warehouse Manager)"),
            ("logistics@shreeanna.com", Roles.LogisticsCoordinator, "Ramesh Verma (Logistics Coordinator)"),
            ("accountant@shreeanna.com", Roles.Accountant, "Priya Sharma (Accountant)"),
            ("driver@shreeanna.com", Roles.Driver, "Ravi Kumar (Driver)"),
            ("processor@shreeanna.com", Roles.Processor, "Pooja Hegde (Millet Shakti SHG / Processor)"),
            ("customer@shreeanna.com", Roles.Customer, "Anil Sharma (Retail Customer)")
        };

        foreach (var acc in seedAccounts)
        {
            var existing = await context.Users.FirstOrDefaultAsync(u => u.Email == acc.Email);
            if (existing == null)
            {
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Email = acc.Email,
                    PasswordHash = passwordHash,
                    Role = acc.Role,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                context.Users.Add(user);
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedFarmersAsync(AppDbContext context)
    {
        if (await context.Farmers.AnyAsync())
        {
            return;
        }

        var farmers = new List<Farmer>
        {
            new Farmer
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                FarmerCode = "FAR-0001",
                FullName = "Ramesh Patel",
                Phone = "9876543210",
                Email = "ramesh@example.com",
                Address = "Bordi",
                District = "Dahod",
                Taluka = "Dahod",
                Village = "Bordi",
                DateOfBirth = new DateTime(1985, 5, 12, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            },

            new Farmer
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                FarmerCode = "FAR-0002",
                FullName = "Mahesh Vasava",
                Phone = "9876543211",
                Email = "mahesh@example.com",
                Address = "Bordi",
                District = "Dahod",
                Taluka = "Dahod",
                Village = "Bordi",
                DateOfBirth = new DateTime(1979, 8, 20, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            },

            new Farmer
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                FarmerCode = "FAR-0003",
                FullName = "Suresh Rathod",
                Phone = "9876543212",
                Email = "suresh@example.com",
                Address = "Dahod",
                District = "Dahod",
                Taluka = "Dahod",
                Village = "Dahod",
                DateOfBirth = new DateTime(1990, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Farmers.AddRangeAsync(farmers);
        await context.SaveChangesAsync();
    }

    private static async Task SeedFarmsAsync(AppDbContext context)
    {
        if (await context.Farms.AnyAsync())
        {
            return;
        }

        var farms = new List<Farm>
        {
            new Farm
            {
                Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                FarmCode = "FARM-0001",
                FarmerId = Guid.Parse(
                    "11111111-1111-1111-1111-111111111111"
                ),
                FarmName = "Ramesh Main Farm",
                AreaInAcres = 5.50m,
                SoilType = "Black Soil",
                SurveyNumber = "123/1",
                District = "Dahod",
                Taluka = "Dahod",
                Village = "Bordi",
                Latitude = 22.8397m,
                Longitude = 74.2558m,
                ImageUrl = "",
                Status = "Verified",
                CreatedAt = DateTime.UtcNow,
                VerifiedAt = DateTime.UtcNow,
                VerifiedBy = null
            },

            new Farm
            {
                Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                FarmCode = "FARM-0002",
                FarmerId = Guid.Parse(
                    "11111111-1111-1111-1111-111111111111"
                ),
                FarmName = "Ramesh North Farm",
                AreaInAcres = 3.25m,
                SoilType = "Black Soil",
                SurveyNumber = "124/2",
                District = "Dahod",
                Taluka = "Dahod",
                Village = "Bordi",
                Latitude = 22.8421m,
                Longitude = 74.2580m,
                ImageUrl = "",
                Status = "Pending Verification",
                CreatedAt = DateTime.UtcNow
            },

            new Farm
            {
                Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                FarmCode = "FARM-0003",
                FarmerId = Guid.Parse(
                    "22222222-2222-2222-2222-222222222222"
                ),
                FarmName = "Mahesh Millet Farm",
                AreaInAcres = 7.00m,
                SoilType = "Loamy Soil",
                SurveyNumber = "210/3",
                District = "Dahod",
                Taluka = "Dahod",
                Village = "Bordi",
                Latitude = 22.8405m,
                Longitude = 74.2602m,
                ImageUrl = "",
                Status = "Pending Verification",
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Farms.AddRangeAsync(farms);
        await context.SaveChangesAsync();
    }

    private static async Task SeedProcurementLotsAsync(AppDbContext context)
    {
        if (await context.ProcurementLots.AnyAsync())
        {
            return;
        }

        var crop1 = await context.FarmCrops.FirstOrDefaultAsync(c => c.Id == Guid.Parse("11111111-2222-3333-4444-555555555555"));
        var crop2 = await context.FarmCrops.FirstOrDefaultAsync(c => c.Id == Guid.Parse("22222222-3333-4444-5555-666666666666"));
        var crop3 = await context.FarmCrops.FirstOrDefaultAsync(c => c.Id == Guid.Parse("33333333-4444-5555-6666-777777777777"));

        if (crop1 == null || crop2 == null || crop3 == null)
        {
            return;
        }

        var farm1 = await context.Farms.FirstOrDefaultAsync(f => f.Id == crop1.FarmId);
        var farm3 = await context.Farms.FirstOrDefaultAsync(f => f.Id == crop3.FarmId);

        if (farm1 == null || farm3 == null)
        {
            return;
        }

        var lots = new List<ProcurementLot>
        {
            new ProcurementLot
            {
                Id = Guid.NewGuid(),
                LotNumber = "1042-A",
                FarmerId = farm1.FarmerId,
                FarmId = farm1.Id,
                FarmCropId = crop1.Id,
                EstimatedQuantityKg = 450,
                HarvestDate = DateTime.SpecifyKind(new DateTime(2026, 10, 12), DateTimeKind.Utc),
                SubmissionDate = DateTime.SpecifyKind(new DateTime(2026, 10, 12), DateTimeKind.Utc),
                Status = "SUBMITTED",
                Description = "High quality organic ragi",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ProcurementLot
            {
                Id = Guid.NewGuid(),
                LotNumber = "8472-B",
                FarmerId = farm1.FarmerId,
                FarmId = farm1.Id,
                FarmCropId = crop2.Id,
                EstimatedQuantityKg = 1200,
                HarvestDate = DateTime.SpecifyKind(new DateTime(2026, 8, 10), DateTimeKind.Utc),
                SubmissionDate = DateTime.SpecifyKind(new DateTime(2026, 8, 10), DateTimeKind.Utc),
                Status = "QUALITY_INSPECTION",
                Description = "Fresh harvest bajra lot",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new ProcurementLot
            {
                Id = Guid.NewGuid(),
                LotNumber = "1038-C",
                FarmerId = farm3.FarmerId,
                FarmId = farm3.Id,
                FarmCropId = crop3.Id,
                EstimatedQuantityKg = 850,
                HarvestDate = DateTime.SpecifyKind(new DateTime(2026, 9, 28), DateTimeKind.Utc),
                SubmissionDate = DateTime.SpecifyKind(new DateTime(2026, 9, 28), DateTimeKind.Utc),
                Status = "QUALITY_CERTIFIED",
                Description = "Foxtail millet ready for procurement",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        await context.ProcurementLots.AddRangeAsync(lots);
        await context.SaveChangesAsync();
    }

    private static async Task SeedWarehousesAsync(AppDbContext context)
    {
        if (await context.Warehouses.AnyAsync())
        {
            return;
        }

        var warehouses = new List<Warehouse>
        {
            new Warehouse
            {
                Id = Guid.Parse("aa000001-1111-1111-1111-111111111111"),
                WarehouseCode = "WH-GUJ-001",
                Name = "Dahod Rural Grain Warehouse",
                Location = "Bordi Village, Dahod, Gujarat",
                District = "Dahod",
                Taluka = "Dahod",
                Village = "Bordi",
                ManagerName = "Ramesh Patel",
                ContactPhone = "+91 98765 11111",
                CapacityInTons = 5000,
                UtilizedCapacityTons = 1200,
                Latitude = 22.8397m,
                Longitude = 74.2558m,
                StorageCondition = "Dry Grain, Aerated",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow
            },
            new Warehouse
            {
                Id = Guid.Parse("aa000002-2222-2222-2222-222222222222"),
                WarehouseCode = "WH-GUJ-002",
                Name = "Bharuch Agrico Warehouse",
                Location = "Nabipur Village, Bharuch, Gujarat",
                District = "Bharuch",
                Taluka = "Nabipur",
                Village = "Nabipur",
                ManagerName = "Karan Desai",
                ContactPhone = "+91 98765 22222",
                CapacityInTons = 7500,
                UtilizedCapacityTons = 2100,
                Latitude = 21.7051m,
                Longitude = 72.9959m,
                StorageCondition = "Cold Storage, Temperature Controlled",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow
            },
            new Warehouse
            {
                Id = Guid.Parse("aa000003-3333-3333-3333-333333333333"),
                WarehouseCode = "WH-GUJ-003",
                Name = "Amreli Farmer Grain Hub",
                Location = "Dhari Village, Amreli, Gujarat",
                District = "Amreli",
                Taluka = "Dhari",
                Village = "Dhari",
                ManagerName = "Bhavik Parmar",
                ContactPhone = "+91 98765 33333",
                CapacityInTons = 4000,
                UtilizedCapacityTons = 850,
                Latitude = 21.6032m,
                Longitude = 71.2221m,
                StorageCondition = "Dry Grain, Aerated",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow
            },
            new Warehouse
            {
                Id = Guid.Parse("aa000004-4444-4444-4444-444444444444"),
                WarehouseCode = "WH-GUJ-004",
                Name = "Anand Cooperative Warehouse",
                Location = "Petlad Village, Anand, Gujarat",
                District = "Anand",
                Taluka = "Petlad",
                Village = "Petlad",
                ManagerName = "Vikram Solanki",
                ContactPhone = "+91 98765 44444",
                CapacityInTons = 6000,
                UtilizedCapacityTons = 3100,
                Latitude = 22.5645m,
                Longitude = 72.9289m,
                StorageCondition = "Hermetic Storage, Moisture Control",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow
            },
            new Warehouse
            {
                Id = Guid.Parse("aa000005-5555-5555-5555-555555555555"),
                WarehouseCode = "WH-GUJ-005",
                Name = "Junagadh Agricultural Depository",
                Location = "Keshod Village, Junagadh, Gujarat",
                District = "Junagadh",
                Taluka = "Keshod",
                Village = "Keshod",
                ManagerName = "Hitesh Chavda",
                ContactPhone = "+91 98765 55555",
                CapacityInTons = 5500,
                UtilizedCapacityTons = 1400,
                Latitude = 21.5222m,
                Longitude = 70.4579m,
                StorageCondition = "Dry Grain, Aerated",
                Status = "ACTIVE",
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Warehouses.AddRangeAsync(warehouses);
        await context.SaveChangesAsync();
    }

    private static async Task SeedDriversAsync(AppDbContext context)
    {
        if (await context.Drivers.AnyAsync())
        {
            if (!await context.Drivers.AnyAsync(d => d.DriverCode == "DRV-005"))
            {
                context.Drivers.Add(new backend.Features.Logistics.Entities.Driver
                {
                    Id = Guid.Parse("d5555555-5555-5555-5555-555555555555"),
                    DriverCode = "DRV-005",
                    Name = "Vijay Patil (Inactive / Leave)",
                    Phone = "9876543215",
                    LicenseNumber = "KA0920190011223",
                    VehicleNumber = "KA-09-XX-9900",
                    VehicleCapacityKg = 6000,
                    Status = "INACTIVE",
                    CreatedAt = DateTime.UtcNow
                });
                await context.SaveChangesAsync();
            }
            return;
        }

        var drivers = new List<backend.Features.Logistics.Entities.Driver>
        {
            new backend.Features.Logistics.Entities.Driver
            {
                Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
                DriverCode = "DRV-001",
                Name = "Ravi Kumar",
                Phone = "9876543210",
                LicenseNumber = "KA0920201234567",
                VehicleNumber = "KA-09-AB-4521",
                VehicleCapacityKg = 7000,
                Status = "AVAILABLE",
                CreatedAt = DateTime.UtcNow
            },
            new backend.Features.Logistics.Entities.Driver
            {
                Id = Guid.Parse("d2222222-2222-2222-2222-222222222222"),
                DriverCode = "DRV-002",
                Name = "Suresh Gowda",
                Phone = "9876543211",
                LicenseNumber = "KA0920217654321",
                VehicleNumber = "KA-09-CD-8899",
                VehicleCapacityKg = 10000,
                Status = "AVAILABLE",
                CreatedAt = DateTime.UtcNow
            },
            new backend.Features.Logistics.Entities.Driver
            {
                Id = Guid.Parse("d3333333-3333-3333-3333-333333333333"),
                DriverCode = "DRV-003",
                Name = "Mahesh Naik",
                Phone = "9876543212",
                LicenseNumber = "KA0920229988776",
                VehicleNumber = "KA-09-EF-1122",
                VehicleCapacityKg = 5000,
                Status = "AVAILABLE",
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Drivers.AddRangeAsync(drivers);
        await context.SaveChangesAsync();
    }

    private static async Task SeedPurchaseRequestsAsync(AppDbContext context)
    {
        if (await context.PurchaseRequests.AnyAsync())
        {
            return;
        }

        var requests = new List<PurchaseRequest>
        {
            new PurchaseRequest
            {
                Id = Guid.Parse("aa111111-1111-1111-1111-111111111111"),
                RequestCode = "PR-2026-001",
                LotId = "LOT-2026-004",
                MilletType = "Pearl Millet",
                RequestedQuantityKg = 1250,
                IndicativePricePerKg = 32.00m,
                IndicativeValue = 40000m,
                FpoName = "Mandya FPO",
                ProcessorId = "proc-001",
                ProcessorName = "Millet Shakti SHG",
                SubmittedDate = DateTime.SpecifyKind(new DateTime(2026, 8, 22, 10, 15, 0), DateTimeKind.Utc),
                Status = "AGREEMENT_PROPOSED",
                AgreementId = "PPA-2026-004",
                AgreedQuantityKg = 1250,
                SellingPricePerKg = 32.50m,
                TotalValue = 40625m,
                AgreementValidUntil = DateTime.SpecifyKind(new DateTime(2026, 8, 27, 23, 59, 59), DateTimeKind.Utc),
                PaymentTerms = "100% advance before dispatch",
                OwnershipTransfer = "After payment confirmation and delivery",
                CancellationTerms = "Subject to agreement terms",
                PaymentStatus = "PENDING",
                DeliveryOtp = "9304",
                CreatedAt = DateTime.SpecifyKind(new DateTime(2026, 8, 22, 10, 15, 0), DateTimeKind.Utc),
                UpdatedAt = DateTime.SpecifyKind(new DateTime(2026, 8, 22, 14, 30, 0), DateTimeKind.Utc)
            },
            new PurchaseRequest
            {
                Id = Guid.Parse("aa222222-2222-2222-2222-222222222222"),
                RequestCode = "PR-2026-002",
                LotId = "LOT-2026-006",
                MilletType = "Foxtail Millet",
                RequestedQuantityKg = 800,
                IndicativePricePerKg = 34.00m,
                IndicativeValue = 27200m,
                FpoName = "Mysore FPO",
                ProcessorId = "proc-001",
                ProcessorName = "Millet Shakti SHG",
                SubmittedDate = DateTime.SpecifyKind(new DateTime(2026, 8, 21, 11, 30, 0), DateTimeKind.Utc),
                Status = "UNDER_NEGOTIATION",
                CreatedAt = DateTime.SpecifyKind(new DateTime(2026, 8, 21, 11, 30, 0), DateTimeKind.Utc),
                UpdatedAt = DateTime.SpecifyKind(new DateTime(2026, 8, 21, 16, 0, 0), DateTimeKind.Utc)
            },
            new PurchaseRequest
            {
                Id = Guid.Parse("aa333333-3333-3333-3333-333333333333"),
                RequestCode = "PR-2026-003",
                LotId = "LOT-2026-008",
                MilletType = "Finger Millet",
                RequestedQuantityKg = 500,
                IndicativePricePerKg = 30.00m,
                IndicativeValue = 15000m,
                FpoName = "Hassan FPO",
                ProcessorId = "proc-001",
                ProcessorName = "Millet Shakti SHG",
                SubmittedDate = DateTime.SpecifyKind(new DateTime(2026, 8, 20, 9, 0, 0), DateTimeKind.Utc),
                Status = "REQUESTED",
                CreatedAt = DateTime.SpecifyKind(new DateTime(2026, 8, 20, 9, 0, 0), DateTimeKind.Utc),
                UpdatedAt = DateTime.SpecifyKind(new DateTime(2026, 8, 20, 9, 0, 0), DateTimeKind.Utc)
            },
            new PurchaseRequest
            {
                Id = Guid.Parse("aa444444-4444-4444-4444-444444444444"),
                RequestCode = "PR-2026-004",
                LotId = "LOT-2026-002",
                MilletType = "Pearl Millet",
                RequestedQuantityKg = 1000,
                IndicativePricePerKg = 31.00m,
                IndicativeValue = 31000m,
                FpoName = "Mandya FPO",
                ProcessorId = "proc-001",
                ProcessorName = "Millet Shakti SHG",
                SubmittedDate = DateTime.SpecifyKind(new DateTime(2026, 8, 18, 14, 0, 0), DateTimeKind.Utc),
                Status = "REJECTED",
                CreatedAt = DateTime.SpecifyKind(new DateTime(2026, 8, 18, 14, 0, 0), DateTimeKind.Utc),
                UpdatedAt = DateTime.SpecifyKind(new DateTime(2026, 8, 19, 10, 0, 0), DateTimeKind.Utc)
            }
        };

        await context.PurchaseRequests.AddRangeAsync(requests);
        await context.SaveChangesAsync();
    }

    private static async Task SeedInventoryBatchesAsync(AppDbContext context)
    {
        if (await context.InventoryBatches.AnyAsync())
        {
            return;
        }

        var wh1 = await context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseCode == "WH-GUJ-001")
                  ?? await context.Warehouses.FirstOrDefaultAsync();
        var wh2 = await context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseCode == "WH-GUJ-004")
                  ?? wh1;
        var wh3 = await context.Warehouses.FirstOrDefaultAsync(w => w.WarehouseCode == "WH-GUJ-002")
                  ?? wh1;

        if (wh1 == null)
        {
            return;
        }

        var batch1 = new InventoryBatch
        {
            Id = Guid.Parse("b1111111-1111-1111-1111-111111111111"),
            BatchCode = "BAT-2026-FING-01",
            WarehouseId = wh1.Id,
            MilletType = "Finger Millet (Ragi)",
            QuantityInKg = 4500,
            Grade = "Grade A",
            Status = "IN_STOCK",
            ReceivedDate = DateTime.SpecifyKind(new DateTime(2026, 10, 4, 10, 0, 0), DateTimeKind.Utc)
        };

        var batch2 = new InventoryBatch
        {
            Id = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
            BatchCode = "BAT-2026-PEARL-02",
            WarehouseId = wh1.Id,
            MilletType = "Pearl Millet (Bajra)",
            QuantityInKg = 3200,
            Grade = "Grade A",
            Status = "IN_STOCK",
            ReceivedDate = DateTime.SpecifyKind(new DateTime(2026, 10, 8, 11, 30, 0), DateTimeKind.Utc)
        };

        var batch3 = new InventoryBatch
        {
            Id = Guid.Parse("b3333333-3333-3333-3333-333333333333"),
            BatchCode = "BAT-2026-FOX-03",
            WarehouseId = (wh2 ?? wh1).Id,
            MilletType = "Foxtail Millet",
            QuantityInKg = 2800,
            Grade = "Grade A+",
            Status = "IN_STOCK",
            ReceivedDate = DateTime.SpecifyKind(new DateTime(2026, 10, 11, 9, 15, 0), DateTimeKind.Utc)
        };

        var batch4 = new InventoryBatch
        {
            Id = Guid.Parse("b4444444-4444-4444-4444-444444444444"),
            BatchCode = "BAT-2026-LIT-04",
            WarehouseId = (wh3 ?? wh1).Id,
            MilletType = "Little Millet",
            QuantityInKg = 1950,
            Grade = "Grade A",
            Status = "ALLOCATED",
            ReceivedDate = DateTime.SpecifyKind(new DateTime(2026, 10, 13, 14, 0, 0), DateTimeKind.Utc)
        };

        var batches = new List<InventoryBatch> { batch1, batch2, batch3, batch4 };
        await context.InventoryBatches.AddRangeAsync(batches);

        var movements = new List<StockMovement>
        {
            new StockMovement
            {
                Id = Guid.NewGuid(),
                MovementCode = "MOV-2026-001",
                BatchId = batch1.Id,
                MovementType = "INBOUND",
                QuantityKg = 4500,
                FromLocation = "Procurement Lot LOT-001 (Dahod)",
                ToLocation = "Silo Bin Bay A-01",
                MovementDate = DateTime.SpecifyKind(new DateTime(2026, 10, 4, 11, 0, 0), DateTimeKind.Utc)
            },
            new StockMovement
            {
                Id = Guid.NewGuid(),
                MovementCode = "MOV-2026-002",
                BatchId = batch2.Id,
                MovementType = "INBOUND",
                QuantityKg = 3200,
                FromLocation = "Procurement Lot LOT-002 (Bhavnagar)",
                ToLocation = "Silo Bin Bay B-04",
                MovementDate = DateTime.SpecifyKind(new DateTime(2026, 10, 8, 12, 15, 0), DateTimeKind.Utc)
            },
            new StockMovement
            {
                Id = Guid.NewGuid(),
                MovementCode = "MOV-2026-003",
                BatchId = batch3.Id,
                MovementType = "INBOUND",
                QuantityKg = 2800,
                FromLocation = "Weighbridge Reception Bay",
                ToLocation = "Silo Bin Bay C-02",
                MovementDate = DateTime.SpecifyKind(new DateTime(2026, 10, 11, 10, 0, 0), DateTimeKind.Utc)
            },
            new StockMovement
            {
                Id = Guid.NewGuid(),
                MovementCode = "MOV-2026-004",
                BatchId = batch4.Id,
                MovementType = "TRANSFER",
                QuantityKg = 500,
                FromLocation = "Silo Bin Bay C-02",
                ToLocation = "Processor Packing Bay (DSP-2026-001)",
                MovementDate = DateTime.SpecifyKind(new DateTime(2026, 10, 15, 16, 20, 0), DateTimeKind.Utc)
            }
        };

        await context.StockMovements.AddRangeAsync(movements);
        await context.SaveChangesAsync();
    }

    private static async Task SeedMarketplaceProductsAsync(AppDbContext context)
    {
        var existingProducts = await context.MarketplaceProducts.ToListAsync();
        if (existingProducts.Count > 0)
        {
            // Ensure real images and processor brands are populated
            foreach (var p in existingProducts)
            {
                if (p.Title.Contains("Pearl") && string.IsNullOrEmpty(p.ImageUrl))
                {
                    p.ImageUrl = "/images/products/pearl_millet_flour.jpg";
                    p.Brand = "Millet Shakti SHG";
                    p.FarmerName = "Millet Shakti SHG (Processor)";
                    p.PricePerKg = 180.00m;
                    p.Status = "Active";
                }
                else if (p.Title.Contains("Foxtail") && string.IsNullOrEmpty(p.ImageUrl))
                {
                    p.ImageUrl = "/images/products/foxtail_upma_mix.jpg";
                    p.Title = "Organic Foxtail Millet Upma Mix";
                    p.Brand = "Dahod Women SHG";
                    p.FarmerName = "Dahod Women SHG (Processor)";
                    p.Category = "Ready-to-Eat";
                    p.PricePerKg = 95.00m;
                    p.Status = "Active";
                }
                else if (p.Title.Contains("Malt") && string.IsNullOrEmpty(p.ImageUrl))
                {
                    p.ImageUrl = "/images/products/ragi_cookies.jpg";
                    p.Title = "Ragi Cookies";
                    p.Brand = "Green Harvest SHG";
                    p.FarmerName = "Green Harvest SHG (Processor)";
                    p.Category = "Cookies";
                    p.PricePerKg = 120.00m;
                    p.Status = "Active";
                }
            }

            // Check if energy bars product exists, if not add it
            if (!existingProducts.Any(p => p.Title.Contains("Energy Bars")))
            {
                context.MarketplaceProducts.Add(new MarketplaceProduct
                {
                    Id = Guid.Parse("dd44ee55-6677-8899-0011-2233ddeeff00"),
                    Title = "Multi-Millet Energy Bars",
                    Category = "Snacks",
                    Brand = "Gramin Vikas FPO",
                    Description = "Nutrient-packed multi-millet snack bars with jaggery, chia seeds, and roasted almonds. 100% natural energy without refined sugars.",
                    LotId = "LOT-2026-003",
                    MilletType = "Multi-Millet",
                    FarmerName = "Gramin Vikas FPO (Processor)",
                    QuantityKg = 600,
                    PricePerKg = 160.00m,
                    Status = "Active",
                    ImageUrl = "/images/products/millet_energy_bars.jpg",
                    CreatedAt = DateTime.UtcNow.AddDays(-1),
                    IsDeleted = false
                });
            }

            await context.SaveChangesAsync();
            return;
        }

        var products = new List<MarketplaceProduct>
        {
            new MarketplaceProduct
            {
                Id = Guid.Parse("aa11bb22-3344-5566-7788-9900aabbccdd"),
                Title = "Pearl Millet Flour",
                Category = "Flours",
                Brand = "Millet Shakti SHG",
                Description = "Finely milled pearl millet (bajra) flour, stone-ground to preserve nutrients. Ideal for rotis, baking, and traditional flatbreads. Sourced from sustainable SHG processors.",
                LotId = "LOT-2026-004",
                MilletType = "Pearl Millet",
                FarmerName = "Millet Shakti SHG (Processor)",
                QuantityKg = 1500,
                PricePerKg = 180.00m,
                Status = "Active",
                ImageUrl = "/images/products/pearl_millet_flour.jpg",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                IsDeleted = false
            },
            new MarketplaceProduct
            {
                Id = Guid.Parse("bb22cc33-4455-6677-8899-0011bbccddee"),
                Title = "Ragi Cookies",
                Category = "Cookies",
                Brand = "Green Harvest SHG",
                Description = "Handcrafted artisan chocolate finger millet (ragi) cookies studded with roasted almonds and pistachios. High in calcium and 100% gluten-free.",
                LotId = "LOT-2026-001",
                MilletType = "Finger Millet (Ragi)",
                FarmerName = "Green Harvest SHG (Processor)",
                QuantityKg = 800,
                PricePerKg = 120.00m,
                Status = "Active",
                ImageUrl = "/images/products/ragi_cookies.jpg",
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                IsDeleted = false
            },
            new MarketplaceProduct
            {
                Id = Guid.Parse("cc33dd44-5566-7788-9900-1122ccddeeff"),
                Title = "Organic Foxtail Millet Upma Mix",
                Category = "Ready-to-Eat",
                Brand = "Dahod Women SHG",
                Description = "Instant wholesome breakfast upma mix made from unpolished foxtail millet, curry leaves, mustard seeds, and roasted cashews. Low GI superfood.",
                LotId = "LOT-2026-002",
                MilletType = "Foxtail Millet",
                FarmerName = "Dahod Women SHG (Processor)",
                QuantityKg = 500,
                PricePerKg = 95.00m,
                Status = "Active",
                ImageUrl = "/images/products/foxtail_upma_mix.jpg",
                CreatedAt = DateTime.UtcNow.AddDays(-7),
                IsDeleted = false
            },
            new MarketplaceProduct
            {
                Id = Guid.Parse("dd44ee55-6677-8899-0011-2233ddeeff00"),
                Title = "Multi-Millet Energy Bars",
                Category = "Snacks",
                Brand = "Gramin Vikas FPO",
                Description = "Nutrient-packed multi-millet snack bars with jaggery, chia seeds, and roasted almonds. 100% natural energy without refined sugars.",
                LotId = "LOT-2026-003",
                MilletType = "Multi-Millet",
                FarmerName = "Gramin Vikas FPO (Processor)",
                QuantityKg = 600,
                PricePerKg = 160.00m,
                Status = "Active",
                ImageUrl = "/images/products/millet_energy_bars.jpg",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                IsDeleted = false
            }
        };

        await context.MarketplaceProducts.AddRangeAsync(products);
        await context.SaveChangesAsync();
    }
}