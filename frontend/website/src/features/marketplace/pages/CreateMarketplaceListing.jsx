import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  Send,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import CreateListingForm from "../components/CreateListingForm";
import { marketplaceApi, lotsApi } from "@/services/api";

function CreateMarketplaceListing() {
  const navigate = useNavigate();

  const [certifiedLots, setCertifiedLots] = useState([]);

  useEffect(() => {
    async function loadLots() {
      try {
        const data = await lotsApi.getAll();
        if (Array.isArray(data)) {
          const mapped = data.map((l) => ({
            id: l.lotCode || l.id,
            millet: l.milletType || "Millet",
            grade: l.grade || "Grade A",
            availableQuantity: l.estimatedQuantityKg || l.actualQuantityKg || 1000,
            unit: "kg",
            certificationId: l.certificateNumber || "CERT-001",
          }));
          setCertifiedLots(mapped);
        }
      } catch (err) {
        console.error("Error loading certified lots:", err);
        setCertifiedLots([]);
      }
    }
    loadLots();
  }, []);

  const [form, setForm] = useState({
    lotId: "",
    quantity: "",
    pricePerKg: "",
    title: "",
    description: "",
  });

  const selectedLot = certifiedLots.find(
    (lot) => lot.id === form.lotId
  );

  const handlePublish = async () => {
    if (!form.lotId) {
      alert("Please select a procurement lot.");
      return;
    }

    if (!form.quantity) {
      alert("Please enter listing quantity.");
      return;
    }

    if (
      Number(form.quantity) >
      Number(selectedLot.availableQuantity)
    ) {
      alert(
        "Listing quantity cannot exceed available stock."
      );
      return;
    }

    if (!form.pricePerKg) {
      alert("Please enter selling price.");
      return;
    }

    const listing = {
      lotId: form.lotId,
      milletType: selectedLot.millet,
      grade: selectedLot.grade,
      quantityKg: Number(form.quantity),
      pricePerKg: Number(form.pricePerKg),
      title: form.title,
      description: form.description,
    };

    try {
      await marketplaceApi.create(listing);
    } catch (err) {
      console.error("Failed to create marketplace listing:", err);
    } finally {
      navigate("/marketplace");
    }
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
              navigate("/marketplace")
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Package className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Create Marketplace Listing
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Publish certified millet stock for processors
                and SHGs.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handlePublish}>
          <Send className="mr-2 h-4 w-4" />
          Publish Listing
        </Button>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="border-slate-200/80 shadow-xs lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">
              Listing Information
            </CardTitle>

            <p className="text-sm text-slate-500">
              Select certified stock and define how much you
              want to offer to buyers.
            </p>
          </CardHeader>

          <CardContent>
            <CreateListingForm
              lots={certifiedLots}
              values={form}
              onChange={setForm}
            />
          </CardContent>
        </Card>

        {/* Rules */}
        <Card className="h-fit border-slate-200/80 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">
              Listing Requirements
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Certified lot
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Only quality-certified procurement lots can
                  be listed.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Available stock
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Listing quantity cannot exceed the available
                  inventory.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Buyer visibility
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Published listings become available to
                  eligible processors and SHGs.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                FPO Managed Listing
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom action */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Ready to publish?
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Review quantity and selling price before publishing.
          </p>
        </div>

        <Button onClick={handlePublish}>
          <Send className="mr-2 h-4 w-4" />
          Publish Listing
        </Button>
      </div>
    </div>
  );
}

export default CreateMarketplaceListing;