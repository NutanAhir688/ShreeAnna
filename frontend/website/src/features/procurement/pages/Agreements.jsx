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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

  // Document Modal & Create Modal State
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLotForAgreement, setSelectedLotForAgreement] = useState("");
  const [customMspRate, setCustomMspRate] = useState("40.00");

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

      return {
        id: l.id,
        agreementCode: `AGR-${l.lotNumber || l.id.slice(0, 6).toUpperCase()}`,
        lotId: l.id,
        lotNumber: l.lotNumber || l.id.slice(0, 6),
        farmerName: l.farmerName || "Registered Farmer",
        farmerId: l.farmerId,
        farmName: l.farmName || "Registered Farm",
        milletType: l.milletType || "Finger Millet (Ragi)",
        quantityKg: qty,
        mspRate: msp,
        totalValue: totalVal,
        status: l.status || "SUBMITTED",
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
        matchStatus = agr.status.toUpperCase().includes("ACCEPTED") || agr.status.toUpperCase().includes("CERTIFIED");
      } else if (statusFilter === "REJECTED") {
        matchStatus = agr.status.toUpperCase().includes("REJECTED");
      } else if (statusFilter === "PENDING") {
        matchStatus = !agr.status.toUpperCase().includes("ACCEPTED") && !agr.status.toUpperCase().includes("REJECTED");
      }

      return matchSearch && matchStatus;
    });
  }, [agreements, search, statusFilter]);

  // Stats
  const totalCount = agreements.length;
  const acceptedCount = agreements.filter(
    (a) => a.status.toUpperCase().includes("ACCEPTED") || a.status.toUpperCase().includes("CERTIFIED")
  ).length;
  const pendingCount = agreements.filter(
    (a) => !a.status.toUpperCase().includes("ACCEPTED") && !a.status.toUpperCase().includes("REJECTED")
  ).length;
  const totalValSum = agreements.reduce((acc, a) => acc + a.totalValue, 0);

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

  const handleCreateAgreement = async () => {
    if (!selectedLotForAgreement) return;
    setActionLoading(true);
    try {
      await agreementsApi.accept(selectedLotForAgreement);
      await loadAgreements();
      setShowCreateModal(false);
      setSelectedLotForAgreement("");
    } catch (err) {
      alert(err.message || "Failed to create agreement.");
    } finally {
      setActionLoading(false);
    }
  };

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

        <Button onClick={() => setShowCreateModal(true)}>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAgreement(agr)}
                        >
                          <FileText className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                          View Document
                        </Button>
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

      {/* CREATE NEW AGREEMENT MODAL */}
      {showCreateModal && (
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-md bg-white p-6 border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Create Procurement Agreement
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Select a procurement lot to generate a formal purchasing agreement.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 my-3">
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Select Procurement Lot
                </label>
                <Select
                  value={selectedLotForAgreement}
                  onValueChange={(val) => {
                    setSelectedLotForAgreement(val);
                    const selected = lots.find((l) => l.id === val);
                    if (selected && MSP_RATES[selected.milletType]) {
                      setCustomMspRate(MSP_RATES[selected.milletType].toString());
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a lot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lots.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        Lot #{l.lotNumber || l.id.slice(0, 6)} - {l.farmerName || "Farmer"} ({l.milletType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-1 block">
                  Agreed MSP Rate (₹ / kg)
                </label>
                <Input
                  type="number"
                  step="0.5"
                  value={customMspRate}
                  onChange={(e) => setCustomMspRate(e.target.value)}
                  placeholder="e.g. 40.00"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                disabled={!selectedLotForAgreement || actionLoading}
                onClick={handleCreateAgreement}
              >
                {actionLoading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                Generate & Sign Agreement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default Agreements;
