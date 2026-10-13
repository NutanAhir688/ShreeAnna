import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { settlementsApi } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function RevenueByMillet({ settlementsProp }) {
  const navigate = useNavigate();
  const [settlements, setSettlements] = useState(settlementsProp || []);
  const [loading, setLoading] = useState(!settlementsProp);

  useEffect(() => {
    if (!settlementsProp) {
      async function loadData() {
        try {
          setLoading(true);
          const data = await settlementsApi.getAll();
          if (Array.isArray(data)) {
            setSettlements(data);
          }
        } catch (err) {
          console.error("Failed to load revenue by millet:", err);
        } finally {
          setLoading(false);
        }
      }
      loadData();
    } else {
      setSettlements(settlementsProp);
    }
  }, [settlementsProp]);

  const milletBreakdown = useMemo(() => {
    const map = {};
    settlements.forEach((s) => {
      const variety = s.millet || "Other Millet";
      if (!map[variety]) {
        map[variety] = {
          name: variety,
          lots: 0,
          quantity: 0,
          gross: 0,
          fpoMargin: 0,
          payout: 0,
        };
      }
      map[variety].lots += 1;
      map[variety].quantity += Number(s.quantity || 0);
      map[variety].gross += Number(s.grossAmount || 0);
      map[variety].fpoMargin += Number(s.fpoMargin || 0);
      map[variety].payout += Number(s.finalAmount || 0);
    });

    return Object.values(map).sort((a, b) => b.payout - a.payout);
  }, [settlements]);

  return (
    <Card className="shadow-xs border-slate-200/80 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">
            Revenue by Millet Variety
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Procurement value and margin breakdown
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/reports?type=financial")}
          className="text-xs text-slate-600 hover:text-slate-900 gap-1"
        >
          View Report
          <ChevronRight size={14} />
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-semibold text-xs text-slate-700">Millet Variety</TableHead>
              <TableHead className="text-right font-semibold text-xs text-slate-700">Lots</TableHead>
              <TableHead className="text-right font-semibold text-xs text-slate-700">Qty (kg)</TableHead>
              <TableHead className="text-right font-semibold text-xs text-slate-700">Gross Value</TableHead>
              <TableHead className="text-right font-semibold text-xs text-slate-700">FPO Margin (5%)</TableHead>
              <TableHead className="text-right font-semibold text-xs text-slate-700">Total Payout</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-xs text-muted-foreground">
                  Calculating millet revenue breakdown...
                </TableCell>
              </TableRow>
            ) : milletBreakdown.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">
                  No procurement records available.
                </TableCell>
              </TableRow>
            ) : (
              milletBreakdown.map((row) => (
                <TableRow key={row.name} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-xs text-slate-900">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-600">
                    {row.lots}
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-600">
                    {row.quantity.toLocaleString("en-IN")} kg
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-700 font-medium">
                    ₹{row.gross.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-xs text-cyan-700 font-semibold">
                    ₹{row.fpoMargin.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right text-xs text-emerald-700 font-bold">
                    ₹{row.payout.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
