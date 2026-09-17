import { MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


function FarmerTable({ farmers }) {
  const navigate = useNavigate();
  return (
    <div className="rounded-lg border bg-card">

      <Table>

        <TableHeader>
          <TableRow>

            <TableHead>Farmer</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Village</TableHead>
            <TableHead>Farms</TableHead>
            <TableHead>Land</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />

          </TableRow>
        </TableHeader>


        <TableBody>

          {farmers.map((farmer) => (

            <TableRow key={farmer.id}>

              {/* Farmer */}
              <TableCell>
                <div>
                  <p className="font-medium">
                    {farmer.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {farmer.id}
                  </p>
                </div>
              </TableCell>


              {/* Contact */}
              <TableCell>
                {farmer.phone}
              </TableCell>


              {/* Village */}
              <TableCell>
                {farmer.village}
              </TableCell>


              {/* Farms count */}
              <TableCell>
                {farmer.farmCount ?? (Array.isArray(farmer.farms) ? farmer.farms.length : 0)}
              </TableCell>

              {/* Total Land */}
              <TableCell>
                {farmer.totalLand > 0
                  ? `${Number(farmer.totalLand).toFixed(1)} acres`
                  : "—"}
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge
                  variant={
                    farmer.status === "Active"
                      ? "default"
                      : farmer.status === "Pending"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {farmer.status}
                </Badge>
              </TableCell>

              {/* Actions */}
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/farmers/${farmer.id}`)}>
                      View Farmer
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate(`/farmers/${farmer.id}/edit`)}>
                      Edit Farmer
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate(`/farmers/${farmer.id}`)}>
                      View Farms
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </div>
  );
}

export default FarmerTable;