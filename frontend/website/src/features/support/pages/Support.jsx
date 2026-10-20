import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { ROLE_CONFIGS } from "@/config/rolePermissions";
import { supportChatApi } from "@/services/api";
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
  RotateCcw,
  Sparkles,
  Cpu,
  ShieldCheck,
  Layers,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Support() {
  const { user } = useAuth();
  const currentRole = user?.role || "Farmer";
  const roleMeta = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.Farmer || ROLE_CONFIGS.FpoManager;

  // Akka.NET Actor Chat State
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const [journeyStages, setJourneyStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loadingStages, setLoadingStages] = useState(true);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`);

  const chatEndRef = useRef(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load journey stages when role changes
  useEffect(() => {
    let isMounted = true;
    async function loadStagesAndConnect() {
      setLoadingStages(true);
      try {
        const stages = await supportChatApi.getJourneyStages(selectedRole);
        if (!isMounted) return;
        setJourneyStages(stages || []);

        const initialStage = stages?.[0]?.name || "Procurement Center Arrival";
        setSelectedStage(initialStage);

        // Connect session actor in Akka.NET
        const initialMsgs = await supportChatApi.connect({
          sessionId,
          role: selectedRole,
          userName: user?.fullName || `${selectedRole} Member`,
          journeyStage: initialStage,
        });

        if (isMounted && Array.isArray(initialMsgs)) {
          setMessages(initialMsgs);
        }
      } catch (err) {
        console.error("Failed to initialize Akka.NET chat support session:", err);
      } finally {
        if (isMounted) setLoadingStages(false);
      }
    }

    loadStagesAndConnect();
    return () => {
      isMounted = false;
    };
  }, [selectedRole, sessionId, user?.fullName]);

  // Handle stage change
  const handleStageSelect = (stageName) => {
    setSelectedStage(stageName);
  };

  // Handle send message to Akka.NET actor
  const handleSendMessage = async (e, textToSend = null) => {
    if (e) e.preventDefault();
    const content = (textToSend || inputMessage).trim();
    if (!content || sending) return;

    setSending(true);
    setInputMessage("");

    try {
      const deliveredMsgs = await supportChatApi.sendMessage({
        sessionId,
        sender: user?.fullName || `${selectedRole} Member`,
        content,
        journeyStage: selectedStage,
        role: selectedRole,
      });

      if (Array.isArray(deliveredMsgs) && deliveredMsgs.length > 0) {
        setMessages((prev) => {
          // Avoid duplicate IDs
          const existingIds = new Set(prev.map((m) => m.id));
          const newUnique = deliveredMsgs.filter((m) => !existingIds.has(m.id));
          return [...prev, ...newUnique];
        });
      }
    } catch (err) {
      console.error("Error communicating with Akka.NET actor:", err);
    } finally {
      setSending(false);
    }
  };

  // Reset Actor Session
  const handleResetSession = async () => {
    setResetting(true);
    try {
      const resetMsgs = await supportChatApi.resetSession(sessionId);
      if (Array.isArray(resetMsgs)) {
        setMessages(resetMsgs);
      }
    } catch (err) {
      console.error("Error resetting actor session:", err);
    } finally {
      setResetting(false);
    }
  };

  const activeStageObj = journeyStages.find((s) => s.name === selectedStage) || journeyStages[0];

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
      q: "How does the Akka.NET Actor Model power this procurement chat support?",
      a: "Each connected user is backed by a dedicated UserSessionActor running in memory on the backend. This gives every participant complete fault isolation (an error in one session never disrupts others) and an ephemeral queue that guarantees in-order message delivery without persistent database bottlenecks.",
    },
    {
      q: "How are farmer procurement payments disbursed via DBT?",
      a: "Farmer settlements are created immediately upon lot QC certification. Authorized accountants release funds directly to the farmer's registered bank account via Razorpay MockGateway / State Cooperative Bank DBT integration.",
    },
    {
      q: "What is the procedure when a delivery driver requests the OTP?",
      a: "Upon physical cargo inspection at the warehouse or customer destination, the receiving party shares the 4-digit numeric OTP generated on their order screen. Once entered by the driver, the shipment automatically transitions to DELIVERED.",
    },
    {
      q: "What standards are enforced for Grade A Millet Certification?",
      a: "Quality Inspectors test incoming grains for moisture (≤12%), foreign organic matter (≤1%), and grain damage (≤2%) before signing the digital certification manifest.",
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
                Gujarat Millet Mission • 24×7 Helpdesk
              </Badge>
              <span className="flex items-center gap-1.5 text-xs text-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
                </span>
                Akka.NET Actor Online
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1.5 flex items-center gap-2">
              <Headphones className="w-6 h-6 text-[#86D49B]" />
              <span>Procurement Journey Chat Support</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl">
              Real-time nodal assistance across each procurement milestone, powered by dedicated fault-isolated Akka.NET actors.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 self-start sm:self-auto sm:text-right">
            <span className="text-[11px] text-emerald-200/90">Current User Role:</span>
            <Badge className={`${roleMeta.badgeColor || "bg-emerald-100 text-emerald-800"} border text-xs font-bold px-2.5 py-0.5`}>
              {roleMeta.roleName || selectedRole}
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
        {/* Left Column: Akka.NET Actor Chat Support Component (3 cols) */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-[#E3ECE0] dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60 bg-[#F9FBF8] dark:bg-slate-900/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-[#142017] dark:text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#1B4324] dark:text-emerald-400" />
                      <span>Live Procurement Chat Support</span>
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                      Akka.NET Actor
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Lightweight in-memory process per user • Fault isolation • Ephemeral delivery queue
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetSession}
                    disabled={resetting}
                    title="Reset Akka Actor Queue"
                    className="h-8 px-2.5 text-xs text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 mr-1 ${resetting ? "animate-spin" : ""}`} />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Journey Stage Selector */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#1B4324] dark:text-emerald-400" />
                    <Label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                      Procurement Journey Stage:
                    </Label>
                  </div>

                  {/* Role Switcher (Allows testing as Farmer, Processor, FPO, Driver, etc.) */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Role Context:</span>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 outline-none text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <option value="Farmer">Farmer</option>
                      <option value="Processor">Processor</option>
                      <option value="FpoManager">FPO Manager</option>
                      <option value="Driver">Driver / Logistics</option>
                      <option value="QualityInspector">Quality Inspector</option>
                      <option value="WarehouseManager">Warehouse Manager</option>
                      <option value="Accountant">Accountant</option>
                    </select>
                  </div>
                </div>

                {/* Stage Tabs */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {journeyStages.map((stage) => {
                    const isSelected = stage.name === selectedStage;
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => handleStageSelect(stage.name)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1 border ${
                          isSelected
                            ? "bg-[#1B4324] text-white border-[#1B4324] shadow-xs"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                        }`}
                      >
                        <span>{stage.name}</span>
                      </button>
                    );
                  })}
                </div>

                {activeStageObj?.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1.5 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">Current Milestone: </span>
                    {activeStageObj.description}
                  </p>
                )}
              </div>
            </CardHeader>

            {/* Chat Messages Display */}
            <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3 min-h-[300px] max-h-[420px] overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                    <Sparkles className="w-8 h-8 text-emerald-300 mb-2 animate-pulse" />
                    <p>Connecting to Akka.NET UserSessionActor...</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.isAgent ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-slate-500">
                          {msg.sender}
                        </span>
                        {msg.isAgent && (
                          <Badge variant="secondary" className="text-[9px] py-0 px-1 bg-emerald-100 text-emerald-800">
                            Nodal Assistant
                          </Badge>
                        )}
                        <span className="text-[9px] text-slate-400">
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs max-w-[85%] whitespace-pre-line leading-relaxed shadow-xs ${
                          msg.isAgent
                            ? "bg-[#F3F7F1] dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-[#E3ECE0] dark:border-slate-700 rounded-tl-sm"
                            : "bg-[#1B4324] text-white rounded-tr-sm"
                        }`}
                      >
                        {msg.content}
                      </div>

                      {msg.journeyStage && (
                        <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                          Stage: {msg.journeyStage}
                        </span>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested Prompts for Current Procurement Stage */}
              {activeStageObj?.suggestedPrompts?.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    Quick Procurement Queries for this Stage:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeStageObj.suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={sending}
                        onClick={() => handleSendMessage(null, prompt)}
                        className="text-[11px] text-left px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:text-emerald-900 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="pt-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Ask support for ${selectedStage}...`}
                    disabled={sending}
                    className="text-xs bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-600 rounded-xl"
                  />
                  <Button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    className="bg-[#1B4324] hover:bg-[#14341C] text-white text-xs px-4 rounded-xl cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Fault-isolated Actor: <strong className="text-slate-600 dark:text-slate-300">{sessionId.substring(0, 14)}...</strong>
                  </span>
                  <span>Logged in: {user?.email || "fpo@shreeanna.com"}</span>
                </div>
              </form>
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
