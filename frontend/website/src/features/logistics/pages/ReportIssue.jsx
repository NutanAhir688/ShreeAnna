import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  FileText,
  Search,
  Truck,
  User,
  UploadCloud,
  X,
  Paperclip,
  Loader2,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logisticsApi } from "@/services/api";

function ReportIssue() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shipment, setShipment] = useState(null);

  // Form State
  const [referenceType, setReferenceType] = useState("Shipment");
  const [referenceId, setReferenceId] = useState(id || "SHP-2026-002");
  const [issueCategory, setIssueCategory] = useState("Select a category...");
  const [incidentDateTime, setIncidentDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [priorityLevel, setPriorityLevel] = useState("Medium");
  const [subject, setSubject] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [attachments, setAttachments] = useState([
    { name: "damaged_stock_01.jpg", size: "2.4 MB" },
    { name: "driver_challan.pdf", size: "1.1 MB" },
  ]);

  useEffect(() => {
    async function loadReferenceData() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await logisticsApi.getById(id);
        if (data) {
          setShipment(data);
          setReferenceId(data.dispatchCode || data.id);
        }
      } catch (err) {
        console.error("Failed to load reference dispatch:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReferenceData();
  }, [id]);

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      }));
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!issueCategory || issueCategory === "Select a category...") {
      alert("Please select an issue category.");
      return;
    }
    if (!subject.trim()) {
      alert("Please enter a subject / summary for the issue.");
      return;
    }

    setSubmitting(true);
    try {
      await logisticsApi.reportIssue({
        referenceType,
        referenceId: referenceId || (shipment?.dispatchCode || id || "SHP-2026-002"),
        farmerName: shipment?.farmerOrProcessorName || "Sunita Devi",
        driverName: shipment?.driverName || "Ravi Kumar",
        issueCategory,
        incidentDateTime: incidentDateTime ? new Date(incidentDateTime) : new Date(),
        priorityLevel,
        subject,
        detailedDescription,
        attachmentUrls: attachments.map((a) => a.name),
      }, id || shipment?.id);

      alert("Issue report submitted successfully! The shipment status has been updated to Pending Dispatch.");
      if (id || shipment?.id) {
        navigate(`/logistics/${id || shipment.id}`);
      } else {
        navigate("/logistics?status=Pending Dispatch");
      }
    } catch (err) {
      console.error("Failed to submit issue report:", err);
      alert(err.message || "Failed to submit issue report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <span className="hover:underline cursor-pointer" onClick={() => navigate("/logistics")}>LOGISTICS</span>
        <span>&gt;</span>
        <span className="hover:underline cursor-pointer" onClick={() => navigate(id ? `/logistics/${id}` : "/logistics")}>SHIPMENT DETAILS</span>
        <span>&gt;</span>
        <span className="text-slate-900 font-extrabold">REPORT ISSUE</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Report Issue
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Flag operational problems or discrepancies for administrative review.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Context & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Issue Context */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <AlertCircle className="h-5 w-5 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Issue Context
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4 text-xs space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Reference Type
                  </label>
                  <Select value={referenceType} onValueChange={setReferenceType}>
                    <SelectTrigger className="h-9 text-xs border-slate-300 bg-white font-semibold">
                      <SelectValue placeholder="Reference Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shipment">Shipment</SelectItem>
                      <SelectItem value="Procurement Lot">Procurement Lot</SelectItem>
                      <SelectItem value="Agreement">Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Reference ID
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      placeholder="SHP-2026-002"
                      className="h-9 text-xs border-slate-300 font-mono font-bold pr-8"
                    />
                    <Search className="h-4 w-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {/* Related Participants Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Related Participants</p>
                <div className="flex flex-wrap items-center gap-6 text-slate-800 font-bold">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-slate-500" />
                    <span>Farmer: {shipment?.farmerOrProcessorName || "Sunita Devi"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-4 w-4 text-slate-500" />
                    <span>Driver: {shipment?.driverName || "Ravi Kumar"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Issue Details */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Issue Details
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4 text-xs space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Issue Category <span className="text-red-500">*</span>
                  </label>
                  <Select value={issueCategory} onValueChange={setIssueCategory}>
                    <SelectTrigger className="h-9 text-xs border-slate-300 bg-white font-semibold">
                      <SelectValue placeholder="Select a category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vehicle Delay / Breakdown">Vehicle Delay / Breakdown</SelectItem>
                      <SelectItem value="Quantity Discrepancy">Quantity Discrepancy</SelectItem>
                      <SelectItem value="Quality / Damaged Goods">Quality / Damaged Goods</SelectItem>
                      <SelectItem value="Driver Unreachable">Driver Unreachable</SelectItem>
                      <SelectItem value="Location / Address Error">Location / Address Error</SelectItem>
                      <SelectItem value="Other Issue">Other Issue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Incident Date & Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="datetime-local"
                    value={incidentDateTime}
                    onChange={(e) => setIncidentDateTime(e.target.value)}
                    className="h-9 text-xs border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Low", "Medium", "High", "Urgent"].map((prio) => (
                    <button
                      key={prio}
                      type="button"
                      onClick={() => setPriorityLevel(prio)}
                      className={`h-9 rounded-md text-xs font-bold transition border ${
                        priorityLevel === prio
                          ? "bg-emerald-800 text-white border-emerald-800"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {prio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of the issue..."
                  className="h-9 text-xs border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  maxLength={1000}
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Provide a detailed explanation of the problem, including any steps taken so far..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-md font-normal focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <div className="text-right text-[10px] text-slate-400 mt-1">
                  {detailedDescription.length} / 1000 characters
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Evidence & Attachments + Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <Paperclip className="h-5 w-5 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Evidence & Attachments
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-4 text-xs space-y-4">
              <p className="text-[11px] text-slate-500">
                Upload photos of damaged stock, scanned Challans, or GRNs.
              </p>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50/50 hover:bg-slate-100/50 transition relative">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-2 text-slate-400">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-800">
                  Click to upload or drag and drop
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  SVG, PNG, JPG or PDF (max. 10MB)
                </p>
              </div>

              {/* Attachment File Items List */}
              <div className="space-y-2">
                {attachments.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-1.5 bg-slate-200/70 rounded text-slate-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate text-xs">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions Card */}
          <Card className="border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting Report...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Submit Issue Report
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full h-9 border-slate-300 text-slate-700 font-bold text-xs"
            >
              Cancel
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default ReportIssue;
