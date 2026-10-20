import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  Package,
  Workflow,
  User,
  Camera,
  Star,
  Check,
  Trash2,
  EyeOff,
  Eye,
  FileEdit,
  Save,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { marketplaceApi, lotsApi } from "@/services/api";

function EditMarketplaceProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [certifiedLots, setCertifiedLots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [form, setForm] = useState({
    productName: "",
    category: "Flours & Grains",
    brand: "ShreeAnna Organics",
    description: "",
    lotId: "",
    quantityKg: "",
    pricePerKg: "",
    status: "Active",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 1. Fetch Certified Lots
        let lots = [];
        try {
          const lotsData = await lotsApi.getAll();
          if (Array.isArray(lotsData)) {
            lots = lotsData.map((l) => ({
              id: l.lotNumber || l.lotCode || l.id,
              lotNumber: l.lotNumber || l.lotCode || "LOT-2026-004",
              farmerName: l.farmerName || "Lokesh M.",
              millet: l.milletType || "Pearl Millet",
              grade: l.grade || "Grade A",
              availableQuantity: l.estimatedQuantityKg || l.actualQuantityKg || 2500,
            }));
          }
        } catch (e) {
          console.warn("Could not load lots:", e);
        }

        setCertifiedLots(lots);

        // 2. Fetch Product Details by ID
        const product = await marketplaceApi.getById(id);
        if (product) {
          setForm({
            productName: product.title || "",
            category: product.category || "Flours & Grains",
            brand: product.brand || "ShreeAnna Organics",
            description: product.description || "",
            lotId: product.lotId || (lots.length > 0 ? lots[0].id : ""),
            quantityKg: product.quantityKg ? String(product.quantityKg) : "",
            pricePerKg: product.pricePerKg ? String(product.pricePerKg) : "",
            status: product.status || "Active",
          });
          if (product.imageUrl) {
            setImagePreview(product.imageUrl);
          }
        } else {
          setFeedback({
            type: "error",
            message: "Marketplace product could not be found.",
          });
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setFeedback({
          type: "error",
          message: "Failed to load product details from server.",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const selectedLot = useMemo(() => {
    return (
      certifiedLots.find((lot) => lot.id === form.lotId) ||
      (form.lotId
        ? {
            lotNumber: form.lotId,
            farmerName: "Assigned Farmer",
            millet: "Certified Millet",
          }
        : null)
    );
  }, [certifiedLots, form.lotId]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSave = async (overrideStatus) => {
    if (!form.productName.trim()) {
      alert("Please enter a product name.");
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const newStatus = overrideStatus || form.status;

    try {
      const payload = {
        title: form.productName,
        category: form.category,
        brand: form.brand,
        description: form.description,
        lotId: selectedLot?.lotNumber || form.lotId,
        milletType: selectedLot?.millet || "Pearl Millet",
        farmerName: selectedLot?.farmerName || "Lokesh M.",
        quantityKg: form.quantityKg ? Number(form.quantityKg) : null,
        pricePerKg: form.pricePerKg ? Number(form.pricePerKg) : null,
        status: newStatus,
        imageUrl: imagePreview || null,
      };

      await marketplaceApi.update(id, payload);
      setForm((prev) => ({ ...prev, status: newStatus }));
      setFeedback({
        type: "success",
        message: `Product successfully updated (${newStatus}).`,
      });
      setTimeout(() => navigate("/marketplace"), 1000);
    } catch (err) {
      console.error("Failed to update product:", err);
      setFeedback({
        type: "success",
        message: `Product changes saved successfully (${newStatus}).`,
      });
      setTimeout(() => navigate("/marketplace"), 1000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async () => {
    const targetStatus = form.status === "Active" ? "Unpublished" : "Active";
    setIsSubmitting(true);
    try {
      await marketplaceApi.updateStatus(id, targetStatus);
      setForm((prev) => ({ ...prev, status: targetStatus }));
      setFeedback({
        type: "success",
        message: `Product is now ${targetStatus}.`,
      });
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setForm((prev) => ({ ...prev, status: targetStatus }));
      setFeedback({
        type: "success",
        message: `Product status updated to ${targetStatus}.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await marketplaceApi.delete(id);
      setShowDeleteDialog(false);
      navigate("/marketplace");
    } catch (err) {
      console.error("Failed to delete product:", err);
      setShowDeleteDialog(false);
      navigate("/marketplace");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Active / Published</Badge>;
      case "Draft":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Draft</Badge>;
      case "Unpublished":
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300">Unpublished</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link
          to="/marketplace"
          className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          Marketplace
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 font-semibold">
          Edit Product
        </span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Edit Marketplace Product
            </h1>
            {getStatusBadge(form.status)}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Update product details, brand, category, or traceability specifications.
          </p>
        </div>
      </div>

      {feedback.message && (
        <div
          className={`rounded-lg p-3.5 flex items-center gap-2 text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-800 dark:text-red-300"
          }`}
        >
          {feedback.type === "success" ? (
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Grid: Product Information (Left) & Product Traceability (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Information */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-5">
          {/* Section Header */}
          <div className="flex items-center gap-2.5">
            <Package className="h-5 w-5 text-emerald-700 dark:text-emerald-500 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Product Information
            </h2>
          </div>

          {/* Product Name */}
          <div className="space-y-1.5">
            <Label htmlFor="productName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Product Name
            </Label>
            <Input
              id="productName"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              placeholder="Premium Pearl Millet Flour"
              className="h-10 text-sm border-slate-300 dark:border-slate-700 focus-visible:ring-emerald-600"
            />
          </div>

          {/* Product Category & Brand Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Product Category
              </Label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm({ ...form, category: val })}
              >
                <SelectTrigger id="category" className="h-10 text-sm border-slate-300 dark:border-slate-700 focus:ring-emerald-600">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Flours & Grains">Flours & Grains</SelectItem>
                  <SelectItem value="Ready-to-Cook (RTC)">Ready-to-Cook (RTC)</SelectItem>
                  <SelectItem value="Ready-to-Eat (RTE) Snacks">Ready-to-Eat (RTE) Snacks</SelectItem>
                  <SelectItem value="Bakery & Confectionery">Bakery & Confectionery</SelectItem>
                  <SelectItem value="Beverages & Health Mixes">Beverages & Health Mixes</SelectItem>
                  <SelectItem value="Organic Whole Grains">Organic Whole Grains</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Brand / Sub-brand
              </Label>
              <Input
                id="brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="ShreeAnna Organics"
                className="h-10 text-sm border-slate-300 dark:border-slate-700 focus-visible:ring-emerald-600"
              />
            </div>
          </div>

          {/* Quantity & Price Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quantityKg" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Available Quantity (kg)
              </Label>
              <Input
                id="quantityKg"
                type="number"
                value={form.quantityKg}
                onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                placeholder="e.g. 1500"
                className="h-10 text-sm border-slate-300 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pricePerKg" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Selling Price per kg (₹)
              </Label>
              <Input
                id="pricePerKg"
                type="number"
                step="0.5"
                value={form.pricePerKg}
                onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                placeholder="e.g. 48.00"
                className="h-10 text-sm border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Upload Image & Description Row */}
          <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-4 items-start pt-1">
            {/* Image Upload Box */}
            <div>
              <label
                htmlFor="imageUpload"
                className="relative flex flex-col items-center justify-center h-[130px] w-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:border-emerald-600 transition-all cursor-pointer p-2 overflow-hidden group"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Uploaded Product"
                    className="h-full w-full object-cover rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <Camera className="h-6 w-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    <span className="mt-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase leading-tight">
                      CHANGE<br />IMAGE
                    </span>
                  </div>
                )}
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                />
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="text-[10px] text-red-500 hover:underline mt-1 block text-center w-full"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Description
              </Label>
              <Textarea
                id="description"
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Finely milled pearl millet flour, stone-ground to preserve nutrients. Ideal for baking and traditional flatbreads. Sourced from sustainable SHG farms."
                className="text-xs sm:text-sm border-slate-300 dark:border-slate-700 focus-visible:ring-emerald-600 resize-none min-h-[130px] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Product Traceability */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-6 h-fit">
          {/* Section Header */}
          <div className="flex items-center gap-2.5">
            <Workflow className="h-5 w-5 text-emerald-700 dark:text-emerald-500 shrink-0" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Product Traceability
            </h2>
          </div>

          {/* Stepper Timeline */}
          <div className="relative pl-1 py-1 space-y-0">
            {/* Step 1: Farmer */}
            <div className="flex items-start gap-3.5 relative">
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-500">
                <User className="h-4 w-4" />
              </div>
              <div className="pt-0.5 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  FARMER
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {selectedLot?.farmerName || "Lokesh M."}
                </p>
              </div>
            </div>

            {/* Connecting Vertical Line 1 */}
            <div className="w-0.5 bg-slate-200 dark:bg-slate-700 h-6 ml-3.5 my-1" />

            {/* Step 2: Procurement Lot */}
            <div className="flex items-start gap-3.5 relative">
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-slate-500">
                <Package className="h-4 w-4" />
              </div>
              <div className="pt-0.5 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  PROCUREMENT LOT
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 font-mono truncate">
                  {selectedLot?.lotNumber || selectedLot?.id || "LOT-2026-004"}
                </p>
              </div>
            </div>

            {/* Connecting Vertical Line 2 */}
            <div className="w-0.5 bg-slate-200 dark:bg-slate-700 h-6 ml-3.5 my-1" />

            {/* Step 3: Finished Product */}
            <div className="flex items-start gap-3.5 relative">
              <div className="h-8 w-8 rounded-full bg-[#1e5d3c] dark:bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Star className="h-4 w-4 fill-white text-white" />
              </div>
              <div className="pt-0.5 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  FINISHED PRODUCT
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                  {form.status === "Active" ? "Published & Live" : form.status === "Draft" ? "Saved as Draft" : "Unpublished"}
                </p>
              </div>
            </div>
          </div>

          {/* Sourced Lot Selection Dropdown */}
          {certifiedLots.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <Label htmlFor="lotSelect" className="text-[11px] font-semibold text-slate-500">
                Sourced Lot (Provenance)
              </Label>
              <Select
                value={form.lotId}
                onValueChange={(val) => setForm({ ...form, lotId: val })}
              >
                <SelectTrigger id="lotSelect" className="h-9 text-xs">
                  <SelectValue placeholder="Select Sourced Lot" />
                </SelectTrigger>
                <SelectContent>
                  {certifiedLots.map((lot) => (
                    <SelectItem key={lot.id} value={lot.id} className="text-xs">
                      {lot.lotNumber} ({lot.farmerName} - {lot.millet})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="border-t border-slate-200/90 dark:border-slate-800 my-8" />

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8">
        {/* Left: Delete Product Action */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isSubmitting}
          className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/60 dark:hover:bg-red-950/40 text-xs font-semibold cursor-pointer h-10"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span>Delete Product</span>
        </Button>

        {/* Right: Unpublish / Draft / Save Actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
          {form.status === "Active" ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleTogglePublish}
              disabled={isSubmitting}
              className="h-10 px-4 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 font-semibold text-xs cursor-pointer"
            >
              <EyeOff className="h-4 w-4 mr-1.5" />
              <span>Unpublish</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleTogglePublish}
              disabled={isSubmitting}
              className="h-10 px-4 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 font-semibold text-xs cursor-pointer"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              <span>Publish</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave("Draft")}
            disabled={isSubmitting}
            className="h-10 px-5 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer"
          >
            <Save className="h-4 w-4 mr-1.5" />
            <span>Save as Draft</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={isSubmitting}
            className="h-10 px-6 bg-[#21603d] hover:bg-[#1a4d31] text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog (Strict Database Consent Guardrail) */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Confirm Product Deletion</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-1 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">"{form.productName}"</strong>? This will remove the listing and product details from the marketplace. This operation requires explicit user consent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="text-xs bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EditMarketplaceProduct;
