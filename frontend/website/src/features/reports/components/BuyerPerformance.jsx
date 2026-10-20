import { Building2, Users } from "lucide-react";

function BuyerPerformance({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold">
          Top Beneficiaries & Value-Chain Partners
        </h3>

        <p className="text-sm text-muted-foreground">
          Top processors, SHGs, and direct beneficiaries by value realized
        </p>
      </div>

      {safeData.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No transactions recorded for current timeframe.
        </div>
      ) : (
        <div className="space-y-4">
          {safeData.map((buyer, idx) => (
            <div
              key={buyer.name || `partner-${idx}`}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 text-emerald-800 p-2">
                  {buyer.type === "Processor" ? (
                    <Building2 className="h-4 w-4" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {buyer.name || "Value Chain Partner"}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {buyer.type || "Processor"} · {buyer.orders || 1} orders
                  </p>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-900">
                ₹{Number(buyer.purchaseValue ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerPerformance;