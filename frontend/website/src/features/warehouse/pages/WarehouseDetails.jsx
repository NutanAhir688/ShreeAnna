import {
  ArrowLeft,
  MapPin,
  Package,
  Thermometer,
  User,
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

  const utilization = Math.round(
    (warehouse.usedCapacity /
      warehouse.capacity) *
      100
  );

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
            {warehouse.name}
          </h1>

          <p className="text-sm text-muted-foreground">
            {warehouse.code}
          </p>
        </div>

        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
          {warehouse.status}
        </span>
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
              {warehouse.usedCapacity} kg
            </strong>
          </span>

          <span className="text-muted-foreground">
            Available:{" "}
            {warehouse.availableCapacity} kg
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
              value={warehouse.name}
            />

            <Info
              icon={Package}
              label="Stock Lots"
              value={warehouse.stockLots}
            />

            <Info
              icon={MapPin}
              label="Location"
              value={warehouse.location}
            />

            <Info
              icon={MapPin}
              label="Address"
              value={warehouse.address}
            />

            <Info
              icon={User}
              label="Manager"
              value={warehouse.manager}
            />

            <Info
              icon={User}
              label="Contact"
              value={warehouse.contact}
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
              value={warehouse.storageCondition}
            />

            <Info
              icon={Package}
              label="Supported Millet"
              value={warehouse.milletTypes.join(", ")}
            />

            <Info
              icon={Package}
              label="Total Capacity"
              value={`${warehouse.capacity} kg`}
            />

            <Info
              icon={Package}
              label="Last Inspection"
              value={warehouse.lastInspection}
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