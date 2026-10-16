import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Building2,
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Truck,
  ArrowLeft,
  MapPin,
  Navigation,
  Crosshair,
  Zap,
  CheckCheck,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { purchaseRequestsApi } from "@/services/api";

const PRESET_LOCATIONS = [
  {
    name: "Ahmedabad GIDC Unit",
    address: "Millet Shakti Processing Unit, GIDC Phase 2, Vatva, Ahmedabad, Gujarat - 382445",
    lat: "22.975400",
    lng: "72.632200"
  },
  {
    name: "Vadodara Food Park",
    address: "Plot 18, Manjusar GIDC, Savli, Vadodara, Gujarat - 391775",
    lat: "22.421500",
    lng: "73.238600"
  },
  {
    name: "Anand Agro Hub",
    address: "National Millet Processing Cluster, Anand, Gujarat - 388001",
    lat: "22.564500",
    lng: "72.928900"
  },
  {
    name: "Surat Value-Added Depot",
    address: "Palsana Industrial Zone, Surat, Gujarat - 394315",
    lat: "21.170200",
    lng: "72.831100"
  }
];

export default function PurchasePayment() {
  const { agreementId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment method selection: "Mock Gateway" | "UPI" | "Bank Transfer" | "Card"
  const [activeTab, setActiveTab] = useState("Mock Gateway");
  const [mockGatewayOption, setMockGatewayOption] = useState("instant");

  // Delivery destination and exact coordinates (in Gujarat)
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Millet Shakti Processing Unit, GIDC Phase 2, Vatva, Ahmedabad, Gujarat - 382445"
  );
  const [destinationLat, setDestinationLat] = useState("22.975400");
  const [destinationLng, setDestinationLng] = useState("72.632200");
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("Exact coordinates set for driver mobile navigation (Gujarat Route)");

  // Single consent checkbox
  const [agreeAndAuthorize, setAgreeAndAuthorize] = useState(false);

  // Payment states
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    loadData();
  }, [agreementId]);

  async function loadData() {
    setLoading(true);
    try {
      const idToLookup = agreementId || "PPA-2026-004";
      const data = await purchaseRequestsApi.getById(idToLookup);
      if (data) {
        setRequest(data);
        // NOTE: We do NOT auto-open the paymentSuccess modal when page loads
        // Modal must only open after user actively clicks the Pay button
        if (data.paymentStatus === "PAID") {
          setSuccessData(data);
        }
      } else {
        setRequest({
          id: "aa111111-1111-1111-1111-111111111111",
          requestCode: "PR-2026-001",
          agreementId: "PPA-2026-004",
          lotId: "LOT-2026-004",
          milletType: "Pearl Millet",
          requestedQuantityKg: 1250,
          agreedQuantityKg: 1250,
          sellingPricePerKg: 32.5,
          totalValue: 40625,
          fpoName: "Mandya FPO",
          processorName: "Millet Shakti SHG",
          paymentStatus: "PENDING",
          deliveryOtp: "9304"
        });
      }
    } catch (err) {
      console.error("Failed to load agreement payment details:", err);
      setRequest({
        id: "aa111111-1111-1111-1111-111111111111",
        requestCode: "PR-2026-001",
        agreementId: agreementId || "PPA-2026-004",
        lotId: "LOT-2026-004",
        milletType: "Pearl Millet",
        requestedQuantityKg: 1250,
        agreedQuantityKg: 1250,
        sellingPricePerKg: 32.5,
        totalValue: 40625,
        fpoName: "Mandya FPO",
        processorName: "Millet Shakti SHG",
        paymentStatus: "PENDING",
        deliveryOtp: "9304"
      });
    } finally {
      setLoading(false);
    }
  }

  // Detect live GPS coordinates from browser
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation not supported by your browser. Using Mandya SHG coordinates.");
      setDestinationLat("12.535000");
      setDestinationLng("76.905000");
      return;
    }

    setDetectingGps(true);
    setGpsStatus("Detecting high-precision GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const accuracy = Math.round(pos.coords.accuracy);
        setDestinationLat(lat);
        setDestinationLng(lng);
        setGpsStatus(`GPS lock acquired: ${lat}° N, ${lng}° E (±${accuracy}m accuracy)`);
        setDetectingGps(false);
      },
      (err) => {
        console.warn("Geolocation detection warning:", err);
        // Fall back to accurate Mandya processing unit coordinates
        setDestinationLat("22.975400");
        setDestinationLng("72.632200");
        setGpsStatus("Location set: 22.975400° N, 72.632200° E (Ahmedabad GIDC Unit)");
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  const handleSelectPreset = (preset) => {
    setDeliveryAddress(preset.address);
    setDestinationLat(preset.lat);
    setDestinationLng(preset.lng);
    setGpsStatus(`Preset loaded: ${preset.name} (${preset.lat}, ${preset.lng})`);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("processor@upi");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Single Pay Button handler
  const handlePay = async () => {
    if (!agreeAndAuthorize || paying) return;

    if (!deliveryAddress.trim()) {
      alert("Please provide the delivery destination address.");
      return;
    }

    setPaying(true);
    try {
      const parsedLat = parseFloat(destinationLat) || 12.535;
      const parsedLng = parseFloat(destinationLng) || 76.905;

      const res = await purchaseRequestsApi.pay(request.id, {
        paymentMethod: activeTab === "Mock Gateway" ? "MOCK_GATEWAY" : activeTab,
        transactionId: `TXN-MOCK-${Date.now()}`,
        upiId: activeTab === "UPI" ? "processor@upi" : undefined,
        deliveryAddress: deliveryAddress.trim(),
        destinationLatitude: parsedLat,
        destinationLongitude: parsedLng
      });

      setSuccessData(res);
      setPaymentSuccess(true);
      setRequest((prev) => ({
        ...prev,
        paymentStatus: "PAID",
        status: "PAID",
        invoiceNumber: res.invoiceNumber,
        deliveryChallanNumber: res.deliveryChallanNumber,
        deliveryOtp: res.deliveryOtp || "9304",
        shipmentId: res.shipmentId
      }));
    } catch (err) {
      alert(err.message || "Payment submission failed.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  const lotCode = request?.lotId || "LOT-2026-004";
  const agreedQty = request?.agreedQuantityKg || 1250;
  const rate = request?.sellingPricePerKg || 32.5;
  const totalPayable = request?.totalValue || agreedQty * rate;
  const agreementNo = request?.agreementId || agreementId || "PPA-2026-004";
  const isAlreadyPaid = request?.paymentStatus === "PAID";

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 px-2.5 py-0.5"
            >
              {agreementNo}
            </Badge>

            {isAlreadyPaid ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40 text-xs font-bold px-2.5 py-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAYMENT COMPLETED
              </Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40 text-xs font-bold px-2.5 py-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> PAYMENT REQUIRED
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Purchase Payment &amp; Dispatch Setup
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review agreement terms, specify exact delivery coordinates for driver GPS navigation, and complete payment.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/agreements")}
          className="self-start text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Agreements
        </Button>
      </div>

      {/* Already Paid Banner */}
      {isAlreadyPaid && (
        <Card className="bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                  Payment Confirmed for {agreementNo}
                </p>
                <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">
                  Delivery Challan #{request?.deliveryChallanNumber || "DC-2026-004"} generated. Driver allocation will be completed by FPO Logistics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => navigate(`/dispatches/${request?.shipmentId || "c311422d-dd8d-4eb3-9055-4b20ded2bebb"}`)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
              >
                <Truck className="w-3.5 h-3.5 mr-1.5" /> View Shipment &amp; Driver Status
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Summary, Delivery GPS Location, & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          {/* Purchase Summary Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="w-4 h-4 text-emerald-700" /> Purchase Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Source FPO</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {request?.fpoName || "Mandya FPO"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Processor / SHG</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {request?.processorName || "Millet Shakti SHG"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Lot ID</p>
                  <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5">
                    {lotCode}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Commodity</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {request?.milletType || "Pearl Millet"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Agreed Quantity</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {agreedQty.toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Agreed Rate</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    ₹{rate.toFixed(2)} / kg
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address & GPS Coordinates Card (Enables Driver Map Route) */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                  <MapPin className="w-4 h-4 text-emerald-700" /> Delivery Address &amp; Driver GPS Coordinates
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40">
                  Required for Driver Map
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Destination Delivery Address (Unit / Factory / Storage)
                </label>
                <textarea
                  rows={2}
                  disabled={isAlreadyPaid}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter complete destination address with landmark..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Presets */}
              {!isAlreadyPaid && (
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Quick Preset Locations:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_LOCATIONS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Exact Latitude and Longitude Controls */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Exact GPS Coordinates for Driver Navigation
                    </span>
                  </div>

                  {!isAlreadyPaid && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={detectingGps}
                      onClick={handleDetectGps}
                      className="h-7 text-[11px] font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                    >
                      {detectingGps ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-emerald-700 mr-1.5" />
                          Detecting GPS...
                        </>
                      ) : (
                        <>
                          <Crosshair className="w-3.5 h-3.5 mr-1" /> Detect My GPS Location
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Latitude (°N)
                    </label>
                    <input
                      type="text"
                      disabled={isAlreadyPaid}
                      value={destinationLat}
                      onChange={(e) => setDestinationLat(e.target.value)}
                      placeholder="e.g. 12.535000"
                      className="w-full h-8 px-2.5 font-mono text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Longitude (°E)
                    </label>
                    <input
                      type="text"
                      disabled={isAlreadyPaid}
                      value={destinationLng}
                      onChange={(e) => setDestinationLng(e.target.value)}
                      placeholder="e.g. 76.905000"
                      className="w-full h-8 px-2.5 font-mono text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> {gpsStatus}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Source: Gujarat FPO Storage, Anand (22.5645, 72.9289)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <CreditCard className="w-4 h-4 text-emerald-700" /> Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Payment Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                {[
                  { id: "Mock Gateway", label: "Mock Gateway (Instant)", badge: "Instant" },
                  { id: "UPI", label: "UPI Transfer", badge: null },
                  { id: "Bank Transfer", label: "Escrow Bank Transfer", badge: null },
                  { id: "Card", label: "Corporate Card", badge: null }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    disabled={isAlreadyPaid}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-4 text-xs font-bold transition-colors relative cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      activeTab === tab.id
                        ? "text-emerald-800 dark:text-emerald-400 border-b-2 border-emerald-800 dark:border-emerald-400"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {tab.label}
                    {tab.badge && (
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] px-1.5 py-0.2 rounded font-black">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Mock Gateway Tab Content */}
              {activeTab === "Mock Gateway" && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 flex items-center justify-center font-black">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          ShreeAnna Mock Escrow Gateway
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Automated sandbox settlement simulation with delivery challan issuance
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                      Sandbox Active
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-slate-600 dark:text-slate-300 font-semibold">
                      Select Mock Simulation Mode:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          id: "instant",
                          title: "Instant Approval",
                          desc: "Direct mock payment authorization"
                        },
                        {
                          id: "razorpay_upi",
                          title: "Razorpay Mock UPI",
                          desc: "Simulate UPI intent approval"
                        },
                        {
                          id: "netbanking",
                          title: "Corporate RTGS",
                          desc: "Simulate interbank escrow clearance"
                        }
                      ].map((mode) => (
                        <div
                          key={mode.id}
                          onClick={() => setMockGatewayOption(mode.id)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                            mockGatewayOption === mode.id
                              ? "bg-white dark:bg-slate-900 border-emerald-600 ring-1 ring-emerald-600 shadow-xs"
                              : "bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white text-[11px]">
                              {mode.title}
                            </span>
                            {mockGatewayOption === mode.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                            {mode.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Gateway Account:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        SHREEANNA_MOCK_ESCROW_SANDBOX
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Immediate Effect:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        Marks agreement PAID &amp; schedules outbound shipment
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Tab Content */}
              {activeTab === "UPI" && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                    <QRCodeSVG
                      value={`upi://pay?pa=processor@upi&pn=ShreeAnna%20FPO&am=${totalPayable}&cu=INR&tn=${agreementNo}`}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                      <span>processor@upi</span>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                        title="Copy UPI ID"
                      >
                        {copiedUpi ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Transfer Tab Content */}
              {activeTab === "Bank Transfer" && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                  <p className="text-slate-500 font-medium">
                    Initiate an RTGS / NEFT / IMPS transfer to the authorized FPO Escrow account:
                  </p>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Mandya FPO Farmers Collective
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Number:</span>
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        40928172918
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank Name:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        State Bank of India
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        SBIN0001827
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Tab Content */}
              {activeTab === "Card" && (
                <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Corporate Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444 (Test Card)"
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment Breakdown & Checkout */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <FileText className="w-4 h-4 text-emerald-700" /> Payment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Purchase Amount ({agreedQty} kg @ ₹{rate}/kg)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">FPO Logistics &amp; Transport</span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      (Direct delivery to specified GPS coordinates)
                    </p>
                  </div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">₹0.00 (FPO Included)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Platform &amp; Quality Check Fee</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹0.00</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  TOTAL PAYABLE
                </span>
                <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                  ₹{totalPayable.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Single Acceptance Checkbox */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isAlreadyPaid}
                    checked={isAlreadyPaid || agreeAndAuthorize}
                    onChange={(e) => setAgreeAndAuthorize(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer h-4 w-4"
                  />
                  <span className="text-slate-700 dark:text-slate-300 leading-snug">
                    I have reviewed and accept the Purchase Agreement details, confirm the delivery address and GPS coordinates, and authorize payment of{" "}
                    <strong className="text-slate-900 dark:text-white">₹{totalPayable.toLocaleString("en-IN")}</strong>{" "}
                    for immediate dispatch creation.
                  </span>
                </label>
              </div>

              {/* Single Payment Button */}
              {isAlreadyPaid ? (
                <Button
                  onClick={() => navigate(`/dispatches/${request?.shipmentId || "c311422d-dd8d-4eb3-9055-4b20ded2bebb"}`)}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-12 text-sm shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> View Shipment &amp; Driver Tracking
                </Button>
              ) : (
                <Button
                  onClick={handlePay}
                  disabled={!agreeAndAuthorize || paying}
                  className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-12 text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Authorizing Payment via {activeTab}...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Pay ₹{totalPayable.toLocaleString("en-IN")}
                    </>
                  )}
                </Button>
              )}

              <p className="text-[11px] text-center text-slate-400">
                Secured by ShreeAnna Escrow Sandbox Protocol
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Success Confirmation Modal (ONLY shown after user clicks Pay button) */}
      <Dialog open={paymentSuccess} onOpenChange={setPaymentSuccess}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 p-6">
          <DialogHeader>
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <DialogTitle className="text-center text-lg font-bold">
              Payment Confirmed!
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Payment of ₹{totalPayable.toLocaleString("en-IN")} successfully processed for agreement {agreementNo}.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Number:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {successData?.invoiceNumber || "INV-2026-004"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Challan:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {successData?.deliveryChallanNumber || "DC-2026-004"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivery Destination:</span>
              <span className="font-medium text-slate-900 dark:text-white text-right max-w-[260px] truncate">
                {deliveryAddress}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination GPS Coords:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                {destinationLat}° N, {destinationLng}° E
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Driver:</span>
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {successData?.driverName || "Pending Logistics Allocation"}
              </span>
            </div>

            {/* OTP Alert */}
            <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-center">
              <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">
                Your Delivery Verification OTP
              </p>
              <p className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1 tracking-widest">
                {successData?.deliveryOtp || "9304"}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Provide this OTP to the driver upon delivery to verify unloading.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/purchase-requests")}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              Back to Requests
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(`/dispatches/${successData?.shipmentId || "DSP-2026-004"}`)}
              className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
            >
              <Truck className="w-3.5 h-3.5 mr-1.5" /> Track Driver &amp; Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
