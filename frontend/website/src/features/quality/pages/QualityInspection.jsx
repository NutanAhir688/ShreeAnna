import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Save, Loader2, AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import InspectionSummary from "../components/InspectionSummary";
import QualityParameters from "../components/QualityParameters";
import InspectionResult from "../components/InspectionResult";

import { qualityApi, lotsApi } from "@/services/api";

function QualityInspection() {
  const navigate = useNavigate();
  const { id } = useParams(); // Lot ID (GUID)

  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [parameters, setParameters] = useState({
    moisture: "12.0",
    foreignMatter: "0.5",
    damagedGrains: "1.0",
    immatureGrains: "0.5",
    insectDamage: "None",
    grade: "Grade A",
  });

  const [result, setResult] = useState("Passed");
  const [remarks, setRemarks] = useState("Lot passed quality verification standards.");

  useEffect(() => {
    async function loadLotData() {
      try {
        const data = await lotsApi.getById(id);
        setLot(data);
      } catch (err) {
        setError(err.message || "Failed to load lot data.");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadLotData();
    }
  }, [id]);

  const handleSave = async () => {
    if (!lot) return;
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        lotId: lot.id,
        inspectorName: "Quality Inspector",
        moisturePercentage: parseFloat(parameters.moisture) || 12.0,
        purityPercentage: 100 - (parseFloat(parameters.foreignMatter) || 0),
        grade: parameters.grade || "Grade A",
        status: result === "Passed" ? "PASSED" : "FAILED",
        notes: remarks || "Quality inspection recorded.",
      };

      await qualityApi.create(payload);
      // Navigate to Quality Management history tab
      navigate("/quality?tab=history");
    } catch (err) {
      setError(err.message || "Failed to save inspection record.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <p className="text-sm text-slate-500">Loading lot inspection details...</p>
      </div>
    );
  }

  if (error && !lot) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Inspection not found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {error || `No procurement lot found with ID ${id}.`}
          </p>
          <Button className="mt-4" onClick={() => navigate("/quality")}>
            Back to Quality Management
          </Button>
        </div>
      </div>
    );
  }

  // Adapted inspection summary data object
  const inspectionSummaryData = {
    id: lot?.id,
    lotId: lot?.lotNumber || lot?.id,
    farmerName: lot?.farmerName || "Farmer",
    farmName: lot?.farmName || "Farm",
    milletType: lot?.milletType || "Millet",
    quantity: lot?.estimatedQuantityKg ? `${lot.estimatedQuantityKg} kg` : "—",
    submittedDate: lot?.submissionDate
      ? new Date(lot.submissionDate).toLocaleDateString("en-IN")
      : "—",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            className="-ml-3 mb-2"
            onClick={() => navigate(`/quality`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quality
          </Button>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Quality Inspection
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Inspect and record quality parameters for{" "}
            <span className="font-medium text-slate-700">
              Lot #{lot?.lotNumber || id}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate("/quality")}
            disabled={submitting}
          >
            Cancel
          </Button>

          <Button onClick={handleSave} disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Inspection
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Summary */}
      <InspectionSummary inspection={inspectionSummaryData} />

      {/* Quality Parameters */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">
            Quality Parameters
          </CardTitle>
          <p className="text-sm text-slate-500">
            Record the observed quality measurements from the sampled lot.
          </p>
        </CardHeader>
        <CardContent>
          <QualityParameters
            values={parameters}
            onChange={setParameters}
          />
        </CardContent>
      </Card>

      {/* Result */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base">
            Inspection Decision
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InspectionResult
            result={result}
            remarks={remarks}
            onResultChange={setResult}
            onRemarksChange={setRemarks}
          />
        </CardContent>
      </Card>

      {/* Bottom action */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-slate-900">
              Ready to submit inspection
            </p>
            <p className="text-xs text-slate-500">
              Save the inspection after reviewing all measurements.
            </p>
          </div>
        </div>

        <Button onClick={handleSave} disabled={submitting}>
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Inspection
        </Button>
      </div>
    </div>
  );
}

export default QualityInspection;