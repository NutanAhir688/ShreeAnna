function InventoryOverview({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold">
          Inventory & Storage Overview
        </h3>

        <p className="text-sm text-muted-foreground">
          Current stock availability by millet across regional warehouses
        </p>
      </div>

      {safeData.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No inventory stock records available for current filter.
        </div>
      ) : (
        <div className="space-y-5">
          {safeData.map((item) => {
            const total = Number(item.total ?? item.quantityKg ?? 0);
            const available = Number(item.available ?? total * 0.75);
            const reserved = Number(item.reserved ?? total * 0.25);
            const reservedPercentage = total > 0 ? (reserved / total) * 100 : 0;

            return (
              <div key={item.millet || "Millet"}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {item.millet || "Millet"}
                  </span>

                  <span className="text-sm text-emerald-700 font-medium">
                    {available.toLocaleString()} kg available
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#1B4324]"
                    style={{
                      width: `${Math.min(100, Math.max(0, 100 - reservedPercentage))}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Total: {total.toLocaleString()} kg</span>
                  <span>In-Transit / Allocated: {reserved.toLocaleString()} kg</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InventoryOverview;