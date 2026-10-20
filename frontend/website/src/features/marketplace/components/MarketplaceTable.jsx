import { useState } from "react";
import {
  Eye,
  Pencil,
  MoreVertical,
  EyeOff,
  Trash2,
  AlertTriangle,
  FileEdit,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { marketplaceApi } from "@/services/api";

function MarketplaceTable({
  listings,
  onView,
  onEdit,
  onRefresh,
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const getStatusClass = (status) => {
    switch (status) {
      case "Available":
      case "Active":
        return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200";
      case "Draft":
        return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-300";
      case "Unpublished":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-300";
      case "Partially Sold":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-300";
      case "Sold Out":
        return "bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-300";
      default:
        return "bg-slate-100 text-slate-600 hover:bg-slate-100";
    }
  };

  const handleStatusChange = async (listingId, newStatus) => {
    try {
      setIsActionInProgress(true);
      await marketplaceApi.updateStatus(listingId, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setIsActionInProgress(true);
      await marketplaceApi.delete(productToDelete.id);
      setShowDeleteDialog(false);
      setProductToDelete(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
      setShowDeleteDialog(false);
      setProductToDelete(null);
      if (onRefresh) onRefresh();
    } finally {
      setIsActionInProgress(false);
    }
  };

  return (
    <Card className="border-slate-200/80 shadow-xs">
      <CardHeader>
        <CardTitle className="text-base">
          Marketplace Listings
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">
                  Listing
                </TableHead>

                <TableHead>Millet</TableHead>

                <TableHead>Grade</TableHead>

                <TableHead>Available</TableHead>

                <TableHead>Price / kg</TableHead>

                <TableHead>Value</TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="pr-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-slate-500"
                  >
                    No marketplace listings found.
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell className="pl-6">
                      <div>
                        <p className="font-medium text-slate-900">
                          {listing.title || listing.id}
                        </p>

                        <p className="text-xs text-slate-500">
                          {listing.lotId || listing.id}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {listing.millet || listing.milletType || "—"}
                    </TableCell>

                    <TableCell>
                      {listing.grade || "Grade A"}
                    </TableCell>

                    <TableCell>
                      {(listing.availableQuantity ?? listing.quantityKg ?? 0).toLocaleString()}{" "}
                      {listing.unit || "kg"}
                    </TableCell>

                    <TableCell>
                      ₹{listing.pricePerKg || 0}
                    </TableCell>

                    <TableCell className="font-medium">
                      ₹
                      {(
                        (listing.availableQuantity ?? listing.quantityKg ?? 0) *
                        (listing.pricePerKg || 0)
                      ).toLocaleString("en-IN")}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={getStatusClass(
                          listing.status
                        )}
                      >
                        {listing.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs"
                          onClick={() => onView(listing.id)}
                          title="View Details"
                        >
                          <Eye className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                          View
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          onClick={() => onEdit(listing.id)}
                          title="Edit Listing"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Edit
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 cursor-pointer">
                              <MoreVertical className="h-4 w-4 text-slate-500" />
                              <span className="sr-only">More options</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            {listing.status === "Active" || listing.status === "Available" ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(listing.id, "Unpublished")}
                                className="cursor-pointer text-amber-600"
                              >
                                <EyeOff className="mr-2 h-4 w-4" />
                                Unpublish
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(listing.id, "Active")}
                                className="cursor-pointer text-emerald-600"
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Publish
                              </DropdownMenuItem>
                            )}

                            {listing.status !== "Draft" && (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(listing.id, "Draft")}
                                className="cursor-pointer text-slate-600"
                              >
                                <FileEdit className="mr-2 h-4 w-4" />
                                Save as Draft
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => {
                                setProductToDelete(listing);
                                setShowDeleteDialog(true);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Explicit User Consent Confirmation Dialog for Deletions */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Product Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-1 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                "{productToDelete?.id || productToDelete?.millet}"
              </strong>
              ? This action will permanently remove this listing from the marketplace.
              This operation requires explicit user consent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDeleteDialog(false);
                setProductToDelete(null);
              }}
              disabled={isActionInProgress}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isActionInProgress}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isActionInProgress ? "Deleting..." : "Yes, Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default MarketplaceTable;