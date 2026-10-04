import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import OrderStats from "../components/OrderStats";
import OrderFilters from "../components/OrderFilters";
import OrdersTable from "../components/OrdersTable";

import { ordersApi } from "@/services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [buyerType, setBuyerType] = useState("all");

  useEffect(() => {
    async function loadOrders() {
      try {
        const data = await ordersApi.getAll();
        if (Array.isArray(data)) setOrders(data);
      } catch (err) {
        console.error("Error loading orders:", err);
        setOrders([]);
      }
    }
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const query = search.toLowerCase().trim();

      const searchMatch =
        query === "" ||
        (order.id && order.id.toLowerCase().includes(query)) ||
        (order.lotId && order.lotId.toLowerCase().includes(query)) ||
        (order.buyerName && order.buyerName.toLowerCase().includes(query)) ||
        (order.millet && order.millet.toLowerCase().includes(query));

      const statusMatch = status === "all" || order.status === status;
      const buyerMatch = buyerType === "all" || order.buyerType === buyerType;

      return searchMatch && statusMatch && buyerMatch;
    });
  }, [orders, search, status, buyerType]);

  const handleReset = () => {
    setSearch("");
    setStatus("all");
    setBuyerType("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Buyer Orders
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Review and manage purchase requests from processors
          and SHGs.
        </p>
      </div>

      {/* Stats */}
      <OrderStats orders={orders} />

      {/* Filters */}
      <OrderFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        buyerType={buyerType}
        setBuyerType={setBuyerType}
        onReset={handleReset}
      />

      {/* Table */}
      <OrdersTable
        orders={filteredOrders}
        onView={(orderId) =>
          navigate(`/orders/${orderId}`)
        }
      />
    </div>
  );
}

export default Orders;