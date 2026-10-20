import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Truck,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Navigation,
  KeyRound,
  ExternalLink,
  RotateCcw,
  Sparkles,
  X,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function OrderLiveTrackingMap({
  order,
  onClose,
  onVerifyOtp,
  isVerifyingOtp = false,
  otpMessage = "",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const [otpInput, setOtpInput] = useState("");
  const [driverPos, setDriverPos] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [remainingKm, setRemainingKm] = useState(2.4);

  // Safe coordinate fallbacks
  const customerLat = Number(order?.customerLatitude) || 22.8398;
  const customerLng = Number(order?.customerLongitude) || 74.2536;
  const initialDriverLat = Number(order?.driverLatitude) || (customerLat + 0.0150);
  const initialDriverLng = Number(order?.driverLongitude) || (customerLng - 0.0180);

  const isDelivered = order?.status === "DELIVERED";

  // Calculate Haversine distance
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(2));
  };

  // Initialize Driver Position
  useEffect(() => {
    setDriverPos({ lat: initialDriverLat, lng: initialDriverLng });
    const dist = getDistanceKm(initialDriverLat, initialDriverLng, customerLat, customerLng);
    setRemainingKm(dist);
    setEtaMinutes(Math.max(4, Math.round(dist * 5)));
  }, [initialDriverLat, initialDriverLng, customerLat, customerLng]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = (customerLat + initialDriverLat) / 2;
      const centerLng = (customerLng + initialDriverLng) / 2;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([centerLat, centerLng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Customer Location Icon (Pulsing Pin)
      const customerIcon = L.divIcon({
        className: "custom-customer-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(34, 197, 94, 0.25); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: #1B4324; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      // Driver Location Icon (Vehicle)
      const driverIcon = L.divIcon({
        className: "custom-driver-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background: #2563EB; color: white; border-radius: 20px; padding: 2px 8px; font-size: 10px; font-weight: 800; font-family: monospace; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 1.5px solid white; margin-bottom: 3px;">
              ${order?.vehicleNumber || "GJ-20-AB-4021"}
            </div>
            <div style="background-color: #1E40AF; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(30,64,175,0.45); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
          </div>
        `,
        iconSize: [80, 50],
        iconAnchor: [40, 48],
      });

      // Add Markers
      const customerMarker = L.marker([customerLat, customerLng], { icon: customerIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #1B4324;">📍 Delivery Destination</b><br/>
            ${order?.shippingAddress || "Customer Address"}<br/>
            <span style="font-size: 10px; color: #64748b;">GPS: ${customerLat.toFixed(4)}°, ${customerLng.toFixed(4)}°</span>
          </div>`
        );

      const driverMarker = L.marker([initialDriverLat, initialDriverLng], { icon: driverIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
            <b style="color: #1E40AF;">🚚 Driver: ${order?.driverName || "Ramesh Verma"}</b><br/>
            Vehicle: ${order?.vehicleNumber || "GJ-20-AB-4021"}<br/>
            <span style="font-size: 10px; color: #059669; font-weight: bold;">● Active Live Navigation</span>
          </div>`
        );

      driverMarkerRef.current = driverMarker;

      // Draw Route Polyline
      const routeLine = L.polyline(
        [
          [initialDriverLat, initialDriverLng],
          [customerLat, customerLng],
        ],
        {
          color: "#1B4324",
          weight: 4,
          opacity: 0.85,
          dashArray: "8, 8",
        }
      ).addTo(map);

      routeLineRef.current = routeLine;

      // Fit bounds to show both markers nicely
      map.fitBounds(
        [
          [customerLat, customerLng],
          [initialDriverLat, initialDriverLng],
        ],
        { padding: [50, 50] }
      );

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [customerLat, customerLng, initialDriverLat, initialDriverLng, order]);

  // Live Driver Movement Telemetry Simulation
  useEffect(() => {
    if (isDelivered || !mapInstanceRef.current || !driverMarkerRef.current) return;

    let step = 0;
    const totalSteps = 40;

    const interval = setInterval(() => {
      step = (step + 1) % totalSteps;
      const progress = step / totalSteps;

      // Interpolate position along line toward customer
      const currentLat = initialDriverLat + (customerLat - initialDriverLat) * (progress * 0.85);
      const currentLng = initialDriverLng + (customerLng - initialDriverLng) * (progress * 0.85);

      setDriverPos({ lat: currentLat, lng: currentLng });

      if (driverMarkerRef.current) {
        driverMarkerRef.current.setLatLng([currentLat, currentLng]);
      }

      if (routeLineRef.current) {
        routeLineRef.current.setLatLngs([
          [currentLat, currentLng],
          [customerLat, customerLng],
        ]);
      }

      const dist = getDistanceKm(currentLat, currentLng, customerLat, customerLng);
      setRemainingKm(dist);
      setEtaMinutes(Math.max(2, Math.round(dist * 4.5)));
    }, 2500);

    return () => clearInterval(interval);
  }, [isDelivered, initialDriverLat, initialDriverLng, customerLat, customerLng]);

  const fitMapBounds = () => {
    if (mapInstanceRef.current && driverPos) {
      mapInstanceRef.current.fitBounds(
        [
          [customerLat, customerLng],
          [driverPos.lat, driverPos.lng],
        ],
        { padding: [40, 40] }
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] w-full">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1B4324] text-white flex items-center justify-center shadow-xs">
            <Truck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Live Delivery Tracking
              </h3>
              <Badge
                className={
                  isDelivered
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-emerald-500 text-white animate-pulse"
                }
              >
                {isDelivered ? "Delivered" : "Driver On The Way"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Order {order?.orderNumber} • Destination GPS Relayed to Driver
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Interactive Map (Left/Top) & Telemetry Details (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
        {/* MAP COLUMN */}
        <div className="lg:col-span-7 xl:col-span-8 relative min-h-[360px] lg:min-h-[480px] bg-slate-100 dark:bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating ETA & Distance Pill */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-700 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#1B4324] dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Estimated Arrival
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                {isDelivered ? "Delivered" : `${etaMinutes} mins • ${remainingKm} km away`}
              </p>
            </div>
          </div>

          {/* Recenter Button */}
          <button
            onClick={fitMapBounds}
            className="absolute bottom-4 right-4 z-10 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#1B4324]" />
            <span>Fit Route</span>
          </button>
        </div>

        {/* TELEMETRY & HANDSHAKE OTP COLUMN */}
        <div className="lg:col-span-5 xl:col-span-4 p-5 lg:p-6 space-y-5 flex flex-col justify-between bg-[#FCFDFB] dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            {/* Delivery Verification OTP Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 dark:from-amber-950/40 dark:to-emerald-950/40 border border-amber-200 dark:border-amber-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                  <span>Secure Handshake OTP</span>
                </span>
                <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/60 px-2 py-0.5 rounded-full font-bold">
                  Doorstep Verification
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl py-3 px-4 border border-amber-200/90 dark:border-amber-700/60 flex items-center justify-between shadow-2xs">
                <span className="font-mono text-3xl font-black text-[#1B4324] dark:text-emerald-400 tracking-widest">
                  {order?.deliveryOtp || "4829"}
                </span>
                <button
                  onClick={() => setOtpInput(order?.deliveryOtp || "4829")}
                  className="text-xs text-[#1B4324] dark:text-emerald-400 font-bold hover:underline cursor-pointer bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800"
                >
                  Auto-fill OTP
                </button>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Share this 4-digit OTP with your driver upon physical arrival to complete delivery and release digital receipt.
              </p>
            </div>

            {/* Assigned Driver Profile */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Assigned Fleet Driver
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Logistics</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF5EB] dark:bg-emerald-950/80 border border-[#D3E3CE] dark:border-emerald-800 flex items-center justify-center font-bold text-[#1B4324] dark:text-emerald-400 text-lg shadow-2xs">
                  {order?.driverName ? order.driverName.charAt(0) : "R"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {order?.driverName || "Ramesh Verma"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {order?.vehicleNumber || "GJ-20-AB-4021"} • Electric Reefer
                  </p>
                </div>
                <a
                  href={`tel:${order?.driverPhone || "+919876543210"}`}
                  className="w-10 h-10 rounded-xl bg-[#1B4324] text-white flex items-center justify-center hover:bg-[#14341C] transition-colors cursor-pointer shadow-xs"
                  title="Call Driver"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>

              {/* Coordinates Relayed Note */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
                  <span>Customer GPS Location:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    {customerLat.toFixed(4)}° N, {customerLng.toFixed(4)}° E
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Address: {order?.shippingAddress}, {order?.city}
                </p>
              </div>
            </div>

            {/* OTP Verification Interactive Form */}
            {!isDelivered ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Verify Handshake OTP (Driver / Customer Handover)
                </span>

                {otpMessage && (
                  <p
                    className={`text-xs p-2 rounded-lg ${
                      otpMessage.includes("success")
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {otpMessage}
                  </p>
                )}

                <div className="flex gap-2">
                  <Input
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="h-10 text-center tracking-widest font-mono font-bold text-base rounded-xl bg-slate-50"
                  />
                  <Button
                    onClick={() => onVerifyOtp && onVerifyOtp(order?.id, otpInput)}
                    disabled={isVerifyingOtp || otpInput.trim().length !== 4}
                    className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs px-5 rounded-xl cursor-pointer shrink-0 font-semibold"
                  >
                    {isVerifyingOtp ? "Verifying..." : "Confirm Delivery"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">
                  Delivery Handshake Completed!
                </h4>
                <p className="text-[11px] text-emerald-800">
                  Driver verified OTP {order?.deliveryOtp}. Proof of delivery recorded on value chain ledger.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Total Paid: <strong className="text-slate-900">₹{order?.totalAmount}</strong>
            </span>
            <Button
              onClick={onClose}
              variant="outline"
              className="text-xs rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              Close Live Map
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
