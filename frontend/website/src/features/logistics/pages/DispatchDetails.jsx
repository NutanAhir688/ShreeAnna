import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Truck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { logisticsApi } from "@/services/api";

function DispatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dispatch, setDispatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Stock Reserved");

  useEffect(() => {
    async function loadDispatch() {
      try {
        const data = await logisticsApi.getById(id);
        if (data) {
          setDispatch({
            id: data.dispatchCode || data.id,
            orderId: data.agreementId || data.id,
            buyerName: data.farmerOrProcessorName || "-",
            buyerType: data.processorType || "Buyer",
            millet: data.milletType || "-",
            grade: "Grade A",
            quantity: data.totalQuantityKg || 0,
            unit: "kg",
            deliveryLocation: data.destinationAddress || "-",
            warehouse: data.sourceAddress || "-",
            expectedDelivery: data.scheduledDate ? `${data.scheduledDate}` : "-",
            vehicleNumber: data.vehicleNumber,
            driverName: data.driverName,
            driverPhone: data.driverPhone,
            status: data.status || "Stock Reserved",
          });
          setStatus(data.status || "Stock Reserved");
        }
      } catch (err) {
        console.error("Error loading dispatch details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDispatch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold">
          Dispatch not found
        </h2>

        <button
          onClick={() => navigate("/dispatches")}
          className="mt-4 rounded-lg border px-4 py-2 text-sm"
        >
          Back to Dispatches
        </button>
      </div>
    );
  }

  const handleStatusUpdate = (nextStatus) => {
    setStatus(nextStatus);

    console.log("Dispatch status updated:", {
      dispatchId: dispatch.id,
      status: nextStatus,
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/dispatches")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Dispatches
      </button>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            {dispatch.id}
          </h1>

          <p className="text-sm text-muted-foreground">
            Order {dispatch.orderId}
          </p>
        </div>

        <span className="w-fit rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700">
          {status}
        </span>
      </div>

      {/* Shipment summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 lg:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Truck className="text-blue-600" size={20} />
            </div>

            <div>
              <h2 className="font-semibold">
                Shipment Details
              </h2>

              <p className="text-sm text-muted-foreground">
                Information about the current shipment
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Info label="Buyer" value={dispatch.buyerName} />
            <Info label="Buyer Type" value={dispatch.buyerType} />

            <Info label="Millet" value={dispatch.millet} />
            <Info
              label="Grade"
              value={dispatch.grade}
            />

            <Info
              label="Quantity"
              value={`${dispatch.quantity} ${dispatch.unit}`}
            />

            <Info
              label="Delivery Location"
              value={dispatch.deliveryLocation}
            />

            <Info
              label="Warehouse"
              value={dispatch.warehouse}
            />

            <Info
              label="Expected Delivery"
              value={dispatch.expectedDelivery || "Not scheduled"}
            />
          </div>
        </div>

        {/* Vehicle */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Transport Details
          </h2>

          <div className="mt-5 space-y-4">
            <Info
              label="Vehicle Number"
              value={dispatch.vehicleNumber || "Not assigned"}
            />

            <Info
              label="Driver"
              value={dispatch.driverName || "Not assigned"}
            />

            <Info
              label="Driver Phone"
              value={dispatch.driverPhone || "Not assigned"}
            />
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">
          Dispatch Workflow
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <WorkflowStep
            title="Stock Reserved"
            active={true}
          />

          <WorkflowStep
            title="Ready for Dispatch"
            active={[
              "Ready for Dispatch",
              "In Transit",
              "Delivered",
            ].includes(status)}
          />

          <WorkflowStep
            title="In Transit"
            active={[
              "In Transit",
              "Delivered",
            ].includes(status)}
          />

          <WorkflowStep
            title="Delivered"
            active={status === "Delivered"}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-3">
        {status === "Stock Reserved" && (
          <button
            onClick={() =>
              handleStatusUpdate("Ready for Dispatch")
            }
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Prepare Dispatch
          </button>
        )}

        {status === "Ready for Dispatch" && (
          <button
            onClick={() =>
              handleStatusUpdate("In Transit")
            }
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Mark as Dispatched
          </button>
        )}

        {status === "In Transit" && (
          <button
            onClick={() =>
              handleStatusUpdate("Delivered")
            }
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

function WorkflowStep({ title, active }) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-2">
        {active && (
          <CheckCircle2
            size={18}
            className="text-emerald-600"
          />
        )}

        <span
          className={
            active
              ? "font-medium text-emerald-700"
              : "text-muted-foreground"
          }
        >
          {title}
        </span>
      </div>
    </div>
  );
}

export default DispatchDetails;