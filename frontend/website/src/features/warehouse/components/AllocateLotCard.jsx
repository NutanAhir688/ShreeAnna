import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Package, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { lotsApi, warehousesApi } from "@/services/api";

export default function AllocateLotCard({ initialLotId = "", initialWarehouseId = "", initialQuantity = "", onCancel, onSuccess }) {
  const [procurementLots, setProcurementLots] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    lotId: initialLotId,
    warehouseId: initialWarehouseId,
    quantity: initialQuantity,
    storageSection: "",
    remarks: "",
  });

  useEffect(() => {
    async function loadDropdownData() {
      setLoading(true);
      try {
        const [lotsData, whData] = await Promise.all([
          lotsApi.getAll().catch(() => []),
          warehousesApi.getAll().catch(() => []),
        ]);

        const validLots = Array.isArray(lotsData) ? lotsData : [];
        const validWh = Array.isArray(whData) ? whData : [];

        setProcurementLots(validLots);
        setWarehouses(validWh);

        setForm((prev) => {
          let selectedLot = prev.lotId || initialLotId;
          if (!selectedLot && validLots.length > 0) {
            selectedLot = validLots[0].lotNumber || validLots[0].id;
          }

          let selectedWhId = prev.warehouseId || initialWarehouseId;
          if (!selectedWhId && validWh.length > 0) {
            selectedWhId = validWh[0].id;
          }

          let selectedQty = prev.quantity || initialQuantity;
          if (!selectedQty && selectedLot) {
            const foundLot = validLots.find((l) => (l.lotNumber || l.id) === selectedLot);
            if (foundLot) {
              selectedQty = (foundLot.actualQuantityKg || foundLot.estimatedQuantityKg || "").toString();
            }
          }

          return {
            ...prev,
            lotId: selectedLot || "",
            warehouseId: selectedWhId || "",
            quantity: selectedQty || "",
          };
        });
      } catch (err) {
        console.error("Failed to load allocation options:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDropdownData();
  }, [initialLotId, initialWarehouseId, initialQuantity]);

  // Selected warehouse capacity calculations
  const selectedWarehouseObj = useMemo(() => {
    if (!form.warehouseId || warehouses.length === 0) return null;
    return warehouses.find(
      (w) => w.id === form.warehouseId || w.id?.toString() === form.warehouseId?.toString() || w.name === form.warehouseId
    );
  }, [form.warehouseId, warehouses]);

  const capacityMetrics = useMemo(() => {
    const totalKg = selectedWarehouseObj
      ? (selectedWarehouseObj.capacityInTons !== undefined && selectedWarehouseObj.capacityInTons !== null
          ? Number(selectedWarehouseObj.capacityInTons)
          : Number(selectedWarehouseObj.capacity || 0))
      : 0;

    const utilKg = selectedWarehouseObj
      ? (selectedWarehouseObj.utilizedCapacityTons !== undefined && selectedWarehouseObj.utilizedCapacityTons !== null
          ? Number(selectedWarehouseObj.utilizedCapacityTons)
          : Number(selectedWarehouseObj.usedCapacity || 0))
      : 0;

    const availKg = Math.max(0, totalKg - utilKg);
    const allocKg = Number(form.quantity) || 0;
    const remainingAfterKg = Math.max(0, availKg - allocKg);
    const usedPct = totalKg > 0 ? Math.min(100, Math.round(((utilKg + allocKg) / totalKg) * 100)) : 0;

    return {
      totalKg,
      utilKg,
      availKg,
      allocKg,
      remainingAfterKg,
      usedPct,
    };
  }, [selectedWarehouseObj, form.quantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lotId) {
      setError("Please select a procurement lot.");
      return;
    }
    if (!form.warehouseId) {
      setError("Please select a warehouse.");
      return;
    }
    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Please enter a valid allocation quantity.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        lotId: form.lotId,
        warehouseId: form.warehouseId,
        quantity: Number(form.quantity),
        storageSection: form.storageSection || "",
        remarks: form.remarks,
      };

      const res = await warehousesApi.allocateLot(payload);
      setSuccessMsg(`Lot ${form.lotId} allocated successfully!`);
      if (onSuccess) {
        onSuccess(res);
      }
    } catch (err) {
      console.error("Failed to allocate lot:", err);
      setError(err.message || "Failed to allocate procurement lot.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border border-slate-200 bg-white shadow-xs rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-900">
          Allocate Procurement Lot
        </CardTitle>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">
          Assign certified stock to a warehouse location.
        </p>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-md flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Procurement Lot Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Procurement Lot
              </label>
              <Select
                value={form.lotId}
                onValueChange={(val) => {
                  const found = procurementLots.find((l) => (l.lotNumber || l.id) === val);
                  setForm((prev) => ({
                    ...prev,
                    lotId: val,
                    quantity: found ? (found.actualQuantityKg || found.estimatedQuantityKg || prev.quantity).toString() : prev.quantity,
                  }));
                }}
              >
                <SelectTrigger className="bg-white border-slate-200 h-9 text-xs">
                  <SelectValue placeholder="Select procurement lot" />
                </SelectTrigger>
                <SelectContent>
                  {procurementLots.length > 0 ? (
                    procurementLots.map((lot) => (
                      <SelectItem key={lot.id || lot.lotNumber} value={lot.lotNumber || lot.id}>
                        {lot.lotNumber || lot.id} — {lot.millet || lot.milletType || "Millet"} ({lot.actualQuantityKg || lot.estimatedQuantityKg || 0} kg)
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={form.lotId || "NO_LOTS"} disabled={!form.lotId}>
                      {form.lotId ? form.lotId : "No procurement lots available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Warehouse Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Warehouse
              </label>
              <Select
                value={form.warehouseId}
                onValueChange={(val) => setForm((prev) => ({ ...prev, warehouseId: val }))}
              >
                <SelectTrigger className="bg-white border-slate-200 h-9 text-xs">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.length > 0 ? (
                    warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name || wh.warehouseCode} ({wh.district || wh.location || "Central"})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={form.warehouseId || "NO_WAREHOUSES"} disabled={!form.warehouseId}>
                      {form.warehouseId ? (selectedWarehouseObj?.name || form.warehouseId) : "No warehouses available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Quantity
              </label>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                className="bg-white border-slate-200 h-9 text-xs"
              />
            </div>

            {/* Storage Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Storage Section
              </label>
              <Input
                type="text"
                placeholder="Example: Section A-02"
                value={form.storageSection}
                onChange={(e) => setForm((prev) => ({ ...prev, storageSection: e.target.value }))}
                className="bg-white border-slate-200 h-9 text-xs"
              />
            </div>
          </div>

          {/* Warehouse Capacity Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-emerald-700" />
                Warehouse Capacity Preview ({selectedWarehouseObj?.name || "Selected Warehouse"})
              </span>
              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {capacityMetrics.availKg.toLocaleString("en-IN")} kg Available
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-500">Total Capacity:</span>
                <p className="font-bold text-slate-900">{capacityMetrics.totalKg.toLocaleString("en-IN")} kg</p>
              </div>
              <div>
                <span className="text-slate-500">Utilized Stock:</span>
                <p className="font-bold text-slate-900">{capacityMetrics.utilKg.toLocaleString("en-IN")} kg</p>
              </div>
              <div>
                <span className="text-slate-500">Available Left:</span>
                <p className="font-bold text-emerald-700">{capacityMetrics.availKg.toLocaleString("en-IN")} kg</p>
              </div>
              <div>
                <span className="text-slate-500">Remaining After Allocation:</span>
                <p className={`font-bold ${capacityMetrics.remainingAfterKg >= 0 ? "text-slate-900" : "text-red-600"}`}>
                  {capacityMetrics.remainingAfterKg.toLocaleString("en-IN")} kg
                </p>
              </div>
            </div>

            {/* Visual Capacity Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                <span>Warehouse Storage Occupancy</span>
                <span>{capacityMetrics.usedPct}% Full</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    capacityMetrics.usedPct > 90
                      ? "bg-red-600"
                      : capacityMetrics.usedPct > 75
                      ? "bg-amber-500"
                      : "bg-emerald-600"
                  }`}
                  style={{ width: `${capacityMetrics.usedPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Remarks
            </label>
            <Textarea
              rows={3}
              placeholder="Add allocation remarks..."
              value={form.remarks}
              onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
              className="bg-white border-slate-200 text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-9 px-4 text-xs font-semibold border-slate-300 text-slate-700"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="h-9 px-5 text-xs font-bold bg-slate-900 hover:bg-black text-white"
            >
              {submitting ? "Allocating..." : "Allocate Lot"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
