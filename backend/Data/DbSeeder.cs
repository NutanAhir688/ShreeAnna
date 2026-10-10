using backend.Features.Farmers.Entities;
using backend.Features.Farms.Entities;
using backend.Features.Procurement.Entities;
using backend.Features.Warehouses.Entities;
using Microsoft.EntityFrameworkCore;
using backend.Features.Fpo.Entities;
using backend.Features.Auth.Entities;
using backend.Features.Auth;

namespace backend.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.MigrateAsync();

        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
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
            await context.Database.ExecuteSqlRawAsync(@"
                ALTER TABLE ""Dispatches"" ADD COLUMN IF NOT EXISTS ""VerificationCode"" text NOT NULL DEFAULT '4829';
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
            ("accountant@shreeanna.com", Roles.Accountant, "Priya Sharma (Accountant)")
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
}