using backend.Features.Farmers.Entities;
using backend.Features.Farms.Entities;
using backend.Features.Procurement.Entities;
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

        await SeedFarmersAsync(context);
        await SeedFarmsAsync(context);
        await SeedUsersAsync(context);
        await SeedProcurementLotsAsync(context);
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
                MilletType = "Kodo Millet",
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
                MilletType = "Kodo Millet",
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
                MilletType = "Rabi Millet",
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

        var farm = await context.Farms.FirstOrDefaultAsync();
        if (farm == null)
        {
            return;
        }

        var secondFarm = await context.Farms.Skip(1).FirstOrDefaultAsync() ?? farm;

        var lots = new List<ProcurementLot>
        {
            new ProcurementLot
            {
                Id = Guid.NewGuid(),
                LotNumber = "1042-A",
                FarmerId = farm.FarmerId,
                FarmId = farm.Id,
                MilletType = "Finger Millet (Ragi)",
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
                FarmerId = farm.FarmerId,
                FarmId = farm.Id,
                MilletType = "Pearl Millet (Bajra)",
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
                FarmerId = secondFarm.FarmerId,
                FarmId = secondFarm.Id,
                MilletType = "Foxtail Millet",
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
}