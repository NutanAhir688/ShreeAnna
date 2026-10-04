import { useEffect, useState } from "react";
import { ArrowLeft, Package, Warehouse } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { inventoryApi } from "@/services/api";

function InventoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadItem() {
      try {
        const batches = await inventoryApi.getBatches();
        if (Array.isArray(batches)) {
          const match = batches.find((b) => b.id === id || b.batchCode === id);
          if (match) {
            setItem({
              id: match.batchCode || match.id,
              lotId: match.lotNumber || "LOT",
              farmerName: match.warehouseName || "Warehouse",
              farmName: "Farm Location",
              millet: match.milletType || "Millet",
              grade: match.grade || "Grade A",
              totalQuantity: match.quantityInKg || 0,
              reservedQuantity: 0,
              availableQuantity: match.quantityInKg || 0,
              unit: "kg",
              certificationId: "CERT-001",
              inspectionId: "INSP-001",
              warehouse: match.warehouseName || "Warehouse",
              warehouseLocation: match.warehouseName || "Warehouse Location",
              receivedDate: match.receivedDate ? new Date(match.receivedDate).toLocaleDateString() : "Recent",
              status: match.status || "IN_STOCK",
            });
          }
        }
      } catch (err) {
        console.error("Error loading inventory details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="font-semibold">
          Inventory record not found
        </h2>

        <button
          onClick={() => navigate("/inventory")}
          className="mt-4 rounded-lg border px-4 py-2 text-sm"
        >
          Back to Inventory
        </button>
      </div>
    );
  }

  const utilization =
    item.totalQuantity === 0
      ? 0
      : Math.round(
          (item.reservedQuantity / item.totalQuantity) * 100
        );

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/inventory")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Inventory
      </button>

      <div>
        <h1 className="text-2xl font-semibold">
          {item.lotId}
        </h1>

        <p className="text-sm text-muted-foreground">
          Inventory record {item.id}
        </p>
      </div>

      {/* Stock summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <StockCard
          title="Total Stock"
          value={`${item.totalQuantity} ${item.unit}`}
          icon={Package}
        />

        <StockCard
          title="Reserved Stock"
          value={`${item.reservedQuantity} ${item.unit}`}
          icon={Package}
        />

        <StockCard
          title="Available Stock"
          value={`${item.availableQuantity} ${item.unit}`}
          icon={Package}
        />
      </div>

      {/* Stock utilization */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Stock Utilization
            </h2>

            <p className="text-sm text-muted-foreground">
              Portion of stock reserved for buyer orders
            </p>
          </div>

          <span className="text-lg font-semibold">
            {utilization}%
          </span>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${utilization}%` }}
          />
        </div>
      </div>

      {/* Source + warehouse */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Stock Source
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Info
              label="Farmer"
              value={item.farmerName}
            />

            <Info
              label="Farm"
              value={item.farmName}
            />

            <Info
              label="Procurement Lot"
              value={item.lotId}
            />

            <Info
              label="Millet"
              value={`${item.millet} (${item.grade})`}
            />

            <Info
              label="Certification"
              value={item.certificationId}
            />

            <Info
              label="Inspection"
              value={item.inspectionId}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Warehouse
                size={20}
                className="text-purple-600"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Warehouse
              </h2>

              <p className="text-sm text-muted-foreground">
                Current storage location
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <Info
              label="Warehouse"
              value={item.warehouse}
            />

            <Info
              label="Location"
              value={item.warehouseLocation}
            />

            <Info
              label="Received Date"
              value={item.receivedDate}
            />

            <Info
              label="Inventory Status"
              value={item.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StockCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-muted p-2">
          <Icon size={20} />
        </div>

        <span className="text-sm text-muted-foreground">
          {title}
        </span>
      </div>

      <p className="mt-4 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

export default InventoryDetails;