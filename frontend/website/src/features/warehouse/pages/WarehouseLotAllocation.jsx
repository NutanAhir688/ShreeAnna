import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import LotAllocationForm from "../components/LotAllocationForm";
import { lotsApi } from "@/services/api";

function WarehouseLotAllocation() {
  const navigate = useNavigate();

  const [warehouseLots, setWarehouseLots] = useState([]);
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("All");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function loadLots() {
      try {
        const data = await lotsApi.getAll();
        if (Array.isArray(data)) setWarehouseLots(data);
      } catch (err) {
        console.error("Error loading warehouse lots:", err);
        setWarehouseLots([]);
      }
    }
    loadLots();
  }, []);

  const filteredLots = useMemo(() => {
    const query = search.toLowerCase();

    return warehouseLots.filter((lot) => {
      const matchesSearch =
        (lot.lotId && lot.lotId.toLowerCase().includes(query)) ||
        (lot.farmerName && lot.farmerName.toLowerCase().includes(query)) ||
        (lot.millet && lot.millet.toLowerCase().includes(query)) ||
        (lot.warehouseName && lot.warehouseName.toLowerCase().includes(query));

      const matchesWarehouse =
        warehouse === "All" || lot.warehouseId === warehouse;

      return matchesSearch && matchesWarehouse;
    });
  }, [warehouseLots, search, warehouse]);

  return (
    <div className="space-y-6">
      {/* Back */}
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Warehouse Lot Allocation
          </h1>

          <p className="text-sm text-muted-foreground">
            Assign certified procurement lots to warehouse locations.
          </p>
        </div>

        <button
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus size={16} />
          Allocate Lot
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <LotAllocationForm
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />

          <input
            type="text"
            placeholder="Search lot, farmer or millet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none"
        >
          <option value="All">All Warehouses</option>
          <option value="WH-001">
            Dahod FPO Warehouse
          </option>
          <option value="WH-002">
            Mehsana FPO Warehouse
          </option>
          <option value="WH-003">
            Anand FPO Warehouse
          </option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  Lot
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Farmer
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Millet
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Quantity
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Warehouse
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Certification
                </th>

                <th className="px-4 py-3 text-left font-medium">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredLots.map((lot) => (
                <tr
                  key={lot.id}
                  className="border-b last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {lot.lotId}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {lot.id}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {lot.farmerName}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {lot.farmName}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {lot.millet}

                    <div className="text-xs text-muted-foreground">
                      {lot.grade}
                    </div>
                  </td>

                  <td className="px-4 py-4 font-medium">
                    {lot.quantity} {lot.unit}
                  </td>

                  <td className="px-4 py-4">
                    {lot.warehouseName}
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {lot.certificationId}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        lot.status === "Stored"
                          ? "bg-blue-100 text-blue-700"
                          : lot.status ===
                            "Partially Reserved"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {lot.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default WarehouseLotAllocation;