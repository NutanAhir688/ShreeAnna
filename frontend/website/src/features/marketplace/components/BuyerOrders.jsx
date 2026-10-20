import { ShoppingCart } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function BuyerOrders({ orders = [] }) {
  const safeOrders = Array.isArray(orders) ? orders : [];

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    }

    if (status === "Approved") {
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    }

    return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  };

  return (
    <Card className="border-slate-200/80 shadow-xs">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-slate-500" />

          <CardTitle className="text-base">
            Buyer Orders
          </CardTitle>
        </div>

        <p className="text-sm text-slate-500">
          Orders received against this listing.
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {safeOrders.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <ShoppingCart className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No buyer orders yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Orders from processors and SHGs will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">
                    Order
                  </TableHead>

                  <TableHead>Buyer</TableHead>

                  <TableHead>Type</TableHead>

                  <TableHead>Quantity</TableHead>

                  <TableHead>Amount</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="pr-6">
                    Date
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {safeOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="pl-6 font-medium">
                      {order.id}
                    </TableCell>

                    <TableCell>
                      {order.buyerName}
                    </TableCell>

                    <TableCell>
                      {order.buyerType}
                    </TableCell>

                    <TableCell>
                      {order.quantity.toLocaleString()} kg
                    </TableCell>

                    <TableCell className="font-medium">
                      ₹
                      {order.amount.toLocaleString(
                        "en-IN"
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={getStatusClass(
                          order.status
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="pr-6">
                      {order.orderDate}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BuyerOrders;