using backend.Data;
using backend.Features.Warehouses.DTOs;
using backend.Features.Warehouses.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Warehouses.Services;

public interface IWarehouseService
{
    Task<List<WarehouseResponse>> GetAllAsync();
    Task<WarehouseResponse?> GetByIdAsync(Guid id);
    Task<WarehouseResponse> CreateAsync(CreateWarehouseRequest request);
}

public class WarehouseService : IWarehouseService
{
    private readonly AppDbContext _context;

    public WarehouseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WarehouseResponse>> GetAllAsync()
    {
        var warehouses = await _context.Warehouses.OrderBy(w => w.Name).ToListAsync();
        return warehouses.Select(Map).ToList();
    }

    public async Task<WarehouseResponse?> GetByIdAsync(Guid id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        return warehouse is null ? null : Map(warehouse);
    }

    public async Task<WarehouseResponse> CreateAsync(CreateWarehouseRequest request)
    {
        var count = await _context.Warehouses.CountAsync() + 1;
        var warehouse = new Warehouse
        {
            Id = Guid.NewGuid(),
            WarehouseCode = $"WH-00{count}",
            Name = request.Name,
            Location = request.Location,
            ManagerName = request.ManagerName,
            CapacityInTons = request.CapacityInTons,
            UtilizedCapacityTons = 0,
            Status = "ACTIVE",
            CreatedAt = DateTime.UtcNow
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return Map(warehouse);
    }

    private static WarehouseResponse Map(Warehouse w)
    {
        return new WarehouseResponse(
            w.Id,
            w.WarehouseCode,
            w.Name,
            w.Location,
            w.ManagerName,
            w.CapacityInTons,
            w.UtilizedCapacityTons,
            w.Status,
            w.CreatedAt
        );
    }
}
