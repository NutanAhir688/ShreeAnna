import {
  ArrowLeft,
  Building2,
  CircleDollarSign,
  Factory,
  Mail,
  MapPin,
  Phone,
  ShoppingCart,
  User,
  UsersRound,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { buyersApi } from "@/services/api";

function BuyerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [buyer, setBuyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuyer() {
      try {
        const data = await buyersApi.getById(id);
        if (data) setBuyer(data);
      } catch (err) {
        console.error("Failed to fetch buyer details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBuyer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="font-semibold">
          Buyer not found
        </h2>

        <button
          onClick={() => navigate("/buyers")}
          className="mt-4 rounded-lg border px-4 py-2 text-sm"
        >
          Back to Buyers
        </button>
      </div>
    );
  }

  const TypeIcon =
    buyer.type === "Processor"
      ? Factory
      : UsersRound;

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/buyers")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to Buyers
      </button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-muted p-3">
            <Building2 size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">
              {buyer.name}
            </h1>

            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <TypeIcon size={15} />
              {buyer.type} · {buyer.id}
            </div>
          </div>
        </div>

        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
          {buyer.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          icon={ShoppingCart}
          label="Total Orders"
          value={buyer.ordersCount}
        />

        <SummaryCard
          icon={CircleDollarSign}
          label="Total Purchase"
          value={`₹${buyer.totalPurchase.toLocaleString()}`}
        />

        <SummaryCard
          icon={Building2}
          label="Buyer Type"
          value={buyer.type}
        />
      </div>

      {/* Organization */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Organization Details
          </h2>

          <div className="mt-5 space-y-5">
            <Info
              icon={Building2}
              label="Organization"
              value={buyer.name}
            />

            <Info
              icon={TypeIcon}
              label="Type"
              value={buyer.type}
            />

            <Info
              icon={User}
              label="Contact Person"
              value={buyer.contactPerson}
            />

            <Info
              icon={Phone}
              label="Phone"
              value={buyer.phone}
            />

            <Info
              icon={Mail}
              label="Email"
              value={buyer.email}
            />
          </div>
        </div>

        {/* Registration */}
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Registration & Location
          </h2>

          <div className="mt-5 space-y-5">
            <Info
              icon={Building2}
              label="Registration Number"
              value={buyer.registrationNumber}
            />

            <Info
              icon={Building2}
              label="Registration Type"
              value={buyer.registrationType}
            />

            <Info
              icon={MapPin}
              label="Address"
              value={buyer.address}
            />

            <Info
              icon={Building2}
              label="Joined Date"
              value={buyer.joinedDate}
            />

            <Info
              icon={ShoppingCart}
              label="Last Order"
              value={buyer.lastOrderDate}
            />
          </div>
        </div>
      </div>

      {/* Order history */}
      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Order History
            </h2>

            <p className="text-sm text-muted-foreground">
              Recent purchases from ShreeAnna marketplace.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/orders")
            }
            className="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            View All Orders
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left">
                  Order
                </th>

                <th className="px-4 py-3 text-left">
                  Millet
                </th>

                <th className="px-4 py-3 text-left">
                  Quantity
                </th>

                <th className="px-4 py-3 text-left">
                  Amount
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b">
                <td className="px-4 py-4">
                  ORD-001
                </td>

                <td className="px-4 py-4">
                  Finger Millet
                </td>

                <td className="px-4 py-4">
                  500 kg
                </td>

                <td className="px-4 py-4">
                  ₹24,000
                </td>

                <td className="px-4 py-4">
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">
                    Approved
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-muted p-2">
          <Icon size={18} />
        </div>

        <span className="text-sm text-muted-foreground">
          {label}
        </span>
      </div>

      <p className="mt-4 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex gap-3">
      <div className="rounded-lg bg-muted p-2">
        <Icon size={16} />
      </div>

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

export default BuyerDetails;