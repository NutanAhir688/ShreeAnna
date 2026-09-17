import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  History,
  Award,
  Search,
  RotateCcw,
  Plus,
  Loader2,
  AlertCircle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  X,
  ExternalLink,
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

import { qualityApi, lotsApi } from "@/services/api";

function QualityManagement({ defaultTab = "assigned" }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: assigned | history | certifications
  const activeTab = searchParams.get("tab") || defaultTab;

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // State
  const [assignedLots, setAssignedLots] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState(null);

  // Load Data from Backend APIs
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [lotsRes, inspRes, certsRes] = await Promise.all([
          lotsApi.getAll().catch(() => []),
          qualityApi.getAll().catch(() => []),
          qualityApi.getAllCertificates().catch(() => []),
        ]);

        // Assigned/Pending lots = Lots with status SUBMITTED or QUALITY_INSPECTION or not yet certified/failed
        const pending = Array.isArray(lotsRes)
          ? lotsRes.filter(
              (l) =>
                l.status === "SUBMITTED" ||
                l.status === "QUALITY_INSPECTION" ||
                l.status === "Pending Inspection"
            )
          : [];

        setAssignedLots(pending);
        setInspections(Array.isArray(inspRes) ? inspRes : []);
        setCertificates(Array.isArray(certsRes) ? certsRes : []);
      } catch (err) {
        setError(err.message || "Failed to load quality management data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filtered Assigned Lots
  const filteredAssigned = useMemo(() => {
    const q = search.toLowerCase();
    return assignedLots.filter(
      (l) =>
        (l.lotNumber || l.id || "").toLowerCase().includes(q) ||
        (l.farmerName || "").toLowerCase().includes(q) ||
        (l.milletType || "").toLowerCase().includes(q)
    );
  }, [assignedLots, search]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    const q = search.toLowerCase();
    return inspections.filter((item) => {
      const matchSearch =
        (item.lotNumber || "").toLowerCase().includes(q) ||
        (item.inspectorName || "").toLowerCase().includes(q) ||
        (item.grade || "").toLowerCase().includes(q) ||
        (item.notes || "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        item.status.toUpperCase() === statusFilter.toUpperCase();

      return matchSearch && matchStatus;
    });
  }, [inspections, search, statusFilter]);

  // Filtered Certifications
  const filteredCertificates = useMemo(() => {
    const q = search.toLowerCase();
    return certificates.filter(
      (c) =>
        (c.certificateNumber || "").toLowerCase().includes(q) ||
        (c.lotNumber || "").toLowerCase().includes(q) ||
        (c.issuedBy || "").toLowerCase().includes(q) ||
        (c.grade || "").toLowerCase().includes(q)
    );
  }, [certificates, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quality Management
          </h1>
          <p className="text-sm text-slate-500">
            Conduct quality inspections, review inspection history, and issue certifications.
          </p>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Inspections
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {assignedLots.length}
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
                Total Inspections
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {inspections.length}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Certificates Issued
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {certificates.length}
              </p>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pass Rate
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {inspections.length > 0
                  ? `${Math.round(
                      (inspections.filter((i) => i.status === "PASSED").length /
                        inspections.length) *
                        100
                    )}%`
                  : "100%"}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-purple-600">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 rounded-t-lg shadow-xs">
        <button
          onClick={() => setActiveTab("assigned")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "assigned"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="h-4 w-4" />
          Assigned Inspections
          {assignedLots.length > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
              {assignedLots.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="h-4 w-4" />
          Inspection History
          <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
            {inspections.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("certifications")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === "certifications"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="h-4 w-4" />
          Certifications
          <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            {certificates.length}
          </span>
        </button>
      </div>

      {/* Global Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-lg border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "assigned"
                ? "Search lot number, farmer, or millet type..."
                : activeTab === "history"
                ? "Search inspection, inspector, lot #, or grade..."
                : "Search certificate #, lot #, or issued by..."
            }
            className="pl-9"
          />
        </div>

        {activeTab === "history" && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue placeholder="All Results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Results</SelectItem>
              <SelectItem value="PASSED">Passed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSearch("");
            setStatusFilter("all");
          }}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center h-48 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500">Loading data from server...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* TAB 1: ASSIGNED INSPECTIONS */}
      {!loading && !error && activeTab === "assigned" && (
        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead className="pl-6">Lot Number</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Millet Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssigned.length > 0 ? (
                filteredAssigned.map((lot) => (
                  <TableRow key={lot.id} className="hover:bg-slate-50/80">
                    <TableCell className="pl-6 font-semibold text-slate-900">
                      {lot.lotNumber || lot.id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800">{lot.farmerName || "Farmer"}</p>
                        <p className="text-xs text-slate-400">{lot.farmName || "Farm"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {lot.milletType || lot.millet || "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {lot.estimatedQuantityKg
                        ? `${lot.estimatedQuantityKg} kg`
                        : lot.quantityDisplay || "—"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {lot.submissionDate
                        ? new Date(lot.submissionDate).toLocaleDateString("en-IN")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                        Pending Inspection
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        onClick={() => navigate(`/procurement-lots/${lot.id}/inspection`)}
                      >
                        <ClipboardCheck className="mr-1.5 h-4 w-4" />
                        Start Inspection
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-36 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-1" />
                      <p className="font-semibold text-slate-800">No pending inspections</p>
                      <p className="text-xs text-slate-500">
                        All procurement lots have been inspected or no new submissions found.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* TAB 2: INSPECTION HISTORY */}
      {!loading && !error && activeTab === "history" && (
        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead className="pl-6">Lot Number</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Moisture %</TableHead>
                <TableHead>Purity %</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Inspection Date</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="pr-6 text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/80">
                    <TableCell className="pl-6 font-semibold text-slate-900">
                      {item.lotNumber}
                    </TableCell>
                    <TableCell className="text-slate-800 font-medium">
                      {item.inspectorName || "Inspector"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.moisturePercentage}%</TableCell>
                    <TableCell className="font-mono text-sm">{item.purityPercentage}%</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-semibold">
                        {item.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      {item.inspectionDate
                        ? new Date(item.inspectionDate).toLocaleDateString("en-IN")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {item.status?.toUpperCase() === "PASSED" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Passed
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/procurement-lots/${item.lotId}`)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Lot
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-36 text-center text-slate-500">
                    <p className="font-medium text-slate-800">No inspection records found</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Complete inspections will appear here.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* TAB 3: CERTIFICATIONS */}
      {!loading && !error && activeTab === "certifications" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((cert) => (
              <Card
                key={cert.id}
                className="border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3 border-b bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-emerald-600 text-white font-bold">
                      {cert.grade || "Grade A"}
                    </Badge>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {cert.certificateNumber}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-2">
                    Lot #{cert.lotNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Issued By</p>
                      <p className="font-semibold text-slate-700">{cert.issuedBy || "Quality Officer"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Issue Date</p>
                      <p className="font-medium text-slate-700">
                        {cert.issueDate
                          ? new Date(cert.issueDate).toLocaleDateString("en-IN")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Valid Until</p>
                      <p className="font-medium text-emerald-700">
                        {cert.validUntil
                          ? new Date(cert.validUntil).toLocaleDateString("en-IN")
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Status</p>
                      <p className="font-semibold text-emerald-600">Active & Valid</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-semibold"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <Award className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                      View Certificate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white py-12 text-center">
              <Award className="h-10 w-10 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-800">No quality certificates found</p>
              <p className="text-xs text-slate-500 mt-1">
                Certificates are generated automatically when a lot passes quality inspection.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal Dialog */}
      {selectedCert && (
        <Dialog open={Boolean(selectedCert)} onOpenChange={() => setSelectedCert(null)}>
          <DialogContent className="max-w-md bg-white p-6 border-2 border-emerald-500/30">
            <DialogHeader>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                      Quality Certificate
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      ShreeAnna FPO Quality Assurance Division
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="my-4 space-y-4 rounded-lg bg-emerald-50/40 p-4 border border-emerald-100">
              <div className="text-center pb-2 border-b border-emerald-200/60">
                <p className="text-xs uppercase tracking-widest text-emerald-800 font-extrabold">
                  Certificate of Analysis
                </p>
                <p className="font-mono text-sm font-bold text-slate-800 mt-1">
                  {selectedCert.certificateNumber}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lot Identifier:</span>
                  <span className="font-bold text-slate-900">{selectedCert.lotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Quality Grade:</span>
                  <Badge className="bg-emerald-700 text-white font-bold">{selectedCert.grade}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issued By:</span>
                  <span className="font-semibold">{selectedCert.issuedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issue Date:</span>
                  <span>{new Date(selectedCert.issueDate).toLocaleDateString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Valid Until:</span>
                  <span className="font-semibold text-emerald-700">
                    {new Date(selectedCert.validUntil).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-200/60 text-center">
                <div className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  VERIFIED & CERTIFIED
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-1.5 h-4 w-4" />
                Print Certificate
              </Button>
              <Button size="sm" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default QualityManagement;
