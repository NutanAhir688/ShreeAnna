import { Plus, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import ProcurementStats from "../components/ProcurementStats";
import ProcurementFilters from "../components/ProcurementFilters";
import ProcurementTable from "../components/ProcurementTable";

import { lotsApi } from "@/services/api";

function ProcurementLots() {
  const navigate = useNavigate();
  const [lotsList, setLotsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [millet, setMillet] = useState("all");

  useEffect(() => {
    async function loadLots() {
      try {
        const data = await lotsApi.getAll();
        const mapped = Array.isArray(data)
          ? data.map((l) => ({
              id: l.id,                          // GUID – used for navigation
              lotNumber: l.lotNumber || l.id,    // e.g. "1234-A"
              farmerName: l.farmerName || "Farmer",
              farmName: l.farmName || "Farm",
              farmerId: l.farmerId,
              farmId: l.farmId,
              millet: l.milletType,
              quantity: l.estimatedQuantityKg ?? 0,
              quantityDisplay: `${l.estimatedQuantityKg ?? 0} kg`,
              pricePerKg: l.pricePerKg ?? null,
              totalValue: l.totalValue ?? (l.pricePerKg && l.estimatedQuantityKg ? l.pricePerKg * l.estimatedQuantityKg : null),
              status: l.status,
              procurementDate: l.submissionDate
                ? new Date(l.submissionDate).toLocaleDateString("en-IN")
                : "—",
              date: l.submissionDate
                ? new Date(l.submissionDate).toLocaleDateString("en-IN")
                : "—",
              description: l.description || "",
            }))
          : [];
        setLotsList(mapped);
      } catch (err) {
        setError(err.message || "Failed to load procurement lots.");
      } finally {
        setLoading(false);
      }
    }
    loadLots();
  }, []);

  const filteredLots = useMemo(() => {
    const searchText = search.toLowerCase();
    return lotsList.filter((lot) => {
      const matchesSearch =
        lot.lotNumber?.toLowerCase().includes(searchText) ||
        lot.farmerName.toLowerCase().includes(searchText) ||
        lot.farmName.toLowerCase().includes(searchText);

      const matchesStatus =
        status === "all" ||
        lot.status.toLowerCase().replaceAll("_", " ") ===
          status.toLowerCase().replaceAll("_", " ");

      const matchesMillet =
        millet === "all" ||
        (lot.millet || "").toLowerCase().includes(millet.toLowerCase());

      return matchesSearch && matchesStatus && matchesMillet;
    });
  }, [lotsList, search, status, millet]);

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setMillet("all");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Procurement Lots
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage millet procurement from FPO farmers.
          </p>
        </div>

        <Button onClick={() => navigate("/procurement-lots/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Create Procurement Lot
        </Button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-40 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading lots...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats */}
          <ProcurementStats lots={lotsList} />

          {/* Filters */}
          <ProcurementFilters
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            millet={millet}
            setMillet={setMillet}
            onReset={handleReset}
          />

          {/* Table */}
          <ProcurementTable
            lots={filteredLots}
            onView={(lot) => navigate(`/procurement-lots/${lot.id}`)}
          />
        </>
      )}

    </div>
  );
}

export default ProcurementLots;