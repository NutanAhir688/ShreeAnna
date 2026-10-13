import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  Send,
  Loader2,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import PaymentSummary from "../components/PaymentSummary";
import FarmerPaymentDetails from "../components/FarmerPaymentDetails";
import PaymentForm from "../components/PaymentForm";

import { settlementsApi, lotsApi } from "@/services/api";

function PaymentProcessing() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [payment, setPayment] = useState(null);
  const [settlementRecord, setSettlementRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadPayment() {
      try {
        const [lot, allSettlements] = await Promise.all([
          lotsApi.getById(id),
          settlementsApi.getAll(),
        ]);

        if (lot) {
          const qty = lot.actualQuantityKg ?? lot.agreedQuantityKg ?? lot.estimatedQuantityKg ?? 0;
          const rate = lot.offeredPricePerKg ?? 0;
          const total = qty * rate;

          // Find associated settlement if any
          const matchingSettlement = Array.isArray(allSettlements)
            ? allSettlements.find((s) => s.lotId === lot.lotNumber || s.id === lot.id)
            : null;

          if (matchingSettlement) {
            setSettlementRecord(matchingSettlement);
          }

          setPayment({
            id: matchingSettlement?.settlementCode || `SET-${lot.lotNumber}`,
            settlementId: matchingSettlement?.id || lot.id,
            lotId: lot.lotNumber || lot.id,
            farmerId: lot.farmerId,
            farmerName: lot.farmerName,
            totalAmount: matchingSettlement ? matchingSettlement.finalAmount : total,
            status: matchingSettlement ? matchingSettlement.status : (lot.status === "STORED" ? "Pending Settlement" : lot.status),
            paymentMethod: matchingSettlement?.paymentMethod || "Razorpay (MockGateway)",
            transactionId: matchingSettlement?.transactionId || null,
            paymentDate: matchingSettlement?.paymentDate || null,
          });
        }
      } catch (err) {
        console.error("Error loading payment data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPayment();
  }, [id]);

  const [form, setForm] = useState({
    paymentMethod: "Razorpay (MockGateway)",
  });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Payment record not found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            No procurement lot record exists for {id}.
          </p>

          <Button
            className="mt-4"
            onClick={() => navigate("/settlements")}
          >
            Back to Settlements
          </Button>
        </div>
      </div>
    );
  }

  const isPaid = payment.status === "Paid" || payment.status === "Completed";

  const handleProcessPayment = async () => {
    try {
      setProcessing(true);
      const targetId = settlementRecord?.id || payment.settlementId;
      const res = await settlementsApi.processPayment(targetId, {
        paymentMethod: form.paymentMethod || "Razorpay (MockGateway)",
        simulateSuccess: true,
      });

      setPayment((prev) => ({
        ...prev,
        status: "Paid",
        transactionId: res.transactionId,
        paymentDate: res.paymentDate,
      }));
    } catch (err) {
      console.error("Payment processing failed:", err);
      alert("Failed to process payment via MockGateway: " + (err.message || "Unknown error"));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            variant="ghost"
            className="-ml-3 mb-2"
            onClick={() => navigate("/settlements")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settlements
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <IndianRupee className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Payment Processing
                </h1>

                <Badge
                  className={
                    isPaid
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  }
                >
                  {payment.status}
                </Badge>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Farmer DBT payout for procurement lot{" "}
                <span className="font-medium text-slate-700">
                  {payment.lotId}
                </span>
              </p>
            </div>
          </div>
        </div>

        {!isPaid && (
          <Button onClick={handleProcessPayment} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            {processing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Process Payment (Razorpay MockGateway)
          </Button>
        )}
      </div>

      {/* Summary */}
      <PaymentSummary payment={payment} />

      {/* Farmer */}
      <FarmerPaymentDetails payment={payment} />

      {/* Payment Details */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">
            Payment Details
          </CardTitle>

          <p className="text-sm text-slate-500">
            Confirm the payment method before processing the farmer's DBT payout.
          </p>
        </CardHeader>

        <CardContent>
          <PaymentForm
            values={form}
            onChange={setForm}
          />
        </CardContent>
      </Card>

      {/* Paid information */}
      {isPaid ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />

            <div>
              <p className="font-medium text-emerald-900">
                Payment completed
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                Transaction ID: {payment.transactionId}
              </p>

              <p className="text-sm text-emerald-700">
                Payment Date: {payment.paymentDate}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div>
            <p className="font-medium text-amber-900">
              Payment ready
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Disburse direct benefit transfer to {payment.farmerName}.
            </p>
          </div>

          <Button onClick={handleProcessPayment} disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Process ₹{Number(payment.totalAmount || 0).toLocaleString("en-IN")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default PaymentProcessing;