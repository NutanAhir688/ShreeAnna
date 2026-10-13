import { Search } from "lucide-react";

function SettlementFilters({
  search,
  setSearch,
  status,
  setStatus,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="text"
          placeholder="Search settlement, order, farmer or lot..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border bg-background px-3 py-2 text-sm outline-none font-medium"
      >
        <option value="All">All Status</option>
        <option value="Pending">Pending Settlement</option>
        <option value="Paid">Paid</option>
        <option value="Awaiting Delivery">Awaiting Delivery</option>
      </select>
    </div>
  );
}

export default SettlementFilters;