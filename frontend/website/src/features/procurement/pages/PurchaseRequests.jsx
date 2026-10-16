import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  X,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Truck,
  CreditCard,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  Filter,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { purchaseRequestsApi, lotsApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";

export default function PurchaseRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isProcurementOfficer = user?.role === "ProcurementOfficer" || user?.role === "FpoManager";
  const isProcessor = user?.role === "Processor";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [milletFilter, setMilletFilter] = useState("All Millet Types");
  const [fpoFilter, setFpoFilter] = useState("All FPOs");

  // Selected Request Drawer
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Propose Agreement Modal (for Procurement Officer)
  const [proposeModalOpen, setProposeModalOpen] = useState(false);
  const [proposeForm, setProposeForm] = useState({
    agreedQuantityKg: "",
    sellingPricePerKg: "",
    validDays: 7,
    paymentTerms: "100% advance before dispatch",
    ownershipTransfer: "After payment confirmation and delivery",
    cancellationTerms: "Subject to agreement terms"
  });
  const [proposing, setProposing] = useState(false);

  // Quick Action OTP Copy
  const [copiedOtp, setCopiedOtp] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setLoading(true);
    try {
      const data = await purchaseRequestsApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setRequests(data);
        if (!selectedRequest) {
          // Default select the first agreement proposed request if available, or first item
          const firstProposed = data.find((r) => r.status === "AGREEMENT_PROPOSED") || data[0];
          setSelectedRequest(firstProposed);
          setDrawerOpen(true);
        }
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to load purchase requests:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filtered list
  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.requestCode?.toLowerCase().includes(q) ||
      r.lotId?.toLowerCase().includes(q) ||
      r.milletType?.toLowerCase().includes(q) ||
      r.fpoName?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "All Statuses" ||
      r.status?.toUpperCase() === statusFilter.replace(/ /g, "_").toUpperCase();

    const matchesMillet =
      milletFilter === "All Millet Types" ||
      r.milletType?.toLowerCase() === milletFilter.toLowerCase();

    const matchesFpo =
      fpoFilter === "All FPOs" ||
      r.fpoName?.toLowerCase() === fpoFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesMillet && matchesFpo;
  });

  // Calculate Metrics
  const activeRequestsCount = requests.filter(
    (r) => r.status !== "REJECTED" && r.status !== "DELIVERED"
  ).length;
  const underNegotiationCount = requests.filter(
    (r) => r.status === "UNDER_NEGOTIATION"
  ).length;
  const agreementsProposedCount = requests.filter(
    (r) => r.status === "AGREEMENT_PROPOSED"
  ).length;
  const completedPurchasesCount = requests.filter(
    (r) => r.status === "DELIVERED" || r.status === "PAID"
  ).length;

  const handleSelect = (req) => {
    setSelectedRequest(req);
    setDrawerOpen(true);
  };

  const handleCopyOtp = (otp) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleOpenProposeModal = (req) => {
    setProposeForm({
      agreedQuantityKg: req.requestedQuantityKg || "",
      sellingPricePerKg: (req.indicativePricePerKg ? req.indicativePricePerKg + 0.5 : 32.5).toFixed(2),
      validDays: 7,
      paymentTerms: "100% advance before dispatch",
      ownershipTransfer: "After payment confirmation and delivery",
      cancellationTerms: "Subject to agreement terms"
    });
    setProposeModalOpen(true);
  };

  const handleSubmitProposal = async () => {
    if (!selectedRequest) return;
    setProposing(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + Number(proposeForm.validDays || 7));

      const updated = await purchaseRequestsApi.proposeAgreement(selectedRequest.id, {
        agreedQuantityKg: Number(proposeForm.agreedQuantityKg),
        sellingPricePerKg: Number(proposeForm.sellingPricePerKg),
        agreementValidUntil: validUntil.toISOString(),
        paymentTerms: proposeForm.paymentTerms,
        ownershipTransfer: proposeForm.ownershipTransfer,
        cancellationTerms: proposeForm.cancellationTerms
      });

      setSelectedRequest(updated);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setProposeModalOpen(false);
    } catch (err) {
      alert(err.message || "Failed to propose agreement.");
    } finally {
      setProposing(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "AGREEMENT_PROPOSED") {
      return (
        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-bold text-[11px] px-2.5 py-1">
          AGREEMENT PROPOSED
        </Badge>
      );
    }
    if (s === "UNDER_NEGOTIATION") {
      return (
        <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 font-bold text-[11px] px-2.5 py-1">
          UNDER NEGOTIATION
        </Badge>
      );
    }
    if (s === "REQUESTED") {
      return (
        <Badge className="bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 font-bold text-[11px] px-2.5 py-1">
          REQUESTED
        </Badge>
      );
    }
    if (s === "REJECTED") {
      return (
        <Badge className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300 font-bold text-[11px] px-2.5 py-1">
          REJECTED
        </Badge>
      );
    }
    if (s === "PAID" || s === "ACCEPTED") {
      return (
        <Badge className="bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 font-bold text-[11px] px-2.5 py-1">
          {s === "PAID" ? "PAYMENT DONE" : "ACCEPTED"}
        </Badge>
      );
    }
    if (s === "DELIVERED") {
      return (
        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-400 font-bold text-[11px] px-2.5 py-1">
          DELIVERED
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="font-bold text-[11px] px-2.5 py-1">
        {s.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Purchase Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your raw millet purchase requests and negotiation status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isProcessor ? (
            <Button
              onClick={() => navigate("/available-lots")}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-9 px-4 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Browse Available Lots
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/procurement/lots")}
              variant="outline"
              className="font-bold text-xs h-9 px-4 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" /> View Warehouse Lots
            </Button>
          )}
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Requests
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {activeRequestsCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Under Negotiation
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {underNegotiationCount}
            </p>
          </CardContent>
        </Card>

        {/* Highlighted Card with green border */}
        <Card className="bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-500 shadow-2xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Agreements Proposed
            </p>
            <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {agreementsProposedCount}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Completed Purchases
            </p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {completedPurchasesCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-wrap items-center gap-3 shadow-2xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search Request / Lot"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
        >
          <option>All Statuses</option>
          <option>Agreement Proposed</option>
          <option>Under Negotiation</option>
          <option>Requested</option>
          <option>Rejected</option>
          <option>Paid</option>
          <option>Delivered</option>
        </select>

        <select
          value={milletFilter}
          onChange={(e) => setMilletFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
        >
          <option>All Millet Types</option>
          <option>Pearl Millet</option>
          <option>Foxtail Millet</option>
          <option>Finger Millet</option>
          <option>Barnyard Millet</option>
          <option>Little Millet</option>
        </select>

        <select
          value={fpoFilter}
          onChange={(e) => setFpoFilter(e.target.value)}
          className="h-9 px-3 text-xs bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium"
        >
          <option>All FPOs</option>
          <option>Mandya FPO</option>
          <option>Mysore FPO</option>
          <option>Hassan FPO</option>
        </select>

        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs font-semibold text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800"
        >
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Date
        </Button>
      </div>

      {/* Main Content Area: Table + Right Drawer */}
      <div className={`grid gap-6 transition-all duration-300 ${drawerOpen ? "lg:grid-cols-12" : "grid-cols-1"}`}>
        {/* Table Column */}
        <div className={drawerOpen ? "lg:col-span-8" : "col-span-1"}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Request ID</th>
                    <th className="py-3.5 px-3">Lot ID</th>
                    <th className="py-3.5 px-3">Millet Type</th>
                    <th className="py-3.5 px-3">Requested Qty</th>
                    <th className="py-3.5 px-3">FPO</th>
                    <th className="py-3.5 px-3">Submitted Date</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                        Loading purchase requests...
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400 font-medium">
                        No purchase requests found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const isSelected = selectedRequest?.id === req.id && drawerOpen;
                      return (
                        <tr
                          key={req.id}
                          onClick={() => handleSelect(req)}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            isSelected ? "bg-emerald-50/60 dark:bg-emerald-950/20 font-medium" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {req.requestCode}
                          </td>
                          <td className="py-3.5 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                            {req.lotId}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {req.milletType}
                          </td>
                          <td className="py-3.5 px-3 font-medium">
                            {req.requestedQuantityKg?.toLocaleString()} kg
                          </td>
                          <td className="py-3.5 px-3 text-slate-600 dark:text-slate-400">
                            {req.fpoName}
                          </td>
                          <td className="py-3.5 px-3 text-slate-500">
                            {req.submittedDate
                              ? new Date(req.submittedDate).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })
                              : "-"}
                          </td>
                          <td className="py-3.5 px-3">{renderStatusBadge(req.status)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(req);
                              }}
                              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 cursor-pointer underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Drawer / Slide-out Panel */}
        {drawerOpen && selectedRequest && (
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Request Details
                </h3>
                <p className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {selectedRequest.requestCode}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Request Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Request Information
                </h4>
                {renderStatusBadge(selectedRequest.status)}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Request ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedRequest.requestCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lot ID</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {selectedRequest.lotId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Quantity</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedRequest.requestedQuantityKg?.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Indicative Price</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    ₹{selectedRequest.indicativePricePerKg?.toFixed(2)}/kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Indicative Value</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{selectedRequest.indicativeValue?.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Agreement Available Card (If Agreement Proposed or Accepted or Paid) */}
            {selectedRequest.agreementId ? (
              <div className="border-l-4 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-r-xl border border-emerald-200 dark:border-emerald-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" /> Agreement Available
                  </h4>
                  <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    {selectedRequest.agreementId}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreed Quantity</span>
                    <span className="font-semibold">
                      {selectedRequest.agreedQuantityKg?.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selling Price</span>
                    <span className="font-semibold">
                      ₹{selectedRequest.sellingPricePerKg?.toFixed(2)}/kg
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Total Value</span>
                    <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                      ₹{selectedRequest.totalValue?.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Agreement Terms */}
                <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
                  <p className="font-bold text-[10px] uppercase text-emerald-800 dark:text-emerald-400 tracking-wider">
                    Agreement Terms
                  </p>
                  <div className="flex justify-between">
                    <span>Agreement Valid Until</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedRequest.agreementValidUntil
                        ? new Date(selectedRequest.agreementValidUntil).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                          })
                        : "27 Aug 2026"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Terms</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedRequest.paymentTerms || "100% advance before dispatch"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ownership Transfer</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedRequest.ownershipTransfer || "After payment confirmation and delivery"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancellation</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedRequest.cancellationTerms || "Subject to agreement terms"}
                    </span>
                  </div>
                </div>

                {/* Action Button: Pay or Review (Visible ONLY to Processor) */}
                {selectedRequest.status === "AGREEMENT_PROPOSED" && (
                  <div className="pt-2">
                    {isProcessor ? (
                      <Button
                        onClick={() => navigate(`/purchase-payment/${selectedRequest.agreementId}`)}
                        className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs h-10 cursor-pointer shadow-sm flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-4 h-4" /> Review & Complete Payment
                      </Button>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Awaiting Processor Action
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                          Agreement {selectedRequest.agreementId} proposed. Awaiting {selectedRequest.processorName || "Processor"} to accept terms and complete advance payment.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {(selectedRequest.status === "PAID" || selectedRequest.status === "DELIVERED") && isProcurementOfficer && (
                  <div className="pt-2">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Payment Confirmed
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                        Payment received via {selectedRequest.paymentMethod || "UPI"}. Delivery Challan #{selectedRequest.deliveryChallanNumber || "DC-2026-001"} issued.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : isProcurementOfficer && selectedRequest.status !== "REJECTED" ? (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-xs space-y-2">
                <p className="font-bold text-blue-900 dark:text-blue-300">
                  Procurement Action Required
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Review processor purchase request and formulate a binding MSP purchase agreement.
                </p>
                <Button
                  onClick={() => handleOpenProposeModal(selectedRequest)}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs h-9 cursor-pointer"
                >
                  Propose Agreement
                </Button>
              </div>
            ) : null}

            {/* Shipment & Driver Details (If Paid / In Transit / Delivered) */}
            {(selectedRequest.status === "PAID" || selectedRequest.status === "DELIVERED" || selectedRequest.shipmentId) && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" /> Logistics & Driver
                  </h4>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                    {selectedRequest.status === "DELIVERED" ? "DELIVERED" : "IN TRANSIT"}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Driver Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedRequest.driverName || "Ravi Kumar"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Driver Phone</span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {selectedRequest.driverPhone || "+91 98765 43210"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vehicle Number</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedRequest.vehicleNumber || "KA-09-AB-4521"}
                    </span>
                  </div>
                  {selectedRequest.deliveryChallanNumber && (
                    <div className="flex justify-between">
                      <span>Delivery Challan</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {selectedRequest.deliveryChallanNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Delivery OTP Card */}
                {selectedRequest.deliveryOtp && (
                  <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-lg p-3 text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Delivery Verification OTP
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-black font-mono tracking-widest text-emerald-700 dark:text-emerald-400">
                        {selectedRequest.deliveryOtp}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopyOtp(selectedRequest.deliveryOtp)}
                        className="h-7 w-7 text-slate-500 hover:text-emerald-600 cursor-pointer"
                        title="Copy OTP"
                      >
                        {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Share this 4-digit OTP with the driver upon delivery to confirm receipt.
                    </p>
                  </div>
                )}

                {/* Photo Proof if delivered */}
                {selectedRequest.deliveryProofPhotoUrl && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Delivery Photo Proof
                    </p>
                    <img
                      src={selectedRequest.deliveryProofPhotoUrl}
                      alt="Delivery proof"
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/dispatches/${selectedRequest.shipmentId || "DSP-2026-004"}`)}
                    className="flex-1 text-xs font-semibold h-8 cursor-pointer"
                  >
                    View Shipment
                  </Button>
                </div>
              </div>
            )}

            {/* Request Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Request Timeline
              </h4>

              <div className="space-y-4 relative pl-5 border-l-2 border-slate-200 dark:border-slate-800 text-xs">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Request Submitted</p>
                  <p className="text-[11px] text-slate-400">22 Aug, 10:15 AM</p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">FPO Reviewed</p>
                  <p className="text-[11px] text-slate-400">22 Aug, 11:40 AM</p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 h-4 w-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Negotiation Started</p>
                  <p className="text-[11px] text-slate-400">22 Aug, 12:10 PM</p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div
                    className={`absolute -left-[27px] top-0 h-4 w-4 rounded-full flex items-center justify-center ${
                      selectedRequest.agreementId
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-600"
                    }`}
                  >
                    {selectedRequest.agreementId ? <Check className="w-2.5 h-2.5" /> : null}
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Agreement Proposed</p>
                  <p className="text-[11px] text-slate-400">
                    {selectedRequest.agreementId ? "22 Aug, 02:30 PM" : "Pending"}
                  </p>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <div
                    className={`absolute -left-[27px] top-0 h-4 w-4 rounded-full flex items-center justify-center ${
                      selectedRequest.status === "PAID" || selectedRequest.status === "DELIVERED"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-600"
                    }`}
                  >
                    {selectedRequest.status === "PAID" || selectedRequest.status === "DELIVERED" ? (
                      <Check className="w-2.5 h-2.5" />
                    ) : null}
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Payment</p>
                  <p className="text-[11px] text-slate-400">
                    {selectedRequest.status === "PAID" || selectedRequest.status === "DELIVERED"
                      ? "Completed (100% Advance)"
                      : "Pending"}
                  </p>
                </div>

                {/* Step 6 */}
                <div className="relative">
                  <div
                    className={`absolute -left-[27px] top-0 h-4 w-4 rounded-full flex items-center justify-center ${
                      selectedRequest.status === "DELIVERED"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-300 dark:bg-slate-700 text-slate-600"
                    }`}
                  >
                    {selectedRequest.status === "DELIVERED" ? <Check className="w-2.5 h-2.5" /> : null}
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Delivery</p>
                  <p className="text-[11px] text-slate-400">
                    {selectedRequest.status === "DELIVERED"
                      ? "Delivered & Verified via OTP"
                      : "Pending Dispatch"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Propose Agreement Dialog (for Procurement Officer) */}
      <Dialog open={proposeModalOpen} onOpenChange={setProposeModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Propose Purchase Agreement</DialogTitle>
            <DialogDescription className="text-xs">
              Formulate a formal purchase agreement for {selectedRequest?.requestCode} ({selectedRequest?.lotId}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div>
              <label className="block text-xs font-semibold mb-1">Agreed Quantity (kg)</label>
              <Input
                type="number"
                value={proposeForm.agreedQuantityKg}
                onChange={(e) => setProposeForm({ ...proposeForm, agreedQuantityKg: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Selling Price (₹ / kg)</label>
              <Input
                type="number"
                step="0.01"
                value={proposeForm.sellingPricePerKg}
                onChange={(e) => setProposeForm({ ...proposeForm, sellingPricePerKg: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Validity (Days)</label>
              <Input
                type="number"
                value={proposeForm.validDays}
                onChange={(e) => setProposeForm({ ...proposeForm, validDays: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Payment Terms</label>
              <Input
                value={proposeForm.paymentTerms}
                onChange={(e) => setProposeForm({ ...proposeForm, paymentTerms: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setProposeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmitProposal}
              disabled={proposing}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
            >
              {proposing ? "Submitting..." : "Send Proposal to Processor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
