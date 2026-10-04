import { useEffect, useMemo, useState } from "react";

import BuyerStats from "../components/BuyerStats";
import BuyerFilters from "../components/BuyerFilters";
import BuyerTable from "../components/BuyerTable";

import { buyersApi } from "@/services/api";

function Buyers() {
  const [buyerData, setBuyerData] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    async function loadBuyers() {
      try {
        const data = await buyersApi.getAll();
        if (Array.isArray(data)) setBuyerData(data);
      } catch (err) {
        console.error("Failed to load buyers:", err);
        setBuyerData([]);
      }
    }
    loadBuyers();
  }, []);

  const filteredBuyers = useMemo(() => {
    const query = search.toLowerCase();

    return buyerData.filter((buyer) => {
      const matchesSearch =
        (buyer.name && buyer.name.toLowerCase().includes(query)) ||
        (buyer.contactPerson && buyer.contactPerson.toLowerCase().includes(query)) ||
        (buyer.address && buyer.address.toLowerCase().includes(query));

      const matchesType = type === "All" || buyer.type === type;
      const matchesStatus = status === "All" || buyer.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [buyerData, search, type, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Buyer Management
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage processors and SHGs purchasing millet through the FPO.
        </p>
      </div>

      <BuyerStats />

      <BuyerFilters
        search={search}
        setSearch={setSearch}
        type={type}
        setType={setType}
        status={status}
        setStatus={setStatus}
      />

      <BuyerTable buyers={filteredBuyers} />
    </div>
  );
}

export default Buyers;