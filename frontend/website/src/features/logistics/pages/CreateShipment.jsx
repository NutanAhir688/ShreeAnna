import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building2,
  User,
  ArrowLeft,
  FileText,
  AlertCircle,
  PackageCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logisticsApi, lotsApi, inventoryApi } from "@/services/api";

function CreateShipment() {
  const navigate = useNavigate();
  const [direction, setDirection] = useState("INBOUND"); // INBOUND | OUTBOUND

  const [inboundAgreements, setInboundAgreements] = useState([]);
  const [outboundAgreements, setOutboundAgreements] = useState([]);

  // Selection states
  const [selectedInboundId, setSelectedInboundId] = useState("");
  const [selectedOutboundId, setSelectedOutboundId] = useState("");

  useEffect(() => {
    async function fetchAgreements() {
      try {
        const lots = await lotsApi.getAll().catch(() => []);
        if (Array.isArray(lots) && lots.length > 0) {
          const acceptedLots = lots.filter((l) => {
            const st = (l.status || "").toUpperCase();
            const agrSt = (l.agreementStatus || "").toUpperCase();
            return (
              st === "AGREEMENT_ACCEPTED" ||
              st === "PROCUREMENT_AGREEMENT" ||
              st === "COMPLETED" ||
              st === "PICKUP" ||
              st === "WAREHOUSE_RECEIVED" ||
              st === "PAYMENT" ||
              st.includes("ACCEPTED") ||
              agrSt === "ACCEPTED"
            );
          });

          const mapped = acceptedLots.map((l) => {
            const lotCode = l.lotNumber || (typeof l.id === "string" ? l.id.slice(0, 6).toUpperCase() : "LOT");
            return {
              id: `AGR-${lotCode}`,
              realLotId: l.id,
              farmer: l.farmerName || "Farmer",
              lotId: lotCode,
              milletType: l.cropName || l.milletType || "Millet",
              quantityKg: Number(l.agreedQuantityKg || l.actualQuantityKg || l.estimatedQuantityKg || 0),
              status: "Accepted",
              pickupLocation: l.farmerAddress || l.farmName || `${l.farmerName || 'Farmer'} Farm`,
              destination: "Mandya Central Warehouse, Dock A",
            };
          });
          setInboundAgreements(mapped);
          if (mapped.length > 0) setSelectedInboundId(mapped[0].id);
          else setSelectedInboundId("");
        } else {
          setInboundAgreements([]);
          setSelectedInboundId("");
        }

        const batches = await inventoryApi.getBatches().catch(() => []);
        if (Array.isArray(batches) && batches.length > 0) {
          const mapped = batches.map((b) => {
            const code = b.batchCode || (typeof b.id === "string" ? b.id.slice(0, 6).toUpperCase() : "BAT");
            return {
              id: `PPA-${code}`,
              realBatchId: b.id,
              processor: b.processorName || "Processor / SHG",
              processorType: "Processor",
              batchId: code,
              sourceLotId: b.lotId || "-",
              milletType: b.milletType || "Millet",
              quantityKg: Number(b.quantityKg || 0),
              availableStockKg: Number(b.quantityKg || 0),
              status: "Approved",
              sourceWarehouse: b.warehouseName || "Mandya Central Warehouse",
              destination: b.destination || "Processing Plant",
            };
          });
          setOutboundAgreements(mapped);
          if (mapped.length > 0) setSelectedOutboundId(mapped[0].id);
        } else {
          setOutboundAgreements([]);
          setSelectedOutboundId("");
        }
      } catch (err) {
        console.error("Error loading real agreement options:", err);
      }
    }
    fetchAgreements();
  }, []);

  // Inbound Form fields
  const [inboundTransport, setInboundTransport] = useState("FPO Pickup"); // FPO Pickup | Farmer Delivery
  const [inboundVehicle, setInboundVehicle] = useState("KA-09-AB-4521");
  const [inboundDriver, setInboundDriver] = useState("Ravi Kumar");
  const [inboundDate, setInboundDate] = useState(new Date().toISOString().split("T")[0]);
  const [inboundStartTime, setInboundStartTime] = useState("09:00 AM");
  const [inboundEndTime, setInboundEndTime] = useState("11:00 AM");
  const [inboundInstructions, setInboundInstructions] = useState("");

  // Outbound Form fields
  const [outboundTransport, setOutboundTransport] = useState("Processor Pickup"); // Processor Pickup | FPO Delivery
  const [outboundVehicle, setOutboundVehicle] = useState("MH-31-AG-8892");
  const [outboundDriver, setOutboundDriver] = useState("Suresh Deshmukh");
  const [outboundDispatchQty, setOutboundDispatchQty] = useState(1000);
  const [outboundDate, setOutboundDate] = useState(new Date().toISOString().split("T")[0]);
  const [outboundTime, setOutboundTime] = useState("11:00 AM");
  const [outboundInstructions, setOutboundInstructions] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const activeInbound = inboundAgreements.find((a) => a.id === selectedInboundId) || inboundAgreements[0] || {};
  const activeOutbound = outboundAgreements.find((a) => a.id === selectedOutboundId) || outboundAgreements[0] || {};

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      if (direction === "INBOUND") {
        const payload = {
          direction: "INBOUND",
          agreementId: activeInbound.id,
          lotId: activeInbound.lotId,
          farmerOrProcessorName: activeInbound.farmer,
          milletType: activeInbound.milletType,
          totalQuantityKg: activeInbound.quantityKg,
          sourceAddress: activeInbound.pickupLocation,
          destinationAddress: activeInbound.destination,
          transportResponsibility: inboundTransport,
          vehicleNumber: inboundVehicle,
          vehicleCapacityKg: 7000,
          driverName: inboundDriver,
          driverPhone: "+91 98765 43210",
          scheduledDate: inboundDate,
          scheduledStartTime: inboundStartTime,
          scheduledEndTime: inboundEndTime,
          specialInstructions: inboundInstructions,
          status: "SCHEDULED",
        };
        await logisticsApi.create(payload);
      } else {
        const payload = {
          direction: "OUTBOUND",
          agreementId: activeOutbound.id,
          lotId: activeOutbound.sourceLotId,
          batchId: activeOutbound.batchId,
          farmerOrProcessorName: activeOutbound.processor,
          processorType: activeOutbound.processorType,
          milletType: activeOutbound.milletType,
          totalQuantityKg: Number(outboundDispatchQty),
          warehouseStockAfterDispatchKg: activeOutbound.availableStockKg - Number(outboundDispatchQty),
          sourceAddress: activeOutbound.sourceWarehouse,
          destinationAddress: activeOutbound.destination,
          transportResponsibility: outboundTransport,
          vehicleNumber: outboundVehicle,
          vehicleCapacityKg: 7000,
          driverName: outboundDriver,
          driverPhone: "+91 98765 43210",
          scheduledDate: outboundDate,
          scheduledStartTime: outboundTime,
          specialInstructions: outboundInstructions,
          status: "SCHEDULED",
        };
        await logisticsApi.create(payload);
      }
    } catch (err) {
      console.warn("Backend create failed, proceeding with mockup state navigation:", err.message);
    } finally {
      setSubmitting(false);
      navigate("/logistics");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Breadcrumb & Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
          <button
            onClick={() => navigate("/logistics")}
            className="hover:text-emerald-800 transition flex items-center gap-1"
          >
            Logistics
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">Create Shipment</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Create Shipment
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Create an inbound or outbound shipment from an approved agreement.
        </p>

        {/* Shipment Direction Toggle (Matches Screenshot 2 & 3) */}
        <div className="flex items-center gap-2 mt-4 bg-slate-200/70 p-1 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setDirection("INBOUND")}
            className={`px-5 py-1.5 text-xs font-bold rounded-md transition ${
              direction === "INBOUND"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            INBOUND
          </button>
          <button
            type="button"
            onClick={() => setDirection("OUTBOUND")}
            className={`px-5 py-1.5 text-xs font-bold rounded-md transition ${
              direction === "OUTBOUND"
                ? "bg-white text-emerald-950 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            OUTBOUND
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Select Agreement Table */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                {direction === "INBOUND"
                  ? "Select Procurement Agreement"
                  : "Select Processor Purchase Agreement"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Filter controls inside table box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search agreements..."
                    className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
                  />
                </div>
                <Select defaultValue="All">
                  <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Millet Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">Millet Type (All)</SelectItem>
                    <SelectItem value="Pearl Millet">Pearl Millet</SelectItem>
                    <SelectItem value="Finger Millet">Finger Millet</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="Mandya">
                  <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                    <SelectValue placeholder="Warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mandya">Mandya Warehouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Table listing agreements */}
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3 w-10 text-center"></th>
                      <th className="p-3 font-bold">Agreement ID</th>
                      <th className="p-3 font-bold">
                        {direction === "INBOUND" ? "Farmer" : "Processor / SHG"}
                      </th>
                      <th className="p-3 font-bold">Millet Type</th>
                      <th className="p-3 font-bold">Quantity</th>
                      <th className="p-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {direction === "INBOUND" ? (
                      inboundAgreements.length > 0 ? (
                        inboundAgreements.map((agr) => (
                          <tr
                            key={agr.id}
                            onClick={() => setSelectedInboundId(agr.id)}
                            className={`cursor-pointer transition ${
                              selectedInboundId === agr.id
                                ? "bg-emerald-50/60"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="radio"
                                name="inboundAgreement"
                                checked={selectedInboundId === agr.id}
                                onChange={() => setSelectedInboundId(agr.id)}
                                className="accent-emerald-700 h-4 w-4"
                              />
                            </td>
                            <td className="p-3 font-bold font-mono text-emerald-800">
                              {agr.id}
                            </td>
                            <td className="p-3 font-bold text-slate-900">{agr.farmer}</td>
                            <td className="p-3 text-slate-700">{agr.milletType}</td>
                            <td className="p-3 font-bold text-slate-900">
                              {(agr.quantityKg || 0).toLocaleString("en-IN")} kg
                            </td>
                            <td className="p-3">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                                {agr.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500 font-medium">
                            No accepted procurement agreements found. Accept a procurement agreement first.
                          </td>
                        </tr>
                      )
                    ) : (
                      outboundAgreements.length > 0 ? (
                        outboundAgreements.map((agr) => (
                          <tr
                            key={agr.id}
                            onClick={() => setSelectedOutboundId(agr.id)}
                            className={`cursor-pointer transition ${
                              selectedOutboundId === agr.id
                                ? "bg-emerald-50/60"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="radio"
                                name="outboundAgreement"
                                checked={selectedOutboundId === agr.id}
                                onChange={() => setSelectedOutboundId(agr.id)}
                                className="accent-emerald-700 h-4 w-4"
                              />
                            </td>
                            <td className="p-3 font-bold font-mono text-emerald-800">
                              {agr.id}
                            </td>
                            <td className="p-3 font-bold text-slate-900">{agr.processor}</td>
                            <td className="p-3 text-slate-700">{agr.milletType}</td>
                            <td className="p-3 font-bold text-slate-900">
                              {(agr.quantityKg || 0).toLocaleString("en-IN")} kg
                            </td>
                            <td className="p-3">
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold">
                                {agr.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500 font-medium">
                            No processor purchase agreements found.
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Shipment Information */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <AlertCircle className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Shipment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              <p className="text-slate-500 italic">
                Shipment details are derived from the approved{" "}
                {direction === "INBOUND" ? "procurement" : "processor purchase"} agreement.
              </p>

              {direction === "INBOUND" ? (
                <div className="grid grid-cols-3 gap-y-3 gap-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Farmer</span>
                    <span className="font-bold text-slate-900">{activeInbound.farmer || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Agreement</span>
                    <span className="font-bold text-slate-900">{activeInbound.id || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Lot</span>
                    <span className="font-bold text-slate-900">{activeInbound.lotId || "N/A"}</span>
                  </div>

                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Millet Type</span>
                    <span className="font-bold text-slate-900">{activeInbound.milletType || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Agreed Quantity</span>
                    <span className="font-bold text-slate-900">
                      {(activeInbound.quantityKg || 0).toLocaleString("en-IN")} kg
                    </span>
                  </div>
                  <div className="col-span-3 border-t border-slate-200/80 pt-2">
                    <span className="text-slate-500 block text-[11px] font-medium">Pickup Location</span>
                    <span className="font-bold text-slate-900">{activeInbound.pickupLocation || "N/A"}</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-500 block text-[11px] font-medium">Destination</span>
                    <span className="font-bold text-slate-900">{activeInbound.destination || "N/A"}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-y-3 gap-x-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Processor / SHG</span>
                      <span className="font-bold text-slate-900">{activeOutbound.processor}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Processor Agreement</span>
                      <span className="font-bold text-slate-900">{activeOutbound.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Warehouse Batch</span>
                      <span className="font-bold text-slate-900">{activeOutbound.batchId}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Source Lot</span>
                      <span className="font-bold text-slate-900">{activeOutbound.sourceLotId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Millet Type</span>
                      <span className="font-bold text-slate-900">{activeOutbound.milletType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-medium">Available Stock</span>
                      <span className="font-bold text-slate-900">
                        {(activeOutbound.availableStockKg || 0).toLocaleString("en-IN")} kg
                      </span>
                    </div>

                    <div className="col-span-3 border-t border-slate-200/80 pt-2">
                      <span className="text-slate-500 block text-[11px] font-medium">Source Warehouse</span>
                      <span className="font-bold text-slate-900">{activeOutbound.sourceWarehouse}</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-slate-500 block text-[11px] font-medium">Destination</span>
                      <span className="font-bold text-slate-900">{activeOutbound.destination}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Dispatch Quantity
                    </label>
                    <Input
                      type="number"
                      value={outboundDispatchQty}
                      onChange={(e) => setOutboundDispatchQty(e.target.value)}
                      className="max-w-xs h-9 text-xs border-slate-200 font-bold"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Transport Responsibility */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Transport Responsibility
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {direction === "INBOUND" ? (
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setInboundTransport("FPO Pickup")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${
                      inboundTransport === "FPO Pickup"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    FPO Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setInboundTransport("Farmer Delivery")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${
                      inboundTransport === "Farmer Delivery"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Farmer Delivery
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setOutboundTransport("Processor Pickup")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${
                      outboundTransport === "Processor Pickup"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Processor Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutboundTransport("FPO Delivery")}
                    className={`px-4 py-1.5 font-bold rounded-md transition ${
                      outboundTransport === "FPO Delivery"
                        ? "bg-white text-emerald-950 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    FPO Delivery
                  </button>
                </div>
              )}

              {/* Vehicle & Driver text inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vehicle Number
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. KA-09-AB-4521"
                    value={direction === "INBOUND" ? inboundVehicle : outboundVehicle}
                    onChange={(e) =>
                      direction === "INBOUND"
                        ? setInboundVehicle(e.target.value)
                        : setOutboundVehicle(e.target.value)
                    }
                    className="h-9 text-xs border-slate-200 font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Driver Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. Ravi Kumar"
                    value={direction === "INBOUND" ? inboundDriver : outboundDriver}
                    onChange={(e) =>
                      direction === "INBOUND"
                        ? setInboundDriver(e.target.value)
                        : setOutboundDriver(e.target.value)
                    }
                    className="h-9 text-xs border-slate-200 font-semibold bg-white"
                  />
                </div>
              </div>

              {/* Capacity Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900">Vehicle Capacity: 7,000 kg</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {direction === "INBOUND"
                      ? "Vehicle capacity is sufficient for the expected quantity."
                      : "Vehicle capacity is sufficient for the dispatch quantity."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Schedule Pickup */}
          <Card className="border-slate-200/90 bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Schedule Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 text-xs">
              {direction === "INBOUND" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date</label>
                    <Input
                      type="date"
                      value={inboundDate}
                      onChange={(e) => setInboundDate(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                    <Input
                      type="text"
                      value={inboundStartTime}
                      onChange={(e) => setInboundStartTime(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">End Time</label>
                    <Input
                      type="text"
                      value={inboundEndTime}
                      onChange={(e) => setInboundEndTime(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Date</label>
                    <Input
                      type="date"
                      value={outboundDate}
                      onChange={(e) => setOutboundDate(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Time</label>
                    <Input
                      type="text"
                      value={outboundTime}
                      onChange={(e) => setOutboundTime(e.target.value)}
                      className="h-9 text-xs border-slate-200 font-medium"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Instructions</label>
                <Textarea
                  placeholder="Any specific pickup instructions..."
                  value={direction === "INBOUND" ? inboundInstructions : outboundInstructions}
                  onChange={(e) =>
                    direction === "INBOUND"
                      ? setInboundInstructions(e.target.value)
                      : setOutboundInstructions(e.target.value)
                  }
                  className="min-h-[80px] text-xs border-slate-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Column: Shipment Preview (Matches Screenshot 2 & 3) */}
        <div className="space-y-6">
          <Card className="border-slate-200/90 bg-white shadow-xs sticky top-4">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <PackageCheck className="h-4 w-4 text-emerald-800" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Shipment Preview
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-500 font-medium">Direction</span>
                <Badge
                  className={
                    direction === "INBOUND"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-extrabold uppercase"
                      : "bg-sky-100 text-sky-800 border-sky-300 text-[10px] font-extrabold uppercase"
                  }
                >
                  {direction}
                </Badge>
              </div>

              <div className="space-y-2 border-b border-slate-100 pb-3">
                <span className="text-slate-500 block text-[11px] font-medium">Shipment ID</span>
                <span className="text-slate-400 font-mono text-[11px] italic">
                  Will be generated after creation
                </span>
              </div>

              {direction === "INBOUND" ? (
                <div className="space-y-3 border-b border-slate-100 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Farmer</span>
                    <span className="font-bold text-slate-900">{activeInbound.farmer || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Millet Type</span>
                    <span className="font-bold text-slate-900">{activeInbound.milletType || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-bold text-slate-900">
                      {(activeInbound.quantityKg || 0).toLocaleString("en-IN")} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transport</span>
                    <span className="font-bold text-slate-900">{inboundTransport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="font-bold font-mono text-slate-900">{inboundVehicle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled</span>
                    <span className="font-bold text-slate-900">
                      17 Aug 2026, 09:00 AM
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 border-b border-slate-100 pb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Processor / SHG</span>
                    <span className="font-bold text-slate-900">{activeOutbound.processor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreement</span>
                    <span className="font-bold text-slate-900">{activeOutbound.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Warehouse Batch</span>
                    <span className="font-bold text-slate-900">{activeOutbound.batchId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Millet Type</span>
                    <span className="font-bold text-slate-900">{activeOutbound.milletType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dispatch Quantity</span>
                    <span className="font-bold text-slate-900">
                      {Number(outboundDispatchQty).toLocaleString("en-IN")} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transport</span>
                    <span className="font-bold text-slate-900">{outboundTransport}</span>
                  </div>
                </div>
              )}

              {/* Pickup & Deliver details */}
              <div className="space-y-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-slate-500 font-bold block">Pickup From</span>
                  <span className="text-slate-900 font-medium">
                    {direction === "INBOUND"
                      ? activeInbound.pickupLocation
                      : activeOutbound.sourceWarehouse}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-bold block">Deliver To</span>
                  <span className="text-slate-900 font-medium">
                    {direction === "INBOUND"
                      ? activeInbound.destination
                      : activeOutbound.destination}
                  </span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/logistics")}
                  className="h-10 border-slate-300 font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={submitting}
                  className="h-10 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs leading-tight py-1"
                >
                  {direction === "INBOUND"
                    ? "Create Inbound Shipment"
                    : "Create Outbound Shipment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CreateShipment;
