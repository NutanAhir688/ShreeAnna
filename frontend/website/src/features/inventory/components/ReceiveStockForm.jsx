import { useState, useEffect } from "react";
import { lotsApi, warehousesApi } from "@/services/api";

function ReceiveStockForm({ onClose }) {
  const [procurementLots, setProcurementLots] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({
    lotId: "",
    warehouse: "",
    quantity: "",
    receivedDate: "",
    remarks: "",
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const [lotsData, whData] = await Promise.all([
          lotsApi.getAll().catch(() => []),
          warehousesApi.getAll().catch(() => []),
        ]);
        setProcurementLots(Array.isArray(lotsData) ? lotsData : []);
        setWarehouses(Array.isArray(whData) ? whData : []);
      } catch (err) {
        console.error("Failed to load options:", err);
      }
    }
    loadOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Stock received:", {
      ...form,
      quantity: Number(form.quantity),
    });

    onClose();
  };

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          Receive Stock
        </h2>

        <p className="text-sm text-muted-foreground">
          Add certified procurement stock to a warehouse.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Procurement Lot">
            <select
              name="lotId"
              value={form.lotId}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">
                Select procurement lot
              </option>
              {procurementLots.map((lot) => (
                <option key={lot.id || lot.lotNumber} value={lot.lotNumber || lot.id}>
                  {lot.lotNumber || lot.id} — {lot.millet || lot.milletType || "Millet"} ({lot.actualQuantityKg || lot.estimatedQuantityKg || 0} kg)
                </option>
              ))}
            </select>
          </Field>

          <Field label="Warehouse">
            <select
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">
                Select warehouse
              </option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name || wh.warehouseCode} ({wh.district || wh.location || "Central"})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Quantity Received">
            <input
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              required
              className="input"
            />
          </Field>

          <Field label="Received Date">
            <input
              name="receivedDate"
              type="date"
              value={form.receivedDate}
              onChange={handleChange}
              required
              className="input"
            />
          </Field>
        </div>

        <Field label="Remarks">
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            rows={3}
            placeholder="Add receiving remarks..."
            className="input resize-none"
          />
        </Field>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Receive Stock
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
      </label>

      {children}
    </div>
  );
}

export default ReceiveStockForm;