import { useEffect, useState } from "react";
import { ChevronRight, ArrowDownLeft, CheckCircle2, CreditCard, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { settlementsApi } from "@/services/api";

export default function RecentTransactions({ settlementsProp }) {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (settlementsProp && settlementsProp.length > 0) {
      const paid = settlementsProp
        .filter((s) => s.status === "Paid" || s.status === "Completed")
        .sort((a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt));
      setTransactions(paid.slice(0, 5));
      setLoading(false);
    } else {
      async function loadData() {
        try {
          setLoading(true);
          const data = await settlementsApi.getAll();
          if (Array.isArray(data)) {
            const paid = data
              .filter((s) => s.status === "Paid" || s.status === "Completed")
              .sort((a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt));
            setTransactions(paid.slice(0, 5));
          }
        } catch (err) {
          console.error("Failed to load recent transactions:", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }
  }, [settlementsProp]);

  return (
    <Card className="shadow-xs border-slate-200/80 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">
            Recent Transactions
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Latest DBT and MockGateway disbursements
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/settlements?status=Completed")}
          className="text-xs text-slate-600 hover:text-slate-900 gap-1"
        >
          View All
          <ChevronRight size={14} />
        </Button>
      </CardHeader>

      <CardContent className="divide-y divide-slate-100">
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading recent transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No completed transactions found.
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between py-3 hover:bg-slate-50/60 -mx-3 px-3 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-700 shrink-0">
                  <ArrowDownLeft size={16} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-900">
                      {tx.farmerName}
                    </p>
                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0 h-4">
                      Captured
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {tx.millet} • Lot #{tx.lotId} • {tx.paymentMethod || "Razorpay DBT"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Ref: {tx.transactionId || tx.razorpayPaymentLinkId || tx.settlementCode}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-emerald-700">
                  ₹{Number(tx.finalAmount || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {tx.paymentDate || "Recently"}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/settlements/${tx.id}`)}
                  className="text-[10px] text-blue-600 hover:underline mt-0.5 inline-block"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
