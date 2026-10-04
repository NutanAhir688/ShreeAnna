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
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Warehouse
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Location
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Manager
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Capacity
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Stock Lots
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Condition
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Status
              </th>

              <th className="px-4 py-3 text-right font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {warehouses.map((warehouse) => {
              const used = Number(warehouse.usedCapacity || 0);
              const total = Number(warehouse.capacity || 0);
              const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

              return (
                <tr
                  key={warehouse.id}
                  className="border-b last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {warehouse.name}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {warehouse.code}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />

                      {warehouse.location}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div>{warehouse.manager}</div>

                    <div className="text-xs text-muted-foreground">
                      {warehouse.contact}
                    </div>
                  </td>

                  <td className="min-w-[180px] px-4 py-4">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="font-bold text-slate-800">
                        {used.toLocaleString('en-IN')} kg
                      </span>

                      <span className="text-muted-foreground">
                        / {total.toLocaleString('en-IN')} kg
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${getCapacityColor(
                          percentage
                        )}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-1 text-xs text-muted-foreground">
                      {percentage}% occupied
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {warehouse.stockLots || 8}
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      {warehouse.storageCondition}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
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