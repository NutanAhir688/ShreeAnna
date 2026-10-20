import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CONFIGS } from "@/config/rolePermissions";
import {
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Building2,
  FileQuestion,
  Headphones,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Support() {
  const { user } = useAuth();
  const currentRole = user?.role || "FpoManager";
  const roleMeta = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.FpoManager;

  // Support Ticket Form State
  const [category, setCategory] = useState("Procurement & QC");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [submitting, setSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSubmitting(true);
    setTimeout(() => {
      const ticketId = `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketSuccess(ticketId);
      setSubmitting(false);
      setSubject("");
      setMessage("");
    }, 600);
  };

  const nodalOfficers = [
    {
      district: "Dahod District",
      name: "Dr. Arvind Rathod",
      role: "Chief District Agricultural Officer & Nodal Coordinator",
      phone: "+91 94270 11234",
      email: "cdao-dahod@gujarat.gov.in",
      location: "Collectorate Compound, Dahod",
    },
    {
      district: "Anand District",
      name: "Smt. Meenaben Patel",
      role: "FPO Facilitation Officer & Warehouse Registrar",
      phone: "+91 98251 55432",
      email: "fpo-anand@shreeanna.gov.in",
      location: "APMC Market Yard, Karamsad, Anand",
    },
    {
      district: "Mehsana District",
      name: "Shri Rajesh Solanki",
      role: "Regional Logistics & Fleet Inspector",
      phone: "+91 97240 88912",
      email: "logistics-mehsana@shreeanna.gov.in",
      location: "Industrial Transport Hub, Mehsana",
    },
  ];

  const faqs = [
    {
      q: "How are farmer procurement payments disbursed via DBT?",
      a: "Farmer settlements are created immediately upon lot QC certification. Authorized accountants release funds directly to the farmer's registered bank account via Razorpay MockGateway / State Cooperative Bank DBT integration.",
    },
    {
      q: "What is the procedure when a delivery driver requests the OTP?",
      a: "Upon physical cargo inspection at the warehouse or customer destination, the receiving party shares the 4-digit numeric OTP generated on their order screen. Once entered by the driver, the shipment automatically transitions to DELIVERED.",
    },
    {
      q: "How can SHGs and processors list value-added millet products?",
      a: "Processors can navigate to 'Create Product' under Value Addition & Marketplace, select their certified source lot, specify product title, price per kg, and upload packaging photos to publish directly to the live store.",
    },
    {
      q: "What standards are enforced for Grade A Millet Certification?",
      a: "Quality Inspectors test incoming grains for moisture (<12%), foreign organic matter (<1%), and grain damage (<2%) before signing the digital certification manifest.",
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#14341C] via-[#1B4324] to-[#2E7D42] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Gujarat Millet Mission • Helpdesk
              </Badge>
              <span className="text-xs text-emerald-200">24×7 Nodal Network</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
              <Headphones className="w-6 h-6 text-[#86D49B]" />
              <span>Official Support & Field Helpdesk</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl">
              Dedicated technical, procurement, and settlement support for all value chain participants across Gujarat.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 self-start sm:self-auto sm:text-right">
            <span className="text-[11px] text-emerald-200/90">Current User Role:</span>
            <Badge className={`${roleMeta.badgeColor} border text-xs font-bold px-2.5 py-0.5`}>
              {roleMeta.roleName}
            </Badge>
          </div>
        </div>
      </div>

      {/* Emergency Helpline Quick Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#1B4324] dark:text-emerald-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Toll-Free Kisan & FPO Helpline
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                1800-233-0255
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Mon - Sat: 8 AM - 8 PM
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#1B4324] dark:text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                WhatsApp Field Assistance
              </p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                +91 98765 43210
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                Instant Dispatch Support
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs hover:border-emerald-300 transition-colors">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#1B4324] dark:text-emerald-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Official Mission Email
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                support@shreeanna.gov.in
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Average reply in &lt; 2 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Left Column: Raise Ticket Form (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <CardTitle className="text-base text-[#142017] dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-[#1B4324] dark:text-emerald-400" />
                <span>Raise an Operational Support Request</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Submit an issue regarding lot inspection, driver allocation, or settlement payout
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              {ticketSuccess ? (
                <div className="p-6 rounded-2xl bg-[#EFF5EB] dark:bg-emerald-950/40 border border-[#D6E6D0] dark:border-emerald-800 text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-[#1B4324] dark:text-emerald-400 mx-auto" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Support Ticket Logged: {ticketSuccess}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                    Your request has been routed to the District Nodal Officer. A confirmation SMS with tracking details has been sent to your registered phone.
                  </p>
                  <Button
                    onClick={() => setTicketSuccess(null)}
                    size="sm"
                    className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs rounded-lg cursor-pointer"
                  >
                    Submit Another Query
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Issue Category
                      </Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 outline-none focus:border-emerald-600"
                      >
                        <option value="Procurement & QC">Procurement & Lot QC Inspection</option>
                        <option value="Logistics & Driver OTP">Logistics & Driver Delivery OTP</option>
                        <option value="Farmer DBT Settlement">Farmer DBT & Settlement Payout</option>
                        <option value="Warehouse Allocation">Warehouse Silo & Storage Allocation</option>
                        <option value="Marketplace Product">Marketplace Product Listing</option>
                        <option value="Account & Login">Account & Portal Access</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Callback Contact Phone
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject / Lot / Order Reference
                    </Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Lot LOT-2026-004 moisture certificate query"
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Detailed Description of Issue
                    </Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please explain what happened, including any error messages or reference codes..."
                      rows={4}
                      required
                      className="text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Logged from: <strong className="text-slate-600 dark:text-slate-300">{user?.email || "user@shreeanna.com"}</strong>
                    </span>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs cursor-pointer rounded-lg"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {submitting ? "Transmitting Ticket..." : "Submit Support Request"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Frequently Asked Questions */}
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-[#1B4324] dark:text-emerald-400" />
                <CardTitle className="text-base text-[#142017] dark:text-white">
                  Frequently Asked Questions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-emerald-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] animate-in fade-in">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Regional District Nodal Officers (2 cols) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1B4324] dark:text-emerald-400" />
                <CardTitle className="text-sm font-bold text-[#142017] dark:text-white">
                  Regional District Nodal Officers
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Direct contacts for state mission coordinators
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs">
              {nodalOfficers.map((off) => (
                <div
                  key={off.district}
                  className="p-3.5 rounded-xl bg-[#F8FAF7] dark:bg-slate-800/50 border border-[#E3ECE0] dark:border-slate-700 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1B4324] dark:text-emerald-400">
                      {off.district}
                    </span>
                    <Badge variant="outline" className="text-[9px] border-emerald-300 text-emerald-700">
                      On-Duty
                    </Badge>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{off.name}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{off.role}</p>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#1B4324] dark:text-emerald-400 shrink-0" />
                      <a href={`tel:${off.phone}`} className="hover:underline font-mono">
                        {off.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-[#1B4324] dark:text-emerald-400 shrink-0" />
                      <a href={`mailto:${off.email}`} className="hover:underline font-mono truncate">
                        {off.email}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
