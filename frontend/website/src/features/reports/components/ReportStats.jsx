import {
  IndianRupee,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBgClass,
  iconColorClass,
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold tracking-tight">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        <div className={`rounded-lg p-3 ${iconBgClass}`}>
          <Icon className={`h-5 w-5 ${iconColorClass}`} />
        </div>
      </div>
    </div>
  );
}

function ReportStats({ stats = {} }) {
  const totalProcurement = stats.totalProcurement ?? stats.totalProcurementKg ?? 0;
  const procurementValue = stats.procurementValue ?? stats.totalProcurementAmount ?? 0;
  const totalSales = stats.totalSales ?? stats.totalSalesKg ?? stats.totalProcurementKg ?? 0;
  const salesValue = stats.salesValue ?? stats.totalSalesAmount ?? stats.totalDisbursedAmount ?? 0;
  const farmerPayments = stats.farmerPayments ?? stats.totalDisbursedAmount ?? 0;
  const fpoMargin = stats.fpoMargin ?? stats.totalFpoMargin ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Procurement"
        value={`${Number(totalProcurement).toLocaleString()} kg`}
        description={`₹${Number(procurementValue).toLocaleString("en-IN")} procurement value`}
        icon={Package}
        iconBgClass="bg-blue-100/80"
        iconColorClass="text-blue-600"
      />

      <StatCard
        title="Total Sales"
        value={`${Number(totalSales).toLocaleString()} kg`}
        description={`₹${Number(salesValue).toLocaleString("en-IN")} sales value`}
        icon={ShoppingCart}
        iconBgClass="bg-emerald-100/80"
        iconColorClass="text-emerald-600"
      />

      <StatCard
        title="Farmer Payments"
        value={`₹${Number(farmerPayments).toLocaleString("en-IN")}`}
        description="Disbursed to farmers via DBT"
        icon={IndianRupee}
        iconBgClass="bg-amber-100/80"
        iconColorClass="text-amber-600"
      />

      <StatCard
        title="FPO Margin"
        value={`₹${Number(fpoMargin).toLocaleString("en-IN")}`}
        description="5% statutory facilitation fee"
        icon={TrendingUp}
        iconBgClass="bg-purple-100/80"
        iconColorClass="text-purple-600"
      />
    </div>
  );
}

export default ReportStats;