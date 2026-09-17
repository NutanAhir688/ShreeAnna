import { RotateCcw, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ProcurementFilters({
  search,
  setSearch,
  status,
  setStatus,
  millet,
  setMillet,
  onReset,
}) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-xs">

      <div className="flex flex-col gap-3 lg:flex-row">

        {/* Search */}
        <div className="relative flex-1">

          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <Input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search lot, farmer or farm..."
            className="pl-9"
          />

        </div>


        {/* Status */}
        <Select
          value={status}
          onValueChange={setStatus}
        >
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Status
            </SelectItem>

            <SelectItem value="SUBMITTED">
              Submitted
            </SelectItem>

            <SelectItem value="QUALITY_INSPECTION">
              Quality Inspection
            </SelectItem>

            <SelectItem value="QUALITY_CERTIFIED">
              Quality Certified
            </SelectItem>

            <SelectItem value="REJECTED">
              Rejected
            </SelectItem>

            <SelectItem value="COMPLETED">
              Completed
            </SelectItem>
          </SelectContent>
        </Select>


        {/* Millet */}
        <Select
          value={millet}
          onValueChange={setMillet}
        >
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="All Millet" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Millet
            </SelectItem>

            <SelectItem value="Pearl Millet">
              Pearl Millet
            </SelectItem>

            <SelectItem value="Finger Millet">
              Finger Millet
            </SelectItem>

            <SelectItem value="Foxtail Millet">
              Foxtail Millet
            </SelectItem>
          </SelectContent>
        </Select>


        {/* Reset */}
        <Button
          variant="outline"
          onClick={onReset}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>

      </div>

    </div>
  );
}

export default ProcurementFilters;