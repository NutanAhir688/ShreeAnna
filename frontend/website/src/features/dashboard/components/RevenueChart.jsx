import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settlementsApi } from "@/services/api";
import { TrendingUp, CheckCircle2 } from "lucide-react";

export default function RevenueChart({ statsProp }) {
  const [stats, setStats] = useState(statsProp || null);

  useEffect(() => {
    if (!statsProp) {
      async function loadStats() {
        try {
          const res = await settlementsApi.getStats();
          if (res) setStats(res);
        } catch (err) {
          console.error("Failed to load revenue stats for chart:", err);
        }
      }
      loadStats();
    } else {
      setStats(statsProp);
    }
  }, [statsProp]);

  const paidAmount = Number(stats?.paidSettlementValue || 0);
  const pendingAmount = Number(stats?.pendingSettlementValue || 0);
  const fpoMargin = Number(stats?.fpoMargin || 0);
  const totalVolume = paidAmount + pendingAmount + fpoMargin;

  const data = [
    {
      label: "Disbursed Payouts",
      value: paidAmount,
      color: "#10b981", // emerald
      dotClass: "bg-emerald-500",
    },
    {
      label: "FPO Margin Revenue (5%)",
      value: fpoMargin,
      color: "#06b6d4", // cyan
      dotClass: "bg-cyan-500",
    },
    {
      label: "Pending Settlements",
      value: pendingAmount,
      color: "#f59e0b", // amber
      dotClass: "bg-amber-500",
    },
  ];

  // SVG Donut Calculations
  const radius = 68;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  const segments = data.map((item) => {
    const percentage = totalVolume > 0 ? item.value / totalVolume : 0;
    const arcLength = Math.max(percentage * circumference, 0);
    const strokeDasharray = `${arcLength} ${circumference - arcLength}`;
    const strokeDashoffset = -accumulatedAngle * (circumference / 360);

    accumulatedAngle += percentage * 360;

    return {
      ...item,
      percentage: Math.round(percentage * 100),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const formatLakhs = (val) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)}L`;
    }
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <Card className="shadow-xs border-slate-200/80 bg-white h-full flex flex-col justify-between">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">
            Revenue & Payouts
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Financial allocation breakdown
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <TrendingUp size={13} />
          <span>Live DBT</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between py-3 px-6 gap-4">
        {/* Donut Graphic */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="h-44 w-44 -rotate-90 transform" viewBox="0 0 180 180">
            {/* Background ring */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {totalVolume > 0 &&
              segments.map(
                (seg, idx) =>
                  seg.value > 0 && (
                    <circle
                      key={idx}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 ease-out"
                    />
                  )
              )}
          </svg>

          {/* Center Info */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              {formatLakhs(totalVolume)}
            </span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Volume
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          {segments.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
                <span className="font-medium text-slate-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  ₹{Number(item.value).toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] text-muted-foreground w-8 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom micro info */}
        <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/60 p-2.5 flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>
            100% of delivered procurement lots successfully disbursed to farmers.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
