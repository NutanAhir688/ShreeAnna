import { useEffect, useMemo, useState } from "react";

import FPOStats from "../components/FPOStats";
import FPOFilters from "../components/FPOFilters";
import FPOMemberTable from "../components/FPOMemberTable";

import { fpoApi } from "@/services/api";

function FPOManagement() {
  const [fpoMembers, setFpoMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [department, setDepartment] = useState("All");

  useEffect(() => {
    async function loadMembers() {
      try {
        const data = await fpoApi.getAll();
        if (Array.isArray(data)) setFpoMembers(data);
      } catch (err) {
        console.error("Error loading FPO members:", err);
        setFpoMembers([]);
      }
    }
    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.toLowerCase();

    return fpoMembers.filter((member) => {
      const matchesSearch =
        (member.name && member.name.toLowerCase().includes(query)) ||
        (member.role && member.role.toLowerCase().includes(query)) ||
        (member.department && member.department.toLowerCase().includes(query));

      const matchesRole = role === "All" || member.role === role;
      const matchesDepartment = department === "All" || member.department === department;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [fpoMembers, search, role, department]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          FPO Management
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage FPO members, operational roles and responsibilities.
        </p>
      </div>

      <FPOStats />

      <FPOFilters
        search={search}
        setSearch={setSearch}
        role={role}
        setRole={setRole}
        department={department}
        setDepartment={setDepartment}
      />

      <FPOMemberTable
        members={filteredMembers}
      />
    </div>
  );
}

export default FPOManagement;