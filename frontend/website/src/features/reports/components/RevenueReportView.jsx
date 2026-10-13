import {
  TrendingUp,
  Package,
  CircleDollarSign,
  BarChart3,
  Download,
  Printer,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RevenueReportView({ data, loading }) {
  const varieties = data?.varietyBreakdown || [];

  const handleExportCSV = () => {
    if (!varieties.length) return;
    const headers = [
      "Millet Variety",
      "Procured Lots",
      "Volume (kg)",
      "Volume Share (%)",
      "Average Rate (INR/kg)",
      "Gross Procurement Value (INR)",
      "FPO Margin 5% (INR)",
      "Net Farmer Payout (INR)",
    ];

    const rows = varieties.map((v) => [
      `"${v.millet}"`,
      v.lotsCount,
      v.quantityKg,
      v.volumePercentage,
      v.averageRatePerKg,
      v.grossValue,
      v.fpoMargin,
      v.netPayout,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Revenue Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Gross Procurement Valuation</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
                ₹{Number(data?.totalGrossValuation || 0).toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Total procurement turnover
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
              <p className="text-xs font-semibold text-slate-500">Total Procured Millet Volume</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
                {Number(data?.totalVolumeKg || 0).toLocaleString("en-IN")} kg
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Physical inward intake verified
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600 shrink-0">
              <Package size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">Average Rate Realized</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
                ₹{Number(data?.averageRatePerKg || 0).toFixed(2)}/kg
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Weighted across all millet types
              </p>
            </div>
            <div className="rounded-full bg-amber-100 p-2.5 text-amber-600 shrink-0">
              <BarChart3 size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80 bg-white">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">FPO Revenue Surplus (5%)</p>
              <p className="mt-2 text-2xl font-extrabold text-cyan-700 tracking-tight">
                ₹{Number(data?.totalFpoMargin || 0).toLocaleString("en-IN")}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-cyan-600">
                <TrendingUp size={13} />
                <span>Retained facilitation surplus</span>
              </div>
            </div>
            <div className="rounded-full bg-cyan-100 p-2.5 text-cyan-600 shrink-0">
              <TrendingUp size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Volume & Share Breakdown Cards */}
      <Card className="shadow-xs border-slate-200/80 bg-white">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Millet Variety Volume Share & Revenue Realization
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comparative analysis of volume, price realization, and FPO margin contributions
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

        <CardContent className="space-y-6 pt-2">
          {/* Progress Bars for Varieties */}
          <div className="space-y-3">
            {varieties.map((v, idx) => {
              const colors = [
                "bg-emerald-500",
                "bg-blue-500",
                "bg-cyan-500",
                "bg-amber-500",
                "bg-purple-500",
              ];
              const barColor = colors[idx % colors.length];

              return (
                <div key={v.millet} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-800 font-semibold">{v.millet}</span>
                    <span className="text-slate-600">
                      {v.quantityKg.toLocaleString("en-IN")} kg ({v.volumePercentage}%) • ₹
                      {v.grossValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.max(v.volumePercentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border rounded-lg">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold text-xs text-slate-700">Millet Variety</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Lots</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Volume (kg)</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Share (%)</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Avg Rate (INR/kg)</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Gross Value (INR)</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">FPO Margin (5%)</TableHead>
                  <TableHead className="text-right font-semibold text-xs text-slate-700">Net Farmer Payout</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-28 text-center text-xs text-muted-foreground">
                      Loading revenue report...
                    </TableCell>
                  </TableRow>
                ) : varieties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-xs text-muted-foreground">
                      No millet revenue data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  varieties.map((v) => (
                    <TableRow key={v.millet} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-xs text-slate-900">{v.millet}</TableCell>
                      <TableCell className="text-right text-xs text-slate-600">{v.lotsCount}</TableCell>
                      <TableCell className="text-right text-xs text-slate-700 font-medium">
                        {v.quantityKg.toLocaleString("en-IN")} kg
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-600">{v.volumePercentage}%</TableCell>
                      <TableCell className="text-right text-xs font-semibold text-slate-900">
                        ₹{v.averageRatePerKg.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-slate-900">
                        ₹{v.grossValue.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-xs font-semibold text-cyan-700">
                        ₹{v.fpoMargin.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-emerald-700">
                        ₹{v.netPayout.toLocaleString("en-IN")}
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
