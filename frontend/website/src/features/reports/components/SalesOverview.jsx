import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function SalesOverview({ data = [] }) {
  const chartData = (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    amount: Number(item.totalAmount ?? item.amount ?? (Number(item.quantityKg || 0) * 50)),
    millet: item.millet || "Millet",
  }));

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold">
          Sales & Valuation by Millet
        </h3>

        <p className="text-sm text-muted-foreground">
          Gross sales valuation realized through the FPO value chain
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

            <XAxis dataKey="millet" tickLine={false} />

            <YAxis
              tickLine={false}
              tickFormatter={(val) => `₹${Number(val / 1000).toFixed(0)}k`}
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Valuation",
              ]}
            />

            <Bar
              dataKey="amount"
              fill="#2E7D42"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default SalesOverview;