import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { farmsApi } from "@/services/api";

function VerificationStatusChart() {
  const [counts, setCounts] = useState({
    verified: 0,
    pending: 0,
    review: 0,
    rejected: 0,
  });

  useEffect(() => {
    async function loadFarms() {
      try {
        const farms = await farmsApi.getAll();
        if (Array.isArray(farms)) {
          const v = farms.filter((f) => f.status === "Verified").length;
          const p = farms.filter((f) => f.status === "Pending Verification" || f.status === "Pending").length;
          const r = farms.filter((f) => f.status === "Under Review").length;
          const x = farms.filter((f) => f.status === "Rejected").length;
          setCounts({ verified: v, pending: p, review: r, rejected: x });
        }
      } catch (err) {
        console.warn("Chart data load error:", err);
      }
    }
    loadFarms();
  }, []);

  const data = [
    { label: "Verified", count: counts.verified, color: "#10b981", dotClass: "bg-emerald-500" },
    { label: "Pending", count: counts.pending, color: "#f59e0b", dotClass: "bg-amber-500" },
    { label: "Under Review", count: counts.review, color: "#3b82f6", dotClass: "bg-blue-500" },
    { label: "Rejected", count: counts.rejected, color: "#ef4444", dotClass: "bg-red-500" },
  ];

  const totalFarms = data.reduce((acc, item) => acc + item.count, 0);

  // SVG Donut Calculations
  const radius = 70;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  const segments = data.map((item) => {
    const percentage = totalFarms > 0 ? item.count / totalFarms : 0;
    const arcLength = Math.max(percentage * circumference, 0);
    const strokeDasharray = `${arcLength} ${circumference - arcLength}`;
    const strokeDashoffset = -accumulatedAngle * (circumference / 360);
    
    accumulatedAngle += percentage * 360;

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <Card className="shadow-xs border-slate-200/80 bg-white h-full flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-slate-900">
          Verification Status
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex items-center justify-between gap-4 py-4 px-6">
        {/* Donut Graphic */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 180 180">
            {/* Background ring track */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {segments.map((segment) => (
              <circle
                key={segment.label}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute text-center flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {totalFarms.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 mt-1">
              Total Farms
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3 min-w-[130px]">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass} shrink-0`} />
                <span className="font-medium text-slate-600">{item.label}</span>
              </div>
              <span className="font-extrabold text-slate-900">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default VerificationStatusChart;
