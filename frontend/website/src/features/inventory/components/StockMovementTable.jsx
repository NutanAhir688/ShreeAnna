import { ArrowDownToLine, ArrowLeftRight, LockKeyhole } from "lucide-react";

function getMovementStyle(type) {
  const raw = String(type || "Stock Received").toUpperCase();

  if (raw.includes("RECEIVED") || raw === "INBOUND" || raw.includes("IN")) {
    return {
      label: "Stock Received",
      className: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: ArrowDownToLine,
    };
  }

  if (raw.includes("RESERVED") || raw === "OUTBOUND" || raw.includes("OUT")) {
    return {
      label: "Stock Reserved",
      className: "bg-amber-100 text-amber-800 border-amber-300",
      icon: LockKeyhole,
    };
  }

  return {
    label: "Stock Transfer",
    className: "bg-blue-100 text-blue-800 border-blue-300",
    icon: ArrowLeftRight,
  };
}

function StockMovementTable({ movements = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="px-4 py-3.5">Movement Code</th>
              <th className="px-4 py-3.5">Procurement Lot</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Quantity</th>
              <th className="px-4 py-3.5">Warehouse Location</th>
              <th className="px-4 py-3.5">Reference / Source</th>
              <th className="px-4 py-3.5">Date & Time</th>
              <th className="px-4 py-3.5">Performed By</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {movements.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-xs font-medium text-slate-500"
                >
                  No stock movements found matching your criteria.
                </td>
              </tr>
            ) : (
              movements.map((movement) => {
                const style = getMovementStyle(movement.type || movement.movementType);
                const Icon = style.icon;

                return (
                  <tr
                    key={movement.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Movement Code */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 font-mono">
                        {movement.movementCode || movement.id}
                      </div>
                      <div
                        className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]"
                        title={movement.id}
                      >
                        {movement.id}
                      </div>
                    </td>

                    {/* Lot & Millet */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-emerald-800 font-mono">
                        {movement.lotId}
                      </div>
                      <div className="text-[11px] font-medium text-slate-600">
                        {movement.millet}
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${style.className}`}
                      >
                        <Icon size={13} />
                        {style.label}
                      </span>
                    </td>

                    {/* Quantity */}
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {movement.quantityKg.toLocaleString("en-IN")} kg
                    </td>

                    {/* Warehouse */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-800 border border-slate-200 text-xs">
                        {movement.warehouse}
                      </span>
                    </td>

                    {/* Reference / From Location */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">
                        {movement.referenceId}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {movement.fromLocation}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap font-medium">
                      {movement.date}
                    </td>

                    {/* Performed By */}
                    <td className="px-4 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {movement.performedBy}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockMovementTable;