using backend.Data;
using backend.Features.Inventory.DTOs;
using backend.Features.Inventory.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Inventory.Services;

public interface IInventoryService
{
    Task<List<InventoryBatchResponse>> GetAllBatchesAsync();
    Task<List<StockMovementResponse>> GetAllMovementsAsync();
    Task<StockMovementResponse> CreateMovementAsync(CreateStockMovementRequest request);
}

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryBatchResponse>> GetAllBatchesAsync()
    {
        var batches = await _context.InventoryBatches
            .Include(x => x.Lot)
            .Include(x => x.Warehouse)
            .OrderByDescending(x => x.ReceivedDate)
            .ToListAsync();

        return batches.Select(b => new InventoryBatchResponse(
            b.Id,
            b.BatchCode,
            b.LotId,
            b.Lot?.LotNumber,
            b.WarehouseId,
            b.Warehouse?.Name ?? "Warehouse",
            b.MilletType,
            b.QuantityInKg,
            b.Grade,
            b.Status,
            b.ReceivedDate
        )).ToList();
    }

    public async Task<List<StockMovementResponse>> GetAllMovementsAsync()
    {
        var movements = await _context.StockMovements
            .Include(x => x.Batch)
            .OrderByDescending(x => x.MovementDate)
            .ToListAsync();

        return movements.Select(m => new StockMovementResponse(
            m.Id,
            m.MovementCode,
            m.BatchId,
            m.Batch?.BatchCode ?? "BATCH",
            m.MovementType,
            m.QuantityKg,
            m.FromLocation,
            m.ToLocation,
            m.MovementDate
        )).ToList();
    }

    public async Task<StockMovementResponse> CreateMovementAsync(CreateStockMovementRequest request)
    {
        var batch = await _context.InventoryBatches.FindAsync(request.BatchId);
        if (batch is null)
        {
            throw new KeyNotFoundException("Inventory batch not found.");
        }

        var count = await _context.StockMovements.CountAsync() + 1;
        var movement = new StockMovement
        {
            Id = Guid.NewGuid(),
            MovementCode = $"MOV-{Random.Shared.Next(1000, 9999)}",
            BatchId = request.BatchId,
            Batch = batch,
            MovementType = request.MovementType,
            QuantityKg = request.QuantityKg,
            FromLocation = request.FromLocation,
            ToLocation = request.ToLocation,
            MovementDate = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        return new StockMovementResponse(
            movement.Id,
            movement.MovementCode,
            movement.BatchId,
            batch.BatchCode,
            movement.MovementType,
            movement.QuantityKg,
            movement.FromLocation,
            movement.ToLocation,
            movement.MovementDate
        );
    }
}
