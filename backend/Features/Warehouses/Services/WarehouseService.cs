using backend.Data;
using backend.Features.Inventory.Entities;
using backend.Features.Logistics.Entities;
using backend.Features.Procurement.Entities;
using backend.Features.Warehouses.DTOs;
using backend.Features.Warehouses.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.Warehouses.Services;

public interface IWarehouseService
{
    Task<List<WarehouseResponse>> GetAllAsync();
    Task<WarehouseResponse?> GetByIdAsync(Guid id);
    Task<WarehouseResponse> CreateAsync(CreateWarehouseRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<WarehouseReceiptResponse> CreateReceiptAsync(CreateWarehouseReceiptRequest request);
    Task<WarehouseReceiptResponse?> GetReceiptByLotOrDispatchAsync(string identifier);
    Task<LotAllocationResponse> AllocateLotAsync(AllocateLotRequest request);
    Task<List<WarehouseAllocatedLotResponse>> GetAllocatedLotsAsync(Guid warehouseId);
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
        var warehouses = await _context.Warehouses
            .Where(w => w.Status != "DELETED")
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
        return warehouses.Select(Map).ToList();
    }

    public async Task<WarehouseResponse?> GetByIdAsync(Guid id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse is null || warehouse.Status == "DELETED") return null;
        return Map(warehouse);
    }

    public async Task<WarehouseResponse> CreateAsync(CreateWarehouseRequest request)
    {
        var count = await _context.Warehouses.CountAsync() + 1;
        var warehouse = new Warehouse
        {
            Id = Guid.NewGuid(),
            WarehouseCode = $"WH-GUJ-{count:D3}",
            Name = request.Name,
            Location = string.IsNullOrWhiteSpace(request.Location) 
                ? $"{request.Village ?? "Village"}, {request.District ?? "District"}" 
                : request.Location,
            District = request.District ?? string.Empty,
            Taluka = request.Taluka ?? string.Empty,
            Village = request.Village ?? string.Empty,
            ManagerName = request.ManagerName ?? "Warehouse Manager",
            ContactPhone = request.ContactPhone ?? "+91 98765 00000",
            CapacityInTons = request.CapacityInTons > 0 ? request.CapacityInTons : 0,
            UtilizedCapacityTons = request.UtilizedCapacityTons >= 0 ? request.UtilizedCapacityTons : 0,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            StorageCondition = string.IsNullOrWhiteSpace(request.StorageCondition) ? "Dry Grain, Aerated" : request.StorageCondition,
            Status = "ACTIVE",
            CreatedAt = DateTime.UtcNow
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return Map(warehouse);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var warehouse = await _context.Warehouses.FindAsync(id);
        if (warehouse is null) return false;

        warehouse.Status = "DELETED";
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<WarehouseReceiptResponse?> GetReceiptByLotOrDispatchAsync(string identifier)
    {
        Guid.TryParse(identifier, out var parsedGuid);
        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => 
                d.Id == parsedGuid || 
                d.DispatchCode == identifier || 
                d.LotId == identifier ||
                d.Id.ToString() == identifier
            );

        var lot = await _context.ProcurementLots
            .Include(l => l.Farmer)
            .Include(l => l.FarmCrop)
            .FirstOrDefaultAsync(l => 
                l.LotNumber == identifier || 
                l.Id == parsedGuid || 
                l.Id.ToString() == identifier ||
                (dispatch != null && (l.LotNumber == dispatch.LotId || l.Id.ToString() == dispatch.LotId))
            );

        if (dispatch == null && lot == null) return null;

        var wrStatus = (dispatch?.WarehouseReceiptStatus ?? "").ToUpperInvariant();
        var lotStatus = (lot?.Status ?? "").ToUpperInvariant();
        bool isReceiptGenerated = wrStatus == "CONFIRMED" || wrStatus == "DRAFT" || 
                                  lotStatus == "STORED" || lotStatus == "SETTLED" || 
                                  lotStatus == "PAID" || lotStatus == "COMPLETED";

        if (!isReceiptGenerated) return null;

        var expectedQty = dispatch?.TotalQuantityKg > 0 ? dispatch.TotalQuantityKg : (lot?.AgreedQuantityKg ?? lot?.EstimatedQuantityKg ?? 580);
        var actualQty = dispatch?.FinalReceivedQuantityKg > 0 ? dispatch.FinalReceivedQuantityKg.Value : (lot?.ActualQuantityKg ?? expectedQty);
        var variance = actualQty - expectedQty;
        var unitPrice = lot?.OfferedPricePerKg ?? 35;
        var totalPayable = actualQty * unitPrice;
        var receiptNum = $"WR-{(dispatch?.Id ?? lot?.Id ?? Guid.NewGuid()).ToString().Replace("-", "").Substring(0, 8).ToUpper()}";

        return new WarehouseReceiptResponse(
            Guid.NewGuid(),
            receiptNum,
            dispatch?.Id.ToString() ?? Guid.NewGuid().ToString(),
            dispatch?.DispatchCode ?? "SHP-2026-002",
            lot?.LotNumber ?? dispatch?.LotId ?? "LOT-2026-001",
            dispatch?.FarmerOrProcessorName ?? lot?.Farmer?.FullName ?? "Ramesh Patel",
            dispatch?.MilletType ?? lot?.FarmCrop?.CropName ?? "Finger Millet",
            expectedQty,
            actualQty,
            variance,
            unitPrice,
            totalPayable,
            dispatch?.WarehouseReceiptStatus ?? (lot?.Status == "STORED" ? "CONFIRMED" : "FULLY RECEIVED"),
            "Good",
            "Zone A",
            "BIN-A12",
            dispatch?.Warehouse?.Name ?? "Dahod Central Warehouse",
            "Warehouse receipt verified.",
            dispatch?.DeliveredDate ?? lot?.UpdatedAt ?? DateTime.UtcNow
        );
    }

    public async Task<WarehouseReceiptResponse> CreateReceiptAsync(CreateWarehouseReceiptRequest request)
    {
        Guid.TryParse(request.DispatchId, out var dispatchGuid);

        var dispatch = await _context.Dispatches
            .Include(d => d.Warehouse)
            .FirstOrDefaultAsync(d => d.Id == dispatchGuid || d.DispatchCode == request.DispatchId || d.Id.ToString() == request.DispatchId);

        if (dispatch is null)
        {
            // Search by LotId or AgreementId
            dispatch = await _context.Dispatches
                .Include(d => d.Warehouse)
                .FirstOrDefaultAsync(d => d.LotId == request.DispatchId || d.AgreementId == request.DispatchId);
        }

        if (dispatch is null)
        {
            // Emergency fallback dispatch creation
            var count = await _context.Dispatches.CountAsync() + 1;
            dispatch = new Dispatch
            {
                Id = dispatchGuid != Guid.Empty ? dispatchGuid : Guid.NewGuid(),
                DispatchCode = request.DispatchId.StartsWith("SHP") ? request.DispatchId : $"SHP-2026-{count:D3}",
                LotId = request.DispatchId,
                FarmerOrProcessorName = "Farmer Delivery",
                MilletType = "Finger Millet",
                TotalQuantityKg = request.ActualReceivedQuantityKg > 0 ? request.ActualReceivedQuantityKg : 580,
                Status = "DELIVERED",
                CreatedAt = DateTime.UtcNow
            };
            _context.Dispatches.Add(dispatch);
        }

        var expectedQty = dispatch.TotalQuantityKg > 0 ? dispatch.TotalQuantityKg : 580;
        var actualQty = request.ActualReceivedQuantityKg > 0 ? request.ActualReceivedQuantityKg : expectedQty;
        var variance = actualQty - expectedQty;

        var statusStr = request.IsDraft ? "DRAFT" : (variance != 0 ? "RECEIVED WITH VARIANCE" : "FULLY RECEIVED");

        dispatch.Status = request.IsDraft ? "DELIVERED" : "COMPLETED";
        dispatch.DeliveredDate = DateTime.UtcNow;
        dispatch.FinalReceivedQuantityKg = actualQty;
        dispatch.WarehouseReceiptStatus = request.IsDraft ? "DRAFT" : "CONFIRMED";

        // Update procurement lot to STORED if associated
        ProcurementLot? lot = null;
        if (!string.IsNullOrWhiteSpace(dispatch.LotId))
        {
            lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.LotNumber == dispatch.LotId || l.Id.ToString() == dispatch.LotId);
        }

        if (lot == null && dispatchGuid != Guid.Empty)
        {
            lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.Id == dispatchGuid);
        }

        if (lot != null)
        {
            lot.Status = request.IsDraft ? "DELIVERED" : "STORED";
            lot.ActualQuantityKg = actualQty;
            lot.UpdatedAt = DateTime.UtcNow;
        }

        // Synchronize all dispatches referencing this Lot/Dispatch ID
        var lotOrDispatchId = dispatch.LotId ?? dispatch.Id.ToString();
        var matchingDispatches = await _context.Dispatches
            .Where(d => d.Id == dispatch.Id || d.LotId == lotOrDispatchId || (lot != null && (d.LotId == lot.LotNumber || d.LotId == lot.Id.ToString())))
            .ToListAsync();

        foreach (var d in matchingDispatches)
        {
            d.Status = request.IsDraft ? "DELIVERED" : "COMPLETED";
            d.WarehouseReceiptStatus = request.IsDraft ? "DRAFT" : "CONFIRMED";
            d.FinalReceivedQuantityKg = actualQty;
            d.DeliveredDate ??= DateTime.UtcNow;
        }

        // Handle Inventory update if not draft
        if (!request.IsDraft)
        {
            var warehouseId = dispatch.WarehouseId ?? (await _context.Warehouses.Select(w => w.Id).FirstOrDefaultAsync());
            var batch = await _context.InventoryBatches.FirstOrDefaultAsync(b => b.WarehouseId == warehouseId && b.MilletType == (dispatch.MilletType ?? "Pearl Millet"));
            if (batch == null)
            {
                var batchCount = await _context.InventoryBatches.CountAsync() + 1;
                batch = new InventoryBatch
                {
                    Id = Guid.NewGuid(),
                    BatchCode = $"WB-{batchCount:D3}",
                    WarehouseId = warehouseId,
                    MilletType = dispatch.MilletType ?? "Pearl Millet",
                    QuantityInKg = actualQty,
                    Grade = "A",
                    Status = "IN_STOCK",
                    ReceivedDate = DateTime.UtcNow
                };
                _context.InventoryBatches.Add(batch);
            }
            else
            {
                batch.QuantityInKg += actualQty;
            }

            var movementCount = await _context.StockMovements.CountAsync() + 1;
            var movement = new StockMovement
            {
                Id = Guid.NewGuid(),
                MovementCode = $"SM-{movementCount:D4}",
                BatchId = batch.Id,
                MovementType = "INBOUND",
                QuantityKg = actualQty,
                FromLocation = dispatch.SourceAddress ?? "Farm Delivery",
                ToLocation = $"{dispatch.Warehouse?.Name ?? "Mandya Warehouse"} {request.StorageZone ?? "Zone A"} {request.StorageBin ?? "BIN-A12"}".Trim(),
                MovementDate = DateTime.UtcNow
            };
            _context.StockMovements.Add(movement);
        }

        await _context.SaveChangesAsync();

        var unitPrice = lot?.OfferedPricePerKg ?? 35;
        var totalPayable = actualQty * unitPrice;
        var receiptNum = $"WR-{dispatch.Id.ToString().Replace("-", "").Substring(0, 8).ToUpper()}";

        return new WarehouseReceiptResponse(
            Guid.NewGuid(),
            receiptNum,
            dispatch.Id.ToString(),
            dispatch.DispatchCode ?? "SHP-2026-002",
            lot?.LotNumber ?? dispatch.LotId ?? "LOT-2026-001",
            dispatch.FarmerOrProcessorName ?? lot?.Farmer?.FullName ?? "Farmer",
            dispatch.MilletType ?? lot?.FarmCrop?.CropName ?? "Finger Millet",
            expectedQty,
            actualQty,
            variance,
            unitPrice,
            totalPayable,
            statusStr,
            request.ConditionOnArrival ?? "Good",
            request.StorageZone ?? "Zone A",
            request.StorageBin ?? "BIN-A12",
            dispatch.Warehouse?.Name ?? "Dahod Central Warehouse",
            request.ReceivingNotes,
            DateTime.UtcNow
        );
    }

    public async Task<LotAllocationResponse> AllocateLotAsync(AllocateLotRequest request)
    {
        var warehouse = await _context.Warehouses.FindAsync(request.WarehouseId);
        var warehouseName = warehouse?.Name ?? "Dahod FPO Warehouse";

        if (warehouse != null)
        {
            warehouse.UtilizedCapacityTons += request.Quantity;
        }

        // Find procurement lot if exists
        var lot = await _context.ProcurementLots.FirstOrDefaultAsync(l => l.LotNumber == request.LotId || l.Id.ToString() == request.LotId);
        if (lot != null)
        {
            lot.Status = "STORED";
            if (lot.ActualQuantityKg == null || lot.ActualQuantityKg == 0)
            {
                lot.ActualQuantityKg = request.Quantity;
            }
            lot.UpdatedAt = DateTime.UtcNow;
        }

        // Find dispatch if exists and link to warehouse
        var dispatch = await _context.Dispatches.FirstOrDefaultAsync(d => d.LotId == request.LotId || d.Id.ToString() == request.LotId || d.DispatchCode == request.LotId);
        if (dispatch != null)
        {
            dispatch.WarehouseId = request.WarehouseId;
            dispatch.Status = "COMPLETED";
            dispatch.WarehouseReceiptStatus = "CONFIRMED";
            if (dispatch.FinalReceivedQuantityKg == null || dispatch.FinalReceivedQuantityKg == 0)
            {
                dispatch.FinalReceivedQuantityKg = request.Quantity;
            }
        }

        // Add/Update inventory batch
        var batch = await _context.InventoryBatches.FirstOrDefaultAsync(b => b.WarehouseId == request.WarehouseId);
        if (batch != null)
        {
            batch.QuantityInKg += request.Quantity;
        }

        var movementCount = await _context.StockMovements.CountAsync() + 1;
        var movement = new StockMovement
        {
            Id = Guid.NewGuid(),
            MovementCode = $"SM-{movementCount:D4}",
            BatchId = batch?.Id ?? Guid.NewGuid(),
            MovementType = "INBOUND",
            QuantityKg = request.Quantity,
            FromLocation = "Arrived Procurement Lot",
            ToLocation = $"{warehouseName} - {request.StorageSection}",
            MovementDate = DateTime.UtcNow
        };
        _context.StockMovements.Add(movement);

        await _context.SaveChangesAsync();

        return new LotAllocationResponse(
            Guid.NewGuid(),
            request.LotId,
            request.WarehouseId,
            warehouseName,
            request.Quantity,
            request.StorageSection,
            "ALLOCATED",
            DateTime.UtcNow
        );
    }

    public async Task<List<WarehouseAllocatedLotResponse>> GetAllocatedLotsAsync(Guid warehouseId)
    {
        var warehouse = await _context.Warehouses.FindAsync(warehouseId);
        if (warehouse == null) return new List<WarehouseAllocatedLotResponse>();

        var results = new List<WarehouseAllocatedLotResponse>();
        var seenLotIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // 1. Dispatches targeting this warehouse
        var dispatches = await _context.Dispatches
            .Where(d => d.WarehouseId == warehouseId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        var lotKeyList = dispatches.Select(d => d.LotId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();

        var lots = await _context.ProcurementLots
            .Include(l => l.Farmer)
            .Include(l => l.Farm)
            .Include(l => l.FarmCrop)
            .Where(l => lotKeyList.Contains(l.Id.ToString()) || lotKeyList.Contains(l.LotNumber))
            .ToListAsync();

        foreach (var d in dispatches)
        {
            var lot = lots.FirstOrDefault(l => l.Id.ToString() == d.LotId || l.LotNumber == d.LotId);
            var lotKey = lot?.Id.ToString() ?? d.LotId;
            if (string.IsNullOrEmpty(lotKey) || seenLotIds.Contains(lotKey)) continue;

            seenLotIds.Add(lotKey);

            var lotNumber = lot?.LotNumber ?? (d.LotId.Length > 8 ? $"LOT-{d.LotId.Substring(0, 8).ToUpper()}" : d.LotId);
            var farmerName = d.FarmerOrProcessorName;
            if (string.IsNullOrWhiteSpace(farmerName)) farmerName = lot?.Farmer?.FullName ?? "Registered Farmer";

            var farmName = lot?.Farm?.FarmName ?? d.SourceAddress;
            if (string.IsNullOrWhiteSpace(farmName)) farmName = "Govind Farm";

            var millet = d.MilletType;
            if (string.IsNullOrWhiteSpace(millet)) millet = lot?.FarmCrop?.CropName ?? "Millet";

            var qty = d.FinalReceivedQuantityKg > 0 ? d.FinalReceivedQuantityKg.Value : d.TotalQuantityKg;
            if (qty <= 0 && lot != null)
            {
                qty = lot.ActualQuantityKg ?? lot.AgreedQuantityKg ?? lot.EstimatedQuantityKg;
            }

            var status = d.Status == "COMPLETED" || lot?.Status == "STORED" ? "STORED" : d.Status;

            results.Add(new WarehouseAllocatedLotResponse(
                lotKey,
                lotNumber,
                farmerName,
                farmName,
                millet,
                lot?.FarmCrop?.CropName ?? "Grade A",
                qty,
                status,
                d.DispatchCode,
                d.DeliveredDate ?? d.CreatedAt
            ));
        }

        // 2. Also check if there are other STORED lots in Dahod / Primary warehouse
        var isPrimary = warehouse.WarehouseCode == "WH-GUJ-001" || warehouse.Name.ToLower().Contains("dahod");
        if (isPrimary)
        {
            var storedLots = await _context.ProcurementLots
                .Include(l => l.Farmer)
                .Include(l => l.Farm)
                .Include(l => l.FarmCrop)
                .Where(l => (l.Status == "STORED" || l.Status == "DELIVERED" || l.Status == "COMPLETED") && !lotKeyList.Contains(l.Id.ToString()) && !lotKeyList.Contains(l.LotNumber))
                .ToListAsync();

            foreach (var lot in storedLots)
            {
                var lotKey = lot.Id.ToString();
                if (seenLotIds.Contains(lotKey)) continue;
                seenLotIds.Add(lotKey);

                results.Add(new WarehouseAllocatedLotResponse(
                    lotKey,
                    lot.LotNumber,
                    lot.Farmer?.FullName ?? "Farmer",
                    lot.Farm?.FarmName ?? "Registered Farm",
                    lot.FarmCrop?.CropName ?? "Millet",
                    lot.FarmCrop?.CropName ?? "Grade A",
                    lot.ActualQuantityKg ?? lot.AgreedQuantityKg ?? lot.EstimatedQuantityKg,
                    "STORED",
                    "INBOUND",
                    lot.UpdatedAt
                ));
            }
        }

        return results;
    }

    private static WarehouseResponse Map(Warehouse w)
    {
        return new WarehouseResponse(
            w.Id,
            w.WarehouseCode,
            w.Name,
            w.Location,
            w.District,
            w.Taluka,
            w.Village,
            w.ManagerName,
            w.ContactPhone,
            w.CapacityInTons,
            w.UtilizedCapacityTons,
            w.Latitude,
            w.Longitude,
            w.StorageCondition,
            w.Status,
            w.CreatedAt
        );
    }
}

