import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  IndianRupee,
  Send,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPayment() {
      try {
        const lot = await lotsApi.getById(id);
        if (lot) {
          setPayment({
            id: `PAY-${lot.id}`,
            lotId: lot.lotCode || lot.id,
            farmerId: lot.farmerId || "-",
            farmerName: lot.farmerName || "Farmer",
            totalAmount: lot.totalAmount || (lot.estimatedQuantityKg || 0) * (lot.unitPrice || 35),
            status: lot.paymentStatus || "Pending",
            paymentMethod: "Bank Transfer",
            transactionId: lot.transactionId || null,
            paymentDate: lot.paymentDate || null,
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
    paymentMethod:
      payment?.paymentMethod || "Bank Transfer",
  });

  if (!payment) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Payment not available
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            No payment record exists for lot {id}.
          </p>

          <Button
            className="mt-4"
            onClick={() =>
              navigate("/procurement-lots")
            }
          >
            Back to Procurement
          </Button>
        </div>
      </div>
    );
  }

  const isPaid = payment.status === "Paid";

  const handleProcessPayment = () => {
    console.log("Payment processed:", {
      paymentId: payment.id,
      lotId: payment.lotId,
      farmerId: payment.farmerId,
      amount: payment.totalAmount,
      paymentMethod: form.paymentMethod,
    });

    navigate(`/procurement-lots/${payment.lotId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Button
            variant="ghost"
            className="-ml-3 mb-2"
            onClick={() =>
              navigate(
                `/procurement-lots/${payment.lotId}`
              )
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Lot
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
                Farmer payment for procurement lot{" "}
                <span className="font-medium text-slate-700">
                  {payment.lotId}
                </span>
              </p>
            </div>
          </div>
        </div>

        {!isPaid && (
          <Button onClick={handleProcessPayment}>
            <Send className="mr-2 h-4 w-4" />
            Process Payment
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
            Confirm the payment method before processing
            the farmer's payment.
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
                Transaction ID:{" "}
                {payment.transactionId}
              </p>

              <p className="text-sm text-emerald-700">
                Payment Date:{" "}
                {payment.paymentDate}
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
              Verify the farmer and payment details before
              processing.
            </p>
          </div>

          <Button onClick={handleProcessPayment}>
            <Send className="mr-2 h-4 w-4" />
            Process ₹
            {payment.totalAmount.toLocaleString("en-IN")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default PaymentProcessing;