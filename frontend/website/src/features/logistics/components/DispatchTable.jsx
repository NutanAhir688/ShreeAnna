import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

function getStatusClass(status) {
  const styles = {
    "Pending Dispatch":
      "bg-red-100 text-red-800 font-bold",
    "Scheduled":
      "bg-sky-100 text-sky-700",
    "Vehicle Assigned":
      "bg-blue-100 text-blue-700",
    "Stock Reserved":
      "bg-blue-100 text-blue-700",
    "Ready for Dispatch":
      "bg-amber-100 text-amber-700",
    "In Transit":
      "bg-purple-100 text-purple-700",
    Delivered:
      "bg-emerald-100 text-emerald-700",
  };

  return styles[status] || "bg-gray-100 text-gray-700";
}

function DispatchTable({ dispatches }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium">
                Dispatch
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Buyer
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Millet
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Quantity
              </th>

              <th className="px-4 py-3 text-left font-medium">
                Delivery Location
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
            {dispatches.map((dispatch) => (
              <tr
                key={dispatch.id}
                className="border-b last:border-0 hover:bg-muted/20"
              >
                <td className="px-4 py-4">
                  <div className="font-medium">
                    {dispatch.id}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {dispatch.orderId}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="font-medium">
                    {dispatch.buyerName}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {dispatch.buyerType}
                  </div>
                </td>

                <td className="px-4 py-4">
                  {dispatch.millet}
                  <div className="text-xs text-muted-foreground">
                    {dispatch.grade}
                  </div>
                </td>

                <td className="px-4 py-4">
                  {dispatch.quantity} {dispatch.unit}
                </td>

                <td className="px-4 py-4">
                  {dispatch.deliveryLocation}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      dispatch.status
                    )}`}
                  >
                    {dispatch.status}
                  </span>
                </td>

                <td className="px-4 py-4 text-right">
                  <button
                    onClick={() =>
                      navigate(`/dispatches/${dispatch.id}`)
                    }
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
                  >
                    <Eye size={15} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DispatchTable;