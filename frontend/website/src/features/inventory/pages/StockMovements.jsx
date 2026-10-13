import { useEffect, useMemo, useState } from "react";
import { ArrowDownToLine, Loader2, Plus, Search } from "lucide-react";

import StockMovementTable from "../components/StockMovementTable";
import ReceiveStockForm from "../components/ReceiveStockForm";
import { inventoryApi, lotsApi, warehousesApi } from "@/services/api";

function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [lots, setLots] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [showReceiveForm, setShowReceiveForm] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, lotsData, whData] = await Promise.all([
        inventoryApi.getMovements().catch(() => []),
        lotsApi.getAll().catch(() => []),
        warehousesApi.getAll().catch(() => []),
      ]);

      const rawMovs = Array.isArray(movementsData) ? movementsData : [];
      const rawLots = Array.isArray(lotsData) ? lotsData : [];
      const rawWh = Array.isArray(whData) ? whData : [];

      setLots(rawLots);
      setWarehouses(rawWh);

      const lotsMap = {};
      rawLots.forEach((l) => {
        lotsMap[l.id] = l;
        if (l.lotNumber) lotsMap[l.lotNumber] = l;
      });

      const processed = rawMovs.map((m, index) => {
        const id = m.id || `SM-000${index + 1}`;
        const movementCode =
          m.movementCode ||
          `SM-${(index + 1).toString().padStart(4, "0")}`;

        const matchingLot =
          lotsMap[m.lotId] ||
          lotsMap[m.batchCode] ||
          rawLots[index % Math.max(1, rawLots.length)] ||
          null;

        const lotId =
          m.lotId ||
          matchingLot?.lotNumber ||
          (matchingLot?.id ? `LOT-${matchingLot.id.slice(0, 6).toUpperCase()}` : "LOT-2026-001");

        const millet =
          m.milletType ||
          m.millet ||
          matchingLot?.milletType ||
          matchingLot?.farmCrop ||
          "Pearl Millet (Bajra)";

        const rawType = String(
          m.movementType || m.type || "INBOUND"
        ).toUpperCase();

        let movementType = rawType;
        if (rawType === "INBOUND" || rawType.includes("RECEIV")) {
          movementType = "Stock Received";
        } else if (rawType === "OUTBOUND" || rawType.includes("RESERV")) {
          movementType = "Stock Reserved";
        } else if (rawType === "TRANSFER") {
          movementType = "Stock Transfer";
        }

        const quantityKg = Number(
          m.quantityKg ?? m.quantity ?? matchingLot?.actualQuantityKg ?? 500
        );

        const warehouse =
          m.toLocation ||
          m.warehouse ||
          matchingLot?.warehouseName ||
          "Dahod FPO Warehouse - BIN-A12";

        const fromLocation =
          m.fromLocation || "Procurement Delivery Handoff";

        const referenceId =
          m.batchCode ||
          m.referenceId ||
          `REF-${id.slice(0, 6).toUpperCase()}`;

        const date = m.movementDate
          ? new Date(m.movementDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "10 Oct 2026";

        const performedBy = m.performedBy || "Warehouse Manager";

        return {
          id,
          movementCode,
          lotId,
          millet,
          movementType,
          type: movementType,
          quantityKg,
          warehouse,
          fromLocation,
          referenceId,
          date,
          performedBy,
        };
      });

      setMovements(processed);
    } catch (err) {
      console.error("Error loading stock movements:", err);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMovements = useMemo(() => {
    const query = search.trim().toLowerCase();

    return movements.filter((m) => {
      const matchesSearch =
        !query ||
        m.movementCode.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query) ||
        m.lotId.toLowerCase().includes(query) ||
        m.millet.toLowerCase().includes(query) ||
        m.warehouse.toLowerCase().includes(query) ||
        m.fromLocation.toLowerCase().includes(query);

      const matchesType =
        type === "All" ||
        m.movementType.toLowerCase() === type.toLowerCase() ||
        (type === "Stock Received" && m.movementType.includes("Received")) ||
        (type === "Stock Reserved" && m.movementType.includes("Reserved")) ||
        (type === "Stock Transfer" && m.movementType.includes("Transfer"));

      return matchesSearch && matchesType;
    });
  }, [movements, search, type]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Stock Movements
          </h1>

          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track stock received, reserved and moved through the FPO warehouse network.
          </p>
        </div>

        <button
          onClick={() => setShowReceiveForm((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 px-4 py-2 text-xs font-bold text-white transition-colors shadow-xs"
        >
          <ArrowDownToLine size={16} />
          {showReceiveForm ? "Close Form" : "Receive Stock"}
        </button>
      </div>

      {/* Receive Stock Form Modal / Drawer */}
      {showReceiveForm && (
        <ReceiveStockForm
          onClose={() => setShowReceiveForm(false)}
          onSuccess={() => {
            setShowReceiveForm(false);
            loadData();
          }}
        />
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search movement code, lot ID, millet or warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-xs text-slate-900 outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition"
          />
        </div>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="All">All Movement Types</option>
          <option value="Stock Received">Stock Received (Inbound)</option>
          <option value="Stock Reserved">Stock Reserved (Outbound)</option>
          <option value="Stock Transfer">Stock Transfer</option>
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex h-48 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-800" />
          <span className="text-xs font-semibold text-slate-600">
            Loading stock movements history...
          </span>
        </div>
      )}

      {/* Movements Table */}
      {!loading && <StockMovementTable movements={filteredMovements} />}
    </div>
  );
}

export default StockMovements;