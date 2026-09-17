import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

function FarmerProcurement({ farmer }) {
  const procurementHistory = farmer.procurementHistory ?? [];
  return (
    <Card className="border-slate-200/80 shadow-xs">

      <CardHeader>
        <CardTitle className="text-lg font-bold">
          Procurement History
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0">

        {procurementHistory.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No procurement history available.
          </div>
        ) : (
          <Table>

            <TableHeader>
              <TableRow className="bg-slate-50/50">

                <TableHead className="pl-6">
                  Lot
                </TableHead>

                <TableHead>
                  Millet
                </TableHead>

                <TableHead>
                  Quantity
                </TableHead>

                <TableHead>
                  Price
                </TableHead>

                <TableHead>
                  Date
                </TableHead>

                <TableHead className="pr-6">
                  Status
                </TableHead>

              </TableRow>
            </TableHeader>

            <TableBody>

              {procurementHistory.map((item) => (
                <TableRow key={item.lotId}>

                  <TableCell className="pl-6 font-medium">
                    {item.lotId}
                  </TableCell>

                  <TableCell>
                    {item.millet}
                  </TableCell>

                  <TableCell>
                    {item.quantity}
                  </TableCell>

                  <TableCell>
                    {item.price}
                  </TableCell>

                  <TableCell>
                    {item.date}
                  </TableCell>

                  <TableCell className="pr-6">
                    <Badge variant="secondary">
                      {item.status}
                    </Badge>
                  </TableCell>

                </TableRow>
              ))}

            </TableBody>

          </Table>
        )}

      </CardContent>
    </Card>
  );
}

export default FarmerProcurement;