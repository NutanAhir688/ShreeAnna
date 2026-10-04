import {
    ArrowLeft,
    Calendar,
    Car,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    IndianRupee,
    Loader2,
    MapPin,
    Navigation,
    Package,
    Phone,
    Send,
    ShieldCheck,
    User,
    UserCheck,
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

import {
    lotsApi,
    qualityApi,
    agreementsApi,
} from "@/services/api";


function ProcurementLotDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [lot, setLot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAssignModal, setShowAssignModal] = useState(false);

    const handleAssignInspector = async (data) => {
        const updated = await lotsApi.assignInspector(lot.id, data);
        setLot((prev) => ({
            ...prev,
            assignedInspectorName: updated.assignedInspectorName,
            assignedInspectorPhone: updated.assignedInspectorPhone,
            scheduledInspectionDate: updated.scheduledInspectionDate,
            inspectionTrackingStatus: updated.inspectionTrackingStatus,
            inspectorLatitude: updated.inspectorLatitude,
            inspectorLongitude: updated.inspectorLongitude,
            inspectorName: updated.assignedInspectorName,
            status: updated.status,
        }));
    };

    const handleLocationUpdate = async (trackingStatus, latitude, longitude) => {
        try {
            const targetId = lot?.id || id;
            const updated = await lotsApi.updateInspectorLocation(targetId, {
                trackingStatus,
                latitude,
                longitude,
            });
            setLot((prev) => ({
                ...prev,
                ...updated,
                inspectionTrackingStatus: updated.inspectionTrackingStatus,
                inspectorLatitude: updated.inspectorLatitude,
                inspectorLongitude: updated.inspectorLongitude,
                status: updated.status,
            }));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert(err.message || "Failed to update inspector status");
        }
    };


    useEffect(() => {
        async function loadLot() {
            try {
                setLoading(true);
                setError("");

                // Fetch procurement lot information
                const data = await lotsApi.getById(id);

                // Quality information
                let inspection = null;
                let certificate = null;

                try {
                    inspection = await qualityApi.getByLot(id);
                } catch (error) {
                    console.log(
                        "No inspection found for this lot.",
                        error
                    );
                }

                try {
                    certificate = await qualityApi.getCertificate(id);
                } catch (error) {
                    console.log(
                        "No certificate found for this lot.",
                        error
                    );
                }

                // Agreement information
                let agreement = null;

                try {
                    agreement = await agreementsApi.getByLot(id);
                } catch (error) {
                    console.log(
                        "No agreement found for this lot.",
                        error
                    );
                }

                setLot({
                    ...data,

                    // Basic lot information
                    lotId: data.lotNumber || data.id,
                    lotNumber: data.lotNumber || data.id,

                    millet: data.milletType || "—",
                    milletType: data.milletType || "—",

                    farmerName: data.farmerName || "—",
                    farmerId: data.farmerId,
                    farmerPhone: data.farmerPhone || "—",
                    farmerAddress: data.farmerAddress || "—",

                    farmName: data.farmName || "—",
                    farmId: data.farmId,
                    farmLatitude: data.farmLatitude ?? null,
                    farmLongitude: data.farmLongitude ?? null,

                    quantity: data.estimatedQuantityKg ?? 0,

                    estimatedQuantityKg:
                        data.estimatedQuantityKg ?? 0,

                    actualQuantityKg:
                        data.actualQuantityKg ?? null,

                    submissionDate: data.submissionDate,

                    procurementDate:
                        data.submissionDate,

                    harvestDate: data.harvestDate,

                    status:
                        data.status || "SUBMITTED",

                    description:
                        data.description || "",

                    // Assigned Inspector details
                    assignedInspectorName: data.assignedInspectorName || null,
                    assignedInspectorPhone: data.assignedInspectorPhone || null,
                    scheduledInspectionDate: data.scheduledInspectionDate || null,
                    inspectionTrackingStatus: data.inspectionTrackingStatus || null,
                    inspectorLatitude: data.inspectorLatitude ?? null,
                    inspectorLongitude: data.inspectorLongitude ?? null,
                    inspectorLastUpdated: data.inspectorLastUpdated || null,

                    // Farm information
                    farmStatus:
                        data.farmStatus || "Unknown",

                    // Quality information
                    qualityStatus:
                        inspection?.status || "Pending",

                    qualityCertificateId:
                        certificate?.certificateNumber || "—",

                    moisture:
                        inspection?.moisturePercentage ?? null,

                    purity:
                        inspection?.purityPercentage ?? null,

                    grade:
                        inspection?.grade || "—",

                    inspectorName:
                        data.assignedInspectorName || inspection?.inspectorName || "—",

                    inspectionDate:
                        inspection?.inspectionDate || null,

                    // Agreement information
                    agreementId:
                        agreement?.id || agreement?.agreementId || "—",

                    agreementStatus:
                        agreement?.status || "Pending",

                    agreedQuantity:
                        agreement?.agreedQuantityKg ?? agreement?.agreedQuantity ?? null,

                    pricePerKg:
                        agreement?.pricePerKg ?? agreement?.purchasePricePerKg ?? agreement?.purchasePrice ?? null,
                });
            } catch (err) {
                setError(
                    err.message || "Lot not found."
                );
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadLot();
        }
    }, [id]);


    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />

                <p className="text-sm text-slate-500">
                    Loading lot details...
                </p>
            </div>
        );
    }


    if (error || !lot) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">
                    Procurement lot not found
                </h1>

                <p className="text-sm text-muted-foreground">
                    {error}
                </p>

                <Button
                    onClick={() =>
                        navigate("/procurement-lots")
                    }
                >
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
                        onClick={() =>
                            navigate("/procurement-lots")
                        }
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <div>
                        <div className="flex flex-wrap items-center gap-3">

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                {lot.lotNumber || lot.id}
                            </h1>

                            <LotStatus
                                status={lot.status}
                            />

                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Procurement lot ·{" "}
                            {formatDateTime(
                                lot.procurementDate
                            )}
                        </p>
                    </div>

                </div>


                <div className="flex flex-wrap items-center gap-2">
                    {(lot.status === "SUBMITTED" ||
                        lot.status === "QUALITY_INSPECTION" ||
                        lot.assignedInspectorName ||
                        lot.inspectionTrackingStatus === "SAMPLE_COLLECTED" ||
                        lot.inspectionTrackingStatus === "ARRIVED_AT_FARM") && (
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-xs"
                            onClick={() =>
                                navigate(
                                    `/procurement-lots/${lot.id || id}/inspection`
                                )
                            }
                        >
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            Open Quality Inspection
                            {lot.inspectionTrackingStatus === "SAMPLE_COLLECTED" && (
                                <span className="ml-1.5 rounded bg-purple-200 px-1.5 py-0.5 text-[10px] font-bold text-purple-900">
                                    Sample Collected
                                </span>
                            )}
                        </Button>
                    )}

                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setShowAssignModal(true)}
                    >
                        <UserCheck className="mr-2 h-4 w-4" />
                        {lot.assignedInspectorName ? "Re-Assign Inspector" : "Assign Inspector"}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(`/farmers/${lot.farmerId}`)
                        }
                    >
                        <User className="mr-2 h-4 w-4" />

                        View Farmer
                    </Button>
                </div>


            </div>


            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <SummaryCard
                    title="Estimated Quantity"
                    value={`${Number(
                        lot.quantity
                    ).toLocaleString("en-IN")} kg`}
                    icon={Package}
                />


                <SummaryCard
                    title="Actual Quantity"
                    value={
                        lot.actualQuantityKg !== null
                            ? `${Number(
                                lot.actualQuantityKg
                            ).toLocaleString("en-IN")} kg`
                            : "Pending"
                    }
                    icon={Package}
                />


                <SummaryCard
                    title="Harvest Date"
                    value={
                        lot.harvestDate
                            ? formatDate(
                                lot.harvestDate
                            )
                            : "—"
                    }
                    icon={Clock3}
                />


                <SummaryCard
                    title="Quality Status"
                    value={lot.qualityStatus}
                    icon={CheckCircle2}
                />

            </div>

            {/* Inspector Assignment & Visit Tracking Card */}
            <InspectorTrackingCard
                lot={lot}
                onAssignClick={() => setShowAssignModal(true)}
                onLocationUpdate={handleLocationUpdate}
            />


            {/* Farmer and Farm */}
            <div className="grid gap-6 lg:grid-cols-2">
                <FarmerCard lot={lot} />
                <FarmCard lot={lot} />
            </div>


            {/* Lot Information and Description */}
            <div className="grid gap-6 lg:grid-cols-2">
                <LotInformationCard lot={lot} />
                <DescriptionCard lot={lot} />
            </div>


            {/* Quality and Agreement */}
            <div className="grid gap-6 lg:grid-cols-2">
                <QualityCard lot={lot} />
                <AgreementCard lot={lot} />
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

                        <Detail
                            label="Lot Number"
                            value={lot.lotNumber}
                        />

                        <Detail
                            label="Millet"
                            value={lot.millet}
                        />

                        <Detail
                            label="Estimated Quantity"
                            value={`${Number(
                                lot.quantity
                            ).toLocaleString("en-IN")} kg`}
                        />

                        <Detail
                            label="Submission Date"
                            value={formatDateTime(
                                lot.procurementDate
                            )}
                        />

                        <Detail
                            label="Harvest Date"
                            value={
                                lot.harvestDate
                                    ? formatDate(
                                        lot.harvestDate
                                    )
                                    : "—"
                            }
                        />

                        <Detail
                            label="Status"
                            value={lot.status}
                        />

                        {lot.description && (
                            <Detail
                                label="Description"
                                value={lot.description}
                            />
                        )}

                    </div>
                </CardContent>

            </Card>


            {/* Workflow */}
            <ProcurementWorkflow lot={lot} />


            {/* Actions */}
            <Card className="border-slate-200/80 bg-white shadow-xs">

                <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:justify-end">

                    {(lot.status === "SUBMITTED" ||
                        lot.status === "QUALITY_INSPECTION") && (

                            <Button
                                onClick={() =>
                                    navigate(
                                        `/procurement-lots/${lot.id}/inspection`
                                    )
                                }
                            >
                                <ClipboardCheck className="mr-2 h-4 w-4" />

                                Open Quality Inspection
                            </Button>
                        )}


                    {lot.status === "PAYMENT" && (

                        <Button
                            onClick={() =>
                                navigate(
                                    `/procurement-lots/${lot.id}/payment`
                                )
                            }
                        >
                            <IndianRupee className="mr-2 h-4 w-4" />

                            Process Payment
                        </Button>
                    )}


                    {lot.status === "COMPLETED" && (

                        <Button
                            variant="outline"
                            onClick={() =>
                                navigate(
                                    `/procurement-lots/${lot.id}/certification`
                                )
                            }
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />

                            View Certification
                        </Button>
                    )}

                </CardContent>

            </Card>

            <AssignInspectorModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSubmit={handleAssignInspector}
            />

        </div>
    );
}


/* ---------------- Utility Functions ---------------- */

function formatDate(date) {
    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleDateString("en-IN");
}


function formatDateTime(date) {
    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleString("en-IN");
}


/* ---------------- Lot Information Card ---------------- */

function LotInformationCard({ lot }) {
    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-5 w-5" />

                    Lot Information
                </CardTitle>
            </CardHeader>


            <CardContent className="space-y-4">

                <Detail
                    label="Millet Type"
                    value={lot.milletType}
                />


                <Detail
                    label="Estimated Quantity"
                    value={`${Number(
                        lot.estimatedQuantityKg
                    ).toLocaleString("en-IN")} kg`}
                />


                <Detail
                    label="Actual Quantity"
                    value={
                        lot.actualQuantityKg !== null
                            ? `${lot.actualQuantityKg} kg`
                            : "Not verified"
                    }
                />


                <Detail
                    label="Harvest Date"
                    value={
                        lot.harvestDate
                            ? formatDate(
                                lot.harvestDate
                            )
                            : "—"
                    }
                />


                <Detail
                    label="Submission Date"
                    value={
                        lot.submissionDate
                            ? formatDate(
                                lot.submissionDate
                            )
                            : "—"
                    }
                />

            </CardContent>

        </Card>
    );
}


/* ---------------- Description Card ---------------- */

function DescriptionCard({ lot }) {
    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">

            <CardHeader>
                <CardTitle className="text-base">
                    Description
                </CardTitle>
            </CardHeader>


            <CardContent>
                <p className="text-sm leading-6 text-slate-600">
                    {lot.description ||
                        "No description provided."}
                </p>
            </CardContent>

        </Card>
    );
}


/* ---------------- Summary Card ---------------- */

function SummaryCard({
    title,
    value,
    icon: Icon,
}) {
    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">

            <CardContent className="flex items-center justify-between p-5">

                <div>
                    <p className="text-xs font-medium text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                        {value}
                    </p>
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
        <Card>

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5" />

                    Farmer & Farm Information
                </CardTitle>
            </CardHeader>


            <CardContent className="space-y-4">

                <div>
                    <p className="text-sm text-muted-foreground">
                        Farmer
                    </p>

                    <p className="font-semibold">
                        {lot.farmerName}
                    </p>
                </div>


                <div>
                    <p className="text-sm text-muted-foreground">
                        Farm
                    </p>

                    <p className="font-semibold">
                        {lot.farmName}
                    </p>
                </div>


                <div>
                    <p className="text-sm text-muted-foreground">
                        Farmer ID
                    </p>

                    <p className="break-all text-sm">
                        {lot.farmerId}
                    </p>
                </div>


                <div>
                    <p className="text-sm text-muted-foreground">
                        Farm ID
                    </p>

                    <p className="break-all text-sm">
                        {lot.farmId}
                    </p>
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
                <CardTitle className="text-lg font-bold">
                    Farm Information
                </CardTitle>
            </CardHeader>


            <CardContent className="space-y-4">

                <Detail
                    label="Farm Name"
                    value={lot.farmName}
                />


                <Detail
                    label="Farm ID"
                    value={lot.farmId}
                />


                <div>
                    <p className="text-xs text-muted-foreground">
                        Verification Status
                    </p>


                    <Badge
                        className="mt-2"
                        variant={
                            lot.farmStatus === "Verified"
                                ? "default"
                                : "outline"
                        }
                    >
                        {lot.farmStatus}
                    </Badge>
                </div>

            </CardContent>

        </Card>
    );
}


/* ---------------- Detail Component ---------------- */

function Detail({
    label,
    value,
}) {
    return (
        <div>

            <p className="text-xs text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
                {value ?? "—"}
            </p>

        </div>
    );
}


/* ---------------- Status Badge ---------------- */

function LotStatus({ status }) {
    const currentStatus = (
        status || ""
    ).toUpperCase();


    if (
        currentStatus === "COMPLETED" ||
        currentStatus === "PAYMENT"
    ) {
        return (
            <Badge>
                <CheckCircle2 className="mr-1 h-3 w-3" />

                {currentStatus === "PAYMENT"
                    ? "Payment"
                    : "Completed"}
            </Badge>
        );
    }


    if (
        currentStatus === "QUALITY_CERTIFICATE" ||
        currentStatus === "PROCUREMENT_AGREEMENT" ||
        currentStatus === "PICKUP"
    ) {
        return (
            <Badge variant="secondary">
                {formatStatusLabel(currentStatus)}
            </Badge>
        );
    }


    if (
        currentStatus === "QUALITY_INSPECTION" ||
        currentStatus === "SUBMITTED"
    ) {
        return (
            <Badge variant="outline">

                <Clock3 className="mr-1 h-3 w-3" />

                {currentStatus === "SUBMITTED"
                    ? "Submitted"
                    : "Quality Inspection"}

            </Badge>
        );
    }


    return (
        <Badge variant="outline">
            {formatStatusLabel(currentStatus)}
        </Badge>
    );
}


/* ---------------- Quality Card ---------------- */

function QualityCard({ lot }) {
    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">

            <CardHeader>
                <CardTitle className="text-lg font-bold">
                    Quality Control
                </CardTitle>
            </CardHeader>


            <CardContent className="space-y-4">

                {/* Certificate and Status */}
                <div className="flex items-start justify-between gap-4">

                    <Detail
                        label="Certificate ID"
                        value={lot.qualityCertificateId}
                    />


                    <Badge
                        variant={
                            lot.qualityStatus === "PASSED"
                                ? "default"
                                : "secondary"
                        }
                    >
                        {lot.qualityStatus}
                    </Badge>

                </div>


                {/* Moisture and Purity */}
                <div className="grid grid-cols-2 gap-4">

                    <Detail
                        label="Moisture"
                        value={
                            lot.moisture !== null
                                ? `${lot.moisture}%`
                                : "—"
                        }
                    />


                    <Detail
                        label="Purity"
                        value={
                            lot.purity !== null
                                ? `${lot.purity}%`
                                : "—"
                        }
                    />

                </div>


                {/* Grade */}
                <Detail
                    label="Grade"
                    value={lot.grade}
                />


                {/* Inspector */}
                <Detail
                    label="Inspector"
                    value={lot.inspectorName}
                />


                {/* Inspection Date */}
                <Detail
                    label="Inspection Date"
                    value={
                        lot.inspectionDate
                            ? formatDate(
                                lot.inspectionDate
                            )
                            : "—"
                    }
                />

            </CardContent>

        </Card>
    );
}


/* ---------------- Agreement Card ---------------- */

function AgreementCard({ lot }) {
    const hasAgreement =
        lot.agreementId &&
        lot.agreementId !== "—";

    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">

            <CardHeader>
                <CardTitle className="text-lg font-bold">
                    Agreement Information
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

                {!hasAgreement ? (
                    <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                        <p className="text-sm font-medium text-slate-600">
                            No agreement created yet
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                            Agreement details will appear here after approval.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-start justify-between gap-4">
                            <Detail
                                label="Agreement ID"
                                value={lot.agreementId || `AGR-${lot.lotNumber}`}
                            />

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono text-xs">
                                    {lot.agreementVersion || "v1.0"}
                                </Badge>
                                <Badge variant={lot.status?.includes("REJECTED") ? "destructive" : "secondary"}>
                                    {lot.status?.includes("REJECTED") ? "REJECTED BY FARMER" : lot.agreementStatus || lot.status}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Detail
                                label="Agreed Quantity"
                                value={
                                    lot.agreedQuantityKg ?? lot.agreedQuantity ?? lot.estimatedQuantityKg
                                        ? `${lot.agreedQuantityKg ?? lot.agreedQuantity ?? lot.estimatedQuantityKg} kg`
                                        : "—"
                                }
                            />

                            <Detail
                                label="Offered Unit Price"
                                value={
                                    lot.offeredPricePerKg ?? lot.pricePerKg
                                        ? `₹${lot.offeredPricePerKg ?? lot.pricePerKg}/kg`
                                        : "—"
                                }
                            />
                        </div>

                        {lot.status?.includes("REJECTED") && (
                            <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs space-y-2">
                                <div className="flex items-center justify-between font-bold text-red-900">
                                    <span>Agreement Version {lot.agreementVersion || "v1.0"} Rejected</span>
                                    <span className="text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded">Action Required</span>
                                </div>
                                <p className="text-slate-600 italic">
                                    "{lot.negotiationRemarks || 'Farmer rejected previous contract terms during negotiation. Create new version formulation.'}"
                                </p>
                                <Button
                                    size="sm"
                                    onClick={() => navigate(`/agreements/new/${lot.id}`)}
                                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold mt-1"
                                >
                                    Re-Formulate Agreement (Next Version)
                                </Button>
                            </div>
                        )}
                    </>
                )}

            </CardContent>
        </Card>
    );
}

/* ---------------- Procurement Workflow ---------------- */

const STATUS_ORDER = [
    "SUBMITTED",
    "QUALITY_INSPECTION",
    "QUALITY_CERTIFICATE",
    "PROCUREMENT_AGREEMENT",
    "PICKUP",
    "WAREHOUSE_RECEIPT",
    "PAYMENT",
    "COMPLETED",
];


function ProcurementWorkflow({ lot }) {
    const currentStatus = (
        lot.status || ""
    ).toUpperCase();

    let currentIndex = STATUS_ORDER.indexOf(currentStatus);
    if (currentIndex === -1) {
        if (currentStatus === "STORED" || currentStatus === "DELIVERED" || currentStatus === "RECEIVED") {
            currentIndex = STATUS_ORDER.indexOf("WAREHOUSE_RECEIPT");
        } else if (currentStatus === "AGREEMENT_ACCEPTED") {
            currentIndex = STATUS_ORDER.indexOf("PROCUREMENT_AGREEMENT");
        } else if (currentStatus === "DISPATCHED" || currentStatus === "IN_TRANSIT" || currentStatus === "PICKUP_SCHEDULED") {
            currentIndex = STATUS_ORDER.indexOf("PICKUP");
        }
    }


    const steps = STATUS_ORDER.map(
        (step, index) => ({
            label: formatStatusLabel(step),

            completed:
                currentIndex !== -1 &&
                index < currentIndex,

            active:
                index === currentIndex,
        })
    );


    return (
        <Card className="border-slate-200/80 bg-white shadow-xs">

            <CardHeader>
                <CardTitle className="text-lg font-bold">
                    Procurement Workflow
                </CardTitle>
            </CardHeader>


            <CardContent>

                <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">

                    {steps.map((step, index) => (

                        <div
                            key={step.label}
                            className="relative"
                        >

                            <div className="flex items-center gap-3">

                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${step.completed
                                        ? "bg-emerald-100 text-emerald-600"
                                        : step.active
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-slate-100 text-slate-400"
                                        }`}
                                >

                                    {step.completed ? (
                                        <CheckCircle2 className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-bold">
                                            {index + 1}
                                        </span>
                                    )}

                                </div>


                                <div>

                                    <p className="text-sm font-semibold">
                                        {step.label}
                                    </p>


                                    <p className="text-xs text-muted-foreground">

                                        {step.completed ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : step.active ? (
                                            <Clock3 className="h-5 w-5" />
                                        ) : (
                                            <span className="text-sm font-bold">
                                                {index + 1}
                                            </span>
                                        )}

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


/* ---------------- Status Formatting ---------------- */

function formatStatusLabel(status) {
    if (!status) {
        return "Unknown";
    }

    return status
        .split("_")
        .map(
            (word) =>
                word.charAt(0) +
                word.slice(1).toLowerCase()
        )
        .join(" ");
}


/* ---------------- Inspector Tracking Card ---------------- */
function InspectorTrackingCard({ lot, onAssignClick, onLocationUpdate }) {
    const isAssigned = !!lot.assignedInspectorName;
    const trackingStatus = (lot.inspectionTrackingStatus || "ASSIGNED").toUpperCase();

    return (
        <Card className="border-emerald-200 bg-emerald-50/40 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-emerald-600 p-2 text-white">
                        <Car className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-900">
                            Quality Inspector Visit & Live Tracking
                        </CardTitle>
                        <p className="text-xs text-slate-500">
                            Live field status of assigned quality officer for farm inspection
                        </p>
                    </div>
                </div>
                {isAssigned ? (
                    <Badge className="bg-emerald-600 text-white font-semibold">
                        {trackingStatus === "IN_TRANSIT" && "🚗 In Transit to Farmer"}
                        {trackingStatus === "ARRIVED_AT_FARM" && "📍 Arrived at Farm"}
                        {trackingStatus === "COMPLETED" && "✓ Inspection Complete"}
                        {trackingStatus === "ASSIGNED" && "📋 Inspector Assigned"}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                        Pending Assignment
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                {!isAssigned ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-emerald-200 bg-white p-6 text-center">
                        <UserCheck className="h-10 w-10 text-emerald-500 mb-2" />
                        <p className="text-sm font-semibold text-slate-800">No Quality Inspector Assigned Yet</p>
                        <p className="text-xs text-slate-500 max-w-md mt-1">
                            Assign a quality inspector to visit the farmer&apos;s field, conduct moisture & quality checks, and transmit real-time arrival status.
                        </p>
                        <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onAssignClick}>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Assign Quality Inspector Now
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg border border-slate-200/80">
                            <div>
                                <p className="text-xs text-slate-500 font-medium">Assigned Quality Officer</p>
                                <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                                    <UserCheck className="h-4 w-4 text-emerald-600" />
                                    {lot.assignedInspectorName}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                                    <Phone className="h-3 w-3 text-slate-400" />
                                    {lot.assignedInspectorPhone || "+91 9876543210"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 font-medium">Scheduled Visit Date & Time</p>
                                <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    {lot.scheduledInspectionDate ? formatDateTime(lot.scheduledInspectionDate) : "Scheduled Today"}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1 font-medium">
                                    Farmer App Notification Sent ✓
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-slate-500 font-medium">Farmer & Destination</p>
                                <p className="text-sm font-semibold text-slate-900 mt-1 flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    {lot.farmerName} ({lot.farmName})
                                </p>
                                <p className="text-xs text-slate-500 mt-1 truncate">
                                    Location: {lot.farmLatitude && lot.farmLongitude ? `${lot.farmLatitude}, ${lot.farmLongitude}` : (lot.farmerAddress || "Field Farm Site")}
                                </p>
                            </div>
                        </div>

                        {/* Travel Progress Steps */}
                        <div className="bg-white p-4 rounded-lg border border-slate-200/80">
                            <p className="text-xs font-semibold text-slate-700 mb-3">Inspector Field Visit Progress</p>
                            <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                <div className={`p-2 rounded ${trackingStatus === 'ASSIGNED' ? 'bg-amber-100 border border-amber-300 font-bold text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                                    1. Assigned
                                </div>
                                <div className={`p-2 rounded ${trackingStatus === 'IN_TRANSIT' ? 'bg-blue-100 border border-blue-300 font-bold text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                                    2. In Transit 🚗
                                </div>
                                <div className={`p-2 rounded ${trackingStatus === 'ARRIVED_AT_FARM' ? 'bg-emerald-100 border border-emerald-300 font-bold text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                    3. Arrived at Farm 📍
                                </div>
                                <div className={`p-2 rounded ${trackingStatus === 'SAMPLE_COLLECTED' || trackingStatus === 'COMPLETED' ? 'bg-purple-100 border border-purple-300 font-bold text-purple-800' : 'bg-slate-100 text-slate-600'}`}>
                                    4. Sample Collected 🌾
                                </div>
                            </div>

                            {/* Simulation Controls */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs text-slate-500 font-medium">Field Visit Status Controls:</span>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => onLocationUpdate("IN_TRANSIT", lot.farmLatitude ? lot.farmLatitude - 0.01 : 18.51, lot.farmLongitude ? lot.farmLongitude - 0.01 : 73.84)}
                                    >
                                        <Car className="mr-1 h-3.5 w-3.5 text-blue-600" />
                                        Set In-Transit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => onLocationUpdate("ARRIVED_AT_FARM", lot.farmLatitude || 18.5204, lot.farmLongitude || 73.8567)}
                                    >
                                        <MapPin className="mr-1 h-3.5 w-3.5 text-red-500" />
                                        Mark Arrived
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs text-purple-700 border-purple-300 bg-purple-50"
                                        onClick={() => onLocationUpdate("SAMPLE_COLLECTED")}
                                    >
                                        <ShieldCheck className="mr-1 h-3.5 w-3.5 text-purple-600" />
                                        Collect Sample & Return to Lab
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs text-slate-600"
                                        onClick={onAssignClick}
                                    >
                                        Re-Assign
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}   

/* ---------------- Assign Inspector Modal ---------------- */
function AssignInspectorModal({ isOpen, onClose, onSubmit }) {
    const [registeredInspectors, setRegisteredInspectors] = useState([]);
    const [selectedInspectorId, setSelectedInspectorId] = useState("");
    const [inspectorName, setInspectorName] = useState("");
    const [inspectorPhone, setInspectorPhone] = useState("");
    const [scheduledDate, setScheduledDate] = useState(
        new Date(Date.now() + 86400000).toISOString().slice(0, 16)
    );
    const [isLoadingInspectors, setIsLoadingInspectors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        async function fetchInspectors() {
            try {
                setIsLoadingInspectors(true);
                const list = await lotsApi.getInspectors();
                if (Array.isArray(list) && list.length > 0) {
                    setRegisteredInspectors(list);
                    const first = list[0];
                    setSelectedInspectorId(first.id);
                    setInspectorName(`${first.name} (${first.role || "Inspector"})`);
                    setInspectorPhone(first.phone || "+91 9876543210");
                } else {
                    // Default fallbacks if empty
                    const defaultList = [
                        { id: "def-1", name: "Ananya Roy", role: "Quality Inspector", phone: "+91 9876543210" },
                        { id: "def-2", name: "Vikram Singh", role: "Field Officer", phone: "+91 9876543211" },
                        { id: "def-3", name: "Suresh Kumar", role: "Senior Inspector", phone: "+91 9876543212" }
                    ];
                    setRegisteredInspectors(defaultList);
                    setSelectedInspectorId(defaultList[0].id);
                    setInspectorName(`${defaultList[0].name} (${defaultList[0].role})`);
                    setInspectorPhone(defaultList[0].phone);
                }
            } catch (err) {
                console.warn("Failed to fetch registered inspectors:", err);
            } finally {
                setIsLoadingInspectors(false);
            }
        }
        fetchInspectors();
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSelectChange = (e) => {
        const val = e.target.value;
        setSelectedInspectorId(val);
        if (val === "custom") {
            setInspectorName("");
            setInspectorPhone("");
            return;
        }
        const found = registeredInspectors.find((i) => String(i.id) === String(val));
        if (found) {
            setInspectorName(`${found.name} (${found.role || "Inspector"})`);
            setInspectorPhone(found.phone || "+91 9876543210");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const chosenId = selectedInspectorId !== "custom" && selectedInspectorId ? selectedInspectorId : null;
            await onSubmit({
                inspectorId: chosenId,
                inspectorName,
                inspectorPhone,
                scheduledDate: new Date(scheduledDate).toISOString(),
            });
            onClose();
        } catch (err) {
            alert(err.message || "Failed to assign inspector");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                        <h3 className="text-lg font-bold text-slate-900">Assign Quality Inspector</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700">Select Registered Inspector</label>
                            {isLoadingInspectors && <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />}
                        </div>
                        <select
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none bg-white"
                            value={selectedInspectorId}
                            onChange={handleSelectChange}
                        >
                            {registeredInspectors.map((insp) => (
                                <option key={insp.id} value={insp.id}>
                                    {insp.name} ({insp.role || "Inspector"}) — {insp.phone}
                                </option>
                            ))}
                            <option value="custom">+ Add New / Custom Inspector...</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector Full Name & Designation</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                            value={inspectorName}
                            onChange={(e) => setInspectorName(e.target.value)}
                            placeholder="e.g. Ananya Roy (Quality Inspector)"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Inspector Mobile Number (For Farmer Contact)</label>
                        <input
                            type="text"
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                            value={inspectorPhone}
                            onChange={(e) => setInspectorPhone(e.target.value)}
                            placeholder="+91 9876543210"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Inspection Date & Time</label>
                        <input
                            type="datetime-local"
                            className="w-full rounded-md border border-slate-300 p-2 text-sm focus:border-emerald-500 focus:outline-none"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                        🔔 <strong>Farmer App Sync:</strong> Assigning will send a notification to the farmer app with inspector details, contact number, and real-time visit tracking.
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isSubmitting ? "Assigning..." : "Assign & Notify Farmer"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}



export default ProcurementLotDetails;