import React, { useState, useMemo } from "react";
import {
  Check,
  ShieldCheck,
  Minus,
  Plus,
  ShoppingCart,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  FileText,
  Play,
  Share2,
  Heart,
  Info,
  Award,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProductDetails({
  product,
  onBack,
  onAddToCart,
  onBuyNow,
}) {
  // If no product is provided, fallback
  const p = product || {
    id: "aa11bb22-3344-5566-7788-9900aabbccdd",
    title: "Pearl Millet Flour",
    category: "Flours",
    brand: "Millet Shakti SHG (Nagpur, Maharashtra)",
    farmerName: "Millet Shakti SHG",
    pricePerKg: 180,
    imageUrl: "/images/products/pearl_millet_flour.jpg",
    milletType: "Pearl Millet",
    quantityKg: 450,
    description:
      "Premium quality, stone-ground pearl millet flour processed under strict quality controls. Ideal for traditional flatbreads and modern gluten-free baking.",
  };

  // Gallery images setup
  const galleryImages = useMemo(() => {
    const mainImg = p.imageUrl || "/images/products/pearl_millet_flour.jpg";

    if (p.title?.toLowerCase().includes("flour") || p.category?.toLowerCase().includes("flour")) {
      return [
        { id: "img1", src: mainImg, alt: "Main Packaging Pouch", isVideo: false },
        { id: "img2", src: "/images/products/millet_flour_bowl.jpg", alt: "Stone-Ground Flour Bowl", isVideo: false },
        { id: "img3", src: "/images/products/millet_pouch_back.jpg", alt: "Nutritional Facts Back", isVideo: false },
        { id: "img4", src: mainImg, alt: "Video Provenance", isVideo: true },
      ];
    } else if (p.category === "Cookies") {
      return [
        { id: "img1", src: mainImg, alt: "Main Product Pack", isVideo: false },
        { id: "img2", src: "/images/products/ragi_cookies.jpg", alt: "Fresh Artisan Cookies", isVideo: false },
        { id: "img3", src: "/images/products/millet_pouch_back.jpg", alt: "Nutritional Facts", isVideo: false },
        { id: "img4", src: mainImg, alt: "Video Story", isVideo: true },
      ];
    } else if (p.category === "Snacks") {
      return [
        { id: "img1", src: mainImg, alt: "Main Energy Bars Pack", isVideo: false },
        { id: "img2", src: "/images/products/millet_energy_bars.jpg", alt: "Nutritious Roasted Bars", isVideo: false },
        { id: "img3", src: "/images/products/millet_pouch_back.jpg", alt: "Nutritional Facts", isVideo: false },
        { id: "img4", src: mainImg, alt: "Video Story", isVideo: true },
      ];
    } else {
      return [
        { id: "img1", src: mainImg, alt: "Main Packaging", isVideo: false },
        { id: "img2", src: "/images/products/foxtail_upma_mix.jpg", alt: "Wholesome Mix Ingredients", isVideo: false },
        { id: "img3", src: "/images/products/millet_pouch_back.jpg", alt: "Nutritional Facts", isVideo: false },
        { id: "img4", src: mainImg, alt: "Video Story", isVideo: true },
      ];
    }
  }, [p]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("details"); // "details" | "specifications" | "documents"
  const [quantity, setQuantity] = useState(1);
  const [selectedPackSize, setSelectedPackSize] = useState("1 kg");
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic pack sizes based on product category
  const packSizeOptions = useMemo(() => {
    if (p.category === "Cookies") {
      return [
        { label: "250g", multiplier: 1, text: "250g" },
        { label: "500g", multiplier: 1.9, text: "500g" },
        { label: "1 kg", multiplier: 3.6, text: "1 kg" },
      ];
    } else if (p.category === "Snacks") {
      return [
        { label: "Pack of 6", multiplier: 1, text: "6 pcs" },
        { label: "Pack of 12", multiplier: 1.9, text: "12 pcs" },
        { label: "Pack of 24", multiplier: 3.6, text: "24 pcs" },
      ];
    } else {
      return [
        { label: "500g", multiplier: 0.55, text: "500g" },
        { label: "1 kg", multiplier: 1, text: "1 kg" },
        { label: "5kg", multiplier: 4.8, text: "5kg" },
      ];
    }
  }, [p.category]);

  // Compute active price
  const basePrice = Number(p.pricePerKg) || 180;
  const currentMultiplier =
    packSizeOptions.find((opt) => opt.label === selectedPackSize)?.multiplier || 1;
  const calculatedUnitPrice = Math.round(basePrice * currentMultiplier);

  // Dynamic product code and QC code
  const productCode = useMemo(() => {
    const rawId = p.id ? String(p.id).replace(/-/g, "").slice(0, 6).toUpperCase() : "2026";
    return `PROD-2026-${rawId.slice(0, 3)}`;
  }, [p.id]);

  const qcCode = useMemo(() => {
    return p.lotId ? `QC-2026-${p.lotId.replace(/[^A-Za-z0-9]/g, "").slice(0, 4).toUpperCase()}` : "QC-2026-004";
  }, [p.lotId]);

  // Product QC parameters
  const qcData = useMemo(() => {
    return {
      grade: "Grade A",
      moisture: "11.2%",
      foreignMatter: "0.6%",
      weevilPercentage: "0.0%",
      status: "PASSED",
      certNumber: qcCode,
    };
  }, [qcCode]);

  // Handle image thumbnail click
  const handleThumbnailClick = (index, item) => {
    if (item.isVideo) {
      setVideoModalOpen(true);
    } else {
      setActiveImageIndex(index);
    }
  };

  // Handle share
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20">
      {/* ─────────────────────────────────────────────────────────────
          1. BREADCRUMBS
      ───────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 bg-[#FAFBF9]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button
              onClick={onBack}
              className="hover:text-[#1B4324] transition-colors cursor-pointer"
            >
              Products
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={onBack}
              className="hover:text-[#1B4324] transition-colors cursor-pointer"
            >
              {p.category || "Flours"}
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
              {p.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TOP PRODUCT SECTION (Gallery + Purchase Panel)
      ───────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT: GALLERY COLUMN */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            {/* Main Image Frame */}
            <div className="relative aspect-square w-full rounded-2xl border border-slate-200/80 bg-[#F6F4ED]/50 overflow-hidden shadow-xs flex items-center justify-center p-4 group">
              <img
                src={galleryImages[activeImageIndex]?.src || p.imageUrl}
                alt={p.title}
                className="w-full h-full object-contain rounded-xl transition-all duration-300 group-hover:scale-102"
                onError={(e) => {
                  e.target.src = "/images/products/pearl_millet_flour.jpg";
                }}
              />

              {/* Floating SHG / Quality Tag */}
              <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#1B4324] border border-emerald-200 shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  100% Traceable
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((item, idx) => {
                const isActive = activeImageIndex === idx && !item.isVideo;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleThumbnailClick(idx, item)}
                    className={`relative aspect-square rounded-xl overflow-hidden p-1 transition-all cursor-pointer bg-white ${
                      isActive
                        ? "border-2 border-[#1B4324] ring-2 ring-[#1B4324]/10 shadow-xs"
                        : "border border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {item.isVideo ? (
                      <div className="w-full h-full bg-slate-100/90 rounded-lg flex flex-col items-center justify-center text-slate-600 hover:text-[#1B4324] transition-colors">
                        <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center bg-white shadow-2xs">
                          <Play className="w-4 h-4 fill-slate-700 text-slate-700 ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/images/products/pearl_millet_flour.jpg";
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO & PURCHASE PANEL */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-6">
            {/* Header Badges */}
            <div className="flex items-center gap-3">
              <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md tracking-wide">
                {productCode}
              </span>
              <span className="text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                Verified Producer
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142017] tracking-tight leading-tight">
                {p.title}
              </h1>

              {/* Producer & Reviews Subtitle */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-2.5">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  No reviews yet
                </span>
                <span>•</span>
                <span>
                  By{" "}
                  <strong className="text-slate-700 font-semibold">
                    {p.brand?.includes("SHG") || p.brand?.includes("FPO")
                      ? p.brand
                      : `${p.brand || "Millet Shakti SHG"} (Nagpur, Maharashtra)`}
                  </strong>
                </span>
              </div>
            </div>

            {/* Price Display */}
            <div className="pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#142017] tracking-tight">
                  ₹{calculatedUnitPrice}
                </span>
                <span className="text-slate-500 text-sm font-medium">
                  {p.category === "Cookies"
                    ? `/ ${selectedPackSize}`
                    : p.category === "Snacks"
                    ? `/ ${selectedPackSize}`
                    : `/ ${selectedPackSize === "500g" ? "500g" : "kg"}`}
                </span>
              </div>

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mt-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>{p.quantityKg ? `${p.quantityKg} kg available in stock` : "450 kg available in stock"}</span>
              </div>
            </div>

            {/* Select Pack Size */}
            <div className="pt-2 space-y-2.5">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Pack Size
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {packSizeOptions.map((opt) => {
                  const isSelected = selectedPackSize === opt.label;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedPackSize(opt.label)}
                      className={`h-11 px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-2 border-[#1B4324] bg-emerald-50/60 text-[#1B4324] shadow-xs"
                          : "border border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#1B4324]" />}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="pt-2 space-y-2.5">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-slate-900 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                    disabled={quantity >= 50}
                    className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-xs text-slate-500 font-medium">
                  {p.category === "Cookies" || p.category === "Snacks" ? "Max 50 packs per order" : "Max 50 kg per order"}
                </span>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                onClick={() =>
                  onAddToCart({
                    ...p,
                    pricePerKg: calculatedUnitPrice,
                    selectedPackSize,
                    quantity,
                  })
                }
                className="flex-1 bg-[#1B4324] hover:bg-[#14341C] text-white font-bold text-xs sm:text-sm h-12 rounded-xl shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  onBuyNow({
                    ...p,
                    pricePerKg: calculatedUnitPrice,
                    selectedPackSize,
                    quantity,
                  })
                }
                className="flex-1 border-2 border-[#1B4324] text-[#1B4324] hover:bg-emerald-50/50 font-bold text-xs sm:text-sm h-12 rounded-xl flex items-center justify-center cursor-pointer transition-all"
              >
                <span>Buy Now</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. BOTTOM TWO-COLUMN SECTION (Tabs & Quality Control Card)
        ───────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-14 pt-10 border-t border-slate-200">
          {/* LEFT: TABS (Details, Specifications, Documents) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tab Buttons */}
            <div className="flex items-center gap-8 border-b border-slate-200">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                  activeTab === "details"
                    ? "text-[#1B4324]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Details</span>
                {activeTab === "details" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4324] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("specifications")}
                className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                  activeTab === "specifications"
                    ? "text-[#1B4324]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Specifications</span>
                {activeTab === "specifications" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4324] rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("documents")}
                className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                  activeTab === "documents"
                    ? "text-[#1B4324]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Documents</span>
                {activeTab === "documents" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4324] rounded-full" />
                )}
              </button>
            </div>

            {/* TAB CONTENT: DETAILS */}
            {activeTab === "details" && (
              <div className="space-y-6 text-slate-800 animate-fadeIn">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Description
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {p.description ||
                      "Premium quality, stone-ground pearl millet flour processed under strict quality controls. Ideal for traditional flatbreads and modern gluten-free baking."}
                  </p>
                </div>

                {/* 2x2 Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 pt-4 border-t border-slate-100">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      INGREDIENTS
                    </h4>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      {p.milletType ? `100% ${p.milletType}` : "100% Pearl Millet"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      PACKAGING
                    </h4>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      {selectedPackSize} food-grade vacuum-sealed pouch
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      SHELF LIFE
                    </h4>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      6 months
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      STORAGE INSTRUCTIONS
                    </h4>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      Store in a cool, dry place.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: SPECIFICATIONS */}
            {activeTab === "specifications" && (
              <div className="space-y-4 text-slate-800 animate-fadeIn">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Nutritional & Processing Standards
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-2 p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                    <div>Parameter</div>
                    <div>Value per 100g</div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="grid grid-cols-2 p-3">
                      <span className="text-slate-600 font-medium">Energy</span>
                      <span className="font-semibold text-slate-900">361 kcal</span>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <span className="text-slate-600 font-medium">Protein</span>
                      <span className="font-semibold text-slate-900">11.6 g</span>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <span className="text-slate-600 font-medium">Dietary Fiber</span>
                      <span className="font-semibold text-slate-900">8.5 g (Rich)</span>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <span className="text-slate-600 font-medium">Iron (Fe)</span>
                      <span className="font-semibold text-slate-900">8.0 mg</span>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <span className="text-slate-600 font-medium">Gluten Content</span>
                      <span className="font-semibold text-emerald-700">0.0% (Certified Gluten-Free)</span>
                    </div>
                    <div className="grid grid-cols-2 p-3">
                      <span className="text-slate-600 font-medium">FSSAI License</span>
                      <span className="font-mono text-slate-700">10023021000492</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: DOCUMENTS */}
            {activeTab === "documents" && (
              <div className="space-y-4 text-slate-800 animate-fadeIn">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Verified Compliance Certificates
                </h3>
                <div className="space-y-2.5">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-700" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          NPOP India Organic Scope Certificate
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Accredited by APEDA • Registration #ORG-GUJ-8921
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCertModalOpen(true)}
                      className="text-xs h-8 border-slate-200"
                    >
                      View Certificate
                    </Button>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-emerald-700" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Assaying & Moisture Lab Test Report
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Certified Moisture: 11.2% • Foreign Matter: 0.6% • Grade A
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCertModalOpen(true)}
                      className="text-xs h-8 border-slate-200"
                    >
                      View Report
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: QUALITY CONTROL CARD */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-sm font-extrabold text-slate-900">Quality Control</h3>
                </div>
                <span className="bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {qcData.status}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      GRADE
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-1">
                      {qcData.grade}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      MOISTURE
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 mt-1">
                      {qcData.moisture}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    FOREIGN MATTER
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 mt-1">
                    {qcData.foreignMatter}
                  </p>
                </div>
              </div>

              {/* Card Footer Link */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-mono font-semibold text-slate-500">
                  {qcData.certNumber}
                </span>
                <button
                  onClick={() => setCertModalOpen(true)}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>View Cert</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          4. MODALS (Quality Certificate & Provenance Video)
      ───────────────────────────────────────────────────────────── */}
      {/* Quality Certificate Modal */}
      <Dialog open={certModalOpen} onOpenChange={setCertModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 border border-slate-200 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>Verified Quality Certificate ({qcData.certNumber})</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-xs text-slate-700 mt-2">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 text-sm">{p.title}</span>
                <Badge className="bg-emerald-700 text-white font-bold text-[10px]">
                  GRADE A CERTIFIED
                </Badge>
              </div>
              <p className="text-emerald-800 text-[11px]">
                Assayed by District Agricultural Quality Assaying Officer Dr. Arvind Rathod.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Moisture Content</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{qcData.moisture} (Limit ≤ 12%)</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Foreign Matter</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{qcData.foreignMatter} (Limit ≤ 1.0%)</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Cadastral Farm Origin</span>
              <p className="font-semibold text-slate-900">Parcel Survey #429, Limkheda Taluka, Dahod, Gujarat</p>
              <p className="text-[11px] text-slate-500 font-mono">SHA-256: 8f42d99c4a012e47b855910fa32402</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Provenance Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-2xl bg-black text-white p-4 border border-slate-800 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Farm-to-Pack Millet Value Chain Story</span>
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mt-2">
            <video
              src="/brag-output/brag.mp4"
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
