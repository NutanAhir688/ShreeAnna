import { useState } from "react";
import {
  ArrowLeft,
  User,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import VerificationSummary from "../components/VerificationSummary";
import SubmittedFarmDetails from "../components/SubmittedFarmDetails";
import LandRecordVerification from "../components/LandRecordVerification";
import FarmVerificationStatus from "../components/FarmVerificationStatus";
import { farmsApi, farmersApi } from "@/services/api";

function FarmVerification() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadFarm() {
      try {
        setLoading(true);
        const farmData = await farmsApi.getById(id);
        if (farmData) {
          setFarm(farmData);
          if (farmData.farmerId) {
            const farmerData = await farmersApi.getById(farmData.farmerId).catch(() => null);
            setFarmer(farmerData);
          }
        }
      } catch (err) {
        console.error("Failed to load farm details", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadFarm();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm text-slate-500">Loading farm details...</p>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Farm not found</h1>
        <Button onClick={() => navigate("/farm-verification")}>
          Back to Verification
        </Button>
      </div>
    );
  }

  const normalizedFarm = {
    ...farm,
    area: farm.areaInAcres || farm.area || 0,
    farmerName: farmer?.fullName || farm.farmerName || "Farmer",
    submittedAt: farm.createdAt ? new Date(farm.createdAt).toLocaleDateString() : farm.submittedAt || "-",
  };

  const handleVerify = async () => {
    try {
      setIsSubmitting(true);
      await farmsApi.updateStatus(farm.id, "Verified");
      setFarm((prev) => ({ ...prev, status: "Verified" }));
    } catch (err) {
      alert("Failed to verify farm: " + (err.message || "API Error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    try {
      setIsSubmitting(true);
      await farmsApi.updateStatus(farm.id, "Rejected");
      setFarm((prev) => ({ ...prev, status: "Rejected", rejectionReason }));
      setRejectDialogOpen(false);
      setRejectionReason("");
    } catch (err) {
      alert("Failed to reject farm: " + (err.message || "API Error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleted =
    farm.status === "Verified" ||
    farm.status === "Rejected";


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              navigate("/farm-verification")
            }
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>


          <div>
            <div className="flex items-center gap-3">

              <h1 className="text-2xl font-bold tracking-tight">
                {farm.farmName}
              </h1>

              <FarmVerificationStatus
                status={farm.status}
              />

            </div>

            <p className="text-muted-foreground">
              {farm.id} · {farm.farmerName}
            </p>
          </div>

        </div>

        <Button
          variant="outline"
          onClick={() => navigate(`/farmers/${farm.farmerId}`)}
        >
          <User className="mr-2 h-4 w-4" />
          View Farmer
        </Button>

      </div>


      {/* Summary */}
      <VerificationSummary farm={normalizedFarm} />


      {/* Farmer information */}
      <Card>
        <CardContent className="p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-full bg-muted p-3">
              <User className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Submitted by
              </p>

              <p className="font-medium">
                {normalizedFarm.farmerName}
              </p>

              <p className="text-sm text-muted-foreground">
                Farmer ID: {farm.farmerId}
              </p>
            </div>

          </div>

        </CardContent>
      </Card>


      {/* Submitted details */}
      <SubmittedFarmDetails
        farm={normalizedFarm}
      />


      {/* Land verification */}
      {!isCompleted && (
        <LandRecordVerification
          farm={normalizedFarm}
          onVerify={handleVerify}
          onReject={() =>
            setRejectDialogOpen(true)
          }
        />
      )}


      {/* Completed state */}
      {isCompleted && (
        <Card>

          <CardContent className="p-6">

            <div className="flex items-center gap-3">

              <div className="rounded-full bg-muted p-3">
                <FarmVerificationStatus
                  status={farm.status}
                />
              </div>

              <div>
                <p className="font-medium">
                  Verification completed
                </p>

                <p className="text-sm text-muted-foreground">
                  This farm is no longer awaiting verification.
                </p>
              </div>

            </div>


            {farm.rejectionReason && (
              <div className="mt-6 rounded-lg border p-4">

                <p className="text-sm font-medium">
                  Rejection Reason
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {farm.rejectionReason}
                </p>

              </div>
            )}

          </CardContent>

        </Card>
      )}


      {/* Reject dialog */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
      >

        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              Reject Farm
            </DialogTitle>

            <DialogDescription>
              Provide a reason for rejecting this farm
              verification request.
            </DialogDescription>
          </DialogHeader>


          <Textarea
            value={rejectionReason}
            onChange={(event) =>
              setRejectionReason(event.target.value)
            }
            placeholder="Enter rejection reason..."
            rows={4}
          />


          <DialogFooter>

            <Button
              variant="outline"
              onClick={() =>
                setRejectDialogOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={!rejectionReason.trim()}
              onClick={handleReject}
            >
              Reject Farm
            </Button>

          </DialogFooter>

        </DialogContent>

      </Dialog>

    </div>
  );
}

export default FarmVerification;