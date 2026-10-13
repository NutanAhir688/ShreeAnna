import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { lotsApi } from "@/services/api";

const PAGE_SIZE = 7;

const STATUS_STYLES = {
  SUBMITTED: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  QUALITY_INSPECTION: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 dark:border dark:border-amber-800/50",
  QUALITY_CERTIFICATE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50",
  QUALITY_CERTIFIED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50",
  PROCUREMENT_AGREEMENT: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 dark:border dark:border-blue-800/50",
  AGREEMENT_ACCEPTED: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 dark:border dark:border-blue-800/50",
  AGREEMENT_PENDING: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 dark:border dark:border-blue-800/50",
  PICKUP: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 dark:border dark:border-purple-800/50",
  PICKUP_RESCHEDULED: "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 dark:border dark:border-orange-800/50",
  WAREHOUSE_RECEIVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50",
  PAYMENT: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border dark:border-indigo-800/50",
  COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border dark:border-emerald-800/50",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 dark:border dark:border-red-800/50",
  QUALITY_FAILED: "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 dark:border dark:border-red-800/50",
};

function ProcurementLots() {
  const navigate = useNavigate();

  const [lotsList, setLotsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [millet, setMillet] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadLots() {
      try {
        setLoading(true);
        setError("");

        const data = await lotsApi.getAll();

        const mapped = Array.isArray(data)
          ? data.map((lot) => ({
            id: lot.id,
            lotNumber: lot.lotNumber || lot.id,
            farmerName: lot.farmerName || "Unknown Farmer",
            farmName: lot.farmName || "Unknown Farm",
            farmerId: lot.farmerId,
            farmId: lot.farmId,
            millet: lot.milletType || "Unknown",
            quantity: Number(lot.estimatedQuantityKg ?? 0),
            actualQuantity: lot.actualQuantityKg ?? null,
            status: String(lot.status || "SUBMITTED").toUpperCase(),
            submissionDate: lot.submissionDate || null,
            harvestDate: lot.harvestDate || null,
            description: lot.description || "",
            pricePerKg: lot.pricePerKg ?? null,
            totalValue:
              lot.totalValue ??
              (lot.pricePerKg != null &&
                lot.estimatedQuantityKg != null
                ? Number(lot.pricePerKg) *
                Number(lot.estimatedQuantityKg)
                : null),
          }))
          : [];

        if (isMounted) {
          setLotsList(mapped);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load procurement lots.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLots();

    return () => {
      isMounted = false;
    };
  }, []);

  const milletOptions = useMemo(() => {
    return [
      ...new Set(
        lotsList
          .map((lot) => lot.millet)
          .filter(Boolean)
      ),
    ];
  }, [lotsList]);

  const filteredLots = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return lotsList.filter((lot) => {
      const matchesSearch =
        !searchText ||
        String(lot.lotNumber).toLowerCase().includes(searchText) ||
        String(lot.farmerName).toLowerCase().includes(searchText) ||
        String(lot.farmName).toLowerCase().includes(searchText);

      const matchesStatus =
        status === "all" || lot.status === status;

      const matchesMillet =
        millet === "all" ||
        lot.millet.toLowerCase().includes(millet.toLowerCase());

      return matchesSearch && matchesStatus && matchesMillet;
    });
  }, [lotsList, search, status, millet]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLots.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedLots = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredLots.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLots, currentPage]);

  const stats = useMemo(() => {
    const pendingInspections = lotsList.filter((lot) =>
      ["SUBMITTED", "QUALITY_INSPECTION"].includes(lot.status)
    ).length;

    const lotsInNegotiation = lotsList.filter((lot) =>
      [
        "PROCUREMENT_AGREEMENT",
        "AGREEMENT_PENDING",
        "AGREEMENT_ACCEPTED",
      ].includes(lot.status)
    ).length;

    const warehouseReceivedKg = lotsList
      .filter((lot) =>
        ["WAREHOUSE_RECEIVED", "COMPLETED"].includes(lot.status)
      )
      .reduce(
        (total, lot) => total + Number(lot.actualQuantity ?? lot.quantity),
        0
      );

    const totalPaid = lotsList
      .filter((lot) =>
        ["PAYMENT", "COMPLETED"].includes(lot.status)
      )
      .reduce((total, lot) => {
        if (lot.totalValue != null) {
          return total + Number(lot.totalValue);
        }

        return total;
      }, 0);

    return {
      pendingInspections,
      lotsInNegotiation,
      warehouseReceivedKg,
      totalPaidLakhs: totalPaid / 100000,
    };
  }, [lotsList]);

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setMillet("all");
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleMilletChange = (value) => {
    setMillet(value);
    setPage(1);
  };

  return (
    <div className="min-h-full space-y-6 text-slate-900 dark:text-slate-100">
      {/* Page heading */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Procurement Lots
          </h1>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage the lifecycle of submitted millet lots from farmers to warehouse.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
          <div className="relative w-full sm:w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search Lot ID or Farmer..."
              className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters((value) => !value)}
            className="h-10 gap-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Pending Inspections"
          value={stats.pendingInspections}
          footer="+3 today"
          showTrend
        />

        <SummaryCard
          title="Lots in Negotiation"
          value={stats.lotsInNegotiation}
          footer="—"
        />

        <SummaryCard
          title="Warehouse Received (MT)"
          value={(stats.warehouseReceivedKg / 1000).toLocaleString("en-IN", {
            maximumFractionDigits: 1,
          })}
          footer="+15% vs last week"
          showTrend
        />

        <SummaryCard
          title="Total Paid Out (INR Lakhs)"
          value={stats.totalPaidLakhs.toLocaleString("en-IN", {
            maximumFractionDigits: 1,
          })}
          footer="This month"
        />
      </div>

      {loading && (
        <div className="flex h-40 items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-500" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading procurement lots...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {showFilters && (
            <div className="grid gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 md:grid-cols-3">
              <FilterSelect
                label="Status"
                value={status}
                onChange={handleStatusChange}
                options={[
                  { label: "All statuses", value: "all" },
                  { label: "Submitted", value: "SUBMITTED" },
                  {
                    label: "Quality inspection",
                    value: "QUALITY_INSPECTION",
                  },
                  {
                    label: "Certified",
                    value: "QUALITY_CERTIFIED",
                  },
                  {
                    label: "Agreement accepted",
                    value: "AGREEMENT_ACCEPTED",
                  },
                  {
                    label: "Warehouse received",
                    value: "WAREHOUSE_RECEIVED",
                  },
                  { label: "Payment", value: "PAYMENT" },
                  { label: "Completed", value: "COMPLETED" },
                ]}
              />

              <FilterSelect
                label="Millet type"
                value={millet}
                onChange={handleMilletChange}
                options={[
                  { label: "All millet types", value: "all" },
                  ...milletOptions.map((item) => ({
                    label: item,
                    value: item,
                  })),
                ]}
              />

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="h-10 w-full border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Reset filters
                </Button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/60 text-left text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    <th className="px-4 py-3.5">Lot ID</th>
                    <th className="px-4 py-3.5">Farmer / Farm</th>
                    <th className="px-4 py-3.5">Millet Type</th>
                    <th className="px-4 py-3.5 text-right">Est. Qty (MT)</th>
                    <th className="px-4 py-3.5">Timeline</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLots.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        No procurement lots found.
                      </td>
                    </tr>
                  ) : (
                    paginatedLots.map((lot) => (
                      <ProcurementRow
                        key={lot.id}
                        lot={lot}
                        onView={() =>
                          navigate(`/procurement-lots/${lot.id}`)
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 px-4 py-3 text-xs text-slate-600 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {filteredLots.length === 0
                    ? 0
                    : (currentPage - 1) * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {Math.min(currentPage * PAGE_SIZE, filteredLots.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {filteredLots.length}
                </span>{" "}
                entries
              </p>

              <div className="flex items-center justify-end gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="rounded p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(
                    Math.max(0, currentPage - 3),
                    Math.min(totalPages, currentPage + 2)
                  )
                  .map((pageNumber) => (
                    <button
                      type="button"
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`h-7 min-w-7 rounded px-2 text-xs font-semibold transition ${pageNumber === currentPage
                          ? "bg-emerald-600 dark:bg-emerald-600 text-white shadow-xs"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                        }`}
                    >
                      {pageNumber}
                    </button>
                  ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                  className="rounded p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 transition"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ title, value, footer, showTrend = false }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 px-4 py-4 shadow-xs backdrop-blur-xs">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>

        <p className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          {showTrend && (
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          )}
          {footer}
        </p>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-400">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 text-sm outline-none focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProcurementRow({ lot, onView }) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
      <td className="whitespace-nowrap px-4 py-3.5 font-bold text-emerald-700 dark:text-emerald-400">
        {lot.lotNumber}
      </td>

      <td className="px-4 py-3.5">
        <p className="font-semibold text-slate-900 dark:text-slate-100">{lot.farmerName}</p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {lot.farmName}
        </p>
      </td>

      <td className="whitespace-nowrap px-4 py-3.5 text-slate-700 dark:text-slate-300">
        {lot.millet}
      </td>

      <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium text-slate-900 dark:text-slate-100">
        {(lot.quantity / 1000).toLocaleString("en-IN", {
          maximumFractionDigits: 2,
        })}
      </td>

      <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-slate-500 dark:text-slate-400">
        <p>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Sub:</span>{" "}
          {formatDate(lot.submissionDate)}
        </p>

        <p className="mt-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Har:</span>{" "}
          {formatDate(lot.harvestDate)}
        </p>
      </td>

      <td className="px-4 py-3.5">
        <StatusBadge status={lot.status} />
      </td>

      <td className="px-4 py-3.5 text-right">
        <Button
          variant="outline"
          onClick={onView}
          className="h-8 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
        >
          View Details
        </Button>
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "SUBMITTED").toUpperCase();

  const className =
    STATUS_STYLES[normalizedStatus] || "bg-slate-200 text-slate-700";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-medium ${className}`}
    >
      {formatStatus(normalizedStatus)}
    </span>
  );
}

function formatStatus(status) {
  const labels = {
    QUALITY_CERTIFIED: "Certified",
    QUALITY_CERTIFICATE: "Certified",
    QUALITY_INSPECTION: "Quality Inspection",
    PROCUREMENT_AGREEMENT: "Agreement Pending",
    AGREEMENT_ACCEPTED: "Agreement Accepted",
    WAREHOUSE_RECEIVED: "Warehouse Received",
    PICKUP_RESCHEDULED: "Pickup Rescheduled",
  };

  if (labels[status]) {
    return labels[status];
  }

  return String(status || "Unknown")
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default ProcurementLots;
