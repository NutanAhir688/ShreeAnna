import { useState } from "react";
import { Eye, CreditCard, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RazorpayPaymentDialog from "./RazorpayPaymentDialog";

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s.includes("paid") || s.includes("completed")) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (s.includes("pending")) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (s.includes("awaiting")) {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function SettlementTable({ settlements = [], onPaymentSuccess }) {
  const navigate = useNavigate();
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePayClick = (item) => {
    setSelectedSettlement(item);
    setDialogOpen(true);
  };

  const handleSuccess = (res) => {
    if (onPaymentSuccess) {
      onPaymentSuccess(res);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Settlement</th>
                <th className="px-4 py-3 text-left font-medium">Beneficiary / Buyer</th>
                <th className="px-4 py-3 text-left font-medium">Lot</th>
                <th className="px-4 py-3 text-left font-medium">Quantity</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">FPO Margin</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>

            <tbody>
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No settlement records found.
                  </td>
                </tr>
              ) : (
                settlements.map((item) => {
                  const isPending =
                    item.status === "Pending Settlement" ||
                    item.status === "Pending" ||
                    item.status === "Awaiting Delivery";

                  return (
                    <tr
                      key={item.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800">
                          {item.settlementCode || item.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.orderId}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-900">
                          {item.farmerName || item.buyerName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.buyerType} {item.farmerPhone ? `• ${item.farmerPhone}` : ""}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">
                          Lot #{item.lotId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.millet}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-slate-700">
                        {item.quantity} {item.unit || "kg"}
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-900">
                        ₹{Number(item.finalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        ₹{Number(item.fpoMargin || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isPending && (
                            <Button
                              size="sm"
                              onClick={() => handlePayClick(item)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-2.5 gap-1.5 shadow-sm"
                            >
                              <CreditCard size={14} />
                              Pay (Razorpay)
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/settlements/${item.id}`)}
                            className="text-xs h-8 px-2.5 gap-1.5"
                          >
                            <Eye size={14} />
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RazorpayPaymentDialog
        settlement={selectedSettlement}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPaymentSuccess={handleSuccess}
      />
    </>
  );
}

export default SettlementTable;