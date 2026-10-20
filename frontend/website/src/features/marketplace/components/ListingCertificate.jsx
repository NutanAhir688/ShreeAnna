import {
  Award,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

function ListingCertificate({ listing }) {
  return (
    <Card className="border-emerald-200 bg-emerald-50/30 shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Quality Certification
          </CardTitle>

          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Certified
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Award className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Certificate
              </p>

              <p className="font-medium text-slate-900">
                {listing?.certificationId || "CERT-QC-APPROVED"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <ClipboardCheck className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Inspection
              </p>

              <p className="font-medium text-slate-900">
                {listing?.inspectionId || "INSP-VERIFIED"}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Quality Grade
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {listing?.grade || "Grade A (Premium)"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ListingCertificate;