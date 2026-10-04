import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { fpoApi } from "@/services/api";

function FPOMemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMember() {
      try {
        const data = await fpoApi.getById(id);
        if (data) setMember(data);
      } catch (err) {
        console.error("Failed to fetch FPO member details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="font-semibold">
          FPO member not found
        </h2>

        <button
          onClick={() => navigate("/fpo")}
          className="mt-4 rounded-lg border px-4 py-2 text-sm"
        >
          Back to FPO Management
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/fpo")}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} />
        Back to FPO Management
      </button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-muted p-3">
            <User size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold">
              {member.name}
            </h1>

            <p className="text-sm text-muted-foreground">
              {member.id} · {member.role}
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
          {member.status}
        </span>
      </div>

      {/* Information */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Member Information
          </h2>

          <div className="mt-5 space-y-5">
            <Info
              icon={User}
              label="Name"
              value={member.name}
            />

            <Info
              icon={BriefcaseBusiness}
              label="Role"
              value={member.role}
            />

            <Info
              icon={Building2}
              label="Department"
              value={member.department}
            />

            <Info
              icon={MapPin}
              label="Location"
              value={member.location}
            />

            <Info
              icon={MapPin}
              label="Assigned Area"
              value={member.assignedArea}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">
            Contact Information
          </h2>

          <div className="mt-5 space-y-5">
            <Info
              icon={Phone}
              label="Phone"
              value={member.phone}
            />

            <Info
              icon={Mail}
              label="Email"
              value={member.email}
            />

            <Info
              icon={BriefcaseBusiness}
              label="Joined Date"
              value={member.joinedDate}
            />
          </div>
        </div>
      </div>

      {/* Responsibilities */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">
          Responsibilities
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Operational responsibilities assigned to this member.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {member.responsibilities.map(
            (responsibility) => (
              <div
                key={responsibility}
                className="rounded-lg border bg-muted/20 p-4"
              >
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness
                    size={16}
                    className="text-muted-foreground"
                  />

                  <span className="text-sm font-medium">
                    {responsibility}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
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

export default FPOMemberDetails;