import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import OrderSummary from "../components/OrderSummary";
import BuyerDetails from "../components/BuyerDetails";
import OrderItemDetails from "../components/OrderItemDetails";
import OrderApproval from "../components/OrderApproval";

import { ordersApi } from "@/services/api";

function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await ordersApi.getById(id);
        if (data) setOrder(data);
      } catch (err) {
        console.error("Failed to load order details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  const [decision, setDecision] = useState("");
  const [remarks, setRemarks] = useState("");

  if (!order) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Order not found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            No order exists with ID {id}.
          </p>

          <Button
            className="mt-4"
            onClick={() =>
              navigate("/orders")
            }
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const handleDecision = () => {
    if (!decision) {
      return;
    }

    if (
      decision === "Rejected" &&
      !remarks.trim()
    ) {
      alert(
        "Please provide a reason for rejecting the order."
      );
      return;
    }

    console.log("Order decision:", {
      orderId: order.id,
      decision,
      remarks,
    });

    navigate("/orders");
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
              navigate("/orders")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Order Details
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review buyer request{" "}
                <span className="font-medium text-slate-700">
                  {order.id}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <OrderSummary order={order} />

      {/* Buyer + ordered stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BuyerDetails order={order} />

        <OrderItemDetails order={order} />
      </div>

      {/* Approval */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">
            FPO Approval
          </CardTitle>

          <p className="text-sm text-slate-500">
            Review the request before reserving stock for the
            buyer.
          </p>
        </CardHeader>

        <CardContent>
          <OrderApproval
            order={order}
            decision={decision}
            remarks={remarks}
            onDecisionChange={setDecision}
            onRemarksChange={setRemarks}
            onSubmit={handleDecision}
          />
        </CardContent>
      </Card>

      {/* Workflow */}
      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-slate-500" />

          <h2 className="text-sm font-semibold text-slate-900">
            Order Workflow
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <WorkflowStep
            label="Order Received"
            active
          />

          <WorkflowStep
            label="FPO Approval"
            active={
              order.status !== "Pending Approval"
            }
          />

          <WorkflowStep
            label="Stock Reserved"
            active={
              order.status === "Approved" ||
              order.status === "Completed"
            }
          />

          <WorkflowStep
            label="Dispatch"
            active={order.status === "Completed"}
          />
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({ label, active }) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            active
              ? "bg-emerald-500"
              : "bg-slate-300"
          }`}
        />

        <span
          className={`text-xs font-medium ${
            active
              ? "text-emerald-700"
              : "text-slate-500"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export default OrderDetails;