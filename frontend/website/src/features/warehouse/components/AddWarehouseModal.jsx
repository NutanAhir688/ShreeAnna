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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import WarehouseMapPicker, { GUJARAT_PRESETS } from "./WarehouseMapPicker";
import { warehousesApi } from "@/services/api";

function AddWarehouseModal({ open, onOpenChange, onSuccess }) {
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("Dahod");
  const [taluka, setTaluka] = useState("Dahod");
  const [village, setVillage] = useState("Bordi");
  const [location, setLocation] = useState("Bordi Village, Dahod, Gujarat");
  const [managerName, setManagerName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [capacityInTons, setCapacityInTons] = useState("");
  const [utilizedCapacityTons, setUtilizedCapacityTons] = useState("");
  const [storageCondition, setStorageCondition] = useState("Dry Grain, Aerated");
  const [latitude, setLatitude] = useState(22.8397);
  const [longitude, setLongitude] = useState(74.2558);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleAddressResolved = (resolved) => {
    if (resolved.district) setDistrict(resolved.district);
    if (resolved.taluka) setTaluka(resolved.taluka);
    if (resolved.village) setVillage(resolved.village);
    if (resolved.location) setLocation(resolved.location);
    if (resolved.lat && resolved.lng) {
      setLatitude(resolved.lat);
      setLongitude(resolved.lng);
    }
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
        location: location.trim() || `${village || "Village"}, ${district || "Gujarat"}`,
        district: district.trim() || "Gujarat",
        taluka: taluka.trim() || "",
        village: village.trim() || "",
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
      <DialogContent className="max-w-4xl lg:max-w-5xl bg-white p-6 border border-slate-200 max-h-[92vh] overflow-y-auto">
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
                Use the interactive map search to pinpoint storage coordinates and configure warehouse capacity.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium mt-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="text-xs mt-3">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Side: Warehouse Details Form */}
            <div className="lg:col-span-5 space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Warehouse Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Anand Rural Grain Warehouse"
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
                <Select value={storageCondition} onValueChange={setStorageCondition}>
                  <SelectTrigger className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold">
                    <SelectValue placeholder="Storage Condition" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="bg-white z-[100]">
                    <SelectItem value="Dry Grain, Aerated" className="text-xs">Dry Grain, Aerated</SelectItem>
                    <SelectItem value="Cold Storage, Temperature Controlled" className="text-xs">Cold Storage, Temperature Controlled</SelectItem>
                    <SelectItem value="Hermetic Storage, Moisture Control" className="text-xs">Hermetic Storage, Moisture Control</SelectItem>
                    <SelectItem value="Silo Bulk Storage" className="text-xs">Silo Bulk Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Location Address
                </label>
                <Input
                  placeholder="Address (auto-filled by map search/click)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-9 text-xs border-slate-200 font-medium"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-populated when searching or clicking on the map.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div className="grid grid-cols-2 gap-3">
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
            </div>

            {/* Right Side: Map Location Search & Interactive Leaflet Map */}
            <div className="lg:col-span-7 flex flex-col space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-700" />
                  <span>Interactive Map & Location Search</span>
                </label>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  Lat: {Number(latitude).toFixed(4)}, Lng: {Number(longitude).toFixed(4)}
                </span>
              </div>

              <WarehouseMapPicker
                latitude={latitude}
                longitude={longitude}
                onLocationSelect={handleLocationSelect}
                onPresetSelect={handlePresetSelect}
                onAddressResolved={handleAddressResolved}
                mapHeight="h-[380px] sm:h-[430px]"
              />
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddWarehouseModal;
