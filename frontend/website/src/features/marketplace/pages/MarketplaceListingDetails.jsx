import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pencil,
  ShoppingCart,
  EyeOff,
  Eye,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

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

  const handleTogglePublish = async () => {
    if (!listing) return;
    const targetStatus = listing.status === "Active" || listing.status === "Available"
      ? "Unpublished"
      : "Active";

    setIsActionInProgress(true);
    try {
      await marketplaceApi.updateStatus(listing.id, targetStatus);
      setListing((prev) => ({ ...prev, status: targetStatus }));
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    setIsActionInProgress(true);
    try {
      await marketplaceApi.delete(listing.id);
      setShowDeleteDialog(false);
      navigate("/marketplace");
    } catch (err) {
      console.error("Failed to delete listing:", err);
      setShowDeleteDialog(false);
      navigate("/marketplace");
    } finally {
      setIsActionInProgress(false);
    }
  };

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

  const isPublished = listing.status === "Active" || listing.status === "Available";

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

        <div className="flex flex-wrap items-center gap-2">
          {/* Unpublish / Publish Action */}
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            disabled={isActionInProgress}
            className={
              isPublished
                ? "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400"
            }
          >
            {isPublished ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publish
              </>
            )}
          </Button>

          {/* Edit Action */}
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

          {/* Delete Action (Triggers Confirmation Modal) */}
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
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

      {/* Explicit User Consent Confirmation Dialog for Deletions */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Listing Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-1 leading-relaxed">
              Are you sure you want to delete listing{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                "{listing.id} ({listing.millet})"
              </strong>
              ? This action will permanently remove this listing from the marketplace.
              This operation requires explicit user consent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isActionInProgress}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isActionInProgress}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isActionInProgress ? "Deleting..." : "Yes, Delete Listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MarketplaceListingDetails;