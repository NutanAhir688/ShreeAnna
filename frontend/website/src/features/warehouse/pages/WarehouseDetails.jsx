import {
  ArrowLeft,
  MapPin,
  Package,
  Thermometer,
  User,
  Trash2,
  Warehouse as WarehouseIcon,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { warehousesApi } from "@/services/api";

function WarehouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadWarehouse() {
      try {
        const data = await warehousesApi.getById(id);
        if (data) setWarehouse(data);
      } catch (err) {
        console.error("Failed to fetch warehouse details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWarehouse();
  }, [id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${warehouse?.name || "this warehouse"}"? This will soft delete the warehouse record.`
      )
    ) {
      setDeleting(true);
      try {
        await warehousesApi.delete(id);
        navigate("/warehouses");
      } catch (err) {
        console.error("Failed to delete warehouse:", err);
        alert(err.message || "Failed to delete warehouse.");
      } finally {
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="font-semibold">
          Warehouse not found
        </h2>

        <button
          onClick={() => navigate("/warehouses")}
          className="mt-4 rounded-lg border px-4 py-2 text-sm"
        >
          Back to Warehouses
        </button>
      </div>
    );
  }

  const rawCap = warehouse.capacityInTons !== undefined && warehouse.capacityInTons !== null
    ? Number(warehouse.capacityInTons)
    : (warehouse.capacity !== undefined && warehouse.capacity !== null ? Number(warehouse.capacity) : 0);

  const rawUsed = warehouse.utilizedCapacityTons !== undefined && warehouse.utilizedCapacityTons !== null
    ? Number(warehouse.utilizedCapacityTons)
    : (warehouse.usedCapacity !== undefined && warehouse.usedCapacity !== null ? Number(warehouse.usedCapacity) : 0);

  const capKg = rawCap;
  const usedKg = rawUsed;
  const availKg = Math.max(0, capKg - usedKg);
  const utilization = capKg > 0 ? Math.round((usedKg / capKg) * 100) : 0;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/warehouses")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Warehouses
      </button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            {warehouse.name || warehouse.Name || "Warehouse Details"}
          </h1>

          <p className="text-sm text-muted-foreground">
            {warehouse.code || warehouse.warehouseCode || "WH-GUJ"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
            {warehouse.status || "ACTIVE"}
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-xs"
          >
            <Trash2 size={15} />
            {deleting ? "Deleting..." : "Delete Warehouse"}
          </button>
        </div>
      </div>

      {/* Capacity */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Package
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Storage Capacity
              </h2>

              <p className="text-sm text-muted-foreground">
                Current warehouse utilization
              </p>
            </div>
          </div>

          <span className="text-xl font-semibold">
            {utilization}%
          </span>
        </div>

        <div className="mt-5 h-4 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${utilization}%`,
            }}
          />
        </div>

        <div className="mt-3 flex justify-between text-sm">
          <span>
            Used:{" "}
            <strong>
              {usedKg.toLocaleString('en-IN')} kg
            </strong>
          </span>

          <span className="text-muted-foreground">
            Available:{" "}
            {availKg.toLocaleString('en-IN')} kg
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Warehouse Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Info
              icon={WarehouseIcon}
              label="Warehouse"
              value={warehouse.name || warehouse.Name}
            />

            <Info
              icon={Package}
              label="Stock Lots"
              value={warehouse.stockLots || 8}
            />

            <Info
              icon={MapPin}
              label="Location"
              value={warehouse.location || `${warehouse.district || warehouse.District || ""}, Gujarat`}
            />

            <Info
              icon={MapPin}
              label="Address"
              value={warehouse.address || warehouse.location || `${warehouse.village || ""}, ${warehouse.taluka || ""}, ${warehouse.district || ""}`}
            />

            <Info
              icon={User}
              label="Manager"
              value={warehouse.managerName || warehouse.manager || "N/A"}
            />

            <Info
              icon={User}
              label="Contact"
              value={warehouse.contactPhone || warehouse.contact || "N/A"}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Storage Conditions
          </h2>

          <div className="mt-5 space-y-5">
            <Info
              icon={Thermometer}
              label="Storage Condition"
              value={warehouse.storageCondition || "Dry Grain, Aerated"}
            />

            <Info
              icon={Package}
              label="Supported Millet"
              value={Array.isArray(warehouse.milletTypes) ? warehouse.milletTypes.join(", ") : warehouse.milletTypes || "Pearl Millet (Bajra), Sorghum (Jowar), Finger Millet (Ragi)"}
            />

            <Info
              icon={Package}
              label="Total Capacity"
              value={`${capKg.toLocaleString('en-IN')} kg`}
            />

            <Info
              icon={Package}
              label="Last Inspection"
              value={warehouse.lastInspection || "2026-09-28"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 rounded-lg bg-muted p-2">
        <Icon size={16} />
      </div>

      <div>
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

export default WarehouseDetails;