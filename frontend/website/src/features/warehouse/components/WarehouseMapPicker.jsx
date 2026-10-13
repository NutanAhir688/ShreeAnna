import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

// Preset village areas in Gujarat for fast selection
export const GUJARAT_PRESETS = [
  { name: "Dahod (Bordi Village)", lat: 22.8397, lng: 74.2558, district: "Dahod", taluka: "Dahod", village: "Bordi" },
  { name: "Bharuch (Nabipur Village)", lat: 21.7051, lng: 72.9959, district: "Bharuch", taluka: "Nabipur", village: "Nabipur" },
  { name: "Amreli (Dhari Village)", lat: 21.6032, lng: 71.2221, district: "Amreli", taluka: "Dhari", village: "Dhari" },
  { name: "Anand (Petlad Village)", lat: 22.5645, lng: 72.9289, district: "Anand", taluka: "Petlad", village: "Petlad" },
  { name: "Junagadh (Keshod Village)", lat: 21.5222, lng: 70.4579, district: "Junagadh", taluka: "Keshod", village: "Keshod" },
];



function WarehouseMapPicker({
  latitude,
  longitude,
  onLocationSelect,
  onPresetSelect,
  onAddressResolved,
  mapHeight = "h-[420px]",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);

  const currentLat = latitude ? Number(latitude) : 22.8397;
  const currentLng = longitude ? Number(longitude) : 74.2558;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([currentLat, currentLng], 9);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div style="background-color: #059669; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
               </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const marker = L.marker([currentLat, currentLng], { icon: customIcon, draggable: true }).addTo(map);

      const handleCoordinateChange = (lat, lng) => {
        const fixedLat = Number(lat.toFixed(6));
        const fixedLng = Number(lng.toFixed(6));
        onLocationSelect(fixedLat, fixedLng);
        reverseGeocode(fixedLat, fixedLng);
      };

      marker.on("dragend", (e) => {
        const { lat, lng } = e.target.getLatLng();
        handleCoordinateChange(lat, lng);
      });

      map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleCoordinateChange(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Invalidate size to guarantee no grey tile issues
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    } else {
      mapInstanceRef.current.setView([currentLat, currentLng], mapInstanceRef.current.getZoom() || 9);
      if (markerRef.current) {
        markerRef.current.setLatLng([currentLat, currentLng]);
      }
    }
  }, [currentLat, currentLng, onLocationSelect]);

  // Reverse geocoding helper
  const reverseGeocode = async (lat, lng) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const district = (addr.state_district || addr.county || addr.district || "").replace(/district/i, "").trim();
        const taluka = (addr.subdistrict || addr.taluk || addr.town || "").replace(/taluk|subdistrict/i, "").trim();
        const village = addr.village || addr.suburb || addr.neighbourhood || addr.city || "";
        const shortAddr = data.display_name ? data.display_name.split(",").slice(0, 3).join(",").trim() : "";
        if (onAddressResolved) {
          onAddressResolved({
            location: shortAddr,
            district,
            taluka,
            village,
            lat,
            lng,
          });
        }
      }
    } catch {
      // ignore
    }
  };

  // Search autocomplete handler
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const q = val.trim().toLowerCase();
      const localMatches = [];

      // 1. Check quick district coordinates
      Object.entries(DISTRICT_COORDS).forEach(([districtName, coords]) => {
        if (districtName.toLowerCase().includes(q)) {
          localMatches.push({
            id: `dist-${districtName}`,
            title: `${districtName} District`,
            subtitle: "Official District, Gujarat",
            lat: coords.lat,
            lng: coords.lng,
            district: districtName,
            taluka: "",
            village: "",
            location: `${districtName}, Gujarat`,
          });
        }
      });

      // Check presets
      GUJARAT_PRESETS.forEach((p) => {
        if (
          p.name.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.taluka.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q)
        ) {
          localMatches.push({
            id: `preset-${p.name}`,
            title: p.name,
            subtitle: `${p.village} Village, ${p.district}, Gujarat`,
            lat: p.lat,
            lng: p.lng,
            district: p.district,
            taluka: p.taluka,
            village: p.village,
            location: `${p.village} Village, ${p.district}, Gujarat`,
          });
        }
      });

      // 2. Fetch live Nominatim geocoding in Gujarat
      let remoteMatches = [];
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
            val.trim() + ", Gujarat"
          )}&countrycodes=in&limit=4`
        );
        if (resp.ok) {
          const data = await resp.json();
          remoteMatches = data.map((item) => {
            const addr = item.address || {};
            const district = (addr.state_district || addr.county || addr.district || "").replace(/district/i, "").trim();
            const taluka = (addr.subdistrict || addr.taluk || addr.town || "").replace(/taluk|subdistrict/i, "").trim();
            const village = addr.village || addr.suburb || addr.neighbourhood || addr.city || "";
            return {
              id: `osm-${item.place_id}`,
              title: item.name || item.display_name.split(",")[0],
              subtitle: item.display_name,
              lat: Number(item.lat),
              lng: Number(item.lon),
              district,
              taluka,
              village,
              location: item.display_name.split(",").slice(0, 3).join(",").trim(),
            };
          });
        }
      } catch {
        // Fallback to local only
      }

      // Combine matches
      const combined = [...localMatches.slice(0, 4), ...remoteMatches].slice(0, 6);
      setSearchResults(combined);
      setShowResults(combined.length > 0);
      setSearching(false);
    }, 300);
  };

  const handleSelectResult = (item) => {
    setSearchQuery(item.title);
    setShowResults(false);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 12, { duration: 1 });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([item.lat, item.lng]);
    }

    onLocationSelect(Number(item.lat.toFixed(6)), Number(item.lng.toFixed(6)));

    if (onAddressResolved) {
      onAddressResolved({
        location: item.location || item.subtitle,
        district: item.district,
        taluka: item.taluka,
        village: item.village,
        lat: Number(item.lat.toFixed(6)),
        lng: Number(item.lng.toFixed(6)),
      });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleSelectPreset = (preset) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([preset.lat, preset.lng], 12, { duration: 1 });
    }
    if (markerRef.current) {
      markerRef.current.setLatLng([preset.lat, preset.lng]);
    }
    setSearchQuery(preset.name);

    if (onPresetSelect) {
      onPresetSelect(preset);
    } else {
      onLocationSelect(preset.lat, preset.lng);
    }
  };

  return (
    <div className="space-y-3">
      {/* Map Search Bar */}
      <div className="relative z-30">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-emerald-700 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search district, taluka, city or village in Gujarat..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => {
              if (searchResults.length > 0) setShowResults(true);
            }}
            className="pl-9 pr-8 h-9 text-xs bg-white border-slate-300 shadow-xs font-medium focus-visible:border-emerald-600 focus-visible:ring-emerald-600/30"
          />
          {searching ? (
            <Loader2 className="absolute right-2.5 h-4 w-4 text-slate-400 animate-spin" />
          ) : searchQuery ? (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 h-4 w-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {/* Dropdown Suggestions List */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            {searchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 transition border-b border-slate-100 last:border-b-0 flex items-start gap-2.5"
              >
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-800 truncate">{item.title}</div>
                  <div className="text-[10px] text-slate-500 truncate">{item.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gujarat Quick Presets */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1 mr-1 text-[11px]">
          <Navigation className="h-3 w-3 text-emerald-700" /> Presets:
        </span>
        {GUJARAT_PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => handleSelectPreset(p)}
            className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 font-semibold transition text-[10px]"
          >
            {p.name.split(" ")[0]}
          </button>
        ))}
      </div>

      {/* Bigger Map Container */}
      <div className="relative rounded-xl border border-slate-200 overflow-hidden shadow-inner">
        <div ref={mapContainerRef} className={`${mapHeight} w-full z-0`} />
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2.5 py-1 rounded-md shadow border border-slate-200 text-[11px] font-mono font-bold text-slate-700 z-10 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-emerald-600" />
          {currentLat.toFixed(4)}, {currentLng.toFixed(4)}
        </div>
      </div>
      <p className="text-[11px] text-slate-500 italic flex items-center gap-1">
        <span>💡</span>
        <span>Search any Gujarat locality above, or click and drag the marker directly on the map.</span>
      </p>
    </div>
  );
}

export default WarehouseMapPicker;
