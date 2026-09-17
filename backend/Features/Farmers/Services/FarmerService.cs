using backend.Data;
using backend.Features.Farmers.DTOs;
using backend.Features.Farmers.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Farmers.Services;

public class FarmerService : IFarmerService
{
    private readonly AppDbContext _context;

    public FarmerService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FarmerResponse> CreateAsync(
        CreateFarmerRequest request)
    {
        var farmer = new Farmer
        {
            Id = Guid.NewGuid(),
            FarmerCode = await GenerateFarmerCodeAsync(),
            FullName = request.FullName,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            District = request.District,
            Taluka = request.Taluka,
            Village = request.Village,
            DateOfBirth = request.DateOfBirth,
            Status = "Active",
            CreatedAt = DateTime.UtcNow
        };

        _context.Farmers.Add(farmer);

        await _context.SaveChangesAsync();

        return MapToResponse(farmer);
    }

    public async Task<List<FarmerResponse>> GetAllAsync()
    {
        return await _context.Farmers
            .AsNoTracking()
            .Select(f => new FarmerResponse
            {
                Id = f.Id,
                FarmerCode = f.FarmerCode,
                FullName = f.FullName,
                Phone = f.Phone,
                Email = f.Email,
                Address = f.Address,
                District = f.District,
                Taluka = f.Taluka,
                Village = f.Village,
                DateOfBirth = f.DateOfBirth,
                Status = f.Status,
                CreatedAt = f.CreatedAt,
                FarmCount = f.Farms.Count,
                TotalLandInAcres = f.Farms.Sum(farm => farm.AreaInAcres)
            })
            .ToListAsync();
    }

    public async Task<FarmerResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Farmers
            .AsNoTracking()
            .Where(f => f.Id == id)
            .Select(f => new FarmerResponse
            {
                Id = f.Id,
                FarmerCode = f.FarmerCode,
                FullName = f.FullName,
                Phone = f.Phone,
                Email = f.Email,
                Address = f.Address,
                District = f.District,
                Taluka = f.Taluka,
                Village = f.Village,
                DateOfBirth = f.DateOfBirth,
                Status = f.Status,
                CreatedAt = f.CreatedAt,
                FarmCount = f.Farms.Count,
                TotalLandInAcres = f.Farms.Sum(farm => farm.AreaInAcres)
            })
            .FirstOrDefaultAsync();
    }

    public async Task<FarmerResponse?> UpdateAsync(
        Guid id,
        UpdateFarmerRequest request)
    {
        var farmer = await _context.Farmers
            .FirstOrDefaultAsync(f => f.Id == id);

        if (farmer is null)
        {
            return null;
        }

        farmer.FullName = request.FullName;
        farmer.Phone = request.Phone;
        farmer.Email = request.Email;
        farmer.Address = request.Address;
        farmer.District = request.District;
        farmer.Taluka = request.Taluka;
        farmer.Village = request.Village;
        farmer.DateOfBirth = request.DateOfBirth;

        await _context.SaveChangesAsync();

        return MapToResponse(farmer);
    }

    public async Task<bool> ChangeStatusAsync(
        Guid id,
        string status)
    {
        var farmer = await _context.Farmers
            .FirstOrDefaultAsync(f => f.Id == id);

        if (farmer is null)
        {
            return false;
        }

        farmer.Status = status;

        await _context.SaveChangesAsync();

        return true;
    }

    private async Task<string> GenerateFarmerCodeAsync()
    {
        var existingCodes = await _context.Farmers
            .Select(x => x.FarmerCode)
            .ToListAsync();

        var maxNumber = 0;
        foreach (var code in existingCodes)
        {
            if (code != null && code.StartsWith("FAR-") && int.TryParse(code.Substring(4), out var num))
            {
                if (num > maxNumber)
                {
                    maxNumber = num;
                }
            }
        }

        var nextNumber = maxNumber + 1;
        var candidateCode = $"FAR-{nextNumber:D4}";

        while (await _context.Farmers.AnyAsync(x => x.FarmerCode == candidateCode))
        {
            nextNumber++;
            candidateCode = $"FAR-{nextNumber:D4}";
        }

        return candidateCode;
    }

    private static FarmerResponse MapToResponse(Farmer farmer)
    {
        return new FarmerResponse
        {
            Id = farmer.Id,
            FarmerCode = farmer.FarmerCode,
            FullName = farmer.FullName,
            Phone = farmer.Phone,
            Email = farmer.Email,
            Address = farmer.Address,
            District = farmer.District,
            Taluka = farmer.Taluka,
            Village = farmer.Village,
            DateOfBirth = farmer.DateOfBirth,
            Status = farmer.Status,
            CreatedAt = farmer.CreatedAt,
            FarmCount = farmer.Farms?.Count ?? 0,
            TotalLandInAcres = farmer.Farms?.Sum(farm => farm.AreaInAcres) ?? 0
        };
    }
}