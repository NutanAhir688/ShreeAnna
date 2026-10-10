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
  UserCheck,
  Car,
  MapPin,
  Phone,
  Calendar,
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
import { CertificateDocument } from "./VerifyCertificate";
import { useAuth } from "@/context/AuthContext";


function QualityManagement({ defaultTab = "assigned" }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const userRole = user?.role || "FpoManager";
  const isProcurementOfficer = userRole === "ProcurementOfficer";

  // Active tab: assigned | history | certifications
  const rawTab = searchParams.get("tab") || defaultTab;
  const activeTab = isProcurementOfficer ? "certifications" : rawTab;

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

  // Inspector Assignment Modal State
  const [selectedLotForAssign, setSelectedLotForAssign] = useState(null);

  const handleAssignInspectorSubmit = async (data) => {
    if (!selectedLotForAssign) return;
    const updated = await lotsApi.assignInspector(selectedLotForAssign.id, data);
    setAssignedLots((prev) =>
      prev.map((l) =>
        l.id === updated.id
          ? {
              ...l,
              assignedInspectorName: updated.assignedInspectorName,
              assignedInspectorPhone: updated.assignedInspectorPhone,
              scheduledInspectionDate: updated.scheduledInspectionDate,
              inspectionTrackingStatus: updated.inspectionTrackingStatus,
              status: updated.status,
            }
          : l
      )
    );
    setSelectedLotForAssign(null);
  };

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
            {isProcurementOfficer
              ? "Review and view issued quality certifications."
              : "Conduct quality inspections, review inspection history, and issue certifications."}
          </p>
        </div>
      </div>

      {/* Quick Stats Banner */}
      <div className={`grid gap-4 sm:grid-cols-2 ${isProcurementOfficer ? "" : "lg:grid-cols-4"}`}>
        {!isProcurementOfficer && (
          <>
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
          </>
        )}

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
        {!isProcurementOfficer && (
          <>
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
          </>
        )}

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
      {!loading && !error && !isProcurementOfficer && activeTab === "assigned" && (
        <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead className="pl-6">Lot Number</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Millet Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Assigned Inspector</TableHead>
                <TableHead>Tracking Status</TableHead>
                <TableHead className="pr-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssigned.length > 0 ? (
                filteredAssigned.map((lot) => {
                  const isAssigned = !!lot.assignedInspectorName;
                  const trackingStatus = (lot.inspectionTrackingStatus || "ASSIGNED").toUpperCase();

                  return (
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
                      <TableCell>
                        {isAssigned ? (
                          <div>
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                              {lot.assignedInspectorName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {lot.assignedInspectorPhone || "+91 9876543210"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isAssigned ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold text-xs">
                            {trackingStatus === "IN_TRANSIT" && "🚗 In Transit"}
                            {trackingStatus === "ARRIVED_AT_FARM" && "📍 Arrived at Farm"}
                            {trackingStatus === "COMPLETED" && "✓ Completed"}
                            {trackingStatus === "ASSIGNED" && "📋 Assigned"}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800 text-xs">
                            Pending Assignment
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
                            onClick={() => setSelectedLotForAssign(lot)}
                          >
                            <UserCheck className="mr-1 h-3.5 w-3.5" />
                            {isAssigned ? "Re-Assign" : "Assign Inspector"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-semibold"
                            onClick={() => navigate(`/procurement-lots/${lot.id}`)}
                          >
                            <ExternalLink className="mr-1 h-3.5 w-3.5" />
                            View Lot
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
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
      {!loading && !error && !isProcurementOfficer && activeTab === "history" && (
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
          <DialogContent className="max-w-4xl sm:max-w-4xl w-[92vw] bg-white p-6 max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-slate-900">
                      Official Quality Certificate
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      ShreeAnna National Agricultural Quality Registry
                    </DialogDescription>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="mr-1.5 h-4 w-4" />
                  Print / Save PDF
                </Button>
              </div>
            </DialogHeader>

            <div className="my-2">
              <CertificateDocument certificate={selectedCert} />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => navigate(`/verify-certificate?certNumber=${selectedCert.certificateNumber}`)}>
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Open Verification Link
              </Button>
              <Button size="sm" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}


      {/* Assign Inspector Modal Dialog */}
      {selectedLotForAssign && (
        <AssignInspectorModal
          isOpen={Boolean(selectedLotForAssign)}
          onClose={() => setSelectedLotForAssign(null)}
          onSubmit={handleAssignInspectorSubmit}
        />
      )}
    </div>
  );
}

/* ---------------- Assign Inspector Modal ---------------- */
function AssignInspectorModal({ isOpen, onClose, onSubmit }) {
  const [registeredInspectors, setRegisteredInspectors] = useState([]);
  const [selectedInspectorId, setSelectedInspectorId] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorPhone, setInspectorPhone] = useState("");
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [isLoadingInspectors, setIsLoadingInspectors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchInspectors() {
      try {
        setIsLoadingInspectors(true);
        const list = await lotsApi.getInspectors();
        if (Array.isArray(list) && list.length > 0) {
          setRegisteredInspectors(list);
          const first = list[0];
          setSelectedInspectorId(first.id);
          setInspectorName(`${first.name} (${first.role || "Inspector"})`);
          setInspectorPhone(first.phone || "+91 9876543210");
        } else {
          const defaultList = [
            { id: "def-1", name: "Ananya Roy", role: "Quality Inspector", phone: "+91 9876543210" },
            { id: "def-2", name: "Vikram Singh", role: "Field Officer", phone: "+91 9876543211" },
            { id: "def-3", name: "Suresh Kumar", role: "Senior Inspector", phone: "+91 9876543212" }
          ];
          setRegisteredInspectors(defaultList);
          setSelectedInspectorId(defaultList[0].id);
          setInspectorName(`${defaultList[0].name} (${defaultList[0].role})`);
          setInspectorPhone(defaultList[0].phone);
        }
      } catch (err) {
        console.warn("Failed to fetch registered inspectors:", err);
      } finally {
        setIsLoadingInspectors(false);
      }
    }
    fetchInspectors();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelectedInspectorId(val);
    if (val === "custom") {
      setInspectorName("");
      setInspectorPhone("");
      return;
    }
    const found = registeredInspectors.find((i) => String(i.id) === String(val));
    if (found) {
      setInspectorName(`${found.name} (${found.role || "Inspector"})`);
      setInspectorPhone(found.phone || "+91 9876543210");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const chosenId = selectedInspectorId !== "custom" && selectedInspectorId ? selectedInspectorId : null;
      await onSubmit({
        inspectorId: chosenId,
        inspectorName,
        inspectorPhone,
        scheduledDate: new Date(scheduledDate).toISOString(),
      });
      onClose();
    } catch (err) {
      alert(err.message || "Failed to assign inspector");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Assign Quality Inspector</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Select Registered Inspector</label>
              {isLoadingInspectors && <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />}
            </div>
            <select
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none bg-white"
              value={selectedInspectorId}
              onChange={handleSelectChange}
            >
              {registeredInspectors.map((insp) => (
                <option key={insp.id} value={insp.id}>
                  {insp.name} ({insp.role || "Inspector"}) — {insp.phone}
                </option>
              ))}
              <option value="custom">+ Add New / Custom Inspector...</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector Full Name & Designation</label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="e.g. Ananya Roy (Quality Inspector)"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector Mobile Number (For Farmer Contact)</label>
            <input
              type="text"
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none"
              value={inspectorPhone}
              onChange={(e) => setInspectorPhone(e.target.value)}
              placeholder="+91 9876543210"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Inspection Date & Time</label>
            <input
              type="datetime-local"
              className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
            🔔 <strong>Farmer App Sync:</strong> Assigning will notify the farmer in their mobile app with the inspector name, phone number, and real-time visit tracking status.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? "Assigning..." : "Assign & Notify Farmer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default QualityManagement;
