import { useEffect, useState } from "react";
import { ChevronRight, MoreHorizontal, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { farmsApi, farmersApi } from "@/services/api";

function FarmVerificationQueue() {
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [farmersMap, setFarmersMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [farmsData, farmersData] = await Promise.all([
          farmsApi.getAll().catch(() => []),
          farmersApi.getAll().catch(() => []),
        ]);

        const map = {};
        if (Array.isArray(farmersData)) {
          farmersData.forEach((f) => {
            map[f.id] = f.fullName || f.name;
          });
        }
        setFarmersMap(map);
        setFarms(Array.isArray(farmsData) ? farmsData : []);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const queueItems = farms
    .filter(
      (farm) =>
        farm.status === "Pending Verification" ||
        farm.status === "Under Review" ||
        farm.status === "Pending"
    )
    .slice(0, 5);

  return (
    <Card className="shadow-xs border-slate-200/80 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">
            Farm Verification Queue
          </CardTitle>

          <p className="mt-0.5 text-xs text-slate-500">
            Latest farms submitted by farmers
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs font-medium text-slate-700 hover:text-slate-900 border-slate-200"
          onClick={() => navigate("/farm-verification")}
        >
          View All
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="px-0 pb-2">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[180px] text-xs font-semibold text-slate-600 pl-6">
                Farm Name
              </TableHead>

              <TableHead className="text-xs font-semibold text-slate-600">
                Farmer
              </TableHead>

              <TableHead className="text-xs font-semibold text-slate-600">
                Village
              </TableHead>

              <TableHead className="text-xs font-semibold text-slate-600">
                Survey No.
              </TableHead>

              <TableHead className="text-xs font-semibold text-slate-600">
                Submitted On
              </TableHead>

              <TableHead className="text-xs font-semibold text-slate-600">
                Status
              </TableHead>

              <TableHead className="text-right text-xs font-semibold text-slate-600 pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-emerald-600" />
                  <p className="mt-1">Loading farms...</p>
                </TableCell>
              </TableRow>
            ) : queueItems.map((item) => (
              <TableRow
                key={item.id}
                className="border-slate-100 hover:bg-slate-50/80 transition-colors"
              >
                <TableCell className="font-semibold text-sm text-slate-800 pl-6">
                  {item.farmName}
                </TableCell>

                <TableCell className="text-xs font-medium text-slate-700">
                  {farmersMap[item.farmerId] || item.farmerName || "Farmer"}
                </TableCell>

                <TableCell className="text-xs text-slate-600">
                  {item.village || item.district || "-"}
                </TableCell>

                <TableCell className="text-xs text-slate-600 font-mono">
                  {item.surveyNumber}
                </TableCell>

                <TableCell className="text-xs text-slate-600">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : item.submittedAt || "-"}
                </TableCell>

                <TableCell>
                  {item.status === "Pending Verification" ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      Pending
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      Under Review
                    </span>
                  )}
                </TableCell>

                <TableCell className="text-right pr-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() =>
                      navigate(`/farm-verification/${item.id}`)
                    }
                  >
                    Review
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-8 w-8 text-slate-500 hover:text-slate-800"
                    onClick={() =>
                      navigate(`/farm-verification/${item.id}`)
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {queueItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-sm text-slate-500"
                >
                  No farms are currently waiting for verification.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default FarmVerificationQueue;