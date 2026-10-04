import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Download,
  Truck,
  User,
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  X,
} from "lucide-react";

export default function DeliveryChallanModal({ open, onClose, shipment }) {
  const challanRef = useRef(null);

  if (!shipment) return null;

  const challanNo = `DC-2026-${(shipment.dispatchCode || shipment.id || "001").slice(-3).toUpperCase()}`;
  const issueDate = shipment.scheduledDate || shipment.assignedDate || new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white p-0 border border-slate-200 overflow-hidden shadow-2xl">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold tracking-tight">Official Delivery Challan</h2>
              <p className="text-[10px] text-slate-400 font-mono">Challan No: {challanNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="h-8 text-xs font-bold border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Delivery Challan Content */}
        <div ref={challanRef} className="p-6 space-y-6 text-slate-800 text-xs bg-white">
          {/* Challan Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-900 text-white font-black text-sm px-2.5 py-1 rounded tracking-wide">
                  ShreeAnna
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Logistics & Distribution
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 mt-2 tracking-tight uppercase">
                DELIVERY CHALLAN
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Issued for agricultural millet dispatch and transport movement.
              </p>
            </div>

            <div className="text-right font-mono space-y-1">
              <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 text-xs font-black px-2.5 py-0.5 uppercase tracking-wider">
                VALID DISPATCH PASS
              </Badge>
              <p className="text-xs font-bold text-slate-900 mt-1">Challan #: {challanNo}</p>
              <p className="text-[11px] text-slate-500">Date: {issueDate}</p>
              <p className="text-[11px] text-slate-500">Shipment ID: {shipment.dispatchCode || shipment.shipmentCode || shipment.id}</p>
            </div>
          </div>

          {/* Grid Section 1: Origin & Destination */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Origin */}
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                CONSIGNOR / ORIGIN (PICKUP)
              </p>
              <p className="font-bold text-slate-900 text-sm">
                {shipment.farmerOrProcessorName || "Farmer / Producer"}
              </p>
              <p className="text-slate-600 text-xs">
                {shipment.sourceAddress || "Dahod District, Gujarat"}
              </p>
              {shipment.agreementId && (
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Agreement ID: {shipment.agreementId}
                </p>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-1 border-l border-slate-200 pl-6">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-emerald-700" />
                CONSIGNEE / DESTINATION (DELIVERY)
              </p>
              <p className="font-bold text-slate-900 text-sm">
                {shipment.destinationAddress || shipment.warehouseName || "Central Warehouse"}
              </p>
              <p className="text-slate-600 text-xs">
                Mandya Warehouse Facility, Zone A
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Transport Mode: {shipment.transportResponsibility || "FPO Dedicated Vehicle"}
              </p>
            </div>
          </div>

          {/* Grid Section 2: Driver & Vehicle Authorization */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl space-y-3">
            <p className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-800" />
              CARRIER & DRIVER ASSIGNMENT DETAILS
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Assigned Driver:</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {shipment.driverName || "Ravi Kumar"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Driver Contact:</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">
                  {shipment.driverPhone || "+91 98765 43210"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Vehicle Reg No:</span>
                <p className="font-mono font-black text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded inline-block mt-0.5">
                  {shipment.vehicleNumber || "KA-09-AB-4521"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Verification Code:</span>
                <p className="font-mono font-black text-emerald-800 text-sm mt-0.5">
                  {shipment.verificationCode || "4829"}
                </p>
              </div>
            </div>
          </div>

          {/* Commodity Details Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Lot Reference</th>
                  <th className="p-3">Millet Commodity</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3 text-right">Expected Qty (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr>
                  <td className="p-3 font-mono font-bold">{shipment.lotId || "LOT-2026-004"}</td>
                  <td className="p-3 font-bold text-slate-900">{shipment.milletType || "Pearl Millet"}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px] font-bold">Grade B</Badge>
                  </td>
                  <td className="p-3 text-right font-black text-slate-900 text-sm">
                    {(shipment.quantityKg || shipment.totalQuantityKg || shipment.expectedQuantityKg || 3500).toLocaleString("en-IN")} kg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms & Verification Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                AUTHORIZATION & SECURITY STAMP
              </p>
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <QrCode className="h-10 w-10 text-slate-800 shrink-0" />
                <div className="text-[10px] text-slate-500 font-medium">
                  <p className="font-bold text-slate-800">ShreeAnna Supply Chain Verification</p>
                  <p>Electronically verified on driver dispatch assignment.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500 font-bold">
              <div className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col justify-between h-24">
                <span>Driver Signature</span>
                <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
                <span className="text-[9px] text-slate-400 font-normal">Accepted in Good Order</span>
              </div>
              <div className="border border-dashed border-slate-300 rounded-lg p-4 flex flex-col justify-between h-24">
                <span>Warehouse Receiver Seal</span>
                <div className="border-b border-slate-400 w-3/4 mx-auto"></div>
                <span className="text-[9px] text-slate-400 font-normal">Receiver Sign & Date</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
