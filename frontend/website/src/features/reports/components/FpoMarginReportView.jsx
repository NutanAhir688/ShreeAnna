import {
  TrendingUp,
  Percent,
  CircleDollarSign,
  Truck,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function FpoMarginReportView({ data, loading }) {
  const lotBreakdown = data?.lotBreakdown || [];
  const varietyBreakdown = data?.marginByVariety || [];

  const handleExportCSV = () => {
    if (!lotBreakdown.length) return;
    const headers = [
      "Settlement Code",
      "Lot Number",
      "Farmer Beneficiary",
      "Millet Variety",
      "Gross Amount (INR)",
      "Margin Rate (%)",
      "FPO Margin Amount (INR)",
      "Transport Deducted (INR)",
      "Net Farmer Payout (INR)",
      "Status",
      "Date",
    ];

    const rows = lotBreakdown.map((l) => [
      `"${l.settlementCode}"`,
      `"${l.lotNumber}"`,
      `"${l.farmerName}"`,
      `"${l.millet}"`,
      l.grossAmount,
      l.marginRatePercentage,
      l.fpoMarginAmount,
      l.transportCost,
      l.netFarmerPayout,
      `"${l.status}"`,
      `"${new Date(l.date).toLocaleDateString()}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FPO_Margin_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top FPO Margin Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Total FPO Margin Earned</p>
              <p className="mt-2 text-2xl font-extrabold text-cyan-700 tracking-tight">
                ₹{Number(data?.totalFpoMargin || 0).toLocaleString("en-IN")}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-cyan-600">
                <Percent size={13} />
                <span>5.0% Mandated facilitation fee</span>
              </div>
            </div>
            <div className="rounded-full bg-cyan-100 p-2.5 text-cyan-600 shrink-0">
              <TrendingUp size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Gross Procurement Turnover</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
                ₹{Number(data?.totalProcurementGross || 0).toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Total value from certified lots
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
              <p className="text-xs font-semibold text-slate-500">Logistics & Freight Charges</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
                ₹{Number(data?.totalTransportCollected || 0).toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Transport facilitation cost
              </p>
            </div>
            <div className="rounded-full bg-amber-100 p-2.5 text-amber-600 shrink-0">
              <Truck size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Net FPO Operating Surplus</p>
              <p className="mt-2 text-2xl font-extrabold text-emerald-700 tracking-tight">
                ₹{Number(data?.netFpoSurplus || 0).toLocaleString("en-IN")}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 size={13} />
                <span>100% Retained by FPO</span>
              </div>
            </div>
            <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600 shrink-0">
              <ShieldCheck size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Margin Breakdown by Variety Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {varietyBreakdown.map((item) => (
          <Card key={item.millet} className="shadow-xs border-slate-200/80 bg-white">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-800 truncate">{item.millet}</p>
              <p className="mt-1.5 text-lg font-bold text-cyan-700">
                ₹{Number(item.fpoMargin || 0).toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {item.lotsCount} lot(s) • {item.quantityKg} kg
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Lot Breakdown Audit Table */}
      <Card className="shadow-xs border-slate-200/80 bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              FPO 5% Facilitation Margin Audit Trail
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lot-by-lot statutory margin fee deduction and farmer net settlement reconciliation
            </p>
          </div>

          <div className="flex items-center gap-2">
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
                  <TableHead className="w-[130px] font-semibold text-xs text-slate-700">Settlement ID</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Lot #</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Farmer Beneficiary</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Millet Variety</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Gross Procurement</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Fee Rate</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">FPO Margin (5%)</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Freight Charge</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Net Farmer Payout</TableHead>
                  <TableHead className="font-semibold text-xs text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-28 text-center text-xs text-muted-foreground">
                      Loading FPO margin audit data...
                    </TableCell>
                  </TableRow>
                ) : lotBreakdown.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-xs text-muted-foreground">
                      No lot margin audit records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  lotBreakdown.map((row) => (
                    <TableRow key={row.settlementCode} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-xs text-slate-900">{row.settlementCode}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-600">{row.lotNumber}</TableCell>
                      <TableCell className="font-medium text-xs text-slate-900">{row.farmerName}</TableCell>
                      <TableCell className="text-xs text-slate-700">{row.millet}</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-slate-900">
                        ₹{Number(row.grossAmount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-600 font-mono">
                        {row.marginRatePercentage}%
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-cyan-700">
                        ₹{Number(row.fpoMarginAmount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-600">
                        - ₹{Number(row.transportCost).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-emerald-700">
                        ₹{Number(row.netFarmerPayout).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            row.status === "Paid" || row.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-[10px] font-semibold"
                              : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 text-[10px] font-semibold"
                          }
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
