import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { settlementsApi } from "@/services/api";

function SettlementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Pending Settlement");

  useEffect(() => {
    async function loadSettlement() {
      try {
        const data = await settlementsApi.getById(id);
        if (data) {
          setSettlement(data);
          setStatus(data.status || "Pending Settlement");
        }
      } catch (err) {
        console.error("Failed to fetch settlement details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettlement();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="font-semibold">
          Settlement not found
        </h2>

        <button
          onClick={() => navigate("/settlements")}
          className="mt-4 rounded-lg border px-4 py-2 text-sm"
        >
          Back to Settlements
        </button>
      </div>
    );
  }

  const handlePayment = () => {
    setStatus("Paid");

    console.log("Settlement payment processed:", {
      settlementId: settlement.id,
      orderId: settlement.orderId,
      amount: settlement.finalAmount,
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/settlements")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Settlements
      </button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            {settlement.id}
          </h1>

          <p className="text-sm text-muted-foreground">
            Order {settlement.orderId}
          </p>
        </div>

        <span className="w-fit rounded-full bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700">
          {status}
        </span>
      </div>

      {/* Amount */}
      <div className="rounded-xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <CircleDollarSign
              size={22}
              className="text-emerald-600"
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Settlement Amount
            </p>

            <p className="text-3xl font-semibold">
              ₹{settlement.finalAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Buyer + farmer */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Buyer Details
          </h2>

          <div className="mt-5 space-y-4">
            <Info
              label="Buyer"
              value={settlement.buyerName}
              icon={User}
            />

            <Info
              label="Buyer Type"
              value={settlement.buyerType}
              icon={User}
            />

            <Info
              label="Order"
              value={settlement.orderId}
              icon={CircleDollarSign}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Farmer Details
          </h2>

          <div className="mt-5 space-y-4">
            <Info
              label="Farmer"
              value={settlement.farmerName}
              icon={User}
            />

            <Info
              label="Farmer ID"
              value={settlement.farmerId}
              icon={User}
            />

            <Info
              label="Procurement Lot"
              value={settlement.lotId}
              icon={CircleDollarSign}
            />
          </div>
        </div>
      </div>

      {/* Calculation */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">
          Settlement Calculation
        </h2>

        <div className="mt-5 space-y-3">
          <Row
            label={`${settlement.quantity} kg × ₹${settlement.pricePerKg}/kg`}
            value={settlement.grossAmount}
          />

          <Row
            label="Procurement Amount"
            value={settlement.procurementAmount}
          />

          <Row
            label="FPO Margin"
            value={settlement.fpoMargin}
          />

          <Row
            label="Transport Cost"
            value={settlement.transportCost}
          />

          <Row
            label="Other Charges"
            value={settlement.otherCharges}
          />

          <div className="border-t pt-3">
            <Row
              label="Final Settlement"
              value={settlement.finalAmount}
              bold
            />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">
          Payment
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Info
            label="Payment Method"
            value={settlement.paymentMethod}
          />

          <Info
            label="Transaction ID"
            value={
              settlement.transactionId ||
              "Not generated"
            }
          />

          <Info
            label="Payment Date"
            value={
              settlement.paymentDate ||
              "Not paid"
            }
          />

          <Info
            label="Delivery Date"
            value={
              settlement.deliveryDate ||
              "Not delivered"
            }
          />
        </div>

        {status === "Pending Settlement" && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handlePayment}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              <CheckCircle2 size={16} />
              Process Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="flex gap-3">
      {Icon && (
        <div className="mt-0.5 rounded-lg bg-muted p-2">
          <Icon size={16} />
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium">
          {value}
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          bold
            ? "font-semibold"
            : "text-sm text-muted-foreground"
        }
      >
        {label}
      </span>

      <span
        className={
          bold
            ? "text-lg font-semibold"
            : "text-sm font-medium"
        }
      >
        ₹{value.toLocaleString()}
      </span>
    </div>
  );
}

export default SettlementDetails;