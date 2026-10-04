import { Search, Plus, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";

function WarehouseFilters({
  search,
  setSearch,
  status,
  setStatus,
  viewMode = "table",
  setViewMode,
  onOpenAddModal,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between shadow-xs">
      <div className="flex flex-1 flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search warehouse, village, district or manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full md:w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setViewMode && setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition ${
              viewMode === "table"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="h-3.5 w-3.5" /> Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode && setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md transition ${
              viewMode === "map"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Map className="h-3.5 w-3.5" /> Gujarat Map
          </button>
        </div>

        {/* Add Warehouse Button */}
        <Button
          onClick={onOpenAddModal}
          className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold h-9 px-4"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Warehouse
        </Button>
      </div>
    </div>
  );
}

export default WarehouseFilters;