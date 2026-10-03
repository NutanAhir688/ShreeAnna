using backend.Data;
using backend.Features.Farms.DTOs;
using backend.Features.Farms.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Farms.Services;

public class FarmService : IFarmService
{
    private readonly AppDbContext _context;

    public FarmService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FarmResponse> CreateAsync(
        Guid farmerId,
        CreateFarmRequest request)
    {
        var farmerExists = await _context.Farmers
            .AnyAsync(x => x.Id == farmerId);

        if (!farmerExists)
        {
            throw new KeyNotFoundException("Farmer not found.");
        }
        if (request.Crops is null || request.Crops.Count == 0)
        {
            throw new ArgumentException(
                "At least one crop must be added to the farm.");
        }
        var duplicateCrop = request.Crops
            .GroupBy(x => new
            {
                CropName = x.CropName.Trim().ToLower(),
                Season = x.Season.Trim().ToLower()
            })
            .Any(x => x.Count() > 1);

        if (duplicateCrop)
        {
            throw new ArgumentException(
                "The same crop cannot be added more than once for the same season.");
        }

        var farm = new Farm
        {
            Id = Guid.NewGuid(),

            FarmCode = await GenerateFarmCodeAsync(),

            FarmerId = farmerId,

            FarmName = request.FarmName.Trim(),
            AreaInAcres = request.AreaInAcres,
            SoilType = request.SoilType.Trim(),

            SurveyNumber = request.SurveyNumber.Trim(),

            District = request.District.Trim(),
            Taluka = request.Taluka.Trim(),
            Village = request.Village.Trim(),

            Latitude = request.Latitude,
            Longitude = request.Longitude,

            ImageUrl = request.ImageUrl?.Trim() ?? string.Empty,

            Status = "Pending Verification",

            CreatedAt = DateTime.UtcNow
        };

        foreach (var cropRequest in request.Crops)
        {
            farm.Crops.Add(new FarmCrop
            {
                Id = Guid.NewGuid(),

                CropName = cropRequest.CropName.Trim(),

                Season = cropRequest.Season.Trim(),

                SowingDate = DateTime.SpecifyKind(
                    cropRequest.SowingDate,
                    DateTimeKind.Utc),

                ExpectedHarvestDate =
                    cropRequest.ExpectedHarvestDate.HasValue
                        ? DateTime.SpecifyKind(
                            cropRequest.ExpectedHarvestDate.Value,
                            DateTimeKind.Utc)
                        : null,

                EstimatedAreaInAcres =
                    cropRequest.EstimatedAreaInAcres,

                Status = "Active",

                CreatedAt = DateTime.UtcNow
            });
        }

        await _context.Farms.AddAsync(farm);

        await _context.SaveChangesAsync();

        return MapToResponse(farm);
    }
    public async Task<List<FarmResponse>> GetByFarmerIdAsync(
        Guid farmerId)
    {
        var farms = await _context.Farms
            .AsNoTracking()
            .Include(x => x.Crops)
            .Where(x => x.FarmerId == farmerId)
            .ToListAsync();

        return farms
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<List<FarmResponse>> GetAllAsync()
    {
        var farms = await _context.Farms
            .AsNoTracking()
            .Include(x => x.Crops)
            .ToListAsync();

        return farms
            .Select(MapToResponse)
            .ToList();
    }

    public async Task<FarmResponse?> GetByIdAsync(Guid farmId)
    {
        var farm = await _context.Farms
            .AsNoTracking()
            .Include(x => x.Crops)
            .FirstOrDefaultAsync(x => x.Id == farmId);

        return farm is null
            ? null
            : MapToResponse(farm);
    }

    public async Task<FarmResponse?> UpdateAsync(
        Guid farmId,
        UpdateFarmRequest request)
    {
        var farm = await _context.Farms
            .FirstOrDefaultAsync(x => x.Id == farmId);

        if (farm is null)
        {
            return null;
        }

        farm.FarmName = request.FarmName;
        farm.AreaInAcres = request.AreaInAcres;
        farm.SoilType = request.SoilType;
        // farm.MilletType = request.MilletType;

        farm.District = request.District;
        farm.Taluka = request.Taluka;
        farm.Village = request.Village;

        farm.Latitude = request.Latitude;
        farm.Longitude = request.Longitude;

        farm.ImageUrl = request.ImageUrl;

        // Editing a verified farm requires verification again.
        if (farm.Status == "Verified")
        {
            farm.Status = "Pending Verification";
            farm.VerifiedAt = null;
            farm.VerifiedBy = null;
        }

        await _context.SaveChangesAsync();

        return MapToResponse(farm);
    }

    public async Task<bool> DeleteAsync(Guid farmId)
    {
        var farm = await _context.Farms
            .FirstOrDefaultAsync(x => x.Id == farmId);

        if (farm is null)
        {
            return false;
        }

        _context.Farms.Remove(farm);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ArchiveAsync(Guid farmId)
    {
        var farm = await _context.Farms
            .FirstOrDefaultAsync(x => x.Id == farmId);

        if (farm is null)
        {
            return false;
        }

        farm.Status = "Archived";

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<FarmResponse?> UpdateStatusAsync(Guid farmId, string status, string? verifiedBy = null)
    {
        var farm = await _context.Farms
            .FirstOrDefaultAsync(x => x.Id == farmId);

        if (farm is null)
        {
            return null;
        }

        farm.Status = status;
        if (status == "Verified")
        {
            farm.VerifiedAt = DateTime.UtcNow;
            if (Guid.TryParse(verifiedBy, out var parsedVerifiedBy))
            {
                farm.VerifiedBy = parsedVerifiedBy;
            }
        }

        await _context.SaveChangesAsync();

        return MapToResponse(farm);
    }

    private async Task<string> GenerateFarmCodeAsync()
    {
        var existingCodes = await _context.Farms
            .Select(x => x.FarmCode)
            .ToListAsync();

        var maxNumber = 0;
        foreach (var code in existingCodes)
        {
            if (code != null && code.StartsWith("FARM-") && int.TryParse(code.Substring(5), out var num))
            {
                if (num > maxNumber)
                {
                    maxNumber = num;
                }
            }
        }

        var nextNumber = maxNumber + 1;
        var candidateCode = $"FARM-{nextNumber:D4}";

        while (await _context.Farms.AnyAsync(x => x.FarmCode == candidateCode))
        {
            nextNumber++;
            candidateCode = $"FARM-{nextNumber:D4}";
        }

        return candidateCode;
    }

private static FarmResponse MapToResponse(Farm farm)
{
    return new FarmResponse
    {
        Id = farm.Id,
        FarmCode = farm.FarmCode,
        FarmerId = farm.FarmerId,
        FarmName = farm.FarmName,
        AreaInAcres = farm.AreaInAcres,
        SoilType = farm.SoilType,
        SurveyNumber = farm.SurveyNumber,
        District = farm.District,
        Taluka = farm.Taluka,
        Village = farm.Village,
        Latitude = farm.Latitude,
        Longitude = farm.Longitude,
        ImageUrl = farm.ImageUrl,
        Status = farm.Status,
        CreatedAt = farm.CreatedAt,
        VerifiedAt = farm.VerifiedAt,
        VerifiedBy = farm.VerifiedBy,

        Crops = farm.Crops
            .Select(c => new FarmCropResponse
            {
                Id = c.Id,
                CropName = c.CropName,
                Season = c.Season,
                SowingDate = c.SowingDate,
                ExpectedHarvestDate = c.ExpectedHarvestDate,
                EstimatedAreaInAcres = c.EstimatedAreaInAcres,
                Status = c.Status
            })
            .ToList()
    };
}

    private static FarmResponse MapToResponseExpression(Farm farm)
    {
        return new FarmResponse
        {
            Id = farm.Id,
            FarmCode = farm.FarmCode,
            FarmerId = farm.FarmerId,
            FarmName = farm.FarmName,
            AreaInAcres = farm.AreaInAcres,
            SoilType = farm.SoilType,
            // MilletType = farm.MilletType,
            SurveyNumber = farm.SurveyNumber,
            District = farm.District,
            Taluka = farm.Taluka,
            Village = farm.Village,
            Latitude = farm.Latitude,
            Longitude = farm.Longitude,
            ImageUrl = farm.ImageUrl,
            Status = farm.Status,
            CreatedAt = farm.CreatedAt,
            VerifiedAt = farm.VerifiedAt,
            VerifiedBy = farm.VerifiedBy
        };
    }
}