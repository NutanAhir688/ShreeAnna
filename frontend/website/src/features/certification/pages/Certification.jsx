import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Award,
    CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import CertificationSummary from "../components/CertificationSummary";
import InspectionResultCard from "../components/InspectionResultCard";
import CertificationForm from "../components/CertificationForm";

import { qualityApi } from "@/services/api";

function Certification() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [certification, setCertification] = useState(null);
    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const cert = await qualityApi.getCertificate(id);
                if (cert) setCertification(cert);
                const insp = await qualityApi.getByLot(id);
                if (insp) setInspection(insp);
            } catch (err) {
                console.error("Error loading certification data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    const [form, setForm] = useState({
        certificateNumber: `CERT-${id}-2026`,
        issuedBy: certification?.issuedBy || "",
        remarks:
            certification?.remarks ||
            "Lot passed quality inspection.",
    });

    if (!certification || !inspection) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Certification not available
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        No certification record exists for lot {id}.
                    </p>

                    <Button
                        className="mt-4"
                        onClick={() =>
                            navigate("/procurement-lots")
                        }
                    >
                        Back to Procurement
                    </Button>
                </div>
            </div>
        );
    }

    const handleIssueCertificate = () => {
        console.log("Certificate issued:", {
            lotId: id,
            inspectionId: inspection.id,
            certificateNumber: form.certificateNumber,
            issuedBy: form.issuedBy,
            remarks: form.remarks,
        });

        navigate(`/procurement-lots/${id}`);
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
                            navigate(`/procurement-lots/${id}`)
                        }
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Lot
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2">
                            <Award className="h-5 w-5 text-amber-600" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                Certification
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Issue quality certification for{" "}
                                <span className="font-medium text-slate-700">
                                    {id}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(`/procurement-lots/${id}`)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleIssueCertificate}
                    >
                        <Award className="mr-2 h-4 w-4" />
                        Issue Certificate
                    </Button>
                </div>
            </div>

            {/* Summary */}
            <CertificationSummary
                certification={certification}
            />

            {/* Inspection */}
            <InspectionResultCard
                inspection={inspection}
            />

            {/* Certificate */}
            <Card className="border-slate-200/80 shadow-xs">
                <CardHeader>
                    <CardTitle className="text-base">
                        Certificate Details
                    </CardTitle>

                    <p className="text-sm text-slate-500">
                        Review the certification information before
                        issuing the certificate.
                    </p>
                </CardHeader>

                <CardContent>
                    <CertificationForm
                        values={form}
                        onChange={setForm}
                    />
                </CardContent>
            </Card>

            {/* Confirmation */}
            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                    <div>
                        <p className="text-sm font-medium text-emerald-900">
                            Quality inspection passed
                        </p>

                        <p className="text-xs text-emerald-700">
                            The lot is eligible for certification.
                        </p>
                    </div>
                </div>

                <Button
                    onClick={handleIssueCertificate}
                >
                    <Award className="mr-2 h-4 w-4" />
                    Issue Certificate
                </Button>
            </div>
        </div>
    );
}

export default Certification;