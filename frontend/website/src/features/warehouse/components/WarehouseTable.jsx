import { Eye, MapPin, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getCapacityColor(percentage) {
  if (percentage >= 90) {
    return "bg-red-500";
  }

  if (percentage >= 70) {
    return "bg-amber-500";
  }

  return "bg-emerald-500";
}

function WarehouseTable({ warehouses, onDeleteWarehouse }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold">
            <tr>
              <th className="px-4 py-3.5 font-bold">
                Warehouse
              </th>

              <th className="px-4 py-3.5 font-bold">
                Location
              </th>

              <th className="px-4 py-3.5 font-bold">
                Manager
              </th>

              <th className="px-4 py-3.5 font-bold">
                Capacity
              </th>

              <th className="px-4 py-3.5 font-bold">
                Stock Lots
              </th>

              <th className="px-4 py-3.5 font-bold">
                Condition
              </th>

              <th className="px-4 py-3.5 font-bold">
                Status
              </th>

              <th className="px-4 py-3.5 text-right font-bold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {warehouses.map((warehouse) => {
              const used = Number(warehouse.usedCapacity || 0);
              const total = Number(warehouse.capacity || 0);
              const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

              return (
                <tr
                  key={warehouse.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {warehouse.name}
                    </div>

                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {warehouse.code}
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400 dark:text-slate-500" />

                      {warehouse.location}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{warehouse.manager}</div>

                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      {warehouse.contact}
                    </div>
                  </td>

                  <td className="min-w-[180px] px-4 py-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {used.toLocaleString('en-IN')} kg
                      </span>

                      <span className="text-slate-500 dark:text-slate-400">
                        / {total.toLocaleString('en-IN')} kg
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full ${getCapacityColor(
                          percentage
                        )}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {percentage}% occupied
                    </div>
                  </td>

                  <td className="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">
                    {warehouse.stockLots ?? 0}
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 text-xs font-semibold">
                      {warehouse.storageCondition}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1 text-xs font-semibold">
                      {warehouse.status}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/warehouses/${warehouse.id}`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      {onDeleteWarehouse && (
                        <button
                          onClick={() => onDeleteWarehouse(warehouse.id, warehouse.name)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
                          title="Delete Warehouse (Soft Delete)"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WarehouseTable;