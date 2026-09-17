import { useEffect, useMemo, useState } from "react";
import { Plus, Loader2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import FarmerStats from "../components/FarmerStats";
import FarmerFilters from "../components/FarmerFilters";
import FarmerTable from "../components/FarmerTable";

import { farmersApi } from "@/services/api";

function Farmers() {
  const [farmersList, setFarmersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    async function loadFarmers() {
      try {
        const data = await farmersApi.getAll();
        const mapped = Array.isArray(data)
          ? data.map((f) => ({
              id: f.id || f.farmerCode,
              farmerCode: f.farmerCode,
              name: f.fullName || f.name,
              phone: f.phone,
              email: f.email || "",
              village: f.village || "",
              taluka: f.taluka || "",
              district: f.district || "",
              address: f.address || "",
              status: f.status || "Active",
              farmCount: f.farmCount ?? 0,
              farms: f.farms || [],
              totalLand: f.totalLandInAcres ?? 0,
            }))
          : [];
        setFarmersList(mapped);
      } catch (err) {
        setError(err.message || "Failed to load farmers from server.");
      } finally {
        setLoading(false);
      }
    }
    loadFarmers();
  }, []);

  const filteredFarmers = useMemo(() => {
    return farmersList.filter((farmer) => {
      const matchesSearch =
        farmer.name.toLowerCase().includes(search.toLowerCase()) ||
        farmer.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "all" || farmer.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [farmersList, search, status]);


  const handleReset = () => {
    setSearch("");
    setStatus("all");
  };


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Farmer Management
          </h1>

          <p className="text-muted-foreground">
            Manage farmers registered under your FPO.
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Farmer
        </Button>

      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-40 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Loading farmers...</p>
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
          <FarmerStats farmers={farmersList} />

          {/* Filters */}
          <FarmerFilters
            search={search}
            setSearch={setSearch}
            status={status}
            setStatus={setStatus}
            onReset={handleReset}
          />

          {/* Table */}
          <FarmerTable farmers={filteredFarmers} />
        </>
      )}

    </div>
  );
}

export default Farmers;