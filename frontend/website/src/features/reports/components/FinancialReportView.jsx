import { useState, useMemo } from "react";
import {
  CircleDollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Printer,
  Search,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

export default function FinancialReportView({ data, loading }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const transactions = data?.transactions || [];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        search === "" ||
        (tx.farmerName && tx.farmerName.toLowerCase().includes(search.toLowerCase())) ||
        (tx.settlementCode && tx.settlementCode.toLowerCase().includes(search.toLowerCase())) ||
        (tx.millet && tx.millet.toLowerCase().includes(search.toLowerCase())) ||
        (tx.orderId && tx.orderId.toLowerCase().includes(search.toLowerCase()));

      const isPaid = tx.status === "Paid" || tx.status === "Completed";
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PAID" && isPaid) ||
        (statusFilter === "PENDING" && !isPaid);

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const handleExportCSV = () => {
    if (!transactions.length) return;
    const headers = [
      "Settlement Code",
      "Order ID",
      "Farmer Beneficiary",
      "Millet Variety",
      "Quantity (kg)",
      "Gross Amount (INR)",
      "FPO Margin 5% (INR)",
      "Net Payout (INR)",
      "Status",
      "Payment Method",
      "Transaction ID",
      "Payment Date",
    ];

    const rows = transactions.map((t) => [
      `"${t.settlementCode || ""}"`,
      `"${t.orderId || ""}"`,
      `"${t.farmerName || ""}"`,
      `"${t.millet || ""}"`,
      t.quantityKg || 0,
      t.grossAmount || 0,
      t.fpoMargin || 0,
      t.finalAmount || 0,
      `"${t.status || ""}"`,
      `"${t.paymentMethod || ""}"`,
      `"${t.transactionId || ""}"`,
      `"${t.paymentDate ? new Date(t.paymentDate).toLocaleDateString() : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Stat Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Gross Procurement Value</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
                ₹{Number(data?.totalGrossValue || 0).toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across {data?.totalSettlementsCount || 0} procurement lots
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-2.5 text-blue-600 shrink-0">
              <CircleDollarSign size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Disbursed to Farmers</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700 tracking-tight">
                ₹{Number(data?.totalDisbursed || 0).toLocaleString("en-IN")}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={13} />
                <span>{data?.paidCount || 0} Disbursements via DBT</span>
              </div>
            </div>
            <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600 shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Pending Payables</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
                ₹{Number(data?.totalPendingLiability || 0).toLocaleString("en-IN")}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                <Clock size={13} />
                <span>{data?.pendingCount || 0} Lots in pipeline</span>
              </div>
            </div>
            <div className="rounded-full bg-amber-100 p-2.5 text-amber-600 shrink-0">
              <Clock size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total FPO Margin Earned</p>
              <p className="mt-2 text-2xl font-extrabold text-cyan-700 tracking-tight">
                ₹{Number(data?.totalFpoMargin || 0).toLocaleString("en-IN")}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-cyan-600">
                <TrendingUp size={13} />
                <span>5% Facilitation retained</span>
              </div>
            </div>
            <div className="rounded-full bg-cyan-100 p-2.5 text-cyan-600 shrink-0">
              <TrendingUp size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Table Card */}
      <Card className="shadow-xs border-slate-200/80 bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Financial Disbursements & Settlements Ledger
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive record of farmer DBT payments, deductions, and Razorpay transactions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48 sm:w-56">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search beneficiary, lot, order..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted/40"
              />
            </div>

            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  statusFilter === "ALL" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("PAID")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  statusFilter === "PAID" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Paid
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("PENDING")}
                className={`rounded-md px-2 py-1 font-medium transition-colors ${
                  statusFilter === "PENDING" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Pending
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="h-8 text-xs gap-1"
            >
              <Download size={13} />
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1"
            >
              <Printer size={13} />
              Print
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-[130px] font-semibold text-xs text-slate-700">Settlement Code</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Beneficiary Farmer</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Millet & Weight</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Gross (INR)</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">FPO Fee 5%</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Net Disbursed</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Payment Ref / Date</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-xs text-muted-foreground">
                      Loading financial ledger data...
                    </TableCell>
                  </TableRow>
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-28 text-center text-xs text-muted-foreground">
                      No transactions match the criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isPaid = tx.status === "Paid" || tx.status === "Completed";
                    return (
                      <TableRow key={tx.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-xs">
                          <span className="font-bold text-slate-900">{tx.settlementCode}</span>
                          <div className="text-[11px] text-muted-foreground font-mono">{tx.orderId}</div>
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold text-xs text-slate-900">{tx.farmerName}</div>
                          <div className="text-[11px] text-muted-foreground">Direct Bank Transfer</div>
                        </TableCell>

                        <TableCell>
                          <div className="font-medium text-xs text-slate-800">{tx.millet}</div>
                          <div className="text-[11px] text-muted-foreground">{tx.quantityKg} kg</div>
                        </TableCell>

                        <TableCell className="text-right text-xs text-slate-700 font-medium">
                          ₹{Number(tx.grossAmount || 0).toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell className="text-right text-xs text-cyan-700 font-semibold">
                          ₹{Number(tx.fpoMargin || 0).toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell className="text-right text-xs font-bold text-emerald-700">
                          ₹{Number(tx.finalAmount || 0).toLocaleString("en-IN")}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isPaid
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px] font-semibold"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-semibold"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs">
                          <div className="font-mono text-[11px] text-slate-700">
                            {tx.transactionId ? tx.transactionId.substring(0, 16) + "..." : "DBT Pending"}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {tx.paymentDate ? new Date(tx.paymentDate).toLocaleDateString() : "-"}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/settlements/${tx.id}`)}
                            className="h-7 px-2 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 gap-0.5"
                          >
                            View
                            <ArrowUpRight size={12} />
                          </Button>
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
    </div>
  );
}
