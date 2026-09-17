using backend.Features.Auth.Entities;
using backend.Features.Farmers.Entities;
using backend.Features.Farms.Entities;
using backend.Features.Fpo.Entities;
using backend.Features.Procurement.Entities;
using backend.Features.Quality.Entities;
using backend.Features.Warehouses.Entities;
using backend.Features.Inventory.Entities;
using backend.Features.Logistics.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<FpoMember> FpoMembers => Set<FpoMember>();

    public DbSet<Farmer> Farmers => Set<Farmer>();

    public DbSet<Farm> Farms => Set<Farm>();
    public DbSet<FarmerOtp> FarmerOtps => Set<FarmerOtp>();
    public DbSet<ProcurementLot> ProcurementLots => Set<ProcurementLot>();
    public DbSet<Inspection> Inspections => Set<Inspection>();
    public DbSet<QualityCertificate> QualityCertificates => Set<QualityCertificate>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<InventoryBatch> InventoryBatches => Set<InventoryBatch>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Dispatch> Dispatches => Set<Dispatch>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureFpoMember(modelBuilder);
        ConfigureFarmer(modelBuilder);
        ConfigureFarm(modelBuilder);
        ConfigureFarmerOtp(modelBuilder);
        ConfigureProcurementLot(modelBuilder);
    }
    private static void ConfigureFarmerOtp(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FarmerOtp>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Phone)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(x => x.OtpHash)
                .IsRequired();

            entity.Property(x => x.ExpiresAt)
                .IsRequired();

            entity.Property(x => x.IsUsed)
                .IsRequired();

            entity.Property(x => x.Attempts)
                .IsRequired();

            entity.Property(x => x.CreatedAt)
                .IsRequired();

            entity.HasIndex(x => x.Phone);
        });
    }
        private static void ConfigureUser(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.PasswordHash)
                .IsRequired();

            entity.Property(x => x.Role)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(x => x.Email)
                .IsUnique();

            entity.HasOne(x => x.FpoMember)
                .WithOne(x => x.User)
                .HasForeignKey<User>(x => x.FpoMemberId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.Property(x => x.RefreshToken)
                .HasMaxLength(250);

            entity.Property(x => x.RefreshTokenExpiryTime);
        });
    }

    private static void ConfigureFpoMember(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FpoMember>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.EmployeeCode)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.Role)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(x => x.EmployeeCode)
                .IsUnique();
        });
    }

    private static void ConfigureFarmer(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Farmer>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.FarmerCode)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(x => x.FullName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.Phone)
                .IsRequired()
                .HasMaxLength(20);

            entity.Property(x => x.Email)
                .HasMaxLength(150);

            entity.Property(x => x.Address)
                .IsRequired()
                .HasMaxLength(250);

            entity.Property(x => x.District)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Taluka)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Village)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(30);

            entity.HasIndex(x => x.FarmerCode)
                .IsUnique();
        });
    }

    private static void ConfigureFarm(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Farm>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.FarmCode)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(x => x.FarmName)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.AreaInAcres)
                .HasPrecision(10, 2);

            entity.Property(x => x.SoilType)
                .HasMaxLength(100);

            entity.Property(x => x.SurveyNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(x => x.District)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Taluka)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Village)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.Latitude)
                .HasPrecision(10, 7);

            entity.Property(x => x.Longitude)
                .HasPrecision(10, 7);

            entity.Property(x => x.ImageUrl)
                .HasMaxLength(500);

            entity.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(x => x.FarmCode)
                .IsUnique();

            entity.HasOne(x => x.Farmer)
                .WithMany(x => x.Farms)
                .HasForeignKey(x => x.FarmerId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }

    private static void ConfigureProcurementLot(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ProcurementLot>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.LotNumber)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(x => x.MilletType)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(x => x.EstimatedQuantityKg)
                .HasPrecision(10, 2);

            entity.Property(x => x.ActualQuantityKg)
                .HasPrecision(10, 2);

            entity.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(x => x.Description)
                .HasMaxLength(500);

            entity.HasOne(x => x.Farmer)
                .WithMany()
                .HasForeignKey(x => x.FarmerId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.Farm)
                .WithMany()
                .HasForeignKey(x => x.FarmId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}