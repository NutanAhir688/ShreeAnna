import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { settlementsApi } from "@/services/api";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function RazorpayPaymentDialog({
  settlement,
  open,
  onOpenChange,
  onPaymentSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("card");
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("123");

  // UPI form state
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    if (settlement) {
      setCardholderName(settlement.farmerName || "FPO Settlement Account");
      if (settlement.farmerPhone) {
        setUpiId(`${settlement.farmerPhone}@upi`);
      } else {
        setUpiId("farmer@okhdfcbank");
      }
    }
  }, [settlement]);

  if (!settlement) return null;

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setExpiryDate(val);
  };

  const handleOpenHostedCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await settlementsApi.createPaymentLink(settlement.id);
      if (res.shortUrl) {
        window.open(res.shortUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Failed to open MockGateway checkout:", err);
      setError(err.message || "Failed to generate MockGateway checkout page");
    } finally {
      setLoading(false);
    }
  };

  const handleMakePayment = async () => {
    setError(null);

    // Validation
    if (paymentType === "card") {
      const cleanCard = cardNumber.replace(/\s/g, "");
      if (cleanCard.length < 16) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!expiryDate || expiryDate.length < 5) {
        setError("Please enter a valid expiry date (MM/YY).");
        return;
      }
      if (!cvv || cvv.length < 3) {
        setError("Please enter a valid 3-digit CVV.");
        return;
      }
    } else if (paymentType === "upi") {
      if (!upiId || !upiId.includes("@")) {
        setError("Please enter a valid UPI ID (e.g., name@okhdfcbank).");
        return;
      }
    }

    try {
      setLoading(true);
      const cleanCard = cardNumber.replace(/\s/g, "");
      const last4 = cleanCard.slice(-4) || "4242";

      const res = await settlementsApi.processPayment(settlement.id, {
        paymentMethod:
          paymentType === "card"
            ? `Card (•••• ${last4})`
            : `UPI (${upiId.trim()})`,
        cardNumber: cleanCard,
        cardholderName: cardholderName.trim(),
        expiryDate,
        cvv,
        upiId: upiId.trim(),
        simulateSuccess: true,
      });

      setSuccessResult(res);
      if (onPaymentSuccess) {
        onPaymentSuccess(res);
      }
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err.message || "Failed to process payment via MockGateway");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessResult(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm">
              RZP
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Razorpay Payment Gateway
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Secure Escrow Settlement • Backend Gateway Integration
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {successResult ? (
          <div className="space-y-4 py-3">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Payment Successfully Completed!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                ₹{Number(successResult.finalAmount || 0).toLocaleString("en-IN")} transferred to{" "}
                <span className="font-semibold text-slate-700">
                  {successResult.farmerName}
                </span>{" "}
                for Lot #{successResult.lotId}.
              </p>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-medium text-slate-800">
                  {successResult.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Method</span>
                <span className="font-medium text-slate-800">
                  {successResult.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Status</span>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] py-0 px-2">
                  Captured
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date</span>
                <span className="text-slate-800">
                  {successResult.paymentDate || "Just now"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button className="w-full" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            {/* Amount & Beneficiary Header Banner */}
            <div className="rounded-xl border bg-slate-50/80 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Settlement Code</span>
                <span className="font-semibold text-slate-800">
                  {settlement.settlementCode || settlement.id}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Farmer / Beneficiary</span>
                <span className="font-medium text-slate-800">
                  {settlement.farmerName} ({settlement.farmerPhone || "Registered"})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Procurement Lot</span>
                <span className="text-slate-800">
                  Lot #{settlement.lotId} ({settlement.quantity} {settlement.unit || "kg"} • {settlement.millet})
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Amount Due</span>
                <span className="text-lg font-bold text-emerald-600">
                  ₹{Number(settlement.finalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Payment Method Selector (Card or UPI) */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-700">
                Select Payment Option
              </Label>
              <Tabs
                value={paymentType}
                onValueChange={(val) => {
                  setPaymentType(val);
                  setError(null);
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card" className="gap-2 text-xs">
                    <CreditCard size={15} />
                    Debit / Credit Card
                  </TabsTrigger>
                  <TabsTrigger value="upi" className="gap-2 text-xs">
                    <Smartphone size={15} />
                    UPI / QR
                  </TabsTrigger>
                </TabsList>

                {/* Card Payment Form */}
                <TabsContent value="card" className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="cardNumber" className="text-xs font-medium text-slate-700">
                        Card Number
                      </Label>
                      <button
                        type="button"
                        onClick={() => setCardNumber("4242 4242 4242 4242")}
                        className="text-[11px] text-blue-600 hover:underline font-medium"
                      >
                        Use Test Card
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="font-mono text-xs pl-8 tracking-wider"
                      />
                      <CreditCard
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cardholderName" className="text-xs font-medium text-slate-700">
                      Cardholder Name
                    </Label>
                    <Input
                      id="cardholderName"
                      type="text"
                      placeholder="Name on Card"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="expiryDate" className="text-xs font-medium text-slate-700">
                        Expiry (MM/YY)
                      </Label>
                      <Input
                        id="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="cvv" className="text-xs font-medium text-slate-700">
                          CVV
                        </Label>
                        <Lock size={12} className="text-slate-400" />
                      </div>
                      <Input
                        id="cvv"
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        className="text-xs font-mono"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* UPI Payment Form */}
                <TabsContent value="upi" className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="upiId" className="text-xs font-medium text-slate-700">
                      Virtual Payment Address / UPI ID
                    </Label>
                    <div className="relative">
                      <Input
                        id="upiId"
                        type="text"
                        placeholder="e.g. mobile@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="text-xs pl-8"
                      />
                      <Smartphone
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["@okhdfcbank", "@okicici", "@paytm", "@upi"].map((suffix) => (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => {
                          const base = (upiId.split("@")[0] || settlement.farmerPhone || "farmer").trim();
                          setUpiId(`${base}${suffix}`);
                        }}
                        className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-100"
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-blue-600 shrink-0" />
              <span>
                MockGateway Razorpay Test Mode • No actual currency deducted
              </span>
            </div>

            <DialogFooter className="flex-col sm:flex-col gap-2 pt-2">
              {/* PRIMARY ACTION: "Make Payment" replacing "Instant DBT Payment" */}
              <Button
                onClick={handleMakePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium h-9 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    Make Payment • ₹{Number(settlement.finalAmount || 0).toLocaleString("en-IN")}
                  </>
                )}
              </Button>

              {/* Secondary button to open MockGateway checkout page */}
              <Button
                variant="outline"
                onClick={handleOpenHostedCheckout}
                disabled={loading}
                className="w-full gap-2 text-xs h-8"
              >
                <ExternalLink size={13} />
                Open MockGateway Checkout Page
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
