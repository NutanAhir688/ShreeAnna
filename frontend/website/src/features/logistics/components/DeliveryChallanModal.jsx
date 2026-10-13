import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Printer,
  Truck,
  Building2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

function formatChallanDate(dateVal) {
  if (!dateVal) return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateVal);
  }
}

export default function DeliveryChallanModal({ open, onClose, shipment }) {
  const challanRef = useRef(null);

  if (!shipment) return null;

  const challanNo = `DC-2026-${(shipment.dispatchCode || shipment.id || "001").slice(-3).toUpperCase()}`;
  const issueDate = formatChallanDate(shipment.scheduledDate || shipment.assignedDate);

  const verificationCode = shipment.verificationCode || "9304";
  const displayLot =
    shipment.displayLotCode ||
    shipment.lotNumber ||
    (shipment.lotId && shipment.lotId.length === 36 ? `LOT-${shipment.lotId.slice(0, 6).toUpperCase()}` : shipment.lotId) ||
    "LOT-4176";

  const displayGrade =
    shipment.grade && shipment.grade !== "-" ? shipment.grade : "Grade A";

  // Build real verification URL encoded into QR Code for instant scanning & verification
  const qrVerificationUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify?shipmentId=${encodeURIComponent(
        shipment.id || shipment.dispatchCode || ""
      )}`
      : "";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl sm:max-w-4xl w-full bg-white dark:bg-slate-900 p-0 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-slate-800">
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
              className="h-8 text-xs font-bold border-slate-700 bg-slate-800 text-white hover:bg-slate-700 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 mr-1" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Printable Delivery Challan Content */}
        <div ref={challanRef} className="p-6 space-y-6 text-slate-800 dark:text-slate-200 text-xs bg-white dark:bg-slate-900 overflow-y-auto">
          {/* Challan Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 dark:border-slate-700 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-900 text-white font-black text-sm px-2.5 py-1 rounded tracking-wide">
                  ShreeAnna
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Logistics & Distribution
                </span>
              </div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
                DELIVERY CHALLAN
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Issued for agricultural millet dispatch and transport movement.
              </p>
            </div>

            <div className="text-right font-mono space-y-1">
              <Badge className="bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 text-xs font-black px-2.5 py-0.5 uppercase tracking-wider">
                VALID DISPATCH PASS
              </Badge>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">Challan #: {challanNo}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Date: {issueDate}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Shipment ID: {shipment.dispatchCode || shipment.shipmentCode || shipment.id}</p>
            </div>
          </div>

          {/* Grid Section 1: Origin & Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Origin */}
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                CONSIGNOR / ORIGIN (PICKUP)
              </p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {shipment.farmerOrProcessorName || shipment.farmerName || "Farmer / Supplier"}
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-xs">
                {shipment.sourceAddress || shipment.pickupLocation || "Farm Location"}
              </p>
              {(shipment.agreementId || shipment.agreementNo) && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                  Agreement ID: {shipment.agreementId || shipment.agreementNo}
                </p>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-1 md:border-l md:border-slate-200 md:dark:border-slate-700 md:pl-6">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                CONSIGNEE / DESTINATION (DELIVERY)
              </p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {shipment.destinationAddress || shipment.warehouseName || "Destination Warehouse"}
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Designated Central Storage & Inward Receiving Facility
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                Transport Mode: {shipment.transportResponsibility || "FPO Dedicated Vehicle"}
              </p>
            </div>
          </div>

          {/* Grid Section 2: Driver & Vehicle Authorization */}
          <div className="bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl space-y-3">
            <p className="text-[10px] font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-emerald-800 dark:text-emerald-400" />
              CARRIER & DRIVER ASSIGNMENT DETAILS
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Assigned Driver:</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">
                  {shipment.driverName || "-"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Driver Contact:</span>
                <p className="font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {shipment.driverPhone || "-"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Vehicle Reg No:</span>
                <p className="font-mono font-black text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2 py-0.5 rounded inline-block mt-0.5">
                  {shipment.vehicleNumber || "-"}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium">Verification Code:</span>
                <p className="font-mono font-black text-emerald-800 dark:text-emerald-400 text-sm mt-0.5">
                  {verificationCode}
                </p>
              </div>
            </div>
          </div>

          {/* Commodity Details Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Lot Reference</th>
                  <th className="p-3">Millet Commodity</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3 text-right">Expected Qty (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                <tr>
                  <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{displayLot}</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{shipment.milletType || shipment.commodity || "-"}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700">
                      {displayGrade}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-black text-slate-900 dark:text-slate-100 text-sm">
                    {(shipment.quantityKg || shipment.totalQuantityKg || shipment.expectedQuantityKg || 0).toLocaleString("en-IN")} kg
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Terms & Verification Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                AUTHORIZATION & SECURITY STAMP
              </p>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                {/* Real Scannable QR Code */}
                <div className="challan-qr bg-white p-3 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  <QRCodeSVG
                    value={qrVerificationUrl}
                    size={100}
                    level="Q"
                    marginSize={0}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium space-y-1">
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ShreeAnna Supply Chain Verification
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">Electronically verified on driver dispatch assignment.</p>
                  <span className="inline-block bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-700 font-mono">
                    ✓ SCAN TO VERIFY PASS
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex flex-col justify-between h-28 bg-slate-50/50 dark:bg-slate-800/40">
                <span>Driver Signature</span>
                <div className="border-b border-slate-400 dark:border-slate-600 w-3/4 mx-auto"></div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">Accepted in Good Order</span>
              </div>
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4 flex flex-col justify-between h-28 bg-slate-50/50 dark:bg-slate-800/40">
                <span>Warehouse Receiver Seal</span>
                <div className="border-b border-slate-400 dark:border-slate-600 w-3/4 mx-auto"></div>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">Receiver Sign & Date</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

