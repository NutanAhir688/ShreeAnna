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
import { ordersApi } from "@/services/api";
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Lock,
  QrCode,
  Sparkles,
} from "lucide-react";

export default function OrderRazorpayPaymentDialog({
  order,
  open,
  onOpenChange,
  onPaymentSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("card");
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);

  // Card state
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("12/28");
  const [cvv, setCvv] = useState("123");

  // UPI state
  const [upiId, setUpiId] = useState("");

  useEffect(() => {
    if (order) {
      setCardholderName(order.customerName || "Customer");
      if (order.customerPhone) {
        const cleanPhone = order.customerPhone.replace(/\D/g, "").slice(-10);
        setUpiId(cleanPhone ? `${cleanPhone}@okhdfcbank` : "customer@okhdfcbank");
      } else {
        setUpiId("customer@okhdfcbank");
      }
      setSuccessResult(null);
      setError(null);
    }
  }, [order]);

  if (!order) return null;

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

  const handleOpenHostedCheckout = () => {
    if (order.razorpayShortUrl) {
      window.open(order.razorpayShortUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleMakePayment = async () => {
    setError(null);

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
        setError("Please enter a valid UPI ID (e.g. yourname@okhdfcbank).");
        return;
      }
    }

    try {
      setLoading(true);
      const cleanCard = cardNumber.replace(/\s/g, "");
      const last4 = cleanCard.slice(-4) || "4242";

      const res = await ordersApi.processPayment(order.id, {
        paymentMethod:
          paymentType === "card"
            ? `Razorpay Card (•••• ${last4})`
            : `Razorpay UPI (${upiId.trim()})`,
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
    const wasSuccess = !!successResult;
    setSuccessResult(null);
    setError(null);
    onOpenChange(false);
    if (wasSuccess && onPaymentSuccess) {
      onPaymentSuccess(successResult);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0C2340] text-white font-bold text-xs shadow-sm">
              RZP
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <span>Razorpay MockGateway</span>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 py-0">
                  Sandbox Active
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Order #{order.orderNumber} • Fast & Secure Escrow Checkout
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
              <h3 className="text-lg font-bold text-slate-900">
                Payment Authorized & Captured!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                ₹{Number(successResult.totalAmount || order.totalAmount).toLocaleString("en-IN")} received via{" "}
                <span className="font-semibold text-slate-700">{successResult.paymentMethod}</span>. Driver is dispatched!
              </p>
            </div>

            <div className="rounded-xl border bg-slate-50 p-3.5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono font-medium text-slate-800">
                  {successResult.transactionId || "pay_mock_auth"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Number</span>
                <span className="font-mono font-medium text-slate-800">
                  {successResult.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway Status</span>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] py-0 px-2">
                  Captured
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-semibold text-emerald-700 uppercase">
                  {successResult.paymentStatus || "PAID"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                className="w-full bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs h-10 rounded-xl"
                onClick={handleClose}
              >
                Track Live Delivery & Driver Dispatch
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4 py-1">
            {/* Amount & Beneficiary Header Banner */}
            <div className="rounded-xl border bg-slate-50/80 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Recipient Customer</span>
                <span className="font-medium text-slate-800">
                  {order.customerName} ({order.customerPhone || "Mobile Verified"})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Delivery Address</span>
                <span className="text-slate-800 truncate max-w-[240px]">
                  {order.shippingAddress}, {order.city}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Total Amount to Pay</span>
                <span className="text-lg font-bold text-emerald-700">
                  ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Payment Method Selector (Card or UPI) */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-700">
                Select MockGateway Payment Mode
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
                    UPI / QR Code
                  </TabsTrigger>
                </TabsList>

                {/* Card Payment Form */}
                <TabsContent value="card" className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="orderCardNumber" className="text-xs font-medium text-slate-700">
                        Card Number
                      </Label>
                      <button
                        type="button"
                        onClick={() => setCardNumber("4242 4242 4242 4242")}
                        className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        Auto-Fill Test Card
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="orderCardNumber"
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
                    <Label htmlFor="orderCardholderName" className="text-xs font-medium text-slate-700">
                      Cardholder Name
                    </Label>
                    <Input
                      id="orderCardholderName"
                      type="text"
                      placeholder="Name on Card"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="orderExpiryDate" className="text-xs font-medium text-slate-700">
                        Expiry (MM/YY)
                      </Label>
                      <Input
                        id="orderExpiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        className="text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="orderCvv" className="text-xs font-medium text-slate-700">
                          CVV
                        </Label>
                        <Lock size={12} className="text-slate-400" />
                      </div>
                      <Input
                        id="orderCvv"
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

                {/* UPI / QR Payment Form */}
                <TabsContent value="upi" className="space-y-3 pt-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="orderUpiId" className="text-xs font-medium text-slate-700">
                        UPI ID / Virtual Payment Address
                      </Label>
                      <button
                        type="button"
                        onClick={() => setUpiId("customer@okhdfcbank")}
                        className="text-[11px] text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        Auto-Fill Test VPA
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="orderUpiId"
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="text-xs pl-8 font-mono"
                      />
                      <Smartphone
                        size={14}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                    </div>
                  </div>

                  {/* QR Simulation Card */}
                  <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-3 flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-emerald-200 shadow-2xs shrink-0">
                      <QrCode className="w-10 h-10 text-emerald-800" />
                    </div>
                    <div className="text-xs space-y-0.5 min-w-0">
                      <p className="font-bold text-emerald-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Instant UPI Intent & Dynamic QR</span>
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        Scan or enter test VPA to trigger immediate captured confirmation.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* Hosted Checkout Link Option */}
            {order.razorpayShortUrl && (
              <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs">
                <span className="text-blue-900 font-medium">Or test on live MockGateway page:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenHostedCheckout}
                  className="h-7 text-xs border-blue-300 text-blue-700 hover:bg-blue-100 cursor-pointer flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  <span>Hosted Checkout</span>
                </Button>
              </div>
            )}

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMakePayment}
                disabled={loading}
                className="bg-[#1B4324] hover:bg-[#14341C] text-white font-semibold text-xs h-10 rounded-xl flex-1 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing with MockGateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} />
                    <span>Pay ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")} via Razorpay</span>
                  </>
                )}
              </Button>
            </DialogFooter>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center pt-1">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>Razorpay MockGateway Test Mode • 256-bit Encrypted Escrow</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
