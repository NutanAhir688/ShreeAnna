import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  ShoppingCart,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { Button } from "@/components/ui/button";

import ListingOverview from "../components/ListingOverview";
import ListingSource from "../components/ListingSource";
import ListingCertificate from "../components/ListingCertificate";
import BuyerOrders from "../components/BuyerOrders";

import { marketplaceApi } from "@/services/api";

function MarketplaceListingDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadListing() {
      try {
        const data = await marketplaceApi.getById(id);
        if (data) setListing(data);
      } catch (err) {
        console.error("Error loading listing details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Listing not found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            No marketplace listing exists for {id}.
          </p>

          <Button
            className="mt-4"
            onClick={() =>
              navigate("/marketplace")
            }
          >
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            variant="ghost"
            className="-ml-3 mb-2"
            onClick={() =>
              navigate("/marketplace")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Marketplace Listing
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage listing {listing.id} and its buyer activity.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                `/marketplace/${listing.id}/edit`
              )
            }
          >
            <Pencil className="mr-2 h-4 w-4" />
            Edit Listing
          </Button>

          {listing.availableQuantity > 0 && (
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Orders
            </Button>
          )}
        </div>
      </div>

      {/* Overview */}
      <ListingOverview listing={listing} />

      {/* Two column section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ListingSource listing={listing} />

        <ListingCertificate listing={listing} />
      </div>

      {/* Orders */}
      <BuyerOrders orders={listing.orders} />
    </div>
  );
}

export default MarketplaceListingDetails;