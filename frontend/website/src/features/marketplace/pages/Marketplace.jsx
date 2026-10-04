import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import MarketplaceStats from "../components/MarketplaceStats";
import MarketplaceFilters from "../components/MarketplaceFilters";
import MarketplaceTable from "../components/MarketplaceTable";

import { marketplaceApi } from "@/services/api";

function Marketplace() {
  const navigate = useNavigate();

  const [marketplaceListings, setMarketplaceListings] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [millet, setMillet] = useState("all");

  useEffect(() => {
    async function loadListings() {
      try {
        const data = await marketplaceApi.getAll();
        if (Array.isArray(data)) setMarketplaceListings(data);
      } catch (err) {
        console.error("Error loading marketplace listings:", err);
        setMarketplaceListings([]);
      }
    }
    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    return marketplaceListings.filter((listing) => {
      const searchMatch =
        search.trim() === "" ||
        (listing.id && listing.id.toLowerCase().includes(search.toLowerCase())) ||
        (listing.lotId && listing.lotId.toLowerCase().includes(search.toLowerCase())) ||
        (listing.millet && listing.millet.toLowerCase().includes(search.toLowerCase()));

      const statusMatch = status === "all" || listing.status === status;
      const milletMatch = millet === "all" || listing.millet === millet;

      return searchMatch && statusMatch && milletMatch;
    });
  }, [marketplaceListings, search, status, millet]);

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setMillet("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Marketplace
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage certified millet stock available for
            buyers.
          </p>
        </div>

        <Button
          onClick={() =>
            navigate("/marketplace/new")
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Listing
        </Button>
      </div>

      {/* Stats */}
      <MarketplaceStats
        listings={marketplaceListings}
      />

      {/* Filters */}
      <MarketplaceFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        millet={millet}
        setMillet={setMillet}
        onReset={handleReset}
      />

      {/* Table */}
      <MarketplaceTable
        listings={filteredListings}
        onView={(listingId) =>
          navigate(
            `/marketplace/${listingId}`
          )
        }
      />
    </div>
  );
}

export default Marketplace;