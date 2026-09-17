import {
    ArrowLeft,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    IndianRupee,
    Loader2,
    Package,
    User,
} from "lucide-react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { lotsApi } from "@/services/api";

function ProcurementLotDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lot, setLot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadLot() {
            try {
                const data = await lotsApi.getById(id);
                // Normalise API fields to what the UI expects
                setLot({
                    ...data,
                    lotId: data.lotNumber || data.id,
                    millet: data.milletType,
                    quantity: data.estimatedQuantityKg,
                    actualQuantity: data.actualQuantityKg,
                    procurementDate: data.submissionDate
                        ? new Date(data.submissionDate).toLocaleDateString("en-IN")
                        : "—",
                    pricePerKg: data.pricePerKg ?? "—",
                    totalValue: data.totalValue ?? "—",
                    qualityStatus: data.qualityStatus ?? "Pending",
                });
            } catch (err) {
                setError(err.message || "Lot not found.");
            } finally {
                setLoading(false);
            }
        }

        if (id) loadLot();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-sm text-slate-500">Loading lot details...</p>
            </div>
        );
    }

    if (error || !lot) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Procurement lot not found</h1>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={() => navigate("/procurement-lots")}>
                    Back to Procurement Lots
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
                        onClick={() => navigate("/procurement-lots")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {lot.lotNumber || lot.id}
                            </h1>
                            <LotStatus status={lot.status} />
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Procurement lot · {lot.procurementDate}
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate(`/farmers/${lot.farmerId}`)}
                >
                    <User className="mr-2 h-4 w-4" />
                    View Farmer
                </Button>

            </div>


            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Estimated Quantity"
                    value={`${Number(lot.quantity).toLocaleString("en-IN")} kg`}
                    icon={Package}
                />

                <SummaryCard
                    title="Actual Quantity"
                    value={lot.actualQuantity
                        ? `${Number(lot.actualQuantity).toLocaleString("en-IN")} kg`
                        : "Pending"}
                    icon={Package}
                />

                <SummaryCard
                    title="Harvest Date"
                    value={lot.harvestDate
                        ? new Date(lot.harvestDate).toLocaleDateString("en-IN")
                        : "—"}
                    icon={Clock3}
                />

                <SummaryCard
                    title="Quality Status"
                    value={lot.qualityStatus}
                    icon={CheckCircle2}
                />
            </div>


            {/* Farmer + Farm */}
            <div className="grid gap-6 lg:grid-cols-2">
                <FarmerCard lot={lot} />
                <FarmCard lot={lot} />
            </div>


            {/* Procurement Details */}
            <Card className="border-slate-200/80 bg-white shadow-xs">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">
                        Procurement Details
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Detail label="Lot Number" value={lot.lotNumber} />
                        <Detail label="Millet" value={lot.millet} />
                        <Detail
                            label="Estimated Quantity"
                            value={`${Number(lot.quantity).toLocaleString("en-IN")} kg`}
                        />
                        <Detail
                            label="Submission Date"
                            value={lot.procurementDate}
                        />
                        <Detail
                            label="Harvest Date"
                            value={lot.harvestDate
                                ? new Date(lot.harvestDate).toLocaleDateString("en-IN")
                                : "—"}
                        />
                        <Detail label="Status" value={lot.status} />
                        {lot.description && (
                            <Detail label="Description" value={lot.description} />
                        )}
                    </div>
                </CardContent>
            </Card>


            {/* Workflow */}
            <ProcurementWorkflow lot={lot} />


            {/* Actions */}
            <Card className="border-slate-200/80 bg-white shadow-xs">
                <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-end">
                    {(lot.status === "SUBMITTED" || lot.status === "QUALITY_INSPECTION") && (
                        <Button
                            onClick={() =>
                                navigate(`/procurement-lots/${lot.id}/inspection`)
                            }
                        >
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            Open Quality Inspection
                        </Button>
                    )}

                    {lot.status === "PAYMENT" && (
                        <Button onClick={() =>
                            navigate(`/procurement-lots/${lot.id}/payment`)
                        }>
                            <IndianRupee className="mr-2 h-4 w-4" />
                            Process Payment
                        </Button>
                    )}

                    {lot.status === "COMPLETED" && (
                        <Button variant="outline" onClick={() =>
                            navigate(`/procurement-lots/${lot.id}/certification`)
                        }>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            View Certification
                        </Button>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}


/* ---------------- Summary Card ---------------- */

function SummaryCard({ title, value, icon: Icon }) {
    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardContent className="flex items-center justify-between p-5">
                <div>
                    <p className="text-xs font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
                </div>
                <div className="rounded-lg bg-slate-100 p-3">
                    <Icon className="h-5 w-5 text-slate-600" />
                </div>
            </CardContent>
        </Card>
    );
}


/* ---------------- Farmer Card ---------------- */

function FarmerCard({ lot }) {
    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Farmer</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <div className="rounded-full bg-slate-100 p-3">
                        <User className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{lot.farmerName}</p>
                        <p className="text-xs text-muted-foreground">
                            Farmer ID: {lot.farmerId}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}


/* ---------------- Farm Card ---------------- */

function FarmCard({ lot }) {
    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Farm</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="font-semibold text-slate-900">{lot.farmName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Linked to {lot.farmerName}
                </p>
                <div className="mt-4">
                    <Badge variant="secondary">Farm verified</Badge>
                </div>
            </CardContent>
        </Card>
    );
}


/* ---------------- Detail ---------------- */

function Detail({ label, value }) {
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value ?? "—"}</p>
        </div>
    );
}


/* ---------------- Status Badge ---------------- */

function LotStatus({ status }) {
    const s = (status || "").toUpperCase();

    if (s === "COMPLETED" || s === "PAYMENT") {
        return (
            <Badge>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                {s === "PAYMENT" ? "Payment" : "Completed"}
            </Badge>
        );
    }

    if (s === "QUALITY_CERTIFICATE" || s === "PROCUREMENT_AGREEMENT" || s === "PICKUP") {
        return <Badge variant="secondary">{status}</Badge>;
    }

    if (s === "QUALITY_INSPECTION" || s === "SUBMITTED") {
        return (
            <Badge variant="outline">
                <Clock3 className="mr-1 h-3 w-3" />
                {s === "SUBMITTED" ? "Submitted" : "Quality Inspection"}
            </Badge>
        );
    }

    return <Badge variant="outline">{status}</Badge>;
}


/* ---------------- Workflow ---------------- */

const STATUS_ORDER = [
    "SUBMITTED",
    "QUALITY_INSPECTION",
    "QUALITY_CERTIFICATE",
    "PROCUREMENT_AGREEMENT",
    "PICKUP",
    "PAYMENT",
    "COMPLETED",
];

function ProcurementWorkflow({ lot }) {
    const currentIndex = STATUS_ORDER.indexOf((lot.status || "").toUpperCase());

    const steps = STATUS_ORDER.map((step, index) => ({
        label: step
            .split("_")
            .map((w) => w[0] + w.slice(1).toLowerCase())
            .join(" "),
        completed: index <= currentIndex,
        active: index === currentIndex,
    }));

    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Procurement Workflow</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
                    {steps.map((step, index) => (
                        <div key={step.label} className="relative">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                        step.completed
                                            ? "bg-emerald-100 text-emerald-600"
                                            : step.active
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-slate-100 text-slate-400"
                                    }`}
                                >
                                    {step.completed ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-bold">{index + 1}</span>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-semibold">{step.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {step.completed ? "Completed" : step.active ? "In Progress" : "Pending"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default ProcurementLotDetails;