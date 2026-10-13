import { useEffect, useState } from "react";
import { ChevronRight, CreditCard, Eye, Loader2, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { settlementsApi } from "@/services/api";
import RazorpayPaymentDialog from "@/features/settlements/components/RazorpayPaymentDialog";

export default function SettlementQueue({ onDataChange }) {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const data = await settlementsApi.getAll();
      if (Array.isArray(data)) {
        setSettlements(data);
        if (onDataChange) onDataChange(data);
      }
    } catch (err) {
      console.error("Failed to load settlement queue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handlePayClick = (item) => {
    setSelectedSettlement(item);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchSettlements();
  };

  const pendingCount = settlements.filter(
    (s) =>
      s.status === "Pending Settlement" ||
      s.status === "Pending" ||
      s.status === "Awaiting Delivery"
  ).length;

  const paidCount = settlements.filter(
    (s) => s.status === "Paid" || s.status === "Completed"
  ).length;

  const filteredSettlements = settlements.filter((item) => {
    const isPending =
      item.status === "Pending Settlement" ||
      item.status === "Pending" ||
      item.status === "Awaiting Delivery";
    if (filter === "PENDING") return isPending;
    if (filter === "PAID") return !isPending;
    return true;
  });

  return (
    <>
      <Card className="shadow-xs border-slate-200/80 bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-slate-900">
                Settlement Queue
              </CardTitle>
              {pendingCount > 0 && (
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                  {pendingCount} Pending
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Farmer procurement payout disbursement queue
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFilter("ALL")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filter === "ALL"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({settlements.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("PENDING")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filter === "PENDING"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter("PAID")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                  filter === "PAID"
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paid ({paidCount})
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/settlements")}
              className="text-xs gap-1"
            >
              View All
              <ChevronRight size={14} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[140px] font-semibold text-xs text-slate-700">Settlement ID</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Beneficiary</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Lot & Millet</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Qty & Rate</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Net Payout</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                        Loading settlement queue...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSettlements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-muted-foreground text-sm">
                      No settlements found in this queue.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSettlements.slice(0, 6).map((item) => {
                    const isPending =
                      item.status === "Pending Settlement" ||
                      item.status === "Pending" ||
                      item.status === "Awaiting Delivery";

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-xs">
                          <button
                            type="button"
                            onClick={() => navigate(`/settlements/${item.id}`)}
                            className="text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                          >
                            {item.settlementCode || item.id.substring(0, 8)}
                            <ArrowUpRight size={12} className="opacity-60" />
                          </button>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {item.orderId}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-slate-900">
                            {item.farmerName}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {item.farmerPhone || "Direct Bank Transfer"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-xs font-medium text-slate-800">
                            {item.millet}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Lot #{item.lotId}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-slate-600">
                          <div>{item.quantity ? `${item.quantity} kg` : "-"}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {item.pricePerKg ? `₹${item.pricePerKg}/kg` : ""}
                          </div>
                        </TableCell>

                        <TableCell className="text-xs font-bold text-slate-900">
                          ₹{Number(item.finalAmount || 0).toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              !isPending
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[11px] font-semibold"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[11px] font-semibold"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          {isPending ? (
                            <Button
                              size="sm"
                              onClick={() => handlePayClick(item)}
                              className="bg-blue-600 hover:bg-blue-700 text-white gap-1 text-xs h-7 px-2.5"
                            >
                              <CreditCard size={13} />
                              Disburse
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/settlements/${item.id}`)}
                              className="gap-1 text-xs h-7 px-2.5 text-slate-700"
                            >
                              <Eye size={13} />
                              View
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RazorpayPaymentDialog
        settlement={selectedSettlement}
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
