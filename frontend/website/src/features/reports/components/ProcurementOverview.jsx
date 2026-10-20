import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ProcurementOverview({ data = [] }) {
  const chartData = (Array.isArray(data) ? data : []).map((item) => ({
    ...item,
    quantity: Number(item.quantity ?? item.quantityKg ?? 0),
    millet: item.millet || "Millet",
  }));

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold">
          Procurement by Millet
        </h3>

        <p className="text-sm text-muted-foreground">
          Quantity procured across different millet types
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />

            <XAxis dataKey="millet" tickLine={false} />

            <YAxis tickLine={false} />

            <Tooltip
              formatter={(value) => [
                `${Number(value).toLocaleString()} kg`,
                "Procured Quantity",
              ]}
            />

            <Bar
              dataKey="quantity"
              fill="#1B4324"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProcurementOverview;