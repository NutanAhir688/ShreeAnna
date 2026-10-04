import {
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { Button } from "@/components/ui/button";

import FarmerStats from "../components/FarmerStats";
import FarmerProfile from "../components/FarmerProfile";
import FarmerFarms from "../components/FarmerFarms";
import FarmerProcurement from "../components/FarmerProcurement";
import FarmerActivity from "../components/FarmerActivity";

import { farmersApi } from "@/services/api";

function FarmerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFarmer() {
      try {
        const data = await farmersApi.getById(id);
        if (data) setFarmer(data);
      } catch (err) {
        console.error("Error loading farmer details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFarmer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="space-y-4">

        <h1 className="text-2xl font-bold">
          Farmer not found
        </h1>

        <Button
          onClick={() => navigate("/farmers")}
        >
          Back to Farmers
        </Button>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/farmers")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>

            <h1 className="text-2xl font-bold tracking-tight">
              {farmer.name}
            </h1>

            <p className="text-sm text-muted-foreground">
              Farmer ID: {farmer.id}
            </p>

          </div>

        </div>


        <Button
          onClick={() =>
            navigate(`/farmers/${farmer.id}/edit`)
          }
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Farmer
        </Button>

      </div>


      {/* Stats */}
      <FarmerStats farmer={farmer} />


      {/* Profile */}
      <FarmerProfile farmer={farmer} />


      {/* Farms */}
      <FarmerFarms
        farmer={farmer}
        onFarmClick={(farm) => {
          if (
            farm.status === "Pending Verification" ||
            farm.status === "Under Review"
          ) {
            navigate(`/farm-verification/${farm.id}`);
          }
        }}
      />


      {/* Procurement */}
      <FarmerProcurement farmer={farmer} />


      {/* Activity */}
      <FarmerActivity farmer={farmer} />

    </div>
  );
}

export default FarmerDetails;