import {
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  User,
  CreditCard,
  ExternalLink,
  Download,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { settlementsApi } from "@/services/api";
import RazorpayPaymentDialog from "../components/RazorpayPaymentDialog";

function SettlementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function loadSettlement() {
      try {
        const data = await settlementsApi.getById(id);
        if (data) {
          setSettlement(data);
        }
      } catch (err) {
        console.error("Failed to fetch settlement details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettlement();
  }, [id]);

  const handleDownloadBill = () => {
    if (!settlement) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups in your browser to view and download the bill.");
      return;
    }

    const code = settlement.settlementCode || settlement.id;
    const order = settlement.orderId || "N/A";
    const farmer = settlement.farmerName || "Farmer";
    const buyer = settlement.buyer || "Anand Agri Producers FPO";
    const millet = settlement.millet || "Millet";
    const qty = settlement.quantity ? `${settlement.quantity} kg` : "N/A";
    const rate = settlement.pricePerKg ? `₹${settlement.pricePerKg.toFixed(2)}/kg` : "N/A";
    const gross = settlement.grossAmount ? `₹${Number(settlement.grossAmount).toLocaleString("en-IN")}` : "₹0";
    const fpoMargin = settlement.fpoMargin ? `- ₹${Number(settlement.fpoMargin).toLocaleString("en-IN")}` : "₹0";
    const transport = settlement.transportCost ? `- ₹${Number(settlement.transportCost).toLocaleString("en-IN")}` : "₹0";
    const other = settlement.otherCharges ? `- ₹${Number(settlement.otherCharges).toLocaleString("en-IN")}` : "₹0";
    const total = `₹${Number(settlement.finalAmount || 0).toLocaleString("en-IN")}`;
    const txn = settlement.transactionId || settlement.razorpayPaymentLinkId || "Pending";
    const pDate = settlement.paymentDate || new Date().toLocaleString("en-IN");
    const method = settlement.paymentMethod || "Razorpay MockGateway / DBT";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Settlement Bill - ${code}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; background: #fff; margin: 0; }
            .bill-wrapper { max-width: 800px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 8px; padding: 32px; }
            .header { border-bottom: 2px solid #059669; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 22px; font-weight: 700; color: #065f46; margin: 0; }
            .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
            .status-badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; background: #d1fae5; color: #047857; font-weight: 700; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; }
            .card-title { font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase; margin-bottom: 8px; }
            .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13.5px; border-bottom: 1px dashed #e2e8f0; }
            .row:last-child { border-bottom: none; }
            .table-wrap { margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
            .table-header { background: #f1f5f9; padding: 10px 16px; font-weight: 600; font-size: 12px; color: #475569; display: flex; justify-content: space-between; }
            .table-body { padding: 10px 16px; }
            .total-banner { background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 6px; padding: 16px; margin: 20px 0; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 15px; font-weight: 700; color: #065f46; }
            .total-val { font-size: 22px; font-weight: 800; color: #065f46; }
            .footer { margin-top: 36px; padding-top: 18px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
            @media print {
              body { padding: 0; }
              .bill-wrapper { border: none; padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="bill-wrapper">
            <div class="header">
              <div>
                <h1 class="title">SHREE ANNA PROCUREMENT COOPERATIVE</h1>
                <div class="sub">Official Farmer Procurement Settlement & Disbursement Bill</div>
              </div>
              <div class="status-badge">${(settlement.status || "PAID").toUpperCase()}</div>
            </div>

            <div class="grid">
              <div class="card">
                <div class="card-title">Beneficiary Farmer</div>
                <div style="font-weight: 700; font-size: 15px;">${farmer}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Direct Bank Transfer (DBT) Recipient</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Lot Number: ${settlement.lotId || "N/A"}</div>
              </div>
              <div class="card">
                <div class="card-title">Buyer / FPO Center</div>
                <div style="font-weight: 700; font-size: 15px;">${buyer}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 2px;">Order ID: ${order}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Settlement ID: ${code}</div>
              </div>
            </div>

            <div class="table-wrap">
              <div class="table-header">
                <span>DESCRIPTION</span>
                <span>AMOUNT (INR)</span>
              </div>
              <div class="table-body">
                <div class="row"><span>Commodity / Variety</span><span style="font-weight:600;">${millet}</span></div>
                <div class="row"><span>Procured Quantity</span><span>${qty}</span></div>
                <div class="row"><span>Agreed Price per Kg</span><span>${rate}</span></div>
                <div class="row"><span>Gross Procurement Value</span><span style="font-weight:600;">${gross}</span></div>
                <div class="row"><span>FPO Facilitation Fee (5%)</span><span style="color:#b91c1c;">${fpoMargin}</span></div>
                <div class="row"><span>Transport & Logistics Cost</span><span style="color:#b91c1c;">${transport}</span></div>
                <div class="row"><span>Other Adjustments</span><span style="color:#b91c1c;">${other}</span></div>
              </div>
            </div>

            <div class="total-banner">
              <span class="total-label">FINAL SETTLEMENT PAYOUT</span>
              <span class="total-val">${total}</span>
            </div>

            <div class="card" style="margin-top: 20px;">
              <div class="card-title">Transaction & Gateway Info</div>
              <div class="row"><span>Payment Method</span><span style="font-weight:600;">${method}</span></div>
              <div class="row"><span>Transaction / Payment ID</span><span style="font-family:monospace;font-weight:600;">${txn}</span></div>
              <div class="row"><span>Settlement Date</span><span>${pDate}</span></div>
            </div>

            <div class="footer">
              <div>
                <strong>FPO Disbursement Office</strong><br/>
                Digitally Reconciled & Approved
              </div>
              <div style="text-align: right;">
                <strong>Razorpay MockGateway Integration</strong><br/>
                Auto-generated Electronic Voucher
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800" />
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <h2 className="font-semibold">Settlement not found</h2>
        <Button
          onClick={() => navigate("/settlements")}
          variant="outline"
          className="mt-4"
        >
          Back to Settlements
        </Button>
      </div>
    );
  }

  const isPending =
    settlement.status === "Pending Settlement" ||
    settlement.status === "Pending" ||
    settlement.status === "Awaiting Delivery";

  const handleSuccess = (updated) => {
    setSettlement(updated);
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/settlements")}
        className="gap-2 text-sm text-muted-foreground hover:text-foreground -ml-3"
      >
        <ArrowLeft size={16} />
        Back to Settlements
      </Button>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">
            {settlement.settlementCode || settlement.id}
          </h1>

          <p className="text-sm text-muted-foreground">
            Order {settlement.orderId}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleDownloadBill}
            className="gap-2 text-emerald-800 border-emerald-200 hover:bg-emerald-50"
          >
            <Download size={16} />
            Download Bill
          </Button>

          <Badge
            className={
              !isPending
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-sm px-3 py-1 font-medium"
                : "bg-amber-100 text-amber-700 hover:bg-amber-100 text-sm px-3 py-1 font-medium"
            }
          >
            {settlement.status}
          </Badge>
        </div>
      </div>

      {/* Amount */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-100 p-2">
            <CircleDollarSign size={22} className="text-emerald-600" />
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Settlement Amount</p>
            <p className="text-3xl font-semibold text-slate-900">
              ₹{Number(settlement.finalAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Buyer + farmer */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Buyer Details</h2>

          <div className="mt-5 space-y-4">
            <Info
              label="Buyer / Organization"
              value={settlement.buyerName}
              icon={User}
            />

            <Info
              label="Buyer Type"
              value={settlement.buyerType}
              icon={User}
            />

            <Info
              label="Order Reference"
              value={settlement.orderId}
              icon={CircleDollarSign}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Farmer Beneficiary Details</h2>

          <div className="mt-5 space-y-4">
            <Info
              label="Farmer Name"
              value={settlement.farmerName}
              icon={User}
            />

            <Info
              label="Farmer ID"
              value={settlement.farmerId}
              icon={User}
            />

            <Info
              label="Procurement Lot"
              value={`Lot #${settlement.lotId} (${settlement.millet})`}
              icon={CircleDollarSign}
            />
          </div>
        </div>
      </div>

      {/* Calculation */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">Settlement Calculation</h2>

        <div className="mt-5 space-y-3">
          <Row
            label={`${settlement.quantity} kg × ₹${settlement.pricePerKg}/kg`}
            value={settlement.grossAmount}
          />

          <Row
            label="Procurement Gross Amount"
            value={settlement.procurementAmount || settlement.grossAmount}
          />

          <Row
            label="FPO Facilitation Fee / Margin"
            value={settlement.fpoMargin}
          />

          <Row
            label="Transport & Logistics Cost"
            value={settlement.transportCost}
          />

          <Row
            label="Other Adjustments"
            value={settlement.otherCharges}
          />

          <div className="border-t pt-3">
            <Row
              label="Final Settlement Payout"
              value={settlement.finalAmount}
              bold
            />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Payment Information</h2>
          {settlement.razorpayShortUrl && (
            <a
              href={settlement.razorpayShortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
            >
              <ExternalLink size={14} />
              Open Razorpay Checkout
            </a>
          )}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Info
            label="Payment Gateway"
            value={settlement.paymentMethod || "Razorpay (MockGateway)"}
          />

          <Info
            label="Transaction / Payment ID"
            value={settlement.transactionId || settlement.razorpayPaymentLinkId || "Not yet generated"}
          />

          <Info
            label="Payment Date"
            value={settlement.paymentDate || "Pending disbarment"}
          />

          <Info
            label="Delivery Date"
            value={settlement.deliveryDate || "Not recorded"}
          />
        </div>

        {isPending ? (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
            >
              <CreditCard size={16} />
              Disburse Payment via Razorpay
            </Button>
          </div>
        ) : (
          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={handleDownloadBill}
              className="gap-2 text-emerald-800 border-emerald-300 hover:bg-emerald-50"
            >
              <Download size={16} />
              Download Bill
            </Button>
          </div>
        )}
      </div>

      <RazorpayPaymentDialog
        settlement={settlement}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPaymentSuccess={handleSuccess}
      />
    </div>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="flex gap-3">
      {Icon && (
        <div className="mt-0.5 rounded-lg bg-muted p-2">
          <Icon size={16} />
        </div>
      )}

      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={bold ? "font-semibold" : "text-sm text-muted-foreground"}
      >
        {label}
      </span>

      <span
        className={bold ? "text-lg font-semibold text-slate-900" : "text-sm font-medium"}
      >
        ₹{Number(value || 0).toLocaleString("en-IN")}
      </span>
    </div>
  );
}

export default SettlementDetails;