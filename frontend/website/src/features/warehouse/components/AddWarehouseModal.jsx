import { useState } from "react";
import {
  Building2,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Loader2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import WarehouseMapPicker, { GUJARAT_PRESETS } from "./WarehouseMapPicker";
import { warehousesApi } from "@/services/api";

function AddWarehouseModal({ open, onOpenChange, onSuccess }) {
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [village, setVillage] = useState("");
  const [location, setLocation] = useState("");
  const [managerName, setManagerName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [capacityInTons, setCapacityInTons] = useState("");
  const [utilizedCapacityTons, setUtilizedCapacityTons] = useState("");
  const [storageCondition, setStorageCondition] = useState("Dry Grain, Aerated");
  const [latitude, setLatitude] = useState(22.2587);
  const [longitude, setLongitude] = useState(71.1924);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handlePresetSelect = (preset) => {
    setDistrict(preset.district);
    setTaluka(preset.taluka);
    setVillage(preset.village);
    setLocation(`${preset.village} Village, ${preset.district}, Gujarat`);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a warehouse name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        location: location.trim() || `${village}, ${district}`,
        district: district.trim(),
        taluka: taluka.trim(),
        village: village.trim(),
        managerName: managerName.trim(),
        contactPhone: contactPhone.trim(),
        capacityInTons: Number(capacityInTons) || 0,
        utilizedCapacityTons: Number(utilizedCapacityTons) || 0,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        storageCondition: storageCondition,
      };

      await warehousesApi.create(payload);
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err.message || "Failed to create warehouse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Add New Warehouse
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Create a new storage location and pick exact coordinates on the map.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-2">
          {/* Warehouse Name & Storage Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Warehouse Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g. Dahod Rural Grain Warehouse"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 text-xs border-slate-200 font-medium"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Storage Condition
              </label>
              <select
                value={storageCondition}
                onChange={(e) => setStorageCondition(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold outline-none"
              >
                <option value="Dry Grain, Aerated">Dry Grain, Aerated</option>
                <option value="Cold Storage, Temperature Controlled">Cold Storage, Temperature Controlled</option>
                <option value="Hermetic Storage, Moisture Control">Hermetic Storage, Moisture Control</option>
                <option value="Silo Bulk Storage">Silo Bulk Storage</option>
              </select>
            </div>
          </div>

          {/* District, Taluka & Village */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">District</label>
              <Input
                placeholder="District (e.g. Dahod)"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="h-9 text-xs border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Taluka</label>
              <Input
                placeholder="Taluka (e.g. Dahod)"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="h-9 text-xs border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Village</label>
              <Input
                placeholder="Village (e.g. Bordi)"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="h-9 text-xs border-slate-200 font-medium"
              />
            </div>
          </div>

          {/* Full Location Address, Total Capacity & Used Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Full Location Address
              </label>
              <Input
                placeholder="Full address (e.g. Bordi Village, Dahod)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-9 text-xs border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Total Capacity (kg) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                placeholder="Total kg"
                value={capacityInTons}
                onChange={(e) => setCapacityInTons(e.target.value)}
                className="h-9 text-xs border-slate-200 font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Used Capacity (kg)
              </label>
              <Input
                type="number"
                placeholder="Used kg"
                value={utilizedCapacityTons}
                onChange={(e) => setUtilizedCapacityTons(e.target.value)}
                className="h-9 text-xs border-slate-200 font-bold"
              />
            </div>
          </div>

          {/* Manager Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Manager Name
              </label>
              <Input
                placeholder="Manager Name"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="h-9 text-xs border-slate-200 font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Contact Phone
              </label>
              <Input
                placeholder="+91 Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-9 text-xs border-slate-200 font-medium"
              />
            </div>
          </div>

          {/* Interactive Map Location Picker */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>Select Location on Map</span>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Lat: {Number(latitude).toFixed(4)}, Lng: {Number(longitude).toFixed(4)}
              </span>
            </label>
            <WarehouseMapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationSelect={handleLocationSelect}
              onPresetSelect={handlePresetSelect}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-bold border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-9 px-5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Warehouse
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddWarehouseModal;
