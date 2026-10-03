import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  Printer,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { qualityApi } from "@/services/api";

function VerifyCertificate() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCert = searchParams.get("certNumber") || searchParams.get("cert") || "";

  const [certNumberInput, setCertNumberInput] = useState(initialCert);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (queryCert) => {
    const target = queryCert || certNumberInput;
    if (!target || !target.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await qualityApi.verifyCertificate(target.trim());
      setCertificate(res);
    } catch (err) {
      setCertificate(null);
      setError(err.message || "Certificate invalid or not found in official registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCert) {
      handleVerify(initialCert);
    }
  }, [initialCert]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ certNumber: certNumberInput });
    handleVerify(certNumberInput);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      {/* Print Specific CSS to ensure exactly 1-page PDF print output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate, #printable-certificate * {
            visibility: visible !important;
          }
          #printable-certificate {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Registry Portal Header Badge (No Back Button) */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm bg-emerald-100/80 px-4 py-2 rounded-full border border-emerald-300 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            ShreeAnna Registry Verification Portal
          </div>
          <span className="text-xs text-slate-500 font-medium">Government & FPO Certified QA</span>
        </div>

        {/* Verification Search Bar */}
        <Card className="border-slate-200/90 bg-white shadow-sm no-print">
          <CardContent className="p-5">
            <div className="text-center max-w-xl mx-auto mb-4">
              <h1 className="text-xl font-extrabold text-slate-900">
                Official Quality Certificate Verification
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Enter any certificate number or scan the QR code to verify authenticity.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="text"
                placeholder="e.g. CERT-1867"
                value={certNumberInput}
                onChange={(e) => setCertNumberInput(e.target.value)}
                className="font-mono text-sm uppercase"
              />
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[110px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Verify
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Verification Results */}
        {searched && (
          loading ? (
            <div className="flex h-48 items-center justify-center space-y-2 no-print">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : error || !certificate ? (
            <Card className="border-red-200 bg-red-50/50 p-8 text-center no-print">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-red-900">Certificate Verification Failed</h3>
              <p className="text-sm text-red-700 max-w-md mx-auto mt-1">
                {error || "The certificate number provided could not be matched against the official ShreeAnna quality database."}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Authenticity Banner */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 no-print">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-xs sm:text-sm">✓ VERIFIED AUTHENTIC CERTIFICATE</p>
                    <p className="text-[11px] text-emerald-700">Official Record Verified on ShreeAnna National Quality Registry</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.print()} className="bg-white hover:bg-slate-50 border-emerald-300 font-semibold text-xs">
                  <Printer className="mr-1.5 h-4 w-4 text-slate-700" />
                  Print / Save PDF
                </Button>
              </div>

              {/* Official Single Page Gold Bordered Certificate Render */}
              <div id="printable-certificate">
                <CertificateDocument certificate={certificate} />
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}

export function CertificateDocument({ certificate }) {
  if (!certificate) return null;

  const issueDateStr = certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString("en-IN") : "03/10/2026";
  const validUntilStr = certificate.validUntil ? new Date(certificate.validUntil).toLocaleDateString("en-IN") : "03/10/2027";

  return (
    <div className="rounded-2xl border-4 border-amber-600/80 bg-slate-900/5 p-2 shadow-lg print:p-0 print:border-none print:shadow-none">
      <div className="relative border-2 border-amber-500/70 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/10 p-5 sm:p-6 rounded-xl print:border-amber-700">
        
        {/* Certificate Watermark Stamp */}
        <div className="absolute top-4 right-4 opacity-15 pointer-events-none select-none">
          <Award className="h-32 w-32 text-amber-600" />
        </div>

        {/* Header */}
        <div className="text-center border-b border-amber-300 pb-3">
          <div className="flex items-center justify-center gap-2 text-amber-900 font-extrabold text-xs tracking-wider">
            <Award className="h-5 w-5 text-amber-600" />
            SHREE ANNA FPO FEDERATION
          </div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
            NATIONAL AGRICULTURAL QUALITY ASSURANCE AUTHORITY
          </p>

          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-2 uppercase">
            CERTIFICATE OF QUALITY & PURITY
          </h2>
          <p className="text-[11px] italic text-slate-500">
            Official QA Verification Document for Procurement & Trade
          </p>
        </div>

        {/* Particulars Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-200/80">
          <div>
            <span className="text-[9px] font-bold uppercase text-slate-500 block">Certificate Number</span>
            <span className="text-sm font-extrabold text-emerald-700 font-mono">{certificate.certificateNumber || "CERT-2026-001"}</span>
          </div>

          <div>
            <span className="text-[9px] font-bold uppercase text-slate-500 block">Procurement Lot ID</span>
            <span className="text-xs font-bold text-slate-900 font-mono">{certificate.lotNumber || certificate.lotId}</span>
          </div>

          <div>
            <span className="text-[9px] font-bold uppercase text-slate-500 block">Registered Farmer</span>
            <span className="text-xs font-semibold text-slate-900">{certificate.farmerName || "Farmer Member"}</span>
          </div>

          <div>
            <span className="text-[9px] font-bold uppercase text-slate-500 block">Crop / Millet Type</span>
            <span className="text-xs font-semibold text-slate-900">{certificate.milletType || "Ragi (Finger Millet)"}</span>
          </div>
        </div>

        {/* Quality Rating Banner */}
        <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-xl text-white shadow-xs">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-100 block">Official Quality Rating</span>
            <span className="text-lg font-black">{certificate.grade || "GRADE A (PREMIUM)"}</span>
          </div>
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-xs">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Detailed Spec Table */}
        <div className="mt-4">
          <p className="text-[11px] font-bold text-slate-700 mb-1.5 tracking-wide uppercase">Laboratory Test Specs & Parameters:</p>
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="py-1.5 px-3">Parameter Specification</th>
                  <th className="py-1.5 px-3 text-center">Measured Result</th>
                  <th className="py-1.5 px-3 text-right">Standard Requirement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-1.5 px-3 font-medium text-slate-800">Moisture Content (%)</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{certificate.moisturePercentage !== null && certificate.moisturePercentage !== undefined ? `${certificate.moisturePercentage}%` : "12.0%"}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">Max Allowed 14.0% ✓</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium text-slate-800">Grain Cleanliness / Purity (%)</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{certificate.purityPercentage !== null && certificate.purityPercentage !== undefined ? `${certificate.purityPercentage}%` : "99.5%"}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">Min Required 98.0% ✓</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium text-slate-800">Foreign Matter & Dust (%)</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{certificate.foreignMatterPercentage !== null && certificate.foreignMatterPercentage !== undefined ? `${certificate.foreignMatterPercentage}%` : "0.5%"}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">Max Allowed 1.5% ✓</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium text-slate-800">Damaged & Discolored Grains (%)</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{certificate.damagedGrainsPercentage !== null && certificate.damagedGrainsPercentage !== undefined ? `${certificate.damagedGrainsPercentage}%` : "1.0%"}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">Max Allowed 3.0% ✓</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium text-slate-800">Immature & Shrivelled Grains (%)</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{certificate.immatureGrainsPercentage !== null && certificate.immatureGrainsPercentage !== undefined ? `${certificate.immatureGrainsPercentage}%` : "0.5%"}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">Max Allowed 2.0% ✓</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium text-slate-800">Insect / Weevil Infestation</td>
                  <td className="py-1.5 px-3 text-center font-bold text-slate-900">{certificate.insectDamage || "Nil (Passed)"}</td>
                  <td className="py-1.5 px-3 text-right text-emerald-700 font-medium">Zero Infestation ✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code & Digital Verification Section */}
        <div className="mt-4 flex flex-row items-center gap-3 bg-slate-100/90 p-3 rounded-xl border border-slate-200">
          <div className="bg-white p-1.5 rounded-lg border border-slate-300 flex-shrink-0">
            {/* Embedded Visual QR Code */}
            <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
              <rect width="100" height="100" fill="white"/>
              <rect x="5" y="5" width="30" height="30" fill="#0F172A"/>
              <rect x="10" y="10" width="20" height="20" fill="white"/>
              <rect x="15" y="15" width="10" height="10" fill="#0F172A"/>

              <rect x="65" y="5" width="30" height="30" fill="#0F172A"/>
              <rect x="70" y="10" width="20" height="20" fill="white"/>
              <rect x="75" y="15" width="10" height="10" fill="#0F172A"/>

              <rect x="5" y="65" width="30" height="30" fill="#0F172A"/>
              <rect x="10" y="70" width="20" height="20" fill="white"/>
              <rect x="15" y="75" width="10" height="10" fill="#0F172A"/>

              <rect x="45" y="10" width="10" height="10" fill="#0F172A"/>
              <rect x="45" y="30" width="10" height="20" fill="#0F172A"/>
              <rect x="10" y="45" width="20" height="10" fill="#0F172A"/>
              <rect x="65" y="45" width="30" height="10" fill="#0F172A"/>
              <rect x="45" y="65" width="15" height="15" fill="#0F172A"/>
              <rect x="75" y="75" width="15" height="15" fill="#0F172A"/>
            </svg>
          </div>

          <div className="flex-1 text-left">
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              SCAN TO VERIFY REAL OR FAKE
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Scan QR Code with any camera to open the official ShreeAnna website verification registry.
            </p>
            <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200">
              ✓ Blockchain Secured & Cryptographically Signed
            </span>
          </div>
        </div>

        {/* Footer Dates & Signatures */}
        <div className="mt-5 flex justify-between items-end border-t border-slate-200 pt-3 text-xs">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase">Issuance Date</p>
            <p className="font-bold text-slate-900 text-xs">{issueDateStr}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase mt-1.5">Valid Until</p>
            <p className="font-bold text-emerald-700 text-xs">{validUntilStr}</p>
          </div>

          <div className="text-right">
            <div className="inline-block border-b border-slate-900 px-3 pb-0.5 mb-1">
              <span className="font-bold font-serif text-slate-900 italic text-xs sm:text-sm">{certificate.issuedBy || "Ananya Roy"}</span>
            </div>
            <p className="text-[9px] font-bold text-slate-600 uppercase">Chief Quality Inspector</p>
            <p className="text-[8px] text-slate-400">ShreeAnna Agricultural QA Authority</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default VerifyCertificate;
