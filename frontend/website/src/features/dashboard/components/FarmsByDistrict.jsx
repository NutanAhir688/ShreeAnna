import { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
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
import { farmsApi } from "@/services/api";

function FarmsByDistrict() {
  const [districtData, setDistrictData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarms() {
      try {
        const farms = await farmsApi.getAll();
        if (Array.isArray(farms)) {
          const grouped = {};
          farms.forEach((f) => {
            const dist = f.district || "Unassigned";
            if (!grouped[dist]) {
              grouped[dist] = { district: dist, totalFarms: 0, verified: 0, pending: 0, rejected: 0 };
            }
            grouped[dist].totalFarms += 1;
            if (f.status === "Verified") grouped[dist].verified += 1;
            else if (f.status === "Pending Verification" || f.status === "Pending") grouped[dist].pending += 1;
            else if (f.status === "Rejected") grouped[dist].rejected += 1;
          });
          setDistrictData(Object.values(grouped));
        }
      } catch (err) {
        console.warn("FarmsByDistrict load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFarms();
  }, []);
  return (
    <Card className="shadow-xs border-slate-200/80 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-bold text-slate-900">
          Farms by District (Verification)
        </CardTitle>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200"
        >
          View Report
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="px-0 pb-2">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="text-xs font-semibold text-slate-600 pl-6">
                District
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 text-right">
                Total Farms
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 text-right">
                Verified
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 text-right">
                Pending
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 text-right pr-6">
                Rejected
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-600 mb-1" />
                  Loading district data...
                </TableCell>
              </TableRow>
            ) : districtData.length > 0 ? (
              districtData.map((row) => (
                <TableRow
                  key={row.district}
                  className="border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <TableCell className="font-semibold text-xs text-slate-800 pl-6">
                    {row.district}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 text-right font-medium">
                    {row.totalFarms}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 text-right font-medium">
                    {row.verified}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 text-right font-medium">
                    {row.pending}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 text-right font-medium pr-6">
                    {row.rejected}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-xs text-slate-500">
                  No district farm records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default FarmsByDistrict;
