import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  RotateCcw,
  Plus,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileCheck,
  Building2,
  User,
  ShieldCheck,
  IndianRupee,
  Package,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

import { agreementsApi, lotsApi, purchaseRequestsApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { CreditCard } from "lucide-react";

// Default MSP rates per Kg (INR)
const MSP_RATES = {
  "Finger Millet (Ragi)": 42.90,
  "Pearl Millet (Bajra)": 26.25,
  "Foxtail Millet": 38.50,
  "Sorghum (Jowar)": 31.80,
  "Little Millet": 40.00,
  "Barnyard Millet": 39.00,
};

export function getAgreementStatusMeta(agr) {
  if (!agr) return { isFullyAccepted: false, isFpoAccepted: false, isFarmerAccepted: false, isRejected: false, label: "Pending Signatures" };

  const status = (agr.status || "").toUpperCase();
  const remarks = agr.negotiationRemarks || "";
  const storedFpo = typeof window !== "undefined" && localStorage.getItem(`fpo_accepted_${agr.id}`) === "true";
  const storedFarmer = typeof window !== "undefined" && localStorage.getItem(`farmer_accepted_${agr.id}`) === "true";

  // Rejection check
  const isRejected = status.includes("REJECTED");
  if (isRejected) {
    const isFpo = status.includes("FPO") || remarks.includes("FPO") || remarks.includes("[REJECTED_BY_FPO]");
    const isFarmer = status.includes("FARMER") || remarks.includes("Farmer") || remarks.includes("[REJECTED_BY_FARMER]");
    const rejectedBy = isFarmer && !isFpo ? "Farmer" : "FPO";
    return {
      isFullyAccepted: false,
      isFpoAccepted: false,
      isFarmerAccepted: false,
      isRejected: true,
      rejectedBy,
      label: rejectedBy === "FPO" ? "Rejected by FPO" : "Rejected by Farmer",
    };
  }

  // If newly formulated and pending, neither party has accepted this current formulation yet
  if (status === "AGREEMENT_PENDING") {
    return {
      isFullyAccepted: false,
      isFpoAccepted: false,
      isFarmerAccepted: false,
      isRejected: false,
      label: "Pending Signatures",
    };
  }

  // Farmer acceptance: on mobile, farmer accept sets status to AGREEMENT_ACCEPTED or AGREEMENT_PENDING_FPO, or remarks has [FARMER_ACCEPTED], or storedFarmer
  const hasFarmer =
    status === "AGREEMENT_ACCEPTED" ||
    status === "AGREEMENT_PENDING_FPO" ||
    remarks.includes("[FARMER_ACCEPTED]") ||
    storedFarmer;

  // FPO acceptance: FPO must explicitly accept from the web portal
  const hasFpo =
    storedFpo ||
    remarks.includes("[FPO_ACCEPTED]") ||
    status === "AGREEMENT_PENDING_FARMER";

  // Downstream operations (produce pickup in progress, warehouse received, or paid) are inherently fully accepted
  const isDownstream = ["PICKUP", "WAREHOUSE_RECEIVED", "PAYMENT", "COMPLETED", "STORED", "DELIVERED"].includes(status);

  // Fully accepted ONLY when BOTH parties have accepted (or downstream)
  const isFullyAccepted = isDownstream || (hasFpo && hasFarmer);

  let label = "Pending Signatures";
  if (isFullyAccepted) {
    label = "Active / Accepted";
  } else if (hasFpo && !hasFarmer) {
    label = "Awaiting Farmer Acceptance";
  } else if (!hasFpo && hasFarmer) {
    label = "Awaiting FPO Acceptance";
  }

  return {
    isFullyAccepted,
    isFpoAccepted: isDownstream || hasFpo,
    isFarmerAccepted: isDownstream || hasFarmer,
    isRejected: false,
    label,
  };
}

function Agreements() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProcessor = user?.role === "Processor";

  const [lots, setLots] = useState([]);
  const [processorAgreements, setProcessorAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Document Modal & Formulation Modal State
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [acceptTermsChecked, setAcceptTermsChecked] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFormulationModal, setShowFormulationModal] = useState(false);
  const [formulationLot, setFormulationLot] = useState(null);

  const openAgreementModal = (agr) => {
    setAcceptTermsChecked(false);
    setSelectedAgreement(agr);
  };

  // Formulation Form Fields
  const [formAgreedQty, setFormAgreedQty] = useState(1250);
  const [formUnitPrice, setFormUnitPrice] = useState(28.50);
  const [formLogisticsType, setFormLogisticsType] = useState("pickup");
  const [formLogisticsCost, setFormLogisticsCost] = useState(1250);
  const [formOtherAdjustments, setFormOtherAdjustments] = useState(0);
  const [formRemarks, setFormRemarks] = useState("");

  // Load live lots / agreements from backend
  const loadAgreements = async () => {
    setLoading(true);
    setError("");
    try {
      if (isProcessor) {
        const data = await purchaseRequestsApi.getAll();
        const relevant = (Array.isArray(data) ? data : []).filter(
          (r) => r.agreementId || ["AGREEMENT_PROPOSED", "ACCEPTED", "PAID", "DELIVERED"].includes(r.status)
        );
        setProcessorAgreements(relevant);
      } else {
        const data = await agreementsApi.getAll();
        setLots(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message || "Failed to load agreements from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, [isProcessor]);

  // Compute Agreements list from lots
  const agreements = useMemo(() => {
    return lots.map((l) => {
      const unitPrice = l.offeredPricePerKg || MSP_RATES[l.milletType] || 38.50;
      const qty = l.agreedQuantityKg || l.actualQuantityKg || l.estimatedQuantityKg || 0;
      const totalVal = Math.round(qty * unitPrice);
      const statusUpper = (l.status || "").toUpperCase();

      // Check if agreement has been generated
      const isGenerated = [
        "PROCUREMENT_AGREEMENT",
        "AGREEMENT_ACCEPTED",
        "AGREEMENT_PENDING",
        "AGREEMENT_PENDING_FARMER",
        "AGREEMENT_PENDING_FPO",
        "PICKUP",
        "WAREHOUSE_RECEIVED",
        "PAYMENT",
        "COMPLETED",
        "STORED",
        "DELIVERED",
      ].includes(statusUpper);

      const logisticsCost = l.logisticsCost || 0;
      const otherAdjustments = l.otherAdjustments || 0;
      const netPayable = Math.max(0, totalVal - logisticsCost - otherAdjustments);
      const logisticsType = logisticsCost > 0 ? "FPO Pickup" : "Farmer Delivery";

      return {
        id: l.id,
        agreementCode: isGenerated
          ? `AGR-${l.lotNumber || l.id.slice(0, 6).toUpperCase()}`
          : "Not Generated",
        lotId: l.id,
        lotNumber: l.lotNumber || l.id.slice(0, 6),
        farmerName: l.farmerName || "Registered Farmer",
        farmerId: l.farmerId || "99281",
        farmName: l.farmName || "Registered Farm",
        milletType: l.milletType || "Finger Millet (Ragi)",
        quantityKg: qty,
        unitPrice: unitPrice,
        mspRate: unitPrice,
        totalValue: totalVal,
        logisticsCost: logisticsCost,
        otherAdjustments: otherAdjustments,
        netPayable: netPayable,
        logisticsType: logisticsType,
        negotiationRemarks: l.negotiationRemarks || "",
        agreementVersion: l.agreementVersion || "v1.0",
        status: l.status || "SUBMITTED",
        isGenerated: isGenerated,
        date: l.submissionDate
          ? new Date(l.submissionDate).toLocaleDateString("en-IN")
          : "—",
      };
    });
  }, [lots]);

  // Filtered list
  const filteredAgreements = useMemo(() => {
    const q = search.toLowerCase();
    return agreements.filter((agr) => {
      const matchSearch =
        agr.agreementCode.toLowerCase().includes(q) ||
        agr.farmerName.toLowerCase().includes(q) ||
        agr.farmName.toLowerCase().includes(q) ||
        agr.milletType.toLowerCase().includes(q);

      let matchStatus = true;
      const meta = getAgreementStatusMeta(agr);
      if (statusFilter === "ACCEPTED") {
        matchStatus = meta.isFullyAccepted;
      } else if (statusFilter === "REJECTED") {
        matchStatus = meta.isRejected;
      } else if (statusFilter === "PENDING") {
        matchStatus = !meta.isFullyAccepted && !meta.isRejected;
      }

      return matchSearch && matchStatus;
    });
  }, [agreements, search, statusFilter]);

  // Filtered Processor Agreements
  const filteredProcessorAgreements = useMemo(() => {
    return processorAgreements.filter((agr) => {
      const q = search.toLowerCase();
      const code = (agr.agreementId || agr.requestCode || "").toLowerCase();
      const lot = (agr.lotId || "").toLowerCase();
      const millet = (agr.milletType || "").toLowerCase();
      const matchSearch = code.includes(q) || lot.includes(q) || millet.includes(q);

      let matchStatus = true;
      if (statusFilter === "ACCEPTED") {
        matchStatus = ["ACCEPTED", "PAID", "DELIVERED"].includes(agr.status);
      } else if (statusFilter === "PENDING") {
        matchStatus = agr.status === "AGREEMENT_PROPOSED";
      } else if (statusFilter === "REJECTED") {
        matchStatus = agr.status === "REJECTED";
      }

      return matchSearch && matchStatus;
    });
  }, [processorAgreements, search, statusFilter]);

  // Stats
  const totalCount = isProcessor ? processorAgreements.length : agreements.length;
  const acceptedCount = isProcessor
    ? processorAgreements.filter((a) => ["ACCEPTED", "PAID", "DELIVERED"].includes(a.status)).length
    : agreements.filter((a) => getAgreementStatusMeta(a).isFullyAccepted).length;
  const pendingCount = isProcessor
    ? processorAgreements.filter((a) => a.status === "AGREEMENT_PROPOSED").length
    : agreements.filter((a) => {
        const meta = getAgreementStatusMeta(a);
        return !meta.isFullyAccepted && !meta.isRejected;
      }).length;
  const totalValSum = isProcessor
    ? processorAgreements.reduce((acc, a) => acc + (a.totalValue || a.indicativeValue || 0), 0)
    : agreements.reduce((acc, a) => acc + a.totalValue, 0);

  // Open formulation modal for a lot
  const openFormulationForLot = (agr) => {
    setFormulationLot(agr);
    const msp = agr?.mspRate || MSP_RATES[agr?.milletType] || 38.50;
    setFormAgreedQty(agr?.quantityKg || 500);
    setFormUnitPrice(msp);
    setFormLogisticsType("pickup");
    setFormLogisticsCost(0);
    setFormOtherAdjustments(0);
    setFormRemarks("");
    setShowFormulationModal(true);
  };

  // Actions: Accept / Reject
  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await agreementsApi.accept(id, "FpoManager");
      try {
        localStorage.setItem(`fpo_accepted_${id}`, "true");
      } catch (_) {}
      await loadAgreements();
      setSelectedAgreement(null);
      setAcceptTermsChecked(false);
    } catch (err) {
      alert(err.message || "Failed to accept agreement.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await agreementsApi.reject(id, "Terms not met / Rejected by FPO Officer", "FpoManager");
      try {
        localStorage.removeItem(`fpo_accepted_${id}`);
        localStorage.removeItem(`farmer_accepted_${id}`);
      } catch (_) {}
      await loadAgreements();
      setSelectedAgreement(null);
      setAcceptTermsChecked(false);
    } catch (err) {
      alert(err.message || "Failed to reject agreement.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Formulation Form
  const handleCreateAgreementSubmit = async () => {
    if (!formulationLot) return;
    setActionLoading(true);
    try {
      await agreementsApi.create(formulationLot.id);
      try {
        localStorage.removeItem(`fpo_accepted_${formulationLot.id}`);
        localStorage.removeItem(`farmer_accepted_${formulationLot.id}`);
      } catch (_) {}
      await loadAgreements();
      setShowFormulationModal(false);
      setFormulationLot(null);
    } catch (err) {
      alert(err.message || "Failed to create agreement.");
    } finally {
      setActionLoading(false);
    }
  };

  // Financial Calculations for Formulation Form
  const subtotal = (Number(formAgreedQty) || 0) * (Number(formUnitPrice) || 0);
  const logisticsCost =
    formLogisticsType === "pickup" ? Number(formLogisticsCost) || 0 : 0;
  const otherAdjustments = Number(formOtherAdjustments) || 0;
  const netPayable = Math.max(0, subtotal - logisticsCost - otherAdjustments);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isProcessor ? "Processor Purchase Agreements" : "Procurement Agreements"}
          </h1>
          <p className="text-sm text-slate-500">
            {isProcessor
              ? "Digital procurement contracts between ShreeAnna FPO and your processing unit."
              : "Digital purchase contracts between ShreeAnna FPO and registered farmers."}
          </p>
        </div>

        {!isProcessor && (
          <Button onClick={() => navigate("/agreements/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Procurement Agreement
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Contracts
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {totalCount}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active / Accepted
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {acceptedCount}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {isProcessor ? "Pending Payment / Action" : "Pending Signature"}
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {pendingCount}
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Contracted Value
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                ₹{totalValSum.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-lg border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isProcessor ? "Search by Agreement Code, Request Code, Lot ID, or Millet..." : "Search by Agreement Code, Farmer, Farm, or Millet Type..."}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="ACCEPTED">Accepted / Active</SelectItem>
            <SelectItem value="PENDING">Pending Approval</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-48 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Loading agreements...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        isProcessor ? (
          /* PROCESSOR AGREEMENTS TABLE */
          <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="pl-6">Agreement Code</TableHead>
                  <TableHead>Lot ID</TableHead>
                  <TableHead>Millet Produce</TableHead>
                  <TableHead>Agreed Quantity</TableHead>
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProcessorAgreements.length > 0 ? (
                  filteredProcessorAgreements.map((agr) => {
                    const isProposed = agr.status === "AGREEMENT_PROPOSED";
                    const isPaid = agr.status === "PAID";
                    const isDelivered = agr.status === "DELIVERED";
                    const isAccepted = agr.status === "ACCEPTED";

                    return (
                      <TableRow key={agr.id || agr.agreementId} className="hover:bg-slate-50/80">
                        <TableCell className="pl-6">
                          <div>
                            <p className="font-mono font-bold text-emerald-800">
                              {agr.agreementId || agr.requestCode}
                            </p>
                            <p className="text-[11px] text-slate-400">Req: {agr.requestCode}</p>
                          </div>
                        </TableCell>

                        <TableCell className="font-mono text-xs font-semibold text-slate-700">
                          {agr.lotId}
                        </TableCell>

                        <TableCell>
                          <p className="font-medium text-slate-900">{agr.milletType}</p>
                          <p className="text-[11px] text-slate-500">{agr.fpoName || "Mandya FPO"}</p>
                        </TableCell>

                        <TableCell className="font-semibold text-slate-800">
                          {(agr.agreedQuantityKg || agr.requestedQuantityKg)?.toLocaleString()} kg
                        </TableCell>

                        <TableCell className="font-semibold text-slate-800">
                          ₹{(agr.sellingPricePerKg || agr.indicativePricePerKg)?.toFixed(2)}/kg
                        </TableCell>

                        <TableCell className="font-bold text-slate-900">
                          ₹{(agr.totalValue || agr.indicativeValue)?.toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell>
                          {isDelivered ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-[10px]">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              DELIVERED
                            </Badge>
                          ) : isPaid ? (
                            <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-bold text-[10px]">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              PAID • DISPATCH
                            </Badge>
                          ) : isAccepted ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-[10px]">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              ACCEPTED
                            </Badge>
                          ) : isProposed ? (
                            <Badge className="border-emerald-300 bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                              <Clock className="mr-1 h-3 w-3" />
                              AGREEMENT PROPOSED
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              {agr.status?.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isProposed ? (
                              <Button
                                size="sm"
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8 cursor-pointer shadow-xs"
                                onClick={() => navigate(`/purchase-payment/${agr.agreementId || agr.id}`)}
                              >
                                <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                                Review &amp; Agree / Pay
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedAgreement(agr)}
                                  className="border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs h-8 cursor-pointer"
                                >
                                  <FileText className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                                  View Agreement
                                </Button>
                                {agr.shipmentId && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/logistics/${agr.shipmentId}`)}
                                    className="border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-medium text-xs h-8 cursor-pointer"
                                  >
                                    <Truck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                                    Track Delivery
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <FileCheck className="h-8 w-8 text-slate-400 mb-1" />
                        <p className="font-semibold text-slate-800">No purchase agreements found</p>
                        <p className="text-xs text-slate-500">
                          When FPO proposes an agreement for your purchase request, it will appear here.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* FARMER PROCUREMENT AGREEMENTS TABLE (Procurement Officer) */
          <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-xs">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/60">
                  <TableHead className="pl-6">Agreement Code</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Farm & Location</TableHead>
                  <TableHead>Millet Produce</TableHead>
                  <TableHead>MSP Rate</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAgreements.length > 0 ? (
                  filteredAgreements.map((agr) => {
                    const meta = getAgreementStatusMeta(agr);

                    return (
                      <TableRow key={agr.id} className="hover:bg-slate-50/80">
                        <TableCell className="pl-6">
                          <div>
                            <p className="font-bold text-slate-900">{agr.agreementCode}</p>
                            <p className="text-xs text-slate-400">Date: {agr.date}</p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800">{agr.farmerName}</p>
                          </div>
                        </TableCell>

                        <TableCell className="text-slate-700 text-sm">
                          {agr.farmName}
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-800">{agr.milletType}</p>
                            <p className="text-xs text-slate-500">{agr.quantityKg} kg</p>
                          </div>
                        </TableCell>

                        <TableCell className="font-semibold text-slate-800">
                          ₹{agr.mspRate.toFixed(2)}/kg
                        </TableCell>

                        <TableCell className="font-bold text-slate-900">
                          ₹{agr.totalValue.toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell>
                          {meta.isFullyAccepted ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Active / Accepted
                            </Badge>
                          ) : meta.isRejected ? (
                            <Badge variant="destructive">
                              <XCircle className="mr-1 h-3 w-3" />
                              {meta.label}
                            </Badge>
                          ) : meta.isFpoAccepted && !meta.isFarmerAccepted ? (
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 font-medium">
                              <Clock className="mr-1 h-3 w-3" />
                              Awaiting Farmer Signature
                            </Badge>
                          ) : !meta.isFpoAccepted && meta.isFarmerAccepted ? (
                            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-800 font-medium">
                              <Clock className="mr-1 h-3 w-3" />
                              Awaiting FPO Signature
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-slate-300 bg-slate-50 text-slate-700">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending Signatures
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {agr.isGenerated ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/agreements/new/${agr.id}`)}
                                  className="border-slate-300 hover:bg-slate-50 text-slate-700"
                                >
                                  <Edit className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAgreementModal(agr)}
                                  className="border-slate-300 hover:bg-slate-50 text-slate-700 font-medium"
                                >
                                  <FileText className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                                  View Document
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                                onClick={() => navigate(`/agreements/new/${agr.id}`)}
                              >
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Create Agreement
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <FileCheck className="h-8 w-8 text-slate-400 mb-1" />
                        <p className="font-semibold text-slate-800">No procurement agreements found</p>
                        <p className="text-xs text-slate-500">
                          Try clearing your search or creating a new agreement.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )
      )}

      {/* AGREEMENT DOCUMENT PREVIEW MODAL */}
      {selectedAgreement && (() => {
        const modalMeta = getAgreementStatusMeta(selectedAgreement);
        return (
        <Dialog open={Boolean(selectedAgreement)} onOpenChange={() => { setSelectedAgreement(null); setAcceptTermsChecked(false); }}>
          <DialogContent
            className="w-[95vw] sm:max-w-4xl md:max-w-5xl bg-white p-6 md:p-8 border-2 border-slate-300 max-h-[90vh] overflow-y-auto"
            style={{ maxWidth: "920px", width: "95vw" }}
          >
            <DialogHeader>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      {selectedAgreement.agreementId
                        ? "Processor Millet Purchase Agreement"
                        : "Procurement Agreement Contract"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      {selectedAgreement.agreementId
                        ? "Official raw millet sales contract between ShreeAnna FPO and Buyer"
                        : "Official legal agreement under ShreeAnna FPO Procurement Framework"}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Document Content */}
            <div className="my-4 space-y-4 rounded-lg bg-slate-50 p-5 border border-slate-200 text-slate-800 text-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">
                    {selectedAgreement.agreementId ? "Agreement Code" : "Contract Code"}
                  </p>
                  <p className="font-mono font-bold text-base text-emerald-800">
                    {selectedAgreement.agreementId || selectedAgreement.agreementCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-semibold">
                    {selectedAgreement.agreementId ? "Valid Until" : "Date Created"}
                  </p>
                  <p className="font-semibold whitespace-nowrap">
                    {selectedAgreement.agreementId
                      ? (selectedAgreement.agreementValidUntil ? new Date(selectedAgreement.agreementValidUntil).toLocaleDateString("en-GB") : "27 Aug 2026")
                      : selectedAgreement.date}
                  </p>
                </div>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4 rounded-md bg-white p-4 border border-slate-200/80">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Purchaser (FPO)
                  </p>
                  <p className="font-bold text-slate-900">ShreeAnna Farmers Producer Co. Ltd.</p>
                  <p className="text-xs text-slate-500 mt-1">Regd Office: Millet Hub, District FPO Center</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Vendor (Farmer)
                  </p>
                  <p className="font-bold text-slate-900">{selectedAgreement.farmerName}</p>
                  <p className="text-xs text-slate-500 mt-1">Farm: {selectedAgreement.farmName}</p>
                </div>
              </div>

              {/* Agreement Schedule Table */}
              <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-3">Produce Description</th>
                      <th className="p-3 whitespace-nowrap">Quantity</th>
                      <th className="p-3 whitespace-nowrap">Agreed Rate (MSP)</th>
                      <th className="p-3 text-right whitespace-nowrap">Gross Produce Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 font-bold">{selectedAgreement.milletType}</td>
                      <td className="p-3 font-semibold whitespace-nowrap">{selectedAgreement.quantityKg} kg</td>
                      <td className="p-3 font-semibold whitespace-nowrap">₹{selectedAgreement.mspRate.toFixed(2)} / kg</td>
                      <td className="p-3 font-bold text-right text-emerald-800 whitespace-nowrap">
                        ₹{selectedAgreement.totalValue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Commercial Financial Breakdown & Transportation Details */}
              <div className="rounded-md border border-slate-200 bg-white p-3.5 space-y-2 text-xs">
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Financial Breakdown & Logistics Schedule</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono border border-emerald-200">
                    Version {selectedAgreement.agreementVersion}
                  </span>
                </p>
                <div className="space-y-1 text-slate-600 pt-1">
                  <div className="flex justify-between">
                    <span>Gross Produce Value ({selectedAgreement.quantityKg} kg × ₹{selectedAgreement.unitPrice.toFixed(2)}/kg):</span>
                    <span className="font-semibold text-slate-800">₹{selectedAgreement.totalValue.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transportation / Logistics Deduction ({selectedAgreement.logisticsType}):</span>
                    <span className="font-semibold text-slate-800">{selectedAgreement.logisticsCost > 0 ? `- ₹${selectedAgreement.logisticsCost.toLocaleString("en-IN")}` : `₹0`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Deductions (Cleaning/Bagging):</span>
                    <span className="font-semibold text-slate-800">{selectedAgreement.otherAdjustments > 0 ? `- ₹${selectedAgreement.otherAdjustments.toLocaleString("en-IN")}` : `₹0`}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm text-slate-900">
                    <span>Net Farmer Payable:</span>
                    <span className="text-emerald-700 text-base font-extrabold">₹{selectedAgreement.netPayable.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Negotiation Remarks */}
              {selectedAgreement.negotiationRemarks && (
                <div className="rounded-md border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 space-y-1">
                  <p className="font-bold uppercase text-[10px] text-amber-800 tracking-wider">
                    Negotiation & Commercial Remarks
                  </p>
                  <p className="italic font-medium">"{selectedAgreement.negotiationRemarks}"</p>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <p className="font-bold text-slate-800">Terms & Conditions:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>The seller agrees to supply clean, quality-tested millets meeting prescribed moisture standards.</li>
                  <li>Payment will be disbursed via Direct Bank Transfer into the farmer's verified bank account upon warehouse receipt creation.</li>
                  <li>This agreement is legally binding under the FPO Procurement Governance Framework 2026.</li>
                </ul>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className={`border-2 rounded-lg p-3 text-center transition-colors ${modalMeta.isFpoAccepted ? "border-emerald-300 bg-emerald-50/60" : "border-dashed border-slate-300 bg-slate-50/60"}`}>
                  <p className="text-xs font-bold text-slate-800">ShreeAnna Procurement Officer</p>
                  {modalMeta.isFpoAccepted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Digitally Authorized &amp; Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 mt-1 font-medium">
                      <Clock className="h-3.5 w-3.5" /> Pending FPO Authorization
                    </span>
                  )}
                </div>
                <div className={`border-2 rounded-lg p-3 text-center transition-colors ${modalMeta.isFarmerAccepted ? "border-emerald-300 bg-emerald-50/60" : "border-dashed border-slate-300 bg-slate-50/60"}`}>
                  <p className="text-xs font-bold text-slate-800">{selectedAgreement.farmerName}</p>
                  {modalMeta.isFarmerAccepted ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Farmer Digitally Consented (OTP)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 mt-1 font-medium">
                      <Clock className="h-3.5 w-3.5" /> Pending Farmer Consent &amp; Signature
                    </span>
                  )}
                </div>
              </div>

              {/* Acceptance Confirmation Checkbox */}
              {!modalMeta.isFullyAccepted && !modalMeta.isRejected && !modalMeta.isFpoAccepted && (
                <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/90 p-4 space-y-2 mt-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="fpo-accept-agreement-terms"
                      checked={acceptTermsChecked}
                      onCheckedChange={(checked) => setAcceptTermsChecked(Boolean(checked))}
                      className="mt-0.5 data-[state=checked]:bg-emerald-700 data-[state=checked]:border-emerald-700"
                    />
                    <label
                      htmlFor="fpo-accept-agreement-terms"
                      className="text-xs font-semibold text-slate-800 leading-snug cursor-pointer select-none"
                    >
                      I confirm that I have reviewed the produce quality inspection results, quantity ({selectedAgreement.quantityKg} kg), unit rate (₹{selectedAgreement.mspRate.toFixed(2)}/kg), logistics deductions, and legal terms, and authorize this procurement agreement on behalf of ShreeAnna FPO.
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-7">
                    Checking this box is required before signing. This agreement requires dual acceptance from both ShreeAnna FPO and the farmer to become Active / Accepted.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-1.5 h-4 w-4" />
                Print Contract
              </Button>

              <div className="flex gap-2 items-center">
                {selectedAgreement.agreementId ? (
                  selectedAgreement.status === "AGREEMENT_PROPOSED" ? (
                    <Button
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                      onClick={() => {
                        setSelectedAgreement(null);
                        navigate(`/purchase-payment/${selectedAgreement.agreementId}`);
                      }}
                    >
                      <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                      Review &amp; Complete Payment
                    </Button>
                  ) : null
                ) : (
                  <>
                    {!selectedAgreement.status.toUpperCase().includes("REJECTED") && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleReject(selectedAgreement.id)}
                      >
                        {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Reject Agreement
                      </Button>
                    )}

                    {!modalMeta.isFullyAccepted && !modalMeta.isFpoAccepted && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        disabled={actionLoading || !acceptTermsChecked}
                        onClick={() => handleAccept(selectedAgreement.id)}
                      >
                        {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                        Accept &amp; Sign Agreement
                      </Button>
                    )}

                    {modalMeta.isFpoAccepted && !modalMeta.isFullyAccepted && (
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 font-semibold py-1.5 px-3">
                        <Clock className="mr-1.5 h-3.5 w-3.5" />
                        FPO Signed — Awaiting Farmer Acceptance
                      </Badge>
                    )}

                    {modalMeta.isFullyAccepted && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold py-1.5 px-3">
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Fully Accepted &amp; Active
                      </Badge>
                    )}
                  </>
                )}

                <Button variant="secondary" size="sm" onClick={() => { setSelectedAgreement(null); setAcceptTermsChecked(false); }}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        );
      })()}
    </div>
  );
}

export default Agreements;

