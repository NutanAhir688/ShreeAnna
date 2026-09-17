import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { farmersApi, farmsApi } from "@/services/api";

import FarmerProfile from "../components/FarmerProfile";
import FarmerFarms from "../components/FarmerFarms";
import FarmerProcurement from "../components/FarmerProcurement";
import FarmerActivity from "../components/FarmerActivity";

function FarmerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState(null);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [farmerData, farmsData] = await Promise.all([
          farmersApi.getById(id).catch(() => null),
          farmsApi.getByFarmer(id).catch(() => []),
        ]);

        if (farmerData) {
          setFarmer(farmerData);
        }
        setFarms(Array.isArray(farmsData) ? farmsData : []);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-slate-500">Loading farmer details...</p>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Farmer not found</h1>
        <Button onClick={() => navigate("/farmers")}>
          Back to Farmers
        </Button>
      </div>
    );
  }

  const normalizedFarmer = {
    ...farmer,
    name: farmer.fullName || farmer.name || "Farmer",
    code: farmer.farmerCode || farmer.code || farmer.id,
    farms: farms.map((f) => ({
      id: f.id,
      name: f.farmName,
      surveyNumber: f.surveyNumber,
      area: f.areaInAcres || f.area,
      soilType: f.soilType,
      currentCrop: f.milletType || "Millet",
      status: f.status,
    })),
  };

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
              {normalizedFarmer.name}
            </h1>

            <p className="text-muted-foreground font-mono text-xs">
              {normalizedFarmer.code}
            </p>
          </div>

        </div>

        <Button onClick={() => navigate(`/farmers/${farmer.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Farmer
        </Button>

      </div>

      {/* Profile */}
      <FarmerProfile farmer={normalizedFarmer} />

      {/* Farms */}
      <FarmerFarms
        farmer={normalizedFarmer}
        onFarmClick={(farm) => navigate(`/farm-verification/${farm.id}`)}
      />

      {/* Procurement */}
      <FarmerProcurement farmer={normalizedFarmer} />

      {/* Activity */}
      <FarmerActivity farmer={normalizedFarmer} />

    </div>
  );
}

export default FarmerDetails;