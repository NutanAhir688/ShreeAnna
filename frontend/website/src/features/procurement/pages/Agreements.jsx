import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  RotateCcw,
  Plus,
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

import { agreementsApi, lotsApi } from "@/services/api";

// Default MSP rates per Kg (INR)
const MSP_RATES = {
  "Finger Millet (Ragi)": 42.90,
  "Pearl Millet (Bajra)": 26.25,
  "Foxtail Millet": 38.50,
  "Sorghum (Jowar)": 31.80,
  "Little Millet": 40.00,
  "Barnyard Millet": 39.00,
};

function Agreements() {
  const navigate = useNavigate();

  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Document Modal & Formulation Modal State
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFormulationModal, setShowFormulationModal] = useState(false);
  const [formulationLot, setFormulationLot] = useState(null);

  // Formulation Form Fields
  const [formAgreedQty, setFormAgreedQty] = useState(1250);
  const [formUnitPrice, setFormUnitPrice] = useState(28.50);
  const [formLogisticsType, setFormLogisticsType] = useState("pickup");
  const [formLogisticsCost, setFormLogisticsCost] = useState(1250);
  const [formOtherAdjustments, setFormOtherAdjustments] = useState(0);
  const [formRemarks, setFormRemarks] = useState("");

  // Load live lots from backend
  const loadAgreements = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await agreementsApi.getAll();
      setLots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load agreements from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, []);

  // Compute Agreements list from lots
  const agreements = useMemo(() => {
    return lots.map((l) => {
      const msp = MSP_RATES[l.milletType] || 38.50;
      const qty = l.estimatedQuantityKg || 0;
      const totalVal = Math.round(qty * msp);
      const statusUpper = (l.status || "").toUpperCase();

      // Check if agreement has been generated
      const isGenerated = [
        "PROCUREMENT_AGREEMENT",
        "AGREEMENT_ACCEPTED",
        "AGREEMENT_PENDING",
        "PICKUP",
        "WAREHOUSE_RECEIVED",
        "PAYMENT",
        "COMPLETED",
      ].includes(statusUpper);

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
        mspRate: msp,
        totalValue: totalVal,
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
      if (statusFilter === "ACCEPTED") {
        matchStatus =
          agr.status.toUpperCase().includes("ACCEPTED") ||
          agr.status.toUpperCase().includes("CERTIFIED");
      } else if (statusFilter === "REJECTED") {
        matchStatus = agr.status.toUpperCase().includes("REJECTED");
      } else if (statusFilter === "PENDING") {
        matchStatus =
          !agr.status.toUpperCase().includes("ACCEPTED") &&
          !agr.status.toUpperCase().includes("REJECTED");
      }

      return matchSearch && matchStatus;
    });
  }, [agreements, search, statusFilter]);

  // Stats
  const totalCount = agreements.length;
  const acceptedCount = agreements.filter(
    (a) =>
      a.status.toUpperCase().includes("ACCEPTED") ||
      a.status.toUpperCase().includes("CERTIFIED")
  ).length;
  const pendingCount = agreements.filter(
    (a) =>
      !a.status.toUpperCase().includes("ACCEPTED") &&
      !a.status.toUpperCase().includes("REJECTED")
  ).length;
  const totalValSum = agreements.reduce((acc, a) => acc + a.totalValue, 0);

  // Open formulation modal for a lot
  const openFormulationForLot = (agr) => {
    setFormulationLot(agr);
    const msp = agr?.mspRate || MSP_RATES[agr?.milletType] || 28.50;
    setFormAgreedQty(agr?.quantityKg || 1250);
    setFormUnitPrice(msp);
    setFormLogisticsType("pickup");
    setFormLogisticsCost(1250);
    setFormOtherAdjustments(0);
    setFormRemarks("");
    setShowFormulationModal(true);
  };

  // Actions: Accept / Reject
  const handleAccept = async (id) => {
    setActionLoading(true);
    try {
      await agreementsApi.accept(id);
      await loadAgreements();
      setSelectedAgreement(null);
    } catch (err) {
      alert(err.message || "Failed to accept agreement.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      await agreementsApi.reject(id, "Terms not met / Rejected by FPO Officer");
      await loadAgreements();
      setSelectedAgreement(null);
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
      await agreementsApi.accept(formulationLot.id);
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
  const netPayable = subtotal + logisticsCost + otherAdjustments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Procurement Agreements
          </h1>
          <p className="text-sm text-slate-500">
            Digital purchase contracts between ShreeAnna FPO and registered farmers.
          </p>
        </div>

        <Button
          onClick={() => {
            const firstPendingLot = agreements.find((a) => !a.isGenerated) || agreements[0];
            openFormulationForLot(firstPendingLot);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Procurement Agreement
        </Button>
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
                Pending Signature
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
            placeholder="Search by Agreement Code, Farmer, Farm, or Millet Type..."
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
          <p className="text-sm text-slate-500">Loading procurement agreements...</p>
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
                  const isAccepted =
                    agr.status.toUpperCase().includes("ACCEPTED") ||
                    agr.status.toUpperCase().includes("CERTIFIED");
                  const isRejected = agr.status.toUpperCase().includes("REJECTED");

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
                        {isAccepted ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Active / Accepted
                          </Badge>
                        ) : isRejected ? (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Rejected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending Signature
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="pr-6 text-right space-x-2">
                        {agr.isGenerated ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAgreement(agr)}
                          >
                            <FileText className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                            View Document
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            onClick={() => openFormulationForLot(agr)}
                          >
                            <Plus className="mr-1.5 h-3.5 w-3.5" />
                            Create Agreement
                          </Button>
                        )}
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
      )}

      {/* AGREEMENT DOCUMENT PREVIEW MODAL */}
      {selectedAgreement && (
        <Dialog open={Boolean(selectedAgreement)} onOpenChange={() => setSelectedAgreement(null)}>
          <DialogContent className="max-w-2xl bg-white p-6 border-2 border-slate-300 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                      Procurement Agreement Contract
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Official legal agreement under ShreeAnna FPO Procurement Framework
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Document Content */}
            <div className="my-4 space-y-4 rounded-lg bg-slate-50 p-5 border border-slate-200 text-slate-800 text-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Contract Code</p>
                  <p className="font-mono font-bold text-base text-emerald-800">
                    {selectedAgreement.agreementCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase font-semibold">Date Created</p>
                  <p className="font-semibold">{selectedAgreement.date}</p>
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
                      <th className="p-2.5">Produce Description</th>
                      <th className="p-2.5">Quantity</th>
                      <th className="p-2.5">Agreed Rate (MSP)</th>
                      <th className="p-2.5 text-right">Contract Consideration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2.5 font-bold">{selectedAgreement.milletType}</td>
                      <td className="p-2.5 font-semibold">{selectedAgreement.quantityKg} kg</td>
                      <td className="p-2.5 font-semibold">₹{selectedAgreement.mspRate.toFixed(2)} / kg</td>
                      <td className="p-2.5 font-bold text-right text-emerald-800">
                        ₹{selectedAgreement.totalValue.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

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
                <div className="border-t-2 border-dashed border-slate-300 pt-2 text-center">
                  <p className="text-xs font-bold text-slate-700">ShreeAnna Procurement Officer</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Digitally Sealed & Authorized</p>
                </div>
                <div className="border-t-2 border-dashed border-slate-300 pt-2 text-center">
                  <p className="text-xs font-bold text-slate-700">{selectedAgreement.farmerName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Farmer Signature / OTP Consent</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-1.5 h-4 w-4" />
                Print Contract
              </Button>

              <div className="flex gap-2">
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

                {!selectedAgreement.status.toUpperCase().includes("ACCEPTED") && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    disabled={actionLoading}
                    onClick={() => handleAccept(selectedAgreement.id)}
                  >
                    {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                    Accept & Sign Agreement
                  </Button>
                )}

                <Button variant="secondary" size="sm" onClick={() => setSelectedAgreement(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* FARMER PURCHASE AGREEMENT FORMULATION MODAL */}
      {showFormulationModal && (
        <Dialog open={showFormulationModal} onOpenChange={setShowFormulationModal}>
          <DialogContent className="max-w-4xl bg-white p-0 overflow-hidden border-slate-300 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Procurement Negotiation & Agreements
                </p>
                <h2 className="text-xl font-bold text-white">
                  Farmer Purchase Agreement Formulation
                </h2>
                <p className="text-xs text-slate-400">
                  Define commercial terms and generate binding procurement contract.
                </p>
              </div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs px-3 py-1 font-mono">
                DRAFT: V3 (DRAFTING)
              </Badge>
            </div>

            {/* Modal Body */}
            <div className="p-6 bg-slate-100 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 text-slate-900">
              {/* Left Column: Commercial Terms (2 cols) */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
                      <CardTitle className="text-base font-bold">Commercial Terms</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                      Drafting
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {/* Lot Selection */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                        SELECT PROCUREMENT LOT
                      </label>
                      <Select
                        value={formulationLot?.id || ""}
                        onValueChange={(val) => {
                          const selected = agreements.find((a) => a.id === val);
                          if (selected) openFormulationForLot(selected);
                        }}
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Choose a lot..." />
                        </SelectTrigger>
                        <SelectContent>
                          {agreements.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              Lot #{a.lotNumber} - {a.farmerName} ({a.milletType})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                          AGREED QUANTITY (KG)
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={formAgreedQty}
                            onChange={(e) => setFormAgreedQty(e.target.value)}
                            className="pr-20 font-bold bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                            / {formulationLot?.quantityKg?.toLocaleString("en-IN") || 1500} Max
                          </span>
                        </div>
                        {Number(formAgreedQty) > (formulationLot?.quantityKg || 1500) && (
                          <p className="text-[11px] text-red-600 mt-1">
                            Agreed quantity exceeds farmer's proposed quantity of {formulationLot?.quantityKg} kg.
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                          UNIT PRICE (₹ / KG)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                          <Input
                            type="number"
                            step="0.5"
                            value={formUnitPrice}
                            onChange={(e) => setFormUnitPrice(e.target.value)}
                            className="pl-7 font-bold bg-white"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          Govt MSP: ₹{formulationLot?.mspRate || 25.00}/kg (+14% premium)
                        </p>
                      </div>
                    </div>

                    {/* Logistics Responsibility */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                        LOGISTICS RESPONSIBILITY
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setFormLogisticsType("pickup")}
                          className={`py-2 px-3 text-xs font-bold rounded-md transition ${
                            formLogisticsType === "pickup"
                              ? "bg-white text-emerald-800 shadow-xs border border-slate-200"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          FPO Pickup
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormLogisticsType("delivery")}
                          className={`py-2 px-3 text-xs font-bold rounded-md transition ${
                            formLogisticsType === "delivery"
                              ? "bg-white text-emerald-800 shadow-xs border border-slate-200"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Farmer Delivery
                        </button>
                      </div>
                    </div>

                    {/* Logistics Cost & Other Adjustments */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                          LOGISTICS COST
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                          <Input
                            type="number"
                            value={formLogisticsCost}
                            onChange={(e) => setFormLogisticsCost(e.target.value)}
                            disabled={formLogisticsType !== "pickup"}
                            className="pl-7 bg-white font-medium disabled:bg-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                          OTHER ADJUSTMENTS (CLEANING/BAGGING)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">₹</span>
                          <Input
                            type="number"
                            value={formOtherAdjustments}
                            onChange={(e) => setFormOtherAdjustments(e.target.value)}
                            className="pl-7 bg-white font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Negotiation Remarks */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 block">
                        NEGOTIATION REMARKS (INTERNAL)
                      </label>
                      <textarea
                        rows={3}
                        value={formRemarks}
                        onChange={(e) => setFormRemarks(e.target.value)}
                        placeholder="Enter justification for pricing deviation..."
                        className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Net Payable Banner */}
                <div className="rounded-xl bg-[#064e3b] p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-800">
                  <div className="space-y-1 text-xs">
                    <p className="text-emerald-200">
                      Subtotal ({formAgreedQty} kg × ₹{formUnitPrice}) ={" "}
                      <span className="font-semibold text-white">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </p>
                    <p className="text-emerald-200">
                      Logistics Cost:{" "}
                      <span className="font-semibold text-white">
                        + ₹{logisticsCost.toLocaleString("en-IN")}
                      </span>
                    </p>
                    <p className="text-emerald-200">
                      Other Adjustments:{" "}
                      <span className="font-semibold text-white">
                        ₹{otherAdjustments.toLocaleString("en-IN")}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                        NET FARMER PAYABLE AMOUNT
                      </p>
                      <p className="text-2xl font-black text-white">
                        ₹{netPayable.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <Button
                      size="lg"
                      disabled={actionLoading || !formulationLot}
                      onClick={handleCreateAgreementSubmit}
                      className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold shadow-md h-12 px-5"
                    >
                      {actionLoading ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <FileCheck className="mr-2 h-5 w-5 text-emerald-800" />
                      )}
                      CREATE PROCUREMENT AGREEMENT
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Entity Context & History (1 col) */}
              <div className="space-y-6">
                {/* Entity Context Card */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" /> Entity Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-md">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {formulationLot?.farmerName || "Rameshwar Patil"}
                        </p>
                        <p className="text-xs text-slate-500">
                          F-ID: #{formulationLot?.farmerId || "99281"} • Solapur Dist.
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        LOT IDENTIFIER
                      </p>
                      <div className="p-2.5 rounded-md bg-slate-100 font-mono font-bold text-xs text-slate-800 border border-slate-200">
                        {formulationLot?.lotNumber || "L-8492"} ({formulationLot?.milletType || "Pearl Millet"})
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold">QUALITY GRADE</p>
                        <p className="font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Grade A
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold">MOISTURE</p>
                        <p className="font-bold text-slate-800 mt-0.5">11.2%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold">FM COUNT</p>
                        <p className="font-bold text-slate-800 mt-0.5">0.8%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] uppercase font-bold">GOVT MSP</p>
                        <p className="font-bold text-slate-800 mt-0.5">
                          ₹{formulationLot?.mspRate || 25.00}/kg
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Negotiation History Card */}
                <Card className="border-slate-200 bg-white shadow-xs">
                  <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" /> Negotiation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900">Draft V3 (Current)</p>
                          <span className="text-[10px] text-slate-400">Just now</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Modifying terms based on counter-offer.
                        </p>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-6 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-4 ring-red-100" />
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900">Version 2</p>
                          <span className="text-[10px] text-slate-400">Yesterday, 14:30</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-red-50 text-red-600 border-red-200 my-1"
                        >
                          Rejected by Farmer
                        </Badge>
                        <p className="text-xs text-slate-500 bg-red-50/50 p-2 rounded border border-red-100">
                          "Quantity proposed ({formulationLot?.quantityKg || 1250}kg) is lower than available harvest. Want to sell entire lot."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Agreements;

